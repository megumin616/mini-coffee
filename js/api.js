// ============================================================
// js/api.js - ตัวช่วยสำหรับเรียก Backend API
// ============================================================
// ไฟล์นี้รวม "ฟังก์ชันกลาง" ที่ทุกหน้าใช้ร่วมกัน
//
// Fetch API ทำงานอย่างไร?
// Fetch API คือวิธีที่ JavaScript ใช้ขอข้อมูลจาก Server
// โดยไม่ต้อง Reload หน้า (Asynchronous)
//
// Flow:
// 1. เรียก fetch(url, options)
// 2. ได้ Promise กลับมา (รอผล)
// 3. .then(res => res.json()) → แปลง Response เป็น JSON
// 4. ได้ข้อมูลมาใช้งานใน JavaScript
//
// ในโปรเจคนี้เราใช้ async/await แทน .then() เพื่อให้อ่านง่ายขึ้น
// ============================================================

// URL ของ Backend API (Production — Render)
const API_BASE = 'https://mini-coffee.onrender.com/api';

// ============================================================
// getToken - ดึง JWT Token จาก localStorage
// ============================================================
// localStorage คือ "กล่องเก็บของ" ของ Browser
// เก็บได้ไม่จำกัดเวลา (จนกว่า User จะล้างหรือ Logout)
// ============================================================
const getToken = () => localStorage.getItem('token');

// ============================================================
// getUser - ดึงข้อมูล User ที่ Login อยู่
// ============================================================
const getUser = () => {
  const userStr = localStorage.getItem('user');
  // JSON.parse แปลง String → JavaScript Object
  return userStr ? JSON.parse(userStr) : null;
};

// ============================================================
// isLoggedIn - ตรวจว่า Login อยู่หรือไม่
// ============================================================
const isLoggedIn = () => !!getToken();

// ============================================================
// apiCall - ฟังก์ชันกลางสำหรับเรียก API ทุกประเภท
// ============================================================
// Parameters:
//   endpoint - เช่น '/products', '/cart', '/auth/login'
//   method   - 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
//   body     - ข้อมูลที่จะส่ง (สำหรับ POST/PUT)
//   auth     - true/false ว่าต้องส่ง Token หรือไม่
// ============================================================
const apiCall = async (endpoint, method = 'GET', body = null, auth = true) => {
  // สร้าง Headers
  const headers = {
    'Content-Type': 'application/json'  // บอก Server ว่าส่งข้อมูลเป็น JSON
  };

  // ถ้าต้องการ Auth → แนบ JWT Token ใน Header
  // รูปแบบมาตรฐาน: "Authorization: Bearer <token>"
  // Server จะอ่าน Header นี้ใน verifyToken Middleware
  if (auth && getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }

  // สร้าง Options สำหรับ fetch
  const options = {
    method,
    headers
  };

  // ถ้ามี body (POST/PUT) → แปลงเป็น JSON String
  if (body) {
    options.body = JSON.stringify(body);
  }

  // เรียก fetch จริงๆ
  const response = await fetch(`${API_BASE}${endpoint}`, options);

  // แปลง Response เป็น JSON
  const data = await response.json();

  // ถ้า Server ส่งกลับมาว่าไม่สำเร็จ → throw Error
  // ทำให้ฝั่ง Caller จัดการ Error ได้ใน try/catch
  if (!data.success) {
    throw new Error(data.message || 'เกิดข้อผิดพลาด');
  }

  return data;
};

// ============================================================
// saveAuth - บันทึก Token และ User ลง localStorage หลัง Login
// ============================================================
const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  // JSON.stringify แปลง Object → String เพื่อเก็บใน localStorage
  localStorage.setItem('user', JSON.stringify(user));
};

// ============================================================
// logout - ล้าง Token และ User ออกจาก localStorage
// ต้องเป็น function declaration เพื่อให้ onclick="logout()" มองเห็นบน window
// ============================================================
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ============================================================
// formatPrice - จัดรูปแบบตัวเลขเป็นราคาบาท
// ============================================================
const formatPrice = (price) => {
  return new Intl.NumberFormat('th-TH', {
    style:    'currency',
    currency: 'THB',
    minimumFractionDigits: 0
  }).format(price);
};

// ============================================================
// showAlert - แสดงข้อความแจ้งเตือน
// ============================================================
const showAlert = (message, type = 'success') => {
  // ลบ alert เก่าถ้ามี
  const existing = document.getElementById('alert-box');
  if (existing) existing.remove();

  const colors = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error:   'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  const div = document.createElement('div');
  div.id = 'alert-box';
  div.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg border shadow-lg text-sm font-medium ${colors[type] || colors.success}`;
  div.textContent = message;
  document.body.appendChild(div);

  // ซ่อน Alert หลัง 3 วินาที
  setTimeout(() => div.remove(), 3000);
};

// ============================================================
// updateNavbar - อัปเดต Navbar ตาม Login Status
// ============================================================
const updateNavbar = () => {
  const user = getUser();
  const navUser    = document.getElementById('nav-user');
  const navLogin   = document.getElementById('nav-login');
  const navAdmin   = document.getElementById('nav-admin');
  const navLogout  = document.getElementById('nav-logout');
  const navOrders  = document.getElementById('nav-orders');
  const navCartBadge = document.getElementById('nav-cart-badge');

  if (user) {
    if (navUser)   { navUser.textContent = `สวัสดี, ${user.name.split(' ')[0]}`; navUser.classList.remove('hidden'); }
    if (navLogin)  navLogin.classList.add('hidden');
    if (navLogout) navLogout.classList.remove('hidden');
    if (navOrders) navOrders.classList.remove('hidden');
    if (navAdmin && user.role === 'ADMIN') navAdmin.classList.remove('hidden');
  } else {
    if (navUser)   navUser.classList.add('hidden');
    if (navLogin)  navLogin.classList.remove('hidden');
    if (navLogout) navLogout.classList.add('hidden');
    if (navOrders) navOrders.classList.add('hidden');
    if (navAdmin)  navAdmin.classList.add('hidden');
  }

  // ดึงจำนวนสินค้าใน cart (ถ้า Login อยู่)
  if (user && navCartBadge) {
    apiCall('/cart').then(res => {
      const count = res.data.item_count || 0;
      navCartBadge.textContent = count;
      navCartBadge.classList.toggle('hidden', count === 0);
    }).catch(() => {});
  }
};
