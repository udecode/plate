import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  defineEditorSchema,
  defineEffect,
  definePlugin,
  defineUpdateAnnotation,
  type Descendant,
  DocumentChange,
  editorCommands,
  NodeApi,
  type NodeKey,
  type Path,
  PathApi,
  type PluginReference,
  type Point,
  schema,
  SelectionApi,
  locateAt,
  txLocate,
  txSelection,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { DocumentIndex } from '../src/core/change/document-index';
import { getCommandRuntime } from '../src/core/command-definition';
import {
  projectionMapOf,
  registerEditorCommandDocument,
} from '../src/core/command-document';
import {
  evaluateCommand,
  probeCommandNativeEquivalent,
} from '../src/core/command-registry';
import { registerEditorDocumentRecorder } from '../src/core/document-recorder';
import { applyTransactionSpec } from '../src/core/public-state';
import { domCommands } from '../src/dom/plugin/dom-clipboard-runtime';

// Drops every node marked hidden, standing for content a pending suggestion
// removes from the accepted document.
const hideMarked = (nodes: readonly Descendant[]): readonly Descendant[] => {
  let changed = false;
  const kept = nodes.flatMap((node) => {
    if ('hidden' in node && node.hidden) {
      changed = true;
      return [];
    }
    if (!('children' in node)) return [node];

    const children = hideMarked(node.children);

    if (children === node.children) return [node];
    changed = true;

    return [Object.freeze({ ...node, children })];
  });

  return changed ? Object.freeze(kept) : nodes;
};

// Commands decide on the document without hidden nodes, and each frame's
// result commits as it is, so hidden content a frame wrote around is gone.
const framedEditor = (
  children: Descendant[],
  {
    caret,
    plugins = [],
  }: {
    caret?: { offset: number; path: Path };
    plugins?: PluginReference[];
  } = {}
) => {
  const editor = createEditor({
    initialSelection: caret
      ? SelectionApi.text({ anchor: caret, focus: caret })
      : null,
    initialValue: children,
    plugins,
  });

  registerEditorDocumentRecorder(
    editor,
    ({ change, projection, selection }) => ({
      change: projection ? projection.map.change().compose(change) : change,
      selection,
    })
  );
  registerEditorCommandDocument(editor, {
    project: (value) => {
      const kept = hideMarked(value.children);

      if (kept === value.children) return null;

      const projected = Object.freeze({ ...value, children: kept });

      return {
        indexes: new Map([['main', DocumentIndex.fromValue(kept)]]),
        map: projectionMapOf(DocumentChange.between(value, projected)),
        value: projected,
      };
    },
  });

  return editor;
};

const paragraph = (text: string, props: Record<string, unknown> = {}) => ({
  children: [{ text }],
  type: 'paragraph',
  ...props,
});

const texts = (editor: ReturnType<typeof createEditor>) =>
  editor.read((state) => state.children().map((node) => NodeApi.string(node)));

