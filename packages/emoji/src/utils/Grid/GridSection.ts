import {
  GridRows,
  IGridSection,
  SectionElements,
  SectionId,
  Unknown,
} from './Grid.types';

export abstract class AGridSection<R extends Unknown, T = SectionId>
  implements IGridSection<R, T>
{
  protected rows: GridRows = [];
  protected _root!: R;
  protected _rowsNum = 0;
  protected _indexRowStart = 0;

  constructor(protected _id: T, protected perLine = 8) {
    this.createRootRef();
  }

  protected abstract createRootRef(): void;

  public setIndexRowStart(start: number) {
    this._indexRowStart = start;
    return this;
  }

  public addElements(elements: SectionElements) {
    this._rowsNum = Math.ceil(elements.length / this.perLine);
    this.initRows(elements);

    return this;
  }

  public updateElements(elements: SectionElements) {
    this.rows = [];
    this.addElements(elements);
    return this;
  }

  private initRows(elements: SectionElements) {
    let i = 0;
    while (i < this.rowsNum) {
      this.addRow(elements, i++);
    }
  }

  private addRow(elements: SectionElements, lastPosition: number) {
    const start = lastPosition * this.perLine;
    const end = start + this.perLine;
    this.rows.push({
      elements: elements.slice(start, end),
      id: this._indexRowStart + lastPosition,
    });
  }

  get rowsNum() {
    return this._rowsNum;
  }

  get id() {
    return this._id;
  }

  get root(): R {
    return this._root;
  }

  getRows() {
    return this.rows;
  }
}
