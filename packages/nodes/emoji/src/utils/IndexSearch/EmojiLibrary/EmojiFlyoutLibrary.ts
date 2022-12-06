import emojiMartData from '@emoji-mart/data';
import { DEFAULT_FREQUENTLY_USED_EMOJI } from '../../../constants';
import { EmojiInlineLibrary } from './EmojiInlineLibrary';
import {
  EmojiCategories,
  EmojiLibrary,
  IEmojiLibrary,
} from './EmojiLibrary.types';

export interface IEmojiFlyoutLibrary extends IEmojiLibrary {
  getCategories: () => EmojiCategories;
}

export class EmojiFlyoutLibrary
  extends EmojiInlineLibrary
  implements IEmojiFlyoutLibrary {
  protected static instance?: EmojiFlyoutLibrary;
  protected _categories: EmojiCategories;

  private constructor(library: EmojiLibrary = emojiMartData) {
    super(library);

    this._categories = library.categories;
    this.addFrequentCategory();
  }

  public static getInstance(library: EmojiLibrary = emojiMartData) {
    if (!EmojiFlyoutLibrary.instance) {
      EmojiFlyoutLibrary.instance = new EmojiFlyoutLibrary(library);
    }

    return EmojiFlyoutLibrary.instance;
  }

  private addFrequentCategory() {
    this._categories.unshift({
      id: 'frequent',
      emojis: DEFAULT_FREQUENTLY_USED_EMOJI,
    });
  }

  getCategories() {
    return this._categories;
  }
}
