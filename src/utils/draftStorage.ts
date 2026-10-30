// Client-side auto-save utility for PostStudio using LocalStorage + IndexedDB for media files

export interface SavedStudioDraft {
  topic: string;
  content: string;
  selectedToneId: string;
  selectedChannel: string;
  ctaText: string;
  ctaUrl: string;
  lsiScore?: number;
  lastSavedAt: string;
  mediaItems: Array<{
    id: string;
    name: string;
    type: 'image' | 'video';
    url: string;
    size: number;
    sizeFormatted: string;
    aspectRatio?: 'landscape' | 'portrait' | 'square';
    duration?: number;
    durationFormatted?: string;
    caption?: string;
    isCover?: boolean;
    dataUrl?: string; // Base64 fallback if small
  }>;
}

const LOCAL_STORAGE_KEY = 'telegen_post_studio_draft_v1';
const DB_NAME = 'telegen_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

// Open or initialize IndexedDB for robust local binary storage
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Convert File / Blob to Data URL
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Save media blobs into IndexedDB
async function saveMediaBlobsToIDB(items: any[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear old records first
    store.clear();

    for (const item of items) {
      if (item.file) {
        store.put({
          id: item.id,
          name: item.name,
          type: item.type,
          blob: item.file,
        });
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not store media in IndexedDB:', err);
  }
}

// Retrieve media blobs from IndexedDB
async function getMediaBlobsFromIDB(): Promise<Map<string, Blob>> {
  const map = new Map<string, Blob>();
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const records = request.result || [];
        for (const rec of records) {
          if (rec.id && rec.blob) {
            map.set(rec.id, rec.blob);
          }
        }
        resolve(map);
      };
      request.onerror = () => resolve(map);
    });
  } catch {
    return map;
  }
}

// Save draft to LocalStorage + IndexedDB
export async function saveStudioDraft(draft: SavedStudioDraft, originalFiles?: Map<string, File>): Promise<void> {
  try {
    // 1. Prepare items for localStorage.
    // If an item has a blob: URL and we can convert small files to data URL, do so.
    const serializableMedia = await Promise.all(
      draft.mediaItems.map(async (item) => {
        let finalUrl = item.url;
        let dataUrl = item.dataUrl;

        // If file is available and under 1.5MB, convert to dataUrl for immediate inline persistence
        const file = originalFiles?.get(item.id);
        if (file && file.size < 1.5 * 1024 * 1024 && !dataUrl) {
          try {
            dataUrl = await fileToDataUrl(file);
            finalUrl = dataUrl;
          } catch {
            // ignore
          }
        }

        return {
          id: item.id,
          name: item.name,
          type: item.type,
          url: finalUrl.startsWith('blob:') && dataUrl ? dataUrl : finalUrl,
          size: item.size,
          sizeFormatted: item.sizeFormatted,
          aspectRatio: item.aspectRatio,
          duration: item.duration,
          durationFormatted: item.durationFormatted,
          caption: item.caption,
          isCover: item.isCover,
          dataUrl,
        };
      })
    );

    const payload: SavedStudioDraft = {
      ...draft,
      mediaItems: serializableMedia,
      lastSavedAt: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));

    // 2. Also persist actual File objects into IndexedDB so video and larger media remain intact
    if (originalFiles && originalFiles.size > 0) {
      const itemsToStore: any[] = [];
      for (const item of draft.mediaItems) {
        const f = originalFiles.get(item.id);
        if (f) {
          itemsToStore.push({ id: item.id, name: item.name, type: item.type, file: f });
        }
      }
      if (itemsToStore.length > 0) {
        await saveMediaBlobsToIDB(itemsToStore);
      }
    }
  } catch (err) {
    console.warn('Failed to auto-save studio draft to LocalStorage:', err);
  }
}

