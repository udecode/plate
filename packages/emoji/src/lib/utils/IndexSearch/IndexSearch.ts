import type { Emoji } from '@emoji-mart/data';

import type { IEmojiLibrary } from '../EmojiLibrary';

import { EMOJI_MAX_SEARCH_RESULT } from '../../constants';

type IIndexSearch = {
  get: () => Emoji[];
  hasFound: () => boolean;
  search: (input: string) => IIndexSearch;
};

export abstract class AIndexSearch implements IIndexSearch {
  protected input: string | undefined;
  protected maxResult = EMOJI_MAX_SEARCH_RESULT;
  protected result: string[] = [];
  protected scores: Record<string, number> = {};
  protected library: IEmojiLibrary;

  protected constructor(library: IEmojiLibrary) {
    this.library = library;
  }

  private createSearchResult(value: string) {
    this.scores = {};
    this.result = [];

    for (const key of this.library.keys) {
      const score = key.indexOf(`${value}`);

      if (score === -1) continue;

      const emojiId = this.library.getEmojiId(key);

      if (!emojiId) continue;

      this.result.push(emojiId);
      this.scores[emojiId] ??= 0;
      this.scores[emojiId] += emojiId === value ? 0 : score + 1;
    }
  }

  private sortResultByScores(result: string[], scores: Record<string, number>) {
    result.sort((a, b) => {
      const aScore = scores[a] ?? 0;
      const bScore = scores[b] ?? 0;

      if (aScore === bScore) {
        return a.localeCompare(b);
      }

      return aScore - bScore;
    });
  }

  get(): Emoji[] {
    const emojis: Emoji[] = [];

    for (const key of this.result) {
      const emoji = this.library?.getEmoji(key);

      if (emoji) {
        emojis.push(emoji);
      }
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
    const value = this.input;

    if (value) {
      this.createSearchResult(value);
      this.sortResultByScores(this.result, this.scores);
    } else {
      this.scores = {};
      this.result = [];
    }

    return this;
  }
}
