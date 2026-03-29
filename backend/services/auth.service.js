// ============================================================
// services/auth.service.js - Business Logic ของ Authentication
// ============================================================
// Service Layer คืออะไร?
// แยก "ตรรกะทางธุรกิจ" ออกจาก Controller
// Controller → รับ/ส่ง HTTP Request/Response
// Service    → คิด/ประมวลผล/ติดต่อ Database
//
// ประโยชน์: ถ้าอยากเปลี่ยนจาก MySQL → PostgreSQL
// แค่แก้ Service Layer เท่านั้น ไม่ต้องแตะ Controller
// ============================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// ============================================================
// register - สมัครสมาชิก
// ============================================================
const register = async ({ name, email, password, phone, address }) => {
  // 1. ตรวจว่า Email ซ้ำหรือไม่
  const [existing] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  if (existing.length > 0) {
    // Throw error → Controller จะจับและส่ง Response กลับ
    const err = new Error('อีเมลนี้ถูกใช้งานแล้ว');
    err.status = 400;
    throw err;
  }

  // 2. Hash Password ด้วย bcrypt
  // bcrypt ทำงานยังไง?
  // - "salt" = ค่าสุ่มที่ผสมเข้าไปใน Password ก่อน Hash
  // - "10" = saltRounds = จำนวนรอบที่ Hash (มากกว่า = ปลอดภัยกว่า แต่ช้ากว่า)
  // - ผลที่ได้: "$2a$10$..." ซึ่งไม่สามารถย้อนกลับเป็น password จริงได้
  // - เวลาตรวจสอบ: bcrypt.compare(rawPassword, hashedPassword) → true/false
  const SALT_ROUNDS    = 10;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. บันทึกลง Database
  const [result] = await db.query(
    `INSERT INTO users (name, email, password, phone, address)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, phone || null, address || null]
  );

  return {
    id:    result.insertId,
    name,
    email,
    role:  'USER'
  };
};

// ============================================================
// login - เข้าสู่ระบบ
// ============================================================
const login = async ({ email, password }) => {
  // 1. ค้นหา User จาก Email
  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    const err = new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    err.status = 401;
    throw err;
  }

  const user = rows[0];

  // 2. เปรียบเทียบ Password ที่กรอก กับ Hash ใน Database
  // bcrypt.compare จะ Hash password ที่กรอกด้วย salt เดิม แล้วเทียบ
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const err = new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    err.status = 401;
    throw err;
  }

  // 3. สร้าง JWT Token
  // JWT มี 3 ส่วน คั่นด้วยจุด: Header.Payload.Signature
  //
  // Payload (ข้อมูลที่ฝังใน Token):
  // { id: 1, email: "user@shop.com", role: "USER" }
  //
  // ข้อสำคัญ: ใครก็ decode Payload ได้ (Base64)
  // แต่ "แก้ไข" ไม่ได้ เพราะ Signature จะเสีย
  // → จึงห้ามใส่ข้อมูลลับ (เช่น Password) ใน Payload
  const payload = {
    id:    user.id,
    email: user.email,
    role:  user.role,
    name:  user.name
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    // expiresIn: '24h' = Token หมดอายุใน 24 ชั่วโมง
    // หลังจากนั้น User ต้อง Login ใหม่เพื่อรับ Token ใหม่
  );

  return {
    token,
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      phone: user.phone,
      address: user.address
    }
  };
};

module.exports = { register, login };
