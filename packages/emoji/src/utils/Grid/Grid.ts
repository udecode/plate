import {
  GridElements,
  IGrid,
  IGridSection,
  SectionElements,
  SectionId,
} from './Grid.types';

export class Grid<R, T extends SectionId = SectionId> implements IGrid<R, T> {
  protected rowsCount = 1;
  protected sectionsIds: T[] = [];
  protected grid = new Map<T, IGridSection<R, T>>();

  public addSection(
    sectionId: T,
    section: IGridSection<R, T>,
    elements: GridElements
  ) {
    section.setIndexRowStart(this.rowsCount).addElements(elements[sectionId]);
    this.rowsCount += section.rowsNum;
    this.grid.set(sectionId, section);
    this.sectionsIds.push(sectionId);
    return this;
  }

  public get size() {
    return this.grid.size;
  }

  public indexOf(sectionId: T) {
    return this.sectionsIds.indexOf(sectionId);
  }

  public sections() {
    return Array.from(this.grid.values());
  }

  public section(sectionId: T) {
    return this.grid.get(sectionId)!;
  }

  public updateSection(sectionId: T, elements: SectionElements) {
    if (this.grid.has(sectionId)) {
      const section = this.grid.get(sectionId);
      section!.updateElements(elements);
    }

    return this;
  }
}
