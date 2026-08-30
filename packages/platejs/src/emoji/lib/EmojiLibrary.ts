import type { Emoji, EmojiMartData } from '@emoji-mart/data';

export const DEFAULT_EMOJI_LIBRARY: EmojiMartData = {
  aliases: {},
  categories: [
    {
      id: 'people',
      emojis: ['+1'],
    },
  ],
  emojis: {
    '+1': {
      id: '+1',
      keywords: [],
      name: 'Thumbs Up',
      skins: [
        {
          native: '👍',
          unified: '1f44d',
        },
        {
          native: '👍🏻',
          unified: '1f44d-1f3fb',
        },
        {
          native: '👍🏼',
          unified: '1f44d-1f3fc',
        },
        {
          native: '👍🏽',
          unified: '1f44d-1f3fd',
        },
        {
          native: '👍🏾',
          unified: '1f44d-1f3fe',
        },
        {
          native: '👍🏿',
          unified: '1f44d-1f3ff',
        },
      ],
      version: 1,
    },
  },
  sheet: {
    cols: 1,
    rows: 1,
  },
};

export const EMOJI_MAX_SEARCH_RESULT = 60;

export type EmojiLibrary = EmojiMartData;
export type Emojis = Record<string, Emoji>;
export type THash = Record<string, string>;

export type IEmojiLibrary = {
  keys: string[];
  getEmoji: (key: string) => Emoji | undefined;
  getEmojiId: (key: string) => string | undefined;
};

export class EmojiInlineLibrary implements IEmojiLibrary {
  protected _emojis: Emojis;
  protected _hash: THash = {};
  protected _keys: string[] = [];

  constructor(library: EmojiLibrary = DEFAULT_EMOJI_LIBRARY) {
    this._emojis = library.emojis;

    for (const emoji of Object.values(this._emojis)) {
      const { id, keywords, name } = emoji;
      const key = `${id},${name.toLowerCase().split(' ').join(',')},${keywords.join(',')}`;

      this._keys.push(key);
      this._hash[key] = id;
    }
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

type IIndexSearch = {
  get: () => Emoji[];
  hasFound: () => boolean;
  search: (input: string) => IIndexSearch;
};

export abstract class AIndexSearch implements IIndexSearch {
  private readonly library: IEmojiLibrary;
  protected input: string | undefined;
  protected maxResult = EMOJI_MAX_SEARCH_RESULT;
  protected result: string[] = [];
  protected scores: Record<string, number> = {};

  protected constructor(library: IEmojiLibrary) {
    this.library = library;
  }

  private createSearchResult(value: string) {
    this.scores = {};
    this.result = [];

    for (const key of this.library.keys) {
      const score = key.indexOf(value);

      if (score === -1) continue;

      const emojiId = this.library.getEmojiId(key);

      if (!emojiId) continue;

      this.result.push(emojiId);
      this.scores[emojiId] ??= 0;
      this.scores[emojiId] += emojiId === value ? 0 : score + 1;
    }
  }

  private sortResultByScores() {
    this.result.sort((a, b) => {
      const aScore = this.scores[a] ?? 0;
      const bScore = this.scores[b] ?? 0;

      return aScore === bScore ? a.localeCompare(b) : aScore - bScore;
    });
  }

  get(): Emoji[] {
    const emojis: Emoji[] = [];

    for (const key of this.result) {
      const emoji = this.library.getEmoji(key);

      if (emoji) emojis.push(emoji);
      if (emojis.length >= this.maxResult) break;
    }

    return emojis;
  }

  getEmoji(): Emoji | undefined {
    return this.get()[0];
  }

  hasFound(exact = false) {
    if (exact && this.input) {
      return this.result.includes(this.input);
    }

    return this.result.length > 0;
  }

  search(input: string): this {
    this.input = input.toLowerCase();

    if (this.input) {
      this.createSearchResult(this.input);
      this.sortResultByScores();
    } else {
      this.scores = {};
      this.result = [];
    }

    return this;
  }
}

export class EmojiInlineIndexSearch extends AIndexSearch {
  private constructor(library: IEmojiLibrary) {
    super(library);
  }

  static getInstance(data: EmojiMartData = DEFAULT_EMOJI_LIBRARY) {
    return new EmojiInlineIndexSearch(new EmojiInlineLibrary(data));
  }
}

export class EmojiFloatingIndexSearch extends AIndexSearch {
  private constructor(library: IEmojiLibrary) {
    super(library);
  }

  static getInstance(library: IEmojiLibrary) {
    return new EmojiFloatingIndexSearch(library);
  }
}

export type { Emoji } from '@emoji-mart/data';
