-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 07, 2026 lúc 09:41 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ddawngstore`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `session_id`, `product_id`, `variant_id`, `quantity`, `created_at`, `updated_at`) VALUES
(16, 4, NULL, 5, NULL, 1, '2026-03-03 15:08:15', '2026-03-03 15:08:15'),
(17, 4, NULL, 3, NULL, 1, '2026-03-03 15:08:27', '2026-03-03 15:08:27'),
(18, 3, NULL, 5, NULL, 1, '2026-03-03 15:08:55', '2026-03-03 15:08:55'),
(19, 3, NULL, 2, NULL, 2, '2026-03-04 13:45:30', '2026-03-04 13:45:30');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Áo', 'Các loại áo thời trang', 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(2, 'Quần', 'Các loại quần thời trang', 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(3, 'Váy', 'Các loại váy thời trang', 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(4, 'Phụ kiện', 'Các loại phụ kiện thời trang', 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `colors`
--

CREATE TABLE `colors` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `hex_code` varchar(7) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `colors`
--

INSERT INTO `colors` (`id`, `name`, `hex_code`, `status`, `created_at`) VALUES
(1, 'Đen', '#000000', 'active', '2026-03-01 13:50:16'),
(2, 'Trắng', '#FFFFFF', 'active', '2026-03-01 13:50:16'),
(3, 'Đỏ', '#FF0000', 'active', '2026-03-01 13:50:16'),
(4, 'Xanh dương', '#0000FF', 'active', '2026-03-01 13:50:16'),
(5, 'Xanh lá', '#00FF00', 'active', '2026-03-01 13:50:16'),
(6, 'Vàng', '#FFFF00', 'active', '2026-03-01 13:50:16'),
(7, 'Hồng', '#FFC0CB', 'active', '2026-03-01 13:50:16'),
(8, 'Tím', '#800080', 'active', '2026-03-01 13:50:16'),
(9, 'Xám', '#808080', 'active', '2026-03-01 13:50:16'),
(10, 'Nâu', '#8B4513', 'active', '2026-03-01 13:50:16'),
(11, 'Be', '#F5F5DC', 'active', '2026-03-01 13:50:16'),
(12, 'Kem', '#FFFDD0', 'active', '2026-03-01 13:50:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('fixed','percentage') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_amount` decimal(10,2) DEFAULT NULL,
  `maximum_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `minimum_amount`, `maximum_discount`, `usage_limit`, `usage_count`, `is_active`, `starts_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10.00, 500000.00, NULL, 100, 0, 1, NULL, NULL, '2026-02-27 13:38:33', '2026-02-27 13:38:33'),
