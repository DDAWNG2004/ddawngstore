// Script để tạo placeholder images cho sản phẩm
// Chạy script này trong browser console hoặc tạo file HTML

const createPlaceholderImages = () => {
    const products = [
        { id: 1, name: 'vay-hoa-nhi-vintage', seed: 'vay-hoa-nhi' },
        { id: 2, name: 'ao-so-mi-trang', seed: 'ao-so-mi' },
        { id: 3, name: 'quan-jeans-slim', seed: 'quan-jeans' },
        { id: 4, name: 'dam-cong-so', seed: 'dam-cong-so' }
    ];

    const categories = [
        { id: 1, name: 'vay-nu', seed: 'vay-nu' },
        { id: 2, name: 'ao-so-mi', seed: 'ao-so-mi' },
        { id: 3, name: 'quan', seed: 'quan' },
        { id: 4, name: 'phu-kien', seed: 'phu-kien' }
    ];

    console.log('=== Placeholder Image URLs ===');
    
    console.log('\n--- Product Images ---');
    products.forEach(product => {
        console.log(`Product ${product.id} - ${product.name}:`);
        console.log(`Main: https://picsum.photos/seed/${product.seed}/800/800.jpg`);
        console.log(`Detail 1: https://picsum.photos/seed/${product.seed}-1/600/600.jpg`);
        console.log(`Detail 2: https://picsum.photos/seed/${product.seed}-2/600/600.jpg`);
        console.log(`Detail 3: https://picsum.photos/seed/${product.seed}-3/600/600.jpg`);
        console.log(`Detail 4: https://picsum.photos/seed/${product.seed}-4/600/600.jpg`);
        console.log('');
    });

    console.log('\n--- Category Images ---');
    categories.forEach(category => {
        console.log(`Category ${category.id} - ${category.name}:`);
        console.log(`https://picsum.photos/seed/${category.seed}/400/300.jpg`);
        console.log('');
    });

    console.log('\n=== SQL Update Queries ===');
    console.log('Copy và paste các query sau vào phpMyAdmin để cập nhật database:\n');

    // Update product images
    products.forEach(product => {
        console.log(`-- Update images for product ${product.id}`);
        console.log(`UPDATE product_images SET image_url = 'https://picsum.photos/seed/${product.seed}/800/800.jpg' WHERE product_id = ${product.id} AND is_primary = TRUE;`);
        console.log(`UPDATE product_images SET image_url = 'https://picsum.photos/seed/${product.seed}-1/600/600.jpg' WHERE product_id = ${product.id} AND sort_order = 1;`);
        console.log(`UPDATE product_images SET image_url = 'https://picsum.photos/seed/${product.seed}-2/600/600.jpg' WHERE product_id = ${product.id} AND sort_order = 2;`);
        console.log('');
    });

    // Update category images
    categories.forEach(category => {
        console.log(`-- Update image for category ${category.id}`);
        console.log(`UPDATE categories SET image = 'https://picsum.photos/seed/${category.seed}/400/300.jpg' WHERE id = ${category.id};`);
        console.log('');
    });
};

// Run function
createPlaceholderImages();
