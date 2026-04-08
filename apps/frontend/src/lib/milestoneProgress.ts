import type { Milestone } from '@/types/project';
import { MilestoneStatus } from '@/types/project';

/**
 * Calculate overall project progress from its milestones.
 * Returns a 0–100 integer.
 *
 * Strategy: average each milestone's completionPercentage.
 * A COMPLETED milestone is always 100 (enforced by the backend pre-save hook).
 * Falls back to the stored project.completionPercentage when no milestones exist.
 */
export function calcMilestoneProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const total = milestones.reduce((sum, m) => {
    const pct = m.status === MilestoneStatus.COMPLETED ? 100 : m.completionPercentage;
    return sum + pct;
  }, 0);
  return Math.round(total / milestones.length);
}
