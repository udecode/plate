import {
  GridElements,
  GridRows,
  GridSection,
  IGrid,
  SectionId,
} from './Grid.types';

export abstract class AGrid<R, T extends SectionId> implements IGrid<R, T> {
  protected grid = new Map<T, GridSection<R>>();

  constructor(sections: T[], elements: GridElements, protected perLine = 8) {
    this.init(sections, elements);
  }

  private init(sections: T[], elements: GridElements) {
    let rowsCount = 0;
    sections.forEach((id) => {
      const rows = this.addSection(id, elements[id], rowsCount);
      rowsCount += rows.length;
    });
  }

  public abstract createRootRef(): R;

  public addSection(sectionId: T, elements: string[], index = 0) {
    const rows = this.addRows(elements, index);
    this.grid.set(sectionId, { root: this.createRootRef(), rows });
    return rows;
  }

  private addRows(elements: string[], index: number) {
    const rows: GridRows = [];
    let loop = Math.floor(elements.length / this.perLine);
    if (elements.length % this.perLine !== 0) {
      loop++;
    }

    let i = 0;
    while (i < loop) {
      this.addRow(rows, elements, i, index + ++i);
    }

    return rows;
  }

  private addRow(
    rows: GridRows,
    elements: string[],
    lastPosition: number,
    rowIndex: number
  ) {
    const start = lastPosition * this.perLine;
    const end = start + this.perLine;
    rows.push({
      elements: elements.slice(start, end),
      id: rowIndex,
    });
  }

  public values() {
    return this.grid.values();
  }

  public section(sectionId: T) {
    return this.grid.get(sectionId)!;
  }
}
