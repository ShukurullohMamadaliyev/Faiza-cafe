// GPS va Joylashuvni aniqlash / Teskari geokodlash yordamchisi

/**
 * Koordinatalarni (lat, lon) inson o'qiy oladigan manzilga aylantiradi
 */
export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=uz,ru,en`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IbrohimOtaMiniApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Geokodlash xizmatida xatolik');
    }

    const data = await response.json();
    const addr = data.address || {};

    // Qismlardan qulay va chiroyli manzil hosil qilamiz
    const street = addr.road || addr.street || addr.pedestrian || addr.footway || '';
    const house = addr.house_number ? `${addr.house_number}-uy` : '';
    const quarter = addr.quarter || addr.suburb || addr.neighbourhood || addr.residential || '';
    const district = addr.town || addr.city || addr.county || addr.district || 'Rishton tumani';
    const landmark = addr.amenity || addr.shop || '';

    let formattedParts = [];
    if (street) formattedParts.push(street);
    if (house) formattedParts.push(house);
    if (quarter && quarter !== street) formattedParts.push(quarter);
    if (district) formattedParts.push(district);

    let finalAddress = formattedParts.join(', ');

    // Agar batafsil ma'lumot kam bo'lsa, display_name'ning bosh qismini olamiz
    if (!finalAddress && data.display_name) {
      finalAddress = data.display_name.split(',').slice(0, 3).join(', ');
    }

    return {
      formattedAddress: finalAddress || `Rishton tumani (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      raw: data,
      coords: { lat, lon }
    };
  } catch (error) {
    console.warn('Teskari geokodlashda xatolik:', error);
    // Zaxira ko'rinish
    return {
      formattedAddress: `Joriy joylashuv (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      coords: { lat, lon }
    };
  }
}

/**
 * Qurilma GPS / Geolocation orqali joriy koordinatalarni oladi
 */
export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    // 1. Agar Telegram WebApp LocationManager mavjud bo'lsa
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.LocationManager) {
      const lm = window.Telegram.WebApp.LocationManager;
      try {
        lm.init(() => {
          lm.getLocation((data) => {
            if (data && data.latitude && data.longitude) {
              resolve({
                latitude: data.latitude,
                longitude: data.longitude
              });
            } else {
              // HTML5 geolokatsiyaga o'tamiz
              fallbackHtml5Geo(resolve, reject);
            }
          });
        });
        return;
      } catch (e) {
        console.warn('Telegram LocationManager ishlamadi:', e);
      }
    }

    // 2. Standart HTML5 Geolocation API
    fallbackHtml5Geo(resolve, reject);
  });
}

function fallbackHtml5Geo(resolve, reject) {
  if (!navigator.geolocation) {
    reject(new Error("Brauzeringizda geolokatsiya qo'llab-quvvatlanmaydi"));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    },
    (error) => {
      let msg = "Joylashuvni aniqlab bo'lmadi";
      if (error.code === error.PERMISSION_DENIED) {
        msg = "GPS / Joylashuvga ruxsat berilmadi. Iltimos, sozlamalardan ruxsat bering.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        msg = "Joylashuv signali mavjud emas";
      } else if (error.code === error.TIMEOUT) {
        msg = "Joylashuvni aniqlash vaqti tugadi";
      }
      reject(new Error(msg));
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000
    }
  );
}
