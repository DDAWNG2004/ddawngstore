# Hướng dẫn xử lý hình ảnh cho DDAWNG Store

## Vấn đề hiện tại
Database đã được tạo với URL hình ảnh mẫu, nhưng chưa có file ảnh thực tế trong thư mục `public/images/`.

## Giải pháp

### Cách 1: Sử dụng hình ảnh placeholder (Nhanh nhất)

1. **Mở file `download-images.html` trong trình duyệt**
   - Double-click vào file hoặc mở với: `http://localhost:3000/download-images.html`

2. **Tải hình ảnh**
   - Nhấp vào các nút "Tải hình ảnh" cho mỗi sản phẩm
   - Lưu tất cả file vào thư mục `public/images/`

3. **Cập nhật database**
   - Mở phpMyAdmin
   - Chạy file `update-images.sql` để cập nhật URL trong database

### Cách 2: Sử dụng URL online (Không cần tải file)

Chạy trực tiếp file `update-images-online.sql` trong phpMyAdmin:

```sql
-- Cập nhật với URL từ Picsum Photos
UPDATE product_images SET image_url = 'https://picsum.photos/seed/vay-hoa-nhi/800/800.jpg' WHERE product_id = 1 AND is_primary = TRUE;
-- ... và các câu lệnh khác
```

### Cách 3: Tự thêm hình ảnh thực tế

1. **Chuẩn bị hình ảnh**
   - Kích thước đề xuất: 800x800px (hình chính), 600x600px (chi tiết)
   - Định dạng: JPG, PNG, WebP
   - Tối ưu hóa cho web

2. **Đặt tên file theo quy tắc**
   - Hình chính: `product-[id].jpg`
   - Hình chi tiết: `product-detail-[number].jpg`
   - Hình danh mục: `category-[id].jpg`

3. **Thêm vào thư mục**
   - Copy vào `public/images/`

4. **Cập nhật database**
   ```sql
   UPDATE product_images SET image_url = '/images/product1.jpg' WHERE product_id = 1 AND is_primary = TRUE;
   ```

## File đã tạo cho bạn

1. **`download-images.html`** - Trang web để tải hình ảnh placeholder
2. **`update-images.sql`** - SQL để cập nhật với local images
3. **`create-placeholders.js`** - Script tạo URL placeholder
4. **`public/images/placeholder.txt`** - Hướng dẫn thêm hình ảnh

## Kiểm tra sau khi thêm

1. Khởi động server: `npm start`
2. Truy cập `http://localhost:3000`
3. Kiểm tra xem hình ảnh có hiển thị không

## Lưu ý quan trọng

- Nếu dùng URL online, website sẽ load chậm hơn
- Nếu dùng local images, đảm bảo file tồn tại trong đúng thư mục
- Nên backup database trước khi chạy các query update
- Có thể xóa cache browser nếu hình ảnh không cập nhật

## Kích thước hình ảnh đề xuất

- **Thumbnail**: 300x300px
- **Product list**: 400x400px  
- **Product detail**: 800x800px
- **Category banner**: 400x300px

Chúc bạn thành công!