(2, 'FREESHIP', 'Miễn phí vận chuyển', 'Miễn phí vận chuyển cho đơn hàng từ 500K', 'fixed', 30000.00, 500000.00, NULL, 200, 0, 1, NULL, NULL, '2026-02-27 13:38:33', '2026-02-27 13:38:33'),
(3, 'SALE20', 'Giảm giá đặc biệt', 'Giảm 20% cho các sản phẩm được chọn', 'percentage', 20.00, 1000000.00, NULL, 50, 0, 1, NULL, NULL, '2026-02-27 13:38:33', '2026-02-27 13:38:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `shipping_amount` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'VND',
  `shipping_name` varchar(100) NOT NULL,
  `shipping_email` varchar(100) NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_country` varchar(100) DEFAULT 'Vietnam',
  `shipping_postal_code` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `status`, `payment_status`, `payment_method`, `subtotal`, `tax_amount`, `shipping_amount`, `discount_amount`, `total_amount`, `currency`, `shipping_name`, `shipping_email`, `shipping_phone`, `shipping_address`, `shipping_city`, `shipping_country`, `shipping_postal_code`, `notes`, `admin_notes`, `created_at`, `updated_at`) VALUES
(1, 'ORD-2024-001', 3, 'delivered', 'paid', 'credit_card', 250000.00, 25000.00, 30000.00, 0.00, 305000.00, 'VND', 'Nguyễn Văn An', 'an.nguyen@email.com', '0912345678', '123 Đường ABC, Quận 1, TP.HCM', 'Ho Chi Minh City', 'Vietnam', NULL, 'Giao hàng vào buổi sáng', NULL, '2026-03-03 10:50:21', '2026-03-03 10:50:21'),
(2, 'ORD-2024-002', 4, 'processing', 'paid', 'bank_transfer', 180000.00, 18000.00, 30000.00, 10000.00, 218000.00, 'VND', 'Trần Thị Bình', 'binh.tran@email.com', '0923456789', '456 Đường XYZ, Quận 3, TP.HCM', 'Ho Chi Minh City', 'Vietnam', NULL, 'Gọi điện trước khi giao', NULL, '2026-03-03 10:50:21', '2026-03-03 10:50:21'),
(3, 'ORD-2024-003', 5, 'pending', 'pending', 'cod', 420000.00, 42000.00, 30000.00, 20000.00, 472000.00, 'VND', 'Lê Hoàng Long', 'long.le@email.com', '0934567890', '789 Đường DEF, Quận 5, TP.HCM', 'Ho Chi Minh City', 'Vietnam', NULL, 'Khách hàng yêu cầu đóng gói cẩn thận', NULL, '2026-03-03 10:50:21', '2026-03-03 10:50:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `variant_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variant_info`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category_id`, `stock_quantity`, `sku`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Váy hoa vintage', 'Váy hoa nhí phong cách vintage, chất liệu cotton mềm mại', 450000.00, 3, 0, 'SKU1', 'active', '2026-03-01 13:50:16', '2026-03-04 14:27:01'),
(2, 'Áo thun basic', 'Áo thun basic unisex, chất liệu 100% cotton', 150000.00, 1, 165, 'SKU2', 'active', '2026-03-01 13:50:16', '2026-03-01 15:05:06'),
(3, 'Quần jeans slimfit', 'Quần jeans dáng slimfit, co giãn nhẹ', 350000.00, 2, 75, 'QU-JNS-001', 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(4, 'Váy công sở', 'Váy công sở thanh lịch, phù hợp môi trường văn phòng', 550000.00, 3, 30, 'VAY-CSO-001', 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(5, 'Áo sơ mi trắng', 'Áo sơ mi trắng classic, chất liệu lụa cao cấp', 250000.00, 1, 80, 'AO-SMI-001', 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(6, 'Quần kaki', 'Quần kaki form dáng, chất liệu thoáng mát', 320000.00, 2, 60, 'QU-KKI-001', 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(7, 'Váy maxi', 'Váy maxi hoa lá, phong cách bohemian', 480000.00, 3, 0, 'SKU7', 'active', '2026-03-01 13:50:16', '2026-03-02 13:53:42'),
(8, 'Áo polo', 'Áo polo thể thao, co giãn tốt', 180000.00, 1, 0, 'SKU8', 'active', '2026-03-01 13:50:16', '2026-03-03 15:21:56');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `created_at`) VALUES
(1, 1, 'https://picsum.photos/seed/vay1/400/500.jpg', 1, '2026-03-01 13:50:16'),
(2, 2, 'https://picsum.photos/seed/ao1/400/500.jpg', 1, '2026-03-01 13:50:16'),
(3, 3, 'https://picsum.photos/seed/quan1/400/500.jpg', 1, '2026-03-01 13:50:16'),
(4, 4, 'https://picsum.photos/seed/vay2/400/500.jpg', 1, '2026-03-01 13:50:16'),
(5, 5, 'https://picsum.photos/seed/ao2/400/500.jpg', 1, '2026-03-01 13:50:16'),
(6, 6, 'https://picsum.photos/seed/quan2/400/500.jpg', 1, '2026-03-01 13:50:16'),
(7, 7, 'https://picsum.photos/seed/vay3/400/500.jpg', 1, '2026-03-01 13:50:16'),
(8, 8, 'https://picsum.photos/seed/ao3/400/500.jpg', 1, '2026-03-01 13:50:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size_id` int(11) NOT NULL,
  `color_id` int(11) NOT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `sku` varchar(100) DEFAULT NULL,
  `price_adjustment` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `size_id`, `color_id`, `stock_quantity`, `sku`, `price_adjustment`, `status`, `created_at`, `updated_at`) VALUES
(13, 3, 2, 1, 15, 'QU-JNS-001-S-BLK', 0.00, 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(14, 3, 3, 1, 20, 'QU-JNS-001-M-BLK', 0.00, 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(15, 3, 4, 1, 15, 'QU-JNS-001-L-BLK', 0.00, 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(16, 3, 5, 1, 10, 'QU-JNS-001-XL-BLK', 0.00, 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(17, 3, 3, 10, 15, 'QU-JNS-001-M-BLU', 0.00, 'active', '2026-03-01 13:50:16', '2026-03-01 13:50:16'),
(70, 2, 1, 1, 25, 'AO-BSC-001-XS-BLK', 0.00, 'active', '2026-03-01 15:05:06', '2026-03-01 15:05:06'),
(71, 2, 2, 1, 30, 'AO-BSC-001-S-BLK', 0.00, 'active', '2026-03-01 15:05:06', '2026-03-01 15:05:06'),
(72, 2, 3, 1, 35, 'AO-BSC-001-M-BLK', 0.00, 'active', '2026-03-01 15:05:06', '2026-03-01 15:05:06'),
(73, 2, 3, 2, 20, 'AO-BSC-001-M-WHT', 0.00, 'active', '2026-03-01 15:05:06', '2026-03-01 15:05:06'),
(74, 2, 4, 1, 30, 'AO-BSC-001-L-BLK', 0.00, 'active', '2026-03-01 15:05:06', '2026-03-01 15:05:06'),
(75, 2, 5, 1, 25, 'AO-BSC-001-XL-BLK', 0.00, 'active', '2026-03-01 15:05:06', '2026-03-01 15:05:06');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(200) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 1,
  `helpful_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sizes`
--

CREATE TABLE `sizes` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sizes`
--

INSERT INTO `sizes` (`id`, `name`, `description`, `sort_order`, `status`, `created_at`) VALUES
(1, 'XS', 'Extra Small', 1, 'active', '2026-03-01 13:50:16'),
(2, 'S', 'Small', 2, 'active', '2026-03-01 13:50:16'),
(3, 'M', 'Medium', 3, 'active', '2026-03-01 13:50:16'),
(4, 'L', 'Large', 4, 'active', '2026-03-01 13:50:16'),
(5, 'XL', 'Extra Large', 5, 'active', '2026-03-01 13:50:16'),
(6, 'XXL', 'Double Extra Large', 6, 'active', '2026-03-01 13:50:16'),
(7, '3XL', 'Triple Extra Large', 7, 'active', '2026-03-01 13:50:16'),
(8, 'OS', 'One Size', 8, 'active', '2026-03-01 13:50:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `address`, `avatar`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'admin', 'admin@ddawngstore.com', 'admin123', 'Admin User', NULL, NULL, NULL, 'admin', 1, '2026-03-03 10:39:25', '2026-03-03 10:39:25'),
(3, 'an.nguyen', 'an.nguyen@email.com', '123456', 'Nguyễn Văn An', '0912345678', NULL, NULL, 'user', 1, '2026-03-03 10:43:57', '2026-03-03 10:43:57'),
(4, 'binh.tran', 'binh.tran@email.com', '123456', 'Trần Thị Bình', '0923456789', NULL, NULL, 'user', 1, '2026-03-03 10:43:57', '2026-03-03 10:43:57'),
(5, 'long.le', 'long.le@email.com', '123456', 'Lê Hoàng Long', '0934567890', NULL, NULL, 'user', 1, '2026-03-03 10:43:57', '2026-03-03 10:43:57'),
(6, 'mai.pham', 'mai.pham@email.com', '123456', 'Phạm Thúy Mai', '0945678901', NULL, NULL, 'user', 1, '2026-03-03 10:43:57', '2026-03-03 10:43:57'),
(7, 'NVA', 'NVA@gmail.com', '123456', 'Nguyễn Văn A', '0111111111', NULL, NULL, 'user', 1, '2026-03-05 09:27:47', '2026-03-05 09:27:47');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`,`variant_id`),
  ADD UNIQUE KEY `unique_cart_session` (`session_id`,`product_id`,`variant_id`),
  ADD KEY `idx_cart_user` (`user_id`),
  ADD KEY `idx_cart_session` (`session_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_orders_user` (`user_id`),
  ADD KEY `idx_orders_status` (`status`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_variant` (`product_id`,`size_id`,`color_id`),
  ADD KEY `size_id` (`size_id`),
  ADD KEY `color_id` (`color_id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reviews_product` (`product_id`),
  ADD KEY `idx_reviews_user` (`user_id`);

--
-- Chỉ mục cho bảng `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `email_3` (`email`);

--
-- Chỉ mục cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist_item` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `colors`
--
ALTER TABLE `colors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_7` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_ibfk_8` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_ibfk_9` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`);

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variants_ibfk_2` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variants_ibfk_3` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
