const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'ddawngstore'
    });

    const [rows] = await connection.query('SELECT * FROM product_images WHERE product_id = 1');
    console.log(JSON.stringify(rows, null, 2));

    await connection.end();
}

check().catch(console.error);
