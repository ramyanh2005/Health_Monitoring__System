export type ExerciseCategory = 'seated' | 'mobility' | 'breathing';

export type ExerciseDifficulty = 'Gentle' | 'Easy' | 'Moderate';

export interface ExerciseStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationSec: number;
  tip?: string;
}

export interface Exercise {
  id: string;
  title: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  durationMinutes: number;
  mobilityRequirement: string;
  equipment: string;
  image: string; // URL / asset path to exercise photo
  calorieEstimate?: string;
  shortDescription: string;
  howToPerformGuide: {
    postureSetup: string;
    breathingRhythm: string;
    targetMuscles: string[];
    commonMistakes: string;
  };
  safetyNotes: string[];
  steps: ExerciseStep[];
  benefits: string[];
  icon: string;
  suitableMobility: string[];
}
