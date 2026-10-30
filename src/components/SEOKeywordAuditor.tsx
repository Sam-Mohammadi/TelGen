import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Plus,
  RefreshCw,
  TrendingUp,
  Hash,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Zap,
  Tag,
  HelpCircle,
  Eye,
  Sliders,
  ExternalLink,
  Target,
  BarChart3,
  Flame,
  Award,
} from 'lucide-react';
import { LSIKeywordItem, SEOAuditResult, LSIKeywordCategory } from '../types';
import {
  auditDraftKeywords,
  convertToHashtag,
  requestAILSIKeywords,
} from '../services/seoKeywordAuditorService';
import { triggerHaptic } from '../utils/haptics';

interface SEOKeywordAuditorProps {
  topic: string;
  content: string;
  onInsertKeyword: (keyword: string, asHashtag?: boolean) => void;
  onInsertMultipleKeywords?: (keywords: string[]) => void;
  onUpdateLsiScore?: (score: number) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const SEOKeywordAuditor: React.FC<SEOKeywordAuditorProps> = ({
  topic,
  content,
  onInsertKeyword,
  onInsertMultipleKeywords,
  onUpdateLsiScore,
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'missing' | 'included' | 'queries' | 'hashtags'>('all');
  const [isScanningWithAI, setIsScanningWithAI] = useState(false);
  const [copiedCluster, setCopiedCluster] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showGrowthTips, setShowGrowthTips] = useState(false);
  const [showSearchSnippet, setShowSearchSnippet] = useState(false);

  // Perform dynamic real-time audit
  const auditResult: SEOAuditResult = useMemo(() => {
    return auditDraftKeywords(topic, content, customKeywords);
  }, [topic, content, customKeywords]);

  // Sync LSI score to parent PostStudio whenever it updates
  useEffect(() => {
    if (onUpdateLsiScore && auditResult.lsiScore) {
      onUpdateLsiScore(auditResult.lsiScore);
    }
  }, [auditResult.lsiScore, onUpdateLsiScore]);

  // Handle adding custom keyword to track
  const handleAddCustomKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (customKeywords.includes(trimmed)) {
      setActionFeedback('این کلیدواژه قبلاً اضافه شده است');
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }
    triggerHaptic('light');
    setCustomKeywords((prev) => [...prev, trimmed]);
    setCustomInput('');
    setActionFeedback(`کلیدواژه «${trimmed}» به حسابرس افزوده شد`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Remove custom keyword
  const handleRemoveCustomKeyword = (kw: string) => {
    triggerHaptic('light');
    setCustomKeywords((prev) => prev.filter((k) => k !== kw));
  };

  // 1-Click AI Deep Scan for LSI Keywords
  const handleAIScan = async () => {
    triggerHaptic('medium');
    setIsScanningWithAI(true);
    try {
      const result = await requestAILSIKeywords(topic, content);
      if (result && result.keywords && result.keywords.length > 0) {
        setCustomKeywords((prev) => {
          const merged = [...prev];
          result.keywords.forEach((kw) => {
            if (!merged.includes(kw)) merged.push(kw);
          });
          return merged;
        });
        triggerHaptic('success');
        setActionFeedback('کلیدواژه‌های پنهان معنایی (LSI) با هوش مصنوعی استخراج و به‌روزرسانی شد');
      } else {
        setActionFeedback('حسابرس با بانک اطلاعاتی غنی موضوعی بازخوانی گردید');
      }
    } catch {
      setActionFeedback('خطا در ارتباط با مدل هوش مصنوعی؛ از داده‌های سئوی محلی استفاده شد');
    } finally {
      setIsScanningWithAI(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Bulk Insert All Missing LSI Keywords as Hashtags
  const handleInsertAllMissingAsHashtags = () => {
    triggerHaptic('success');
    const missing = auditResult.keywords.filter((k) => !k.includedInDraft);
    if (missing.length === 0) {
      setActionFeedback('همه کلمات کلیدی LSI در حال حاضر در متن پیش‌نویس موجود هستند!');
      setTimeout(() => setActionFeedback(null), 3000);
      return;
    }

    const hashtags = missing.map((k) => convertToHashtag(k.keyword)).filter(Boolean);
    if (onInsertMultipleKeywords) {
      onInsertMultipleKeywords(hashtags);
    } else {
      hashtags.forEach((ht) => onInsertKeyword(ht, true));
    }

    setActionFeedback(`${hashtags.length} هشتگ ارگانیک LSI به انتهای پست اضافه شد! 🚀`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Copy full LSI cluster to clipboard
  const handleCopyCluster = () => {
    triggerHaptic('light');
    const textList = auditResult.keywords
      .map(
        (k) =>
          `• ${k.keyword} (${k.categoryLabel}) - رتبه ارتباط: ${k.relevance}% [${
            k.includedInDraft ? 'موجود' : 'غایب'
          }]`
      )
      .join('\n');
    const fullText = `📊 خوشه کلمات کلیدی LSI و سئوی تلگرام برای موضوع «${auditResult.primaryKeyword}»:\n\n${textList}\n\nنکات رشد:\n${auditResult.channelGrowthTips.join(
      '\n'
    )}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCluster(true);
    setTimeout(() => setCopiedCluster(false), 3000);
  };

  // Filtered keywords list
  const filteredKeywords = useMemo(() => {
    switch (activeFilter) {
      case 'missing':
        return auditResult.keywords.filter((k) => !k.includedInDraft);
      case 'included':
        return auditResult.keywords.filter((k) => k.includedInDraft);
      case 'queries':
        return auditResult.keywords.filter((k) => k.category === 'longtail');
      case 'hashtags':
        return auditResult.keywords.filter((k) => k.category === 'hashtag');
      default:
        return auditResult.keywords;
    }
  }, [auditResult.keywords, activeFilter]);

  const missingCount = auditResult.keywords.filter((k) => !k.includedInDraft).length;
  const includedCount = auditResult.keywords.filter((k) => k.includedInDraft).length;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        auditResult.lsiScore >= 80
          ? 'bg-slate-900/95 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
          : auditResult.lsiScore >= 60
          ? 'bg-slate-900/95 border-sky-500/30 shadow-lg shadow-sky-950/20'
          : 'bg-slate-900/95 border-amber-500/30 shadow-lg shadow-amber-950/20'
      } ${className}`}
    >
      {/* HEADER BAR */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              auditResult.lsiScore >= 80
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : auditResult.lsiScore >= 60
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>حسابرس کلمات کلیدی سئو و LSI تلگرام</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 font-mono font-normal border border-sky-500/20">
                  SEO Keyword Auditor
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              شناسایی خودکار مفاهیم پنهان معنایی (LSI) و عبارات پرتقاضای سرچ تلگرام برای رشد ارگانیک
            </p>
          </div>
        </div>

        {/* Score & Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* LSI Score Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              auditResult.lsiScore >= 85
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : auditResult.lsiScore >= 70
                ? 'bg-sky-950/60 border-sky-500/40 text-sky-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
            title="شاخص بهینه‌سازی کلمات کلیدی LSI و شانس دیده شدن در جستجوی سراسری تلگرام"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="text-[11px] font-sans">شاخص ارگانیک تلگرام:</span>
            <span className="font-mono text-sm">{auditResult.lsiScore}٪</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40">
              {auditResult.organicVisibilityLevel}
            </span>
          </div>

          {/* AI Scan Button */}
          <button
            type="button"
            onClick={handleAIScan}
            disabled={isScanningWithAI}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="اسکن عمیق هوش مصنوعی و استخراج کلیدواژه‌های جدید LSI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningWithAI ? 'animate-spin' : ''}`} />
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsExpanded(!isExpanded);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isExpanded ? 'کوچک‌کردن حسابرس' : 'گسترش حسابرس سئو'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ACTION FEEDBACK ALERT */}
      {actionFeedback && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* DENSITY WARNING */}
      {auditResult.densityWarning && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{auditResult.densityWarning}</span>
        </div>
      )}

      {/* EXPANDED CONTENT BODY */}
      {isExpanded && (
        <div className="p-4 space-y-4 animate-in fade-in">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Primary Keyword Card */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">کلیدواژه کانونی:</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-black text-white truncate max-w-[130px]" title={auditResult.primaryKeyword}>
                  {auditResult.primaryKeyword}
                </span>
                {auditResult.telegramSearchSnippet.hasPrimaryInFirst100 ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5" title="در ۹۰ کاراکتر اول پست موجود است (بهینه‌سازی عالی برای سرچ)">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>خط اول</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 flex items-center gap-0.5" title="پیشنهاد: کلیدواژه را در خط اول پست بگنجانید">
                    <AlertTriangle className="w-3 h-3" />
                    <span>بهبود خط ۱</span>
                  </span>
                )}
              </div>
            </div>

            {/* Coverage Card */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">پوشش کلمات LSI:</span>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-emerald-400 font-mono">{includedCount}</span>
                  <span className="text-xs text-slate-500 font-mono">/ {auditResult.totalLsiCount}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-sky-400">
                  {auditResult.coveragePercent}٪
                </span>
              </div>
            </div>

            {/* Organic Visibility Level */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">دیده‌شدن در سرچ تلگرام:</span>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`text-xs font-black ${
                    auditResult.lsiScore >= 80
                      ? 'text-emerald-400'
                      : auditResult.lsiScore >= 60
                      ? 'text-sky-400'
                      : 'text-amber-400'
                  }`}
                >
                  {auditResult.organicVisibilityLevel}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>اکسپلور</span>
                </span>
              </div>
            </div>

            {/* Hashtag Hygiene */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-medium">هشتگ‌های ساختاریافته:</span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-violet-400 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  <span>{auditResult.telegramSearchSnippet.hashtagCount} هشتگ</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {auditResult.telegramSearchSnippet.hashtagCount >= 2 && auditResult.telegramSearchSnippet.hashtagCount <= 6
                    ? 'استاندارد'
                    : 'نیاز به تنظیم'}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS & FILTER TABS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>همه کلمات</span>
                <span className="mr-1 font-mono text-[10px] opacity-80">({auditResult.keywords.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('missing')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'missing'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-800/80 text-amber-400/90 hover:text-amber-300'
                }`}
              >
                <span>نیازمند افزودن</span>
                <span className="font-mono text-[10px] px-1 rounded bg-black/30">{missingCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('included')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'included'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-emerald-400/90 hover:text-emerald-300'
                }`}
              >
                <span>موجود در متن</span>
                <span className="font-mono text-[10px] px-1 rounded bg-black/30">{includedCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('queries')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'queries'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-indigo-300/90 hover:text-indigo-200'
                }`}
              >
                <span>سرچ تلگرام</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('hashtags')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === 'hashtags'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-violet-300/90 hover:text-violet-200'
                }`}
              >
                <span>هشتگ‌ها</span>
              </button>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
              {/* Insert All Missing as Hashtags */}
              {missingCount > 0 && (
                <button
                  type="button"
                  onClick={handleInsertAllMissingAsHashtags}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                  title="درج تمام کلمات LSI غایب به عنوان هشتگ‌های ارگانیک در انتهای پیش‌نویس جهت افزایش رتبه"
                >
                  <Zap className="w-3 h-3" />
                  <span>افزودن غایب‌ها به عنوان هشتگ</span>
                </button>
              )}

              {/* Copy Cluster */}
              <button
                type="button"
                onClick={handleCopyCluster}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
                title="کپی خوشه کلمات کلیدی LSI"
              >
                {copiedCluster ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCluster ? 'کپی شد' : 'کپی خوشه'}</span>
              </button>

              {/* Toggle Snippet Preview */}
              <button
                type="button"
                onClick={() => setShowSearchSnippet(!showSearchSnippet)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                  showSearchSnippet
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="مشاهده پیش‌نمایش در نتایج جستجوی سراسری تلگرام"
              >
                <Eye className="w-3 h-3" />
                <span>پیش‌نمایش سرچ</span>
              </button>

              {/* Toggle Tips */}
              <button
                type="button"
                onClick={() => setShowGrowthTips(!showGrowthTips)}
                className={`p-1.5 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                  showGrowthTips
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="نکات الگوریتم رشد ارگانیک تلگرام"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TELEGRAM GLOBAL SEARCH SNIPPET SIMULATOR */}
          {showSearchSnippet && (
            <div className="p-3.5 rounded-xl bg-[#17212b] border border-sky-500/30 text-white space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-[#242f3d]">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Search className="w-3.5 h-3.5" />
                  <span>پیش‌نمایش در نتایج جستجوی سراسری تلگرام (Telegram Global Search)</span>
                </div>
                <span className="text-[10px] text-slate-500">شبیه‌سازی رتبه ۱ تا ۳</span>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                  TG
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-300 truncate">
                      {auditResult.telegramSearchSnippet.title || auditResult.primaryKeyword}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">14:32</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {auditResult.telegramSearchSnippet.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-medium">کانال عمومی تایید شده</span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">
                      تطابق کلیدواژه LSI: {auditResult.coveragePercent}٪
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TELEGRAM ALGORITHM GROWTH TIPS */}
          {showGrowthTips && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>فرمول طلایی الگوریتم تلگرام برای جذب مخاطب ارگانیک (SEO Hack):</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300 pr-4 list-disc">
                {auditResult.channelGrowthTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* LSI KEYWORDS GRID & CHIPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>کلمات کلیدی LSI و عبارات جستجو (روی هر واژه کلیک کنید):</span>
              <span className="text-[10px]">
                نمایش {filteredKeywords.length} مورد
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredKeywords.map((item) => {
                const isHashtag = item.category === 'hashtag';
                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-2 group ${
                      item.includedInDraft
                        ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-sky-500/40'
                    }`}
                  >
                    {/* Top Row: Keyword and Status */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {item.includedInDraft ? (
                          <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0" title="در متن پیش‌نویس موجود است">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-full bg-slate-800 text-slate-400 group-hover:text-sky-300 shrink-0" title="غایب - پیشنهاد افزودن به پیش‌نویس">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span
                          className={`text-xs font-bold truncate ${
                            item.includedInDraft ? 'text-emerald-300' : 'text-slate-200 group-hover:text-white'
                          }`}
                          title={item.keyword}
                        >
                          {item.keyword}
                        </span>
                      </div>

                      {/* Custom delete if user-added */}
                      {item.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomKeyword(item.keyword)}
                          className="text-slate-500 hover:text-rose-400 text-xs px-1 cursor-pointer"
                          title="حذف کلیدواژه سفارشی"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Middle Row: Badges & Volume */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {item.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-[9px]">
                        <span className="text-sky-400">حجم: {item.searchVolume}</span>
                        <span>•</span>
                        <span className="text-slate-500">{item.relevance}٪</span>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-1 flex items-center justify-between border-t border-slate-800/40 text-[10px]">
                      {item.includedInDraft ? (
                        <span className="text-emerald-400 font-bold font-mono">
                          {item.occurrences} بار در متن تکرار شده
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">نیاز به درج در متن</span>
                      )}

                      <div className="flex items-center gap-1">
                        {/* Insert Into Draft Button */}
                        {!item.includedInDraft && (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              onInsertKeyword(item.keyword, false);
                              setActionFeedback(`واژه «${item.keyword}» در متن پیش‌نویس درج شد.`);
                              setTimeout(() => setActionFeedback(null), 3000);
                            }}
                            className="px-2 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold transition-colors cursor-pointer"
                            title="درج مستقیم این واژه در پیش‌نویس پست"
                          >
                            + در متن
                          </button>
                        )}

                        {/* Add as Hashtag Button */}
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            const ht = isHashtag ? item.keyword : convertToHashtag(item.keyword);
                            onInsertKeyword(ht, true);
                            setActionFeedback(`هشتگ «${ht}» به انتهای پست اضافه گردید.`);
                            setTimeout(() => setActionFeedback(null), 3000);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer font-mono"
                          title="افزودن به عنوان هشتگ به انتهای پست"
                        >
                          #هشتگ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADD CUSTOM KEYWORD FORM */}
          <form onSubmit={handleAddCustomKeyword} className="pt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="افزودن کلمه کلیدی دلخواه یا ترند تلگرام به حسابرس سئو..."
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن کلیدواژه</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
