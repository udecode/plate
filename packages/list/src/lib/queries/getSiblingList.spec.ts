import { type TElement, KEYS } from 'platejs';

import { getSiblingList } from './getSiblingList';

type Entry = [TElement, number[]];

const createEntries = (): Entry[] => [
  [
    {
      children: [{ text: '' }],
      [KEYS.indent]: 1,
      [KEYS.listType]: 'disc',
      type: KEYS.p,
    } as TElement,
    [0],
  ],
  [
    {
      children: [{ text: '' }],
      [KEYS.indent]: 1,
      [KEYS.listType]: 'disc',
      type: KEYS.p,
    } as TElement,
    [1],
  ],
  [
    {
      children: [{ text: '' }],
      [KEYS.indent]: 1,
      [KEYS.listType]: 'disc',
      type: KEYS.p,
    } as TElement,
    [2],
  ],
];

const getNextEntry =
  (entries: Entry[]) =>
  (entry: Entry): Entry | undefined =>
    entries[entry[1][0] + 1];

const getPreviousEntry =
  (entries: Entry[]) =>
  (entry: Entry): Entry | undefined =>
    entries[entry[1][0] - 1];

describe('getSiblingList', () => {
  it('breaks on the current node restart flag when scanning backwards', () => {
    const entries = createEntries();

    entries[1][0][KEYS.listRestart] = 4;

    expect(
      getSiblingList({} as any, entries[1] as any, {
        breakOnListRestart: true,
        getPreviousEntry: getPreviousEntry(entries) as any,
      })
    ).toBeUndefined();
  });

  it('breaks on the next node restart flag when scanning forwards', () => {
    const entries = createEntries();

    entries[1][0][KEYS.listRestart] = 4;

    expect(
      getSiblingList({} as any, entries[0] as any, {
        breakOnListRestart: true,
        getNextEntry: getNextEntry(entries) as any,
      })
    ).toBeUndefined();
  });

  it('skips rejected siblings until a valid one matches', () => {
    const entries = createEntries();

    entries[1][0][KEYS.indent] = 2;

    expect(
      getSiblingList({} as any, entries[0] as any, {
        eqIndent: false,
        getNextEntry: getNextEntry(entries) as any,
        query: (sibling) => sibling[KEYS.indent] === 1,
      })
    ).toEqual(entries[2]);
  });
});
