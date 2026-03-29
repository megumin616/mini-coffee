// ============================================================
// routes/cart.routes.js
// ============================================================
// Cart ต้อง Login ก่อน (verifyToken) ทุก Route
// ============================================================

const express         = require('express');
const router          = express.Router();
const controller      = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth');

// ทุก Route ใน /api/cart ต้องผ่าน verifyToken ก่อน
router.get   ('/',        verifyToken, controller.getCart);
router.post  ('/',        verifyToken, controller.addToCart);
router.put   ('/:itemId', verifyToken, controller.updateCartItem);
router.delete('/:itemId', verifyToken, controller.removeCartItem);

module.exports = router;
