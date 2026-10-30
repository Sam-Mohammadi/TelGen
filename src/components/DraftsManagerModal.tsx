import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  FolderOpen,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Layers,
  Film,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Save,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  NamedDraft,
  getAllNamedDrafts,
  saveNamedDraft,
  deleteNamedDraft,
  renameNamedDraft,
} from '../utils/draftStorage';
import { triggerHaptic } from '../utils/haptics';
import { MediaItem } from '../types';

interface DraftsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  currentTopic: string;
  currentToneId: string;
  currentChannel: string;
  currentCtaText: string;
  currentCtaUrl: string;
  currentLsiScore?: number;
  currentMediaItems: MediaItem[];
  onLoadDraft: (draft: NamedDraft) => void;
}

export const DraftsManagerModal: React.FC<DraftsManagerModalProps> = ({
  isOpen,
  onClose,
  currentContent,
  currentTopic,
  currentToneId,
  currentChannel,
  currentCtaText,
  currentCtaUrl,
  currentLsiScore,
  currentMediaItems,
  onLoadDraft,
}) => {
  const [drafts, setDrafts] = useState<NamedDraft[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveAsModalOpen, setSaveAsModalOpen] = useState(false);
  const [newDraftName, setNewDraftName] = useState('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadDraftsList = async () => {
    const list = await getAllNamedDrafts();
    setDrafts(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadDraftsList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleOpenSaveModal = () => {
    triggerHaptic('light');
    const firstLine = currentContent.split('\n')[0].replace(/[#*`_]/g, '').trim();
    setNewDraftName(firstLine || currentTopic || `پیش‌نویس ${new Date().toLocaleDateString('fa-IR')}`);
    setSaveAsModalOpen(true);
  };

  const handleSaveCurrentAsDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftName.trim()) return;

    triggerHaptic('medium');
    const originalFiles = new Map<string, File>();
    for (const m of currentMediaItems) {
      if (m.file) {
        originalFiles.set(m.id, m.file);
      }
    }

    const saved = await saveNamedDraft(
      {
        name: newDraftName.trim(),
        topic: currentTopic,
        content: currentContent,
        selectedToneId: currentToneId,
        selectedChannel: currentChannel,
        ctaText: currentCtaText,
        ctaUrl: currentCtaUrl,
        lsiScore: currentLsiScore,
        mediaItems: currentMediaItems.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          url: m.url,
          size: m.size,
          sizeFormatted: m.sizeFormatted,
          aspectRatio: m.aspectRatio,
          duration: m.duration,
          durationFormatted: m.durationFormatted,
          caption: m.caption,
          isCover: m.isCover,
        })),
      },
      originalFiles
    );

    await loadDraftsList();
    setSaveAsModalOpen(false);
    triggerHaptic('success');
    showToast(`پیش‌نویس «${saved.name}» با موفقیت ذخیره شد.`);
  };

  const handleOverwriteDraft = async (draft: NamedDraft) => {
    triggerHaptic('medium');
    const originalFiles = new Map<string, File>();
    for (const m of currentMediaItems) {
      if (m.file) {
        originalFiles.set(m.id, m.file);
      }
    }

    await saveNamedDraft(
      {
        name: draft.name,
        topic: currentTopic,
        content: currentContent,
        selectedToneId: currentToneId,
        selectedChannel: currentChannel,
        ctaText: currentCtaText,
        ctaUrl: currentCtaUrl,
        lsiScore: currentLsiScore,
        mediaItems: currentMediaItems.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          url: m.url,
          size: m.size,
          sizeFormatted: m.sizeFormatted,
          aspectRatio: m.aspectRatio,
          duration: m.duration,
          durationFormatted: m.durationFormatted,
          caption: m.caption,
          isCover: m.isCover,
        })),
      },
      originalFiles,
      draft.id
    );

    await loadDraftsList();
    triggerHaptic('success');
    showToast(`پیش‌نویس «${draft.name}» با محتوای فعلی به‌روزرسانی شد.`);
  };

  const handleDeleteDraft = async (id: string, name: string) => {
    triggerHaptic('light');
    await deleteNamedDraft(id);
    await loadDraftsList();
    showToast(`پیش‌نویس «${name}» حذف شد.`);
  };

  const handleStartRename = (draft: NamedDraft) => {
    triggerHaptic('light');
    setEditingDraftId(draft.id);
    setEditNameValue(draft.name);
  };

  const handleSaveRename = async (id: string) => {
    if (!editNameValue.trim()) return;
    triggerHaptic('light');
    await renameNamedDraft(id, editNameValue.trim());
    setEditingDraftId(null);
    await loadDraftsList();
    showToast('نام پیش‌نویس به‌روزرسانی شد.');
  };

  const handleSelectDraftToLoad = (draft: NamedDraft) => {
    triggerHaptic('medium');
    onLoadDraft(draft);
    onClose();
  };

  const filteredDrafts = drafts.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.topic.toLowerCase().includes(q) ||
      d.selectedChannel.toLowerCase().includes(q)
    );
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('fa-IR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  مدیریت پیش‌نویس‌ها (Drafts Manager)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono font-bold">
                  {drafts.length} پیش‌نویس
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ذخیره پست‌های نیمه‌تمام با نام اختصاصی، دسته‌بندی و بازخوانی مجدد در استودیو
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenSaveModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ذخیره محتوای فعلی</span>
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

        {/* FEEDBACK TOAST */}
        {feedback && (
          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در میان نام پیش‌نویس‌ها، کانال، موضوع یا متن..."
              className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* DRAFTS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredDrafts.length === 0 && (
            <div className="p-10 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">پیش‌نویسی یافت نشد</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'هیچ پیش‌نویسی با عبارت جستجو شده تطابق ندارد.'
                  : 'هنوز پیش‌نویسی ذخیره نکرده‌اید. با کلیک بر روی «ذخیره محتوای فعلی» می‌توانید پست در حال ویرایش خود را با نام دلخواه ذخیره کنید.'}
              </p>
            </div>
          )}

          {filteredDrafts.map((draft) => {
            const mediaCount = draft.mediaItems ? draft.mediaItems.length : 0;
            const photoCount = draft.mediaItems?.filter((m) => m.type === 'image').length || 0;
            const videoCount = draft.mediaItems?.filter((m) => m.type === 'video').length || 0;
            const isEditing = editingDraftId === draft.id;

            return (
              <div
                key={draft.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm group"
              >
                {/* DRAFT DETAILS */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 max-w-md">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-sky-500 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(draft.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDraftId(null)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                          {draft.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartRename(draft)}
                          className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                          title="تغییر نام پیش‌نویس"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </>
                    )}

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-sky-400 border border-slate-800 font-mono">
                      {draft.selectedChannel}
                    </span>

                    {mediaCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-violet-300 border border-slate-800 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-violet-400" />
                        <span>
                          {photoCount > 0 && `📷 ${photoCount} عکس`}
                          {photoCount > 0 && videoCount > 0 && ' / '}
                          {videoCount > 0 && `🎬 ${videoCount} ویدیو`}
                        </span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {draft.content}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>آخرین ویرایش: {formatDate(draft.updatedAt || draft.createdAt)}</span>
                    </span>
                    {draft.lsiScore && (
                      <span>• شاخص سئو: {draft.lsiScore}%</span>
                    )}
                  </div>
                </div>

                {/* DRAFT ACTIONS */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-800/80 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-1.5">
                    {/* Overwrite with current editor */}
                    <button
                      type="button"
                      onClick={() => handleOverwriteDraft(draft)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      title="به‌روزرسانی این پیش‌نویس با محتوای فعلی استودیو"
                    >
                      به‌روزرسانی
                    </button>

                    {/* Delete Draft */}
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(draft.id, draft.name)}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                      title="حذف پیش‌نویس"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Load into Studio Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectDraftToLoad(draft)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    <span>بازخوانی در استودیو</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            پیش‌نویس‌ها به‌طور مستقل در حافظه مرورگر ذخیره و حتی پس از بستن تب در دسترس هستند.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>

      {/* SAVE AS DRAFT SUB-MODAL */}
      {saveAsModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white">ذخیره پست فعلی به عنوان پیش‌نویس جدید</h4>
              </div>
              <button
                type="button"
                onClick={() => setSaveAsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentAsDraft} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  نام پیش‌نویس جهت دسته‌بندی و شناسایی آسان:
                </label>
                <input
                  type="text"
                  required
                  value={newDraftName}
                  onChange={(e) => setNewDraftName(e.target.value)}
                  placeholder="مثال: تحلیل بازار بیت‌کوین - نسخه نهایی..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              {/* Summary */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-400">
                <div className="flex items-center justify-between">
                  <span>کانال مقصد:</span>
                  <span className="text-white font-mono">{currentChannel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>رسانه‌های پیوست:</span>
                  <span className="text-sky-300 font-bold">
                    {currentMediaItems.length > 0
                      ? `${currentMediaItems.length} فایل (عکس و ویدیو)`
                      : 'بدون رسانه'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>تعداد کاراکترها:</span>
                  <span className="text-white font-mono">{currentContent.length} کاراکتر</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSaveAsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white font-bold cursor-pointer"
                >
                  ذخیره پیش‌نویس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
