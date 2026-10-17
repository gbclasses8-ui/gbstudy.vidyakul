import React, { useEffect, useState } from 'react';
import { Play, FileText, Search, Sparkles, BookOpen, Clock, Calendar } from 'lucide-react';
import { Lecture, PDFItem, Batch } from '../types.ts';

interface LecturesHubProps {
  batches: Batch[];
  onSelectLecture: (lecture: Lecture, playlist?: Lecture[]) => void;
  onSelectPDF: (pdf: PDFItem) => void;
  onOpenBatch: (batch: Batch) => void;
}

export const LecturesHub: React.FC<LecturesHubProps> = ({
  batches,
  onSelectLecture,
  onSelectPDF,
  onOpenBatch,
}) => {
  const [lectures, setLectures] = useState<(Lecture & { batchName: string; batchId: string; subjectName: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const subjectsList = [
    { id: 'all', label: 'All Subjects' },
    { id: 'physics', label: 'Physics (भौतिक)' },
    { id: 'chemistry', label: 'Chemistry (रसायन)' },
    { id: 'math', label: 'Maths (गणित)' },
    { id: 'biology', label: 'Biology (जीव विज्ञान)' },
    { id: 'hindi', label: 'Hindi (हिंदी)' },
    { id: 'english', label: 'English (अंग्रेज़ी)' },
  ];

  // Fetch real lectures from key popular batches on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // List of key batches to pre-populate hub with real lectures
    const targetBatches = [
      { id: '12-batch-2026HYCXiMxSis', name: 'कक्षा 12वीं हुंकार Batch 2026', subjectId: '12-batch-2026-2091', subjectName: 'भौतिक विज्ञान' },
      { id: '12-batch-2026HYCXiMxSis', name: 'कक्षा 12वीं हुंकार Batch 2026', subjectId: '12-batch-2026-2089', subjectName: 'रसायन विज्ञान' },
      { id: '12-batch-2026HYCXiMxSis', name: 'कक्षा 12वीं हुंकार Batch 2026', subjectId: '12-batch-2026', subjectName: 'हिंदी' },
      { id: '12-unsolved-kunji-2025PmkRRLfsUr', name: 'कक्षा 12वीं Unsolved Kunji 2025', subjectId: '12-unsolved-kunji-2025-2241', subjectName: 'रसायन विज्ञान' },
      { id: '12-unsolved-kunji-2025PmkRRLfsUr', name: 'कक्षा 12वीं Unsolved Kunji 2025', subjectId: '12-unsolved-kunji-2025-2242', subjectName: 'गणित' },
      { id: '10-unsolved-kunji-2025qG5f5zltLp', name: 'कक्षा 10वीं Unsolved Kunji 2025', subjectId: '10-unsolved-kunji-2025-2251', subjectName: 'विज्ञान' },
    ];

    Promise.all(
      targetBatches.map(async (tb) => {
        try {
          const res = await fetch(
            `/api/lectures?batch_id=${encodeURIComponent(tb.id)}&subject_id=${encodeURIComponent(
              tb.subjectId
            )}&chapter_id=All%20Chapters`
          );
          if (!res.ok) return [];
          const data = await res.json();
          if (data && Array.isArray(data.lectures)) {
            return data.lectures.map((lec: any) => ({
              ...lec,
              batchName: tb.name,
              batchId: tb.id,
              subjectName: tb.subjectName,
            }));
          }
          return [];
        } catch {
          return [];
        }
      })
    ).then((results) => {
      if (!isMounted) return;
      const combined = results.flat();
      setLectures(combined);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter lectures
  const filteredLectures = lectures.filter((lec) => {
    // Subject filter
    if (selectedSubject !== 'all') {
      const sub = (lec.subjectName || '').toLowerCase();
      const title = (lec.lecture_title || '').toLowerCase();
      if (selectedSubject === 'physics' && !/भौतिक|physics/i.test(sub + title)) return false;
      if (selectedSubject === 'chemistry' && !/रसायन|chemistry/i.test(sub + title)) return false;
      if (selectedSubject === 'math' && !/गणित|math/i.test(sub + title)) return false;
      if (selectedSubject === 'biology' && !/जीव|biology/i.test(sub + title)) return false;
      if (selectedSubject === 'hindi' && !/हिंदी|hindi|संधि/i.test(sub + title)) return false;
      if (selectedSubject === 'english' && !/अंग्रेज़ी|english/i.test(sub + title)) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        lec.lecture_title.toLowerCase().includes(q) ||
        lec.batchName.toLowerCase().includes(q) ||
        lec.subjectName.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-950/30 px-3 py-1 text-xs font-bold text-pink-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>GB STUDY REAL LECTURES DIRECTORY</span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Live Recordings & Chapterwise Lectures
          </h2>
          <p className="mt-1 text-xs text-zinc-300 sm:text-sm">
            Sabhi real lectures ek jagah — seedha play karein, speed control karein aur attach notes dekhein.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lectures by topic, chapter..."
            className="w-full rounded-xl border border-pink-500/40 bg-[#12141c] py-2 pl-10 pr-4 text-xs font-semibold text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {subjectsList.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                isSelected
                  ? 'border-pink-500 bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                  : 'border-pink-950/60 bg-[#12141c] text-zinc-300 hover:border-pink-500/30 hover:text-white'
              }`}
            >
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Lectures */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-48 animate-pulse rounded-2xl border border-pink-950/40 bg-[#12141c] p-4"
            />
          ))}
        </div>
      ) : filteredLectures.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLectures.map((lec, idx) => {
            const hasPdfs = lec.pdfs && lec.pdfs.length > 0;
            const parentBatch = batches.find((b) => b.id === lec.batchId);

            return (
              <div
                key={`hub-lec-${lec.lecture_id || idx}-${idx}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-pink-950/60 bg-[#12141c] p-3.5 shadow-md transition hover:border-pink-500/40 hover:bg-[#161822]"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                    <img
                      src={lec.image || 'https://i.ibb.co/0R7qc34v/1093.jpg'}
                      alt={lec.lecture_title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://i.ibb.co/0R7qc34v/1093.jpg';
                      }}
                    />

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => onSelectLecture(lec, filteredLectures)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-80 transition hover:bg-black/50 hover:opacity-100"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.8)] transition hover:scale-110">
                        <Play className="h-5 w-5 fill-white translate-x-0.5" />
                      </div>
                    </button>

                    {/* Duration badge */}
                    {lec.duration ? (
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold tabular-nums text-pink-300 backdrop-blur-sm">
                        {formatDuration(lec.duration)}
                      </span>
                    ) : null}

                    {/* Subject badge */}
                    <span className="absolute left-2 top-2 rounded-md bg-pink-950/80 border border-pink-500/40 px-2 py-0.5 text-[10px] font-bold text-pink-300 backdrop-blur-md">
                      {lec.subjectName}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div className="mt-3 space-y-1">
                    <h3 className="line-clamp-2 text-xs font-bold leading-tight text-white group-hover:text-pink-300">
                      {lec.lecture_title}
                    </h3>

                    <p className="line-clamp-1 text-[11px] text-zinc-400">
                      From: <span className="text-zinc-300 font-medium">{lec.batchName}</span>
                    </p>

                    {lec.date_time && (
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <Calendar className="h-3 w-3 text-pink-500/60" />
                        <span>{lec.date_time}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 pt-2 border-t border-pink-950/40">
                  <button
                    onClick={() => onSelectLecture(lec, filteredLectures)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-2 text-xs font-bold text-white shadow-sm transition hover:from-pink-500 hover:to-rose-400 active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Watch Now</span>
                  </button>

                  {hasPdfs && lec.pdfs && lec.pdfs[0] && (
                    <a
                      href={`/api/pdf-proxy?url=${encodeURIComponent(lec.pdfs[0].pdf_url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Lecture PDF directly in external tab"
                      className="flex items-center justify-center rounded-xl border border-pink-500/30 bg-pink-950/30 px-3 py-2 text-xs font-bold text-pink-300 transition hover:bg-pink-500/20 hover:text-white active:scale-95"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline sm:ml-1">PDF</span>
                    </a>
                  )}

                  {parentBatch && (
                    <button
                      onClick={() => onOpenBatch(parentBatch)}
                      title="Open full batch syllabus"
                      className="flex items-center justify-center rounded-xl border border-pink-950/80 bg-[#151722] px-2.5 py-2 text-xs text-zinc-400 transition hover:border-pink-500/30 hover:text-pink-300"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-pink-950/40 bg-[#10121a] p-12 text-center text-zinc-400">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-pink-500/40" />
          <p className="text-sm font-semibold text-white">No lectures found for this filter.</p>
          <p className="text-xs text-zinc-400 mt-1">Try resetting the search or selecting "All Subjects".</p>
        </div>
      )}
    </div>
  );
};
