import { EmojiCategoryList, EmojiSettingsType } from '../../types';
import { GridElements } from '../Grid/index';
import {
  EmojiFloatingGrid,
  EmojiGridSectionWithRoot,
} from './EmojiFloatingGrid';
import { IFrequentEmojiStorage } from './EmojiFloatingLibrary.types';

export class EmojiFloatingGridBuilder {
  protected grid = new EmojiFloatingGrid();

  constructor(
    protected localStorage: IFrequentEmojiStorage,
    protected sections: EmojiCategoryList[],
    protected elements: GridElements,
    protected settings: EmojiSettingsType
  ) {}

  private addFrequent() {
    if (this.settings.showFrequent.value) {
      const id = 'frequent';
      this.grid.addSection(
        id,
        new EmojiGridSectionWithRoot(id, this.settings.perLine.value),
        {
          [id]: this.localStorage.getList(),
        }
      );
    }
  }

  public build() {
    this.addFrequent();

    this.sections.forEach((id) => {
      this.grid.addSection(
        id,
        new EmojiGridSectionWithRoot(id, this.settings.perLine.value),
        this.elements
      );
    });

    return this.grid;
  }
}
