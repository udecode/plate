import { AIndexSearch } from './IndexSearch';
import { Emoji } from './types';

export class EmojiIndexSearch extends AIndexSearch {
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
