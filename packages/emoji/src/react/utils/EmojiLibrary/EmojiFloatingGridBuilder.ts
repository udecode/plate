import type {
  EmojiCategoryList,
  EmojiSettingsType,
  GridElements,
} from '../../../lib';
import type { IFrequentEmojiStorage } from './EmojiFloatingLibrary.types';

import {
  EmojiFloatingGrid,
  EmojiGridSectionWithRoot,
} from './EmojiFloatingGrid';

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
