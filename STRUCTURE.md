# DDAWNG Store - Project Structure

## 📁 Folder Structure

```
ddawngStore/
├── src/                          # Source code
│   ├── app.js                   # Main application file (OLD - 56KB)
│   ├── app-new.js               # Refactored main file (NEW - smaller)
│   ├── config/                  # Configuration files
│   │   └── database.js          # Database connection config
│   ├── controllers/             # Business logic controllers
│   │   ├── adminController.js   # Admin operations
│   │   ├── customerController.js # Customer operations
│   │   ├── productController.js # Product operations
│   │   └── cartController.js     # Cart operations
│   ├── middleware/              # Custom middleware
│   │   └── auth.js              # Authentication & session middleware
│   ├── models/                  # Sequelize models
│   │   ├── index.js            # Model definitions & relationships
│   │   ├── User.js              # User model
│   │   ├── Product.js           # Product model
│   │   ├── Category.js          # Category model
│   │   ├── Order.js             # Order model
│   │   └── Cart.js              # Cart model
│   ├── routes/                  # Route definitions
│   │   ├── index.js            # Main routes (home, product, cart)
│   │   ├── admin.js            # Admin routes (dashboard, products, orders)
│   │   ├── customer.js         # Customer routes (login, register, profile)
│   │   └── api.js              # API routes (future)
│   └── utils/                   # Utility functions
│       ├── database.js          # Database helpers
│       ├── logger.js            # Logging utilities
│       ├── helpers.js           # Common helper functions
│       └── constants.js         # Application constants
├── views/                       # EJS templates
│   ├── partials/               # Reusable template parts
│   │   ├── header.ejs          # Header navigation
│   │   ├── footer.ejs          # Footer
│   │   └── sidebar.ejs         # Admin sidebar
│   ├── admin/                  # Admin pages
│   │   ├── dashboard.ejs       # Admin dashboard
│   │   ├── products/           # Product management
│   │   ├── orders.ejs          # Order management
│   │   └── customers.ejs       # Customer management
│   ├── customer/               # Customer pages
│   │   ├── login.ejs           # Customer login
│   │   ├── register.ejs        # Customer registration
│   │   ├── profile.ejs         # Customer profile
│   │   └── orders.ejs          # Customer orders
│   └── shop/                   # Shop pages
│       ├── home.ejs            # Homepage
│       ├── product-detail.ejs  # Product detail
│       └── cart.ejs            # Shopping cart
├── public/                     # Static assets
│   ├── css/                    # Stylesheets
│   ├── js/                     # Client-side JavaScript
│   ├── images/                 # Static images
│   └── uploads/                # User uploaded files
└── database/                   # Database files
    ├── setup-database.sql      # Database schema
    └── seed-data.sql           # Initial data
```

## 🗂️ What Each Folder Contains

### 📂 `src/routes/` - Route Definitions
**Purpose**: Define all HTTP routes and their handlers

**Files**:
- `index.js` - Main application routes (home, product detail, cart)
- `admin.js` - Admin panel routes (dashboard, products, orders, customers)
- `customer.js` - Customer authentication and profile routes
- `api.js` - RESTful API endpoints (future)

**Example**:
```javascript
// routes/admin.js
router.get('/dashboard', adminAuth, async (req, res) => {
    // Dashboard logic here
});
```

### 📂 `src/middleware/` - Custom Middleware
**Purpose**: Reusable middleware functions for authentication, validation, etc.

**Files**:
- `auth.js` - Session management, authentication checks
- `upload.js` - File upload handling (multer)
- `validation.js` - Form validation middleware
- `errorHandler.js` - Global error handling

**Example**:
```javascript
// middleware/auth.js
const adminAuth = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }
    next();
};
```

### 📂 `src/controllers/` - Business Logic
**Purpose**: Separate business logic from route definitions

**Files**:
- `adminController.js` - Admin operations (CRUD, statistics)
- `customerController.js` - Customer operations (profile, orders)
- `productController.js` - Product operations (search, filter, details)
- `cartController.js` - Cart operations (add, update, remove)

**Example**:
```javascript
// controllers/productController.js
const getProductById = async (productId) => {
    const [products] = await sequelize.query(`
        SELECT * FROM products WHERE id = ?
    `, { replacements: [productId] });
    return products[0];
};
```

### 📂 `src/utils/` - Utility Functions
**Purpose**: Reusable helper functions and utilities

**Files**:
- `database.js` - Database helpers, connection testing
- `logger.js` - Logging utilities
- `helpers.js` - Common helper functions (formatting, validation)
- `constants.js` - Application constants and configurations

**Example**:
```javascript
// utils/database.js
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
};
```

### 📂 `src/models/` - Database Models
**Purpose**: Sequelize model definitions and relationships

**Files**:
- `index.js` - Model relationships and exports
- `User.js` - User model definition
- `Product.js` - Product model definition
- `Order.js` - Order model definition

**Example**:
```javascript
// models/Product.js
module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        name: DataTypes.STRING,
        price: DataTypes.DECIMAL,
        stock_quantity: DataTypes.INTEGER
    });
    return Product;
};
```

## 🔄 Migration from app.js to New Structure

### Before (app.js - 56KB):
```javascript
// All routes in one file
app.get('/', async (req, res) => { /* 50+ lines */ });
app.get('/admin/dashboard', async (req, res) => { /* 30+ lines */ });
app.get('/customer/login', async (req, res) => { /* 20+ lines */ });
// ... 40+ more routes
```

### After (Split structure):
```javascript
// app-new.js - Main file only
app.use('/', require('./routes'));
app.use('/admin', require('./routes/admin'));
app.use('/customer', require('./routes/customer'));

// routes/index.js - Main routes
router.get('/', async (req, res) => { /* clean code */ });

// routes/admin.js - Admin routes
router.get('/dashboard', adminAuth, async (req, res) => { /* clean code */ });

// routes/customer.js - Customer routes
router.get('/login', async (req, res) => { /* clean code */ });
```

## ✅ Benefits of New Structure

### 🎯 **Maintainability**
- **Separation of Concerns**: Each file has a single responsibility
- **Easier Debugging**: Issues are isolated to specific modules
- **Code Reusability**: Common functions are centralized

### 📈 **Scalability**
- **Modular Growth**: Add new features without touching existing code
- **Team Development**: Multiple developers can work on different modules
- **Testing**: Each module can be tested independently

### 🔧 **Development Experience**
- **Faster Navigation**: Find code quickly with organized structure
- **Better IDE Support**: Improved autocomplete and refactoring
- **Clear Architecture**: Easy to understand for new developers

## 🚀 How to Use New Structure

### 1. Replace app.js:
```bash
# Backup old file
mv src/app.js src/app-old.js

# Use new structure
mv src/app-new.js src/app.js
```

### 2. Add missing routes:
Create additional route files as needed:
```javascript
// src/routes/api.js
const express = require('express');
const router = express.Router();

router.get('/products', async (req, res) => {
    // API logic here
});

module.exports = router;
```

### 3. Create controllers:
Extract business logic to controllers:
```javascript
// src/controllers/productController.js
const getProducts = async (filters = {}) => {
    // Product fetching logic
};

module.exports = { getProducts };
```

## 📝 Next Steps

1. **Complete Migration**: Move all remaining routes from app.js
2. **Add Controllers**: Extract business logic to controller files
3. **Add Tests**: Create unit tests for each module
4. **Add API Routes**: Create RESTful API endpoints
5. **Optimize**: Add caching and performance optimizations

This structure follows Express.js best practices and makes the application much more maintainable and scalable!
