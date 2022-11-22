import { TComboboxItem } from '@udecode/plate-combobox';
import { EmojiItemData } from '../types';
import { fetchEmojiData } from './fetchData';

type Skins = {
  unified: string;
  native: string;
};

type Emoji = {
  id: string;
  name: string;
  keywords: string[];
  skins: Skins[];
  version: number;
};

type IndexSearchData = {
  aliases: any;
  categories: any;
  emojis: Record<any, Emoji>;
  sheet: any;
};

export class IndexSearch {
  protected keys: string[] = [];
  protected result: string[] = [];
  protected data?: IndexSearchData;

  constructor() {
    fetchEmojiData().then((data) => {
      if (data) {
        this.data = data;
        this.keys = Object.keys(data.emojis);
      }
    });
  }

  search(input: string) {
    const regex = new RegExp(`${input}`);
    this.result = this.keys.filter((key) => regex.test(key));
  }

  get() {
    return this.data
      ? this.result.map((key) => this.getEmoji(this.data!.emojis[key]))
      : [];
  }

  private getEmoji(emoji: Emoji): TComboboxItem<EmojiItemData> {
    return {
      key: emoji.id,
      text: emoji.name,
      data: {
        id: emoji.id,
        emoji: emoji.skins[0].native,
        name: emoji.name,
        text: emoji.name,
      },
    };
  }
}
