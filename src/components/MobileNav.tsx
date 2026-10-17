import React from 'react';
import { BookOpen, FileText, Bookmark, Send, Play } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'batches' | 'lectures' | 'notes' | 'saved';
  onTabChange: (tab: 'batches' | 'lectures' | 'notes' | 'saved') => void;
  savedCount: number;
  onOpenTelegram: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  onOpenTelegram,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-pink-950/60 bg-[#090a10]/95 px-1 backdrop-blur-xl md:hidden">
      <button
        onClick={() => onTabChange('batches')}
        className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold transition active:scale-95 ${
          activeTab === 'batches' ? 'text-pink-400' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <BookOpen className="h-4 w-4" />
        <span>Batches</span>
      </button>

      <button
        onClick={() => onTabChange('lectures')}
        className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold transition active:scale-95 ${
          activeTab === 'lectures' ? 'text-pink-400' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Play className="h-4 w-4 fill-current" />
        <span>Lectures</span>
      </button>

      <button
        onClick={() => onTabChange('notes')}
        className={`flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold transition active:scale-95 ${
          activeTab === 'notes' ? 'text-pink-400' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>Notes</span>
      </button>

      <button
        onClick={() => onTabChange('saved')}
        className={`relative flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold transition active:scale-95 ${
          activeTab === 'saved' ? 'text-pink-400' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Bookmark className="h-4 w-4" />
        <span>Saved</span>
        {savedCount > 0 && (
          <span className="absolute -top-1 right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-pink-500 text-[8px] font-extrabold text-white">
            {savedCount}
          </span>
        )}
      </button>

      <button
        onClick={onOpenTelegram}
        className="flex flex-col items-center justify-center gap-0.5 text-[9px] font-bold text-pink-400 transition active:scale-95"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.8)]">
          <Send className="h-2.5 w-2.5 fill-white" />
        </div>
        <span>Telegram</span>
      </button>
    </nav>
  );
};
