export type BotConnectivityStatus = 'online' | 'degraded' | 'offline' | 'rate_limited';

export interface BotHealthStatus {
  status: BotConnectivityStatus;
  latencyMs: number;
  uptime24h: number; // e.g. 99.8
  uptime7d: number; // e.g. 99.6
  lastPingTimestamp: string;
  history: number[]; // Last 12 ping latencies in milliseconds
  timeline30d: ('up' | 'degraded' | 'down')[]; // Visual status blocks
  packetLossPercent: number;
  datacenter: string; // e.g. 'DC4 - آمستردام (اروپا)'
  workerType: 'webhook' | 'long_polling';
  pendingUpdates: number;
  activeQueueCount: number;
  lastDispatchedAt?: string;
  lastError?: string;
}

export interface TelegramBotInfo {
  id: string;
  name: string;
  username: string; // e.g. '@TechGen_Bot'
  tokenMask: string; // e.g. '719284****:AAH9'
  channelId: string;
  channelName: string; // e.g. 'کانال فناوری و هوش مصنوعی'
  channelHandle: string; // e.g. '@tech_insights'
  channelCategory: string; // e.g. 'فناوری و استارتاپ'
  subscribersCount: number;
  permissions: {
    canPost: boolean;
    canEdit: boolean;
    canPin: boolean;
    canDelete: boolean;
    canInvite: boolean;
  };
  health: BotHealthStatus;
}

export interface NetworkHealthSummary {
  totalBots: number;
  onlineCount: number;
  degradedCount: number;
  offlineCount: number;
  averageLatencyMs: number;
  averageUptime24h: number;
  telegramApiEdgeStatus: 'operational' | 'degraded' | 'incident';
  lastGlobalSync: string;
}

export type MediaItemType = 'image' | 'video';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaItemType;
  url: string;
  size: number;
  sizeFormatted: string;
  file?: File;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  duration?: number; // seconds (for video)
  durationFormatted?: string; // e.g. "0:42"
  caption?: string;
  isCover?: boolean;
}

export interface ABTestConfig {
  testId: string;
  variant: 'A' | 'B';
  partnerVariantId?: string;
  testGoal: 'ctr' | 'views' | 'reactions';
  splitPercent: number;
}

export interface ABTestComparisonMetrics {
  views: number;
  clicks: number;
  reactions: number;
  engagementRate: number; // e.g. 5.4%
  winner?: boolean;
}

export interface ABTestRecord {
  id: string;
  name: string;
  channelHandle: string;
  status: 'active' | 'completed' | 'draft';
  goal: 'ctr' | 'views' | 'reactions';
  createdAt: string;
  completedAt?: string;
  variantA: {
    title: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
    mediaCount: number;
    metrics: ABTestComparisonMetrics;
  };
  variantB: {
    title: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
    mediaCount: number;
    metrics: ABTestComparisonMetrics;
  };
  winnerVariant?: 'A' | 'B' | null;
  strategySummary?: string;
}

export interface ScheduledPost {
  id: string;
  channelName: string;
  channelHandle: string;
  botUsername: string;
  title: string;
  previewText: string;
  scheduledTime: string;
  status: 'pending' | 'published' | 'failed';
  mediaType: 'text' | 'photo' | 'video' | 'album' | 'poll';
  mediaItems?: MediaItem[];
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  createdAt?: string;
  abTest?: ABTestConfig;
}

export type LSIKeywordCategory = 'primary' | 'semantic' | 'longtail' | 'trending' | 'hashtag';

export interface LSIKeywordItem {
  id: string;
  keyword: string;
  category: LSIKeywordCategory;
  categoryLabel: string;
  relevance: number; // 0 - 100
  searchVolume: 'خیلی زیاد' | 'زیاد' | 'متوسط و هدفمند';
  searchIntent: string;
  includedInDraft: boolean;
  occurrences: number;
  isCustom?: boolean;
}

export interface SEOAuditResult {
  primaryKeyword: string;
  lsiScore: number;
  totalLsiCount: number;
  includedLsiCount: number;
  coveragePercent: number;
  organicVisibilityLevel: 'عالی' | 'خوب' | 'متوسط' | 'نیازمند بهبود';
  densityWarning?: string | null;
  channelGrowthTips: string[];
  telegramSearchSnippet: {
    title: string;
    description: string;
    hasPrimaryInFirst100: boolean;
    hashtagCount: number;
  };
  keywords: LSIKeywordItem[];
}

export interface ChannelDayMetric {
  date: string;
  dayName: string;
  views: number;
  shares: number;
  engagementRate: number;
}

export interface Channel7DayTrend {
  channelHandle: string;
  channelName: string;
  subscribersCount: number;
  color: string;
  totalViews7d: number;
  totalShares7d: number;
  avgEngagementRate: number;
  viewsGrowthPercent: number;
  sharesGrowthPercent: number;
  dailyData: ChannelDayMetric[];
}

export interface AggregateDayMetric {
  date: string;
  dayName: string;
  totalViews: number;
  totalShares: number;
  avgEngagementRate: number;
  [key: string]: any;
}
