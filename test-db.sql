-- Test query để kiểm tra dữ liệu hình ảnh
-- Chạy trong phpMyAdmin để xem dữ liệu hiện tại

-- 1. Kiểm tra tất cả hình ảnh sản phẩm
SELECT 
    pi.id,
    pi.product_id,
    p.name as product_name,
    pi.image_url,
    pi.is_primary,
    pi.sort_order
FROM product_images pi
LEFT JOIN products p ON pi.product_id = p.id
ORDER BY pi.product_id, pi.sort_order;

-- 2. Kiểm tra danh mục có hình ảnh không
SELECT 
    id,
    name,
    image
FROM categories
WHERE is_active = true;

-- 3. Kiểm tra sản phẩm có hình ảnh không
SELECT 
    p.id,
    p.name,
    p.price,
    COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.price;

-- 4. Kiểm tra URL hình ảnh có hợp lệ không
SELECT 
    image_url,
    CASE 
        WHEN image_url LIKE 'http%' THEN 'Online URL'
        WHEN image_url LIKE '/images/%' THEN 'Local URL'
        ELSE 'Invalid URL'
    END as url_type
FROM product_images
GROUP BY image_url;
