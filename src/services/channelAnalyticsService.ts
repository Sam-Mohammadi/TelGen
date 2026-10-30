import { TelegramBotInfo, Channel7DayTrend, ChannelDayMetric, AggregateDayMetric } from '../types';
import { DEFAULT_BOTS } from '../data/defaultBots';

// Palette of colors for channels
export const CHANNEL_COLORS = [
  '#38bdf8', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

// Generate 7-day labels ending today
export const getPast7Days = (): { date: string; dayName: string }[] => {
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  const result: { date: string; dayName: string }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayName = days[d.getDay()];
    const dateFormatted = d.toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric' });
    result.push({
      date: d.toISOString().split('T')[0],
      dayName: `${dayName} (${dateFormatted})`,
    });
  }
  return result;
};

// Generates realistic 7-day engagement metrics based on active bots
export const generate7DayMetricsForBots = (bots: TelegramBotInfo[]): {
  channels: Channel7DayTrend[];
  aggregate: AggregateDayMetric[];
} => {
  const activeBots = bots && bots.length > 0 ? bots : DEFAULT_BOTS;
  const daysList = getPast7Days();

  // Multiplier variations for 7 days (e.g. weekends vs weekdays in Iran: Thu/Fri differ)
  const dayVariationFactors = [0.88, 1.05, 1.12, 1.08, 1.15, 1.22, 0.95];

  const channels: Channel7DayTrend[] = activeBots.map((bot, index) => {
    const color = CHANNEL_COLORS[index % CHANNEL_COLORS.length];
    const subs = bot.subscribersCount || 20000;
    // Base daily views: approx 45% - 65% of subscriber count
    const baseDailyViews = Math.round(subs * 0.52);
    // Base daily shares: approx 5% - 8% of views
    const baseDailyShares = Math.round(baseDailyViews * 0.065);

    const dailyData: ChannelDayMetric[] = daysList.map((day, dIdx) => {
      const factor = dayVariationFactors[dIdx];
      // subtle pseudo-random variation based on bot ID and day
      const seed = ((bot.id.charCodeAt(bot.id.length - 1) + dIdx * 7) % 15) - 7;
      const variation = 1 + seed / 100;
      
      const views = Math.round(baseDailyViews * factor * variation);
      const shares = Math.round(baseDailyShares * factor * (1 + (seed * 0.5) / 100));
      const engagementRate = views > 0 ? Number(((shares / views) * 100).toFixed(1)) : 0;

      return {
        date: day.date,
        dayName: day.dayName,
        views,
        shares,
        engagementRate,
      };
    });

    const totalViews7d = dailyData.reduce((acc, d) => acc + d.views, 0);
    const totalShares7d = dailyData.reduce((acc, d) => acc + d.shares, 0);
    const avgEngagementRate =
      dailyData.length > 0
        ? Number(
            (
              dailyData.reduce((acc, d) => acc + d.engagementRate, 0) / dailyData.length
            ).toFixed(1)
          )
        : 0;

    return {
      channelHandle: bot.channelHandle || `@channel_${bot.id}`,
      channelName: bot.channelName || bot.name,
      subscribersCount: subs,
      color,
      totalViews7d,
      totalShares7d,
      avgEngagementRate,
      viewsGrowthPercent: +(12.5 + (index * 2.3)).toFixed(1),
      sharesGrowthPercent: +(15.8 + (index * 1.8)).toFixed(1),
      dailyData,
    };
  });

  // Calculate aggregated day data
  const aggregate: AggregateDayMetric[] = daysList.map((day, dIdx) => {
    let dayTotalViews = 0;
    let dayTotalShares = 0;
    const dynamicFields: Record<string, any> = {};

    channels.forEach((ch) => {
      const dMetric = ch.dailyData[dIdx];
      if (dMetric) {
        dayTotalViews += dMetric.views;
        dayTotalShares += dMetric.shares;
        // Channel-specific keys for multi-channel charts
        const sanitizedKey = ch.channelHandle.replace(/[@_]/g, '');
        dynamicFields[`views_${sanitizedKey}`] = dMetric.views;
        dynamicFields[`shares_${sanitizedKey}`] = dMetric.shares;
        dynamicFields[`rate_${sanitizedKey}`] = dMetric.engagementRate;
      }
    });

    const avgRate = dayTotalViews > 0 ? Number(((dayTotalShares / dayTotalViews) * 100).toFixed(1)) : 0;

    return {
      date: day.date,
      dayName: day.dayName,
      totalViews: dayTotalViews,
      totalShares: dayTotalShares,
      avgEngagementRate: avgRate,
      ...dynamicFields,
    };
  });

  return { channels, aggregate };
};

// Fetch from backend API or fallback to local generator
export const fetchChannelEngagementTrends = async (
  currentBots?: TelegramBotInfo[]
): Promise<{ channels: Channel7DayTrend[]; aggregate: AggregateDayMetric[] }> => {
  try {
    const res = await fetch('/api/analytics/channels-trend');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.channels && json.aggregate) {
        return {
          channels: json.channels,
          aggregate: json.aggregate,
        };
      }
    }
  } catch (err) {
    console.warn('Backend analytics endpoint unreachable, using client generator:', err);
  }

  // Graceful client fallback
  return generate7DayMetricsForBots(currentBots || DEFAULT_BOTS);
};

// Format Persian number with thousand separators
export const formatNumberFa = (num: number): string => {
  return new Intl.NumberFormat('fa-IR').format(num);
};
