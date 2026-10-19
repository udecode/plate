import * as Y from 'yjs';

import { AuthoredPlugin } from '../../../authored';
import { authoredTestApi } from '../../../authored/__tests__/authoredTestApi';
import {
  NodeApi,
  type Range,
  type Value,
  createEditor,
  createEditorView,
} from '../../../core';
import { getPlateDecorationSources } from '../../../internal/plugin/getPlateDecorationSources';
import { YjsPlugin } from '../../../yjs/react';
import { BaseBlockquotePlugin } from '../../basic-nodes/lib/BaseBlockPlugins';
import { BaseHeadingPlugin } from '../../basic-nodes/lib/BaseHeadingPlugins';
import { BaseBoldPlugin } from '../../basic-nodes/lib/BaseMarkPlugins';
import { NoteHolder } from '../../details/__tests__/detailsConversionFixture';
import { BaseLinkPlugin } from '../../link';
import { BaseLintPlugin, type LintRule } from './BaseLintPlugin';

const counted = (pattern: RegExp, id: string, fixes?: string[]) => {
  const rule = {
    calls: 0,
    id,
    severity: 'warning',
    check: (text: string) => {
      rule.calls += 1;

      return Array.from(text.matchAll(pattern), (match) => ({
        end: match.index + match[0].length,
        fixes,
        message: `No ${match[0]}.`,
        start: match.index,
      }));
    },
  } satisfies LintRule & { calls: number };

  return rule;
};

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const setup = (children: Value, rules: LintRule[]) => {
  const editor = createEditor({
    initialValue: children,
    plugins: [
      BaseBlockquotePlugin,
      BaseLinkPlugin,
      BaseLintPlugin.configure({ initialState: { rules } }),
    ],
  });

  return { editor, lint: editor.plugin(BaseLintPlugin) };
};

type Setup = ReturnType<typeof setup>;

/** Every rule over the whole document through the editor's own text runs. */
const oracle = ({ editor, lint }: Setup) =>
  lint.store.get('rules').flatMap((rule, ruleIndex) => {
    const messages: string[] = [];
    const ranges = NodeApi.findTextRanges(
      editor,
      (text, [block]) => {
        const matches = Array.from(
          rule.check(text, {
            block: block as never,
            editor,
            signal: new AbortController().signal,
          }) as Iterable<{ end: number; message: string; start: number }>
        );

        messages.push(...matches.map((match) => match.message));

        return matches;
      },
      { content: true }
    );

    return ranges.map((range, index) => ({
      message: messages[index],
      range,
      ruleIndex,
    }));
  });

const comparePoints = (a: Range['anchor'], b: Range['anchor']) => {
  for (let index = 0; index < Math.min(a.path.length, b.path.length); index++) {
    if (a.path[index] !== b.path[index]) return a.path[index] - b.path[index];
  }

  return a.path.length - b.path.length || a.offset - b.offset;
};

const expectOracle = (current: Setup) => {
  const expected = oracle(current).sort(
    (a, b) =>
      comparePoints(a.range.anchor, b.range.anchor) ||
      comparePoints(a.range.focus, b.range.focus) ||
      a.ruleIndex - b.ruleIndex
  );
  const actual = current.lint.api.findings().map((finding) => {
    expect(current.lint.update.select(finding.id)).toBe(true);

    return { message: finding.message, range: current.editor.read.selection() };
  });

  expect(actual).toEqual(
    expected.map(({ message, range }) => ({ message, range }))
  );
};

