// ============================================================
// routes/auth.routes.js - เส้นทาง API สำหรับ Authentication
// ============================================================
// Router ทำหน้าที่ "กำหนดทิศทาง" ว่า Request ไหน
// ควรไปหา Controller ไหน
// ============================================================

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/auth.controller');

// POST /api/auth/register → สมัครสมาชิก
router.post('/register', controller.register);

// POST /api/auth/login → เข้าสู่ระบบ
router.post('/login', controller.login);

module.exports = router;
