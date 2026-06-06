const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/images/products');
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

// API Get Latest Pending Orders for Notification (with specific details)
router.get('/api/orders/latest-notifs', adminAuth, async (req, res) => {
    try {
        const lastId = parseInt(req.query.lastId) || 0;
        const [result] = await req.sequelize.query(`
            SELECT o.id, o.order_number, o.created_at, u.full_name as customer_name,
               (SELECT GROUP_CONCAT(product_name SEPARATOR ', ') FROM order_items WHERE order_id = o.id) as products_preview
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.status = 'pending' AND o.id > ?
            ORDER BY o.id ASC
        `, { replacements: [lastId] });
        res.json({
            success: true,
            orders: result
        });
    } catch (error) {
        logger.error('Error fetching latest orders:', error);
        res.status(500).json({ success: false, orders: [] });
    }
});

// API Get Pending Orders count for notification
router.get('/api/orders/pending-count', adminAuth, async (req, res) => {
    try {
        const [result] = await req.sequelize.query(`
            SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
        `);
        res.json({
            success: true,
            count: result[0].count || 0
        });
    } catch (error) {
        logger.error('Error fetching pending orders count:', error);
        res.status(500).json({ success: false, count: 0 });
    }
});

// Orders management page
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [countResult] = await req.sequelize.query('SELECT COUNT(*) as total FROM orders');
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        const [orders] = await req.sequelize.query(`
            SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.avatar as customer_avatar,
                   (SELECT GROUP_CONCAT(CONCAT(product_name, ' (x', quantity, ')') SEPARATOR ', ') 
                    FROM order_items oi WHERE oi.order_id = o.id) as products_preview
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `, { replacements: [limit, offset] });

        res.render('admin-orders', {
            orders: orders,
            user: req.session.user,
            title: 'Quản lý đơn hàng',
            pagination: { page, limit, totalItems, totalPages }
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
            SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone, u.address, u.avatar as customer_avatar
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
            SELECT oi.*, 
                   (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as image_url
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

// Update order status
router.post('/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        // Valid statuses
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }

        // Update order status
        let query = 'UPDATE orders SET status = ? WHERE id = ?';
        let replacements = [status, orderId];

        if (status === 'delivered') {
            query = 'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?';
            replacements = [status, 'paid', orderId];
        }

        await req.sequelize.query(query, {
            replacements: replacements
        });

        res.json({ success: true, message: 'Cập nhật trạng thái thành công' + (status === 'delivered' ? ' và đã tự động đánh dấu đã thanh toán' : '') });
    } catch (error) {
        logger.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
    }
});

