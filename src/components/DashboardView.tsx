import React from 'react';
import {
  Layers,
  Send,
  Calendar,
  Sparkles,
  TrendingUp,
  Shield,
  ArrowUpRight,
  Radio,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { BotNetworkHealth } from './BotNetworkHealth';
import { ChannelEngagementTrends } from './ChannelEngagementTrends';
import { TelegramBotInfo } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface DashboardViewProps {
  onNewChannelClick: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNewChannelClick,
  onNavigateToTab,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* DASHBOARD HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900/90 to-blue-950/60 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مرکز فرماندهی اتوماسیون تلگرام</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              پایش بلادرنگ و اتوپایلوت کانال‌های تلگرام
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              مدیریت و سنجش زنده ارتباط ربات‌های اختصاصی تلگرام، کنترل صف‌های زمان‌بندی و پایش آپ‌تایم دیتاسنترها با دقت میلی‌ثانیه.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onNavigateToTab('scheduler');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>مشاهده صف انتشار (Scheduler)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onNewChannelClick();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>افزودن ربات و کانال جدید</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background light */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 7-DAY ENGAGEMENT TRENDS RECHARTS VISUALIZATION COMPONENT */}
      <ChannelEngagementTrends />

      {/* CORE REQUESTED COMPONENT: BOT NETWORK HEALTH VISUAL DASHBOARD */}
      <BotNetworkHealth
        onSelectBot={(bot: TelegramBotInfo) => {
          console.log('Selected bot:', bot);
        }}
      />

      {/* ADDITIONAL OPERATIONAL OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Content Publishing Activity */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">فعالیت امروز سیستم</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">۲۸ پست</div>
            <p className="text-xs text-slate-400 mt-0.5">
              ارسال موفق بدون خطا در ۵ کانال متصل
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>نرخ موفقیت ارسال:</span>
            <span className="text-emerald-400 font-bold font-mono">۱۰۰٪</span>
          </div>
        </div>

        {/* Card 2: Queued Posts in Scheduler */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">صف زمان‌بندی شده</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">۱۴ پست</div>
            <p className="text-xs text-slate-400 mt-0.5">
              آماده انتشار خودکار بر اساس ساعات اوج بازدید
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>پست بعدی:</span>
            <span className="text-sky-300 font-medium">ساعت ۱۹:۳۰ (کانال فناوری)</span>
          </div>
        </div>

        {/* Card 3: Bot API Flood Control Safety */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">امنیت ضداسپم تلگرام</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">امن (Safe)</div>
            <p className="text-xs text-slate-400 mt-0.5">
              فاصله هوشمند بین ارسال‌ها جهت پیشگیری از Rate-limit
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>وضعیت فلود کنترل:</span>
            <span className="text-emerald-400 font-medium">بدون لیمیت (۰ اخطار)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
