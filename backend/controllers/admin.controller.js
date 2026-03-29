// ============================================================
// controllers/admin.controller.js
// ============================================================

const adminService   = require('../services/admin.service');
const productService = require('../services/product.service');

const getAllOrders = async (req, res) => {
  try {
    const orders = await adminService.getAllOrders();
    res.json({ success: true, message: 'ดึงรายการ Order ทั้งหมดสำเร็จ', data: orders });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await adminService.getOrderDetail(req.params.id);
    res.json({ success: true, message: 'ดึงรายละเอียด Order สำเร็จ', data: order });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await adminService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ', data: order });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await adminService.listUsers();
    res.json({ success: true, message: 'ดึงรายชื่อผู้ใช้สำเร็จ', data: users });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง', data: null });
    }
    const user = await adminService.updateUserRole(userId, role);
    res.json({ success: true, message: 'อัปเดตสิทธิ์ผู้ใช้สำเร็จ', data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({ success: true, message: 'สร้างผู้ใช้สำเร็จ', data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง', data: null });
    }
    const user = await adminService.updateUser(userId, req.body);
    res.json({ success: true, message: 'อัปเดตผู้ใช้สำเร็จ', data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง', data: null });
    }
    await adminService.deleteUser(userId);
    res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ', data: null });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const listProductsAdmin = async (req, res) => {
  try {
    const products = await productService.getAllProductsAdmin();
    res.json({ success: true, message: 'ดึงรายการสินค้าสำเร็จ', data: products });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, message: 'สร้างสินค้าสำเร็จ', data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const getProductAdmin = async (req, res) => {
  try {
    const product = await productService.getProductByIdAdmin(req.params.productId);
    res.json({ success: true, message: 'ดึงข้อมูลสินค้าสำเร็จ', data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.productId, req.body);
    res.json({ success: true, message: 'อัปเดตสินค้าสำเร็จ', data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await productService.softDeleteProduct(req.params.productId);
    res.json({ success: true, message: 'ซ่อนสินค้าสำเร็จ (ลูกค้าจะไม่เห็น)', data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

module.exports = {
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  listProductsAdmin,
  createProduct,
  getProductAdmin,
  updateProduct,
  deleteProduct
};
