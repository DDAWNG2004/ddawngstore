const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ddawngstore', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

async function createCouponsTable() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS coupons (
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
        console.log('Table "coupons" created successfully.');

        // Insert initial sample coupons
        const [existing] = await sequelize.query('SELECT COUNT(*) as count FROM coupons');
        if (existing[0].count === 0) {
            await sequelize.query(`
                INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, valid_from, valid_until, usage_limit, is_active)
                VALUES 
                ('WELCOME10', 'percent', 10, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 1),
                ('SALE50K', 'fixed', 50000, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 50, 1);
            `);
            console.log('Sample coupons inserted.');
        }

    } catch (error) {
        console.error('Unable to connect to the database or create table:', error);
    } finally {
        await sequelize.close();
    }
}

createCouponsTable();
