// Rasmlarni galereyadan yuklash va sifatini yo'qotmasdan siqish (Smart Canvas Compressor)

/**
 * Rasmni sifatli siqib, ixcham Base64 (Data URL) formatiga aylantiradi
 * @param {File} file - Galereyadan olingan rasm fayli
 * @param {number} maxWidth - Maksimal kenglik (standart 800px)
 * @param {number} maxHeight - Maksimal balandlik (standart 800px)
 * @param {number} quality - JPEG sifati (0.85 - yuqori sifat)
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number }>}
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error("Iltimos, faqat rasm faylini tanlang (JPEG, PNG, HEIC)"));
      return;
    }

    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Proporsiyani saqlagan holda o'lchamni optimallashtirish
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Brauzerda rasm qayta ishlash qo'llab-quvvatlanmadi"));
          return;
        }

        // Yuqori sifatli silliqlash (antialiasing)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Oq fon bilan chizish (PNG shaffof fonlari qora bo'lib qolmasligi uchun)
        ctx.fillStyle = '#1c0507';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // JPEG formatida yuqori sifatda (0.85) siqish
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Siqilgan hajmni taxminiy hisoblash (Base64 hajmi)
        const compressedSize = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          originalSize,
          compressedSize,
          width,
          height
        });
      };

      img.onerror = () => reject(new Error("Rasmni ochishda xatolik yuz berdi"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

/**
 * Bayt hajmini chiroyli formatda ko'rsatish (KB / MB)
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  if (bytes < k * k) {
    return `${Math.round(bytes / k)} KB`;
  }
  return `${(bytes / (k * k)).toFixed(1)} MB`;
}
