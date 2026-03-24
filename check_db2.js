const mysql = require('mysql2/promise');

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'ddawngstore'
        });

        const [rows] = await connection.query('SELECT * FROM product_images WHERE product_id = 1');
        console.log("=== IMAGES FOR PRD 1 ===");
        console.log(JSON.stringify(rows, null, 2));

        const [product] = await connection.query('SELECT * FROM products WHERE id = 1');
        console.log("\n=== PRODUCT 1 ===");
        console.log(JSON.stringify(product, null, 2));


        await connection.end();
    } catch (err) {
        console.error("DB Error:", err);
    }
}

check();
