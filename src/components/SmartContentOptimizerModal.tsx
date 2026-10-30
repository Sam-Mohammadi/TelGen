import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  CheckCircle,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Flame,
  Check,
  X,
  Copy,
  ArrowRight,
  Bookmark,
  RefreshCw,
  Lightbulb,
  Zap,
  HelpCircle,
  Sliders,
  ChevronRight,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { MediaItem } from '../types';

export interface OptimizationMetrics {
  tone: { score: number; label: string; critique: string };
  readability: { score: number; label: string; critique: string };
  engagement: { score: number; label: string; critique: string };
  viralHook: { score: number; label: string; critique: string };
}

export interface OptimizationResult {
  overallScore: number;
  metrics: OptimizationMetrics;
  suggestions: string[];
  improvedHeadline: string;
  optimizedContent: string;
  estimatedGrowth: string;
  interactiveQuestion?: string;
}

interface SmartContentOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  currentTopic: string;
  toneName: string;
  toneGuidance: string;
  channel: string;
  mediaItems: MediaItem[];
  onApplyOptimizedContent: (newContent: string) => void;
  onSaveAsDraft: (draftName: string, contentToSave: string) => void;
}

export const SmartContentOptimizerModal: React.FC<SmartContentOptimizerModalProps> = ({
  isOpen,
  onClose,
  currentContent,
  currentTopic,
  toneName,
  toneGuidance,
  channel,
  mediaItems,
  onApplyOptimizedContent,
  onSaveAsDraft,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'optimized' | 'comparison' | 'suggestions'>('optimized');
  const [copied, setCopied] = useState(false);
  const [saveDraftModalOpen, setSaveDraftModalOpen] = useState(false);
  const [draftName, setDraftName] = useState('');

  const runOptimization = async () => {
    setLoading(true);
    triggerHaptic('medium');

    try {
      const res = await fetch('/api/optimize-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentContent,
          topic: currentTopic,
          toneName,
          toneGuidance,
          channel,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
        triggerHaptic('success');
      }
    } catch (err) {
      console.warn('Optimization API call failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runOptimization();
    } else {
      setResult(null);
      setActiveTab('optimized');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerHaptic('light');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!result?.optimizedContent) return;
    triggerHaptic('success');
    onApplyOptimizedContent(result.optimizedContent);
    onClose();
  };

  const handleOpenSaveDraft = () => {
    triggerHaptic('light');
    const firstLine = (result?.optimizedContent || currentContent)
      .split('\n')[0]
      .replace(/[#*`_]/g, '')
      .trim();
    setDraftName(result?.improvedHeadline || firstLine || 'پیش‌نویس بهینه‌سازی‌شده با هوش مصنوعی');
    setSaveDraftModalOpen(true);
  };

  const handleConfirmSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim() || !result?.optimizedContent) return;
    triggerHaptic('success');
    onSaveAsDraft(draftName.trim(), result.optimizedContent);
    setSaveDraftModalOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-sky-500/20 to-indigo-500/20 border border-sky-400/30 text-sky-400 shadow-md">
              <Wand2 className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  بهینه‌ساز هوشمند محتوا (Smart Content Optimizer)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold">
                  AI Agent • Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تحلیل چندبعدی لحن، خوانایی در تلگرام و متریک‌های درگیری مخاطب قبل از ذخیره در پیش‌نویس
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runOptimization}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="تحلیل و بهینه‌سازی مجدد"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* LOADING STATE */}
          {loading && (
            <div className="p-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-amber-500/20 border-b-amber-400 animate-spin [animation-direction:reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">ایجنت هوش مصنوعی در حال ارزیابی پست...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  بررسی انطباق لحن «{toneName}»، شاخص اسکن سریع، نرخ توقف اسکرول و بازنویسی قلاب اولیه
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {/* RESULTS VIEW */}
          {!loading && result && (
            <>
              {/* TOP METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. TONE SCORE */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      همخوانی لحن
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono font-bold text-[11px]">
                      {result.metrics.tone.score}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{result.metrics.tone.label}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {result.metrics.tone.critique}
                  </p>
                </div>

                {/* 2. READABILITY */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      خوانایی در موبایل
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono font-bold text-[11px]">
                      {result.metrics.readability.score}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{result.metrics.readability.label}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {result.metrics.readability.critique}
                  </p>
                </div>

                {/* 3. ENGAGEMENT */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                      پتانسیل تعامل
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 font-mono font-bold text-[11px]">
                      {result.metrics.engagement.score}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{result.metrics.engagement.label}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {result.metrics.engagement.critique}
                  </p>
                </div>

                {/* 4. VIRAL HOOK */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      قدرت قلاب و تیتر
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-mono font-bold text-[11px]">
                      {result.metrics.viralHook.score}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{result.metrics.viralHook.label}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {result.metrics.viralHook.critique}
                  </p>
                </div>
              </div>

              {/* ESTIMATED GROWTH BANNER */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white font-bold block">
                      پیش‌بینی رشد بازدهی با اعمال نسخه بهینه‌سازی‌شده:
                    </span>
                    <span className="text-[11px] text-emerald-300 font-mono">
                      {result.estimatedGrowth}
                    </span>
                  </div>
                </div>

                {result.interactiveQuestion && (
                  <div className="text-left bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-xs">{result.interactiveQuestion}</span>
                  </div>
                )}
              </div>

              {/* TABS SELECTOR */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('optimized')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'optimized'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>متن بهینه‌سازی‌شده نهایی</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('comparison')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'comparison'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>مقایسه قبل و بعد (Side-by-Side)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('suggestions')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'suggestions'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>پیشنهادات استراتژیک ایجنت ({result.suggestions.length})</span>
                </button>
              </div>

              {/* TAB 1: OPTIMIZED TEXT */}
              {activeTab === 'optimized' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      متن بازنویسی‌شده توسط ایجنت برای بالاترین بازدهی:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.optimizedContent)}
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
                          <span>کپی متن بهینه‌شده</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-72 overflow-y-auto">
                    {result.optimizedContent}
                  </div>
                </div>
              )}

              {/* TAB 2: COMPARISON VIEW */}
              {activeTab === 'comparison' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                  {/* ORIGINAL */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>متن اولیه (پیش‌نویس خام):</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {currentContent.length} کاراکتر
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {currentContent}
                    </div>
                  </div>

                  {/* OPTIMIZED */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>نسخه بهینه‌شده (AI Optimized):</span>
                      <span className="font-mono text-[10px] text-emerald-300">
                        {result.optimizedContent.length} کاراکتر
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto shadow-inner">
                      {result.optimizedContent}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SUGGESTIONS CHECKLIST */}
              {activeTab === 'suggestions' && (
                <div className="space-y-2.5 animate-in fade-in">
                  {result.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3"
                    >
                      <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            می‌توانید نسخه بهینه‌شده را مستقیماً در استودیو اعمال کرده یا به عنوان پیش‌نویس ذخیره نمایید.
          </span>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              انصراف
            </button>

            {/* SAVE AS DRAFT */}
            <button
              type="button"
              onClick={handleOpenSaveDraft}
              disabled={!result}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold text-xs border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>ذخیره به عنوان پیش‌نویس</span>
            </button>

            {/* APPLY TO EDITOR */}
            <button
              type="button"
              onClick={handleApply}
              disabled={!result}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>اعمال در ویرایشگر استودیو</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK SAVE DRAFT SUB-MODAL */}
      {saveDraftModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">ذخیره نسخه بهینه‌شده به عنوان پیش‌نویس</h4>
              </div>
              <button
                type="button"
                onClick={() => setSaveDraftModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSaveDraft} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  نام پیش‌نویس برای ذخیره در Drafts Manager:
                </label>
                <input
                  type="text"
                  required
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="عنوان پیش‌نویس..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                این پست همراه با متن بهینه‌سازی‌شده، تنظیمات لحن «{toneName}»، کانال {channel} و کلیه رسانه‌های پیوست شده ذخیره خواهد شد.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSaveDraftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold cursor-pointer"
                >
                  ذخیره در پیش‌نویس‌ها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
