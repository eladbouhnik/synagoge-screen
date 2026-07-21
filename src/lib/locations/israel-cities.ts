export type IsraelRegion = "צפון" | "מרכז" | "ירושלים והסביבה" | "דרום";

export interface IsraelCity {
  id: string;
  label: string;
  region: IsraelRegion;
  latitude: number;
  longitude: number;
  elevation: number;
}

// Coordinates/elevation are approximate (city-center), which is more than
// accurate enough for sunrise/sunset-based zmanim — a few hundred meters of
// error shifts calculated times by well under a minute.
export const ISRAEL_CITIES: IsraelCity[] = [
  { id: "tzfat", label: "צפת", region: "צפון", latitude: 32.9646, longitude: 35.496, elevation: 900 },
  { id: "tiberias", label: "טבריה", region: "צפון", latitude: 32.7922, longitude: 35.5312, elevation: -200 },
  { id: "nazareth", label: "נצרת", region: "צפון", latitude: 32.702, longitude: 35.297, elevation: 350 },
  { id: "nof-hagalil", label: "נוף הגליל", region: "צפון", latitude: 32.7126, longitude: 35.3159, elevation: 400 },
  { id: "afula", label: "עפולה", region: "צפון", latitude: 32.6078, longitude: 35.2897, elevation: 60 },
  { id: "karmiel", label: "כרמיאל", region: "צפון", latitude: 32.9186, longitude: 35.2951, elevation: 220 },
  { id: "maalot-tarshiha", label: "מעלות-תרשיחא", region: "צפון", latitude: 33.0175, longitude: 35.2725, elevation: 480 },
  { id: "kiryat-shmona", label: "קריית שמונה", region: "צפון", latitude: 33.2078, longitude: 35.5697, elevation: 150 },
  { id: "hatzor-haglilit", label: "חצור הגלילית", region: "צפון", latitude: 32.9997, longitude: 35.5406, elevation: 250 },
  { id: "rosh-pina", label: "ראש פינה", region: "צפון", latitude: 32.9683, longitude: 35.5425, elevation: 630 },
  { id: "acre", label: "עכו", region: "צפון", latitude: 32.9281, longitude: 35.0819, elevation: 5 },
  { id: "nahariya", label: "נהריה", region: "צפון", latitude: 33.0059, longitude: 35.0938, elevation: 10 },
  { id: "haifa", label: "חיפה", region: "צפון", latitude: 32.794, longitude: 34.9896, elevation: 100 },
  { id: "kiryat-ata", label: "קריית אתא", region: "צפון", latitude: 32.8, longitude: 35.1053, elevation: 30 },
  { id: "kiryat-bialik", label: "קריית ביאליק", region: "צפון", latitude: 32.8358, longitude: 35.0819, elevation: 15 },
  { id: "kiryat-motzkin", label: "קריית מוצקין", region: "צפון", latitude: 32.8378, longitude: 35.0806, elevation: 10 },
  { id: "kiryat-yam", label: "קריית ים", region: "צפון", latitude: 32.8425, longitude: 35.0686, elevation: 5 },
  { id: "afek-migdal-haemek", label: "מגדל העמק", region: "צפון", latitude: 32.6742, longitude: 35.2417, elevation: 240 },
  { id: "beit-shean", label: "בית שאן", region: "צפון", latitude: 32.4967, longitude: 35.4986, elevation: -120 },
  { id: "yokneam", label: "יקנעם עילית", region: "צפון", latitude: 32.6586, longitude: 35.1097, elevation: 200 },
  { id: "zichron-yaakov", label: "זכרון יעקב", region: "צפון", latitude: 32.5731, longitude: 34.9522, elevation: 120 },
  { id: "binyamina", label: "בנימינה", region: "צפון", latitude: 32.5228, longitude: 34.9508, elevation: 40 },
  { id: "hadera", label: "חדרה", region: "מרכז", latitude: 32.4340, longitude: 34.9196, elevation: 25 },
  { id: "netanya", label: "נתניה", region: "מרכז", latitude: 32.3328, longitude: 34.8600, elevation: 35 },
  { id: "kfar-saba", label: "כפר סבא", region: "מרכז", latitude: 32.175, longitude: 34.9069, elevation: 45 },
  { id: "raanana", label: "רעננה", region: "מרכז", latitude: 32.1848, longitude: 34.8706, elevation: 40 },
  { id: "hod-hasharon", label: "הוד השרון", region: "מרכז", latitude: 32.1547, longitude: 34.8931, elevation: 50 },
  { id: "herzliya", label: "הרצליה", region: "מרכז", latitude: 32.1663, longitude: 34.8436, elevation: 20 },
  { id: "ramat-hasharon", label: "רמת השרון", region: "מרכז", latitude: 32.1461, longitude: 34.8397, elevation: 30 },
  { id: "petah-tikva", label: "פתח תקווה", region: "מרכז", latitude: 32.0917, longitude: 34.8875, elevation: 40 },
  { id: "tel-aviv", label: "תל אביב - יפו", region: "מרכז", latitude: 32.0853, longitude: 34.7818, elevation: 5 },
  { id: "ramat-gan", label: "רמת גן", region: "מרכז", latitude: 32.0684, longitude: 34.8248, elevation: 40 },
  { id: "givatayim", label: "גבעתיים", region: "מרכז", latitude: 32.0723, longitude: 34.8106, elevation: 30 },
  { id: "bnei-brak", label: "בני ברק", region: "מרכז", latitude: 32.0807, longitude: 34.8338, elevation: 25 },
  { id: "bat-yam", label: "בת ים", region: "מרכז", latitude: 32.0231, longitude: 34.7503, elevation: 15 },
  { id: "holon", label: "חולון", region: "מרכז", latitude: 32.0158, longitude: 34.7874, elevation: 20 },
  { id: "rishon-lezion", label: "ראשון לציון", region: "מרכז", latitude: 31.9730, longitude: 34.7925, elevation: 35 },
  { id: "rehovot", label: "רחובות", region: "מרכז", latitude: 31.8928, longitude: 34.8113, elevation: 65 },
  { id: "ness-ziona", label: "נס ציונה", region: "מרכז", latitude: 31.9294, longitude: 34.7969, elevation: 40 },
  { id: "lod", label: "לוד", region: "מרכז", latitude: 31.9516, longitude: 34.8958, elevation: 55 },
  { id: "ramla", label: "רמלה", region: "מרכז", latitude: 31.9286, longitude: 34.8656, elevation: 90 },
  { id: "modiin", label: "מודיעין-מכבים-רעות", region: "מרכז", latitude: 31.8969, longitude: 35.0111, elevation: 220 },
  { id: "kfar-yona", label: "כפר יונה", region: "מרכז", latitude: 32.3183, longitude: 34.9358, elevation: 40 },
  { id: "or-yehuda", label: "אור יהודה", region: "מרכז", latitude: 32.0281, longitude: 34.8556, elevation: 30 },
  { id: "yavne", label: "יבנה", region: "מרכז", latitude: 31.8781, longitude: 34.7397, elevation: 30 },
  { id: "jerusalem", label: "ירושלים", region: "ירושלים והסביבה", latitude: 31.7683, longitude: 35.2137, elevation: 800 },
  { id: "beit-shemesh", label: "בית שמש", region: "ירושלים והסביבה", latitude: 31.7456, longitude: 34.9889, elevation: 300 },
  { id: "maale-adumim", label: "מעלה אדומים", region: "ירושלים והסביבה", latitude: 31.7728, longitude: 35.2989, elevation: 480 },
  { id: "efrat", label: "אפרת", region: "ירושלים והסביבה", latitude: 31.6564, longitude: 35.1497, elevation: 890 },
  { id: "beitar-illit", label: "ביתר עילית", region: "ירושלים והסביבה", latitude: 31.6989, longitude: 35.1122, elevation: 780 },
  { id: "ashdod", label: "אשדוד", region: "דרום", latitude: 31.8014, longitude: 34.6435, elevation: 15 },
  { id: "ashkelon", label: "אשקלון", region: "דרום", latitude: 31.6688, longitude: 34.5742, elevation: 30 },
  { id: "kiryat-gat", label: "קריית גת", region: "דרום", latitude: 31.6100, longitude: 34.7642, elevation: 130 },
  { id: "kiryat-malachi", label: "קריית מלאכי", region: "דרום", latitude: 31.7297, longitude: 34.7469, elevation: 65 },
  { id: "sderot", label: "שדרות", region: "דרום", latitude: 31.5253, longitude: 34.5958, elevation: 115 },
  { id: "netivot", label: "נתיבות", region: "דרום", latitude: 31.4222, longitude: 34.5917, elevation: 130 },
  { id: "ofakim", label: "אופקים", region: "דרום", latitude: 31.3117, longitude: 34.6203, elevation: 145 },
  { id: "beer-sheva", label: "באר שבע", region: "דרום", latitude: 31.2518, longitude: 34.7913, elevation: 280 },
  { id: "dimona", label: "דימונה", region: "דרום", latitude: 31.0689, longitude: 35.0325, elevation: 570 },
  { id: "arad", label: "ערד", region: "דרום", latitude: 31.2589, longitude: 35.2128, elevation: 610 },
  { id: "mitzpe-ramon", label: "מצפה רמון", region: "דרום", latitude: 30.6094, longitude: 34.8014, elevation: 860 },
  { id: "eilat", label: "אילת", region: "דרום", latitude: 29.5581, longitude: 34.9482, elevation: 10 },
];

export function findCityByCoordinates(latitude: number, longitude: number): IsraelCity | null {
  const epsilon = 0.01;
  return (
    ISRAEL_CITIES.find(
      (city) => Math.abs(city.latitude - latitude) < epsilon && Math.abs(city.longitude - longitude) < epsilon,
    ) ?? null
  );
}

export const ISRAEL_TIMEZONE = "Asia/Jerusalem";