// Customers management page
router.get('/customers', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [countResult] = await req.sequelize.query('SELECT COUNT(*) as total FROM users WHERE role = \'user\'');
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        const [customers] = await req.sequelize.query(`
            SELECT id, full_name, email, phone, address, avatar, created_at 
            FROM users 
            WHERE role = 'user' 
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, { replacements: [limit, offset] });

        res.render('admin-customers', {
            customers: customers,
            user: req.session.user,
            title: 'Quản lý khách hàng',
            pagination: { page, limit, totalItems, totalPages }
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [countResult] = await req.sequelize.query('SELECT COUNT(*) as total FROM products');
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        const [products] = await req.sequelize.query(`
            SELECT p.*, c.name as category_name,
                   (SELECT pi.image_url 
                    FROM product_images pi 
                    WHERE pi.product_id = p.id AND pi.is_primary = 1 
                    LIMIT 1
                   ) as image_url,
                   COALESCE(
                       (SELECT SUM(pv.stock_quantity) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.id), 
                       0
                   ) as calculated_stock
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, { replacements: [limit, offset] });

        const [categories] = await req.sequelize.query('SELECT * FROM categories ORDER BY name');

        res.render('admin-products-simple', {
            products: products,
            categories: categories,
            user: req.session.user,
            title: 'Quản lý sản phẩm',
            pagination: { page, limit, totalItems, totalPages }
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

// Add product POST - Hỗ trợ cả JSON, multipart/form-data và URL-encoded
router.post('/products/add', adminAuth, (req, res, next) => {
    // Nếu request là JSON hoặc URL-encoded, skip multer
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded')) {
        return next();
    }
    // Nếu là multipart, dùng multer để parse
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'additionalImages', maxCount: 5 }
    ])(req, res, next);
}, async (req, res) => {
    try {
        const {
            productName,
            description,
            category,
            price,
            sku,
            status,
            featured,
            mainImageUrl,
            additionalImageUrls,
            variants
        } = req.body;

        console.log('🔍 === ADD PRODUCT DEBUG ===');
        console.log('🔍 Content-Type:', req.headers['content-type']);
        console.log('🔍 productName:', productName);
        console.log('🔍 Raw variants data:', variants);
        console.log('🔍 Type of variants:', typeof variants);
        console.log('🔍 All request body keys:', Object.keys(req.body));

        // Parse variants if it's a string
        let parsedVariants = [];
        if (variants) {
            try {
                if (typeof variants === 'string') {
                    parsedVariants = JSON.parse(variants);
                } else if (Array.isArray(variants)) {
                    parsedVariants = variants.map(v => typeof v === 'string' ? JSON.parse(v) : v);
                } else {
                    parsedVariants = [variants];
                }
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
            mainImage = '/images/products/' + req.files.mainImage[0].filename;
        }

        // Normalize status: form có thể gửi 'out_of_stock'/'discontinued' nhưng DB chỉ chấp nhận 'active'/'inactive'
        let normalizedStatus = status || 'active';
        if (normalizedStatus !== 'active' && normalizedStatus !== 'inactive') {
            normalizedStatus = normalizedStatus === 'out_of_stock' || normalizedStatus === 'discontinued' ? 'inactive' : 'active';
        }

        // Start transaction
        await req.sequelize.query('START TRANSACTION');

        try {
            // Insert product
            const insertResult = await req.sequelize.query(`
                INSERT INTO products (name, description, category_id, price, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
            `, {
                replacements: [
                    productName,
                    description || '',
                    category,
                    price,
                    normalizedStatus
                ]
            });

            console.log('🔍 INSERT result:', JSON.stringify(insertResult));

            // Lấy ID sản phẩm vừa thêm - dùng LAST_INSERT_ID() vì đáng tin cậy nhất trên MariaDB/XAMPP
            const [lastIdResult] = await req.sequelize.query('SELECT LAST_INSERT_ID() as id');
            const productId = lastIdResult[0]?.id || lastIdResult[0]?.['LAST_INSERT_ID()'];

            console.log('🔍 Product ID from LAST_INSERT_ID:', productId);

            // Tự động tạo SKU sau khi có ID
            await req.sequelize.query(`
                UPDATE products SET sku = ? WHERE id = ?
            `, {
                replacements: [`PRD${productId}`, productId]
            });
            logger.info('Product inserted with ID:', productId);
            console.log('✅ Product inserted with ID:', productId);

            // Insert main image
            if (mainImage) {
                await req.sequelize.query(`
                    INSERT INTO product_images (product_id, image_url, is_primary, created_at)
                    VALUES (?, ?, 1, CURRENT_TIMESTAMP())
                `, {
                    replacements: [productId, mainImage]
                });
                console.log('✅ Main image inserted');
            }

            // Insert additional images from file uploads
            if (req.files && req.files.additionalImages) {
                for (const file of req.files.additionalImages) {
                    await req.sequelize.query(`
                        INSERT INTO product_images (product_id, image_url, is_primary, created_at)
                        VALUES (?, ?, 0, CURRENT_TIMESTAMP())
                    `, {
                        replacements: [productId, '/images/products/' + file.filename]
                    });
                }
            }

            // Insert additional images from URLs (textarea)
            if (additionalImageUrls) {
                const urls = additionalImageUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0);
                for (const url of urls) {
                    await req.sequelize.query(`
                        INSERT INTO product_images (product_id, image_url, is_primary, created_at)
                        VALUES (?, ?, 0, CURRENT_TIMESTAMP())
                    `, {
                        replacements: [productId, url]
                    });
                }
                console.log(`✅ ${urls.length} additional images inserted from URLs`);
            }

            // Insert variants and calculate total stock
            let totalStock = 0;
            if (parsedVariants && parsedVariants.length > 0) {
                for (const variant of parsedVariants) {
                    // Hỗ trợ cả property names
                    const sizeIdInt = parseInt(variant.sizeId || variant.size_id);
                    const colorIdInt = parseInt(variant.colorId || variant.color_id);
                    const stockInt = parseInt(variant.stock || variant.stock_quantity || 0);
                    const variantSku = variant.variantSku || variant.sku;
                    const priceAdj = variant.priceAdjustment || variant.price_adjustment || 0;

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
                                priceAdj
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
            console.log('✅ === ADD PRODUCT COMPLETE ===');

            // Nếu request từ form (Accept HTML) → redirect, nếu AJAX → JSON
            const acceptHeader = req.headers['accept'] || '';
            if (acceptHeader.includes('application/json')) {
                res.json({
                    success: true,
                    message: 'Thêm sản phẩm thành công',
                    productId: productId
                });
            } else {
                res.redirect('/admin/products');
            }

        } catch (error) {
            await req.sequelize.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        logger.error('Error adding product:', error);
        console.error('❌ Error adding product:', error.message);
        const acceptHeader = req.headers['accept'] || '';
        if (acceptHeader.includes('application/json')) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi thêm sản phẩm: ' + error.message
            });
        } else {
            res.redirect('/admin/products/add?error=' + encodeURIComponent(error.message));
        }
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
        const [products] = await req.sequelize.query(`
            SELECT p.*, c.name as category_name,
                   COALESCE(
                       (SELECT SUM(pv.stock_quantity) 
                        FROM product_variants pv 
                        WHERE pv.product_id = p.id), 
                       0
                   ) as calculated_stock
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, {
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

// Update product POST - Hỗ trợ cả JSON, multipart/form-data và URL-encoded
router.post('/products/edit/:id', adminAuth, (req, res, next) => {
    // Nếu request là JSON hoặc URL-encoded, skip multer
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded')) {
        return next();
    }
    // Nếu là multipart, dùng multer để parse
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'additionalImages', maxCount: 5 }
    ])(req, res, next);
}, async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            productName,
            description,
            category,
            price,
            sku,
            status,
            variants_json,
            existing_variants_json,
            deleted_variants_json
        } = req.body;

        const keptAdditionalImageUrls = req.body['keptAdditionalImageUrls[]'];

        let variants = [];
        let existing_variants = [];
        let deleted_variants = [];

        try { if (variants_json) variants = JSON.parse(variants_json); } catch (e) { console.error('Parse variants error', e); }
        try { if (existing_variants_json) existing_variants = JSON.parse(existing_variants_json); } catch (e) { console.error('Parse existing variants error', e); }
        try { if (deleted_variants_json) deleted_variants = JSON.parse(deleted_variants_json); } catch (e) { console.error('Parse deleted variants error', e); }

        console.log('🔄 === UPDATE PRODUCT DEBUG ===');
        console.log('📝 Product ID:', productId);
        console.log('📝 Content-Type:', req.headers['content-type']);
        console.log('📝 Request body keys:', Object.keys(req.body).join(','));
        console.log('📝 productName:', productName);
        console.log('📦 Variants parsed:', variants.length);
        console.log('📦 Existing variants parsed:', existing_variants.length);
        console.log('🗑️ Deleted variants parsed:', deleted_variants.length);
        console.log('🖼️ keptAdditionalImages:', keptAdditionalImageUrls);

        // Normalize status: form có thể gửi 'out_of_stock'/'discontinued' nhưng DB chỉ chấp nhận 'active'/'inactive'
        let normalizedStatus = status || 'active';
        if (normalizedStatus !== 'active' && normalizedStatus !== 'inactive') {
            normalizedStatus = normalizedStatus === 'out_of_stock' || normalizedStatus === 'discontinued' ? 'inactive' : 'active';
        }

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
                    description || '',
                    category,
                    price,
                    sku || `PRD${productId}`,
                    normalizedStatus,
                    productId
                ]
            });
            console.log('✅ Product basic info updated');

            // Handle main image file update
            if (req.files && req.files.mainImage && req.files.mainImage.length > 0) {
                const mainImageUrl = '/images/products/' + req.files.mainImage[0].filename;
                // Check if primary image exists
                const [existingImages] = await req.sequelize.query(
                    'SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1',
                    { replacements: [productId] }
                );
                if (existingImages.length > 0) {
                    await req.sequelize.query(
                        'UPDATE product_images SET image_url = ? WHERE product_id = ? AND is_primary = 1',
                        { replacements: [mainImageUrl, productId] }
                    );
                } else {
                    await req.sequelize.query(
                        'INSERT INTO product_images (product_id, image_url, is_primary, created_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP())',
                        { replacements: [productId, mainImageUrl] }
                    );
                }
                console.log('✅ Main image updated to:', mainImageUrl);
            }

            // Dọn dẹp data cũ lỗi (nhiều ảnh is_primary = 1)
            const [primaryImages] = await req.sequelize.query(
                'SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1 ORDER BY id ASC LIMIT 1',
                { replacements: [productId] }
            );

            if (primaryImages.length > 0) {
                const primaryId = primaryImages[0].id;
                await req.sequelize.query(
                    'UPDATE product_images SET is_primary = 0 WHERE product_id = ? AND id != ?',
                    { replacements: [productId, primaryId] }
                );
            }

            // Xóa tất cả ảnh phụ (is_primary = 0) trước
            await req.sequelize.query(
                'DELETE FROM product_images WHERE product_id = ? AND (is_primary = 0 OR is_primary IS NULL)',
                { replacements: [productId] }
            );
            console.log('✅ Old additional images deleted from DB');

            // Re-insert kept images
            if (keptAdditionalImageUrls) {
                const keptUrls = Array.isArray(keptAdditionalImageUrls) ? keptAdditionalImageUrls : [keptAdditionalImageUrls];
                for (const url of keptUrls) {
                    if (url && url.trim()) {
                        await req.sequelize.query(
                            'INSERT INTO product_images (product_id, image_url, is_primary, created_at) VALUES (?, ?, 0, CURRENT_TIMESTAMP())',
                            { replacements: [productId, url.trim()] }
                        );
                    }
                }
                console.log(`✅ ${keptUrls.length} kept additional images re-inserted`);
            }

            // Insert new uploaded additional images
            if (req.files && req.files.additionalImages && req.files.additionalImages.length > 0) {
                for (const file of req.files.additionalImages) {
                    const imageUrl = '/images/products/' + file.filename;
                    await req.sequelize.query(
                        'INSERT INTO product_images (product_id, image_url, is_primary, created_at) VALUES (?, ?, 0, CURRENT_TIMESTAMP())',
                        { replacements: [productId, imageUrl] }
                    );
                }
                console.log(`✅ ${req.files.additionalImages.length} new additional images uploaded & inserted`);
            }

            // Handle deleted variants
            if (deleted_variants && deleted_variants.length > 0) {
                const deletedVariantIds = Array.isArray(deleted_variants) ? deleted_variants : [deleted_variants];
                for (const variantId of deletedVariantIds) {
                    await req.sequelize.query('DELETE FROM product_variants WHERE id = ?', {
                        replacements: [variantId]
                    });
                }
                console.log('✅ Deleted variants:', deletedVariantIds);
            }

            // Handle existing variants updates
            if (existing_variants && existing_variants.length > 0) {
                let existingVariantsArray = Array.isArray(existing_variants) ? existing_variants : [existing_variants];

                // Parse string items nếu cần
                existingVariantsArray = existingVariantsArray.map(v => {
                    if (typeof v === 'string') {
                        try { return JSON.parse(v); } catch (e) { return v; }
                    }
                    return v;
                });

                for (const variant of existingVariantsArray) {
                    // Hỗ trợ cả property names từ DB (stock_quantity, sku) và từ form (stock, variantSku)
                    const variantId = parseInt(variant.id);
                    const stockInt = parseInt(variant.stock_quantity || variant.stock || 0);
                    const variantSku = variant.sku || variant.variantSku || `VAR${productId}${variantId}`;
                    const priceAdj = variant.price_adjustment || variant.priceAdjustment || 0;

                    if (variantId) {
                        await req.sequelize.query(`
                            UPDATE product_variants 
                            SET stock_quantity = ?, sku = ?, price_adjustment = ?, updated_at = CURRENT_TIMESTAMP()
                            WHERE id = ?
                        `, {
                            replacements: [stockInt, variantSku, priceAdj, variantId]
                        });
                        console.log(`✅ Updated existing variant id=${variantId}, stock=${stockInt}`);
                    }
                }
            }

            // Handle new variants
            if (variants) {
                let parsedVariants = [];
                try {
                    if (typeof variants === 'string') {
                        parsedVariants = JSON.parse(variants);
                    } else if (Array.isArray(variants)) {
                        parsedVariants = variants.map(v => typeof v === 'string' ? JSON.parse(v) : v);
                    } else {
                        parsedVariants = [variants];
                    }
                } catch (parseError) {
                    console.log('❌ Error parsing variants:', parseError.message);
                    parsedVariants = [];
                }

                console.log('📦 Parsed new variants:', JSON.stringify(parsedVariants));

                for (const variant of parsedVariants) {
                    const sizeIdInt = parseInt(variant.sizeId || variant.size_id);
                    const colorIdInt = parseInt(variant.colorId || variant.color_id);
                    const stockInt = parseInt(variant.stock || variant.stock_quantity || 0);
                    const variantSku = variant.variantSku || variant.sku || `VAR${productId}${sizeIdInt}${colorIdInt}`;
                    const priceAdj = variant.priceAdjustment || variant.price_adjustment || 0;

                    if (sizeIdInt && colorIdInt) {
                        console.log(`📦 Adding variant: size=${sizeIdInt}, color=${colorIdInt}, stock=${stockInt}`);

                        // Dùng INSERT ... ON DUPLICATE KEY UPDATE để tránh lỗi unique constraint
                        await req.sequelize.query(`
                            INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity, sku, price_adjustment, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
                            ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity), sku = VALUES(sku), price_adjustment = VALUES(price_adjustment), updated_at = CURRENT_TIMESTAMP()
                        `, {
                            replacements: [
                                productId,
                                sizeIdInt,
                                colorIdInt,
                                stockInt,
                                variantSku,
                                priceAdj
                            ]
                        });
                        console.log(`✅ Variant added/updated successfully`);
                    } else {
                        console.log(`⚠️ Skipping invalid variant: sizeId=${sizeIdInt}, colorId=${colorIdInt}`);
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
            console.log(`✅ Total stock updated to ${totalStock}`);

            await req.sequelize.query('COMMIT');
            console.log('✅ === UPDATE PRODUCT COMPLETE ===');

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
        console.error('❌ Error updating product:', error.message);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sản phẩm: ' + error.message
        });
    }
});

// Quản lý Mã Giảm Giá
router.get('/coupons', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const [countResult] = await req.sequelize.query('SELECT COUNT(*) as count FROM coupons');
        const totalItems = countResult[0].count;
        const totalPages = Math.ceil(totalItems / limit);

        const [coupons] = await req.sequelize.query(`
            SELECT * FROM coupons 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, { replacements: [limit, offset] });

        res.render('admin-coupons', {
            coupons: coupons,
            user: req.session.user,
            activePage: 'coupons',
            pagination: { page, limit, totalItems, totalPages },
            messages: {
                error: req.query.error,
                success: req.query.success ? 'Cập nhật mã giảm giá thành công!' : null
            }
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách coupons:', error);
        res.status(500).send('Lỗi máy chủ');
    }
});

