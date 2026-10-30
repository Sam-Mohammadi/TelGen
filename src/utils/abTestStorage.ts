import { ABTestRecord } from '../types';

const AB_TESTS_STORAGE_KEY = 'telegen_ab_tests_v1';

export const INITIAL_SAMPLE_AB_TESTS: ABTestRecord[] = [
  {
    id: 'ab-sample-1',
    name: 'تست اثرگذاری تیتر سوالی در برابر تیتر خبری',
    channelHandle: '@tech_insights_ir',
    status: 'completed',
    goal: 'ctr',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    strategySummary: 'مقایسه قلاب پرسشی تحریک‌کننده کنجکاوی در برابر تیتر خبری تحلیلی استاندارد',
    winnerVariant: 'B',
    variantA: {
      title: 'رونمایی از نسل جدید مدل‌های استدلالی هوش مصنوعی',
      content: '🚀 **تحول در پردازش داده‌ها با مدل‌های جدید استدلالی هوش مصنوعی**\n\nامروز شاهد تغییری اساسی در نحوه تعامل ربات‌ها و پردازش متون چندرسانه‌ای هستیم...\n\n#هوش_مصنوعی #فناوری',
      ctaText: 'مطالعه تحلیل کامل در وبسایت',
      ctaUrl: 'https://t.me/tech_insights_ir',
      mediaCount: 1,
      metrics: {
        views: 2450,
        clicks: 142,
        reactions: 98,
        engagementRate: 5.8,
        winner: false,
      },
    },
    variantB: {
      title: 'آیا مدل‌های استدلالی جدید جای برنامه‌نویسان را می‌گیرند؟',
      content: '🔥 **آیا هوش مصنوعی وارد فاز تصمیم‌گیری بدون خطا شده است؟**\n\nبررسی ۳ سناریوی کلیدی که نشان می‌دهد چرا استدلال چندمرحله‌ای مدل‌های جدید قوانین بازی را عوض کرده است...\n\n#فناوری #هوش_مصنوعی',
      ctaText: 'مشاهده گزارش تحلیلی و مستندات',
      ctaUrl: 'https://t.me/tech_insights_ir',
      mediaCount: 1,
      metrics: {
        views: 2890,
        clicks: 254,
        reactions: 176,
        engagementRate: 8.8,
        winner: true,
      },
    },
  },
  {
    id: 'ab-sample-2',
    name: 'تست دکمه شیشه‌ای کوتاه در برابر دکمه دارای ایموجی و محرک',
    channelHandle: '@crypto_pulse_fa',
    status: 'active',
    goal: 'reactions',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    strategySummary: 'سنجش نرخ واکنش اعضای کانال به فرمت بولت‌پوینت‌های خلاصه در برابر متن تحلیلی پیوسته',
    variantA: {
      title: 'تحلیل آن‌چین بیت‌کوین و سیگنال‌های نقدینگی صرافی‌ها',
      content: '📊 تحلیل هفتگی بازار کریپتو:\nجریان خروجی استیبل‌کوین‌ها و مناطق نقدینگی اصلی در نمودار ۴ ساعته...',
      ctaText: 'مشاهده چارت',
      ctaUrl: 'https://t.me/crypto_pulse_fa',
      mediaCount: 1,
      metrics: {
        views: 1120,
        clicks: 68,
        reactions: 54,
        engagementRate: 4.8,
      },
    },
    variantB: {
      title: '🚨 ۵ سیگنال حیاتی آن‌چین بیت‌کوین که باید قبل از آخر هفته بدانید',
      content: '🚨 ۵ سیگنال حیاتی بازار کریپتو:\n• خروج ۲۴۰۰ بیت‌کوین از صرافی‌ها\n• تثبیت فاندینگ ریت در محدوده امن\n• افزایش ۳۰ درصدی تراکنش‌های نهنگ‌ها...',
      ctaText: '🔥 بررسی فوری سیگنال‌های کلیدی',
      ctaUrl: 'https://t.me/crypto_pulse_fa',
      mediaCount: 1,
      metrics: {
        views: 1380,
        clicks: 112,
        reactions: 95,
        engagementRate: 6.9,
      },
    },
  },
];

export function getAllABTests(): ABTestRecord[] {
  try {
    const raw = localStorage.getItem(AB_TESTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AB_TESTS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_AB_TESTS));
      return INITIAL_SAMPLE_AB_TESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load AB tests from LocalStorage:', err);
    return [];
  }
}

export function saveABTest(test: ABTestRecord): ABTestRecord {
  const tests = getAllABTests();
  const existingIdx = tests.findIndex((t) => t.id === test.id);
  if (existingIdx !== -1) {
    tests[existingIdx] = test;
  } else {
    tests.unshift(test);
  }

  try {
    localStorage.setItem(AB_TESTS_STORAGE_KEY, JSON.stringify(tests));
  } catch (err) {
    console.warn('Failed to save AB test to LocalStorage:', err);
  }
  return test;
}

export function deleteABTest(id: string): boolean {
  try {
    const tests = getAllABTests();
    const filtered = tests.filter((t) => t.id !== id);
    localStorage.setItem(AB_TESTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.warn('Failed to delete AB test:', err);
    return false;
  }
}
