import React from 'react';
import { 
  User, 
  Scale, 
  Target, 
  Calendar, 
  Edit3, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { calculateBMI } from '../../utils/calculations';

interface ProfileSummaryCardProps {
  onEditProfile: () => void;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ onEditProfile }) => {
  const { profile } = useHealth();
  const { bmi, category: bmiCategory, color: bmiColor } = calculateBMI(profile.weightKg, profile.heightCm);

  const formatFitnessGoal = (goal?: string) => {
    switch (goal) {
      case 'muscle_gain': return 'Muscle Building';
      case 'weight_loss': return 'Fat Loss';
      case 'maintain': return 'Weight Maintenance';
      case 'stamina': return 'Cardio Stamina';
      case 'flexibility': return 'Flexibility';
      case 'general_health': return 'Overall Health';
      default: return goal || 'Muscle Building';
    }
  };

  const getInitials = () => {
    if (!profile.name || !profile.name.trim()) return 'MH';
    const parts = profile.name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="health-card p-5 border-2 border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      {/* Left: User Photo + Name + Age + Goal */}
      <div className="flex items-center gap-4 flex-1">
        
        {/* User Photo / Neutral Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name || 'User Profile'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {getInitials()}
              </span>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </div>

        {/* User Summary Text */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
              My Profile Summary
            </span>
            {bmi > 0 && (
              <span 
                className="badge text-[10px] font-extrabold px-1.5 py-0.2"
                style={{ backgroundColor: `${bmiColor}20`, color: bmiColor, borderColor: `${bmiColor}50` }}
              >
                BMI: {bmi} ({bmiCategory})
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
            {profile.name || 'User Profile'}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <strong>Age:</strong> {profile.age > 0 ? `${profile.age} yrs` : 'Not set'}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <strong>Goal:</strong> {formatFitnessGoal(profile.fitnessGoal)}
            </span>
            {profile.heightCm > 0 && profile.weightKg > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="hidden md:inline">
                  <strong>Stats:</strong> {profile.heightCm} cm / {profile.weightKg} kg
                </span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Right: Direct "Edit Profile" Button linking to Profile Page */}
      <button
        onClick={onEditProfile}
        className="btn-secondary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs flex-shrink-0 w-full sm:w-auto justify-center"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>Edit Profile</span>
        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
      </button>

    </div>
  );
};
