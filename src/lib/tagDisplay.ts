/** Совместимость: если появятся старые теги, показываем их как есть. */
export function displayTagLabel(tag?: string | null): string {
  return (tag || "").trim();
}
