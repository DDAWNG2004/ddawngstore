const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { customerAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Multer config for avatar upload
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + req.session.customerId + '-' + Date.now() + ext);
    }
});
const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép file hình ảnh'), false);
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Customer Login Page
router.get('/login', (req, res) => {
    res.render('customer-login', {
        error: null,
        success: null
    });
});

// Customer Login POST
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('customer-login', {
                error: 'Vui lòng nhập email và mật khẩu',
                success: null
            });
        }

        // Tìm customer trong database
        const [customers] = await req.sequelize.query(`
            SELECT id, full_name, email, password_hash FROM users WHERE email = ? AND role = 'user'
        `, {
            replacements: [email]
        });

        if (customers.length === 0) {
            return res.render('customer-login', {
                error: 'Email hoặc mật khẩu không đúng',
                success: null
            });
        }

        const customer = customers[0];

        // Kiểm tra password (đơn giản, trong thực tế nên dùng bcrypt)
        if (customer.password_hash !== password) {
            return res.render('customer-login', {
                error: 'Email hoặc mật khẩu không đúng',
                success: null
            });
        }

        // Lưu session cho customer
        req.session.customerId = customer.id;
        req.session.customerName = customer.full_name;

        res.redirect('/');
    } catch (error) {
        console.error('Customer login error:', error);
        res.render('customer-login', {
            error: 'Đã có lỗi xảy ra, vui lòng thử lại',
            success: null
        });
    }
});

// Customer Register Page
router.get('/register', (req, res) => {
    res.render('customer-register', {
        error: null,
        success: null
    });
});

// Customer Register POST
router.post('/register', async (req, res) => {
    console.log('📝 Register request received');
    console.log('📝 Request body:', req.body);

    try {
        const { name, email, password, confirmPassword, phone } = req.body;

        console.log('📊 Parsed data:', { name, email, phone, hasPassword: !!password, hasConfirmPassword: !!confirmPassword });

        // Validation
        if (!name || !email || !password) {
            console.log('❌ Validation failed: missing required fields');
            return res.render('customer-register', {
                error: 'Vui lòng điền đầy đủ thông tin',
                success: null
            });
        }

        if (password !== confirmPassword) {
            console.log('❌ Validation failed: passwords do not match');
            return res.render('customer-register', {
                error: 'Mật khẩu xác nhận không khớp',
                success: null
            });
        }

        if (password.length < 6) {
            console.log('❌ Validation failed: password too short');
            return res.render('customer-register', {
                error: 'Mật khẩu phải có ít nhất 6 ký tự',
                success: null
            });
        }

        console.log('✅ Validation passed, checking existing email...');

        // Kiểm tra email đã tồn tại
        const [existingCustomers] = await req.sequelize.query(`
            SELECT id FROM users WHERE email = ? AND role = 'user'
        `, {
            replacements: [email]
        });

        console.log('📧 Existing customers check:', existingCustomers.length);

        if (existingCustomers.length > 0) {
            console.log('❌ Email already exists');
            return res.render('customer-register', {
                error: 'Email này đã được đăng ký',
                success: null
            });
        }

        console.log('✅ Email is unique, creating new customer...');

        // Tạo customer mới
        const [result] = await req.sequelize.query(`
            INSERT INTO users (username, full_name, email, password_hash, phone, role, is_active, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, 'user', 1, NOW(), NOW())
        `, {
            replacements: [email.split('@')[0], name, email, password, phone || null]
        });

        console.log('👤 Customer created:', result);

        // Lưu session
        const customerId = result.insertId || result[0];
        req.session.customerId = customerId;
        req.session.customerName = name;

        console.log('🔐 Session saved for customer ID:', customerId);

        res.render('customer-register', {
            error: null,
            success: 'Đăng ký thành công! Vui lòng đăng nhập.'
        });

    } catch (error) {
        console.error('❌ Register error:', error);
        console.error('❌ Error stack:', error.stack);
        res.render('customer-register', {
            error: 'Đã có lỗi xảy ra, vui lòng thử lại',
            success: null
        });
    }
});

