import emojiMartData from '@emoji-mart/data' with { type: 'json' };

import type { EmojiFloatingGridType } from './EmojiFloatingGrid';
import type {
  IEmojiFloatingLibrary,
  IFrequentEmojiStorage,
} from './EmojiFloatingLibrary.types';

import {
  EmojiCategory,
  type EmojiCategoryList,
  EmojiInlineLibrary,
  type EmojiLibrary,
  type EmojiSettingsType,
  defaultCategories,
} from '../../../lib';
import { EmojiFloatingGridBuilder } from './EmojiFloatingGridBuilder';

export class EmojiFloatingLibrary
  extends EmojiInlineLibrary
  implements IEmojiFloatingLibrary
{
  private categories: EmojiCategoryList[] = defaultCategories;

  private emojis: Partial<Record<EmojiCategoryList, string[]>> = {};
  private grid: EmojiFloatingGridType;
  private static instance?: EmojiFloatingLibrary;

  private constructor(
    protected settings: EmojiSettingsType,
    protected localStorage: IFrequentEmojiStorage,
    protected library: EmojiLibrary = emojiMartData as any
  ) {
    super(library);

    this.categories = settings.categories.value ?? this.categories;

    this.initEmojis(library.categories);

    this.grid = new EmojiFloatingGridBuilder(
      this.localStorage,
      this.categories,
      this.emojis,
      settings
    ).build();
  }

  public static getInstance(
    settings: EmojiSettingsType,
    localStorage: IFrequentEmojiStorage,
    library: EmojiLibrary = emojiMartData as any
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

  private initEmojis(categoriesLibrary: any) {
    for (const category of categoriesLibrary) {
      (this.emojis as any)[category.id] = category.emojis;
    }
  }

  public getGrid() {
    return this.grid;
  }

  public indexOf(focusedCategory: EmojiCategoryList) {
    const index = this.grid.indexOf(focusedCategory);

    return index < 1 ? 0 : index;
  }

  public updateFrequentCategory(emojiId: string) {
    this.localStorage.update(emojiId);
    this.grid.updateSection(
      EmojiCategory.Frequent,
      this.localStorage.getList()
    );
  }
}
