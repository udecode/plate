import type { EmojiMartData } from '@emoji-mart/data';

import { createEmojiSearch } from './createEmojiSearch';

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

describe('emoji library and search', () => {
  it('matches uppercase IDs and keywords in custom datasets', () => {
    const custom = {
      ...data.emojis.rocket,
      id: 'RKT',
      name: 'Launch',
      keywords: ['SPACE'],
    };
    const search = createEmojiSearch({ ...data, emojis: { RKT: custom } });

    expect(search('space')).toEqual([custom]);
    expect(search('rkt')).toEqual([custom]);
  });

  it('indexes lowercased names and keywords for search lookup', () => {
    const search = createEmojiSearch(data);

    for (const query of ['ROCKET', 'ship', 'space', 'launch']) {
      expect(search(query)).toEqual([data.emojis.rocket]);
    }
  });

  it('returns no results for unknown or empty queries', () => {
    const search = createEmojiSearch(data);

    expect(search('missing')).toEqual([]);
    expect(search('')).toEqual([]);
  });

  it('prefers exact IDs and orders tied fragments by ID', () => {
    const search = createEmojiSearch(data);

    expect(search('grin').map((emoji) => emoji.id)).toEqual([
      'grin',
      'grinning',
    ]);
    expect(search('happy').map((emoji) => emoji.id)).toEqual([
      'grin',
      'grinning',
    ]);
  });

  it('returns independent result arrays for each query', () => {
    const search = createEmojiSearch(data);
    const first = search('grin');

    search('ship');
    search('grin').pop();

    expect(first).toEqual([data.emojis.grin, data.emojis.grinning]);
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
    const first = createEmojiSearch(grinOnlyData);
    const second = createEmojiSearch(rocketOnlyData);

    expect(second).not.toBe(first);
    expect(first('grin')[0]?.id).toBe('grin');
    expect(second('grin')).toEqual([]);
    expect(second('rocket')[0]?.id).toBe('rocket');
  });

  it('applies a caller limit after ordering', () => {
    const search = createEmojiSearch(data);

    expect(search('grin', { limit: 1 })).toEqual([data.emojis.grin]);
    expect(search('grin', { limit: 0 })).toEqual([]);
    expect(search('grin', { limit: -1 })).toEqual([]);
  });
});
