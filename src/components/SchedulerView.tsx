import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Send,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Trash2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Film,
  Play,
  Maximize2,
  X,
  ExternalLink,
  GitCompare,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { ScheduledPost, MediaItem } from '../types';
import { GoogleCalendarModal } from './GoogleCalendarModal';

interface SchedulerViewProps {
  onOpenGoogleCalendar?: () => void;
  onToast?: (message: string) => void;
}

export const SchedulerView: React.FC<SchedulerViewProps> = ({
  onOpenGoogleCalendar,
  onToast,
}) => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [googleCalendarModalOpen, setGoogleCalendarModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newChannel, setNewChannel] = useState('فناوری و هوش مصنوعی پلاس');
  const [newScheduledTime, setNewScheduledTime] = useState('امروز، ساعت ۲۲:۳۰');
  const [previewMediaModal, setPreviewMediaModal] = useState<{ postTitle: string; items: any[] } | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/posts/queue');
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.warn('Queue fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    const handleQueueUpdate = () => {
      fetchQueue();
    };

    window.addEventListener('telegen_queue_updated', handleQueueUpdate);
    return () => {
      window.removeEventListener('telegen_queue_updated', handleQueueUpdate);
    };
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newText) return;

    triggerHaptic('medium');
    const newPost: Partial<ScheduledPost> = {
      channelName: newChannel,
      channelHandle: '@tech_insights_ir',
      botUsername: '@TechGen_PublisherBot',
      title: newTitle,
      previewText: newText,
      scheduledTime: newScheduledTime || 'امروز، ساعت ۲۳:۰۰',
      status: 'pending',
      mediaType: 'text',
    };

    try {
      const res = await fetch('/api/posts/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setPosts([data.post, ...posts]);
      } else {
        setPosts([newPost as ScheduledPost, ...posts]);
      }
    } catch {
      setPosts([newPost as ScheduledPost, ...posts]);
    }

    setNewTitle('');
    setNewText('');
    setNewPostModalOpen(false);
    triggerHaptic('success');
  };

  const handleDeletePost = async (id: string) => {
    triggerHaptic('light');
    try {
      await fetch(`/api/posts/queue/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleDispatchNow = async (id: string) => {
    triggerHaptic('medium');
    try {
      const res = await fetch(`/api/posts/queue/${id}/dispatch`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map((p) => (p.id === id ? { ...p, status: 'published' } : p)));
        triggerHaptic('success');
      }
    } catch {
      setPosts(posts.map((p) => (p.id === id ? { ...p, status: 'published' } : p)));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              تقویم و صف زمان‌بندی انتشار محتوا
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مدیریت پست‌های آماده ارسال همراه با آلبوم‌های عکس و ویدیو متصل به ربات‌های ناشر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              if (onOpenGoogleCalendar) {
                onOpenGoogleCalendar();
              } else {
                setGoogleCalendarModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-sky-500/30 text-sky-300 hover:text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title="مشاهده رویدادها و همگام‌سازی با Google Calendar"
          >
            <CalendarIcon className="w-4 h-4 text-sky-400" />
            <span>همگام‌سازی با Google Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              setNewPostModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ایجاد پست جدید برای صف</span>
          </button>
        </div>
      </div>

      {/* SCHEDULED POSTS LIST */}
      <div className="space-y-3">
        {posts.length === 0 && !loading && (
          <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">صف انتشار در حال حاضر خالی است</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              از استودیو تولید محتوا (PostStudio) پست دلخواه خود را همراه با عکس یا ویدیو آماده کرده و با کلیک روی «افزودن به صف انتشار» زمان‌بندی نمایید.
            </p>
          </div>
        )}

        {posts.map((post) => {
          const hasMedia = (post.mediaItems && post.mediaItems.length > 0) || post.imageUrl;
          const mediaCount = post.mediaItems ? post.mediaItems.length : post.imageUrl ? 1 : 0;
          const firstMedia = post.mediaItems?.[0];
          const hasVideo = post.mediaItems?.some((m) => m.type === 'video');

          return (
            <div
              key={post.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                post.status === 'published'
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-75'
                  : 'bg-slate-900/75 border-slate-800 hover:border-sky-500/30'
              }`}
            >
              {/* CONTENT & MEDIA PREVIEW */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Media Thumbnail (if any) */}
                {hasMedia && (
                  <div
                    onClick={() => {
                      if (post.mediaItems && post.mediaItems.length > 0) {
                        setPreviewMediaModal({ postTitle: post.title, items: post.mediaItems });
                      } else if (post.imageUrl) {
                        setPreviewMediaModal({
                          postTitle: post.title,
                          items: [{ id: '1', name: 'تصویر پیوست', type: 'image', url: post.imageUrl }],
                        });
                      }
                    }}
                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 cursor-pointer group shadow-inner"
                  >
                    {firstMedia?.type === 'video' ? (
                      <div className="w-full h-full relative bg-black flex items-center justify-center">
                        <video src={firstMedia.url} className="w-full h-full object-cover opacity-75" muted />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10">
                          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                        </div>
                        <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-violet-600/90 text-[8px] font-bold text-white">
                          ویدیو
                        </span>
                      </div>
                    ) : (
                      <img
                        src={firstMedia?.url || post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {mediaCount > 1 && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[9px] font-mono text-white font-bold flex items-center gap-0.5">
                        <Layers className="w-2.5 h-2.5 text-sky-400" />
                        <span>+{mediaCount}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{post.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                      {post.channelHandle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {post.botUsername}
                    </span>

                    {/* A/B Test Badge */}
                    {post.abTest && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold flex items-center gap-1 font-mono">
                        <GitCompare className="w-2.5 h-2.5 text-indigo-400" />
                        <span>تست A/B • نسخه {post.abTest.variant}</span>
                      </span>
                    )}

                    {/* Media Type Tag */}
                    {hasMedia && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-mono flex items-center gap-1">
                        {hasVideo ? (
                          <Film className="w-3 h-3 text-violet-400" />
                        ) : (
                          <ImageIcon className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>
                          {mediaCount > 1
                            ? `آلبوم (${mediaCount} رسانه)`
                            : hasVideo
                            ? 'ویدیو'
                            : 'تک عکس'}
                        </span>
                      </span>
                    )}

                    {post.status === 'published' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        ارسال شده
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {post.previewText}
                  </p>
                </div>
              </div>

              {/* TIMING & CONTROLS */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-800/80 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{post.scheduledTime}</span>
                  </div>
                  <div className="text-[10px] mt-0.5 font-bold">
                    {post.status === 'published' ? (
                      <span className="text-emerald-400">توزیع موفق</span>
                    ) : (
                      <span className="text-sky-400">آماده ارسال خودکار</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setGoogleCalendarModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-sky-500/20 hover:text-sky-300 text-slate-400 border border-slate-700/50 hover:border-sky-500/40 transition-colors cursor-pointer"
                    title="مشاهده و همگام‌سازی با Google Calendar"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>

                  {post.status !== 'published' && (
                    <button
                      type="button"
                      onClick={() => handleDispatchNow(post.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                      title="ارسال فوری همین حالا"
                    >
                      <Send className="w-3 h-3 -rotate-12" />
                      <span className="hidden sm:inline">ارسال فوری</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                    title="حذف از صف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MEDIA PREVIEW MODAL */}
      {previewMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white">
                  رسانه‌های پیوست شده: {previewMediaModal.postTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMediaModal(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {previewMediaModal.items.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 space-y-2"
                  >
                    <div className="h-44 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                      {m.type === 'video' ? (
                        <video src={m.url} controls className="max-h-full max-w-full" />
                      ) : (
                        <img src={m.url} alt="" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                      <span>{m.name || `رسانه #${idx + 1}`}</span>
                      <span>{m.type === 'video' ? '🎬 ویدیو' : '📷 تصویر'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW POST MODAL */}
      {newPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">افزودن پست به صف زمان‌بندی</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewPostModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">کانال مقصد</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="فناوری و هوش مصنوعی پلاس">فناوری و هوش مصنوعی پلاس</option>
                  <option value="نبض کریپتو و تحلیل مالی">نبض کریپتو و تحلیل مالی</option>
                  <option value="دیده‌بان استارتاپ‌ها و اکوسیستم">
                    دیده‌بان استارتاپ‌ها و اکوسیستم
                  </option>
                  <option value="مجله جامع سبک زندگی و تندرستی">
                    مجله جامع سبک زندگی و تندرستی
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان پست</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="عنوان جذاب پست..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">متن پست</label>
                <textarea
                  rows={4}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="محتوای متنی با فرمت تلگرام..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">زمان‌بندی انتشار</label>
                <input
                  type="text"
                  value={newScheduledTime}
                  onChange={(e) => setNewScheduledTime(e.target.value)}
                  placeholder="مثال: فردا، ساعت ۱۱:۳۰"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                >
                  افزودن به صف زمان‌بندی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GOOGLE CALENDAR INTEGRATION MODAL */}
      <GoogleCalendarModal
        isOpen={googleCalendarModalOpen}
        onClose={() => setGoogleCalendarModalOpen(false)}
        scheduledPosts={posts}
        onToast={onToast}
      />
    </div>
  );
};
