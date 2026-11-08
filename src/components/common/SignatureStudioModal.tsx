import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  processSignatureImage,
  cropDrawnCanvasSignature,
  generateTypedScriptSignature,
  SignatureProcessOptions,
} from '../../services/signatureProcessor';
import {
  Upload,
  PenTool,
  Type,
  Sliders,
  RotateCw,
  Trash2,
  Check,
  AlertTriangle,
  X,
  ShieldAlert,
} from 'lucide-react';

interface SignatureStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string) => void;
  onRemoveSignature: () => void;
  currentSignature?: string;
}

export const SignatureStudioModal: React.FC<SignatureStudioModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  onRemoveSignature,
  currentSignature,
}) => {
  const [tab, setTab] = useState<'upload' | 'draw' | 'type'>('upload');

  // Guardrail Checkbox
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [processOptions, setProcessOptions] = useState<SignatureProcessOptions>({
    threshold: 40,
    smoothness: 2,
    thickness: 1,
    rotation: 0,
    inkColor: 'black',
  });
  const [processedResult, setProcessedResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Draw state
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnEmpty, setDrawnEmpty] = useState(true);

  // Type state
  const [typedName, setTypedName] = useState('Dev Rajpoot');
  const [selectedFont, setSelectedFont] = useState<'Great Vibes' | 'Dancing Script' | 'Caveat' | 'Allura'>('Great Vibes');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run image processing when upload parameters change
  const triggerProcess = useCallback(async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    try {
      const result = await processSignatureImage(uploadedImage, processOptions);
      setProcessedResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, processOptions]);

  useEffect(() => {
    if (uploadedImage) {
      const timer = setTimeout(() => {
        triggerProcess();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [uploadedImage, processOptions, triggerProcess]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        setSafetyConfirmed(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Drawing canvas logic
  useEffect(() => {
    if (tab === 'draw' && drawCanvasRef.current) {
      const canvas = drawCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0E0E0E';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [tab]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setDrawnEmpty(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearDraw = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnEmpty(true);
  };

  // Save handler with security guardrail
  const handleFinalSave = () => {
    if (!safetyConfirmed) {
      alert('Please confirm that this is a separate business signature and not your bank/legal signature.');
      return;
    }

    let finalDataUrl = '';

    if (tab === 'upload') {
      if (!processedResult) {
        alert('Please upload an image first.');
        return;
      }
      finalDataUrl = processedResult;
    } else if (tab === 'draw') {
      if (!drawCanvasRef.current || drawnEmpty) {
        alert('Please draw a signature first.');
        return;
      }
      finalDataUrl = cropDrawnCanvasSignature(drawCanvasRef.current);
    } else if (tab === 'type') {
      if (!typedName.trim()) {
        alert('Please enter a name.');
        return;
      }
      finalDataUrl = generateTypedScriptSignature(typedName, selectedFont);
    }

    onSaveSignature(finalDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-neutral-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-[#0E0E0E]">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <PenTool size={16} className="text-amber-400" />
              DEVRIAN Business Signature Studio
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Create an exclusive, isolated business mark for billing documents.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Safety Warning Banner */}
        <div className="bg-amber-950/40 border-b border-amber-900/50 px-5 py-2.5 flex items-center gap-3 text-amber-200 text-xs">
          <ShieldAlert size={18} className="text-amber-400 shrink-0" />
          <div className="text-[11px] leading-snug">
            <span className="font-bold">Security Notice: </span>
            Use a dedicated business signature mark. Do <strong className="underline">NOT</strong> use your bank, cheque, government ID or legal instrument signature.
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-950 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`py-3 flex items-center justify-center gap-2 transition border-b-2 ${
              tab === 'upload' ? 'border-white text-white bg-neutral-900' : 'border-transparent text-neutral-400'
            }`}
          >
            <Upload size={14} /> (a) Photo Scan Upload
          </button>
          <button
            type="button"
            onClick={() => setTab('draw')}
            className={`py-3 flex items-center justify-center gap-2 transition border-b-2 ${
              tab === 'draw' ? 'border-white text-white bg-neutral-900' : 'border-transparent text-neutral-400'
            }`}
          >
            <PenTool size={14} /> (b) Draw on Screen
          </button>
          <button
            type="button"
            onClick={() => setTab('type')}
            className={`py-3 flex items-center justify-center gap-2 transition border-b-2 ${
              tab === 'type' ? 'border-white text-white bg-neutral-900' : 'border-transparent text-neutral-400'
            }`}
          >
            <Type size={14} /> (c) Built-in Script Fonts
          </button>
        </div>

        {/* Studio Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* TAB A: UPLOAD & AUTO BACKGROUND REMOVAL */}
          {tab === 'upload' && (
            <div className="space-y-4">
              {!uploadedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700 hover:border-neutral-400 rounded-xl p-8 text-center cursor-pointer bg-neutral-950/60 transition group"
                >
                  <Upload size={32} className="mx-auto text-neutral-400 group-hover:text-white mb-2" />
                  <p className="text-xs font-bold text-white">Click or drop a photo of your signature</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Signature on white paper. Our in-browser engine automatically eliminates paper, shadows, and noise.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Checkerboard Live Preview */}
                  <div className="relative rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950">
                    <div
                      className="h-44 w-full flex items-center justify-center p-4"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)`,
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                      }}
                    >
                      {processedResult ? (
                        <img
                          src={processedResult}
                          alt="Processed Signature"
                          className="max-h-36 max-w-[90%] object-contain"
                        />
                      ) : (
                        <span className="text-xs text-neutral-400">Processing image...</span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-[11px] bg-neutral-900/90 hover:bg-neutral-800 text-white rounded border border-neutral-700 backdrop-blur-sm"
                      >
                        Change Photo
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Sliders: Threshold, Smoothness, Thickness, Rotation */}
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Threshold */}
                      <div>
                        <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                          <span>Paper Background Removal Threshold</span>
                          <span className="font-mono text-white">{processOptions.threshold}</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="85"
                          value={processOptions.threshold}
                          onChange={(e) =>
                            setProcessOptions({ ...processOptions, threshold: Number(e.target.value) })
                          }
                          className="w-full accent-white cursor-pointer"
                        />
                      </div>

                      {/* Smoothness */}
                      <div>
                        <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                          <span>Edge Smoothness</span>
                          <span className="font-mono text-white">{processOptions.smoothness}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={processOptions.smoothness}
                          onChange={(e) =>
                            setProcessOptions({ ...processOptions, smoothness: Number(e.target.value) })
                          }
                          className="w-full accent-white cursor-pointer"
                        />
                      </div>

                      {/* Thickness */}
                      <div>
                        <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                          <span>Ink Stroke Density</span>
                          <span className="font-mono text-white">{processOptions.thickness}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={processOptions.thickness}
                          onChange={(e) =>
                            setProcessOptions({ ...processOptions, thickness: Number(e.target.value) })
                          }
                          className="w-full accent-white cursor-pointer"
                        />
                      </div>

                      {/* Rotation / Deskew */}
                      <div>
                        <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                          <span>Deskew / Rotate</span>
                          <span className="font-mono text-white">{processOptions.rotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          value={processOptions.rotation}
                          onChange={(e) =>
                            setProcessOptions({ ...processOptions, rotation: Number(e.target.value) })
                          }
                          className="w-full accent-white cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                      <span className="text-[11px] text-neutral-400">Ink Color:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setProcessOptions({ ...processOptions, inkColor: 'black' })}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            processOptions.inkColor === 'black'
                              ? 'bg-white text-black font-bold'
                              : 'bg-neutral-900 text-neutral-300'
                          }`}
                        >
                          Near Black (#0E0E0E)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProcessOptions({ ...processOptions, inkColor: 'blue' })}
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            processOptions.inkColor === 'blue'
                              ? 'bg-sky-900 text-white font-bold border border-sky-500'
                              : 'bg-neutral-900 text-neutral-300'
                          }`}
                        >
                          Deep Navy Blue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB B: DRAW ON SCREEN */}
          {tab === 'draw' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-neutral-400">
                <span>Draw your business signature below with mouse or stylus:</span>
                <button
                  type="button"
                  onClick={clearDraw}
                  className="px-2.5 py-1 text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-700 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear
                </button>
              </div>

              <div className="bg-white rounded-xl overflow-hidden border border-neutral-700 shadow-inner">
                <canvas
                  ref={drawCanvasRef}
                  width={580}
                  height={180}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                  className="w-full h-44 cursor-crosshair touch-none"
                />
              </div>
              <p className="text-[10px] text-neutral-500 text-center">
                Strokes are automatically cropped and normalized to max 500px width.
              </p>
            </div>
          )}

          {/* TAB C: BUILT-IN SCRIPT FONTS */}
          {tab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-semibold mb-1">
                  Proprietor / Signer Name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. Dev Rajpoot"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-sm px-3 py-2 rounded-lg outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'Great Vibes', name: 'Great Vibes (Formal Calligraphy)' },
                  { id: 'Dancing Script', name: 'Dancing Script (Modern Fluid)' },
                  { id: 'Caveat', name: 'Caveat (Casual Signature)' },
                  { id: 'Allura', name: 'Allura (Refined Cursive)' },
                ].map((f) => {
                  const isSelected = selectedFont === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFont(f.id as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between bg-white text-black min-h-[96px] ${
                        isSelected ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <span className="text-[10px] text-neutral-500 font-sans uppercase font-bold tracking-wider">
                        {f.name}
                      </span>
                      <div
                        className="text-2xl text-[#0E0E0E] text-center my-2 truncate select-none"
                        style={{ fontFamily: `'${f.id}', cursive` }}
                      >
                        {typedName || 'Dev Rajpoot'}
                      </div>
                      <div className="flex justify-end">
                        {isSelected && <Check size={14} className="text-amber-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MANDATORY SAFETY GUARDRAIL CHECKBOX */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={safetyConfirmed}
                onChange={(e) => setSafetyConfirmed(e.target.checked)}
                className="mt-0.5 rounded accent-white w-4 h-4 cursor-pointer shrink-0"
              />
              <span className="text-xs text-neutral-300 leading-snug">
                <strong className="text-white">Safety Confirmation: </strong>
                I confirm that this is a separate business signature mark created exclusively for DEVRIAN documents, and is <u>not</u> my personal bank, cheque, government or legal instrument signature.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-[#0E0E0E] flex items-center justify-between">
          <div>
            {currentSignature && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete saved business signature from this browser?')) {
                    onRemoveSignature();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-1.5 transition"
              >
                <Trash2 size={13} /> Remove Signature
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!safetyConfirmed}
              onClick={handleFinalSave}
              className={`px-5 py-2 rounded-lg text-xs font-bold shadow-lg transition flex items-center gap-1.5 ${
                safetyConfirmed
                  ? 'bg-white hover:bg-neutral-200 text-black cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Check size={14} /> Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

