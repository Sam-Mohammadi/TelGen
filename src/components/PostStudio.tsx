import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Calendar,
  Image as ImageIcon,
  Tag,
  Eye,
  CheckCircle,
  RefreshCw,
  HelpCircle,
  Flame,
  Zap,
  Sliders,
  Copy,
  Check,
  Clock,
  Layers,
  Film,
  X,
  FileCheck2,
  ExternalLink,
  HardDrive,
  RotateCcw,
  Cloud,
  CheckCircle2,
  Bookmark,
  FolderOpen,
  Wand2,
  GitCompare,
  Target,
} from 'lucide-react';
import { TONE_PRESETS, TonePreset } from '../data/tonePresets';
import { TelegramPostPreview } from './TelegramPostPreview';
import { EngagementPollsManager } from './EngagementPollsManager';
import { MediaManager } from './MediaManager';
import { DraftsManagerModal } from './DraftsManagerModal';
import { SmartContentOptimizerModal } from './SmartContentOptimizerModal';
import { ABTestModal } from './ABTestModal';
import { GoogleCalendarModal } from './GoogleCalendarModal';
import { SEOKeywordAuditor } from './SEOKeywordAuditor';
import { MediaItem, ScheduledPost } from '../types';
import { triggerHaptic } from '../utils/haptics';
import {
  loadStudioDraft,
  saveStudioDraft,
  clearStudioDraft,
  SavedStudioDraft,
  NamedDraft,
  saveNamedDraft,
} from '../utils/draftStorage';

interface PostStudioProps {
  onSchedulePost?: (post: any) => void;
  onDispatchPost?: (post: any) => void;
  initialContent?: string | null;
  initialChannel?: string | null;
  initialTopic?: string | null;
}

