const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  compare_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  size: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  color_code: {
    type: DataTypes.STRING(7),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'product_variants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Virtual field for formatted price
ProductVariant.prototype.getFormattedPrice = function() {
  const price = this.price || this.Product?.price;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

module.exports = ProductVariant;
