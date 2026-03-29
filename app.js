// ============================================================
// Mini Shopee - Entry Point (app.js)
// ============================================================
// ไฟล์นี้คือ "จุดเริ่มต้น" ของ Backend ทั้งหมด
// เปรียบเหมือน "ประตูหน้า" ที่ทุก Request จะผ่านก่อนเสมอ
// ============================================================

// โหลด Environment Variables จากไฟล์ .env ก่อนสิ่งอื่น
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// นำเข้า Routes ทั้งหมด
const authRoutes    = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes    = require('./routes/cart.routes');
const orderRoutes   = require('./routes/order.routes');
const adminRoutes   = require('./routes/admin.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Middleware ระดับ Global (ทุก Request ผ่านที่นี่ก่อน)
// ============================================================

// CORS: อนุญาตให้ Frontend (คนละ Port) เรียก API ได้
// ในการพัฒนา Frontend อยู่ที่ file:// หรือ port 5500
// Backend อยู่ที่ port 3000 → ต้องเปิด CORS
app.use(cors({
  origin: '*', // ในระบบจริงให้ระบุ Domain ที่อนุญาต เช่น 'https://myshop.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON Parser: แปลง Request Body จาก JSON String → JavaScript Object
// ทำให้เราเข้าถึงข้อมูลได้ผ่าน req.body
app.use(express.json());

// URL Encoded Parser: รองรับข้อมูลจาก HTML Form
app.use(express.urlencoded({ extended: true }));

// ============================================================
// API Routes - จัดการเส้นทาง API ทั้งหมด
// ============================================================
// Pattern: /api/[module] → ส่งต่อไปยัง Router ที่รับผิดชอบ

app.use('/api/auth',     authRoutes);    // POST /api/auth/register, /api/auth/login
app.use('/api/products', productRoutes); // GET  /api/products, /api/products/:id
app.use('/api/cart',     cartRoutes);    // GET/POST/PUT/DELETE /api/cart
app.use('/api/orders',   orderRoutes);   // POST /api/orders, GET /api/orders
app.use('/api/admin',    adminRoutes);   // GET  /api/admin/orders (Admin Only)

// ============================================================
// Route พื้นฐาน - ตรวจสอบว่า Server ทำงานอยู่
// ============================================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🛒 Mini Shopee API Server กำลังทำงาน!',
    version: '1.0.0',
    endpoints: {
      auth:     '/api/auth',
      products: '/api/products',
      cart:     '/api/cart',
      orders:   '/api/orders',
      admin:    '/api/admin'
    }
  });
});

// ============================================================
// Error Handler - จัดการ Error ที่เกิดในทุก Route
// ============================================================
// Express จะส่ง Error มาที่นี่เมื่อมีการเรียก next(error)
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    data: null
  });
});

// ============================================================
// 404 Handler - Route ที่ไม่มีอยู่
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `ไม่พบ Endpoint: ${req.method} ${req.url}`,
    data: null
  });
});

// ============================================================
// เริ่มต้น Server
// ============================================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🛒 Mini Shopee Backend Server`);
  console.log(`✅ กำลังทำงานที่ Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📌 API Base: http://localhost:${PORT}/api`);
  console.log('='.repeat(50));
});

module.exports = app;
