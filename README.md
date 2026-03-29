# 🛒 Mini Shopee — Full-Stack Web Application

โปรเจคนี้เป็น **Mini E-Commerce** สำหรับเรียนรู้การพัฒนา Web Application แบบ Full-Stack  
เทคโนโลยี: **Node.js + Express + MySQL + Vanilla JS + Tailwind CSS**

---

## 📁 โครงสร้างโปรเจค

```
mini-shopee/
├── schema.sql              ← สร้างฐานข้อมูล (Import ตัวนี้แรกสุด)
├── README.md
│
├── backend/                ← Node.js + Express API Server
│   ├── app.js              ← Entry Point ของ Backend
│   ├── .env                ← ตั้งค่า Database + JWT Secret
│   ├── package.json
│   ├── config/
│   │   └── db.js           ← เชื่อมต่อ MySQL
│   ├── middlewares/
│   │   └── auth.js         ← verifyToken + checkRole
│   ├── routes/             ← กำหนด Endpoint URL
│   ├── controllers/        ← รับ/ส่ง HTTP Request
│   └── services/           ← Business Logic + Database Query
│
└── frontend/               ← HTML + Tailwind + Vanilla JS
    ├── index.html          ← หน้าหลัก
    ├── login.html          ← เข้าสู่ระบบ
    ├── register.html       ← สมัครสมาชิก
    ├── products.html       ← รายการสินค้า
    ├── cart.html           ← ตะกร้าสินค้า
    ├── checkout.html       ← ชำระเงิน
    ├── admin.html          ← Admin Dashboard
    └── js/
        └── api.js          ← Fetch API Helper
```

---

## 🚀 วิธีรัน (Step-by-Step)

### ขั้นตอนที่ 1: ติดตั้ง MySQL และสร้างฐานข้อมูล

```bash
# วิธี 1: ผ่าน Command Line
mysql -u root -p < schema.sql

# วิธี 2: phpMyAdmin
# เปิด phpMyAdmin → Import → เลือกไฟล์ schema.sql → Go
```

### ขั้นตอนที่ 2: ตั้งค่า Backend

```bash
# เข้าโฟลเดอร์ backend
cd backend

# ติดตั้ง Dependencies
npm install

# แก้ไขไฟล์ .env ให้ตรงกับ MySQL ของคุณ
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=รหัสผ่าน MySQL ของคุณ
# DB_NAME=mini_shopee
```

### ขั้นตอนที่ 3: รัน Backend Server

```bash
# รันแบบปกติ
npm start

# รันแบบ Auto-reload (แนะนำตอนพัฒนา)
npm run dev
```

✅ ถ้าสำเร็จจะเห็น:
```
✅ เชื่อมต่อ MySQL Database สำเร็จ!
✅ กำลังทำงานที่ Port: 3000
🌐 URL: http://localhost:3000
```

### ขั้นตอนที่ 4: เปิด Frontend

วิธีที่ 1 (ง่ายสุด): ดับเบิลคลิกไฟล์ `frontend/index.html`

วิธีที่ 2 (แนะนำ): ใช้ VS Code + Extension **Live Server**
- คลิกขวาที่ `index.html` → Open with Live Server
- จะเปิดที่ `http://localhost:5500`

---

## 🧪 บัญชีทดสอบ

| Role  | Email            | Password  |
|-------|------------------|-----------|
| User  | user@shop.com    | user1234  |
| Admin | admin@shop.com   | admin1234 |

---

## 🔗 API Endpoints

| Method | Endpoint                    | Auth  | คำอธิบาย              |
|--------|-----------------------------|-------|------------------------|
| POST   | /api/auth/register          | ❌    | สมัครสมาชิก           |
| POST   | /api/auth/login             | ❌    | เข้าสู่ระบบ            |
| GET    | /api/products               | ❌    | ดูสินค้าทั้งหมด        |
| GET    | /api/products/:id           | ❌    | ดูสินค้าชิ้นเดียว      |
| GET    | /api/cart                   | ✅    | ดูตะกร้า              |
| POST   | /api/cart                   | ✅    | เพิ่มสินค้าในตะกร้า    |
| PUT    | /api/cart/:itemId           | ✅    | แก้ไขจำนวน            |
| DELETE | /api/cart/:itemId           | ✅    | ลบสินค้าออกจากตะกร้า  |
| POST   | /api/orders                 | ✅    | สร้างคำสั่งซื้อ        |
| GET    | /api/orders                 | ✅    | ดูประวัติการสั่งซื้อ   |
| GET    | /api/admin                  | 🔑    | ดู Order ทั้งหมด (Admin)|
| GET    | /api/admin/:id              | 🔑    | ดูรายละเอียด Order     |
| PATCH  | /api/admin/:id/status       | 🔑    | เปลี่ยนสถานะ Order     |

> ✅ = ต้อง Login | 🔑 = ต้องเป็น Admin

---

## 🧠 แนวคิดสำคัญที่ต้องอธิบาย

### 1. JWT ทำงานอย่างไร?
```
Login → Server สร้าง Token (Header.Payload.Signature)
         ↓
     Client เก็บใน localStorage
         ↓
     ทุก Request ส่ง Token ใน Header: "Authorization: Bearer <token>"
         ↓
     Server ตรวจสอบ Token ด้วย verifyToken Middleware
         ↓
     ถ้าถูก → อนุญาต | ถ้าผิดหรือหมดอายุ → 401 Unauthorized
```

### 2. Data Flow
```
User คลิก "เพิ่มลงตะกร้า"
    ↓
Frontend (products.html)
    → Fetch API: POST /api/cart + Token
    ↓
Backend Middleware
    → verifyToken → ตรวจ Token → รู้ว่าใคร (user_id)
    ↓
CartController → CartService
    → getOrCreateCart(user_id)
    → INSERT หรือ UPDATE cart_items
    ↓
MySQL Database
    → บันทึกข้อมูล
    ↓
Backend ส่ง Response: { success: true, data: cart }
    ↓
Frontend รับ → อัปเดต UI (Badge, แสดงข้อความสำเร็จ)
```

### 3. Database Relations
```
users ─── carts (1:1)
carts ─── cart_items (1:N)
products ─ cart_items (1:N)
users ─── orders (1:N)
orders ── order_items (1:N)
products ─ order_items (1:N)
```

---

## ⚠️ ปัญหาที่พบบ่อย

**Backend ขึ้น "ไม่สามารถเชื่อมต่อ MySQL"**  
→ ตรวจสอบ `.env` ว่า DB_PASSWORD ถูกต้องหรือไม่

**Frontend เรียก API แล้ว CORS Error**  
→ ตรวจสอบว่า Backend รันอยู่ที่ Port 3000

**Login แล้วหน้าไม่เปลี่ยน**  
→ เปิด DevTools (F12) → Console → ดู Error Message

**รหัสผ่านใน .env ตอน MySQL ว่างเปล่า**  
→ ตั้ง DB_PASSWORD= (เว้นว่างไว้) ถ้า MySQL ไม่มีรหัสผ่าน
