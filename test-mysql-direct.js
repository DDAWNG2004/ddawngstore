const mysql = require('mysql');

// Direct MySQL connection test
console.log('🔍 Direct MySQL Connection Test\n');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'ddawngstore'
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err);
        console.error('❌ Error code:', err.code);
        console.error('❌ Error message:', err.message);
        
        // Detailed error analysis
        console.log('\n📋 Error Analysis:');
        
        if (err.code === 'ECONNREFUSED') {
            console.log('   - Connection refused (MySQL not running)');
            console.log('   - Solution: Start MySQL in XAMPP');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('   - Access denied (wrong credentials)');
            console.log('   - Solution: Check username/password');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('   - Database doesn\'t exist');
            console.log('   - Solution: Create ddawngstore database');
        } else if (err.code === 'ENOTFOUND') {
            console.log('   - Host not found');
            console.log('   - Solution: Check MySQL server address');
        }
        
        return;
    }
    
    console.log('✅ Connected to MySQL successfully!\n');
    
    // Test basic operations
    console.log('📋 Testing Database Operations...');
    
    // 1. List databases
    connection.query('SHOW DATABASES', (err, results) => {
        if (err) {
            console.error('❌ Error listing databases:', err);
        } else {
            console.log('✅ Available databases:');
            results.forEach(db => {
                console.log(`   - ${db.Database}`);
            });
        }
    });
    
    // 2. Use ddawngstore database
    connection.query('USE ddawngstore', (err) => {
        if (err) {
            console.error('❌ Error using ddawngstore:', err);
        } else {
            console.log('✅ Using ddawngstore database');
            
            // 3. List tables
            connection.query('SHOW TABLES', (err, results) => {
                if (err) {
                    console.error('❌ Error listing tables:', err);
                } else {
                    console.log('✅ Tables in ddawngstore:');
                    results.forEach(table => {
                        const tableName = table[`Tables_in_ddawngstore`];
                        console.log(`   - ${tableName}`);
                    });
                    
                    // 4. Test products table structure
                    connection.query('DESCRIBE products', (err, results) => {
                        if (err) {
                            console.error('❌ Error describing products table:', err);
                        } else {
                            console.log('\n✅ Products table structure:');
                            results.forEach(column => {
                                console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${column.Key ? `(${column.Key})` : ''}`);
                            });
                        }
                    });
                }
            });
        }
    });
    
    // Close connection
    connection.end((err) => {
        if (err) {
            console.error('❌ Error closing connection:', err);
        } else {
            console.log('\n✅ Connection closed successfully');
        }
    });
});
