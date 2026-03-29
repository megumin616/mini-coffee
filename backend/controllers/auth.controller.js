// ============================================================
// controllers/auth.controller.js - จัดการ Request/Response ของ Auth
// ============================================================
// Controller Layer คืออะไร?
// - รับ Request จาก Client (req)
// - เรียก Service ให้ทำงาน
// - ส่ง Response กลับ (res)
// - ไม่ควรมี Business Logic ที่ซับซ้อนอยู่ที่นี่
// ============================================================

const authService = require('../services/auth.service');

// ============================================================
// POST /api/auth/register
// ============================================================
const register = async (req, res) => {
  try {
    // ดึงข้อมูลจาก Request Body
    const { name, email, password, phone, address } = req.body;

    // Validation เบื้องต้น
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอก ชื่อ, อีเมล และรหัสผ่าน',
        data: null
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        data: null
      });
    }

    // เรียก Service ทำงาน
    const newUser = await authService.register({ name, email, password, phone, address });

    // ส่ง Response กลับ (Standard Format)
    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      data: newUser
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      data: null
    });
  }
};

// ============================================================
// POST /api/auth/login
// ============================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมลและรหัสผ่าน',
        data: null
      });
    }

    const result = await authService.login({ email, password });

    // ส่ง Token กลับไปให้ Frontend เก็บไว้
    // Frontend จะเก็บใน localStorage แล้วส่งกลับมาทุกครั้งที่ขอ API
    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: result
    });

  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      data: null
    });
  }
};

module.exports = { register, login };
