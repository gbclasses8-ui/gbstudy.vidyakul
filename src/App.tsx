import { useEffect, useState, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { BatchCard } from './components/BatchCard.tsx';
import { BatchDetail } from './components/BatchDetail.tsx';
import { VideoPlayer } from './components/VideoPlayer.tsx';
import { PDFModal } from './components/PDFModal.tsx';
import { TelegramModal } from './components/TelegramModal.tsx';
import { NotesSection } from './components/NotesSection.tsx';
import { LecturesHub } from './components/LecturesHub.tsx';
import { SavedSection } from './components/SavedSection.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { Footer } from './components/Footer.tsx';
import { Batch, Lecture, PDFItem } from './types.ts';
import { BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'batches' | 'lectures' | 'notes' | 'saved'>('batches');

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<Lecture[]>([]);
  const [activePDF, setActivePDF] = useState<PDFItem | null>(null);

  // Telegram modal state: open automatically on first visit
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);

  // Saved/Bookmarked Batches in LocalStorage
  const [savedBatchIds, setSavedBatchIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('gb_study_saved_batches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Open Telegram modal automatically on load
  useEffect(() => {
    const hasSeenTelegram = sessionStorage.getItem('gb_seen_telegram_prompt');
    if (!hasSeenTelegram) {
      // Small timeout for smooth initial load
      const timer = setTimeout(() => {
        setIsTelegramModalOpen(true);
        sessionStorage.setItem('gb_seen_telegram_prompt', 'true');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch all batches from server
  const fetchBatches = () => {
    setLoading(true);
    setError(null);
    fetch('/api/batches')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.status && Array.isArray(data.batches)) {
          setBatches(data.batches);
        } else {
          setError('Failed to load batches list.');
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Could not connect to server. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Bookmark / Save toggle
  const handleToggleSave = (batch: Batch) => {
    setSavedBatchIds((prev) => {
      let updated: string[];
      if (prev.includes(batch.id)) {
        updated = prev.filter((id) => id !== batch.id);
      } else {
        updated = [...prev, batch.id];
      }
      try {
        localStorage.setItem('gb_study_saved_batches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Filtered batches
  const filteredBatches = useMemo(() => {
    let result = [...batches];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === '12th') {
        result = result.filter((b) => /12|12th|१२|12वीं/i.test(b.name || ''));
      } else if (selectedCategory === '10th') {
        result = result.filter((b) => /10|10th|१०|10वीं/i.test(b.name || ''));
      } else if (selectedCategory === '11th') {
        result = result.filter((b) => /11|11th|११|11वीं/i.test(b.name || ''));
      } else if (selectedCategory === '9th') {
        result = result.filter((b) => /9|9th|९|9वीं/i.test(b.name || ''));
      } else if (selectedCategory === 'kunji') {
        result = result.filter((b) => /kunji|कुंजी|unsolved/i.test(b.name || ''));
      } else if (selectedCategory === 'hunkaar') {
        result = result.filter((b) => /hunkaar|हुंकार/i.test(b.name || ''));
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.slug && b.slug.toLowerCase().includes(q)) ||
          (b.by_name && b.by_name.toLowerCase().includes(q))
      );
    }

    // Deduplicate batches by unique id
    const seen = new Set<string>();
    result = result.filter((b) => {
      if (!b || !b.id || seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });

    return result;
  }, [batches, selectedCategory, searchQuery]);

  // Saved Batches list with deduplication
  const savedBatchesList = useMemo(() => {
    const seen = new Set<string>();
    return batches.filter((b) => {
      if (!b || !b.id || !savedBatchIds.includes(b.id) || seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [batches, savedBatchIds]);

  const handleOpenBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setSelectedBatch(null);
    setActiveTab('batches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPDF = (pdf: PDFItem) => {
    if (!pdf || !pdf.pdf_url) return;
    const targetUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdf.pdf_url)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (selectedBatch) {
            setSelectedBatch(null);
          }
          if (activeTab !== 'batches') {
            setActiveTab('batches');
          }
        }}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedBatch(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedBatchIds.length}
        onOpenTelegram={() => setIsTelegramModalOpen(true)}
        onGoHome={handleGoHome}
        canGoBack={!!selectedBatch}
        onBack={() => setSelectedBatch(null)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {selectedBatch ? (
          /* Batch Details View */
          <BatchDetail
            batch={selectedBatch}
            onBack={() => setSelectedBatch(null)}
            onSelectLecture={(lec, playlist) => {
              setActiveLecture(lec);
              setActivePlaylist(playlist || []);
            }}
            onSelectPDF={handleOpenPDF}
            isSaved={savedBatchIds.includes(selectedBatch.id)}
            onToggleSave={handleToggleSave}
          />
        ) : activeTab === 'lectures' ? (
          /* All Lectures Hub */
          <LecturesHub
            batches={batches}
            onSelectLecture={(lec, playlist) => {
              setActiveLecture(lec);
              setActivePlaylist(playlist || []);
            }}
            onSelectPDF={handleOpenPDF}
            onOpenBatch={handleOpenBatch}
          />
        ) : activeTab === 'notes' ? (
          /* Notes Hub */
          <NotesSection
            batches={batches}
            onOpenBatch={handleOpenBatch}
            onOpenPDF={handleOpenPDF}
          />
        ) : activeTab === 'saved' ? (
          /* Saved Batches Hub */
          <SavedSection
            savedBatches={savedBatchesList}
            onOpenBatch={handleOpenBatch}
            onRemoveSaved={(id) => handleToggleSave({ id, name: '' } as Batch)}
            onBrowseAll={() => setActiveTab('batches')}
          />
        ) : (
          /* Home / Batches List */
          <div>
            <Hero
              totalBatches={batches.length || 114}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenTelegram={() => setIsTelegramModalOpen(true)}
              onExploreLectures={() => setActiveTab('lectures')}
            />

            {/* Batches Grid Container */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
              {/* Grid Header */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Explore All Study Batches'}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                  <span className="tabular-nums text-pink-400 font-bold">
                    {filteredBatches.length}
                  </span>{' '}
                  batches available
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-2xl border border-pink-950/40 bg-[#12141c] p-4 shadow-lg animate-pulse"
                    >
                      <div className="aspect-video w-full rounded-xl bg-zinc-800/60" />
                      <div className="mt-4 h-4 w-3/4 rounded bg-zinc-800/60" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-zinc-800/40" />
                      <div className="mt-4 h-10 w-full rounded-xl bg-pink-950/40" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center text-red-200">
                  <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-400" />
                  <p className="text-sm font-bold">{error}</p>
                  <button
                    onClick={fetchBatches}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-pink-500"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Retry Loading</span>
                  </button>
                </div>
              ) : filteredBatches.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBatches.map((batch, idx) => (
                    <BatchCard
                      key={`batch-${batch.id}-${idx}`}
                      batch={batch}
                      isSaved={savedBatchIds.includes(batch.id)}
                      onToggleSave={handleToggleSave}
                      onOpenBatch={handleOpenBatch}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-pink-950/40 bg-[#10121a] p-12 text-center">
                  <BookOpen className="mx-auto mb-3 h-10 w-10 text-pink-500/50" />
                  <h3 className="text-base font-bold text-white">No Batches Found</h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Try searching for another keyword or selecting "All Batches".
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-pink-500 active:scale-95"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenTelegram={() => setIsTelegramModalOpen(true)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedBatch(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedBatch(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedBatchIds.length}
        onOpenTelegram={() => setIsTelegramModalOpen(true)}
      />

      {/* Telegram Channel Popup Modal */}
      <TelegramModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      {/* Video Player Modal */}
      {activeLecture && (
        <VideoPlayer
          lecture={activeLecture}
          playlist={activePlaylist}
          onSelectLecture={(lec) => setActiveLecture(lec)}
          onClose={() => setActiveLecture(null)}
          onOpenPDF={handleOpenPDF}
        />
      )}

      {/* PDF / Notes Viewer Modal */}
      {activePDF && (
        <PDFModal
          pdf={activePDF}
          onClose={() => setActivePDF(null)}
        />
      )}
    </div>
  );
}
