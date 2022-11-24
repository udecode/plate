import { AIndexSearch } from './IndexSearch';
import { Emoji } from './types';

export class EmojiIndexSearch extends AIndexSearch {
  protected static instance?: EmojiIndexSearch;

  private constructor() {
    super();
  }

  public static getInstance() {
    if (!EmojiIndexSearch.instance) {
      EmojiIndexSearch.instance = new EmojiIndexSearch();
    }

    return EmojiIndexSearch.instance;
  }

  protected transform(emoji: Emoji) {
    const { id, name, skins } = emoji;

    return {
      key: id,
      text: name,
      data: {
        id,
        emoji: skins[0].native,
        name,
        text: name,
      },
    };
  }
}
