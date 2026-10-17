import React, { useState } from 'react';
import { FileText, Download, Eye, Search, Sparkles, BookOpen } from 'lucide-react';
import { Batch, PDFItem } from '../types.ts';

interface NotesSectionProps {
  batches: Batch[];
  onOpenBatch: (batch: Batch) => void;
  onOpenPDF: (pdf: PDFItem) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  batches,
  onOpenBatch,
  onOpenPDF,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sample curated quick notes directly from top chapters for instant access
  const featuredNotes: {
    title: string;
    batchName: string;
    batchId: string;
    pdfUrl: string;
    subject: string;
    size?: string;
  }[] = [
    {
      title: 'L-16 || Subjective Type (वैद्युत आवेश तथा क्षेत्र)',
      batchName: 'कक्षा 12वीं हुंकार Batch 2026',
      batchId: '12-batch-2026HYCXiMxSis',
      pdfUrl: 'https://d2horkaojb0g6v.cloudfront.net/singleliveclass/pdfs/78528/56893/time_2025-03-10_12:08:13.pdf',
      subject: 'भौतिक विज्ञान (Physics)',
      size: '2.4 MB',
    },
    {
      title: 'L-5 || Unsolved Kunji मॉडल पेपर-5',
      batchName: 'कक्षा 12वीं Unsolved Kunji 2025',
      batchId: '12-unsolved-kunji-2025PmkRRLfsUr',
      pdfUrl: 'https://d2horkaojb0g6v.cloudfront.net/singleliveclass/pdfs/76776/26131/time_2025-02-20_17:36:48.pdf',
      subject: 'रसायन विज्ञान (Chemistry)',
      size: '2.6 MB',
    },
    {
      title: 'L-4 || Unsolved Kunji मॉडल पेपर-4',
      batchName: 'कक्षा 12वीं Unsolved Kunji 2025',
      batchId: '12-unsolved-kunji-2025PmkRRLfsUr',
      pdfUrl: 'https://d2horkaojb0g6v.cloudfront.net/singleliveclass/pdfs/76775/30294/time_2025-02-13_17:48:10.pdf',
      subject: 'रसायन विज्ञान (Chemistry)',
      size: '3.1 MB',
    },
    {
      title: 'L-3 || Unsolved Kunji मॉडल पेपर-3',
      batchName: 'कक्षा 12वीं Unsolved Kunji 2025',
      batchId: '12-unsolved-kunji-2025PmkRRLfsUr',
      pdfUrl: 'https://d2horkaojb0g6v.cloudfront.net/singleliveclass/pdfs/76776/48753/time_2025-02-20_17:36:48.pdf',
      subject: 'गणित (Mathematics)',
      size: '1.9 MB',
    },
    {
      title: 'Class 10th Unsolved Kunji - Science Model Paper',
      batchName: 'कक्षा 10वीं Unsolved Kunji 2025',
      batchId: '10-unsolved-kunji-2025qG5f5zltLp',
      pdfUrl: 'https://d2horkaojb0g6v.cloudfront.net/singleliveclass/pdfs/76776/37300/time_2025-02-20_17:36:48.pdf',
      subject: 'विज्ञान (Science)',
      size: '2.1 MB',
    },
    {
      title: 'Class 12th Hindi Grammar & Literature Revision',
      batchName: 'Class 12th Hunkaar Batch 2026',
      batchId: 'class-12th-hunkaar-batch-2026zpETRAlep2',
      pdfUrl: 'https://d2horkaojb0g6v.cloudfront.net/singleliveclass/pdfs/78528/56893/time_2025-03-10_12:08:13.pdf',
      subject: 'हिंदी (Hindi)',
      size: '1.8 MB',
    },
  ];

  const filteredNotes = featuredNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-950/30 px-3 py-1 text-xs font-bold text-pink-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>GB STUDY NOTES REPOSITORY</span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Class Notes, Formula Sheets & Model Papers
          </h2>
          <p className="mt-1 text-xs text-zinc-300 sm:text-sm">
            Handwritten revision notes, solved practice sheets aur question bank PDFs bilkul free me download karein.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by subject or title..."
            className="w-full rounded-xl border border-pink-500/40 bg-[#12141c] py-2 pl-10 pr-4 text-xs font-semibold text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Featured Notes Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note, index) => (
          <div
            key={`note-card-${index}-${note.batchId}`}
            className="group flex flex-col justify-between rounded-2xl border border-pink-950/60 bg-[#12141c] p-4 shadow-lg transition duration-200 hover:border-pink-500/40 hover:bg-[#161822]"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-pink-400">
                <span>{note.subject}</span>
                {note.size && <span className="text-zinc-500">{note.size}</span>}
              </div>

              <h3 className="mt-2 text-sm font-bold leading-snug text-white group-hover:text-pink-300">
                {note.title}
              </h3>

              <p className="mt-1 text-xs text-zinc-400">
                Batch: <span className="text-zinc-300">{note.batchName}</span>
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-pink-950/40">
              <a
                href={`/api/pdf-proxy?url=${encodeURIComponent(note.pdfUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-2 text-xs font-bold text-white shadow-sm transition hover:from-pink-500 hover:to-rose-400 active:scale-95"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Open Notes (External)</span>
              </a>

              <a
                href={`/api/pdf-proxy?url=${encodeURIComponent(note.pdfUrl)}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-xl border border-pink-500/30 bg-pink-950/20 px-3 py-2 text-xs font-bold text-pink-300 transition hover:bg-pink-500/20 hover:text-white"
                title="Direct Download"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Explanatory Callout to Open Any Batch */}
      <div className="mt-8 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/30 via-[#141622] to-pink-950/30 p-6 text-center shadow-xl">
        <BookOpen className="mx-auto mb-2 h-8 w-8 text-pink-400" />
        <h4 className="text-base font-extrabold text-white">
          Har Batch Ke Andar Bhi Real Lecture PDFs Maujood Hain!
        </h4>
        <p className="mt-1 text-xs text-zinc-300 max-w-xl mx-auto">
          Kisi bhi batch ko open karein, apna manpasand subject aur chapter chunein aur har lecture ke sath attach ki gayi official PDF ko ek click me dekhein ya download karein.
        </p>
        <button
          onClick={() => {
            if (batches.length > 0) {
              onOpenBatch(batches[0]);
            }
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:from-pink-500 hover:to-rose-400 active:scale-95"
        >
          <span>Explore Batches</span>
        </button>
      </div>
    </div>
  );
};
