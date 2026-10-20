import { BaseParagraphPlugin, createEditor } from '../../../core';
import { BaseBlockquotePlugin } from '../../basic-nodes/lib/BaseBlockPlugins';
import { BaseHeadingPlugin } from '../../basic-nodes/lib/BaseHeadingPlugins';
import { BaseBoldPlugin } from '../../basic-nodes/lib/BaseMarkPlugins';
import { BaseListPlugin } from './BaseListPlugin';
import { getListIndexMetrics } from './listIndex.internal';
import { countAll, type ListEntry } from './listNumbering.internal';

const item = (text: string, extra: Record<string, unknown> = {}) => ({
  children: [{ text }],
  indent: 1,
  listType: 'numbered',
  type: 'paragraph',
  ...extra,
});

const plain = (text: string, extra: Record<string, unknown> = {}) => ({
  children: [{ text }],
  type: 'paragraph',
  ...extra,
});

const lifecycleErrors: unknown[] = [];

afterEach(() => {
  expect(lifecycleErrors.splice(0)).toEqual([]);
});

const editorOf = (initialValue: unknown[]) =>
  createEditor({
    initialValue,
    lifecycleErrorSink: (error: unknown) => {
      lifecycleErrors.push(error);
    },
    plugins: [
      BaseParagraphPlugin,
      BaseBoldPlugin,
      BaseBlockquotePlugin,
      BaseHeadingPlugin,
      BaseListPlugin.configure({
        targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
      }),
    ],
  } as never);

const oracle = (children: readonly unknown[]) => {
  const result = new Map<unknown, number | null>();
  const lists = new Map<
    string,
    Array<{ level: number; value: number | null }>
  >();
  const walk = (nodes: readonly any[]) => {
    for (const node of nodes) {
      if (!node || 'text' in node) continue;
      if (node.listType) {
        const id = node.listId ?? '';
        const level = node.indent ?? 1;
        const items = lists.get(id) ?? [];
        let value: number | null = null;

        lists.set(id, items);
        if (node.listType === 'numbered') {
          const limit = Math.min(
            level - 1,
            node.listLevels?.[level]?.restartAfter ?? level - 1
          );
          let previous: number | undefined;

          for (let index = items.length - 1; index >= 0; index -= 1) {
            const other = items[index];

            if (other.level <= limit) break;
            if (other.level === level && other.value !== null) {
              previous = other.value;
              break;
            }
          }
          value =
            node.listRestart ??
            (previous === undefined
              ? (node.listStart ?? node.listLevels?.[level]?.start ?? 1)
              : previous + 1);
        }
        items.push({ level, value });
        result.set(node, value);
      }
      walk(node.children ?? []);
    }
  };

  walk(children);

  return result;
};

const levelRules = [
  { '2': { restartAfter: 0 } },
  { '3': { restartAfter: 1 } },
  { '2': { restartAfter: 2 } },
  { '2': { restartAfter: 3 }, '3': { restartAfter: 3 } },
  { '1': { start: 3 }, '2': { start: 2 } },
];

const measure = (run: () => void) => {
  const before = getListIndexMetrics();

  run();

  const after = getListIndexMetrics();

  return {
    compares: after.compares - before.compares,
    moved: after.moved - before.moved,
    visited: after.visited - before.visited,
  };
};

const ordinals = (editor: ReturnType<typeof editorOf>) =>
  editor.read
    .children()
    .map(
      (_, index) => editor.plugin(BaseListPlugin).read.ordinal([index]) ?? null
    );

const firstSeed =
  process.env.FAST_CHECK_SEED === 'random'
    ? Math.floor(Math.random() * 2_147_483_648)
    : Number(process.env.FAST_CHECK_SEED ?? 1);

if (!Number.isSafeInteger(firstSeed)) {
  throw new Error(
    `FAST_CHECK_SEED must be an integer or random, got ${process.env.FAST_CHECK_SEED}`
  );
}

const seeded = (seed: number) => {
  // fast-check prints signed seeds, and a negative state stays negative under %.
  let state = (seed >>> 0) % 2_147_483_648;

  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

    return state / 2_147_483_648;
  };
};

