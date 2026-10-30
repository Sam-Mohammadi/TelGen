import React, { useState } from 'react';
import {
  TrendingUp,
  Eye,
  Users,
  Clock,
  Sparkles,
  ArrowUpRight,
  Flame,
  Search,
  ShieldAlert,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CompetitorIntelligenceViewProps {
  onModelPost?: (postText: string) => void;
}

export const CompetitorIntelligenceView: React.FC<CompetitorIntelligenceViewProps> = ({
  onModelPost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const competitors = [
    {
      id: 'comp-1',
      title: 'تک کرانچ فارسی',
      username: '@techcrunch_fa',
      members: '۴۸,۲۰۰',
      dailyPosts: '۶ پست/روز',
      avgViews: '۸.۲K',
      engagementRate: '۱۷.۲٪',
      topHour: '۲۱:۳۰',
      trendScore: '۹۴٪',
    },
    {
      id: 'comp-2',
      title: 'دنیای هوش مصنوعی',
      username: '@ai_world_iran',
      members: '۳۱,۵۰۰',
      dailyPosts: '۴ پست/روز',
      avgViews: '۶.۴K',
      engagementRate: '۲۰.۴٪',
      topHour: '۱۴:۰۰',
      trendScore: '۹۸٪',
    },
    {
      id: 'comp-3',
      title: 'سیگنال و تحلیل رمزارز',
      username: '@crypto_signals_ir',
      members: '۷۲,۰۰۰',
      dailyPosts: '۱۲ پست/روز',
      avgViews: '۱۴.۱K',
      engagementRate: '۱۹.۵٪',
      topHour: '۱۹:۱۵',
      trendScore: '۸۹٪',
    },
  ];

  const viralPosts = [
    {
      id: 'vp-1',
      sourceChannel: '@ai_world_iran',
      views: '۱۹.۴K',
      forwards: '۱,۴۲۰',
      time: 'دیروز ۲۰:۴۵',
      snippet: '🔥 فوری: مقایسه بنچمارک‌های مدل جدید استدلالی که تمامی رکوردهای ریاضی و کدنویسی را جابه‌جا کرد...',
      fullText: '🔥 فوری: مقایسه بنچمارک‌های مدل جدید استدلالی که تمامی رکوردهای ریاضی و کدنویسی را جابه‌جا کرد.\n\nاین مدل با تفکر زنجیره‌ای توانسته در حل مسائل پیچیده دقت ۹۸٪ ثبت کند.\n\n📌 نکات برجسته:\n• کاهش ۸۰ درصدی توهم مدل\n• اجرای سریع‌تر در کارهای سنگین\n• در دسترس بودن برای عموم توسعه‌دهندگان',
    },
    {
      id: 'vp-2',
      sourceChannel: '@techcrunch_fa',
      views: '۱۴.۲K',
      forwards: '۸۹۰',
      time: 'امروز ۱۱:۳۰',
      snippet: '📱 معرفی بهترین جایگزین‌های نرم‌افزارهای سنگین اداری که کاملا رایگان و متن‌باز هستند...',
      fullText: '📱 معرفی ۵ جایگزین رایگان و متن‌باز برای ابزارهای سنگین روزمره:\n\n۱. LibreOffice به‌جای MS Office\n۲. GIMP به‌جای Photoshop\n۳. OBS Studio به‌جای ابزارهای ضبط گران‌قیمت\n۴. Kdenlive به‌جای Premiere\n۵. Brave Browser به‌جای مرورگرهای پرمصرف',
    },
  ];

  const keywords = [
    { word: 'استدلال هوش مصنوعی', count: '۲۴ کانال' },
    { word: 'نوسانات بیت‌کوین', count: '۱۸ کانال' },
    { word: 'امنیت سایبری و نفوذ', count: '۱۵ کانال' },
    { word: 'ابزارهای سئو تلگرام', count: '۱۲ کانال' },
    { word: 'الگوریتم‌های پیشنهاد محتوا', count: '۹ کانال' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black text-white">هوش رقبا و تحلیل استراتژی کانال‌های تلگرام</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            رصد زنده ساعات انتشار، پست‌های وایرال‌شده، نرخ بازخورد و الگوبرداری هوشمند با هوش مصنوعی
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
            ۳ رقیب تحت رصد زنده
          </span>
        </div>
      </div>

      {/* Competitor Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.map((comp) => (
          <div
            key={comp.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{comp.title}</h4>
                <span className="text-[11px] text-purple-400 font-mono">{comp.username}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {comp.trendScore} نفوذ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">تعداد اعضا:</span>
                <span className="font-bold text-white mt-0.5 block">{comp.members}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">میانگین ویو:</span>
                <span className="font-bold text-sky-400 mt-0.5 block">{comp.avgViews}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">نرخ تعامل:</span>
                <span className="font-bold text-purple-400 mt-0.5 block">{comp.engagementRate}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">ساعت اوج انتشار:</span>
                <span className="font-bold text-amber-400 mt-0.5 block">{comp.topHour}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Viral Posts to Model & Trending Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Viral Posts (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              پست‌های وایرال رقبا با بالاترین فوروارد و تعامل
            </h3>
            <span className="text-[11px] text-slate-400">امکان الگوبرداری و بازنویسی فوری</span>
          </div>

          <div className="space-y-3">
            {viralPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-400">{post.sourceChannel}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 text-[11px]">{post.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>👁️ {post.views}</span>
                    <span>🔄 {post.forwards} فوروارد</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {post.snippet}
                </p>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onModelPost?.(post.fullText);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>الگوبرداری و بازنویسی اختصاصی برای کانال ما</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hot Topics & Keywords Cloud (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            موضوعات مشترک و کلیدواژه‌های پرتکرار رقبا
          </h3>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            {keywords.map((kw, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <span className="text-slate-200 font-semibold">{kw.word}</span>
                <span className="text-[10px] text-sky-400 font-mono px-2 py-0.5 rounded bg-sky-500/10">
                  {kw.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
