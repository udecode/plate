import type { Emoji } from '@emoji-mart/data';

import type { IEmojiLibrary } from '../EmojiLibrary/index';

import { EMOJI_MAX_SEARCH_RESULT } from '../../constants';

interface IIndexSearch {
  get: () => Emoji[];
  hasFound: () => boolean;
  search: (input: string) => void;
}

export abstract class AIndexSearch implements IIndexSearch {
  protected input: string | undefined;
  protected maxResult = EMOJI_MAX_SEARCH_RESULT;
  protected result: string[] = [];
  protected scores = {};

  protected constructor(protected library: IEmojiLibrary) {}

  private createSearchResult(value: string) {
    this.scores = {};
    this.result = [];

    for (const key of this.library!.keys) {
      const score = key.indexOf(`${value}`);

      if (score === -1) continue;

      const emojiId = this.library!.getEmojiId(key);
      this.result.push(emojiId);

      (this.scores as any)[emojiId] || ((this.scores as any)[emojiId] = 0);
      (this.scores as any)[emojiId] += emojiId === value ? 0 : score + 1;
    }
  }

  private sortResultByScores(result: string[], scores: {}) {
    result.sort((a, b) => {
      const aScore = (scores as any)[a];
      const bScore = (scores as any)[b];

      if (aScore === bScore) {
        return a.localeCompare(b);
      }

      return aScore - bScore;
    });
  }

  get() {
    const emojis = [];

    for (const key of this.result) {
      const emoji = this.library?.getEmoji(key);
      emojis.push(emoji);

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
