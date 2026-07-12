import type { EmojiMartData } from '@emoji-mart/data';

import { type EmojiSettingsType, EmojiCategory } from '../../../lib';
import type { IFrequentEmojiStorage } from './EmojiFloatingLibrary.types';

import { EmojiFloatingGrid } from './EmojiFloatingGrid';
import { EmojiFloatingGridBuilder } from './EmojiFloatingGridBuilder';
import { EmojiFloatingLibrary } from './EmojiFloatingLibrary';

const data = {
  aliases: {},
  categories: [{ emojis: ['wave'], id: 'people' }],
  emojis: {
    wave: {
      id: 'wave',
      keywords: ['hello'],
      name: 'Waving Hand',
      skins: [{ native: '👋', unified: '1f44b' }],
      version: 1,
    },
  },
  sheet: { cols: 1, rows: 1 },
} satisfies EmojiMartData;

const settings = {
  buttonSize: { value: 36 },
  categories: { value: [EmojiCategory.People] },
  perLine: { value: 8 },
  showFrequent: { value: true },
} satisfies EmojiSettingsType;

const createStorage = () => {
  const update = mock(() => ({ wave: 2 }));
  const storage: IFrequentEmojiStorage = {
    get: () => ({ wave: 1 }),
    getList: () => ['wave'],
    set: () => {},
    update,
  };

  return { storage, update };
};

describe('emoji floating library', () => {
  it('builds grids, clamps missing indexes, and updates frequent emojis', () => {
    const { storage, update } = createStorage();
    const grid = new EmojiFloatingGridBuilder(
      storage,
      [EmojiCategory.People],
      { frequent: ['wave'], people: ['wave'] },
      settings
    ).build();

    expect(grid.sections()).toHaveLength(2);

    const library = EmojiFloatingLibrary.getInstance(settings, storage, data);

    expect(library.getGrid()).toBeTruthy();
    expect(library.indexOf(EmojiCategory.Symbols)).toBe(0);

    library.updateFrequentCategory('wave');

    expect(update).toHaveBeenCalledWith('wave');
    expect(new EmojiFloatingGrid().createRootRef().current).toBeNull();
  });

  it('does not leak the first library across instances', () => {
    const first = EmojiFloatingLibrary.getInstance(
      settings,
      createStorage().storage,
      data
    );
    const second = EmojiFloatingLibrary.getInstance(
      { ...settings, categories: { value: [] } },
      createStorage().storage,
      { ...data, categories: [] }
    );

    expect(second).not.toBe(first);
    expect(first.getGrid().sections()).toHaveLength(1);
    expect(second.getGrid().sections()).toHaveLength(0);
  });
});
