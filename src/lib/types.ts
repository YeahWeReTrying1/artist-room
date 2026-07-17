export type MediaKind = "image" | "gif" | "video";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  src: string;
  caption?: string;
  colSpan?: 1 | 2;
};

export type ProjectGrid = {
  /** Колонка начала (1–7) */
  col: number;
  /** Ширина в колонках (1–7) */
  colSpan: number;
  /** Строка начала (1+) */
  row: number;
  /** Высота в строках сетки */
  rowSpan: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  /** Устарело: теги сняты с арт-сайта, поле может остаться в данных */
  tag?: string;
  preview: string;
  detailsEnabled: boolean;
  published: boolean;
  archived: boolean;
  media: MediaItem[];
  /** Ручной порядок из админки; меньше = выше. Если не задано — по названию. */
  manualOrder?: number;
  /** Позиция на 7-колоночной сетке главной (если layoutCustomized) */
  grid?: ProjectGrid;
  /** Ручная раскладка на сетке; иначе — лента в одну полосу */
  layoutCustomized?: boolean;
  /** cover (по умолчанию, обрезка) | contain (Fill — целиком в ячейке) */
  mediaFit?: "cover" | "contain";
  richText?: string;
  structuredBlocks?: Array<{
    title: string;
    text: string;
  }>;
};

export type AboutLink = {
  label: string;
  href: string;
};

export type RoomZoneKey = "wall" | "desk" | "floor" | "paintings";

export type RoomZone = {
  id: string;
  key: RoomZoneKey;
  label: string;
  src: string;
};

export type AboutData = {
  title: string;
  text: string;
  photos: string[];
  links?: AboutLink[];
  /** Путь к логотипу в /public */
  logo?: string;
  /** Фото-зоны комнаты: стена, стол, пол, картины */
  roomZones?: RoomZone[];
};

/** @deprecated теги сняты с арт-сайта */
export type ProjectTag = string;
/** @deprecated */
export const TAGS: readonly string[] = [];
/** @deprecated */
export const ADMIN_PROJECT_TAG_OPTIONS: readonly string[] = [];

export const ROOM_ZONE_META: Array<{ key: RoomZoneKey; label: string }> = [
  { key: "wall", label: "Стена" },
  { key: "desk", label: "Стол" },
  { key: "floor", label: "Пол" },
  { key: "paintings", label: "Картины" }
];
