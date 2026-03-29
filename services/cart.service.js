// ============================================================
// services/cart.service.js - Business Logic ของ Cart
// ============================================================
// Cart System มี 2 ตาราง:
// - carts: เก็บว่า User คนนี้มี Cart (1 user = 1 cart)
// - cart_items: เก็บรายการสินค้าในแต่ละ Cart
//
// Flow:
// 1. User เพิ่มสินค้า → ตรวจว่ามี Cart หรือยัง → ถ้าไม่มีสร้างใหม่
// 2. เพิ่ม/อัปเดต cart_items
// ============================================================

const db = require('../config/db');

// ============================================================
// หา Cart ของ User (ถ้าไม่มี ให้สร้างใหม่อัตโนมัติ)
// ============================================================
const getOrCreateCart = async (userId) => {
  // ค้นหา cart ของ user คนนี้
  let [rows] = await db.query(
    'SELECT * FROM carts WHERE user_id = ?',
    [userId]
  );

  // ถ้ายังไม่มี cart → สร้างใหม่
  if (rows.length === 0) {
    const [result] = await db.query(
      'INSERT INTO carts (user_id) VALUES (?)',
      [userId]
    );
    rows = [{ id: result.insertId, user_id: userId }];
  }

  return rows[0];
};

// ============================================================
// getCart - ดูสินค้าในตะกร้า
// ============================================================
const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  // JOIN ระหว่าง cart_items กับ products เพื่อดึงข้อมูลสินค้า
  // SQL JOIN คือการ "รวม" ข้อมูลจาก 2 ตาราง โดยใช้ค่าที่ตรงกัน
  const [items] = await db.query(
    `SELECT
       ci.id          AS cart_item_id,
       ci.quantity,
       p.id           AS product_id,
       p.name,
       p.price,
       p.image_url,
       p.stock,
       (ci.quantity * p.price) AS subtotal
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ?`,
    [cart.id]
  );

  // คำนวณราคารวม
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  return {
    cart_id: cart.id,
    items,
    total_price: totalPrice,
    item_count:  items.length
  };
};

// ============================================================
// addToCart - เพิ่มสินค้าในตะกร้า
// ============================================================
const addToCart = async (userId, productId, quantity = 1) => {
  // ตรวจสอบว่าสินค้ามีอยู่จริง
  const [products] = await db.query(
    'SELECT * FROM products WHERE id = ? AND is_active = 1',
    [productId]
  );
  if (products.length === 0) {
    const err = new Error('ไม่พบสินค้านี้');
    err.status = 404;
    throw err;
  }

  const product = products[0];

  // ตรวจว่าสินค้าเพียงพอในสต็อก
  if (product.stock < quantity) {
    const err = new Error(`สินค้าในสต็อกไม่เพียงพอ (มี ${product.stock} ชิ้น)`);
    err.status = 400;
    throw err;
  }

  const cart = await getOrCreateCart(userId);

  // ตรวจว่าสินค้านี้อยู่ใน cart แล้วหรือยัง
  const [existing] = await db.query(
    'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cart.id, productId]
  );

  if (existing.length > 0) {
    // มีอยู่แล้ว → อัปเดตจำนวน (เพิ่มเข้าไป)
    const newQty = existing[0].quantity + quantity;
    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [newQty, existing[0].id]
    );
  } else {
    // ยังไม่มี → เพิ่มรายการใหม่
    await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
      [cart.id, productId, quantity]
    );
  }

  return getCart(userId);
};

// ============================================================
// updateCartItem - แก้ไขจำนวนสินค้าในตะกร้า
// ============================================================
const updateCartItem = async (userId, cartItemId, quantity) => {
  if (quantity <= 0) {
    // ถ้าจำนวน <= 0 → ลบออกจากตะกร้า
    return removeCartItem(userId, cartItemId);
  }

  const cart = await getOrCreateCart(userId);

  // ตรวจสอบว่า cart_item นี้เป็นของ user คนนี้จริง (Security Check)
  const [items] = await db.query(
    'SELECT ci.* FROM cart_items ci WHERE ci.id = ? AND ci.cart_id = ?',
    [cartItemId, cart.id]
  );

  if (items.length === 0) {
    const err = new Error('ไม่พบสินค้าในตะกร้า');
    err.status = 404;
    throw err;
  }

  await db.query(
    'UPDATE cart_items SET quantity = ? WHERE id = ?',
    [quantity, cartItemId]
  );

  return getCart(userId);
};

// ============================================================
// removeCartItem - ลบสินค้าออกจากตะกร้า
// ============================================================
const removeCartItem = async (userId, cartItemId) => {
  const cart = await getOrCreateCart(userId);

  await db.query(
    'DELETE FROM cart_items WHERE id = ? AND cart_id = ?',
    [cartItemId, cart.id]
  );

  return getCart(userId);
};

// ============================================================
// clearCart - ล้างตะกร้าทั้งหมด (ใช้หลัง Checkout)
// ============================================================
const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