describe('command frame', () => {
  it('lets a handler read the accepted document through its captured editor', () => {
    let seen: string[] = [];
    const Watch = definePlugin('watch', {
      commands: ({ around }) => [
        around(editorCommands.insertText, ({ next }) => {
          seen = texts(editor);

          return next();
        }),
      ],
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('ab')],
      { caret: { offset: 2, path: [1, 0] }, plugins: [Watch] }
    );

    editor.update.command(editorCommands.insertText, { text: 'c' });

    assert.deepEqual(seen, ['ab']);
  });

  it('applies a spec evaluated outside an update where its frame placed it, and refuses one whose document changed', () => {
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('ab')],
      { caret: { offset: 2, path: [1, 0] } }
    );
    const first = evaluateCommand(editor, editorCommands.insertText, {
      text: 'c',
    }).result;
    const second = evaluateCommand(editor, editorCommands.insertText, {
      text: 'd',
    }).result;

    assert.ok(first && second);
    editor.update(() => applyTransactionSpec(editor, first));
    assert.deepEqual(texts(editor), ['abc']);
    assert.throws(
      () => editor.update(() => applyTransactionSpec(editor, second)),
      /stale framed spec/
    );
  });

  it("places the root path as itself and a path after the last child as the frame's append path", () => {
    const placed: unknown[] = [];
    const probe = defineCommand<{ at: Path }>('test.place', {
      build: () => false,
      locate: (input, place) => {
        placed.push(place.location(input.at));

        return input;
      },
    });
    const editor = framedEditor([
      paragraph('gone', { hidden: true }),
      paragraph('a'),
    ]);

    editor.update.command(probe, { at: [] });
    editor.update.command(probe, { at: [2] });

    assert.deepEqual(placed, [[], [1]]);
  });

  it('throws for a command or plugin method that takes input without saying where it lands', () => {
    const undeclared = defineCommand<{ at: Path }>('test.undeclared', {
      build: ({ input, state }) =>
        state.transaction((tx) => {
          tx.nodes.set({ marked: true }, { at: input.at });
        }),
    });
    const Marker = definePlugin('marker', {
      update: ({ tx }) => ({
        mark: ({ at }: { at: Path }) => {
          tx.nodes.set({ marked: true }, { at });
        },
      }),
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('a')],
      { plugins: [Marker] }
    );

    assert.throws(
      () => editor.update.command(undeclared, { at: [1] }),
      /must declare locate/
    );
    assert.throws(
      () => editor.update.marker.mark({ at: [1] }),
      /takes arguments, so it must declare txLocate/
    );
  });

  it('throws for a selection command that writes content', () => {
    const sneaky = defineCommand('test.sneaky', {
      build: ({ state }) =>
        state.transaction((tx) => {
          tx.text.insert('x');
        }),
      selection: true,
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('a')],
      { caret: { offset: 1, path: [1, 0] } }
    );

    assert.throws(
      () => editor.update.command(sneaky),
      /declares selection: true/
    );
  });

  it('says where the input of every built-in command with input lands', () => {
    const withoutInput = new Set([
      'insertBreak',
      'insertSoftBreak',
      'transposeCharacter',
    ]);
    const undeclared = Object.entries({ ...editorCommands, ...domCommands })
      .filter(([name]) => !withoutInput.has(name))
      .filter(([, command]) => {
        const runtime = getCommandRuntime(command);

        return !runtime.selection && runtime.locate === undefined;
      })
      .map(([name]) => name);

    assert.deepEqual(undeclared, []);
  });

  it('refuses the native path for typing inside content the accepted document removes', () => {
    const value = [
      {
        children: [
          { bold: true, text: 'ab' },
          { hidden: true, text: 'zz' },
          { italic: true, text: 'cd' },
        ],
        type: 'paragraph',
      },
    ];
    const inside = framedEditor(value, { caret: { offset: 1, path: [0, 1] } });
    const outside = framedEditor(value, { caret: { offset: 1, path: [0, 0] } });

    assert.equal(
      probeCommandNativeEquivalent(inside, editorCommands.insertText, {
        text: 'x',
      }).nativeEquivalent,
      false
    );
    assert.equal(
      probeCommandNativeEquivalent(outside, editorCommands.insertText, {
        text: 'x',
      }).nativeEquivalent,
      true
    );
  });

  it("places a plugin method's stored path in the accepted document", () => {
    const Marker = definePlugin('marker', {
      update: ({ tx }) => ({
        mark: txLocate(
          ([input], place) => {
            const at = place.location(input.at);

            return at && [{ at }];
          },
          ({ at }: { at: Path }) => {
            tx.nodes.set({ marked: true }, { at });
          }
        ),
        unmark: txLocate(
          locateAt(1),
          (key: string, options: { at?: Path } = {}) => {
            tx.nodes.unset(key, options);
          }
        ),
      }),
    });
    const marking = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('a'), paragraph('b')],
      { plugins: [Marker] }
    );
    const unmarking = framedEditor(
      [
        paragraph('gone', { hidden: true }),
        paragraph('a'),
        paragraph('b', { marked: true }),
      ],
      { plugins: [Marker] }
    );

    marking.update.marker.mark({ at: [2] });
    unmarking.update.marker.unmark('marked', { at: [2] });

    assert.deepEqual(marking.read.value().children, [
      paragraph('a'),
      paragraph('b', { marked: true }),
    ]);
    assert.deepEqual(unmarking.read.value().children, [
      paragraph('a'),
      paragraph('b'),
    ]);
  });

  it('keeps a node key as given and skips a method whose key names a hidden node', () => {
    const received: unknown[] = [];
    const Marker = definePlugin('marker', {
      update: ({ tx }) => ({
        mark: txLocate(locateAt(0, 'key'), ({ key }: { key: NodeKey }) => {
          received.push(key);
          tx.nodes.set({ marked: true }, { at: key });
        }),
      }),
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('a')],
      { plugins: [Marker] }
    );
    const hidden = editor.key([0]);
    const live = editor.key([1]);

    editor.update.marker.mark({ key: hidden });
    editor.update.marker.mark({ key: live });

    assert.deepEqual(received, [live]);
    assert.deepEqual(editor.read.value().children, [
      paragraph('a', { marked: true }),
    ]);
  });

  it('skips a method whose key names a hidden node when the call also passes a callback', () => {
    const received: unknown[] = [];
    const Marker = definePlugin('marker', {
      update: ({ tx }) => ({
        mark: txLocate(
          locateAt(0, 'key'),
          ({ key }: { key: NodeKey }, done: () => void) => {
            received.push(key);
            tx.nodes.set({ marked: true }, { at: key });
            done();
          }
        ),
      }),
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('a')],
      { plugins: [Marker] }
    );
    const hidden = editor.key([0]);
    const live = editor.key([1]);
    const done: unknown[] = [];

    editor.update.marker.mark({ key: hidden }, () => done.push(hidden));
    editor.update.marker.mark({ key: live }, () => done.push(live));

    assert.deepEqual({ done, received }, { done: [live], received: [live] });
  });

  it('skips a method another method calls with a key that names a hidden node', () => {
    const received: unknown[] = [];
    const done: unknown[] = [];
    const Marker = definePlugin('marker', {
      update: ({ tx }: any) => ({
        mark: txLocate(
          locateAt(0, 'key'),
          ({ key }: { key: NodeKey }, then?: () => void) => {
            received.push(key);
            tx.nodes.set({ marked: true }, { at: key });
            then?.();
          }
        ),
        markAll: txLocate(false, (keys: readonly NodeKey[]) => {
          for (const key of keys) {
            tx.marker.mark({ key });
            tx.marker.mark({ key }, () => done.push(key));
          }
        }),
      }),
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('a')],
      { plugins: [Marker] }
    );
    const hidden = editor.key([0]);
    const live = editor.key([1]);

    editor.update.marker.markAll([hidden, live]);

    assert.deepEqual(
      { done, received },
      { done: [live], received: [live, live] }
    );
    assert.deepEqual(editor.read.value().children, [
      paragraph('a', { marked: true }),
    ]);
  });

  it('runs a method another method calls with a live node the projection rebuilt', () => {
    const Marker = definePlugin('marker', {
      update: ({ tx }: any) => ({
        mark: txLocate(locateAt(0), ({ at }: { at: Descendant }) => {
          tx.nodes.set({ marked: true }, { at });
        }),
        markFirst: () => tx.marker.mark({ at: tx.children()[0] }),
      }),
    });
    const editor = framedEditor(
      [
        {
          children: [paragraph('gone', { hidden: true }), paragraph('a')],
          type: 'quote',
        },
      ],
      { plugins: [Marker] }
    );

    editor.update.marker.markFirst();

    assert.deepEqual(editor.read.value().children, [
      { children: [paragraph('a')], marked: true, type: 'quote' },
    ]);
  });

  it('gives a copy its own key when a method copies a block the projection rebuilt', () => {
    let keys: unknown[] = [];
    const Copy = definePlugin('copy', {
      update: ({ tx }: any) => ({
        copyFirst: txLocate(false, () => {
          tx.nodes.insert(tx.children()[0], { at: [1] });
          const copy = tx.children()[1];

          keys = [tx.key([0]), tx.key([1]), tx.key(copy)];
          tx.nodes.set({ marked: true }, { at: [0] });
          tx.nodes.remove({ at: copy });
        }),
      }),
    });
    const editor = framedEditor(
      [
        {
          children: [paragraph('gone', { hidden: true }), paragraph('kept')],
          type: 'quote',
        },
      ],
      { plugins: [Copy] }
    );

    editor.key([0, 1]);
    editor.update.copy.copyFirst();
    const [source, copy, copyByObject] = keys;

    assert.deepEqual(
      [
        typeof copy === 'string' && copy !== source && copy === copyByObject,
        editor.read.children().map((node: any) => node.marked),
      ],
      [true, [true]]
    );
  });

  it('gives a copy its own key when a method copies a block beside one a pending deletion hides', () => {
    const deleted = [{ at: 1, author: 'bob', change: 'bob:1', kind: 'delete' }];
    let keys: unknown[] = [];
    let count = 0;
    const Copy = definePlugin('copy', {
      update: ({ tx }: any) => ({
        copyLast: txLocate(false, () => {
          tx.nodes.insert(tx.children()[2], { at: [3] });
          keys = [tx.key([2]), tx.key([3]), tx.key(tx.children()[3])];
          tx.nodes.remove({ at: [3] });
        }),
      }),
    });
    const editor = createEditor({
      initialValue: [
        {
          authored: deleted,
          children: [{ authored: deleted, text: 'gone' }],
          type: 'paragraph',
        },
        paragraph('a'),
        paragraph('b'),
        paragraph('c'),
      ] as never,
      plugins: [
        defineEditorSchema('frame-blocks', {
          elements: { paragraph: { content: schema.content.text() } },
          id: 'frame-blocks',
          root: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'reject',
          version: 1,
        }),
        Copy,
        createAuthoredPlugin({
          authorId: 'alice',
          createChangeId: () => `alice:${(count += 1)}`,
          createTagId: () => `alice-tag:${(count += 1)}`,
          intent: 'edit',
          now: () => 1,
        }),
      ],
    });

    editor.update.copy.copyLast();
    const [source, copy, copyByObject] = keys;

    assert.deepEqual(
      [
        typeof copy === 'string' && copy !== source && copy === copyByObject,
        editor.key([3]),
      ],
      [true, source]
    );
  });

  it('runs a selection-only plugin method on the stored document', () => {
    const Caret = definePlugin('caret', {
      update: ({ tx }) => ({
        move: txSelection((at: Point) => {
          tx.selection.set({ anchor: at, focus: at });
        }),
        write: txSelection(() => {
          tx.text.insert('x');
        }),
      }),
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('a')],
      { plugins: [Caret] }
    );

    editor.update.caret.move({ offset: 2, path: [0, 0] });

    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    assert.throws(() => editor.update.caret.write(), /declares txSelection/);
  });

  it('keeps the effect of a command that writes nothing, mapped to the stored document', () => {
    const start = defineEffect<number>({
      key: 'test.start',
      map: (position, changes) =>
        changes.mapPosition(position, { association: 'forward' }) ?? undefined,
    });
    const emitStart = defineCommand('test.emit-start', {
      build: ({ state }) =>
        state.transaction((tx) => {
          tx.effects.emit(start, 0);
        }),
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('ab')],
      { plugins: [definePlugin('start', { effectTypes: [start] })] }
    );
    const emitted: unknown[] = [];

    editor.subscribeCommit((commit) => {
      for (const effect of commit.effects) emitted.push(effect.value);
    });
    editor.update.command(emitStart);

    // 8 is where the visible paragraph starts in the stored document, after
    // the hidden one.
    assert.deepEqual(emitted, [8]);
  });

  it('commits a plugin method whose only write is an annotation, combined across calls', () => {
    const origin = defineUpdateAnnotation<readonly string[]>({
      combine: (previous, next) => [...previous, ...next],
      key: 'test.origin',
    });
    const Origin = definePlugin('origin', {
      update: ({ tx }) => ({
        mark: () => tx.annotations.set(origin, ['probe']),
      }),
    });
    const editor = framedEditor(
      [paragraph('gone', { hidden: true }), paragraph('a')],
      { plugins: [Origin] }
    );
    const annotations: unknown[] = [];

    editor.subscribeCommit((commit) => {
      annotations.push(commit.annotations[origin.key]);
    });
    editor.update.origin.mark();
    editor.update((tx) => {
      tx.origin.mark();
      tx.origin.mark();
    });

    assert.deepEqual(annotations, [['probe'], ['probe', 'probe']]);
  });

  it('runs a correction on the accepted document', () => {
    const EndAfterAb = definePlugin('end-after-ab', {
      corrections: [
        {
          correct({ entry: [node, path], tx }) {
            const next = tx.nodes.get(PathApi.next(path));

            if (NodeApi.string(node) === 'ab' && !next) {
              tx.nodes.insert(paragraph('end'), { at: PathApi.next(path) });
            }
          },
          event: 'content',
          query: { type: 'paragraph' },
        },
      ],
    });
    const editor = framedEditor(
      [paragraph('a'), paragraph('end', { hidden: true })],
      { plugins: [EndAfterAb] }
    );

    editor.update((tx) => {
      tx.text.insert('b', { at: { offset: 1, path: [0, 0] } });
    });

    assert.deepEqual(editor.read.value().children, [
      paragraph('ab'),
      paragraph('end'),
    ]);
  });

  it("keeps a callable update method's members while a command document is registered", () => {
    let childRuns = 0;
    const Callable = definePlugin('callableMembers', {
      update: () => ({
        callable: Object.assign(() => undefined, {
          child: () => {
            childRuns += 1;
          },
        }),
      }),
    });
    const editor = framedEditor([paragraph('one')], { plugins: [Callable] });

    editor.update((tx) => {
      (
        tx as unknown as {
          callableMembers: { callable: { child: () => void } };
        }
      ).callableMembers.callable.child();
    });

    assert.equal(childRuns, 1);
  });
});
