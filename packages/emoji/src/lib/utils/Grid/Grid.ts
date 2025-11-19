import type {
  GridElements,
  IGrid,
  IGridSection,
  SectionElements,
  SectionId,
} from './Grid.types';

export class Grid<R, T extends SectionId = SectionId> implements IGrid<R, T> {
  protected grid = new Map<T, IGridSection<R, T>>();
  protected rowsCount = 1;
  protected sectionsIds: T[] = [];

  addSection(
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

  indexOf(sectionId: T) {
    return this.sectionsIds.indexOf(sectionId);
  }

  section(sectionId: T) {
    return this.grid.get(sectionId)!;
  }

  sections() {
    return Array.from(this.grid.values());
  }

  updateSection(sectionId: T, elements: SectionElements) {
    if (this.grid.has(sectionId)) {
      const section = this.grid.get(sectionId);
      section!.updateElements(elements);
    }

    return this;
  }

  get size() {
    return this.grid.size;
  }
}
