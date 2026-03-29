// routes/order.routes.js
const express         = require('express');
const router          = express.Router();
const controller      = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth');

router.post('/',    verifyToken, controller.createOrder);   // สร้าง order
router.get ('/',    verifyToken, controller.getMyOrders);   // ดูประวัติ
router.get ('/:id', verifyToken, controller.getOrderById);  // ดู order เดียว

module.exports = router;
