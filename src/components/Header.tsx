import React from 'react';
import {
  Send,
  Radio,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Share2,
  Calendar,
} from 'lucide-react';
import { HamburgerMenu, AppTab } from './HamburgerMenu';
import { triggerHaptic } from '../utils/haptics';
import { TeleGenLogo } from './TeleGenLogo';

interface HeaderProps {
  onNewChannelClick: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenGeminiChat: () => void;
  onOpenServerLogs: () => void;
  onOpenLicense: () => void;
  onOpenTrendRadar: () => void;
  onOpenPromoKit?: () => void;
  networkLatency?: number;
  onlineBotsCount?: number;
  totalBotsCount?: number;
  onLatencyUpdate?: (newLatency: number) => void;
  onQuickDraftToStudio?: (text: string, channel?: string) => void;
  onSelectChannelForPost?: (channelHandle: string) => void;
  onOpenGoogleCalendar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewChannelClick,
  activeTab,
  setActiveTab,
  onOpenGeminiChat,
  onOpenServerLogs,
  onOpenLicense,
  onOpenTrendRadar,
  onOpenPromoKit,
  networkLatency = 48,
  onlineBotsCount = 5,
  totalBotsCount = 5,
  onLatencyUpdate,
  onQuickDraftToStudio,
  onSelectChannelForPost,
  onOpenGoogleCalendar,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* TOP-RIGHT IN RTL: HAMBURGER MENU WITH ALL FEATURES & BRAND LOGO */}
        <div className="flex items-center gap-3">
          {/* HAMBURGER MENU (TOP RIGHT) */}
          <HamburgerMenu
            activeTab={activeTab}
            onNavigateToTab={setActiveTab}
            onOpenNewChannel={onNewChannelClick}
            onOpenGeminiChat={onOpenGeminiChat}
            onOpenServerLogs={onOpenServerLogs}
            onOpenLicense={onOpenLicense}
            onOpenTrendRadar={onOpenTrendRadar}
            onOpenPromoKit={onOpenPromoKit}
            networkLatency={networkLatency}
            onlineBotsCount={onlineBotsCount}
            totalBotsCount={totalBotsCount}
            onLatencyUpdate={onLatencyUpdate}
            onQuickDraftToStudio={onQuickDraftToStudio}
            onSelectChannelForPost={onSelectChannelForPost}
            onOpenGoogleCalendar={onOpenGoogleCalendar}
          />

          {/* BRAND LOGO */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <TeleGenLogo size={42} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight group-hover:text-sky-300 transition-colors">
                  TeleGen
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-400 border border-sky-400/30">
                  PRO
                </span>
              </div>
              <p className="text-[11.5px] text-sky-300/90 font-medium hidden sm:block tracking-tight">
                تولید محتوا؛ سریع، خودکار، بینهایت
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: DESKTOP TABS */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('dashboard');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            داشبورد سلامت
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('studio');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            استودیو محتوا
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('scheduler');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'scheduler'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            زمان‌بندی
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('competitors');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'competitors'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            هوش رقبا
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('repurpose');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'repurpose'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            بازتولید
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('deduplication');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'deduplication'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ضدتکرار
          </button>
        </div>

        {/* LEFT IN RTL: LIVE NETWORK PILL & QUICK ACTIONS */}
        <div className="flex items-center gap-2.5">
          {/* Real-time Bot Network Health Pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-inner"
            title="وضعیت اتصال زنده شبکه ربات‌ها"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
            <span className="hidden sm:inline text-[11px] text-slate-400">شبکه ربات‌ها:</span>
            <span className="font-bold text-emerald-400 text-xs">پایدار</span>
            <span className="font-mono text-[10px] text-slate-500">({networkLatency}ms)</span>
          </div>

          {/* Google Calendar Integration Trigger */}
          {onOpenGoogleCalendar && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenGoogleCalendar();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="اتصال و همگام‌سازی با تقویم گوگل (Google Calendar)"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Google Calendar</span>
            </button>
          )}

          {/* Promo Kit & Screenshot Studio Trigger */}
          {onOpenPromoKit && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenPromoKit();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="تولید و دانلود اسکرین‌شات و کیت تبلیغاتی پلتفرم"
            >
              <Share2 className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden xl:inline">اسکرین‌شات تبلیغاتی</span>
            </button>
          )}

          {/* Quick Gemini Chat Trigger */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenGeminiChat();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            title="گفتگوی مستقیم با هوش مصنوعی جمنای"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">دستیار Gemini</span>
          </button>

          {/* Add Channel / Bot Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onNewChannelClick();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">اتصال کانال جدید</span>
            <span className="sm:hidden">کانال</span>
          </button>
        </div>
      </div>
    </header>
  );
};
