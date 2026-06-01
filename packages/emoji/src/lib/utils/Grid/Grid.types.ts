export type GridElements<S extends SectionId = SectionId> = Record<S, string[]>;

export type GridRow = {
  id: number;
  elements: string[];
};

export type GridRows = GridRow[];

export interface IGrid<R, T extends SectionId> {
  size: number;
  addSection: (
    sectionId: T,
    section: IGridSection<R, T>,
    elements: GridElements
  ) => this;
  indexOf: (sectionId: T) => number;
  section: (sectionId: T) => IGridSection<R, T>;
  sections: () => IGridSection<R, T>[];
  updateSection: (sectionId: T, elements: SectionElements) => this;
}

export interface IGridSection<R, T> {
  id: T;
  root: R;
  rowsNum: number;
  addElements: (elements: SectionElements) => this;
  getRows: () => GridRows;
  setIndexRowStart: (start: number) => this;
  updateElements: (elements: SectionElements) => this;
}

export type SectionElements = string[];

export type SectionId = string;

export type Unknown = unknown;
