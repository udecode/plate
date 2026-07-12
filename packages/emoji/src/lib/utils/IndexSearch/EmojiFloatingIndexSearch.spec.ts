import { EmojiFloatingIndexSearch } from './EmojiFloatingIndexSearch';

const createLibrary = (prefix: string) =>
  ({
    getEmoji: (id: string) => ({
      id,
      keywords: [],
      name: id,
      skins: [{ native: id, unified: id }],
      version: 1,
    }),
    getEmojiId: (key: string) => key.replace(`${prefix}-`, ''),
    keys: [`${prefix}-smile`, `${prefix}-smirk`],
  }) satisfies Parameters<typeof EmojiFloatingIndexSearch.getInstance>[0];

describe('EmojiFloatingIndexSearch', () => {
  it('keeps each search bound to its own library', () => {
    const firstLibrary = createLibrary('first');
    const secondLibrary = createLibrary('second');

    const first =
      EmojiFloatingIndexSearch.getInstance(firstLibrary).search('s');
    const second =
      EmojiFloatingIndexSearch.getInstance(secondLibrary).search('s');

    expect(first).not.toBe(second);
    expect(first.get().map((emoji) => emoji.id)).toEqual(['smile', 'smirk']);
    expect(second.get().map((emoji) => emoji.id)).toEqual(['smile', 'smirk']);
  });
});
