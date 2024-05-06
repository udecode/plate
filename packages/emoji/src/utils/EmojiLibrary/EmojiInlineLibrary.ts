import emojiMartData from '@emoji-mart/data' with { type: 'json' };

import type {
  Emoji,
  EmojiLibrary,
  Emojis,
  IEmojiLibrary,
} from './EmojiLibrary.types';

export type THash = Record<string, string>;

export class EmojiInlineLibrary implements IEmojiLibrary {
  protected _emojis: Emojis;
  protected _hash: THash = {};
  protected _keys: string[] = [];

  constructor(library: EmojiLibrary = emojiMartData as any) {
    this._emojis = library.emojis;
    this.init();
  }

  private createSearchableString(emoji: Emoji) {
    const { id, keywords, name } = emoji;

    return `${id},${this.getName(name)},${keywords.join(',')}`;
  }

  private getName(name: string) {
    return name.toLowerCase().split(' ').join(',');
  }

  private init() {
    Object.values(this._emojis).forEach((emoji) => {
      const searchableString = this.createSearchableString(emoji);
      this._keys.push(searchableString);
      this._hash[searchableString] = emoji.id;
    });
  }

  getEmoji(id: string) {
    return this._emojis[id];
  }

  getEmojiId(key: string) {
    return this._hash[key];
  }

  get keys(): string[] {
    return this._keys;
  }
}
