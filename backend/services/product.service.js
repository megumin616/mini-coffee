// ============================================================
// services/product.service.js - Business Logic ของ Products
// ============================================================

const db = require('../config/db');

// ดึงสินค้าทั้งหมด (รองรับการกรองด้วย category)
const getAllProducts = async (category = null) => {
  let query  = 'SELECT * FROM products WHERE is_active = 1';
  let params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await db.query(query, params);
  return rows;
};

// ดึงสินค้าชิ้นเดียวด้วย id
const getProductById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM products WHERE id = ? AND is_active = 1',
    [id]
  );
  if (rows.length === 0) {
    const err = new Error('ไม่พบสินค้านี้');
    err.status = 404;
    throw err;
  }
  return rows[0];
};

// ============================================================
// Admin — CRUD (ดูทุกสถานะ รวม is_active = 0)
// ============================================================
const getAllProductsAdmin = async () => {
  const [rows] = await db.query(
    'SELECT * FROM products ORDER BY id DESC'
  );
  return rows;
};

const getProductByIdAdmin = async (id) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  if (rows.length === 0) {
    const err = new Error('ไม่พบสินค้านี้');
    err.status = 404;
    throw err;
  }
  return rows[0];
};

const createProduct = async (payload) => {
  const {
    name,
    description = null,
    price,
    stock = 0,
    image_url = null,
    category = null,
    is_active = 1
  } = payload;

  if (!name || name.trim() === '') {
    const err = new Error('กรุณาระบุชื่อสินค้า');
    err.status = 400;
    throw err;
  }
  const p = parseFloat(price);
  if (Number.isNaN(p) || p < 0) {
    const err = new Error('ราคาไม่ถูกต้อง');
    err.status = 400;
    throw err;
  }

  const [result] = await db.query(
    `INSERT INTO products (name, description, price, stock, image_url, category, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name.trim(),
      description,
      p,
      Math.max(0, parseInt(stock, 10) || 0),
      image_url,
      category,
      is_active ? 1 : 0
    ]
  );
  return getProductByIdAdmin(result.insertId);
};

const updateProduct = async (id, payload) => {
  await getProductByIdAdmin(id);
  const {
    name,
    description = null,
    price,
    stock = 0,
    image_url = null,
    category = null,
    is_active = 1
  } = payload;

  if (!name || String(name).trim() === '') {
    const err = new Error('กรุณาระบุชื่อสินค้า');
    err.status = 400;
    throw err;
  }
  const p = parseFloat(price);
  if (Number.isNaN(p) || p < 0) {
    const err = new Error('ราคาไม่ถูกต้อง');
    err.status = 400;
    throw err;
  }

  await db.query(
    `UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category = ?, is_active = ?
     WHERE id = ?`,
    [
      String(name).trim(),
      description,
      p,
      Math.max(0, parseInt(stock, 10) || 0),
      image_url,
      category,
      is_active ? 1 : 0,
      id
    ]
  );
  return getProductByIdAdmin(id);
};

// ลบจากมุมมองลูกค้า = ซ่อน (soft delete)
const softDeleteProduct = async (id) => {
  await getProductByIdAdmin(id);
  await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
  return getProductByIdAdmin(id);
};

module.exports = {
  getAllProducts,
  getProductById,
  getAllProductsAdmin,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  softDeleteProduct
};
