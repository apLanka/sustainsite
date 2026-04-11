import {Link, useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { canLogSustainabilityMetrics } from '@/lib/rbac';
import DashboardLayout from '@/components/common/DashboardLayout';
import ProjectHeader from '@/components/project/ProjectHeader';
import SustainabilityScore from '@/components/sustainability/SustainabilityScore';
import {HistoricalTrendLine, ImpactRadar, ResourceBarChart} from '@/components/sustainability/SustainabilityCharts';
import {sustainabilityApi} from '@/lib/api';
import type {
  IndustryComparisonResponse,
  SustainabilityMetric,
  SustainabilityScore as ScoreType,
  SustainabilityTrendsResponse,
} from '@/types/sustainability';

export default function SustainabilityDashboardPage() {
  const {id: projectId} = useParams<{ id: string }>();
  const { user } = useAuth();
  const canRecord = canLogSustainabilityMetrics(user?.role);

  const [scoreData, setScoreData] = useState<ScoreType | null>(null);
  const [latestMetric, setLatestMetric] = useState<SustainabilityMetric | null>(null);
  const [trendsData, setTrendsData] = useState<SustainabilityTrendsResponse | null>(null);
  const [industryData, setIndustryData] = useState<IndustryComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [scoreRes, latestRes, trendsRes] = await Promise.allSettled([
          sustainabilityApi.getProjectScore(projectId),
          sustainabilityApi.getLatestMetric(projectId),
          sustainabilityApi.getProjectTrendsDetailed(projectId, '6months', 'monthly'),
        ]);

        if (scoreRes.status === 'fulfilled') {
          setScoreData(scoreRes.value.data);
        } else {
          console.error('Score fetch failed:', scoreRes.reason);
        }

        if (latestRes.status === 'fulfilled') {
          setLatestMetric(latestRes.value.data);
        } else {
          // 404 means no metrics recorded yet — not a real error
          const status = (latestRes.reason as { status?: number })?.status;
          if (status !== 404) {
            console.error('Latest metric fetch failed:', latestRes.reason);
          }
        }

        if (trendsRes.status === 'fulfilled') {
          setTrendsData(trendsRes.value.data);
        } else {
          console.error('Trends fetch failed:', trendsRes.reason);
        }

        const latestIs404 =
          latestRes.status === 'rejected' &&
          (latestRes.reason as { status?: number })?.status === 404;

        const allFailed =
          scoreRes.status === 'rejected' &&
          (latestRes.status === 'rejected' && !latestIs404) &&
          trendsRes.status === 'rejected';

        if (allFailed) {
          setError('Failed to load sustainability data');
          toast.error('Failed to load sustainability data');
        }

        // Industry comparison — non-critical, don't fail the whole page
        try {
          const industryRes = await sustainabilityApi.compareWithIndustry(projectId);
          setIndustryData(industryRes.data);
        } catch {
          // No metrics yet — industry comparison unavailable
        }
      } catch (err) {
        console.error('Failed to load sustainability data:', err);
        setError('Failed to load sustainability data');
        toast.error('Failed to load sustainability data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleExport = () => {
    if (!trendsData || !scoreData) {
      toast.error('No data to export yet');
      return;
    }
    const rows = [
      ['Date', 'Score', 'Trees Equivalent', 'Waste Diversion Rate'],
      ...(trendsData.trends ?? []).map(t => [
        new Date(t.recordedDate).toLocaleDateString(),
        t.sustainabilityScore,
        t.treesEquivalent,
        t.wasteManagement.diversionRate,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainability-report-${projectId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  // Derive radar chart data from latest metric
  // Carbon: lower emissions = higher score. Cap at 10 tCO2e as a practical max.
  const radarData = latestMetric
      ? [
        {
          subject: 'Carbon',
          A: Math.max(0, Math.min(100, Math.round(100 - (latestMetric.carbonEmissions.total / 10) * 100))),
          fullMark: 100
        },
        {
          subject: 'Energy',
          A: latestMetric.energyConsumption.total > 0
              ? Math.round((latestMetric.energyConsumption.renewableEnergy / latestMetric.energyConsumption.total) * 100)
              : 0,
          fullMark: 100
        },
        {subject: 'Waste', A: latestMetric.wasteManagement.diversionRate, fullMark: 100},
        {
          subject: 'Water',
          A: latestMetric.waterUsage.total > 0
              ? Math.round((latestMetric.waterUsage.recycled / latestMetric.waterUsage.total) * 100)
              : 0,
          fullMark: 100
        },
        {subject: 'Score', A: latestMetric.sustainabilityScore, fullMark: 100},
      ]
      : undefined;

  // Derive line chart data from trends — show even a single point
  const trends = trendsData?.trends ?? [];
  const lineData = trends.length >= 1
    ? trends
        .filter(t => t && typeof t.sustainabilityScore === 'number')
        .map((t, i) => ({
          name: t.recordedDate
              ? new Date(t.recordedDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
              : `Entry ${i + 1}`,
          score: t.sustainabilityScore as number,
        }))
    : null;

  // Derive bar chart data from latest metric
  const barData = latestMetric
      ? [
        {name: 'Materials', value: latestMetric.carbonEmissions.materials, color: '#0e6c4a'},
        {name: 'Equipment', value: latestMetric.carbonEmissions.equipment, color: '#012d1d'},
        {name: 'Transport', value: latestMetric.carbonEmissions.transportation, color: '#10b981'},
        {name: 'Waste Div.', value: Math.round(latestMetric.wasteManagement.diversionRate), color: '#059669'},
      ]
      : undefined;

  const treesEquivalent = latestMetric?.treesEquivalent ?? 0;
  const sustainabilityScoreValue = scoreData?.currentScore ?? scoreData?.sustainabilityScore ?? 0;

  // Performance trend from API
  const scoreImprovement = trendsData?.summary?.scoreImprovement;
  const performanceLabel = scoreImprovement != null
    ? `${scoreImprovement >= 0 ? '+' : ''}${scoreImprovement.toFixed(1)}% SCORE CHANGE`
    : 'NO TREND DATA YET';

  // Industry comparison from API
  const industryDiff = industryData?.difference;
  const industryLabel = industryDiff != null
    ? `${Math.abs(industryDiff).toFixed(1)}% ${industryDiff >= 0 ? 'ABOVE' : 'BELOW'} INDUSTRY AVG`
    : 'INDUSTRY DATA UNAVAILABLE';

  // Baseline bar: segments filled based on emissions intensity (lower = greener).
  // Cap reference at 10 tCO2e; more filled = lower emissions (better).
  const emissionsTotal = latestMetric?.carbonEmissions.total ?? 0;
  const filledSegments = emissionsTotal > 0
    ? Math.max(1, 6 - Math.round((emissionsTotal / 10) * 6))
    : sustainabilityScoreValue > 0
      ? Math.round((sustainabilityScoreValue / 100) * 6)
      : 0;

  return (
    <DashboardLayout>
      <ProjectHeader />

      <div className="px-10">
        {/* Module Actions Row */}
        <div className="py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tighter leading-none font-headline">Environmental Performance</h3>
            <p className="text-slate-500 text-sm font-medium mt-2">Analytical breakdown of site-specific ecological vitals.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="px-6 py-2.5 bg-surface-container-high text-primary font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all cursor-pointer font-headline"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Export Report
            </button>
            {canRecord && (
            <Link
                to={`/projects/${projectId}/sustainability/record`}
              className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all cursor-pointer font-headline"
            >
              <span className="material-symbols-outlined text-lg">add_chart</span>
              Record New Metrics
            </Link>
            )}
          </div>
        </div>

        {/* Main Grid Content: Dual-Tier Architecture */}
        <div className="space-y-10 pb-20">
          {/* Tier 1: Performance Highlights (2 Column Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 min-h-[440px]">
              {isLoading ? (
                  <div className="bg-emerald-950 rounded-3xl animate-pulse h-full min-h-[440px]"/>
              ) : error ? (
                  <div className="bg-emerald-950 rounded-3xl p-8 flex items-center justify-center h-full">
                    <p className="text-emerald-400 text-sm font-medium">{error}</p>
                  </div>
              ) : (
                  <SustainabilityScore
                    score={sustainabilityScoreValue}
                    trend={scoreData?.trend}
                    scoreCategory={scoreData?.scoreCategory}
                  />
              )}
            </div>
            <div className="lg:col-span-2 bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm flex flex-col justify-center">
              <h4 className="text-sm font-bold text-primary font-headline mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">show_chart</span>
                Global Score Trajectory (Last 6 Periods)
              </h4>
              {isLoading ? (
                <div className="h-80 animate-pulse bg-slate-100 rounded-2xl" />
              ) : lineData ? (
                <div className="h-80">
                  <HistoricalTrendLine data={lineData}/>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <span className="material-symbols-outlined text-4xl">show_chart</span>
                  <p className="text-sm font-medium">No metrics recorded yet</p>
                  {canRecord && (
                  <Link
                    to={`/projects/${projectId}/sustainability/record`}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Record your first metric →
                  </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tier 2: Categorical Deep-Dive (3 Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Radar Chart Card */}
            <div className="bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
              <h4 className="text-sm font-bold text-primary font-headline mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">radar</span>
                Ecological Impact Radar
              </h4>
              <div className="flex-1">
                <ImpactRadar data={radarData}/>
              </div>
              <p className="text-[11px] text-slate-400 mt-8 pt-6 border-t border-slate-50 italic">
                "Unified multidimensional assessment of project environmental vitals."
              </p>
            </div>

            {/* Bar Chart Card */}
            <div className="bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm flex flex-col min-h-[480px]">
               <h4 className="text-sm font-bold text-primary font-headline mb-8 flex items-center gap-2">
                 <span className="material-symbols-outlined text-emerald-600">align_horizontal_left</span>
                 Principal Resource Footprint
               </h4>
               <div className="flex-1">
                 <ResourceBarChart data={barData}/>
               </div>
               <p className="text-[11px] text-slate-400 mt-8 pt-6 border-t border-slate-50 italic">
                 "Carbon intensity tracking across core structural materials."
               </p>
            </div>

            {/* Stats Interaction Stack */}
            <div className="flex flex-col gap-10 min-h-[480px]">
                <div className="bg-gradient-to-br from-emerald-950 to-primary p-10 rounded-3xl shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden group flex-1 flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700 -mr-16 -mt-16"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-emerald-100/80">Net Carbon Sequestration</p>
                  <h3 className="text-5xl font-extrabold tracking-tighter mb-2">{treesEquivalent.toLocaleString()}</h3>
                  <p className="text-sm font-medium text-emerald-200/80">Project Trees Equivalent Offset</p>
                  <div className="mt-10 flex items-center gap-2 text-emerald-200">
                    <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">{performanceLabel}</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-10 rounded-3xl border border-slate-100/50 shadow-sm flex-1 flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Baseline Emissions Intensity</p>
                  <div className="flex items-end gap-3">
                    <h4 className="text-4xl font-extrabold text-primary tracking-tighter">
                      {latestMetric ? (latestMetric.carbonEmissions.total / 1000).toFixed(2) : '0.00'}
                    </h4>
                    <span className="text-sm font-bold text-slate-400 mb-1 leading-none uppercase tracking-widest font-headline">tCO2e / sq.m</span>
                  </div>
                  <div className="mt-8 flex gap-1.5 h-2">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className={`flex-1 rounded-full ${i <= filledSegments ? 'bg-secondary shadow-[0_0_8px_rgba(14,108,74,0.3)]' : 'bg-slate-100'}`}></div>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.1em]">{industryLabel}</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
