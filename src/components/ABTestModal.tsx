import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Sparkles,
  Send,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Flame,
  MousePointerClick,
  Eye,
  Trophy,
  X,
  RefreshCw,
  Sliders,
  Layers,
  Check,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { MediaItem, ABTestRecord, ABTestComparisonMetrics } from '../types';
import { getAllABTests, saveABTest, deleteABTest } from '../utils/abTestStorage';

interface ABTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentContent: string;
  currentCtaText: string;
  currentCtaUrl: string;
  currentChannel: string;
  mediaItems: MediaItem[];
  onApplyVariantToStudio?: (content: string, title?: string, ctaText?: string) => void;
  onPostScheduled?: (msg: string) => void;
}

export const ABTestModal: React.FC<ABTestModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  currentContent,
  currentCtaText,
  currentCtaUrl,
  currentChannel,
  mediaItems,
  onApplyVariantToStudio,
  onPostScheduled,
}) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'analytics'>('setup');
  const [testName, setTestName] = useState('');
  const [testGoal, setTestGoal] = useState<'ctr' | 'views' | 'reactions'>('ctr');
  const [splitRatio, setSplitRatio] = useState<number>(50);

  // Variant A State (From current drafted post)
  const [titleA, setTitleA] = useState('');
  const [contentA, setContentA] = useState('');
  const [ctaTextA, setCtaTextA] = useState('');

  // Variant B State (Challenger)
  const [titleB, setTitleB] = useState('');
  const [contentB, setContentB] = useState('');
  const [ctaTextB, setCtaTextB] = useState('');
  const [strategySummary, setStrategySummary] = useState('');

  // AI Generator state
  const [isGeneratingB, setIsGeneratingB] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<'hook' | 'tone' | 'cta' | 'concise'>('hook');

  // Submitting / Queue state
  const [isScheduling, setIsScheduling] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Existing tests list for analytics tab
  const [savedTests, setSavedTests] = useState<ABTestRecord[]>([]);
  const [selectedTestRecord, setSelectedTestRecord] = useState<ABTestRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      const defaultTitle = currentTitle || currentContent.split('\n')[0].replace(/[#*`_]/g, '').trim() || 'پست تحلیلی استودیو';
      setTitleA(defaultTitle);
      setContentA(currentContent);
      setCtaTextA(currentCtaText || 'مشاهده کامل');
      setTestName(`تست A/B: ${defaultTitle.substring(0, 35)}...`);

      // Initialize Variant B with alternative hook
      if (!contentB) {
        setTitleB(`🔥 نسخه دوم: ${defaultTitle}`);
        setContentB(currentContent);
        setCtaTextB(currentCtaText ? `⚡️ ${currentCtaText}` : 'مشاهده تحلیل فوری');
      }

      loadSavedTests();
    }
  }, [isOpen, currentContent, currentTitle, currentCtaText]);

  const loadSavedTests = () => {
    const list = getAllABTests();
    setSavedTests(list);
    if (list.length > 0 && !selectedTestRecord) {
      setSelectedTestRecord(list[0]);
    }
  };

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleGenerateVariantB = async (strategy: 'hook' | 'tone' | 'cta' | 'concise') => {
    setIsGeneratingB(true);
    setSelectedStrategy(strategy);
    triggerHaptic('medium');

    try {
      const res = await fetch('/api/ab-test/generate-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalTitle: titleA,
          originalContent: contentA,
          originalCta: ctaTextA,
          channel: currentChannel,
          strategy,
        }),
      });
      const data = await res.json();
      if (data.success && data.variant) {
        setTitleB(data.variant.titleB || titleB);
        setContentB(data.variant.contentB || contentB);
        setCtaTextB(data.variant.ctaTextB || ctaTextB);
        setStrategySummary(data.variant.strategySummary || '');
        triggerHaptic('success');
        showToast('متغیر B با هوش مصنوعی و بر اساس فرضیه تست بازنویسی شد.');
      }
    } catch (err) {
      console.warn('AI Variant B error:', err);
    } finally {
      setIsGeneratingB(false);
    }
  };

  const handleScheduleABTest = async () => {
    if (!contentA.trim() || !contentB.trim()) {
      showToast('هر دو متغیر A و B باید دارای متن باشند.');
      return;
    }

    setIsScheduling(true);
    triggerHaptic('medium');

    const testId = `ab-test-${Date.now()}`;
    const postIdA = `post-ab-A-${Date.now()}`;
    const postIdB = `post-ab-B-${Date.now()}`;

    // 1. Post Variant A to Queue
    const postA = {
      id: postIdA,
      title: `[تست A/B • نسخه A] ${titleA}`,
      previewText: contentA,
      channelName: currentChannel,
      channelHandle: currentChannel,
      botUsername: '@TechGen_PublisherBot',
      scheduledTime: 'امروز، ساعت ۱۹:۰۰ (سگمنت ۵۰٪)',
      status: 'pending',
      mediaType: mediaItems.length > 1 ? 'album' : mediaItems.length === 1 ? 'photo' : 'text',
      mediaItems,
      imageUrl: mediaItems[0]?.url,
      ctaText: ctaTextA,
      ctaUrl: currentCtaUrl,
      abTest: {
        testId,
        variant: 'A',
        partnerVariantId: postIdB,
        testGoal,
        splitPercent: splitRatio,
      },
    };

    // 2. Post Variant B to Queue
    const postB = {
      id: postIdB,
      title: `[تست A/B • نسخه B] ${titleB}`,
      previewText: contentB,
      channelName: currentChannel,
      channelHandle: currentChannel,
      botUsername: '@TechGen_PublisherBot',
      scheduledTime: 'امروز، ساعت ۲۱:۳۰ (سگمنت ۵۰٪)',
      status: 'pending',
      mediaType: mediaItems.length > 1 ? 'album' : mediaItems.length === 1 ? 'photo' : 'text',
      mediaItems,
      imageUrl: mediaItems[0]?.url,
      ctaText: ctaTextB,
      ctaUrl: currentCtaUrl,
      abTest: {
        testId,
        variant: 'B',
        partnerVariantId: postIdA,
        testGoal,
        splitPercent: 100 - splitRatio,
      },
    };

    try {
      await fetch('/api/posts/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postA),
      });

      await fetch('/api/posts/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postB),
      });

      // Save record to A/B Tests Storage
      const newRecord: ABTestRecord = {
        id: testId,
        name: testName.trim() || 'تست مقایسه‌ای جدید',
        channelHandle: currentChannel,
        status: 'active',
        goal: testGoal,
        createdAt: new Date().toISOString(),
        strategySummary: strategySummary || 'مقایسه عملکرد دو نسخه متفاوت از نظر تیتر و ساختار فراخوان',
        variantA: {
          title: titleA,
          content: contentA,
          ctaText: ctaTextA,
          ctaUrl: currentCtaUrl,
          mediaCount: mediaItems.length,
          metrics: {
            views: 0,
            clicks: 0,
            reactions: 0,
            engagementRate: 0,
          },
        },
        variantB: {
          title: titleB,
          content: contentB,
          ctaText: ctaTextB,
          ctaUrl: currentCtaUrl,
          mediaCount: mediaItems.length,
          metrics: {
            views: 0,
            clicks: 0,
            reactions: 0,
            engagementRate: 0,
          },
        },
      };

      saveABTest(newRecord);
      window.dispatchEvent(new CustomEvent('telegen_queue_updated'));

      triggerHaptic('success');
      onPostScheduled?.(`تست A/B با موفقیت در صف انتشار قرار گرفت (هر دو نسخه A و B زمان‌بندی شدند).`);
      onClose();
    } catch (e) {
      console.warn('Queue scheduling error:', e);
      showToast('خطا در زمان‌بندی متغیرها');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleApplyVariantBToStudio = () => {
    triggerHaptic('success');
    onApplyVariantToStudio?.(contentB, titleB, ctaTextB);
    showToast('متغیر B در استودیو پست جایگزین شد.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-sky-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-400 shadow-md">
              <GitCompare className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  سامانه تست مقایسه‌ای محتوا (A/B Test Suite)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                  سنجش بازدهی و رشد تلگرام
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                طراحی دو متغیر از یک پست، ارسال زمان‌بندی‌شده به مخاطبان و اندازه‌گیری نرخ کلیک (CTR) و تعامل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {feedback && (
          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* TABS SELECTOR */}
        <div className="px-5 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'setup'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>تنظیم متغیرها (Variant A vs B)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('analytics');
              loadSavedTests();
            }}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>داشبورد نتایج و تحلیل متریک‌ها ({savedTests.length})</span>
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: SETUP VARIANTS */}
          {activeTab === 'setup' && (
            <div className="space-y-5">
              {/* TEST OBJECTIVE & SPLIT ROW */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">عنوان تست مقایسه‌ای:</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="مثال: تست تیتر سوالی در برابر خبری..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">هدف اصلی تست (Goal):</label>
                  <select
                    value={testGoal}
                    onChange={(e) => setTestGoal(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ctr">بیشترین نرخ کلیک دکمه (CTR)</option>
                    <option value="views">بیشترین بازدید و فوروارد (Views)</option>
                    <option value="reactions">بیشترین واکنش و اموجی (Reactions)</option>
                  </select>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">توزیع سگمنت (Split):</label>
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs text-white">
                    <span className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 font-bold">
                      A: {splitRatio}%
                    </span>
                    <span className="text-slate-500">/</span>
                    <span className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-violet-400 font-bold">
                      B: {100 - splitRatio}%
                    </span>
                  </div>
                </div>
              </div>

              {/* AI GENERATOR STRATEGY BAR FOR VARIANT B */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>تولید خودکار متغیر B با ایجنت هوش مصنوعی (AI Challenger):</span>
                  </span>
                  {isGeneratingB && (
                    <span className="text-xs text-sky-400 animate-pulse font-mono">
                      در حال تدوین متغیر جایگزین...
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isGeneratingB}
                    onClick={() => handleGenerateVariantB('hook')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>⚡️ قلاب شوکه‌کننده و سوالی</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingB}
                    onClick={() => handleGenerateVariantB('tone')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>💬 لحن صمیمی و خودمانی</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingB}
                    onClick={() => handleGenerateVariantB('cta')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>🎯 دکمه فراخوان (CTA) هیجانی</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingB}
                    onClick={() => handleGenerateVariantB('concise')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>📝 خلاصه سریع بولت‌پوینت</span>
                  </button>
                </div>

                {strategySummary && (
                  <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
                    💡 <span className="font-bold text-white">فرضیه تست:</span> {strategySummary}
                  </p>
                )}
              </div>

              {/* TWO COLUMN COMPARISON EDITOR: VARIANT A VS VARIANT B */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* VARIANT A (CONTROL) */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-mono font-black">
                        A
                      </span>
                      <span className="text-xs font-bold text-white">نسخه اصلی (Control)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                      {contentA.length} کاراکتر
                    </span>
                  </div>

                  {/* Title A */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">تیتر نسخه A:</label>
                    <input
                      type="text"
                      value={titleA}
                      onChange={(e) => setTitleA(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Content A */}
                  <div className="flex-1 flex flex-col">
                    <label className="text-[11px] text-slate-400 block mb-1">متن نسخه A:</label>
                    <textarea
                      rows={9}
                      value={contentA}
                      onChange={(e) => setContentA(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-sky-500 resize-none font-sans"
                    />
                  </div>

                  {/* CTA A */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">متن دکمه شیشه‌ای نسخه A:</label>
                    <input
                      type="text"
                      value={ctaTextA}
                      onChange={(e) => setCtaTextA(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* VARIANT B (CHALLENGER) */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 space-y-3 shadow-md flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-black">
                        B
                      </span>
                      <span className="text-xs font-bold text-white">متغیر مقایسه‌ای (Challenger)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-indigo-300 font-mono">
                      {contentB.length} کاراکتر
                    </span>
                  </div>

                  {/* Title B */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">تیتر متغیر B:</label>
                    <input
                      type="text"
                      value={titleB}
                      onChange={(e) => setTitleB(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Content B */}
                  <div className="flex-1 flex flex-col">
                    <label className="text-[11px] text-slate-400 block mb-1">متن متغیر B:</label>
                    <textarea
                      rows={9}
                      value={contentB}
                      onChange={(e) => setContentB(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-sans"
                    />
                  </div>

                  {/* CTA B */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">متن دکمه شیشه‌ای متغیر B:</label>
                    <input
                      type="text"
                      value={ctaTextB}
                      onChange={(e) => setCtaTextB(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS & METRICS COMPARISON */}
          {activeTab === 'analytics' && (
            <div className="space-y-5 animate-in fade-in">
              {savedTests.length === 0 ? (
                <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">هیچ تست A/B ثبتی یافت نشد</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    در تب «تنظیم متغیرها» دو نسخه دلخواه خود را آماده کرده و روی «زمان‌بندی و ثبت در صف انتشار» کلیک کنید تا آمار مقایسه‌ای در این بخش نمایش یابد.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* TEST SELECTOR CHIPS */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {savedTests.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTestRecord(t)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                          selectedTestRecord?.id === t.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{t.name}</span>
                        {t.status === 'completed' ? (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                            تکمیل
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px]">
                            در حال اجرا
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedTestRecord && (
                    <div className="space-y-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      {/* TEST SUMMARY HEADER */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div>
                          <h4 className="text-sm font-black text-white">{selectedTestRecord.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            کانال: <span className="font-mono text-sky-400">{selectedTestRecord.channelHandle}</span> • فرضیه: {selectedTestRecord.strategySummary}
                          </p>
                        </div>

                        {selectedTestRecord.winnerVariant && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span>برنده قطعی: متغیر {selectedTestRecord.winnerVariant} (+۵۱٪ بازدهی بالاتر)</span>
                          </div>
                        )}
                      </div>

                      {/* SIDE BY SIDE METRICS COMPARISON */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* METRICS VARIANT A */}
                        <div className={`p-4 rounded-xl border space-y-3 ${
                          selectedTestRecord.winnerVariant === 'A'
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-mono font-bold">
                                A
                              </span>
                              <span>نسخه کنترل (Variant A)</span>
                            </span>
                            {selectedTestRecord.winnerVariant === 'A' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                                🏆 برنده
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                              <div className="text-[10px] text-slate-400">بازدیدها</div>
                              <div className="text-sm font-mono font-bold text-white">
                                {selectedTestRecord.variantA.metrics.views.toLocaleString()}
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                              <div className="text-[10px] text-slate-400">کلیک دکمه (CTR)</div>
                              <div className="text-sm font-mono font-bold text-sky-300">
                                {selectedTestRecord.variantA.metrics.clicks}
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                              <div className="text-[10px] text-slate-400">نرخ تعامل</div>
                              <div className="text-sm font-mono font-bold text-amber-300">
                                {selectedTestRecord.variantA.metrics.engagementRate}%
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2">
                            {selectedTestRecord.variantA.content}
                          </p>
                        </div>

                        {/* METRICS VARIANT B */}
                        <div className={`p-4 rounded-xl border space-y-3 ${
                          selectedTestRecord.winnerVariant === 'B'
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-mono font-bold">
                                B
                              </span>
                              <span>متغیر جایگزین (Variant B)</span>
                            </span>
                            {selectedTestRecord.winnerVariant === 'B' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                                🏆 برنده
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                              <div className="text-[10px] text-slate-400">بازدیدها</div>
                              <div className="text-sm font-mono font-bold text-white">
                                {selectedTestRecord.variantB.metrics.views.toLocaleString()}
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                              <div className="text-[10px] text-slate-400">کلیک دکمه (CTR)</div>
                              <div className="text-sm font-mono font-bold text-sky-300">
                                {selectedTestRecord.variantB.metrics.clicks}
                              </div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                              <div className="text-[10px] text-slate-400">نرخ تعامل</div>
                              <div className="text-sm font-mono font-bold text-amber-300">
                                {selectedTestRecord.variantB.metrics.engagementRate}%
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2">
                            {selectedTestRecord.variantB.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            {activeTab === 'setup'
              ? 'با کلیک بر روی ثبت، هر دو نسخه A و B در صف زمان‌بندی ربات قرار می‌گیرند.'
              : 'آمار بازدیدها و کلیک‌ها پس از ارسال ربات به‌صورت زنده ثبت می‌شوند.'}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              انصراف
            </button>

            {activeTab === 'setup' && (
              <>
                <button
                  type="button"
                  onClick={handleApplyVariantBToStudio}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-bold text-xs border border-indigo-500/30 transition-all cursor-pointer"
                  title="جایگزینی متغیر B در ادیتور پست"
                >
                  اعمال متغیر B در استودیو
                </button>

                <button
                  type="button"
                  onClick={handleScheduleABTest}
                  disabled={isScheduling}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 -rotate-12" />
                  <span>{isScheduling ? 'در حال ثبت در صف...' : 'زمان‌بندی و ثبت تست A/B در صف'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
