const { Sequelize } = require('sequelize');

async function checkAndCreateAdmin() {
    const sequelize = new Sequelize('ddawngstore', 'root', '', { dialect: 'mysql' });
    
    try {
        console.log('🔍 Checking admin users...');
        
        // Check existing admin users
        const [admins] = await sequelize.query('SELECT * FROM users WHERE role = "admin"');
        
        console.log(`📊 Found ${admins.length} admin users:`);
        admins.forEach(admin => {
            console.log(`  - ID: ${admin.id}, Email: ${admin.email}, Name: ${admin.full_name}`);
        });
        
        if (admins.length === 0) {
            console.log('⚠️ No admin found. Creating admin user...');
            
            // Create admin user
            const [result] = await sequelize.query(`
                INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
            `, {
                replacements: ['admin', 'admin@ddawngstore.com', 'admin123', 'Admin User', 'admin']
            });
            
            console.log('✅ Admin user created successfully!');
            console.log('📧 Email: admin@ddawngstore.com');
            console.log('🔑 Password: admin123');
        } else {
            console.log('✅ Admin users already exist');
            admins.forEach(admin => {
                console.log(`📧 Email: ${admin.email}`);
                console.log(`🔑 Password: ${admin.password_hash} (stored in database)`);
            });
        }
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAndCreateAdmin();
