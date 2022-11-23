import { Emoji, EmojiLibrary, Emojis } from './types';

type THash = Record<string, string>;

export interface IPrepareData {
  keys: string[];
  hash: THash;
  emojis: Emojis;
}

export class PrepareData implements IPrepareData {
  protected _hash: THash = {};
  protected _keys: string[] = [];
  protected _emojis: Emojis;

  constructor(library: EmojiLibrary) {
    this._emojis = library.emojis;
    this.init();
  }

  private init() {
    Object.values(this.emojis).forEach((emoji) => {
      const searchableString = this.createSearchableString(emoji);
      this._keys.push(searchableString);
      this._hash[searchableString] = emoji.id;
    });
  }

  private createSearchableString(emoji: Emoji) {
    const { id, name, keywords } = emoji;
    return `${id},${this.getName(name)},${keywords.join(',')}`;
  }

  private getName(name: string) {
    return name.toLowerCase().split(' ').join(',');
  }

  get keys(): string[] {
    return this._keys;
  }

  get hash(): THash {
    return this._hash;
  }

  get emojis(): Emojis {
    return this._emojis;
  }
}
