import React, { useState, useEffect } from 'react';
import { API_BASE, getAdminToken, adminFetch, isReadOnlyAdmin } from '../config';
import * as XLSX from 'xlsx';
import { CATEGORIES } from '../data/products';

import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';

import DashboardTab from './admin/tabs/DashboardTab';
import ProductsTab from './admin/tabs/ProductsTab';
import CategoriesTab from './admin/tabs/CategoriesTab';
import OrdersTab from './admin/tabs/OrdersTab';
import CustomersTab from './admin/tabs/CustomersTab';
import ReviewsTab from './admin/tabs/ReviewsTab';
import ProblemsTab from './admin/tabs/ProblemsTab';
import AnalyticsTab from './admin/tabs/AnalyticsTab';
import RentalGalleryTab from './admin/tabs/RentalGalleryTab';
import PremiumFeaturesTab from './admin/tabs/PremiumFeaturesTab';
import StoreSettingsTab from './admin/tabs/StoreSettingsTab';

import AddProductModal from './admin/modals/AddProductModal';
import EditProductModal from './admin/modals/EditProductModal';
import OrderDetailsModal from './admin/modals/OrderDetailsModal';
import CustomerDetailsModal from './admin/modals/CustomerDetailsModal';
import ProblemDetailsModal from './admin/modals/ProblemDetailsModal';
import { AddCategoryModal, EditCategoryModal, AddSubCategoryModal, EditSubCategoryModal } from './admin/modals/CategoryModals';
import ContactDevModal from './admin/modals/ContactDevModal';
import RentalDeleteModal from './admin/modals/RentalDeleteModal';

const PREMIUM_FEATURES = [
  {
    id: 'digital-presence-management',
    icon: 'hub',
    title: 'Digital Presence Management Package',
    subtitle: 'Complete monthly digital management retainer: Instagram, YouTube, Social Media, Website & Monthly Reports.',
    price: '₹10,000/month',
    rawPrice: '₹10,000/mo',
    tag: 'Monthly Retainer',
    badge: '⭐ Flagship Retainer',
    description: 'A comprehensive monthly digital management retainer designed to keep Jiza Jewellery Studio active, optimized, monitored, and strategically expanding across all digital channels.',
    scopeNote: 'This is a proper monthly digital management retainer focused on management, distribution, SEO, and active monitoring.',
    notIncluded: 'Content shooting, video editing, graphic designing, paid advertising budget, or major website development/redesign.',
    sections: [
      {
        title: 'Instagram Management',
        icon: 'photo_camera',
        items: [
          'Instagram account management',
          'Content posting & scheduling',
          'Captions + hashtags',
          'Profile optimization',
          'Comment management',
          'DM management',
          'Auto-reply setup',
          'Auto-comment reply automation'
        ]
      },
      {
        title: 'YouTube Management',
        icon: 'smart_display',
        items: [
          'Video uploading & scheduling',
          'Titles & descriptions',
          'YouTube SEO',
          'Keywords/tags',
          'Thumbnail/content optimization guidance',
          'Shorts uploading',
          'Channel optimization',
          'Analytics monitoring'
        ]
      },
      {
        title: 'Social Media Management',
        icon: 'share',
        items: [
          'Facebook + Instagram management',
          'Content calendar',
          'Posting & scheduling',
          'Engagement management',
          'Competitor monitoring',
          'Trending content strategy',
          'Monthly performance report'
        ]
      },
      {
        title: 'Website Management',
        icon: 'language',
        items: [
          'Basic website updates',
          'Text, images, contact details & offers updates',
          'Product/service information updates',
          'Banner/basic section updates',
          'Website performance overview',
          'Basic SEO monitoring',
          'Issue/error monitoring'
        ]
      },
      {
        title: 'Reports & Monitoring',
        icon: 'analytics',
        items: [
          'Monthly performance report',
          'Instagram analytics',
          'YouTube analytics',
          'Website overview',
          'Growth comparison',
          'Key problems & opportunities',
          'Next-month action plan'
        ]
      }
    ],
    benefits: [
      'Complete Instagram Account Management, Scheduling & Auto-Replies',
      'YouTube Video & Shorts SEO, Tagging & Channel Optimization',
      'Unified Facebook & Instagram Content Calendar & Engagement',
      'Website Updates, Banners, Contact Details & Health Monitoring',
      'Monthly Analytics, Insights & In-Depth Performance Reports'
    ]
  },
  {
    id: 'invoice-gst',
    icon: 'receipt_long',
    title: 'Invoice & GST Billing',
    subtitle: 'Generate professional GST invoices, printable bills, and downloadable PDFs.',
    price: '₹2,000 (Lifetime)',
    rawPrice: '₹2,000',
    tag: 'FinTech Suite',
    description: 'Generate professional GST-compliant tax invoices, calculate CGST/SGST/IGST automatically, download thermal print slips, and export audit-ready tax ledgers for your jewellery store.',
    benefits: [
      'Professional GST-Compliant Tax Invoices & Thermal Print Slips',
      'Automatic CGST / SGST / IGST breakdown per HSN code',
      '1-Click PDF Download & WhatsApp Instant Receipt Dispatch',
      'Export Monthly GST R1 & R2 Reports directly for your CA'
    ]
  },
  {
    id: 'whatsapp-automation',
    icon: 'mark_chat_read',
    title: 'WhatsApp Order & Marketing Automation',
    subtitle: 'Order notifications, abandoned cart recovery, promotional broadcasts, and automated messaging.',
    price: '₹2,000/month',
    rawPrice: '₹2,000/mo',
    tag: 'Marketing Automation',
    description: 'Transform customer engagement with automated WhatsApp messaging. Send instant order confirmation texts, BlueDart tracking links, back-in-stock alerts, and 1-click WhatsApp broadcast campaigns.',
    benefits: [
      'Instant Order Confirmation & BlueDart Live Tracking WhatsApp texts',
      'Automated Abandoned Cart Recovery message triggers',
      '1-Click Promotional WhatsApp Broadcasts to all customers',
      'Official WhatsApp Business API integration ready'
    ]
  },
  {
    id: 'email-marketing',
    icon: 'mail',
    title: 'Email Marketing',
    subtitle: 'Create email campaigns, newsletters, promotional emails, and customer engagement automation.',
    price: '₹1,000/month',
    rawPrice: '₹1,000/mo',
    tag: 'Growth Engine',
    description: 'Launch high-converting festive email campaigns with responsive HTML templates, newsletter automation, open-rate tracking, and customer engagement drip flows.',
    benefits: [
      'Responsive Luxury Jewellery Newsletter & Email Templates',
      'Automated Welcome, Birthday & Festive Discount Email Drips',
      'Real-Time Open, Click, and Revenue Tracking Analytics',
      'Customer Database Segmentation & Subscriber Management'
    ]
  },
  {
    id: 'ai-chatbot',
    icon: 'smart_toy',
    title: 'AI Chatbot',
    subtitle: 'AI-powered customer support, FAQs, order assistance, and instant responses.',
    price: '₹1,000/month',
    rawPrice: '₹1,000/mo',
    tag: 'AI Intelligence',
    description: 'Provide 24/7 instant AI-driven customer support on your storefront. The AI chatbot assists buyers in picking matching necklace sets, answers FAQs, and tracks order status automatically.',
    benefits: [
      '24/7 AI-Powered Jewellery Stylist & Product Recommendation',
      'Instant Order Status Lookup by Phone or Order ID',
      'Multi-Lingual Customer Support (Hindi, Marathi, English)',
      'Reduces Manual Customer Queries & Support Calls by 70%'
    ]
  },
  {
    id: 'coupons-discounts',
    icon: 'confirmation_number',
    title: 'Coupon & Discount Management',
    subtitle: 'Create coupons, discount rules, seasonal offers, and promotional campaigns.',
    price: '₹1,000 (Lifetime)',
    rawPrice: '₹1,000',
    tag: 'Sales Accelerator',
    description: 'Create custom promo codes, percentage/fixed discounts, minimum cart value rules, and seasonal offer vouchers to boost sales and clear inventory effortlessly.',
    benefits: [
      'Custom Promo Code Creator (e.g. FESTIVE20, BRIDAL1000)',
      'Set Usage Limits, Expiry Dates & Cart Minimum Value Rules',
      'Automatic Discount Application at Checkout',
      'Live Coupon Analytics & Revenue Impact Reports'
    ]
  },
  {
    id: 'virtual-try-on',
    icon: 'videocam',
    title: 'Virtual Try-On & Call Consultation',
    subtitle: 'Schedule 1-on-1 WhatsApp video consultations, manage bookings, and load AR Try-On tools.',
    price: '₹5,000 (Lifetime)',
    rawPrice: '₹5,000',
    tag: 'Interactive Booking',
    description: 'Transform client engagement with live video consultation slots. Enable customers to book appointments directly from product detail screens and manage virtual try-ons seamlessly.',
    benefits: [
      'Interactive Calendar Slot Booking on product detail screens',
      'Admin Booking Manager with 1-click Approval & Meeting link generation',
      'Automated WhatsApp/SMS customer alerts with Meeting invitation',
      'Virtual AR Jewellery Try-on filters integration during video call'
    ]
  }
];

