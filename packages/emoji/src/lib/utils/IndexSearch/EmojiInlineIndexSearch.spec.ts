import type { EmojiMartData } from '@emoji-mart/data';

import { EmojiInlineIndexSearch } from './EmojiInlineIndexSearch';

const grinOnlyData = {
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
  },
  sheet: { cols: 1, rows: 1 },
} satisfies EmojiMartData;

const rocketOnlyData = {
  aliases: {},
  categories: [],
  emojis: {
    rocket: {
      id: 'rocket',
      keywords: ['space'],
      name: 'Rocket Ship',
      skins: [{ native: '🚀', unified: '1f680' }],
      version: 1,
    },
  },
  sheet: { cols: 1, rows: 1 },
} satisfies EmojiMartData;

describe('EmojiInlineIndexSearch', () => {
  it('creates a search instance backed by the provided emoji data', () => {
    const search =
      EmojiInlineIndexSearch.getInstance(grinOnlyData).search('grin');

    expect(search.getEmoji()?.id).toBe('grin');
  });

  it('keeps searches isolated across emoji datasets', () => {
    const first = EmojiInlineIndexSearch.getInstance(grinOnlyData);
    const second = EmojiInlineIndexSearch.getInstance(rocketOnlyData);

    expect(second).not.toBe(first);
    expect(first.search('grin').getEmoji()?.id).toBe('grin');
    expect(second.search('grin').hasFound()).toBe(false);
    expect(second.search('rocket').getEmoji()?.id).toBe('rocket');
  });
});
