const { Sequelize } = require('sequelize');

async function checkSizesTable() {
    const sequelize = new Sequelize('ddawngstore', 'root', '', { dialect: 'mysql' });
    
    try {
        console.log('🔍 Checking sizes table structure...');
        
        const [sizes] = await sequelize.query('DESCRIBE sizes');
        console.log('📏 Sizes table structure:');
        sizes.forEach(field => {
            console.log(`  - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        // Also check colors table
        const [colors] = await sequelize.query('DESCRIBE colors');
        console.log('\n🎨 Colors table structure:');
        colors.forEach(field => {
            console.log(`  - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkSizesTable();
