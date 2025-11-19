import type { EmojiFloatingGridType } from './EmojiFloatingGrid';
import type {
  IEmojiFloatingLibrary,
  IFrequentEmojiStorage,
} from './EmojiFloatingLibrary.types';

import {
  type EmojiCategoryList,
  type EmojiLibrary,
  type EmojiSettingsType,
  DEFAULT_EMOJI_LIBRARY,
  defaultCategories,
  EmojiCategory,
  EmojiInlineLibrary,
} from '../../../lib';
import { EmojiFloatingGridBuilder } from './EmojiFloatingGridBuilder';

export class EmojiFloatingLibrary
  extends EmojiInlineLibrary
  implements IEmojiFloatingLibrary
{
  private static instance?: EmojiFloatingLibrary;

  private readonly categories: EmojiCategoryList[] = defaultCategories;
  private readonly emojis: Partial<Record<EmojiCategoryList, string[]>> = {};
  private readonly grid: EmojiFloatingGridType;
  protected settings: EmojiSettingsType;
  protected localStorage: IFrequentEmojiStorage;
  protected library: EmojiLibrary;

  private constructor(
    settings: EmojiSettingsType,
    localStorage: IFrequentEmojiStorage,
    library: EmojiLibrary = DEFAULT_EMOJI_LIBRARY
  ) {
    super(library);

    this.settings = settings;
    this.localStorage = localStorage;
    this.library = library;

    this.categories = settings.categories.value ?? this.categories;

    this.initEmojis(library.categories);

    this.grid = new EmojiFloatingGridBuilder(
      this.localStorage,
      this.categories,
      this.emojis,
      settings
    ).build();
  }

  static getInstance(
    settings: EmojiSettingsType,
    localStorage: IFrequentEmojiStorage,
    library = DEFAULT_EMOJI_LIBRARY
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

  getGrid() {
    return this.grid;
  }

  indexOf(focusedCategory: EmojiCategoryList) {
    const index = this.grid.indexOf(focusedCategory);

    return index < 1 ? 0 : index;
  }

  updateFrequentCategory(emojiId: string) {
    this.localStorage.update(emojiId);
    this.grid.updateSection(
      EmojiCategory.Frequent,
      this.localStorage.getList()
    );
  }
}
