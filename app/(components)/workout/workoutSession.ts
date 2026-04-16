export interface PerformedSet {
  reps: number;
  weight: number;
}

export interface WorkoutSessionItem {
  id: string;
  order: number;
  phase: "warmup" | "workout" | "challanges";
  difficulty: string;
  exerciseName: string;
  reps: string;
  sets: number;
  videoUrl: string;
  restBetweenSeconds: number;
  recommendedWeight: number;
  performedSets: PerformedSet[];
  isTimeBased: boolean;
  time?: number;
  status: "todo" | "in_progress" | "done";
  completedAt?: string;
  exerciseType?: "benchmark" | "accessory";
  xp?: number;
}
