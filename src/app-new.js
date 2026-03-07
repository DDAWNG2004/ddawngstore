const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { Sequelize, DataTypes } = require('sequelize');

// Import routes and middleware
const indexRoutes = require('./routes');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');
const { sessionMiddleware, adminAuth, customerAuth, debugMiddleware } = require('./middleware/auth');
const { testConnection } = require('./utils/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const sequelize = new Sequelize('ddawngstore', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log, // Enable logging for debugging
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Attach sequelize to request object for use in routes
app.use((req, res, next) => {
    req.sequelize = sequelize;
    next();
});

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Attach upload to request object
app.use((req, res, next) => {
    req.upload = upload;
    next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Session middleware
app.use(sessionMiddleware);

// Debug middleware
app.use(debugMiddleware);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);

// Debug route để test form data
app.post('/debug-form', upload.any(), (req, res) => {
    console.log('🔍 Debug form submission');
    console.log('📝 Request body:', req.body);
    console.log('📁 Request files:', req.files);
    res.json({ 
        message: 'Debug form received',
        body: req.body,
        files: req.files ? req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, size: f.size })) : []
    });
});

// Product management routes (POST routes that need file upload)
app.post('/admin/products/add', upload.any(), async (req, res) => {
    console.log('🔄 Add product request received');
    console.log('📝 Request body keys:', Object.keys(req.body));
    console.log('📝 Full request body:', req.body);
    console.log('📁 Uploaded files:', req.files);
    
    const transaction = await sequelize.transaction();
    try {
        const { productName, productCode, description, category, price, salePrice, stock, sku, status, variants } = req.body;
        
        console.log('📊 Parsed data:', {
            productName,
            productCode,
            category,
            price,
            sku,
            status,
            variants_count: variants ? (Array.isArray(variants) ? variants.length : 1) : 0
        });
        
        // Thêm sản phẩm mới
        const insertResult = await sequelize.query(`
            INSERT INTO products (name, description, price, category_id, stock_quantity, sku, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, {
            replacements: [productName, description, parseFloat(price), category || null, 0, sku || null, status || 'active'],
            transaction,
            type: Sequelize.QueryTypes.INSERT
        });
        
        const productId = insertResult[0];
        console.log('✅ Product added with ID:', productId);
        
        if (!productId) {
            throw new Error('Failed to get product ID after insertion');
        }
        
        // Xử lý hình ảnh chính
        let mainImageUrl = null;
        if (req.files && req.files.mainImage && req.files.mainImage.length > 0) {
            const mainImage = req.files.mainImage[0];
            mainImageUrl = `/uploads/${mainImage.filename}`;
            console.log('📸 Main image uploaded:', mainImageUrl);
            
            await sequelize.query(`
                INSERT INTO product_images (product_id, image_url, alt_text, is_primary)
                VALUES (?, ?, ?, ?)
            `, {
                replacements: [productId, mainImageUrl, productName, true],
                transaction
            });
        }
        
        // Xử lý hình ảnh bổ sung
        if (req.files && req.files.additionalImages && req.files.additionalImages.length > 0) {
            for (let i = 0; i < req.files.additionalImages.length; i++) {
                const additionalImage = req.files.additionalImages[i];
                const imageUrl = `/uploads/${additionalImage.filename}`;
                
                await sequelize.query(`
                    INSERT INTO product_images (product_id, image_url, alt_text, is_primary)
                    VALUES (?, ?, ?, ?)
                `, {
                    replacements: [productId, imageUrl, `${productName} - Hình ảnh ${i + 1}`, false],
                    transaction
                });
            }
        }
        
        // Xử lý variants
        if (variants) {
            const variantsArray = Array.isArray(variants) ? variants : [variants];
            console.log('📦 Processing variants:', variantsArray.length);
            
            for (const variantData of variantsArray) {
                try {
                    if (!variantData || variantData.trim() === '' || variantData === '{' || variantData === 'undefined') {
                        console.log('⚠️ Skipping empty or invalid variant data');
                        continue;
                    }
                    
                    const variant = JSON.parse(variantData);
                    
                    if (!variant.sizeId && !variant.size_id) {
                        console.log('⚠️ Skipping variant without size ID');
                        continue;
                    }
                    if (!variant.colorId && !variant.color_id) {
                        console.log('⚠️ Skipping variant without color ID');
                        continue;
                    }
                    
                    const variantSku = sku ? `${sku}-${variant.sizeName || variant.size_id}-${variant.colorName || variant.color_id}` : `PRD${productId}-${variant.sizeName || variant.size_id}-${variant.colorName || variant.color_id}`;
                    
                    await sequelize.query(`
                        INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity, sku)
                        VALUES (?, ?, ?, ?, ?)
                    `, {
                        replacements: [
                            productId, 
                            variant.sizeId || variant.size_id, 
                            variant.colorId || variant.color_id, 
                            parseInt(variant.stock_quantity || variant.stock || 0), 
                            variantSku
                        ],
                        transaction
                    });
                } catch (e) {
                    console.error('❌ Error processing variant:', variantData, e);
                }
            }
        }
        
        await transaction.commit();
        
        // Cập nhật lại tổng stock từ variants
        const [totalStock] = await sequelize.query(`
            SELECT SUM(stock_quantity) as total FROM product_variants WHERE product_id = ?
        `, {
            replacements: [productId]
        });
        
        const finalStock = totalStock[0]?.total || 0;
        
        await sequelize.query(`
            UPDATE products SET stock_quantity = ? WHERE id = ?
        `, {
            replacements: [finalStock, productId]
        });
        
        console.log('✅ Product stock updated to:', finalStock);
        
        res.redirect('/admin/products');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error adding product:', error);
        res.status(500).render('error', { message: 'Lỗi khi thêm sản phẩm: ' + error.message });
    }
});

// Test database connection route
app.get('/test-db', async (req, res) => {
    try {
        console.log('🔍 Testing database connection...');
        
        const result = await testConnection(sequelize);
        
        if (result.success) {
            // Test basic queries
            const [products] = await sequelize.query('SELECT COUNT(*) as count FROM products');
            const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
            const [orders] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
            
            res.json({
                success: true,
                message: result.message,
                stats: {
                    products: products[0]?.count || 0,
                    users: users[0]?.count || 0,
                    orders: orders[0]?.count || 0
                }
            });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('❌ Test database connection error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Sample data functions
const addSampleUsers = async () => {
    try {
        console.log('🔄 Adding sample users...');
        
        const sampleUsers = [
            { first_name: 'Nguyễn Văn An', last_name: '', email: 'an.nguyen@email.com', password: '123456', phone: '0912345678', role: 'customer' },
            { first_name: 'Trần Thị Bình', last_name: '', email: 'binh.tran@email.com', password: '123456', phone: '0923456789', role: 'customer' },
            { first_name: 'Lê Văn Cường', last_name: '', email: 'cuong.le@email.com', password: '123456', phone: '0934567890', role: 'customer' },
            { first_name: 'Admin', last_name: 'User', email: 'admin@ddawngstore.com', password: 'admin123', phone: '0901234567', role: 'admin' }
        ];
        
        for (const user of sampleUsers) {
            try {
                const [existing] = await sequelize.query(`
                    SELECT id FROM users WHERE email = ?
                `, {
                    replacements: [user.email]
                });
                
                if (existing.length === 0) {
                    await sequelize.query(`
                        INSERT INTO users (first_name, last_name, email, password, phone, role, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, NOW())
                    `, {
                        replacements: [user.first_name, user.last_name, user.email, user.password, user.phone, user.role]
                    });
                    console.log(`✅ Added user: ${user.email}`);
                } else {
                    console.log(`⚠️ User already exists: ${user.email}`);
                }
            } catch (error) {
                console.error(`❌ Error adding user ${user.email}:`, error);
            }
        }
        
        console.log('✅ Sample users process completed');
    } catch (error) {
        console.error('❌ Error in addSampleUsers:', error);
    }
};

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection(sequelize);
        
        // Add sample users
        await addSampleUsers();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`📁 Static files: ${path.join(__dirname, '../public')}`);
            console.log(`📁 Views: ${path.join(__dirname, '../views')}`);
            console.log(`🗄️ Database: ddawngstore`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    try {
        await sequelize.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Start the server
startServer();

module.exports = app;
