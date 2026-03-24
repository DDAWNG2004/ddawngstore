const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ddawngstore', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

async function alterCouponsTable() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        try {
            await sequelize.query(`
                ALTER TABLE coupons 
                ADD COLUMN min_purchase_amount DECIMAL(10,2) DEFAULT 0 AFTER discount_value;
            `);
            console.log('✅ Column "min_purchase_amount" added successfully.');
        } catch (e) {
            if (e.message.includes('Duplicate column name')) {
                console.log('✅ Column "min_purchase_amount" already exists.');
            } else {
                console.error('❌ Error adding column:', e.message);
            }
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

alterCouponsTable();
