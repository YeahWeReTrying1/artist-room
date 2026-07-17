import fs from "node:fs/promises";
import path from "node:path";
import { AboutData, Project } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const projectsPath = path.join(dataDir, "projects.json");
const aboutPath = path.join(dataDir, "about.json");
const loaderPath = path.join(dataDir, "loader.json");

const defaultAbout: AboutData = {
  title: "Обо мне",
  text: "рисую, коллекционирую странные штуки и живу среди собственных картин, скетчей и случайных находок. это не витрина — это комната.",
  photos: [],
  roomZones: [
    { id: "zone-wall", key: "wall", label: "Стена", src: "" },
    { id: "zone-desk", key: "desk", label: "Стол", src: "" },
    { id: "zone-floor", key: "floor", label: "Пол", src: "" },
    { id: "zone-paintings", key: "paintings", label: "Картины", src: "" }
  ]
};

async function ensureDataFile(filePath: string, fallback: string): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fallback, "utf-8");
  }
}

function stripLegacyCreatedAt<T extends Record<string, unknown>>(item: T): T {
  const { createdAt: _legacy, ...rest } = item;
  return rest as T;
}

export async function getProjects(): Promise<Project[]> {
  await ensureDataFile(projectsPath, "[]");
  const raw = await fs.readFile(projectsPath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) =>
    item && typeof item === "object" ? stripLegacyCreatedAt(item as Record<string, unknown>) : item
  ) as Project[];
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await ensureDataFile(projectsPath, "[]");
  const cleaned = projects.map((p) => stripLegacyCreatedAt({ ...p } as Record<string, unknown>));
  await fs.writeFile(projectsPath, JSON.stringify(cleaned, null, 2), "utf-8");
}

export async function getAbout(): Promise<AboutData> {
  await ensureDataFile(aboutPath, JSON.stringify(defaultAbout, null, 2));
  const raw = await fs.readFile(aboutPath, "utf-8");
  return JSON.parse(raw) as AboutData;
}

export async function saveAbout(about: AboutData): Promise<void> {
  await ensureDataFile(aboutPath, JSON.stringify(defaultAbout, null, 2));
  await fs.writeFile(aboutPath, JSON.stringify(about, null, 2), "utf-8");
}

export type LoaderData = {
  version?: number;
  size?: number;
  background?: string;
  strokes?: Array<{
    id?: string;
    color?: string;
    width?: number;
    points: Array<{ x: number; y: number; t?: number }>;
  }>;
};

const defaultLoader: LoaderData = {
  version: 1,
  size: 400,
  background: "#ffffff",
  strokes: []
};

export async function getLoader(): Promise<LoaderData> {
  await ensureDataFile(loaderPath, JSON.stringify(defaultLoader, null, 2));
  const raw = (await fs.readFile(loaderPath, "utf-8")).replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw) as LoaderData;
  return {
    ...defaultLoader,
    ...parsed,
    strokes: Array.isArray(parsed?.strokes) ? parsed.strokes : []
  };
}
