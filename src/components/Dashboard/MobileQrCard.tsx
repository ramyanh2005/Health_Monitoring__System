import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Wifi, 
  Globe,
  Edit2
} from 'lucide-react';

export const MobileQrCard: React.FC = () => {
  const defaultNetworkUrl = 'http://192.168.68.122:5173';
  
  const [targetUrl, setTargetUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return defaultNetworkUrl;
      }
      return origin;
    }
    return defaultNetworkUrl;
  });

  const [customInput, setCustomInput] = useState<string>(targetUrl);
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        setTargetUrl(origin);
        setCustomInput(origin);
      }
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setTargetUrl(customInput.trim());
      setIsEditingUrl(false);
    }
  };

  return (
    <div id="mobile-qr-section" className="health-card p-6 sm:p-7 border-2 border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between space-y-6">
      
      {/* 1. Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/25">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                Open Healthy Me on Your Phone
              </h3>
              <span className="badge badge-cyan text-[11px] font-bold">
                Scannable QR
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Access your real-time health dashboard from any mobile browser
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-cyan text-xs font-bold flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5" /> Wi-Fi Ready: 192.168.68.122
          </span>
        </div>
      </div>

      {/* 2. QR Code Display & Detailed Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left / Center: High Contrast Rendered QR Code */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-cyan-50/40 dark:from-slate-800 dark:to-slate-900 rounded-3xl border-2 border-cyan-200 dark:border-cyan-800 shadow-inner">
          <div className="p-3.5 bg-white rounded-2xl shadow-md border-2 border-slate-200 flex items-center justify-center">
            <QRCodeSVG
              value={targetUrl}
              size={165}
              level="M"
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-xs font-black text-cyan-800 dark:text-cyan-300 text-center">
            <QrCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Scan with Phone Camera</span>
          </div>
        </div>

        {/* Right: Text Instructions, Network Link & Actions */}
        <div className="md:col-span-7 space-y-4 text-left">
          
          <div className="space-y-1.5">
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading">
              Scan this QR code to open Healthy Me on your mobile
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Open your smartphone camera app or QR scanner and point it at the code on the left. The dashboard will immediately launch in your mobile browser with complete touch support, offline local storage, and real-time biometric tracking.
            </p>
          </div>

          {/* Current URL Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Target Mobile URL:
              </span>
              <button
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 text-[11px]"
              >
                <Edit2 className="w-3 h-3" /> {isEditingUrl ? 'Cancel' : 'Change URL'}
              </button>
            </div>

            {isEditingUrl ? (
              <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
                <input
                  type="url"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="http://192.168.x.x:5173 or https://my-healthy-me.app"
                  className="glass-input text-xs py-1.5 px-2.5 flex-1 font-mono"
                  required
                />
                <button type="submit" className="btn-primary py-1.5 px-3 text-xs font-bold">
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                  {targetUrl}
                </span>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="btn-secondary py-1 px-2.5 text-xs font-bold flex items-center gap-1"
                    title="Copy URL to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-1 px-2.5 text-xs font-bold flex items-center gap-1"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Wi-Fi & Device Guide Note */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-cyan-50/60 dark:bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-100 dark:border-cyan-900/40">
            💡 <strong>Quick Connection Tip:</strong> Ensure your mobile phone is connected to the same Wi-Fi network (<code className="font-mono text-[10px] text-cyan-700 dark:text-cyan-300">http://192.168.68.122:5173</code>) or open the public deployment URL.
          </div>

        </div>

      </div>

    </div>
  );
};
