import React, { useState } from 'react';

export default function ProductReviewPopupModal({ promptData, onSubmit, onDismiss }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!promptData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setIsSubmitting(true);
    await onSubmit({
      ...promptData,
      rating,
      reviewText
    });
    setIsSubmitting(false);
  };

  const handleDismiss = async (action) => {
    setIsSubmitting(true);
    await onDismiss(promptData, action); // action: 'skip' | 'remind_later'
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-deep-onyx/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-surface border border-heritage-gold/50 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6 animate-scaleUp">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-antique-cream border border-heritage-gold/40 flex items-center justify-center text-heritage-gold">
              <span className="material-symbols-outlined text-lg">rate_review</span>
            </span>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface">Rate & Review Your Purchase</h3>
          </div>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">verified</span> Order Delivered
          </span>
        </div>

        {/* Product Brief */}
        <div className="flex items-center space-x-4 bg-antique-cream/40 p-3.5 rounded-xl border border-heritage-gold/20">
          <div className="w-16 h-16 rounded-lg bg-white overflow-hidden border border-outline-variant/40 shrink-0 flex items-center justify-center">
            {promptData.productImage ? (
              <img src={promptData.productImage} alt={promptData.productName} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-outline text-2xl">diamond</span>
            )}
          </div>
          <div className="space-y-0.5">
            <p className="font-headline-sm text-sm font-bold text-on-surface line-clamp-1">{promptData.productName}</p>
            <p className="text-xs text-on-surface-variant font-mono">Order ID: #{promptData.orderId}</p>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Star Rating */}
          <div className="text-center space-y-2">
            <label className="font-label-sm text-xs text-on-surface-variant font-bold block uppercase tracking-wider">
              How would you rate this product?
            </label>
            <div className="flex items-center justify-center space-x-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-heritage-gold focus:outline-none transition-transform hover:scale-125"
                  >
                    <span 
                      className="material-symbols-outlined text-3xl md:text-4xl transition-colors"
                      style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-heritage-gold">
              {rating === 5 && '⭐⭐⭐⭐⭐ Exceptional Quality'}
              {rating === 4 && '⭐⭐⭐⭐ Very Good'}
              {rating === 3 && '⭐⭐⭐ Average'}
              {rating === 2 && '⭐⭐ Below Expectations'}
              {rating === 1 && '⭐ Poor'}
            </p>
          </div>

          {/* Written Review */}
          <div>
            <label className="font-label-sm text-xs text-on-surface-variant font-bold block mb-1.5">
              Write Your Review (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about the craftsmanship, fitting, finish, and overall shopping experience..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:border-heritage-gold transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-black/25 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>{isSubmitting ? 'Submitting...' : 'Submit Customer Review'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDismiss('remind_later')}
                disabled={isSubmitting}
                className="py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs font-semibold rounded-xl border border-outline-variant transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>Remind Me Later</span>
              </button>

              <button
                type="button"
                onClick={() => handleDismiss('skip')}
                disabled={isSubmitting}
                className="py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-xs font-semibold rounded-xl border border-outline-variant transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                <span>Skip</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
