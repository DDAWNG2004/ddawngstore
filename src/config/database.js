const { Sequelize } = require('sequelize');
require('dotenv').config();

// Tạo kết nối đến MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ddawngstore',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Kiểm tra kết nối
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối đến MySQL thành công!');
    
    // Đồng bộ các bảng với database
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
      console.log('✅ Database synchronized!');
    }
  } catch (error) {
    console.error('❌ Không thể kết nối đến MySQL:', error.message);
    console.error('Chi tiết lỗi:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
