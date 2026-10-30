import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  X,
  MessageSquare,
  Zap,
  Plus,
  Trash2,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Download,
  Search,
  Flame,
  TrendingUp,
  Layers,
  FileText,
  Sliders,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  StopCircle,
  HelpCircle,
  Clock,
  Radio,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToStudio?: (text: string) => void;
  onToast?: (message: string) => void;
}

export type AssistantPersona =
  | 'general'
  | 'viral_creator'
  | 'growth_strategist'
  | 'seo_prompt'
  | 'copywriter';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  feedback?: 'like' | 'dislike';
  persona?: AssistantPersona;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  persona: AssistantPersona;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'telegen_gemini_chat_sessions_v1';

const PERSONAS: {
  id: AssistantPersona;
  name: string;
  role: string;
  icon: any;
  color: string;
  badgeBg: string;
  description: string;
}[] = [
  {
    id: 'general',
    name: 'دستیار همه‌فن‌حریف',
    role: 'نویسنده و مشاور جامع',
    icon: Sparkles,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    description: 'پاسخ به سوالات، نگارش، خلاصه سازی و ایده‌پردازی کلی برای تلگرام',
  },
  {
    id: 'viral_creator',
    name: 'خالق محتوای وایرال',
    role: 'متخصص قلاب و تعامل',
    icon: Flame,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'قلاب‌های میخکوب‌کننده، متن‌های تکان‌دهنده و ایده‌های فوروارد انبوه',
  },
  {
    id: 'growth_strategist',
    name: 'استراتژیست رشد',
    role: 'الگوریتم و تعامل',
    icon: TrendingUp,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'ساعات طلایی انتشار، فرمت‌های پربازدید و تحلیل رفتار مخاطبان',
  },
  {
    id: 'seo_prompt',
    name: 'مهندس پرامپت و سئو',
    role: 'اکسپلور و کلمات کلیدی',
    icon: Layers,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'طراحی پرامپت‌های ساختاریافته هوش مصنوعی و سئوی هشتگ‌های تلگرام',
  },
  {
    id: 'copywriter',
    name: 'کپی‌رایتر تبلیغات',
    role: 'کمپین و دکمه CTA',
    icon: Zap,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'نگارش متون فروش، تبلیغات با دکمه شیشه‌ای و نرخ کلیک حداکثری',
  },
];

