import type { DawnOpinion, NightfallOpinion, ShemaTefilaOpinion } from "@/types/domain";

interface OpinionOption<T extends string> {
  value: T;
  label: string;
  hint: string;
}

export const dawnOptions: OpinionOption<DawnOpinion>[] = [
  { value: "72", label: "72 דקות לפני הזריחה", hint: "עלות השחר קבועה 72 דקות (זמן שעון) לפני הזריחה — השיטה הנפוצה ביותר." },
  { value: "90", label: "90 דקות לפני הזריחה", hint: "שיטה מחמירה יותר, נפוצה בקהילות אשכנזיות." },
  { value: "96", label: "96 דקות לפני הזריחה", hint: "השיטה המחמירה ביותר מבין הזמנים הקבועים המקובלים." },
  { value: "baal_hatanya", label: "לפי בעל התניא", hint: "חישוב זוויתי לפי שיטת אדמו\"ר הזקן, נהוג בקהילות חב\"ד." },
];

export const shemaTefilaOptions: OpinionOption<ShemaTefilaOpinion>[] = [
  { value: "gra", label: "גר\"א", hint: "סוף זמן קריאת שמע ותפילה מחושבים מהזריחה עד השקיעה בפועל — השיטה הנפוצה ביותר." },
  { value: "mga", label: "מג\"א", hint: "מחושב מעלות השחר ועד צאת הכוכבים — מקדים את סוף הזמן, מחמיר יותר." },
  { value: "baal_hatanya", label: "בעל התניא", hint: "שיטת אדמו\"ר הזקן, נהוגה בקהילות חב\"ד." },
];

export const nightfallOptions: OpinionOption<NightfallOpinion>[] = [
  { value: "geonim", label: "שיטת הגאונים (זמן קבוע)", hint: "כ־13.5 דקות אחרי השקיעה — צאת שלושה כוכבים בינוניים, לפי חישוב זוויתי קבוע." },
  { value: "rabbeinu_tam", label: "רבנו תם (זמן יחסי)", hint: "72 דקות \"זמניות\" (יחסיות לאורך היום) אחרי השקיעה — מחמיר משמעותית, נהוג בעיקר במוצאי שבת וחג." },
  { value: "baal_hatanya", label: "בעל התניא", hint: "שיטת אדמו\"ר הזקן, נהוגה בקהילות חב\"ד." },
];
