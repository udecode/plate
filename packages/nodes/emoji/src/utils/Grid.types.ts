export type Unknown = unknown;

export type GridRow = {
  id: number;
  elements: string[];
};

export type GridRows = GridRow[];

export type GridSection<R> = {
  root: R;
  rows: GridRows;
};

export type SectionId = string;

export type GridElements<T extends SectionId = SectionId> = Record<T, string[]>;

export interface IGrid<R extends Unknown, T extends SectionId> {
  values: () => IterableIterator<GridSection<R>>;
  section: (sectionId: T) => GridSection<R>;
  addSection: (sectionId: T, elements: string[], index?: number) => GridRows;
  createRootRef: () => R;
}
