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
        // In production, you should verify: if (admin.password !== password) { ... }
        
        // Set admin session
        req.session.user = {
            id: admin.id,
            name: admin.name,
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

// Admin dashboard
router.get('/', adminAuth, (req, res) => {
    res.render('admin-dashboard', { 
        user: req.session.user,
        title: 'Admin Dashboard'
    });
});

// Products management page
router.get('/products', adminAuth, async (req, res) => {
    try {
        const [products] = await req.sequelize.query(`
            SELECT p.*, c.name as category_name 
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
        if (variants) {
            try {
                parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
            } catch (parseError) {
                logger.error('Error parsing variants:', parseError);
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
                INSERT INTO products (name, code, description, category_id, price, sku, status, featured, image_url, stock_quantity, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
            `, {
                replacements: [
                    productName,
                    productCode || `PRD${Date.now()}`,
                    description || '',
                    category,
                    price,
                    sku || `SKU${Date.now()}`,
                    status || 'active',
                    featured ? 1 : 0,
                    mainImage,
                    0 // stock_quantity - will be calculated from variants
                ]
            });

            const productId = result.insertId;
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
                    
                    if (sizeId && colorId && stock > 0) {
                        await req.sequelize.query(`
                            INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity, sku, price_adjustment, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
                        `, {
                            replacements: [
                                productId,
                                sizeId,
                                colorId,
                                stock,
                                variantSku || `VAR${productId}${sizeId}${colorId}`,
                                priceAdjustment || 0
                            ]
                        });
                        
                        totalStock += parseInt(stock);
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
                SET name = ?, code = ?, description = ?, category_id = ?, price = ?, 
                    sku = ?, status = ?, featured = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP()
                WHERE id = ?
            `, {
                replacements: [
                    productName,
                    productCode,
                    description,
                    category,
                    price,
                    sku,
                    status,
                    featured ? 1 : 0,
                    mainImageUrl,
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
                    await req.sequelize.query(`
                        UPDATE product_variants 
                        SET stock_quantity = ?, sku = ?, price_adjustment = ?, updated_at = CURRENT_TIMESTAMP()
                        WHERE id = ?
                    `, {
                        replacements: [stock, variantSku, priceAdjustment, id]
                    });
                }
            }

            // Handle new variants
            if (variants) {
                const parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants);
                for (const variant of parsedVariants) {
                    const { sizeId, colorId, stock, variantSku, priceAdjustment } = variant;
                    
                    if (sizeId && colorId && stock > 0) {
                        await req.sequelize.query(`
                            INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity, sku, price_adjustment, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
                        `, {
                            replacements: [
                                productId,
                                sizeId,
                                colorId,
                                stock,
                                variantSku || `VAR${productId}${sizeId}${colorId}`,
                                priceAdjustment || 0
                            ]
                        });
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
