import React, { useState } from 'react';
import { HelpCircle, Plus, Trash2, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface EngagementPollsManagerProps {
  onInsertPollToPost: (pollText: string) => void;
}

export const EngagementPollsManager: React.FC<EngagementPollsManagerProps> = ({
  onInsertPollToPost,
}) => {
  const [question, setQuestion] = useState('آیا استفاده از هوش مصنوعی باعث رشد بهره‌وری شما شده است؟');
  const [options, setOptions] = useState<string[]>([
    'بله، کاملاً چشم‌گیر و موثر بوده 🚀',
    'تا حدودی در کارهای روتین کمک کرده ⚙️',
    'هنوز به صورت جدی استفاده نکردم ⏳',
  ]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [multipleAnswers, setMultipleAnswers] = useState(false);

  const addOption = () => {
    if (options.length >= 6) return;
    triggerHaptic('light');
    setOptions([...options, `گزینه ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    triggerHaptic('light');
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleInsert = () => {
    triggerHaptic('success');
    const formatted = `📊 **نظرسنجی تلگرام:**\n❓ **${question}**\n\n${options
      .map((opt, i) => `${i + 1}️⃣ ${opt}`)
      .join('\n')}\n\n⚙️ ${isAnonymous ? '🔹 نظرسنجی ناشناس' : '🔹 نظرسنجی عمومی'} ${
      multipleAnswers ? '• چند انتخابی' : ''
    }`;
    onInsertPollToPost(formatted);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <h4 className="font-bold text-white">سازنده نظرسنجی تعاملی (Telegram Poll)</h4>
        </div>
        <span className="text-[10px] text-slate-400">افزایش نرخ تعامل تا ۳ برابر</span>
      </div>

      {/* Question */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-slate-400">صورت سوال نظرسنجی:</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-sky-500 focus:outline-none"
        />
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-[11px] text-slate-400">گزینه‌های نظرسنجی:</label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-5 text-center font-mono text-slate-500 text-xs">{idx + 1}.</span>
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const next = [...options];
                next[idx] = e.target.value;
                setOptions(next);
              }}
              className="flex-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-sky-500 focus:outline-none"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 font-bold mt-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>افزودن گزینه جدید</span>
          </button>
        )}
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-300">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
          />
          <span>رای‌گیری ناشناس</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={multipleAnswers}
            onChange={(e) => setMultipleAnswers(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
          />
          <span>چند پاسخی</span>
        </label>
      </div>

      {/* Insert Button */}
      <button
        type="button"
        onClick={handleInsert}
        className="w-full py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600 border border-sky-500/30 hover:border-sky-500 text-sky-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>درج نظرسنجی در متن پست</span>
      </button>
    </div>
  );
};
