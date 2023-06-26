import { DEFAULT_FREQUENTLY_USED_EMOJI } from '../constants';
import { EmojiCategory } from '../types';
import {
  FrequentEmojis,
  FrequentEmojiStorageProps,
  IFrequentEmojiStorage,
} from '../utils/index';
import { LocalStorage } from './LocalStorage';

export class FrequentEmojiStorage implements IFrequentEmojiStorage {
  protected limit = 8;
  protected prefix = 'emoji';
  protected key = EmojiCategory.Frequent;
  protected localStorage;

  constructor(
    props: FrequentEmojiStorageProps,
    protected defaultValue = DEFAULT_FREQUENTLY_USED_EMOJI
  ) {
    this.limit = props.limit ?? this.limit;
    const key = `${props.prefix ?? this.prefix}:${props.key ?? this.key}`;
    this.localStorage = new LocalStorage(key, defaultValue);
  }

  update(emojiId: string) {
    const prevEmojis = this.localStorage.get();
    const count = prevEmojis![emojiId] ? prevEmojis[emojiId] + 1 : 1;

    const emojis: FrequentEmojis = {
      ...prevEmojis,
      [emojiId]: count,
    };

    this.localStorage.set(emojis);

    return emojis;
  }

  get(): FrequentEmojis {
    const data = this.localStorage.get();
    return Object.fromEntries(
      Object.keys(data)
        .sort((a, b) => data[b] - data[a])
        .map((key) => [key, data[key]])
    );
  }

  getList(): string[] {
    return Object.keys(this.get()).splice(0, this.limit);
  }

  set(value: any) {
    this.localStorage.set(value);
  }
}
