import type { UserProfile } from '../types/user';

export interface AIWellnessInsight {
  id: string;
  category: 'hydration' | 'movement' | 'nutrition' | 'recovery';
  title: string;
  recommendation: string;
  rationale: string;
  suggestedActionLabel?: string;
  actionType?: 'water' | 'exercise' | 'meal';
}

/**
 * AI Recommendation Service Bridge
 * In production, this connects to the NutriTrack AI backend (REST / WebSocket / Gemini API).
 * In standalone demo mode, it delivers high-fidelity simulated recommendations
 * tailored to the user's specific mobility, diet, and daily routine.
 */
export const aiRecommendationService = {
  async getPersonalizedInsights(profile: UserProfile): Promise<AIWellnessInsight[]> {
    // Simulated async API call to represent backend latency
    await new Promise((res) => setTimeout(res, 150));

    const insights: AIWellnessInsight[] = [];

    // Mobility-specific insight
    if (profile.mobilityLevel === 'Wheelchair user') {
      insights.push({
        id: 'ai_ins_wheelchair_posture',
        category: 'movement',
        title: 'Seated Postural Balance',
        recommendation: 'Incorporate 5 minutes of seated shoulder blade retractions every 3 hours.',
        rationale: 'Prolonged sitting can rotate shoulders forward. Gentle scapular engagement maintains spinal health.',
        suggestedActionLabel: 'Start Shoulder Rolls',
        actionType: 'exercise'
      });
    } else if (profile.mobilityLevel === 'Assisted walking') {
      insights.push({
        id: 'ai_ins_assisted_walking',
        category: 'movement',
        title: 'Joint Sensation & Balance Pace',
        recommendation: 'Break walking sessions into 5-minute comfortable intervals with rest pauses.',
        rationale: 'Intermittent walking prevents sudden muscular fatigue while sustaining cardiovascular benefit.',
        suggestedActionLabel: 'View Mobility Exercises',
        actionType: 'exercise'
      });
    } else {
      insights.push({
        id: 'ai_ins_gentle_movement',
        category: 'movement',
        title: 'Low-Impact Circulation Flow',
        recommendation: 'Perform 5 minutes of mindful ankle pumps and wrist rotations mid-afternoon.',
        rationale: 'Active peripheral pumping supports steady venous circulation without joint strain.',
        suggestedActionLabel: 'Start Circulation Flow',
        actionType: 'exercise'
      });
    }

    // Hydration insight
    insights.push({
      id: 'ai_ins_hydration_rhythm',
      category: 'hydration',
      title: 'Optimal Sip Distribution',
      recommendation: `Target ${Math.round(profile.dailyWaterTargetMl / 8)} ml every 90 minutes instead of large quantities at once.`,
      rationale: 'Steady hydration keeps bladder pressure comfortable while ensuring continuous cellular hydration.',
      suggestedActionLabel: 'Log 250 ml Water',
      actionType: 'water'
    });

    // Nutrition insight
    insights.push({
      id: 'ai_ins_nutrition_focus',
      category: 'nutrition',
      title: `${profile.dietaryPreference} Protein & Fiber Harmony`,
      recommendation: 'Pair fresh fruits with roasted nuts or seeds to smooth glycemic response.',
      rationale: 'Combining healthy fats with natural fruit sugars provides long-lasting energy without fatigue dips.',
      suggestedActionLabel: 'View Meal Suggestions',
      actionType: 'meal'
    });

    return insights;
  }
};