export const PostStudio: React.FC<PostStudioProps> = ({
  onSchedulePost,
  onDispatchPost,
  initialContent,
  initialChannel,
  initialTopic,
}) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [content, setContent] = useState(
    initialContent ||
    '🚀 **جهش چشم‌گیر پردازش داده‌ها با مدل‌های جدید استدلالی هوش مصنوعی**\n\nامروز شاهد تحولی اساسی در نحوه تعامل ربات‌ها و پردازش متون چندرسانه‌ای هستیم. کلیدواژه‌های طلایی این دوره:\n\n• استدلال چندمرحله‌ای بدون خطا\n• تحلیل آنی محتوای تصویری و ویدیوهای محلی\n• اتصال بلادرنگ به پایگاه‌های دانش محلی و صف زمان‌بندی\n\n📌 نظر شما در این زمینه چیست؟\n\n#هوش_مصنوعی #فناوری #توسعه #TeleGen'
  );
  const [selectedTone, setSelectedTone] = useState<TonePreset>(TONE_PRESETS[0]);
  const [selectedChannel, setSelectedChannel] = useState(initialChannel || '@tech_insights_ir');

  // Multi-Media Items State (Photos & Videos)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: 'm-init-1',
      name: 'gemini_reasoning_preview.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      size: 1450000,
      sizeFormatted: '1.4 مگابایت',
      caption: 'معماری مدل‌های استدلالی نسل جدید',
      isCover: true,
    },
  ]);

  const [activeTabSection, setActiveTabSection] = useState<'content' | 'media' | 'cta'>('content');
  const [ctaText, setCtaText] = useState('مطالعه تحلیل کامل در وبسایت');
  const [ctaUrl, setCtaUrl] = useState('https://t.me/tech_insights_ir');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPollManager, setShowPollManager] = useState(false);
  const [lsiScore, setLsiScore] = useState(92);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Auto-Save in LocalStorage states
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const isInitialMount = useRef(true);

  // Named Drafts Manager Modal State
  const [draftsModalOpen, setDraftsModalOpen] = useState(false);

  // Smart Content Optimizer Modal State
  const [optimizerModalOpen, setOptimizerModalOpen] = useState(false);

  // A/B Test Modal State
  const [abTestModalOpen, setAbTestModalOpen] = useState(false);

  // Google Calendar Modal State
  const [googleCalendarModalOpen, setGoogleCalendarModalOpen] = useState(false);

  // Queue Modal State
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('جهش چشم‌گیر پردازش داده‌ها با مدل‌های جدید استدلالی');
  const [scheduledPreset, setScheduledPreset] = useState<'10min' | '1hour' | 'tonight' | 'tomorrow' | 'custom'>('10min');
  const [customScheduledTime, setCustomScheduledTime] = useState('امروز، ساعت ۲۲:۳۰');
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);

  // SEO Keyword Auditor Visibility State
  const [showSeoAuditor, setShowSeoAuditor] = useState(true);

  // Handler for inserting LSI keyword or hashtag from SEO Keyword Auditor into draft
  const handleInsertKeywordFromAuditor = (keyword: string, asHashtag = false) => {
    triggerHaptic('light');
    if (asHashtag) {
      const cleanHashtag = keyword.startsWith('#')
        ? keyword
        : `#${keyword.replace(/[\s\u200C]+/g, '_')}`;
      setContent((prev) => {
        if (prev.includes(cleanHashtag)) return prev;
        // If there's an existing hashtag line, append to it
        const lines = prev.split('\n');
        let hashtagLineIdx = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].includes('#')) {
            hashtagLineIdx = i;
            break;
          }
        }
        if (hashtagLineIdx !== -1) {
          lines[hashtagLineIdx] = `${lines[hashtagLineIdx].trim()} ${cleanHashtag}`;
          return lines.join('\n');
        }
        return `${prev.trim()}\n\n${cleanHashtag}`;
      });
    } else {
      setContent((prev) => {
        if (prev.includes(keyword)) return prev;
        // Insert as bullet point if bullet list exists, or append cleanly
        const lines = prev.split('\n');
        const bulletIdx = lines.findIndex((l) => l.trim().startsWith('•') || l.trim().startsWith('-'));
        if (bulletIdx !== -1) {
          lines.splice(bulletIdx + 1, 0, `• ${keyword}`);
          return lines.join('\n');
        }
        return `${prev.trim()}\n• ${keyword}`;
      });
    }
  };

  // Bulk insert multiple LSI keywords/hashtags into draft
  const handleInsertMultipleKeywordsFromAuditor = (keywords: string[]) => {
    triggerHaptic('success');
    setContent((prev) => {
      let updated = prev.trim();
      const newHashtags = keywords.filter((k) => !updated.includes(k));
      if (newHashtags.length === 0) return prev;
      return `${updated}\n\n${newHashtags.join(' ')}`;
    });
  };

  // Apply optimized content from AI agent
  const handleApplyOptimizedContent = (newContent: string) => {
    setContent(newContent);
    const firstLine = newContent.split('\n')[0].replace(/[#*`_]/g, '').trim();
    if (firstLine) setPostTitle(firstLine);
    setLsiScore(95);
    setFeedback('متن پست با نسخه بازنویسی و بهینه‌سازی‌شده هوش مصنوعی جایگزین گردید.');
    setTimeout(() => setFeedback(null), 4000);
  };

  // Save optimized content directly as a named draft
  const handleSaveOptimizedAsDraft = async (draftName: string, contentToSave: string) => {
    const originalFiles = new Map<string, File>();
    for (const m of mediaItems) {
      if (m.file) originalFiles.set(m.id, m.file);
    }
    await saveNamedDraft(
      {
        name: draftName,
        topic,
        content: contentToSave,
        selectedToneId: selectedTone.id,
        selectedChannel,
        ctaText,
        ctaUrl,
        lsiScore: 96,
        mediaItems: mediaItems.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          url: m.url,
          size: m.size,
          sizeFormatted: m.sizeFormatted,
          aspectRatio: m.aspectRatio,
          duration: m.duration,
          durationFormatted: m.durationFormatted,
          caption: m.caption,
          isCover: m.isCover,
        })),
      },
      originalFiles
    );
    setFeedback(`پیش‌نویس بهینه‌سازی‌شده «${draftName}» با موفقیت ذخیره گردید.`);
    setTimeout(() => setFeedback(null), 4500);
  };

  // Load a named draft from Drafts Manager
  const handleLoadNamedDraft = (draft: NamedDraft) => {
    triggerHaptic('success');
    setTopic(draft.topic || '');
    setContent(draft.content || '');
    setPostTitle(draft.name || '');
    setSelectedChannel(draft.selectedChannel || '@tech_insights_ir');
    const foundTone = TONE_PRESETS.find((t) => t.id === draft.selectedToneId);
    if (foundTone) setSelectedTone(foundTone);
    setCtaText(draft.ctaText || '');
    setCtaUrl(draft.ctaUrl || '');
    if (draft.lsiScore) setLsiScore(draft.lsiScore);
    if (draft.mediaItems && draft.mediaItems.length > 0) {
      setMediaItems(draft.mediaItems as MediaItem[]);
    } else {
      setMediaItems([]);
    }
    setFeedback(`پیش‌نویس «${draft.name}» با موفقیت در استودیو بازخوانی گردید.`);
    setTimeout(() => setFeedback(null), 4500);
  };

  // 1. Restore saved draft from LocalStorage on mount
  useEffect(() => {
    let isMounted = true;
    loadStudioDraft().then((draft) => {
      if (!isMounted || !draft) return;
      // Only restore if user didn't have an explicit initialContent override from navigation
      if (!initialContent) {
        if (draft.topic) setTopic(draft.topic);
        if (draft.content) {
          setContent(draft.content);
          const firstLine = draft.content.split('\n')[0].replace(/[#*`_]/g, '').trim();
          if (firstLine) setPostTitle(firstLine);
        }
        if (draft.selectedToneId) {
          const foundTone = TONE_PRESETS.find((t) => t.id === draft.selectedToneId);
          if (foundTone) setSelectedTone(foundTone);
        }
        if (draft.selectedChannel) setSelectedChannel(draft.selectedChannel);
        if (draft.ctaText) setCtaText(draft.ctaText);
        if (draft.ctaUrl) setCtaUrl(draft.ctaUrl);
        if (draft.lsiScore) setLsiScore(draft.lsiScore);
        if (draft.mediaItems && draft.mediaItems.length > 0) {
          setMediaItems(draft.mediaItems as MediaItem[]);
        }
        if (draft.lastSavedAt) {
          try {
            const d = new Date(draft.lastSavedAt);
            setLastSavedTime(
              d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            );
          } catch {
            setLastSavedTime(draft.lastSavedAt);
          }
        }
        setHasRestoredDraft(true);
        setAutoSaveStatus('saved');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialContent]);

  // 2. Auto-save debounced effect to LocalStorage and IndexedDB
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setAutoSaveStatus('saving');
    const timer = setTimeout(async () => {
      const originalFiles = new Map<string, File>();
      for (const m of mediaItems) {
        if (m.file) {
          originalFiles.set(m.id, m.file);
        }
      }

      const draftPayload: SavedStudioDraft = {
        topic,
        content,
        selectedToneId: selectedTone.id,
        selectedChannel,
        ctaText,
        ctaUrl,
        lsiScore,
        lastSavedAt: new Date().toISOString(),
        mediaItems: mediaItems.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          url: m.url,
          size: m.size,
          sizeFormatted: m.sizeFormatted,
          aspectRatio: m.aspectRatio,
          duration: m.duration,
          durationFormatted: m.durationFormatted,
          caption: m.caption,
          isCover: m.isCover,
        })),
      };

      await saveStudioDraft(draftPayload, originalFiles);
      const now = new Date();
      setLastSavedTime(
        now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setAutoSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [topic, content, selectedTone, selectedChannel, ctaText, ctaUrl, lsiScore, mediaItems]);

  const handleResetDraft = async () => {
    triggerHaptic('medium');
    await clearStudioDraft();
    setTopic('');
    setContent(
      '🚀 **جهش چشم‌گیر پردازش داده‌ها با مدل‌های جدید استدلالی هوش مصنوعی**\n\nامروز شاهد تحولی اساسی در نحوه تعامل ربات‌ها و پردازش متون چندرسانه‌ای هستیم. کلیدواژه‌های طلایی این دوره:\n\n• استدلال چندمرحله‌ای بدون خطا\n• تحلیل آنی محتوای تصویری و ویدیوهای محلی\n• اتصال بلادرنگ به پایگاه‌های دانش محلی و صف زمان‌بندی\n\n📌 نظر شما در این زمینه چیست؟\n\n#هوش_مصنوعی #فناوری #توسعه #TeleGen'
    );
    setSelectedTone(TONE_PRESETS[0]);
    setSelectedChannel('@tech_insights_ir');
    setCtaText('مطالعه تحلیل کامل در وبسایت');
    setCtaUrl('https://t.me/tech_insights_ir');
    setMediaItems([]);
    setHasRestoredDraft(false);
    setLastSavedTime(null);
    setAutoSaveStatus('idle');
    setFeedback('پیش‌نویس ذخیره‌شده پاک شد و استودیو به حالت اولیه بازگردانی گردید.');
    setTimeout(() => setFeedback(null), 4000);
  };

  // React to prop updates if incoming draft changes
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      const firstLine = initialContent.split('\n')[0].replace(/[#*`_]/g, '').trim();
      if (firstLine) setPostTitle(firstLine);
    }
  }, [initialContent]);

  useEffect(() => {
    if (initialChannel) {
      setSelectedChannel(initialChannel);
    }
  }, [initialChannel]);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const channels = [
    { id: 'ch-1', username: '@tech_insights_ir', title: 'تک اینسایتس (فناوری و استارتاپ)', bot: '@TechGen_PublisherBot' },
    { id: 'ch-2', username: '@ai_froniter_ir', title: 'مرزهای هوش مصنوعی', bot: '@AIFronteir_Bot' },
    { id: 'ch-3', username: '@crypto_pulse_fa', title: 'نبض کریپتو و فین‌تک', bot: '@CryptoPulse_Bot' },
  ];

  const handleGenerateAI = async () => {
    if (!topic.trim()) {
      setTopic('معرفی بهترین ابزارهای هوش مصنوعی برای تولید محتوای تلگرام');
    }
    const currentTopic = topic.trim() || 'معرفی بهترین ابزارهای هوش مصنوعی برای تولید محتوای تلگرام';

    triggerHaptic('medium');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `یک پست حرفه‌ای تلگرام درباره موضوع «${currentTopic}» با لحن «${selectedTone.name}» بنویس.\nدستورالعمل لحن: ${selectedTone.promptGuidance}\nفرمت: شامل تیتر با ایموجی، نکات بولت‌پوینت، قلاب اول پست و ۳ تا ۵ هشتگ مرتبط در انتها.`,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setContent(data.reply);
        const firstLine = data.reply.split('\n')[0].replace(/[#*`_]/g, '').trim();
        if (firstLine) setPostTitle(firstLine);
        setLsiScore(Math.floor(Math.random() * 8) + 90);
        triggerHaptic('success');
      }
    } catch (e) {
      console.warn('AI generation note:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    triggerHaptic('light');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishNow = () => {
    triggerHaptic('medium');
    const channelObj = channels.find((c) => c.username === selectedChannel) || channels[0];
    const imageCount = mediaItems.filter((m) => m.type === 'image').length;
    const videoCount = mediaItems.filter((m) => m.type === 'video').length;

    let mediaSummary = 'بدون رسانه';
    if (mediaItems.length === 1) {
      mediaSummary = mediaItems[0].type === 'video' ? '۱ ویدیو' : '۱ تصویر';
    } else if (mediaItems.length > 1) {
      mediaSummary = `آلبوم ${mediaItems.length} تایی (${imageCount} عکس، ${videoCount} ویدیو)`;
    }

    setFeedback(`پست همراه با ${mediaSummary} فوراً به کانال ${selectedChannel} ارسال شد.`);
    setTimeout(() => setFeedback(null), 4000);

    onDispatchPost?.({
      content,
      channel: selectedChannel,
      mediaItems,
      imageUrl: mediaItems[0]?.url,
      ctaText,
      ctaUrl,
    });
  };

  const getScheduledTimeString = () => {
    if (scheduledPreset === '10min') return '۱۰ دقیقه دیگر (ارسال زمان‌بندی‌شده)';
    if (scheduledPreset === '1hour') return '۱ ساعت دیگر';
    if (scheduledPreset === 'tonight') return 'امشب، ساعت ۲۱:۰۰';
    if (scheduledPreset === 'tomorrow') return 'فردا، ساعت ۱۰:۰۰';
    return customScheduledTime;
  };

  const handleAddToQueue = async () => {
    triggerHaptic('medium');
    setIsAddingToQueue(true);

    const channelObj = channels.find((c) => c.username === selectedChannel) || channels[0];
    const scheduledTime = getScheduledTimeString();

    let postMediaType: 'text' | 'photo' | 'video' | 'album' = 'text';
    if (mediaItems.length === 1) {
      postMediaType = mediaItems[0].type === 'video' ? 'video' : 'photo';
    } else if (mediaItems.length > 1) {
      postMediaType = 'album';
    }

    const newQueuePost: Partial<ScheduledPost> = {
      title: postTitle || 'پست جدید از استودیو',
      previewText: content,
      channelName: channelObj.title,
      channelHandle: channelObj.username,
      botUsername: channelObj.bot,
      scheduledTime,
      status: 'pending',
      mediaType: postMediaType,
      mediaItems: mediaItems.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        url: m.url,
        size: m.size,
        sizeFormatted: m.sizeFormatted,
        durationFormatted: m.durationFormatted,
        caption: m.caption,
      })),
      imageUrl: mediaItems[0]?.url,
      ctaText,
      ctaUrl,
    };

    try {
      const res = await fetch('/api/posts/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQueuePost),
      });
      const data = await res.json();

      if (data.success) {
        triggerHaptic('success');
        setQueueModalOpen(false);
        setFeedback(`پست با موفقیت در صف انتشار (${scheduledTime}) قرار گرفت.`);
        setTimeout(() => setFeedback(null), 5000);

        // Notify parent callback
        onSchedulePost?.(data.post || newQueuePost);

        // Notify global listeners
        window.dispatchEvent(new CustomEvent('telegen_queue_updated', { detail: data.post }));
      } else {
        triggerHaptic('warning');
        setFeedback(data.error || 'خطا در ثبت پست در صف');
      }
    } catch (e) {
      console.warn('Queue submission error:', e);
      // Fallback: trigger parent and event directly
      onSchedulePost?.(newQueuePost);
      window.dispatchEvent(new CustomEvent('telegen_queue_updated', { detail: newQueuePost }));
      setQueueModalOpen(false);
      setFeedback(`پست با موفقیت در صف انتشار محلی قرار گرفت (${scheduledTime}).`);
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setIsAddingToQueue(false);
    }
  };

  const imageCount = mediaItems.filter((m) => m.type === 'image').length;
  const videoCount = mediaItems.filter((m) => m.type === 'video').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Studio Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white">استودیو پیشرفته تولید محتوا و رسانه‌های چندگانه تلگرام</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            نگارش هوشمند، بارگذاری عکس و ویدیو محلی، تنظیم آلبوم‌های تلگرام و ارسال به صف زمان‌بندی
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AUTO-SAVE STATUS PILL */}
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]"
            title="وضعیت ذخیره‌سازی خودکار در حافظه محلی مرورگر (LocalStorage & IndexedDB)"
          >
            {autoSaveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span className="text-sky-300 font-sans font-bold">در حال ذخیره...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 font-sans hidden sm:inline">
                  ذخیره خودکار:
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  {lastSavedTime || 'فعال'}
                </span>
              </>
            )}
          </div>

          {/* RESET / CLEAR DRAFT BUTTON */}
          <button
            type="button"
            onClick={handleResetDraft}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors cursor-pointer"
            title="پاک‌سازی پیش‌نویس ذخیره‌شده و بازنشانی استودیو"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* NAMED DRAFTS MANAGER BUTTON */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setDraftsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="مدیریت و مشاهده پیش‌نویس‌های ذخیره‌شده با نام دلخواه"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>پیش‌نویس‌ها</span>
          </button>

          {/* A/B TEST BUTTON IN BANNER */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setAbTestModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="طراحی و مقایسه دو متغیر از پست (A/B Test)"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span>تست A/B</span>
          </button>

          {/* GOOGLE CALENDAR BUTTON IN BANNER */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setGoogleCalendarModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-sky-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="تقویم گوگل و همگام‌سازی زمان‌بندی محتوا"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>تقویم گوگل</span>
          </button>

          {/* SEO KEYWORD AUDITOR BUTTON IN BANNER */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowSeoAuditor(!showSeoAuditor);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              showSeoAuditor
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-950/20'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-emerald-300'
            }`}
            title="حسابرس کلمات کلیدی سئو و LSI جهت تقویت رشد ارگانیک کانال در جستجوی سراسری تلگرام"
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>حسابرس سئو (LSI)</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-emerald-400 font-bold">
              {lsiScore}٪
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowPollManager(!showPollManager)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              showPollManager
                ? 'bg-sky-500 text-white border-sky-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>نظرسنجی تلگرام</span>
          </button>
        </div>
      </div>

      {hasRestoredDraft && (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              پیش‌نویس ذخیره‌شده شما (متن و رسانه‌های پیوست) با موفقیت از حافظه محلی مرورگر بازیابی گردید.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasRestoredDraft(false)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Editor on Left, Telegram Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* AI Prompt & Generate */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>ایده یا موضوع مدنظر برای تولید خودکار:</span>
              <span className="text-[11px] text-sky-400">مدل Gemini 2.5 Flash</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="مثال: ۵ ترند برتر فین‌تک در سال جدید همراه با راهکارهای کاربردی..."
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'در حال تولید...' : 'تولید با AI'}</span>
              </button>
            </div>

            {/* Tone Presets Selector */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                لحن نگارش (Tone Preset):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TONE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedTone(preset);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedTone.id === preset.id
                        ? 'bg-sky-500/20 border border-sky-400 text-sky-300 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STUDIO SUB-TABS: CONTENT / MEDIA / CTA */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTabSection('content')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTabSection === 'content'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>متن و نگارش پست</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSection('media')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTabSection === 'media'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <Film className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <span>رسانه‌های چندگانه</span>
              <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                activeTabSection === 'media' ? 'bg-white/20 text-white' : 'bg-slate-800 text-sky-400'
              }`}>
                {mediaItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSection('cta')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTabSection === 'cta'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>دکمه شیشه‌ای (CTA)</span>
            </button>
          </div>

          {/* SECTION 1: CONTENT TAB */}
          {activeTabSection === 'content' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">
                  متن پست تلگرام (پشتیبانی از فرمت Markdown):
                </label>
                <div className="flex items-center gap-2">
                  {/* SMART CONTENT OPTIMIZER BUTTON IN TEXTAREA HEADER */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setOptimizerModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 via-sky-500/15 to-indigo-500/15 border border-sky-500/30 hover:border-sky-400 text-sky-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer shadow-sm group"
                    title="ارزیابی و بهینه‌سازی هوشمند لحن، خوانایی و تعامل با ایجنت هوش مصنوعی"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                    <span>بهینه‌ساز هوشمند محتوا (AI)</span>
                  </button>

                  {/* SEO KEYWORD AUDITOR TOGGLE IN TEXTAREA HEADER */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setShowSeoAuditor(!showSeoAuditor);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-sm ${
                      showSeoAuditor
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-emerald-300'
                    }`}
                    title="مشاهده و پایش کلمات کلیدی LSI و شاخص سئوی تلگرام"
                  >
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>حسابرس LSI ({lsiScore}٪)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی متن</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-sky-500 resize-none font-sans"
                placeholder="متن پست را اینجا بنویسید یا ویرایش کنید..."
              />

              {/* Target Channel */}
              <div className="pt-2">
                <label className="text-[11px] text-slate-400 block mb-1">کانال مقصد انتشار:</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.username}>
                      {ch.title} ({ch.username}) • ربات: {ch.bot}
                    </option>
                  ))}
                </select>
              </div>

              {/* DEDICATED SEO KEYWORD AUDITOR COMPONENT */}
              {showSeoAuditor && (
                <div className="pt-2">
                  <SEOKeywordAuditor
                    topic={topic}
                    content={content}
                    onInsertKeyword={handleInsertKeywordFromAuditor}
                    onInsertMultipleKeywords={handleInsertMultipleKeywordsFromAuditor}
                    onUpdateLsiScore={(score) => setLsiScore(score)}
                    defaultExpanded={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: MULTI-MEDIA MANAGER (IMAGES & VIDEOS) */}
          {activeTabSection === 'media' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">مدیریت فایل‌های چندرسانه‌ای محلی</h3>
                    <p className="text-[11px] text-slate-400">
                      بارگذاری مستقیم عکس‌ها و ویدیوهای سیستم شما با پیش‌نمایش آنی در آلبوم
                    </p>
                  </div>
                </div>

                <div className="text-left text-[11px] text-slate-400">
                  <span className="font-mono text-white font-bold">{mediaItems.length}</span>
                  <span className="mr-1">از ۱۰ فایل مجاز</span>
                </div>
              </div>

              {/* DEDICATED MEDIA MANAGER COMPONENT */}
              <MediaManager
                mediaItems={mediaItems}
                onChange={(updatedItems) => {
                  setMediaItems(updatedItems);
                }}
                maxFiles={10}
              />
            </div>
          )}

          {/* SECTION 3: INLINE BUTTON (CTA) */}
          {activeTabSection === 'cta' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in">
              <h3 className="text-xs font-bold text-white mb-2">دکمه شیشه‌ای (Inline Keyboard) زیر پست</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">عنوان دکمه:</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="مثال: مطالعه متن کامل در سایت"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">آدرس اینترنتی دکمه (URL):</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM CONTROL & ACTION BAR */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
              <span>
                کاراکترها: <span className="font-mono font-bold text-white">{content.length}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <span>پیوست:</span>
                <span className="font-bold text-sky-400">
                  {mediaItems.length > 0
                    ? `${mediaItems.length} رسانه (${imageCount} عکس / ${videoCount} ویدیو)`
                    : 'صرفاً متن'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* SMART CONTENT OPTIMIZER BUTTON */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setOptimizerModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 via-sky-600/20 to-indigo-600/20 hover:from-amber-600/30 hover:to-indigo-600/30 text-sky-200 hover:text-white font-bold text-xs border border-sky-500/30 transition-all cursor-pointer shadow-sm group"
                title="تحلیل هوشمند لحن، خوانایی و تعامل با ایجنت هوش مصنوعی قبل از ذخیره در پیش‌نویس"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>بهینه‌ساز هوشمند (AI)</span>
              </button>

              {/* A/B TEST BUTTON */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setAbTestModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-bold text-xs border border-indigo-500/30 transition-all cursor-pointer shadow-sm"
                title="طراحی و مقایسه دو متغیر از پست (A/B Test) جهت اندازه‌گیری بازدهی"
              >
                <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
                <span>تست A/B</span>
              </button>

              {/* SEO KEYWORD AUDITOR ACTION BUTTON */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowSeoAuditor(!showSeoAuditor);
                  setActiveTabSection('content');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer shadow-sm ${
                  showSeoAuditor
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border-emerald-500/30'
                }`}
                title="حسابرس کلمات کلیدی سئو و LSI جهت رشد ارگانیک تلگرام"
              >
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>حسابرس سئو ({lsiScore}٪)</span>
              </button>

              {/* SAVE / MANAGE DRAFTS BUTTON */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setDraftsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold text-xs border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                title="ذخیره این پست به عنوان پیش‌نویس با نام دلخواه یا مشاهده پیش‌نویس‌ها"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>پیش‌نویس‌ها</span>
              </button>

              {/* ADD TO QUEUE BUTTON */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  const firstLine = content.split('\n')[0].replace(/[#*`_]/g, '').trim();
                  if (firstLine) setPostTitle(firstLine);
                  setQueueModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-bold text-xs border border-slate-700/80 transition-all cursor-pointer shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>افزودن به صف انتشار</span>
              </button>

              {/* IMMEDIATE DISPATCH BUTTON */}
              <button
                type="button"
                onClick={handlePublishNow}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 -rotate-12" />
                <span>ارسال فوری به کانال</span>
              </button>
            </div>
          </div>

          {/* Conditional Engagement Polls Manager */}
          {showPollManager && (
            <EngagementPollsManager
              onInsertPollToPost={(pollText) => {
                setContent((prev) => `${prev}\n\n${pollText}`);
              }}
            />
          )}
        </div>

        {/* Live Telegram Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              پیش‌نمایش زنده آلبوم و پست تلگرام
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              {mediaItems.length > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-medium">
                  آلبوم {mediaItems.length} تایی
                </span>
              )}
              <span>نمای واقعی کلاینت</span>
            </div>
          </div>

          <TelegramPostPreview
            text={content}
            mediaItems={mediaItems}
            ctaText={ctaText}
            ctaUrl={ctaUrl}
            lsiScore={lsiScore}
          />
        </div>
      </div>

      {/* MODAL: ADD TO PUBLISHING QUEUE */}
      {queueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">افزودن پست به صف زمان‌بندی انتشار</h3>
                  <p className="text-[11px] text-slate-400">تنظیم زمان ارسال خودکار توسط ربات ناشر</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQueueModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">عنوان پست در تقویم مدیریت:</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Target Channel */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">کانال و ربات منتشرکننده:</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                >
                  {channels.map((ch) => (
                    <option key={ch.id} value={ch.username}>
                      {ch.title} ({ch.username}) • ربات: {ch.bot}
                    </option>
                  ))}
                </select>
              </div>

              {/* Media Summary Badge */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">رسانه‌های پیوست شده:</span>
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  {mediaItems.length > 0 ? (
                    <>
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      <span>{mediaItems.length} فایل ({imageCount} عکس، {videoCount} ویدیو)</span>
                    </>
                  ) : (
                    <span>فقط متن (بدون رسانه)</span>
                  )}
                </span>
              </div>

              {/* Scheduled Time Presets */}
              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 block">زمان مدنظر برای انتشار خودکار:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduledPreset('10min')}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      scheduledPreset === '10min'
                        ? 'border-sky-500 bg-sky-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>۱۰ دقیقه دیگر</span>
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduledPreset('1hour')}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      scheduledPreset === '1hour'
                        ? 'border-sky-500 bg-sky-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>۱ ساعت دیگر</span>
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduledPreset('tonight')}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      scheduledPreset === 'tonight'
                        ? 'border-sky-500 bg-sky-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>امشب، ساعت ۲۱:۰۰</span>
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduledPreset('tomorrow')}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      scheduledPreset === 'tomorrow'
                        ? 'border-sky-500 bg-sky-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>فردا، ساعت ۱۰:۰۰</span>
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                  </button>
                </div>

                {/* Custom Time */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setScheduledPreset('custom')}
                    className={`text-[11px] mb-1.5 flex items-center gap-1 font-medium ${
                      scheduledPreset === 'custom' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>یا وارد کردن زمان دلخواه:</span>
                  </button>
                  {scheduledPreset === 'custom' && (
                    <input
                      type="text"
                      value={customScheduledTime}
                      onChange={(e) => setCustomScheduledTime(e.target.value)}
                      placeholder="مثال: دوشنبه، ساعت ۱۹:۳۰"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setQueueModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleAddToQueue}
                disabled={isAddingToQueue}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{isAddingToQueue ? 'در حال ثبت در صف...' : 'ثبت قطعی در صف انتشار'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAFTS MANAGER MODAL */}
      <DraftsManagerModal
        isOpen={draftsModalOpen}
        onClose={() => setDraftsModalOpen(false)}
        currentContent={content}
        currentTopic={topic}
        currentToneId={selectedTone.id}
        currentChannel={selectedChannel}
        currentCtaText={ctaText}
        currentCtaUrl={ctaUrl}
        currentLsiScore={lsiScore}
        currentMediaItems={mediaItems}
        onLoadDraft={handleLoadNamedDraft}
      />

      {/* SMART CONTENT OPTIMIZER MODAL */}
      <SmartContentOptimizerModal
        isOpen={optimizerModalOpen}
        onClose={() => setOptimizerModalOpen(false)}
        currentContent={content}
        currentTopic={topic}
        toneName={selectedTone.name}
        toneGuidance={selectedTone.promptGuidance}
        channel={selectedChannel}
        mediaItems={mediaItems}
        onApplyOptimizedContent={handleApplyOptimizedContent}
        onSaveAsDraft={handleSaveOptimizedAsDraft}
      />

      {/* A/B TEST MODAL */}
      <ABTestModal
        isOpen={abTestModalOpen}
        onClose={() => setAbTestModalOpen(false)}
        currentTitle={postTitle}
        currentContent={content}
        currentCtaText={ctaText}
        currentCtaUrl={ctaUrl}
        currentChannel={selectedChannel}
        mediaItems={mediaItems}
        onApplyVariantToStudio={(newContent, newTitle, newCta) => {
          setContent(newContent);
          if (newTitle) setPostTitle(newTitle);
          if (newCta) setCtaText(newCta);
          setFeedback('متغیر B با موفقیت در استودیو پست اعمال شد.');
          setTimeout(() => setFeedback(null), 4000);
        }}
        onPostScheduled={(msg) => {
          setFeedback(msg);
          setTimeout(() => setFeedback(null), 5000);
        }}
      />

      {/* GOOGLE CALENDAR MODAL */}
      <GoogleCalendarModal
        isOpen={googleCalendarModalOpen}
        onClose={() => setGoogleCalendarModalOpen(false)}
        onToast={(msg) => {
          setFeedback(msg);
          setTimeout(() => setFeedback(null), 4000);
        }}
      />
    </div>
  );
};
