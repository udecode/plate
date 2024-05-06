import type {
  GridRows,
  IGridSection,
  SectionElements,
  SectionId,
  Unknown,
} from './Grid.types';

export abstract class AGridSection<R extends Unknown, T = SectionId>
  implements IGridSection<R, T>
{
  protected _indexRowStart = 0;
  protected _root!: R;
  protected _rowsNum = 0;
  protected rows: GridRows = [];

  constructor(
    protected _id: T,
    protected perLine = 8
  ) {
    this.createRootRef();
  }

  private addRow(elements: SectionElements, lastPosition: number) {
    const start = lastPosition * this.perLine;
    const end = start + this.perLine;
    this.rows.push({
      elements: elements.slice(start, end),
      id: this._indexRowStart + lastPosition,
    });
  }

  private initRows(elements: SectionElements) {
    let i = 0;

    while (i < this.rowsNum) {
      this.addRow(elements, i++);
    }
  }

  public addElements(elements: SectionElements) {
    this._rowsNum = Math.ceil(elements.length / this.perLine);
    this.initRows(elements);

    return this;
  }

  getRows() {
    return this.rows;
  }

  public setIndexRowStart(start: number) {
    this._indexRowStart = start;

    return this;
  }

  public updateElements(elements: SectionElements) {
    this.rows = [];
    this.addElements(elements);

    return this;
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

  protected abstract createRootRef(): void;
}
