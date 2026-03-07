const session = require('express-session');

// Session middleware
const sessionMiddleware = session({
    secret: 'ddawng-store-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
});

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    console.log('🔐 Admin auth check for:', req.url);
    console.log('📊 Session data:', {
        hasSession: !!req.session,
        adminId: req.session?.adminId,
        adminName: req.session?.adminName,
        isAdmin: req.session?.isAdmin,
        sessionId: req.sessionID
    });
    
    if (!req.session || !req.session.isAdmin) {
        console.log('❌ Admin auth failed - redirecting to login');
        return res.redirect('/admin/login');
    }
    
    console.log('✅ Admin auth successful');
    next();
};

// Customer authentication middleware
const customerAuth = (req, res, next) => {
    if (!req.session || !req.session.customerId) {
        return res.redirect('/customer/login');
    }
    next();
};

// Debug middleware
const debugMiddleware = (req, res, next) => {
    if (req.method === 'POST' && req.url.includes('/admin/products')) {
        console.log('🔍 Debug - POST request received:');
        console.log('  - URL:', req.url);
        console.log('  - Method:', req.method);
        console.log('  - Headers:', req.headers);
        console.log('  - Content-Type:', req.get('Content-Type'));
        console.log('  - Body keys:', Object.keys(req.body));
        console.log('  - Body:', req.body);
    }
    next();
};

module.exports = {
    sessionMiddleware,
    adminAuth,
    customerAuth,
    debugMiddleware
};
