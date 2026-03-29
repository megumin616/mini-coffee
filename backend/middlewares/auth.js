// ============================================================
// middlewares/auth.js - Middleware ตรวจสอบ JWT และ Role
// ============================================================
//
// Middleware คืออะไร?
// เป็น "ตัวกลาง" ที่นั่งอยู่ระหว่าง Request → Controller
// เปรียบเหมือน "ยามรักษาประตู" ที่ตรวจสอบก่อนอนุญาตให้เข้า
//
// Flow การทำงาน:
// Client ส่ง Request → [verifyToken] → [checkRole] → Controller
//
// JWT ทำงานอย่างไร?
// 1. User Login → Server สร้าง Token (เซ็นด้วย Secret Key)
// 2. User ส่ง Token ใน Header "Authorization: Bearer <token>"
// 3. Server ตรวจสอบ Token ด้วย Secret Key เดิม
// 4. ถ้าถูกต้อง → อนุญาต / ถ้าผิดหรือหมดอายุ → ปฏิเสธ
// ============================================================

const jwt = require('jsonwebtoken');

// ============================================================
// verifyToken - ตรวจสอบว่า Token ถูกต้องหรือไม่
// ============================================================
const verifyToken = (req, res, next) => {
  // ดึง Token จาก Header "Authorization"
  // รูปแบบที่ส่งมา: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers['authorization'];

  // ตรวจว่ามี Header และขึ้นต้นด้วย "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบ Token กรุณา Login ก่อน',
      data: null
    });
  }

  // แยกเอาแค่ Token ออกจาก "Bearer <token>"
  // split(' ') → ['Bearer', 'eyJ...']  → [1] = Token จริงๆ
  const token = authHeader.split(' ')[1];

  try {
    // ตรวจสอบ Token ด้วย Secret Key
    // jwt.verify() จะ:
    // 1. ถอดรหัส Token
    // 2. ตรวจสอบ Signature (ว่าถูกเซ็นด้วย Secret Key เราจริงๆ)
    // 3. ตรวจสอบ Expiry (ว่าหมดอายุยัง)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ถ้าผ่าน → แนบข้อมูล User ไปกับ req เพื่อให้ Controller ใช้ต่อ
    // req.user จะมีข้อมูลที่เราใส่ไว้ตอนสร้าง Token: { id, email, role }
    req.user = decoded;

    // ส่งต่อไป Middleware/Controller ถัดไป
    next();

  } catch (err) {
    // Token ผิดพลาดหรือหมดอายุ
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token หมดอายุแล้ว กรุณา Login ใหม่',
        data: null
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้อง',
      data: null
    });
  }
};

// ============================================================
// checkRole - ตรวจสอบว่ามีสิทธิ์เพียงพอหรือไม่
// ============================================================
// เป็น "Function ที่ Return Middleware" (Higher-Order Function)
// ใช้แบบนี้: checkRole('ADMIN') → จะ Return Middleware Function
// ที่ตรวจสอบว่า req.user.role === 'ADMIN' หรือไม่
//
// ตัวอย่างการใช้:
// router.get('/admin/orders', verifyToken, checkRole('ADMIN'), controller)
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // ต้องเรียก verifyToken ก่อนเสมอ (req.user ต้องมีค่าแล้ว)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'ไม่มีข้อมูลผู้ใช้ กรุณา Login',
        data: null
      });
    }

    // ตรวจว่า Role ของ User อยู่ใน allowedRoles หรือไม่
    // เช่น allowedRoles = ['ADMIN'] และ req.user.role = 'USER'
    // → includes('USER') = false → ปฏิเสธ
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `ไม่มีสิทธิ์เข้าถึง (ต้องการ Role: ${allowedRoles.join('/')})`,
        data: null
      });
    }

    // มีสิทธิ์ → ผ่านไปได้
    next();
  };
};

module.exports = { verifyToken, checkRole };
