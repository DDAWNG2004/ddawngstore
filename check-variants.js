const { Sequelize } = require('sequelize');

async function checkVariantsTable() {
    const sequelize = new Sequelize('ddawngstore', 'root', '', { dialect: 'mysql' });
    
    try {
        console.log('🔍 Checking product_variants table structure...');
        
        const [variants] = await sequelize.query('DESCRIBE product_variants');
        console.log('📋 Product variants table structure:');
        variants.forEach(field => {
            console.log(`  - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkVariantsTable();
