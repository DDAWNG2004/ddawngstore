const { connectDB } = require('./src/config/database');

console.log('🔄 Đang kiểm tra kết nối database...');
console.log('📋 Config:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'ddawngstore',
    user: process.env.DB_USER || 'root'
});

connectDB();
