import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  X,
  FileText,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { PDFItem } from '../types.ts';

interface PDFModalProps {
  pdf: PDFItem | null;
  onClose: () => void;
}

export const PDFModal: React.FC<PDFModalProps> = ({ pdf, onClose }) => {
  if (!pdf) return null;

  const [viewerMode, setViewerMode] = useState<'proxy' | 'gdocs'>('proxy');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Use proxy so content-type is application/pdf and displays inline
  const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdf.pdf_url)}`;
  const gdocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdf.pdf_url)}&embedded=true`;
  const currentSrc = viewerMode === 'proxy' ? `${proxyUrl}#toolbar=1&navpanes=0&view=FitH` : gdocsUrl;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = `${pdf.pdf_title || 'GB-STUDY-Notes'}.pdf`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-2xl border border-pink-500/40 bg-[#0e1017] shadow-[0_0_60px_rgba(236,72,153,0.4)] transition-all duration-300 ${
          isFullscreen ? 'h-[98vh] max-w-[98vw]' : 'h-[90vh] max-w-5xl'
        }`}
      >
        {/* Top Bar Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-950/40 bg-[#141620] px-4 py-3">
          {/* Title & Info */}
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-pink-500/20 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-pink-300">
                  GB PDF
                </span>
                <h3 className="truncate text-xs font-bold text-white sm:text-sm">
                  {pdf.pdf_title || 'Study Notes & PDF'}
                </h3>
              </div>
              {pdf.date && <p className="text-[10px] text-zinc-400">{pdf.date}</p>}
            </div>
          </div>

          {/* Action & Control Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Engine Switcher (Proxy vs Google Docs viewer) */}
            <div className="hidden sm:flex items-center rounded-xl border border-pink-950/60 bg-[#0c0d14] p-0.5">
              <button
                onClick={() => {
                  setLoading(true);
                  setViewerMode('proxy');
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  viewerMode === 'proxy'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                In-App Reader
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  setViewerMode('gdocs');
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  viewerMode === 'gdocs'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Mobile Engine
              </button>
            </div>

            {/* Direct Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:from-pink-500 hover:to-rose-400 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Open in New Tab */}
            <a
              href={proxyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-[#1b1e2a] px-3 py-1.5 text-xs font-semibold text-pink-200 transition hover:bg-pink-950/40 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-pink-500/30 bg-pink-950/20 text-zinc-300 transition hover:bg-pink-500/30 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              aria-label="Close PDF viewer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-pink-500/30 bg-pink-950/20 text-zinc-300 transition hover:bg-pink-500/30 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PDF Frame Container */}
        <div className="relative flex-1 bg-[#1a1c23]">
          {/* Loading indicator */}
          {loading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#10121a]/80">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-pink-500 border-t-transparent shadow-[0_0_15px_rgba(236,72,153,0.8)]"></div>
              <p className="mt-3 text-xs font-bold text-pink-300">
                Opening PDF inside GB STUDY...
              </p>
            </div>
          )}

          <iframe
            src={currentSrc}
            title={pdf.pdf_title || 'PDF Document'}
            className="h-full w-full border-none"
            onLoad={() => setLoading(false)}
          />

          {/* Mobile Fallback Helper Bar */}
          <div className="sm:hidden absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-xl bg-black/80 px-3 py-1.5 backdrop-blur-md text-[11px] text-zinc-300 border border-pink-500/30">
            <span className="truncate">Agar PDF na dikhe to reader change karein:</span>
            <button
              onClick={() => {
                setLoading(true);
                setViewerMode(viewerMode === 'proxy' ? 'gdocs' : 'proxy');
              }}
              className="ml-2 shrink-0 rounded-lg bg-pink-600 px-2.5 py-1 text-[10px] font-bold text-white"
            >
              {viewerMode === 'proxy' ? 'Try Engine 2' : 'Try Engine 1'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
