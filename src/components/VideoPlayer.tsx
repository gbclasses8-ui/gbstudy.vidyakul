import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  X,
  FileText,
  AlertCircle,
  ExternalLink,
  SkipBack,
  SkipForward,
  ListVideo,
} from 'lucide-react';
import { Lecture, PDFItem } from '../types.ts';

interface VideoPlayerProps {
  lecture: Lecture;
  playlist?: Lecture[];
  onSelectLecture?: (lec: Lecture) => void;
  onClose: () => void;
  onOpenPDF?: (pdf: PDFItem) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lecture,
  playlist = [],
  onSelectLecture,
  onClose,
  onOpenPDF,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(lecture.duration || 0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const [qualityLevels, setQualityLevels] = useState<{ id: number; height: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Determine current lecture index in playlist
  const currentIndex = playlist.findIndex((l) => l.lecture_id === lecture.lecture_id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < playlist.length - 1;

  // Stream source
  const streamUrl = lecture.stream_url || lecture.video_url || (lecture.video_urls && lecture.video_urls[0]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setLoading(false);
        const levels = data.levels.map((lvl, index) => ({
          id: index,
          height: lvl.height,
        }));
        setQualityLevels(levels);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg('Video stream could not be loaded directly. You can try opening the external link.');
              setLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
      });
    } else {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, lecture.lecture_id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration || isNaN(duration)) {
        setDuration(videoRef.current.duration || 0);
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch((e) => console.log('Autoplay prevented', e));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const playPrev = () => {
    if (hasPrev && onSelectLecture) {
      onSelectLecture(playlist[currentIndex - 1]);
    }
  };

  const playNext = () => {
    if (hasNext && onSelectLecture) {
      onSelectLecture(playlist[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipTime(10);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md animate-in fade-in">
      <div
        ref={containerRef}
        onMouseMove={() => setShowControls(true)}
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-pink-500/40 bg-[#0c0d14] shadow-[0_0_60px_-10px_rgba(236,72,153,0.4)]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-pink-950/40 bg-[#12141e]/90 px-4 py-3">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <span className="rounded bg-pink-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-pink-400">
              GB VIDEO
            </span>
            <h3 className="truncate text-sm font-bold text-white">
              {lecture.lecture_title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {playlist.length > 0 && (
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  showPlaylist
                    ? 'border-pink-500 bg-pink-600 text-white shadow-md'
                    : 'border-pink-500/30 bg-pink-950/20 text-pink-300 hover:bg-pink-500/20'
                }`}
              >
                <ListVideo className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Playlist ({playlist.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close player"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-pink-500/30 bg-pink-950/20 text-zinc-300 transition hover:bg-pink-500/30 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Surface Area + Optional Playlist Overlay */}
        <div className="relative aspect-video w-full bg-black">
          {streamUrl ? (
            <video
              ref={videoRef}
              playsInline
              className="h-full w-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setLoading(true)}
              onPlaying={() => setLoading(false)}
              onClick={togglePlay}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-zinc-400">
              <AlertCircle className="mb-2 h-10 w-10 text-pink-500" />
              <p className="text-sm font-medium text-white">No video stream link is available for this lecture.</p>
              <p className="text-xs text-zinc-400 mt-1">Check the notes or other lectures in this batch.</p>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-pink-500 border-t-transparent shadow-[0_0_15px_rgba(236,72,153,0.8)]"></div>
                <span className="text-xs font-semibold tracking-wider text-pink-300">GB STREAM LOADING...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-pink-500" />
              <p className="max-w-md text-sm text-zinc-200">{errorMsg}</p>
              {lecture.stream_url && (
                <a
                  href={lecture.stream_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-pink-500"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Video in External Player</span>
                </a>
              )}
            </div>
          )}

          {/* Center Play Button Overlay when paused */}
          {!isPlaying && !loading && !errorMsg && streamUrl && (
            <button
              onClick={togglePlay}
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pink-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.8)] transition hover:scale-110 active:scale-95"
            >
              <Play className="h-7 w-7 fill-white translate-x-0.5" />
            </button>
          )}

          {/* Playlist Drawer Panel */}
          {showPlaylist && playlist.length > 0 && (
            <div className="absolute top-0 right-0 bottom-0 z-40 w-full sm:w-80 bg-[#0e1017]/95 p-3 shadow-2xl backdrop-blur-xl border-l border-pink-500/30 overflow-y-auto">
              <div className="mb-2 flex items-center justify-between border-b border-pink-950/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                  Chapter Lectures ({playlist.length})
                </span>
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                {playlist.map((item, pIdx) => {
                  const isCurrent = item.lecture_id === lecture.lecture_id;
                  return (
                    <button
                      key={`drawer-lec-${item.lecture_id || pIdx}-${pIdx}`}
                      onClick={() => {
                        if (onSelectLecture) {
                          onSelectLecture(item);
                          setShowPlaylist(false);
                        }
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition ${
                        isCurrent
                          ? 'border border-pink-500/50 bg-pink-500/20 text-white'
                          : 'border border-transparent hover:bg-white/5 text-zinc-300'
                      }`}
                    >
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-black">
                        <img
                          src={item.image || 'https://i.ibb.co/0R7qc34v/1093.jpg'}
                          alt={item.lecture_title}
                          className="h-full w-full object-cover"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-pink-600/60">
                            <Play className="h-4 w-4 fill-white text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-semibold leading-tight">
                          {item.lecture_title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Player Controls Bar */}
          {showControls && streamUrl && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 transition-opacity">
              {/* Progress Bar / Scrubber */}
              <div className="group relative mb-2 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700/80 accent-pink-500 transition-all hover:h-2"
                />
              </div>

              {/* Bottom Controls Row */}
              <div className="flex items-center justify-between gap-2">
                {/* Left: Prev, Play/Pause, Next, Rewind, Forward, Time */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {hasPrev && (
                    <button
                      onClick={playPrev}
                      title="Previous Lecture"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
                    >
                      <SkipBack className="h-4 w-4 fill-current" />
                    </button>
                  )}

                  <button
                    onClick={togglePlay}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/10 active:scale-95"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
                  </button>

                  {hasNext && (
                    <button
                      onClick={playNext}
                      title="Next Lecture"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
                    >
                      <SkipForward className="h-4 w-4 fill-current" />
                    </button>
                  )}

                  <button
                    onClick={() => skipTime(-10)}
                    title="Rewind 10s"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => skipTime(10)}
                    title="Forward 10s"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>

                  {/* Volume Slider */}
                  <div className="hidden items-center gap-1 sm:flex">
                    <button
                      onClick={toggleMute}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="h-1 w-16 cursor-pointer appearance-none rounded bg-zinc-600 accent-pink-500"
                    />
                  </div>

                  {/* Time Stamp */}
                  <span className="text-[11px] font-medium tabular-nums text-zinc-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right: Speed, Quality, Fullscreen */}
                <div className="relative flex items-center gap-1.5 sm:gap-2">
                  {/* Speed Selector Button */}
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="flex items-center gap-1 rounded-lg border border-pink-500/30 bg-pink-950/20 px-2 py-1 text-[11px] font-bold text-pink-300 transition hover:bg-pink-500/20"
                  >
                    <Settings className="h-3 w-3" />
                    <span>{playbackRate}x</span>
                  </button>

                  {/* Speed / Quality Menu Dropdown */}
                  {showSpeedMenu && (
                    <div className="absolute bottom-10 right-0 z-50 w-44 rounded-xl border border-pink-500/40 bg-[#161824] p-2 shadow-2xl backdrop-blur-xl">
                      <div className="mb-1 border-b border-pink-950/60 pb-1 text-[10px] font-bold uppercase tracking-wider text-pink-400">
                        Playback Speed
                      </div>
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => changeSpeed(rate)}
                            className={`rounded py-1 text-center text-xs font-semibold ${
                              playbackRate === rate
                                ? 'bg-pink-500 text-white shadow-sm'
                                : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      {qualityLevels.length > 0 && (
                        <>
                          <div className="mb-1 border-b border-pink-950/60 pb-1 text-[10px] font-bold uppercase tracking-wider text-pink-400">
                            Quality
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => changeQuality(-1)}
                              className={`rounded px-2 py-1 text-left text-xs ${
                                currentQuality === -1 ? 'bg-pink-500 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              Auto
                            </button>
                            {qualityLevels.map((lvl) => (
                              <button
                                key={lvl.id}
                                onClick={() => changeQuality(lvl.id)}
                                className={`rounded px-2 py-1 text-left text-xs ${
                                  currentQuality === lvl.id
                                    ? 'bg-pink-500 text-white font-bold'
                                    : 'text-zinc-300 hover:bg-zinc-800'
                                }`}
                              >
                                {lvl.height}p
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Associated PDFs Bar */}
        {lecture.pdfs && lecture.pdfs.length > 0 && (
          <div className="border-t border-pink-950/40 bg-[#0e1017] p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-pink-400">
              <FileText className="h-3.5 w-3.5" />
              <span>Available Lecture Notes / PDF ({lecture.pdfs.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lecture.pdfs.map((pdf, idx) => (
                <a
                  key={`lecture-pdf-${pdf.pdf_id || 'item'}-${idx}`}
                  href={`/api/pdf-proxy?url=${encodeURIComponent(pdf.pdf_url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-pink-500/30 bg-pink-950/30 px-3 py-1.5 text-xs font-semibold text-pink-200 transition hover:bg-pink-500 hover:text-white"
                >
                  <FileText className="h-3.5 w-3.5 text-pink-400" />
                  <span className="truncate max-w-[200px]">{pdf.pdf_title || 'Lecture PDF'}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
