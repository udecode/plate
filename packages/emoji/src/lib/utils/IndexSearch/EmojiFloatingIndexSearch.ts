import type { IEmojiLibrary } from '../EmojiLibrary';

import { AIndexSearch } from './IndexSearch';

export class EmojiFloatingIndexSearch extends AIndexSearch {
  protected library: IEmojiLibrary;

  private constructor(library: IEmojiLibrary) {
    super(library);
    this.library = library;
  }

  static getInstance(library: IEmojiLibrary) {
    return new EmojiFloatingIndexSearch(library);
  }
}
