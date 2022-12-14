import { DEFAULT_FREQUENTLY_USED_EMOJI } from '../constants';
import { FrequentEmojis, IFrequentEmojiStorage } from '../utils';
import { LocalStorage } from './LocalStorage';

export class FrequentEmojiStorage implements IFrequentEmojiStorage {
  protected prefix = 'emoji';
  protected localStorage;

  constructor(
    protected key = 'frequent',
    protected defaultValue = DEFAULT_FREQUENTLY_USED_EMOJI
  ) {
    this.localStorage = new LocalStorage(
      `${this.prefix}:${this.key}`,
      this.defaultValue
    );
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
    return Object.keys(data)
      .sort((a, b) => data[b] - data[a])
      .reduce(
        (_sortedObj, key) => ({
          ..._sortedObj,
          [key]: data[key],
        }),
        {}
      );
  }

  getList(): string[] {
    return Object.keys(this.get());
  }

  set(value: any) {
    this.localStorage.set(value);
  }
}
