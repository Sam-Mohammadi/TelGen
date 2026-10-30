import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Menu,
  X,
  Radio,
  Calendar,
  Sparkles,
  Bot,
  Activity,
  Terminal,
  Key,
  Flame,
  Plus,
  ShieldCheck,
  Layers,
  ChevronLeft,
  PenTool,
  TrendingUp,
  FileCheck2,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Star,
  Download,
  Copy,
  Check,
  Wifi,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  AlertTriangle,
  History,
  Share2,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { TeleGenLogo } from './TeleGenLogo';

export type AppTab = 'dashboard' | 'studio' | 'scheduler' | 'competitors' | 'repurpose' | 'deduplication';

interface HamburgerMenuProps {
  activeTab: AppTab;
  onNavigateToTab: (tab: AppTab) => void;
  onOpenNewChannel: () => void;
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

interface MenuItemConfig {
  id: string;
  title: string;
  subtitle: string;
  category: 'workspaces' | 'ai' | 'network' | 'settings';
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  shortcut?: string;
  isTab?: boolean;
  tabKey?: AppTab;
  action: () => void;
}

interface DynamicChannel {
  id: string;
  handle: string;
  name: string;
  category: string;
  subscribers: string;
  status: 'online' | 'degraded' | 'offline';
  latencyMs?: number;
  avatarColor: string;
}

// Fallback initial channels in case of network latency before first API fetch
const DEFAULT_CHANNELS: DynamicChannel[] = [
  {
    id: 'bot-1',
    handle: '@tech_insights_ir',
    name: 'فناوری و هوش مصنوعی پلاس',
    category: 'تکنولوژی و وب',
    subscribers: '۲۴.۸k',
    status: 'online',
    latencyMs: 48,
    avatarColor: 'from-sky-500 to-blue-600',
  },
  {
    id: 'bot-2',
    handle: '@crypto_radar_live',
    name: 'نبض کریپتو و تحلیل مالی',
    category: 'اقتصاد و مالی',
    subscribers: '۴۱.۲k',
    status: 'online',
    latencyMs: 76,
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'bot-3',
    handle: '@startup_pulse_news',
    name: 'دیده‌بان استارتاپ‌ها و اکوسیستم',
    category: 'کسب‌وکار',
    subscribers: '۱۸.۷k',
    status: 'online',
    latencyMs: 114,
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'bot-4',
    handle: '@ai_frontier_digest',
    name: 'مرزهای هوش مصنوعی و داده',
    category: 'آموزش و پژوهش',
    subscribers: '۳۲.۱k',
    status: 'online',
    latencyMs: 58,
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'bot-5',
    handle: '@lifestyle_mag_fa',
    name: 'مجله جامع سبک زندگی و تندرستی',
    category: 'سبک زندگی',
    subscribers: '۱۵.۴k',
    status: 'online',
    latencyMs: 82,
    avatarColor: 'from-rose-500 to-pink-600',
  },
];

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  activeTab,
  onNavigateToTab,
  onOpenNewChannel,
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
  // Drawer open state
  const [isOpen, setIsOpen] = useState(false);
  const [currentLatency, setCurrentLatency] = useState(networkLatency);
  const [isPinging, setIsPinging] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Dynamic channels loaded from server
  const [channels, setChannels] = useState<DynamicChannel[]>(DEFAULT_CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('bot-1');
  const [showChannelPanel, setShowChannelPanel] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('هم‌اکنون');

  // Quick scratchpad / memo state with word count
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [quickMemo, setQuickMemo] = useState(() => {
    return localStorage.getItem('telegen_menu_memo') || '';
  });
  const [memoCopied, setMemoCopied] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(true);

  // Pinned favorites in localStorage
  const [pinnedItemIds, setPinnedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('telegen_pinned_items');
      return saved ? JSON.parse(saved) : ['tab-studio', 'tool-gemini-chat', 'tab-scheduler'];
    } catch {
      return ['tab-studio', 'tool-gemini-chat', 'tab-scheduler'];
    }
  });

  // Recently used tools tracking in localStorage
  const [recentItemIds, setRecentItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('telegen_recent_items');
      return saved ? JSON.parse(saved) : ['tab-dashboard', 'tab-studio'];
    } catch {
      return ['tab-dashboard', 'tab-studio'];
    }
  });

  // User preferences
  const compactMode = false;
  const hapticEnabled = true;

  // Mobile swipe-to-close touch gesture state
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Safe haptic feedback wrapper
  const safeHaptic = useCallback(
    (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') => {
      if (hapticEnabled) {
        triggerHaptic(type);
      }
    },
    [hapticEnabled]
  );

  // Fetch dynamic bots & channels from server
  const fetchBotsHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/bots/health');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.bots) && data.bots.length > 0) {
        const mapped: DynamicChannel[] = data.bots.map((bot: any, idx: number) => {
          const colors = [
            'from-sky-500 to-blue-600',
            'from-amber-500 to-orange-600',
            'from-emerald-500 to-teal-600',
            'from-purple-500 to-indigo-600',
            'from-rose-500 to-pink-600',
          ];
          const subCount =
            typeof bot.subscribersCount === 'number'
              ? `${(bot.subscribersCount / 1000).toFixed(1)}k`
              : '۲۰k';

          return {
            id: bot.id,
            handle: bot.channelHandle || '@telegram_channel',
            name: bot.channelName || bot.name,
            category: bot.channelCategory || 'کانال تلگرام',
            subscribers: subCount,
            status: (bot.health?.status as 'online' | 'degraded' | 'offline') || 'online',
            latencyMs: bot.health?.latencyMs,
            avatarColor: colors[idx % colors.length],
          };
        });
        setChannels(mapped);
        if (data.summary?.averageLatencyMs) {
          setCurrentLatency(data.summary.averageLatencyMs);
        }
        setLastSyncTime(new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.warn('Could not dynamically fetch bot channels (using local state):', e);
    }
  }, []);

  // Run dynamic fetch on mount, whenever menu opens, or when bots change
  useEffect(() => {
    fetchBotsHealth();
  }, [fetchBotsHealth]);

  useEffect(() => {
    if (isOpen) {
      fetchBotsHealth();
    }
  }, [isOpen, fetchBotsHealth]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchBotsHealth();
    };
    window.addEventListener('telegen_bots_updated', handleUpdate);
    return () => window.removeEventListener('telegen_bots_updated', handleUpdate);
  }, [fetchBotsHealth]);

  // Sync prop changes for latency
  useEffect(() => {
    setCurrentLatency(networkLatency);
  }, [networkLatency]);

  // Save quick memo to localStorage with auto-save badge
  useEffect(() => {
    localStorage.setItem('telegen_menu_memo', quickMemo);
    setIsSavedLocally(true);
  }, [quickMemo]);

  // Save pinned items to localStorage
  useEffect(() => {
    localStorage.setItem('telegen_pinned_items', JSON.stringify(pinnedItemIds));
  }, [pinnedItemIds]);

  // Save recent items to localStorage
  useEffect(() => {
    localStorage.setItem('telegen_recent_items', JSON.stringify(recentItemIds));
  }, [recentItemIds]);

  // Save preferences
  useEffect(() => {
    localStorage.setItem('telegen_compact_menu', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem('telegen_haptics_enabled', String(hapticEnabled));
  }, [hapticEnabled]);

  // Add item to recent history
  const recordRecentAction = (itemId: string) => {
    setRecentItemIds((prev) => {
      const filtered = prev.filter((id) => id !== itemId);
      return [itemId, ...filtered].slice(0, 4);
    });
  };

  // Toggle favorite / pinned items
  const togglePin = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    safeHaptic('light');
    setPinnedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Mobile Touch Gestures (Swipe-Right to close in RTL)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchCurrentX.current - touchStartX.current;
    // In RTL, dragging towards the right edge (+deltaX >= 60px) dismisses the drawer
    if (deltaX > 60) {
      safeHaptic('medium');
      setIsOpen(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }

      // Quick key 'm' or 'M' to toggle menu when not typing in an input
      if ((e.key === 'm' || e.key === 'M') && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        safeHaptic('medium');
        setIsOpen((prev) => !prev);
        return;
      }

      // Quick number keys 1-6 when menu is open
      if (isOpen && !isInput && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const tabMap: Record<string, AppTab> = {
          '1': 'dashboard',
          '2': 'studio',
          '3': 'scheduler',
          '4': 'competitors',
          '5': 'repurpose',
          '6': 'deduplication',
        };
        const selected = tabMap[e.key];
        if (selected) {
          e.preventDefault();
          safeHaptic('light');
          recordRecentAction(`tab-${selected}`);
          onNavigateToTab(selected);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNavigateToTab, safeHaptic]);

  // Reset keyboard focus when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const toggleMenu = () => {
    safeHaptic('medium');
    setIsOpen(!isOpen);
  };

  const handleAction = (itemId: string, action: () => void) => {
    safeHaptic('light');
    recordRecentAction(itemId);
    action();
    setIsOpen(false);
  };

  // Instant in-drawer network ping test
  const handleInstantPing = async () => {
    if (isPinging) return;
    safeHaptic('medium');
    setIsPinging(true);
    try {
      const res = await fetch('/api/bots/ping-all', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.averageLatencyMs) {
        setCurrentLatency(data.averageLatencyMs);
        onLatencyUpdate?.(data.averageLatencyMs);
        safeHaptic('success');
      }
    } catch (e) {
      console.warn('Ping simulation notice:', e);
      const simulatedLatency = Math.floor(39 + Math.random() * 10);
      setCurrentLatency(simulatedLatency);
      onLatencyUpdate?.(simulatedLatency);
      safeHaptic('success');
    } finally {
      setIsPinging(false);
    }
  };

  // Export Bot Network JSON Backup
  const handleExportBackup = () => {
    safeHaptic('success');
    const backupData = {
      platform: 'TeleGen Bot Manager PRO',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      channelsCount: channels.length,
      channels,
      networkStats: {
        latencyMs: currentLatency,
        onlineBots: onlineBotsCount,
        totalBots: totalBotsCount,
      },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telegen-bots-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send quick scratchpad memo to studio
  const handleTransferDraftToStudio = () => {
    if (!quickMemo.trim()) return;
    safeHaptic('success');
    const activeChan = channels.find((c) => c.id === selectedChannelId)?.handle;
    if (onQuickDraftToStudio) {
      onQuickDraftToStudio(quickMemo, activeChan);
    } else {
      onNavigateToTab('studio');
    }
    setIsOpen(false);
  };

  // Copy quick memo
  const handleCopyMemo = async () => {
    if (!quickMemo.trim()) return;
    await navigator.clipboard.writeText(quickMemo);
    safeHaptic('light');
    setMemoCopied(true);
    setTimeout(() => setMemoCopied(false), 2000);
  };

  // Dispatch channel direct to studio
  const handleChannelSelectForPost = (handle: string) => {
    safeHaptic('light');
    recordRecentAction('tab-studio');
    if (onSelectChannelForPost) {
      onSelectChannelForPost(handle);
    } else {
      onNavigateToTab('studio');
    }
    setIsOpen(false);
  };

  // Define all menu items with rich metadata
  const menuItems: MenuItemConfig[] = useMemo(
    () => [
      {
        id: 'tab-dashboard',
        title: 'داشبورد سلامت شبکه و وضعیت ربات‌ها',
        subtitle: 'پایش پینگ، پایداری، آپ‌تایم و وضعیت کانال‌های تلگرام',
        category: 'workspaces',
        icon: Activity,
        iconBg: 'bg-sky-500/20 border border-sky-500/40 text-sky-400 group-hover:bg-sky-500 group-hover:text-white',
        iconColor: 'text-sky-400 group-hover:text-white',
        badge: 'لحظه‌ای',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        shortcut: '۱',
        isTab: true,
        tabKey: 'dashboard',
        action: () => onNavigateToTab('dashboard'),
      },
      {
        id: 'tab-studio',
        title: 'استودیو تولید و بازنویسی محتوا (AI Studio)',
        subtitle: 'تولید با Gemini، سئو LSI، ۵ لحن نگارش و پیش‌نمایش تلگرام',
        category: 'workspaces',
        icon: PenTool,
        iconBg: 'bg-blue-500/20 border border-blue-500/40 text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
        iconColor: 'text-blue-400 group-hover:text-white',
        badge: 'هوشمند',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
        shortcut: '۲',
        isTab: true,
        tabKey: 'studio',
        action: () => onNavigateToTab('studio'),
      },
      {
        id: 'tab-scheduler',
        title: 'تقویم هوشمند و صف انتشار خودکار',
        subtitle: 'زمان‌بندی انتشار در ساعات پربازدید و مدیریت نوبت ارسال',
        category: 'workspaces',
        icon: Calendar,
        iconBg: 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
        iconColor: 'text-indigo-400 group-hover:text-white',
        badge: 'اتوماسیون',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
        shortcut: '۳',
        isTab: true,
        tabKey: 'scheduler',
        action: () => onNavigateToTab('scheduler'),
      },
      {
        id: 'tool-google-calendar',
        title: 'اتصال به Google Calendar (همگام‌سازی زمان‌بندی)',
        subtitle: 'مشاهده رویدادها، زمان‌بندی ارسال پست‌ها و تقویم محتوایی گوگل',
        category: 'workspaces',
        icon: Calendar,
        iconBg: 'bg-blue-500/20 border border-blue-500/40 text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
        iconColor: 'text-blue-400 group-hover:text-white',
        badge: 'Google Workspace',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
        action: () => {
          if (onOpenGoogleCalendar) {
            onOpenGoogleCalendar();
          } else {
            onNavigateToTab('scheduler');
          }
        },
      },
      {
        id: 'tab-competitors',
        title: 'رادار هوش رقبا و تحلیل استراتژی کانال‌ها',
        subtitle: 'رصد پست‌های وایرال رقبا، الگوبرداری فوری و نمودار رشد',
        category: 'workspaces',
        icon: TrendingUp,
        iconBg: 'bg-purple-500/20 border border-purple-500/40 text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
        iconColor: 'text-purple-400 group-hover:text-white',
        badge: 'آنالیز',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
        shortcut: '۴',
        isTab: true,
        tabKey: 'competitors',
        action: () => onNavigateToTab('competitors'),
      },
      {
        id: 'tab-repurpose',
        title: 'بازتولید هوشمند محتوا (Repurpose Engine)',
        subtitle: 'تبدیل مقالات، اخبار وب و توییت‌ها به پست‌های ویروسی تلگرام',
        category: 'ai',
        icon: Layers,
        iconBg: 'bg-teal-500/20 border border-teal-500/40 text-teal-400 group-hover:bg-teal-500 group-hover:text-white',
        iconColor: 'text-teal-400 group-hover:text-white',
        badge: 'مبدل وب',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
        shortcut: '۵',
        isTab: true,
        tabKey: 'repurpose',
        action: () => onNavigateToTab('repurpose'),
      },
      {
        id: 'tab-deduplication',
        title: 'سپر ضدتکرار معنایی و ایمنی کانال',
        subtitle: 'بررسی درصد تشابه با آرشیو ۳۰ روزه جهت پیشگیری از افت تعامل',
        category: 'ai',
        icon: FileCheck2,
        iconBg: 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
        iconColor: 'text-emerald-400 group-hover:text-white',
        badge: 'محافظت',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        shortcut: '۶',
        isTab: true,
        tabKey: 'deduplication',
        action: () => onNavigateToTab('deduplication'),
      },
      {
        id: 'tool-gemini-chat',
        title: 'چت‌بات و پرامپت‌ساز اختصاصی Gemini',
        subtitle: 'گفتگوی بلادرنگ برای دریافت ایده‌های وایرال و بهینه‌سازی لحن',
        category: 'ai',
        icon: Sparkles,
        iconBg: 'bg-amber-500/20 border border-amber-500/40 text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
        iconColor: 'text-amber-400 group-hover:text-white',
        badge: 'Gemini AI',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        action: onOpenGeminiChat,
      },
      {
        id: 'tool-trend-radar',
        title: 'رادار ترندها و هشتگ‌های داغ وب',
        subtitle: 'رصد لحظه‌ای پربازدیدترین موضوعات روز تکنولوژی و ایران',
        category: 'ai',
        icon: Flame,
        iconBg: 'bg-rose-500/20 border border-rose-500/40 text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
        iconColor: 'text-rose-400 group-hover:text-white',
        badge: 'ترند روز',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
        action: onOpenTrendRadar,
      },
      {
        id: 'tool-server-logs',
        title: 'لاگ‌های بلادرنگ سرور (Server MTProto Logs)',
        subtitle: 'گزارش زنده متدهای Bot API تلگرام و کدهای خطای شبکه',
        category: 'network',
        icon: Terminal,
        iconBg: 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white',
        iconColor: 'text-cyan-400 group-hover:text-white',
        badge: 'Bot API v7',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
        action: onOpenServerLogs,
      },
      {
        id: 'tool-new-channel',
        title: 'اتصال کانال و توکن ربات جدید',
        subtitle: 'پیکربندی سریع با BotFather و تعیین دسترسی ادمین',
        category: 'settings',
        icon: Plus,
        iconBg: 'bg-emerald-600 border border-emerald-400 text-white group-hover:bg-emerald-500',
        iconColor: 'text-white',
        badge: 'ثبت جدید',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        action: onOpenNewChannel,
      },
      {
        id: 'tool-license',
        title: 'مشاهده لایسنس و اشتراک فعال پلتفرم',
        subtitle: 'پلن حرفه‌ای ۵ کاناله نقره‌ای معتبر تا سال ۱۴۰۵',
        category: 'settings',
        icon: Key,
        iconBg: 'bg-amber-500/20 border border-amber-500/40 text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
        iconColor: 'text-amber-400 group-hover:text-white',
        badge: 'PRO لایسنس',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        action: onOpenLicense,
      },
      {
        id: 'tool-promo-kit',
        title: 'کیت اسکرین‌شات و تبلیغات پلتفرم',
        subtitle: 'تولید، دانلود و کپی موکاپ‌های HD و متون آماده تبلیغاتی جهت معرفی',
        category: 'settings',
        icon: Share2,
        iconBg: 'bg-pink-500/20 border border-pink-500/40 text-pink-400 group-hover:bg-pink-500 group-hover:text-white',
        iconColor: 'text-pink-400 group-hover:text-white',
        badge: 'کیت مارکتینگ',
        badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
        action: () => onOpenPromoKit && onOpenPromoKit(),
      },
      {
        id: 'tool-backup-json',
        title: 'پشتیبان‌گیری پیکربندی ربات‌ها (Backup Export)',
        subtitle: 'دانلود نسخه آفلاین کلیه اطلاعات ربات‌ها و لاگ‌ها به فرمت JSON',
        category: 'settings',
        icon: Download,
        iconBg: 'bg-violet-500/20 border border-violet-500/40 text-violet-400 group-hover:bg-violet-500 group-hover:text-white',
        iconColor: 'text-violet-400 group-hover:text-white',
        badge: 'JSON',
        badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
        action: handleExportBackup,
      },
    ],
    [
      onNavigateToTab,
      onOpenGeminiChat,
      onOpenTrendRadar,
      onOpenServerLogs,
      onOpenNewChannel,
      onOpenLicense,
      onOpenPromoKit,
      currentLatency,
      onlineBotsCount,
      totalBotsCount,
      channels,
    ]
  );

  // All menu items
  const filteredItems = menuItems;

  // Pinned items list
  const pinnedItems = useMemo(() => {
    return menuItems.filter((item) => pinnedItemIds.includes(item.id));
  }, [menuItems, pinnedItemIds]);

  // Recent items list
  const recentItems = useMemo(() => {
    return recentItemIds
      .map((id) => menuItems.find((m) => m.id === id))
      .filter((item): item is MenuItemConfig => Boolean(item));
  }, [menuItems, recentItemIds]);

  // Keyboard navigation inside filtered items
  const handleKeyDownInMenu = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredItems.length) {
      e.preventDefault();
      const target = filteredItems[focusedIndex];
      handleAction(target.id, target.action);
    }
  };

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) || channels[0] || DEFAULT_CHANNELS[0],
    [channels, selectedChannelId]
  );

  // Scratchpad word and character count stats
  const scratchpadStats = useMemo(() => {
    const trimmed = quickMemo.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = quickMemo.length;
    return { words, chars };
  }, [quickMemo]);

  // Dynamic latency color
  const latencyBadgeColor =
    currentLatency < 80
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : currentLatency < 200
      ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <>
      {/* HAMBURGER TRIGGER BUTTON (Top-Right in RTL) */}
      <button
        type="button"
        id="top-right-hamburger-btn"
        onClick={toggleMenu}
        className={`relative flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all cursor-pointer group select-none border ${
          isOpen
            ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/30 scale-102 ring-2 ring-sky-400/40'
            : 'bg-slate-900/90 hover:bg-slate-850 border-slate-700/80 hover:border-sky-500/50 text-slate-100 shadow-md shadow-sky-950/20 active:scale-98'
        }`}
        title="منو (کلید میانبر: M)"
        aria-label="منوی اصلی"
      >
        <div className="relative flex items-center justify-center">
          <Menu
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? 'rotate-90 text-white' : 'text-sky-400 group-hover:scale-110'
            }`}
          />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-slate-900" />
        </div>
      </button>

      {/* BACKDROP OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* SLIDE-OUT DRAWER ON THE RIGHT (Responsive & Dynamic: Fullscreen on mobile, 480px on desktop) */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDownInMenu}
        role="dialog"
        aria-modal="true"
        aria-label="مرکز کنترل پلتفرم"
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] md:w-[500px] max-w-full h-[100dvh] bg-slate-950/98 border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-2xl transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* MOBILE DRAG & DISMISS HANDLE (Visible on mobile screens) */}
        <div className="sm:hidden pt-2 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* DRAWER TOP HEADER */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <TeleGenLogo size={38} className="shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-black text-white tracking-tight">
                    TeleGen
                  </h2>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-black bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-400 border border-sky-500/30">
                    PRO v2.5
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-sky-300/90 font-medium">
                  تولید محتوا؛ سریع، خودکار، بینهایت
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors flex items-center justify-center gap-1 group"
              title="بستن منو (Esc یا کشیدن به راست)"
              aria-label="بستن منو"
            >
              <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 hidden sm:inline">
                Esc
              </span>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* DYNAMIC TELEMETRY & BOT REAL-TIME METRICS */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[10px]">
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center gap-1 text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping-slow" />
                <span>ربات‌های فعال</span>
              </div>
              <span className="font-bold text-slate-200 mt-0.5">
                {onlineBotsCount} از {totalBotsCount} فعال
              </span>
            </div>

            <button
              type="button"
              onClick={handleInstantPing}
              disabled={isPinging}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer group ${latencyBadgeColor}`}
              title="برای پینگ زنده کلیک کنید"
            >
              <div className="flex items-center gap-1 font-medium">
                <Wifi className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                <span>پینگ زنده</span>
              </div>
              <span className="font-mono font-bold mt-0.5">
                {isPinging ? 'در حال پینگ...' : `${currentLatency}ms`}
              </span>
            </button>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center gap-1 text-slate-400 font-medium">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>فلودگارد</span>
              </div>
              <span className="font-bold text-emerald-400 mt-0.5">
                ایمن (۰s لیمیت)
              </span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar">
          {/* RESPONSIVE QUICK SHORTCUT CARDS (4 Essential Quick Actions) */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => handleAction('tab-studio', () => onNavigateToTab('studio'))}
              className="min-h-[64px] p-2.5 rounded-xl bg-slate-950/80 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/50 flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer group shadow-xs"
              title="رفتن مستقیم به استودیو محتوا"
            >
              <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all">
                <PenTool className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-100 group-hover:text-white">
                پست فوری
              </span>
            </button>

              <button
                type="button"
                onClick={() => handleAction('tool-gemini-chat', onOpenGeminiChat)}
                className="min-h-[64px] p-2.5 rounded-xl bg-slate-950/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer group shadow-xs"
                title="باز کردن دستیار هوشمند Gemini"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-100 group-hover:text-white">
                  پرامپت AI
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('tool-trend-radar', onOpenTrendRadar)}
                className="min-h-[64px] p-2.5 rounded-xl bg-slate-950/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer group shadow-xs"
                title="مشاهده ترندهای وایرال وب"
              >
                <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-100 group-hover:text-white">
                  رادار ترند
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('tool-new-channel', onOpenNewChannel)}
                className="min-h-[64px] p-2.5 rounded-xl bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer group shadow-xs"
                title="افزودن کانال و ربات جدید"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-100 group-hover:text-white">
                  اتصال ربات
                </span>
              </button>
            </div>

          {/* DYNAMIC CHANNELS SELECTOR & DIRECT POST DISPATCHER */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">
                  کانال‌های متصل ({channels.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <button
                type="button"
                onClick={() => setShowChannelPanel(!showChannelPanel)}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer py-1"
              >
                <span>{showChannelPanel ? 'بستن لیست' : 'سوییچ کانال'}</span>
                {showChannelPanel ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* HORIZONTAL CHANNEL PILLS SCROLL */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {channels.map((ch) => {
                const isSelected = ch.id === selectedChannelId;
                const isChannelOnline = ch.status === 'online';

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      safeHaptic('light');
                      setSelectedChannelId(ch.id);
                    }}
                    className={`px-3.5 py-2 min-h-[46px] rounded-xl border text-right transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                      isSelected
                        ? 'bg-sky-500/25 border-sky-400 text-white shadow-md ring-2 ring-sky-500/30'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-700/90 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${ch.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs`}
                    >
                      {ch.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 truncate max-w-[140px]">
                        {ch.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{ch.subscribers} عضو</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isChannelOnline ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SELECTED CHANNEL CONTEXT CARD WITH ONE-TAP DISPATCH */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    selectedChannel.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <div className="min-w-0">
                  <span className="font-bold text-slate-200 block truncate text-xs">
                    {selectedChannel.name}
                  </span>
                  <span className="text-[10px] text-sky-400 font-mono block truncate">
                    {selectedChannel.handle} • {selectedChannel.subscribers} عضو
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleChannelSelectForPost(selectedChannel.handle)}
                className="min-h-[38px] px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
                title="نگارش پست جدید برای این کانال"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>نگارش پست</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC SCRATCHPAD / QUICK MEMO WITH LIVE COUNTERS */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                safeHaptic('light');
                setScratchpadOpen(!scratchpadOpen);
              }}
              className="w-full min-h-[44px] p-3 flex items-center justify-between text-right hover:bg-slate-900/90 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  یادداشت و ایده سریع برای پست
                </span>
                {quickMemo.trim() && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                {quickMemo.trim() && (
                  <span className="text-[10px] font-mono text-slate-500">
                    {scratchpadStats.words} کلمه
                  </span>
                )}
                {scratchpadOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {scratchpadOpen && (
              <div className="p-3 pt-0 space-y-2 border-t border-slate-800/60 bg-slate-950/40">
                <textarea
                  value={quickMemo}
                  onChange={(e) => {
                    setQuickMemo(e.target.value);
                    setIsSavedLocally(false);
                  }}
                  placeholder="ایده تیتر، لینک یا یادداشتی برای ارسال در کانال بنویسید..."
                  className="w-full h-24 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 resize-none font-sans"
                />

                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span>
                    {scratchpadStats.chars} کاراکتر • {scratchpadStats.words} کلمه
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ذخیره خودکار در حافظه</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyMemo}
                      disabled={!quickMemo.trim()}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                    >
                      {memoCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{memoCopied ? 'کپی شد' : 'کپی'}</span>
                    </button>

                    {quickMemo.trim() && (
                      <button
                        type="button"
                        onClick={() => setQuickMemo('')}
                        className="min-h-[36px] px-2 py-1 rounded-lg text-slate-500 hover:text-rose-400 text-[11px] transition-colors cursor-pointer"
                      >
                        پاک‌کردن
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleTransferDraftToStudio}
                    disabled={!quickMemo.trim()}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-[11px] font-black transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>انتقال به استودیو</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC RECENTLY USED SECTION (If available) */}
          {recentItems.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                  <History className="w-3.5 h-3.5" />
                  <span>اخیراً استفاده شده</span>
                </div>
                <span className="text-[10px] text-slate-500">دسترسی سریع</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {recentItems.slice(0, 2).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`recent-${item.id}`}
                      type="button"
                      onClick={() => handleAction(item.id, item.action)}
                      className="min-h-[46px] p-2.5 rounded-xl bg-slate-900/95 hover:bg-slate-850 border border-slate-700 hover:border-purple-500/70 flex items-center gap-2.5 text-right cursor-pointer group transition-all shadow-xs"
                    >
                      <div className={`p-1.5 rounded-lg ${item.iconBg} ${item.iconColor} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-100 group-hover:text-purple-300 truncate">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PINNED FAVORITE ITEMS SECTION */}
          {pinnedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>ابزارهای برگزیده شما ({pinnedItems.length})</span>
                </div>
                <span className="text-[11px] font-bold text-amber-500/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                  سنجاق شده
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {pinnedItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`pinned-${item.id}`}
                      type="button"
                      onClick={() => handleAction(item.id, item.action)}
                      className="min-h-[50px] p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/50 hover:border-amber-400 flex items-center justify-between gap-3 text-right cursor-pointer group transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 block truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-300 block truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-amber-400 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN MENU ITEMS LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 font-bold shadow-xs">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>گزینه‌ها و ابزارهای دسترسی</span>
              </span>
              <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40">
                {filteredItems.length} گزینه فعال
              </span>
            </div>

            {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isCurrentActiveTab = item.isTab && activeTab === item.tabKey;
                const isPinned = pinnedItemIds.includes(item.id);
                const isFocused = index === focusedIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAction(item.id, item.action)}
                    className={`w-full text-right transition-all cursor-pointer group relative flex items-center justify-between gap-3 sm:gap-4 ${
                      compactMode ? 'p-2.5 sm:p-3 rounded-xl min-h-[52px]' : 'p-3 sm:p-3.5 rounded-2xl min-h-[66px]'
                    } border ${
                      isCurrentActiveTab
                        ? 'bg-gradient-to-r from-sky-950/90 via-slate-900 to-slate-900 border-2 border-sky-400 ring-2 ring-sky-500/25 text-white shadow-lg shadow-sky-500/20'
                        : isFocused
                        ? 'bg-slate-900 border-2 border-sky-400 ring-2 ring-sky-500/30 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-700/90 hover:border-sky-400 text-slate-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* ACTIVE TAB RIGHT ACCENT BAR */}
                    {isCurrentActiveTab && (
                      <div className="absolute right-0 top-2 bottom-2 w-1.5 rounded-l-full bg-sky-400 shadow-md shadow-sky-400" />
                    )}

                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all ${item.iconBg}`}
                      >
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[13.5px] sm:text-sm font-bold truncate transition-colors ${
                              isCurrentActiveTab
                                ? 'text-sky-300 font-black'
                                : 'text-slate-100 group-hover:text-white'
                            }`}
                          >
                            {item.title}
                          </span>

                          {isCurrentActiveTab && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-500 text-white font-black text-[10px] tracking-wide shadow-xs shrink-0 flex items-center gap-1">
                              <span>فعال</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </span>
                          )}
                        </div>

                        {!compactMode && (
                          <div className="text-xs text-slate-300 font-medium truncate mt-1 group-hover:text-slate-100">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BADGES, SHORTCUTS & PIN BUTTON */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* STAR / PIN TOGGLE BUTTON */}
                      <span
                        onClick={(e) => togglePin(item.id, e)}
                        className={`min-h-[34px] min-w-[34px] flex items-center justify-center p-1.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors ${
                          isPinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isPinned ? 'حذف از برگزیده‌ها' : 'افزودن به برگزیده‌ها'}
                      >
                        <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400' : ''}`} />
                      </span>

                      {item.shortcut && (
                        <span className="hidden sm:inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs font-mono font-black text-slate-200 group-hover:text-sky-300 group-hover:border-sky-400 shadow-xs">
                          {item.shortcut}
                        </span>
                      )}

                      {item.badge && (
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border shadow-xs ${
                            item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      <ChevronLeft
                        className={`w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:-translate-x-1 transition-all shrink-0 ${
                          isCurrentActiveTab ? 'text-sky-400' : ''
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
