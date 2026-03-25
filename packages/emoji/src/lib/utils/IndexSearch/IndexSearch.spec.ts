import { EmojiInlineLibrary } from '../EmojiLibrary/EmojiInlineLibrary';

import { AIndexSearch } from './IndexSearch';

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
} as any;

class TestIndexSearch extends AIndexSearch {
  constructor() {
    super(new EmojiInlineLibrary(data));
  }
}

describe('AIndexSearch', () => {
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
});
