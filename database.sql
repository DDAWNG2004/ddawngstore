-- Tạo database cho DDAWNG Store
CREATE DATABASE IF NOT EXISTS ddawngstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ddawngstore;

-- Bảng Users (Người dùng)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    avatar VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Categories (Danh mục sản phẩm)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    parent_id INT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Bảng Products (Sản phẩm)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    track_quantity BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 0,
    weight DECIMAL(8,2),
    category_id INT,
    brand VARCHAR(100),
    status ENUM('active', 'draft', 'archived') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Bảng Product Images (Hình ảnh sản phẩm)
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(200),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng Product Variants (Biến thể sản phẩm - size, màu sắc)
CREATE TABLE IF NOT EXISTS product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    quantity INT DEFAULT 0,
    weight DECIMAL(8,2),
    size VARCHAR(20),
    color VARCHAR(50),
    color_code VARCHAR(7),
    image_url VARCHAR(255),
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng Orders (Đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    
    -- Shipping information
    shipping_name VARCHAR(100) NOT NULL,
    shipping_email VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100),
    shipping_country VARCHAR(100) DEFAULT 'Vietnam',
    shipping_postal_code VARCHAR(20),
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng Order Items (Chi tiết đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(100),
    variant_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT
);

-- Bảng Cart (Giỏ hàng)
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(100),
    product_id INT NOT NULL,
    variant_id INT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id, variant_id),
    UNIQUE KEY unique_cart_session (session_id, product_id, variant_id)
);

-- Bảng Reviews (Đánh giá sản phẩm)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng Coupons (Mã giảm giá)
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type ENUM('fixed', 'percentage') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2),
    maximum_discount DECIMAL(10,2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Wishlist (Yêu thích)
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_item (user_id, product_id)
);

-- Thêm indexes cho performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_cart_session ON cart(session_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Thêm một vài dữ liệu mẫu
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Váy nữ', 'vay-nu', 'Các loại váy thời trang cho nữ', 1),
('Áo sơ mi', 'ao-so-mi', 'Áo sơ mi công sở và thời trang', 2),
('Quần', 'quan', 'Các loại quần cho nam và nữ', 3),
('Phụ kiện', 'phu-kien', 'Phụ kiện thời trang', 4);

INSERT INTO products (name, slug, sku, description, short_description, price, compare_price, quantity, category_id, featured) VALUES
('Váy hoa nhí vintage', 'vay-hoa-nhi-vintage', 'VAY001', 'Váy hoa nhí với thiết kế vintage mang đến vẻ đẹp thanh lịch và nữ tính. Chất liệu lụa tơ mềm mại, thoáng mát giúp bạn luôn cảm thấy thoải mái trong mọi hoạt động.', 'Váy hoa nhí vintage thanh lịch', 599000, 799000, 50, 1, TRUE),
('Áo sơ mi trắng', 'ao-so-mi-trang', 'AO001', 'Áo sơ mi trắng classic, phù hợp với mọi hoàn cảnh. Chất liệu cotton cao cấp, không nhăn, thoáng mát.', 'Áo sơ mi trắng classic', 399000, NULL, 100, 2, TRUE),
('Quần jeans slim', 'quan-jeans-slim', 'QUAN001', 'Quần jeans slim fit dáng đẹp, chất liệu denim cao cấp, co giãn tốt. Phù hợp với nhiều phong cách khác nhau.', 'Quần jeans slim fit', 799000, NULL, 30, 3, TRUE),
('Đầm công sở', 'dam-cong-so', 'DAM001', 'Đầm công sở thanh lịch, chuyên nghiệp. Thiết kế tinh tế, tôn dáng, phù hợp cho môi trường công sở.', 'Đầm công sở thanh lịch', 899000, NULL, 25, 1, FALSE);

-- Thêm hình ảnh cho sản phẩm
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, '/images/product1.jpg', 'Váy hoa nhí vintage', TRUE, 0),
(1, '/images/product-detail-1.jpg', 'Váy hoa nhí chi tiết 1', FALSE, 1),
(1, '/images/product-detail-2.jpg', 'Váy hoa nhí chi tiết 2', FALSE, 2),
(2, '/images/product2.jpg', 'Áo sơ mi trắng', TRUE, 0),
(3, '/images/product3.jpg', 'Quần jeans slim', TRUE, 0),
(4, '/images/product4.jpg', 'Đầm công sở', TRUE, 0);

-- Thêm biến thể cho sản phẩm
INSERT INTO product_variants (product_id, sku, price, quantity, size, color, color_code) VALUES
(1, 'VAY001-S-HONG', 599000, 15, 'S', 'Hồng', '#FFB6C1'),
(1, 'VAY001-M-HONG', 599000, 20, 'M', 'Hồng', '#FFB6C1'),
(1, 'VAY001-L-HONG', 599000, 15, 'L', 'Hồng', '#FFB6C1'),
(2, 'AO001-S-TRANG', 399000, 30, 'S', 'Trắng', '#FFFFFF'),
(2, 'AO001-M-TRANG', 399000, 35, 'M', 'Trắng', '#FFFFFF'),
(2, 'AO001-L-TRANG', 399000, 35, 'L', 'Trắng', '#FFFFFF'),
(3, 'QUAN001-28-XANH', 799000, 10, '28', 'Xanh đậm', '#000080'),
(3, 'QUAN001-30-XANH', 799000, 10, '30', 'Xanh đậm', '#000080'),
(3, 'QUAN001-32-XANH', 799000, 10, '32', 'Xanh đậm', '#000080');

-- Thêm user admin
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@ddawngstore.com', '$2b$10$rQZ8kHWKQGYHQkWPv5zS8eKqf5Z8qYqZqZqZqZqZqZqZqZqZqZqZq', 'Administrator', 'admin');

-- Thêm mã giảm giá
INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_amount, usage_limit, is_active) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10, 500000, 100, TRUE),
('FREESHIP', 'Miễn phí vận chuyển', 'Miễn phí vận chuyển cho đơn hàng từ 500K', 'fixed', 30000, 500000, 200, TRUE),
('SALE20', 'Giảm giá đặc biệt', 'Giảm 20% cho các sản phẩm được chọn', 'percentage', 20, 1000000, 50, TRUE);
