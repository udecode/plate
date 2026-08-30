export type GridElements<S extends SectionId = SectionId> = Partial<
  Record<S, string[]>
>;

export type GridRow = {
  elements: string[];
  id: number;
};

export type GridRows = GridRow[];
export type SectionElements = string[];
export type SectionId = string;

export interface IGrid<R, T extends SectionId> {
  size: number;
  addSection: (
    sectionId: T,
    section: IGridSection<R, T>,
    elements: GridElements<T>
  ) => this;
  indexOf: (sectionId: T) => number;
  section: (sectionId: T) => IGridSection<R, T> | undefined;
  sections: () => Array<IGridSection<R, T>>;
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

export abstract class AGridSection<R, T = SectionId> implements IGridSection<
  R,
  T
> {
  protected _id: T;
  protected _indexRowStart = 0;
  protected _root!: R;
  protected _rowsNum = 0;
  protected perLine: number;
  protected rows: GridRows = [];

  constructor(id: T, perLine = 8) {
    this._id = id;
    this.perLine = perLine;
    this.createRootRef();
  }

  protected abstract createRootRef(): void;

  addElements(elements: SectionElements) {
    this._rowsNum = Math.ceil(elements.length / this.perLine);

    for (let index = 0; index < this.rowsNum; index++) {
      const start = index * this.perLine;

      this.rows.push({
        elements: elements.slice(start, start + this.perLine),
        id: this._indexRowStart + index,
      });
    }

    return this;
  }

  getRows() {
    return this.rows;
  }

  setIndexRowStart(start: number) {
    this._indexRowStart = start;

    return this;
  }

  updateElements(elements: SectionElements) {
    this.rows = [];

    return this.addElements(elements);
  }

  get id() {
    return this._id;
  }

  get root(): R {
    return this._root;
  }

  get rowsNum() {
    return this._rowsNum;
  }
}

export class Grid<R, T extends SectionId = SectionId> implements IGrid<R, T> {
  protected grid = new Map<T, IGridSection<R, T>>();
  protected rowsCount = 1;
  protected sectionsIds: T[] = [];

  addSection(
    sectionId: T,
    section: IGridSection<R, T>,
    elements: GridElements<T>
  ) {
    section
      .setIndexRowStart(this.rowsCount)
      .addElements(elements[sectionId] ?? []);
    this.rowsCount += section.rowsNum;
    this.grid.set(sectionId, section);
    this.sectionsIds.push(sectionId);

    return this;
  }

  indexOf(sectionId: T) {
    return this.sectionsIds.indexOf(sectionId);
  }

  section(sectionId: T) {
    return this.grid.get(sectionId);
  }

  sections() {
    return Array.from(this.grid.values());
  }

  updateSection(sectionId: T, elements: SectionElements) {
    this.grid.get(sectionId)?.updateElements(elements);

    return this;
  }

  get size() {
    return this.grid.size;
  }
}
