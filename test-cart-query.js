const { Sequelize } = require('sequelize');

async function testCartQuery() {
    const sequelize = new Sequelize('ddawngstore', 'root', '', { dialect: 'mysql' });
    
    try {
        console.log('🔍 Testing cart query...');
        
        // Test the exact query from the route
        const [cartData] = await sequelize.query(`
            SELECT c.*, p.name as product_name, p.price as product_price, 
                   p.description, pi.image_url, pv.name as size_name, pv.description as size_description,
                   col.name as color_name, col.hex_code as color_hex, cat.name as category_name
            FROM cart c
            LEFT JOIN products p ON c.product_id = p.id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            LEFT JOIN product_variants pv ON c.variant_id = pv.id
            LEFT JOIN colors col ON pv.color_id = col.id
            LEFT JOIN categories cat ON p.category_id = cat.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `, {
            replacements: [3] // User ID 3 from the cart data
        });
        
        console.log(`📊 Query result: ${cartData.length} items`);
        
        if (cartData.length > 0) {
            console.log('📦 First cart item:');
            const item = cartData[0];
            console.log(`  - Cart ID: ${item.id}`);
            console.log(`  - Product ID: ${item.product_id}`);
            console.log(`  - Product Name: ${item.product_name}`);
            console.log(`  - Product Price: ${item.product_price}`);
            console.log(`  - Image URL: ${item.image_url}`);
            console.log(`  - Quantity: ${item.quantity}`);
        } else {
            console.log('❌ No cart items found for user ID 3');
            
            // Test simpler query
            console.log('\n🔍 Testing simpler query...');
            const [simpleData] = await sequelize.query(`
                SELECT c.*, p.name as product_name, p.price as product_price
                FROM cart c
                LEFT JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            `, {
                replacements: [3]
            });
            
            console.log(`📊 Simple query result: ${simpleData.length} items`);
            if (simpleData.length > 0) {
                console.log('📦 First item from simple query:');
                console.log(`  - Product Name: ${simpleData[0].product_name}`);
                console.log(`  - Product Price: ${simpleData[0].product_price}`);
            }
        }
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testCartQuery();
