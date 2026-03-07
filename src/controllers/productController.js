const { Product, Category, ProductImage, ProductVariant } = require('../models');

// Get all products for homepage
const getHomeProducts = async (req, res) => {
  try {
    // Get featured products
    const featuredProducts = await Product.findAll({
      where: { featured: true, status: 'active' },
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { is_primary: true },
          required: false
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: 8,
      order: [['created_at', 'DESC']]
    });

    // Get categories for homepage
    const categories = await Category.findAll({
      where: { is_active: true, parent_id: null },
      order: [['sort_order', 'ASC']]
    });

    res.render('home', {
      featuredProducts,
      categories,
      title: 'DDAWNG Store - Thời trang cao cấp'
    });
  } catch (error) {
    console.error('Error loading home products:', error);
    res.status(500).render('error', { message: 'Lỗi tải trang chủ' });
  }
};

// Get product details
const getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findOne({
      where: { id: productId, status: 'active' },
      include: [
        {
          model: ProductImage,
          as: 'images',
          order: [['sort_order', 'ASC']]
        },
        {
          model: ProductVariant,
          as: 'variants',
          order: [['position', 'ASC']]
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!product) {
      return res.status(404).render('error', { message: 'Sản phẩm không tồn tại' });
    }

    // Get related products
    const relatedProducts = await Product.findAll({
      where: { 
        category_id: product.category_id, 
        id: { [require('sequelize').Op.ne]: productId },
        status: 'active'
      },
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { is_primary: true },
          required: false
        }
      ],
      limit: 4,
      order: [['created_at', 'DESC']]
    });

    res.render('product-detail', {
      product,
      relatedProducts,
      title: product.name
    });
  } catch (error) {
    console.error('Error loading product detail:', error);
    res.status(500).render('error', { message: 'Lỗi tải chi tiết sản phẩm' });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const categorySlug = req.params.slug;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const category = await Category.findOne({
      where: { slug: categorySlug, is_active: true }
    });

    if (!category) {
      return res.status(404).render('error', { message: 'Danh mục không tồn tại' });
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: { category_id: category.id, status: 'active' },
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { is_primary: true },
          required: false
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.render('category', {
      products,
      category,
      currentPage: page,
      totalPages,
      totalProducts: count,
      title: category.name
    });
  } catch (error) {
    console.error('Error loading category products:', error);
    res.status(500).render('error', { message: 'Lỗi tải sản phẩm theo danh mục' });
  }
};

module.exports = {
  getHomeProducts,
  getProductDetail,
  getProductsByCategory
};
