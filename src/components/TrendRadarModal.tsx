import React from 'react';
import { TrendingUp, Flame, Hash, Sparkles, X, ArrowUpRight, Share2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface TrendRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTopic?: (topic: string) => void;
}

export const TrendRadarModal: React.FC<TrendRadarModalProps> = ({ isOpen, onClose, onUseTopic }) => {
  if (!isOpen) return null;

  const hotTrends = [
    { title: 'مدل‌های جدید استدلالی Gemini و انقلاب در پردازش داده', category: 'فناوری', score: '۹۸٪ ترند', growth: '+۴۵٪' },
    { title: 'تحلیل سطوح مقاومتی بیت‌کوین و اتریوم در پایان هفته', category: 'کریپتو و بورس', score: '۹۴٪ ترند', growth: '+۳۸٪' },
    { title: 'جذب سرمایه‌های جدید استارتاپ‌های هوش مصنوعی سازمانی', category: 'کسب‌وکار', score: '۸۹٪ ترند', growth: '+۲۲٪' },
    { title: 'تکنیک‌های مدیریت زمان و افزایش بازدهی کاری در بهار', category: 'سبک زندگی', score: '۸۲٪ ترند', growth: '+۱۸٪' },
  ];

  const popularHashtags = [
    '#هوش_مصنوعی',
    '#تکنولوژی',
    '#بیت_کوین',
    '#استارتاپ',
    '#تحلیل_فاندامنتال',
    '#مدیریت_زمان',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">رادار ترندها و موضوعات داغ وب</h3>
              <p className="text-[11px] text-slate-400">رصد لحظه‌ای موضوعات وایرال جهت تولید محتوای کانال‌ها</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-2">
            <span className="font-bold text-slate-300">موضوعات داغ امروز (Viral Topics):</span>
            <div className="space-y-2">
              {hotTrends.map((trend, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
                      {trend.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {trend.category}
                      </span>
                      <span>•</span>
                      <span className="text-rose-400 font-bold">{trend.score}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">{trend.growth} رشد</span>
                    </div>
                  </div>

                  {onUseTopic && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        onUseTopic(trend.title);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
                    >
                      تولید پست
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trending Hashtags */}
          <div className="space-y-2">
            <span className="font-bold text-slate-300">هشتگ‌های برتر تلگرام:</span>
            <div className="flex flex-wrap gap-1.5">
              {popularHashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sky-400 font-mono text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
