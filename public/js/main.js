// Main JavaScript file for DDAWNG Store

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart functionality
    initializeCart();
    
    // Initialize image gallery
    initializeImageGallery();
    
    // Initialize quantity selectors
    initializeQuantitySelectors();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize smooth scroll for anchor links
    initializeSmoothScroll();
    
    // Initialize toast notifications
    initializeToastNotifications();
});

// Cart functionality
function initializeCart() {
    const cartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    
    cartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            
            // Add to cart logic here
            addToCart(productId, productName);
            
            // Update cart count
            if (cartCount) {
                const currentCount = parseInt(cartCount.textContent);
                cartCount.textContent = currentCount + 1;
            }
            
            // Show success notification
            showToast(`${productName} đã được thêm vào giỏ hàng!`, 'success');
        });
    });
}

// Add to cart function
function addToCart(productId, productName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            quantity: 1,
            price: 0 // You would get this from the product data
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Image gallery functionality
function initializeImageGallery() {
    const thumbnails = document.querySelectorAll('.image-gallery img');
    const mainImage = document.querySelector('.main-product-image');
    
    if (thumbnails.length > 0 && mainImage) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked thumbnail
                this.classList.add('active');
                
                // Update main image
                mainImage.src = this.src;
            });
        });
    }
}

// Quantity selector functionality
function initializeQuantitySelectors() {
    const quantitySelectors = document.querySelectorAll('.quantity-selector');
    
    quantitySelectors.forEach(selector => {
        const minusBtn = selector.querySelector('.minus');
        const plusBtn = selector.querySelector('.plus');
        const input = selector.querySelector('input');
        
        if (minusBtn && plusBtn && input) {
            minusBtn.addEventListener('click', function() {
                const currentValue = parseInt(input.value);
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                    updateQuantity(input);
                }
            });
            
            plusBtn.addEventListener('click', function() {
                const currentValue = parseInt(input.value);
                input.value = currentValue + 1;
                updateQuantity(input);
            });
            
            input.addEventListener('change', function() {
                const value = parseInt(this.value);
                if (isNaN(value) || value < 1) {
                    this.value = 1;
                }
                updateQuantity(this);
            });
        }
    });
}

// Update quantity function
function updateQuantity(input) {
    const productId = input.dataset.productId;
    const quantity = parseInt(input.value);
    
    // Update cart in localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart total if on cart page
        updateCartTotal();
    }
}

// Update cart total
function updateCartTotal() {
    const cartItems = document.querySelectorAll('.cart-item');
    let total = 0;
    
    cartItems.forEach(item => {
        const price = parseFloat(item.dataset.price);
        const quantity = parseInt(item.querySelector('.quantity-input').value);
        total += price * quantity;
    });
    
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Smooth scroll functionality
function initializeSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Toast notification functionality
function initializeToastNotifications() {
    // Toast container will be created dynamically
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            
            if (query.length > 2) {
                // Perform search here
                performSearch(query);
            } else {
                searchResults.classList.add('hidden');
            }
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }
}

// Perform search function
function performSearch(query) {
    // This would typically make an API call to search products
    // For now, we'll just show/hide the results container
    const searchResults = document.querySelector('.search-results');
    
    // Simulate search results
    setTimeout(() => {
        searchResults.classList.remove('hidden');
        // You would populate search results here
    }, 300);
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500');
            
            // Show error message
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.style.display = 'block';
            }
        } else {
            input.classList.remove('border-red-500');
            
            // Hide error message
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.style.display = 'none';
            }
        }
    });
    
    return isValid;
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize lazy loading when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLazyLoading);
} else {
    initializeLazyLoading();
}
