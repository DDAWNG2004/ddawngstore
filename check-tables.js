const { Sequelize } = require('sequelize');

async function checkTables() {
    const sequelize = new Sequelize('ddawngstore', 'root', '', { dialect: 'mysql' });
    
    try {
        console.log('🔍 Checking database tables...');
        
        // Check all tables
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('📋 Available tables:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        // Check orders table structure
        try {
            const [ordersDesc] = await sequelize.query('DESCRIBE orders');
            console.log('\n📦 Orders table structure:');
            ordersDesc.forEach(field => {
                console.log(`  - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        } catch (error) {
            console.log('❌ Orders table does not exist');
        }
        
        // Check users table structure
        try {
            const [usersDesc] = await sequelize.query('DESCRIBE users');
            console.log('\n👥 Users table structure:');
            usersDesc.forEach(field => {
                console.log(`  - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        } catch (error) {
            console.log('❌ Users table does not exist');
        }
        
        // Test orders query
        try {
            const [orders] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
            console.log(`\n📊 Orders count: ${orders[0].count}`);
        } catch (error) {
            console.log('❌ Error querying orders:', error.message);
        }
        
        // Test customers query
        try {
            const [customers] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
            console.log(`📊 Customers count: ${customers[0].count}`);
        } catch (error) {
            console.log('❌ Error querying customers:', error.message);
        }
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkTables();
