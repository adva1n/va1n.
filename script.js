
const animateOnScroll = () => {
    const elements = document.querySelectorAll('[data-animate]');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            const animationType = element.getAttribute('data-animate');
            const delay = element.getAttribute('data-delay') || 0;
            
            setTimeout(() => {
                element.classList.add(`animate-${animationType}`);
            }, delay);
        }
    });
};

window.addEventListener('load', () => {

    document.querySelectorAll('.hero [data-animate]').forEach((el, index) => {
        const delay = el.getAttribute('data-delay') || index * 200;
        setTimeout(() => {
            const animationType = el.getAttribute('data-animate');
            el.classList.add(`animate-${animationType}`);
        }, delay);
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Спасибо! Мы свяжемся с вами скоро.');
        contactForm.reset();
    });
}

const initMobileMenu = () => {
    const hamburger = document.querySelector('.nav__hamburger');
    const menu = document.querySelector('.nav__menu');
    
    if (!hamburger) return;
    
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('nav__menu--active');
        hamburger.classList.toggle('nav__hamburger--active');
        document.body.style.overflow = menu.classList.contains('nav__menu--active') ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('nav__menu--active');
            hamburger.classList.remove('nav__hamburger--active');
            document.body.style.overflow = '';
        });
    });

    document.addEventListener('click', (e) => {
        const nav = document.querySelector('.nav');
        if (!nav.contains(e.target) && menu.classList.contains('nav__menu--active')) {
            menu.classList.remove('nav__menu--active');
            hamburger.classList.remove('nav__hamburger--active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('nav__menu--active')) {
            menu.classList.remove('nav__menu--active');
            hamburger.classList.remove('nav__hamburger--active');
            document.body.style.overflow = '';
        }
    });
};

const initSearchAndFilter = () => {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');
    
    let currentCategory = 'all';
    let currentSearch = '';

    const filterProducts = () => {
        let visibleCount = 0;
        
        productCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const name = card.getAttribute('data-name').toLowerCase();
            const searchTerm = currentSearch.toLowerCase();
            
            const categoryMatch = currentCategory === 'all' || category === currentCategory;
            const searchMatch = name.includes(searchTerm);
            
            if (categoryMatch && searchMatch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (visibleCount === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            filterProducts();
        });
    });

    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    searchInput.addEventListener('input', debounce((e) => {
        currentSearch = e.target.value;
        filterProducts();
    }, 300));
};

