import emojiMartData from '@emoji-mart/data';
import { EmojiCategoryList, EmojiSettingsType } from '../../types';
import { EmojiFloatingGrid } from './EmojiFloatingGrid';
import { EmojiFloatingGridType } from './EmojiFloatingGrid.types';
import {
  IEmojiFloatingLibrary,
  IFrequentEmojiStorage,
} from './EmojiFloatingLibrary.types';
import { EmojiInlineLibrary } from './EmojiInlineLibrary';
import { EmojiLibrary } from './EmojiLibrary.types';

export class EmojiFloatingLibrary
  extends EmojiInlineLibrary
  implements IEmojiFloatingLibrary {
  private static instance?: EmojiFloatingLibrary;

  private categories: EmojiCategoryList[] = [];
  private emojis: Partial<Record<EmojiCategoryList, string[]>> = {};
  private grid: EmojiFloatingGridType;

  private constructor(
    protected settings: EmojiSettingsType,
    protected localStorage: IFrequentEmojiStorage,
    protected library: EmojiLibrary = emojiMartData
  ) {
    super(library);

    if (settings.showFrequent.value) {
      this.addFrequentCategory();
    }
    this.initCategories(library.categories);
    this.grid = new EmojiFloatingGrid(
      this.categories,
      this.emojis,
      settings.perLine.value
    );
  }

  public static getInstance(
    settings: EmojiSettingsType,
    localStorage: IFrequentEmojiStorage,
    library: EmojiLibrary = emojiMartData
  ) {
    if (!EmojiFloatingLibrary.instance) {
      EmojiFloatingLibrary.instance = new EmojiFloatingLibrary(
        settings,
        localStorage,
        library
      );
    }

    return EmojiFloatingLibrary.instance;
  }

  private addFrequentCategory() {
    this.categories.push('frequent');
    this.emojis.frequent = this.localStorage.getList();
  }

  private initCategories(categoriesLibrary: any) {
    for (const category of categoriesLibrary) {
      this.categories.push(category.id);
      this.emojis[category.id] = category.emojis;
    }
  }

  public updateFrequentCategory(emojiId: string) {
    this.localStorage.update(emojiId);
    this.grid.addSection('frequent', this.localStorage.getList());
  }

  public getCategories() {
    return this.categories;
  }

  public getGrid() {
    return this.grid;
  }
}