// Customer Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/customer/profile');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Customer Profile
router.get('/profile', async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.redirect('/customer/login');
    }

    try {
        const [customers] = await req.sequelize.query(`
            SELECT id, username, full_name, email, phone, address, avatar, created_at, updated_at
            FROM users 
            WHERE id = ? AND role = 'user'
        `, {
            replacements: [req.session.customerId]
        });

        if (customers.length === 0) {
            return res.redirect('/customer/login');
        }

        const customer = customers[0];

        // Get customer orders
        const [orders] = await req.sequelize.query(`
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, {
            replacements: [req.session.customerId]
        });

        res.render('customer-profile', {
            customer: customer,
            orders: orders || []
        });
    } catch (error) {
        console.error('Error loading customer profile:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải thông tin tài khoản' });
    }
});

// Customer Orders
router.get('/orders', async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.redirect('/customer/login');
    }

    try {
        const [customers] = await req.sequelize.query(`
            SELECT id, username, full_name, email, phone, address, avatar, created_at, updated_at
            FROM users 
            WHERE id = ? AND role = 'user'
        `, {
            replacements: [req.session.customerId]
        });

        const customer = customers.length > 0 ? customers[0] : { id: req.session.customerId, name: req.session.customerName };

        const [orders] = await req.sequelize.query(`
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, {
            replacements: [req.session.customerId]
        });

        if (orders && orders.length > 0) {
            const orderIds = orders.map(o => o.id);
            const [orderItems] = await req.sequelize.query(`
                SELECT oi.*, 
                   (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND is_primary = 1 LIMIT 1) as image_url
                FROM order_items oi 
                WHERE order_id IN (?)
            `, {
                replacements: [orderIds]
            });

            orders.forEach(order => {
                order.items = orderItems.filter(item => item.order_id === order.id);
            });
        }

        res.render('customer-orders', {
            customer: customer,
            orders: orders || []
        });
    } catch (error) {
        console.error('Error loading customer orders:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải danh sách đơn hàng' });
    }
});

// Cancel Order
router.post('/orders/:id/cancel', async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.json({ success: false, message: 'Vui lòng đăng nhập' });
    }

    try {
        const orderId = req.params.id;
        const customerId = req.session.customerId;

        // Cần đảm bảo order này thuộc về user và đang ở trạng thái pending
        const [orders] = await req.sequelize.query(`
            SELECT id, status FROM orders WHERE id = ? AND user_id = ?
        `, { replacements: [orderId, customerId] });

        if (orders.length === 0) {
            return res.json({ success: false, message: 'Đơn hàng không tồn tại hoặc không có quyền truy cập.' });
        }

        if (orders[0].status !== 'pending') {
            return res.json({ success: false, message: 'Chỉ có thể hủy đơn hàng ở trạng thái Đang chờ xử lý.' });
        }

        // Lấy lại các items trong đơn hàng để ROLLBACK Tồn kho
        const [orderItems] = await req.sequelize.query(`
            SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?
        `, { replacements: [orderId] });

        await req.sequelize.query('START TRANSACTION');

        // Đổi trạng thái Huỷ
        await req.sequelize.query(`
            UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?
        `, { replacements: [orderId] });

        // Rollback lại số lượng tồn kho (Stock)
        for (const item of orderItems) {
            // Hoàn lại cho product_variants (nếu có)
            if (item.variant_id) {
                await req.sequelize.query(`
                    UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?
                `, { replacements: [item.quantity, item.variant_id] });
            }
            // Hoàn lại cho products
            await req.sequelize.query(`
                UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?
            `, { replacements: [item.quantity, item.product_id] });
        }

        await req.sequelize.query('COMMIT');

        res.json({ success: true, message: 'Hủy đơn hàng thành công và Đã hoàn trả tồn kho.' });
    } catch (error) {
        await req.sequelize.query('ROLLBACK');
        console.error('Error cancelling order:', error);
        res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra khi hủy đơn.' });
    }
});

