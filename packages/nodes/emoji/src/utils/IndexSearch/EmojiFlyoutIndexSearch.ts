import { Emoji, IEmojiLibrary } from './EmojiLibrary';
import { AIndexSearch } from './IndexSearch';

export class EmojiFlyoutIndexSearch extends AIndexSearch<Emoji> {
  protected static instance?: EmojiFlyoutIndexSearch;

  private constructor(protected library: IEmojiLibrary) {
    super(library);
  }

  public static getInstance(library: IEmojiLibrary) {
    if (!EmojiFlyoutIndexSearch.instance) {
      EmojiFlyoutIndexSearch.instance = new EmojiFlyoutIndexSearch(library);
    }

    return EmojiFlyoutIndexSearch.instance;
  }

  protected transform(emoji: Emoji) {
    return emoji;
  }
}
