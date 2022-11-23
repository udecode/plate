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
  protected hash: Record<string, string> = {};
  protected keys: string[] = [];
  protected result: string[] = [];

  protected prepareData?: IPrepareData;

  constructor() {
    if (this.prepareData) return;

    fetchEmojiData().then((library) => {
      if (library) {
        this.prepareData = new PrepareData(library);
      }
    });
  }

  search(input: string): this {
    const regex = new RegExp(`${input.toLowerCase()}`);
    this.result = this.prepareData!.keys.filter((key) => regex.test(key)).map(
      (key) => this.prepareData!.hash[key]
    );

    return this;
  }

  get() {
    return this.result.map((key) => {
      const emoji = this.prepareData?.emojis[key];
      return this.transform(emoji!);
    });
  }

  protected abstract transform(emoji: Emoji): RData;
}
