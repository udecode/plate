import { EmojiFloatingIndexSearch } from './EmojiFloatingIndexSearch';

const createLibrary = (prefix: string) =>
  ({
    getEmoji: (id: string) => ({ id }),
    getEmojiId: (key: string) => key.replace(`${prefix}-`, ''),
    keys: [`${prefix}-smile`, `${prefix}-smirk`],
  }) as any;

describe('EmojiFloatingIndexSearch', () => {
  it('reuses a singleton instance and keeps the first library binding', () => {
    const firstLibrary = createLibrary('first');
    const secondLibrary = createLibrary('second');

    const first =
      EmojiFloatingIndexSearch.getInstance(firstLibrary).search('s');
    const second =
      EmojiFloatingIndexSearch.getInstance(secondLibrary).search('s');

    expect(first).toBe(second);
    expect(second.get().map((emoji) => emoji.id)).toEqual(['smile', 'smirk']);
  });
});
