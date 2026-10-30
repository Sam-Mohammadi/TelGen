import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  MoveRight,
  MoveLeft,
  Maximize2,
  X,
  Play,
  Film,
  Sparkles,
  Layers,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { MediaItem } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface MediaManagerProps {
  mediaItems: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxFiles?: number;
}

// Sample presets for instant testing
const SAMPLE_MEDIA_ITEMS: Omit<MediaItem, 'id'>[] = [
  {
    name: 'demo-gemini-ai-intro.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    size: 2450000,
    sizeFormatted: '2.4 مگابایت',
    duration: 15,
    durationFormatted: '0:15',
    aspectRatio: 'landscape',
    caption: 'دموی هوش مصنوعی و مدل استدلالی',
  },
  {
    name: 'telegen_neural_architecture.png',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    size: 1150000,
    sizeFormatted: '1.1 مگابایت',
    aspectRatio: 'landscape',
    caption: 'معماری شبکه عصبی داده‌ها',
  },
  {
    name: 'crypto_analytics_dashboard.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1000&auto=format&fit=crop&q=80',
    size: 1420000,
    sizeFormatted: '1.4 مگابایت',
    aspectRatio: 'landscape',
    caption: 'نمودار جریان‌های نقدینگی و تحلیل آن‌چین',
  },
];

