export interface TonePreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  promptGuidance: string;
}

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'analytical',
    name: 'تخصصی و تحلیلی',
    emoji: '📊',
    description: 'لحن عمیق، مستند، همراه با آمار و استدلال منطقی',
    promptGuidance: 'با لحن تحلیلی، دقیق، مستند و بدون اغراق بنویس. از آمار و داده‌ها استفاده کن.',
  },
  {
    id: 'friendly',
    name: 'خودمانی و صمیمی',
    emoji: '☕',
    description: 'لحن گرم، تعاملی، مناسب کانال‌های عمومی و پادکست',
    promptGuidance: 'با لحن صمیمی، دوستانه، عامیانه و روان بنویس. مخاطب را به گفتگو دعوت کن.',
  },
  {
    id: 'breaking',
    name: 'فوری و ژورنالیستی',
    emoji: '⚡',
    description: 'کوتاه، شوکه‌کننده، تیترهای زرد جذاب بدون حاشیه',
    promptGuidance: 'با لحن خبری فوری (Breaking News)، تیترهای کوتاه، کوبنده و بدون حاشیه بنویس.',
  },
  {
    id: 'promotional',
    name: 'هیجانی و تبلیغاتی',
    emoji: '🔥',
    description: 'دارای قلاب قوی، جذابیت فروش و کال تو اکشن روشن',
    promptGuidance: 'با قلاب احساسی قوی، برانگیختن کنجکاوی و کال تو اکشن مستقیم بنویس.',
  },
  {
    id: 'educational',
    name: 'آموزشی و گام‌به‌گام',
    emoji: '🎓',
    description: 'توضیحات دسته‌بندی‌شده با فهرست‌بندی عددی و ساختارمند',
    promptGuidance: 'به شکل یک مینی‌راهنمای آموزشی گام‌به‌گام، شماره‌گذاری‌شده و ساده بنویس.',
  },
];
