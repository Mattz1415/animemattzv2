import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/ui/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { SchedulePage } from './pages/SchedulePage';
import { OngoingPage } from './pages/OngoingPage';
import { GenrePage } from './pages/GenrePage';
import { AnimeDetailPage } from './pages/AnimeDetailPage';
import { WatchPage } from './pages/WatchPage';
import { DonghuaPage } from './pages/DonghuaPage';
import { ComicHomePage } from './pages/ComicHomePage';
import { ComicDetailPage } from './pages/ComicDetailPage';
import { ComicReadPage } from './pages/ComicReadPage';
import { NsfwPage } from './pages/NsfwPage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';

// Mandatory TanStack Query configuration for Sanka Vollerei rate limit compliance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes cache
      gcTime: 1000 * 60 * 30,    // 30 minutes garbage collection
      refetchOnWindowFocus: false, // Prevent reload spam
      retry: 1,                    // Minimal retry to avoid 429 penalties
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-red-600/30 selection:text-red-300">
          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 lg:pb-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/ongoing" element={<OngoingPage />} />
              <Route path="/genres" element={<GenrePage />} />
              <Route path="/anime/:slug" element={<AnimeDetailPage />} />
              <Route path="/watch/:episodeSlug" element={<WatchPage />} />
              <Route path="/watch/*" element={<WatchPage />} />
              <Route path="/anime/episode/:episodeSlug" element={<WatchPage />} />
              <Route path="/anime/episode/*" element={<WatchPage />} />
              <Route path="/episode/:episodeSlug" element={<WatchPage />} />
              <Route path="/episode/*" element={<WatchPage />} />
              <Route path="/donghua" element={<DonghuaPage />} />
              <Route path="/donghua/:slug" element={<AnimeDetailPage />} />
              <Route path="/comics" element={<ComicHomePage />} />
              <Route path="/comic/:slug" element={<ComicDetailPage />} />
              <Route path="/read/:chapterSlug" element={<ComicReadPage />} />
              <Route path="/read/*" element={<ComicReadPage />} />
              <Route path="/comic/chapter/*" element={<ComicReadPage />} />
              <Route path="/nsfw" element={<NsfwPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
          <MobileNav />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
