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
  protected localStorage: IFrequentEmojiStorage;
  protected sections: EmojiCategoryList[];
  protected elements: GridElements;
  protected settings: EmojiSettingsType;

  constructor(
    localStorage: IFrequentEmojiStorage,
    sections: EmojiCategoryList[],
    elements: GridElements,
    settings: EmojiSettingsType
  ) {
    this.localStorage = localStorage;
    this.sections = sections;
    this.elements = elements;
    this.settings = settings;
  }

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

  build() {
    if (this.elements.frequent) {
      this.addFrequent();
    }

    this.sections.forEach((id) => {
      if (this.elements[id]?.length) {
        this.grid.addSection(
          id,
          new EmojiGridSectionWithRoot(id, this.settings.perLine.value),
          this.elements
        );
      }
    });

    return this.grid;
  }
}
