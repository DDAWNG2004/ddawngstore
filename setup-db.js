const { sequelize } = require('./src/config/database');

async function setupDatabase() {
    try {
        console.log('🔄 Creating database and tables...');
        
        // Tạo database nếu chưa tồn tại
        await sequelize.query('CREATE DATABASE IF NOT EXISTS ddawngstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ Database created successfully!');
        
        // Kết nối đến database ddawngstore
        const newSequelize = require('sequelize');
        const db = new newSequelize('ddawngstore', 'root', '', {
            host: 'localhost',
            port: 3306,
            dialect: 'mysql',
            logging: false
        });
        
        // Xóa bảng cũ nếu tồn tại (đúng thứ tự để tránh foreign key constraint)
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('DROP TABLE IF EXISTS product_variants');
        await db.query('DROP TABLE IF EXISTS colors');
        await db.query('DROP TABLE IF EXISTS sizes');
        await db.query('DROP TABLE IF EXISTS product_images');
        await db.query('DROP TABLE IF EXISTS products');
        await db.query('DROP TABLE IF EXISTS categories');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🗑️ Old tables dropped successfully!');
        
        // Tạo tables
        await db.query(`
            CREATE TABLE categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        await db.query(`
            CREATE TABLE sizes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(20) NOT NULL UNIQUE,
                description VARCHAR(100),
                sort_order INT DEFAULT 0,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await db.query(`
            CREATE TABLE colors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                hex_code VARCHAR(7),
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await db.query(`
            CREATE TABLE products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category_id INT,
                stock_quantity INT DEFAULT 0,
                sku VARCHAR(100),
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        
        await db.query(`
            CREATE TABLE product_variants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                size_id INT NOT NULL,
                color_id INT NOT NULL,
                stock_quantity INT DEFAULT 0,
                sku VARCHAR(100),
                price_adjustment DECIMAL(10,2) DEFAULT 0,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE CASCADE,
                FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE CASCADE,
                UNIQUE KEY unique_variant (product_id, size_id, color_id)
            )
        `);
        
        await db.query(`
            CREATE TABLE product_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                is_primary BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tables created successfully!');
        
        // Thêm dữ liệu mẫu cho sizes
        await db.query(`
            INSERT INTO sizes (name, description, sort_order) VALUES 
            ('XS', 'Extra Small', 1),
            ('S', 'Small', 2),
            ('M', 'Medium', 3),
            ('L', 'Large', 4),
            ('XL', 'Extra Large', 5),
            ('XXL', 'Double Extra Large', 6),
            ('3XL', 'Triple Extra Large', 7),
            ('OS', 'One Size', 8)
        `);
        
        // Thêm dữ liệu mẫu cho colors
        await db.query(`
            INSERT INTO colors (name, hex_code) VALUES 
            ('Đen', '#000000'),
            ('Trắng', '#FFFFFF'),
            ('Đỏ', '#FF0000'),
            ('Xanh dương', '#0000FF'),
            ('Xanh lá', '#00FF00'),
            ('Vàng', '#FFFF00'),
            ('Hồng', '#FFC0CB'),
            ('Tím', '#800080'),
            ('Xám', '#808080'),
            ('Nâu', '#8B4513'),
            ('Be', '#F5F5DC'),
            ('Kem', '#FFFDD0')
        `);
        
        // Thêm dữ liệu mẫu cho categories
        await db.query(`
            INSERT INTO categories (name, description) VALUES 
            ('Áo', 'Các loại áo thời trang'),
            ('Quần', 'Các loại quần thời trang'),
            ('Váy', 'Các loại váy thời trang'),
            ('Phụ kiện', 'Các loại phụ kiện thời trang')
        `);
        
        // Thêm dữ liệu mẫu cho products
        await db.query(`
            INSERT INTO products (name, description, price, category_id, stock_quantity, sku) VALUES 
            ('Váy hoa nhí vintage', 'Váy hoa nhí phong cách vintage, chất liệu cotton mềm mại', 450000, 3, 50, 'VAY-HNI-001'),
            ('Áo thun basic', 'Áo thun basic unisex, chất liệu 100% cotton', 150000, 1, 100, 'AO-BSC-001'),
            ('Quần jeans slimfit', 'Quần jeans dáng slimfit, co giãn nhẹ', 350000, 2, 75, 'QU-JNS-001'),
            ('Váy công sở', 'Váy công sở thanh lịch, phù hợp môi trường văn phòng', 550000, 3, 30, 'VAY-CSO-001'),
            ('Áo sơ mi trắng', 'Áo sơ mi trắng classic, chất liệu lụa cao cấp', 250000, 1, 80, 'AO-SMI-001'),
            ('Quần kaki', 'Quần kaki form dáng, chất liệu thoáng mát', 320000, 2, 60, 'QU-KKI-001'),
            ('Váy maxi', 'Váy maxi hoa lá, phong cách bohemian', 480000, 3, 25, 'VAY-MXI-001'),
            ('Áo polo', 'Áo polo thể thao, co giãn tốt', 180000, 1, 90, 'AO-PLO-001')
        `);
        
        // Thêm dữ liệu mẫu cho product_variants
        await db.query(`
            INSERT INTO product_variants (product_id, size_id, color_id, stock_quantity, sku) VALUES 
            -- Váy hoa nhí vintage (product_id: 1)
            (1, 2, 2, 15, 'VAY-HNI-001-S-WHT'), (1, 3, 2, 20, 'VAY-HNI-001-M-WHT'), (1, 4, 2, 15, 'VAY-HNI-001-L-WHT'),
            (1, 2, 7, 10, 'VAY-HNI-001-S-PNK'), (1, 3, 7, 15, 'VAY-HNI-001-M-PNK'), (1, 4, 7, 10, 'VAY-HNI-001-L-PNK'),
            -- Áo thun basic (product_id: 2)
            (2, 1, 1, 25, 'AO-BSC-001-XS-BLK'), (2, 2, 1, 30, 'AO-BSC-001-S-BLK'), (2, 3, 1, 35, 'AO-BSC-001-M-BLK'),
            (2, 4, 1, 30, 'AO-BSC-001-L-BLK'), (2, 5, 1, 25, 'AO-BSC-001-XL-BLK'), (2, 3, 2, 20, 'AO-BSC-001-M-WHT'),
            -- Quần jeans slimfit (product_id: 3)
            (3, 2, 1, 15, 'QU-JNS-001-S-BLK'), (3, 3, 1, 20, 'QU-JNS-001-M-BLK'), (3, 4, 1, 15, 'QU-JNS-001-L-BLK'),
            (3, 5, 1, 10, 'QU-JNS-001-XL-BLK'), (3, 3, 10, 15, 'QU-JNS-001-M-BLU')
        `);
        
        // Thêm hình ảnh cho sản phẩm
        await db.query(`
            INSERT INTO product_images (product_id, image_url, is_primary) VALUES 
            (1, 'https://picsum.photos/seed/vay1/400/500.jpg', TRUE),
            (2, 'https://picsum.photos/seed/ao1/400/500.jpg', TRUE),
            (3, 'https://picsum.photos/seed/quan1/400/500.jpg', TRUE),
            (4, 'https://picsum.photos/seed/vay2/400/500.jpg', TRUE),
            (5, 'https://picsum.photos/seed/ao2/400/500.jpg', TRUE),
            (6, 'https://picsum.photos/seed/quan2/400/500.jpg', TRUE),
            (7, 'https://picsum.photos/seed/vay3/400/500.jpg', TRUE),
            (8, 'https://picsum.photos/seed/ao3/400/500.jpg', TRUE)
        `);
        
        console.log('✅ Sample data inserted successfully!');
        console.log('🎉 Database setup completed!');
        
        await db.close();
        
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
}

setupDatabase();