router.post('/coupons/add', adminAuth, async (req, res) => {
    try {
        let { code, discount_type, discount_value, min_purchase_amount, valid_from, valid_until, usage_limit, is_active } = req.body;

        const formatDateTime = (dt) => {
            if (!dt) return null;
            return dt.replace('T', ' ') + (dt.length === 16 ? ':00' : '');
        };

        const parsedDiscountValue = parseFloat(discount_value);

        // Validation: Percentage discount cannot be greater than 100%
        if (discount_type === 'percent' && parsedDiscountValue > 100) {
            return res.redirect('/admin/coupons?error=' + encodeURIComponent('Mức giảm phần trăm không được lớn hơn 100%'));
        }

        const formattedValidFrom = formatDateTime(valid_from);
        const formattedValidUntil = formatDateTime(valid_until);

        // Validation: Start date must be before end date
        if (formattedValidFrom && formattedValidUntil && new Date(formattedValidFrom) >= new Date(formattedValidUntil)) {
            return res.redirect('/admin/coupons?error=' + encodeURIComponent('Ngày bắt đầu phải trước ngày kết thúc'));
        }

        valid_from = formattedValidFrom;
        valid_until = formattedValidUntil;
        usage_limit = usage_limit ? parseInt(usage_limit) : null;
        min_purchase_amount = min_purchase_amount ? parseFloat(min_purchase_amount) : 0;

        await req.sequelize.query(`
            INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, valid_from, valid_until, usage_limit, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [code.toUpperCase(), discount_type, parsedDiscountValue, min_purchase_amount, valid_from, valid_until, usage_limit, is_active === '1']
        });

        res.redirect('/admin/coupons?success=1');
    } catch (error) {
        console.error('Lỗi thêm coupon:', error);
        res.redirect('/admin/coupons?error=' + encodeURIComponent(error.message));
    }
});

router.post('/coupons/edit/:id', adminAuth, async (req, res) => {
    try {
        let { discount_type, discount_value, min_purchase_amount, valid_from, valid_until, usage_limit, is_active } = req.body;

        const formatDateTime = (dt) => {
            if (!dt) return null;
            return dt.replace('T', ' ') + (dt.length === 16 ? ':00' : '');
        };

        const parsedDiscountValue = parseFloat(discount_value);

        // Validation: Percentage discount cannot be greater than 100%
        if (discount_type === 'percent' && parsedDiscountValue > 100) {
            return res.redirect('/admin/coupons?error=' + encodeURIComponent('Mức giảm phần trăm không được lớn hơn 100%'));
        }

        const formattedValidFrom = formatDateTime(valid_from);
        const formattedValidUntil = formatDateTime(valid_until);

        // Validation: Start date must be before end date
        if (formattedValidFrom && formattedValidUntil && new Date(formattedValidFrom) >= new Date(formattedValidUntil)) {
            return res.redirect('/admin/coupons?error=' + encodeURIComponent('Ngày bắt đầu phải trước ngày kết thúc'));
        }

        valid_from = formattedValidFrom;
        valid_until = formattedValidUntil;
        usage_limit = usage_limit ? parseInt(usage_limit) : null;
        min_purchase_amount = min_purchase_amount ? parseFloat(min_purchase_amount) : 0;

        await req.sequelize.query(`
            UPDATE coupons 
            SET discount_type = ?, discount_value = ?, min_purchase_amount = ?, valid_from = ?, valid_until = ?, usage_limit = ?, is_active = ?
            WHERE id = ?
        `, {
            replacements: [discount_type, parsedDiscountValue, min_purchase_amount, valid_from, valid_until, usage_limit, is_active === '1', req.params.id]
        });

        res.redirect('/admin/coupons?success=1');
    } catch (error) {
        console.error('Lỗi sửa coupon:', error);
        res.redirect('/admin/coupons?error=' + encodeURIComponent(error.message));
    }
});

router.post('/coupons/delete/:id', adminAuth, async (req, res) => {
    try {
        await req.sequelize.query('DELETE FROM coupons WHERE id = ?', {
            replacements: [req.params.id]
        });
        res.redirect('/admin/coupons');
    } catch (error) {
        console.error('Lỗi xóa coupon:', error);
        res.redirect('/admin/coupons');
    }
});

// Bulk delete coupons
router.post('/coupons/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có mã giảm giá nào được chọn' });
        }
        await req.sequelize.query('DELETE FROM coupons WHERE id IN (?)', {
            replacements: [ids]
        });
        res.json({ success: true, message: 'Đã xóa các mã giảm giá được chọn' });
    } catch (error) {
        console.error('Lỗi bulk delete coupons:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa mã giảm giá', error: error.message });
    }
});

// Bulk delete orders
router.post('/orders/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có đơn hàng nào được chọn' });
        }
        await req.sequelize.query('DELETE FROM order_items WHERE order_id IN (?)', {
            replacements: [ids]
        });
        await req.sequelize.query('DELETE FROM orders WHERE id IN (?)', {
            replacements: [ids]
        });
        res.json({ success: true, message: 'Đã xóa các đơn hàng được chọn' });
    } catch (error) {
        console.error('Lỗi bulk delete orders:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa đơn hàng', error: error.message });
    }
});

// Bulk delete customers
router.post('/customers/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có khách hàng nào được chọn' });
        }

        await req.sequelize.query('DELETE FROM users WHERE id IN (?) AND role = "user"', {
            replacements: [ids]
        });
        res.json({ success: true, message: 'Đã xóa các khách hàng được chọn' });
    } catch (error) {
        console.error('Lỗi bulk delete customers:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa khách hàng', error: error.message });
    }
});

// GET Contact Messages list
router.get('/contacts', adminAuth, async (req, res) => {
    try {
        const statusFilter = req.query.status || 'all';
        const searchQuery = req.query.search || '';

        let query = 'SELECT * FROM contact_messages WHERE 1=1';
        const replacements = [];

        if (statusFilter !== 'all') {
            query += ' AND status = ?';
            replacements.push(statusFilter);
        }

        if (searchQuery) {
            query += ' AND (full_name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)';
            const wildcard = `%${searchQuery}%`;
            replacements.push(wildcard, wildcard, wildcard, wildcard);
        }

        query += ' ORDER BY created_at DESC';

        const [contacts] = await req.sequelize.query(query, { replacements });

        res.render('admin-contacts', {
            contacts,
            statusFilter,
            searchQuery,
            activePage: 'contacts',
            user: req.session.user,
            title: 'Quản lý phản hồi khách hàng'
        });
    } catch (error) {
        console.error('Error loading contact messages:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải danh sách phản hồi' });
    }
});

// POST mark contact message as read/unread
router.post('/contacts/toggle-status/:id', adminAuth, async (req, res) => {
    try {
        const messageId = req.params.id;
        
        // Get current status
        const [messages] = await req.sequelize.query('SELECT status FROM contact_messages WHERE id = ?', {
            replacements: [messageId]
        });

        if (messages.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phản hồi' });
        }

        const newStatus = messages[0].status === 'unread' ? 'read' : 'unread';

        await req.sequelize.query('UPDATE contact_messages SET status = ?, updated_at = NOW() WHERE id = ?', {
            replacements: [newStatus, messageId]
        });

        res.json({ success: true, message: 'Đã cập nhật trạng thái', newStatus });
    } catch (error) {
        console.error('Error toggling contact status:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật trạng thái' });
    }
});

// POST delete contact message
router.post('/contacts/delete/:id', adminAuth, async (req, res) => {
    try {
        const messageId = req.params.id;

        await req.sequelize.query('DELETE FROM contact_messages WHERE id = ?', {
            replacements: [messageId]
        });

        res.json({ success: true, message: 'Đã xóa phản hồi thành công' });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xóa phản hồi' });
    }
});

// POST bulk delete contact messages
router.post('/contacts/bulk-delete', adminAuth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có phản hồi nào được chọn' });
        }

        await req.sequelize.query('DELETE FROM contact_messages WHERE id IN (?)', {
            replacements: [ids]
        });

        res.json({ success: true, message: 'Đã xóa các phản hồi được chọn' });
    } catch (error) {
        console.error('Error bulk deleting contact messages:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xóa phản hồi' });
    }
});

module.exports = router;
