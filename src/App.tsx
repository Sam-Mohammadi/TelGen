import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SchedulerView } from './components/SchedulerView';
import { PostStudio } from './components/PostStudio';
import { CompetitorIntelligenceView } from './components/CompetitorIntelligenceView';
import { ContentRepurposingView } from './components/ContentRepurposingView';
import { DeduplicationView } from './components/DeduplicationView';
import { NewChannelModal } from './components/NewChannelModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { GeminiChatWidget } from './components/GeminiChatWidget';
import { ServerLogsModal } from './components/ServerLogsModal';
import { LicenseModal } from './components/LicenseModal';
import { TrendRadarModal } from './components/TrendRadarModal';
import { PromoKitModal } from './components/PromoKitModal';
import { GoogleCalendarModal } from './components/GoogleCalendarModal';
import { AppTab } from './components/HamburgerMenu';
import { Send, ShieldCheck, Sparkles, Radio } from 'lucide-react';
import { triggerHaptic } from './utils/haptics';
import { TeleGenLogo } from './components/TeleGenLogo';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [newChannelModalOpen, setNewChannelModalOpen] = useState(false);
  const [geminiChatModalOpen, setGeminiChatModalOpen] = useState(false);
  const [serverLogsModalOpen, setServerLogsModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [trendRadarModalOpen, setTrendRadarModalOpen] = useState(false);
  const [promoKitModalOpen, setPromoKitModalOpen] = useState(false);
  const [googleCalendarModalOpen, setGoogleCalendarModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [networkLatency, setNetworkLatency] = useState(48);
  const [studioInitialContent, setStudioInitialContent] = useState<string | null>(null);
  const [studioInitialChannel, setStudioInitialChannel] = useState<string | null>(null);
  const [onlineBotsCount, setOnlineBotsCount] = useState<number>(5);
  const [totalBotsCount, setTotalBotsCount] = useState<number>(5);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSendToStudio = (text?: string, channel?: string) => {
    if (text) setStudioInitialContent(text);
    if (channel) setStudioInitialChannel(channel);
    setActiveTab('studio');
  };

  const handleAddChannel = async (channelData: any) => {
    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelData),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`کانال «${channelData.channelName}» با موفقیت در دیتابیس ثبت و آنلاین شد.`);
        window.dispatchEvent(new CustomEvent('telegen_bots_updated'));
      } else {
        showToast(data.error || 'خطا در ثبت کانال');
      }
    } catch {
      showToast('خطا در ارتباط با سرور جهت ذخیره کانال');
    }
  };

  // Check health periodically to feed header pill
  useEffect(() => {
    const checkStatus = () => {
      fetch('/api/bots/health')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.summary) {
            setNetworkLatency(data.summary.averageLatencyMs || 45);
            setOnlineBotsCount(data.summary.onlineCount ?? 5);
            setTotalBotsCount(data.summary.totalBots ?? 5);
          }
        })
        .catch(() => {});
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);

    const handleUpdate = () => checkStatus();
    window.addEventListener('telegen_bots_updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('telegen_bots_updated', handleUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white font-sans">
      {/* GLOBAL HEADER WITH HAMBURGER MENU IN TOP-RIGHT */}
      <Header
        onNewChannelClick={() => setNewChannelModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGeminiChat={() => setGeminiChatModalOpen(true)}
        onOpenServerLogs={() => setServerLogsModalOpen(true)}
        onOpenLicense={() => setLicenseModalOpen(true)}
        onOpenTrendRadar={() => setTrendRadarModalOpen(true)}
        onOpenPromoKit={() => setPromoKitModalOpen(true)}
        networkLatency={networkLatency}
        onlineBotsCount={onlineBotsCount}
        totalBotsCount={totalBotsCount}
        onLatencyUpdate={(newLat) => {
          setNetworkLatency(newLat);
          showToast(`پینگ سراسری انجام شد: ${newLat} میلی‌ثانیه`);
        }}
        onQuickDraftToStudio={(draftText, chan) => {
          handleSendToStudio(draftText, chan);
          showToast('ایده یادداشت شده در استودیو محتوا بارگذاری شد.');
        }}
        onSelectChannelForPost={(chan) => {
          handleSendToStudio(undefined, chan);
          showToast(`کانال ${chan} برای نگارش پست جدید انتخاب شد.`);
        }}
        onOpenGoogleCalendar={() => setGoogleCalendarModalOpen(true)}
      />

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-sky-500/40 text-sky-300 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNewChannelClick={() => setNewChannelModalOpen(true)}
            onNavigateToTab={(tab: any) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'studio' && (
          <PostStudio
            initialContent={studioInitialContent}
            initialChannel={studioInitialChannel}
            onDispatchPost={(post) => {
              showToast(`پست با موفقیت به کانال ${post.channel} ارسال شد.`);
            }}
            onSchedulePost={(post) => {
              showToast(`پست با موفقیت به صف زمان‌بندی (${post.scheduledTime || 'زمان‌بندی‌شده'}) افزوده شد.`);
            }}
          />
        )}

        {activeTab === 'scheduler' && (
          <SchedulerView
            onOpenGoogleCalendar={() => setGoogleCalendarModalOpen(true)}
            onToast={showToast}
          />
        )}

        {activeTab === 'competitors' && (
          <CompetitorIntelligenceView
            onModelPost={(text) => {
              showToast('پست رقیب جهت الگوبرداری و بازنویسی به استودیو منتقل شد.');
              handleSendToStudio(text);
            }}
          />
        )}

        {activeTab === 'repurpose' && (
          <ContentRepurposingView
            onSendToStudio={(text) => {
              showToast('محتوای بازتولید شده به استودیو پست منتقل شد.');
              handleSendToStudio(text);
            }}
          />
        )}

        {activeTab === 'deduplication' && <DeduplicationView />}
      </main>

      {/* DOCKABLE / FLOATING GEMINI CHAT WIDGET */}
      <GeminiChatWidget
        onInsertToStudio={(text) => {
          showToast('متن چت‌بات در استودیو بارگذاری شد.');
          handleSendToStudio(text);
        }}
      />

      {/* FOOTER */}
      <footer className="w-full bg-slate-950/90 border-t border-slate-900 py-6 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TeleGenLogo size={24} />
            <span className="font-bold text-slate-300">TeleGen</span>
            <span className="text-sky-400/80 font-medium">— تولید محتوا؛ سریع، خودکار، بینهایت</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ۵ ربات فعال در شبکه
            </span>
            <span>نسخه v2.5 Pro</span>
          </div>
        </div>
      </footer>

      {/* MODAL: ADD NEW CHANNEL & BOT */}
      <NewChannelModal
        isOpen={newChannelModalOpen}
        onClose={() => setNewChannelModalOpen(false)}
        onAddChannel={handleAddChannel}
      />

      {/* MODAL: GEMINI CHATBOT & CUSTOM PROMPT CRAFTER */}
      <GeminiChatModal
        isOpen={geminiChatModalOpen}
        onClose={() => setGeminiChatModalOpen(false)}
        onInsertToStudio={(text) => {
          handleSendToStudio(text);
          showToast('محتوای چت‌بات Gemini در استودیو بارگذاری شد.');
        }}
        onToast={showToast}
      />

      {/* MODAL: LIVE SERVER LOGS */}
      <ServerLogsModal
        isOpen={serverLogsModalOpen}
        onClose={() => setServerLogsModalOpen(false)}
      />

      {/* MODAL: ACTIVE LICENSE INFO */}
      <LicenseModal
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
      />

      {/* MODAL: TREND RADAR */}
      <TrendRadarModal
        isOpen={trendRadarModalOpen}
        onClose={() => setTrendRadarModalOpen(false)}
        onUseTopic={(topic) => {
          showToast(`موضوع «${topic}» برای استودیو محتوا انتخاب شد.`);
          setActiveTab('studio');
        }}
      />

      {/* MODAL: PROMO KIT & MARKETING SCREENSHOTS */}
      <PromoKitModal
        isOpen={promoKitModalOpen}
        onClose={() => setPromoKitModalOpen(false)}
        networkLatency={networkLatency}
        onlineBotsCount={onlineBotsCount}
        totalBotsCount={totalBotsCount}
      />

      {/* MODAL: GOOGLE CALENDAR INTEGRATION */}
      <GoogleCalendarModal
        isOpen={googleCalendarModalOpen}
        onClose={() => setGoogleCalendarModalOpen(false)}
        onToast={showToast}
      />
    </div>
  );
}

export default App;
