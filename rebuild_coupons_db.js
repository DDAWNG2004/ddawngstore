const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ddawngstore', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

async function rebuild() {
    try {
        await sequelize.authenticate();

        // Cố gắng xoá bảng cũ đứt điểm
        await sequelize.query('DROP TABLE IF EXISTS coupons;');
        console.log('✅ Xóa bảng coupons cũ thành công.');

        // Tạo lại bảng mới hoàn toàn chuẩn
        await sequelize.query(`
            CREATE TABLE coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                discount_type ENUM('percent', 'fixed') NOT NULL DEFAULT 'fixed',
                discount_value DECIMAL(10,2) NOT NULL,
                min_purchase_amount DECIMAL(10,2) DEFAULT 0,
                valid_from DATETIME,
                valid_until DATETIME,
                usage_limit INT DEFAULT NULL,
                usage_count INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tạo mới cấu trúc bảng coupons chuẩn thành công.');

        // Khởi tạo các mã mặc định
        await sequelize.query(`
            INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, valid_from, valid_until, usage_limit, is_active)
            VALUES 
            ('WELCOME10', 'percent', 10, 0, NOW(), null, 100, 1),
            ('SALE50K', 'fixed', 50000, 200000, NOW(), null, 50, 1);
        `);
        console.log('✅ Đã nhập 2 mã giảm mẫu thành công.');

    } catch (error) {
        console.error('❌ Lỗi tái tạo bảng:', error.message);
    } finally {
        await sequelize.close();
    }
}
rebuild();
