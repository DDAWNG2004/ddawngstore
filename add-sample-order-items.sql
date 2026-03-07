-- Add sample order items for testing
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `quantity`, `price`, `total`, `product_name`, `product_sku`, `created_at`) VALUES
(1, 1, 1, NULL, 2, 125000.00, 250000.00, 'Váy hoa vintage', 'SKU1', '2026-03-03 10:50:21'),
(2, 2, 2, NULL, 1, 150000.00, 150000.00, 'Áo thun basic', 'SKU2', '2026-03-03 10:50:21'),
(3, 2, 3, NULL, 1, 30000.00, 30000.00, 'Quần jeans slim', 'SKU3', '2026-03-03 10:50:21'),
(4, 3, 1, NULL, 1, 450000.00, 450000.00, 'Váy hoa vintage', 'SKU1', '2026-03-03 10:50:21'),
(5, 3, 4, NULL, 1, 70000.00, 70000.00, 'Áo sơ mi nữ', 'SKU4', '2026-03-03 10:50:21');
