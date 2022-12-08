import emojiMartData from '@emoji-mart/data';
import { DEFAULT_FREQUENTLY_USED_EMOJI } from '../../constants';
import { EmojiCategoryList } from '../../types';
import { EmojiFlyoutGrid } from './EmojiFlyoutGrid';
import { IEmojiFlyoutLibrary } from './EmojiFlyoutLibrary.types';
import { EmojiInlineLibrary } from './EmojiInlineLibrary';
import { EmojiLibrary } from './EmojiLibrary.types';

export class EmojiFlyoutLibrary
  extends EmojiInlineLibrary
  implements IEmojiFlyoutLibrary {
  private static instance?: EmojiFlyoutLibrary;

  private categories: EmojiCategoryList[] = [];
  private emojis: Partial<Record<EmojiCategoryList, string[]>> = {};
  private _grid: EmojiFlyoutGrid;

  private constructor(library: EmojiLibrary = emojiMartData) {
    super(library);

    this.addFrequentCategory();
    this.initCategories(library.categories);
    this._grid = new EmojiFlyoutGrid(this.categories, this.emojis);
  }

  public static getInstance(library: EmojiLibrary = emojiMartData) {
    if (!EmojiFlyoutLibrary.instance) {
      EmojiFlyoutLibrary.instance = new EmojiFlyoutLibrary(library);
    }

    return EmojiFlyoutLibrary.instance;
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
