import fs from 'fs';
import path from 'path';

export interface ServerMediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size?: number;
  sizeFormatted?: string;
  duration?: number;
  durationFormatted?: string;
  caption?: string;
}

export interface ServerQueuePost {
  id: string;
  channelName: string;
  channelHandle: string;
  botUsername: string;
  title: string;
  previewText: string;
  scheduledTime: string;
  status: 'pending' | 'published' | 'failed';
  mediaType: 'text' | 'photo' | 'video' | 'album' | 'poll';
  mediaItems?: ServerMediaItem[];
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  createdAt: string;
  abTest?: {
    testId: string;
    variant: 'A' | 'B';
    testGoal?: string;
    splitPercent?: number;
  };
}

const DEFAULT_POSTS: ServerQueuePost[] = [
  {
    id: 'p-1',
    channelName: 'فناوری و هوش مصنوعی پلاس',
    channelHandle: '@tech_insights_ir',
    botUsername: '@TechGen_PublisherBot',
    title: 'رونمایی از نسل جدید مدل‌های استدلالی Gemini',
    previewText: 'بررسی تحولات معماری جدید هوش مصنوعی و کاربردهای عملیاتی آن در سیستم‌های خودکار...',
    scheduledTime: 'امروز، ساعت ۱۹:۳۰',
    status: 'pending',
    mediaType: 'photo',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    mediaItems: [
      {
        id: 'm-default-1',
        name: 'gemini_reasoning_architecture.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        sizeFormatted: '1.4 MB',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-2',
    channelName: 'نبض کریپتو و تحلیل مالی',
    channelHandle: '@crypto_radar_live',
    botUsername: '@CryptoPulse_Bot',
    title: 'تحلیل آن‌چین بیت‌کوین و جریان ورودی به ETFها',
    previewText: 'بررسی نمودار حمایت کلیدی و نرخ فاندینگ ریت صرافی‌های مشتقه با سیگنال‌های حجمی...',
    scheduledTime: 'امروز، ساعت ۲۱:۰۰',
    status: 'pending',
    mediaType: 'photo',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-3',
    channelName: 'دیده‌بان استارتاپ‌ها و اکوسیستم',
    channelHandle: '@startup_pulse_news',
    botUsername: '@StartupReporter_Bot',
    title: 'گزارش فصلی جذب سرمایه استارتاپ‌های فین‌تک',
    previewText: 'رشد ۴۵ درصدی دورهای سرمایه‌گذاری سری A در خاورمیانه و بررسی روندهای آینده بازار...',
    scheduledTime: 'فردا، ساعت ۱۰:۰۰',
    status: 'pending',
    mediaType: 'text',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-4',
    channelName: 'مجله جامع سبک زندگی و تندرستی',
    channelHandle: '@lifestyle_mag_fa',
    botUsername: '@LifeGuide_AutoBot',
    title: '۵ عادت طلایی برای بهبود تمرکز در ساعات کاری',
    previewText: 'تکنیک‌های مبتنی بر علوم اعصاب برای کاهش فرسودگی شغلی و افزایش بازدهی ذهنی...',
    scheduledTime: 'فردا، ساعت ۱۴:۱۵',
    status: 'pending',
    mediaType: 'album',
    mediaItems: [
      {
        id: 'm-default-2',
        name: 'focus_guide_infographic.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
        sizeFormatted: '2.1 MB',
      },
      {
        id: 'm-default-3',
        name: 'productivity_habits.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
        sizeFormatted: '1.8 MB',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-5',
    channelName: 'نبض کریپتو و تحلیل مالی',
    channelHandle: '@crypto_radar_live',
    botUsername: '@CryptoPulse_Bot',
    title: 'سیگنال بریک‌اوت سولانا و رالی توکن‌های اکوسیستم',
    previewText: 'بررسی عبور سولانا از مقاومت کلیدی ۱۸۰ دلار و ثبت حجم معاملات рекорд در صرافی‌های غیرمتمرکز...',
    scheduledTime: 'امروز، ساعت ۱۲:۰۰',
    status: 'published',
    mediaType: 'photo',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p-6',
    channelName: 'دیده‌بان استارتاپ‌ها و اکوسیستم',
    channelHandle: '@startup_pulse_news',
    botUsername: '@StartupReporter_Bot',
    title: 'مصاحبه اختصاصی: چالش‌های دریافت مجوز صرافی‌های دارایی دیجیتال',
    previewText: 'گفتگو با مدیران فین‌تک درباره آخرین دستورالعمل‌های رگولاتوری و تاثیر آن بر نوآوری مالی...',
    scheduledTime: 'دیروز، ساعت ۱۸:۳۰',
    status: 'failed',
    mediaType: 'text',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

class QueueService {
  private posts: ServerQueuePost[] = [];
  private dataFilePath: string;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), 'data', 'queue-posts.json');
    this.loadPosts();
  }

  private loadPosts() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        this.posts = JSON.parse(raw);
        return;
      }
    } catch (e) {
      console.warn('Could not read queue-posts.json, using defaults', e);
    }
    this.posts = [...DEFAULT_POSTS];
    this.savePosts();
  }

  private savePosts() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.posts, null, 2), 'utf8');
    } catch (e) {
      console.warn('Could not persist queue posts to disk', e);
    }
  }

  public getAll(): ServerQueuePost[] {
    return this.posts;
  }

  public addPost(post: Partial<ServerQueuePost>): ServerQueuePost {
    const newPost: ServerQueuePost = {
      id: post.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channelName: post.channelName || 'کانال تلگرام',
      channelHandle: post.channelHandle || '@tech_insights_ir',
      botUsername: post.botUsername || '@TechGen_PublisherBot',
      title: post.title || 'پست جدید استودیو',
      previewText: post.previewText || '',
      scheduledTime: post.scheduledTime || 'امروز، ساعت ۲۲:۰۰',
      status: post.status || 'pending',
      mediaType: post.mediaType || 'text',
      mediaItems: post.mediaItems || [],
      imageUrl: post.imageUrl || (post.mediaItems?.[0]?.url || undefined),
      ctaText: post.ctaText,
      ctaUrl: post.ctaUrl,
      createdAt: new Date().toISOString(),
      abTest: post.abTest,
    };

    // Prepend to top of queue
    this.posts.unshift(newPost);
    this.savePosts();
    return newPost;
  }

  public deletePost(id: string): boolean {
    const initialLen = this.posts.length;
    this.posts = this.posts.filter((p) => p.id !== id);
    if (this.posts.length !== initialLen) {
      this.savePosts();
      return true;
    }
    return false;
  }

  public dispatchNow(id: string): ServerQueuePost | null {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return null;
    post.status = 'published';
    this.savePosts();
    return post;
  }

  public updateStatus(id: string, status: 'pending' | 'published' | 'failed'): ServerQueuePost | null {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return null;
    post.status = status;
    this.savePosts();
    return post;
  }
}

export const queueService = new QueueService();
