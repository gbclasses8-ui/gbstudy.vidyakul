import React from 'react';
import { Sparkles, Send, Search, CheckCircle, Play } from 'lucide-react';

interface HeroProps {
  totalBatches: number;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenTelegram: () => void;
  onExploreLectures?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  totalBatches,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenTelegram,
  onExploreLectures,
}) => {
  const ICON_URL = 'https://i.ibb.co/0R7qc34v/1093.jpg';

  const categories = [
    { id: 'all', label: 'All Batches' },
    { id: '12th', label: 'Class 12th' },
    { id: '10th', label: 'Class 10th' },
    { id: '11th', label: 'Class 11th' },
    { id: '9th', label: 'Class 9th' },
    { id: 'kunji', label: 'Kunji / Unsolved' },
    { id: 'hunkaar', label: 'Hunkaar Batches' },
  ];

  return (
    <div className="relative overflow-hidden border-b border-pink-950/40 bg-gradient-to-b from-[#11121c] via-[#090a10] to-[#08090d] py-10 sm:py-14">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pink-600/15 blur-[100px]"></div>
      <div className="pointer-events-none absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[120px]"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Brand Badge */}
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-pink-500/30 bg-pink-950/40 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <div className="h-5 w-5 overflow-hidden rounded-full border border-pink-400">
              <img
                src={ICON_URL}
                alt="GB STUDY"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-['Outfit',sans-serif] text-xs font-black tracking-widest text-pink-300">
              GB STUDY · 100% FREE EDUCATION PORTAL
            </span>
            <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl font-['Outfit',sans-serif] text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl text-balance">
            Padhai Ab Sabke Liye{' '}
            <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(236,72,153,0.8)]">
              Bilkul Muft
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-zinc-300 sm:text-sm md:text-base">
            All classes, state boards aur competitive exams ke sabhi premium batches, high quality video lectures aur daily notes PDF — bina kisi registration ya login ke.
          </p>

          {/* Fast Stats Row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-1.5 rounded-xl border border-pink-950/60 bg-[#12141c] px-3 py-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-pink-400" />
              <span>{totalBatches} Real Batches</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-pink-950/60 bg-[#12141c] px-3 py-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-pink-400" />
              <span>Full Video Player</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-pink-950/60 bg-[#12141c] px-3 py-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-pink-400" />
              <span>Downloadable PDFs</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-pink-950/60 bg-[#12141c] px-3 py-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-pink-400" />
              <span>No Login Required</span>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenTelegram}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(236,72,153,0.6)] transition duration-200 hover:from-pink-500 hover:to-rose-400 active:scale-95"
            >
              <Send className="h-4 w-4" />
              <span>Join GB STUDY Telegram</span>
            </button>

            {onExploreLectures && (
              <button
                onClick={onExploreLectures}
                className="flex items-center gap-2 rounded-xl border border-pink-500/40 bg-[#12141c] px-5 py-3 text-sm font-bold text-pink-300 transition hover:bg-pink-950/30 hover:text-white active:scale-95"
              >
                <Play className="h-4 w-4 fill-current text-pink-500" />
                <span>Watch Real Lectures</span>
              </button>
            )}
          </div>

          {/* Mobile Search Input */}
          <div className="mt-6 w-full max-w-md md:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search batches (e.g. 12th, Physics, Kunji)..."
                className="w-full rounded-2xl border border-pink-500/40 bg-[#141622] py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-zinc-500 shadow-inner focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]'
                      : 'border-pink-950/60 bg-[#13151f] text-zinc-300 hover:border-pink-500/40 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
