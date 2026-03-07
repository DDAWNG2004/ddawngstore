const { Sequelize } = require('sequelize');

async function createAdminUser() {
    const sequelize = new Sequelize('ddawngstore', 'root', '', { dialect: 'mysql' });
    
    try {
        console.log('🔄 Creating admin user with plain text password...');
        
        // Delete existing admin
        await sequelize.query('DELETE FROM users WHERE email = "admin@ddawngstore.com"');
        
        // Create admin user with plain text password for testing
        const [result] = await sequelize.query(`
            INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        `, {
            replacements: ['admin', 'admin@ddawngstore.com', 'admin123', 'Admin User', 'admin']
        });
        
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@ddawngstore.com');
        console.log('🔑 Password: admin123');
        console.log('🆔 ID:', result.insertId || result[0]);
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdminUser();
