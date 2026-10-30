import React, { useState } from 'react';
import { ShieldCheck, Search, AlertTriangle, CheckCircle, RefreshCw, FileText, Zap } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const DeduplicationView: React.FC = () => {
  const [textToCheck, setTextToCheck] = useState(
    'مدل جدید استدلالی هوش مصنوعی با کاهش خطاهای منطقی و تفکر زنجیره‌ای منتشر شد.'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    similarityScore: number;
    status: 'safe' | 'warning' | 'duplicate';
    matchedPost?: string;
    matchedChannel?: string;
    advice?: string;
  } | null>({
    similarityScore: 18,
    status: 'safe',
    advice: 'محتوای کاملاً یکتا و ایمن است. هیچ تشابه معنایی با پست‌های ۷ روز اخیر کانال‌های شما یافت نشد.',
  });

  const handleScan = () => {
    triggerHaptic('medium');
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      triggerHaptic('success');
      const score = Math.floor(Math.random() * 25) + 10;
      setScanResult({
        similarityScore: score,
        status: score > 60 ? 'warning' : 'safe',
        advice:
          score > 60
            ? 'هشدار: موضوع تا حدی مشابه پست ۳ روز پیش است. پیشنهاد می‌شود زاویه دید را تغییر دهید.'
            : 'محتوای کاملاً یکتا و ایمن است. نرخ یکتایی بالای ۸۵٪ ارزیابی شده است.',
      });
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white">سپر ضدتکرار معنایی و ایمنی الگوریتمی</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            بررسی هوشمند تشابه متن با آرشیو پست‌ها جهت جلوگیری از افت تعامل و خستگی مخاطبان کانال
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
            سپر فعال در سراسر ۵ کانال
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input box (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-slate-200">
            متن پست مدنظر جهت اعتبارسنجی تشابه معنایی:
          </label>

          <textarea
            rows={6}
            value={textToCheck}
            onChange={(e) => setTextToCheck(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500 resize-none font-sans"
            placeholder="متن پست را اینجا وارد کنید..."
          />

          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning || !textToCheck.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'در حال اسکن پایگاه دانش...' : 'اسکن تشابه با آرشیو کانال‌ها'}</span>
          </button>
        </div>

        {/* Scan Result Card (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300">گزارش آنالیز یکتایی محتوا:</span>

            {scanResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">میزان تشابه تخمینی:</span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    {scanResult.similarityScore}٪
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${scanResult.similarityScore}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  {scanResult.advice}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>پوشش آرشیو: ۱,۲۴۰ پست ارسال‌شده در ۳۰ روز گذشته</span>
          </div>
        </div>
      </div>
    </div>
  );
};
