const express = require('express');
const router = express.Router();

// Home page
router.get('/', async (req, res) => {
    console.log('🏠 Home page requested');
    try {
        const categoryId = req.query.category;
        
        let productsQuery = `
            SELECT p.*, c.name as category_name, pi.image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            WHERE p.status = 'active'
        `;
        
        let queryParams = [];
        
        if (categoryId) {
            productsQuery += ' AND p.category_id = ?';
            queryParams.push(categoryId);
        }
        
        productsQuery += ' ORDER BY p.created_at DESC LIMIT 12';
        
        const [products] = await req.sequelize.query(productsQuery, {
            replacements: queryParams
        });
        
        const [categories] = await req.sequelize.query(`
            SELECT * FROM categories WHERE status = 'active' ORDER BY name
        `);
        
        // Kiểm tra session khách hàng
        let customer = null;
        if (req.session && req.session.customerId) {
            try {
                const [customerData] = await req.sequelize.query(`
                    SELECT id, full_name, email, phone FROM users WHERE id = ? AND role = 'user'
                `, {
                    replacements: [req.session.customerId]
                });
                if (customerData.length > 0) {
                    const user = customerData[0];
                    customer = {
                        id: user.id,
                        name: user.full_name,
                        email: user.email,
                        phone: user.phone
                    };
                }
            } catch (error) {
                console.error('Error loading customer data:', error);
            }
        }
        
        // Get current category info if filtering
        let currentCategory = null;
        if (categoryId) {
            const [categoryData] = await req.sequelize.query(`
                SELECT * FROM categories WHERE id = ? AND status = 'active'
            `, {
                replacements: [categoryId]
            });
            if (categoryData.length > 0) {
                currentCategory = categoryData[0];
            }
        }
        
        console.log('📄 About to render home template...');
        console.log('📊 Template variables:', {
            productsCount: (products || []).length,
            categoriesCount: (categories || []).length,
            hasCustomer: !!customer,
            categoryId: categoryId,
            currentCategory: currentCategory
        });
        
        res.render('home', { 
            products: products || [],
            categories: categories || [],
            customer: customer,
            selectedCategory: categoryId,
            currentCategory: currentCategory
        });
        
        console.log('✅ Home template rendered successfully');
    } catch (error) {
        console.error('Error loading home page:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải trang chủ' });
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Product detail page
router.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        console.log('🔍 Loading product detail for ID:', productId);
        
        const [products] = await req.sequelize.query(`
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ? AND p.status = 'active'
        `, {
            replacements: [productId]
        });
        
        if (products.length === 0) {
            console.log('❌ Product not found:', productId);
            return res.status(404).render('error', { message: 'Sản phẩm không tồn tại' });
        }
        
        const product = products[0];
        console.log('✅ Found product:', product.name);
        
        // Get product images
        const [images] = await req.sequelize.query(`
            SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC
        `, {
            replacements: [productId]
        });
        
        // Get product variants
        const [variants] = await req.sequelize.query(`
            SELECT pv.*, s.name as size_name, s.description as size_description,
                   c.name as color_name, c.hex_code as color_hex
            FROM product_variants pv
            LEFT JOIN sizes s ON pv.size_id = s.id
            LEFT JOIN colors c ON pv.color_id = c.id
            WHERE pv.product_id = ? AND pv.stock_quantity > 0
        `, {
            replacements: [productId]
        });
        
        // Get related products
        const [relatedProducts] = await req.sequelize.query(`
            SELECT p.*, pi.image_url
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
            ORDER BY p.created_at DESC
            LIMIT 6
        `, {
            replacements: [product.category_id, productId]
        });
        
        // Kiểm tra session khách hàng
        let customer = null;
        if (req.session && req.session.customerId) {
            try {
                const [customerData] = await req.sequelize.query(`
                    SELECT id, full_name, email, phone FROM users WHERE id = ? AND role = 'user'
                `, {
                    replacements: [req.session.customerId]
                });
                if (customerData.length > 0) {
                    const user = customerData[0];
                    customer = {
                        id: user.id,
                        name: user.full_name,
                        email: user.email,
                        phone: user.phone
                    };
                }
            } catch (error) {
                console.error('Error loading customer data:', error);
            }
        }
        
        console.log('📄 About to render product-detail template...');
        console.log('📊 Template variables:', {
            hasProduct: !!product,
            imagesCount: (images || []).length,
            variantsCount: (variants || []).length,
            relatedCount: (relatedProducts || []).length,
            hasCustomer: !!customer
        });
        
        res.render('product-detail', {
            product: product,
            images: images || [],
            variants: variants || [],
            relatedProducts: relatedProducts || [],
            customer: customer
        });
        
        console.log('✅ Product detail template rendered successfully');
    } catch (error) {
        console.error('❌ Error loading product detail:', error);
        console.error('❌ Error details:', error.message);
        res.status(500).render('error', { message: 'Lỗi khi tải sản phẩm: ' + error.message });
    }
});

