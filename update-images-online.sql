-- Cập nhật database với URL hình ảnh online từ Picsum Photos
-- Chạy trực tiếp trong phpMyAdmin - không cần tải file về

-- Cập nhật hình ảnh sản phẩm chính
UPDATE product_images SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi-vintage/800/800.jpg' WHERE product_id = 1 AND is_primary = TRUE;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/ao-so-mi-trang/800/800.jpg' WHERE product_id = 2 AND is_primary = TRUE;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/quan-jeans-slim-fit/800/800.jpg' WHERE product_id = 3 AND is_primary = TRUE;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/dam-cong-so-thanh-lich/800/800.jpg' WHERE product_id = 4 AND is_primary = TRUE;

-- Cập nhật hình ảnh chi tiết sản phẩm 1 (Váy hoa nhí)
UPDATE product_images SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi-detail-1/600/600.jpg' WHERE product_id = 1 AND sort_order = 1;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi-detail-2/600/600.jpg' WHERE product_id = 1 AND sort_order = 2;

-- Cập nhật hình ảnh chi tiết sản phẩm 2 (Áo sơ mi)
UPDATE product_images SET image_url = 'https://picsum.photos/seed/ao-so-mi-detail-1/600/600.jpg' WHERE product_id = 2 AND sort_order = 1;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/ao-so-mi-detail-2/600/600.jpg' WHERE product_id = 2 AND sort_order = 2;

-- Cập nhật hình ảnh chi tiết sản phẩm 3 (Quần jeans)
UPDATE product_images SET image_url = 'https://picsum.photos/seed/quan-jeans-detail-1/600/600.jpg' WHERE product_id = 3 AND sort_order = 1;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/quan-jeans-detail-2/600/600.jpg' WHERE product_id = 3 AND sort_order = 2;

-- Cập nhật hình ảnh chi tiết sản phẩm 4 (Đầm công sở)
UPDATE product_images SET image_url = 'https://picsum.photos/seed/dam-cong-so-detail-1/600/600.jpg' WHERE product_id = 4 AND sort_order = 1;
UPDATE product_images SET image_url = 'https://picsum.photos/seed/dam-cong-so-detail-2/600/600.jpg' WHERE product_id = 4 AND sort_order = 2;

-- Cập nhật hình ảnh danh mục
UPDATE categories SET image = 'https://picsum.photos/seed/vay-nu-thoi-trang/400/300.jpg' WHERE id = 1;
UPDATE categories SET image = 'https://picsum.photos/seed/ao-so-mi-cong-so/400/300.jpg' WHERE id = 2;
UPDATE categories SET image = 'https://picsum.photos/seed/quan-thoi-trang/400/300.jpg' WHERE id = 3;
UPDATE categories SET image = 'https://picsum.photos/seed/phu-kien-thoi-trang/400/300.jpg' WHERE id = 4;

-- Cập nhật hình ảnh cho variants
UPDATE product_variants SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi-hong-pink/400/400.jpg' WHERE product_id = 1 AND color = 'Hồng';
UPDATE product_variants SET image_url = 'https://picsum.photos/seed/ao-so-mi-trang-white/400/400.jpg' WHERE product_id = 2 AND color = 'Trắng';
UPDATE product_variants SET image_url = 'https://picsum.photos/seed/quan-jeans-xanh-dark/400/400.jpg' WHERE product_id = 3 AND color = 'Xanh đậm';
UPDATE product_variants SET image_url = 'https://picsum.photos/seed/dam-cong-so-blue/400/400.jpg' WHERE product_id = 4;
