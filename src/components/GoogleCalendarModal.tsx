import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  X,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Send,
  LogOut,
  CalendarCheck,
  CalendarPlus,
  ShieldCheck,
  Sparkles,
  Filter,
  Search,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
  Bot,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  RotateCcw,
  Check,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { CalendarConfirmDialog } from './CalendarConfirmDialog';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  getAccessToken,
  GoogleCalendarEvent,
  getStatusColorId,
  getStatusColorConfig,
} from '../services/googleCalendarService';
import { ScheduledPost } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { User } from 'firebase/auth';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledPosts?: ScheduledPost[];
  onToast?: (message: string) => void;
}

export type CalendarStatusType = 'all' | 'pending' | 'published' | 'failed' | 'google_event';
export type ViewMode = 'calendar' | 'timeline' | 'channels';

export interface VisualCalendarItem {
  id: string;
  sourceType: 'scheduled_post' | 'google_event';
  title: string;
  previewText: string;
  channelName: string;
  channelHandle: string;
  botUsername?: string;
  scheduledTimeRaw: string;
  date: Date;
  dateKey: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  status: 'pending' | 'published' | 'failed' | 'google_event';
  mediaType?: string;
  imageUrl?: string;
  googleEventId?: string;
  htmlLink?: string;
  originalPost?: ScheduledPost;
}

// Convert Persian digits to English digits
const toEnglishDigits = (str: string): string => {
  return str.replace(/[۰-۹]/g, (w) => String.fromCharCode(w.charCodeAt(0) - 1728));
};

