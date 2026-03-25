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
} as any;

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
} as any;

describe('EmojiInlineIndexSearch', () => {
  beforeEach(() => {
    (EmojiInlineIndexSearch as any).instance = undefined;
  });

  it('creates a singleton search instance backed by the provided emoji data', () => {
    const search =
      EmojiInlineIndexSearch.getInstance(grinOnlyData).search('grin');

    expect(search.getEmoji()?.id).toBe('grin');
  });

  it('reuses the existing singleton when later calls pass different data', () => {
    const first = EmojiInlineIndexSearch.getInstance(grinOnlyData);
    const second = EmojiInlineIndexSearch.getInstance(rocketOnlyData);

    expect(second).toBe(first);
    expect(second.search('grin').getEmoji()?.id).toBe('grin');
    expect(second.search('rocket').hasFound()).toBe(false);
  });
});
