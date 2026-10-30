import { LSIKeywordItem, SEOAuditResult, LSIKeywordCategory } from '../types';

// Helper to normalize Persian text for resilient matching
export const normalizePersian = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[\u200C\u200B]/g, ' ') // replace zero-width non-joiner with space for matching
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F]/g, '') // remove arabic diacritics
    .replace(/[#*`_~]/g, ' ')
    .toLowerCase()
    .trim();
};

export const convertToHashtag = (keyword: string): string => {
  const clean = keyword
    .replace(/[#*`_~!?.,:;]/g, '')
    .trim()
    .replace(/[\s\u200C]+/g, '_');
  return clean ? `#${clean}` : '';
};

// Built-in high-authority semantic LSI topic clusters for Telegram organic growth
interface TopicCluster {
  matcher: (topicNorm: string, contentNorm: string) => boolean;
  primaryDefault: string;
  lsiSeeds: Array<{
    keyword: string;
    category: LSIKeywordCategory;
    categoryLabel: string;
    relevance: number;
    searchVolume: 'خیلی زیاد' | 'زیاد' | 'متوسط و هدفمند';
    searchIntent: string;
  }>;
  channelGrowthTips: string[];
}

const TOPIC_CLUSTERS: TopicCluster[] = [
  // 1. Artificial Intelligence, LLMs, Automation
  {
    matcher: (t, c) =>
      t.includes('هوش مصنوعی') ||
      t.includes('ai') ||
      t.includes('جمنای') ||
      t.includes('gemini') ||
      t.includes('chatgpt') ||
      t.includes('استدلال') ||
      c.includes('هوش مصنوعی') ||
      c.includes('مدل') ||
      c.includes('داده'),
    primaryDefault: 'هوش مصنوعی و مدل‌های استدلالی',
    lsiSeeds: [
      { keyword: 'هوش مصنوعی', category: 'primary', categoryLabel: 'کلیدواژه کانونی', relevance: 100, searchVolume: 'خیلی زیاد', searchIntent: 'اطلاعاتی و ترند' },
      { keyword: 'مدل‌های استدلالی', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 96, searchVolume: 'زیاد', searchIntent: 'تخصصی فناوری' },
      { keyword: 'پردازش داده‌ها', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 92, searchVolume: 'متوسط و هدفمند', searchIntent: 'علم داده' },
      { keyword: 'پرامپت نویسی حرفه‌ای', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 88, searchVolume: 'زیاد', searchIntent: 'آموزشی و کاربردی' },
      { keyword: 'ربات تلگرام هوشمند', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 89, searchVolume: 'خیلی زیاد', searchIntent: 'ابزار تلگرام' },
      { keyword: 'شبکه‌های عصبی عمیق', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 84, searchVolume: 'متوسط و هدفمند', searchIntent: 'علمی' },
      { keyword: 'تولید محتوا با هوش مصنوعی', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 94, searchVolume: 'خیلی زیاد', searchIntent: 'ابزار کسب‌وکار' },
      { keyword: 'الگوریتم‌های یادگیری ماشین', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 82, searchVolume: 'متوسط و هدفمند', searchIntent: 'توسعه نرم‌افزار' },
      { keyword: '#هوش_مصنوعی', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 98, searchVolume: 'خیلی زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: '#فناوری_روز', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 90, searchVolume: 'زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: '#چت_جی_پی_تی', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 87, searchVolume: 'زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: 'تحول دیجیتال در تلگرام', category: 'trending', categoryLabel: 'ترند تعاملی تلگرام', relevance: 85, searchVolume: 'متوسط و هدفمند', searchIntent: 'استراتژی رشد' },
    ],
    channelGrowthTips: [
      'کلیدواژه اصلی «هوش مصنوعی» را در ۹۰ کاراکتر اول پیش‌نویس قرار دهید تا در نتایج پیش‌نمایش جستجوی سراسری تلگرام (Telegram Global Search) بولد شود.',
      'افزودن حداقل ۳ کلمه کلیدی LSI مترادف شانس نمایش پست را در تب محتواهای پیشنهادی تلگرام ۴ برابر می‌کند.',
      'استفاده از هشتگ‌های ساختاریافته فارسی مانند #هوش_مصنوعی باعث ایندکس در آرشیو موضوعی پابلیک چنل‌ها می‌شود.',
    ],
  },

  // 2. Crypto, Web3, Trading & Finance
  {
    matcher: (t, c) =>
      t.includes('کریپتو') ||
      t.includes('ارز دیجیتال') ||
      t.includes('بیت کوین') ||
      t.includes('ترید') ||
      t.includes('تحلیل مالی') ||
      c.includes('کریپتو') ||
      c.includes('بیت‌کوین') ||
      c.includes('ارز دیجیتال') ||
      c.includes('معاملاتی'),
    primaryDefault: 'ارز دیجیتال و تحلیل بازار کریپتو',
    lsiSeeds: [
      { keyword: 'ارز دیجیتال', category: 'primary', categoryLabel: 'کلیدواژه کانونی', relevance: 100, searchVolume: 'خیلی زیاد', searchIntent: 'سرمایه‌گذاری' },
      { keyword: 'بیت کوین', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 97, searchVolume: 'خیلی زیاد', searchIntent: 'مارکت کپ' },
      { keyword: 'تحلیل تکنیکال و پرایس اکشن', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 93, searchVolume: 'خیلی زیاد', searchIntent: 'آموزش ترید' },
      { keyword: 'سیگنال فیوچرز و اسپات', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 90, searchVolume: 'خیلی زیاد', searchIntent: 'معاملاتی' },
      { keyword: 'مدیریت ریسک و سرمایه', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 89, searchVolume: 'زیاد', searchIntent: 'روانشناسی بازار' },
      { keyword: 'صرافی‌های معتبر بدون تحریم', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 86, searchVolume: 'زیاد', searchIntent: 'راهنمای ثبت‌نام' },
      { keyword: 'ایردراپ‌های رایگان تلگرام', category: 'trending', categoryLabel: 'ترند تعاملی تلگرام', relevance: 95, searchVolume: 'خیلی زیاد', searchIntent: 'کسب درآمد' },
      { keyword: '#ارز_دیجیتال', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 98, searchVolume: 'خیلی زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: '#بیت_کوین', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 96, searchVolume: 'خیلی زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: '#تریدینگ', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 88, searchVolume: 'زیاد', searchIntent: 'دیسکاوری تلگرام' },
    ],
    channelGrowthTips: [
      'عبارت «سیگنال» یا «تحلیل تکنیکال» از پرتکرارترین کلمات جستجوی کاربران فارسی در تلگرام است.',
      'همیشه حد ضرر (SL) و بازه زمانی تحلیل را ذکر کنید تا نرخ فوروارد به گروه‌های تلگرامی جهش یابد.',
      'از انباشت بیش از حد واژه‌های تکراری (Keyword Stuffing) خودداری کنید تا از گزارش اسپم جلوگیری شود.',
    ],
  },

  // 3. Telegram Channel Growth, SEO & Marketing
  {
    matcher: (t, c) =>
      t.includes('رشد') ||
      t.includes('کانال') ||
      t.includes('تلگرام') ||
      t.includes('ممبر') ||
      t.includes('بازاریابی') ||
      t.includes('محتوا') ||
      c.includes('رشد کانال') ||
      c.includes('ممبر') ||
      c.includes('فوروارد'),
    primaryDefault: 'رشد ارگانیک کانال تلگرام و سئو',
    lsiSeeds: [
      { keyword: 'رشد کانال تلگرام', category: 'primary', categoryLabel: 'کلیدواژه کانونی', relevance: 100, searchVolume: 'خیلی زیاد', searchIntent: 'مدیریت تلگرام' },
      { keyword: 'افزایش ممبر واقعی', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 95, searchVolume: 'خیلی زیاد', searchIntent: 'جذب مخاطب' },
      { keyword: 'الگوریتم جستجوی تلگرام', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 94, searchVolume: 'زیاد', searchIntent: 'سئو تخصصی' },
      { keyword: 'نرخ تعامل و سین پست‌ها', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 91, searchVolume: 'زیاد', searchIntent: 'آنالیز آماری' },
      { keyword: 'تبلیغات بازدیدی تلگرام', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 88, searchVolume: 'زیاد', searchIntent: 'اسپانسرشیپ' },
      { keyword: 'قلاب وایرال (Viral Hook)', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 89, searchVolume: 'متوسط و هدفمند', searchIntent: 'کپی‌رایتینگ' },
      { keyword: 'دکمه شیشه‌ای فراخوان به اقدام', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 85, searchVolume: 'متوسط و هدفمند', searchIntent: 'افزایش CTR' },
      { keyword: '#رشد_کانال', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 96, searchVolume: 'خیلی زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: '#تولید_محتوا', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 94, searchVolume: 'خیلی زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: '#سئو_تلگرام', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 90, searchVolume: 'زیاد', searchIntent: 'دیسکاوری تلگرام' },
    ],
    channelGrowthTips: [
      'استفاده از عبارت «افزایش ممبر واقعی» همراه با راهکارهای مستند بالاترین نرخ ذخیره (Saved Messages) را دارد.',
      'نگارش تیتر با ایموجی‌های کنتراست‌دار اسکرول مخاطب در فیدهای شلوغ را تا ۵۲٪ متوقف می‌کند.',
      'تگ کردن کانال و ربات منتشرکننده به موتور جستجوی تلگرام برای تعیین آتوریتی سیگنال می‌دهد.',
    ],
  },

  // 4. Programming, Tech & Web Development
  {
    matcher: (t, c) =>
      t.includes('برنامه نویسی') ||
      t.includes('پایتون') ||
      t.includes('کد') ||
      t.includes('وب') ||
      t.includes('نرم افزار') ||
      t.includes('امنیت') ||
      c.includes('کدنویسی') ||
      c.includes('پایتون') ||
      c.includes('توسعه‌دهنده'),
    primaryDefault: 'آموزش برنامه‌نویسی و توسعه نرم‌افزار',
    lsiSeeds: [
      { keyword: 'آموزش برنامه‌نویسی', category: 'primary', categoryLabel: 'کلیدواژه کانونی', relevance: 100, searchVolume: 'خیلی زیاد', searchIntent: 'آموزشی' },
      { keyword: 'پایتون برای مبتدیان و هوش مصنوعی', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 96, searchVolume: 'خیلی زیاد', searchIntent: 'یادگیری پروژه محور' },
      { keyword: 'توسعه فرانت‌اند و ری‌اکت', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 91, searchVolume: 'زیاد', searchIntent: 'تکنولوژی وب' },
      { keyword: 'کتابخانه‌ها و فریم‌ورک‌های ترند', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 87, searchVolume: 'زیاد', searchIntent: 'ابزار توسعه' },
      { keyword: 'امنیت سایبری و تست نفوذ', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 89, searchVolume: 'زیاد', searchIntent: 'امنیت شبکه' },
      { keyword: 'کدهای آماده گیت‌هاب', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 92, searchVolume: 'خیلی زیاد', searchIntent: 'ریپوزیتوری' },
      { keyword: '#برنامه_نویسی', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 98, searchVolume: 'خیلی زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: '#پایتون', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 95, searchVolume: 'خیلی زیاد', searchIntent: 'دیسکاوری تلگرام' },
      { keyword: '#توسعه_وب', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 88, searchVolume: 'زیاد', searchIntent: 'دیسکاوری تلگرام' },
    ],
    channelGrowthTips: [
      'پست‌های شامل سورس کد آماده با فرمت Markdown کد (```) بیشترین فوروارد را در بین جامعه توسعه‌دهندگان دارند.',
      'افزودن لینک ریپوزیتوری یا راهنمای خط‌به‌خط، اعتبار کانال را در موتورهای جستجو ارتقا می‌دهد.',
    ],
  },
];

// General Default Cluster for arbitrary topics
const GENERAL_CLUSTER: TopicCluster = {
  matcher: () => true,
  primaryDefault: 'محتوای ترند و آموزشی تلگرام',
  lsiSeeds: [
    { keyword: 'راهنمای جامع و نکات طلایی', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 92, searchVolume: 'زیاد', searchIntent: 'آموزشی' },
    { keyword: 'ترفندهای کاربردی و تست شده', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 89, searchVolume: 'خیلی زیاد', searchIntent: 'کاربردی' },
    { keyword: 'تحلیل عمیق و کاربردی', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 86, searchVolume: 'متوسط و هدفمند', searchIntent: 'تخصصی' },
    { keyword: 'منابع معتبر و تایید شده', category: 'semantic', categoryLabel: 'مفهوم معنایی LSI', relevance: 84, searchVolume: 'متوسط و هدفمند', searchIntent: 'مرجع' },
    { keyword: 'بررسی راهکارهای عملیاتی', category: 'longtail', categoryLabel: 'عبارت جستجوی تلگرام', relevance: 82, searchVolume: 'زیاد', searchIntent: 'اجرایی' },
    { keyword: '#آموزش', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 95, searchVolume: 'خیلی زیاد', searchIntent: 'دیسکاوری تلگرام' },
    { keyword: '#نکات_کلیدی', category: 'hashtag', categoryLabel: 'هشتگ ارگانیک اکسپلور', relevance: 90, searchVolume: 'زیاد', searchIntent: 'دیسکاوری تلگرام' },
    { keyword: '#TeleGen', category: 'hashtag', categoryLabel: 'هشتگ اختصاصی کانال', relevance: 85, searchVolume: 'متوسط و هدفمند', searchIntent: 'برندینگ' },
  ],
  channelGrowthTips: [
    'برای دستیابی به بالاترین رتبه در جستجوی تلگرام، کلمه کلیدی اصلی باید در ۲۰ کلمه ابتدایی ذکر شود.',
    'حداقل ۳ الی ۵ واژه مترادف و مفهومی (LSI) در متن توزیع کنید تا ربات سرچ تلگرام گستره معنایی پست را ثبت کند.',
    'تعداد ایده‌آل هشتگ‌های هر پست بین ۳ تا ۵ عدد است؛ هشتگ‌های بیشتر جلوه بصری را مخدوش می‌کند.',
  ],
};

// Check if a keyword exists in normalized text
export const checkKeywordInText = (
  keyword: string,
  normalizedText: string,
  rawText: string
): { included: boolean; count: number } => {
  const normKw = normalizePersian(keyword);
  if (!normKw || normKw.length < 2) return { included: false, count: 0 };

  // 1. Direct normalized search
  let count = 0;
  let pos = normalizedText.indexOf(normKw);
  while (pos !== -1) {
    count++;
    pos = normalizedText.indexOf(normKw, pos + normKw.length);
  }

  // 2. Also check hashtag version if keyword is words
  const hashtagVersion = convertToHashtag(keyword).toLowerCase();
  if (hashtagVersion && rawText.toLowerCase().includes(hashtagVersion)) {
    if (count === 0) count = 1;
  }

  return {
    included: count > 0,
    count,
  };
};

/**
 * Main Audit Function: Analyzes draft and topic, suggests LSI keywords, and computes SEO metrics
 */
export const auditDraftKeywords = (
  topic: string,
  content: string,
  customKeywords: string[] = []
): SEOAuditResult => {
  const normTopic = normalizePersian(topic || '');
  const normContent = normalizePersian(content || '');
  const rawContent = content || '';

  // 1. Find matching topic cluster
  const matchedCluster =
    TOPIC_CLUSTERS.find((cluster) => cluster.matcher(normTopic, normContent)) || GENERAL_CLUSTER;

  // 2. Identify Primary Keyword
  let primaryKeyword = '';
  if (topic && topic.trim()) {
    // Pick the most meaningful short phrase from the topic
    const cleanTopic = topic.replace(/[#*`_]/g, '').trim();
    const parts = cleanTopic.split(/[:؛،-]/);
    primaryKeyword = parts[0].trim();
  } else {
    // Look at first line of content
    const firstLine = rawContent.split('\n')[0].replace(/[#*`_]/g, '').trim();
    primaryKeyword = firstLine ? firstLine.slice(0, 45) : matchedCluster.primaryDefault;
  }

  // 3. Assemble full list of candidate LSI keywords
  const candidateList = [...matchedCluster.lsiSeeds];

  // If user entered a specific topic that has extra words, add them as dynamic LSI candidates
  if (normTopic.length > 5) {
    const topicWords = topic
      .split(/[\s,،-]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 3 && !['برای', 'همراه', 'برتر', 'جدید', 'ترین'].includes(w));

    topicWords.slice(0, 3).forEach((tw) => {
      if (!candidateList.some((c) => c.keyword.includes(tw))) {
        candidateList.push({
          keyword: tw,
          category: 'semantic',
          categoryLabel: 'کلیدواژه برآمده از ایده',
          relevance: 90,
          searchVolume: 'زیاد',
          searchIntent: 'هدفمند',
        });
      }
    });
  }

  // Add custom keywords registered by the user
  customKeywords.forEach((ck, idx) => {
    if (ck && ck.trim() && !candidateList.some((c) => c.keyword === ck.trim())) {
      candidateList.push({
        keyword: ck.trim(),
        category: 'longtail',
        categoryLabel: 'کلیدواژه سفارشی شما',
        relevance: 95,
        searchVolume: 'متوسط و هدفمند',
        searchIntent: 'سفارشی ادمین',
      });
    }
  });

  // 4. Audit each keyword against the current draft
  const keywords: LSIKeywordItem[] = candidateList.map((item, idx) => {
    const { included, count } = checkKeywordInText(item.keyword, normContent, rawContent);
    const isCustom = customKeywords.includes(item.keyword);
    return {
      id: `lsi-${idx}-${item.keyword.slice(0, 10)}`,
      keyword: item.keyword,
      category: item.category,
      categoryLabel: item.categoryLabel,
      relevance: item.relevance,
      searchVolume: item.searchVolume,
      searchIntent: item.searchIntent,
      includedInDraft: included,
      occurrences: count,
      isCustom,
    };
  });

  // 5. Score calculation (0 - 100)
  const totalLsiCount = keywords.length;
  const includedKeywords = keywords.filter((k) => k.includedInDraft);
  const includedLsiCount = includedKeywords.length;
  const coveragePercent = totalLsiCount > 0 ? Math.round((includedLsiCount / totalLsiCount) * 100) : 0;

  // Factors:
  // - First 120 chars contain primary or strong keyword: +25 pts
  const first120 = normContent.slice(0, 150);
  const primaryNorm = normalizePersian(primaryKeyword);
  const hasPrimaryInFirst100 = primaryNorm ? first120.includes(primaryNorm.split(' ')[0] || '') : false;

  // - LSI Coverage: up to 45 pts
  const coverageScore = Math.min(45, Math.round((coveragePercent / 100) * 45));

  // - Hashtag hygiene (between 2 and 6 hashtags is optimal): +15 pts
  const hashtagsMatches = rawContent.match(/#[\w\u0600-\u06FF]+/g) || [];
  const hashtagCount = hashtagsMatches.length;
  let hashtagScore = 0;
  if (hashtagCount >= 2 && hashtagCount <= 6) hashtagScore = 15;
  else if (hashtagCount === 1 || (hashtagCount > 6 && hashtagCount <= 9)) hashtagScore = 8;
  else if (hashtagCount > 9) hashtagScore = 4; // penalty for hashtag spam

  // - Content depth / length: +15 pts
  const wordCount = rawContent.split(/\s+/).filter(Boolean).length;
  let lengthScore = 5;
  if (wordCount >= 40 && wordCount <= 350) lengthScore = 15;
  else if (wordCount > 350) lengthScore = 12;
  else if (wordCount > 15) lengthScore = 10;

  let calculatedScore = (hasPrimaryInFirst100 ? 25 : 8) + coverageScore + hashtagScore + lengthScore;
  calculatedScore = Math.min(100, Math.max(25, calculatedScore));

  // Density Warning calculation
  let densityWarning: string | null = null;
  if (wordCount > 30) {
    for (const kw of includedKeywords) {
      if (kw.occurrences >= 4 && kw.occurrences / wordCount > 0.045) {
        densityWarning = `تکرار بیش از حد کلیدواژه «${kw.keyword}» (${kw.occurrences} بار) ممکن است باعث هشدار اسپم تلگرام شود.`;
        calculatedScore = Math.max(30, calculatedScore - 12);
        break;
      }
    }
  }

  // Level classification
  let organicVisibilityLevel: 'عالی' | 'خوب' | 'متوسط' | 'نیازمند بهبود' = 'نیازمند بهبود';
  if (calculatedScore >= 85) organicVisibilityLevel = 'عالی';
  else if (calculatedScore >= 70) organicVisibilityLevel = 'خوب';
  else if (calculatedScore >= 50) organicVisibilityLevel = 'متوسط';

  // Telegram snippet preview
  const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);
  const snippetTitle = lines[0] ? lines[0].slice(0, 60) : primaryKeyword;
  const snippetDescription = lines.slice(1, 4).join(' ').slice(0, 140) || 'متن پست تلگرام برای نمایش در نتایج جستجوی سراسری...';

  return {
    primaryKeyword,
    lsiScore: calculatedScore,
    totalLsiCount,
    includedLsiCount,
    coveragePercent,
    organicVisibilityLevel,
    densityWarning,
    channelGrowthTips: matchedCluster.channelGrowthTips,
    telegramSearchSnippet: {
      title: snippetTitle,
      description: snippetDescription,
      hasPrimaryInFirst100,
      hashtagCount,
    },
    keywords,
  };
};

/**
 * Call Server API to generate fresh dynamic LSI keywords via Gemini AI
 */
export const requestAILSIKeywords = async (
  topic: string,
  content: string
): Promise<{ keywords: string[]; primary: string; growthTip: string } | null> => {
  try {
    const res = await fetch('/api/seo/lsi-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, content }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch AI LSI keywords from backend:', err);
    return null;
  }
};
