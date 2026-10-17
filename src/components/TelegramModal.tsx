import React from 'react';
import { Send, X, ShieldCheck, Sparkles, Bell } from 'lucide-react';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const TELEGRAM_URL = 'https://t.me/GBFreestudy';
  const ICON_URL = 'https://i.ibb.co/0R7qc34v/1093.jpg';

  const handleJoin = () => {
    window.open(TELEGRAM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-pink-500/40 bg-[#10121a] p-6 text-center shadow-[0_0_50px_-10px_rgba(236,72,153,0.5)] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-pink-600/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-pink-500/20 bg-pink-950/20 text-zinc-400 transition hover:bg-pink-500/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Icon & Telegram Badge */}
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 opacity-60 blur-md"></div>
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-pink-400 p-0.5 shadow-xl">
            <img
              src={ICON_URL}
              alt="GB STUDY"
              referrerPolicy="no-referrer"
              className="h-full w-full rounded-[14px] object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#10121a] bg-pink-500 text-white shadow-lg">
            <Send className="h-3.5 w-3.5 fill-white" />
          </div>
        </div>

        {/* Headings */}
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pink-400">
          <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          <span>Official Channel</span>
        </div>

        <h3 className="text-xl font-extrabold tracking-tight text-white">
          Join GB STUDY Telegram Channel
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-zinc-300">
          Daily class updates, batch announcements, revision notes, class PDFs aur direct test links pane ke liye official Telegram channel abhi join karein!
        </p>

        {/* Channel Perks */}
        <div className="my-5 grid grid-cols-2 gap-2 text-left text-xs">
          <div className="flex items-center gap-2 rounded-xl border border-pink-950/50 bg-[#161822] p-2.5 text-zinc-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-pink-400" />
            <span className="text-[11px] font-medium">100% Free Batches</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-pink-950/50 bg-[#161822] p-2.5 text-zinc-200">
            <Bell className="h-4 w-4 shrink-0 text-pink-400" />
            <span className="text-[11px] font-medium">Daily PDF & DPPs</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={handleJoin}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 py-3 text-sm font-bold text-white shadow-[0_0_25px_-4px_rgba(236,72,153,0.7)] transition duration-200 hover:from-pink-500 hover:to-rose-400 active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            <span>Join Telegram</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl border border-pink-500/30 bg-[#191b24] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-pink-950/30 hover:text-white active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
