import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Tv, ChevronRight, Play, Zap } from 'lucide-react';
import { animeApi } from '../api/animeApi';
import { ScheduleItem } from '../types/anime';
import { Tabs } from '../components/ui/Tabs';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { QuickStreamModal } from '../components/modals/QuickStreamModal';
import { useCyberSound } from '../hooks/useCyberSound';

export const SchedulePage: React.FC = () => {
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['anime', 'schedule'],
    queryFn: animeApi.getSchedule,
  });

  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [quickStreamId, setQuickStreamId] = useState<string | null>(null);
  const [quickStreamTitle, setQuickStreamTitle] = useState<string>('');
  const { playBlip } = useCyberSound();

  const scheduleDays: ScheduleItem[] = Array.isArray(scheduleData)
    ? scheduleData
    : Object.values(scheduleData || {});

  const currentDay = scheduleDays[activeDayIndex] || scheduleDays[0];

  const tabItems = scheduleDays.map((item, index) => ({
    id: index.toString(),
    label: item.day,
    count: item.animeList?.length,
  }));

  const handleTabChange = (id: string) => {
    playBlip('switch');
    setActiveDayIndex(parseInt(id, 10));
  };

  const handleQuickStream = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    playBlip('click');
    setQuickStreamId(id);
    setQuickStreamTitle(title);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest">
            <Calendar className="w-4 h-4" />
            <span>Broadcast Schedule Nexus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Weekly Broadcast Calendar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Real-time broadcast tracking from Monday to Sunday synchronized with live fansub streams.
          </p>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-xs font-mono text-zinc-500 animate-pulse">
            FETCHING BROADCAST SCHEDULE...
          </div>
        ) : scheduleDays.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-zinc-500">
            No schedule data currently available.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Day of Week Tabs */}
            <Tabs
              tabs={tabItems}
              activeTab={activeDayIndex.toString()}
              onChange={handleTabChange}
            />

            {/* Schedule List for the Active Day */}
            {currentDay && (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-900 gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-base font-bold text-zinc-100 font-mono uppercase tracking-wide">
                      {currentDay.day} Airings ({currentDay.animeList?.length || 0} Titles)
                    </h2>
                  </div>

                  <CountdownTimer releaseDay={currentDay.day} />
                </div>

                {currentDay.animeList && currentDay.animeList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentDay.animeList.map((anime, idx) => {
                      const cleanId =
                        anime.animeId ||
                        anime.slug ||
                        (anime.href ? anime.href.replace(/^\/anime\/anime\//, '').replace(/^\/anime\//, '') : '');

                      return (
                        <div
                          key={idx}
                          className="group relative flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/70 hover:border-red-600/60 transition-all duration-200"
                        >
                          <Link
                            to={`/anime/${cleanId}`}
                            onClick={() => playBlip('click')}
                            className="flex items-center gap-3 min-w-0 flex-1"
                          >
                            {anime.poster ? (
                              <div className="w-11 h-14 rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 border border-zinc-800 group-hover:border-red-500/60">
                                <img
                                  src={anime.poster}
                                  alt={anime.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center flex-shrink-0 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </div>
                            )}

                            <div className="flex flex-col truncate pr-2">
                              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
                                {anime.title}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {currentDay.day} Broadcast
                              </span>
                            </div>
                          </Link>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => handleQuickStream(e, cleanId, anime.title)}
                              title="Quick Stream"
                              className="p-1.5 rounded-lg bg-zinc-950/80 hover:bg-amber-950 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={`/anime/${cleanId}`}
                              className="p-1.5 text-zinc-600 group-hover:text-red-400"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs font-mono text-zinc-500">
                    No anime scheduled for {currentDay.day}.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <QuickStreamModal
        animeId={quickStreamId}
        animeTitle={quickStreamTitle}
        onClose={() => setQuickStreamId(null)}
      />
    </>
  );
};

export default SchedulePage;
