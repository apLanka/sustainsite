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
    recordedBy?: { firstName: string; lastName: string };
    notes?: string;
}

export interface SustainabilityScore {
    projectId: string;
    projectName: string;
    sustainabilityScore: number;
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