const initHorizontalScroll = () => {
    const scrollWrapper = document.querySelector('.horizontal-scroll-wrapper');
    const scrollLeftBtn = document.querySelector('.scroll-btn--left');
    const scrollRightBtn = document.querySelector('.scroll-btn--right');
    
    if (!scrollWrapper) return;

    const scrollAmount = 320;

    scrollLeftBtn.addEventListener('click', () => {
        scrollWrapper.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    scrollRightBtn.addEventListener('click', () => {
        scrollWrapper.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    let isDragging = false;
    let startX;
    let scrollLeft;

    scrollWrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - scrollWrapper.offsetLeft;
        scrollLeft = scrollWrapper.scrollLeft;
        scrollWrapper.style.cursor = 'grabbing';
    });

    scrollWrapper.addEventListener('mouseleave', () => {
        isDragging = false;
        scrollWrapper.style.cursor = 'grab';
    });

    scrollWrapper.addEventListener('mouseup', () => {
        isDragging = false;
        scrollWrapper.style.cursor = 'grab';
    });

    scrollWrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollWrapper.offsetLeft;
        const walk = (x - startX) * 2;
        scrollWrapper.scrollLeft = scrollLeft - walk;
    });
};

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('vain_cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('cartButton').addEventListener('click', () => {
            this.openCart();
        });

        document.getElementById('closeCart').addEventListener('click', () => {
            this.closeCart();
        });

        document.querySelector('.continue-shopping').addEventListener('click', () => {
            this.closeCart();
        });

        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.openCheckout();
        });

        document.getElementById('closeCheckout').addEventListener('click', () => {
            this.closeCheckout();
        });
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveToLocalStorage();
        this.updateCartCount();
        this.showNotification('Товар добавлен в корзину!');
        
        if (this.isCartOpen()) {
            this.renderCartItems();
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToLocalStorage();
        this.updateCartCount();
        this.renderCartItems();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToLocalStorage();
            this.renderCartItems();
        }
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
        }
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart"><p>Корзина пуста</p></div>';
            cartTotal.textContent = '0 ₸';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item__image"></div>
                <div class="cart-item__info">
                    <div class="cart-item__name">${item.name}</div>
                    <div class="cart-item__price">${item.price} ₸</div>
                </div>
                <div class="cart-item__controls">
                    <button class="quantity-btn minus" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="cart-item__quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    <button class="remove-item" onclick="cart.removeItem('${item.id}')">🗑️</button>
                </div>
            </div>
        `).join('');

        cartTotal.textContent = `${this.getTotalPrice()} ₸`;
    }

    openCart() {
        this.renderCartItems();
        document.getElementById('cartModal').style.display = 'block';
    }

    closeCart() {
        document.getElementById('cartModal').style.display = 'none';
    }

    openCheckout() {
        if (this.items.length === 0) {
            alert('Корзина пуста!');
            return;
        }
        this.closeCart();
        document.getElementById('checkoutModal').style.display = 'block';
    }

    closeCheckout() {
        document.getElementById('checkoutModal').style.display = 'none';
    }

    isCartOpen() {
        return document.getElementById('cartModal').style.display === 'block';
    }

    showNotification(message) {
        const notification = document.getElementById('cartNotification');
        if (notification) {
            notification.querySelector('span').textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('vain_cart', JSON.stringify(this.items));
    }
}

class FavoritesManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('vain_favorites')) || [];
        this.init();
    }

    init() {
        this.updateFavoritesCount();
        this.bindEvents();
    }

    bindEvents() {
        const favoritesButton = document.getElementById('favoritesButton');
        const closeFavorites = document.getElementById('closeFavorites');
        
        if (favoritesButton) {
            favoritesButton.addEventListener('click', () => {
                this.openFavorites();
            });
        }
        
        if (closeFavorites) {
            closeFavorites.addEventListener('click', () => {
                this.closeFavorites();
            });
        }
    }

    addItem(product) {
        if (!this.isInFavorites(product.id)) {
            this.items.push(product);
            this.saveToLocalStorage();
            this.updateFavoritesCount();
            this.showNotification('Товар добавлен в избранное! ❤️');
            
            if (this.isFavoritesOpen()) {
                this.renderFavoritesItems();
            }
            return true;
        }
        return false;
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToLocalStorage();
        this.updateFavoritesCount();
        if (this.isFavoritesOpen()) {
            this.renderFavoritesItems();
        }
        this.showNotification('Товар удален из избранного');
        return true;
    }

    isInFavorites(productId) {
        return this.items.some(item => item.id === productId);
    }

    updateFavoritesCount() {
        const favoritesCount = document.querySelector('.favorites-count');
        if (favoritesCount) {
            favoritesCount.textContent = this.items.length;
        }
    }

    renderFavoritesItems() {
        const favoritesItems = document.getElementById('favoritesItems');
        if (!favoritesItems) return;

        if (this.items.length === 0) {
            favoritesItems.innerHTML = `
                <div class="empty-favorites">
                    <p>В избранном пока пусто</p>
                    <p>Добавляйте товары, нажимая на сердечко ❤️</p>
                </div>
            `;
            return;
        }

        favoritesItems.innerHTML = this.items.map(item => `
            <div class="favorite-item">
                <div class="favorite-item__image"></div>
                <div class="favorite-item__info">
                    <div class="favorite-item__name">${item.name}</div>
                    <div class="favorite-item__price">${item.price} ₸</div>
                </div>
                <button class="favorite-item__remove" onclick="favoritesManager.removeItem('${item.id}')">❌</button>
                <button class="view-product-btn" onclick="openProductPage('${item.id}')">👀</button>
            </div>
        `).join('');
    }

    openFavorites() {
        this.renderFavoritesItems();
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeFavorites() {
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    isFavoritesOpen() {
        const modal = document.getElementById('favoritesModal');
        return modal && modal.style.display === 'block';
    }

    showNotification(message) {
        const notification = document.getElementById('cartNotification');
        if (notification) {
            notification.querySelector('span').textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 2000);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('vain_favorites', JSON.stringify(this.items));
    }
}

const initProductActions = () => {
    document.querySelectorAll('.product-card').forEach(card => {
        const productName = card.querySelector('h3').textContent;
        const productPrice = parseInt(card.querySelector('p').textContent.replace(/\D/g, ''));
        const productId = card.getAttribute('data-name').toLowerCase().replace(/\s+/g, '-');
        
        const addToCartBtn = card.querySelector('.add-to-cart-overlay');
        const addToFavoriteBtn = card.querySelector('.add-to-favorite-overlay');
        
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cart.addItem({
                    id: productId,
                    name: productName,
                    price: productPrice
                });
            });
        }
        
        if (addToFavoriteBtn) {
            addToFavoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const product = {
                    id: productId,
                    name: productName,
                    price: productPrice
                };
                
                if (favoritesManager.isInFavorites(productId)) {
                    favoritesManager.removeItem(productId);
                    addToFavoriteBtn.style.background = 'rgba(255, 68, 68, 0.9)';
                } else {
                    favoritesManager.addItem(product);
                    addToFavoriteBtn.style.background = '#ff4444';
                }
            });
        }
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-overlay') && 
                !e.target.closest('.add-to-favorite-overlay')) {
                openProductPage(productId);
            }
        });
    });
};

function openProductPage(productId) {
    const product = getProductData(productId);
    if (!product) {
        console.error('Товар не найден:', productId);
        return;
    }
  
    const scrollPosition = window.pageYOffset;

    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productPrice').textContent = product.price + ' ₸';
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productMainImage').src = product.images[0];

    const sizesContainer = document.getElementById('productSizes');
    sizesContainer.innerHTML = product.sizes.map(size => `
        <div class="size-option" data-size="${size}">${size}</div>
    `).join('');

    sizesContainer.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function() {
            sizesContainer.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });

    const thumbnailsContainer = document.querySelector('.image-thumbnails');
    thumbnailsContainer.innerHTML = product.images.map((image, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${image}">
            <img src="${image}" alt="${product.name}">
        </div>
    `).join('');

    thumbnailsContainer.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            const imageUrl = this.getAttribute('data-image');
            document.getElementById('productMainImage').src = imageUrl;
            
            thumbnailsContainer.querySelectorAll('.thumbnail').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    const favoriteBtn = document.getElementById('addToFavorite');
    if (favoritesManager.isInFavorites(product.id)) {
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.classList.remove('active');
    }

    document.getElementById('addToCartDetail').onclick = () => {
        cart.addItem(product);
    };

    document.getElementById('addToFavorite').onclick = () => {
        if (favoritesManager.isInFavorites(product.id)) {
            favoritesManager.removeItem(product.id);
            favoriteBtn.classList.remove('active');
        } else {
            favoritesManager.addItem(product);
            favoriteBtn.classList.add('active');
        }
    };

    document.getElementById('productPage').style.display = 'block';
    document.querySelector('.collection').style.display = 'none';
    
    window.scrollTo(0, scrollPosition);
}

