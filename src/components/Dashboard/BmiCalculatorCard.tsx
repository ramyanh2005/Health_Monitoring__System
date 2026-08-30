import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  Calculator,
  Info,
  Flame,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const BmiCalculatorCard: React.FC = () => {
  const { profile, setBmiMetrics } = useHealth();

  // Inputs
  const [heightCm, setHeightCm] = useState<string>(String(profile.heightCm || 170));
  const [weightKg, setWeightKg] = useState<string>(String(profile.weightKg || 70));

  // Sync inputs when profile changes
  useEffect(() => {
    if (profile.heightCm > 0) setHeightCm(String(profile.heightCm));
    if (profile.weightKg > 0) setWeightKg(String(profile.weightKg));
  }, [profile.heightCm, profile.weightKg]);

  // Calculated Results
  const [calculatedBmi, setCalculatedBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<'Underweight' | 'Healthy' | 'Overweight' | 'Obese'>('Healthy');
  const [categoryColor, setCategoryColor] = useState<string>('#10b981');
  const [healthMessage, setHealthMessage] = useState<string>('');
  const [idealRange, setIdealRange] = useState<{ min: number; max: number }>({ min: 53.5, max: 72.0 });
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  // Compute BMI function with exact formula: BMI = weight in kg / (height in metres * height in metres)
  const computeBMI = (hCm: number, wKg: number) => {
    if (!hCm || hCm <= 0 || !wKg || wKg <= 0) {
      return null;
    }
    const heightMetres = hCm / 100;
    const rawBmi = wKg / (heightMetres * heightMetres);
    const bmiVal = parseFloat(rawBmi.toFixed(1));

    const minW = parseFloat((18.5 * heightMetres * heightMetres).toFixed(1));
    const maxW = parseFloat((24.9 * heightMetres * heightMetres).toFixed(1));

    let cat: 'Underweight' | 'Healthy' | 'Overweight' | 'Obese' = 'Healthy';
    let color = '#10b981';
    let msg = '';

    if (bmiVal < 18.5) {
      cat = 'Underweight';
      color = '#0284c7'; // Sky Blue
      msg = 'Your BMI is below the healthy range. Consider a nutrient-dense, high-protein nutrition plan with progressive strength training to build lean muscle mass.';
    } else if (bmiVal <= 24.9) {
      cat = 'Healthy';
      color = '#10b981'; // Emerald Green
      msg = 'Great job! Your BMI is in the optimal healthy weight zone (18.5 – 24.9). Maintain your balanced nutrition, regular exercise, and daily hydration.';
    } else if (bmiVal <= 29.9) {
      cat = 'Overweight';
      color = '#f59e0b'; // Amber
      msg = 'Your BMI is slightly above normal range. If you train heavily with weights, note that muscle mass increases BMI. Incorporate daily 10,000 steps and Zone 2 cardio.';
    } else {
      cat = 'Obese';
      color = '#e11d48'; // Rose/Red
      msg = 'Higher metabolic risk category. Prioritize daily hydration (2.5L+), 30 minutes of structured exercise, and nutrient-dense whole foods to steadily reduce body fat.';
    }

    return {
      bmi: bmiVal,
      cat,
      color,
      msg,
      ideal: { min: minW, max: maxW }
    };
  };

  // Initial calculation on load
  useEffect(() => {
    const h = Number(heightCm);
    const w = Number(weightKg);
    const res = computeBMI(h, w);
    if (res) {
      setCalculatedBmi(res.bmi);
      setCategory(res.cat);
      setCategoryColor(res.color);
      setHealthMessage(res.msg);
      setIdealRange(res.ideal);
      setIsCalculated(true);
    }
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(heightCm);
    const w = Number(weightKg);

    const res = computeBMI(h, w);
    if (res) {
      setCalculatedBmi(res.bmi);
      setCategory(res.cat);
      setCategoryColor(res.color);
      setHealthMessage(res.msg);
      setIdealRange(res.ideal);
      setIsCalculated(true);

      // Also sync to global user profile and update metabolic calculations
      setBmiMetrics(h, w);
      setIsSynced(true);
      setTimeout(() => setIsSynced(false), 3000);
    }
  };

  const handleResetExample = (exampleH: number, exampleW: number) => {
    setHeightCm(String(exampleH));
    setWeightKg(String(exampleW));
    const res = computeBMI(exampleH, exampleW);
    if (res) {
      setCalculatedBmi(res.bmi);
      setCategory(res.cat);
      setCategoryColor(res.color);
      setHealthMessage(res.msg);
      setIdealRange(res.ideal);
      setIsCalculated(true);
      setBmiMetrics(exampleH, exampleW);
    }
  };

  // Scale marker calculation for visual meter (range 15 to 35)
  const scaleMin = 15;
  const scaleMax = 35;
  const clampedBmi = Math.min(scaleMax, Math.max(scaleMin, calculatedBmi || 22));
  const pointerPercent = Math.round(((clampedBmi - scaleMin) / (scaleMax - scaleMin)) * 100);

  return (
    <div id="bmi-calculator-section" className="health-card p-6 sm:p-7 border-2 border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between space-y-6">
      
      {/* 1. Header with Badge & Formula Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                BMI Calculator
              </h3>
              <span className="badge badge-emerald text-[11px] font-bold">
                Live Interactive
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formula: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">BMI = Weight (kg) / [Height (m)]²</span>
            </p>
          </div>
        </div>

        {/* Example Presets */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">Quick Test:</span>
          <button
            type="button"
            onClick={() => handleResetExample(170, 70)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition"
          >
            170 cm / 70 kg
          </button>
          <button
            type="button"
            onClick={() => handleResetExample(180, 75)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 transition"
          >
            180 cm / 75 kg
          </button>
        </div>
      </div>

      {/* 2. Interactive Input Form */}
      <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Height Input (cm) */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Height in cm:</span>
            <span className="text-[11px] text-slate-400 font-mono">({(Number(heightCm) / 100).toFixed(2)} metres)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="80"
              max="240"
              step="0.5"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 170"
              className="glass-input w-full text-base font-extrabold pr-12 text-slate-900 dark:text-white"
              required
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              cm
            </span>
          </div>
        </div>

        {/* Weight Input (kg) */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Weight in kg:</span>
            <span className="text-[11px] text-slate-400 font-mono">(kilograms)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="20"
              max="300"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 70"
              className="glass-input w-full text-base font-extrabold pr-12 text-slate-900 dark:text-white"
              required
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
              kg
            </span>
          </div>
        </div>

        {/* Calculate BMI Button */}
        <div className="md:col-span-4">
          <button
            type="submit"
            id="calculate-bmi-btn"
            className="btn-primary w-full py-3 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Scale className="w-5 h-5" />
            <span>Calculate BMI</span>
          </button>
        </div>

      </form>

      {/* 3. Output Display of Calculated BMI, Category & Health Message */}
      {isCalculated && calculatedBmi !== null && (
        <div className="space-y-5 animate-fade-in pt-2">
          
          {/* Main Results Card */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
            
            {/* Left: BMI Value & Category Badge */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center min-w-[110px] shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Your BMI</span>
                <span className="text-4xl font-black text-slate-900 dark:text-white font-heading leading-none block my-1">
                  {calculatedBmi}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">kg/m²</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-semibold block mb-1">Body Composition Category:</span>
                <span 
                  id="bmi-category-badge"
                  className="badge text-sm font-black px-3.5 py-1 uppercase tracking-wider shadow-xs"
                  style={{ 
                    backgroundColor: `${categoryColor}20`, 
                    color: categoryColor, 
                    borderColor: `${categoryColor}60` 
                  }}
                >
                  {category}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Calculated for <strong className="text-slate-800 dark:text-slate-200">{heightCm} cm</strong> & <strong className="text-slate-800 dark:text-slate-200">{weightKg} kg</strong>
                </p>
              </div>
            </div>

            {/* Right: Ideal Healthy Weight Range for this height */}
            <div className="text-left md:text-right p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 block font-bold">Ideal Healthy Weight for {heightCm} cm:</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {idealRange.min} kg – {idealRange.max} kg
              </span>
              <span className="text-[10px] text-slate-400 block">Based on WHO 18.5 – 24.9 standard</span>
            </div>

          </div>

          {/* Color-Coded BMI Scale with Position Indicator Pin */}
          <div className="space-y-1.5 px-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              <span>BMI Visual Scale</span>
              <span className="text-xs font-mono font-extrabold" style={{ color: categoryColor }}>
                Marker: {calculatedBmi} ({category})
              </span>
            </div>

            {/* Scale Bar */}
            <div className="relative w-full h-3.5 rounded-full overflow-hidden flex shadow-inner border border-slate-200 dark:border-slate-700">
              <div className="w-[17.5%] bg-sky-500" title="Underweight (< 18.5)" />
              <div className="w-[32%] bg-emerald-500" title="Healthy (18.5 - 24.9)" />
              <div className="w-[25%] bg-amber-500" title="Overweight (25.0 - 29.9)" />
              <div className="w-[25.5%] bg-rose-500" title="Obese (≥ 30.0)" />
            </div>

            {/* Pin Pointer */}
            <div className="relative w-full h-5">
              <div 
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{ left: `${pointerPercent}%` }}
              >
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[7px] border-transparent border-b-slate-900 dark:border-b-white" />
                <span className="text-[10px] font-black text-slate-900 dark:text-white px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 shadow-xs mt-0.5">
                  ▲ {calculatedBmi}
                </span>
              </div>
            </div>

            {/* 4 Category Range Labels */}
            <div className="grid grid-cols-4 text-center text-[10px] sm:text-xs font-bold pt-1">
              <div className="text-sky-600 dark:text-sky-400">
                <span className="block">Underweight</span>
                <span className="text-[10px] text-slate-400 font-mono">&lt; 18.5</span>
              </div>
              <div className="text-emerald-600 dark:text-emerald-400">
                <span className="block">Healthy</span>
                <span className="text-[10px] text-slate-400 font-mono">18.5 – 24.9</span>
              </div>
              <div className="text-amber-600 dark:text-amber-400">
                <span className="block">Overweight</span>
                <span className="text-[10px] text-slate-400 font-mono">25.0 – 29.9</span>
              </div>
              <div className="text-rose-600 dark:text-rose-400">
                <span className="block">Obese</span>
                <span className="text-[10px] text-slate-400 font-mono">≥ 30.0</span>
              </div>
            </div>
          </div>

          {/* Health Message Result */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-slate-700 dark:text-slate-200 leading-relaxed flex items-start gap-3 shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-800 dark:text-emerald-300 block font-bold text-sm mb-0.5">
                Health Recommendation & Analysis:
              </strong>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {healthMessage}
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
