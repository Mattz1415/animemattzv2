import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { comicApi } from '../api/comicApi';
import { ReaderControls, ReaderFilter } from '../components/reader/ReaderControls';
import { ChapterReader } from '../components/reader/ChapterReader';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { ShortcutsModal } from '../components/modals/ShortcutsModal';

export const ComicReadPage: React.FC = () => {
  const { chapterSlug } = useParams<{ chapterSlug: string }>();
  const navigate = useNavigate();
  const [readingMode, setReadingMode] = useState<'cascade' | 'paged'>('cascade');
  const [zoom, setZoom] = useState<number>(100);
  const [filterMode, setFilterMode] = useState<ReaderFilter>('normal');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { addReadingItem } = useReadingHistory();

  // Fetch chapter data
  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ['comic', 'chapter', chapterSlug],
    queryFn: () => comicApi.getChapter(chapterSlug || ''),
    enabled: Boolean(chapterSlug),
  });

  const prevSlug = chapter?.navigation?.prev;
  const nextSlug = chapter?.navigation?.next;

  // Keyboard navigation for chapters (J -> Next, K -> Prev, ? -> Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'j' || e.key === 'J') {
        if (nextSlug) navigate(`/read/${nextSlug}`);
      } else if (e.key === 'k' || e.key === 'K') {
        if (prevSlug) navigate(`/read/${prevSlug}`);
      } else if (e.key === '?') {
        setShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlug, prevSlug, navigate]);

  // Track progress into Reading History
  useEffect(() => {
    if (chapter && chapterSlug) {
      addReadingItem({
        comicSlug: chapter.komikInfo?.slug || chapter.allChapterSlug || chapterSlug,
        comicTitle: chapter.komikInfo?.title || chapter.title,
        chapterSlug,
        chapterTitle: chapter.title,
        image: chapter.thumbnail,
      });
    }
  }, [chapter, chapterSlug, addReadingItem]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-400">UNROLLING CHAPTER PAGES...</span>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-zinc-200">Unable to Load Chapter</h2>
        <p className="text-xs text-zinc-500 font-mono">
          Chapter pages for &quot;{chapterSlug}&quot; could not be retrieved.
        </p>
        <Link
          to="/comics"
          className="inline-block px-4 py-2 text-xs font-mono bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
        >
          Return to Comics
        </Link>
      </div>
    );
  }

  const images = chapter.images || [];

  return (
    <div className="min-h-screen flex flex-col -mx-4 sm:-mx-6 -mt-6">
      {/* Sticky Reader Controls */}
      <ReaderControls
        currentChapterTitle={chapter.title}
        comicTitle={chapter.komikInfo?.title}
        hasPrev={Boolean(prevSlug)}
        hasNext={Boolean(nextSlug)}
        onPrev={() => prevSlug && navigate(`/read/${prevSlug}`)}
        onNext={() => nextSlug && navigate(`/read/${nextSlug}`)}
        readingMode={readingMode}
        onToggleMode={setReadingMode}
        zoom={zoom}
        onZoomChange={setZoom}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        totalPages={images.length}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Main Chapter Canvas */}
      <div className="flex-1 w-full flex flex-col items-center px-2 sm:px-4 py-4">
        <ChapterReader
          images={images}
          readingMode={readingMode}
          zoom={zoom}
          filterMode={filterMode}
          onScrollProgress={(prog) => {
            if (chapterSlug) {
              addReadingItem({
                comicSlug: chapter.komikInfo?.slug || chapterSlug,
                comicTitle: chapter.komikInfo?.title || chapter.title,
                chapterSlug,
                chapterTitle: chapter.title,
                image: chapter.thumbnail,
                scrollProgress: prog,
              });
            }
          }}
          hasPrevChapter={Boolean(prevSlug)}
          hasNextChapter={Boolean(nextSlug)}
          onPrevChapter={() => prevSlug && navigate(`/read/${prevSlug}`)}
          onNextChapter={() => nextSlug && navigate(`/read/${nextSlug}`)}
        />
      </div>

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
};

export default ComicReadPage;
