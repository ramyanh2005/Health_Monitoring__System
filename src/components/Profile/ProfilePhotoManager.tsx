import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  User, 
  X, 
  Check, 
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

interface ProfilePhotoManagerProps {
  onPhotoUpdated?: (dataUrl: string) => void;
  compact?: boolean;
}

export const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({ 
  onPhotoUpdated,
  compact = false 
}) => {
  const { profile, updateProfile } = useHealth();

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start Camera for "Take Photo"
  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this browser or device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false
      });

      setCameraStream(stream);
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(err?.message || 'Unable to access device camera. Please check browser permissions or upload from gallery.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCameraError('');
  };

  // Capture Photo from Video Stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw centered cropped square
      const startX = ((video.videoWidth || 480) - size) / 2;
      const startY = ((video.videoHeight || 480) - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      updateProfile({ avatarUrl: dataUrl });
      if (onPhotoUpdated) onPhotoUpdated(dataUrl);
    }

    stopCamera();
  };

  // Handle Upload from Gallery / Computer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateProfile({ avatarUrl: result });
        if (onPhotoUpdated) onPhotoUpdated(result);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    updateProfile({ avatarUrl: '' });
    if (onPhotoUpdated) onPhotoUpdated('');
  };

  // User Initials or neutral avatar placeholder
  const getInitials = () => {
    if (!profile.name || !profile.name.trim()) return 'MH';
    const parts = profile.name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      
      {/* Photo Preview + Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
        
        {/* Avatar Display */}
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg flex items-center justify-center text-slate-400">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name || 'User Profile'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                  {getInitials()}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">
                  Avatar
                </span>
              </div>
            )}
          </div>

          {profile.avatarUrl && (
            <button
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition"
              title="Remove profile picture"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Buttons & Info */}
        <div className="space-y-2.5 text-center sm:text-left flex-1">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
              Profile Photo
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.avatarUrl 
                ? 'Your custom photo is active and saved locally.' 
                : 'No photo uploaded. Using your neutral avatar.'}
            </p>
          </div>

          {/* Action Buttons: Take Photo & Upload from Gallery */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
            
            {/* Take Photo Button */}
            <button
              type="button"
              onClick={startCamera}
              className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo</span>
            </button>

            {/* Upload from Gallery Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
            >
              <Upload className="w-4 h-4" />
              <span>Upload from Gallery</span>
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {profile.avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="btn-secondary py-2 px-3 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Camera Error Alert */}
      {cameraError && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 rounded-xl flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Live Device Camera Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="health-card max-w-md w-full p-6 border-2 border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  Take Profile Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewfinder */}
            <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

              {/* Target Guide Ring */}
              <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full m-8 pointer-events-none" />
            </div>

            {/* Camera Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="btn-secondary py-2.5 px-4 text-xs font-bold flex-1"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="btn-primary py-2.5 px-6 text-xs font-extrabold flex-1 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
              >
                <Check className="w-4 h-4" />
                <span>Snap & Save</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