describe('local rules', () => {
  test('fixes a main finding while the caret is in a named root', () => {
    const editor = createEditor({
      plugins: [
        NoteHolder,
        BaseLintPlugin.configure({
          initialState: { rules: [counted(/bad/g, 'bad', ['good'])] },
        }),
      ],
      initialValue: {
        children: [
          paragraph('bad'),
          {
            type: 'listNoteHolder',
            childRoots: { body: 'note' },
            children: [{ text: '' }],
          },
        ],
        roots: { note: [paragraph('Note')] },
      },
    });
    const lint = editor.plugin(BaseLintPlugin);
    const [finding] = lint.api.findings();
    const note = editor.read.root('note');
    editor.update.selection.set({ path: [0, 0], offset: 0, root: 'note' });

    const fixed = lint.update.fix(finding.id);

    expect({
      fixed,
      main: editor.read.text.string([0]),
      note: editor.read.root('note'),
    }).toEqual({ fixed: true, main: 'good', note });
  });
  for (const size of [100, 2000]) {
    test(`calls each rule once per keystroke and rebuilds the list without key lookups at ${size} blocks, nested blocks included`, () => {
      const bad = counted(/bad/g, 'bad');
      const ok = counted(/ok/g, 'ok');
      const children = Array.from({ length: size }, (_, index) =>
        index % 10 === 0
          ? {
              children: [paragraph(`quote ${index} bad`)],
              type: 'blockquote',
            }
          : paragraph(`line ${index} bad ok`)
      );
      const { editor, lint } = setup(children, [bad, ok]);

      lint.api.findings();
      bad.calls = 0;
      ok.calls = 0;
      editor.update.text.insert('x', { at: { path: [10, 0, 0], offset: 0 } });
      editor.update.text.insert('ok', { at: { path: [11, 0], offset: 0 } });

      const keys = spyOn(editor, 'key');

      expect(lint.api.findings()).toHaveLength(size * 2 - size / 10 + 1);
      expect([bad.calls, ok.calls]).toEqual([2, 2]);
      expect(keys).not.toHaveBeenCalled();
    });
  }

  test('lists findings in document order after each kind of edit', () => {
    const setupResult = setup(
      [
        paragraph('ok bad'),
        {
          children: [
            { text: 'bad ' },
            {
              children: [{ text: 'ok link' }],
              type: 'link',
              url: 'https://platejs.org',
            },
            { text: ' bad' },
          ],
          type: 'paragraph',
        },
        { children: [paragraph('quoted bad ok')], type: 'blockquote' },
        paragraph('tail ok'),
      ],
      [counted(/bad/g, 'bad'), counted(/ok/g, 'ok')]
    );
    const { editor } = setupResult;

    expectOracle(setupResult);
    editor.update.text.insert(' bad', { at: { path: [0, 0], offset: 6 } });
    expectOracle(setupResult);
    editor.update.nodes.move({ at: [3], to: [0] });
    expectOracle(setupResult);
    editor.update.nodes.remove({ at: [1] });
    expectOracle(setupResult);
    editor.update.nodes.split({ at: { path: [0, 0], offset: 4 } });
    expectOracle(setupResult);
    editor.update.nodes.merge({ at: [1] });
    expectOracle(setupResult);
    editor.update.nodes.insert([paragraph('pasted bad'), paragraph('ok ok')], {
      at: [1],
    });
    expectOracle(setupResult);
    editor.update.value.replace({
      children: [paragraph('ok'), paragraph('bad bad')],
    });
    expectOracle(setupResult);
  });

  test('keeps ids while typing outside findings and refuses ids whose text changed', () => {
    const { editor, lint } = setup(
      [paragraph('bad x bad'), paragraph('bad bad ok')],
      [counted(/bad/g, 'bad', ['good'])]
    );
    const ids = () => lint.api.findings().map((finding) => finding.id);
    const before = ids();

    editor.update.text.insert('a', { at: { path: [0, 0], offset: 0 } });
    editor.update.text.insert('b', { at: { path: [0, 0], offset: 5 } });
    editor.update.text.insert('c', { at: { path: [0, 0], offset: 11 } });
    expect(ids()).toEqual(before);

    const [first, second] = before;

    editor.update.text.insert('z', { at: { path: [0, 0], offset: 3 } });
    expect(lint.update.fix(first)).toBe(false);
    expect(lint.update.select(second)).toBe(false);

    const [repeated] = ids().slice(-2);

    editor.update.text.delete({
      at: {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      },
    });
    expect(lint.update.fix(repeated)).toBe(false);
  });

  for (const [from, to] of [
    ['bad bad ok', 'bad ok bad'],
    ['bad ok bad', 'bad bad ok'],
  ]) {
    test(`refuses old ids after "${from}" becomes "${to}" in one update`, () => {
      const { editor, lint } = setup(
        [paragraph(from)],
        [counted(/bad/g, 'bad', ['good'])]
      );
      const old = lint.api.findings().map((finding) => finding.id);

      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: from.length },
          },
        });
        tx.text.insert(to, { at: { path: [0, 0], offset: 0 } });
      });

      expect(lint.api.findings()).toHaveLength(2);
      for (const id of old) expect(lint.update.fix(id)).toBe(false);
    });
  }

  test('refuses every id after the rules change', () => {
    const { lint } = setup([paragraph('bad')], [counted(/bad/g, 'bad', ['x'])]);
    const [id] = lint.api.findings().map((finding) => finding.id);

    lint.api.run([counted(/bad/g, 'bad', ['x'])]);

    expect(lint.api.findings()).toHaveLength(1);
    expect(lint.update.fix(id)).toBe(false);
  });
});

