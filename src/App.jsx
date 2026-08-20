import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE } from './config';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import CategoriesView from './components/CategoriesView';
import SubCategoryView from './components/SubCategoryView';
import ProfileView from './components/ProfileView';
import CheckoutView from './components/CheckoutView';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import RoyalDoorSplash from './components/RoyalDoorSplash';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import FaqView from './components/FaqView';
import NotFoundView from './components/NotFoundView';
import AdminLoginModal from './components/AdminLoginModal';
import LegalPagesView from './components/LegalPagesView';
import RentalGalleryView from './components/RentalGalleryView';
import CancellationPolicyView from './components/CancellationPolicyView';
import { PRODUCTS, CATEGORIES } from './data/products';

function hasArrayChanged(prev, next, checkKeys = ['id', 'stockQuantity', 'sellingPrice', 'status', 'totalSpent', 'totalOrders']) {
  if (!prev || !next) return prev !== next;
  if (prev.length !== next.length) return true;
  for (let i = 0; i < next.length; i++) {
    const p = prev[i];
    const n = next[i];
    if (!p || !n) return true;
    for (const k of checkKeys) {
      if (p[k] !== n[k]) return true;
    }
  }
  return false;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('home'); // 'home', 'search', 'categories', 'subcategory', 'profile', 'checkout', 'admin', '404'
  const [activeCategoryId, setActiveCategoryId] = useState('maharashtrian');
  const [searchQuery, setSearchQuery] = useState('Kundan');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Category transition ripple circle state
  const [categoryTransition, setCategoryTransition] = useState(null);

  // Bottom navigation tab transition state (search and account)
  const [navTransition, setNavTransition] = useState(null);

  // Central flying item for Add to Cart animation
  const [flyingItem, setFlyingItem] = useState(null);
  const [cartNeedsBounce, setCartNeedsBounce] = useState(false);

  // ENTERPRISE ADMIN SECURITY STATE
  const [isAdminSecretRoute, setIsAdminSecretRoute] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('jiza_admin_token') || '');

  useEffect(() => {
    // Secret Non-Guessable Admin Path Verification
    const params = new URLSearchParams(window.location.search);
    const secretKey = params.get('secretAdminKey') || params.get('adminSecret') || window.location.hash.replace('#', '');
    
    if (secretKey === 'jiza-studio-secure-mgmt-x9872') {
      setIsAdminSecretRoute(true);
      if (!adminToken) {
        setIsAdminLoginOpen(true);
      } else {
        setActiveView('admin');
      }
    }
  }, [adminToken]);

  // Dynamic SEO, GEO & AEO Title & Metadata Management
  useEffect(() => {
    let title = "Jiza Jewellery Studio - High-End Luxury Indian Jewelry";
    let desc = "Discover handcrafted Indian heritage jewellery at Jiza Jewellery Studio. Explore Kundan, Maharashtrian, South Indian, Victorian & American Diamond collections.";

    if (selectedProduct) {
      title = `${selectedProduct.title} | Jiza Jewellery Studio`;
      desc = `${selectedProduct.title} - ${selectedProduct.description || 'Authentic handcrafted heritage jewellery from Jiza Jewellery Studio.'}`;
    } else if (activeView === 'categories') {
      title = "Jewellery Categories & Collections | Jiza Jewellery Studio";
      desc = "Browse Kundan, Polki, Maharashtrian, South Indian, and Victorian jewellery categories at Jiza Jewellery Studio.";
    } else if (activeView === 'subcategory') {
      title = `${activeCategoryId ? activeCategoryId.toUpperCase() : 'Collection'} Jewellery | Jiza Jewellery Studio`;
      desc = `Explore authentic ${activeCategoryId} jewellery sets and accessories at Jiza Jewellery Studio.`;
    } else if (activeView === 'profile') {
      title = "My Account & Orders | Jiza Jewellery Studio";
    } else if (activeView === 'checkout') {
      title = "Secure Checkout | Jiza Jewellery Studio";
    } else if (activeView === 'search') {
      title = `Search: ${searchQuery || 'Jewellery'} | Jiza Jewellery Studio`;
    } else if (activeView === 'faq') {
      title = "Frequently Asked Questions | Jiza Jewellery Studio";
    } else if (activeView === 'legal-privacy' || activeView === 'legal-terms') {
      title = "Legal & Privacy Policy | Jiza Jewellery Studio";
    } else if (activeView === 'admin') {
      title = "Admin Operations Dashboard | Jiza Jewellery Studio";
    }

    document.title = title;
    
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (metaDescEl) {
      metaDescEl.content = desc;
    }
  }, [activeView, selectedProduct, activeCategoryId, searchQuery]);

  // Dynamic Centralized App Data
  const [productsList, setProductsList] = useState(PRODUCTS);
  const [categoriesList, setCategoriesList] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('jiza_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [registeredCustomers, setRegisteredCustomers] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  // Fetch live Categories & Products from Backend DB
  const fetchDbCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategoriesList(prev => hasArrayChanged(prev, data, ['id', 'name', 'active', 'display_order', 'productsCount']) ? data : prev);
        }
      }
    } catch (err) {
      console.log('Categories API loading...');
    }
  };

  const fetchDbProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProductsList(prev => hasArrayChanged(prev, data, ['id', 'stockQuantity', 'sellingPrice', 'soldOut', 'badge', 'productCode']) ? data : prev);
        }
      }
    } catch (err) {
      console.log('Products API loading...');
    }
  };

  const handleAdminUnauthorized = () => {
    sessionStorage.removeItem('jiza_admin_token');
    setAdminToken('');
    setIsAdminSecretRoute(true);
    setIsAdminLoginOpen(true);
  };

  const fetchDbOrders = async () => {
    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      if (token) {
        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          handleAdminUnauthorized();
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const formatted = data.map(o => ({
              id: o.id,
              orderCode: o.order_code,
              userId: o.user_id,
              customerName: o.customer_name,
              customerEmail: o.customer_email,
              customerPhone: o.customer_phone,
              address: o.shipping_address,
              amount: `₹${Number(o.total_amount).toLocaleString('en-IN')}`,
              status: o.status,
              paymentMethod: o.payment_method,
              items: typeof o.items_json === 'string' ? JSON.parse(o.items_json).map(i => `${i.title || i.name}${i.selectedColor ? ` [Colour: ${i.selectedColor}]` : (i.colour ? ` [Colour: ${i.colour}]` : '')}${i.selectedSize ? ` [Size: ${i.selectedSize}]` : ''} (x${i.quantity || 1})`).join(', ') : 'Items',
              itemsJson: o.items_json,
              date: new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            }));
            setOrdersList(prev => hasArrayChanged(prev, formatted, ['id', 'status', 'amount', 'paymentMethod']) ? formatted : prev);
          }
        }
      } else if (currentUser) {
        const res = await fetch(`${API_BASE}/api/orders/my-orders?userId=${encodeURIComponent(currentUser.id || '')}&email=${encodeURIComponent(currentUser.email || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setOrdersList(prev => hasArrayChanged(prev, data, ['id', 'status', 'amount', 'paymentMethod']) ? data : prev);
          }
        }
      }
    } catch (err) {
      console.log('Orders API loading...');
    }
  };

  const fetchDbCustomers = async () => {
    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/admin/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleAdminUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.customers || []);
        if (Array.isArray(list)) {
          setRegisteredCustomers(prev => hasArrayChanged(prev, list, ['id', 'totalSpent', 'totalOrders', 'email']) ? list : prev);
        }
      }
    } catch (err) {
      console.log('Customers API loading...');
    }
  };

  useEffect(() => {
    fetchDbCategories();
    fetchDbProducts();
    if (adminToken || currentUser) {
      fetchDbOrders();
    }
    if (adminToken) {
      fetchDbCustomers();
    }

    // Periodic live sync polling (every 15 seconds for CPU & bandwidth efficiency)
    const interval = setInterval(() => {
      fetchDbCategories();
      fetchDbProducts();
      if (sessionStorage.getItem('jiza_admin_token') || currentUser) {
        fetchDbOrders();
      }
      if (sessionStorage.getItem('jiza_admin_token')) {
        fetchDbCustomers();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [adminToken, currentUser]);

  // Auth Modal State & Triggers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState(null);
  const [authModalMessage, setAuthModalMessage] = useState('');

  // Cart & Drawers State — must be declared before any useEffect that uses them
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load Cart & Wishlist on mount/login
  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      setWishlistIds([]);
      setIsCartLoaded(false);
      setIsWishlistLoaded(false);
      return;
    }

    const loadCartAndWishlist = async () => {
      try {
        // Load Cart
        const cartRes = await fetch(`${API_BASE}/api/cart?userId=${currentUser.id}`);
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          if (Array.isArray(cartData)) {
            setCartItems(cartData);
          }
        }
        setIsCartLoaded(true);

        // Load Wishlist
        const wishlistRes = await fetch(`${API_BASE}/api/wishlist?userId=${currentUser.id}`);
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          if (Array.isArray(wishlistData)) {
            setWishlistIds(wishlistData);
          }
        }
        setIsWishlistLoaded(true);
      } catch (err) {
        console.log('Error loading cart/wishlist:', err.message);
        // Fallback to loaded state on error to avoid blocking edits
        setIsCartLoaded(true);
        setIsWishlistLoaded(true);
      }
    };

    loadCartAndWishlist();
  }, [currentUser]);

  // Sync Cart to database (must be after cartItems useState and only after loading)
  useEffect(() => {
    if (!currentUser || !isCartLoaded) return;
    const syncCart = async () => {
      try {
        await fetch(`${API_BASE}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, items: cartItems })
        });
      } catch (err) {
        console.log('Error syncing cart:', err.message);
      }
    };
    const delay = setTimeout(syncCart, 500);
    return () => clearTimeout(delay);
  }, [cartItems, currentUser, isCartLoaded]);

  // Sync Wishlist to database (must be after wishlistIds useState and only after loading)
  useEffect(() => {
    if (!currentUser || !isWishlistLoaded) return;
    const syncWishlist = async () => {
      try {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, productIds: wishlistIds })
        });
      } catch (err) {
        console.log('Error syncing wishlist:', err.message);
      }
    };
    const delay = setTimeout(syncWishlist, 500);
    return () => clearTimeout(delay);
  }, [wishlistIds, currentUser, isWishlistLoaded]);

  // Auto-scroll to top whenever navigating between pages/views
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeView, activeCategoryId]);

  // ======================================================
  // BROWSER HISTORY & BACK BUTTON INTERCEPTOR
  // Prevents exiting the web application when pressing Back
  // ======================================================
  useEffect(() => {
    const currentState = window.history.state;
    const newState = {
      view: activeView,
      catId: activeCategoryId,
      hasProduct: Boolean(selectedProduct),
      prodId: selectedProduct?.id || null,
      isCartOpen,
      isWishlistOpen,
      isAuthModalOpen
    };

    if (
      !currentState ||
      currentState.view !== newState.view ||
      currentState.catId !== newState.catId ||
      currentState.prodId !== newState.prodId ||
      currentState.isCartOpen !== newState.isCartOpen ||
      currentState.isWishlistOpen !== newState.isWishlistOpen ||
      currentState.isAuthModalOpen !== newState.isAuthModalOpen
    ) {
      let hash = `#${activeView}`;
      if (activeView === 'subcategory') hash = `#category-${activeCategoryId}`;
      if (selectedProduct) hash = `#product-${selectedProduct.id}`;
      if (isCartOpen) hash = '#cart';
      if (isWishlistOpen) hash = '#wishlist';

      const urlParams = new URLSearchParams(window.location.search);
      const searchStr = urlParams.toString() ? `?${urlParams.toString()}` : '';

      window.history.pushState(newState, '', `${window.location.pathname}${searchStr}${hash}`);
    }
  }, [activeView, activeCategoryId, selectedProduct, isCartOpen, isWishlistOpen, isAuthModalOpen]);

  useEffect(() => {
    const handlePopState = (event) => {
      if (selectedProduct) {
        setSelectedProduct(null);
        return;
      }
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }
      if (isWishlistOpen) {
        setIsWishlistOpen(false);
        return;
      }
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return;
      }

      const state = event.state;
      if (state && state.view) {
        setActiveView(state.view);
        if (state.catId) setActiveCategoryId(state.catId);
        if (state.prodId) {
          const found = productsList.find(p => p.id === state.prodId);
          if (found) setSelectedProduct(found);
        }
      } else {
        if (activeView !== 'home') {
          setActiveView('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct, isCartOpen, isWishlistOpen, isAuthModalOpen, activeView, productsList]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleSelectCategory = (catId, clickMeta) => {
    if (clickMeta && clickMeta.left !== undefined) {
      // Calculate centering translation coordinates
      const circleCenterX = clickMeta.left + clickMeta.width / 2;
      const circleCenterY = clickMeta.top + clickMeta.height / 2;
      const tx = window.innerWidth / 2 - circleCenterX;
      const ty = window.innerHeight / 2 - circleCenterY;

      // Calculate dynamic scale to ensure the zoom doesn't go off-screen
      const targetSize = Math.min(window.innerWidth * 0.75, 340);
      const scale = targetSize / clickMeta.width;

      // Fallback name resolution from imported CATEGORIES static data
      const categoryName = clickMeta.name || CATEGORIES.find(c => c.id === catId)?.name || 'Collection';

      setCategoryTransition({
        left: clickMeta.left,
        top: clickMeta.top,
        width: clickMeta.width,
        height: clickMeta.height,
        imgSrc: clickMeta.imgSrc,
        name: categoryName,
        tx,
        ty,
        scale,
        isZoomed: false,
        isFading: false,
        isActive: true
      });

      // Step 1: Trigger centering and scale zoom
      setTimeout(() => {
        setCategoryTransition(prev => prev ? { ...prev, isZoomed: true } : null);
      }, 20);

      // Step 2: Switch active page to subcategory at 600ms (when centered)
      setTimeout(() => {
        setActiveCategoryId(catId);
        setSelectedCategory(catId);
        setActiveView('subcategory');
      }, 600);

      // Step 3: Start fading out overlay at 800ms
      setTimeout(() => {
        setCategoryTransition(prev => prev ? { ...prev, isFading: true } : null);
      }, 800);

      // Step 4: Complete and clean up at 1200ms
      setTimeout(() => {
        setCategoryTransition(null);
      }, 1200);

    } else {
      setActiveCategoryId(catId);
      setSelectedCategory(catId);
      setActiveView('subcategory');
    }
  };

  const triggerSearchTransition = (clickMeta) => {
    if (clickMeta && clickMeta.left !== undefined) {
      const iconCenterX = clickMeta.left + clickMeta.width / 2;
      const iconCenterY = clickMeta.top + clickMeta.height / 2;
      const tx = window.innerWidth / 2 - iconCenterX;
      const ty = window.innerHeight / 2 - iconCenterY;

      setNavTransition({
        type: 'search',
        left: clickMeta.left,
        top: clickMeta.top,
        width: clickMeta.width,
        height: clickMeta.height,
        tx,
        ty,
        isZoomed: false,
        isFading: false,
        isActive: true
      });

      setTimeout(() => {
        setNavTransition(prev => prev ? { ...prev, isZoomed: true } : null);
      }, 20);

      setTimeout(() => {
        setActiveView('search');
      }, 700);

      setTimeout(() => {
        setNavTransition(prev => prev ? { ...prev, isFading: true } : null);
      }, 950);

      setTimeout(() => {
        setNavTransition(null);
      }, 1350);
    } else {
      setActiveView('search');
    }
  };

  const handleNavigateView = (viewName, clickMeta) => {
    if (viewName === 'search' && clickMeta && clickMeta.left !== undefined) {
      triggerSearchTransition(clickMeta);
    } else {
      setActiveView(viewName);
    }
  };

  const handleSelectSubCategory = (subCatName) => {
    setSearchQuery(subCatName);
    setSelectedCategory('');
    setActiveView('search');
  };

  const handleToggleWishlist = (productId) => {
    if (!currentUser) {
      setPendingAuthAction({ type: 'TOGGLE_WISHLIST', productId });
      setAuthModalMessage('Please create an account or sign in to add items to your Wishlist.');
      setIsAuthModalOpen(true);
      return;
    }

    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from Wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to Saved Wishlist ❤️');
        return [...prev, productId];
      }
    });
  };

  // Centralized Add to Cart with Auth Interception, Stock Limit Checks & Central Fly-to-Cart Animation
  const handleAddToCart = (product, qty = 1, size = 'Standard', selectedColor = '', clickMeta = null) => {
    const chosenColor = selectedColor || (product.colour ? product.colour.split(',')[0].trim() : '');
    if (!currentUser) {
      setPendingAuthAction({ type: 'ADD_TO_CART', product, qty, size, selectedColor: chosenColor });
      setAuthModalMessage(`Please create an account or sign in to add "${product.title}" to your Shopping Bag.`);
      setIsAuthModalOpen(true);
      return;
    }

    // Real-time stock limit check
    const liveProd = productsList.find(p => p.id === product.id) || product;
    const maxStock = liveProd.stockQuantity !== undefined ? Number(liveProd.stockQuantity) : (liveProd.stock_quantity !== undefined ? Number(liveProd.stock_quantity) : 10);
    
    const existingCartItem = cartItems.find(
      (item) => item.id === product.id && item.selectedSize === size && (item.selectedColor || '') === chosenColor
    );
    const currentQty = existingCartItem ? existingCartItem.quantity : 0;

    if (currentQty + qty > maxStock) {
      const availableToAdd = Math.max(0, maxStock - currentQty);
      if (availableToAdd === 0) {
        showToast(`⚠️ Out of Stock: You already have all ${maxStock} available units of "${product.title || product.name}" in your bag.`);
      } else {
        showToast(`⚠️ Only ${availableToAdd} more unit${availableToAdd > 1 ? 's' : ''} available in stock (Total: ${maxStock}).`);
      }
      return;
    }

    // Play Central Fly-to-Cart animation
    const imgUrl = clickMeta?.img || (product.images ? product.images[0] : product.img) || '/hero-banner-v2.jpg';
    
    // Start coordinates
    const startX = clickMeta ? clickMeta.left : (window.innerWidth / 2 - 25);
    const startY = clickMeta ? clickMeta.top : (window.innerHeight / 2 - 25);

    setFlyingItem({
      imgUrl,
      startX,
      startY,
      isFlying: false,
      isLanded: false,
      isFading: false
    });

    // Step 1: Start flying towards the center of the screen
    setTimeout(() => {
      setFlyingItem(prev => prev ? { ...prev, isFlying: true } : null);
    }, 20);

    // Step 2: Land in the center bag (at 600ms) and commit state
    setTimeout(() => {
      setFlyingItem(prev => prev ? { ...prev, isLanded: true } : null);
      
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.id === product.id && item.selectedSize === size && (item.selectedColor || '') === chosenColor
        );
        if (existingIndex > -1) {
          const copy = [...prev];
          copy[existingIndex].quantity += qty;
          return copy;
        } else {
          return [...prev, { ...product, quantity: qty, selectedSize: size, selectedColor: chosenColor, stockQuantity: maxStock, stock_quantity: maxStock }];
        }
      });
    }, 600);

    // Step 3: Start fading out the central card at 1000ms
    setTimeout(() => {
      setFlyingItem(prev => prev ? { ...prev, isFading: true } : null);
    }, 1000);

    // Step 4: Clean up state at 1400ms
    setTimeout(() => {
      setFlyingItem(null);
    }, 1400);

    showToast(`Added "${product.title}" (${chosenColor ? chosenColor + ' | ' : ''}${size}) to Shopping Bag 🛍️`);
  };

  // Direct Buy Now Action (Add to Cart + Instant Checkout Navigation)
  const handleBuyNow = (product, qty = 1, size = 'Standard', selectedColor = '', clickMeta = null) => {
    const chosenColor = selectedColor || (product.colour ? product.colour.split(',')[0].trim() : '');
    if (!currentUser) {
      setPendingAuthAction({ type: 'BUY_NOW', product, qty, size, selectedColor: chosenColor });
      setAuthModalMessage(`Please create an account or sign in to buy "${product.title || product.name}".`);
      setIsAuthModalOpen(true);
      return;
    }

    // Real-time stock limit check
    const liveProd = productsList.find(p => p.id === product.id) || product;
    const maxStock = liveProd.stockQuantity !== undefined ? Number(liveProd.stockQuantity) : (liveProd.stock_quantity !== undefined ? Number(liveProd.stock_quantity) : 10);
    
    if (qty > maxStock) {
      showToast(`⚠️ Out of Stock: Only ${maxStock} unit${maxStock > 1 ? 's' : ''} available for this product.`);
      return;
    }

    // Add item directly to cart state
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.selectedSize === size && (item.selectedColor || '') === chosenColor
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity = Math.min(maxStock, Math.max(copy[existingIndex].quantity, qty));
        return copy;
      } else {
        return [...prev, { ...product, quantity: Math.min(maxStock, qty), selectedSize: size, selectedColor: chosenColor, stockQuantity: maxStock, stock_quantity: maxStock }];
      }
    });

    // Close overlays & modals
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsWishlistOpen(false);

    // Direct transition to Checkout
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Proceeding to Checkout for "${product.title || product.name}" ⚡`);
  };

  // Account Tab Click Trigger
  const handleAccountClick = (clickMeta) => {
    if (currentUser) {
      if (clickMeta && clickMeta.left !== undefined) {
        const iconCenterX = clickMeta.left + clickMeta.width / 2;
        const iconCenterY = clickMeta.top + clickMeta.height / 2;
        const tx = window.innerWidth / 2 - iconCenterX;
        const ty = window.innerHeight / 2 - iconCenterY;

        setNavTransition({
          type: 'account',
          left: clickMeta.left,
          top: clickMeta.top,
          width: clickMeta.width,
          height: clickMeta.height,
          tx,
          ty,
          isZoomed: false,
          isFading: false,
          isActive: true
        });

        setTimeout(() => {
          setNavTransition(prev => prev ? { ...prev, isZoomed: true } : null);
        }, 20);

        setTimeout(() => {
          setActiveView('profile');
        }, 1150);

        setTimeout(() => {
          setNavTransition(prev => prev ? { ...prev, isFading: true } : null);
        }, 1400);

        setTimeout(() => {
          setNavTransition(null);
        }, 1800);
      } else {
        setActiveView('profile');
      }
    } else {
      setPendingAuthAction({ type: 'NAVIGATE', view: 'profile' });
      setAuthModalMessage('Please create an account or sign in to view your profile and saved items.');
      setIsAuthModalOpen(true);
    }
  };

  // Auth Success Callback
  const handleLoginSuccess = (userProfile, cartItemsFromDb = [], wishlistIdsFromDb = [], successMsg) => {
    setCurrentUser(userProfile);
    sessionStorage.setItem('jiza_current_user', JSON.stringify(userProfile));

    // Restore cart and wishlist from database
    if (cartItemsFromDb.length > 0) setCartItems(cartItemsFromDb);
    if (wishlistIdsFromDb.length > 0) setWishlistIds(wishlistIdsFromDb);
    
    // Add customer to Admin Customer list immediately
    setRegisteredCustomers((prev) => {
      if (prev.some(c => c.id === userProfile.id)) return prev;
      return [userProfile, ...prev];
    });

    setIsAuthModalOpen(false);
    showToast(successMsg);

    // Resume pending action if queued
    if (pendingAuthAction) {
      if (pendingAuthAction.type === 'ADD_TO_CART') {
        const { product, qty, size, selectedColor: color } = pendingAuthAction;
        const chosenColor = color || (product.colour ? product.colour.split(',')[0].trim() : '');
        setCartItems((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.id === product.id && item.selectedSize === size && (item.selectedColor || '') === chosenColor
          );
          if (existingIndex > -1) {
            const copy = [...prev];
            copy[existingIndex].quantity += qty;
            return copy;
          } else {
            return [...prev, { ...product, quantity: qty, selectedSize: size, selectedColor: chosenColor }];
          }
        });
      } else if (pendingAuthAction.type === 'BUY_NOW') {
        const { product, qty, size, selectedColor: color } = pendingAuthAction;
        const chosenColor = color || (product.colour ? product.colour.split(',')[0].trim() : '');
        setCartItems((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.id === product.id && item.selectedSize === size && (item.selectedColor || '') === chosenColor
          );
          if (existingIndex > -1) {
            const copy = [...prev];
            copy[existingIndex].quantity = Math.max(copy[existingIndex].quantity, qty);
            return copy;
          } else {
            return [...prev, { ...product, quantity: qty, selectedSize: size, selectedColor: chosenColor }];
          }
        });
        setSelectedProduct(null);
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setActiveView('checkout');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (pendingAuthAction.type === 'TOGGLE_WISHLIST') {
        const { productId } = pendingAuthAction;
        setWishlistIds((prev) => {
          if (prev.includes(productId)) return prev;
          return [...prev, productId];
        });
        showToast('Added to Saved Wishlist ❤️');
      } else if (pendingAuthAction.type === 'NAVIGATE') {
        setActiveView(pendingAuthAction.view);
      }
      setPendingAuthAction(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCartItems([]);
    setWishlistIds([]);
    sessionStorage.removeItem('jiza_current_user');
    setActiveView('home');
    showToast('Logged out successfully.');
  };

  const handleUpdateQuantity = (productId, size, colorOrQty, possibleQty) => {
    let color = '';
    let newQty = 1;

    if (typeof colorOrQty === 'number') {
      newQty = colorOrQty;
    } else {
      color = colorOrQty || '';
      newQty = possibleQty;
    }

    if (newQty <= 0) {
      handleRemoveFromCart(productId, size, color);
      return;
    }

    // Real-time stock limit check
    const liveProd = productsList.find(p => p.id === productId);
    const maxStock = liveProd ? (liveProd.stockQuantity !== undefined ? Number(liveProd.stockQuantity) : (liveProd.stock_quantity !== undefined ? Number(liveProd.stock_quantity) : 10)) : 10;
    
    if (newQty > maxStock) {
      showToast(`⚠️ Out of Stock: Maximum available stock (${maxStock} units) reached for this piece.`);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        const matchColor = color ? (item.selectedColor || '') === color : true;
        if (item.id === productId && item.selectedSize === size && matchColor) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId, size, color = '') => {
    setCartItems((prev) =>
      prev.filter((item) => {
        const matchColor = color ? (item.selectedColor || '') === color : true;
        return !(item.id === productId && item.selectedSize === size && matchColor);
      })
    );
    showToast('Item removed from bag');
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setIsCartOpen(false);
      setPendingAuthAction({ type: 'NAVIGATE', view: 'checkout' });
      setAuthModalMessage('Please sign in or create an account to proceed with checkout.');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setActiveView('checkout');
  };

  // ======================================================
  // AUTOMATIC INVENTORY MANAGEMENT
  // - Orders auto-deduct stock
  // - Stock 0 → soldOut=true, inStock=false, pushed to end
  // - Admin increases stock → soldOut=false, inStock=true
  // ======================================================

  const handleOrderSuccess = async (newOrderObj) => {
    try {
      // If order was already finalized & verified on backend via Razorpay (/api/payment/verify-payment)
      if (newOrderObj && newOrderObj.id) {
        setCartItems([]);
        showToast(`Order ${newOrderObj.id} placed & verified successfully! 🎉`);
        fetchDbOrders();
        // Refresh products list from DB to get updated stock & badges
        try {
          const res = await fetch(`${API_BASE}/api/products`);
          if (res.ok) {
            const liveProds = await res.json();
            setProductsList(liveProds);
          }
        } catch (_) {}
        return true;
      }

      // Legacy fallback for manual / offline orders
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newOrderObj.id,
          userId: newOrderObj.userId || currentUser?.id || currentUser?.email || '',
          customerName: newOrderObj.customerName,
          customerEmail: newOrderObj.customerEmail,
          customerPhone: newOrderObj.customerPhone,
          address: newOrderObj.address,
          amount: newOrderObj.rawAmount || newOrderObj.amount,
          paymentMethod: newOrderObj.paymentMethod,
          cartItems: newOrderObj.cartItems
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred during checkout.');
      }

      setCartItems([]);
      setOrdersList((prev) => [newOrderObj, ...prev]);
      showToast(`Order ${newOrderObj.id} placed successfully! 🎉`);
      fetchDbOrders();
      return true;
    } catch (err) {
      console.error('Checkout error details:', err);
      throw err;
    }
  };

  // ADMIN PANEL CONTROLLERS
  const handleAddProduct = async (newProduct) => {
    const stockQty = newProduct.stockQuantity !== undefined ? Number(newProduct.stockQuantity) : 10;
    setProductsList((prev) => [{ ...newProduct, stockQuantity: stockQty, inStock: stockQty > 0, soldOut: stockQty === 0 }, ...prev]);
    showToast(`✨ Product "${newProduct.title}" published live to storefront!`);

    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      fetchDbProducts();
    } catch (err) {
      console.error('Error persisting product to DB:', err);
    }
  };

  // Update stock quantity from admin — auto-manages soldOut
  const handleUpdateProductStock = async (productId, newQuantity) => {
    const qty = Math.max(0, Number(newQuantity));
    const isSoldOut = qty === 0;
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          stockQuantity: qty,
          inStock: !isSoldOut,
          soldOut: isSoldOut,
          badge: isSoldOut ? 'Sold Out' : (p.badge === 'Sold Out' ? 'New Arrival' : p.badge)
        };
      })
    );
    showToast(isSoldOut ? '⚠️ Product marked Sold Out automatically!' : `✅ Stock updated to ${qty} units.`);

    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      await fetch(`${API_BASE}/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newQuantity: qty })
      });
      fetchDbProducts();
    } catch (err) {
      console.error('Error updating stock on backend:', err);
    }
  };

  const handleUpdateProductPrice = async (productId, newPrice) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice, sellingPrice: newPrice } : p))
    );
    showToast('Product price updated live!');

    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      const prod = productsList.find(p => p.id === productId);
      if (prod) {
        await fetch(`${API_BASE}/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...prod, sellingPrice: newPrice, price: newPrice })
        });
        fetchDbProducts();
      }
    } catch (err) {
      console.error('Error updating price on backend:', err);
    }
  };

  const handleUpdateSpecialSection = async (productId, newSection) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, specialSection: newSection } : p))
    );
    showToast(`Special Section updated to '${newSection}'`);

    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      await fetch(`${API_BASE}/api/products/${productId}/special-section`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ specialSection: newSection })
      });
      fetchDbProducts();
    } catch (err) {
      console.error('Error updating special section on backend:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order ${orderId} status set to ${newStatus}`);

    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDbOrders();
    } catch (err) {
      console.error('Error updating order status on backend:', err);
    }
  };


  const handleFullUpdateProduct = async (updatedProd) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? { ...p, ...updatedProd } : p))
    );
    showToast(`✅ Product "${updatedProd.title}" updated successfully!`);

    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      await fetch(`${API_BASE}/api/products/${updatedProd.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProd)
      });
    } catch (err) {
      console.error('Error updating product on backend:', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProductsList((prev) => prev.filter((p) => p.id !== productId));
    showToast(`🗑️ Product deleted successfully.`);

    try {
      const token = sessionStorage.getItem('jiza_admin_token');
      await fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error deleting product on backend:', err);
    }
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Filter orders for logged in user
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return ordersList.filter(o => o.customerEmail === currentUser.email || o.customerName === currentUser.name);
  }, [ordersList, currentUser]);

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex flex-col relative pb-[96px] md:pb-0">
      
      {/* Royal Palace Double Door Splash Animation */}
      {showSplash && (
        <RoyalDoorSplash onComplete={() => setShowSplash(false)} />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-deep-onyx text-heritage-gold px-4 py-2.5 rounded-xl border border-heritage-gold/50 shadow-2xl font-label-md text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-heritage-gold text-[18px]">verified</span>
          {toastMessage}
        </div>
      )}

      {/* RENDER ADMIN PANEL OR STOREFRONT */}
      {activeView === 'admin' ? (
        isAdminSecretRoute && adminToken ? (
          <AdminPanel
            productsList={productsList}
            ordersList={ordersList}
            customersList={registeredCustomers}
            categoriesList={categoriesList}
            onRefreshCategories={fetchDbCategories}
            onRefreshProducts={fetchDbProducts}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleFullUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProductStock={handleUpdateProductStock}
            onUpdateProductPrice={handleUpdateProductPrice}
            onUpdateSpecialSection={handleUpdateSpecialSection}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onExitAdmin={() => {
              sessionStorage.removeItem('jiza_admin_token');
              setAdminToken('');
              setIsAdminSecretRoute(false);
              setActiveView('home');
            }}
          />
        ) : (
          <NotFoundView onGoHome={() => setActiveView('home')} />
        )
      ) : activeView === '404' ? (
        <NotFoundView onGoHome={() => setActiveView('home')} />
      ) : (
        <>
          {/* Sticky Brand Header */}
          <Header 
            setIsCartOpen={setIsCartOpen}
            setIsWishlistOpen={setIsWishlistOpen}
            cartCount={cartCount}
            wishlistCount={wishlistIds.length}
            activeView={activeView}
            setActiveView={handleNavigateView}
            cartNeedsBounce={cartNeedsBounce}
            onSearchClick={() => {
              setSearchQuery('Kundan');
            }}
            currentUser={currentUser}
            onAccountClick={handleAccountClick}
            onOpenAdmin={() => {
              // Stealth Check: Render 404 if secret route not validated
              if (!isAdminSecretRoute || !adminToken) {
                setActiveView('404');
              } else {
                setActiveView('admin');
              }
            }}
          />

          {/* Active Store View Switcher */}
          <div className="flex-grow">
            {activeView === 'home' && (
              <HomeView 
                onSelectCategory={handleSelectCategory}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlistIds}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                setActiveView={setActiveView}
                productsList={productsList}
              />
            )}

            {activeView === 'search' && (
              <SearchView 
                initialQuery={searchQuery}
                initialCategory={selectedCategory}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlistIds}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                setActiveView={setActiveView}
                productsList={productsList}
                categoriesList={categoriesList}
              />
            )}

            {activeView === 'categories' && (
              <CategoriesView 
                onSelectCategory={handleSelectCategory}
                setActiveView={setActiveView}
                categoriesList={categoriesList}
              />
            )}

            {activeView === 'subcategory' && (
              <SubCategoryView 
                categoryId={activeCategoryId}
                onBack={() => setActiveView('categories')}
                onSelectSubCategory={handleSelectSubCategory}
                setActiveView={setActiveView}
                categoriesList={categoriesList}
              />
            )}

            {activeView === 'profile' && (
              <ProfileView 
                setActiveView={setActiveView}
                setIsWishlistOpen={setIsWishlistOpen}
                currentUser={currentUser}
                userOrders={userOrders}
                onLogout={handleLogout}
                onOpenAuthModal={(msg) => {
                  setAuthModalMessage(msg);
                  setIsAuthModalOpen(true);
                }}
                onOpenAdmin={() => setActiveView('admin')}
                productsList={productsList}
                wishlistIds={wishlistIds}
                cartItems={cartItems}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onRefreshOrders={fetchDbOrders}
              />
            )}

            {activeView === 'faq' && (
              <FaqView setActiveView={setActiveView} />
            )}

            {activeView === 'privacy' && (
              <LegalPagesView type="privacy" setActiveView={setActiveView} />
            )}

            {activeView === 'terms' && (
              <LegalPagesView type="terms" setActiveView={setActiveView} />
            )}

            {activeView === 'rental-gallery' && (
              <RentalGalleryView setActiveView={setActiveView} />
            )}

            {(activeView === 'cancellation-policy' || activeView === 'modification-policy') && (
              <CancellationPolicyView setActiveView={setActiveView} />
            )}

            {activeView === 'checkout' && (
              <CheckoutView 
                cartItems={cartItems}
                totalAmount={cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                onOrderSuccess={handleOrderSuccess}
                onBackToCart={() => setIsCartOpen(true)}
                currentUser={currentUser}
                setActiveView={setActiveView}
              />
            )}
          </div>

          {/* Floating Fixed WhatsApp Button (Optimized Compact Size) */}
          <button 
            onClick={() => window.open('https://wa.me/918208822696?text=Hello%20Jiza%20Jewellery%20Studio', '_blank')}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-11 h-11 md:w-13 md:h-13 bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 z-40 group"
            title="Chat with Jiza Studio on WhatsApp"
          >
            <svg className="w-5.5 h-5.5 md:w-6.5 md:h-6.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span className="absolute right-13 md:right-15 bg-[#25D366] text-white text-[11px] font-label-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              Chat on WhatsApp
            </span>
          </button>

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav 
            activeView={activeView}
            setActiveView={handleNavigateView}
            onAccountClick={handleAccountClick}
            currentUser={currentUser}
          />
        </>
      )}

      {/* 4FA Enterprise Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => {
          setIsAdminLoginOpen(false);
          if (!adminToken) setActiveView('404');
        }}
        onLoginSuccess={(token) => {
          sessionStorage.setItem('jiza_admin_token', token);
          setAdminToken(token);
          setIsAdminLoginOpen(false);
          setIsAdminSecretRoute(true);
          setActiveView('admin');
          showToast('✅ 4FA Authentication Successful! Welcome Admin.');
        }}
      />

      {/* Auth / Account Creation Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAuthAction(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        pendingActionMessage={authModalMessage}
        registeredCustomers={registeredCustomers}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
      />

      {/* Cart & Wishlist Drawers */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleProceedToCheckout}
        onSelectProduct={(p) => setSelectedProduct(p)}
        productsList={productsList}
      />

      <WishlistDrawer 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onSelectProduct={(p) => setSelectedProduct(p)}
        productsList={productsList}
      />

      {/* Category square zoom animation overlay */}
      {categoryTransition && categoryTransition.isActive && (
        <>
          {/* Cinema dimming backdrop (Light Pastel Pink with 90% Opacity) */}
          <div 
            className="fixed inset-0 bg-[#FCDAD7] z-[9998]"
            style={{
              opacity: categoryTransition.isFading ? 0 : (categoryTransition.isZoomed ? 0.90 : 0),
              transition: 'opacity 450ms ease-out',
              pointerEvents: 'none'
            }}
          />
          <div 
            className="fixed inset-0 z-[9999] pointer-events-none"
          >
            <div 
              className="absolute rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/20"
              style={{
                left: `${categoryTransition.left}px`,
                top: `${categoryTransition.top}px`,
                width: `${categoryTransition.width}px`,
                height: `${categoryTransition.height}px`,
                backgroundImage: `url(${categoryTransition.imgSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: categoryTransition.isZoomed 
                  ? `translate(${categoryTransition.tx}px, ${categoryTransition.ty}px) scale(${categoryTransition.scale})` 
                  : 'translate(0px, 0px) scale(1)',
                opacity: categoryTransition.isFading ? 0 : 1,
                transition: 'transform 600ms cubic-bezier(0.25, 1, 0.3, 1), opacity 450ms ease-out',
                transformOrigin: 'center center',
                willChange: 'transform, opacity',
              }}
            />
          </div>

          {/* Category Name Label centered below the square (Pink background with Black text) */}
          <div 
            className="fixed z-[9999] pointer-events-none text-center select-none whitespace-nowrap"
            style={{
              left: '50%',
              top: `calc(50% + ${((((categoryTransition.width || 80) * (categoryTransition.scale || 2.8)) / 2) + 25)}px)`,
              opacity: categoryTransition.isFading ? 0 : (categoryTransition.isZoomed ? 1 : 0),
              transform: `translate(-50%, ${categoryTransition.isZoomed ? '0px' : '20px'})`,
              transition: 'opacity 400ms ease-out 100ms, transform 500ms cubic-bezier(0.25, 1, 0.3, 1) 100ms',
            }}
          >
            <div className="bg-[#FCDAD7]/95 backdrop-blur px-8 py-3 rounded-2xl border border-black/10 shadow-[0_15px_40px_rgba(0,0,0,0.15)]">
              <span className="font-headline-md text-xl md:text-2xl text-black font-bold tracking-wide block">
                {categoryTransition.name}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Search & Account transition styles & overlays */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        @keyframes scanGlow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(214, 175, 55, 0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(214, 175, 55, 0.9)); }
        }
        .animate-scanline {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: #D4AF37;
          box-shadow: 0 0 10px #D4AF37, 0 0 20px #D4AF37;
          animation: scanline 1.6s linear infinite;
        }
        .animate-3d-rotate {
          animation: rotate3d 2.2s ease-in-out infinite;
        }
        @keyframes rotate3d {
          0%, 100% { transform: perspective(500px) rotateY(-18deg) rotateX(12deg); }
          50% { transform: perspective(500px) rotateY(18deg) rotateX(-6deg); }
        }
      `}</style>

      {navTransition && navTransition.isActive && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-[#FCDAD7] z-[9998]"
            style={{
              opacity: navTransition.isFading ? 0 : (navTransition.isZoomed ? 0.90 : 0),
              transition: 'opacity 400ms ease-out',
              pointerEvents: 'none'
            }}
          />
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            
            {/* Search Tab Transition */}
            {navTransition.type === 'search' && (
              <div
                className="absolute flex items-center justify-center text-black bg-[#FCDAD7] border border-black/15 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.15)]"
                style={{
                  left: `${navTransition.left}px`,
                  top: `${navTransition.top}px`,
                  width: `${navTransition.width}px`,
                  height: `${navTransition.height}px`,
                  transform: navTransition.isZoomed 
                    ? `translate(${navTransition.tx}px, ${navTransition.ty}px) scale(3.2) rotate(360deg)` 
                    : 'translate(0px, 0px) scale(1) rotate(0deg)',
                  opacity: navTransition.isFading ? 0 : 1,
                  transition: 'transform 700ms cubic-bezier(0.25, 1, 0.3, 1), opacity 450ms ease-out',
                  transformOrigin: 'center center',
                  willChange: 'transform, opacity',
                }}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  search
                </span>
              </div>
            )}

            {/* Account Tab Transition */}
            {navTransition.type === 'account' && (
              <div
                className="absolute flex flex-col items-center justify-center text-black"
                style={{
                  left: `${navTransition.left}px`,
                  top: `${navTransition.top}px`,
                  width: `${navTransition.width}px`,
                  height: `${navTransition.height}px`,
                  transform: navTransition.isZoomed 
                    ? `translate(${navTransition.tx}px, ${navTransition.ty}px) scale(1)` 
                    : 'translate(0px, 0px) scale(1)',
                  opacity: navTransition.isFading ? 0 : 1,
                  transition: 'transform 600ms cubic-bezier(0.25, 1, 0.3, 1), opacity 450ms ease-out',
                  transformOrigin: 'center center',
                  willChange: 'transform, opacity',
                }}
              >
                {/* 3D scanning box overlay (Square Shape with Rounded Corners) */}
                <div 
                  className={`relative p-5 rounded-xl border border-black/10 bg-[#FCDAD7]/95 shadow-[0_20px_45px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden transition-all duration-600 shrink-0 ${
                    navTransition.isZoomed ? 'w-28 h-28 opacity-100 animate-3d-rotate' : 'w-8 h-8 opacity-0'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Scan Laser Line */}
                  {navTransition.isZoomed && !navTransition.isFading && (
                    <div className="animate-scanline" />
                  )}
                  {/* Person Icon */}
                  <span className="material-symbols-outlined text-[54px] text-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                    person
                  </span>
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* Central Cart Animation Overlay (Beveled 3D Popup, No Flying Thumbnail) */}
      {flyingItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
          {/* Dimming backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 transition-opacity duration-300"
            style={{ opacity: flyingItem.isFading ? 0 : 1 }}
          />
          
          {/* Central Cart Card with 3D Bevel Relief Details */}
          <div 
            className="relative bg-[#FCDAD7] border border-black/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center z-10 transition-all duration-300"
            style={{
              transform: flyingItem.isFading ? 'scale(0.85)' : 'scale(1)',
              opacity: flyingItem.isFading ? 0 : 1,
            }}
          >
            {/* The Shopping Bag Icon in the center */}
            <div 
              className={`w-20 h-20 rounded-full bg-black/5 border border-black/10 flex items-center justify-center transition-all duration-300 ${
                flyingItem.isLanded ? 'animate-heartBeat text-black scale-110 bg-black/10' : 'text-black'
              }`}
            >
              <span className="material-symbols-outlined text-[42px]">shopping_bag</span>
            </div>
            
            {/* "Added to Bag" small premium tag */}
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-black mt-3 font-label-md">
              Added to Bag
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
