import type { EmojiMartData } from '@emoji-mart/data';

import type { IEmojiLibrary } from '../EmojiLibrary';

import { DEFAULT_EMOJI_LIBRARY } from '../../constants';
import { EmojiInlineLibrary } from '../EmojiLibrary/EmojiInlineLibrary';
import { AIndexSearch } from './IndexSearch';

export class EmojiInlineIndexSearch extends AIndexSearch {
  protected static instance?: EmojiInlineIndexSearch;
  protected library: IEmojiLibrary;

  private constructor(library: IEmojiLibrary) {
    super(library);
    this.library = library;
  }

  static getInstance(data: EmojiMartData = DEFAULT_EMOJI_LIBRARY) {
    if (!EmojiInlineIndexSearch.instance) {
      EmojiInlineIndexSearch.instance = new EmojiInlineIndexSearch(
        new EmojiInlineLibrary(data)
      );
    }

    return EmojiInlineIndexSearch.instance;
  }
}
