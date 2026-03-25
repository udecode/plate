import { EmojiInlineLibrary } from './EmojiInlineLibrary';

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

describe('EmojiInlineLibrary', () => {
  it('indexes lowercased names and keywords for search lookup', () => {
    const library = new EmojiInlineLibrary(data);
    const rocketKey = library.keys.find((key) => key.startsWith('rocket,'));

    expect(library.keys).toHaveLength(2);
    expect(rocketKey).toBe('rocket,rocket,ship,space,launch');
    expect(library.getEmojiId(rocketKey!)).toBe('rocket');
    expect(library.getEmoji('rocket')).toMatchObject({
      id: 'rocket',
      name: 'Rocket Ship',
    });
  });

  it('returns undefined for unknown ids and searchable keys', () => {
    const library = new EmojiInlineLibrary(data);

    expect((library as any).getEmoji('missing')).toBeUndefined();
    expect((library as any).getEmojiId('missing,key')).toBeUndefined();
  });
});
