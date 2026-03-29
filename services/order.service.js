// ============================================================
// services/order.service.js - Business Logic ของ Orders
// ============================================================
// Flow การสร้าง Order:
// 1. ดึงสินค้าจาก Cart ของ User
// 2. ตรวจว่า Cart ไม่ว่าง
// 3. คำนวณราคารวม
// 4. สร้าง Order (INSERT ลง orders table)
// 5. สร้าง Order Items (INSERT ทีละรายการลง order_items)
// 6. ล้าง Cart
// ทั้งหมดนี้ต้องทำใน "Transaction" (ล้มเหลวทีเดียว หรือสำเร็จทั้งหมด)
// ============================================================

const db          = require('../config/db');
const cartService = require('./cart.service');

// ============================================================
// createOrder - สร้างคำสั่งซื้อ
// ============================================================
const createOrder = async (userId, { payment_method, address }) => {
  // 1. ดึงข้อมูล Cart ของ User
  const cart = await cartService.getCart(userId);

  // 2. ตรวจว่า Cart ไม่ว่าง
  if (cart.items.length === 0) {
    const err = new Error('ไม่มีสินค้าในตะกร้า กรุณาเพิ่มสินค้าก่อน');
    err.status = 400;
    throw err;
  }

  // 3. Validate payment_method
  if (!['COD', 'QR'].includes(payment_method)) {
    const err = new Error('วิธีชำระเงินไม่ถูกต้อง');
    err.status = 400;
    throw err;
  }

  // 4. เริ่ม Transaction
  // Transaction = "ทำทุกอย่างพร้อมกัน หรือไม่ทำเลย"
  // ถ้า INSERT order สำเร็จ แต่ INSERT order_items ล้มเหลว
  // → Rollback = ยกเลิก INSERT order ด้วย (ข้อมูลสะอาด)
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 5. สร้าง Order หลัก
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_price, payment_method, address)
       VALUES (?, ?, ?, ?)`,
      [userId, cart.total_price, payment_method, address]
    );

    const orderId = orderResult.insertId;

    // 6. สร้าง Order Items (ทีละรายการ)
    for (const item of cart.items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // 7. Commit Transaction (บันทึกทุกอย่าง)
    await connection.commit();

    // 8. ล้าง Cart
    await cartService.clearCart(userId);

    // 9. ดึงข้อมูล Order ที่เพิ่งสร้าง
    return getOrderById(userId, orderId);

  } catch (err) {
    // ถ้าเกิด Error → Rollback (ยกเลิกทุกอย่าง)
    await connection.rollback();
    throw err;
  } finally {
    // คืน Connection กลับ Pool เสมอ
    connection.release();
  }
};

// ============================================================
// getOrderById - ดูรายละเอียด Order
// ============================================================
const getOrderById = async (userId, orderId) => {
  const [orders] = await db.query(
    `SELECT o.*, u.name as user_name, u.email as user_email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.id = ? AND o.user_id = ?`,
    [orderId, userId]
  );

  if (orders.length === 0) {
    const err = new Error('ไม่พบคำสั่งซื้อนี้');
    err.status = 404;
    throw err;
  }

  const order = orders[0];

  // ดึง Order Items พร้อมข้อมูลสินค้า
  const [items] = await db.query(
    `SELECT oi.*, p.name as product_name, p.image_url
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return { ...order, items };
};

// ============================================================
// getMyOrders - ดูประวัติการสั่งซื้อของตัวเอง
// ============================================================
const getMyOrders = async (userId) => {
  const [orders] = await db.query(
    `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return orders;
};

module.exports = { createOrder, getOrderById, getMyOrders };
