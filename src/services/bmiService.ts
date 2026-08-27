export interface BMISummary {
  bmiValue: number;
  category: 'Underweight' | 'Healthy range' | 'Overweight' | 'Higher weight range (Obese)';
  colorClass: string;
  gaugePercentage: number; // 0 to 100 for gauge visualization
  healthNote: string;
  disclaimer: string;
}

/**
 * Calculates BMI and returns comprehensive screening data.
 * BMI = weight (kg) / (height (m) ^ 2)
 */
export function calculateBMI(weightKg: number, heightCm: number): BMISummary {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    return {
      bmiValue: 0,
      category: 'Healthy range',
      colorClass: 'text-emerald-600',
      gaugePercentage: 50,
      healthNote: 'Enter height and weight to calculate BMI.',
      disclaimer: 'BMI is a general screening metric and not a diagnostic tool.'
    };
  }

  const heightMeters = heightCm / 100;
  const rawBmi = weightKg / (heightMeters * heightMeters);
  const bmiValue = parseFloat(rawBmi.toFixed(1));

  let category: BMISummary['category'] = 'Healthy range';
  let colorClass = 'var(--color-healthy)';
  let healthNote = 'Your current weight is within the general standard healthy range for your height.';
  
  // Normalize percentage for a 15 to 35 scale (20 range)
  const minBmi = 15;
  const maxBmi = 35;
  const clamped = Math.max(minBmi, Math.min(maxBmi, bmiValue));
  const gaugePercentage = Math.round(((clamped - minBmi) / (maxBmi - minBmi)) * 100);

  if (bmiValue < 18.5) {
    category = 'Underweight';
    colorClass = 'var(--color-warning)';
    healthNote = 'Consider discussing with a nutritionist to ensure you are receiving adequate calorie and nutrient density.';
  } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
    category = 'Healthy range';
    colorClass = 'var(--color-healthy)';
    healthNote = 'Your current metric is in the general healthy proportion range.';
  } else if (bmiValue >= 25.0 && bmiValue <= 29.9) {
    category = 'Overweight';
    colorClass = 'var(--color-notice)';
    healthNote = 'Gentle daily physical activity and fiber-rich meals help support natural metabolic wellness.';
  } else {
    category = 'Higher weight range (Obese)';
    colorClass = 'var(--color-alert)';
    healthNote = 'Focus on gentle, consistent low-impact daily habits and personalized nutritional care.';
  }

  return {
    bmiValue,
    category,
    colorClass,
    gaugePercentage,
    healthNote,
    disclaimer: 'Important: BMI is only a general population screening metric. It does not measure body composition, muscle mass, or overall individual physical health.'
  };
}
