import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getMediaUrl } from '../config';

// Sample Rental Collection Gallery Data
const RENTAL_ITEMS = [
  {
    id: 1,
    title: "Royal Kundan & Pearl Bridal Choker Set",
    category: "Kundan Collection",
    image: "/rental1.webp",
    description: "Handcrafted royal Kundan choker embellished with genuine freshwater pearls and emerald gemstone drops. Includes matching jhumka earrings and maangtikka.",
    tag: "Most Popular for Weddings"
  },
  {
    id: 2,
    title: "Victorian Ruby & AD Grand Heritage Necklace",
    category: "Victorian AD",
    image: "/rental2.webp",
    description: "Ultra-luxury Victorian finish necklace studded with high-clarity American Diamonds and pigeon-blood ruby drops. Perfect for reception & sangeet.",
    tag: "Exclusive Reception Edit"
  },
  {
    id: 3,
    title: "Heritage Kundan & Emerald Multi-Layer Haar",
    category: "Kundan Collection",
    image: "/kundan-square.webp",
    description: "Multi-row green emerald bead strands paired with a heavy Kundan central pendant. Traditional royal Rajasthani bridal style.",
    tag: "Bridal Statement Piece"
  },
  {
    id: 4,
    title: "Maharashtrian Royal Thushi & Nath Combo",
    category: "Maharashtrian Heritage",
    image: "/maharashtrian-square.webp",
    description: "Traditional Kolhapuri Saaj, woven golden bead Thushi, and pearl Brahmani Nath. Classic Marathi bridal rental collection.",
    tag: "Traditional Classic"
  },
  {
    id: 5,
    title: "South Indian Temple Antique Gold Necklace Set",
    category: "South Indian Temple",
    image: "/south-indian.webp",
    description: "Nakshi carved Lakshmi pendant necklace with kemp stones and golden pearl clusters. Authentic South Indian temple heritage design.",
    tag: "Temple Nakshi Work"
  },
  {
    id: 6,
    title: "American Diamond Luxury Solitaire Choker",
    category: "AD Collection",
    image: "/american-diamond-square.webp",
    description: "Micro-pave AAA grade American Diamond choker necklace with brilliant crystal cuts and matching drop earrings.",
    tag: "Sangeet & Cocktail"
  },
  {
    id: 7,
    title: "Grand Kundan Bridal Combo (7-Piece Set)",
    category: "Bridal Combos",
    image: "/combo-sets-square.webp",
    description: "Complete bridal trousseau including heavy choker, long haar, maangtikka, mathapatti, nath, and matching haathphool.",
    tag: "Full Bridal Trousseau"
  },
  {
    id: 8,
    title: "Antique Gold Temple Bangles Set",
    category: "Bangles & Accessories",
    image: "/bangles-square.webp",
    description: "Set of 4 heavy gold-plated kadas featuring intricate floral motifs and kemp stone settings for bridal wrists.",
    tag: "Bridal Wristwear"
  },
  {
    id: 9,
    title: "Jiza Heritage Banner Luxury Showcase Set 1",
    category: "Exclusive Edit",
    image: "/banner1.webp",
    description: "Exclusive luxury bridal collection showcase set available for studio rental and trial.",
    tag: "Studio Trial Available"
  },
  {
    id: 10,
    title: "Jiza Heritage Banner Luxury Showcase Set 2",
    category: "Exclusive Edit",
    image: "/banner2.webp",
    description: "High-end Kundan and Polki heritage set created for grand bridal portraits and red-carpet events.",
    tag: "Grand Portrait Edit"
  }
];

const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:5000' : '';

