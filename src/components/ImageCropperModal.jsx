import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  X,
  Move,
  Crop,
  Sparkles,
  Maximize2
} from 'lucide-react';

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onApply,
  onCancel,
  aspectRatio = 16 / 9
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState({ width: 800, height: 600 });
  const [containerSize, setContainerSize] = useState({ width: 340, height: 191 });

  // Rasmni dastlabki o'lchamlarini o'qish
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    // Reset parameters
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Konteyner o'lchamini kuzatish
  useEffect(() => {
    if (!containerRef.current || !isOpen) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerSize({ width: rect.width, height: rect.height });
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  // Baza qoplama o'lchami (contain/cover hisobi)
  const isRotated90or270 = rotation === 90 || rotation === 270;
  const effectiveNatW = isRotated90or270 ? naturalSize.height : naturalSize.width;
  const effectiveNatH = isRotated90or270 ? naturalSize.width : naturalSize.height;

  const baseRatio = Math.max(
    containerSize.width / (effectiveNatW || 1),
    containerSize.height / (effectiveNatH || 1)
  );

  const baseW = naturalSize.width * baseRatio;
  const baseH = naturalSize.height * baseRatio;

  // Pointer drag hodisalari (Touch + Mouse bir xil ishlaydi)
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: position.x, y: position.y });
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosition({
      x: initialPos.x + dx,
      y: initialPos.y + dy
    });
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // Natijaviy rasmni yuqori sifatda qirqib saqlash
  const handleConfirmCrop = useCallback(() => {
    const canvas = document.createElement('canvas');
    const outWidth = 960;
    const outHeight = Math.round(outWidth / aspectRatio); // 960x540 (16:9)

    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Toza fon
    ctx.fillStyle = '#150305';
    ctx.fillRect(0, 0, outWidth, outHeight);

    const R = outWidth / (containerSize.width || 1);

    ctx.save();
    // 1. Markazga siljitish
    ctx.translate(outWidth / 2, outHeight / 2);
    // 2. Foydalanuvchi burishi
    ctx.rotate((rotation * Math.PI) / 180);
    // 3. Foydalanuvchi siljitishi (offset)
    // Agar 90/270 burilgan bo'lsa, aylanish koordinatasiga moslab yo'naltirish
    const rad = (-rotation * Math.PI) / 180;
    const rotatedOffsetX = position.x * Math.cos(rad) - position.y * Math.sin(rad);
    const rotatedOffsetY = position.x * Math.sin(rad) + position.y * Math.cos(rad);

    ctx.translate(rotatedOffsetX * R, rotatedOffsetY * R);
    // 4. Foydalanuvchi masshtabi
    ctx.scale(scale, scale);

    // 5. Rasmni chizish
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const drawW = baseW * R;
      const drawH = baseH * R;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Sifatli siqilgan JPEG eksport
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const sizeKB = Math.round((croppedDataUrl.length * 0.75) / 1024);
      const infoText = `${sizeKB} KB (Moslashtirildi ✨)`;

      onApply(croppedDataUrl, infoText);
    };
    img.src = imageSrc;
  }, [aspectRatio, containerSize, position, rotation, scale, baseW, baseH, imageSrc, onApply]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-fadeIn">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between pt-1 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Crop size={16} />
          </div>
          <div>
            <h3 className="font-serif font-black text-sm text-amber-300">
              Rasmni to‘g‘rilash va moslash
            </h3>
            <p className="text-[10px] text-stone-400">
              Barmog‘ingiz bilan suring va o‘lchamini to‘g‘rilang
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Interactive Cropper Area */}
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center py-3">
        <div className="w-full flex items-center justify-between text-[11px] text-amber-400/80 mb-2 px-1">
          <span className="flex items-center gap-1">
            <Move size={12} /> Barmog‘ingiz bilan rasmni suring
          </span>
          <span className="text-stone-400 font-mono">
            {Math.round(scale * 100)}% | {rotation}°
          </span>
        </div>

        {/* Viewport Frame (Exact Mini App card ratio) */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full aspect-video rounded-3xl overflow-hidden bg-[#120204] border-2 shadow-2xl touch-none select-none ${
            isDragging ? 'border-amber-400 ring-4 ring-amber-400/20 cursor-grabbing' : 'border-amber-500/50 cursor-grab'
          }`}
          style={{ maxHeight: '50vh' }}
        >
          {/* Draggable and Scalable Image Layer */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: `${baseW}px`,
              height: `${baseH}px`,
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.08s ease-out'
            }}
          >
            <img
              src={imageSrc}
              alt="Cropper Target"
              className="w-full h-full pointer-events-none select-none block"
              draggable={false}
            />
          </div>

          {/* 3x3 Composition Grid */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-amber-400/20 rounded-3xl">
            <div className="border-r border-b border-white/15"></div>
            <div className="border-r border-b border-white/15"></div>
            <div className="border-b border-white/15"></div>
            <div className="border-r border-b border-white/15"></div>
            <div className="border-r border-b border-white/15"></div>
            <div className="border-b border-white/15"></div>
            <div className="border-r border-white/15"></div>
            <div className="border-r border-white/15"></div>
            <div></div>
          </div>

          {/* Corner Guides */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400 pointer-events-none"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400 pointer-events-none"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400 pointer-events-none"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400 pointer-events-none"></div>

          {/* Mini App Card Preview Badge */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300">
            📱 Mini Appda ko‘rinishi
          </div>
        </div>
      </div>

      {/* Control Panel: Zoom Slider, Rotate, Reset */}
      <div className="w-full max-w-md bg-[#28080b]/90 border border-amber-500/25 rounded-3xl p-4 space-y-3.5 shadow-2xl">
        {/* Zoom Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-stone-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <ZoomIn size={14} />
              <span>Kattalashtirish / Kichraytirish</span>
            </span>
            <span className="font-mono text-amber-300 text-[11px]">
              {(scale).toFixed(1)}x
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setScale((s) => Math.max(0.7, Number((s - 0.1).toFixed(1))))}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 flex items-center justify-center active:scale-95 transition"
              title="Kichraytirish"
            >
              <ZoomOut size={15} />
            </button>

            <input
              type="range"
              min="0.7"
              max="3.0"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500 h-2 bg-[#150305] rounded-lg cursor-pointer"
            />

            <button
              onClick={() => setScale((s) => Math.min(3.0, Number((s + 0.1).toFixed(1))))}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 flex items-center justify-center active:scale-95 transition"
              title="Kattalashtirish"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Action Buttons: Rotate 90, Reset, Apply */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleRotate}
            className="flex-1 py-2.5 bg-[#150305] hover:bg-[#1f0507] text-stone-200 border border-amber-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
            title="90 gradus burish"
          >
            <RotateCw size={14} className="text-amber-400" />
            <span>90° Burish</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-3 bg-[#150305] hover:bg-[#1f0507] text-stone-400 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition"
            title="Asliga qaytarish"
          >
            <RotateCcw size={13} />
            <span>Asli</span>
          </button>
        </div>

        {/* Bottom Finalize Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-stone-300 font-bold text-xs rounded-2xl transition active:scale-95"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <Check size={16} />
            <span>Tayyor, o‘lchamni tasdiqlash</span>
          </button>
        </div>
      </div>
    </div>
  );
}
