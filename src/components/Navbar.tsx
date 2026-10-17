import React from 'react';
import { Search, Send, Bookmark, BookOpen, FileText, ArrowLeft, Play } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: 'batches' | 'lectures' | 'notes' | 'saved';
  onTabChange: (tab: 'batches' | 'lectures' | 'notes' | 'saved') => void;
  savedCount: number;
  onOpenTelegram: () => void;
  onGoHome: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  savedCount,
  onOpenTelegram,
  onGoHome,
  canGoBack,
  onBack,
}) => {
  const ICON_URL = 'https://i.ibb.co/0R7qc34v/1093.jpg';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pink-950/40 bg-[#08090d]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Brand & Back */}
        <div className="flex items-center gap-3">
          {canGoBack && onBack && (
            <button
              onClick={onBack}
              aria-label="Go Back"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-500/30 bg-pink-950/30 text-pink-400 transition hover:bg-pink-500/20 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onGoHome}
            className="group flex items-center gap-3 text-left transition active:scale-95"
          >
            <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-pink-500/50 shadow-[0_0_15px_-3px_rgba(236,72,153,0.5)] transition duration-300 group-hover:border-pink-400">
              <img
                src={ICON_URL}
                alt="GB STUDY"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-['Outfit',sans-serif] text-lg font-black tracking-wider text-white">
                  GB <span className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">STUDY</span>
                </span>
                <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-pink-300">
                  FREE
                </span>
              </div>
              <p className="text-[10px] font-medium tracking-tight text-zinc-400">
                100% Free Learning Portal
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 114+ batches, subjects, lectures..."
              className="w-full rounded-full border border-pink-500/30 bg-[#12141c] py-2 pl-10 pr-4 text-xs font-medium text-white placeholder-zinc-500 transition focus:border-pink-500 focus:bg-[#161922] focus:outline-none focus:ring-1 focus:ring-pink-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex">
            <button
              onClick={() => onTabChange('batches')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition ${
                activeTab === 'batches'
                  ? 'bg-pink-500/20 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]'
                  : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>All Batches</span>
            </button>

            <button
              onClick={() => onTabChange('lectures')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition ${
                activeTab === 'lectures'
                  ? 'bg-pink-500/20 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]'
                  : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>All Lectures</span>
            </button>

            <button
              onClick={() => onTabChange('notes')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition ${
                activeTab === 'notes'
                  ? 'bg-pink-500/20 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]'
                  : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Notes / PDF</span>
            </button>

            <button
              onClick={() => onTabChange('saved')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide transition ${
                activeTab === 'saved'
                  ? 'bg-pink-500/20 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]'
                  : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="ml-1 rounded-full bg-pink-500 px-1.5 py-0.2 text-[10px] font-black text-white">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Telegram Action Button (Pink) */}
          <button
            onClick={onOpenTelegram}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 px-3.5 py-2 text-xs font-bold text-white shadow-[0_0_20px_-3px_rgba(236,72,153,0.6)] transition duration-200 hover:from-pink-500 hover:to-rose-400 active:scale-95"
          >
            <Send className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            <span className="whitespace-nowrap tracking-wide">Join Telegram</span>
          </button>
        </div>
      </div>
    </header>
  );
};
