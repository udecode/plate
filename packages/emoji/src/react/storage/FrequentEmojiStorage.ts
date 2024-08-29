import type {
  FrequentEmojiStorageProps,
  IFrequentEmojiStorage,
} from '../utils';

import { DEFAULT_FREQUENTLY_USED_EMOJI } from '../../lib/constants';
import { EmojiCategory, type FrequentEmojis } from '../../lib/types';
import { LocalStorage } from './LocalStorage';

export class FrequentEmojiStorage implements IFrequentEmojiStorage {
  protected key = EmojiCategory.Frequent;
  protected limit = 8;
  protected localStorage;
  protected prefix = 'emoji';

  constructor(
    props: FrequentEmojiStorageProps,
    protected defaultValue = DEFAULT_FREQUENTLY_USED_EMOJI
  ) {
    this.limit = props.limit ?? this.limit;
    const key = `${props.prefix ?? this.prefix}:${props.key ?? this.key}`;
    this.localStorage = new LocalStorage(key, defaultValue);
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
}
