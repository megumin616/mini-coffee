// controllers/order.controller.js
const orderService = require('../services/order.service');

const createOrder = async (req, res) => {
  try {
    const { payment_method, address } = req.body;
    if (!payment_method || !address) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุวิธีชำระเงินและที่อยู่', data: null });
    }
    const order = await orderService.createOrder(req.user.id, { payment_method, address });
    res.status(201).json({ success: true, message: 'สร้างคำสั่งซื้อสำเร็จ', data: order });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    res.json({ success: true, message: 'ดึงประวัติคำสั่งซื้อสำเร็จ', data: orders });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.user.id, req.params.id);
    res.json({ success: true, message: 'ดึงข้อมูล Order สำเร็จ', data: order });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message, data: null });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };
