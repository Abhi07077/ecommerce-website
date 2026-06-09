document.addEventListener('DOMContentLoaded', () => {
    // Inject toast container if not exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const products = document.querySelectorAll('.products');
    const allProducts = window.PRODUCTS_DATA || [];
    
    // Helper to get wishlist
    function getWishlist() {
        return JSON.parse(localStorage.getItem('wishlist')) || [];
    }

    // Helper to save wishlist
    function saveWishlist(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    // Helper to get cart
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Helper to save cart
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    products.forEach(productCard => {
        // Extract product details
        const img = productCard.querySelector('img');
        if (!img) return;
        
        let imageSrc = img.getAttribute('src');
        if (imageSrc.startsWith('/')) {
            imageSrc = imageSrc.substring(1);
        }

        // Match with PRODUCTS_DATA by image path
        const dbProduct = allProducts.find(p => p.image === imageSrc);
        
        // Generate stable ID (fallback if not in DB)
        const filename = imageSrc.substring(imageSrc.lastIndexOf('/') + 1, imageSrc.lastIndexOf('.'));
        const fallbackId = filename || 'product';
        
        const id = dbProduct ? dbProduct.id : fallbackId;
        const brand = dbProduct ? dbProduct.brand : (productCard.querySelector('p') ? productCard.querySelector('p').textContent.trim() : '');
        const name = dbProduct ? dbProduct.name : (productCard.querySelector('h5') ? productCard.querySelector('h5').textContent.trim() : '');
        const price = dbProduct ? dbProduct.price : (parseFloat(productCard.querySelector('h4') ? productCard.querySelector('h4').textContent.replace(/[^0-9.]/g, '') : '0') || 0);

        // Click card -> redirect to product detail page
        productCard.addEventListener('click', () => {
            window.location.href = `product.html?id=${id}`;
        });

        // Check if item is already in wishlist
        let wishlist = getWishlist();
        const isInWishlist = wishlist.some(item => item.id === id);

        // Create wishlist button
        const wishBtn = document.createElement('button');
        wishBtn.className = 'wishlist-btn' + (isInWishlist ? ' active' : '');
        wishBtn.setAttribute('type', 'button');
        wishBtn.innerHTML = '<span class="material-symbols-outlined">favorite</span>';

        // Add event listener to heart button
        wishBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click logic
            
            let currentWishlist = getWishlist();
            const index = currentWishlist.findIndex(item => item.id === id);

            if (index > -1) {
                // Remove from wishlist
                currentWishlist.splice(index, 1);
                saveWishlist(currentWishlist);
                wishBtn.classList.remove('active');
                showToast(`"${name}" removed from wishlist.`, 'remove');
            } else {
                // Add to wishlist
                const newItem = dbProduct ? { ...dbProduct } : { id, brand, name, price, image: imageSrc, inStock: true };
                currentWishlist.push(newItem);
                saveWishlist(currentWishlist);
                wishBtn.classList.add('active');
                showToast(`"${name}" added to wishlist!`, 'success');
            }
        });

        productCard.appendChild(wishBtn);

        // Add to cart button listener inside the card
        const cartBtn = productCard.querySelector('div button');
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click logic

                let currentCart = getCart();
                const index = currentCart.findIndex(item => item.id === id && item.size === 'M');

                if (index > -1) {
                    currentCart[index].quantity += 1;
                } else {
                    currentCart.push({
                        id: id,
                        brand: brand,
                        name: name,
                        price: price,
                        image: imageSrc,
                        size: 'M',
                        quantity: 1
                    });
                }

                saveCart(currentCart);
                showToast(`"${name}" added to shopping cart!`, 'success');
            });
        }
    });

    // Toast Notification helper
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'remove' ? 'remove' : ''}`;
        
        const iconName = type === 'remove' ? 'heart_broken' : 'check_circle';
        
        toast.innerHTML = `
            <span class="material-symbols-outlined toast-icon">${iconName}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 50);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 3500);
    }
});