const QUICK_PROMPTS = [
  { text: 'یک ایده پست وایرال برای کانال تکنولوژی با قلاب شوکه‌کننده بنویس', category: 'viral' },
  { text: 'متن تبلیغاتی جذاب با دکمه شیشه‌ای و تخفیف ویژه برای جذب ممبر طراحی کن', category: 'copy' },
  { text: 'بهترین ساعات انتشار پست در تلگرام برای کاربران ایران چه زمان‌هایی است؟', category: 'growth' },
  { text: 'پرامپت مهندسی‌شده برای تولید خلاصه اخبار هوش مصنوعی در استودیو ایجاد کن', category: 'seo' },
  { text: '۵ تکنیک روان‌شناسی برای افزایش واکنش (Reactions) و کامنت زیر پست‌ها بگو', category: 'growth' },
  { text: 'این متن رو ویرایش کن و لحنش رو صمیمی‌تر، جذاب‌تر و با ایموجی بهتر بنویس', category: 'general' },
];

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  onInsertToStudio,
  onToast,
}) => {
  // Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat sessions:', e);
    }
    const initialSessionId = `chat-${Date.now()}`;
    return [
      {
        id: initialSessionId,
        title: 'گفتگوی نخست با Gemini',
        createdAt: new Date().toLocaleDateString('fa-IR'),
        persona: 'general',
        messages: [
          {
            id: 'init-1',
            sender: 'gemini',
            text: 'سلام! من دستیار هوشمند، نویسنده خلاق و استراتژیست TeleGen با قدرت **Gemini 3.8 Flash** هستم.\n\nمن می‌توانم در این زمینه‌ها کمکتان کنم:\n• **ایده‌پردازی و تولید پست‌های وایرال** با قلاب اولیه قدرتمند\n• **نگارش متون تبلیغاتی و کمپین‌های اسپانسری** با دکمه شیشه‌ای (CTA)\n• **مهندسی پرامپت اختصاصی** و سئوی جستجوی تلگرام\n• **تحلیل ساعات پیک انتشار و رفتار مخاطب**\n\nهمچنین می‌توانید پاسخ‌های من را مستقیماً با یک کلیک به **استودیو پست** منتقل کنید. آماده‌اید شروع کنیم؟',
            timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            persona: 'general',
          },
        ],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'default');
  const [activePersona, setActivePersona] = useState<AssistantPersona>('general');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active Session
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const messages = useMemo(() => {
    return activeSession?.messages || [];
  }, [activeSession]);

  // Filtered Sessions for Sidebar Search
  const filteredSessions = useMemo(() => {
    if (!searchHistory.trim()) return sessions;
    const q = searchHistory.toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, searchHistory]);

  // Persist sessions to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save chat sessions to LocalStorage:', e);
    }
  }, [sessions]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle Speech Synthesis Stop on unmount / modal close
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  }, [isOpen]);

  // New Chat Session
  const handleNewChat = (persona: AssistantPersona = activePersona) => {
    triggerHaptic('medium');
    const newId = `chat-${Date.now()}`;
    const pCfg = PERSONAS.find((p) => p.id === persona) || PERSONAS[0];
    const newSession: ChatSession = {
      id: newId,
      title: `گفتگوی جدید (${pCfg.name})`,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      persona,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'gemini',
          text: `سلام! حالت **${pCfg.name}** فعال است.\n${pCfg.description}.\nچه محتوا یا موضوعی مدنظرتان است؟`,
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          persona,
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActivePersona(persona);
    setIsSidebarOpen(false);
  };

  // Delete Chat Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('warning');
    if (sessions.length <= 1) {
      // If only one session, reset it
      handleNewChat();
      return;
    }
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated[0].id);
    }
  };

  // Switch Active Session
  const handleSelectSession = (sessionId: string) => {
    triggerHaptic('light');
    setActiveSessionId(sessionId);
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      setActivePersona(target.persona);
    }
    setIsSidebarOpen(false);
  };

  // Send Message
  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    triggerHaptic('light');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session with user message
    const updatedMessages = [...messages, userMsg];

    // Auto-update session title if it's the first user message
    let sessionTitle = activeSession.title;
    if (messages.length <= 1) {
      sessionTitle = textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '');
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: sessionTitle, messages: updatedMessages, persona: activePersona }
          : s
      )
    );

    if (!customPrompt) setInput('');
    setLoading(true);

    // Abort controller for cancellation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: textToSend,
          history: updatedMessages.slice(-10),
          persona: activePersona,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'پاسخی از سرور دریافت نشد.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'gemini',
        text: reply,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        persona: activePersona,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...updatedMessages, botMsg] }
            : s
        )
      );

      triggerHaptic('success');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat generation stopped by user');
      } else {
        console.warn('Chat error:', err);
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'gemini',
          text: 'خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی و دوباره تلاش کنید.',
          timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...updatedMessages, errorMsg] }
              : s
          )
        );
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    triggerHaptic('medium');
  };

  // Regenerate Last Bot Message
  const handleRegenerate = async () => {
    if (loading || messages.length < 2) return;
    triggerHaptic('light');

    // Find last user message
    let lastUserMessage = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        lastUserMessage = messages[i].text;
        break;
      }
    }

    if (!lastUserMessage) return;

    // Remove last bot message and resend
    const filtered = messages.filter((m, idx) => !(idx === messages.length - 1 && m.sender === 'gemini'));
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: filtered } : s))
    );

    handleSend(lastUserMessage);
  };

  // Edit User Message & Resubmit
  const handleSaveEditUserMessage = (msgId: string) => {
    if (!editingText.trim()) return;
    triggerHaptic('light');

    // Find index of msg
    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx === -1) return;

    // Truncate messages after this and resend
    const newText = editingText.trim();
    const truncated = messages.slice(0, idx);

    setEditingMessageId(null);
    setEditingText('');

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: truncated } : s))
    );

    handleSend(newText);
  };

  // Thumbs Feedback
  const handleFeedback = (msgId: string, feedback: 'like' | 'dislike') => {
    triggerHaptic('light');
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === msgId ? { ...m, feedback: m.feedback === feedback ? undefined : feedback } : m
              ),
            }
          : s
      )
    );
    if (onToast) onToast(feedback === 'like' ? 'بازخورد مثبت ثبت شد.' : 'بازخورد ثبت شد.');
  };

  // Text-To-Speech (Web Speech API)
  const handleToggleTTS = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      if (onToast) onToast('مرورگر شما از پخش صدا پشتیبانی نمی‌کند.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    triggerHaptic('light');

    // Clean markdown symbols for cleaner voice
    const cleanText = text
      .replace(/[*#`_~\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fa-IR';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy to Clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerHaptic('light');
    if (onToast) onToast('متن پیام کپی شد.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Chat
  const handleExportChat = () => {
    triggerHaptic('medium');
    const content = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender === 'user' ? 'شما' : 'دستیار هوشمند Gemini'}:\n${m.text}\n---------------------------`
      )
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gemini-Chat-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    if (onToast) onToast('فایل گفت‌وگو دانلود شد.');
  };

  // Clear Conversation
  const handleClearCurrentChat = () => {
    triggerHaptic('warning');
    if (window.confirm('آیا از پاک‌سازی تمامی پیام‌های این گفت‌وگو اطمینان دارید؟')) {
      const resetMsg: ChatMessage = {
        id: `rst-${Date.now()}`,
        sender: 'gemini',
        text: 'پیام‌ها پاک‌سازی شدند. آماده گفتگوی جدید!',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        persona: activePersona,
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [resetMsg] } : s))
      );
    }
  };

  // Send to Studio
  const handleInsertStudio = (text: string) => {
    triggerHaptic('success');
    if (onInsertToStudio) {
      onInsertToStudio(text);
      if (onToast) onToast('متن با موفقیت به استودیو ارسال شد.');
    }
  };

  const currentPersonaConfig = PERSONAS.find((p) => p.id === activePersona) || PERSONAS[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right animate-in zoom-in-95 duration-200 transition-all ${
          isExpanded ? 'w-full h-full max-w-full max-h-full rounded-none' : 'w-full max-w-5xl h-[92vh] max-h-[92vh]'
        }`}
        dir="rtl"
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
              title="تاریخچه گفتگوها"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-100">
                    دستیار هوشمند و پرامپت‌ساز اختصاصی Gemini
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block font-mono">
                    Gemini 3.8 Flash Pro
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    آماده پاسخگویی بلادرنگ
                  </span>
                  <span>• حالت فعلی: {currentPersonaConfig.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleNewChat as any}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>گفتگوی جدید</span>
            </button>

            <button
              type="button"
              onClick={handleExportChat}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="دانلود فایل متن گفتگو"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer hidden md:flex"
              title={isExpanded ? 'کوچک کردن' : 'تمام‌صفحه'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PERSONA TABS BAR */}
        <div className="px-3 sm:px-6 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1 ml-1">
            <Sliders className="w-3 h-3 text-slate-500" />
            تخصص دستیار:
          </span>

          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = activePersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActivePersona(p.id);
                  setSessions((prev) =>
                    prev.map((s) => (s.id === activeSessionId ? { ...s, persona: p.id } : s))
                  );
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? `${p.badgeBg} font-bold ring-2 ring-sky-500/20 shadow-sm`
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={p.description}
              >
                <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* CHAT CONTAINER: SIDEBAR + MESSAGES */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* SESSIONS SIDEBAR (COLLAPSIBLE / DRAWER) */}
          <div
            className={`absolute sm:relative inset-y-0 right-0 z-20 w-72 bg-slate-950 border-l border-slate-800 flex flex-col transition-all duration-200 shadow-2xl sm:shadow-none ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full sm:hidden'
            }`}
          >
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                تاریخچه گفتگوها ({sessions.length})
              </span>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH SESSIONS */}
            <div className="p-2 border-b border-slate-800/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="جستجو در گفتگوها..."
                  className="w-full pr-8 pl-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
                />
              </div>
            </div>

            {/* SESSIONS LIST */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              <button
                type="button"
                onClick={handleNewChat as any}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-900/30 transition-all cursor-pointer mb-2"
              >
                <Plus className="w-4 h-4" />
                <span>شروع گفتگوی تازه</span>
              </button>

              {filteredSessions.map((session) => {
                const isCurrent = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-sky-950/40 border-sky-500/40 text-slate-100 font-bold'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                    }`}
                  >
                    <div className="overflow-hidden flex-1 pl-2">
                      <div className="truncate text-xs">{session.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-normal">
                        <span>{session.createdAt}</span>
                        <span>•</span>
                        <span>{session.messages.length} پیام</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex-shrink-0"
                      title="حذف این گفتگو"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN CHAT MESSAGES DISPLAY */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/60">
            {/* MESSAGES LIST */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isCopied = copiedId === msg.id;
                const isSpeaking = speakingMessageId === msg.id;
                const isEditing = editingMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 animate-in fade-in duration-150 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* AVATAR */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                        isUser
                          ? 'bg-gradient-to-tr from-sky-600 to-blue-700 text-white'
                          : 'bg-gradient-to-tr from-indigo-600 to-purple-700 text-white'
                      }`}
                    >
                      {isUser ? (
                        <span className="text-xs font-bold">شما</span>
                      ) : (
                        <Bot className="w-5 h-5 text-sky-200" />
                      )}
                    </div>

                    {/* MESSAGE BUBBLE */}
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* SENDER LABEL & TIME */}
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400 px-1">
                        <span className="font-bold">
                          {isUser ? 'شما' : 'دستیار هوشمند Gemini'}
                        </span>
                        <span>• {msg.timestamp}</span>
                      </div>

                      {/* EDIT MODE FOR USER MESSAGE */}
                      {isUser && isEditing ? (
                        <div className="w-full bg-slate-950 p-3 rounded-2xl border border-sky-500/50 space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-sky-500 resize-none min-h-[70px]"
                          />
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => setEditingMessageId(null)}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                            >
                              انصراف
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditUserMessage(msg.id)}
                              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                            >
                              ذخیره و ارسال مجدد
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-lg whitespace-pre-wrap ${
                            isUser
                              ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-tr-none'
                              : 'bg-slate-950/80 border border-slate-800/90 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}

                      {/* MESSAGE ACTION BUTTONS */}
                      <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 px-1">
                        {/* COPY */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                          title="کپی متن"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* SEND TO STUDIO (FOR BOT MESSAGES) */}
                        {!isUser && onInsertToStudio && (
                          <button
                            type="button"
                            onClick={() => handleInsertStudio(msg.text)}
                            className="px-2 py-0.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="انتقال به استودیو پست"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>انتقال به استودیو</span>
                          </button>
                        )}

                        {/* TEXT TO SPEECH (VOICE READ) */}
                        <button
                          type="button"
                          onClick={() => handleToggleTTS(msg.text, msg.id)}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            isSpeaking
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'hover:bg-slate-800 hover:text-slate-200'
                          }`}
                          title={isSpeaking ? 'توقف خواندن' : 'خواندن صوتی'}
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* USER EDIT MESSAGE */}
                        {isUser && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMessageId(msg.id);
                              setEditingText(msg.text);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                            title="ویرایش این پیام"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* BOT FEEDBACK BUTTONS */}
                        {!isUser && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, 'like')}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                msg.feedback === 'like'
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : 'hover:bg-slate-800 hover:text-slate-200'
                              }`}
                              title="پاسخ عالی بود"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleFeedback(msg.id, 'dislike')}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                msg.feedback === 'dislike'
                                  ? 'text-rose-400 bg-rose-500/10'
                                  : 'hover:bg-slate-800 hover:text-slate-200'
                              }`}
                              title="نیاز به بازنویسی دارد"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* LOADING INDICATOR */}
              {loading && (
                <div className="flex items-start gap-3 animate-in fade-in duration-200">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-700 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-sky-200 animate-spin" />
                  </div>
                  <div className="p-4 rounded-3xl rounded-tl-none bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                      <span
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">Gemini در حال پردازش و نگارش هوشمند...</span>
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="mr-3 px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>توقف</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK SUGGESTION PROMPTS CAROUSEL */}
            <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-slate-500 whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                پیشنهادها:
              </span>
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    handleSend(qp.text);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer"
                >
                  {qp.text}
                </button>
              ))}
            </div>

            {/* CHAT INPUT AREA */}
            <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 relative bg-slate-900 border border-slate-800 focus-within:border-sky-500/70 rounded-2xl transition-all shadow-inner">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`از دستیار ${currentPersonaConfig.name} بپرسید... (Shift+Enter برای خط بعد)`}
                    rows={2}
                    className="w-full bg-transparent p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                  />

                  {/* BOTTOM UTILITY INSIDE TEXTAREA */}
                  <div className="flex items-center justify-between px-3 pb-2 text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>{input.length} کاراکتر</span>
                      <span>• مدل: Gemini 3.8 Flash</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {messages.length > 2 && (
                        <button
                          type="button"
                          onClick={handleRegenerate}
                          disabled={loading}
                          className="text-slate-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                          title="تولید مجدد آخرین پاسخ"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>تولید مجدد</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleClearCurrentChat}
                        className="text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="پاک‌سازی صفحه چت"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>پاکسازی</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SEND BUTTON */}
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-sky-900/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                >
                  <Send className="w-5 h-5 -rotate-90" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
