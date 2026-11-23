const english: Record<string, string> = {
  "Максим Бобков": "Maxim Bobkov",
  "живу, рисую, коллекционирую наброски друзей и артефакты, делаю звуковые перформансы\n\nЧто я думаю я люблю:\n1. Кефир с сахаром\n2. Быть одному в квартире\n3. Поцелуи": "I live, draw, collect friends’ sketches and artifacts, and make sound performances.\n\nThings I think I like:\n1. Kefir with sugar\n2. Being alone in the apartment\n3. Kisses",
  "пятничные наброски у Киры и Вари / 27 сентября 2024": "Friday sketches at Kira and Varya’s / September 27, 2024",
  "Наброски в гостях у Киры": "Sketches at Kira’s",
  "Журнальные наброски": "Magazine sketches",
  "Пятничные наброски у Киры и Вари 20.12.24": "Friday sketches at Kira and Varya’s / December 20, 2024",
  "Рисовали Марину и Максима\nА4\nКарандаш, угольный карандаш": "We drew Marina and Maxim\nA4\nPencil, charcoal pencil",
  "Рисовали Леру": "We drew Lera",
  "2026\nА4\nКарандаш, перо, тушь, фломастер": "2026\nA4\nPencil, dip pen, ink, felt-tip pen",
  "Текст": "Text"
};

export function artistText(text: string | undefined, language: "ru" | "en") {
  const original = text?.trim() ?? "";
  const key = original.split(/\r?\n/).map(line => line.trim()).join("\n");
  return language === "en" && Object.hasOwn(english, key) ? english[key] : original;
}
