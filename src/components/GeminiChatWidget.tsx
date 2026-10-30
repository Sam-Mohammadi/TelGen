import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface GeminiChatWidgetProps {
  onInsertToStudio?: (text: string) => void;
}

export const GeminiChatWidget: React.FC<GeminiChatWidgetProps> = ({ onInsertToStudio }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'gemini'; text: string }>>([
    {
      id: 'm1',
      sender: 'gemini',
      text: 'سلام! چطور می‌تونم در تولید پرامپت سفارشی، ایده‌پردازی یا سئوی تلگرام بهت کمک کنم؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    triggerHaptic('light');
    const userMsg = { id: `u-${Date.now()}`, sender: 'user' as const, text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history: messages.slice(-6) }),
      });
      const data = await res.json();
      const reply = data.reply || 'پاسخی دریافت نشد.';
      setMessages((prev) => [...prev, { id: `g-${Date.now()}`, sender: 'gemini', text: reply }]);
      triggerHaptic('success');
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, sender: 'gemini', text: 'خطا در ارتباط با سرور.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    triggerHaptic('light');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {isOpen ? (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 backdrop-blur-xl">
          {/* Header */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-500 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">دستیار هوشمند Gemini</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar text-xs bg-slate-950/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-xl max-w-[88%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.text}</div>
                  {m.sender === 'gemini' && (
                    <div className="mt-1.5 pt-1 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => copyText(m.text, m.id)}
                        className="hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>کپی متن</span>
                          </>
                        )}
                      </button>

                      {onInsertToStudio && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onInsertToStudio(m.text);
                          }}
                          className="hover:text-sky-300 font-bold cursor-pointer"
                        >
                          انتقال به استودیو
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[11px] text-sky-400 flex items-center gap-1.5 p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جمنای در حال نگارش...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="درخواست خود را بنویسید..."
              className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 -rotate-12" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setIsOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-sky-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/30 border border-indigo-400/30 transition-all hover:scale-105 cursor-pointer group"
          title="دستیار تعاملی هوش مصنوعی Gemini"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>دستیار هوشمند Gemini</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}
    </div>
  );
};
