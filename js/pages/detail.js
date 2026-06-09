document.addEventListener('DOMContentLoaded', () => {
    // Current product being viewed
    let currentProduct = null;

    // Toast Container injection if needed
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const allProducts = window.PRODUCTS_DATA || [];

    // Helper: parse query parameters
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Helper: load wishlist
    function getWishlist() {
        return JSON.parse(localStorage.getItem('wishlist')) || [];
    }

    // Helper: save wishlist
    function saveWishlist(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    // Helper: get cart
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Helper: save cart
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Find product by ID
    function findProductById(id) {
        return allProducts.find(p => p.id === id);
    }

    // Render details for a specific product
    function renderProductDetails(product) {
        if (!product) return;
        currentProduct = product;

        // Update Text Elements
        const brandEl = document.querySelector('#prodetails .brand');
        const titleEl = document.querySelector('#prodetails .title');
        const priceEl = document.querySelector('#prodetails .price');
        const breadcrumbEl = document.querySelector('#prodetails h6');
        const mainImg = document.getElementById('MainImg');

        if (brandEl) brandEl.textContent = product.brand;
        if (titleEl) titleEl.textContent = product.name;
        if (priceEl) priceEl.textContent = `$${product.price.toFixed(2)}`;
        if (breadcrumbEl) breadcrumbEl.textContent = `Home / Shop / ${product.category}`;
        if (mainImg) mainImg.setAttribute('src', product.image);

        // Update Wishlist button state
        const addWishBtn = document.getElementById('add-to-wishlist-btn');
        if (addWishBtn) {
            const wishlist = getWishlist();
            const isInWishlist = wishlist.some(item => item.id === product.id);
            if (isInWishlist) {
                addWishBtn.classList.add('active');
            } else {
                addWishBtn.classList.remove('active');
            }
        }

        // Render related products as thumbnails (Slot 1: current, Slots 2-4: related)
        const related = allProducts
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 3);

        const thumbnails = document.querySelectorAll('.small-img-col img');
        if (thumbnails.length > 0) {
            // First thumbnail is current product
            thumbnails[0].setAttribute('src', product.image);
            thumbnails[0].setAttribute('data-id', product.id);
            thumbnails[0].parentElement.classList.add('active'); // active highlight

            // Remaining thumbnails are related products
            for (let i = 1; i < thumbnails.length; i++) {
                const relatedProduct = related[i - 1];
                if (relatedProduct) {
                    thumbnails[i].setAttribute('src', relatedProduct.image);
                    thumbnails[i].setAttribute('data-id', relatedProduct.id);
                    thumbnails[i].parentElement.style.display = 'block';
                } else {
                    // Hide if no more related products
                    thumbnails[i].parentElement.style.display = 'none';
                }
            }
        }
    }

    // Load initial product
    let productId = getQueryParam('id');
    let product = findProductById(productId);

    // Fallback if not found or no ID
    if (!product && allProducts.length > 0) {
        product = allProducts[0];
    }

    if (product) {
        renderProductDetails(product);
    }

    // Set up click handlers on thumbnails to load product details dynamically
    const smallImages = document.querySelectorAll('.small-img');
    smallImages.forEach(img => {
        img.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const targetProduct = findProductById(id);
            if (targetProduct) {
                renderProductDetails(targetProduct);
            }
        });
    });

    // Wishlist toggle listener
    const addWishBtn = document.getElementById('add-to-wishlist-btn');
    if (addWishBtn) {
        addWishBtn.addEventListener('click', () => {
            if (!currentProduct) return;

            let wishlist = getWishlist();
            const index = wishlist.findIndex(item => item.id === currentProduct.id);

            if (index > -1) {
                wishlist.splice(index, 1);
                saveWishlist(wishlist);
                addWishBtn.classList.remove('active');
                showToast(`"${currentProduct.name}" removed from wishlist.`, 'remove');
            } else {
                wishlist.push({ ...currentProduct });
                saveWishlist(wishlist);
                addWishBtn.classList.add('active');
                showToast(`"${currentProduct.name}" added to wishlist!`, 'success');
            }
        });
    }

    // Add To Cart button listener
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (!currentProduct) return;

            const sizeSelect = document.getElementById('size-select');
            const qtyInput = document.getElementById('quantity-input');

            const size = sizeSelect ? sizeSelect.value : 'M';
            const quantity = qtyInput ? parseInt(qtyInput.value, 10) : 1;

            if (!size) {
                showToast('Please select a size before adding to cart.', 'remove');
                if (sizeSelect) sizeSelect.focus();
                return;
            }

            if (isNaN(quantity) || quantity < 1) {
                showToast('Please enter a valid quantity.', 'remove');
                return;
            }

            let cart = getCart();
            const existingIndex = cart.findIndex(item => item.id === currentProduct.id && item.size === size);

            if (existingIndex > -1) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({
                    id: currentProduct.id,
                    brand: currentProduct.brand,
                    name: currentProduct.name,
                    price: currentProduct.price,
                    image: currentProduct.image,
                    size: size,
                    quantity: quantity
                });
            }

            saveCart(cart);
            showToast(`"${currentProduct.name}" (${size}) added to cart!`, 'success');
        });
    }

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