export const MediaManager: React.FC<MediaManagerProps> = ({
  mediaItems,
  onChange,
  maxFiles = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بایت';
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const newItems: MediaItem[] = [];
    const fileArray = Array.from(files);

    if (mediaItems.length + fileArray.length > maxFiles) {
      setErrorMessage(`حداکثر می‌توانید تا ${maxFiles} فایل رسانه‌ای (آلبوم تلگرام) انتخاب کنید.`);
      triggerHaptic('warning');
      return;
    }

    for (const file of fileArray) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) {
        setErrorMessage(`فرمت فایل «${file.name}» پشتیبانی نمی‌شود. فقط عکس و ویدیو مجاز است.`);
        continue;
      }

      // Generate object URL for immediate local preview
      const localUrl = URL.createObjectURL(file);

      let duration: number | undefined;
      let durationFormatted: string | undefined;

      if (isVideo) {
        // Read video duration metadata via offscreen video
        try {
          duration = await new Promise<number>((resolve) => {
            const v = document.createElement('video');
            v.preload = 'metadata';
            v.onloadedmetadata = () => {
              resolve(v.duration);
            };
            v.onerror = () => resolve(0);
            v.src = localUrl;
          });
          if (duration && !isNaN(duration)) {
            durationFormatted = formatDuration(duration);
          }
        } catch {
          duration = undefined;
        }
      }

      newItems.push({
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        url: localUrl,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        file,
        duration,
        durationFormatted,
        isCover: mediaItems.length === 0 && newItems.length === 1,
      });
    }

    if (newItems.length > 0) {
      triggerHaptic('success');
      onChange([...mediaItems, ...newItems]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    triggerHaptic('light');
    const itemToRemove = mediaItems.find((m) => m.id === id);
    if (itemToRemove && itemToRemove.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(itemToRemove.url);
      } catch {
        // ignore
      }
    }
    const updated = mediaItems.filter((m) => m.id !== id);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'prev' | 'next') => {
    triggerHaptic('light');
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaItems.length) return;

    const copy = [...mediaItems];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  const handleCaptionChange = (id: string, caption: string) => {
    const updated = mediaItems.map((m) => (m.id === id ? { ...m, caption } : m));
    onChange(updated);
  };

  const handleAddSampleMedia = () => {
    triggerHaptic('medium');
    const samples: MediaItem[] = SAMPLE_MEDIA_ITEMS.map((sample) => ({
      ...sample,
      id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    onChange([...mediaItems, ...samples]);
  };

  const handleClearAll = () => {
    triggerHaptic('medium');
    mediaItems.forEach((m) => {
      if (m.url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(m.url);
        } catch {
          // ignore
        }
      }
    });
    onChange([]);
  };

  const totalBytes = mediaItems.reduce((acc, m) => acc + (m.size || 0), 0);
  const totalFormatted = formatFileSize(totalBytes);
  const imageCount = mediaItems.filter((m) => m.type === 'image').length;
  const videoCount = mediaItems.filter((m) => m.type === 'video').length;

  return (
    <div className="space-y-4">
      {/* UPLOAD ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center group ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-sky-500/50 bg-slate-950/60 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-tr from-sky-500/10 to-blue-600/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5 text-sky-400 animate-bounce" />
            <div className="flex items-center gap-1 text-slate-400">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <VideoIcon className="w-4 h-4 text-violet-400" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-white block">
              انتخاب یا رهاسازی تصاویر و ویدیوها (چندرسانه‌ای)
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              پشتیبانی از فرمت‌های <span className="text-slate-300 font-mono">JPG, PNG, GIF, WEBP</span> و ویدیوهای{' '}
              <span className="text-slate-300 font-mono">MP4, WEBM, MOV</span> (حداکثر {maxFiles} فایل برای آلبوم تلگرام)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-sky-400 font-medium">
              بارگذاری بدون محدودیت حجم از فایل‌های محلی سیستم
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ACTION BAR: SAMPLE LOADER & STATS */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>رسانه‌های پیوست:</span>
            <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded-md">
              {mediaItems.length} فایل
            </span>
          </span>

          {mediaItems.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>(📷 {imageCount} عکس / 🎬 {videoCount} ویدیو)</span>
              <span>• حجم کل: {totalFormatted}</span>
              {mediaItems.length > 1 && (
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] font-sans font-bold border border-sky-500/20">
                  آلبوم گروهی (Telegram Media Group)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddSampleMedia}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
            title="افزودن نمونه آماده عکس و ویدیو جهت تست سریع"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>افزودن نمونه‌های آزمایشی</span>
          </button>

          {mediaItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاک‌سازی همه</span>
            </button>
          )}
        </div>
      </div>

      {/* MEDIA CARDS LIST / GRID */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {mediaItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative rounded-xl bg-slate-950/80 border border-slate-800 p-3 hover:border-sky-500/40 transition-all flex flex-col justify-between gap-2.5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {/* THUMBNAIL / PREVIEW CONTAINER */}
                <div
                  onClick={() => setPreviewMedia(item)}
                  className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 cursor-pointer group/thumb"
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover opacity-80"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/thumb:bg-black/20 transition-colors">
                        <div className="w-7 h-7 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>
                      {item.durationFormatted && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white font-bold">
                          {item.durationFormatted}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </div>
                  )}

                  {/* TYPE BADGE OVER THUMB */}
                  <div className="absolute top-1 left-1">
                    {item.type === 'video' ? (
                      <span className="px-1.5 py-0.5 rounded bg-violet-600/90 text-[9px] font-bold text-white flex items-center gap-0.5 shadow-sm">
                        <Film className="w-2.5 h-2.5" />
                        ویدیو
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-[9px] font-bold text-white flex items-center gap-0.5 shadow-sm">
                        <ImageIcon className="w-2.5 h-2.5" />
                        عکس
                      </span>
                    )}
                  </div>
                </div>

                {/* DETAILS & CONTROLS */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white truncate font-mono" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono">{item.sizeFormatted}</span>
                    {item.type === 'video' && item.durationFormatted && (
                      <span className="font-mono text-violet-300">مدت: {item.durationFormatted}</span>
                    )}
                  </div>

                  {/* Caption Input */}
                  <input
                    type="text"
                    value={item.caption || ''}
                    onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                    placeholder="کپشن اختصاصی این فایل (اختیاری)..."
                    className="w-full mt-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* REORDER & DELETE ROW */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'prev')}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="جابجایی به عقب در آلبوم"
                  >
                    <MoveRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === mediaItems.length - 1}
                    onClick={() => handleMove(index, 'next')}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="جابجایی به جلو در آلبوم"
                  >
                    <MoveLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-500 mr-1">
                    جایگاه در آلبوم: {index + 1} از {mediaItems.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMedia(item)}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>مشاهده</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="حذف این رسانه"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL-SIZE PREVIEW MODAL */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                {previewMedia.type === 'video' ? (
                  <Film className="w-4 h-4 text-violet-400" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-bold text-white font-mono truncate max-w-xs sm:max-w-md">
                  {previewMedia.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">({previewMedia.sizeFormatted})</span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60 min-h-[300px]">
              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[60vh] max-w-full rounded-xl shadow-lg border border-slate-800"
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Footer with caption */}
            {previewMedia.caption && (
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-300">
                <span className="text-slate-500 ml-1">کپشن:</span>
                <span>{previewMedia.caption}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
