import React, { useState } from 'react';
import {
  Layers,
  Link,
  Sparkles,
  ArrowRight,
  Send,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ContentRepurposingViewProps {
  onSendToStudio?: (text: string) => void;
}

export const ContentRepurposingView: React.FC<ContentRepurposingViewProps> = ({
  onSendToStudio,
}) => {
  const [sourceUrl, setSourceUrl] = useState('https://techcrunch.com/article-example');
  const [rawText, setRawText] = useState(
    'محققان دانشگاه استنفورد تکنیک جدیدی برای کاهش مصرف حافظه در مدل‌های هوش مصنوعی ارائه داده‌اند که بدون افت دقت، هزینه آموزش را تا ۴۰ درصد کاهش می‌دهد.'
  );
  const [repurposedPost, setRepurposedPost] = useState(
    '💡 **صرفه‌جویی ۴۰ درصدی در هزینه‌های پردازش هوش مصنوعی با الگوریتم جدید استنفورد!**\n\nامروز یکی از بزرگ‌ترین موانع توسعه مدل‌های زبان بزرگ برطرف شد:\n\n۱. بهینه‌سازی حافظه VRAM تا نصف مقادیر معمول\n۲. بدون حتی ۱ درصد افت دقت در استدلال‌های تخصصی\n۳. قابل پیاده‌سازی روی کارت‌های گرافیک مصرفی بازار\n\n📌 این اتفاق مسیر ورود استارتاپ‌های کوچک به رقابت با غول‌های فناوری را هموارتر می‌کند.\n\n#فناوری #هوش_مصنوعی #استارتاپ #تکنولوژی'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRepurpose = async () => {
    triggerHaptic('medium');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `متن یا خبر زیر را به یک پست ویروسی، جذاب و استاندارد تلگرامی بازتولید (Repurpose) کن:\n«${rawText}»\nشامل: قلاب هیجانی، ۳ نکته کلیدی با ایموجی، کال تو اکشن و هشتگ‌های تلگرام.`,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setRepurposedPost(data.reply);
        triggerHaptic('success');
      }
    } catch (e) {
      console.warn('Content repurposing request failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(repurposedPost);
    setCopied(true);
    triggerHaptic('light');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white">بازتولید هوشمند محتوا (Content Repurposing)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تبدیل مقالات وب، اخبار طولانی، توییت‌ها و ویدیوها به پست‌های تلگرامی پرمخاطب در چند ثانیه
          </p>
        </div>
      </div>

      {/* Grid: Source input & Repurposed output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Box */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Globe className="w-4 h-4 text-teal-400" />
            <span>منبع محتوا (لینک وب یا متن خام):</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">لینک خبر یا مقاله وب (اختیاری):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">متن خام یا خلاصه مقاله:</label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-teal-500 resize-none font-sans"
              placeholder="متن مقاله، مصاحبه یا یادداشت وبلاگ را اینجا وارد کنید..."
            />
          </div>

          <button
            type="button"
            onClick={handleRepurpose}
            disabled={isProcessing || !rawText.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'در حال بازتولید با هوش مصنوعی...' : 'بازتولید و تبدیل به پست تلگرام'}</span>
          </button>
        </div>

        {/* Repurposed Output Box */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                نتیجه بازتولید شده آماده انتشار تلگرام:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی پست</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans min-h-[200px]">
              {repurposedPost}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">بهینه‌سازی شده با فرمت تلگرام و ایموجی</span>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSendToStudio?.(repurposedPost);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600 border border-sky-500/30 text-sky-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span>انتقال به استودیو پست و زمان‌بندی</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
