import type { Milestone } from '@/types/project';
import { MilestoneStatus } from '@/types/project';
export function calcMilestoneProgress(milestones: Milestone[]): number {
    if (milestones.length === 0)
        return 0;
    const total = milestones.reduce((sum, m) => {
        const pct = m.status === MilestoneStatus.COMPLETED ? 100 : m.completionPercentage;
        return sum + pct;
    }, 0);
    return Math.round(total / milestones.length);
}
