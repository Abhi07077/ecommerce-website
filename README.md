# Cara - Modern E-Commerce Storefront

A modern, lightweight, fully responsive, and highly interactive static e-commerce storefront. Built purely with semantic HTML5, CSS3, and Vanilla JavaScript, this project showcases a complete client-side shopping experience.

---

## 🚀 Key Features

* **Home Page**: Features a stylish hero section, curated featured products, responsive grid banners, and new arrivals.
* **Dynamic Product Catalog (Shop)**:
  * Automatically populates from a structured JSON dataset (`js/data/products.json`).
  * Interactive client-side product search.
  * Real-time category filtering (Casual, Formal, Jeans, Cargos, Hoodies, T-Shirts).
  * Multiple sorting options (Default, Price: Low to High, Price: High to Low, Rating: High to Low).
  * Seamless pagination to display products cleanly.
* **Interactive Product Details**:
  * Dynamic details injection depending on the product ID.
  * Interactive image gallery with thumbnails.
  * Category-based related products suggestions.
  * Size and quantity selectors.
* **Persistent Wishlist**:
  * Add or remove products dynamically.
  * Live stock-status indicator.
  * Animated transition when removing items or moving them directly to the cart.
  * State persists across browser sessions using `localStorage`.
* **Fully Functional Shopping Cart**:
  * Incremental quantity controls (+/-) and direct quantity input.
  * Automatic calculation of subtotal, shipping, and grand total.
  * **Interactive Coupon System**: Try entering code **`DEAL50`** to get 50% off your purchase.
  * Simulated checkout sequence with localized alerts.
* **Toast Notification System**: Instant, smooth micro-animations providing immediate visual feedback for user actions.

---

## 🛠️ Tech Stack & Assets

* **Core**: HTML5 (Semantic Structure) & Vanilla JavaScript (ES6+)
* **Styling**: Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid)
* **Iconography**: Google Fonts & [Material Symbols Outlined](https://fonts.google.com/icons)
* **Storage**: Web Storage API (`localStorage`) for cart and wishlist state persistence.

---

## 📂 Project Structure

```bash
├── assets/
│   ├── css/
│   │   ├── cart.css            # Styles for the cart page
│   │   ├── catalog.css         # Styles for the shop catalog
│   │   ├── home.css            # Styles for the homepage
│   │   ├── product-detail.css  # Styles for the product details page
│   │   └── wishlist.css        # Styles for the wishlist page
│   ├── banner/                 # Promotional banners
│   ├── features/               # Core shop benefit badges
│   ├── images/                 # Optimized product images (categorized)
│   ├── hero.jpg                # Hero banner image
│   └── logo.png                # Brand identity logo
├── js/
│   ├── data/
│   │   ├── products.js         # Evaluated JavaScript product array representation
│   │   └── products.json       # Clean JSON product database
│   ├── pages/
│   │   ├── cart.js             # Cart page custom behaviors
│   │   ├── catalog.js          # Catalog logic (filters, sorting, pagination)
│   │   ├── detail.js           # Dynamic product layout & detail logic
│   │   ├── home.js             # Home page event handling & navigation
│   │   └── wishlist.js         # Wishlist render & add-to-cart operations
│   └── utils/
│       └── storage.js          # LocalStorage abstractions
├── index.html                  # Homepage
├── catalog.html                # Shop Catalog page
├── product.html                # Product Details page
├── wishlist.html               # Wishlist page
├── cart.html                   # Cart page
└── README.md                   # Project documentation
```

---

## 💻 Running the Project Locally

Because this is a static client-side web application, you do not need to install any complex dependencies:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/your-repository-name.git
   cd your-repository-name
   ```
2. **Open the App**:
   * Double-click `index.html` to open it in your browser directly, OR
   * Use a development server like the **Live Server** extension in VS Code for hot reloading and to resolve absolute resource paths correctly.
