// ============================================================
// config/db.js - การเชื่อมต่อกับ MySQL Database
// ============================================================
// ไฟล์นี้สร้าง "Connection Pool" ไปยัง MySQL
//
// Connection Pool คืออะไร?
// แทนที่จะเปิด/ปิด Connection ทุกครั้งที่ Query
// เราสร้าง "สระว่ายน้ำ" ของ Connection ไว้ล่วงหน้า
// เมื่อต้องการ Query → หยิบ Connection จาก Pool มาใช้
// เมื่อเสร็จแล้ว → คืน Connection กลับ Pool
// → ประหยัดเวลา และรองรับ Traffic จำนวนมากได้ดีกว่า
// ============================================================

const mysql = require('mysql2/promise');

// สร้าง Connection Pool
const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'mini_shopee',
  waitForConnections: true,  // ถ้า Pool เต็ม ให้รอแทนที่จะ Error
  connectionLimit:    10,    // จำนวน Connection สูงสุดใน Pool
  queueLimit:         0      // จำนวน Request ที่รอได้ (0 = ไม่จำกัด)
});

// ทดสอบการเชื่อมต่อตอนเริ่ม Server
pool.getConnection()
  .then(conn => {
    console.log('✅ เชื่อมต่อ MySQL Database สำเร็จ!');
    conn.release(); // คืน Connection กลับ Pool
  })
  .catch(err => {
    console.error('❌ ไม่สามารถเชื่อมต่อ MySQL ได้:', err.message);
    console.error('💡 กรุณาตรวจสอบ: Host, User, Password, Database ใน .env');
    process.exit(1); // หยุด Server ถ้าเชื่อมต่อ DB ไม่ได้
  });

// Export pool ออกไปให้ Service ต่างๆ ใช้งาน
module.exports = pool;
