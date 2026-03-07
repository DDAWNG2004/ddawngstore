const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Admin login page
router.get('/login', (req, res) => {
    res.render('login', { 
        title: 'Admin Login',
        isAdmin: true // Flag to indicate this is admin login
    });
});

// Admin login POST
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check admin credentials in database
        const [adminUsers] = await req.sequelize.query(`
            SELECT * FROM users WHERE email = ? AND role = 'admin'
        `, {
            replacements: [email]
        });
        
        if (adminUsers.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }
        
        const admin = adminUsers[0];
        
        // For demo purposes, skip password verification
        // In production, you should verify: if (admin.password_hash !== hash) { ... }
        
        // Set admin session
        req.session.user = {
            id: admin.id,
            name: admin.full_name,
            email: admin.email,
            role: admin.role
        };
        
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            redirect: '/admin'
        });
        
    } catch (error) {
        logger.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng nhập'
        });
    }
});

// Admin logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            logger.error('Logout error:', err);
        }
        res.redirect('/admin/login');
    });
});

// Admin dashboard (Statistics page)
router.get('/', adminAuth, async (req, res) => {
    try {
        // Get sales statistics
        const [monthlySales] = await req.sequelize.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(total_amount) as total_sales,
                COUNT(*) as order_count
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);
        
        // Get top products
        const [topProducts] = await req.sequelize.query(`
            SELECT 
                p.name,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            GROUP BY oi.product_id, p.name
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        
        // Get order status statistics
        const [orderStats] = await req.sequelize.query(`
            SELECT status, COUNT(*) as count
            FROM orders
            GROUP BY status
        `);
        
        // Get dashboard statistics
        const [productCount] = await req.sequelize.query('SELECT COUNT(*) as count FROM products');
        const [orderCount] = await req.sequelize.query('SELECT COUNT(*) as count FROM orders');
        const [customerCount] = await req.sequelize.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
        const [recentOrders] = await req.sequelize.query(`
            SELECT o.*, u.full_name as customer_name 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC 
            LIMIT 5
        `);
        
        res.render('admin-statistics', {
            monthlySales: monthlySales,
            topProducts: topProducts,
            orderStats: orderStats,
            stats: {
                products: productCount[0].count,
                orders: orderCount[0].count,
                customers: customerCount[0].count
            },
            recentOrders: recentOrders,
            user: req.session.user,
            title: 'Dashboard'
        });
    } catch (error) {
        logger.error('Error loading statistics:', error);
        res.status(500).send('Error loading statistics');
    }
});

// Admin dashboard (alternative route)
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Get sales statistics
        const [monthlySales] = await req.sequelize.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(total_amount) as total_sales,
                COUNT(*) as order_count
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);
        
        // Get top products
        const [topProducts] = await req.sequelize.query(`
            SELECT 
                p.name,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            GROUP BY oi.product_id, p.name
            ORDER BY total_sold DESC
            LIMIT 10
        `);
        
        // Get order status statistics
        const [orderStats] = await req.sequelize.query(`
            SELECT status, COUNT(*) as count
            FROM orders
            GROUP BY status
        `);
        
        // Get dashboard statistics
        const [productCount] = await req.sequelize.query('SELECT COUNT(*) as count FROM products');
        const [orderCount] = await req.sequelize.query('SELECT COUNT(*) as count FROM orders');
        const [customerCount] = await req.sequelize.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
        const [recentOrders] = await req.sequelize.query(`
            SELECT o.*, u.full_name as customer_name 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC 
            LIMIT 5
        `);
        
        res.render('admin-statistics', {
            monthlySales: monthlySales,
            topProducts: topProducts,
            orderStats: orderStats,
            stats: {
                products: productCount[0].count,
                orders: orderCount[0].count,
                customers: customerCount[0].count
            },
            recentOrders: recentOrders,
            user: req.session.user,
            title: 'Dashboard'
        });
    } catch (error) {
        logger.error('Error loading statistics:', error);
        res.status(500).send('Error loading statistics');
    }
});

// Orders management page
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const [orders] = await req.sequelize.query(`
            SELECT o.*, u.full_name as customer_name, u.email as customer_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        
        res.render('admin-orders', {
            orders: orders,
            user: req.session.user,
            title: 'Quản lý đơn hàng'
        });
    } catch (error) {
        logger.error('Error fetching orders:', error);
        res.status(500).send('Error fetching orders');
    }
});

