import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Eye,
  Share2,
  Users,
  RefreshCw,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Channel7DayTrend, AggregateDayMetric, TelegramBotInfo } from '../types';
import {
  fetchChannelEngagementTrends,
  formatNumberFa,
  CHANNEL_COLORS,
} from '../services/channelAnalyticsService';
import { triggerHaptic } from '../utils/haptics';

interface ChannelEngagementTrendsProps {
  bots?: TelegramBotInfo[];
  className?: string;
}

export const ChannelEngagementTrends: React.FC<ChannelEngagementTrendsProps> = ({
  bots,
  className = '',
}) => {
  const [data, setData] = useState<{
    channels: Channel7DayTrend[];
    aggregate: AggregateDayMetric[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChannelHandle, setSelectedChannelHandle] = useState<string>('all'); // 'all' or specific channel handle or 'compare'
  const [metricMode, setMetricMode] = useState<'both' | 'views' | 'shares'>('both');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');

  // Load trend data
  const loadTrends = async (isManual = false) => {
    if (isManual) {
      triggerHaptic('light');
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetchChannelEngagementTrends(bots);
      setData(res);
    } catch (err) {
      console.error('Failed to load channel engagement trends:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, [bots]);

  // Current active channels
  const channels = data?.channels || [];
  const aggregate = data?.aggregate || [];

  // Selected channel object if specific channel chosen
  const activeSingleChannel = useMemo(() => {
    if (selectedChannelHandle === 'all' || selectedChannelHandle === 'compare') return null;
    return channels.find((c) => c.channelHandle === selectedChannelHandle) || null;
  }, [channels, selectedChannelHandle]);

  // Overall KPI numbers
  const kpis = useMemo(() => {
    if (!data) return { totalViews: 0, totalShares: 0, avgRate: 0, topChannel: '' };

    if (activeSingleChannel) {
      return {
        totalViews: activeSingleChannel.totalViews7d,
        totalShares: activeSingleChannel.totalShares7d,
        avgRate: activeSingleChannel.avgEngagementRate,
        viewsGrowth: activeSingleChannel.viewsGrowthPercent,
        sharesGrowth: activeSingleChannel.sharesGrowthPercent,
        topChannel: activeSingleChannel.channelName,
        subscribers: activeSingleChannel.subscribersCount,
      };
    }

    const totalViews = channels.reduce((sum, ch) => sum + ch.totalViews7d, 0);
    const totalShares = channels.reduce((sum, ch) => sum + ch.totalShares7d, 0);
    const avgRate = totalViews > 0 ? Number(((totalShares / totalViews) * 100).toFixed(1)) : 0;
    const top = [...channels].sort((a, b) => b.totalViews7d - a.totalViews7d)[0];

    return {
      totalViews,
      totalShares,
      avgRate,
      viewsGrowth: 16.4,
      sharesGrowth: 21.8,
      topChannel: top ? `${top.channelName} (${top.channelHandle})` : 'کانال‌های فعال',
      subscribers: channels.reduce((sum, ch) => sum + ch.subscribersCount, 0),
    };
  }, [data, activeSingleChannel, channels]);

  // Chart data source
  const chartData = useMemo(() => {
    if (!data) return [];
    if (activeSingleChannel) {
      return activeSingleChannel.dailyData;
    }
    return aggregate;
  }, [data, activeSingleChannel, aggregate]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-950/95 border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-right font-sans text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300 font-bold">
          <span>{label}</span>
          <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">آمار روزانه</span>
        </div>

        <div className="space-y-1.5">
          {payload.map((item: any, idx: number) => {
            let labelFa = item.name;
            if (item.name === 'views' || item.name === 'totalViews') labelFa = 'بازدیدها (Views)';
            else if (item.name === 'shares' || item.name === 'totalShares') labelFa = 'فوروارد / اشتراک (Shares)';
            else if (item.name === 'engagementRate' || item.name === 'avgEngagementRate') labelFa = 'نرخ بازنشر (٪)';

            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: item.color || item.fill || '#38bdf8' }}
                  />
                  <span className="text-slate-300">{labelFa}:</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {item.name.includes('Rate') || item.name.includes('rate')
                    ? `${item.value}٪`
                    : formatNumberFa(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 ${className}`}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>روند ۷ روزه تعامل کانال‌های فعال تلگرام</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-normal">
                  Recharts Metrics
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                پایش تحلیلی بازدیدها (Views) و فورواردها (Shares) در بازه ۷ روز اخیر به همراه نرخ بازنشر ارگانیک
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS: REFRESH & TIMEFRAME BADGE */}
        <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>۷ روز اخیر</span>
          </div>

          <button
            type="button"
            onClick={() => loadTrends(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="به‌روزرسانی داده‌های تحلیلی"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>به‌روزرسانی</span>
          </button>
        </div>
      </div>

      {/* TOP KPI SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL VIEWS */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-sky-950/30 border border-slate-800/90 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>مجموع بازدیدها (Views)</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{kpis.viewsGrowth}٪</span>
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatNumberFa(kpis.totalViews)}
            <span className="text-xs text-slate-400 font-sans mr-1 font-normal">سین</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>میانگین روزانه:</span>
            <span className="font-mono text-slate-300">
              {formatNumberFa(Math.round(kpis.totalViews / 7))} / روز
            </span>
          </div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* KPI 2: TOTAL SHARES */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-purple-950/30 border border-slate-800/90 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>مجموع فوروارد و اشتراک (Shares)</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{kpis.sharesGrowth}٪</span>
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatNumberFa(kpis.totalShares)}
            <span className="text-xs text-slate-400 font-sans mr-1 font-normal">فوروارد</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>میانگین روزانه:</span>
            <span className="font-mono text-slate-300">
              {formatNumberFa(Math.round(kpis.totalShares / 7))} / روز
            </span>
          </div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* KPI 3: ENGAGEMENT RATE */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-950/30 border border-slate-800/90 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>نرخ بازنشر اعضا (Viral Ratio)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20">
              عالی
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {kpis.avgRate}٪
            <span className="text-xs text-slate-400 font-sans mr-1 font-normal">فوروارد به بازدید</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>وضعیت ویروسی بودن:</span>
            <span className="text-slate-300 font-medium">شانس بالای ورود به اکسپلور</span>
          </div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* KPI 4: AUDIENCE COVERAGE */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-amber-950/30 border border-slate-800/90 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>پوشش مخاطب فعال</span>
            </span>
            <span className="text-[11px] text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-lg border border-amber-500/20">
              {channels.length} کانال
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono truncate" title={kpis.topChannel}>
            {formatNumberFa(kpis.subscribers || 0)}
            <span className="text-xs text-slate-400 font-sans mr-1 font-normal">عضو کل</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60 truncate">
            <span>کانال پیشرو:</span>
            <span className="text-sky-300 font-medium truncate max-w-[140px]" title={kpis.topChannel}>
              {kpis.topChannel}
            </span>
          </div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* FILTER & CONFIGURATION CONTROL BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
        {/* CHANNEL SELECTOR BUTTONS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 ml-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>کانال:</span>
          </span>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedChannelHandle('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedChannelHandle === 'all'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>همه کانال‌ها (مجموع)</span>
          </button>

          {channels.map((ch, idx) => (
            <button
              key={ch.channelHandle}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setSelectedChannelHandle(ch.channelHandle);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedChannelHandle === ch.channelHandle
                  ? 'bg-slate-800 text-white border shadow-sm'
                  : 'bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-white'
              }`}
              style={{
                borderColor: selectedChannelHandle === ch.channelHandle ? ch.color : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: ch.color }}
              />
              <span className="truncate max-w-[130px]">{ch.channelName}</span>
            </button>
          ))}

          {/* MULTI-CHANNEL COMPARISON TOGGLE */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setSelectedChannelHandle('compare');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedChannelHandle === 'compare'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>مقایسه هم‌زمان</span>
          </button>
        </div>

        {/* METRIC MODE & CHART TYPE SWITCHERS */}
        <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-auto">
          {/* Metric Selector (Only relevant when not in multi-channel compare mode) */}
          {selectedChannelHandle !== 'compare' && (
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setMetricMode('both')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  metricMode === 'both' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ترکیبی
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('views')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  metricMode === 'views' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                بازدیدها
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('shares')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  metricMode === 'shares' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                فورواردها
              </button>
            </div>
          )}

          {/* Chart Type Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="نمودار مساحتی گرادیانت‌دار"
            >
              مساحتی
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="نمودار میله‌ای مقایسه‌ای"
            >
              میله‌ای
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="نمودار خطی"
            >
              خطی
            </button>
          </div>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION CONTAINER */}
      <div className="w-full pt-2">
        {loading ? (
          <div className="h-80 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
            <span className="text-xs font-bold">در حال پردازش و استخراج آمار هفتگی Recharts...</span>
          </div>
        ) : selectedChannelHandle === 'compare' ? (
          // MULTI-CHANNEL COMPARISON CHART
          <div className="h-[380px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '15px' }}
                    formatter={(value) => <span className="text-xs text-slate-300 font-sans">{value}</span>}
                  />
                  {channels.map((ch) => {
                    const key = `views_${ch.channelHandle.replace(/[@_]/g, '')}`;
                    return (
                      <Bar
                        key={key}
                        dataKey={key}
                        name={ch.channelName}
                        fill={ch.color}
                        radius={[4, 4, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '15px' }}
                    formatter={(value) => <span className="text-xs text-slate-300 font-sans">{value}</span>}
                  />
                  {channels.map((ch) => {
                    const key = `views_${ch.channelHandle.replace(/[@_]/g, '')}`;
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={ch.channelName}
                        stroke={ch.color}
                        strokeWidth={2.5}
                        dot={{ fill: ch.color, r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    {channels.map((ch) => {
                      const key = `views_${ch.channelHandle.replace(/[@_]/g, '')}`;
                      return (
                        <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ch.color} stopOpacity={0.6} />
                          <stop offset="95%" stopColor={ch.color} stopOpacity={0.05} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '15px' }}
                    formatter={(value) => <span className="text-xs text-slate-300 font-sans">{value}</span>}
                  />
                  {channels.map((ch) => {
                    const key = `views_${ch.channelHandle.replace(/[@_]/g, '')}`;
                    return (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={ch.channelName}
                        stroke={ch.color}
                        strokeWidth={2}
                        fill={`url(#grad_${key})`}
                      />
                    );
                  })}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          // STANDARD VIEW / SINGLE CHANNEL OR AGGREGATE
          <div className="h-[380px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="views"
                    orientation="right"
                    stroke="#38bdf8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  {metricMode === 'both' && (
                    <YAxis
                      yAxisId="shares"
                      orientation="left"
                      stroke="#a855f7"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '15px' }}
                    formatter={(value) => <span className="text-xs text-slate-300 font-sans">{value}</span>}
                  />
                  {(metricMode === 'both' || metricMode === 'views') && (
                    <Bar
                      yAxisId="views"
                      dataKey={activeSingleChannel ? 'views' : 'totalViews'}
                      name="بازدیدها (Views)"
                      fill="#38bdf8"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {(metricMode === 'both' || metricMode === 'shares') && (
                    <Bar
                      yAxisId={metricMode === 'both' ? 'shares' : 'views'}
                      dataKey={activeSingleChannel ? 'shares' : 'totalShares'}
                      name="فوروارد / اشتراک (Shares)"
                      fill="#a855f7"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="views"
                    orientation="right"
                    stroke="#38bdf8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  {metricMode === 'both' && (
                    <YAxis
                      yAxisId="shares"
                      orientation="left"
                      stroke="#a855f7"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '15px' }}
                    formatter={(value) => <span className="text-xs text-slate-300 font-sans">{value}</span>}
                  />
                  {(metricMode === 'both' || metricMode === 'views') && (
                    <Line
                      yAxisId="views"
                      type="monotone"
                      dataKey={activeSingleChannel ? 'views' : 'totalViews'}
                      name="بازدیدها (Views)"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ fill: '#38bdf8', r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                  {(metricMode === 'both' || metricMode === 'shares') && (
                    <Line
                      yAxisId={metricMode === 'both' ? 'shares' : 'views'}
                      type="monotone"
                      dataKey={activeSingleChannel ? 'shares' : 'totalShares'}
                      name="فوروارد / اشتراک (Shares)"
                      stroke="#a855f7"
                      strokeWidth={3}
                      dot={{ fill: '#a855f7', r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="dayName"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="views"
                    orientation="right"
                    stroke="#38bdf8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  {metricMode === 'both' && (
                    <YAxis
                      yAxisId="shares"
                      orientation="left"
                      stroke="#a855f7"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '15px' }}
                    formatter={(value) => <span className="text-xs text-slate-300 font-sans">{value}</span>}
                  />
                  {(metricMode === 'both' || metricMode === 'views') && (
                    <Area
                      yAxisId="views"
                      type="monotone"
                      dataKey={activeSingleChannel ? 'views' : 'totalViews'}
                      name="بازدیدها (Views)"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  )}
                  {(metricMode === 'both' || metricMode === 'shares') && (
                    <Area
                      yAxisId={metricMode === 'both' ? 'shares' : 'views'}
                      type="monotone"
                      dataKey={activeSingleChannel ? 'shares' : 'totalShares'}
                      name="فوروارد / اشتراک (Shares)"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorShares)"
                    />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* DETAILED CHANNEL PERFORMANCE BREAKDOWN TABLE */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>تفکیک عملکرد و مقایسه کانال‌های فعال (۷ روز اخیر)</span>
          </span>
          <span className="text-[11px] text-slate-500">
            برای تمرکز روی هر کانال، روی آن کلیک کنید
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.map((ch) => {
            const isSelected = selectedChannelHandle === ch.channelHandle;
            return (
              <div
                key={ch.channelHandle}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedChannelHandle(isSelected ? 'all' : ch.channelHandle);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-slate-950/90 border-sky-500 shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: ch.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate" title={ch.channelName}>
                        {ch.channelName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">
                        {ch.channelHandle}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
                    {formatNumberFa(ch.subscribersCount)} عضو
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">۷ روز بازدید</span>
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {formatNumberFa(ch.totalViews7d)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">۷ روز فوروارد</span>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {formatNumberFa(ch.totalShares7d)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">نرخ بازنشر</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {ch.avgEngagementRate}٪
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