// Cart page
router.get('/cart', async (req, res) => {
    try {
        console.log('🛒 Loading cart page...');
        
        // Kiểm tra session khách hàng
        let customer = null;
        if (req.session && req.session.customerId) {
            try {
                const [customerData] = await req.sequelize.query(`
                    SELECT id, full_name, email, phone FROM users WHERE id = ? AND role = 'user'
                `, {
                    replacements: [req.session.customerId]
                });
                if (customerData.length > 0) {
                    const user = customerData[0];
                    customer = {
                        id: user.id,
                        name: user.full_name,
                        email: user.email,
                        phone: user.phone
                    };
                    console.log('✅ Found customer:', customer.name);
                }
            } catch (error) {
                console.error('Error loading customer data:', error);
            }
        }
        
        // Lấy dữ liệu giỏ hàng từ database
        let cartItems = [];
        if (customer) {
            console.log('📦 Loading cart items for customer:', customer.id);
            const [cartData] = await req.sequelize.query(`
                SELECT c.*, p.name as product_name, p.price as product_price, 
                       p.description, pi.image_url, pv.sku, pv.price_adjustment,
                       s.name as size_name, s.description as size_description,
                       col.name as color_name, col.hex_code as color_hex, cat.name as category_name
                FROM cart c
                LEFT JOIN products p ON c.product_id = p.id
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
                LEFT JOIN product_variants pv ON c.variant_id = pv.id
                LEFT JOIN sizes s ON pv.size_id = s.id
                LEFT JOIN colors col ON pv.color_id = col.id
                LEFT JOIN categories cat ON p.category_id = cat.id
                WHERE c.user_id = ?
                ORDER BY c.created_at DESC
            `, {
                replacements: [customer.id]
            });
            cartItems = cartData;
            console.log(`📊 Found ${cartItems.length} cart items`);
            
            // Debug first item
            if (cartItems.length > 0) {
                console.log('📦 First cart item:', {
                    id: cartItems[0].id,
                    product_id: cartItems[0].product_id,
                    product_name: cartItems[0].product_name,
                    quantity: cartItems[0].quantity,
                    variant_id: cartItems[0].variant_id
                });
            }
        } else {
            console.log('❌ No customer session found');
        }
        
        const [categories] = await req.sequelize.query(`
            SELECT * FROM categories WHERE status = 'active' ORDER BY name
        `);

        console.log('📄 Rendering cart template...');
        res.render('cart', { 
            products: cartItems,
            categories: categories || [],
            customer: customer
        });
        console.log('✅ Cart page rendered successfully');
    } catch (error) {
        console.error('❌ Error loading cart data:', error);
        console.error('❌ Error details:', error.message);
        res.render('cart', { 
            products: [],
            categories: [],
            customer: null
        });
    }
});

