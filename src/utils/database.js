const { Sequelize } = require('sequelize');

// Database connection helpers
const getDatabaseStats = async (sequelize) => {
    try {
        const stats = {};
        
        // Get table counts
        const [productsCount] = await sequelize.query('SELECT COUNT(*) as count FROM products');
        const [usersCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
        const [ordersCount] = await sequelize.query('SELECT COUNT(*) as count FROM orders');
        const [categoriesCount] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
        
        stats.products = productsCount[0]?.count || 0;
        stats.users = usersCount[0]?.count || 0;
        stats.orders = ordersCount[0]?.count || 0;
        stats.categories = categoriesCount[0]?.count || 0;
        
        return stats;
    } catch (error) {
        console.error('Error getting database stats:', error);
        return {};
    }
};

// Test database connection
const testConnection = async (sequelize) => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Test basic query
        const [result] = await sequelize.query('SELECT 1 as test');
        console.log('✅ Database query test successful:', result[0]);
        
        return { success: true, message: 'Database connection successful' };
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return { success: false, message: error.message };
    }
};

// Format currency helper
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
};

// Generate SKU helper
const generateSKU = (productName, variant = null) => {
    const base = productName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8);
    
    if (variant) {
        const variantStr = variant
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 4);
        return `${base}-${variantStr}`;
    }
    
    return base;
};

// Calculate stock from variants
const calculateStockFromVariants = async (sequelize, productId) => {
    try {
        const [result] = await sequelize.query(`
            SELECT SUM(stock_quantity) as total FROM product_variants WHERE product_id = ?
        `, {
            replacements: [productId]
        });
        
        return result[0]?.total || 0;
    } catch (error) {
        console.error('Error calculating stock:', error);
        return 0;
    }
};

// Update product stock from variants
const updateProductStock = async (sequelize, productId) => {
    try {
        const totalStock = await calculateStockFromVariants(sequelize, productId);
        
        await sequelize.query(`
            UPDATE products SET stock_quantity = ? WHERE id = ?
        `, {
            replacements: [totalStock, productId]
        });
        
        return totalStock;
    } catch (error) {
        console.error('Error updating product stock:', error);
        throw error;
    }
};

// Pagination helper
const getPagination = (page, limit) => {
    const offset = (page - 1) * limit;
    return { limit, offset };
};

// Build where clause helper
const buildWhereClause = (filters) => {
    const conditions = [];
    const replacements = [];
    
    if (filters.categoryId) {
        conditions.push('category_id = ?');
        replacements.push(filters.categoryId);
    }
    
    if (filters.status) {
        conditions.push('status = ?');
        replacements.push(filters.status);
    }
    
    if (filters.priceMin) {
        conditions.push('price >= ?');
        replacements.push(filters.priceMin);
    }
    
    if (filters.priceMax) {
        conditions.push('price <= ?');
        replacements.push(filters.priceMax);
    }
    
    if (filters.search) {
        conditions.push('(name LIKE ? OR description LIKE ?)');
        replacements.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    return { whereClause, replacements };
};

module.exports = {
    getDatabaseStats,
    testConnection,
    formatCurrency,
    generateSKU,
    calculateStockFromVariants,
    updateProductStock,
    getPagination,
    buildWhereClause
};
