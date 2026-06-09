document.addEventListener('DOMContentLoaded', () => {
    const defaultWishlist = [
        {
            id: "101",
            brand: "adidas",
            name: "Men's Solid Cargo Pants",
            price: 85.00,
            image: "assets/images/men_cargos/img_0001.jpg",
            inStock: true
        },
        {
            id: "102",
            brand: "adidas",
            name: "Casual Red Checked Shirt",
            price: 68.00,
            image: "assets/images/casual_shirts/img_0081.jpg",
            inStock: true
        },
        {
            id: "103",
            brand: "adidas",
            name: "Solid Crewneck Maroon T-Shirt",
            price: 38.00,
            image: "assets/images/solid_tshirts/img_0003.jpg",
            inStock: true
        }
    ];

   
    let wishlist = JSON.parse(localStorage.getItem('wishlist'));
    if (!wishlist) {
        wishlist = defaultWishlist;
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

  
    const wishlistContent = document.getElementById('wishlist-content');
    const emptyWishlist = document.getElementById('empty-wishlist');
    const wishlistItems = document.getElementById('wishlist-items');
    const searchInput = document.querySelector('#search-box input');
    const searchBtn = document.getElementById('search-btn');

    // Render wishlist items
    function renderWishlist(filterQuery = '') {
        if (wishlist.length === 0) {
            wishlistContent.style.display = 'none';
            emptyWishlist.style.display = 'block';
            emptyWishlist.innerHTML = `
                <span class="material-symbols-outlined empty-icon">favorite</span>
                <h3>Your wishlist is empty</h3>
                <p>Save items you like to view them here later!</p>
                <a href="catalog.html" class="shop-btn">Explore Shop</a>
            `;
            return;
        }

       
        const filtered = wishlist.filter(item => 
            item.name.toLowerCase().includes(filterQuery) || 
            item.brand.toLowerCase().includes(filterQuery)
        );

        if (filtered.length === 0) {
            wishlistContent.style.display = 'none';
            emptyWishlist.style.display = 'block';
            emptyWishlist.innerHTML = `
                <span class="material-symbols-outlined empty-icon">search_off</span>
                <h3>No items found</h3>
                <p>No products in your wishlist match "${filterQuery}".</p>
                <button class="shop-btn" id="clear-search-btn">Show All Items</button>
            `;
           
            document.getElementById('clear-search-btn').addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                renderWishlist();
            });
            return;
        }

        wishlistContent.style.display = 'block';
        emptyWishlist.style.display = 'none';
        wishlistItems.innerHTML = '';

        filtered.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.id = `wishlist-row-${item.id}`;
            tr.innerHTML = `
                <td data-label="Sr. No.">${index + 1}</td>
                <td data-label="Product Image">
                    <img src="${item.image}" alt="${item.name}" class="wishlist-img">
                </td>
                <td data-label="Product Details">
                    <div class="details-cell">
                        <span class="brand">${item.brand}</span>
                        <span class="name">${item.name}</span>
                    </div>
                </td>
                <td data-label="Price">$${item.price.toFixed(2)}</td>
                <td data-label="Stock Status">
                    <span class="stock-badge ${item.inStock ? 'stock-in' : 'stock-out'}">
                        ${item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td data-label="Action">
                    <div class="action-cell">
                        <button class="add-cart-btn" data-id="${item.id}">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            Add To Cart
                        </button>
                        <button class="remove-wish-btn" data-id="${item.id}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            `;
            
            // Redirect to product detail page on click
            const imgEl = tr.querySelector('.wishlist-img');
            const detailsEl = tr.querySelector('.details-cell');
            const handleRedirect = () => {
                window.location.href = `product.html?id=${item.id}`;
            };
            if (imgEl) {
                imgEl.style.cursor = 'pointer';
                imgEl.addEventListener('click', handleRedirect);
            }
            if (detailsEl) {
                detailsEl.style.cursor = 'pointer';
                detailsEl.addEventListener('click', handleRedirect);
            }

            wishlistItems.appendChild(tr);
        });

        document.querySelectorAll('.add-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                addToCart(id);
            });
        });

        document.querySelectorAll('.remove-wish-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                removeFromWishlist(id);
            });
        });
    }

    // Remove item from wishlist
    function removeFromWishlist(id) {
        const row = document.getElementById(`wishlist-row-${id}`);
        const item = wishlist.find(w => w.id === id);
        
        if (row) {
            row.classList.add('row-fade-out');
            row.addEventListener('animationend', () => {
                wishlist = wishlist.filter(w => w.id !== id);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                renderWishlist(searchInput ? searchInput.value.toLowerCase().trim() : '');
                if (item) {
                    showToast(`"${item.name}" removed from wishlist.`, 'remove');
                }
            }, { once: true });
        } else {
            wishlist = wishlist.filter(w => w.id !== id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            renderWishlist(searchInput ? searchInput.value.toLowerCase().trim() : '');
        }
    }

    // Add item to cart
    function addToCart(id) {
        const item = wishlist.find(w => w.id === id);
        if (!item) return;

       
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        
        const cartItemIndex = cart.findIndex(c => c.id === item.id && c.size === 'M');

        if (cartItemIndex > -1) {
            cart[cartItemIndex].quantity += 1;
        } else {
            cart.push({
                id: item.id,
                brand: item.brand,
                name: item.name,
                price: item.price,
                image: item.image,
                size: 'M', 
                quantity: 1
            });
        }

       
        localStorage.setItem('cart', JSON.stringify(cart));

        
        const row = document.getElementById(`wishlist-row-${id}`);
        if (row) {
            row.classList.add('row-fade-out');
            row.addEventListener('animationend', () => {
                wishlist = wishlist.filter(w => w.id !== id);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                renderWishlist(searchInput ? searchInput.value.toLowerCase().trim() : '');
                showToast(`"${item.name}" added to shopping cart!`, 'success');
            }, { once: true });
        } else {
            wishlist = wishlist.filter(w => w.id !== id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            renderWishlist(searchInput ? searchInput.value.toLowerCase().trim() : '');
            showToast(`"${item.name}" added to shopping cart!`, 'success');
        }
    }

   
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

        // Auto remove after 3.5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            // Wait for slide-out animation to complete
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 3500);
    }

    // Search and filter capabilities
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            renderWishlist(query);
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchInput) {
                const query = searchInput.value.toLowerCase().trim();
                renderWishlist(query);
            }
        });
    }

    // Initial load
    renderWishlist();
});
