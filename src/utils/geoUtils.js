// GPS va Joylashuvni aniqlash / Geokodlash xizmati
// Ibrohim Ota Choyxonasi uchun optimallashgan (Tezkor va 100% barqaror)

/**
 * Koordinatalarni (lat, lon) inson o'qiy oladigan manzilga aylantiradi
 * BigDataCloud (bepul, tezkor) va Nominatim (OSM) orqali ishlaydi
 */
export async function reverseGeocode(lat, lon) {
  const numLat = Number(lat);
  const numLon = Number(lon);

  // 1. BigDataCloud API (brauzerlar uchun eng tez va ishonchli, O'zbekiston hududini yaxshi biladi)
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${numLat}&longitude=${numLon}&localityLanguage=uz`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(bdcUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const parts = [];
      if (data.locality && data.locality !== data.city) parts.push(data.locality);
      if (data.city) parts.push(data.city);
      if (data.principalSubdivision && !parts.includes(data.principalSubdivision)) parts.push(data.principalSubdivision);

      const addressText = parts.length > 0 ? parts.join(', ') : (data.locality || data.city);
      if (addressText) {
        return {
          formattedAddress: `${addressText} (GPS: ${numLat.toFixed(4)}, ${numLon.toFixed(4)})`,
          raw: data,
          coords: { lat: numLat, lon: numLon }
        };
      }
    }
  } catch (e) {
    console.warn('BigDataCloud geokodlashda xatolik:', e.message);
  }

  // 2. OpenStreetMap / Nominatim (zaxira geokodlash)
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${numLat}&lon=${numLon}&zoom=18&addressdetails=1&accept-language=uz,ru,en`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(osmUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const street = addr.road || addr.street || addr.pedestrian || '';
      const quarter = addr.quarter || addr.suburb || addr.neighbourhood || '';
      const district = addr.town || addr.city || addr.district || '';

      const parts = [street, quarter, district].filter(Boolean);
      const addressText = parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(', ');

      if (addressText) {
        return {
          formattedAddress: `${addressText} (GPS: ${numLat.toFixed(4)}, ${numLon.toFixed(4)})`,
          raw: data,
          coords: { lat: numLat, lon: numLon }
        };
      }
    }
  } catch (e) {
    console.warn('OSM geokodlashda xatolik:', e.message);
  }

  // 3. Zaxira: to'g'ridan-to'g'ri aniq GPS koordinatalari
  return {
    formattedAddress: `📍 Aniq lokatsiya (${numLat.toFixed(5)}, ${numLon.toFixed(5)})`,
    coords: { lat: numLat, lon: numLon }
  };
}

/**
 * Qurilma GPS / Geolocation orqali joriy koordinatalarni oladi
 * Hech qachon qotib qolmaydi (9 soniyalik qat'iy timeout va avtomatik zaxira tizimi)
 */
export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    let isFinished = false;

    // 9 soniyalik qat'iy xavfsizlik taymeri
    const timer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        reject(new Error("GPS signali aniqlanmadi. Iltimos, qurilmada geolokatsiyani yoqing yoki manzilni qo'lda yozing."));
      }
    }, 9000);

    const finishSuccess = (coords) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        resolve({
          latitude: Number(coords.latitude),
          longitude: Number(coords.longitude),
          accuracy: coords.accuracy || 10
        });
      }
    };

    const finishFail = (err) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        reject(err);
      }
    };

    // 1. Standart HTML5 Geolocation (mobil brauzer va Telegram Mini App ichida eng tez va ishonchli)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          finishSuccess({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        (err) => {
          // Yuqori aniqlik (GPS) vaqt o'tgan bo'lsa, Wi-Fi/Cell past aniqlikda tez qayta urinamiz
          navigator.geolocation.getCurrentPosition(
            (pos2) => {
              finishSuccess({
                latitude: pos2.coords.latitude,
                longitude: pos2.coords.longitude,
                accuracy: pos2.coords.accuracy
              });
            },
            () => {
              // Telegram LocationManager'ni sinab ko'ramiz
              tryTelegramLocation(finishSuccess, () => {
                let msg = "Joylashuvni aniqlab bo'lmadi.";
                if (err.code === 1) {
                  msg = "Iltimos, Telegram yoki telefoningiz sozlamalaridan joylashuvga (GPS) ruxsat bering.";
                }
                finishFail(new Error(msg));
              });
            },
            { enableHighAccuracy: false, timeout: 3500, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 15000 }
      );
      return;
    }

    // HTML5 geolokatsiya yo'q bo'lsa
    tryTelegramLocation(finishSuccess, finishFail);
  });
}

/**
 * Telegram WebApp LocationManager (agar mavjud bo'lsa)
 */
function tryTelegramLocation(onSuccess, onFail) {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.LocationManager) {
    const lm = window.Telegram.WebApp.LocationManager;
    try {
      let lmFinished = false;
      const lmTimer = setTimeout(() => {
        if (!lmFinished) {
          lmFinished = true;
          onFail(new Error("Telegram GPS javob bermadi"));
        }
      }, 3500);

      lm.init(() => {
        lm.getLocation((data) => {
          if (!lmFinished) {
            lmFinished = true;
            clearTimeout(lmTimer);
            if (data && data.latitude && data.longitude) {
              onSuccess({
                latitude: data.latitude,
                longitude: data.longitude
              });
            } else {
              onFail(new Error("Telegram GPS ma'lumot bermadi"));
            }
          }
        });
      });
      return;
    } catch (e) {
      console.warn('Telegram LocationManager xatosi:', e);
    }
  }
  onFail(new Error("Geolokatsiya mavjud emas"));
}