// Add to cart
router.post('/cart/add', async (req, res) => {
    try {
        console.log('🛒 Add to cart request received');
        
        // Kiểm tra user đã đăng nhập chưa
        if (!req.session || !req.session.customerId) {
            console.log('❌ User not logged in');
            return res.json({ 
                success: false, 
                message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                requiresLogin: true
            });
        }
        
        const { productId, quantity, variantId, sizeId, colorId } = req.body;
        
        console.log('📊 Cart data:', { productId, quantity, variantId, sizeId, colorId });
        
        // Validate input
        if (!productId || !quantity || quantity < 1) {
            return res.json({ 
                success: false, 
                message: 'Dữ liệu không hợp lệ' 
            });
        }
        
        // Kiểm tra sản phẩm tồn tại
        const [products] = await req.sequelize.query(`
            SELECT * FROM products WHERE id = ? AND status = 'active'
        `, {
            replacements: [productId]
        });
        
        if (products.length === 0) {
            return res.json({ 
                success: false, 
                message: 'Sản phẩm không tồn tại' 
            });
        }
        
        const product = products[0];
        
        // Kiểm tra variant nếu có
        let variant = null;
        if (variantId) {
            const [variants] = await req.sequelize.query(`
                SELECT * FROM product_variants WHERE id = ? AND product_id = ? AND stock_quantity > 0
            `, {
                replacements: [variantId, productId]
            });
            
            if (variants.length === 0) {
                return res.json({ 
                    success: false, 
                    message: 'Biến thể sản phẩm không tồn tại hoặc hết hàng' 
                });
            }
            
            variant = variants[0];
        }
        
        // Thêm vào giỏ hàng (database)
        const [existingCart] = await req.sequelize.query(`
            SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND variant_id = ?
        `, {
            replacements: [req.session.customerId, productId, variantId || null]
        });
        
        if (existingCart.length > 0) {
            // Cập nhật số lượng nếu đã có trong giỏ
            const newQuantity = existingCart[0].quantity + parseInt(quantity);
            
            await req.sequelize.query(`
                UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?
            `, {
                replacements: [newQuantity, existingCart[0].id]
            });
            
            console.log('✅ Updated cart item quantity:', newQuantity);
        } else {
            // Thêm mới vào giỏ hàng
            await req.sequelize.query(`
                INSERT INTO cart (user_id, product_id, variant_id, quantity, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            `, {
                replacements: [req.session.customerId, productId, variantId || null, parseInt(quantity)]
            });
            
            console.log('✅ Added new item to cart');
        }
        
        // Lấy tổng số lượng trong giỏ hàng
        const [cartCount] = await req.sequelize.query(`
            SELECT SUM(quantity) as total FROM cart WHERE user_id = ?
        `, {
            replacements: [req.session.customerId]
        });
        
        const totalItems = cartCount[0]?.total || 0;
        
        res.json({ 
            success: true, 
            message: 'Đã thêm sản phẩm vào giỏ hàng',
            cartCount: totalItems,
            productName: product.name
        });
        
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        res.json({ 
            success: false, 
            message: 'Lỗi khi thêm vào giỏ hàng: ' + error.message 
        });
    }
});

// Get cart count (AJAX)
router.get('/cart/count', async (req, res) => {
    try {
        if (!req.session || !req.session.customerId) {
            return res.json({ count: 0 });
        }
        
        const [cartCount] = await req.sequelize.query(`
            SELECT SUM(quantity) as total FROM cart WHERE user_id = ?
        `, {
            replacements: [req.session.customerId]
        });
        
        res.json({ count: cartCount[0]?.total || 0 });
    } catch (error) {
        console.error('❌ Error getting cart count:', error);
        res.json({ count: 0 });
    }
});

// Remove from cart
router.post('/cart/remove/:itemId', async (req, res) => {
    try {
        if (!req.session || !req.session.customerId) {
            return res.json({ 
                success: false, 
                message: 'Vui lòng đăng nhập' 
            });
        }
        
        const itemId = req.params.itemId;
        
        await req.sequelize.query(`
            DELETE FROM cart WHERE id = ? AND user_id = ?
        `, {
            replacements: [itemId, req.session.customerId]
        });
        
        // Lấy tổng số lượng mới
        const [cartCount] = await req.sequelize.query(`
            SELECT SUM(quantity) as total FROM cart WHERE user_id = ?
        `, {
            replacements: [req.session.customerId]
        });
        
        res.json({ 
            success: true, 
            message: 'Đã xóa sản phẩm khỏi giỏ hàng',
            cartCount: cartCount[0]?.total || 0
        });
        
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
        res.json({ 
            success: false, 
            message: 'Lỗi khi xóa sản phẩm' 
        });
    }
});

module.exports = router;