describe('list index against a fresh count', () => {
  it.each([
    { blocks: 6, count: 50, covers: 'one-pass rebuilds' },
    { blocks: 60, count: 40, covers: 'per-entry moves and rebuilds' },
  ])(
    'matches the oracle after random multi-operation transactions on $blocks blocks ($covers)',
    ({ blocks, count }) => {
      const failures: string[] = [];

      for (let run = 0; run < count; run += 1) {
        const seed = firstSeed + run;
        const random = seeded(seed);
        const pick = <T>(values: readonly T[]) =>
          values[Math.floor(random() * values.length)];
        const randomBlock = (label: string) =>
          random() < 0.3
            ? plain(label, random() < 0.3 ? { indent: 2 } : {})
            : item(label, {
                indent: pick([1, 1, 2, 3]),
                ...(random() < 0.7 ? { listId: pick(['a', 'b']) } : {}),
                listType: pick(['numbered', 'numbered', 'bulleted']),
                ...(random() < 0.1 ? { listStart: pick([3, 7]) } : {}),
                ...(random() < 0.1 ? { listRestart: pick([1, 10]) } : {}),
                ...(random() < 0.3 ? { listLevels: pick(levelRules) } : {}),
              });
        const editor = editorOf(
          Array.from({ length: blocks }, (_, index) => randomBlock(`b${index}`))
        );
        const read = () => {
          const children = editor.read.children();
          const expected = oracle(children);
          const actual: Array<number | null> = [];
          const wanted: Array<number | null> = [];
          const visit = (nodes: readonly any[], parent: number[]) => {
            nodes.forEach((node, index) => {
              if (!node || 'text' in node) return;
              const path = [...parent, index];

              if (node.listType) {
                actual.push(
                  editor.plugin(BaseListPlugin).read.ordinal(path) ?? null
                );
                wanted.push(expected.get(node) ?? null);
              }
              visit(node.children ?? [], path);
            });
          };

          visit(children, []);

          return { actual, wanted };
        };

        read();

        for (let step = 0; step < 6; step += 1) {
          editor.update((tx) => {
            for (let op = 0; op < 1 + Math.floor(random() * 3); op += 1) {
              const { length } = tx.children();
              const at = Math.floor(random() * length);
              const kind = pick([
                'insert',
                'remove',
                'move',
                'indent',
                'kind',
                'start',
                'restart',
                'id',
                'levels',
                'quote',
                'group',
                'return',
              ]);
              const isParagraph =
                (tx.nodes.get([at])?.[0] as { type?: string } | undefined)
                  ?.type === 'paragraph';

              if (
                ['indent', 'kind', 'start', 'restart', 'id', 'levels'].includes(
                  kind
                ) &&
                !isParagraph
              ) {
                continue;
              }

              if (kind === 'insert') {
                tx.nodes.insert(randomBlock(`n${step}${op}`), {
                  at: [Math.floor(random() * (length + 1))],
                });
              } else if (kind === 'remove' && length > 1) {
                tx.nodes.remove({ at: [at] });
              } else if (kind === 'move' && length > 1) {
                const to = Math.floor(random() * length);

                if (to !== at) tx.nodes.move({ at: [at], to: [to] });
              } else if (kind === 'indent') {
                tx.nodes.set({ indent: pick([1, 2, 3]) }, { at: [at] });
              } else if (kind === 'kind') {
                tx.nodes.set(
                  { listType: pick(['numbered', 'bulleted']) },
                  { at: [at] }
                );
              } else if (kind === 'start') {
                tx.nodes.set({ listStart: pick([2, 5]) }, { at: [at] });
              } else if (kind === 'restart') {
                tx.nodes.set({ listRestart: pick([1, 4]) }, { at: [at] });
              } else if (kind === 'id') {
                tx.nodes.set({ listId: pick(['a', 'b', 'c']) }, { at: [at] });
              } else if (kind === 'levels') {
                tx.nodes.set({ listLevels: pick(levelRules) }, { at: [at] });
              } else if (kind === 'group' && at + 2 < length) {
                const to = at + 2 + Math.floor(random() * (length - at - 2));

                tx.nodes.move({ at: [at], to: [to] });
                tx.nodes.move({ at: [at], to: [to] });
              } else if (kind === 'return' && at > 0) {
                tx.nodes.move({ at: [at], to: [0] });
                for (let index = 0; index < at; index += 1) {
                  tx.nodes.insert(plain(`r${step}${op}${index}`), { at: [0] });
                }
              } else if (kind === 'quote' && length > 1) {
                tx.nodes.wrap(
                  { children: [], type: 'blockquote' },
                  { at: [at] }
                );
              }
            }
          });

          const { actual, wanted } = read();

          if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
            failures.push(
              `seed ${seed} step ${step}: ${JSON.stringify(actual)} != ${JSON.stringify(wanted)}`
            );
            break;
          }
        }
        if (failures.length > 3) break;
      }

      expect(failures).toEqual([]);
    }
  );
});

