import type { Emoji, IEmojiLibrary } from '../EmojiLibrary/index';

import { AIndexSearch } from './IndexSearch';

export class EmojiFloatingIndexSearch extends AIndexSearch<Emoji> {
  protected static instance?: EmojiFloatingIndexSearch;

  private constructor(protected library: IEmojiLibrary) {
    super(library);
  }

  public static getInstance(library: IEmojiLibrary) {
    if (!EmojiFloatingIndexSearch.instance) {
      EmojiFloatingIndexSearch.instance = new EmojiFloatingIndexSearch(library);
    }

    return EmojiFloatingIndexSearch.instance;
  }

  protected transform(emoji: Emoji) {
    return emoji;
  }
}
