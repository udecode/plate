import type { EmojiMartData } from '@emoji-mart/data';

import {
  AIndexSearch,
  EmojiFloatingIndexSearch,
  EmojiInlineIndexSearch,
  EmojiInlineLibrary,
  type IEmojiLibrary,
} from './EmojiLibrary';

const data = {
  aliases: {},
  categories: [],
  emojis: {
    grin: {
      id: 'grin',
      keywords: ['happy'],
      name: 'Grin Face',
      skins: [{ native: '😀', unified: '1f600' }],
      version: 1,
    },
    grinning: {
      id: 'grinning',
      keywords: ['happy'],
      name: 'Grinning Face',
      skins: [{ native: '😄', unified: '1f604' }],
      version: 1,
    },
    rocket: {
      id: 'rocket',
      keywords: ['space', 'launch'],
      name: 'Rocket Ship',
      skins: [{ native: '🚀', unified: '1f680' }],
      version: 1,
    },
  },
  sheet: { cols: 1, rows: 1 },
} satisfies EmojiMartData;

class TestIndexSearch extends AIndexSearch {
  constructor() {
    super(new EmojiInlineLibrary(data));
  }
}

describe('emoji library and search', () => {
  it('indexes lowercased names and keywords for search lookup', () => {
    const library = new EmojiInlineLibrary(data);
    const rocketKey = library.keys.find((key) => key.startsWith('rocket,'));

    if (!rocketKey) throw new Error('Missing rocket search key');

    expect(library.keys).toHaveLength(3);
    expect(rocketKey).toBe('rocket,rocket,ship,space,launch');
    expect(library.getEmojiId(rocketKey)).toBe('rocket');
    expect(library.getEmoji('rocket')).toMatchObject({
      id: 'rocket',
      name: 'Rocket Ship',
    });
  });

  it('returns undefined for unknown ids and searchable keys', () => {
    const library = new EmojiInlineLibrary(data);

    expect(library.getEmoji('missing')).toBeUndefined();
    expect(library.getEmojiId('missing,key')).toBeUndefined();
  });

  it('prefers exact matches and supports exact-match detection', () => {
    const search = new TestIndexSearch().search('grin');

    expect(search.get().map((emoji) => emoji.id)).toEqual(['grin', 'grinning']);
    expect(search.hasFound()).toBe(true);
    expect(search.hasFound(true)).toBe(true);
  });

  it('matches name fragments and clears state for empty searches', () => {
    const search = new TestIndexSearch();

    expect(search.search('ship').getEmoji()?.id).toBe('rocket');

    search.search('');

    expect(search.get()).toEqual([]);
    expect(search.hasFound()).toBe(false);
  });

  it('keeps inline searches isolated across emoji datasets', () => {
    const grinOnlyData = {
      ...data,
      emojis: { grin: data.emojis.grin },
    } satisfies EmojiMartData;
    const rocketOnlyData = {
      ...data,
      emojis: { rocket: data.emojis.rocket },
    } satisfies EmojiMartData;
    const first = EmojiInlineIndexSearch.getInstance(grinOnlyData);
    const second = EmojiInlineIndexSearch.getInstance(rocketOnlyData);

    expect(second).not.toBe(first);
    expect(first.search('grin').getEmoji()?.id).toBe('grin');
    expect(second.search('grin').hasFound()).toBe(false);
    expect(second.search('rocket').getEmoji()?.id).toBe('rocket');
  });

  it('keeps floating searches bound to their own libraries', () => {
    const createLibrary = (prefix: string): IEmojiLibrary => ({
      getEmoji: (id) => ({
        id,
        keywords: [],
        name: id,
        skins: [{ native: id, unified: id }],
        version: 1,
      }),
      getEmojiId: (key) => key.replace(`${prefix}-`, ''),
      keys: [`${prefix}-smile`, `${prefix}-smirk`],
    });
    const first = EmojiFloatingIndexSearch.getInstance(
      createLibrary('first')
    ).search('s');
    const second = EmojiFloatingIndexSearch.getInstance(
      createLibrary('second')
    ).search('s');

    expect(first).not.toBe(second);
    expect(first.get().map((emoji) => emoji.id)).toEqual(['smile', 'smirk']);
    expect(second.get().map((emoji) => emoji.id)).toEqual(['smile', 'smirk']);
  });
});
