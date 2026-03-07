const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { customerAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

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
            SELECT id, username, full_name, email, phone, address, created_at, updated_at
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
        const [orders] = await req.sequelize.query(`
            SELECT o.*, oi.product_name, oi.quantity, oi.price, oi.image_url
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? 
            ORDER BY o.created_at DESC
        `, {
            replacements: [req.session.customerId]
        });
        
        res.render('customer-orders', {
            orders: orders || []
        });
    } catch (error) {
        console.error('Error loading customer orders:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải danh sách đơn hàng' });
    }
});

// Customer Settings
router.get('/settings', async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.redirect('/customer/login');
    }
    
    try {
        const [customers] = await req.sequelize.query(`
            SELECT id, username, full_name, email, phone, address, created_at, updated_at
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

// Customer Wishlist
router.get('/wishlist', async (req, res) => {
    if (!req.session || !req.session.customerId) {
        return res.redirect('/customer/login');
    }
    
    try {
        // Get customer wishlist items
        const [wishlistItems] = await req.sequelize.query(`
            SELECT w.*, p.name, p.price, pi.image_url
            FROM wishlist w
            LEFT JOIN products p ON w.product_id = p.id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, {
            replacements: [req.session.customerId]
        });
        
        res.render('customer-wishlist', {
            wishlistItems: wishlistItems || []
        });
    } catch (error) {
        console.error('Error loading customer wishlist:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải danh sách yêu thích' });
    }
});

module.exports = router;
