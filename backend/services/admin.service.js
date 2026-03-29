// ============================================================
// services/admin.service.js - Business Logic สำหรับ Admin
// ============================================================

const bcrypt = require('bcryptjs');
const db = require('../config/db');

// ดึง Order ทั้งหมดของทุก User
const getAllOrders = async () => {
  const [orders] = await db.query(
    `SELECT
       o.id,
       o.total_price,
       o.payment_method,
       o.address,
       o.status,
       o.created_at,
       u.name  AS user_name,
       u.email AS user_email,
       u.phone AS user_phone
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC`
  );
  return orders;
};

// ดูรายละเอียด Order (Admin ดูได้ทุก Order ไม่จำกัด User)
const getOrderDetail = async (orderId) => {
  const [orders] = await db.query(
    `SELECT
       o.*,
       u.name  AS user_name,
       u.email AS user_email,
       u.phone AS user_phone
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (orders.length === 0) {
    const err = new Error('ไม่พบคำสั่งซื้อนี้');
    err.status = 404;
    throw err;
  }

  const [items] = await db.query(
    `SELECT oi.*, p.name AS product_name, p.image_url
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { ...orders[0], items };
};

// อัปเดตสถานะ Order
const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    const err = new Error('สถานะไม่ถูกต้อง');
    err.status = 400;
    throw err;
  }
  await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  return getOrderDetail(orderId);
};

// รายชื่อผู้ใช้ทั้งหมด
const listUsers = async () => {
  const [rows] = await db.query(
    `SELECT id, name, email, phone, address, role, created_at
     FROM users
     ORDER BY id ASC`
  );
  return rows;
};

const createUser = async ({ name, email, password, phone, address, role = 'USER' }) => {
  if (!name || !email || !password) {
    const err = new Error('กรุณาระบุชื่อ อีเมล และรหัสผ่าน');
    err.status = 400;
    throw err;
  }
  if (!['USER', 'ADMIN'].includes(role)) {
    const err = new Error('Role ต้องเป็น USER หรือ ADMIN');
    err.status = 400;
    throw err;
  }
  if (password.length < 6) {
    const err = new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    err.status = 400;
    throw err;
  }

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
  if (existing.length > 0) {
    const err = new Error('อีเมลนี้ถูกใช้งานแล้ว');
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    `INSERT INTO users (name, email, password, phone, address, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name.trim(), email.trim(), hashed, phone || null, address || null, role]
  );

  const [rows] = await db.query(
    `SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?`,
    [result.insertId]
  );
  return rows[0];
};

const updateUser = async (userId, { name, email, phone, address, role, password }) => {
  const current = await getUserRow(userId);
  if (!current) {
    const err = new Error('ไม่พบผู้ใช้นี้');
    err.status = 404;
    throw err;
  }

  if (role !== undefined && !['USER', 'ADMIN'].includes(role)) {
    const err = new Error('Role ต้องเป็น USER หรือ ADMIN');
    err.status = 400;
    throw err;
  }

  const newRole = role !== undefined ? role : current.role;
  if (current.role === 'ADMIN' && newRole === 'USER') {
    const [cnt] = await db.query(`SELECT COUNT(*) AS c FROM users WHERE role = 'ADMIN'`);
    if (cnt[0].c <= 1) {
      const err = new Error('ไม่สามารถลดสิทธิ์ได้ ต้องมีอย่างน้อยหนึ่งแอดมินในระบบ');
      err.status = 400;
      throw err;
    }
  }

  const nextName = name !== undefined ? String(name).trim() : current.name;
  const nextEmail = email !== undefined ? String(email).trim() : current.email;
  const nextPhone = phone !== undefined ? phone : current.phone;
  const nextAddress = address !== undefined ? address : current.address;

  if (email !== undefined && nextEmail !== current.email) {
    const [dup] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [nextEmail, userId]
    );
    if (dup.length > 0) {
      const err = new Error('อีเมลนี้ถูกใช้งานแล้ว');
      err.status = 400;
      throw err;
    }
  }

  if (password !== undefined && password !== '') {
    if (password.length < 6) {
      const err = new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      err.status = 400;
      throw err;
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      `UPDATE users SET name = ?, email = ?, phone = ?, address = ?, role = ?, password = ?
       WHERE id = ?`,
      [nextName, nextEmail, nextPhone, nextAddress, newRole, hashed, userId]
    );
  } else {
    await db.query(
      `UPDATE users SET name = ?, email = ?, phone = ?, address = ?, role = ?
       WHERE id = ?`,
      [nextName, nextEmail, nextPhone, nextAddress, newRole, userId]
    );
  }

  const [rows] = await db.query(
    `SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?`,
    [userId]
  );
  return rows[0];
};

async function getUserRow(id) {
  const [rows] = await db.query(
    'SELECT id, name, email, phone, address, role FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

const deleteUser = async (userId) => {
  const [users] = await db.query('SELECT id, role FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    const err = new Error('ไม่พบผู้ใช้นี้');
    err.status = 404;
    throw err;
  }
  if (users[0].role === 'ADMIN') {
    const [cnt] = await db.query(`SELECT COUNT(*) AS c FROM users WHERE role = 'ADMIN'`);
    if (cnt[0].c <= 1) {
      const err = new Error('ไม่สามารถลบแอดมินคนสุดท้ายได้');
      err.status = 400;
      throw err;
    }
  }
  const [orders] = await db.query('SELECT COUNT(*) AS c FROM orders WHERE user_id = ?', [userId]);
  if (orders[0].c > 0) {
    const err = new Error('ไม่สามารถลบผู้ใช้ที่มีประวัติคำสั่งซื้อได้');
    err.status = 400;
    throw err;
  }

  await db.query('DELETE FROM users WHERE id = ?', [userId]);
  return { id: userId };
};

// เปลี่ยน Role เป็น USER หรือ ADMIN (หลายแอดมินได้ — แต่ต้องเหลืออย่างน้อย 1 แอดมิน)
const updateUserRole = async (targetUserId, newRole) => {
  if (!['USER', 'ADMIN'].includes(newRole)) {
    const err = new Error('Role ต้องเป็น USER หรือ ADMIN');
    err.status = 400;
    throw err;
  }

  const [users] = await db.query(
    'SELECT id, role FROM users WHERE id = ?',
    [targetUserId]
  );
  if (users.length === 0) {
    const err = new Error('ไม่พบผู้ใช้นี้');
    err.status = 404;
    throw err;
  }

  const current = users[0];
  if (current.role === 'ADMIN' && newRole === 'USER') {
    const [cnt] = await db.query(
      `SELECT COUNT(*) AS c FROM users WHERE role = 'ADMIN'`
    );
    if (cnt[0].c <= 1) {
      const err = new Error('ไม่สามารถลดสิทธิ์ได้ ต้องมีอย่างน้อยหนึ่งแอดมินในระบบ');
      err.status = 400;
      throw err;
    }
  }

  await db.query('UPDATE users SET role = ? WHERE id = ?', [newRole, targetUserId]);
  const [updated] = await db.query(
    'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
    [targetUserId]
  );
  return updated[0];
};

module.exports = {
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole
};
