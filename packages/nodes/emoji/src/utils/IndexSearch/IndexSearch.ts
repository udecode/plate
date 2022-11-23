import { TComboboxItem } from '@udecode/plate-combobox';
import { EmojiItemData } from '../../types';
import { fetchEmojiData } from './fetchData';
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
  protected data?: IPrepareData;
  protected result: string[] = [];
  protected scores = {};

  constructor() {
    if (this.data) return;

    fetchEmojiData().then((library) => {
      if (library) {
        this.data = new PrepareData(library);
      }
    });
  }

  search(input: string): this {
    const value = input.toLowerCase();

    this.createSearchResult(value);
    this.sortResult(this.result, this.scores);

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

  private sortResult(result: string[], scores: {}) {
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
    return this.result.map((key) => {
      const emoji = this.data?.getEmoji(key);
      return this.transform(emoji!);
    });
  }

  protected abstract transform(emoji: Emoji): RData;
}
