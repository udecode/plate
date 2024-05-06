/**
 * Emoji: type Emoji = { id: string; name: string; keywords: string[]; skins: [
 * { unified: '1f389'; native: '🎉'; shortcodes: ':tada:'; } ]; version: 1; };
 */

type Skin = {
  native: string;
  unified: string;
};

export type Emoji = {
  id: string;
  keywords: string[];
  name: string;
  skins: Skin[];
  version: number;
};

export type Emojis = Record<string, Emoji>;

export type EmojiLibrary = {
  aliases: any;
  categories: any[];
  emojis: Emojis;
  sheet: any;
};

export interface IEmojiLibrary {
  getEmoji: (key: string) => Emoji;
  getEmojiId: (key: string) => string;
  keys: string[];
}
