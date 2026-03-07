# DDAWNG Store - E-commerce Website

Một trang web thương mại điện tử bán quần áo được xây dựng với Node.js và Express.

## Tính năng

- 🛍️ Sản phẩm đa dạng với danh mục rõ ràng
- 🛒 Giỏ hàng thông minh
- 📱 Responsive design cho mọi thiết bị
- 🎨 Giao diện hiện đại với Tailwind CSS
- ⚡ Tối ưu hiệu suất và trải nghiệm người dùng

## Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **CSS Framework**: Tailwind CSS
- **Template Engine**: EJS
- **Database**: MongoDB (sẽ tích hợp sau)

## Cấu trúc thư mục

```
ddawngStore/
├── src/
│   ├── app.js              # Server chính
│   ├── controllers/        # Controllers
│   ├── models/            # Models
│   ├── routes/            # Routes
│   ├── middleware/        # Middleware
│   └── config/            # Configuration
├── views/
│   ├── home.ejs           # Trang chủ
│   ├── product-detail.ejs # Chi tiết sản phẩm
│   └── cart.ejs           # Giỏ hàng
├── public/
│   ├── css/
│   │   └── style.css      # CSS tùy chỉnh
│   ├── js/
│   │   └── main.js        # JavaScript chính
│   └── images/            # Hình ảnh sản phẩm
├── package.json
└── README.md
```

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd ddawngStore
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Khởi động server:
```bash
# Chạy trong chế độ development
npm run dev

# Hoặc chạy trong chế độ production
npm start
```

4. Mở trình duyệt và truy cập `http://localhost:3000`

## Các trang

### 1. Trang chủ (/)
- Banner quảng cáo sản phẩm mới
- Danh mục sản phẩm với icon
- Sản phẩm nổi bật
- Footer với thông tin liên hệ

### 2. Chi tiết sản phẩm (/product/:id)
- Hình ảnh sản phẩm với gallery
- Thông tin chi tiết sản phẩm
- Chọn size và màu sắc
- Đánh giá và bình luận
- Thêm vào giỏ hàng

### 3. Giỏ hàng (/cart)
- Danh sách sản phẩm trong giỏ
- Cập nhật số lượng
- Mã giảm giá
- Tóm tắt đơn hàng
- Tiến hành thanh toán

## Tính năng nổi bật

### Responsive Design
- Tương thích hoàn hảo trên desktop, tablet và mobile
- Menu điều hướng linh hoạt
- Layout tối ưu cho từng thiết bị

### User Experience
- Animation mượt mà
- Loading states
- Toast notifications
- Smooth scrolling

### Shopping Features
- Thêm/xóa sản phẩm trong giỏ hàng
- Cập nhật số lượng real-time
- Tính toán tổng tiền tự động
- Mã giảm giá và khuyến mãi

## Development

### Thêm sản phẩm mới
1. Thêm hình ảnh vào thư mục `public/images/`
2. Cập nhật dữ liệu sản phẩm trong controller
3. Thêm route nếu cần

### Tùy chỉnh giao diện
- CSS tùy chỉnh trong `public/css/style.css`
- JavaScript trong `public/js/main.js`
- Tailwind CSS được load từ CDN

### Database Integration
Sẽ tích hợp MongoDB trong phiên bản tiếp theo:
- Models trong `src/models/`
- Controllers trong `src/controllers/`
- API endpoints trong `src/routes/`

## Contributing

1. Fork project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the ISC License.

## Liên hệ

- Email: contact@ddawngstore.com
- Website: www.ddawngstore.com
- Hotline: 1900-xxxx

---

© 2024 DDAWNG Store. All rights reserved.
