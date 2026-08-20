import React from 'react';

export default function RentalDeleteModal({
  rentalDeleteModalItem,
  setRentalDeleteModalItem,
  handleDeleteRentalImageConfirm
}) {
  if (!rentalDeleteModalItem) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FFF9F9] border border-red-300 text-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
        <div className="flex items-center gap-3 text-red-700 border-b border-red-100 pb-3">
          <span className="material-symbols-outlined text-2xl">warning</span>
          <h3 className="font-bold text-sm text-black">Delete this image from Rental Gallery?</h3>
        </div>

        <div className="flex items-center justify-center py-2">
          <img
            src={rentalDeleteModalItem.image_url}
            alt="Rental Delete Preview"
            className="w-36 h-36 object-cover rounded-2xl border border-outline-variant shadow-md bg-white"
          />
        </div>

        <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
          This action will permanently remove the photo from the customer-facing Rental Collection Gallery and update set counts automatically. Unrelated product catalog images will not be affected.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => setRentalDeleteModalItem(null)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-on-surface font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDeleteRentalImageConfirm(rentalDeleteModalItem.id)}
            className="px-5 py-2 bg-red-600 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
