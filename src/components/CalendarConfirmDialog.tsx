import React from 'react';
import { AlertTriangle, Trash2, Calendar, Check, X } from 'lucide-react';

interface CalendarConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  affectedItemsCount?: number;
  affectedItemsList?: string[];
  actionType?: 'delete' | 'sync' | 'update';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CalendarConfirmDialog: React.FC<CalendarConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  affectedItemsCount,
  affectedItemsList,
  actionType = 'sync',
  confirmText,
  cancelText = 'انصراف',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const isDestructive = actionType === 'delete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-right overflow-hidden flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDestructive
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
            }`}
          >
            {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {affectedItemsCount !== undefined && affectedItemsCount > 0 && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs">
            <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>تعداد رویدادهای تحت تأثیر:</span>
              <span className="text-sky-300 font-bold">{affectedItemsCount} مورد</span>
            </div>
            {affectedItemsList && affectedItemsList.length > 0 && (
              <ul className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1 text-slate-300 text-[11px]">
                {affectedItemsList.map((item, idx) => (
                  <li key={idx} className="truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30'
            }`}
          >
            {loading ? (
              <span>در حال انجام...</span>
            ) : (
              <>
                {isDestructive ? <Trash2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                <span>{confirmText || (isDestructive ? 'حذف قطعی رویداد' : 'تأیید و اعمال در تقویم')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
