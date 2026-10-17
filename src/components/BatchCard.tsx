import React from 'react';
import { Bookmark, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { Batch } from '../types.ts';

interface BatchCardProps {
  batch: Batch;
  isSaved: boolean;
  onToggleSave: (batch: Batch) => void;
  onOpenBatch: (batch: Batch) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  isSaved,
  onToggleSave,
  onOpenBatch,
}) => {
  const FALLBACK_COVER = 'https://i.ibb.co/0R7qc34v/1093.jpg';

  // Extract class name from title if available
  const getBadgeText = (title: string) => {
    if (/12|12th|12वीं/i.test(title)) return 'CLASS 12';
    if (/10|10th|10वीं/i.test(title)) return 'CLASS 10';
    if (/11|11th|11वीं/i.test(title)) return 'CLASS 11';
    if (/9|9th|9वीं/i.test(title)) return 'CLASS 9';
    return 'TARGET BATCH';
  };

  return (
    <div
      onClick={() => onOpenBatch(batch)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-pink-950/60 bg-[#12141c] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/50 hover:shadow-[0_0_25px_-5px_rgba(236,72,153,0.35)] cursor-pointer"
    >
      {/* Top subtle pink accent line */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-80 transition duration-300 group-hover:opacity-100"></div>

      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0a0f]">
        <img
          src={batch.previewImage || FALLBACK_COVER}
          alt={batch.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== FALLBACK_COVER) {
              target.src = FALLBACK_COVER;
            }
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-black/30"></div>

        {/* Free / Lifetime Badge (Pink) */}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-pink-400/40 bg-pink-950/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-pink-300 backdrop-blur-md shadow-md">
          <Sparkles className="h-3 w-3 text-pink-400" />
          <span>FREE · LIFETIME</span>
        </div>

        {/* Wishlist / Save Button */}
        <button
          type="button"
          aria-label={isSaved ? 'Remove from saved' : 'Save batch'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(batch);
          }}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 active:scale-95 ${
            isSaved
              ? 'border-pink-500 bg-pink-500/30 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.6)]'
              : 'border-white/10 bg-black/60 text-zinc-300 hover:border-pink-400/50 hover:bg-pink-950/40 hover:text-pink-300'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-pink-500' : ''}`} />
        </button>

        {/* Category Pill at bottom left of thumbnail */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-bold text-pink-300">
          <GraduationCap className="h-3.5 w-3.5 text-pink-400" />
          <span className="drop-shadow-md">{getBadgeText(batch.name)}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors duration-200 group-hover:text-pink-300">
            {batch.name}
          </h3>
          <p className="mt-1 text-[11px] text-zinc-400">
            Official GB STUDY Syllabus · All Chapters Included
          </p>
        </div>

        {/* Action Button: LET'S STUDY (Pink Gradient) */}
        <div className="mt-4">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 px-4 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_-4px_rgba(236,72,153,0.6)] transition-all duration-200 group-hover:from-pink-500 group-hover:to-rose-400 group-hover:shadow-[0_0_25px_-2px_rgba(236,72,153,0.8)] active:scale-[0.98]"
          >
            <span>LET'S STUDY</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
