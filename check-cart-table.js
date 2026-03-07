const { Sequelize } = require('sequelize');

async function checkCartTable() {
    const sequelize = new Sequelize('ddawngstore', 'root', '', { dialect: 'mysql' });
    
    try {
        console.log('🔍 Checking cart table structure...');
        
        // Check if cart table exists
        const [tables] = await sequelize.query('SHOW TABLES LIKE "cart"');
        if (tables.length === 0) {
            console.log('❌ Cart table does not exist!');
            
            // Check if carts table exists
            const [cartsTables] = await sequelize.query('SHOW TABLES LIKE "carts"');
            if (cartsTables.length > 0) {
                console.log('✅ Found "carts" table instead of "cart"');
                
                // Show carts table structure
                const [cartsDesc] = await sequelize.query('DESCRIBE carts');
                console.log('📋 Carts table structure:');
                cartsDesc.forEach(field => {
                    console.log(`  - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
                });
                
                // Check data in carts table
                const [cartsData] = await sequelize.query('SELECT * FROM carts LIMIT 5');
                console.log(`\n📦 Found ${cartsData.length} items in carts table:`);
                cartsData.forEach(item => {
                    console.log(`  - ID: ${item.id}, Product ID: ${item.product_id}, User ID: ${item.user_id}, Quantity: ${item.quantity}`);
                });
            }
        } else {
            console.log('✅ Cart table exists');
            
            // Show cart table structure
            const [cartDesc] = await sequelize.query('DESCRIBE cart');
            console.log('📋 Cart table structure:');
            cartDesc.forEach(field => {
                console.log(`  - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
            
            // Check data in cart table
            const [cartData] = await sequelize.query('SELECT * FROM cart LIMIT 5');
            console.log(`\n📦 Found ${cartData.length} items in cart table:`);
            cartData.forEach(item => {
                console.log(`  - ID: ${item.id}, Product ID: ${item.product_id}, User ID: ${item.user_id}, Quantity: ${item.quantity}`);
            });
        }
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkCartTable();