function getProductData(productId) {
    const products = {
        'футболка-essential': {
            id: 'футболка-essential',
            name: 'Футболка Essential',
            price: 4900,
            category: 'Верх',
            description: '100% хлопок, премиальное качество. Идеальная база для любого образа. Мягкая, дышащая ткань, которая сохраняет форму после множества стирок.',
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            images: [
                '/images/c3e540efe0bd1602b339c43cdcb0629e.jpg',
                '/images/c3e540efe0bd1602b339c43cdcb0629e.jpg'
            ]
        },
        'лонгслив-basic': {
            id: 'лонгслив-basic',
            name: 'Лонгслив Basic',
            price: 6200,
            category: 'Верх',
            description: 'Плотный хлопок, универсальный крой. Для прохладных дней. Идеально подходит для многослойности.',
            sizes: ['S', 'M', 'L', 'XL'],
            images: [
                '/images/2c074669ced2e5c15c6e8d91092eeb5f.jpg',
                '/images/2c074669ced2e5c15c6e8d91092eeb5f.jpg'
            ]
        },
        'худи-classic': {
            id: 'худи-classic',
            name: 'Худи Classic',
            price: 8900,
            category: 'Верх',
            description: 'Флисовая подкладка, капюшон с регулировкой. Максимальный комфорт в любую погоду.',
            sizes: ['M', 'L', 'XL', 'XXL'],
            images: [
                '/images/ed69659f19843451d6a1d220e2292d9c.jpg',
                '/images/ed69659f19843451d6a1d220e2292d9c.jpg'
            ]
        },
        'штаны-cargo': {
            id: 'штаны-cargo',
            name: 'Штаны Cargo',
            price: 7200,
            category: 'Низ',
            description: 'Прочный хлопок, функциональные карманы. Уличный стиль с максимальным комфортом.',
            sizes: ['W30', 'W32', 'W34', 'W36'],
            images: [
                '/images/e8febcb630378384e7b69b0dcf4c5d73.jpg',
                '/images/e8febcb630378384e7b69b0dcf4c5d73.jpg'
            ]
        }
    };
    
    return products[productId];
}

