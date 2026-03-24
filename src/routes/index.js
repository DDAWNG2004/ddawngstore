const express = require('express');
const router = express.Router();

// Home page
router.get('/', async (req, res) => {
    console.log('🏠 Home page requested');
    try {
        const categoryId = req.query.category;

        let productsQuery = `
            SELECT p.*, c.name as category_name,
                   (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image_url,
                   (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = 1) as avg_rating,
                   (SELECT SUM(quantity) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = p.id AND o.status != 'cancelled') as sold_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
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

// Products page (with search and filters)
router.get('/products', async (req, res) => {
    console.log('🛍️ Products page requested');
    try {
        const { search, category, minPrice, maxPrice, size, color, sort } = req.query;

        // Base query - joining with product_variants if size or color is filtered
        let productsQuery = `
            SELECT p.*, c.name as category_name,
                   (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
        `;

        // If sorting or filtering by size/color, we might need a join
        if (size || color) {
            productsQuery += `
                INNER JOIN product_variants pv ON p.id = pv.product_id
            `;
        }

        productsQuery += ` WHERE p.status = 'active' `;

        let queryParams = [];

        if (search) {
            productsQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            // Support multiple categories
            const categoriesInfo = Array.isArray(category) ? category : [category];
            productsQuery += ` AND p.category_id IN (${categoriesInfo.map(() => '?').join(',')})`;
            queryParams.push(...categoriesInfo);
        }

        if (minPrice) {
            productsQuery += ' AND p.price >= ?';
            queryParams.push(minPrice);
        }

        if (maxPrice) {
            productsQuery += ' AND p.price <= ?';
            queryParams.push(maxPrice);
        }

        if (size) {
            const sizesInfo = Array.isArray(size) ? size : [size];
            productsQuery += ` AND pv.size_id IN (${sizesInfo.map(() => '?').join(',')})`;
            queryParams.push(...sizesInfo);
        }

        if (color) {
            const colorsInfo = Array.isArray(color) ? color : [color];
            productsQuery += ` AND pv.color_id IN (${colorsInfo.map(() => '?').join(',')})`;
            queryParams.push(...colorsInfo);
        }

        // Group by product ID if we joined with variants to avoid duplicate products in the list
        if (size || color) {
            productsQuery += ' GROUP BY p.id';
        }

        // Sorting
        if (sort === 'price_asc') {
            productsQuery += ' ORDER BY p.price ASC';
        } else if (sort === 'price_desc') {
            productsQuery += ' ORDER BY p.price DESC';
        } else {
            // default to newest
            productsQuery += ' ORDER BY p.created_at DESC';
        }

        const [products] = await req.sequelize.query(productsQuery, {
            replacements: queryParams
        });

        // Fetch data for filter sidebar
        const [categories] = await req.sequelize.query(`SELECT * FROM categories WHERE status = 'active' ORDER BY name`);
        const [sizes] = await req.sequelize.query(`SELECT * FROM sizes WHERE status = 'active' ORDER BY sort_order`);
        const [colors] = await req.sequelize.query(`SELECT * FROM colors WHERE status = 'active' ORDER BY name`);

        // Check customer session
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

        res.render('products', {
            products: products || [],
            categories: categories || [],
            sizes: sizes || [],
            colors: colors || [],
            customer: customer,
            query: req.query // Pass query params back to view to keep filter state
        });

    } catch (error) {
        console.error('Error loading products page:', error);
        res.status(500).render('error', { message: 'Lỗi khi tải trang sản phẩm' });
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
            SELECT p.*, c.name as category_name,
                   (SELECT SUM(quantity) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = p.id AND o.status != 'cancelled') as sold_count
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

        // Get product reviews
        const [reviews] = await req.sequelize.query(`
            SELECT r.*, u.full_name as user_name, u.avatar as user_avatar
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ? AND r.is_approved = 1
            ORDER BY r.created_at DESC
        `, {
            replacements: [productId]
        });

        // Calculate average rating
        const [ratingStats] = await req.sequelize.query(`
            SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
            FROM reviews
            WHERE product_id = ? AND is_approved = 1
        `, {
            replacements: [productId]
        });

        const stats = {
            avgRating: parseFloat(ratingStats[0].avg_rating) || 0,
            reviewCount: ratingStats[0].review_count || 0
        };

        // Get related products
        const [relatedProducts] = await req.sequelize.query(`
            SELECT p.*,
                   (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image_url,
                   (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = 1) as avg_rating,
                   (SELECT SUM(quantity) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = p.id AND o.status != 'cancelled') as sold_count
            FROM products p
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
                    SELECT id, full_name, email, phone, address FROM users WHERE id = ? AND role = 'user'
                `, {
                    replacements: [req.session.customerId]
                });
                if (customerData.length > 0) {
                    const user = customerData[0];
                    customer = {
                        id: user.id,
                        name: user.full_name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address || ''
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
            reviewsCount: (reviews || []).length,
            stats: stats,
            relatedCount: (relatedProducts || []).length,
            hasCustomer: !!customer
        });

        res.render('product-detail', {
            product: product,
            images: images || [],
            variants: variants || [],
            reviews: reviews || [],
            stats: stats,
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
                    SELECT id, full_name, email, phone, address FROM users WHERE id = ? AND role = 'user'
                `, {
                    replacements: [req.session.customerId]
                });
                if (customerData.length > 0) {
                    const user = customerData[0];
                    customer = {
                        id: user.id,
                        name: user.full_name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address || ''
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
                       p.description, 
                       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as image_url,
                       pv.sku, pv.price_adjustment,
                       s.name as size_name, s.description as size_description,
                       col.name as color_name, col.hex_code as color_hex, cat.name as category_name
                FROM cart c
                LEFT JOIN products p ON c.product_id = p.id
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

        // Kiểm tra xem sản phẩm có bắt buộc chọn biến thể (có record trong product_variants) không
        const [productVariantsCheck] = await req.sequelize.query(`
            SELECT id FROM product_variants WHERE product_id = ? AND status = 'active' AND stock_quantity > 0
        `, {
            replacements: [productId]
        });

        // Nếu sản phẩm CÓ biến thể, mà frontend KHÔNG truyền variantId
        if (productVariantsCheck.length > 0 && !variantId) {
            return res.json({
                success: false,
                message: 'Vui lòng chọn đầy đủ kích thước và màu sắc hợp lệ!'
            });
        }

        // Kiểm tra variant nếu có variantId
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

            // Validate số lượng vượt quá kho variant
            if (quantity > variant.stock_quantity) {
                return res.json({
                    success: false,
                    message: `Số lượng vượt quá sản phẩm trong kho (còn ${variant.stock_quantity})`
                });
            }
        } else {
            // Validate số lượng vượt quá kho product (nếu ko có variant)
            if (quantity > product.stock_quantity) {
                return res.json({
                    success: false,
                    message: `Số lượng vượt quá sản phẩm trong kho (còn ${product.stock_quantity})`
                });
            }
        }

        // Thêm vào giỏ hàng (database)
        const [existingCart] = await req.sequelize.query(`
            SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))
        `, {
            replacements: [req.session.customerId, productId, variantId || null, variantId || null]
        });

        if (existingCart.length > 0) {
            // Cập nhật số lượng nếu đã có trong giỏ
            const newQuantity = existingCart[0].quantity + parseInt(quantity);

            // Tính limit stock để chặn
            const limitStock = variant ? variant.stock_quantity : product.stock_quantity;
            if (newQuantity > limitStock) {
                return res.json({
                    success: false,
                    message: `Tổng số lượng trong giỏ (${newQuantity}) vượt quá kho (${limitStock})`
                });
            }

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

// Update cart quantity
router.post('/cart/update/:itemId', async (req, res) => {
    try {
        if (!req.session || !req.session.customerId) {
            return res.json({ success: false, message: 'Vui lòng đăng nhập' });
        }

        const itemId = req.params.itemId;
        const { change } = req.body;

        // Lấy thông tin item hiện tại
        const [cartItems] = await req.sequelize.query(`
            SELECT c.*, p.stock_quantity as product_stock, pv.stock_quantity as variant_stock
            FROM cart c
            LEFT JOIN products p ON c.product_id = p.id
            LEFT JOIN product_variants pv ON c.variant_id = pv.id
            WHERE c.id = ? AND c.user_id = ?
        `, {
            replacements: [itemId, req.session.customerId]
        });

        if (cartItems.length === 0) {
            return res.json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
        }

        const item = cartItems[0];
        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            return res.json({ success: false, message: 'Số lượng tối thiểu là 1' });
        }

        // Kiểm tra tồn kho nếu là tăng bản số lượng
        const maxStock = item.variant_id ? item.variant_stock : item.product_stock;
        if (change > 0 && newQuantity > maxStock) {
            return res.json({ success: false, message: `Chỉ còn ${maxStock} sản phẩm trong kho` });
        }

        // Cập nhật số lượng
        await req.sequelize.query(`
            UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?
        `, {
            replacements: [newQuantity, itemId]
        });

        // Lấy lại tổng số lượng trong giỏ
        const [cartCount] = await req.sequelize.query(`
            SELECT SUM(quantity) as total FROM cart WHERE user_id = ?
        `, {
            replacements: [req.session.customerId]
        });

        res.json({
            success: true,
            newQuantity: newQuantity,
            cartCount: cartCount[0]?.total || 0
        });

    } catch (error) {
        console.error('❌ Error updating cart quantity:', error);
        res.json({ success: false, message: 'Lỗi khi cập nhật số lượng' });
    }
});

// API Coupon Verification
router.post('/api/check-coupon', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
        }

        const [coupons] = await req.sequelize.query(`
            SELECT * FROM coupons 
            WHERE code = ? AND is_active = 1
        `, {
            replacements: [code.toUpperCase()]
        });

        if (coupons.length === 0) {
            return res.json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã bị khóa' });
        }

        const coupon = coupons[0];

        if (coupon.valid_from && new Date() < new Date(coupon.valid_from)) {
            return res.json({ success: false, message: 'Mã giảm giá chưa đến ngày sử dụng' });
        }

        if (coupon.valid_until && new Date() > new Date(coupon.valid_until)) {
            return res.json({ success: false, message: 'Mã giảm giá đã hết hạn' });
        }

        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return res.json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
        }

        return res.json({
            success: true,
            message: 'Áp dụng mã giảm giá thành công',
            discountType: coupon.discount_type,
            discountValue: coupon.discount_value,
            code: coupon.code,
            minAmount: coupon.min_purchase_amount
        });
    } catch (error) {
        console.error('Error checking coupon:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// Checkout
router.post('/checkout', async (req, res) => {
    try {
        console.log('🛍️ Checkout request received');

        // Kiểm tra user đã đăng nhập chưa
        if (!req.session || !req.session.customerId) {
            console.log('❌ User not logged in, cannot checkout');
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiến hành thanh toán'
            });
        }

        const customerId = req.session.customerId;
        const { itemIds, customer, paymentMethod, shippingFee = 30000, couponCode } = req.body;

        console.log('📊 Checkout data:', { itemIds, customer, paymentMethod, couponCode });

        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán'
            });
        }

        if (!customer || !customer.fullName || !customer.phone || !customer.email || !customer.address) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin giao hàng'
            });
        }

        // Bắt đầu transaction
        await req.sequelize.query('START TRANSACTION');

        try {
            // 1. Lấy thông tin các item trong cart, kiểm tra giá và tồn kho
            const placeholders = itemIds.map(() => '?').join(',');
            const [cartItems] = await req.sequelize.query(`
                SELECT c.*, p.name as product_name, p.price as base_price, 
                       pv.sku as variant_sku, pv.price_adjustment, pv.stock_quantity,
                       s.name as size_name, col.name as color_name
                FROM cart c
                LEFT JOIN products p ON c.product_id = p.id
                LEFT JOIN product_variants pv ON c.variant_id = pv.id
                LEFT JOIN sizes s ON pv.size_id = s.id
                LEFT JOIN colors col ON pv.color_id = col.id
                WHERE c.user_id = ? AND c.id IN (${placeholders})
                FOR UPDATE
            `, {
                replacements: [customerId, ...itemIds]
            });

            if (cartItems.length === 0) {
                throw new Error('Không tìm thấy sản phẩm hợp lệ trong giỏ hàng');
            }

            // Tính toán tổng tiền
            let subtotal = 0;
            const itemsToOrder = [];

            for (const item of cartItems) {
                const finalPrice = Number(item.base_price) + Number(item.price_adjustment || 0);
                const itemTotal = finalPrice * item.quantity;
                subtotal += itemTotal;

                // Chuẩn bị dữ liệu cho order_items
                itemsToOrder.push({
                    productId: item.product_id,
                    variantId: item.variant_id,
                    quantity: item.quantity,
                    price: finalPrice,
                    total: itemTotal,
                    productName: item.product_name,
                    sku: item.variant_sku || 'N/A',
                    size_name: item.size_name,
                    color_name: item.color_name,
                    cartId: item.id
                });
            }

            let calculatedDiscount = 0;
            if (couponCode) {
                const [coupons] = await req.sequelize.query(`
                    SELECT * FROM coupons 
                    WHERE code = ? AND is_active = 1
                `, {
                    replacements: [String(couponCode).toUpperCase()]
                });

                if (coupons.length > 0) {
                    const coupon = coupons[0];
                    const now = new Date();
                    const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
                    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

                    const isValidTime = (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil);
                    const isValidUsage = !coupon.usage_limit || coupon.usage_count < coupon.usage_limit;
                    const isValidAmount = subtotal >= (coupon.min_purchase_amount || 0);

                    if (isValidTime && isValidUsage && isValidAmount) {
                        if (coupon.discount_type === 'percent') {
                            calculatedDiscount = Math.round(subtotal * (coupon.discount_value / 100));
                        } else {
                            calculatedDiscount = Number(coupon.discount_value);
                        }
                    }
                }

                if (calculatedDiscount > subtotal) {
                    calculatedDiscount = subtotal;
                }
            }

            const totalAmount = subtotal + Number(shippingFee) - calculatedDiscount;

            // 2. Tạo bản ghi đơn hàng (Order)
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            const insertOrderResult = await req.sequelize.query(`
                INSERT INTO orders (
                    user_id, order_number, status, payment_status, payment_method, 
                    subtotal, shipping_amount, discount_amount, total_amount, 
                    shipping_name, shipping_email, shipping_phone, shipping_address, notes,
                    created_at, updated_at
                )
                VALUES (?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, {
                replacements: [
                    customerId,
                    orderNumber,
                    paymentMethod || 'cod',
                    subtotal,
                    shippingFee || 30000,
                    calculatedDiscount,
                    totalAmount,
                    customer.fullName,
                    customer.email,
                    customer.phone,
                    customer.address,
                    customer.notes || null
                ]
            });

            const [lastIdResult] = await req.sequelize.query('SELECT LAST_INSERT_ID() as id');
            const orderId = lastIdResult[0]?.id || lastIdResult[0]?.['LAST_INSERT_ID()'];

            // Có thể cần lưu tên, email, note ở bảng orders hoặc user tuỳ schema (giả sử bảng orders chưa có các cột này ngoại trừ ở admin có truy vấn). 
            // Ở đây tạm bỏ qua note vì admin.js/customer.js không query cột note.

            // 3. Tạo các bản ghi chi tiết đơn hàng (OrderItems)
            for (const orderItem of itemsToOrder) {
                // Tạo field variant_info (JSON string) để lưu text size/color cho đơn hàng, tránh bị mất data nếu variant bị xoá
                let variantInfoObj = null;
                if (orderItem.size_name || orderItem.color_name) {
                    variantInfoObj = {
                        size: orderItem.size_name,
                        color: orderItem.color_name
                    };
                }

                await req.sequelize.query(`
                    INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, total, product_name, product_sku, variant_info, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `, {
                    replacements: [
                        orderId,
                        orderItem.productId,
                        orderItem.variantId,
                        orderItem.quantity,
                        orderItem.price,
                        orderItem.total,
                        orderItem.productName,
                        orderItem.sku,
                        variantInfoObj ? JSON.stringify(variantInfoObj) : null
                    ]
                });

                // Cập nhật trừ số lượng tồn kho (stock) của biến thể nếu có
                if (orderItem.variantId) {
                    await req.sequelize.query(`
                        UPDATE product_variants 
                        SET stock_quantity = GREATEST(0, stock_quantity - ?)
                        WHERE id = ?
                    `, {
                        replacements: [orderItem.quantity, orderItem.variantId]
                    });
                }

                // Cập nhật trừ số lượng tồn kho tổng của sản phẩm
                await req.sequelize.query(`
                    UPDATE products 
                    SET stock_quantity = GREATEST(0, stock_quantity - ?)
                    WHERE id = ?
                `, {
                    replacements: [orderItem.quantity, orderItem.productId]
                });
            }

            // 4. Xóa các sản phẩm đã mua khỏi giỏ hàng
            await req.sequelize.query(`
                DELETE FROM cart WHERE id IN (${placeholders}) AND user_id = ?
            `, {
                replacements: [...itemIds, customerId]
            });

            // Lấy lại tổng số lượng còn lại trong cart
            const [remainingCart] = await req.sequelize.query(`
                SELECT SUM(quantity) as total FROM cart WHERE user_id = ?
            `, {
                replacements: [customerId]
            });
            const remainingCount = remainingCart[0]?.total || 0;

            if (couponCode && calculatedDiscount > 0) {
                await req.sequelize.query(`
                    UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?
                `, {
                    replacements: [String(couponCode).toUpperCase()]
                });
            }

            await req.sequelize.query('COMMIT');

            console.log('✅ Checkout successful. Order ID:', orderId);
            res.json({
                success: true,
                message: 'Đặt hàng thành công!',
                orderId: orderId,
                cartCount: remainingCount
            });

        } catch (error) {
            await req.sequelize.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('❌ Error during checkout:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi thanh toán. Vui lòng thử lại sau.'
        });
    }
});

// Trang Checkout Success
router.get('/checkout/success', async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const method = req.query.method || 'cod';
        if (!orderId) {
            return res.redirect('/');
        }
        res.render('checkout-success', {
            orderId: orderId,
            method: method,
            user: req.session.user || null
        });
    } catch (error) {
        console.error('Error rendering checkout success:', error);
        res.redirect('/');
    }
});

module.exports = router;