// Customer Settings
router.get('/settings', async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.redirect('/customer/login');
    }

    try {
        const [customers] = await req.sequelize.query(`
            SELECT id, username, full_name, email, phone, address, avatar, created_at, updated_at
            FROM users 
            WHERE id = ? AND role = 'user'
        `, {
            replacements: [req.session.customerId]
        });

        if (customers.length === 0) {
            return res.redirect('/customer/login');
        }

        res.render('customer-settings', {
            customer: customers[0]
        });
    } catch (error) {
        console.error('Error loading customer settings:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải cài đặt tài khoản' });
    }
});

// Update Customer Profile
router.post('/profile', async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.redirect('/customer/login');
    }

    try {
        const { fullName, phone, address } = req.body;

        // Update customer information
        await req.sequelize.query(`
            UPDATE users 
            SET full_name = ?, phone = ?, address = ?, updated_at = NOW()
            WHERE id = ? AND role = 'user'
        `, {
            replacements: [fullName, phone, address, req.session.customerId]
        });

        // Update session name
        req.session.customerName = fullName;

        res.redirect('/customer/profile?success=1');
    } catch (error) {
        console.error('Error updating customer profile:', error);
        res.status(500).render('error', { message: 'Lỗi khi cập nhật thông tin' });
    }
});

// Upload Avatar
router.post('/profile/avatar', avatarUpload.single('avatar'), async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.redirect('/customer/login');
    }

    try {
        if (!req.file) {
            return res.redirect('/customer/profile?error=no_file');
        }

        const avatarPath = '/uploads/avatars/' + req.file.filename;

        // Xóa avatar cũ nếu có
        const [oldData] = await req.sequelize.query(
            'SELECT avatar FROM users WHERE id = ?',
            { replacements: [req.session.customerId] }
        );
        if (oldData[0] && oldData[0].avatar && oldData[0].avatar.startsWith('/uploads/avatars/')) {
            const oldPath = path.join(__dirname, '../../public', oldData[0].avatar);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Cập nhật avatar trong DB
        await req.sequelize.query(
            'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?',
            { replacements: [avatarPath, req.session.customerId] }
        );

        res.redirect('/customer/profile?success=avatar');
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.redirect('/customer/profile?error=upload');
    }
});

// Customer Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// Submit Product Review
router.post('/reviews/submit', async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.json({ success: false, message: 'Vui lòng đăng nhập' });
    }

    try {
        const { productId, orderId, rating, title, content } = req.body;
        const customerId = req.session.customerId;

        if (!productId || !rating || rating < 1 || rating > 5) {
            return res.json({ success: false, message: 'Dữ liệu đánh giá không hợp lệ' });
        }

        // Kiểm tra xem khách hàng có mua sản phẩm này trong đơn hàng tương ứng không
        const [orders] = await req.sequelize.query(`
            SELECT o.id, o.status 
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ? AND o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
        `, {
            replacements: [orderId, customerId, productId]
        });

        if (orders.length === 0) {
            return res.json({ success: false, message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đã được giao thành công.' });
        }

        // Kiểm tra xem đã đánh giá chưa (mỗi người 1 đánh giá trên 1 sản phẩm)
        // Hoặc có thể cho phép mỗi đơn hàng 1 đánh giá? Thường là 1 SP 1 đánh giá là đủ.
        const [existingReview] = await req.sequelize.query(`
            SELECT id FROM reviews WHERE product_id = ? AND user_id = ?
        `, {
            replacements: [productId, customerId]
        });

        if (existingReview.length > 0) {
            return res.json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi.' });
        }

        // Thêm đánh giá
        await req.sequelize.query(`
            INSERT INTO reviews (product_id, user_id, rating, title, content, is_verified, is_approved, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, 1, NOW(), NOW())
        `, {
            replacements: [productId, customerId, rating, title || null, content || null]
        });

        res.json({ success: true, message: 'Cảm ơn bạn đã đánh giá sản phẩm!' });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra khi gửi đánh giá.' });
    }
});

module.exports = router;
