const { Cart, Product, ProductVariant, ProductImage } = require('../models');

// Get cart items
const getCart = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const sessionId = req.sessionID;

    let cartItems;
    
    if (userId) {
      cartItems = await Cart.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: require('./ProductImage'),
                as: 'images',
                where: { is_primary: true },
                required: false
              }
            ]
          },
          {
            model: ProductVariant,
            as: 'variant'
          }
        ]
      });
    } else {
      cartItems = await Cart.findAll({
        where: { session_id: sessionId },
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: require('./ProductImage'),
                as: 'images',
                where: { is_primary: true },
                required: false
              }
            ]
          },
          {
            model: ProductVariant,
            as: 'variant'
          }
        ]
      });
    }

    // Calculate totals
    let subtotal = 0;
    const cartItemsWithTotals = cartItems.map(item => {
      const price = item.variant?.price || item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      return {
        ...item.toJSON(),
        price,
        itemTotal,
        formattedPrice: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(price),
        formattedItemTotal: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(itemTotal)
      };
    });

    const shipping = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shipping;

    res.render('cart', {
      cartItems: cartItemsWithTotals,
      subtotal,
      shipping,
      total,
      formattedSubtotal: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(subtotal),
      formattedShipping: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(shipping),
      formattedTotal: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(total),
      title: 'Giỏ hàng'
    });
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).render('error', { message: 'Lỗi tải giỏ hàng' });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.session.user?.id;
    const sessionId = req.sessionID;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Check variant if provided
    if (variantId) {
      const variant = await ProductVariant.findByPk(variantId);
      if (!variant || variant.product_id !== productId) {
        return res.status(404).json({ success: false, message: 'Biến thể sản phẩm không tồn tại' });
      }
    }

    // Check if item already exists in cart
    const whereClause = userId 
      ? { user_id: userId, product_id: productId, variant_id: variantId }
      : { session_id: sessionId, product_id: productId, variant_id: variantId };

    const existingCartItem = await Cart.findOne({ where: whereClause });

    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += parseInt(quantity);
      await existingCartItem.save();
    } else {
      // Create new cart item
      const cartData = {
        product_id: productId,
        quantity: parseInt(quantity)
      };

      if (userId) {
        cartData.user_id = userId;
      } else {
        cartData.session_id = sessionId;
      }

      if (variantId) {
        cartData.variant_id = variantId;
      }

      await Cart.create(cartData);
    }

    // Get updated cart count
    const cartCount = await Cart.sum('quantity', {
      where: userId ? { user_id: userId } : { session_id: sessionId }
    });

    res.json({ 
      success: true, 
      message: 'Đã thêm vào giỏ hàng',
      cartCount: cartCount || 0
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Lỗi thêm vào giỏ hàng' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.session.user?.id;
    const sessionId = req.sessionID;

    const whereClause = { id: itemId };
    if (userId) {
      whereClause.user_id = userId;
    } else {
      whereClause.session_id = sessionId;
    }

    const cartItem = await Cart.findOne({ where: whereClause });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
    }

    if (quantity <= 0) {
      await cartItem.destroy();
    } else {
      cartItem.quantity = parseInt(quantity);
      await cartItem.save();
    }

    res.json({ success: true, message: 'Cập nhật giỏ hàng thành công' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật giỏ hàng' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.session.user?.id;
    const sessionId = req.sessionID;

    const whereClause = { id: itemId };
    if (userId) {
      whereClause.user_id = userId;
    } else {
      whereClause.session_id = sessionId;
    }

    const cartItem = await Cart.findOne({ where: whereClause });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
    }

    await cartItem.destroy();

    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa khỏi giỏ hàng' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
