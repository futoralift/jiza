import React from 'react';

export default function RentalGalleryTab({
  rentalGalleryList = [],
  handleRentalFilesSelect,
  selectedRentalFiles = [],
  setSelectedRentalFiles,
  handleRemoveSelectedRentalFile,
  isUploadingRental,
  handleUploadRentalGallerySubmit,
  fetchRentalGallery,
  setRentalDeleteModalItem
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-[#FCDAD7] text-black p-6 rounded-3xl shadow-sm border border-black/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/10 border border-black/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 text-black">
            <span className="material-symbols-outlined text-xs">collections</span>
            <span>Image-Only Gallery CMS</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-black tracking-wide" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Rental Collection Gallery
          </h2>
          <p className="text-xs text-stone-800 mt-1 max-w-xl">
            Upload and manage photos for the customer-facing Rental Collection Gallery. Newly uploaded photos instantly update the customer gallery and live set counts.
          </p>
        </div>

        <div className="bg-black text-[#FCDAD7] px-4 py-2 rounded-2xl border border-black/20 font-bold text-xs shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#FCDAD7]">photo_library</span>
          <span>{rentalGalleryList.length} Active Gallery Items</span>
        </div>
      </div>

      {/* Section 1: Multi-Image Upload Area */}
      <div className="bg-white p-6 rounded-3xl border border-outline-variant/40 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant/20 pb-3">
          <span className="material-symbols-outlined text-base text-black">cloud_upload</span>
          <span>Upload New Rental Photos</span>
        </h3>

        {/* Select Images Box */}
        <div className="relative border-2 border-dashed border-[#F7C5C0] hover:border-black rounded-2xl p-8 bg-[#FFF0F2]/40 hover:bg-[#FFF0F2] transition-colors text-center cursor-pointer group">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleRentalFilesSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-black/10 group-hover:bg-black/20 text-black flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
            </div>
            <h4 className="font-bold text-sm text-black">Select Images</h4>
            <p className="text-xs text-on-surface-variant font-medium">
              Click or drag to choose one or multiple images (JPG, PNG, WebP)
            </p>
          </div>
        </div>

        {/* Image Previews Before Upload */}
        {selectedRentalFiles.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-on-surface">
                Selected Images ({selectedRentalFiles.length})
              </h4>
              <button
                type="button"
                onClick={() => setSelectedRentalFiles([])}
                className="text-[11px] font-bold text-red-700 hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {selectedRentalFiles.map((file) => (
                <div key={file.id} className="relative group rounded-xl overflow-hidden border border-outline-variant aspect-square bg-gray-50 shadow-xs">
                  <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedRentalFile(file.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all active:scale-90"
                    title="Remove ×"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isUploadingRental}
                onClick={handleUploadRentalGallerySubmit}
                className="px-6 py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md border border-black/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isUploadingRental ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">upload</span>
                    <span>Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Current Gallery Management */}
      <div className="bg-white p-6 rounded-3xl border border-outline-variant/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-black">photo_library</span>
            <span>Current Rental Gallery ({rentalGalleryList.length})</span>
          </h3>

          <button
            onClick={fetchRentalGallery}
            className="text-xs font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh</span>
          </button>
        </div>

        {rentalGalleryList.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant italic text-xs">
            No rental gallery images uploaded yet. Use the upload box above to add photos.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {rentalGalleryList.map((item, idx) => (
              <div key={item.id} className="bg-[#FFF0F2]/40 border border-[#F7C5C0] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group">
                <div className="relative aspect-square overflow-hidden bg-white">
                  <img src={item.image_url} alt={`Rental ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 bg-black/70 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                    #{idx + 1}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between border-t border-[#F7C5C0] bg-white">
                  <span className="text-[10px] text-gray-500 font-mono truncate max-w-[90px]">
                    {item.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRentalDeleteModalItem(item)}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] rounded-lg border border-red-200 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title="Delete from Gallery"
                  >
                    <span className="material-symbols-outlined text-xs">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
