import { EmojiInlineLibrary, type IEmojiLibrary } from '../EmojiLibrary/index';
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
}
