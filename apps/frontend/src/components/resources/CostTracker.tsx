import {useEffect, useState} from 'react';
import {useProject} from '@/contexts/ProjectContext';
import {projectApi} from '@/lib/api';

interface AllocationMix {
    category: string;
    cost: number;
    percentage: number;
}

interface FinancialData {
    projectId: string;
    projectName: string;
    budget: number | null;
    totalSpend: number | null;
    remainingBudget: number | null;
    spendPercentage: number | null;
    remainingValue: number | null;
    materialCount: number | null;
    allocationMix: AllocationMix[] | null;
}

function safeNumber(n: unknown, fallback = 0): number {
    const v = typeof n === 'number' ? n : Number(n);
    return Number.isFinite(v) ? v : fallback;
}

function formatCurrency(n: unknown): string {
    return safeNumber(n).toLocaleString();
}

export default function CostTracker() {
    const {activeProjectId} = useProject();
    const [data, setData] = useState<FinancialData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!activeProjectId) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await projectApi.getFinancialSummary(activeProjectId);
                setData(res.data);
            } catch (err) {
                console.error('Failed to load financial data:', err);
                setError('Failed to load financial data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [activeProjectId]);

    if (!activeProjectId) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <p className="text-sm">Select a project to view financial data</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-100 h-48 rounded-[32px]"/>
                    <div className="bg-slate-100 h-48 rounded-[32px]"/>
                </div>
                <div className="bg-slate-100 h-64 rounded-[32px]"/>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center h-64 text-rose-500">
                <p className="text-sm">{error || 'No data available'}</p>
            </div>
        );
    }

    const budget = safeNumber(data.budget);
    const totalSpend = safeNumber(data.totalSpend);
    const spendPercentage = safeNumber(data.spendPercentage);
    const allocationMix = Array.isArray(data.allocationMix) ? data.allocationMix : [];
    const percentage = spendPercentage;
    const isOnTrack = percentage <= 100;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div
                    className="lg:col-span-2 bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
                    <div
                        className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-50"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Fiscal
                                Overview</p>
                            <h3 className="text-4xl font-black text-primary tracking-tighter">
                                ${formatCurrency(totalSpend)}
                                <span
                                    className="text-slate-300 text-lg font-bold ml-2">/ ${formatCurrency(budget)}</span>
                            </h3>
                        </div>
                        <div
                            className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ring-4 ring-emerald-50/50 ${isOnTrack ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            <span
                                className="material-symbols-outlined text-[18px] font-bold">{isOnTrack ? 'verified' : 'warning'}</span>
                            <span
                                className="text-xs font-black uppercase tracking-widest">{isOnTrack ? 'On Track' : 'Over Budget'}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div
                            className="relative h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                                style={{width: `${percentage}%`}}
                            >
                                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-pulse"></div>
                            </div>
                        </div>
                        <div
                            className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Project Commencement</span>
                            <span
                                className="text-primary bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{percentage.toFixed(1)}% Budget Utilized</span>
                            <span className="text-slate-400">Buffer Remaining</span>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Allocation
                            Mix</p>
                        <div className="space-y-5">
                            {allocationMix.length > 0 ? (
                                allocationMix.map((item, idx) => {
                                    const colors = ['bg-primary', 'bg-sky-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
                                    return (
                                        <div key={item.category} className="group cursor-help">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${colors[idx % colors.length]} group-hover:scale-125 transition-transform`}/>
                                                    <span
                                                        className="text-primary text-[10px] font-black uppercase tracking-widest">{item.category}</span>
                                                </div>
                                                <span
                                                    className="text-primary font-black text-xs tabular-nums">{safeNumber(item.percentage).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${colors[idx % colors.length]} opacity-20 group-hover:opacity-100 transition-all duration-500`}
                                                    style={{width: `${Math.min(100, safeNumber(item.percentage))}%`}}/>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-slate-400 text-xs">No allocation data available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

