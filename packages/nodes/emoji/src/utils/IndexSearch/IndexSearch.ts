import data from '@emoji-mart/data';
import { TComboboxItem } from '@udecode/plate-combobox';
import { EMOJI_MAX_RESULT } from '../../constants';
import { EmojiItemData } from '../../types';
import { IPrepareData, PrepareData } from './PrepareData';
import { Emoji } from './types';

type IndexSearchReturnData = TComboboxItem<EmojiItemData>;

interface IIndexSearch<R> {
  search: (input: string) => void;
  get: () => R[];
}

export abstract class AIndexSearch<
  RData extends IndexSearchReturnData = IndexSearchReturnData
> implements IIndexSearch<RData> {
  protected data: IPrepareData;
  protected result: string[] = [];
  protected scores = {};
  protected maxResult = EMOJI_MAX_RESULT;

  constructor() {
    this.data = new PrepareData(data);
  }

  search(input: string): this {
    const value = input.toLowerCase();

    this.createSearchResult(value);
    this.sortResultByScores(this.result, this.scores);

    return this;
  }

  private createSearchResult(value: string) {
    this.scores = {};
    this.result = [];

    for (const key of this.data!.keys) {
      const score = key.indexOf(`${value}`);
      if (score === -1) continue;

      const emojiId = this.data!.getEmojiId(key);
      this.result.push(emojiId);

      this.scores[emojiId] || (this.scores[emojiId] = 0);
      this.scores[emojiId] += emojiId === value ? 0 : score + 1;
    }
  }

  private sortResultByScores(result: string[], scores: {}) {
    result.sort((a, b) => {
      const aScore = scores[a];
      const bScore = scores[b];

      if (aScore === bScore) {
        return a.localeCompare(b);
      }

      return aScore - bScore;
    });
  }

  get() {
    const emojis = [];
    for (const key of this.result) {
      const emoji = this.data?.getEmoji(key);
      emojis.push(this.transform(emoji!));
      if (emojis.length >= this.maxResult) break;
    }
    return emojis;
  }

  protected abstract transform(emoji: Emoji): RData;
}
