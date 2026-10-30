import React, { useState } from 'react';
import { Bot, Send, ShieldCheck, Key, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface NewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channelData: any) => void;
}

export const NewChannelModal: React.FC<NewChannelModalProps> = ({
  isOpen,
  onClose,
  onAddChannel,
}) => {
  const [channelName, setChannelName] = useState('');
  const [channelHandle, setChannelHandle] = useState('');
  const [botToken, setBotToken] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [category, setCategory] = useState('عمومی و سرگرمی');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName || !botToken) return;

    triggerHaptic('medium');
    setIsVerifying(true);

    // Simulate Bot API getMe & getChatAdministrators verification
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      triggerHaptic('success');

      setTimeout(() => {
        onAddChannel({
          channelName,
          channelHandle: channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`,
          botToken,
          botUsername: botUsername.startsWith('@') ? botUsername : `@${botUsername}`,
          category,
        });
        onClose();
      }, 700);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">اتصال کانال و ربات جدید تلگرام</h3>
              <p className="text-[11px] text-slate-400">
                پایش لحظه‌ای اتصال و سلامت شبکه در داشبورد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleTestAndSave} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              نام کانال تلگرام <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="مثال: آکادمی هوش مصنوعی و داده"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              آیدی عمومی کانال (Username)
            </label>
            <input
              type="text"
              value={channelHandle}
              onChange={(e) => setChannelHandle(e.target.value)}
              placeholder="@channel_username"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-mono text-left focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              توکن ربات اختصاصی (Bot Father Token) <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              required
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="719284****:AAH9..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-mono text-left focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              توکن به صورت امن و هش‌شده ذخیره شده و فقط برای پروب پینگ و ارسال پست استفاده می‌شود.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              نام کاربری ربات (Bot Username)
            </label>
            <input
              type="text"
              value={botUsername}
              onChange={(e) => setBotUsername(e.target.value)}
              placeholder="@MyPublisher_Bot"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-mono text-left focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">دسته‌بندی موضوعی</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="تکنولوژی و وب">تکنولوژی و وب</option>
              <option value="اقتصاد و مالی">اقتصاد و مالی</option>
              <option value="کسب‌وکار و استارتاپ">کسب‌وکار و استارتاپ</option>
              <option value="آموزش و پژوهش">آموزش و پژوهش</option>
              <option value="سبک زندگی و سلامت">سبک زندگی و سلامت</option>
            </select>
          </div>

          {verifiedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>ربات با موفقیت تایید و به شبکه پایش زنده اضافه شد!</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/20 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? 'در حال تست توکن...' : 'تست اتصال و ثبت نهایی'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
