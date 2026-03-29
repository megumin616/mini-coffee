// ============================================================
// routes/admin.routes.js
// ============================================================
// ทุก Route ต้องผ่าน verifyToken + checkRole('ADMIN')
// ถ้า User ธรรมดาพยายามเข้า → 403 Forbidden
// ============================================================

const express                 = require('express');
const router                  = express.Router();
const controller              = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middlewares/auth');

// Middleware ทั้ง 2 ตัวนี้จะทำงานตามลำดับ ทุก Route ใน /api/admin
// 1. verifyToken → ตรวจ JWT
// 2. checkRole('ADMIN') → ตรวจว่าเป็น Admin หรือไม่
router.use(verifyToken, checkRole('ADMIN'));

// ต้องประกาศก่อน /:id (order) — ไม่ให้ path พิเศษถูกจับเป็น id
router.get('/users', controller.listUsers);
router.post('/users', controller.createUser);
router.put('/users/:userId', controller.updateUser);
router.delete('/users/:userId', controller.deleteUser);
router.patch('/users/:userId/role', controller.updateUserRole);

router.get('/products', controller.listProductsAdmin);
router.post('/products', controller.createProduct);
router.get('/products/:productId', controller.getProductAdmin);
router.put('/products/:productId', controller.updateProduct);
router.delete('/products/:productId', controller.deleteProduct);

router.get('/', controller.getAllOrders);
router.get('/:id', controller.getOrderDetail);
router.patch('/:id/status', controller.updateOrderStatus);

module.exports = router;