export default function AdminPanel({ 
  productsList, 
  ordersList, 
  customersList, 
  categoriesList = [],
  onRefreshCategories,
  onRefreshProducts,
  onAddProduct, 
  onUpdateProduct,
  onDeleteProduct,
  onUpdateProductStock, 
  onUpdateProductPrice, 
  onUpdateSpecialSection,
  onUpdateOrderStatus,
  onExitAdmin 
}) {
  const isReadOnly = isReadOnlyAdmin(); // true for SUPER_READONLY_ADMIN (Agency), false for SUPER_ADMIN (Owner)
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPremiumFeature, setSelectedPremiumFeature] = useState(null);
  const [unlockedModuleIds, setUnlockedModuleIds] = useState([]);
  const [isContactDevModalOpen, setIsContactDevModalOpen] = useState(false);
  const [contactDevTargetFeature, setContactDevTargetFeature] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Virtual Try-on Sandbox Demo States
  const [demoBookings, setDemoBookings] = useState([
    { id: 'BK-9921', name: 'Aisha Sharma', phone: '+91 98765 43210', date: '2026-08-08', timeSlot: '11:00 AM - 12:00 PM', interest: 'Bridal Kundan Sets', status: 'Pending', link: '' },
    { id: 'BK-8812', name: 'Priya Patel', phone: '+91 91234 56789', date: '2026-08-09', timeSlot: '02:00 PM - 03:00 PM', interest: 'Heritage Gold Bangles & Kadas', status: 'Approved', link: 'https://meet.google.com/xyz-abc-123' },
    { id: 'BK-7743', name: 'Ritu Deshmukh', phone: '+91 98333 44455', date: '2026-08-10', timeSlot: '05:00 PM - 06:00 PM', interest: 'Bespoke Custom Jewellery', status: 'Pending', link: '' }
  ]);
  const [activeDemoCall, setActiveDemoCall] = useState(null);
  const [arOverlay, setArOverlay] = useState('none');
  const [meetingInput, setMeetingInput] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // AI Chatbot Sandbox Demo States
  const [chatbotMessages, setChatbotMessages] = useState([
    { sender: 'bot', text: 'Namaste! Welcome to Jiza Jewellery Studio Customer Care. 🌸 I am your AI Jewellery Stylist. How can I assist you today?' }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState([
    { q: 'Is delivery insured?', a: 'Yes! All Jiza shipments are 100% insured against loss or damage.' },
    { q: 'Can I return custom orders?', a: 'Customized bridal sets are made to order and cannot be returned.' }
  ]);
  const [newKbQ, setNewKbQ] = useState('');
  const [newKbA, setNewKbA] = useState('');

  // EDIT PRODUCT MODAL STATE
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProdForm, setEditProdForm] = useState({
    id: '', productCode: '', title: '', category: 'maharashtrian', categoryLabel: 'Maharashtrian',
    subcategory: 'Long Sets', subcategoryLabel: 'Long Sets',
    sellingPrice: '', mrp: '', discount: '',
    description: '', material: '', colour: '',
    careInstructions: '', deliveryTime: '2-4 Business Days',
    badge: 'New Arrival', specialSection: 'None', inStock: true, stockQuantity: 10
  });
  const [editUploadedImages, setEditUploadedImages] = useState(['', '', '', '']);

  // Orders Tab Date Filtering State
  const [orderDatePreset, setOrderDatePreset] = useState('all');
  const [orderStartDate, setOrderStartDate] = useState('2026-07-01');
  const [orderEndDate, setOrderEndDate] = useState('2026-08-05');
  
  // Modals inside Admin
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);

  // Category & Sub-Category Manager State
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', img: '', display_order: 1, active: true });
  const [subCatForm, setSubCatForm] = useState({ categoryId: '', name: '', img: '', display_order: 1, active: true });
  const [addingSubForCatId, setAddingSubForCatId] = useState(null);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [adminToast, setAdminToast] = useState('');
  const [customConfirm, setCustomConfirm] = useState(null);
  const [customAlert, setCustomAlert] = useState(null);

  // RENTAL GALLERY CMS STATE
  const [rentalGalleryList, setRentalGalleryList] = useState([]);
  const [selectedRentalFiles, setSelectedRentalFiles] = useState([]);
  const [isUploadingRental, setIsUploadingRental] = useState(false);
  const [rentalDeleteModalItem, setRentalDeleteModalItem] = useState(null);

  const fetchRentalGallery = async () => {
    try {
      const res = await adminFetch('/api/admin/rental-gallery');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.items) {
        setRentalGalleryList(data.items);
      }
    } catch (e) {
      console.error('Failed to fetch rental gallery items:', e);
    }
  };

  const handleRentalFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = [];
    for (const f of files) {
      const dataUrl = await processFileToDataUrl(f);
      if (dataUrl) {
        newItems.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: f.name,
          dataUrl
        });
      }
    }
    setSelectedRentalFiles(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleRemoveSelectedRentalFile = (id) => {
    setSelectedRentalFiles(prev => prev.filter(item => item.id !== id));
  };

  const handleUploadRentalGallerySubmit = async () => {
    if (selectedRentalFiles.length === 0) return;
    setIsUploadingRental(true);

    try {
      const imageUrls = selectedRentalFiles.map(f => f.dataUrl);

      const res = await adminFetch('/api/admin/rental-gallery/upload', {
        method: 'POST',
        body: JSON.stringify({ images: imageUrls })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.items)) {
        showAdminToast(`✅ Uploaded ${data.items ? data.items.length : selectedRentalFiles.length} photo(s) to Rental Gallery!`);
        setSelectedRentalFiles([]);
        await fetchRentalGallery();
      } else {
        alert(data.error || 'Failed to upload rental gallery images');
      }
    } catch (e) {
      console.error('Error uploading rental gallery images:', e);
      alert('Error uploading images. Please try again.');
    } finally {
      setIsUploadingRental(false);
    }
  };

  const handleDeleteRentalImageConfirm = async (id) => {
    try {
      const res = await adminFetch(`/api/admin/rental-gallery/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || res.status === 200)) {
        showAdminToast('🗑️ Rental gallery image deleted successfully.');
        setRentalDeleteModalItem(null);
        await fetchRentalGallery();
      } else {
        alert(data.error || 'Failed to delete rental gallery image.');
      }
    } catch (e) {
      console.error('Error deleting rental gallery image:', e);
      alert('Error deleting image. Please try again.');
    }
  };

  useEffect(() => {
    if (activeTab === 'rental-gallery') {
      fetchRentalGallery();
    }
  }, [activeTab]);

  const showAdminToast = (msg) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3000);
  };

  // REVIEWS MODERATION STATE
  const [adminReviews, setAdminReviews] = useState([]);
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');

  const fetchAdminReviews = async () => {
    try {
      const res = await adminFetch('/api/admin/reviews');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reviews) {
        setAdminReviews(data.reviews);
      }
    } catch (e) {
      console.error('Failed to fetch admin reviews:', e);
    }
  };

  const handleUpdateReviewStatus = async (reviewId, newStatus) => {
    try {
      const res = await adminFetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showAdminToast(`Review marked as ${newStatus}`);
        fetchAdminReviews();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update review status');
      }
    } catch (e) {
      console.error('Error updating review status:', e);
    }
  };

  const handleDeleteReview = (reviewId) => {
    setCustomConfirm({
      title: 'Delete Product Review',
      message: 'Are you sure you want to permanently delete this customer review? This action cannot be undone.',
      confirmText: 'Delete Review',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await adminFetch(`/api/admin/reviews/${reviewId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            showAdminToast('Review deleted permanently.');
            fetchAdminReviews();
          } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || 'Failed to delete review');
          }
        } catch (e) {
          console.error('Error deleting review:', e);
        }
      }
    });
  };

  // CUSTOMER PROBLEMS STATE
  const [adminProblems, setAdminProblems] = useState([]);
  const [problemStatusFilter, setProblemStatusFilter] = useState('all');
  const [selectedProblemModal, setSelectedProblemModal] = useState(null);
  const [selectedProblemScreenshotModal, setSelectedProblemScreenshotModal] = useState(null);
  const [problemModalStatus, setProblemModalStatus] = useState('');
  const [problemModalNotes, setProblemModalNotes] = useState('');

  const fetchAdminProblems = async () => {
    try {
      const res = await adminFetch('/api/admin/problems');
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.problems) {
        setAdminProblems(data.problems);
      }
    } catch (e) {
      console.error('Failed to fetch admin problems:', e);
    }
  };

  const handleSaveProblemChanges = async (e) => {
    e.preventDefault();
    if (!selectedProblemModal) return;

    try {
      const res = await adminFetch(`/api/admin/problems/${selectedProblemModal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: problemModalStatus,
          admin_notes: problemModalNotes
        })
      });

      if (res.ok) {
        showAdminToast(`Ticket #${selectedProblemModal.id} updated!`);
        setSelectedProblemModal(null);
        fetchAdminProblems();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update problem ticket');
      }
    } catch (e) {
      console.error('Error updating problem ticket:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchAdminReviews();
    } else if (activeTab === 'problems') {
      fetchAdminProblems();
    }
  }, [activeTab]);

  const processFileToDataUrl = (file) => {
    return new Promise((resolve) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    try {
      const res = await adminFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify(catForm)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.category || data.id)) {
        showAdminToast(`Category "${data.category?.name || catForm.name}" created successfully!`);
        setIsAddCatModalOpen(false);
        setCatForm({ name: '', img: '', display_order: 1, active: true });
        if (onRefreshCategories) onRefreshCategories();
      } else {
        alert(data.error || 'Failed to create category');
      }
    } catch (err) {
      console.error('Category creation error:', err);
      alert('Network error while creating category');
    }
  };

  const handleUpdateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      const res = await adminFetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingCategory)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.category || data.id)) {
        showAdminToast(`Category "${data.category?.name || editingCategory.name}" updated successfully!`);
        setEditingCategory(null);
        if (onRefreshCategories) onRefreshCategories();
      } else {
        alert(data.error || 'Failed to update category');
      }
    } catch (err) {
      console.error('Category update error:', err);
      alert('Network error while updating category');
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    const nextState = !(cat.active !== undefined ? Boolean(cat.active) : true);
    try {
      const res = await adminFetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: nextState })
      });
      if (res.ok) {
        showAdminToast(`Category "${cat.name}" is now ${nextState ? 'Active' : 'Inactive'}`);
        if (onRefreshCategories) onRefreshCategories();
      }
    } catch (err) {
      console.error('Toggle category active error:', err);
    }
  };

  const handleDeleteCategory = (catId, catName) => {
    setCustomConfirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${catName}"?\n\nThis will remove the category and all its sub-categories.`,
      confirmText: 'Delete Category',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await adminFetch(`/api/categories/${catId}`, {
            method: 'DELETE'
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && (data.success || res.status === 200)) {
            showAdminToast(`Category "${catName}" deleted successfully.`);
            if (onRefreshCategories) onRefreshCategories();
          } else {
            alert(data.error || 'Failed to delete category');
          }
        } catch (err) {
          console.error('Delete category error:', err);
          alert('Network error while deleting category');
        }
      }
    });
  };

  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    if (!subCatForm.categoryId || !subCatForm.name.trim()) {
      alert('Please select a parent category and enter sub-category name.');
      return;
    }

    try {
      const res = await adminFetch('/api/subcategories', {
        method: 'POST',
        body: JSON.stringify(subCatForm)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.subcategory || data.id)) {
        showAdminToast(`Sub-category "${data.subcategory?.name || subCatForm.name}" created!`);
        setIsAddSubModalOpen(false);
        setSubCatForm({ categoryId: '', name: '', img: '', display_order: 1, active: true });
        if (onRefreshCategories) onRefreshCategories();
      } else {
        alert(data.error || 'Failed to create sub-category');
      }
    } catch (err) {
      console.error('Sub-category creation error:', err);
      alert('Network error while creating sub-category');
    }
  };

  const handleUpdateSubCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editingSubcategory || !editingSubcategory.name.trim()) return;

    try {
      const res = await adminFetch(`/api/subcategories/${editingSubcategory.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingSubcategory)
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.subcategory || data.id)) {
        showAdminToast(`Sub-category "${data.subcategory?.name || editingSubcategory.name}" updated!`);
        setEditingSubcategory(null);
        if (onRefreshCategories) onRefreshCategories();
      } else {
        alert(data.error || 'Failed to update sub-category');
      }
    } catch (err) {
      console.error('Sub-category update error:', err);
      alert('Network error while updating sub-category');
    }
  };

  const handleToggleSubCategoryActive = async (subObj) => {
    const nextState = !(subObj.active !== undefined ? Boolean(subObj.active) : true);
    try {
      const res = await adminFetch(`/api/subcategories/${subObj.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: nextState })
      });
      if (res.ok) {
        showAdminToast(`Sub-category "${subObj.name}" is now ${nextState ? 'Active' : 'Inactive'}`);
        if (onRefreshCategories) onRefreshCategories();
      }
    } catch (err) {
      console.error('Toggle subcategory active error:', err);
    }
  };

  const handleDeleteSubCategory = (subId, subName) => {
    setCustomConfirm({
      title: 'Delete Sub-Category',
      message: `Are you sure you want to delete sub-category "${subName}"?`,
      confirmText: 'Delete Sub-Category',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await adminFetch(`/api/subcategories/${subId}`, {
            method: 'DELETE'
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && (data.success || res.status === 200)) {
            showAdminToast(`Sub-category "${subName}" deleted.`);
            if (onRefreshCategories) onRefreshCategories();
          } else {
            alert(data.error || 'Failed to delete sub-category');
          }
        } catch (err) {
          console.error('Delete sub-category error:', err);
          alert('Network error while deleting sub-category');
        }
      }
    });
  };

  const activeCategories = categoriesList.length > 0 ? categoriesList : CATEGORIES;

  // Add Product Form State
  const [newProd, setNewProd] = useState({
    productCode: '',
    title: '',
    category: 'maharashtrian',
    categoryLabel: 'Maharashtrian',
    subcategory: 'Long Sets',
    subcategoryLabel: 'Long Sets',
    sellingPrice: '',
    mrp: '',
    discount: '',
    description: '',
    material: '',
    colour: '',
    careInstructions: '',
    deliveryTime: '2-4 Business Days',
    badge: 'New Arrival',
    specialSection: 'None',
    inStock: true,
    stockQuantity: 10
  });

  const [uploadedImages, setUploadedImages] = useState(['', '', '', '']);
  const [isDragging, setIsDragging] = useState(false);

  const handleCreateProductSubmit = (e) => {
    e.preventDefault();
    if (!newProd.productCode || !newProd.productCode.trim()) {
      alert('⚠️ Validation Warning: Product Code is required!\n\nPlease enter a valid Product Code (e.g. 101, JIZA-PRL-001) before publishing.');
      return;
    }

    if (!newProd.title || !newProd.sellingPrice) {
      alert('Please fill in required fields (Title, Product Code, Selling Price)');
      return;
    }

    if (newProd.specialSection !== 'None') {
      const currentSectionCount = productsList.filter(p => p.specialSection === newProd.specialSection || (newProd.specialSection === 'New Arrival' && p.badge === 'New Arrival') || (newProd.specialSection === 'Best Seller' && (p.badge === 'Bestseller' || p.badge === 'Best Seller'))).length;
      if (currentSectionCount >= 4) {
        alert(`⚠️ Validation Warning: Section Limit Reached!\n\nMaximum 4 products can be assigned to '${newProd.specialSection}' on the Home Page. Please remove an existing product from '${newProd.specialSection}' first.`);
        return;
      }
    }

    const priceNum = Number(newProd.sellingPrice);
    const mrpNum = newProd.mrp ? Number(newProd.mrp) : priceNum;
    let discPct = newProd.discount ? Number(newProd.discount) : 0;
    if (!newProd.discount && mrpNum > priceNum) {
      discPct = Math.round(((mrpNum - priceNum) / mrpNum) * 100);
    }

    const validImages = uploadedImages.filter(img => img && img.trim() !== '');
    const finalImg = validImages.length > 0 ? validImages[0] : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';

    const productPayload = {
      productCode: newProd.productCode.trim(),
      product_code: newProd.productCode.trim(),
      title: newProd.title,
      name: newProd.title,
      category: newProd.category,
      categoryLabel: newProd.categoryLabel || newProd.category,
      category_label: newProd.categoryLabel || newProd.category,
      subcategory: newProd.subcategory,
      subcategoryLabel: newProd.subcategoryLabel || newProd.subcategory,
      subcategory_label: newProd.subcategoryLabel || newProd.subcategory,
      price: priceNum,
      sellingPrice: priceNum,
      price_num: priceNum,
      mrp: mrpNum,
      mrp_num: mrpNum,
      discount: discPct,
      discount_pct: discPct,
      description: newProd.description,
      material: newProd.material,
      colour: newProd.colour,
      careInstructions: newProd.careInstructions,
      care_instructions: newProd.careInstructions,
      deliveryTime: newProd.deliveryTime,
      delivery_time: newProd.deliveryTime,
      badge: newProd.specialSection !== 'None' ? newProd.specialSection : newProd.badge,
      specialSection: newProd.specialSection,
      special_section: newProd.specialSection,
      inStock: newProd.inStock,
      in_stock: newProd.inStock,
      stockQuantity: Number(newProd.stockQuantity) || 10,
      stock_quantity: Number(newProd.stockQuantity) || 10,
      img: finalImg,
      images: validImages.length > 0 ? validImages : [finalImg]
    };

    if (onAddProduct) {
      onAddProduct(productPayload);
      setIsAddProductOpen(false);
      setNewProd({
        productCode: '',
        title: '',
        category: 'maharashtrian',
        categoryLabel: 'Maharashtrian',
        subcategory: 'Long Sets',
        subcategoryLabel: 'Long Sets',
        sellingPrice: '',
        mrp: '',
        discount: '',
        description: '',
        material: '',
        colour: '',
        careInstructions: '',
        deliveryTime: '2-4 Business Days',
        badge: 'New Arrival',
        specialSection: 'None',
        inStock: true,
        stockQuantity: 10
      });
      setUploadedImages(['', '', '', '']);
    }
  };

  const handleOpenEditProduct = (p) => {
    setEditingProduct(p);
    const existingImages = p.images && Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : [p.img || ''];
    
    const padded = ['', '', '', ''];
    existingImages.forEach((img, idx) => {
      if (idx < 4) padded[idx] = img;
    });

    setEditUploadedImages(padded);
    setEditProdForm({
      id: p.id,
      productCode: p.productCode || p.product_code || '',
      title: p.title || p.name || '',
      category: p.category || 'maharashtrian',
      categoryLabel: p.categoryLabel || p.category_label || p.category || 'Maharashtrian',
      subcategory: p.subcategory || p.subcategory_label || 'General',
      subcategoryLabel: p.subcategoryLabel || p.subcategory_label || p.subcategory || 'General',
      sellingPrice: p.price || p.sellingPrice || p.price_num || '',
      mrp: p.mrp || p.mrp_num || '',
      discount: p.discount || p.discount_pct || '',
      description: p.description || '',
      material: p.material || '',
      colour: p.colour || '',
      careInstructions: p.careInstructions || p.care_instructions || '',
      deliveryTime: p.deliveryTime || p.delivery_time || '2-4 Business Days',
      badge: p.badge || 'New Arrival',
      specialSection: p.specialSection || p.special_section || 'None',
      inStock: p.inStock !== undefined ? p.inStock : (p.in_stock !== undefined ? p.in_stock : true),
      stockQuantity: p.stockQuantity || p.stock_quantity || 10
    });
  };

  const handleUpdateProductSubmit = (e) => {
    e.preventDefault();
    if (!editProdForm.productCode || !editProdForm.productCode.trim()) {
      alert('⚠️ Validation Warning: Product Code is required!\n\nPlease enter a valid Product Code (e.g. 101, JIZA-PRL-001) before saving.');
      return;
    }

    if (!editProdForm.title || !editProdForm.sellingPrice) {
      alert('Please fill in required fields (Title, Product Code, Selling Price)');
      return;
    }

    if (editProdForm.specialSection !== 'None') {
      const currentSectionCount = productsList.filter(p => p.id !== editProdForm.id && (p.specialSection === editProdForm.specialSection || (editProdForm.specialSection === 'New Arrival' && p.badge === 'New Arrival') || (editProdForm.specialSection === 'Best Seller' && (p.badge === 'Bestseller' || p.badge === 'Best Seller')))).length;
      if (currentSectionCount >= 4) {
        alert(`⚠️ Validation Warning: Section Limit Reached!\n\nMaximum 4 products can be assigned to '${editProdForm.specialSection}' on the Home Page. Please remove an existing product from '${editProdForm.specialSection}' first.`);
        return;
      }
    }

    const priceNum = Number(editProdForm.sellingPrice);
    const mrpNum = editProdForm.mrp ? Number(editProdForm.mrp) : priceNum;
    let discPct = editProdForm.discount ? Number(editProdForm.discount) : 0;
    if (!editProdForm.discount && mrpNum > priceNum) {
      discPct = Math.round(((mrpNum - priceNum) / mrpNum) * 100);
    }

    const validImages = editUploadedImages.filter(img => img && img.trim() !== '');
    const finalImg = validImages.length > 0 ? validImages[0] : (editingProduct.img || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80');

    const updatedPayload = {
      ...editingProduct,
      productCode: editProdForm.productCode.trim(),
      product_code: editProdForm.productCode.trim(),
      title: editProdForm.title,
      name: editProdForm.title,
      category: editProdForm.category,
      categoryLabel: editProdForm.categoryLabel || editProdForm.category,
      category_label: editProdForm.categoryLabel || editProdForm.category,
      subcategory: editProdForm.subcategory,
      subcategoryLabel: editProdForm.subcategoryLabel || editProdForm.subcategory,
      subcategory_label: editProdForm.subcategoryLabel || editProdForm.subcategory,
      price: priceNum,
      sellingPrice: priceNum,
      price_num: priceNum,
      mrp: mrpNum,
      mrp_num: mrpNum,
      discount: discPct,
      discount_pct: discPct,
      description: editProdForm.description,
      material: editProdForm.material,
      colour: editProdForm.colour,
      careInstructions: editProdForm.careInstructions,
      care_instructions: editProdForm.careInstructions,
      deliveryTime: editProdForm.deliveryTime,
      delivery_time: editProdForm.deliveryTime,
      badge: editProdForm.specialSection !== 'None' ? editProdForm.specialSection : editProdForm.badge,
      specialSection: editProdForm.specialSection,
      special_section: editProdForm.specialSection,
      inStock: editProdForm.inStock,
      in_stock: editProdForm.inStock,
      stockQuantity: Number(editProdForm.stockQuantity) || 10,
      stock_quantity: Number(editProdForm.stockQuantity) || 10,
      img: finalImg,
      images: validImages.length > 0 ? validImages : [finalImg]
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedPayload);
      setEditingProduct(null);
    }
  };

  const handleDeleteProductClick = (productId, productTitle) => {
    setCustomConfirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${productTitle}"?\n\nThis will remove the product from the store catalog permanently.`,
      confirmText: 'Delete Product',
      isDanger: true,
      onConfirm: () => {
        if (onDeleteProduct) onDeleteProduct(productId);
      }
    });
  };

  // Image Upload Handler Functions
  const handleSingleSlotUpload = async (e, slotIdx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await processFileToDataUrl(file);
    if (dataUrl) {
      setUploadedImages(prev => {
        const copy = [...prev];
        copy[slotIdx] = dataUrl;
        return copy;
      });
    }
    e.target.value = '';
  };

  const handleMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const dataUrl = await processFileToDataUrl(files[i]);
      if (dataUrl) {
        setUploadedImages(prev => {
          const copy = [...prev];
          const emptyIdx = copy.findIndex(img => !img);
          if (emptyIdx !== -1) {
            copy[emptyIdx] = dataUrl;
          } else {
            copy[i] = dataUrl;
          }
          return copy;
        });
      }
    }
    e.target.value = '';
  };

  const handleGlobalDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const dataUrl = await processFileToDataUrl(files[i]);
      if (dataUrl) {
        setUploadedImages(prev => {
          const copy = [...prev];
          const emptyIdx = copy.findIndex(img => !img);
          if (emptyIdx !== -1) {
            copy[emptyIdx] = dataUrl;
          } else {
            copy[i] = dataUrl;
          }
          return copy;
        });
      }
    }
  };

  const handleRemoveSlot = (slotIdx) => {
    setUploadedImages(prev => {
      const copy = [...prev];
      copy[slotIdx] = '';
      return copy;
    });
  };

  const handleMakePrimary = (slotIdx) => {
    if (slotIdx === 0) return;
    setUploadedImages(prev => {
      const copy = [...prev];
      const target = copy[slotIdx];
      copy[slotIdx] = copy[0];
      copy[0] = target;
      return copy;
    });
  };

  const handleSwapSlots = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx > 3) return;
    setUploadedImages(prev => {
      const copy = [...prev];
      const temp = copy[fromIdx];
      copy[fromIdx] = copy[toIdx];
      copy[toIdx] = temp;
      return copy;
    });
  };

  const handleEditSingleSlotUpload = async (e, slotIdx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await processFileToDataUrl(file);
    if (dataUrl) {
      setEditUploadedImages(prev => {
        const copy = [...prev];
        copy[slotIdx] = dataUrl;
        return copy;
      });
    }
    e.target.value = '';
  };

  const handleEditMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const dataUrl = await processFileToDataUrl(files[i]);
      if (dataUrl) {
        setEditUploadedImages(prev => {
          const copy = [...prev];
          const emptyIdx = copy.findIndex(img => !img);
          if (emptyIdx !== -1) {
            copy[emptyIdx] = dataUrl;
          } else {
            copy[i] = dataUrl;
          }
          return copy;
        });
      }
    }
    e.target.value = '';
  };

  const handleEditRemoveSlot = (slotIdx) => {
    setEditUploadedImages(prev => {
      const copy = [...prev];
      copy[slotIdx] = '';
      return copy;
    });
  };

  const handleEditMakePrimary = (slotIdx) => {
    if (slotIdx === 0) return;
    setEditUploadedImages(prev => {
      const copy = [...prev];
      const target = copy[slotIdx];
      copy[slotIdx] = copy[0];
      copy[0] = target;
      return copy;
    });
  };

  const filteredProducts = productsList.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = (p.title || p.name || '').toLowerCase().includes(query);
    const codeMatch = (p.productCode || p.product_code || '').toLowerCase().includes(query);
    const categoryMatch = (p.categoryLabel || p.category || '').toLowerCase().includes(query);
    const matchesSearch = !query || titleMatch || codeMatch || categoryMatch;

    const matchesCatFilter = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCatFilter;
  });

  const totalCategoriesCount = activeCategories.length;
  const totalSubCategoriesCount = activeCategories.reduce((sum, cat) => {
    if (cat.subCategoryObjects) return sum + cat.subCategoryObjects.length;
    if (cat.subcategories) return sum + cat.subcategories.length;
    return sum;
  }, 0);

  const pendingOrdersCount = ordersList.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

  const totalRevenue = ordersList.reduce((sum, o) => {
    const raw = parseInt(String(o.amount).replace(/[^0-9]/g, '')) || 0;
    return sum + raw;
  }, 0);

  const topSellingProducts = productsList.slice(0, 5);

  const handleExportOrders = (format = 'csv') => {
    const exportData = filteredOrders.map(o => {
      let parsedItems = [];
      try {
        parsedItems = typeof o.itemsJson === 'string'
          ? JSON.parse(o.itemsJson)
          : (o.items_json ? (typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json) : []);
      } catch (e) {
        parsedItems = [];
      }

      const productCodes = parsedItems.length > 0
        ? parsedItems.map(it => it.productCode || it.product_code || 'N/A').join(', ')
        : 'N/A';

      const itemDetails = parsedItems.length > 0
        ? parsedItems.map(it => `${it.title || it.name || 'Item'} (${it.productCode || it.product_code || 'N/A'}) x ${it.quantity || 1}`).join('; ')
        : (o.items || '1 Item');

      const addrStr = o.address || o.shipping_address || o.shippingAddress || '';
      const line1 = o.shippingAddressLine1 || o.shipping_address_line1 || '';
      const line2 = o.shippingAddressLine2 || o.shipping_address_line2 || '';
      const city = o.shippingCity || o.shipping_city || '';
      const state = o.shippingState || o.shipping_state || '';
      const pin = o.shippingPincode || o.shipping_pincode || '';
      const country = o.shippingCountry || o.shipping_country || 'India';

      let fullAddress = '';
      if (line1 || city || pin) {
        const parts = [];
        if (line1) parts.push(line1);
        if (line2) parts.push(line2);
        const cityStatePin = [city, state].filter(Boolean).join(', ') + (pin ? ` - ${pin}` : '');
        if (cityStatePin) parts.push(cityStatePin);
        if (country) parts.push(country);
        fullAddress = parts.join(', ');
      } else if (addrStr) {
        fullAddress = addrStr.trim();
      }

      return {
        'Order ID': o.order_code || o.id,
        'Customer Name': o.customerName || o.customer_name || 'N/A',
        'Customer Phone': o.customerPhone || o.customer_phone || 'N/A',
        'Customer Email': o.customerEmail || o.customer_email || 'N/A',
        'Delivery Address': fullAddress,
        'Pincode': pin,
        'Product Codes': productCodes,
        'Purchased Items': itemDetails,
        'Total Amount (INR)': o.amount || 0,
        'Order Status': o.status || 'Pending',
        'Order Date': o.date || o.created_at || 'Today'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    const fileName = `Jiza_Orders_${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
    XLSX.writeFile(workbook, fileName, { bookType: format === 'xlsx' ? 'xlsx' : 'csv' });
    showAdminToast(`📥 Exported ${exportData.length} order(s) to ${fileName}`);
  };

  const handleExportCustomers = (format = 'csv') => {
    const exportData = customersList.map(c => {
      const custOrders = getCustomerOrders(c);
      const totalSpent = calculateCustomerTotalSpent(custOrders);

      return {
        'Customer ID': c.id,
        'Full Name': c.name,
        'Email Address': c.email,
        'Phone Number': c.phone,
        'Address': c.address || '',
        'City': c.city || '',
        'Pincode': c.pincode || '',
        'Total Orders': custOrders.length,
        'Total Amount Spent (INR)': totalSpent,
        'Joined Date': c.joinedDate || 'Recent'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    const fileName = `Jiza_Customers_${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
    XLSX.writeFile(workbook, fileName, { bookType: format === 'xlsx' ? 'xlsx' : 'csv' });
    showAdminToast(`📥 Exported ${exportData.length} customer(s) to ${fileName}`);
  };

  const getCustomerOrders = (customer) => {
    if (!customer) return [];
    return ordersList.filter(o => {
      const oEmail = (o.customerEmail || o.customer_email || '').toLowerCase().trim();
      const oPhone = (o.customerPhone || o.customer_phone || '').replace(/\s+/g, '');
      const cEmail = (customer.email || '').toLowerCase().trim();
      const cPhone = (customer.phone || '').replace(/\s+/g, '');

      return (cEmail && oEmail === cEmail) || (cPhone && oPhone === cPhone);
    });
  };

  const calculateCustomerTotalSpent = (custOrders) => {
    return custOrders.reduce((sum, o) => {
      const raw = parseInt(String(o.amount || 0).replace(/[^0-9]/g, '')) || 0;
      return sum + raw;
    }, 0);
  };

  const matchesOrderDateFilter = (o) => {
    if (orderDatePreset === 'all') return true;

    const parseToISTDateString = (dateVal) => {
      if (!dateVal) return null;
      let d;
      if (dateVal instanceof Date) {
        d = dateVal;
      } else {
        d = new Date(dateVal);
      }
      if (isNaN(d.getTime())) return null;

      try {
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).formatToParts(d);

        const y = parts.find(p => p.type === 'year')?.value;
        const m = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        if (y && m && day) return `${y}-${m}-${day}`;
      } catch (e) {}

      return d.toISOString().split('T')[0];
    };

    const nowISTString = parseToISTDateString(new Date());
    if (!nowISTString) return true;

    const [nowY, nowM, nowD] = nowISTString.split('-').map(Number);
    const orderISTString = parseToISTDateString(o.created_at || o.createdAt || o.date);
    if (!orderISTString) return true;

    if (orderDatePreset === 'today') {
      return orderISTString === nowISTString;
    }

    if (orderDatePreset === 'yesterday') {
      const yestDate = new Date(Date.UTC(nowY, nowM - 1, nowD - 1));
      const yestISTString = parseToISTDateString(yestDate);
      return orderISTString === yestISTString;
    }

    if (orderDatePreset === 'last7') {
      const orderDate = new Date(orderISTString);
      const todayDate = new Date(nowISTString);
      const diffTime = todayDate - orderDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    }

    if (orderDatePreset === 'thisMonth') {
      const [oY, oM] = orderISTString.split('-').map(Number);
      return oY === nowY && oM === nowM;
    }

    if (orderDatePreset === 'lastMonth') {
      const [oY, oM] = orderISTString.split('-').map(Number);
      const targetY = nowM === 1 ? nowY - 1 : nowY;
      const targetM = nowM === 1 ? 12 : nowM - 1;
      return oY === targetY && oM === targetM;
    }

    if (orderDatePreset === 'custom') {
      if (!orderStartDate && !orderEndDate) return true;
      if (orderStartDate && orderISTString < orderStartDate) return false;
      if (orderEndDate && orderISTString > orderEndDate) return false;
      return true;
    }

    return true;
  };

  const filteredOrders = ordersList.filter(o => {
    const query = searchQuery.toLowerCase().trim();
    const idMatch = (o.id || o.order_code || '').toLowerCase().includes(query);
    const nameMatch = (o.customerName || o.customer_name || '').toLowerCase().includes(query);
    const phoneMatch = (o.customerPhone || o.customer_phone || '').includes(query);
    const matchesSearch = !query || idMatch || nameMatch || phoneMatch;

    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesDate = matchesOrderDateFilter(o);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredOrdersValue = filteredOrders.reduce((acc, o) => {
    const raw = parseInt(String(o.amount).replace(/[^0-9]/g, '')) || 0;
    return acc + raw;
  }, 0);

  // Analytics tab date preset state & math
  const [analyticsPreset, setAnalyticsPreset] = useState('7days');
  const [startDate, setStartDate] = useState('2026-07-28');
  const [endDate, setEndDate] = useState('2026-08-04');

  const matchesAnalyticsDateFilter = (o) => {
    if (!o.date && !o.created_at) return true;
    const orderDateStr = o.created_at ? o.created_at.split('T')[0] : (o.date || '');
    if (!orderDateStr) return true;

    const now = new Date();
    const orderDate = new Date(orderDateStr);

    if (analyticsPreset === '7days') {
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    if (analyticsPreset === '30days') {
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }

    if (analyticsPreset === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }

    if (analyticsPreset === 'custom') {
      if (!startDate && !endDate) return true;
      if (startDate && orderDateStr < startDate) return false;
      if (endDate && orderDateStr > endDate) return false;
      return true;
    }

    return true;
  };

  const getAnalyticsData = () => {
    const filtered = ordersList.filter(matchesAnalyticsDateFilter);
    const totalRev = filtered.reduce((acc, o) => acc + (parseInt(String(o.amount).replace(/[^0-9]/g, '')) || 0), 0);
    const totalUnits = filtered.reduce((acc, o) => {
      let parsed = [];
      try {
        parsed = typeof o.itemsJson === 'string' ? JSON.parse(o.itemsJson) : (o.items_json ? (typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json) : []);
      } catch (e) {
        parsed = [];
      }
      return acc + (parsed.length > 0 ? parsed.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1);
    }, 0);

    const avgOrder = filtered.length > 0 ? Math.round(totalRev / filtered.length) : 0;

    let chartData = [
      { day: 'Day 1', rev: Math.round(totalRev * 0.1), units: Math.max(1, Math.round(totalUnits * 0.1)) },
      { day: 'Day 2', rev: Math.round(totalRev * 0.15), units: Math.max(1, Math.round(totalUnits * 0.15)) },
      { day: 'Day 3', rev: Math.round(totalRev * 0.2), units: Math.max(1, Math.round(totalUnits * 0.2)) },
      { day: 'Day 4', rev: Math.round(totalRev * 0.12), units: Math.max(1, Math.round(totalUnits * 0.12)) },
      { day: 'Day 5', rev: Math.round(totalRev * 0.25), units: Math.max(1, Math.round(totalUnits * 0.25)) },
      { day: 'Day 6', rev: Math.round(totalRev * 0.18), units: Math.max(1, Math.round(totalUnits * 0.18)) }
    ];

    let label = 'Showing data for the Last 7 Days';
    if (analyticsPreset === '30days') label = 'Showing data for the Last 30 Days';
    if (analyticsPreset === 'month') label = 'Showing data for This Month';
    if (analyticsPreset === 'custom') label = `Showing data from ${startDate || 'Start'} to ${endDate || 'Today'}`;

    return { totalRev, totalUnits, avgOrder, chartData, label };
  };

  const currentAnalytics = getAnalyticsData();
  const maxRevenueInChart = Math.max(...currentAnalytics.chartData.map(d => d.rev), 1);
  const maxUnitsInChart = Math.max(...currentAnalytics.chartData.map(d => d.units), 1);

  const handleChatbotSend = (queryText) => {
    if (!queryText || !queryText.trim()) return;

    const userMsg = { sender: 'user', text: queryText };
    setChatbotMessages(prev => [...prev, userMsg]);
    if (chatbotInput) setChatbotInput('');

    setTimeout(() => {
      let reply = "I'm sorry, I couldn't find exact details for your query. Connecting you to a live Jiza Stylist via WhatsApp!";
      const qLower = queryText.toLowerCase();

      const matchedKb = knowledgeBase.find(item => qLower.includes(item.q.toLowerCase()) || item.q.toLowerCase().includes(qLower));
      if (matchedKb) {
        reply = matchedKb.a;
      } else if (qLower.includes('track') || qLower.includes('status') || qLower.includes('order')) {
        reply = "📦 Order #JIZA-773516 Status: SHIPPED via Blue Dart Express (Air Transit). Expected delivery in 2 Business Days!";
      } else if (qLower.includes('recommend') || qLower.includes('bridal') || qLower.includes('suggest')) {
        reply = "✨ For bridal occasions, I highly recommend our Royal Kundan Bridal Choker Set paired with Antique Gold Chandbalis!";
      } else if (qLower.includes('return') || qLower.includes('refund')) {
        reply = "🔄 Standard products can be returned within 7 days. Customized bridal sets are non-refundable.";
      }

      setChatbotMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FDF0ED] text-on-surface font-body-md flex flex-col relative">
      
      {/* 1. FIXED TOP NAVIGATION BAR */}
      <AdminHeader onExitAdmin={onExitAdmin} />

      {/* BODY WRAPPER */}
      <div className="flex flex-1 pt-12 min-h-screen">
        
        {/* 2. COMPACT LEFT SIDEBAR */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          productsCount={productsList.length}
          categoriesCount={activeCategories.length}
          rentalGalleryCount={rentalGalleryList.length}
          pendingOrdersCount={pendingOrdersCount}
          customersCount={customersList.length}
          reviewsCount={adminReviews.length}
          newProblemsCount={adminProblems.filter(p => p.status === 'New').length}
          fetchRentalGallery={fetchRentalGallery}
          fetchAdminReviews={fetchAdminReviews}
          fetchAdminProblems={fetchAdminProblems}
          setSelectedPremiumFeature={setSelectedPremiumFeature}
          onExitAdmin={onExitAdmin}
        />

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 ml-52 p-5 md:p-6 min-h-[calc(100vh-48px)] bg-[#FDF0ED] space-y-5">
          
          {/* Subheader / Page Title */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F7C5C0]">
            <h2 className="font-headline-sm text-sm text-black font-bold capitalize tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'products' && 'Inventory & Product Catalog'}
              {activeTab === 'orders' && 'Order Management & Dispatch'}
              {activeTab === 'customers' && 'Customer Management'}
              {activeTab === 'analytics' && 'Analytics & Performance Charts'}
              {activeTab === 'categories' && 'Categories & Sub-Categories'}
              {activeTab === 'rental-gallery' && 'Rental Collection Gallery CMS'}
              {activeTab === 'store-settings' && 'Studio Pickup & Store Location Settings'}
              {activeTab === 'premium' && 'Premium Enterprise Modules & Expansion'}
            </h2>

            <div className="flex items-center gap-2">
              {/* ORDERS PAGE EXPORT BUTTON */}
              {activeTab === 'orders' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleExportOrders('csv')}
                    className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold px-3 py-1.5 rounded-xl border border-black/20 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Export all orders to Microsoft Excel / CSV"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Export Orders (.CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportOrders('xlsx')}
                    className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold px-2.5 py-1.5 rounded-xl border border-black/20 shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title="Export all orders to Excel (.xlsx)"
                  >
                    <span className="text-[10px] font-mono">.XLSX</span>
                  </button>
                </div>
              )}

              {/* CUSTOMERS PAGE EXPORT BUTTON */}
              {activeTab === 'customers' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleExportCustomers('csv')}
                    className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold px-3 py-1.5 rounded-xl border border-black/20 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Export full customer database to Microsoft Excel / CSV"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Export Customers (.CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCustomers('xlsx')}
                    className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold px-2.5 py-1.5 rounded-xl border border-black/20 shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title="Export full customer database to Excel (.xlsx)"
                  >
                    <span className="text-[10px] font-mono">.XLSX</span>
                  </button>
                </div>
              )}

              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#FCDAD7] text-black px-2 py-0.5 rounded-md border border-black/20">
                Live Synchronized System
              </span>

              {onExitAdmin && (
                <button
                  onClick={onExitAdmin}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-lg border border-black/20 shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Exit Admin</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'overview' && (
            <DashboardTab
              totalRevenue={totalRevenue}
              ordersList={ordersList}
              productsList={productsList}
              totalCategoriesCount={totalCategoriesCount}
              totalSubCategoriesCount={totalSubCategoriesCount}
              customersList={customersList}
              topSellingProducts={topSellingProducts}
            />
          )}

          {/* TAB 2: INVENTORY & PRODUCTS */}
          {activeTab === 'products' && (
            <ProductsTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              setIsAddProductOpen={setIsAddProductOpen}
              filteredProducts={filteredProducts}
              productsList={productsList}
              onUpdateSpecialSection={onUpdateSpecialSection}
              onUpdateProductStock={onUpdateProductStock}
              handleOpenEditProduct={handleOpenEditProduct}
              handleDeleteProductClick={handleDeleteProductClick}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 3: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <OrdersTab
              orderDatePreset={orderDatePreset}
              setOrderDatePreset={setOrderDatePreset}
              orderStartDate={orderStartDate}
              setOrderStartDate={setOrderStartDate}
              orderEndDate={orderEndDate}
              setOrderEndDate={setOrderEndDate}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              orderStatusFilter={orderStatusFilter}
              setOrderStatusFilter={setOrderStatusFilter}
              filteredOrders={filteredOrders}
              filteredOrdersValue={filteredOrdersValue}
              onUpdateOrderStatus={onUpdateOrderStatus}
              setSelectedOrderDetails={setSelectedOrderDetails}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 4: CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <CustomersTab
              adminToken={getAdminToken()}
              handleExportCustomers={handleExportCustomers}
              setSelectedCustomerDetails={setSelectedCustomerDetails}
            />
          )}

          {/* TAB: REVIEWS MANAGEMENT */}
          {activeTab === 'reviews' && (
            <ReviewsTab
              adminReviews={adminReviews}
              reviewStatusFilter={reviewStatusFilter}
              setReviewStatusFilter={setReviewStatusFilter}
              fetchAdminReviews={fetchAdminReviews}
              handleUpdateReviewStatus={handleUpdateReviewStatus}
              handleDeleteReview={handleDeleteReview}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB: CUSTOMER PROBLEMS */}
          {activeTab === 'problems' && (
            <ProblemsTab
              adminProblems={adminProblems}
              problemStatusFilter={problemStatusFilter}
              setProblemStatusFilter={setProblemStatusFilter}
              fetchAdminProblems={fetchAdminProblems}
              setSelectedProblemScreenshotModal={setSelectedProblemScreenshotModal}
              setSelectedProblemModal={setSelectedProblemModal}
              setProblemModalStatus={setProblemModalStatus}
              setProblemModalNotes={setProblemModalNotes}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 5: ANALYTICS & PERFORMANCE CHARTS */}
          {activeTab === 'analytics' && (
            <AnalyticsTab
              analyticsPreset={analyticsPreset}
              setAnalyticsPreset={setAnalyticsPreset}
              currentAnalytics={currentAnalytics}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              maxRevenueInChart={maxRevenueInChart}
              maxUnitsInChart={maxUnitsInChart}
            />
          )}

          {/* TAB 6: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <CategoriesTab
              activeCategories={activeCategories}
              setCatForm={setCatForm}
              setIsAddCatModalOpen={setIsAddCatModalOpen}
              productsList={productsList}
              handleToggleCategoryActive={handleToggleCategoryActive}
              setEditingCategory={setEditingCategory}
              handleDeleteCategory={handleDeleteCategory}
              setSubCatForm={setSubCatForm}
              setIsAddSubModalOpen={setIsAddSubModalOpen}
              handleToggleSubCategoryActive={handleToggleSubCategoryActive}
              setEditingSubcategory={setEditingSubcategory}
              handleDeleteSubCategory={handleDeleteSubCategory}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 7: PREMIUM FEATURES SHOWCASE */}
          {activeTab === 'premium' && (
            <PremiumFeaturesTab
              selectedPremiumFeature={selectedPremiumFeature}
              setSelectedPremiumFeature={setSelectedPremiumFeature}
              PREMIUM_FEATURES={PREMIUM_FEATURES}
              activeDemoCall={activeDemoCall}
              setActiveDemoCall={setActiveDemoCall}
              arOverlay={arOverlay}
              setArOverlay={setArOverlay}
              demoBookings={demoBookings}
              setDemoBookings={setDemoBookings}
              approvingId={approvingId}
              setApprovingId={setApprovingId}
              meetingInput={meetingInput}
              setMeetingInput={setMeetingInput}
              chatbotMessages={chatbotMessages}
              handleChatbotSend={handleChatbotSend}
              chatbotInput={chatbotInput}
              setChatbotInput={setChatbotInput}
              knowledgeBase={knowledgeBase}
              setKnowledgeBase={setKnowledgeBase}
              newKbQ={newKbQ}
              setNewKbQ={setNewKbQ}
              newKbA={newKbA}
              setNewKbA={setNewKbA}
              showAdminToast={showAdminToast}
              setContactDevTargetFeature={setContactDevTargetFeature}
              setIsContactDevModalOpen={setIsContactDevModalOpen}
            />
          )}

          {/* TAB 8: RENTAL GALLERY IMAGE-ONLY CMS */}
          {activeTab === 'rental-gallery' && (
            <RentalGalleryTab
              rentalGalleryList={rentalGalleryList}
              handleRentalFilesSelect={handleRentalFilesSelect}
              selectedRentalFiles={selectedRentalFiles}
              setSelectedRentalFiles={setSelectedRentalFiles}
              handleRemoveSelectedRentalFile={handleRemoveSelectedRentalFile}
              isUploadingRental={isUploadingRental}
              handleUploadRentalGallerySubmit={handleUploadRentalGallerySubmit}
              fetchRentalGallery={fetchRentalGallery}
              setRentalDeleteModalItem={setRentalDeleteModalItem}
              isReadOnly={isReadOnly}
            />
          )}

          {/* TAB 9: STORE SETTINGS & PICKUP CONFIGURATION */}
          {activeTab === 'store-settings' && (
            <StoreSettingsTab isReadOnly={isReadOnly} />
          )}

        </main>

      </div>

      {/* MODAL 1: ADD NEW PRODUCT */}
      <AddProductModal
        isAddProductOpen={isAddProductOpen}
        setIsAddProductOpen={setIsAddProductOpen}
        handleCreateProductSubmit={handleCreateProductSubmit}
        newProd={newProd}
        setNewProd={setNewProd}
        activeCategories={activeCategories}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        handleGlobalDrop={handleGlobalDrop}
        handleMultipleFilesUpload={handleMultipleFilesUpload}
        uploadedImages={uploadedImages}
        handleMakePrimary={handleMakePrimary}
        handleSwapSlots={handleSwapSlots}
        handleRemoveSlot={handleRemoveSlot}
        handleSingleSlotUpload={handleSingleSlotUpload}
      />

      {/* MODAL 1B: EDIT PRODUCT MODAL */}
      <EditProductModal
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        handleUpdateProductSubmit={handleUpdateProductSubmit}
        editProdForm={editProdForm}
        setEditProdForm={setEditProdForm}
        activeCategories={activeCategories}
        handleEditMultipleFilesUpload={handleEditMultipleFilesUpload}
        editUploadedImages={editUploadedImages}
        handleEditMakePrimary={handleEditMakePrimary}
        handleEditRemoveSlot={handleEditRemoveSlot}
        handleEditSingleSlotUpload={handleEditSingleSlotUpload}
      />

      {/* MODAL 2: ORDER DETAILS */}
      <OrderDetailsModal
        selectedOrderDetails={selectedOrderDetails}
        setSelectedOrderDetails={setSelectedOrderDetails}
      />

      {/* MODAL 3: CUSTOMER ACCOUNT DETAILS */}
      <CustomerDetailsModal
        selectedCustomerDetails={selectedCustomerDetails}
        setSelectedCustomerDetails={setSelectedCustomerDetails}
        getCustomerOrders={getCustomerOrders}
        calculateCustomerTotalSpent={calculateCustomerTotalSpent}
        setSelectedOrderDetails={setSelectedOrderDetails}
      />

      {/* MODAL 4 & 5: CATEGORY MODALS */}
      <AddCategoryModal
        isAddCatModalOpen={isAddCatModalOpen}
        setIsAddCatModalOpen={setIsAddCatModalOpen}
        handleCreateCategory={handleCreateCategory}
        catForm={catForm}
        setCatForm={setCatForm}
        processFileToDataUrl={processFileToDataUrl}
      />

      <EditCategoryModal
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        handleUpdateCategorySubmit={handleUpdateCategorySubmit}
        processFileToDataUrl={processFileToDataUrl}
      />

      <AddSubCategoryModal
        isAddSubModalOpen={isAddSubModalOpen}
        setIsAddSubModalOpen={setIsAddSubModalOpen}
        handleCreateSubCategory={handleCreateSubCategory}
        subCatForm={subCatForm}
        setSubCatForm={setSubCatForm}
        activeCategories={activeCategories}
        processFileToDataUrl={processFileToDataUrl}
      />

      <EditSubCategoryModal
        editingSubcategory={editingSubcategory}
        setEditingSubcategory={setEditingSubcategory}
        handleUpdateSubCategorySubmit={handleUpdateSubCategorySubmit}
        processFileToDataUrl={processFileToDataUrl}
      />

      {/* MODAL 5: CONTACT DEVELOPER SUPPORT */}
      <ContactDevModal
        isContactDevModalOpen={isContactDevModalOpen}
        setIsContactDevModalOpen={setIsContactDevModalOpen}
        contactDevTargetFeature={contactDevTargetFeature}
      />

      {/* CUSTOMER PROBLEM INSPECT & UPDATE MODAL */}
      <ProblemDetailsModal
        selectedProblemModal={selectedProblemModal}
        setSelectedProblemModal={setSelectedProblemModal}
        setSelectedProblemScreenshotModal={setSelectedProblemScreenshotModal}
        problemModalStatus={problemModalStatus}
        setProblemModalStatus={setProblemModalStatus}
        problemModalNotes={problemModalNotes}
        setProblemModalNotes={setProblemModalNotes}
        handleSaveProblemChanges={handleSaveProblemChanges}
        isReadOnly={isReadOnly}
      />

      {/* FULL SCREENSHOT MODAL */}
      {selectedProblemScreenshotModal && (
        <div className="fixed inset-0 z-50 bg-deep-onyx/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-surface border border-heritage-gold/50 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <span className="font-bold text-xs text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-base">image</span> Attached Problem Screenshot
              </span>
              <button
                onClick={() => setSelectedProblemScreenshotModal(null)}
                className="p-1 bg-surface-container hover:bg-surface text-on-surface rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto flex items-center justify-center bg-black/40 rounded-xl p-2">
              <img src={selectedProblemScreenshotModal} alt="Full Screenshot" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow" />
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION DIALOG MODAL */}
      {customConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFF9F9] border border-black/20 text-black rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-3xl ${customConfirm.isDanger ? 'text-red-700' : 'text-black'}`}>
                {customConfirm.isDanger ? 'warning' : 'help'}
              </span>
              <h3 className="font-headline-sm text-base font-bold">{customConfirm.title}</h3>
            </div>
            <p className="text-xs text-stone-700 font-medium leading-relaxed whitespace-pre-line">
              {customConfirm.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomConfirm(null)}
                className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {customConfirm.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  customConfirm.onConfirm();
                  setCustomConfirm(null);
                }}
                className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                  customConfirm.isDanger 
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-700/20' 
                    : 'bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/20'
                }`}
              >
                <span>{customConfirm.confirmText || 'Proceed'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT MESSAGE DIALOG MODAL */}
      {customAlert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFF9F9] border border-black/20 text-black rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-black">
              <span className="material-symbols-outlined text-3xl">info</span>
              <h3 className="font-headline-sm text-base font-bold">{customAlert.title}</h3>
            </div>
            <p className="text-xs text-stone-700 font-medium leading-relaxed whitespace-pre-line">
              {customAlert.message}
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCustomAlert(null)}
                className="px-5 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 active:scale-95 transition-all cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE RENTAL GALLERY IMAGE MODAL */}
      <RentalDeleteModal
        rentalDeleteModalItem={rentalDeleteModalItem}
        setRentalDeleteModalItem={setRentalDeleteModalItem}
        handleDeleteRentalImageConfirm={handleDeleteRentalImageConfirm}
      />

      {/* ADMIN TOAST NOTIFICATION BANNER */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FCDAD7] text-black border border-black/20 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>{adminToast}</span>
        </div>
      )}

    </div>
  );
}
