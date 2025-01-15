import type { EmojiMartData } from '@emoji-mart/data';

import type { IEmojiLibrary } from '../EmojiLibrary';

import { EmojiInlineLibrary } from '../EmojiLibrary/EmojiInlineLibrary';
import { AIndexSearch } from './IndexSearch';

export class EmojiInlineIndexSearch extends AIndexSearch {
  protected static instance?: EmojiInlineIndexSearch;

  private constructor(protected library: IEmojiLibrary) {
    super(library);
  }

  public static getInstance(data: EmojiMartData) {
    if (!EmojiInlineIndexSearch.instance) {
      EmojiInlineIndexSearch.instance = new EmojiInlineIndexSearch(
        new EmojiInlineLibrary(data)
      );
    }

    return EmojiInlineIndexSearch.instance;
  }
}
