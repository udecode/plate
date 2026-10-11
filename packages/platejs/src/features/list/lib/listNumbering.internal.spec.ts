import {
  createLanes,
  type ListEntry,
  placeEntry,
  removeEntry,
} from './listNumbering.internal';

const entry = (key: number): ListEntry<number> => ({
  facts: {
    id: '',
    level: 1,
    levels: undefined,
    numbered: true,
    restart: undefined,
    start: undefined,
  },
  key,
  ordinal: undefined,
});

const byKey = (left: ListEntry<number>, right: ListEntry<number>) =>
  left.key - right.key;

const seeded = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

    return state / 2_147_483_648;
  };
};

describe('list lanes', () => {
  it('keeps a lane within one chunk per 16 entries through splits and removals', () => {
    const random = seeded(7);
    const live = new Map<number, ListEntry<number>>();

    for (let key = 0; key < 2000; key += 1) {
      live.set(key * 1000, entry(key * 1000));
    }

    const lanes = createLanes([...live.values()]);
    const lane = () => lanes.items.get(1) ?? [];
    const check = () => {
      expect(
        lane()
          .flat()
          .map(({ key }) => key)
      ).toEqual([...live.keys()].sort((left, right) => left - right));
      expect(lane().length).toBeLessThanOrEqual(Math.ceil(live.size / 16) + 1);
      expect(
        Math.max(...lane().map((chunk) => chunk.length))
      ).toBeLessThanOrEqual(128);
    };

    for (let step = 0; step < 5000; step += 1) {
      const key = 1_000_000 + Math.floor(random() * 1000) * 1000 + step;

      if (live.has(key)) continue;
      live.set(key, entry(key));
      placeEntry(lanes, live.get(key)!, byKey);
    }
    check();
    for (const key of [...live.keys()]) {
      if (random() < 0.85) {
        removeEntry(lanes, live.get(key)!, live.get(key)!.facts, byKey);
        live.delete(key);
      }
    }
    check();
  });
});