describe('list numbering work', () => {
  const changedByEnter = (
    editor: ReturnType<typeof editorOf>,
    after: number
  ) => {
    const children = editor.read.children();
    const before = new Map(
      ordinals(editor).map((ordinal, index) => [children[index], ordinal])
    );
    const work = measure(() => {
      editor.update.nodes.insert(
        { ...children[after], children: [{ text: 'New' }] },
        { at: [after + 1] }
      );
    });
    const counted = ordinals(editor);
    const changed = editor.read
      .children()
      .filter((node, index) => before.get(node) !== counted[index]).length;

    return { changed, ...work };
  };

  it('visits only the numbers an Enter changes in a 1,000-item three-level list, plus one per lane', () => {
    const create = () =>
      editorOf(
        Array.from({ length: 1000 }, (_, index) =>
          item(`i${index}`, { indent: [1, 2, 3, 2, 3][index % 5] })
        )
      );
    const end = changedByEnter(create(), 999);
    const middle = changedByEnter(create(), 500);

    expect(end.changed).toBe(1);
    expect(end.visited).toBeLessThanOrEqual(end.changed + 3);
    expect(middle.changed).toBe(100);
    expect(middle.visited).toBeLessThanOrEqual(middle.changed + 3);
  });

  it.each([
    [
      'a numbered list followed by N bullet lists',
      (lists: number) => [
        ...Array.from({ length: 10 }, (_, index) => item(`n${index}`)),
        ...Array.from({ length: lists }, (_list, list) => [
          plain('Between'),
          ...Array.from({ length: 10 }, (_item, index) =>
            item(`${list}.${index}`, { listType: 'bulleted' })
          ),
        ]).flat(),
      ],
      4,
    ],
    [
      'one of N numbered Markdown lists',
      (lists: number) =>
        Array.from({ length: lists }, (_list, list) => [
          ...Array.from({ length: 10 }, (_item, index) =>
            item(`${list}.${index}`, index === 0 ? { listRestart: 1 } : {})
          ),
          plain('Between'),
        ]).flat(),
      0,
    ],
  ] as const)(
    'visits the same count for an insert into %s, in one list, at N = 10 to 300',
    (_name, create, run) => {
      const work = (lists: number) => {
        const editor = editorOf(create(lists));
        const at = (run === 0 ? Math.floor(lists / 2) * 11 : 0) + 4;

        ordinals(editor);
        const { changed, moved, visited } = changedByEnter(editor, at);

        expect(moved).toBeLessThanOrEqual(128 + lists / 64);

        return { changed, visited };
      };
      const few = work(10);

      expect(few.visited).toBeLessThanOrEqual(few.changed + 1);
      for (const lists of [100, 300]) expect(work(lists)).toEqual(few);
    }
  );

  it('does a flat number of compares per visit while renumbering 1,000 level-2 items after 1,000 level-1 items', () => {
    const editor = editorOf([
      ...Array.from({ length: 1000 }, (_, index) => item(`p${index}`)),
      item('P'),
      ...Array.from({ length: 1000 }, (_, index) =>
        item(`c${index}`, { indent: 2 })
      ),
    ]);

    ordinals(editor);
    const work = measure(() => {
      editor.update.nodes.insert(item('New', { indent: 2 }), { at: [1001] });
    });

    expect(work.visited).toBeGreaterThanOrEqual(1001);
    expect(work.compares).toBeLessThanOrEqual(2 * work.visited + 64);
  });

  it('rebuilds a list in one pass when one commit deletes half of it', () => {
    const editor = editorOf(
      Array.from({ length: 1000 }, (_, index) =>
        item(`${index}`, { listId: 'half' })
      )
    );

    ordinals(editor);
    const work = measure(() => {
      editor.update((tx) => {
        for (let index = 999; index >= 0; index -= 2) {
          tx.nodes.remove({ at: [index] });
        }
      });
    });
    const counted = ordinals(editor);

    expect([counted[0], counted.at(-1)]).toEqual([1, 500]);
    expect(work.moved).toBeLessThanOrEqual(1000);
  });

  it('gallops a 500-item paste into a 3,000-item list', () => {
    const editor = editorOf(
      Array.from({ length: 3000 }, (_, index) =>
        item(`${index}`, { listId: 'long' })
      )
    );

    ordinals(editor);
    const work = measure(() => {
      editor.update.nodes.insert(
        Array.from({ length: 500 }, (_, index) =>
          item(`p${index}`, { listId: 'long' })
        ),
        { at: [1500] }
      );
    });
    const counted = ordinals(editor);

    expect([counted[1499], counted[1500], counted[3499]]).toEqual([
      1500, 1501, 3500,
    ]);
    expect(work.compares).toBeLessThanOrEqual(1500);
  });

  it.each([
    ['restarts after the bullets', undefined, [1, 1, 2]],
    ['never restarts', { '2': { restartAfter: 0 } }, [1, 2, 3]],
  ] as const)(
    'gallops past the bullets between two level-2 items when the level %s',
    (_name, listLevels, expected) => {
      const work = (bullets: number) => {
        const nested = (text: string) =>
          item(text, {
            indent: 2,
            listId: 'gap',
            ...(listLevels ? { listLevels } : {}),
          });
        const editor = editorOf([
          nested('A'),
          ...Array.from({ length: bullets }, (_, index) =>
            item(`b${index}`, { listId: 'gap', listType: 'bulleted' })
          ),
          nested('B'),
        ]);

        ordinals(editor);

        const counts = measure(() => {
          editor.update.nodes.insert(nested('New'), { at: [bullets + 1] });
        });
        const counted = ordinals(editor);

        expect([
          counted[0],
          counted[bullets + 1],
          counted[bullets + 2],
        ]).toEqual(expected);

        return counts.compares;
      };

      const few = work(10);

      for (const bullets of [100, 1000]) {
        expect({ bullets, compares: work(bullets) <= few + 60 }).toEqual({
          bullets,
          compares: true,
        });
      }
    }
  );

  it.each([4, 8])(
    'keeps the closer work per renumbered item flat as the list grows, with %i bullets before each numbered item',
    (gap) => {
      const never = { '2': { restartAfter: 0 } };
      const perVisit = (repeats: number) => {
        const editor = editorOf(
          Array.from({ length: repeats }, (_, repeat) => [
            ...Array.from({ length: gap }, (_item, index) =>
              item(`b${repeat}.${index}`, {
                listId: 'gaps',
                listType: 'bulleted',
              })
            ),
            item(`n${repeat}`, {
              indent: 2,
              listId: 'gaps',
              listLevels: never,
            }),
          ]).flat()
        );

        ordinals(editor);

        const counts = measure(() => {
          editor.update.nodes.insert(
            item('New', { indent: 2, listId: 'gaps', listLevels: never }),
            { at: [gap] }
          );
        });

        expect(ordinals(editor).at(-1)).toBe(repeats + 1);

        return counts.compares / counts.visited;
      };

      const small = perVisit(100);
      const large = perVisit(800);

      expect({ flat: large <= small + 0.5, large, small }).toMatchObject({
        flat: true,
      });
    }
  );

  it('counts a list that descends through every level twice with a search per item', () => {
    const count = 40_000;
    const entries: Array<ListEntry<number>> = Array.from(
      { length: count },
      (_, index) => ({
        facts: {
          id: '',
          level: (index % (count / 2)) + 1,
          levels: undefined,
          numbered: true,
          restart: undefined,
          start: undefined,
        },
        key: index,
        ordinal: undefined,
      })
    );
    const counts = measure(() => countAll(entries));

    expect(
      entries.every(
        ({ ordinal }, index) => ordinal === (index === count / 2 ? 2 : 1)
      )
    ).toBe(true);
    expect(counts.compares).toBeLessThanOrEqual(
      (count / 2) * Math.ceil(Math.log2(count))
    );
  });
});
