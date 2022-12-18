export type Unknown = unknown;

export type GridRow = {
  id: number;
  elements: string[];
};

export type GridRows = GridRow[];

export type SectionId = string;
export type SectionElements = string[];
export interface IGridSection<R, T> {
  setIndexRowStart: (start: number) => this;
  getRows: () => GridRows;
  addElements: (elements: SectionElements) => this;
  updateElements: (elements: SectionElements) => this;
  id: T;
  rowsNum: number;
  root: R;
}

export type GridElements<S extends SectionId = SectionId> = Record<S, string[]>;
export interface IGrid<R, T extends SectionId> {
  updateSection: (sectionId: T, elements: SectionElements) => this;
  addSection: (
    sectionId: T,
    section: IGridSection<R, T>,
    elements: GridElements
  ) => this;
  sections: () => IGridSection<R, T>[];
  section: (sectionId: T) => IGridSection<R, T>;
  indexOf: (sectionId: T) => number;
  size: number;
}
