export interface CarbonEmissions {
  transportation: number;
  equipment: number;
  materials: number;
  total: number;
}
export interface EnergyConsumption {
  electricity: number;
  diesel: number;
  renewableEnergy: number;
  total: number;
}
export interface WasteManagement {
  recyclable: number;
  nonRecyclable: number;
  hazardous: number;
  total: number;
  diversionRate: number;
}
export interface WaterUsage {
  municipal: number;
  recycled: number;
  total: number;
}
export interface SustainabilityMetric {
  _id: string;
  projectId: string;
  carbonEmissions: CarbonEmissions;
  energyConsumption: EnergyConsumption;
  wasteManagement: WasteManagement;
  waterUsage: WaterUsage;
  sustainabilityScore: number;
  treesEquivalent: number;
  scoreCategory: 'Red' | 'Yellow' | 'Green';
  recordedDate: string;
  recordedBy?: {
    firstName: string;
    lastName: string;
  };
  notes?: string;
}
export interface SustainabilityScore {
  projectId: string;
  projectName: string;
  currentScore: number;
  sustainabilityScore?: number;
  scoreCategory: 'Red' | 'Yellow' | 'Green';
  lastUpdated: string;
  trend: 'improving' | 'declining' | 'stable';
  benchmarkComparison: {
    industryAverage: number;
    difference: number;
  };
  recommendations: string[];
  scoreBreakdown: Record<string, number> | null;
}
export interface SustainabilityTrend {
  _id: string;
  sustainabilityScore: number;
  treesEquivalent: number;
  wasteManagement: {
    diversionRate: number;
  };
  recordedDate: string;
}
export interface SustainabilityTrendsResponse {
  projectId: string;
  period: string;
  interval: string;
  trends: SustainabilityTrend[];
  summary: {
    averageScore: number;
    scoreImprovement: number;
    totalCarbonRecorded: number;
    totalWasteRecorded: number;
  };
}
export interface IndustryComparisonResponse {
  projectId: string;
  projectName: string;
  projectScore: number;
  industryAverage: number;
  difference: number;
  percentileBand: string;
  areasAboveAverage: string[];
  areasBelowAverage: string[];
  benchmarks: Record<string, number>;
}
export interface ImpactCalculationResponse {
  totalCarbon: number;
  treesEquivalent: number;
  renewablePercentage: number;
}
