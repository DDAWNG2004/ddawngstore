-- Update database với URL hình ảnh placeholder
-- Chạy các query này trong phpMyAdmin sau khi đã import database.sql

-- Cập nhật hình ảnh sản phẩm
UPDATE product_images SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi/800/800.jpg' WHERE product_id = 1 AND is_primary = TRUE;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi-1/600/600.jpg' WHERE product_id = 1 AND sort_order = 1;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi-2/600/600.jpg' WHERE product_id = 1 AND sort_order = 2;

UPDATE product_images SET image_url = 'https://picsum.photos/seed/ao-so-mi/800/800.jpg' WHERE product_id = 2 AND is_primary = TRUE;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/ao-so-mi-1/600/600.jpg' WHERE product_id = 2 AND sort_order = 1;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/ao-so-mi-2/600/600.jpg' WHERE product_id = 2 AND sort_order = 2;

UPDATE product_images SET image_url = 'https://picsum.photos/seed/quan-jeans/800/800.jpg' WHERE product_id = 3 AND is_primary = TRUE;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/quan-jeans-1/600/600.jpg' WHERE product_id = 3 AND sort_order = 1;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/quan-jeans-2/600/600.jpg' WHERE product_id = 3 AND sort_order = 2;

UPDATE product_images SET image_url = 'https://picsum.photos/seed/dam-cong-so/800/800.jpg' WHERE product_id = 4 AND is_primary = TRUE;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/dam-cong-so-1/600/600.jpg' WHERE product_id = 4 AND sort_order = 1;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/dam-cong-so-2/600/600.jpg' WHERE product_id = 4 AND sort_order = 2;

-- Cập nhật hình ảnh danh mục
UPDATE categories SET image = 'https://picsum.photos/seed/vay-nu/400/300.jpg' WHERE id = 1;
UPDATE categories SET image = 'https://picsum.photos/seed/ao-so-mi/400/300.jpg' WHERE id = 2;
UPDATE categories SET image = 'https://picsum.photos/seed/quan/400/300.jpg' WHERE id = 3;
UPDATE categories SET image = 'https://picsum.photos/seed/phu-kien/400/300.jpg' WHERE id = 4;

-- Cập nhật hình ảnh cho variants (nếu có)
UPDATE product_variants SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi-hong/400/400.jpg' WHERE product_id = 1 AND color = 'Hồng';
UPDATE product_variants SET image_url = 'https://picsum.photos/seed/ao-so-mi-trang/400/400.jpg' WHERE product_id = 2 AND color = 'Trắng';
UPDATE product_variants SET image_url = 'https://picsum.photos/seed/quan-jeans-xanh/400/400.jpg' WHERE product_id = 3 AND color = 'Xanh đậm';
UPDATE product_variants SET image_url = 'https://picsum.photos/seed/dam-cong-so-xanh/400/400.jpg' WHERE product_id = 4;
