// ============================================================
// controllers/product.controller.js
// ============================================================

const productService = require('../services/product.service');

const getAllProducts = async (req, res) => {
  try {
    // รับ query parameter เช่น /api/products?category=มือถือ
    const { category } = req.query;
    const products = await productService.getAllProducts(category);
    res.json({ success: true, message: 'ดึงรายการสินค้าสำเร็จ', data: products });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const getProductById = async (req, res) => {
  try {
    // req.params.id มาจาก URL Pattern /api/products/:id
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, message: 'ดึงข้อมูลสินค้าสำเร็จ', data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

module.exports = { getAllProducts, getProductById };
