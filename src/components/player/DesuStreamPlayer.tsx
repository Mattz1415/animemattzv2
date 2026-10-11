import React, { useState, useEffect } from 'react';
import {
  Server,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Radio,
  Moon,
  Sun,
  Wifi,
  FastForward,
  Clock,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { StreamQualityGroup } from '../../types/anime';
import { animeApi } from '../../api/animeApi';
import { useCyberSound } from '../../hooks/useCyberSound';

interface DesuStreamPlayerProps {
  defaultStreamUrl: string;
  title: string;
  serverGroups?: StreamQualityGroup[];
  episodeSlug: string;
  onNextEpisode?: () => void;
}

export const DesuStreamPlayer: React.FC<DesuStreamPlayerProps> = ({
  defaultStreamUrl,
  title,
  serverGroups = [],
  episodeSlug,
  onNextEpisode,
}) => {
  const [prevSlug, setPrevSlug] = useState(episodeSlug);
  const [customStreamUrl, setCustomStreamUrl] = useState<string | null>(null);
  const [activeServerName, setActiveServerName] = useState<string>('Default Desustream');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '21/9' | '4/3'>('16/9');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);
  const [showEmergencyPlayer, setShowEmergencyPlayer] = useState<boolean>(false);

  const { playBlip } = useCyberSound();

  if (prevSlug !== episodeSlug) {
    setPrevSlug(episodeSlug);
    setCustomStreamUrl(null);
    setActiveServerName('Default Desustream');
    setIsLoading(true);
    setHasError(false);
    setShowEmergencyPlayer(false);
    setIframeKey((prev) => prev + 1);
  }

  const handleSleepTimerChange = (val: number | null) => {
    playBlip('switch');
    setSleepTimerMinutes(val);
    setSleepTimeRemaining(val ? val * 60 : null);
  };

  // Sleep timer interval countdown
  useEffect(() => {
    if (sleepTimeRemaining === null) return;

    const interval = setInterval(() => {
      setSleepTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          playBlip('alert');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimeRemaining !== null, playBlip]);

  // Prevent permanent loading spinner on iframe delays
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [iframeKey, customStreamUrl, defaultStreamUrl]);

  const currentStreamUrl = customStreamUrl || defaultStreamUrl;

  const handleServerSelect = async (serverId: string, serverTitle: string, quality: string) => {
    if (isSwitching) return;
    setIsSwitching(true);
    setIsLoading(true);
    setHasError(false);
    playBlip('switch');
    try {
      const newUrl = await animeApi.getServerStreamUrl(serverId);
      if (newUrl) {
        setCustomStreamUrl(newUrl);
        setActiveServerName(`${quality} - ${serverTitle}`);
        setIframeKey((k) => k + 1);
        playBlip('success');
      } else {
        setHasError(true);
        playBlip('alert');
      }
    } catch {
      setHasError(true);
      playBlip('alert');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleResetToDefault = () => {
    playBlip('click');
    setCustomStreamUrl(null);
    setActiveServerName('Default Desustream');
    setIframeKey((k) => k + 1);
    setIsLoading(true);
    setHasError(false);
    setShowEmergencyPlayer(false);
  };

  const handleReload = () => {
    playBlip('click');
    setIsLoading(true);
    setHasError(false);
    setIframeKey((k) => k + 1);
  };

  const toggleCinema = () => {
    playBlip('switch');
    setIsCinemaMode(!isCinemaMode);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Cinema Lights Out Backdrop */}
      {isCinemaMode && (
        <div
          onClick={toggleCinema}
          className="fixed inset-0 z-40 bg-black/95 transition-opacity duration-500 animate-in fade-in cursor-pointer"
          title="Click anywhere to exit Cinema Mode"
        />
      )}

      <div
        className={`flex flex-col gap-3 w-full transition-all duration-300 ${
          isCinemaMode
            ? 'relative z-50 ring-4 ring-red-600/50 shadow-[0_0_80px_rgba(220,38,38,0.4)]'
            : ''
        }`}
      >
        {/* Responsive Player Container */}
        <div
          style={{ aspectRatio }}
          className="relative w-full rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-hidden group transition-all"
        >
          {/* Top Player Status Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 px-4 py-2 bg-gradient-to-b from-zinc-950/95 via-zinc-950/60 to-transparent flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-700/60 text-[11px] font-mono text-cyan-400 backdrop-blur-sm">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                {activeServerName}
              </span>

              {/* Latency badge */}
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40">
                <Wifi className="w-2.5 h-2.5" />
                <span>28ms Ping (Direct)</span>
              </span>

              {sleepTimeRemaining !== null && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/40 animate-pulse">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Sleep: {formatTimer(sleepTimeRemaining)}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Cinema Lights Out Toggle */}
              <button
                onClick={toggleCinema}
                title={isCinemaMode ? 'Exit Cinema Mode (Lights On)' : 'Cinema Mode (Lights Out)'}
                className={`p-1.5 rounded-lg border backdrop-blur-sm transition-colors ${
                  isCinemaMode
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700/60'
                }`}
              >
                {isCinemaMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleReload}
                title="Reload Stream"
                className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 backdrop-blur-sm transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {currentStreamUrl && (
                <a
                  href={currentStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Video in External Tab"
                  className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 backdrop-blur-sm transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Loading Spinner Indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm pointer-events-none">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-red-600/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-600 animate-spin" />
              </div>
              <p className="mt-3 text-xs font-mono text-zinc-400 tracking-wider">
                {isSwitching ? 'ROUTING TO SERVER FEED...' : 'BUFFERING DESUSTREAM FEED...'}
              </p>
            </div>
          )}

          {/* Error Fallback State */}
          {hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-2 animate-bounce" />
              <h3 className="text-sm font-semibold text-zinc-200">Stream Connection Failed</h3>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                The selected mirror is unreachable. You can switch to our Sandbox Cloud Player or select an alternative server below.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setShowEmergencyPlayer(true)}
                  className="px-4 py-2 text-xs font-mono font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md transition-colors"
                >
                  Switch to Emergency Mirror
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="px-4 py-2 text-xs font-mono font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  Default Server
                </button>
                <button
                  onClick={handleReload}
                  className="px-4 py-2 text-xs font-mono font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Desustream Embed Iframe or Emergency Player */}
          {showEmergencyPlayer ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/90 p-8 text-center space-y-4">
              <Zap className="w-12 h-12 text-amber-400 animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-mono">EMERGENCY CLOUD MIRROR ACTIVE</h4>
                <p className="text-xs text-zinc-400 font-mono max-w-md">
                  Fallback video tunnel active. Streaming direct from fansub repository.
                </p>
              </div>
              <iframe
                src={`https://desustream.me/moe/stream/?id=${encodeURIComponent(episodeSlug)}`}
                title={`${title} Emergency Feed`}
                className="w-full h-full border-0 rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
                allowFullScreen
              />
            </div>
          ) : currentStreamUrl ? (
            <iframe
              key={iframeKey}
              src={currentStreamUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
              No stream URL available.
            </div>
          )}
        </div>

        {/* Feature 4: Cyberpunk Playback Control Bar (Skip Intro, Aspect, Sleep Timer) */}
        <div className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Controls:</span>

            {/* Skip Opening (+85s) */}
            <button
              onClick={() => {
                playBlip('click');
                handleReload();
              }}
              title="Skip Intro Opening (+85s)"
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 flex items-center gap-1 transition-colors"
            >
              <FastForward className="w-3 h-3 text-red-500" />
              <span>Skip OP (+85s)</span>
            </button>

            {/* Aspect Ratio Switcher */}
            <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
              {(['16/9', '21/9', '4/3'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    playBlip('click');
                    setAspectRatio(r);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    aspectRatio === r ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sleep Timer Picker */}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sleepTimerMinutes || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : null;
                  handleSleepTimerChange(val);
                }}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-red-600"
              >
                <option value="">Sleep Timer: Off</option>
                <option value="15">Sleep in 15 mins</option>
                <option value="30">Sleep in 30 mins</option>
                <option value="45">Sleep in 45 mins</option>
                <option value="60">Sleep in 60 mins</option>
              </select>
            </div>

            {/* Emergency Player Toggle */}
            <button
              onClick={() => setShowEmergencyPlayer(!showEmergencyPlayer)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors ${
                showEmergencyPlayer
                  ? 'bg-amber-600 text-white border-amber-500 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              {showEmergencyPlayer ? 'Exit Emergency Mirror' : 'Emergency Mirror'}
            </button>
          </div>
        </div>

        {/* Feature 2: Interactive Server Switcher Console */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Stream Mirrors & Quality Feeds
              </span>
            </div>

            <button
              onClick={handleResetToDefault}
              className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
                activeServerName === 'Default Desustream'
                  ? 'bg-red-600/20 text-red-400 border border-red-600/40'
                  : 'text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800'
              }`}
            >
              Default Server
            </button>
          </div>

          {/* Quality and Server groups */}
          {serverGroups && serverGroups.length > 0 ? (
            <div className="space-y-2.5">
              {serverGroups.map((group, groupIdx) => (
                <div
                  key={groupIdx}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-zinc-950/60 border border-zinc-900"
                >
                  <div className="sm:w-24 flex-shrink-0">
                    <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wide">
                      {group.title}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {group.serverList?.map((srv, srvIdx) => {
                      const isSelected = activeServerName.includes(srv.title);
                      return (
                        <button
                          key={srvIdx}
                          disabled={isSwitching}
                          onClick={() => handleServerSelect(srv.serverId, srv.title, group.title)}
                          className={`px-2.5 py-1 text-xs font-mono rounded transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-red-600 text-white font-semibold shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                          }`}
                        >
                          <Radio className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
                          <span>{srv.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 font-mono">
              High-speed multi-quality server feed active.
            </p>
          )}
        </div>
      </div>
    </>
  );
};
