import React from 'react';
import { CATEGORIES } from '../data/products';

export default function SubCategoryView({ 
  categoryId, 
  onBack, 
  onSelectSubCategory, 
  setActiveView,
  categoriesList = []
}) {
  const activeCategories = categoriesList && categoriesList.length > 0 ? categoriesList : CATEGORIES;
  const category = activeCategories.find(c => c.id === categoryId || c.name === categoryId) || { id: categoryId, name: categoryId || 'Jewellery' };
  const categoryName = category?.name || categoryId || 'Jewellery';

  // Specific detailed subcategories with images per category
  const subCategoryDetails = {
    necklaces: [
      {
        name: "Choker Necklaces",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUPyzRZAHSznCSkJfM4S0Whjog7uFgpgyMS5z4ESVAW2Mt5Qx5GEJbrrNaMNrR0LTgc7NozuluxTlUtqCCzHQY5VBkdJ4npXQwxqkzBbssheWsE991IoTuuad30imWLRl-xYbBMbK7wPLiDflRBCr6Y2K7sb_vcXzwgT2DT4dYettWKSh4R5Thp9vxmoaFWzm3FsfMRELg9CwarBiCEF7nufCbyFt1UUjfaaR5ig1JRHqkSTSadFgNCQ"
      },
      {
        name: "Long Harams",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhfoeQ8kmOAKv16jzxtGF3AGZKvaw0bk4X8xRuRDfdMC2Cw-amz3ii5mesvdwP-tUSVqa4jGvg-XPEx60wzPe5rd1TsY3hAvLOh1poZJPCknDOHPeG7ZUrfZashapruCgO0dFoO6CYwfNhzuBqdEUpOz_PpbYmBVmW_eCrOZr_TAwpFftEJuDTumld1MS9jJ6Fzp4Vz6WM3SMnqZ6XoA8WGcweSDGobOF54I98kVRoWGH9PWkI4gbnZg"
      },
      {
        name: "Bridal Sets",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfkUckhwvQ32th8bnbQdV4GfvZknPC3Yl3N2ixYHjzjfcXN4Z24v_6vpfpTYj3VC_icSaQVJ6I--ANqrNsGnZEymKo9YxD0jEMHOdxaVTCu_7UlCYfZSkyQ0hzCGKBxgR48qfqmKWISoC2bGAE0iKP_fzdRYhZ2BysMXnmnm8O1ZKXhQyR8xrkp2PCXQ5w5ZbvXl2omfh5_M1iojI7sDt-T3B_Gyqw39pMQimj27ddqnE59hlqKjDuFQ"
      },
      {
        name: "Antique Pendants",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC01sXc9pwxn0nUwxwJi75DRUbqbBBu9fGWmJ0lvHMX7e9XZo0RIAiCH4ON6_0aYIJd7TGX8Ab6-tjrrrCv2Rxd0XshNpEDNYCqIyuCY8OM1crtXDTtWAAHSkND_2OjQVW8vdUx4GrEDGlLbvC0GFngDzhu__ohyPHjpn8PcUSakN4Mbtz0dBEAKDToKVG9ry9R2KJPY-X8SdqV9C_DLNFoshyj64ZAXF71bgN8uy_gUNvy73N2io3xig"
      },
      {
        name: "Kundan Mala",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2yYIppC9kt8TDeRfkOo2H_-7z1ZTsUmY-Gp66cPmgvqh7f3k0GBwdcGJA95XrFIndaSV9OgXx_PVCq6Un3f7wUwlOVAVHizv2G3kjKd1-14-jbHN4gfsfSvuyvXgmoBKSH_HsTayCs6Lj1y2VCfZnqOGvbSvTMgBejabUQYg02v2rr2VDknzLrO-GXGx0_ZN9uVCrbHP5oDlq9BM_F3QsLxw4CfEceGhYPKLfqBdXNFg_EWh-gvKj_w"
      },
      {
        name: "Temple Necklaces",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6wznfyu5EpJwLIVj2oryayJBYmkqBadAvhpMXd8q4b1wQWp_CNV9IXx2UjQfCPdJ8fa3KbJ40-KZMuOP7fGgRHaDme0RvBT_RjXAa6k-K327SoIcx2O8W2rY1E5KiQBZGnI436-k9fySpDrPnE9QGmfln6iaKM77_lyaYBGSUgZTtn5au_ra-xAnnTTeTaH4jmyEEXcbbQOKjzGYp9BeHXEFho6zZjn23AX1-ui34LvWK4q_PhCXwPg"
      }
    ],
    earrings: [
      {
        name: "Jhumkas",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVzpHZQWkgrlQ5HwQm8kgEWH2MZ01gNB-whHS7xD6vWCwmygUow3y8vQT6EvBY4nIWU3v_tJ2P8rPYQE2pipF4FUNrTmUhmtPUgQ4v57H-rYIZxCP9YnM81F17yWdJs06h_5MxDKjmkN3x80_DfZ1-fS22PprbcplB7ZlPPfR_Blc4MQmrINg_cEVWi151anpZTfU0M14tteV61cXY7XKCwbnHCLDdMHBnCv42_KHXfKIMF0OqV3UDJQ"
      },
      {
        name: "Chandbalis",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3UoUpybEVU7MQGPiaULf_EuPIV9JAO3cQfp9CCDCUWpB9jB1DeFEI5Xg7kCW2SROai_txNgCQfG0AhdzoaraYqn7wLoutH_L76D0RA9M4GNgZELMjkdF9hODXC64cAt_AsxOCqKM4N3Q3R_geI8t-TaUl_WoGLdc8C4HmfqUY6gO6hBSUsJZ9oHTD2SXy8idflJvA8ouOr6ET5FitacLJJf4YD-Mgs-gdPznoBzBYInzEAlLOzexv3g"
      },
      {
        name: "Studs",
        img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Drop Earrings",
        img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80"
      }
    ],
    rings: [
      {
        name: "Solitaires",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo98BM-BElO50j2SayGqeNSheoROZ1nrpyajLFobXO56EH2FCknewKEil9yYFaHOGerOW8JHJzNOvd1EvcGS8dugraGzSFFb_jQDTfqwIjqnCXwgieAGd4gq0i0FkDnntcCTse8kCqhvYMN429AiPx8myz4viufSrEU-ti5E5ysXJlWjEt7pYitAVxaNYl3STxBpnA0SruxXQrmYbIhVNGIFcAPSFgu8HjjUfrj0PUJIYGArpca88jSg"
      },
      {
        name: "Cocktail Rings",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzWZ4Iw-PJyqbjTajSKG95-OW8lr4eWsFskied9WV3oLOBUqwfnMijinNfDBR7t1o1TIj2nadc64r-pDuP2PFi-WpZdQdaazC0lCM4xBYM1BZMuZ4CejaBdQJA_Dp0EsAb4nsIJoeyapYqgs72ogL63HT-1kQxknFVJ9vAjqW6sr-lUEtSpcDXElY_66VSXk60CprEjYhDKxj4yoM6sOubrVurloH5UuJYej48ghQlauUGROMUNg04ig"
      },
      {
        name: "Heritage Gold Rings",
        img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80"
      },
      {
        name: "Couple Bands",
        img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=300&q=80"
      }
    ]
  };

  const list = (category.subCategoryObjects && category.subCategoryObjects.length > 0)
    ? category.subCategoryObjects.map(sub => ({
        id: sub.id,
        name: sub.name,
        img: sub.img || category.img
      }))
    : (category.subcategories || []).map(sub => ({
        id: typeof sub === 'object' ? sub.id : `${category.id}-${String(sub).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: typeof sub === 'string' ? sub : sub.name,
        img: (typeof sub === 'object' && sub.img) ? sub.img : category.img
      }));

  return (
    <div className="w-full max-w-container-max mx-auto pb-24 animate-fadeIn">
      
      {/* Top Bar with Back Button */}
      <header className="bg-surface/95 backdrop-blur-md w-full px-margin-mobile py-4 flex items-center justify-between sticky top-0 z-40 border-b border-outline-variant/40">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-heritage-gold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-sm text-lg md:text-xl text-heritage-gold text-center font-bold tracking-tight">
          Jiza Jewellery Studio
        </h1>
        <div className="w-6"></div>
      </header>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="px-margin-mobile py-3">
        <ol className="flex items-center space-x-2 font-label-sm text-xs text-on-surface-variant">
          <li>
            <button onClick={() => setActiveView('home')} className="hover:text-heritage-gold transition-colors cursor-pointer">
              Home
            </button>
          </li>
          <li><span>&gt;</span></li>
          <li>
            <button onClick={() => setActiveView('categories')} className="hover:text-heritage-gold transition-colors cursor-pointer">
              Categories
            </button>
          </li>
          <li><span>&gt;</span></li>
          <li aria-current="page" className="text-heritage-gold font-bold">
            {category.name}
          </li>
        </ol>
      </nav>

      {/* Hero Square Banner */}
      <section className="px-margin-mobile mt-4 mb-6 text-center animate-fadeIn">
        <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-md mx-auto border border-outline-variant bg-surface-container-low">
          <img 
            alt={category.name} 
            className="w-full h-full object-cover" 
            src={category.img} 
          />
        </div>
        <h2 className="font-headline-sm md:font-headline-md text-2xl md:text-3xl text-on-surface text-center mt-4 mb-1">
          {category.name}
        </h2>
      </section>

      {/* Category Description */}
      <main className="px-margin-mobile md:px-margin-desktop w-full max-w-5xl mx-auto">
        <p className="font-body-md text-sm text-on-surface-variant text-center mb-8 max-w-md mx-auto">
          Discover our curated collection of artisanal {categoryName.toLowerCase()}, where traditional craftsmanship meets timeless elegance.
        </p>

        {/* 2-Column or Centered Subcategories Grid */}
        <div className={`grid gap-4 md:gap-6 mb-6 ${list.length <= 2 ? 'grid-cols-2 max-w-sm mx-auto md:max-w-none md:flex md:justify-center' : 'grid-cols-2 md:grid-cols-6'}`}>
          {list.map((sub, idx) => (
            <button 
              key={sub.id || idx}
              onClick={() => onSelectSubCategory(sub.name, category.id, sub.id)}
              className={`group flex flex-col aspect-[4/5] rounded-2xl overflow-hidden border border-black/15 border-b-4 border-b-black/25 hover:border-black/35 hover:border-b-black/45 transition-all duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 bg-surface-container-lowest focus:outline-none active:scale-95 animate-fadeIn cursor-pointer ${list.length <= 2 ? 'w-full md:w-40' : 'w-full'}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* 1:1 Image Container */}
              <div className="w-full aspect-square overflow-hidden bg-surface-container-low relative">
                <img 
                  src={sub.img} 
                  alt={sub.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              
              {/* Text Container at the bottom (remaining space) */}
              <div className="w-full flex-grow flex items-center justify-center p-3 md:p-2.5 text-center bg-[#FCDAD7] border-t border-black/10 transition-all duration-300">
                <span className="font-headline-md text-xs sm:text-sm md:text-xs text-black font-semibold tracking-wide line-clamp-2">
                  {sub.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>

    </div>
  );
}
