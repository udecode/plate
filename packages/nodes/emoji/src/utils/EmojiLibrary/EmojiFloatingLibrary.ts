import emojiMartData from '@emoji-mart/data';
import { DEFAULT_FREQUENTLY_USED_EMOJI } from '../../constants';
import { EmojiCategoryList } from '../../types';
import { EmojiFloatingGrid } from './EmojiFloatingGrid';
import { IEmojiFloatingLibrary } from './EmojiFloatingLibrary.types';
import { EmojiInlineLibrary } from './EmojiInlineLibrary';
import { EmojiLibrary } from './EmojiLibrary.types';

export class EmojiFloatingLibrary
  extends EmojiInlineLibrary
  implements IEmojiFloatingLibrary {
  private static instance?: EmojiFloatingLibrary;

  private categories: EmojiCategoryList[] = [];
  private emojis: Partial<Record<EmojiCategoryList, string[]>> = {};
  private _grid: EmojiFloatingGrid;

  private constructor(library: EmojiLibrary = emojiMartData) {
    super(library);

    this.addFrequentCategory();
    this.initCategories(library.categories);
    this._grid = new EmojiFloatingGrid(this.categories, this.emojis);
    // this._grid.setPerLine();
  }

  public static getInstance(library: EmojiLibrary = emojiMartData) {
    if (!EmojiFloatingLibrary.instance) {
      EmojiFloatingLibrary.instance = new EmojiFloatingLibrary(library);
    }

    return EmojiFloatingLibrary.instance;
  }

  private addFrequentCategory() {
    this.categories.push('frequent');
    this.emojis.frequent = DEFAULT_FREQUENTLY_USED_EMOJI;
  }

  private initCategories(categoriesLibrary: any) {
    for (const category of categoriesLibrary) {
      this.categories.push(category.id);
      this.emojis[category.id] = category.emojis;
    }
  }

  public getCategories() {
    return this.categories;
  }

  public getGrid() {
    return this._grid;
  }
}
