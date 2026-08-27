import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import ProductReviewPopupModal from './ProductReviewPopupModal';
import InternationalShippingNotice from './InternationalShippingNotice';
import { COUNTRIES, isIndia as checkIsIndia } from '../data/countries';

export default function ProfileView({ 
  setActiveView, 
  setIsWishlistOpen,
  currentUser,
  userOrders = [],
  onLogout,
  onOpenAuthModal,
  onOpenAdmin,
  productsList = [],
  wishlistIds = [],
  cartItems = [],
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onUpdateQuantity,
  onRemoveFromCart,
  onSelectProduct,
  onRefreshOrders
}) {
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState('');

  // LIVE 2-HOUR TIMER TICKER
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getOrderRemainingSeconds = (createdAt) => {
    if (!createdAt) return 0;
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const createdMs = new Date(createdAt).getTime();
    const elapsed = nowMs - createdMs;
    return Math.max(0, Math.floor((TWO_HOURS_MS - elapsed) / 1000));
  };

  const formatRemainingTime = (seconds) => {
    if (seconds <= 0) return '00m 00s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  // International Notice State in Profile
  const [showIntlNotice, setShowIntlNotice] = useState(false);
  const [intlNoticeCountry, setIntlNoticeCountry] = useState('');

  // ORDER MODIFICATION STATE
  const [modifyingOrder, setModifyingOrder] = useState(null);
  const [modifyTab, setModifyTab] = useState('address'); // 'address' | 'variant' | 'add_items'
  const [modifyAddressForm, setModifyAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    pickupPersonName: '',
    pickupPersonPhone: '',
    notes: ''
  });
  const [modifyVariantList, setModifyVariantList] = useState([]);
  const [modifyAddItemSelect, setModifyAddItemSelect] = useState({
    productId: '',
    quantity: 1,
    selectedSize: 'Standard',
    selectedColor: 'Gold'
  });
  const [isModifyingSubmitting, setIsModifyingSubmitting] = useState(false);
  const [modifyErrorMsg, setModifyErrorMsg] = useState('');
  const [modifySuccessMsg, setModifySuccessMsg] = useState('');

  const handleModifyCountryChange = (newCountry) => {
    const isNowIntl = newCountry && newCountry !== 'India';
    setModifyAddressForm(prev => ({ ...prev, country: newCountry }));
    if (isNowIntl) {
      setIntlNoticeCountry(newCountry);
      setShowIntlNotice(true);
    }
  };

  const handleOpenModifyModal = (order, e) => {
    if (e) e.stopPropagation();
    setModifyErrorMsg('');
    setModifySuccessMsg('');
    setModifyTab('address');

    let parsedItems = [];
    try {
      parsedItems = typeof order.itemsJson === 'string'
        ? JSON.parse(order.itemsJson)
        : (order.items_json ? (typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json) : []);
    } catch (_) { parsedItems = []; }

    const isPickup = order.fulfillmentType === 'pickup' || order.fulfillment_type === 'pickup';
    const pDetails = order.pickupDetails || {};

    setModifyAddressForm({
      fullName: order.customerName || order.customer_name || currentUser?.name || '',
      phone: order.customerPhone || order.customer_phone || currentUser?.phone || '',
      address: order.shippingAddressLine1 || order.shipping_address_line1 || order.address || order.shipping_address || '',
      city: order.shippingCity || order.shipping_city || currentUser?.city || '',
      state: order.shippingState || order.shipping_state || currentUser?.state || '',
      pincode: order.shippingPincode || order.shipping_pincode || currentUser?.pincode || '',
      country: order.shippingCountry || order.shipping_country || currentUser?.country || 'India',
      pickupPersonName: pDetails.pickupPersonName || order.customerName || order.customer_name || '',
      pickupPersonPhone: pDetails.pickupPersonPhone || order.customerPhone || order.customer_phone || '',
      notes: pDetails.notes || ''
    });

    setModifyVariantList(parsedItems.map((item, idx) => ({
      index: idx,
      title: item.title || item.name,
      selectedSize: item.selectedSize || 'Free Size',
      selectedColor: item.selectedColor || item.colour || 'Gold'
    })));

    setModifyAddItemSelect({
      productId: productsList.find(p => (p.stock_quantity ?? 0) > 0)?.id || '',
      quantity: 1,
      selectedSize: 'Standard',
      selectedColor: 'Gold'
    });

    setModifyingOrder(order);
  };

  const handleSaveModification = async (e) => {
    e.preventDefault();
    if (!modifyingOrder || isModifyingSubmitting) return;
    setIsModifyingSubmitting(true);
    setModifyErrorMsg('');
    setModifySuccessMsg('');

    try {
      const isPickup = modifyingOrder.fulfillmentType === 'pickup' || modifyingOrder.fulfillment_type === 'pickup';
      let payload = {
        modificationType: modifyTab,
        actor: 'customer'
      };

      if (modifyTab === 'address') {
        if (isPickup) {
          const cleanPickupPhone = (modifyAddressForm.pickupPersonPhone || modifyAddressForm.phone || '').replace(/\D/g, '');
          if (cleanPickupPhone.length !== 10) {
            throw new Error('Please enter a valid 10-digit mobile number for pickup coordination.');
          }
          payload.pickupDetails = {
            pickupPersonName: modifyAddressForm.pickupPersonName || modifyAddressForm.fullName,
            pickupPersonPhone: cleanPickupPhone,
            notes: modifyAddressForm.notes
          };
        } else {
          const cleanPhone = (modifyAddressForm.phone || '').replace(/\D/g, '');
          if (cleanPhone.length !== 10) {
            throw new Error('Please enter a valid 10-digit mobile number.');
          }
          if ((modifyAddressForm.pincode || '').replace(/\D/g, '').length !== 6) {
            throw new Error('Please enter a valid 6-digit postal pincode.');
          }
          payload.shippingData = {
            fullName: modifyAddressForm.fullName,
            phone: cleanPhone,
            address: modifyAddressForm.address,
            city: modifyAddressForm.city,
            state: modifyAddressForm.state,
            pincode: modifyAddressForm.pincode
          };
        }
      } else if (modifyTab === 'variant') {
        payload.variantChanges = modifyVariantList.map(v => ({
          index: v.index,
          selectedSize: v.selectedSize,
          selectedColor: v.selectedColor
        }));
      } else if (modifyTab === 'add_items') {
        if (!modifyAddItemSelect.productId) {
          throw new Error('Please select a product to add.');
        }
        const prod = productsList.find(p => p.id === modifyAddItemSelect.productId);
        payload.itemsToAdd = [{
          id: modifyAddItemSelect.productId,
          title: prod?.title || 'Product',
          quantity: Number(modifyAddItemSelect.quantity) || 1,
          selectedSize: modifyAddItemSelect.selectedSize,
          selectedColor: modifyAddItemSelect.selectedColor
        }];
      }

      const res = await fetch(`${API_BASE}/api/orders/${modifyingOrder.id}/modify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order.');
      }

      setModifySuccessMsg('Order updated successfully!');
      setTimeout(() => {
        setModifyingOrder(null);
        if (typeof onRefreshOrders === 'function') onRefreshOrders();
      }, 1500);

    } catch (err) {
      setModifyErrorMsg(err.message || 'Error modifying order.');
    } finally {
      setIsModifyingSubmitting(false);
    }
  };

  // REVIEW POPUP STATE
  const [pendingReviewPrompt, setPendingReviewPrompt] = useState(null);

  // PROBLEM REPORTING STATE
  const [problemSubject, setProblemSubject] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [problemScreenshot, setProblemScreenshot] = useState('');
  const [problemSubmitting, setProblemSubmitting] = useState(false);
  const [problemSuccessMsg, setProblemSuccessMsg] = useState('');
  const [myProblemsList, setMyProblemsList] = useState([]);
  const [showProblemForm, setShowProblemForm] = useState(false);

  // Edit Profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    pincode: currentUser?.pincode || ''
  });

  // ACCOUNT DELETION STATE
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEditableProfile({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        pincode: currentUser.pincode || ''
      });
      fetchPendingReviewPrompt();
      fetchMyProblems();
    }
  }, [currentUser]);

  // Re-check review prompt whenever userOrders changes (e.g. admin marks Delivered)
  useEffect(() => {
    if (currentUser && userOrders.length > 0) {
      fetchPendingReviewPrompt();
    }
  }, [userOrders.length]);

  const fetchPendingReviewPrompt = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/pending-prompt?userId=${currentUser.id || ''}&email=${encodeURIComponent(currentUser.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.prompt) setPendingReviewPrompt(data.prompt);
      }
    } catch (err) {
      console.log('Error checking review prompt:', err);
    }
  };

  const handleOpenReviewForOrder = (order, e) => {
    if (e) e.stopPropagation();
    let items = [];
    try {
      items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
    } catch (err) { items = []; }

    const firstItem = items[0] || {};
    const prodId = String(firstItem.id || firstItem.productId || ('ORDER-' + order.id));
    const prodName = firstItem.title || firstItem.name || order.items || 'Jewellery Order';
    const prodImg = firstItem.img || (firstItem.images && firstItem.images[0]) || '';

    setPendingReviewPrompt({
      orderId: order.id,
      productId: prodId,
      productName: prodName,
      productImage: prodImg,
      customerName: currentUser?.name || order.customer_name || 'Customer',
      customerEmail: currentUser?.email || order.customer_email || '',
      userId: currentUser?.id || order.user_id || ''
    });
  };

  const fetchMyProblems = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/api/problems/my-problems?userId=${currentUser.id || ''}&email=${encodeURIComponent(currentUser.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        setMyProblemsList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log('Error fetching problems:', err);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || reviewData.userId,
          orderId: reviewData.orderId,
          productId: reviewData.productId,
          productName: reviewData.productName,
          productImage: reviewData.productImage,
          customerName: currentUser?.name || reviewData.customerName,
          customerEmail: currentUser?.email || reviewData.customerEmail,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText
        })
      });
      if (res.ok) {
        setPendingReviewPrompt(null);
        setSavedSuccess('Thank you! Your review has been submitted for admin approval.');
        setTimeout(() => setSavedSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleReviewDismiss = async (promptData, action) => {
    try {
      await fetch(`${API_BASE}/api/reviews/dismiss-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || promptData.userId,
          orderId: promptData.orderId,
          productId: promptData.productId,
          action
        })
      });
      setPendingReviewPrompt(null);
    } catch (err) {
      console.error('Error dismissing review prompt:', err);
    }
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size exceeds 5MB limit.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setProblemScreenshot(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProblemSubmit = async (e) => {
    e.preventDefault();
    if (!problemSubject.trim() || !problemDescription.trim()) return;
    setProblemSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || '',
          customerName: currentUser?.name || 'Customer',
          customerEmail: currentUser?.email || '',
          customerPhone: currentUser?.phone || '',
          subject: problemSubject,
          description: problemDescription,
          screenshot: problemScreenshot
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProblemSuccessMsg(`Complaint submitted! Reference ID: ${data.complaintId}`);
        setProblemSubject('');
        setProblemDescription('');
        setProblemScreenshot('');
        setShowProblemForm(false);
        fetchMyProblems();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit problem report.');
      }
    } catch (err) {
      console.error('Error submitting problem report:', err);
    } finally {
      setProblemSubmitting(false);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const cleanPin = String(editableProfile.pincode || '').trim();
    if (!cleanPin) {
      alert('Pincode is required.');
      return;
    }
    if (!/^\d{6}$/.test(cleanPin)) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }
    setSavedSuccess('Profile details saved successfully!');
    setTimeout(() => { setSavedSuccess(''); setShowEditModal(false); }, 2000);
  };

  const handleAccountDelete = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    setIsDeletingAccount(true);
    setDeleteErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/users/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || '',
          email: currentUser?.email || ''
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsDeleteModalOpen(false);
        alert('Your account has been permanently deleted.');
        if (onLogout) onLogout();
        if (setActiveView) setActiveView('home');
      } else {
        setDeleteErrorMsg(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteErrorMsg('Network Error: Could not delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Get Wishlist Products List
  const wishlistProducts = productsList.filter(p => wishlistIds.includes(p.id));
  const cartTotal = cartItems.reduce((acc, i) => acc + (Number(i.selling_price || i.price) * (i.quantity || 1)), 0);

  // If user is not logged in
  if (!currentUser) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 pb-32 min-h-[70vh] flex items-center justify-center">
        <div className="bg-white border border-heritage-gold/40 rounded-3xl p-8 md:p-12 text-center max-w-md w-full shadow-2xl space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-antique-cream border border-heritage-gold/40 rounded-full flex items-center justify-center text-heritage-gold mx-auto shadow-inner">
            <span className="material-symbols-outlined text-5xl">person_add</span>
          </div>
          <div className="space-y-2">
            <h1 className="font-headline-sm text-2xl md:text-3xl text-on-surface font-bold">Welcome to Jiza Studio</h1>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
              Please sign in or create an account to view your order history, wishlist, and profile.
            </p>
          </div>
          <button
            onClick={() => onOpenAuthModal('Please create an account or sign in to access your profile.')}
            className="w-full py-3.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 border border-black/25"
          >
            <span className="material-symbols-outlined text-lg">verified_user</span>
            <span>Create Account / Sign In</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 pb-32 space-y-6">

      {/* REVIEW POPUP MODAL */}
      {pendingReviewPrompt && (
        <ProductReviewPopupModal 
          promptData={pendingReviewPrompt}
          onSubmit={handleReviewSubmit}
          onDismiss={handleReviewDismiss}
        />
      )}

      {/* ─────────────────────────────────────────── */}
      {/* TOP PINK BLUSH PROFILE CARD - Edit + Logout only */}
      {/* ─────────────────────────────────────────── */}
      <div className="bg-[#FCDAD7] text-black rounded-3xl p-6 md:p-8 border border-black/15 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-black/20 to-black/40 p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-black">
                <span className="material-symbols-outlined text-4xl md:text-5xl">person</span>
              </div>
            </div>
            <div>
              <h1 className="font-headline-sm text-xl md:text-2xl font-bold text-black tracking-wide">{currentUser.name}</h1>
              <div className="flex flex-col gap-1 mt-1.5 text-xs text-black/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">call</span>
                  {currentUser.phone}
                </span>
                <span className="flex items-center gap-1.5 text-amber-200/90">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Member Since {currentUser.joinedDate || 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile + Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2.5 bg-heritage-gold/10 hover:bg-heritage-gold/20 text-heritage-gold border border-heritage-gold/40 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────── */}
      {/* SECTION 1: MY ORDERS                   */}
      {/* ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-black text-xl">history</span>
          <h2 className="font-headline-sm text-base font-bold text-on-surface">My Orders</h2>
          <span className="px-2 py-0.5 bg-[#FCDAD7] text-black text-[10px] font-bold rounded-full border border-black/15">{userOrders.length}</span>
        </div>

        {userOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
            <span className="material-symbols-outlined text-5xl text-black/30">shopping_bag</span>
            <p className="text-sm font-semibold text-gray-500">No orders placed yet.</p>
            <button
              onClick={() => setActiveView('home')}
              className="mt-1 px-5 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 cursor-pointer"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userOrders.map((order) => {
              const remSec = getOrderRemainingSeconds(order.createdAt || order.created_at);
              const isPickup = order.fulfillmentType === 'pickup' || order.fulfillment_type === 'pickup';
              const isModifiable = !['Shipped', 'Delivered', 'Cancelled'].includes(order.status) && remSec > 0;
              const hasModifications = (order.modificationHistory && order.modificationHistory.length > 0) || (order.modifiedAt || order.modified_at);

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderModal(order)}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-black/20 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-mono text-xs font-bold text-black">{order.id}</span>
                        
                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {order.status || 'Pending'}
                        </span>

                        {/* Fulfillment Badge (Ship vs Pickup) */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          isPickup 
                            ? 'bg-purple-50 text-purple-800 border-purple-200' 
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {isPickup ? 'storefront' : 'local_shipping'}
                          </span>
                          <span>{isPickup ? 'Store Pickup' : 'Home Delivery'}</span>
                        </span>

                        {/* Modified Badge */}
                        {hasModifications && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px]">edit</span>
                            <span>Modified</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                          ✓ Paid
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{order.items || 'Jewellery Items'}</p>
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{order.date || 'Recent'}</span>
                        
                        {/* Live 2-Hour Window Countdown Badge on Card */}
                        {!['Shipped', 'Delivered', 'Cancelled'].includes(order.status) && (
                          remSec > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-[#FFF0F2] border border-[#F8B3AC] px-2 py-0.5 rounded-md">
                              <span className="material-symbols-outlined text-xs animate-spin">schedule</span>
                              <span>Modify window: {formatRemainingTime(remSec)}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                              <span className="material-symbols-outlined text-xs">lock</span>
                              <span>Modification closed (&gt;2h)</span>
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <p className="font-headline-sm text-base font-bold text-black">{order.amount}</p>
                      
                      {isModifiable ? (
                        <button
                          onClick={(e) => handleOpenModifyModal(order, e)}
                          className="px-2.5 py-1 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-[10px] font-bold rounded-lg border border-black/20 shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[12px]">edit</span>
                          <span>Modify Order</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-black font-bold">
                          View Details
                          <span className="material-symbols-outlined text-xs">chevron_right</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {order.status === 'Delivered' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span> Order Delivered
                      </span>
                      <button
                        onClick={(e) => handleOpenReviewForOrder(order, e)}
                        className="px-3 py-1.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-[11px] font-bold rounded-lg border border-black/20 shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">star</span>
                        <span>Rate & Review</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────── */}
      {/* SECTION 2: MY WISHLIST                 */}
      {/* ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-red-500 text-xl">favorite</span>
          <h2 className="font-headline-sm text-base font-bold text-on-surface">My Wishlist</h2>
          <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-full">{wishlistProducts.length}</span>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
            <span className="material-symbols-outlined text-5xl text-red-200">favorite_border</span>
            <p className="text-sm font-semibold text-gray-500">Your Wishlist is Empty</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">Save your favourite jewellery pieces to view them anytime.</p>
            <button
              onClick={() => setActiveView('home')}
              className="px-5 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 cursor-pointer"
            >
              Browse Collection
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-black/20 transition-all flex items-center gap-4"
              >
                <div
                  onClick={() => onSelectProduct(product)}
                  className="w-16 h-16 rounded-xl bg-antique-cream/40 overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  <img src={product.img} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>

                <div className="flex-grow min-w-0" onClick={() => onSelectProduct(product)}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600">{product.category_label || product.category}</p>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface line-clamp-1 cursor-pointer hover:text-black transition-colors">{product.title}</h4>
                  <p className="font-headline-sm text-sm font-bold text-black mt-0.5">₹{Number(product.selling_price || product.price).toLocaleString('en-IN')}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onAddToCart(product, 1)}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#FFF0F2] text-black font-semibold text-[10px] rounded-lg shadow-xs border border-black/15 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Add to Cart"
                  >
                    <span className="material-symbols-outlined text-xs">shopping_bag</span>
                    <span>Add</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onBuyNow) {
                        onBuyNow(product, 1, 'Standard', '');
                      } else {
                        onAddToCart(product, 1);
                      }
                    }}
                    className="px-2.5 py-1.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-[10px] rounded-lg shadow-xs border border-black/20 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Buy Now"
                  >
                    <span className="material-symbols-outlined text-xs">flash_on</span>
                    <span>Buy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                    title="Remove from Wishlist"
                  >
                    <span className="material-symbols-outlined text-base fill-1">favorite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────── */}
      {/* SECTION 3: MY CART                     */}
      {/* ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-black text-xl">shopping_bag</span>
          <h2 className="font-headline-sm text-base font-bold text-on-surface">My Cart</h2>
          <span className="px-2 py-0.5 bg-[#FCDAD7] text-black text-[10px] font-bold rounded-full border border-black/15">
            {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)}
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
            <span className="material-symbols-outlined text-5xl text-black/30">shopping_cart</span>
            <p className="text-sm font-semibold text-gray-500">Your Cart is Empty</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">Items added to your bag are synced with your account.</p>
            <button
              onClick={() => setActiveView('home')}
              className="px-5 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 cursor-pointer"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item, idx) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor || ''}-${idx}`}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-xl bg-antique-cream flex-shrink-0"
                />
                <div className="flex-grow min-w-0">
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface line-clamp-1">{item.title}</h4>
                  
                  <div className="flex flex-wrap gap-1.5 items-center mt-1 text-[10px]">
                    {item.selectedSize && (
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {(item.selectedColor || item.colour) && (
                      <span className="bg-[#FFF0F2] text-black border border-[#F8B3AC] px-1.5 py-0.5 rounded font-bold">
                        Colour: {item.selectedColor || item.colour}
                      </span>
                    )}
                  </div>
                  
                  <p className="font-bold text-sm text-black mt-1">₹{Number(item.selling_price || item.price).toLocaleString('en-IN')}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor || '', (item.quantity || 1) - 1)}
                      className="px-2.5 py-1 text-xs hover:bg-gray-100 font-bold"
                    >−</button>
                    <span className="px-3 text-xs font-bold">{item.quantity || 1}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor || '', (item.quantity || 1) + 1)}
                      className="px-2.5 py-1 text-xs hover:bg-gray-100 font-bold"
                    >+</button>
                  </div>
                  <button
                    onClick={() => onRemoveFromCart(item.id, item.selectedSize, item.selectedColor || '')}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Cart Total + Checkout */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Express Insured Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-bold text-sm text-on-surface">Total Payable</span>
                <span className="font-headline-sm text-lg font-bold text-black">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={() => setActiveView('checkout')}
                className="w-full mt-4 py-3.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform active:scale-95 border border-black/25"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────── */}
      {/* SECTION 4: HELP & SUPPORT              */}
      {/* ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-black text-xl">help_center</span>
          <h2 className="font-headline-sm text-base font-bold text-on-surface">Help & Support</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-black text-base">report_problem</span>
              Support Tickets
            </h3>
            {!showProblemForm && (
              <button
                onClick={() => setShowProblemForm(true)}
                className="px-3 py-1.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 cursor-pointer"
              >
                + New Ticket
              </button>
            )}
          </div>

          {problemSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              ✓ {problemSuccessMsg}
            </div>
          )}

          {showProblemForm && (
            <form onSubmit={handleProblemSubmit} className="space-y-3 pt-3 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Subject / Issue Title</label>
                <input
                  type="text" required
                  placeholder="e.g. Delayed Delivery / Damaged Product"
                  value={problemSubject}
                  onChange={(e) => setProblemSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Description</label>
                <textarea
                  required rows={3}
                  placeholder="Describe your issue in detail..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Attach Screenshot (Optional)</label>
                <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="text-xs text-gray-500" />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit" disabled={problemSubmitting}
                  className="px-5 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 disabled:opacity-50 cursor-pointer"
                >
                  {problemSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
                <button
                  type="button" onClick={() => setShowProblemForm(false)}
                  className="px-4 py-2.5 border border-gray-200 text-xs font-bold text-gray-500 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {myProblemsList.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Your Tickets</p>
              {myProblemsList.map((ticket) => (
                <div key={ticket.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-black">{ticket.id}</span>
                      <span className="font-bold text-on-surface">{ticket.subject}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{ticket.description}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ml-3 shrink-0 ${
                    ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────── */}
      {/* SECTION 5: PRIVACY & ACCOUNT DELETION */}
      {/* ─────────────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="bg-red-50/50 border border-red-200/60 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-lg">no_accounts</span>
              <h3 className="font-headline-sm text-sm font-bold text-red-900">Delete Account & Personal Data</h3>
            </div>
            <p className="text-xs text-red-700/80 max-w-lg">
              Permanently delete your user account, wishlist, saved address, and cart data in accordance with DPDP privacy standards.
            </p>
          </div>
          <button
            onClick={() => {
              setDeleteConfirmText('');
              setDeleteErrorMsg('');
              setIsDeleteModalOpen(true);
            }}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────── */}
      {/* DELETE ACCOUNT CONFIRMATION MODAL             */}
      {/* ─────────────────────────────────────────────── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative border border-red-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <span className="material-symbols-outlined text-xl">warning</span>
                </div>
                <h3 className="font-headline-sm text-base font-bold text-red-900">Delete Account Confirmation</h3>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-base text-gray-500">close</span>
              </button>
            </div>

            {/* Warning Content */}
            <div className="space-y-3">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                <p className="font-bold text-xs text-red-900">
                  Are you sure? This action is permanent and cannot be undone.
                </p>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  Your profile, saved addresses, cart items, wishlist, and reviews will be permanently purged. Historical tax/order invoices will be anonymized.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-gray-700 block">
                  Please type <span className="text-red-600 font-mono font-extrabold select-all">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-on-surface font-mono font-bold focus:outline-none focus:border-red-500 uppercase tracking-widest"
                />
              </div>

              {deleteErrorMsg && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  ⚠️ {deleteErrorMsg}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={deleteConfirmText.trim() !== 'DELETE' || isDeletingAccount}
                onClick={handleAccountDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow flex-grow flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-base">delete_forever</span>
                <span>{isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────── */}
      {/* EDIT PROFILE MODAL                             */}
      {/* ─────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-headline-sm text-base font-bold text-on-surface">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-base text-gray-500">close</span>
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">✓ {savedSuccess}</div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-3">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email Address', key: 'email', type: 'email' },
                { label: 'Phone Number', key: 'phone', type: 'text' },
                { label: 'Default Address', key: 'address', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-500 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={editableProfile[key]}
                    onChange={(e) => setEditableProfile({ ...editableProfile, [key]: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-heritage-gold font-semibold"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">City</label>
                  <input type="text" value={editableProfile.city} onChange={(e) => setEditableProfile({ ...editableProfile, city: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-heritage-gold font-semibold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Pincode</label>
                  <input type="text" value={editableProfile.pincode} onChange={(e) => setEditableProfile({ ...editableProfile, pincode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-heritage-gold font-semibold" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Country</label>
                <select
                  value={editableProfile.country || 'India'}
                  onChange={(e) => setEditableProfile({ ...editableProfile, country: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-heritage-gold font-semibold"
                >
                  <option value="India">🇮🇳 India (Domestic)</option>
                  <optgroup label="─── International ───">
                    {COUNTRIES.filter(c => c.name !== 'India').map(c => (
                      <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button type="submit" className="px-6 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow flex-grow border border-black/20 transition-colors cursor-pointer">
                  Save Changes
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2.5 border border-gray-200 text-xs font-bold text-gray-500 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────── */}
      {/* ORDER DETAILS MODAL                            */}
      {/* ─────────────────────────────────────────────── */}
      {selectedOrderModal && (() => {
        const remSec = getOrderRemainingSeconds(selectedOrderModal.createdAt || selectedOrderModal.created_at);
        const isPickup = selectedOrderModal.fulfillmentType === 'pickup' || selectedOrderModal.fulfillment_type === 'pickup';
        const isModifiable = !['Shipped', 'Delivered', 'Cancelled'].includes(selectedOrderModal.status) && remSec > 0;
        const pDetails = selectedOrderModal.pickupDetails || {};

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#FDFBF7] border border-black/20 text-stone-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="bg-black text-[#FCDAD7] p-4 px-6 flex items-center justify-between border-b border-white/20 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl">receipt_long</span>
                  <div>
                    <h3 className="font-headline-sm text-base font-bold text-white">Order Details</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#FCDAD7]/80">{selectedOrderModal.id || selectedOrderModal.orderCode}</span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                        isPickup ? 'bg-purple-900/60 text-purple-200 border border-purple-400/40' : 'bg-blue-900/60 text-blue-200 border border-blue-400/40'
                      }`}>
                        {isPickup ? '🏪 Store Pickup' : '🚚 Home Delivery'}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedOrderModal(null)} className="text-[#FCDAD7]/70 hover:text-[#FCDAD7] p-1 cursor-pointer">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-on-surface">
                
                {/* 2-HOUR POLICY STATUS BANNER */}
                {!['Shipped', 'Delivered', 'Cancelled'].includes(selectedOrderModal.status) && (
                  remSec > 0 ? (
                    <div className="bg-[#FFF9F9] border border-[#F8B3AC] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-black text-xl animate-spin">timer</span>
                        <div>
                          <p className="font-bold text-black text-xs">
                            Modification &amp; Cancellation Window: <span className="font-mono text-black font-extrabold">{formatRemainingTime(remSec)}</span>
                          </p>
                          <p className="text-[10px] text-gray-500">You can edit address/pickup details, switch variants, add items, or cancel.</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          const ord = selectedOrderModal;
                          setSelectedOrderModal(null);
                          handleOpenModifyModal(ord, e);
                        }}
                        className="px-3 py-1.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold rounded-lg border border-black/20 shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span>Modify</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2 text-gray-500">
                      <span className="material-symbols-outlined text-base">lock</span>
                      <span className="text-[11px] font-medium">Modification &amp; cancellation window has closed (&gt;2 hours from order placement).</span>
                    </div>
                  )
                )}

                {/* STATUS BAR */}
                <div className="bg-[#FCDAD7]/30 border border-black/15 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Order Status</p>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span> Order Placed
                    </span>
                    <span className={`flex items-center gap-1 ${['Shipped', 'Delivered'].includes(selectedOrderModal.status) ? 'text-emerald-700' : 'text-gray-400'}`}>
                      <span className="material-symbols-outlined text-sm">
                        {isPickup ? 'store' : 'local_shipping'}
                      </span>
                      {isPickup ? 'Ready for Pickup' : 'Shipped'}
                    </span>
                    <span className={`flex items-center gap-1 ${selectedOrderModal.status === 'Delivered' ? 'text-emerald-700' : 'text-gray-400'}`}>
                      <span className="material-symbols-outlined text-sm">markunread_mailbox</span>
                      {isPickup ? 'Collected' : 'Delivered'}
                    </span>
                  </div>
                </div>

                {/* FULFILLMENT & PAYMENT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Delivery / Pickup Card */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-black">
                        {isPickup ? 'storefront' : 'location_on'}
                      </span>
                      <span>{isPickup ? 'Store Pickup Details' : 'Shipping Address'}</span>
                    </p>

                    {isPickup ? (
                      <div className="space-y-1 text-xs">
                        <p><strong className="text-gray-700">Studio:</strong> <span className="font-semibold text-black">{pDetails.storeName || "Jiza Jewellery Studio — Pune"}</span></p>
                        <p className="text-gray-500 text-[11px] leading-relaxed">{pDetails.address || "Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar, Pune – 411051"}</p>
                        <p className="pt-1"><strong className="text-gray-700">Pickup Person:</strong> <span className="font-bold text-on-surface">{pDetails.pickupPersonName || selectedOrderModal.customerName}</span></p>
                        <p><strong className="text-gray-700">Contact Phone:</strong> <span className="font-mono">{pDetails.pickupPersonPhone || selectedOrderModal.customerPhone}</span></p>
                        {pDetails.notes && (
                          <p className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                            <strong>Note:</strong> {pDetails.notes}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-on-surface">{selectedOrderModal.customerName || currentUser.name}</p>
                        <p className="text-gray-500 leading-relaxed">{selectedOrderModal.address || currentUser.address || 'Address on File'}</p>
                        <p className="text-gray-500 font-mono">Phone: {selectedOrderModal.customerPhone || currentUser.phone}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Card */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-black">payment</span>
                      <span>Payment Info</span>
                    </p>
                    <p className="font-bold text-on-surface">Method: {selectedOrderModal.paymentMethod || 'Razorpay / UPI'}</p>
                    <p className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>Status: {selectedOrderModal.paymentStatus === 'paid' ? 'Paid & Verified' : (selectedOrderModal.paymentStatus || 'Paid')}</span>
                    </p>
                    <p className="text-gray-500">Date: {selectedOrderModal.date || 'Today'}</p>
                    {selectedOrderModal.modifiedAt && (
                      <p className="text-[10px] text-amber-800 font-medium">
                        Last Modified: {new Date(selectedOrderModal.modifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* ORDERED ITEMS */}
                <div>
                  <p className="text-[11px] uppercase font-bold text-gray-500 mb-2">Ordered Jewellery Items</p>
                  <div className="space-y-2">
                    {(() => {
                      let parsedItems = [];
                      try {
                        parsedItems = typeof selectedOrderModal.itemsJson === 'string' 
                          ? JSON.parse(selectedOrderModal.itemsJson) 
                          : (selectedOrderModal.items_json ? (typeof selectedOrderModal.items_json === 'string' ? JSON.parse(selectedOrderModal.items_json) : selectedOrderModal.items_json) : []);
                      } catch (e) {
                        parsedItems = [];
                      }

                      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
                        return (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 font-medium">
                            {selectedOrderModal.items || 'Jewellery Set'}
                          </div>
                        );
                      }

                      return parsedItems.map((item, idx) => (
                        <div key={idx} className="flex gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl items-center">
                          {item.img && (
                            <img src={item.img} alt={item.title} className="w-12 h-12 object-cover rounded-lg bg-white border border-gray-200" />
                          )}
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-gray-800 text-[11px] line-clamp-1">{item.title || item.name}</h4>
                            <div className="flex flex-wrap gap-1.5 items-center mt-1 text-[10px]">
                              <span className="text-gray-500 font-medium">Qty: {item.quantity || 1}</span>
                              {item.selectedSize && (
                                <span className="bg-gray-200/60 px-1.5 py-0.2 rounded text-gray-600 font-semibold">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {(item.selectedColor || item.colour) && (
                                <span className="bg-[#FFF0F2] text-black border border-[#F8B3AC] px-1.5 py-0.2 rounded font-bold">
                                  Colour: {item.selectedColor || item.colour}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-gray-700">₹{Number(item.price || item.sellingPrice || 0).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {selectedOrderModal.status === 'Cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="font-bold text-red-900 text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-red-700">cancel</span>
                      This order was Cancelled
                    </p>
                    <p className="text-[11px] text-red-700 mt-0.5">Refund instruction has been initiated to your original payment method.</p>
                  </div>
                )}

                {/* CANCEL & MODIFY ACTIONS (if eligible) */}
                {isModifiable && (
                  <div className="bg-[#FCDAD7]/30 border border-black/15 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-black text-xs">Need to make adjustments or cancel?</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">Allowed during the active 2-hour policy window.</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={(e) => {
                          const ord = selectedOrderModal;
                          setSelectedOrderModal(null);
                          handleOpenModifyModal(ord, e);
                        }}
                        className="flex-grow sm:flex-initial px-3.5 py-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold rounded-xl border border-black/20 shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span>Modify Order</span>
                      </button>
                      <button
                        onClick={() => {
                          const ord = selectedOrderModal;
                          setSelectedOrderModal(null);
                          setCancelConfirmOrder(ord);
                        }}
                        className="flex-grow sm:flex-initial px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm font-bold">
                  <span>Total Paid Amount</span>
                  <span className="text-black font-headline-sm text-base">{selectedOrderModal.amount}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedOrderModal(null)}
                  className="px-5 py-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────── */}
      {/* ORDER MODIFICATION MODAL                       */}
      {/* ─────────────────────────────────────────────── */}
      {modifyingOrder && (() => {
        const isPickup = modifyingOrder.fulfillmentType === 'pickup' || modifyingOrder.fulfillment_type === 'pickup';
        const remSec = getOrderRemainingSeconds(modifyingOrder.createdAt || modifyingOrder.created_at);

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
            <div className="bg-[#FDFBF7] border border-black/20 text-stone-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-black/15 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FCDAD7] border border-black/20 text-black flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">edit_note</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-base font-bold text-black">Modify Order</h3>
                    <p className="text-[10px] font-mono text-gray-500">{modifyingOrder.orderCode || modifyingOrder.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setModifyingOrder(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Time ticker header */}
              <div className="p-2.5 bg-[#FFF9F9] border border-[#F8B3AC] rounded-xl text-xs flex items-center justify-between shrink-0">
                <span className="text-black font-bold flex items-center gap-1 text-[11px]">
                  <span className="material-symbols-outlined text-sm text-black">timer</span>
                  <span>Time Remaining to Modify:</span>
                </span>
                <span className="font-mono font-extrabold text-black text-xs">{formatRemainingTime(remSec)}</span>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FCDAD7]/30 rounded-xl border border-black/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setModifyTab('address')}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    modifyTab === 'address' ? 'bg-[#FCDAD7] text-black shadow-sm border border-black/20' : 'text-stone-700 hover:bg-white/60'
                  }`}
                >
                  {isPickup ? 'Pickup Info' : 'Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setModifyTab('variant')}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    modifyTab === 'variant' ? 'bg-[#FCDAD7] text-black shadow-sm border border-black/20' : 'text-stone-700 hover:bg-white/60'
                  }`}
                >
                  Variants
                </button>
                <button
                  type="button"
                  onClick={() => setModifyTab('add_items')}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    modifyTab === 'add_items' ? 'bg-[#FCDAD7] text-black shadow-sm border border-black/20' : 'text-stone-700 hover:bg-white/60'
                  }`}
                >
                  Add Items
                </button>
              </div>

              {modifyErrorMsg && (
                <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{modifyErrorMsg}</span>
                </div>
              )}

              {modifySuccessMsg && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{modifySuccessMsg}</span>
                </div>
              )}

              {/* Tab Form Content */}
              <form onSubmit={handleSaveModification} className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
                
                {/* TAB 1: ADDRESS / PICKUP INFO */}
                {modifyTab === 'address' && (
                  <div className="space-y-3">
                    {isPickup ? (
                      <>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Pickup Person Name *</label>
                          <input
                            type="text"
                            required
                            value={modifyAddressForm.pickupPersonName}
                            onChange={(e) => setModifyAddressForm({...modifyAddressForm, pickupPersonName: e.target.value})}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-medium"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Pickup Contact Phone (10 Digits) *</label>
                          <div className="flex rounded-xl overflow-hidden border border-gray-300 focus-within:border-black bg-white shadow-xs">
                            <span className="bg-[#FCDAD7] text-black font-bold text-xs px-3 py-2.5 flex items-center border-r border-black/15 select-none font-mono">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              inputMode="numeric"
                              placeholder="10-digit Phone Number"
                              value={modifyAddressForm.pickupPersonPhone}
                              onChange={(e) => setModifyAddressForm({...modifyAddressForm, pickupPersonPhone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                              className="w-full bg-transparent px-3.5 py-2.5 text-xs text-on-surface focus:outline-none font-semibold font-mono tracking-wider"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Pickup Instructions / Notes</label>
                          <input
                            type="text"
                            value={modifyAddressForm.notes}
                            onChange={(e) => setModifyAddressForm({...modifyAddressForm, notes: e.target.value})}
                            placeholder="Special requests or timings"
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black font-medium"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Recipient Name *</label>
                            <input
                              type="text"
                              required
                              value={modifyAddressForm.fullName}
                              onChange={(e) => setModifyAddressForm({...modifyAddressForm, fullName: e.target.value})}
                              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black font-medium"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Phone Number (10 Digits) *</label>
                            <div className="flex rounded-xl overflow-hidden border border-gray-300 focus-within:border-black bg-white shadow-xs">
                              <span className="bg-[#FCDAD7] text-black font-bold text-xs px-2.5 py-2.5 flex items-center border-r border-black/15 select-none font-mono">
                                +91
                              </span>
                              <input
                                type="tel"
                                required
                                maxLength={10}
                                inputMode="numeric"
                                placeholder="10-digit Number"
                                value={modifyAddressForm.phone}
                                onChange={(e) => setModifyAddressForm({...modifyAddressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                                className="w-full bg-transparent px-3 py-2.5 text-xs focus:outline-none font-semibold font-mono tracking-wider"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Flat / House / Street Address *</label>
                          <input
                            type="text"
                            required
                            value={modifyAddressForm.address}
                            onChange={(e) => setModifyAddressForm({...modifyAddressForm, address: e.target.value})}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">City *</label>
                            <input
                              type="text"
                              required
                              value={modifyAddressForm.city}
                              onChange={(e) => setModifyAddressForm({...modifyAddressForm, city: e.target.value})}
                              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black font-medium"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">State *</label>
                            <input
                              type="text"
                              required
                              value={modifyAddressForm.state}
                              onChange={(e) => setModifyAddressForm({...modifyAddressForm, state: e.target.value})}
                              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black font-medium"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Pincode *</label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={modifyAddressForm.pincode}
                              onChange={(e) => setModifyAddressForm({...modifyAddressForm, pincode: e.target.value})}
                              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black font-medium font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Country *</label>
                          <select
                            required
                            value={modifyAddressForm.country || 'India'}
                            onChange={(e) => handleModifyCountryChange(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black font-medium"
                          >
                            <option value="India">🇮🇳 India (Domestic)</option>
                            <optgroup label="─── International ───">
                              {COUNTRIES.filter(c => c.name !== 'India').map(c => (
                                <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 2: VARIANT CHANGES */}
                {modifyTab === 'variant' && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-gray-500">
                      Update sizes or stone colours for ordered items (subject to live inventory availability).
                    </p>
                    {modifyVariantList.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                        <p className="font-bold text-xs text-black">{item.title}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Size Variant</label>
                            <input
                              type="text"
                              value={item.selectedSize}
                              onChange={(e) => {
                                const copy = [...modifyVariantList];
                                copy[idx].selectedSize = e.target.value;
                                setModifyVariantList(copy);
                              }}
                              placeholder="e.g. Free Size / 2.6 / 2.8"
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Colour / Polish</label>
                            <input
                              type="text"
                              value={item.selectedColor}
                              onChange={(e) => {
                                const copy = [...modifyVariantList];
                                copy[idx].selectedColor = e.target.value;
                                setModifyVariantList(copy);
                              }}
                              placeholder="e.g. Gold / Antique Ruby"
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: ADD ITEMS TO ORDER */}
                {modifyTab === 'add_items' && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-gray-500">
                      Select additional in-stock jewellery pieces to add to this active order. Prices are revalidated strictly from PostgreSQL database.
                    </p>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Select Product *</label>
                      <select
                        value={modifyAddItemSelect.productId}
                        onChange={(e) => setModifyAddItemSelect({...modifyAddItemSelect, productId: e.target.value})}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-black"
                      >
                        <option value="">-- Choose In-Stock Product --</option>
                        {productsList
                          .filter(p => (p.stock_quantity ?? 0) > 0 && p.sold_out !== 1)
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title} (₹{Number(p.selling_price || p.price).toLocaleString('en-IN')} • Stock: {p.stock_quantity})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={modifyAddItemSelect.quantity}
                          onChange={(e) => setModifyAddItemSelect({...modifyAddItemSelect, quantity: Number(e.target.value)})}
                          className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-semibold font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Size</label>
                        <input
                          type="text"
                          value={modifyAddItemSelect.selectedSize}
                          onChange={(e) => setModifyAddItemSelect({...modifyAddItemSelect, selectedSize: e.target.value})}
                          placeholder="Standard"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Colour</label>
                        <input
                          type="text"
                          value={modifyAddItemSelect.selectedColor}
                          onChange={(e) => setModifyAddItemSelect({...modifyAddItemSelect, selectedColor: e.target.value})}
                          placeholder="Gold"
                          className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 shrink-0">
                  <button
                    type="submit"
                    disabled={isModifyingSubmitting}
                    className="flex-grow py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isModifyingSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Validating &amp; Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">save</span>
                        <span>Save Modifications</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModifyingOrder(null)}
                    className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </form>

            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────── */}
      {/* CUSTOM CANCEL ORDER CONFIRMATION MODAL         */}
      {/* ─────────────────────────────────────────────── */}
      {cancelConfirmOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#FDFBF7] border border-red-200 text-stone-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 animate-scaleUp">
            
            <div className="flex items-center gap-3 text-red-700">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline-sm text-base font-bold">Cancel Order?</h3>
            </div>

            <div className="text-xs space-y-2 text-on-surface-variant font-medium">
              <p>Are you sure you want to cancel order <strong className="text-black font-bold">{cancelConfirmOrder.orderCode || cancelConfirmOrder.id}</strong>?</p>
              <div className="bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-200/50 space-y-1">
                <p className="font-bold">⚡ 2-Hour Cancellation Guarantee:</p>
                <p className="text-[11px] leading-relaxed">
                  Your ordered items will be safely restocked into inventory, and a 100% refund will be auto-initiated back to your source account.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE}/api/orders/${cancelConfirmOrder.id}/cancel`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ actor: 'customer', reason: 'Customer cancelled within 2-hour window' })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setSelectedOrderModal(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                      setCancelConfirmOrder(null);
                      if (typeof onRefreshOrders === 'function') {
                        onRefreshOrders();
                      }
                    } else {
                      alert(data.error || "Failed to cancel order");
                    }
                  } catch (err) {
                    alert("Network error: " + err.message);
                  }
                }}
                className="flex-grow py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg border border-red-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                <span>Yes, Cancel Order</span>
              </button>

              <button
                type="button"
                onClick={() => setCancelConfirmOrder(null)}
                className="px-5 py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Keep Order
              </button>
            </div>

          </div>
        </div>
      )}
      
      {/* International Shipping Notice Popup in Profile */}
      <InternationalShippingNotice
        isOpen={showIntlNotice}
        onClose={() => setShowIntlNotice(false)}
        onViewPolicy={() => {
          setShowIntlNotice(false);
          if (typeof setActiveView === 'function') setActiveView('shipping-policy');
        }}
        country={intlNoticeCountry}
      />
      
    </main>
  );
}
