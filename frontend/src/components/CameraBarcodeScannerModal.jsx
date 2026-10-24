import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, SwitchCamera, Zap, Check, AlertCircle, ScanLine, QrCode } from 'lucide-react';
import { playScanBeep } from '../utils/audioFeedback.js';

export default function CameraBarcodeScannerModal({
  isOpen,
  onClose,
  products,
  onBarcodeDetected
}) {
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [lastScanned, setLastScanned] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera access is not supported by your browser or insecure origin.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.debug('Video play error:', e));
      }

      // Check for native BarcodeDetector API
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
          });

          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  handleCodeDetected(rawValue);
                }
              } catch (e) {
                // detector error ignored
              }
            }
          }, 400);
        } catch (e) {
          console.debug('BarcodeDetector init error:', e);
        }
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in your browser address bar.'
          : 'Unable to start camera. Please verify camera device availability.'
      );
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCodeDetected = (code) => {
    if (!code || code === lastScanned) return;
    setLastScanned(code);
    playScanBeep();

    const matchedProduct = products.find(p => 
      (p.barcode && p.barcode.trim() === code.trim()) ||
      (p.sku && p.sku.toLowerCase() === code.toLowerCase())
    );

    onBarcodeDetected(code, matchedProduct);

    setTimeout(() => {
      setLastScanned(null);
    }, 1500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeDetected(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50 dark:bg-navy-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-glow-violet">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Live Barcode & QR Scanner</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Align product barcode within the red laser guide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-navy-800 transition"
              title="Switch Camera (Front / Rear)"
            >
              <SwitchCamera className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative bg-black flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[300px]">
          {cameraError ? (
            <div className="p-6 text-center text-rose-300 max-w-sm space-y-2">
              <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
              <p className="text-xs font-semibold">{cameraError}</p>
              <p className="text-[11px] text-slate-400">
                You can still use manual entry or tap quick barcodes below.
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover max-h-[320px]"
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-64 h-40 border-2 border-violet-400/70 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-violet-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-violet-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-violet-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-violet-400 rounded-br-lg" />

                  {/* Animated Red Laser Scan Beam */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-pulse-subtle" 
                       style={{ animation: 'scanBeam 2s ease-in-out infinite alternate' }} />
                </div>
              </div>

              {lastScanned && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
                  <Check className="h-4 w-4" />
                  <span>Detected: {lastScanned}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Manual Barcode Input */}
        <div className="p-4 border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/40">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Or enter barcode/SKU manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition disabled:opacity-50"
            >
              Scan
            </button>
          </form>
        </div>

        {/* 1-Tap Quick Sample Barcode Strip */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 bg-white dark:bg-navy-900 text-xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Quick-Tap Catalog Barcodes
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {products.filter(p => p.barcode).slice(0, 6).map(p => (
              <button
                key={p._id}
                onClick={() => handleCodeDetected(p.barcode)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:border-violet-500 dark:hover:border-violet-500 text-left transition flex items-center justify-between group bg-slate-50/50 dark:bg-navy-950/40"
              >
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    {p.name}
                  </p>
                  <span className="font-mono text-[10px] text-slate-400">{p.barcode}</span>
                </div>
                <span className="font-bold text-xs text-violet-600 dark:text-violet-400">
                  ₹{p.price}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scanBeam {
          0% { top: 5%; }
          100% { top: 92%; }
        }
      `}</style>
    </div>
  );
}
