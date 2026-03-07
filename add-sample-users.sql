-- Thêm dữ liệu mẫu cho users (customers)
-- Mật khẩu: 123456 cho tất cả tài khoản

INSERT INTO users (first_name, last_name, email, password, phone, role, status) VALUES 
('Nguyễn', 'Văn An', 'an.nguyen@email.com', '123456', '0912345678', 'customer', 'active'),
('Trần', 'Thị Bình', 'binh.tran@email.com', '123456', '0923456789', 'customer', 'active'),
('Lê', 'Hoàng Long', 'long.le@email.com', '123456', '0934567890', 'customer', 'active'),
('Phạm', 'Thúy Mai', 'mai.pham@email.com', '123456', '0945678901', 'customer', 'active'),
('Hoàng', 'Minh Quân', 'quan.hoang@email.com', '123456', '0956789012', 'customer', 'active'),
('Đỗ', 'Thị Hà', 'ha.do@email.com', '123456', '0967890123', 'customer', 'active'),
('Vũ', 'Thanh Tùng', 'tung.vu@email.com', '123456', '0978901234', 'customer', 'active'),
('Bùi', 'Gia Hân', 'han.bui@email.com', '123456', '0989012345', 'customer', 'active');

-- Hiển thị tất cả users đã thêm
SELECT id, CONCAT(first_name, ' ', last_name) as full_name, email, phone, role, status FROM users WHERE role = 'customer';