// Parse scheduled post time into a standard Date object
const parsePostDateTime = (scheduledTime: string, createdAt?: string, indexOffset = 0): { date: Date; timeStr: string } => {
  const now = new Date();
  const normalized = toEnglishDigits(scheduledTime || '').trim();

  let targetDate = new Date();
  let timeStr = '12:00';

  // Check for time like 19:30 or 12:00
  const timeMatch = normalized.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  if (normalized.includes('امروز') || normalized.includes('today')) {
    targetDate = new Date(now);
  } else if (normalized.includes('فردا') || normalized.includes('tomorrow')) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 1);
  } else if (normalized.includes('دیروز') || normalized.includes('yesterday')) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() - 1);
  } else if (normalized.includes('پس‌فردا')) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 2);
  } else if (createdAt) {
    const parsedCreated = new Date(createdAt);
    if (!isNaN(parsedCreated.getTime())) {
      targetDate = new Date(parsedCreated);
    }
  } else {
    // Default staggered offset for demo
    targetDate.setDate(now.getDate() + indexOffset);
  }

  // Set the extracted hours & minutes
  if (timeMatch) {
    targetDate.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
  } else {
    targetDate.setHours(12 + (indexOffset % 8), 0, 0, 0);
    timeStr = `${targetDate.getHours().toString().padStart(2, '0')}:00`;
  }

  return { date: targetDate, timeStr };
};

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  isOpen,
  onClose,
  scheduledPosts = [],
  onToast,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Queue posts from server or prop
  const [queuePosts, setQueuePosts] = useState<ScheduledPost[]>(scheduledPosts);
  const [loadingQueue, setLoadingQueue] = useState<boolean>(false);

  // Visualizer filters & view states
  const [statusFilter, setStatusFilter] = useState<CalendarStatusType>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  // Calendar month navigation
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Selected item detail popover/modal
  const [inspectItem, setInspectItem] = useState<VisualCalendarItem | null>(null);

  // New Event Form State
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [newEventTime, setNewEventTime] = useState('14:00');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventStatus, setNewEventStatus] = useState<'pending' | 'published' | 'failed'>('pending');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  // Confirmation dialogs
  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    affectedCount?: number;
    affectedList?: string[];
    actionType: 'delete' | 'sync' | 'update';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'sync',
    onConfirm: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Load latest posts from /api/posts/queue
  const fetchQueuePosts = async () => {
    setLoadingQueue(true);
    try {
      const res = await fetch('/api/posts/queue');
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setQueuePosts(data.posts);
      }
    } catch (err) {
      console.warn('Could not fetch latest queue posts:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchQueuePosts();

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setIsAuthenticated(!!token);
        if (token) {
          loadEvents();
        }
      },
      () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    );

    getAccessToken().then((token) => {
      if (token) {
        setIsAuthenticated(true);
        loadEvents();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    setErrorMessage(null);
    try {
      const fetchedEvents = await listCalendarEvents();
      setEvents(fetchedEvents);
    } catch (err: any) {
      console.error('Failed to load Google Calendar events:', err);
      if (err.message === 'TOKEN_EXPIRED' || err.message === 'NOT_AUTHENTICATED') {
        setIsAuthenticated(false);
        setErrorMessage('اعتبار نشست اتصال به تقویم منقضی شده است. لطفاً مجدداً وارد شوید.');
      } else {
        setErrorMessage(err.message || 'خطا در بارگذاری رویدادهای تقویم گوگل');
      }
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      triggerHaptic('medium');
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        triggerHaptic('success');
        if (onToast) onToast(`با موفقیت به حساب ${res.user.email} متصل شدید.`);
        loadEvents();
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      triggerHaptic('warning');
      setErrorMessage(err.message || 'خطا در فرآیند ورود به حساب گوگل.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    triggerHaptic('light');
    await logoutGoogle();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEvents([]);
    if (onToast) onToast('از حساب گوگل خارج شدید.');
  };

  // Update post status directly on server
  const handleUpdatePostStatus = async (postId: string, newStatus: 'pending' | 'published' | 'failed') => {
    triggerHaptic('medium');
    try {
      const res = await fetch(`/api/posts/queue/${postId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setQueuePosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
        );
        triggerHaptic('success');
        const cfg = getStatusColorConfig(newStatus);
        if (onToast) onToast(`وضعیت پست به «${cfg.label}» تغییر یافت.`);
        if (inspectItem && inspectItem.id === postId) {
          setInspectItem((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Create manual event
  const handleCreateNewEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    setIsCreatingEvent(true);
    try {
      const startDateTime = new Date(`${newEventDate}T${newEventTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000);

      const colorId = getStatusColorId(newEventStatus);
      const statusCfg = getStatusColorConfig(newEventStatus);

      await createCalendarEvent({
        summary: `[${statusCfg.label}] ${newEventTitle}`,
        description: `${newEventDesc || 'رویداد ثبت شده از TeleGen'}\nوضعیت اولیه: ${statusCfg.label}`,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        location: 'TeleGen Publishing Channel',
        colorId,
      });

      triggerHaptic('success');
      if (onToast) onToast('رویداد جدید با کد رنگی وضعیت به تقویم گوگل افزوده شد.');
      setNewEventTitle('');
      setNewEventDesc('');
      setShowAddEvent(false);
      loadEvents();
    } catch (err: any) {
      triggerHaptic('warning');
      setErrorMessage(err.message || 'خطا در افزودن رویداد به تقویم');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Delete event with user confirmation dialog (MANDATORY REQUIREMENT)
  const promptDeleteEvent = (event: GoogleCalendarEvent) => {
    triggerHaptic('warning');
    setConfirmDialogState({
      isOpen: true,
      title: 'حذف رویداد از Google Calendar',
      description: `آیا از حذف رویداد «${event.summary}» از تقویم گوگل خود اطمینان دارید؟ این عملیات قابل بازگشت نیست.`,
      affectedCount: 1,
      affectedList: [event.summary],
      actionType: 'delete',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await deleteCalendarEvent(event.id);
          triggerHaptic('success');
          if (onToast) onToast(`رویداد «${event.summary}» با موفقیت از تقویم حذف شد.`);
          setEvents((prev) => prev.filter((ev) => ev.id !== event.id));
        } catch (err: any) {
          triggerHaptic('warning');
          setErrorMessage(err.message || 'خطا در حذف رویداد');
        } finally {
          setActionLoading(false);
          setConfirmDialogState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Sync single post to Google Calendar with color coding
  const handleSyncSinglePost = (post: ScheduledPost) => {
    triggerHaptic('medium');
    const colorId = getStatusColorId(post.status);
    const statusCfg = getStatusColorConfig(post.status);

    setConfirmDialogState({
      isOpen: true,
      title: `همگام‌سازی پست با تقویم گوگل (${statusCfg.label})`,
      description: `رویداد مربوط به پست «${post.title}» در کانال ${post.channelName} با برچسب وضعیت «${statusCfg.label}» و رنگ اختصاصی در Google Calendar ثبت خواهد شد.`,
      affectedCount: 1,
      affectedList: [`${post.title} - وضعیت: ${statusCfg.label}`],
      actionType: 'sync',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const { date } = parsePostDateTime(post.scheduledTime, post.createdAt);
          const startDateTime = date.toISOString();
          const endDateTime = new Date(date.getTime() + 45 * 60 * 1000).toISOString();

          await createCalendarEvent({
            summary: `[${statusCfg.label}] ${post.title}`,
            description: `کانال: ${post.channelName} (${post.channelHandle})\nربات: ${post.botUsername}\nوضعیت: ${statusCfg.label}\nزمان‌بندی: ${post.scheduledTime}\n\nمتن پیش‌نمایش:\n${post.previewText}`,
            startDateTime,
            endDateTime,
            location: post.channelHandle,
            colorId,
          });

          triggerHaptic('success');
          if (onToast) onToast(`پست «${post.title}» با کد رنگی وضعیت در تقویم گوگل ثبت شد.`);
          loadEvents();
        } catch (err: any) {
          triggerHaptic('warning');
          setErrorMessage(err.message || 'خطا در ثبت رویداد');
        } finally {
          setActionLoading(false);
          setConfirmDialogState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Sync all filtered posts with status color coding to Google Calendar
  const promptSyncAllPosts = () => {
    if (!queuePosts || queuePosts.length === 0) {
      if (onToast) onToast('هیچ پستی در صف زمان‌بندی برای همگام‌سازی وجود ندارد.');
      return;
    }

    triggerHaptic('medium');
    const titles = queuePosts.map(
      (p) => `${p.title} [${getStatusColorConfig(p.status).label} - ${p.channelName}]`
    );

    setConfirmDialogState({
      isOpen: true,
      title: 'همگام‌سازی کل پست‌های زمان‌بندی‌شده با تفکیک رنگی وضعیت',
      description: `تعداد ${queuePosts.length} پست موجود در صف با رنگ‌بندی تفکیک‌شده بر اساس وضعیت (در انتظار = زرد، منتشر شده = سبز، ناموفق = قرمز) در تقویم گوگل شما اضافه خواهند شد.`,
      affectedCount: queuePosts.length,
      affectedList: titles,
      actionType: 'sync',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          let count = 0;
          for (const post of queuePosts) {
            const { date } = parsePostDateTime(post.scheduledTime, post.createdAt, count);
            const startDateTime = date.toISOString();
            const endDateTime = new Date(date.getTime() + 40 * 60 * 1000).toISOString();
            const statusCfg = getStatusColorConfig(post.status);
            const colorId = getStatusColorId(post.status);

            await createCalendarEvent({
              summary: `[${statusCfg.label}] ${post.title}`,
              description: `کانال: ${post.channelName} (${post.channelHandle})\nربات: ${post.botUsername}\nوضعیت: ${statusCfg.label}\nزمان انتشار: ${post.scheduledTime}\n\n${post.previewText}`,
              startDateTime,
              endDateTime,
              location: post.channelHandle,
              colorId,
            });
            count++;
          }

          triggerHaptic('success');
          if (onToast) onToast(`${count} رویداد با تفکیک رنگی وضعیت در تقویم گوگل شما ثبت شد.`);
          loadEvents();
        } catch (err: any) {
          triggerHaptic('warning');
          setErrorMessage(err.message || 'خطا در ثبت دسته‌ای رویدادها در تقویم');
        } finally {
          setActionLoading(false);
          setConfirmDialogState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // TRANSFORM POSTS AND GOOGLE EVENTS INTO VISUAL CALENDAR ITEMS
  const visualItems = useMemo<VisualCalendarItem[]>(() => {
    const items: VisualCalendarItem[] = [];

    // Map scheduled posts
    queuePosts.forEach((post, index) => {
      const { date, timeStr } = parsePostDateTime(post.scheduledTime, post.createdAt, index);
      const dateKey = date.toISOString().split('T')[0];

      items.push({
        id: post.id,
        sourceType: 'scheduled_post',
        title: post.title,
        previewText: post.previewText,
        channelName: post.channelName,
        channelHandle: post.channelHandle,
        botUsername: post.botUsername,
        scheduledTimeRaw: post.scheduledTime,
        date,
        dateKey,
        timeStr,
        status: post.status,
        mediaType: post.mediaType,
        imageUrl: post.imageUrl || post.mediaItems?.[0]?.url,
        originalPost: post,
      });
    });

    // Map native Google Calendar events
    events.forEach((ge) => {
      const startDateStr = ge.start.dateTime || ge.start.date;
      if (!startDateStr) return;
      const date = new Date(startDateStr);
      const dateKey = isNaN(date.getTime())
        ? new Date().toISOString().split('T')[0]
        : date.toISOString().split('T')[0];

      let timeStr = 'تمام روز';
      if (ge.start.dateTime) {
        timeStr = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      }

      // Check if event title has [منتشر شده] or [در انتظار] or [ناموفق]
      let derivedStatus: 'pending' | 'published' | 'failed' | 'google_event' = 'google_event';
      if (ge.summary?.includes('منتشر شده') || ge.colorId === '10') {
        derivedStatus = 'published';
      } else if (ge.summary?.includes('ناموفق') || ge.summary?.includes('خطا') || ge.colorId === '11') {
        derivedStatus = 'failed';
      } else if (ge.summary?.includes('در انتظار') || ge.colorId === '5' || ge.colorId === '6') {
        derivedStatus = 'pending';
      }

      items.push({
        id: ge.id,
        sourceType: 'google_event',
        title: ge.summary || 'رویداد تقویم گوگل',
        previewText: ge.description || 'ثبت شده در تقویم گوگل شما',
        channelName: ge.location || 'Google Calendar',
        channelHandle: ge.location || '@google_calendar',
        scheduledTimeRaw: ge.start.dateTime ? new Date(ge.start.dateTime).toLocaleString('fa-IR') : 'تمام روز',
        date,
        dateKey,
        timeStr,
        status: derivedStatus,
        googleEventId: ge.id,
        htmlLink: ge.htmlLink,
      });
    });

    // Sort by date ascending
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [queuePosts, events]);

  // Unique channels list for filtering
  const channelsList = useMemo(() => {
    const list = Array.from(new Set(queuePosts.map((p) => p.channelName))).filter(Boolean);
    return list;
  }, [queuePosts]);

  // Filtered items based on search, status and channel
  const filteredItems = useMemo(() => {
    return visualItems.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Channel filter
      if (channelFilter !== 'all' && item.channelName !== channelFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesText = item.previewText.toLowerCase().includes(q);
        const matchesChannel = item.channelName.toLowerCase().includes(q) || item.channelHandle.toLowerCase().includes(q);
        if (!matchesTitle && !matchesText && !matchesChannel) return false;
      }
      return true;
    });
  }, [visualItems, statusFilter, channelFilter, searchQuery]);

  // Metrics summary
  const metrics = useMemo(() => {
    const pendingCount = queuePosts.filter((p) => p.status === 'pending').length;
    const publishedCount = queuePosts.filter((p) => p.status === 'published').length;
    const failedCount = queuePosts.filter((p) => p.status === 'failed').length;
    return {
      total: queuePosts.length,
      pending: pendingCount,
      published: publishedCount,
      failed: failedCount,
      googleEvents: events.length,
    };
  }, [queuePosts, events]);

  // Calendar Month Grid Generation
  const calendarMonthData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Day of week offset for Saturday start (Persian week)
    // In JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Persian start: Sat (6) -> index 0, Sun (0) -> index 1, ... Fri (5) -> index 6
    const startDayOfWeek = (firstDay.getDay() + 1) % 7;

    const days: { dateKey: string; dayNum: number; date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Preceding filler days from previous month
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDate - i;
      const d = new Date(year, month - 1, dayNum);
      const dateKey = d.toISOString().split('T')[0];
      days.push({ dateKey, dayNum, date: d, isCurrentMonth: false, isToday: false });
    }

    // Current month days
    const todayStr = new Date().toISOString().split('T')[0];
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dateKey = curDate.toISOString().split('T')[0];
      days.push({
        dateKey,
        dayNum: d,
        date: curDate,
        isCurrentMonth: true,
        isToday: dateKey === todayStr,
      });
    }

    // Trailing filler days to complete 35 or 42 grid cells
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateKey = d.toISOString().split('T')[0];
      days.push({ dateKey, dayNum: i, date: d, isCurrentMonth: false, isToday: false });
    }

    return days;
  }, [calendarDate]);

  // Group filtered items by dateKey for calendar grid lookup
  const itemsByDateKey = useMemo(() => {
    const map: Record<string, VisualCalendarItem[]> = {};
    filteredItems.forEach((item) => {
      if (!map[item.dateKey]) map[item.dateKey] = [];
      map[item.dateKey].push(item);
    });
    return map;
  }, [filteredItems]);

  // Selected day items for inspector
  const selectedDayItems = useMemo(() => {
    return itemsByDateKey[selectedDayKey] || [];
  }, [itemsByDateKey, selectedDayKey]);

  // Month navigation
  const prevMonth = () => {
    triggerHaptic('light');
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    triggerHaptic('light');
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    triggerHaptic('light');
    const now = new Date();
    setCalendarDate(now);
    setSelectedDayKey(now.toISOString().split('T')[0]);
  };

  // Month label in Persian
  const monthNamePersian = useMemo(() => {
    try {
      return calendarDate.toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' });
    } catch {
      return calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
  }, [calendarDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[92vh] max-h-[92vh] bg-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  تقویم محتوایی و اتصال به Google Calendar
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 hidden sm:inline-block">
                  Google Workspace Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مشاهده و مصورسازی پست‌های زمان‌بندی‌شده با کدگذاری رنگی وضعیت کانال‌ها
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              بستن
            </button>
          </div>
        )}

        {/* STATUS LEGEND & METRICS BAR */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Status Color Legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              راهنمای رنگی وضعیت:
            </span>

            {/* PENDING PILL */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>در انتظار انتشار ({metrics.pending})</span>
            </button>

            {/* PUBLISHED PILL */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setStatusFilter(statusFilter === 'published' ? 'all' : 'published');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>منتشر شده ({metrics.published})</span>
            </button>

            {/* FAILED PILL */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setStatusFilter(statusFilter === 'failed' ? 'all' : 'failed');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                statusFilter === 'failed'
                  ? 'bg-rose-500/25 border-rose-400 text-rose-200 ring-2 ring-rose-400/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>ناموفق / خطا ({metrics.failed})</span>
            </button>

            {/* GOOGLE CALENDAR PILL */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setStatusFilter(statusFilter === 'google_event' ? 'all' : 'google_event');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                statusFilter === 'google_event'
                  ? 'bg-sky-500/25 border-sky-400 text-sky-200 ring-2 ring-sky-400/20'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>تقویم گوگل ({metrics.googleEvents})</span>
            </button>

            {statusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setStatusFilter('all');
                }}
                className="text-[11px] text-slate-400 hover:text-white underline px-1 cursor-pointer"
              >
                نمایش همه ({metrics.total + metrics.googleEvents})
              </button>
            )}
          </div>

          {/* AUTH STATUS & GOOGLE BUTTON */}
          <div className="flex items-center gap-2">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-full border border-sky-400/50"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] flex items-center justify-center font-bold">
                    {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] text-slate-300 font-medium max-w-[120px] truncate" dir="ltr">
                  {currentUser.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="خروج از حساب گوگل"
                  className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={handleSignIn}
                loading={isSigningIn}
                text="ورود با حساب گوگل"
              />
            )}
          </div>
        </div>

        {/* TOOLBAR CONTROLS: VIEW SWITCHER + SEARCH + SYNC ACTIONS */}
        <div className="p-3 sm:px-6 sm:py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* VIEW SWITCHER TABS */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode('calendar');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>تقویم ماهانه</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode('timeline');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>خط زمانی و دستور کار ({filteredItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode('channels');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'channels'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>تفکیک کانال‌ها</span>
            </button>
          </div>

          {/* SEARCH & CHANNEL DROPDOWN */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در پست‌ها و رویدادها..."
                className="w-44 sm:w-56 pr-8 pl-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
              />
            </div>

            {channelsList.length > 0 && (
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500/60 cursor-pointer"
              >
                <option value="all">همه کانال‌ها ({channelsList.length})</option>
                {channelsList.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                fetchQueuePosts();
                if (isAuthenticated) loadEvents();
              }}
              disabled={loadingQueue || loadingEvents}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
              title="بارگذاری مجدد صف و تقویم"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingQueue || loadingEvents ? 'animate-spin text-sky-400' : ''}`}
              />
            </button>
          </div>

          {/* ACTION BUTTONS: SYNC ALL & NEW EVENT */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={promptSyncAllPosts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-900/30 transition-all cursor-pointer"
                title="همگام‌سازی تمامی پست‌های صف با رنگ‌بندی تفکیک‌شده در تقویم گوگل"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>همگام‌سازی کل صف به تقویم گوگل</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>رویداد دستی</span>
            </button>
          </div>
        </div>

        {/* MANUAL NEW EVENT COLLAPSIBLE DRAWER */}
        {showAddEvent && (
          <form
            onSubmit={handleCreateNewEvent}
            className="p-4 mx-4 sm:mx-6 my-2 rounded-2xl bg-slate-950/90 border border-sky-500/40 shadow-xl space-y-3 animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <CalendarPlus className="w-4 h-4" />
                ثبت رویداد جدید با تفکیک رنگی وضعیت
              </span>
              <button
                type="button"
                onClick={() => setShowAddEvent(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                بستن
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">عنوان رویداد یا پست</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="مثال: انتشار پست تحلیل گزارش فصلی"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">وضعیت کانال (رنگ رویداد)</label>
                <select
                  value={newEventStatus}
                  onChange={(e) => setNewEventStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="pending">🟡 در انتظار انتشار (Pending)</option>
                  <option value="published">🟢 منتشر شده (Published)</option>
                  <option value="failed">🔴 ناموفق / خطا (Failed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">تاریخ</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">ساعت شروع</label>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-slate-400 mb-1">توضیحات (اختیاری)</label>
                <input
                  type="text"
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="توضیحات یا لینک موردنظر..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddEvent(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isCreatingEvent}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isCreatingEvent ? 'در حال ثبت...' : 'افزودن رویداد به Google Calendar'}
              </button>
            </div>
          </form>
        )}

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* VIEW 1: INTERACTIVE MONTHLY CALENDAR GRID */}
          {viewMode === 'calendar' && (
            <div className="space-y-4">
              {/* MONTH NAVIGATION BAR */}
              <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                    title="ماه قبل"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 min-w-[140px] text-center">
                    {monthNamePersian}
                  </h3>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                    title="ماه بعد"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToToday}
                    className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    برو به امروز
                  </button>
                </div>
              </div>

              {/* CALENDAR DAYS GRID */}
              <div className="bg-slate-950/60 rounded-2xl border border-slate-800/90 overflow-hidden shadow-inner">
                {/* DAY OF WEEK HEADERS */}
                <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/80 text-center py-2 text-xs font-bold text-slate-400">
                  <span>شنبه</span>
                  <span>یکشنبه</span>
                  <span>دوشنبه</span>
                  <span>سه‌شنبه</span>
                  <span>چهارشنبه</span>
                  <span>پنج‌شنبه</span>
                  <span className="text-rose-400">جمعه</span>
                </div>

                {/* CALENDAR CELLS */}
                <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80">
                  {calendarMonthData.map((cell) => {
                    const dayItems = itemsByDateKey[cell.dateKey] || [];
                    const isSelected = cell.dateKey === selectedDayKey;

                    return (
                      <div
                        key={cell.dateKey}
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedDayKey(cell.dateKey);
                        }}
                        className={`min-h-[95px] sm:min-h-[115px] p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer ${
                          !cell.isCurrentMonth
                            ? 'bg-slate-950/30 text-slate-600 opacity-50'
                            : isSelected
                            ? 'bg-sky-950/30 ring-2 ring-inset ring-sky-500/50'
                            : 'bg-slate-900/40 hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        {/* DAY HEADER */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold rounded-md px-1.5 py-0.5 ${
                              cell.isToday
                                ? 'bg-sky-500 text-white font-extrabold shadow-sm'
                                : isSelected
                                ? 'text-sky-300 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {cell.dayNum}
                          </span>

                          {dayItems.length > 0 && (
                            <span className="text-[10px] font-bold px-1 rounded bg-slate-800 text-slate-300">
                              {dayItems.length}
                            </span>
                          )}
                        </div>

                        {/* DAY EVENTS PILLS (COLOR CODED) */}
                        <div className="space-y-1 mt-1 overflow-hidden max-h-[70px]">
                          {dayItems.slice(0, 3).map((item) => {
                            const isPending = item.status === 'pending';
                            const isPublished = item.status === 'published';
                            const isFailed = item.status === 'failed';

                            return (
                              <div
                                key={item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerHaptic('medium');
                                  setInspectItem(item);
                                }}
                                className={`px-1.5 py-0.5 rounded-md text-[10px] truncate flex items-center gap-1 border transition-all hover:scale-[1.02] ${
                                  isPublished
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                    : isFailed
                                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                                    : isPending
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                    : 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                                }`}
                                title={`${item.title} (${item.channelName})`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    isPublished
                                      ? 'bg-emerald-400'
                                      : isFailed
                                      ? 'bg-rose-500'
                                      : isPending
                                      ? 'bg-amber-400 animate-pulse'
                                      : 'bg-sky-400'
                                  }`}
                                />
                                <span className="truncate">{item.title}</span>
                              </div>
                            );
                          })}

                          {dayItems.length > 3 && (
                            <div className="text-[9px] text-slate-400 text-center font-bold">
                              +{dayItems.length - 3} رویداد دیگر...
                            </div>
                          )}
                        </div>

                        {/* EMPTY PLACEHOLDER */}
                        {dayItems.length === 0 && <div className="h-4" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED DAY INSPECTOR PANEL */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold text-slate-200">
                      رویدادهای تاریخ انتخاب شده ({selectedDayKey}):
                    </h4>
                    <span className="text-xs text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-800/40">
                      {selectedDayItems.length} رویداد
                    </span>
                  </div>
                </div>

                {selectedDayItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    برای این روز پستی ثبت نشده است. می‌توانید روی «رویداد دستی» در بالا کلیک کنید.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedDayItems.map((item) => {
                      const cfg = getStatusColorConfig(
                        item.status === 'google_event' ? 'pending' : (item.status as any)
                      );
                      const isPublished = item.status === 'published';
                      const isFailed = item.status === 'failed';
                      const isPending = item.status === 'pending';

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            isPublished
                              ? 'bg-gradient-to-r from-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-emerald-950/20'
                              : isFailed
                              ? 'bg-gradient-to-r from-rose-950/30 to-slate-900 border-rose-500/40 shadow-rose-950/20'
                              : isPending
                              ? 'bg-gradient-to-r from-amber-950/30 to-slate-900 border-amber-500/40 shadow-amber-950/20'
                              : 'bg-slate-900 border-sky-500/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-xs font-bold text-slate-100 line-clamp-1">
                                {item.title}
                              </h5>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 whitespace-nowrap ${
                                  isPublished
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : isFailed
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : isPending
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isPublished
                                      ? 'bg-emerald-400'
                                      : isFailed
                                      ? 'bg-rose-500'
                                      : isPending
                                      ? 'bg-amber-400 animate-pulse'
                                      : 'bg-sky-400'
                                  }`}
                                />
                                {item.status === 'google_event' ? 'تقویم گوگل' : cfg.label}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                              {item.previewText}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {item.timeStr}
                              </span>
                              <span>• {item.channelName}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.originalPost && (
                                <button
                                  type="button"
                                  onClick={() => handleSyncSinglePost(item.originalPost!)}
                                  className="px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                  title="همگام‌سازی این رویداد در تقویم گوگل"
                                >
                                  <CalendarPlus className="w-3 h-3" />
                                  <span>ثبت در گوگل</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setInspectItem(item)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
                              >
                                جزئیات
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: TIMELINE / AGENDA VIEW */}
          {viewMode === 'timeline' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <List className="w-4 h-4 text-sky-400" />
                  <span>خط زمانی پست‌ها و رویدادهای تقویم ({filteredItems.length} رویداد)</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  مرتب‌شده بر اساس تاریخ و ساعت انتشار
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                  هیچ رویدادی با فیلترهای انتخابی یافت نشد.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const cfg = getStatusColorConfig(
                      item.status === 'google_event' ? 'pending' : (item.status as any)
                    );
                    const isPublished = item.status === 'published';
                    const isFailed = item.status === 'failed';
                    const isPending = item.status === 'pending';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isPublished
                            ? 'bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-950 border-emerald-500/40 shadow-sm'
                            : isFailed
                            ? 'bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-950 border-rose-500/40 shadow-sm'
                            : isPending
                            ? 'bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 border-amber-500/40 shadow-sm'
                            : 'bg-slate-900/90 border-sky-500/40'
                        }`}
                      >
                        {/* LEFT: STATUS STRIP & CONTENT */}
                        <div className="flex items-start gap-3.5 flex-1 overflow-hidden">
                          <div
                            className={`w-2.5 self-stretch rounded-full flex-shrink-0 ${
                              isPublished
                                ? 'bg-emerald-400'
                                : isFailed
                                ? 'bg-rose-500'
                                : isPending
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-sky-400'
                            }`}
                          />

                          {/* THUMBNAIL IF PRESENT */}
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-14 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0 hidden sm:block"
                            />
                          )}

                          <div className="flex-1 overflow-hidden">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                                {item.title}
                              </h5>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${
                                  isPublished
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : isFailed
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : isPending
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isPublished
                                      ? 'bg-emerald-400'
                                      : isFailed
                                      ? 'bg-rose-500'
                                      : isPending
                                      ? 'bg-amber-400'
                                      : 'bg-sky-400'
                                  }`}
                                />
                                {item.status === 'google_event' ? 'تقویم گوگل' : cfg.label}
                              </span>

                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                {item.channelName}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                              {item.previewText}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1 font-sans">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                {item.scheduledTimeRaw}
                              </span>
                              {item.botUsername && (
                                <span className="flex items-center gap-1">
                                  <Bot className="w-3.5 h-3.5 text-slate-500" />
                                  {item.botUsername}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: QUICK ACTIONS & STATUS TOGGLES */}
                        <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-r border-slate-800 pt-3 md:pt-0 md:pr-4 flex-shrink-0">
                          {/* QUICK STATUS SWITCHER (FOR POSTS) */}
                          {item.originalPost && (
                            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                              <button
                                type="button"
                                onClick={() => handleUpdatePostStatus(item.id, 'pending')}
                                title="تغییر به در انتظار"
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                  isPending
                                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                                    : 'text-slate-400 hover:text-amber-300'
                                }`}
                              >
                                در انتظار
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdatePostStatus(item.id, 'published')}
                                title="تغییر به منتشر شده"
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                  isPublished
                                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                                    : 'text-slate-400 hover:text-emerald-300'
                                }`}
                              >
                                منتشر شده
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdatePostStatus(item.id, 'failed')}
                                title="تغییر به ناموفق / خطا"
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                  isFailed
                                    ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                                    : 'text-slate-400 hover:text-rose-300'
                                }`}
                              >
                                ناموفق
                              </button>
                            </div>
                          )}

                          {/* SYNC TO GOOGLE */}
                          {item.originalPost && (
                            <button
                              type="button"
                              onClick={() => handleSyncSinglePost(item.originalPost!)}
                              className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                              <span>ثبت در Google Calendar</span>
                            </button>
                          )}

                          {/* OPEN GOOGLE EVENT */}
                          {item.htmlLink && (
                            <a
                              href={item.htmlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="مشاهده در تقویم گوگل"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {item.googleEventId && (
                            <button
                              type="button"
                              onClick={() =>
                                promptDeleteEvent({
                                  id: item.googleEventId!,
                                  summary: item.title,
                                  start: {},
                                  end: {},
                                })
                              }
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                              title="حذف از تقویم گوگل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: CHANNEL MATRIX VIEW */}
          {viewMode === 'channels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>تفکیک وضعیت پست‌های زمان‌بندی‌شده به تفکیک کانال</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channelsList.map((chName) => {
                  const chPosts = queuePosts.filter((p) => p.channelName === chName);
                  const pPending = chPosts.filter((p) => p.status === 'pending');
                  const pPublished = chPosts.filter((p) => p.status === 'published');
                  const pFailed = chPosts.filter((p) => p.status === 'failed');

                  return (
                    <div
                      key={chName}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div>
                          <h5 className="text-xs font-bold text-slate-100">{chName}</h5>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {chPosts[0]?.channelHandle}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-800/40">
                          {chPosts.length} پست
                        </span>
                      </div>

                      {/* STATUS DISTRIBUTION BAR */}
                      <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-slate-800">
                        {pPending.length > 0 && (
                          <div
                            style={{ width: `${(pPending.length / chPosts.length) * 100}%` }}
                            className="bg-amber-400 h-full"
                            title={`در انتظار: ${pPending.length}`}
                          />
                        )}
                        {pPublished.length > 0 && (
                          <div
                            style={{ width: `${(pPublished.length / chPosts.length) * 100}%` }}
                            className="bg-emerald-400 h-full"
                            title={`منتشر شده: ${pPublished.length}`}
                          />
                        )}
                        {pFailed.length > 0 && (
                          <div
                            style={{ width: `${(pFailed.length / chPosts.length) * 100}%` }}
                            className="bg-rose-500 h-full"
                            title={`ناموفق: ${pFailed.length}`}
                          />
                        )}
                      </div>

                      {/* STATS CHIPS */}
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="flex items-center gap-1 text-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          در انتظار: {pPending.length}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          منتشر شده: {pPublished.length}
                        </span>
                        <span className="flex items-center gap-1 text-rose-300">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          ناموفق: {pFailed.length}
                        </span>
                      </div>

                      {/* POSTS LIST UNDER THIS CHANNEL */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/60 max-h-48 overflow-y-auto pr-1">
                        {chPosts.map((p) => {
                          const cfg = getStatusColorConfig(p.status);
                          return (
                            <div
                              key={p.id}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="overflow-hidden pr-1">
                                <div className="text-[11px] font-bold text-slate-200 truncate">
                                  {p.title}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>{p.scheduledTime}</span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${cfg.badgeBg}`}
                              >
                                {cfg.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* INSPECT DETAIL MODAL / DRAWER */}
        {inspectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="w-full max-w-lg bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl p-6 text-right overflow-hidden flex flex-col gap-4 animate-in zoom-in-95 duration-200"
              dir="rtl"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">جزئیات رویداد تقویم</h3>
                    <span className="text-[11px] text-slate-400">{inspectItem.channelName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STATUS CARD */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-400">وضعیت در صف و تقویم:</span>
                <span
                  className={`px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 ${
                    inspectItem.status === 'published'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : inspectItem.status === 'failed'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : inspectItem.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      inspectItem.status === 'published'
                        ? 'bg-emerald-400'
                        : inspectItem.status === 'failed'
                        ? 'bg-rose-500'
                        : inspectItem.status === 'pending'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-sky-400'
                    }`}
                  />
                  <span>
                    {inspectItem.status === 'google_event'
                      ? 'رویداد ثبت شده در گوگل'
                      : getStatusColorConfig(inspectItem.status as any).label}
                  </span>
                </span>
              </div>

              {/* TITLE & TEXT */}
              <div>
                <h4 className="text-sm font-bold text-slate-100">{inspectItem.title}</h4>
                <div className="mt-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {inspectItem.previewText}
                </div>
              </div>

              {/* TIMING & CHANNEL DETAILS */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">زمان برنامه‌ریزی:</div>
                  <div className="font-bold text-slate-200 mt-0.5">{inspectItem.scheduledTimeRaw}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">شناسه کانال:</div>
                  <div className="font-bold text-slate-200 mt-0.5 font-mono" dir="ltr">
                    {inspectItem.channelHandle}
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                {inspectItem.originalPost && (
                  <button
                    type="button"
                    onClick={() => {
                      const p = inspectItem.originalPost!;
                      setInspectItem(null);
                      handleSyncSinglePost(p);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>همگام‌سازی در Google Calendar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER BAR */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>اتصال تایید شده به Google Calendar با برچسب‌های رنگی استاندارد Google Workspace</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>

      {/* MANDATORY CONFIRMATION DIALOG FOR ALL MUTATIONS/DELETIONS */}
      <CalendarConfirmDialog
        isOpen={confirmDialogState.isOpen}
        title={confirmDialogState.title}
        description={confirmDialogState.description}
        affectedItemsCount={confirmDialogState.affectedCount}
        affectedItemsList={confirmDialogState.affectedList}
        actionType={confirmDialogState.actionType}
        loading={actionLoading}
        onConfirm={confirmDialogState.onConfirm}
        onCancel={() => setConfirmDialogState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