describe('selection, fixes and paint', () => {
  test('reads the finding under the caret from its block alone and keeps its identity', () => {
    const rule = counted(/bad/g, 'bad');
    const { editor, lint } = setup(
      Array.from({ length: 100 }, (_, index) => paragraph(`line ${index} bad`)),
      [rule]
    );

    editor.update.text.insert(' bad', { at: { path: [5, 0], offset: 0 } });
    expect(lint.store.get('version')).toBe(1);
    rule.calls = 0;
    editor.update.selection.set({ path: [0, 0], offset: 8 });

    const finding = lint.api.at();

    expect(finding?.text).toBe('bad');
    expect(rule.calls).toBe(1);
    editor.update.selection.set({ path: [0, 0], offset: 9 });
    lint.store.set({ error: null });
    expect(lint.api.at()).toBe(finding);
    editor.update.selection.set({ path: [0, 0], offset: 2 });
    expect(lint.api.at()).toBeNull();
    expect(rule.calls).toBe(1);
  });

  test('applies a fix as its own undo step and leaves the caret after it', () => {
    const { editor, lint } = setup(
      [paragraph('one ba two')],
      [counted(/bad/g, 'bad', ['good', 'fine'])]
    );

    editor.update.text.insert('d', { at: { path: [0, 0], offset: 6 } });

    const [finding] = lint.api.findings();

    expect(lint.update.fix(finding.id, 1)).toBe(true);
    expect(NodeApi.string(editor.read.children()[0])).toBe('one fine two');
    expect(editor.read.selection()).toEqual({
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    });
    expect(lint.update.fix(finding.id)).toBe(false);
    editor.api.history.undo();
    expect(NodeApi.string(editor.read.children()[0])).toBe('one bad two');
  });

  test('keeps two removal fixes in a row as two undo steps', () => {
    const { editor, lint } = setup(
      [paragraph('really very x')],
      [counted(/(?:really|very) /g, 'filler', [''])]
    );

    expect(lint.update.fix(lint.api.findings()[1].id)).toBe(true);
    expect(lint.update.fix(lint.api.findings()[0].id)).toBe(true);
    expect(NodeApi.string(editor.read.children()[0])).toBe('x');
    editor.api.history.undo();
    expect(NodeApi.string(editor.read.children()[0])).toBe('really x');
  });

  test('fixes a finding that starts inside a link the fix empties and leaves the caret after it', () => {
    const { editor, lint } = setup(
      [
        {
          children: [
            { text: 'x ' },
            {
              children: [{ text: 'bad' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: ' y z' },
          ],
          type: 'paragraph',
        },
      ],
      [counted(/bad y/g, 'bad', [''])]
    );
    const [finding] = lint.api.findings();

    expect(lint.update.fix(finding.id)).toBe(true);
    expect(editor.read.children()).toEqual([paragraph('x  z')]);
    expect(editor.read.selection()).toEqual({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  test('fixes inside the command document a suggesting editor registers', () => {
    const editor = createEditor({
      initialValue: [paragraph('one bad')],
      plugins: [
        BaseLintPlugin.configure({
          initialState: { rules: [counted(/bad/g, 'bad', ['good'])] },
        }),
        AuthoredPlugin,
      ],
    });
    const lint = editor.plugin(BaseLintPlugin);
    const [finding] = lint.api.findings();

    authoredTestApi(editor).setIntent('propose');

    expect(lint.update.fix(finding.id)).toBe(true);
    expect(
      NodeApi.findTextRanges(editor, 'one good', { content: true })
    ).toHaveLength(1);
    expect(NodeApi.string(editor.read.children()[0])).toContain('bad');
    expect(lint.api.findings()).toEqual([]);
  });

  test('moves between findings in order and wraps', () => {
    const { editor, lint } = setup(
      [paragraph('bad one'), paragraph('two bad')],
      [counted(/bad/g, 'bad')]
    );
    const selected = () =>
      NodeApi.string(
        editor.read.children()[editor.read.selection()!.anchor.path[0]]
      );
    const ranges = lint.api.findings().map((finding) => {
      lint.update.select(finding.id);

      return editor.read.selection();
    });

    editor.update.selection.set({ path: [0, 0], offset: 0 });
    lint.update.move(1);
    expect(editor.read.selection()).toEqual(ranges[0]);
    lint.update.move(1);
    expect(editor.read.selection()).toEqual(ranges[1]);
    lint.update.move(1);
    expect(editor.read.selection()).toEqual(ranges[0]);
    lint.update.move(-1);
    expect(editor.read.selection()).toEqual(ranges[1]);
    expect(selected()).toBe('two bad');
  });

  test('keeps the list current when navigation runs in the update that edits', () => {
    const { editor, lint } = setup(
      [paragraph('one bad two')],
      [counted(/bad/g, 'bad')]
    );

    expect(lint.api.findings().map((finding) => finding.text)).toEqual(['bad']);

    const version = lint.store.get('version');

    editor.update((tx) => {
      tx.text.insert('x', { at: { path: [0, 0], offset: 5 } });
      expect(tx.plugin(BaseLintPlugin).move(1)).toBe(false);
    });
    expect(lint.store.get('version')).toBeGreaterThan(version);
    expect(lint.api.findings()).toEqual([]);
  });

  test('moves to a finding the same update wrote', () => {
    const { editor, lint } = setup(
      [paragraph('one two')],
      [counted(/bad/g, 'bad')]
    );

    expect(lint.api.findings()).toEqual([]);
    editor.update((tx) => {
      tx.text.insert(' bad', { at: { path: [0, 0], offset: 3 } });
      tx.selection.set({ path: [0, 0], offset: 0 });
      expect(tx.plugin(BaseLintPlugin).move(1)).toBe(true);
    });
    expect(editor.read.selection()).toEqual({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 7 },
    });
    expect(lint.api.findings().map((finding) => finding.text)).toEqual(['bad']);
  });

  test('keeps ids after an update that navigated and threw', () => {
    const { editor, lint } = setup(
      [paragraph('one bad two')],
      [counted(/bad/g, 'bad')]
    );
    const [finding] = lint.api.findings();

    expect(() =>
      editor.update((tx) => {
        tx.text.insert('x', { at: { path: [0, 0], offset: 5 } });
        tx.plugin(BaseLintPlugin).move(1);
        throw new Error('rolled back');
      })
    ).toThrow('rolled back');
    expect(lint.update.select(finding.id)).toBe(true);
  });

  test('publishes no failure from an update that navigated and threw', async () => {
    const { editor, lint } = setup(
      [paragraph('bad')],
      [
        {
          id: 'fragile',
          severity: 'error',
          check: (text) => {
            if (text.endsWith('!')) throw new Error('draft');

            return [];
          },
        },
      ]
    );

    lint.api.findings();
    expect(() =>
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
        tx.plugin(BaseLintPlugin).move(1);
        throw new Error('rolled back');
      })
    ).toThrow('rolled back');
    await Promise.resolve();
    expect(lint.store.get('error')).toBeNull();
  });

  test('paints one key per content segment and never paints struck text', () => {
    const struck = { at: 1, author: 'bob', change: 'bob:1', kind: 'delete' };
    const editor = createEditor({
      initialValue: [
        {
          children: [
            { text: 'ba' },
            { authored: [struck], text: 'XX' },
            { text: 'd' },
          ],
          type: 'paragraph',
        },
      ] as never,
      plugins: [
        BaseLintPlugin.configure({
          initialState: { rules: [counted(/bad/g, 'bad')] },
        }),
        AuthoredPlugin,
      ],
    });
    const [source] = getPlateDecorationSources(editor);
    const decorations = source.read({
      editor,
      entry: editor.read.nodes.get([0])!,
    });

    expect(
      decorations.map(({ key, range }) => [key.split(':').at(-1), range])
    ).toEqual([
      [
        '1',
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 2 },
        },
      ],
      [
        '2',
        {
          anchor: { path: [0, 2], offset: 0 },
          focus: { path: [0, 2], offset: 1 },
        },
      ],
    ]);
    expect(new Set(decorations.map(({ key }) => key)).size).toBe(2);
  });

  test('paints nothing in a view of another document', () => {
    const { editor } = setup([paragraph('bad')], [counted(/bad/g, 'bad')]);
    const [source] = getPlateDecorationSources(editor);
    const view = createEditorView(editor, {
      document: { children: [paragraph('bad other')] },
    });

    expect(
      source.read({ editor, entry: editor.read.nodes.get([0])! })
    ).toHaveLength(1);
    expect(
      source.read({ editor: view, entry: view.read.nodes.get([0])! })
    ).toEqual([]);
  });

  test('runs, clears and runs again', () => {
    const { editor, lint } = setup(
      [paragraph('bad')],
      [counted(/bad/g, 'bad')]
    );
    const [source] = getPlateDecorationSources(editor);
    const paint = () =>
      source.read({ editor, entry: editor.read.nodes.get([0])! }).length;

    lint.api.run();
    expect([lint.api.findings().length, paint()]).toEqual([1, 1]);

    const [finding] = lint.api.findings();

    lint.api.clear();
    expect(lint.store.get('active')).toBe(false);
    expect([lint.api.findings().length, paint()]).toEqual([0, 0]);
    expect(lint.update.select(finding.id)).toBe(false);
    lint.api.run();
    expect([lint.api.findings().length, paint()]).toEqual([1, 1]);
  });

  test('contains a throwing rule to its block and publishes the failure', () => {
    const failure = new Error('boom');
    const { lint } = setup(
      [paragraph('bad boom'), paragraph('bad')],
      [
        {
          id: 'fragile',
          severity: 'error',
          check: (text) => {
            if (text.includes('boom')) throw failure;

            return [{ end: 3, message: 'fragile', start: 0 }];
          },
        },
        counted(/bad/g, 'bad'),
      ]
    );

    lint.api.run();

    expect(lint.store.get('error')).toBe(failure);
    expect(lint.api.findings().map((finding) => finding.message)).toEqual([
      'No bad.',
      'fragile',
      'No bad.',
    ]);
  });

  test('publishes a rule failure from the first list read without an edit', async () => {
    const failure = new Error('boom');
    const { lint } = setup(
      [paragraph('boom')],
      [
        {
          id: 'fragile',
          severity: 'error',
          check: () => {
            throw failure;
          },
        },
      ]
    );

    expect(lint.api.findings()).toEqual([]);
    expect(lint.store.get('error')).toBeNull();

    await Promise.resolve();
    expect(lint.store.get('error')).toBe(failure);
  });
});

const tick = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const server = () => {
  const calls: Array<{
    reject: (error: Error) => void;
    resolve: (
      matches: Iterable<{ end: number; message: string; start: number }>
    ) => void;
    signal: AbortSignal;
    text: string;
  }> = [];
  const rule: LintRule = {
    id: 'server',
    severity: 'info',
    check: (text, { signal }) =>
      new Promise((resolve, reject) => {
        calls.push({ reject, resolve, signal, text });
      }),
  };

  return { calls, rule };
};

describe('server rules', () => {
  test('drops a reply for old text and sends the latest text without another edit', async () => {
    const { calls, rule } = server();
    const { editor, lint } = setup([paragraph('server words')], [rule]);

    lint.api.run();
    editor.update.text.insert('!', { at: { path: [0, 0], offset: 12 } });
    calls[0].resolve([{ end: 6, message: 'old', start: 0 }]);
    await tick();

    expect(lint.api.findings()).toEqual([]);
    expect(calls.map((call) => call.text)).toEqual([
      'server words',
      'server words!',
    ]);
    calls[1].resolve([{ end: 6, message: 'new', start: 0 }]);
    await tick();
    expect(lint.api.findings().map((finding) => finding.message)).toEqual([
      'new',
    ]);
  });

  test('keeps the accepted reply when a block returns to the text it had', async () => {
    const { calls, rule } = server();
    const { editor, lint } = setup([paragraph('server words')], [rule]);

    lint.api.run();
    calls[0].resolve([{ end: 6, message: 'kept', start: 0 }]);
    await tick();
    editor.update.text.insert('!', { at: { path: [0, 0], offset: 12 } });
    editor.update.text.delete({ at: { path: [0, 0], offset: 12 } });
    calls[1].resolve([{ end: 6, message: 'old', start: 0 }]);
    await tick();

    expect(lint.api.findings().map((finding) => finding.message)).toEqual([
      'kept',
    ]);
    expect(calls.map((call) => call.text)).toEqual([
      'server words',
      'server words!',
    ]);
  });

  test('lists a server finding inside a container once its reply lands', async () => {
    const { calls, rule } = server();
    const { lint } = setup(
      [{ children: [paragraph('server words')], type: 'blockquote' }],
      [rule]
    );

    lint.api.run();
    expect(lint.api.findings()).toEqual([]);
    calls[0].resolve([{ end: 6, message: 'late', start: 0 }]);
    await tick();
    expect(lint.api.findings().map((finding) => finding.message)).toEqual([
      'late',
    ]);
  });

  test('ignores requests from before clear or run', async () => {
    const { calls, rule } = server();
    const { lint } = setup([paragraph('server words')], [rule]);

    lint.api.run();
    lint.api.run();
    expect(calls[0].signal.aborted).toBe(true);
    calls[0].resolve([{ end: 6, message: 'stale', start: 0 }]);
    await tick();
    expect(lint.api.findings()).toEqual([]);
    lint.api.clear();
    calls[1].resolve([{ end: 6, message: 'stale', start: 0 }]);
    await tick();
    lint.api.run();
    expect(lint.api.findings()).toEqual([]);
  });

  test('keeps four requests per rule, sends edits first and keeps the run moving', async () => {
    const { calls, rule } = server();
    const { editor, lint } = setup(
      Array.from({ length: 10 }, (_, index) => paragraph(`w${index}`)),
      [rule]
    );
    const edit = (index: number) =>
      editor.update.text.insert('!', { at: { path: [index, 0], offset: 2 } });

    lint.api.run();
    expect(calls.map((call) => call.text)).toEqual(['w0', 'w1', 'w2', 'w3']);
    edit(9);
    calls[0].resolve([]);
    await tick();
    expect(calls.at(-1)?.text).toBe('w9!');

    for (const index of [1, 2, 3]) edit(index);
    for (const call of calls.slice(1, 4)) call.resolve([]);
    await tick();
    expect(calls.slice(5).map((call) => call.text)).toEqual([
      'w1!',
      'w2!',
      'w4',
    ]);
  });

  test('repaints a block at once when an edit drops its server findings', async () => {
    const { calls, rule } = server();
    const { editor, lint } = setup([paragraph('server words')], [rule]);
    const [source] = getPlateDecorationSources(editor);
    const refreshes: unknown[] = [];
    const stop = source.observe!({
      editor,
      refresh: ({ nodeKeys }) => refreshes.push(nodeKeys),
    });
    const key = editor.key([0])!;

    lint.api.run();
    calls[0].resolve([{ end: 6, message: 'server', start: 0 }]);
    await tick();
    expect(
      source.read({ editor, entry: editor.read.nodes.get([0])! })
    ).toHaveLength(1);
    refreshes.length = 0;
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 2 } });

    expect(refreshes).toEqual([[key]]);
    expect(source.read({ editor, entry: editor.read.nodes.get([0])! })).toEqual(
      []
    );
    stop();
  });

  test('asks again and drops the old reply when a block keeps its text but changes type', async () => {
    const sent: Array<{
      resolve: (
        matches: Array<{ end: number; message: string; start: number }>
      ) => void;
      type: string;
    }> = [];
    const editor = createEditor({
      initialValue: [paragraph('web site')],
      plugins: [
        BaseHeadingPlugin,
        BaseLintPlugin.configure({
          initialState: {
            rules: [
              {
                id: 'server',
                severity: 'info',
                check: (_text, { block }) =>
                  new Promise((resolve) => {
                    sent.push({ resolve, type: block.type });
                  }),
              },
            ],
          },
        }),
      ],
    });
    const lint = editor.plugin(BaseLintPlugin);

    lint.api.run();
    sent[0].resolve([{ end: 8, message: 'Write "website".', start: 0 }]);
    await tick();
    expect(lint.api.findings().map((finding) => finding.message)).toEqual([
      'Write "website".',
    ]);

    editor.update.nodes.set({ level: 1, type: 'heading' }, { at: [0] });

    expect(lint.api.findings()).toEqual([]);
    expect(sent.map((call) => call.type)).toEqual(['paragraph', 'heading']);
  });

  test('sends queued blocks when the blocks in flight are removed', () => {
    const { calls, rule } = server();
    const { editor, lint } = setup(
      Array.from({ length: 10 }, (_, index) => paragraph(`block ${index}`)),
      [rule]
    );

    lint.api.run();
    expect(calls).toHaveLength(4);
    for (let index = 0; index < 4; index += 1) {
      editor.update.nodes.remove({ at: [0] });
    }

    expect(calls.map((call) => call.text)).toEqual(
      Array.from({ length: 8 }, (_, index) => `block ${index}`)
    );
  });

  test('sends the latest text when the request for older text fails', async () => {
    const { calls, rule } = server();
    const { editor, lint } = setup([paragraph('server words')], [rule]);

    lint.api.run();
    editor.update.text.insert('!', { at: { path: [0, 0], offset: 12 } });
    calls[0].reject(new Error('offline'));
    await tick();

    expect(calls.map((call) => call.text)).toEqual([
      'server words',
      'server words!',
    ]);
  });

  test('publishes a reply whose matches throw and keeps sending', async () => {
    const { calls, rule } = server();
    const { lint } = setup(
      Array.from({ length: 5 }, (_, index) => paragraph(`block ${index}`)),
      [rule]
    );

    lint.api.run();
    calls[0].resolve(
      (function* throwingMatches() {
        yield* [];
        throw new Error('bad matches');
      })()
    );
    await tick();

    expect(lint.store.get('error')?.message).toBe('bad matches');
    expect(calls).toHaveLength(5);
  });

  test('keeps four requests when blocks in flight go and queued blocks change in one update', () => {
    const { calls, rule } = server();
    const { editor, lint } = setup(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((name) => paragraph(`block ${name}`)),
      [rule]
    );

    lint.api.run();
    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      tx.nodes.remove({ at: [0] });
      tx.text.insert('!', { at: { path: [2, 0], offset: 7 } });
      tx.text.insert('!', { at: { path: [3, 0], offset: 7 } });
    });

    expect(calls.filter((call) => !call.signal.aborted)).toHaveLength(4);
    lint.api.clear();
    expect(calls.every((call) => call.signal.aborted)).toBe(true);
  });

  test('keeps one finding when an update that navigated into a server check throws', async () => {
    const { calls, rule } = server();
    const { editor, lint } = setup(
      [paragraph('bad')],
      [
        {
          ...rule,
          check: (text, context) =>
            text.endsWith('!')
              ? rule.check(text, context)
              : [{ end: 3, message: 'local', start: 0 }],
        },
      ]
    );
    const [finding] = lint.api.findings();

    expect(() =>
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 3 } });
        tx.plugin(BaseLintPlugin).move(1);
        throw new Error('rolled back');
      })
    ).toThrow('rolled back');
    for (const call of calls) {
      call.resolve([{ end: 3, message: 'server', start: 0 }]);
    }
    await tick();

    expect(lint.api.findings().map(({ id }) => id)).toEqual([finding.id]);
  });

  test('aborts the request of a removed block that navigation checked first', () => {
    const { calls, rule } = server();
    const { editor, lint } = setup(
      [paragraph('one'), paragraph('two')],
      [rule]
    );

    editor.update.selection.set({ path: [1, 0], offset: 0 });
    lint.update.move(1);
    editor.update.nodes.remove({ at: [0] });

    const removed = calls.filter((call) => call.text === 'one');

    expect(removed.length).toBeGreaterThan(0);
    expect(removed.every((call) => call.signal.aborted)).toBe(true);
  });

  test('repaints a block when the server result that holds for its text changes', async () => {
    const first = server();
    const second = server();
    const { editor } = setup(
      [paragraph('aaaa')],
      [first.rule, { ...second.rule, id: 'second' }]
    );
    const [source] = getPlateDecorationSources(editor);
    const refreshes: unknown[] = [];
    const stop = source.observe!({
      editor,
      refresh: ({ nodeKeys }) => refreshes.push(nodeKeys),
    });

    editor.plugin(BaseLintPlugin).api.run();
    first.calls[0].resolve([{ end: 1, message: 'first', start: 0 }]);
    second.calls[0].resolve([]);
    await tick();
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 4 } });
    second.calls[1].resolve([{ end: 2, message: 'second', start: 1 }]);
    await tick();
    refreshes.length = 0;
    editor.update.text.delete({ at: { path: [0, 0], offset: 4 } });

    expect(refreshes).toEqual([[editor.key([0])]]);
    stop();
  });

  test('drops the reply of a rule that a subscriber removed while a failure settled', async () => {
    const { calls, rule } = server();
    const { editor, lint } = setup([paragraph('server words')], [rule]);

    lint.api.run();
    editor.update.text.insert('!', { at: { path: [0, 0], offset: 12 } });

    const stop = lint.store.subscribe(() => {
      if (lint.store.get('error') && lint.store.get('rules').length > 0) {
        lint.api.run([]);
      }
    });

    calls[0].reject(new Error('offline'));
    await tick();
    stop();
    for (const call of calls.slice(1)) {
      call.resolve([{ end: 6, message: 'old rule', start: 0 }]);
    }
    await tick();

    expect(lint.api.findings()).toEqual([]);
  });

  test('asks the server again after a mark changes', async () => {
    const { calls, rule } = server();
    const editor = createEditor({
      initialValue: [paragraph('server words')],
      plugins: [
        BaseBoldPlugin,
        BaseLintPlugin.configure({ initialState: { rules: [rule] } }),
      ],
    });

    editor.plugin(BaseLintPlugin).api.run();
    calls[0].resolve([{ end: 6, message: 'server', start: 0 }]);
    await tick();
    editor.update.nodes.set({ bold: true }, { at: [0, 0] });

    expect(calls).toHaveLength(2);
  });

  test('publishes a rejected server check', async () => {
    const { calls, rule } = server();
    const { lint } = setup([paragraph('server words')], [rule]);
    const failure = new Error('offline');

    lint.api.run();
    calls[0].reject(failure);
    await tick();

    expect(lint.store.get('error')).toBe(failure);
  });

  test('publishes a server check that throws inside a list read after the read', async () => {
    const failure = new Error('offline');
    let calls = 0;
    const { editor, lint } = setup(
      [paragraph('server words')],
      [
        {
          id: 'server',
          severity: 'info',
          check: () => {
            calls += 1;
            if (calls > 1) throw failure;

            return new Promise(() => {});
          },
        },
      ]
    );

    lint.api.run();
    editor.update.value.replace({ children: [paragraph('server text')] });

    const errors: Array<Error | null> = [];
    const stop = lint.store.subscribe(() => {
      errors.push(lint.store.get('error'));
    });

    lint.api.findings();
    expect(errors).toEqual([]);

    await Promise.resolve();
    expect(errors).toEqual([failure]);
    stop();
  });

  test('re-checks a block a collaborator edits', async () => {
    const deliver = (from: Y.Doc, to: Y.Doc) => {
      Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));
    };
    const peer = (doc: Y.Doc, seed: boolean, rules: LintRule[]) =>
      createEditor({
        initialValue: [paragraph('server bad')],
        plugins: [
          BaseLintPlugin.configure({ initialState: { rules } }),
          YjsPlugin.create({
            doc,
            initialReady: true,
            ...(seed ? { seed: true } : {}),
          }),
        ],
      });
    const docs = [new Y.Doc(), new Y.Doc()];
    const { calls, rule } = server();
    const writer = peer(docs[0], true, []);

    deliver(docs[0], docs[1]);

    const reader = peer(docs[1], false, [
      counted(/bad/g, 'bad', ['good']),
      rule,
    ]);
    const lint = reader.plugin(BaseLintPlugin);

    lint.api.run();

    const [local] = lint.api.findings();

    writer.update.text.insert('x', { at: { path: [0, 0], offset: 9 } });
    deliver(docs[0], docs[1]);
    expect(NodeApi.string(reader.read.children()[0])).toBe('server baxd');

    calls[0].resolve([{ end: 6, message: 'old', start: 0 }]);
    await tick();
    expect(calls.map((call) => call.text)).toEqual([
      'server bad',
      'server baxd',
    ]);
    expect(lint.api.findings()).toEqual([]);
    expect(lint.update.fix(local.id)).toBe(false);
  });
});