export default function RentalGalleryView({ setActiveView }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [galleryItems, setGalleryItems] = useState(RENTAL_ITEMS);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/api/rental-gallery`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.items) && data.items.length > 0) {
          const items = data.items.map((it, idx) => ({
            id: it.id || idx,
            image: getMediaUrl(it.image_url || it.image) || '/rental1.webp',
            title: `Rental Collection Set ${idx + 1}`
          }));
          setGalleryItems(items);
        }
      })
      .catch(err => console.warn('Using initial gallery fallback:', err));

    return () => { isMounted = false; };
  }, []);

  // Lock body scrolling while Lightbox is open so page behind cannot scroll
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [selectedImageIndex]);

  const activeItem = selectedImageIndex !== null ? galleryItems[selectedImageIndex] : null;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    } else {
      setSelectedImageIndex(galleryItems.length - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (selectedImageIndex < galleryItems.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    } else {
      setSelectedImageIndex(0);
    }
  };

  return (
    <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 pb-24 min-h-[80vh] animate-fadeIn">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-on-surface-variant mb-6">
        <button 
          onClick={() => setActiveView('home')} 
          className="hover:text-black transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          <span>Home</span>
        </button>
        <span>/</span>
        <span className="text-black font-bold">Rental Collection Gallery</span>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-[#FCDAD7] border border-black/15 rounded-3xl p-6 md:p-10 mb-10 shadow-sm relative overflow-hidden text-black">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 border border-black/20 rounded-full text-xs font-bold text-black uppercase tracking-wider mb-4 shadow-xs">
            <span className="material-symbols-outlined text-sm text-black">diamond</span>
            <span>Studio Exclusive • Pune Store</span>
          </div>

          <h1 
            className="text-2xl md:text-4xl font-bold mb-3 tracking-wide"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Luxury Rental Collection Gallery
          </h1>

          <p className="text-xs md:text-sm text-black/85 leading-relaxed mb-6 font-medium max-w-2xl">
            Explore our royal bridal and heritage jewellery available for studio rental. Browse full high-definition gallery photographs of our Kundan, Maharashtrian, Victorian, and Temple sets below.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-lg">
            <a
              href="https://wa.me/918208822696?text=Hello%20Jiza%20Jewellery%20Studio!%20I%20am%20interested%20in%20renting%20bridal%20jewellery%20from%20your%20Rental%20Collection%20Gallery."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-5 bg-black hover:bg-black/85 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 text-center"
            >
              <span className="material-symbols-outlined text-base shrink-0">chat</span>
              <span>Enquire Now</span>
            </a>

            <a
              href="tel:+918208822696"
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-5 bg-white hover:bg-white/90 text-black font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-xl border border-black/25 shadow-xs transition-all active:scale-95 text-center"
            >
              <span className="material-symbols-outlined text-base shrink-0">call</span>
              <span>Call Studio</span>
            </a>
          </div>
        </div>

        {/* Decorative Watermark */}
        <span className="material-symbols-outlined text-9xl text-black/5 absolute -right-6 -bottom-6 pointer-events-none select-none">
          collections
        </span>
      </div>

      {/* Section Subheading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-black/10 pb-4 gap-2">
        <div>
          <h2 className="font-headline-sm text-lg md:text-xl font-bold text-black">
            Rental Collection Image Gallery ({galleryItems.length} Sets)
          </h2>
          <p className="text-xs text-black/60 font-medium">Click any photograph to view in full-screen lightbox</p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-black/80 font-bold bg-[#FCDAD7]/60 px-3 py-1.5 rounded-full border border-black/15">
          <span className="material-symbols-outlined text-sm">touch_app</span>
          <span>Tap Image to Expand Lightbox</span>
        </div>
      </div>

      {/* PURE IMAGE GALLERY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
        {galleryItems.map((item, index) => (
          <div
            key={item.id || index}
            onClick={() => setSelectedImageIndex(index)}
            className="group relative bg-white border border-black/15 rounded-2xl overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer aspect-square"
          >
            {/* Pure Image Container */}
            <img
              src={item.image}
              alt="Rental Gallery Image"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              loading="lazy"
            />

            {/* Subtle Overlay Hover Icon */}
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white">
              <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-lg transform group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl text-white">zoom_in</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PURE CENTERED LIGHTBOX IMAGE VIEWER WITH ARROWS (PORTAL TO DOCUMENT.BODY) */}
      {activeItem && createPortal(
        <div 
          className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn overflow-hidden"
          onClick={() => setSelectedImageIndex(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Main Centered Viewer Container */}
          <div 
            className="relative w-full max-w-4xl h-full max-h-[85vh] flex items-center justify-center m-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X Button */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="fixed top-4 right-4 z-[99999999] w-11 h-11 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center shadow-xl border border-white/20 transition-transform active:scale-90"
              title="Close"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Left Prev Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[99999999] w-12 h-12 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center shadow-xl border border-white/20 transition-transform active:scale-90"
              title="Previous Image"
            >
              <span className="material-symbols-outlined text-3xl">chevron_left</span>
            </button>

            {/* Right Next Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[99999999] w-12 h-12 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center shadow-xl border border-white/20 transition-transform active:scale-90"
              title="Next Image"
            >
              <span className="material-symbols-outlined text-3xl">chevron_right</span>
            </button>

            {/* Pure Centered Image in the Middle of Screen */}
            <img
              src={activeItem.image}
              alt="Rental Gallery Full Image"
              className="max-h-[82vh] max-w-[85vw] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>,
        document.body
      )}

    </main>
  );
}
