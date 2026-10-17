import React from 'react';
import { Send, Heart, BookOpen, FileText, Shield } from 'lucide-react';

interface FooterProps {
  onOpenTelegram: () => void;
  onSelectTab: (tab: 'batches' | 'lectures' | 'notes' | 'saved') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTelegram, onSelectTab }) => {
  const ICON_URL = 'https://i.ibb.co/0R7qc34v/1093.jpg';

  return (
    <footer className="border-t border-pink-950/40 bg-[#08090d] pb-20 pt-12 text-zinc-400 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl border border-pink-500/50 shadow-md">
                <img
                  src={ICON_URL}
                  alt="GB STUDY"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-['Outfit',sans-serif] text-xl font-black text-white">
                GB <span className="text-pink-500">STUDY</span>
              </span>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              GB STUDY is dedicated to making quality education accessible to every student across India without any barrier, login, or subscription fee.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenTelegram}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] transition hover:from-pink-500 hover:to-rose-400 active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Join Official Telegram Channel</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-pink-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('batches')}
                  className="transition hover:text-pink-400"
                >
                  All Batches & Courses
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('lectures')}
                  className="transition hover:text-pink-400"
                >
                  All Video Lectures
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('notes')}
                  className="transition hover:text-pink-400"
                >
                  PDF Notes & Question Papers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('saved')}
                  className="transition hover:text-pink-400"
                >
                  Saved Batches
                </button>
              </li>
              <li>
                <a
                  href="https://t.me/GBFreestudy"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-pink-400 flex items-center gap-1"
                >
                  <span>Telegram Community</span>
                  <Send className="h-2.5 w-2.5 text-pink-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Education Promise */}
          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-pink-400">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-pink-400" />
                <span>114+ Full Syllabus Batches</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-pink-400" />
                <span>Official PDF Notes</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-pink-400" />
                <span>Zero Logins / No Registration</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-pink-950/40 pt-6 text-[11px] text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} GB STUDY. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
            <span>for Students across India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
