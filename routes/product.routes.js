// ============================================================
// routes/product.routes.js
// ============================================================
// สินค้าเป็น Public API (ไม่ต้อง Login ก็ดูได้)
// ============================================================

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/product.controller');

// GET /api/products          → ดูสินค้าทั้งหมด
// GET /api/products?category=มือถือ → กรองตาม category
router.get('/', controller.getAllProducts);

// GET /api/products/:id → ดูสินค้าชิ้นเดียว
router.get('/:id', controller.getProductById);

module.exports = router;
