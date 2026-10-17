import React from 'react';
import { Bookmark, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { Batch } from '../types.ts';

interface SavedSectionProps {
  savedBatches: Batch[];
  onOpenBatch: (batch: Batch) => void;
  onRemoveSaved: (batchId: string) => void;
  onBrowseAll: () => void;
}

export const SavedSection: React.FC<SavedSectionProps> = ({
  savedBatches,
  onOpenBatch,
  onRemoveSaved,
  onBrowseAll,
}) => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-950/30 px-3 py-1 text-xs font-bold text-pink-400">
            <Bookmark className="h-3.5 w-3.5" />
            <span>MY SAVED BATCHES</span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Your Bookmarked Batches ({savedBatches.length})
          </h2>
          <p className="mt-1 text-xs text-zinc-300">
            Batches are saved locally on your device for instant offline recall — no login needed!
          </p>
        </div>

        {savedBatches.length > 0 && (
          <button
            onClick={onBrowseAll}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-950/20 px-3.5 py-2 text-xs font-bold text-pink-300 transition hover:bg-pink-500/20 hover:text-white"
          >
            <span>Browse More Batches</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {savedBatches.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedBatches.map((batch, idx) => (
            <div
              key={`saved-${batch.id}-${idx}`}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-pink-950/60 bg-[#12141c] p-4 shadow-lg transition duration-200 hover:border-pink-500/40 hover:bg-[#161822]"
            >
              <div className="flex gap-3">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-pink-500/20 bg-black">
                  <img
                    src={batch.previewImage || 'https://i.ibb.co/0R7qc34v/1093.jpg'}
                    alt={batch.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.ibb.co/0R7qc34v/1093.jpg';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-400">
                    SAVED
                  </span>
                  <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-tight text-white group-hover:text-pink-300">
                    {batch.name}
                  </h3>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-pink-950/40">
                <button
                  onClick={() => onOpenBatch(batch)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-2 text-xs font-bold text-white transition hover:from-pink-500 hover:to-rose-400 active:scale-95"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Open Batch</span>
                </button>

                <button
                  onClick={() => onRemoveSaved(batch.id)}
                  title="Remove from saved"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-500/30 bg-pink-950/20 text-zinc-400 transition hover:bg-red-950/40 hover:border-red-500/40 hover:text-red-400 active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-pink-950/40 bg-[#10121a] p-12 text-center">
          <Bookmark className="mx-auto mb-3 h-12 w-12 text-pink-500/40" />
          <h3 className="text-base font-bold text-white">No Saved Batches Yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-400">
            Click the bookmark icon on any batch to save it here for fast, one-tap access anytime.
          </p>
          <button
            onClick={onBrowseAll}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:from-pink-500 hover:to-rose-400 active:scale-95"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Explore All 114+ Batches</span>
          </button>
        </div>
      )}
    </div>
  );
};
