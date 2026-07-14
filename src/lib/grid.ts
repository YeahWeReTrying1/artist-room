import type { Project, ProjectGrid } from "@/lib/types";
import { sortProjectsForFeed } from "@/lib/projectOrder";

export const GRID_COLS = 7;
export const DEFAULT_ROW_SPAN = 2;
export const INTRO_COL = 5;
export const INTRO_COL_SPAN = 3;
export const INTRO_ROW_SPAN = 2;

export const INTRO_ZONE: ProjectGrid = {
  col: INTRO_COL,
  colSpan: INTRO_COL_SPAN,
  row: 1,
  rowSpan: INTRO_ROW_SPAN
};

export function clampGridValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeGrid(grid?: Partial<ProjectGrid> | null): ProjectGrid {
  const col = clampGridValue(grid?.col ?? 1, 1, GRID_COLS);
  const colSpan = clampGridValue(grid?.colSpan ?? GRID_COLS, 1, GRID_COLS - col + 1);
  const row = clampGridValue(grid?.row ?? 1, 1, 999);
  const rowSpan = clampGridValue(grid?.rowSpan ?? DEFAULT_ROW_SPAN, 1, 24);
  return { col, colSpan, row, rowSpan };
}

/** Дефолт: одна работа на полосу, на всю ширину, без параллельных рядов. */
export function buildStackedPlacements(projects: Project[]): Map<string, ProjectGrid> {
  const sorted = sortProjectsForFeed(projects);
  const map = new Map<string, ProjectGrid>();
  let maxCustomRow = INTRO_ROW_SPAN;

  for (const project of sorted) {
    if (!project.layoutCustomized || !project.grid) continue;
    const custom = normalizeGrid(project.grid);
    maxCustomRow = Math.max(maxCustomRow, custom.row + custom.rowSpan - 1);
  }

  let row = maxCustomRow + 1;
  for (const project of sorted) {
    if (project.layoutCustomized && project.grid) {
      map.set(project.id, normalizeGrid(project.grid));
      continue;
    }
    const rowSpan = project.grid?.rowSpan ?? DEFAULT_ROW_SPAN;
    map.set(project.id, {
      col: 1,
      colSpan: GRID_COLS,
      row,
      rowSpan
    });
    row += rowSpan;
  }

  return map;
}

export function resolveProjectGrid(project: Project, stacked: ProjectGrid): ProjectGrid {
  if (project.layoutCustomized && project.grid) {
    return normalizeGrid(project.grid);
  }
  return normalizeGrid({
    col: 1,
    colSpan: GRID_COLS,
    row: stacked.row,
    rowSpan: project.grid?.rowSpan ?? stacked.rowSpan
  });
}

export function gridStyle(grid: ProjectGrid): { gridColumn: string; gridRow: string } {
  return {
    gridColumn: `${grid.col} / span ${grid.colSpan}`,
    gridRow: `${grid.row} / span ${grid.rowSpan}`
  };
}

export function getGridRowCount(projects: Project[]): number {
  const stacked = buildStackedPlacements(projects);
  let maxRow = INTRO_ROW_SPAN;

  for (const project of projects) {
    const grid = resolveProjectGrid(project, stacked.get(project.id)!);
    maxRow = Math.max(maxRow, grid.row + grid.rowSpan - 1);
  }

  return maxRow;
}

export function gridsOverlap(a: ProjectGrid, b: ProjectGrid) {
  if (a.col + a.colSpan <= b.col) return false;
  if (b.col + b.colSpan <= a.col) return false;
  if (a.row + a.rowSpan <= b.row) return false;
  if (b.row + b.rowSpan <= a.row) return false;
  return true;
}

export function overlapsIntroZone(grid: ProjectGrid) {
  return gridsOverlap(grid, INTRO_ZONE);
}

export function isIntroCell(col: number, row: number) {
  return (
    col >= INTRO_ZONE.col &&
    col < INTRO_ZONE.col + INTRO_ZONE.colSpan &&
    row >= INTRO_ZONE.row &&
    row < INTRO_ZONE.row + INTRO_ZONE.rowSpan
  );
}

export function isGridValid(grid: ProjectGrid) {
  return grid.col >= 1 && grid.col + grid.colSpan - 1 <= GRID_COLS && grid.row >= 1 && grid.rowSpan >= 1;
}

/** После удаления: проекты ниже поднимаются на высоту удалённого (rowSpan). */
export function shiftProjectsUpAfterRemoval(
  projects: Project[],
  removed: Project,
  allProjectsBeforeRemoval: Project[]
): Project[] {
  const stacked = buildStackedPlacements(allProjectsBeforeRemoval);
  const removedGrid = resolveProjectGrid(removed, stacked.get(removed.id)!);
  const shiftFromRow = removedGrid.row + removedGrid.rowSpan;
  const delta = removedGrid.rowSpan;
  const minRow = INTRO_ROW_SPAN + 1;

  return projects.map((project) => {
    if (!project.layoutCustomized || !project.grid) return project;
    const grid = normalizeGrid(project.grid);
    if (grid.row < shiftFromRow) return project;
    return {
      ...project,
      grid: {
        ...grid,
        row: Math.max(minRow, grid.row - delta)
      }
    };
  });
}