// Load draft from LocalStorage & restore media blob URLs from IndexedDB
export async function loadStudioDraft(): Promise<SavedStudioDraft | null> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;

    const draft = JSON.parse(raw) as SavedStudioDraft;
    if (!draft || !draft.content) return null;

    // Retrieve media blobs from IndexedDB to recreate live blob URLs if necessary
    const idbBlobs = await getMediaBlobsFromIDB();

    const restoredMedia = (draft.mediaItems || []).map((item) => {
      // 1. If we have blob in IndexedDB, create a fresh object URL
      if (idbBlobs.has(item.id)) {
        const blob = idbBlobs.get(item.id)!;
        const freshUrl = URL.createObjectURL(blob);
        return {
          ...item,
          url: freshUrl,
          file: blob instanceof File ? blob : new File([blob], item.name, { type: blob.type }),
        };
      }

      // 2. If it has a dataUrl, use that
      if (item.dataUrl) {
        return {
          ...item,
          url: item.dataUrl,
        };
      }

      // 3. If url is external (https://...), it remains valid
      if (item.url && !item.url.startsWith('blob:')) {
        return item;
      }

      // 4. If it was an expired blob URL and nothing else was found, fallback
      return item;
    });

    return {
      ...draft,
      mediaItems: restoredMedia,
    };
  } catch (err) {
    console.warn('Failed to load studio draft from LocalStorage:', err);
    return null;
  }
}

// Clear draft from LocalStorage and IndexedDB
export async function clearStudioDraft(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn('Failed to clear studio draft:', err);
  }
}

// ==========================================
// NAMED DRAFTS MANAGER (سیستم پیش‌نویس‌های چندگانه با نام دلخواه)
// ==========================================

export interface NamedDraft {
  id: string;
  name: string;
  topic: string;
  content: string;
  selectedToneId: string;
  selectedChannel: string;
  ctaText: string;
  ctaUrl: string;
  lsiScore?: number;
  createdAt: string;
  updatedAt: string;
  mediaItems: Array<{
    id: string;
    name: string;
    type: 'image' | 'video';
    url: string;
    size: number;
    sizeFormatted: string;
    aspectRatio?: 'landscape' | 'portrait' | 'square';
    duration?: number;
    durationFormatted?: string;
    caption?: string;
    isCover?: boolean;
    dataUrl?: string;
  }>;
}

const NAMED_DRAFTS_STORAGE_KEY = 'telegen_saved_named_drafts_v1';

const INITIAL_SAMPLE_NAMED_DRAFTS: NamedDraft[] = [
  {
    id: 'draft-sample-1',
    name: 'تحلیل معماری مدل‌های استدلالی و استارتاپ‌ها',
    topic: 'بررسی نسل بعدی هوش مصنوعی و مدل‌های استدلالی عمیق',
    content: '🧠 **انقلاب استدلال در هوش مصنوعی: از پردازش متنی تا استنتاج چندمرحله‌ای**\n\nمدل‌های جدید استدلالی مرزهای تازه‌ای در توسعه نرم‌افزار و تحلیل کلان‌داده‌ها ایجاد کرده‌اند:\n\n• کاهش چشمگیر خطاهای توهم زبانی (Hallucination)\n• امکان حل مسائل پیچیده الگوریتمی و مالی\n• پیاده‌سازی گیت‌وی‌های امن چندمرحله‌ای\n\n💬 دیدگاه شما در رابطه با سرعت پذیرش این معماری در سازمان‌ها چیست؟\n\n#فناوری #هوش_مصنوعی #نوآوری #TeleGen',
    selectedToneId: 'professional',
    selectedChannel: '@tech_insights_ir',
    ctaText: 'مشاهده مقاله تکمیلی در پایگاه دانش',
    ctaUrl: 'https://t.me/tech_insights_ir',
    lsiScore: 94,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    mediaItems: [
      {
        id: 'media-draft-1',
        name: 'ai_reasoning_pipeline.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        size: 1450000,
        sizeFormatted: '1.4 مگابایت',
        caption: 'خط پردازش استدلال و شبکه‌های عصبی',
        isCover: true,
      },
    ],
  },
  {
    id: 'draft-sample-2',
    name: 'پیش‌نویس گزارش آن‌چین کریپتو و بیت‌کوین',
    topic: 'تحلیل سیگنال‌های نقدینگی صرافی‌ها و احساسات بازار',
    content: '📊 **گزارش تخصصی هفتگی: تحلیل نوسانات و جریان ورودی استیبل‌کوین‌ها**\n\nبررسی داده‌های آن‌چین نشان‌دهنده انباشت در سطوح حمایتی کلیدی و تثبیت شاخص‌های نقدینگی است:\n\n۱. افزایش شاخص خروجی از صرافی‌های متمرکز\n۲. رشد ۲۵ درصدی تعاملات قراردادهای هوشمند لایه دوم\n۳. فاندینگ ریت خنثی در بازارهای مشتقه\n\n⚠️ این تحلیل جنبه آموزشی داشته و توصیه مالی تلقی نمی‌شود.\n\n#کریپتو #بیت_کوین #تحلیل_تکنیکال',
    selectedToneId: 'analytical',
    selectedChannel: '@crypto_pulse_fa',
    ctaText: 'بررسی نمودارهای آن‌چین در دشبورد',
    ctaUrl: 'https://t.me/crypto_pulse_fa',
    lsiScore: 91,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    mediaItems: [
      {
        id: 'media-draft-2',
        name: 'market_liquidity_overview.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
        size: 1320000,
        sizeFormatted: '1.3 مگابایت',
        caption: 'نمودار جریان نقدینگی و عمق مارکت',
        isCover: true,
      },
    ],
  },
];

