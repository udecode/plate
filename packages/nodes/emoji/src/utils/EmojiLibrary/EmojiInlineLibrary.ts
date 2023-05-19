import emojiMartData from '@emoji-mart/data';
import {
  Emoji,
  EmojiLibrary,
  Emojis,
  IEmojiLibrary,
} from './EmojiLibrary.types';

export type THash = Record<string, string>;

export class EmojiInlineLibrary implements IEmojiLibrary {
  protected _hash: THash = {};
  protected _keys: string[] = [];
  protected _emojis: Emojis;

  constructor(library: EmojiLibrary = emojiMartData) {
    this._emojis = library.emojis;
    this.init();
  }

  private init() {
    Object.values(this._emojis).forEach((emoji) => {
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

  getEmoji(id: string) {
    return this._emojis[id];
  }

  getEmojiId(key: string) {
    return this._hash[key];
  }
}
