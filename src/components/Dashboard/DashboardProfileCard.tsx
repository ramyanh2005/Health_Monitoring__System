import React from 'react';
import { 
  User, 
  Scale, 
  Target, 
  Activity, 
  Calendar, 
  Ruler, 
  Weight, 
  Edit3, 
  Sparkles,
  Camera
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { calculateBMI } from '../../utils/calculations';

interface DashboardProfileCardProps {
  onEditProfile: () => void;
}

export const DashboardProfileCard: React.FC<DashboardProfileCardProps> = ({ onEditProfile }) => {
  const { profile } = useHealth();
  const { bmi, category: bmiCategory, color: bmiColor } = calculateBMI(profile.weightKg, profile.heightCm);

  const formatFitnessGoal = (goal?: string) => {
    switch (goal) {
      case 'muscle_gain': return 'Muscle Building';
      case 'weight_loss': return 'Fat Loss & Weight Reduction';
      case 'maintain': return 'Weight Maintenance';
      case 'stamina': return 'Cardio Stamina & Endurance';
      case 'flexibility': return 'Flexibility & Posture';
      case 'general_health': return 'Overall Health & Longevity';
      default: return goal || 'Muscle Building';
    }
  };

  const formatActivityLevel = (level?: string) => {
    switch (level) {
      case 'sedentary': return 'Sedentary';
      case 'lightly_active': return 'Lightly Active';
      case 'moderately_active': return 'Moderately Active';
      case 'very_active': return 'Very Active';
      default: return level || 'Moderately Active';
    }
  };

  const getInitials = () => {
    if (!profile.name || !profile.name.trim()) return 'MH';
    const parts = profile.name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="health-card p-6 sm:p-7 border-2 border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 shadow-md">
      
      {/* 1. Header with Badge & Edit Action */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            My Profile
          </h3>
          <span className="badge badge-emerald text-[11px] font-extrabold ml-1">
            Live Synchronized
          </span>
        </div>

        <button
          onClick={onEditProfile}
          className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* 2. Main Profile Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5">
        
        {/* Left: User Photo / Neutral Avatar Display */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center text-center">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg flex items-center justify-center text-slate-400">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name || 'User Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                    {getInitials()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    Neutral Avatar
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onEditProfile}
              className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md transition group-hover:scale-110"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2.5">
            {profile.name || 'User Profile'}
          </span>
          <span className="text-[11px] text-slate-400">
            {profile.avatarUrl ? 'Custom Photo' : 'No Photo Uploaded'}
          </span>
        </div>

        {/* Right: Key Personal Details in Clean Grid */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          
          {/* 1. Full Name */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Name
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-1 truncate">
              {profile.name || 'Not set'}
            </span>
          </div>

          {/* 2. Age */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Age
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-1">
              {profile.age > 0 ? `${profile.age} yrs` : 'Not set'}
            </span>
          </div>

          {/* 3. Height */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Height
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-1">
              {profile.heightCm > 0 ? `${profile.heightCm} cm` : 'Not set'}
            </span>
          </div>

          {/* 4. Weight */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Weight
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-1">
              {profile.weightKg > 0 ? `${profile.weightKg} kg` : 'Not set'}
            </span>
          </div>

          {/* 5. BMI */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> BMI
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading">
                {bmi > 0 ? bmi : '--'}
              </span>
              {bmi > 0 && (
                <span 
                  className="badge text-[10px] font-extrabold px-1.5 py-0.2"
                  style={{ backgroundColor: `${bmiColor}20`, color: bmiColor, borderColor: `${bmiColor}50` }}
                >
                  {bmiCategory}
                </span>
              )}
            </div>
          </div>

          {/* 6. Fitness Goal */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Fitness Goal
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 font-heading mt-1 truncate">
              {formatFitnessGoal(profile.fitnessGoal)}
            </span>
          </div>

          {/* 7. Activity Level */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Activity Level
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-heading mt-1 truncate">
              {formatActivityLevel(profile.activityLevel)}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
