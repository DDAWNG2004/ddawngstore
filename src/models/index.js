const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductVariant = require('./ProductVariant');
const Cart = require('./Cart');

// Define associations
const models = {
  User,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Cart,
  sequelize
};

// Product associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });

Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });

Cart.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
ProductVariant.hasMany(Cart, { foreignKey: 'variant_id', as: 'cartItems' });

// Export models and sequelize instance
module.exports = models;
