import React, { useState } from 'react';
import {
  Eye,
  ExternalLink,
  Play,
  Film,
  Maximize2,
  X,
  Layers,
} from 'lucide-react';
import { MediaItem } from '../types';

interface TelegramPostPreviewProps {
  channelTitle?: string;
  channelUsername?: string;
  text: string;
  imageUrl?: string;
  mediaItems?: MediaItem[];
  ctaText?: string;
  ctaUrl?: string;
  lsiScore?: number;
  time?: string;
  views?: string;
}

export const TelegramPostPreview: React.FC<TelegramPostPreviewProps> = ({
  channelTitle = 'TeleGen Tech Insights',
  channelUsername = '@tech_insights_ir',
  text,
  imageUrl,
  mediaItems = [],
  ctaText,
  ctaUrl,
  lsiScore = 88,
  time = '14:20',
  views = '1.8K',
}) => {
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  // If mediaItems is not empty, use it. Otherwise fallback to single imageUrl if present
  const itemsToRender: MediaItem[] =
    mediaItems && mediaItems.length > 0
      ? mediaItems
      : imageUrl
      ? [
          {
            id: 'legacy-img',
            name: 'attachment.jpg',
            type: 'image',
            url: imageUrl,
            size: 0,
            sizeFormatted: '',
          },
        ]
      : [];

  return (
    <div className="w-full max-w-md mx-auto bg-[#17212b] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-100 flex flex-col">
      {/* Telegram Chat Header */}
      <div className="bg-[#242f3d] px-4 py-2.5 flex items-center justify-between border-b border-[#1b242d]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
            {channelTitle.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">{channelTitle}</div>
            <div className="text-[10px] text-sky-400">{channelUsername} • ۱۲,۴۵۰ عضو</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px]">کانال رسمی</span>
        </div>
      </div>

      {/* Message Bubble Body */}
      <div className="p-3.5 space-y-3 bg-[#0e1621] flex-1">
        <div className="bg-[#182533] p-3.5 rounded-2xl rounded-tr-xs border border-slate-800/80 shadow-md space-y-3">
          {/* TELEGRAM MEDIA GROUP / ALBUM RENDERING */}
          {itemsToRender.length > 0 && (
            <div className="space-y-1.5">
              {/* SINGLE ITEM */}
              {itemsToRender.length === 1 && (
                <div
                  onClick={() => setActiveMedia(itemsToRender[0])}
                  className="rounded-xl overflow-hidden relative max-h-60 bg-slate-900 border border-slate-800/80 group cursor-pointer"
                >
                  {itemsToRender[0].type === 'video' ? (
                    <div className="relative w-full h-52 bg-black flex items-center justify-center">
                      <video
                        src={itemsToRender[0].url}
                        className="w-full h-full object-cover opacity-85"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/15 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-white font-mono flex items-center gap-1">
                        <Film className="w-3 h-3 text-violet-400" />
                        <span>{itemsToRender[0].durationFormatted || 'ویدیو'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={itemsToRender[0].url}
                        alt="Post Attachment"
                        className="w-full max-h-60 object-cover group-hover:scale-[1.02] transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white font-mono">
                    {channelUsername}
                  </div>
                </div>
              )}

              {/* TWO ITEMS (Split side-by-side) */}
              {itemsToRender.length === 2 && (
                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900">
                  {itemsToRender.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => setActiveMedia(item)}
                      className="relative h-36 bg-slate-950 cursor-pointer group overflow-hidden"
                    >
                      {item.type === 'video' ? (
                        <>
                          <video src={item.url} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/15 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          {item.durationFormatted && (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                              {item.durationFormatted}
                            </div>
                          )}
                        </>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* THREE ITEMS (1 Top full, 2 Bottom) */}
              {itemsToRender.length === 3 && (
                <div className="space-y-1 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900">
                  <div
                    onClick={() => setActiveMedia(itemsToRender[0])}
                    className="relative h-32 bg-slate-950 cursor-pointer group overflow-hidden"
                  >
                    {itemsToRender[0].type === 'video' ? (
                      <>
                        <video src={itemsToRender[0].url} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img src={itemsToRender[0].url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {itemsToRender.slice(1, 3).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => setActiveMedia(item)}
                        className="relative h-24 bg-slate-950 cursor-pointer group overflow-hidden"
                      >
                        {item.type === 'video' ? (
                          <>
                            <video src={item.url} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white">
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FOUR OR MORE ITEMS (Telegram 2x2 Grid with +N counter) */}
              {itemsToRender.length >= 4 && (
                <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900">
                  {itemsToRender.slice(0, 4).map((item, idx) => {
                    const isLastTile = idx === 3 && itemsToRender.length > 4;
                    const remainingCount = itemsToRender.length - 4;
                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => setActiveMedia(item)}
                        className="relative h-28 bg-slate-950 cursor-pointer group overflow-hidden"
                      >
                        {item.type === 'video' ? (
                          <>
                            <video src={item.url} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white">
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              </div>
                            </div>
                            {item.durationFormatted && (
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-white">
                                {item.durationFormatted}
                              </div>
                            )}
                          </>
                        ) : (
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {/* Telegram "+N" Overlay for overflow */}
                        {isLastTile && (
                          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white font-mono">
                            <span className="text-base font-black">+{remainingCount}</span>
                            <span className="text-[10px] font-sans text-slate-300">رسانه دیگر</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Album Info Bar */}
              {itemsToRender.length > 1 && (
                <div className="flex items-center justify-between px-2 py-1 rounded bg-[#202b36] border border-slate-700/40 text-[10px] text-slate-300">
                  <span className="flex items-center gap-1 text-sky-400 font-bold">
                    <Layers className="w-3 h-3" />
                    <span>آلبوم چندرسانه‌ای تلگرام ({itemsToRender.length} فایل)</span>
                  </span>
                  <span className="text-[9px] text-slate-400">کلیک برای نمایش</span>
                </div>
              )}
            </div>
          )}

          {/* Post Text */}
          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-sky-500 selection:text-white">
            {text || 'متن پست در این بخش با فرمت استاندارد تلگرام نمایش داده می‌شود...'}
          </div>

          {/* Inline Button (دکمه شیشه‌ای) */}
          {ctaText && (
            <div className="pt-1">
              <a
                href={ctaUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-[#2b5278]/60 hover:bg-[#2b5278] border border-sky-400/20 text-sky-200 text-xs font-bold transition-colors cursor-pointer text-center"
              >
                <span>{ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Post Meta (Views, Time, Reactions) */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            {/* Reactions */}
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#202b36] border border-slate-700/60 flex items-center gap-1 text-[10px] text-slate-300">
                <span>🔥</span>
                <span className="font-mono">۳۴</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#202b36] border border-slate-700/60 flex items-center gap-1 text-[10px] text-slate-300">
                <span>👍</span>
                <span className="font-mono">۵۸</span>
              </span>
            </div>

            {/* Time & Views */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Eye className="w-3 h-3" />
                {views}
              </span>
              <span className="font-mono text-[10px]">{time}</span>
            </div>
          </div>
        </div>

        {/* LSI Score Badge Below Message */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
          <span className="text-slate-400">شاخص سئو و تعامل محتوا (LSI):</span>
          <span
            className={`font-bold font-mono px-2 py-0.5 rounded ${
              lsiScore >= 80 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
            }`}
          >
            {lsiScore} / ۱۰۰ (عالی)
          </span>
        </div>
      </div>

      {/* LIGHTBOX MODAL FROM PREVIEW CLICK */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950">
              <span className="text-xs font-bold text-white truncate font-mono">
                {activeMedia.name}
              </span>
              <button
                type="button"
                onClick={() => setActiveMedia(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black min-h-[250px]">
              {activeMedia.type === 'video' ? (
                <video src={activeMedia.url} controls autoPlay className="max-h-[60vh] max-w-full rounded-lg" />
              ) : (
                <img src={activeMedia.url} alt="" className="max-h-[60vh] max-w-full object-contain rounded-lg" />
              )}
            </div>
            {activeMedia.caption && (
              <div className="p-3 bg-slate-950 text-xs text-slate-300 border-t border-slate-800">
                {activeMedia.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