document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('backToCollection');
    if (backButton) {
        backButton.addEventListener('click', () => {

            const scrollPosition = window.pageYOffset;
            
            document.getElementById('productPage').style.display = 'none';
            document.querySelector('.collection').style.display = 'block';
            
            window.scrollTo(0, scrollPosition);
        });
    }
});

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

let cart;
let favoritesManager;

window.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchAndFilter();
    initHorizontalScroll();
    
    cart = new ShoppingCart();
    favoritesManager = new FavoritesManager();
    initProductActions();
    
    window.addEventListener('scroll', throttle(animateOnScroll, 100));
    
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.querySelector('#collection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});

const initNewProducts = () => {
 
    console.log('New products initialized');
};

window.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchAndFilter();
    initHorizontalScroll();
    
    cart = new ShoppingCart();
    favoritesManager = new FavoritesManager();
    initProductActions();
    initNewProducts(); 
    
    window.addEventListener('scroll', throttle(animateOnScroll, 100));
    
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.querySelector('#collection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});

const initNewSectionsAnimations = () => {
    const newSections = document.querySelectorAll('.new-arrivals, .popular');
    
    newSections.forEach(section => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-section');
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(section);
    });
};

window.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchAndFilter();
    initHorizontalScroll();
    
    cart = new ShoppingCart();
    favoritesManager = new FavoritesManager();
    initProductActions();
    initNewProducts();
    initNewSectionsAnimations(); 
    
    window.addEventListener('scroll', throttle(animateOnScroll, 100));
    
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.querySelector('#collection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});

const initPopularCarousel = () => {
    const carousel = document.querySelector('.popular-carousel');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!carousel) return;
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const cardWidth = carousel.querySelector('.product-card').offsetWidth + 32; // + gap
            carousel.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
            
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
    });
    
    carousel.addEventListener('scroll', () => {
        const scrollPos = carousel.scrollLeft;
        const cardWidth = carousel.querySelector('.product-card').offsetWidth + 32;
        const activeIndex = Math.round(scrollPos / cardWidth);
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    });
    
    let isDragging = false;
    let startX;
    let scrollLeft;
    
    carousel.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        carousel.style.cursor = 'grabbing';
    });
    
    carousel.addEventListener('mouseleave', () => {
        isDragging = false;
        carousel.style.cursor = 'grab';
    });
    
    carousel.addEventListener('mouseup', () => {
        isDragging = false;
        carousel.style.cursor = 'grab';
    });
    
    carousel.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
};

window.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchAndFilter();
    initHorizontalScroll();
    initPopularCarousel(); 
    
    cart = new ShoppingCart();
    favoritesManager = new FavoritesManager();
    initProductActions();
    initNewProducts();
    initNewSectionsAnimations();
    
    window.addEventListener('scroll', throttle(animateOnScroll, 100));

    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            document.querySelector('#collection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});