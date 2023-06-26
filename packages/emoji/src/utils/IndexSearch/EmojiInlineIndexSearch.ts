import {
  Emoji,
  EmojiInlineLibrary,
  IEmojiLibrary,
} from '../EmojiLibrary/index';
import { AIndexSearch } from './IndexSearch';

export class EmojiInlineIndexSearch extends AIndexSearch {
  protected static instance?: EmojiInlineIndexSearch;

  private constructor(protected library: IEmojiLibrary) {
    super(library);
  }

  public static getInstance() {
    if (!EmojiInlineIndexSearch.instance) {
      EmojiInlineIndexSearch.instance = new EmojiInlineIndexSearch(
        new EmojiInlineLibrary()
      );
    }

    return EmojiInlineIndexSearch.instance;
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
