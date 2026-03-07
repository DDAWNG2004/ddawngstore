const mysql = require('mysql2/promise');
const fs = require('fs');

// Database configuration
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'ddawngstore',
    charset: 'utf8mb4'
};

async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...\n');
    
    let connection;
    
    try {
        // 1. Test connection
        console.log('📋 Attempting to connect...');
        connection = await mysql.createConnection(dbConfig);
        await connection.connect();
        console.log('✅ Connected to MySQL successfully!\n');
        
        // 2. Get server info
        console.log('📋 MySQL Server Information:');
        const [serverInfo] = await connection.execute('SELECT VERSION() as version, NOW() as current_time');
        console.log(`   - MySQL Version: ${serverInfo[0].version}`);
        console.log(`   - Current Time: ${serverInfo[0].current_time}\n`);
        
        // 3. List all databases
        console.log('📋 Available Databases:');
        const [databases] = await connection.execute('SHOW DATABASES');
        databases.forEach(db => {
            console.log(`   - ${db.Database}`);
        });
        console.log('');
        
        // 4. Check if ddawngstore exists
        console.log('📋 Checking ddawngstore database...');
        const [ddawngstoreCheck] = await connection.execute('SHOW TABLES FROM ddawngstore');
        if (ddawngstoreCheck.length > 0) {
            console.log('✅ ddawngstore database exists!');
            console.log(`   - Tables found: ${ddawngstoreCheck.length}\n`);
            
            // 5. Get table structures
            console.log('📋 Table Structures in ddawngstore:');
            
            for (const table of ddawngstoreCheck) {
                const tableName = table[`Tables_in_ddawngstore`];
                console.log(`\n📋 Table: ${tableName}`);
                
                // Get table structure
                const [structure] = await connection.execute(`DESCRIBE ddawngstore.${tableName}`);
                structure.forEach(column => {
                    console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${column.Key ? `(${column.Key})` : ''}`);
                });
                
                // Get row count
                const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ddawngstore.${tableName}`);
                console.log(`   - Rows: ${count[0].count}`);
            }
            
        } else {
            console.log('❌ ddawngstore database does not exist or has no tables!\n');
        }
        
        // 6. Test permissions
        console.log('📋 Testing Permissions...');
        try {
            await connection.execute('CREATE TABLE test_permissions (id INT)');
            console.log('✅ CREATE permission: OK');
            await connection.execute('DROP TABLE test_permissions');
            console.log('✅ DROP permission: OK');
            await connection.execute('INSERT INTO ddawngstore.products (name) VALUES ("test")');
            await connection.execute('DELETE FROM ddawngstore.products WHERE name = "test"');
            console.log('✅ INSERT/DELETE permission: OK');
        } catch (permError) {
            console.log('❌ Permission error:', permError.message);
        }
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('❌ Error details:', error);
        
        // Check common issues
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Possible solutions:');
            console.log('   1. Make sure XAMPP MySQL is running');
            console.log('   2. Check MySQL port (usually 3306)');
            console.log('   3. Verify MySQL user and password');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Possible solutions:');
            console.log('   1. Check MySQL user credentials');
            console.log('   2. Grant proper permissions to user');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 Possible solutions:');
            console.log('   1. Create ddawngstore database');
            console.log('   2. Check database name spelling');
        }
        
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Connection closed');
        }
    }
}

// Run the test
testDatabaseConnection();
