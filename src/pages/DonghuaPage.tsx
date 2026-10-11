import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Flame, CheckCircle2, Play } from 'lucide-react';
import { animeApi } from '../api/animeApi';
import { AnimeCard } from '../components/cards/AnimeCard';
import { SkeletonGrid } from '../components/cards/SkeletonCard';
import { Tabs } from '../components/ui/Tabs';

export const DonghuaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'latest' | 'completed' | 'ongoing'>('latest');

  const { data: homeData, isLoading: isHomeLoading } = useQuery({
    queryKey: ['donghua', 'home'],
    queryFn: animeApi.getDonghuaHome,
  });

  const { data: ongoingData, isLoading: isOngoingLoading } = useQuery({
    queryKey: ['donghua', 'ongoing'],
    queryFn: animeApi.getDonghuaOngoing,
    enabled: activeTab === 'ongoing',
  });

  const latestList = homeData?.latest_release || [];
  const completedList = homeData?.completed_donghua || [];
  const ongoingList = ongoingData || [];

  const currentList =
    activeTab === 'latest'
      ? latestList
      : activeTab === 'completed'
      ? completedList
      : ongoingList;

  const isLoading = activeTab === 'ongoing' ? isOngoingLoading : isHomeLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Chinese Anime Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Donghua Realm (Anichin)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Stream popular 3D and 2D Chinese cultivation and martial arts animation.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'latest', label: 'Latest Releases', icon: <Flame className="w-3.5 h-3.5" /> },
            { id: 'ongoing', label: 'Ongoing', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'latest' | 'completed' | 'ongoing')}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <SkeletonGrid count={12} />
      ) : currentList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {currentList.map((donghua) => (
            <AnimeCard
              key={donghua.slug}
              id={donghua.slug}
              title={donghua.title}
              poster={donghua.poster}
              episodes={donghua.current_episode}
              status={donghua.status}
              type="donghua"
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center text-xs font-mono text-zinc-500">
          No Donghua series found in this category.
        </div>
      )}
    </div>
  );
};

export default DonghuaPage;

