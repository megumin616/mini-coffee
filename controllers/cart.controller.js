// ============================================================
// controllers/cart.controller.js
// ============================================================

const cartService = require('../services/cart.service');

// GET /api/cart → ดูตะกร้า
const getCart = async (req, res) => {
  try {
    // req.user.id มาจาก verifyToken middleware
    const cart = await cartService.getCart(req.user.id);
    res.json({ success: true, message: 'ดึงข้อมูลตะกร้าสำเร็จ', data: cart });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

// POST /api/cart → เพิ่มสินค้า
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุ product_id', data: null });
    }
    const cart = await cartService.addToCart(req.user.id, product_id, quantity || 1);
    res.json({ success: true, message: 'เพิ่มสินค้าในตะกร้าสำเร็จ', data: cart });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

// PUT /api/cart/:itemId → แก้ไขจำนวน
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user.id, req.params.itemId, quantity);
    res.json({ success: true, message: 'อัปเดตตะกร้าสำเร็จ', data: cart });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

// DELETE /api/cart/:itemId → ลบสินค้า
const removeCartItem = async (req, res) => {
  try {
    const cart = await cartService.removeCartItem(req.user.id, req.params.itemId);
    res.json({ success: true, message: 'ลบสินค้าออกจากตะกร้าสำเร็จ', data: cart });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