// Load all named drafts from LocalStorage
export async function getAllNamedDrafts(): Promise<NamedDraft[]> {
  try {
    const raw = localStorage.getItem(NAMED_DRAFTS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial sample drafts
      localStorage.setItem(NAMED_DRAFTS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_NAMED_DRAFTS));
      return INITIAL_SAMPLE_NAMED_DRAFTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Failed to load named drafts:', err);
    return [];
  }
}

// Save or update a named draft
export async function saveNamedDraft(
  draftData: Omit<NamedDraft, 'id' | 'createdAt' | 'updatedAt'>,
  originalFiles?: Map<string, File>,
  existingId?: string
): Promise<NamedDraft> {
  const drafts = await getAllNamedDrafts();
  const now = new Date().toISOString();

  // Prepare serializable media
  const serializableMedia = await Promise.all(
    (draftData.mediaItems || []).map(async (item) => {
      let finalUrl = item.url;
      let dataUrl = item.dataUrl;

      const file = originalFiles?.get(item.id);
      if (file && file.size < 1.5 * 1024 * 1024 && !dataUrl) {
        try {
          dataUrl = await fileToDataUrl(file);
          finalUrl = dataUrl;
        } catch {
          // ignore
        }
      }

      return {
        ...item,
        url: finalUrl.startsWith('blob:') && dataUrl ? dataUrl : finalUrl,
        dataUrl,
      };
    })
  );

  let targetDraft: NamedDraft;

  if (existingId) {
    const existingIndex = drafts.findIndex((d) => d.id === existingId);
    if (existingIndex !== -1) {
      targetDraft = {
        ...draftData,
        id: existingId,
        mediaItems: serializableMedia,
        createdAt: drafts[existingIndex].createdAt || now,
        updatedAt: now,
      };
      drafts[existingIndex] = targetDraft;
    } else {
      targetDraft = {
        ...draftData,
        id: existingId,
        mediaItems: serializableMedia,
        createdAt: now,
        updatedAt: now,
      };
      drafts.unshift(targetDraft);
    }
  } else {
    targetDraft = {
      ...draftData,
      id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mediaItems: serializableMedia,
      createdAt: now,
      updatedAt: now,
    };
    drafts.unshift(targetDraft);
  }

  try {
    localStorage.setItem(NAMED_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.warn('Failed to persist named drafts to LocalStorage:', err);
  }

  // Also backup original files to IndexedDB
  if (originalFiles && originalFiles.size > 0) {
    const itemsToStore: any[] = [];
    for (const item of draftData.mediaItems) {
      const f = originalFiles.get(item.id);
      if (f) {
        itemsToStore.push({ id: item.id, name: item.name, type: item.type, file: f });
      }
    }
    if (itemsToStore.length > 0) {
      await saveMediaBlobsToIDB(itemsToStore);
    }
  }

  return targetDraft;
}

// Delete a named draft
export async function deleteNamedDraft(id: string): Promise<boolean> {
  try {
    const drafts = await getAllNamedDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    localStorage.setItem(NAMED_DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.warn('Failed to delete named draft:', err);
    return false;
  }
}

// Rename a named draft
export async function renameNamedDraft(id: string, newName: string): Promise<boolean> {
  try {
    const drafts = await getAllNamedDrafts();
    const target = drafts.find((d) => d.id === id);
    if (!target) return false;
    target.name = newName;
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(NAMED_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    return true;
  } catch (err) {
    console.warn('Failed to rename named draft:', err);
    return false;
  }
}
