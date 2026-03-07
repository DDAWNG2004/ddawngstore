const { Sequelize } = require('sequelize');

async function createSampleOrders() {
    const sequelize = new Sequelize('ddawngstore', 'root', '', { dialect: 'mysql' });
    
    try {
        console.log('🔄 Creating sample orders...');
        
        // Get users to assign orders to
        const [users] = await sequelize.query('SELECT id, full_name, email FROM users WHERE role = "user" LIMIT 3');
        
        if (users.length === 0) {
            console.log('❌ No users found to create orders for');
            return;
        }
        
        console.log(`👥 Found ${users.length} users for sample orders`);
        
        // Get products to add to orders
        const [products] = await sequelize.query('SELECT id, name, price FROM products WHERE status = "active" LIMIT 5');
        
        if (products.length === 0) {
            console.log('❌ No products found to create orders with');
            return;
        }
        
        console.log(`📦 Found ${products.length} products for sample orders`);
        
        // Create sample orders
        const sampleOrders = [
            {
                order_number: 'ORD-2024-001',
                user_id: users[0].id,
                status: 'delivered',
                payment_status: 'paid',
                payment_method: 'credit_card',
                subtotal: 250000,
                tax_amount: 25000,
                shipping_amount: 30000,
                discount_amount: 0,
                total_amount: 305000,
                currency: 'VND',
                shipping_name: users[0].full_name,
                shipping_email: users[0].email,
                shipping_phone: '0912345678',
                shipping_address: '123 Đường ABC, Quận 1, TP.HCM',
                shipping_city: 'Ho Chi Minh City',
                shipping_country: 'Vietnam',
                notes: 'Giao hàng vào buổi sáng'
            },
            {
                order_number: 'ORD-2024-002',
                user_id: users[1].id,
                status: 'processing',
                payment_status: 'paid',
                payment_method: 'bank_transfer',
                subtotal: 180000,
                tax_amount: 18000,
                shipping_amount: 30000,
                discount_amount: 10000,
                total_amount: 218000,
                currency: 'VND',
                shipping_name: users[1].full_name,
                shipping_email: users[1].email,
                shipping_phone: '0923456789',
                shipping_address: '456 Đường XYZ, Quận 3, TP.HCM',
                shipping_city: 'Ho Chi Minh City',
                shipping_country: 'Vietnam',
                notes: 'Gọi điện trước khi giao'
            },
            {
                order_number: 'ORD-2024-003',
                user_id: users[2] ? users[2].id : users[0].id,
                status: 'pending',
                payment_status: 'pending',
                payment_method: 'cod',
                subtotal: 420000,
                tax_amount: 42000,
                shipping_amount: 30000,
                discount_amount: 20000,
                total_amount: 472000,
                currency: 'VND',
                shipping_name: users[2] ? users[2].full_name : users[0].full_name,
                shipping_email: users[2] ? users[2].email : users[0].email,
                shipping_phone: '0934567890',
                shipping_address: '789 Đường DEF, Quận 5, TP.HCM',
                shipping_city: 'Ho Chi Minh City',
                shipping_country: 'Vietnam',
                notes: 'Khách hàng yêu cầu đóng gói cẩn thận'
            }
        ];
        
        for (const orderData of sampleOrders) {
            try {
                // Check if order already exists
                const [existing] = await sequelize.query('SELECT id FROM orders WHERE order_number = ?', {
                    replacements: [orderData.order_number]
                });
                
                if (existing.length > 0) {
                    console.log(`⚠️ Order ${orderData.order_number} already exists`);
                    continue;
                }
                
                // Insert order
                const [orderResult] = await sequelize.query(`
                    INSERT INTO orders (
                        order_number, user_id, status, payment_status, payment_method,
                        subtotal, tax_amount, shipping_amount, discount_amount, total_amount,
                        currency, shipping_name, shipping_email, shipping_phone, shipping_address,
                        shipping_city, shipping_country, notes, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, {
                    replacements: [
                        orderData.order_number, orderData.user_id, orderData.status, orderData.payment_status, orderData.payment_method,
                        orderData.subtotal, orderData.tax_amount, orderData.shipping_amount, orderData.discount_amount, orderData.total_amount,
                        orderData.currency, orderData.shipping_name, orderData.shipping_email, orderData.shipping_phone, orderData.shipping_address,
                        orderData.shipping_city, orderData.shipping_country, orderData.notes
                    ]
                });
                
                const orderId = orderResult.insertId || orderResult[0];
                console.log(`✅ Created order ${orderData.order_number} with ID: ${orderId}`);
                
                // Add sample order items
                const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
                for (let i = 0; i < numItems && i < products.length; i++) {
                    const product = products[i];
                    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
                    const price = product.price;
                    
                    await sequelize.query(`
                        INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total_price)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, {
                        replacements: [orderId, product.id, product.name, quantity, price, price * quantity]
                    });
                }
                
            } catch (error) {
                console.error(`❌ Error creating order ${orderData.order_number}:`, error.message);
            }
        }
        
        // Verify created orders
        const [orders] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
        console.log(`✅ Total orders in database: ${orders[0].count}`);
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createSampleOrders();