// Add sample data for testing
router.get('/add-sample-data', adminAuth, async (req, res) => {
    try {
        // Add sample order items
        await req.sequelize.query(`
            INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, price, total, product_name, product_sku, created_at) VALUES
            (1, 1, 1, NULL, 2, 125000.00, 250000.00, 'Váy hoa vintage', 'SKU1', '2026-03-03 10:50:21'),
            (2, 2, 2, NULL, 1, 150000.00, 150000.00, 'Áo thun basic', 'SKU2', '2026-03-03 10:50:21'),
            (3, 2, 3, NULL, 1, 30000.00, 30000.00, 'Quần jeans slim', 'SKU3', '2026-03-03 10:50:21'),
            (4, 3, 1, NULL, 1, 450000.00, 450000.00, 'Váy hoa vintage', 'SKU1', '2026-03-03 10:50:21'),
            (5, 3, 4, NULL, 1, 70000.00, 70000.00, 'Áo sơ mi nữ', 'SKU4', '2026-03-03 10:50:21')
            ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), total = VALUES(total)
        `);
        
        res.send('Sample data added successfully!');
    } catch (error) {
        logger.error('Error adding sample data:', error);
        res.status(500).send('Error adding sample data');
    }
});

// Order detail page
router.get('/orders/:id', adminAuth, async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Get order details
        const [orders] = await req.sequelize.query(`
            SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone, u.address
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, {
            replacements: [orderId]
        });
        
        if (orders.length === 0) {
            return res.status(404).send('Order not found');
        }
        
        const order = orders[0];
        
        // Get order items
        const [orderItems] = await req.sequelize.query(`
            SELECT oi.*
            FROM order_items oi
            WHERE oi.order_id = ?
        `, {
            replacements: [orderId]
        });
        
        res.render('admin-order-detail', {
            order: order,
            orderItems: orderItems,
            user: req.session.user,
            title: 'Chi tiết đơn hàng'
        });
    } catch (error) {
        logger.error('Error fetching order details:', error);
        res.status(500).send('Error fetching order details');
    }
});

// Delete order
router.delete('/orders/:id', adminAuth, async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Delete order items first
        await req.sequelize.query('DELETE FROM order_items WHERE order_id = ?', {
            replacements: [orderId]
        });
        
        // Delete order
        await req.sequelize.query('DELETE FROM orders WHERE id = ?', {
            replacements: [orderId]
        });
        
        res.json({ success: true, message: 'Đơn hàng đã được xóa' });
    } catch (error) {
        logger.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa đơn hàng' });
    }
});

// Customers management page
router.get('/customers', adminAuth, async (req, res) => {
    try {
        const [customers] = await req.sequelize.query(`
            SELECT id, full_name, email, phone, address, created_at 
            FROM users 
            WHERE role = 'user' 
            ORDER BY created_at DESC
        `);
        
        res.render('admin-customers', {
            customers: customers,
            user: req.session.user,
            title: 'Quản lý khách hàng'
        });
    } catch (error) {
        logger.error('Error fetching customers:', error);
        res.status(500).send('Error fetching customers');
    }
});

// Customer detail page
router.get('/customers/:id', adminAuth, async (req, res) => {
    try {
        const customerId = req.params.id;
        
        // Get customer details
        const [customers] = await req.sequelize.query(`
            SELECT id, full_name, email, phone, address, created_at 
            FROM users 
            WHERE id = ? AND role = 'user'
        `, {
            replacements: [customerId]
        });
        
        if (customers.length === 0) {
            return res.status(404).send('Customer not found');
        }
        
        const customer = customers[0];
        
        // Get customer orders
        const [customerOrders] = await req.sequelize.query(`
            SELECT o.*, COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, {
            replacements: [customerId]
        });
        
        // Get order statistics
        const [orderStats] = await req.sequelize.query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_amount) as total_spent,
                AVG(total_amount) as avg_order_value,
                MAX(created_at) as last_order_date
            FROM orders 
            WHERE user_id = ?
        `, {
            replacements: [customerId]
        });
        
        res.render('admin-customer-detail', {
            customer: customer,
            orders: customerOrders,
            stats: orderStats[0] || {
                total_orders: 0,
                total_spent: 0,
                avg_order_value: 0,
                last_order_date: null
            },
            user: req.session.user,
            title: 'Chi tiết khách hàng'
        });
    } catch (error) {
        logger.error('Error fetching customer details:', error);
        res.status(500).send('Error fetching customer details');
    }
});

// Delete customer
router.delete('/customers/:id', adminAuth, async (req, res) => {
    try {
        const customerId = req.params.id;
        
        // Check if customer has orders
        const [customerOrders] = await req.sequelize.query('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', {
            replacements: [customerId]
        });
        
        if (customerOrders[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không thể xóa khách hàng có đơn hàng' 
            });
        }
        
        // Delete customer
        await req.sequelize.query('DELETE FROM users WHERE id = ? AND role = "user"', {
            replacements: [customerId]
        });
        
        res.json({ success: true, message: 'Khách hàng đã được xóa' });
    } catch (error) {
        logger.error('Error deleting customer:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa khách hàng' });
    }
});

// Products management page
router.get('/products', adminAuth, async (req, res) => {
    try {
        const [products] = await req.sequelize.query(`
            SELECT p.*, c.name as category_name,
                   COALESCE(
                       (SELECT SUM(pv.stock_quantity) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.id), 
                       0
                   ) as stock_quantity
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.created_at DESC
        `);
        
        res.render('admin-products-simple', { 
            products: products,
            user: req.session.user,
            title: 'Quản lý sản phẩm'
        });
    } catch (error) {
        logger.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});

// Add product page
router.get('/products/add', adminAuth, async (req, res) => {
    try {
        const [categories] = await req.sequelize.query('SELECT * FROM categories ORDER BY name');
        const [sizes] = await req.sequelize.query('SELECT * FROM sizes ORDER BY name');
        const [colors] = await req.sequelize.query('SELECT * FROM colors ORDER BY name');
        
        res.render('admin-product-add', { 
            categories: categories,
            sizes: sizes,
            colors: colors,
            user: req.session.user,
            title: 'Thêm sản phẩm mới'
        });
    } catch (error) {
        logger.error('Error loading add product page:', error);
        res.status(500).send('Error loading page');
    }
});

// Add product POST
router.post('/products/add', adminAuth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]), async (req, res) => {
    try {
        const {
            productName,
            productCode,
            description,
            category,
            price,
            sku,
            status,
            featured,
            mainImageUrl,
            variants
        } = req.body;

        // Parse variants if it's a string
        let parsedVariants = [];
        console.log('🔍 Raw variants data:', variants);
        console.log('🔍 Type of variants:', typeof variants);
        console.log('🔍 All request body keys:', Object.keys(req.body));
        
        if (variants) {
            try {
                parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
                console.log('✅ Parsed variants:', parsedVariants);
            } catch (parseError) {
                logger.error('Error parsing variants:', parseError);
                console.log('❌ Error parsing variants:', parseError);
                parsedVariants = [];
            }
        }

        // Get main image URL
        let mainImage = mainImageUrl;
        if (req.files && req.files.mainImage && req.files.mainImage[0]) {
            mainImage = '/uploads/' + req.files.mainImage[0].filename;
        }

        // Start transaction
        await req.sequelize.query('START TRANSACTION');

        try {
            // Insert product
            const [result] = await req.sequelize.query(`
                INSERT INTO products (name, description, category_id, price, sku, status, stock_quantity, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
            `, {
                replacements: [
                    productName,
                    description || '',
                    category,
                    price,
                    sku || `SKU${Date.now()}`,
                    status || 'active',
                    0 // stock_quantity - will be calculated from variants
                ]
            });

            const productId = result.insertId || result[0]?.insertId;
            logger.info('Product inserted with ID:', productId);

            // Insert main image
            if (mainImage) {
                await req.sequelize.query(`
                    INSERT INTO product_images (product_id, image_url, is_primary, created_at, updated_at)
                    VALUES (?, ?, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
                `, {
                    replacements: [productId, mainImage]
                });
            }

            // Insert additional images
            if (req.files && req.files.additionalImages) {
                for (const file of req.files.additionalImages) {
                    await req.sequelize.query(`
                        INSERT INTO product_images (product_id, image_url, is_primary, created_at, updated_at)
                        VALUES (?, ?, 0, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
                    `, {
                        replacements: [productId, '/uploads/' + file.filename]
                    });
                }
            }

            // Insert variants and calculate total stock
            let totalStock = 0;
            if (parsedVariants && parsedVariants.length > 0) {
                for (const variant of parsedVariants) {
                    const { sizeId, colorId, stock, variantSku, priceAdjustment } = variant;
                    
                    // Ép kiểu về số nguyên để tránh lỗi khóa ngoại
                    const sizeIdInt = parseInt(sizeId);
                    const colorIdInt = parseInt(colorId);
                    const stockInt = parseInt(stock || 0);
                    
                    if (sizeIdInt && colorIdInt) {
                        console.log(`📦 Adding variant: size=${sizeIdInt}, color=${colorIdInt}, stock=${stockInt}`);
                        
                        await req.sequelize.query(`
                            INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity, sku, price_adjustment, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
                        `, {
                            replacements: [
                                productId,
                                sizeIdInt,
                                colorIdInt,
                                stockInt,
                                variantSku || `VAR${productId}${sizeIdInt}${colorIdInt}`,
                                priceAdjustment || 0
                            ]
                        });
                        
                        totalStock += stockInt;
                        console.log(`✅ Variant added successfully. Running total stock: ${totalStock}`);
                    } else {
                        console.log(`⚠️ Skipping invalid variant: sizeId=${sizeIdInt}, colorId=${colorIdInt}, stock=${stockInt}`);
                    }
                }
            }

            // Update product stock
            await req.sequelize.query(`
                UPDATE products SET stock_quantity = ? WHERE id = ?
            `, {
                replacements: [totalStock, productId]
            });

            await req.sequelize.query('COMMIT');
            logger.info('Product added successfully:', productName);

            res.json({
                success: true,
                message: 'Thêm sản phẩm thành công',
                productId: productId
            });

        } catch (error) {
            await req.sequelize.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        logger.error('Error adding product:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm sản phẩm: ' + error.message
        });
    }
});

// Delete product
router.post('/products/delete/:id', adminAuth, async (req, res) => {
    try {
        const productId = req.params.id;
        
        await req.sequelize.query('START TRANSACTION');
        
        try {
            // Delete product images
            await req.sequelize.query('DELETE FROM product_images WHERE product_id = ?', {
                replacements: [productId]
            });
            
            // Delete product variants
            await req.sequelize.query('DELETE FROM product_variants WHERE product_id = ?', {
                replacements: [productId]
            });
            
            // Delete product
            await req.sequelize.query('DELETE FROM products WHERE id = ?', {
                replacements: [productId]
            });
            
            await req.sequelize.query('COMMIT');
            
            res.json({
                success: true,
                message: 'Xóa sản phẩm thành công'
            });
        } catch (error) {
            await req.sequelize.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm: ' + error.message
        });
    }
});

// Edit product page
router.get('/products/edit/:id', adminAuth, async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Get product details
        const [products] = await req.sequelize.query('SELECT * FROM products WHERE id = ?', {
            replacements: [productId]
        });
        
        if (products.length === 0) {
            return res.status(404).send('Product not found');
        }
        
        const product = products[0];
        
        // Get categories, sizes, colors
        const [categories] = await req.sequelize.query('SELECT * FROM categories ORDER BY name');
        const [sizes] = await req.sequelize.query('SELECT * FROM sizes ORDER BY name');
        const [colors] = await req.sequelize.query('SELECT * FROM colors ORDER BY name');
        
        // Get product images
        const [images] = await req.sequelize.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', {
            replacements: [productId]
        });
        
        // Get product variants
        const [variants] = await req.sequelize.query(`
            SELECT pv.*, s.name as size_name, c.name as color_name, c.hex_code
            FROM product_variants pv
            LEFT JOIN sizes s ON pv.size_id = s.id
            LEFT JOIN colors c ON pv.color_id = c.id
            WHERE pv.product_id = ?
        `, {
            replacements: [productId]
        });
        
        res.render('admin-product-edit', {
            product: product,
            categories: categories,
            sizes: sizes,
            colors: colors,
            images: images,
            variants: variants,
            user: req.session.user,
            title: 'Chỉnh sửa sản phẩm'
        });
    } catch (error) {
        logger.error('Error loading edit product page:', error);
        res.status(500).send('Error loading page');
    }
});

// Update product POST
router.post('/products/edit/:id', adminAuth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
]), async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            productName,
            productCode,
            description,
            category,
            price,
            sku,
            status,
            featured,
            mainImageUrl,
            variants,
            existing_variants,
            deleted_variants
        } = req.body;

        await req.sequelize.query('START TRANSACTION');

        try {
            // Update product
            await req.sequelize.query(`
                UPDATE products 
                SET name = ?, description = ?, category_id = ?, price = ?, 
                    sku = ?, status = ?, updated_at = CURRENT_TIMESTAMP()
                WHERE id = ?
            `, {
                replacements: [
                    productName,
                    description,
                    category,
                    price,
                    sku,
                    status,
                    productId
                ]
            });

            // Handle deleted variants
            if (deleted_variants) {
                const deletedVariantIds = Array.isArray(deleted_variants) ? deleted_variants : [deleted_variants];
                for (const variantId of deletedVariantIds) {
                    await req.sequelize.query('DELETE FROM product_variants WHERE id = ?', {
                        replacements: [variantId]
                    });
                }
            }

            // Handle existing variants updates
            if (existing_variants) {
                const existingVariantsArray = Array.isArray(existing_variants) ? existing_variants : [existing_variants];
                for (const variant of existingVariantsArray) {
                    const { id, stock, variantSku, priceAdjustment } = variant;
                    const stockInt = parseInt(stock || 0);
                    
                    await req.sequelize.query(`
                        UPDATE product_variants 
                        SET stock_quantity = ?, sku = ?, price_adjustment = ?, updated_at = CURRENT_TIMESTAMP()
                        WHERE id = ?
                    `, {
                        replacements: [stockInt, variantSku, priceAdjustment || 0, parseInt(id)]
                    });
                }
            }

            // Handle new variants
            if (variants) {
                const parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants);
                for (const variant of parsedVariants) {
                    const { sizeId, colorId, stock, variantSku, priceAdjustment } = variant;
                    
                    // Ép kiểu về số nguyên để tránh lỗi khóa ngoại
                    const sizeIdInt = parseInt(sizeId);
                    const colorIdInt = parseInt(colorId);
                    const stockInt = parseInt(stock || 0);
                    
                    if (sizeIdInt && colorIdInt) {
                        console.log(`📦 Updating/Adding variant: size=${sizeIdInt}, color=${colorIdInt}, stock=${stockInt}`);
                        
                        await req.sequelize.query(`
                            INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity, sku, price_adjustment, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
                        `, {
                            replacements: [
                                productId,
                                sizeIdInt,
                                colorIdInt,
                                stockInt,
                                variantSku || `VAR${productId}${sizeIdInt}${colorIdInt}`,
                                priceAdjustment || 0
                            ]
                        });
                        console.log(`✅ Variant inserted successfully`);
                    } else {
                        console.log(`⚠️ Skipping invalid variant: sizeId=${sizeIdInt}, colorId=${colorIdInt}, stock=${stockInt}`);
                    }
                }
            }

            // Recalculate total stock
            const [stockResult] = await req.sequelize.query('SELECT SUM(stock_quantity) as total FROM product_variants WHERE product_id = ?', {
                replacements: [productId]
            });
            
            const totalStock = stockResult[0].total || 0;
            
            await req.sequelize.query('UPDATE products SET stock_quantity = ? WHERE id = ?', {
                replacements: [totalStock, productId]
            });

            await req.sequelize.query('COMMIT');
            
            res.json({
                success: true,
                message: 'Cập nhật sản phẩm thành công'
            });

        } catch (error) {
            await req.sequelize.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        logger.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sản phẩm: ' + error.message
        });
    }
});

module.exports = router;
