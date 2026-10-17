import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Play,
  FileText,
  Clock,
  Calendar,
  Layers,
  BookOpen,
  Sparkles,
  Search,
  Bookmark,
  Share2,
} from 'lucide-react';
import { Batch, Subject, Chapter, Lecture, PDFItem } from '../types.ts';

interface BatchDetailProps {
  batch: Batch;
  onBack: () => void;
  onSelectLecture: (lecture: Lecture, playlist?: Lecture[]) => void;
  onSelectPDF: (pdf: PDFItem) => void;
  isSaved: boolean;
  onToggleSave: (batch: Batch) => void;
}

export const BatchDetail: React.FC<BatchDetailProps> = ({
  batch,
  onBack,
  onSelectLecture,
  onSelectPDF,
  isSaved,
  onToggleSave,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [lectureSearch, setLectureSearch] = useState<string>('');

  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(false);
  const [loadingLectures, setLoadingLectures] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'lectures' | 'notes'>('lectures');
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Fetch subjects for this batch
  useEffect(() => {
    let isMounted = true;
    setLoadingSubjects(true);

    fetch(`/api/subjects?batch_id=${encodeURIComponent(batch.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.status && Array.isArray(data.subjects) && data.subjects.length > 0) {
          setSubjects(data.subjects);
          setSelectedSubject(data.subjects[0]);
        } else {
          // Fallback single-subject container so chapters and lectures can still load
          const fallbackSub = {
            subject_id: batch.id,
            subject_name: 'General Syllabus / Sabhi Vishay',
          };
          setSubjects([fallbackSub]);
          setSelectedSubject(fallbackSub);
        }
      })
      .catch((err) => {
        console.error('Error fetching subjects:', err);
        const fallbackSub = {
          subject_id: batch.id,
          subject_name: 'General Syllabus / Sabhi Vishay',
        };
        setSubjects([fallbackSub]);
        setSelectedSubject(fallbackSub);
      })
      .finally(() => {
        if (isMounted) setLoadingSubjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, [batch.id]);

  // Fetch chapters when selectedSubject changes
  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setSelectedChapter(null);
      return;
    }

    let isMounted = true;
    setLoadingChapters(true);

    fetch(
      `/api/chapters?batch_id=${encodeURIComponent(batch.id)}&subject_id=${encodeURIComponent(
        selectedSubject.subject_id
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.status && Array.isArray(data.chapters) && data.chapters.length > 0) {
          setChapters(data.chapters);
          setSelectedChapter(data.chapters[0]);
        } else {
          setChapters([]);
          setSelectedChapter(null);
        }
      })
      .catch((err) => console.error('Error fetching chapters:', err))
      .finally(() => {
        if (isMounted) setLoadingChapters(false);
      });

    return () => {
      isMounted = false;
    };
  }, [batch.id, selectedSubject]);

  // Fetch lectures when selectedChapter changes
  useEffect(() => {
    if (!selectedSubject || !selectedChapter) {
      setLectures([]);
      return;
    }

    let isMounted = true;
    setLoadingLectures(true);

    fetch(
      `/api/lectures?batch_id=${encodeURIComponent(batch.id)}&subject_id=${encodeURIComponent(
        selectedSubject.subject_id
      )}&chapter_id=${encodeURIComponent(selectedChapter.chapter_id)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.status && Array.isArray(data.lectures)) {
          setLectures(data.lectures);
        } else {
          setLectures([]);
        }
      })
      .catch((err) => console.error('Error fetching lectures:', err))
      .finally(() => {
        if (isMounted) setLoadingLectures(false);
      });

    return () => {
      isMounted = false;
    };
  }, [batch.id, selectedSubject, selectedChapter]);

  // Filter lectures based on search query
  const filteredLectures = lectures.filter((lec) => {
    if (!lectureSearch) return true;
    return lec.lecture_title.toLowerCase().includes(lectureSearch.toLowerCase());
  });

  // Extract all available PDFs across lectures
  const allPDFs: PDFItem[] = [];
  lectures.forEach((lec) => {
    if (lec.pdfs && Array.isArray(lec.pdfs)) {
      lec.pdfs.forEach((p) => {
        allPDFs.push(p);
      });
    }
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${batch.name} - GB STUDY`,
        text: `Study ${batch.name} completely free on GB STUDY!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} mins`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-xl border border-pink-500/30 bg-pink-950/20 px-3.5 py-2 text-xs font-bold text-pink-300 transition hover:bg-pink-500/20 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          <span>Back to All Batches</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(batch)}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
              isSaved
                ? 'border-pink-500 bg-pink-500/20 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'border-pink-500/30 bg-[#12141c] text-zinc-300 hover:text-pink-300'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-pink-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Batch'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-[#12141c] px-3.5 py-2 text-xs font-bold text-zinc-300 transition hover:text-pink-300"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Batch Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-pink-950/60 bg-[#10121a] p-5 shadow-2xl sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-600/15 blur-3xl"></div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl border border-pink-500/30 shadow-xl md:w-80">
            <img
              src={batch.previewImage || 'https://i.ibb.co/0R7qc34v/1093.jpg'}
              alt={batch.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute left-3 top-3 rounded-full border border-pink-400/50 bg-pink-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-pink-300 backdrop-blur-md">
              100% FREE
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-pink-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-pink-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>GB STUDY VERIFIED BATCH</span>
              </span>
              <span className="text-xs text-zinc-400">Full Course Access</span>
            </div>

            <h1 className="text-xl font-extrabold text-white sm:text-2xl md:text-3xl">
              {batch.name}
            </h1>

            <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">
              Complete chapterwise live recordings, structured video lectures, and official study notes PDF prepared for board exams & competitive readiness.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-zinc-400">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-pink-400" />
                <span>{subjects.length} Subjects Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-pink-400" />
                <span>Lifetime Free Validity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Subjects & Lectures */}
      <div className="space-y-6">
        {/* Subjects Selector */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <Layers className="h-4 w-4 text-pink-500" />
              <span>Select Subject</span>
            </h2>
            <span className="text-xs text-zinc-400">
              {subjects.length} Subjects
            </span>
          </div>

          {loadingSubjects ? (
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 w-44 shrink-0 animate-pulse rounded-2xl border border-pink-950/40 bg-[#141620]"
                />
              ))}
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {subjects.map((sub, sIdx) => {
                const isSelected = selectedSubject?.subject_id === sub.subject_id;
                return (
                  <button
                    key={`sub-${sub.subject_id || sIdx}-${sIdx}`}
                    onClick={() => setSelectedSubject(sub)}
                    className={`group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-3.5 text-center transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'border-pink-500 bg-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.35)]'
                        : 'border-pink-950/40 bg-[#12141c] hover:border-pink-500/40 hover:bg-[#161924]'
                    }`}
                  >
                    {sub.image ? (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-pink-950/40 p-1">
                        <img
                          src={sub.image}
                          alt={sub.subject_name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    )}
                    <span
                      className={`text-xs font-bold transition ${
                        isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                      }`}
                    >
                      {sub.subject_name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-pink-950/40 bg-[#12141c] p-6 text-center text-xs text-zinc-400">
              No subjects listed for this batch yet.
            </div>
          )}
        </div>

        {/* Chapters Strip (Horizontal tabs) */}
        {selectedSubject && (
          <div className="rounded-2xl border border-pink-950/60 bg-[#10121a] p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                Chapters for {selectedSubject.subject_name}
              </span>
              {loadingChapters && (
                <span className="text-[11px] text-zinc-400 animate-pulse">
                  Loading chapters...
                </span>
              )}
            </div>

            {chapters.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {chapters.map((ch, cIdx) => {
                  const isSelected = selectedChapter?.chapter_id === ch.chapter_id;
                  return (
                    <button
                      key={`ch-${ch.chapter_id || cIdx}-${cIdx}`}
                      onClick={() => setSelectedChapter(ch)}
                      className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                        isSelected
                          ? 'border-pink-500 bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]'
                          : 'border-pink-950/60 bg-[#151822] text-zinc-300 hover:border-pink-500/30 hover:text-white'
                      }`}
                    >
                      {ch.chapter_name}
                    </button>
                  );
                })}
              </div>
            ) : !loadingChapters ? (
              <p className="text-xs text-zinc-400">No chapters found for this subject.</p>
            ) : null}
          </div>
        )}

        {/* Tab switch between Lectures & Notes */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-pink-950/60 bg-[#12141c] p-1">
            <button
              onClick={() => setActiveView('lectures')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeView === 'lectures'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Lectures ({filteredLectures.length})</span>
            </button>

            <button
              onClick={() => setActiveView('notes')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeView === 'notes'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Notes & PDFs ({allPDFs.length})</span>
            </button>
          </div>

          {/* Quick Search within chapter */}
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-400" />
            <input
              type="text"
              value={lectureSearch}
              onChange={(e) => setLectureSearch(e.target.value)}
              placeholder="Search lectures..."
              className="w-full rounded-xl border border-pink-500/30 bg-[#12141c] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Lectures View */}
        {activeView === 'lectures' && (
          <div>
            {loadingLectures ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="flex h-24 animate-pulse items-center gap-4 rounded-2xl border border-pink-950/40 bg-[#12141c] p-3"
                  />
                ))}
              </div>
            ) : filteredLectures.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredLectures.map((lec, lIdx) => {
                  const hasPdfs = lec.pdfs && lec.pdfs.length > 0;
                  return (
                    <div
                      key={`lec-${lec.lecture_id || lIdx}-${lIdx}`}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-pink-950/50 bg-[#12141c] p-3.5 shadow-md transition-all duration-200 hover:border-pink-500/40 hover:bg-[#161824]"
                    >
                      {/* Top: Thumbnail & Title */}
                      <div className="space-y-2.5">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                          <img
                            src={lec.image || batch.previewImage || 'https://i.ibb.co/0R7qc34v/1093.jpg'}
                            alt={lec.lecture_title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                          {/* Play overlay button */}
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
                        </div>

                        <div>
                          <h4 className="line-clamp-2 text-xs font-bold leading-snug text-white group-hover:text-pink-300">
                            {lec.lecture_title}
                          </h4>
                          {lec.date_time && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400">
                              <Calendar className="h-3 w-3 text-pink-400" />
                              <span>{lec.date_time}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-pink-950/40">
                        <button
                          onClick={() => onSelectLecture(lec, filteredLectures)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-2 text-xs font-bold text-white shadow-sm transition hover:from-pink-500 hover:to-rose-400 active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5 fill-white" />
                          <span>Watch Lecture</span>
                        </button>

                        {hasPdfs && lec.pdfs && lec.pdfs[0] && (
                          <a
                            href={`/api/pdf-proxy?url=${encodeURIComponent(lec.pdfs[0].pdf_url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Notes PDF directly in external tab"
                            className="flex items-center justify-center rounded-xl border border-pink-500/30 bg-pink-950/20 px-3 py-2 text-xs font-bold text-pink-300 transition hover:bg-pink-500/20 hover:text-white active:scale-95"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline sm:ml-1">PDF</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-pink-950/40 bg-[#12141c] p-8 text-center">
                <BookOpen className="mx-auto mb-2 h-8 w-8 text-pink-500/50" />
                <p className="text-xs font-semibold text-zinc-300">
                  {lectureSearch ? 'No lectures match your search.' : 'No lectures found in this chapter.'}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Select another chapter or subject above to explore available lectures.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes View */}
        {activeView === 'notes' && (
          <div className="space-y-3">
            {allPDFs.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {allPDFs.map((pdf, idx) => (
                  <div
                    key={`pdf-item-${pdf.pdf_id || 'note'}-${idx}`}
                    className="flex flex-col justify-between rounded-2xl border border-pink-950/60 bg-[#12141c] p-4 transition hover:border-pink-500/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-xs font-bold text-white">
                          {pdf.pdf_title || 'Class Notes'}
                        </h4>
                        {pdf.date && <p className="mt-1 text-[10px] text-zinc-400">{pdf.date}</p>}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <a
                        href={`/api/pdf-proxy?url=${encodeURIComponent(pdf.pdf_url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-pink-600 py-2 text-xs font-bold text-white transition hover:bg-pink-500 active:scale-95"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Open Notes (External)</span>
                      </a>

                      <a
                        href={`/api/pdf-proxy?url=${encodeURIComponent(pdf.pdf_url)}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center rounded-xl border border-pink-500/30 bg-pink-950/30 px-3 py-2 text-xs font-bold text-pink-300 transition hover:bg-pink-500/20 hover:text-white"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-pink-950/40 bg-[#12141c] p-8 text-center text-xs text-zinc-400">
                No PDFs currently listed for the loaded lectures in this chapter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
