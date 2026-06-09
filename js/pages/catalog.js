document.addEventListener('DOMContentLoaded', () => {
    // Inject toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // App state
    let currentPage = 1;
    const productsPerPage = 20;
    let activeCategory = 'All';
    let searchQuery = '';
    let currentSort = 'default';

    // Source of truth: window.PRODUCTS_DATA (from js/data/products.js)
    const allProducts = window.PRODUCTS_DATA || [];

    // Helper: get wishlist from localStorage
    function getWishlist() {
        return JSON.parse(localStorage.getItem('wishlist')) || [];
    }

    // Helper: save wishlist to localStorage
    function saveWishlist(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    // Helper: get cart from localStorage
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Helper: save cart to localStorage
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Filter and sort products based on current filters/sorting
    function getFilteredAndSortedProducts() {
        let filtered = [...allProducts];

        // 1. Category Filter
        if (activeCategory !== 'All') {
            filtered = filtered.filter(p => {
                // If category is T-Shirts, check both "T-Shirts" and case variants
                return p.category.toLowerCase() === activeCategory.toLowerCase();
            });
        }

        // 2. Search Query Filter
        if (searchQuery) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchQuery) ||
                p.brand.toLowerCase().includes(searchQuery)
            );
        }

        // 3. Sorting
        if (currentSort === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (currentSort === 'rating-desc') {
            filtered.sort((a, b) => b.rating - a.rating);
        }

        return filtered;
    }

    // Render products container
    function renderProducts() {
        const container = document.querySelector('.product-container');
        if (!container) return;

        const filteredProducts = getFilteredAndSortedProducts();
        const totalProducts = filteredProducts.length;

        // Clear container
        container.innerHTML = '';

        // If no products, show friendly message
        if (totalProducts === 0) {
            container.innerHTML = `
                <div style="width: 100%; text-align: center; padding: 40px 20px;">
                    <span class="material-symbols-outlined" style="font-size: 48px; color: #777; margin-bottom: 10px;">search_off</span>
                    <h3>No products found</h3>
                    <p style="color: #666; margin-top: 5px;">We couldn't find any products matching your selection.</p>
                </div>
            `;
            renderPagination(0);
            return;
        }

        // Paginate
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const pageProducts = filteredProducts.slice(startIndex, endIndex);

        const wishlist = getWishlist();

        // Render each card
        pageProducts.forEach(product => {
            const isInWishlist = wishlist.some(item => item.id === product.id);

            const card = document.createElement('div');
            card.className = 'products';
            
            // Format rating stars - full star if >= 4.5, else half star
            const starIcon = product.rating >= 4.5 ? 'star' : 'star_half';

            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <p>${product.brand}</p>
                <div>
                    <h5>${product.name}</h5>
                    <div class="rating-container">
                        <span class="material-symbols-outlined star">${starIcon}</span>
                        <span class="rating-value">(${product.rating.toFixed(1)})</span>
                    </div>
                </div>
                <div>
                    <h4>$${product.price.toFixed(2)}</h4>
                    <button class="add-to-cart-card-btn" type="button">
                        <span class="material-symbols-outlined">shopping_cart</span>
                    </button>
                </div>
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" type="button">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
            `;

            // Card click -> redirect to details page
            card.addEventListener('click', () => {
                window.location.href = `product.html?id=${product.id}`;
            });

            // Wishlist toggle button click
            const wishBtn = card.querySelector('.wishlist-btn');
            wishBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent card redirection
                
                let currentWishlist = getWishlist();
                const index = currentWishlist.findIndex(item => item.id === product.id);

                if (index > -1) {
                    currentWishlist.splice(index, 1);
                    saveWishlist(currentWishlist);
                    wishBtn.classList.remove('active');
                    showToast(`"${product.name}" removed from wishlist.`, 'remove');
                } else {
                    currentWishlist.push({ ...product });
                    saveWishlist(currentWishlist);
                    wishBtn.classList.add('active');
                    showToast(`"${product.name}" added to wishlist!`, 'success');
                }
            });

            // Cart add button click
            const cartBtn = card.querySelector('.add-to-cart-card-btn');
            cartBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent card redirection
                
                let currentCart = getCart();
                const index = currentCart.findIndex(item => item.id === product.id && item.size === 'M');

                if (index > -1) {
                    currentCart[index].quantity += 1;
                } else {
                    currentCart.push({
                        id: product.id,
                        brand: product.brand,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        size: 'M',
                        quantity: 1
                    });
                }

                saveCart(currentCart);
                showToast(`"${product.name}" added to shopping cart!`, 'success');
            });

            container.appendChild(card);
        });

        // Update pagination buttons
        renderPagination(totalProducts);
    }

    // Render pagination buttons
    function renderPagination(totalProducts) {
        const paginationContainer = document.getElementById('next-page');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(totalProducts / productsPerPage);
        if (totalPages <= 0) return;

        // 1. Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = 'Prev';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(prevBtn);

        // 2. Page Number Buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageBtn);
        }

        // 3. Next Button
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = 'Next';
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(nextBtn);
    }

    // Set up category filters
    const categoryButtons = document.querySelectorAll('#category button');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state
            categoryButtons.forEach(b => b.classList.remove('active'));
            // Add active state to clicked
            btn.classList.add('active');
            
            // Set active category & reset page
            activeCategory = btn.textContent.trim();
            currentPage = 1;
            renderProducts();
        });
    });

    // Set up search box input and button
    const searchInput = document.querySelector('#search-box input');
    const searchBtn = document.getElementById('search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            currentPage = 1;
            renderProducts();
        });

        // Trigger search on Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchQuery = searchInput.value.toLowerCase().trim();
                currentPage = 1;
                renderProducts();
            }
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            searchQuery = searchInput.value.toLowerCase().trim();
            currentPage = 1;
            renderProducts();
        });
    }

    // Set up sorting dropdown toggler
    const filterIcon = document.getElementById('filter-icon');
    const filterDropdown = document.getElementById('filter-dropdown');

    if (filterIcon && filterDropdown) {
        filterIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });

        // Dropdown option clicks
        const sortOptions = filterDropdown.querySelectorAll('.filter-option');
        sortOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();

                // Toggle active state in sorting dropdown
                sortOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Apply sorting
                currentSort = option.getAttribute('data-sort');
                currentPage = 1;
                renderProducts();

                // Close dropdown
                filterDropdown.classList.remove('show');
            });
        });

        // Close dropdown when clicking outside
        window.addEventListener('click', () => {
            filterDropdown.classList.remove('show');
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

    // Initial catalog render
    renderProducts();
});
