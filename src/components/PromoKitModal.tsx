import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Sparkles,
  Activity,
  PenTool,
  Calendar,
  TrendingUp,
  Monitor,
  Layout,
  Share2,
  CheckCircle2,
  Zap,
  Globe,
  Bot,
  MessageSquare,
  Flame,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { triggerHaptic } from '../utils/haptics';
import { TeleGenLogo } from './TeleGenLogo';

interface PromoKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkLatency?: number;
  onlineBotsCount?: number;
  totalBotsCount?: number;
}

type SlideType = 'network_health' | 'ai_studio' | 'scheduler' | 'trend_competitors';
type FrameType = 'macbook' | 'banner' | 'clean';

export const PromoKitModal: React.FC<PromoKitModalProps> = ({
  isOpen,
  onClose,
  networkLatency = 45,
  onlineBotsCount = 5,
  totalBotsCount = 5,
}) => {
  const [activeSlide, setActiveSlide] = useState<SlideType>('network_health');
  const [frameType, setFrameType] = useState<FrameType>('macbook');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copyImageSuccess, setCopyImageSuccess] = useState(false);
  const previewCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Handle PNG Image Download
  const handleDownloadImage = async () => {
    if (!previewCardRef.current) return;
    triggerHaptic('medium');
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewCardRef.current, {
        quality: 0.98,
        pixelRatio: 2, // crisp high DPI
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `TeleGen-Promo-${activeSlide}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      triggerHaptic('success');
    } catch (err) {
      console.warn('Notice capturing promo preview:', err);
      alert('خطا در ایجاد تصویر، لطفاً مجدداً امتحان نمایید.');
      triggerHaptic('warning');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!previewCardRef.current || !navigator.clipboard) return;
    triggerHaptic('medium');
    try {
      const dataUrl = await toPng(previewCardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopyImageSuccess(true);
      triggerHaptic('success');
      setTimeout(() => setCopyImageSuccess(false), 2500);
    } catch {
      // Fallback to regular download if clipboard API image writing isn't supported
      handleDownloadImage();
    }
  };

  // Marketing captions tailored to each slide
  const marketingCaptions: Record<SlideType, string> = {
    network_health: `🚀 پلتفرم هوشمند مدیریت و پایش شبکه ربات‌های تلگرام (TeleGen)

⚡️ مانیتورینگ لحظه‌ای اتصال، پینگ و آپ‌تایم ۹۹.۹۸٪
🌐 اتصال مستقیم به دیتاسنتر DC4 آمستردام تلگرام
🤖 پایش همزمان چندین کانال و ربات با سیستم خودترمیمی (Auto-Heal)
🛡 بدون قطعی، بدون افت سرعت و با امنیت بالا

🔗 تجربه زنده در AI Studio:
https://ais-pre-s77xezvddpvpoq5iespm67-375984097049.us-east1.run.app`,

    ai_studio: `✨ تولید محتوای وایرال تلگرام با هوش مصنوعی نسل جدید Gemini

✍️ نگارش خودکار پست‌های جذاب با ۵ لحن اختصاصی
🎯 تحلیل لحظه‌ای درصد پتانسیل وایرال شدن و امتیاز سئو
📱 پیش‌نمایش زنده در قالب کلاینت واقعی تلگرام همراه با دکمه‌های شیشه‌ای
⚡️ انتشار فوری یا انتقال به صف زمان‌بندی با یک کلیک

#هوش_مصنوعی #تلگرام #تولید_محتوا #TeleGen`,

    scheduler: `⏰ زمان‌بندی هوشمند ارسال پست در ساعات اوج بازدید تلگرام

📅 تقویم هفتگی و ماهانه با نشانگر ساعات طلایی تعامل
🔄 ارسال خودکار چندکاناله بدون نیاز به آنلاین بودن ادمین
📊 مانیتورینگ نوبت صف و تنظیم فواصل استاندارد جهت پیشگیری از اسپم
🎯 تضمین حداکثر بازدید و بازدهی کانال‌های شما

#اتوماسیون_تلگرام #مدیریت_کانال #مارکتینگ`,

    trend_competitors: `🔥 رادار ترند و دیده‌بان هوشمند کانال‌های تلگرام

📈 رصد لحظه‌ای موضوعات وایرال وب و جامعه تلگرام
🕵️‍♂️ آنالیز تعامل، رشد اعضا و الگوبرداری از پست‌های موفق رقبا
🔍 سیستم هوشمند پیشگیری از ارسال محتوای تکراری (Deduplication)
💡 تصمیم‌گیری هوشمندانه مبتنی بر داده‌های واقعی

#رشد_کانال #آنالیز_رقبا #ترند_تلگرام`,
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(marketingCaptions[activeSlide]);
    triggerHaptic('success');
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-sky-500/30 text-sky-400 shadow-md">
              <Share2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  استودیوی اسکرین‌شات و کیت تبلیغاتی پلتفرم
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  آماده انتشار
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تولید و دانلود موکاپ‌های فوق باکیفیت برای معرفی پلتفرم در تلگرام، اینستاگرام و شبکه‌های اجتماعی
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS BAR: SLIDE SELECTOR & FRAME TOGGLES */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* SLIDE BUTTONS */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveSlide('network_health');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                activeSlide === 'network_health'
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>پایش شبکه و ربات‌ها</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveSlide('ai_studio');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                activeSlide === 'ai_studio'
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>استودیو هوش مصنوعی</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveSlide('scheduler');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                activeSlide === 'scheduler'
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>تقویم زمان‌بندی هوشمند</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveSlide('trend_competitors');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                activeSlide === 'trend_competitors'
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>رادار ترند و رقبا</span>
            </button>
          </div>

          {/* FRAME TYPE SELECTION */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 px-2 font-medium">قاب:</span>
            <button
              type="button"
              onClick={() => setFrameType('macbook')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                frameType === 'macbook' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="قاب دسکتاپ مک‌بوک"
            >
              <Monitor className="w-3 h-3" />
              <span>دسکتاپ</span>
            </button>
            <button
              type="button"
              onClick={() => setFrameType('banner')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                frameType === 'banner' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="بنر تبلیغاتی ۱۶:۹"
            >
              <Layout className="w-3 h-3" />
              <span>بنر مارکتینگ</span>
            </button>
            <button
              type="button"
              onClick={() => setFrameType('clean')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                frameType === 'clean' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="رابط کاربری تمیز بدون حاشیه"
            >
              <span>ساده</span>
            </button>
          </div>
        </div>

        {/* MAIN BODY: PREVIEW CANVAS & MARKETING TEXT */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* THE CAPTURE CONTAINER */}
          <div className="flex justify-center">
            <div
              ref={previewCardRef}
              id="promo-capture-card"
              className={`w-full max-w-4xl transition-all duration-300 ${
                frameType === 'banner'
                  ? 'p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 border-2 border-sky-500/40 shadow-2xl relative overflow-hidden'
                  : frameType === 'macbook'
                  ? 'rounded-2xl bg-slate-950 border-2 border-slate-700 shadow-2xl overflow-hidden'
                  : 'rounded-2xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden p-4'
              }`}
            >
              {/* BANNER HEADER (Only in Banner Mode) */}
              {frameType === 'banner' && (
                <div className="mb-6 flex items-center justify-between border-b border-sky-500/20 pb-4">
                  <div className="flex items-center gap-3">
                    <TeleGenLogo size={44} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white tracking-wide">
                          TeleGen
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-300 border border-sky-500/40">
                          v2.5 PRO
                        </span>
                      </div>
                      <span className="text-xs text-sky-300/90 font-medium">
                        تولید محتوا؛ سریع، خودکار، بینهایت
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{onlineBotsCount}/{totalBotsCount} ربات آنلاین</span>
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      {networkLatency}ms DC4
                    </span>
                  </div>
                </div>
              )}

              {/* MACBOOK WINDOW HEADER (Only in Macbook Mode) */}
              {frameType === 'macbook' && (
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
                    <Globe className="w-3 h-3 text-sky-400" />
                    <span>telegen.app/dashboard/{activeSlide}</span>
                  </div>
                  <div className="w-10" />
                </div>
              )}

              {/* SLIDE 1: BOT NETWORK HEALTH & TELEGRAM DC4 STATUS */}
              {activeSlide === 'network_health' && (
                <div className="space-y-4 p-2 sm:p-4">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>پایداری شبکه (Uptime)</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-emerald-400">۹۹.۹۸٪</div>
                      <div className="text-[10px] text-slate-500 mt-1">میانگین ۳۰ روز گذشته</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>تاخیر تلگرام (Latency)</span>
                        <Zap className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-sky-400">{networkLatency} ms</div>
                      <div className="text-[10px] text-slate-500 mt-1">DC4 آمستردام (اروپا غربی)</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>ربات‌های فعال</span>
                        <Bot className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-purple-400">{onlineBotsCount} / {totalBotsCount}</div>
                      <div className="text-[10px] text-slate-500 mt-1">اتصال پایدار Webhook</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>مخاطبین تحت پوشش</span>
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-amber-400">+۱۳۲,۰۰۰</div>
                      <div className="text-[10px] text-slate-500 mt-1">در ۵ کانال تخصصی</div>
                    </div>
                  </div>

                  {/* Channel Bot Cards Preview */}
                  <div className="space-y-2">
                    <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-sky-500/40 flex items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                          ف
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">فناوری و هوش مصنوعی پلاس</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                              آنلاین - ۴۲ms
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">@TechGen_PublisherBot • @tech_insights_ir</div>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-300">۲۴,۸۵۰ عضو</div>
                          <div className="text-[10px] text-emerald-400 font-bold">دسترسی ادمین کامل</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                          ن
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">نبض کریپتو و تحلیل مالی</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                              آنلاین - ۴۸ms
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">@CryptoPulse_Bot • @crypto_radar_live</div>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-300">۴۱,۲۰۰ عضو</div>
                          <div className="text-[10px] text-emerald-400 font-bold">دسترسی ادمین کامل</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: AI STUDIO & TELEGRAM PREVIEW */}
              {activeSlide === 'ai_studio' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 sm:p-4">
                  {/* Left: AI Generator Controls */}
                  <div className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>موتور هوش مصنوعی Gemini 2.5</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        امتیاز وایرال: ۹۴/۱۰۰
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                      «تحلیل رویداد امروز: رونمایی از مدل هوش مصنوعی چندوجهی جدید با قابلیت پردازش بلادرنگ و تاثیر آن بر آینده توسعه نرم‌افزار...»
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        لحن: ژورنالیستی و جذاب
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        سئو LSI: عالی
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        دکمه‌های اینلاین فعال
                      </span>
                    </div>
                  </div>

                  {/* Right: Live Telegram Post Simulation */}
                  <div className="bg-[#182533] p-4 rounded-2xl border border-sky-500/30 shadow-lg space-y-3 text-right">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs">
                        ف
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">فناوری و هوش مصنوعی پلاس</div>
                        <div className="text-[10px] text-sky-300 font-mono">@tech_insights_ir</div>
                      </div>
                    </div>

                    <p className="text-xs text-white leading-relaxed">
                      🔥 <b>انقلاب جدید هوش مصنوعی در سال ۲۰۲۶:</b><br />
                      لحظاتی پیش شرکت‌های بزرگ از فناوری نوینی پرده برداشتند که سرعت تعامل ربات‌ها را تا ۵ برابر افزایش می‌دهد.<br /><br />
                      💡 <i>نکات کلیدی برای کسب‌وکارها:</i><br />
                      ۱. پاسخگویی خودکار بلادرنگ<br />
                      ۲. بهینه‌سازی خودکار نرخ تعامل کانال
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <div className="py-1.5 px-3 rounded-lg bg-[#2b5278] hover:bg-[#34628f] text-center text-xs font-bold text-white cursor-pointer shadow-sm">
                        🌐 مطالعه مقاله کامل در وب‌سایت
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="py-1 px-2 rounded-lg bg-[#2b5278]/80 text-center text-[11px] font-medium text-white">
                          💬 نظرات اعضا (۴۸)
                        </div>
                        <div className="py-1 px-2 rounded-lg bg-[#2b5278]/80 text-center text-[11px] font-medium text-white">
                          📢 عضویت در کانال
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>👁 ۱۲.۴K بازدید</span>
                      <span>۱۰:۴۵ ق.ظ</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: SMART SCHEDULER & PEAK HOURS */}
              {activeSlide === 'scheduler' && (
                <div className="space-y-4 p-2 sm:p-4">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <span>تقویم زمان‌بندی هوشمند ساعات طلایی (Peak Hours)</span>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                        ساعات اوج بازدید: ۱۸:۰۰ تا ۲۲:۳۰
                      </span>
                    </div>

                    {/* Timeline queue simulation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950 border-r-4 border-sky-500 border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>امروز - ساعت ۱۸:۳۰</span>
                          <span className="text-sky-400 font-bold">آماده ارسال</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">پست تحلیلی هوش مصنوعی</div>
                        <div className="text-[10px] text-slate-400 mt-1">ربات: @TechGen_PublisherBot</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border-r-4 border-emerald-500 border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>امروز - ساعت ۲۱:۰۰</span>
                          <span className="text-emerald-400 font-bold">اوج تعامل</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">گزارش روزانه ارزهای دیجیتال</div>
                        <div className="text-[10px] text-slate-400 mt-1">ربات: @CryptoPulse_Bot</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border-r-4 border-purple-500 border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>فردا - ساعت ۱۰:۰۰</span>
                          <span className="text-purple-400 font-bold">زمان‌بندی شده</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">اخبار مهم استارتاپ‌ها</div>
                        <div className="text-[10px] text-slate-400 mt-1">ربات: @StartupReporter_Bot</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 4: TREND RADAR & COMPETITORS INTELLIGENCE */}
              {activeSlide === 'trend_competitors' && (
                <div className="space-y-4 p-2 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                        <Flame className="w-4 h-4" />
                        <span>موضوعات ترند و داغ تلگرام (هم‌اکنون)</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="p-2 rounded-xl bg-slate-950 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">۱. آپدیت بزرگ بات‌های تلگرام ۲۰۲۶</span>
                          <span className="text-emerald-400 font-mono font-bold">+۴۲٪ رشد</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">۲. هوش مصنوعی محتواگذار خودکار</span>
                          <span className="text-emerald-400 font-mono font-bold">+۳۸٪ رشد</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">۳. تحلیل نوسان بیت‌کوین و طلا</span>
                          <span className="text-emerald-400 font-mono font-bold">+۲۵٪ رشد</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>دیده‌بان کانال‌های رقیب</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="p-2 rounded-xl bg-slate-950 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-200">کانال فناوری روز</div>
                            <div className="text-[10px] text-slate-400">میانگین ویو: ۱۵K</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                            الگوبرداری آماده
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-200">نبض بازار آنلاین</div>
                            <div className="text-[10px] text-slate-400">میانگین ویو: ۲۱K</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                            الگوبرداری آماده
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER BADGE (In All Frames) */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-2">
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-bold text-slate-200">TeleGen Telegram Automation</span>
                  <span className="hidden sm:inline">— دستیار حرفه‌ای ادمین‌های تلگرام</span>
                </div>
                <div className="font-mono text-[10px] text-sky-400">
                  ais-pre-s77xezvddpvpoq5iespm67-375984097049.us-east1.run.app
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS & MARKETING TEXT BOX */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* DOWNLOAD & COPY BUTTONS */}
            <div className="md:col-span-1 space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'در حال ایجاد تصویر HD...' : 'دانلود تصویر با کیفیت HD (PNG)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copyImageSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">تصویر در کلیپ‌بورد کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>کپی مستقیم تصویر (Copy Image)</span>
                  </>
                )}
              </button>
            </div>

            {/* MARKETING CAPTION BOX WITH COPY BUTTON */}
            <div className="md:col-span-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>متن تبلیغاتی آماده برای انتشار در کانال شما:</span>
                </span>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedCaption ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>کپی متن</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                value={marketingCaptions[activeSlide]}
                rows={4}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 leading-relaxed font-sans resize-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
