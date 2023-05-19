import emojiMartData from '@emoji-mart/data';
import { defaultCategories } from '../../constants';
import {
  EmojiCategory,
  EmojiCategoryList,
  EmojiSettingsType,
} from '../../types';
import { EmojiFloatingGridType } from './EmojiFloatingGrid';
import { EmojiFloatingGridBuilder } from './EmojiFloatingGridBuilder';
import {
  IEmojiFloatingLibrary,
  IFrequentEmojiStorage,
} from './EmojiFloatingLibrary.types';
import { EmojiInlineLibrary } from './EmojiInlineLibrary';
import { EmojiLibrary } from './EmojiLibrary.types';

export class EmojiFloatingLibrary
  extends EmojiInlineLibrary
  implements IEmojiFloatingLibrary
{
  private static instance?: EmojiFloatingLibrary;

  private categories: EmojiCategoryList[] = defaultCategories;
  private emojis: Partial<Record<EmojiCategoryList, string[]>> = {};
  private grid: EmojiFloatingGridType;

  private constructor(
    protected settings: EmojiSettingsType,
    protected localStorage: IFrequentEmojiStorage,
    protected library: EmojiLibrary = emojiMartData
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

  private initEmojis(categoriesLibrary: any) {
    for (const category of categoriesLibrary) {
      this.emojis[category.id] = category.emojis;
    }
  }

  public updateFrequentCategory(emojiId: string) {
    this.localStorage.update(emojiId);
    this.grid.updateSection(
      EmojiCategory.Frequent,
      this.localStorage.getList()
    );
  }

  public getGrid() {
    return this.grid;
  }

  public indexOf(focusedCategory: EmojiCategoryList) {
    const index = this.grid.indexOf(focusedCategory);
    return index < 1 ? 0 : index;
  }
}
