import { BaseParagraphPlugin, createEditor } from '../../../core';
import { BaseBlockquotePlugin } from '../../basic-nodes/lib/BaseBlockPlugins';
import { BaseHeadingPlugin } from '../../basic-nodes/lib/BaseHeadingPlugins';
import { BaseBoldPlugin } from '../../basic-nodes/lib/BaseMarkPlugins';
import { BaseListPlugin } from './BaseListPlugin';
import {
  getListIndexMetrics,
  readListOrdinalByKey,
} from './listIndex.internal';
import * as numbering from './listNumbering.internal';

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

type TestEditor = ReturnType<typeof editorOf>;

const numbers = (editor: TestEditor) =>
  editor.read
    .children()
    .map(
      (_, index) => editor.plugin(BaseListPlugin).read.ordinal([index]) ?? null
    );

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

describe('list numbering by identity', () => {
  it('continues one list past a plain paragraph', () => {
    const editor = editorOf([
      item('A', { listId: 'a' }),
      plain('Note'),
      item('B', { listId: 'a' }),
    ]);

    expect(numbers(editor)).toEqual([1, null, 2]);
  });

  it('numbers two interleaved lists on their own', () => {
    const editor = editorOf([
      item('A1', { listId: 'a' }),
      item('B1', { listId: 'b' }),
      item('A2', { listId: 'a' }),
      item('B2', { listId: 'b' }),
    ]);

    expect(numbers(editor)).toEqual([1, 1, 2, 2]);
  });

  it('keeps counting past a heading and a bullet of the same list', () => {
    const editor = editorOf([
      item('One', { listId: 'a' }),
      { ...item('Heading', { level: 1, listId: 'a' }), type: 'heading' },
      item('Bullet', { listId: 'a', listType: 'bulleted' }),
      item('Three', { listId: 'a' }),
    ]);

    expect(numbers(editor)).toEqual([1, 2, null, 3]);
  });

  it('restarts numbered children after each bulleted parent of the list', () => {
    const editor = editorOf([
      item('P', { listId: 'a', listType: 'bulleted' }),
      item('a', { indent: 2, listId: 'a' }),
      item('b', { indent: 2, listId: 'a' }),
      item('Q', { listId: 'a', listType: 'bulleted' }),
      item('c', { indent: 2, listId: 'a' }),
    ]);

    expect(numbers(editor)).toEqual([null, 1, 2, null, 1]);
  });

  it('follows a level that never restarts with a default level below it', () => {
    const levels = { '2': { restartAfter: 0 } };
    const editor = editorOf([
      item('1', { listId: 'w', listLevels: levels }),
      item('1.1', { indent: 2, listId: 'w', listLevels: levels }),
      item('1.1.1', { indent: 3, listId: 'w', listLevels: levels }),
      item('1.2', { indent: 2, listId: 'w', listLevels: levels }),
      item('1.2.1', { indent: 3, listId: 'w', listLevels: levels }),
      item('2', { listId: 'w', listLevels: levels }),
      item('2.3', { indent: 2, listId: 'w', listLevels: levels }),
    ]);

    expect(numbers(editor)).toEqual([1, 1, 1, 2, 1, 2, 3]);
  });

  it('keeps a level start after the first item of its run is removed', () => {
    const levels = { '1': { start: 5 } };
    const editor = editorOf([
      item('First', { listId: 'w', listLevels: levels }),
      item('Second', { listId: 'w', listLevels: levels }),
    ]);

    numbers(editor);
    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    expect(numbers(editor)).toEqual([5]);
  });

  it('numbers id-less items as one default list', () => {
    const editor = editorOf([item('A'), plain('Note'), item('B')]);

    expect(numbers(editor)).toEqual([1, null, 2]);
  });

  it('renumbers after plain paragraphs move around a list in one commit', () => {
    const editor = editorOf([
      plain('P0'),
      plain('P1'),
      item('A', { listId: 'a' }),
      plain('D1', { indent: 2 }),
      plain('D2', { indent: 2 }),
      plain('X'),
      plain('Y'),
      item('B', { listId: 'a' }),
    ]);

    numbers(editor);
    editor.update((tx) => {
      tx.nodes.insert(item('N', { listId: 'a' }), { at: [0] });
      tx.nodes.remove({ at: [1] });
      tx.nodes.remove({ at: [6] });
    });

    expect(numbers(editor)).toEqual([1, null, 2, null, null, null, 3]);
  });

  it('joins pasted list items to the list they land in', () => {
    const editor = editorOf([
      item('A', { listId: 'a' }),
      item('B', { listId: 'a' }),
    ]);

    editor.update.selection.set({
      anchor: { offset: 1, path: [1, 0] },
      focus: { offset: 1, path: [1, 0] },
      kind: 'text',
    });
    editor.update.slice.replace({
      content: [
        item('C', { listId: 'source' }),
        item('D', { listId: 'source' }),
      ],
      openEnd: 0,
      openStart: 0,
    });

    // C merges into B; D, the pasted list's next item, joins list a.
    expect(numbers(editor)).toEqual([1, 2, 3]);
  });

  it('gives a pasted list a fresh id away from any list', () => {
    const editor = editorOf([plain('Note')]);

    editor.update.selection.set({
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
      kind: 'text',
    });
    editor.update.slice.replace({
      content: [
        item('C', { listId: 'source' }),
        item('D', { listId: 'source' }),
      ],
      openEnd: 0,
      openStart: 0,
    });

    const ids = editor.read
      .children()
      .flatMap((node) => (node.listType ? [node.listId] : []));

    expect(new Set(ids).size === 1 && ids[0] !== 'source').toBe(true);
  });

  it('keeps a listed container before the list items it holds', () => {
    const createListEditor = (initialValue: readonly unknown[]) =>
      createEditor({
        initialValue,
        plugins: [
          BaseParagraphPlugin,
          BaseBlockquotePlugin,
          BaseListPlugin.configure({
            targetPlugins: [BaseParagraphPlugin, BaseBlockquotePlugin],
          }),
        ],
      } as never);
    const ordinals = (editor: ReturnType<typeof createListEditor>) =>
      [[0], [0, 0], [1], [2]].map(
        (path) => editor.plugin(BaseListPlugin).read.ordinal(path) ?? null
      );
    const editor = createListEditor([
      {
        children: [item('A', { indent: 2, listId: 'a' })],
        indent: 1,
        listId: 'a',
        listType: 'numbered',
        type: 'blockquote',
      },
      item('B', { listId: 'a' }),
    ]);

    ordinals(editor);
    editor.update.nodes.set({ listStart: 5 }, { at: [0, 0] });
    editor.update.nodes.insert(item('C', { listId: 'a' }), { at: [2] });

    expect(ordinals(editor)).toEqual([1, 5, 2, 3]);
    expect(ordinals(createListEditor(editor.read.children()))).toEqual(
      ordinals(editor)
    );
  });

  it('recounts only the restarted run an insert lands in', () => {
    const insertInto = (runs: number) => {
      const editor = editorOf(
        Array.from({ length: runs }, (_run, run) => [
          ...Array.from({ length: 10 }, (_item, index) =>
            item(`${run}.${index}`, index === 0 ? { listRestart: 1 } : {})
          ),
          plain('Between'),
        ]).flat()
      );
      const at = Math.floor(runs / 2) * 11 + 5;

      numbers(editor);
      const { visited } = measure(() => {
        editor.update.nodes.insert(item('New'), { at: [at] });
      });

      return { numbers: numbers(editor).slice(at - 5, at + 6), visited };
    };
    const few = insertInto(10);

    expect(few.numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(insertInto(300)).toEqual(few);
  });

  it('recounts nothing while typing after a mark toggle in a list item', () => {
    const editor = editorOf([
      item('A', { listId: 'a' }),
      item('B', { listId: 'a' }),
    ]);

    numbers(editor);
    const { visited } = measure(() => {
      editor.update.selection.set({
        anchor: { offset: 1, path: [1, 0] },
        focus: { offset: 1, path: [1, 0] },
        kind: 'text',
      });
      editor.update.marks.toggle('bold');
      editor.update.text.insert('x');
      editor.update.text.insert('y');
    });

    expect(visited).toBe(0);
  });

  it('renumbers past a bullet of the same level after an insert before the list', () => {
    const editor = editorOf([
      item('A', { listId: 'a' }),
      item('B', { listId: 'a', listType: 'bulleted' }),
      item('C', { listId: 'a' }),
    ]);

    numbers(editor);
    editor.update.nodes.insert(item('New', { listId: 'a' }), { at: [0] });

    expect(numbers(editor)).toEqual([1, 2, null, 3]);
  });

  it('renumbers a never-restarting level past a bulleted parent after an insert before it', () => {
    const levels = { '2': { restartAfter: 0 } };
    const at = (text: string, indent: number, listType = 'numbered') =>
      item(text, { indent, listId: 'w', listLevels: levels, listType });
    const editor = editorOf([
      at('P', 1),
      at('x', 2),
      at('Bullet', 1, 'bulleted'),
      at('Nested bullet', 2, 'bulleted'),
      at('y', 2),
    ]);

    numbers(editor);
    editor.update.nodes.insert(at('New', 2), { at: [1] });

    expect(numbers(editor)).toEqual([1, 1, 2, null, null, 3]);
  });

  it('numbers items at a very deep indent without walking the levels above them', () => {
    const deep = 2 ** 32 + 1;
    const editor = editorOf([
      item('A', { indent: deep, listId: 'deep' }),
      item('B', { indent: deep, listId: 'deep' }),
      item('Top', { listId: 'deep' }),
    ]);

    expect(numbers(editor)).toEqual([1, 2, 1]);

    editor.update.nodes.insert(item('C', { indent: deep, listId: 'deep' }), {
      at: [2],
    });

    expect(numbers(editor)).toEqual([1, 2, 3, 1]);
  });

  it('renumbers a quote that moves two items of a list past four others', () => {
    const editor = editorOf([
      item('p'),
      {
        children: [item('x'), item('y')],
        type: 'blockquote',
      },
      item('q'),
      item('m'),
      item('n'),
      item('r'),
      item('s'),
      ...Array.from({ length: 60 }, (_, index) => item(`tail ${index}`)),
    ]);
    const listed = () => {
      const result: Array<[string, number | null]> = [];
      const visit = (nodes: readonly any[], parent: number[]) => {
        nodes.forEach((node, index) => {
          if ('text' in node) return;

          const path = [...parent, index];

          if (node.listType) {
            result.push([
              node.children[0].text,
              editor.plugin(BaseListPlugin).read.ordinal(path) ?? null,
            ]);
          }
          visit(node.children, path);
        });
      };

      visit(editor.read.children(), []);

      return result;
    };

    listed();
    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [5] });
    });

    expect(listed().slice(0, 8)).toEqual([
      ['p', 1],
      ['q', 2],
      ['m', 3],
      ['n', 4],
      ['r', 5],
      ['x', 6],
      ['y', 7],
      ['s', 8],
    ]);
    expect(listed().at(-1)).toEqual(['tail 59', 68]);
  });

  it('renumbers an item that moves away and shifts back onto its old path in one commit', () => {
    const editor = editorOf([
      plain('z'),
      plain('b'),
      item('N', { listId: 'r' }),
      plain('w'),
      item('C', { listId: 'r' }),
      ...Array.from({ length: 10 }, (_, index) =>
        item(`t${index}`, { listId: 'r' })
      ),
    ]);

    numbers(editor);
    editor.update((tx) => {
      tx.nodes.move({ at: [4], to: [1] });
      for (let index = 0; index < 3; index += 1) {
        tx.nodes.insert(plain(`x${index}`), { at: [0] });
      }
    });

    expect(numbers(editor).slice(0, 9)).toEqual([
      null,
      null,
      null,
      null,
      1,
      null,
      2,
      null,
      3,
    ]);

    editor.update.nodes.remove({ at: [6] });

    expect(numbers(editor).at(-1)).toBe(11);
  });

  it('renumbers a quote whose items keep their paths after a move and removals before them', () => {
    const editor = editorOf([
      ...Array.from({ length: 5 }, (_, index) => plain(`plain${index}`)),
      {
        children: [item('B', { listId: 'q' }), item('X', { listId: 'q' })],
        type: 'blockquote',
      },
      ...['C', 'D', 'E', 'F', 'G'].map((text) => item(text, { listId: 'q' })),
      ...Array.from({ length: 100 }, (_, index) =>
        item(`tail${index}`, { listId: 'q' })
      ),
    ]);

    numbers(editor);
    editor.update((tx) => {
      tx.nodes.move({ at: [5], to: [10] });
      for (let index = 0; index < 5; index += 1) tx.nodes.remove({ at: [0] });
    });

    expect(numbers(editor).slice(0, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(
      [0, 1].map(
        (index) =>
          editor.plugin(BaseListPlugin).read.ordinal([5, index]) ?? null
      )
    ).toEqual([6, 7]);
    expect(numbers(editor).at(-1)).toBe(107);
  });

  it('numbers an item at indent 0 as a level shallower than level 1', () => {
    const at = (indents: number[]) =>
      numbers(
        editorOf(
          indents.map((indent, index) =>
            item(`${index}`, { indent, listId: 'z' })
          )
        )
      );

    expect(at([0, 1, 0])).toEqual([1, 1, 2]);
    expect(at([1, 0, 1])).toEqual([1, 1, 1]);
  });

  it('rebuilds the index and reports the error when an update fails', () => {
    const editor = editorOf([item('A'), item('B'), item('C')]);

    numbers(editor);

    const fault = spyOn(numbering, 'changeLanes').mockImplementation(() => {
      throw new Error('lane fault');
    });

    try {
      editor.update.nodes.insert(item('X'), { at: [1] });
    } finally {
      fault.mockRestore();
    }

    expect(
      lifecycleErrors
        .splice(0)
        .map((error: any) => [error.phase, error.cause?.message])
    ).toEqual([['commit-listener', 'lane fault']]);
    expect(
      [0, 1, 2, 3].map((index) =>
        readListOrdinalByKey(editor, 'main', editor.key([index])!)
      )
    ).toEqual([1, 2, 3, 4]);
  });

  it('renumbers the only two items of a list after they swap', () => {
    const editor = editorOf([
      item('A', { listId: 's' }),
      item('B', { listId: 's' }),
      plain('end'),
    ]);

    numbers(editor);
    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });

    expect(numbers(editor)).toEqual([1, 2, null]);
    expect(editor.read.children()[0]).toMatchObject({ listId: 's' });
  });

  it.each([
    ['when the list loads', false],
    ['after an insert between them', true],
  ])(
    'keeps a never-restarting level counting past a list item at indent 0 %s',
    (_name, inserted) => {
      const never = { '2': { restartAfter: 0 } };
      const nested = (text: string) =>
        item(text, { indent: 2, listId: 'z', listLevels: never });
      const bullet = item('Bullet', {
        indent: 0,
        listId: 'z',
        listType: 'bulleted',
      });
      const editor = editorOf(
        inserted
          ? [nested('A'), nested('B')]
          : [nested('A'), bullet, nested('B')]
      );

      if (inserted) {
        numbers(editor);
        editor.update.nodes.insert(bullet, { at: [1] });
      }

      expect(numbers(editor)).toEqual([1, null, 2]);
    }
  );

  it('renumbers the item after a moved item that keeps its number', () => {
    const editor = editorOf([
      item('R1', { listId: 'a', listRestart: 1 }),
      item('Moved', { listId: 'a' }),
      item('Q', { listId: 'a', listRestart: 1 }),
      item('B', { listId: 'a', listRestart: 1 }),
      item('After', { listId: 'a' }),
      ...Array.from({ length: 60 }, (_, index) =>
        item(`Tail ${index}`, { listId: 'a' })
      ),
    ]);

    numbers(editor);
    editor.update.nodes.move({ at: [1], to: [3] });

    expect(numbers(editor).slice(0, 6)).toEqual([1, 1, 1, 2, 3, 4]);
    expect(numbers(editor).at(-1)).toBe(63);
  });

  it('restarts a level by the rule of the item it counts, not of the item that closes it', () => {
    const never = { '2': { restartAfter: 0 } };
    const editor = editorOf([
      item('P1', { listId: 'a' }),
      item('x1', { indent: 2, listId: 'a', listLevels: never }),
      item('P2', { listId: 'a' }),
      item('x2', { indent: 2, listId: 'a', listLevels: never }),
      item('Q1', { listId: 'b' }),
      item('y1', { indent: 2, listId: 'b' }),
      item('Q2', { listId: 'b', listLevels: never }),
      item('y2', { indent: 2, listId: 'b' }),
    ]);

    expect(numbers(editor)).toEqual([1, 1, 2, 2, 1, 1, 2, 1]);
  });

  it('renumbers both runs of a batch with two far-apart inserts, visiting only those runs', () => {
    const editor = editorOf(
      Array.from({ length: 100 }, (_run, run) => [
        ...Array.from({ length: 10 }, (_item, index) =>
          item(`${run}.${index}`, index === 0 ? { listRestart: 1 } : {})
        ),
        plain('Between'),
      ]).flat()
    );
    const last = 90 * 11;

    numbers(editor);
    const { visited } = measure(() => {
      editor.update((tx) => {
        tx.nodes.insert(item('First'), { at: [5] });
        tx.nodes.insert(item('Last'), { at: [last + 6] });
      });
    });
    const counted = numbers(editor);
    const run = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    expect(counted.slice(0, 11)).toEqual(run);
    expect(counted.slice(last + 1, last + 12)).toEqual(run);
    expect(visited).toBeLessThanOrEqual(16);
  });
});
