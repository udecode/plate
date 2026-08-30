import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  type Descendant,
  type Element,
  defineExtension,
  defineExtensionPoint,
  type EditorUpdateTransaction,
  NodeApi,
  type Path,
  type Range,
  SelectionApi,
} from 'plitejs';
import { history } from 'plitejs/history';

import {
  above as editorAbove,
  deleteBackward as editorDeleteBackward,
  getExtensionRegistry as editorGetExtensionRegistry,
  getEditorLiveSelection,
  getLastCommit as editorGetLastCommit,
  insertText as editorInsertText,
  isEditor as editorIsEditor,
  replace as editorReplaceBase,
  reset as editorResetBase,
  string as editorString,
  setEditorTargetRuntime,
} from '../src/internal';
import { createRangeAnchor } from './support/anchor';

type LegacySnapshotInput = Omit<
  Parameters<typeof editorReplaceBase>[1],
  'children'
> & {
  children: Descendant[];
};

const editorReplace = editorReplaceBase as unknown as (
  editor: unknown,
  input: LegacySnapshotInput
) => void;
const editorReset = editorResetBase as unknown as (
  editor: unknown,
  input: LegacySnapshotInput
) => void;

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Element;

const publicRange = ({ anchor, focus }: Range): Range => ({ anchor, focus });

const markedParagraph = (text: string, marks: Record<string, unknown>) =>
  ({
    type: 'paragraph',
    children: [{ text, ...marks }],
  }) satisfies Element;

describe('editor runtime/view contract', () => {
  it('rejects explicit public main view roots', () => {
    const runtime = createEditor({
      initialValue: [paragraph('body')],
    });
    const primaryRoot: string = 'main';

    assert.throws(
      () => createEditorView(runtime, { root: primaryRoot }),
      /Omit root to target the primary document/
    );
  });

  it('reads live node selection through its root view owner', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update.selection.set(
      SelectionApi.nodes([[0]], {
        root: 'header',
      })
    );

    assert.deepEqual(
      getEditorLiveSelection(headerEditor),
      SelectionApi.nodes([[0]], { root: 'header' })
    );
  });

  it('resolves extension API factories against each view root', () => {
    const rootAware = defineExtension('rootAware', {
      api({ editor, root }) {
        return {
          append: (text: string) => {
            editor.update((tx) => {
              tx.text.insert(text, {
                at: { offset: 6, path: [0, 0] },
              });
            });
          },
          root: () => root ?? null,
          text: () =>
            editor.read((state) =>
              state.children().map(NodeApi.string).join('\n')
            ),
        };
      },
    });
    const runtime = createEditor({
      extensions: [rootAware],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const mainEditor = createEditorView(runtime);
    const headerEditor = createEditorView(runtime, { root: 'header' });

    assert.equal(mainEditor.api.rootAware.root(), null);
    assert.equal(mainEditor.api.rootAware.text(), 'body');
    assert.equal(headerEditor.api.rootAware.root(), 'header');
    assert.equal(headerEditor.api.rootAware.text(), 'header');
    assert.equal(
      headerEditor.extension(rootAware).api,
      headerEditor.api.rootAware
    );

    headerEditor.api.rootAware.append('!');

    assert.equal(mainEditor.api.rootAware.text(), 'body');
    assert.equal(headerEditor.api.rootAware.text(), 'header!');
  });

  it('routes static replace and reset through root-bound view runtime', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const commits: string[] = [];
    const unsubscribe = headerEditor.subscribe((snapshot) => {
      const [block] = snapshot.children as Array<{
        children: Array<{ text: string }>;
      }>;

      commits.push(block?.children[0]?.text ?? '');
    });

    editorReplace(headerEditor, {
      children: [paragraph('replaced header')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 8 },
        focus: { path: [0, 0], offset: 8 },
      },
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('replaced header')] },
      }
    );
    assert.deepEqual(
      headerEditor.read((state) => state.selection()),
      {
        anchor: { path: [0, 0], offset: 8, root: 'header' },
        focus: { path: [0, 0], offset: 8, root: 'header' },
      }
    );

    editorReset(headerEditor, {
      children: [paragraph('reset header')],
      selection: null,
    });

    unsubscribe();

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('reset header')] },
      }
    );
    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );
    assert.deepEqual(commits, ['replaced header', 'reset header']);
  });

  it('lets one runtime own value while root-bound views own view policy', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });

    const mainEditor = createEditorView(runtime);
    const writableHeaderEditor = createEditorView(runtime, { root: 'header' });
    const headerEditor = createEditorView(runtime, {
      readOnly: true,
      root: 'header',
    });

    assert.notEqual(mainEditor, headerEditor);
    assert.equal(editorIsEditor(mainEditor), true);
    assert.equal(NodeApi.isEditor(headerEditor), true);
    assert.equal(mainEditor.id, runtime.id);
    assert.equal(headerEditor.id, runtime.id);
    assert.equal(
      mainEditor.read((state) => state.view.root()),
      undefined
    );
    assert.equal(
      headerEditor.read((state) => state.view.root()),
      'header'
    );
    assert.equal(
      headerEditor.read((state) => state.view.isReadOnly()),
      true
    );
    assert.equal(
      mainEditor.read((state) => state.view.isReadOnly()),
      false
    );

    mainEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });
    writableHeaderEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });
    });

    assert.throws(() => {
      headerEditor.update((tx) => {
        tx.text.insert('!', {
          at: { path: [0, 0], offset: 6 },
        });
      });
    }, /read-only editor view/);

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body!')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(
      headerEditor.read((state) => state.value()),
      mainEditor.read((state) => state.value())
    );
    assert.equal(
      editorGetLastCommit(runtime)?.changed.has('text', 'header'),
      true
    );
  });

  it('shares extension capabilities with root-bound views', () => {
    const output = defineExtensionPoint<boolean>('shared-output');
    const runtime = createEditor({
      extensions: [
        defineExtension('custom-clipboard', {
          contributions: [output.of(true)],
        }),
      ] as const,
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const runtimeRegistry = editorGetExtensionRegistry(runtime);
    const viewRegistry = editorGetExtensionRegistry(headerEditor);

    assert.equal(viewRegistry, runtimeRegistry);
    assert.equal(viewRegistry.contributions.get(output)?.length, 1);
  });

  it('binds dynamically installed extensions to the invoking root view', () => {
    const commitEditors: string[] = [];
    const baseExtension = defineExtension('base-bound-extension', {
      on: {
        commit({ editor }) {
          commitEditors.push(`base:${editor.read.view.root()}`);
        },
      },
    });
    const runtime = createEditor({
      extensions: [baseExtension] as const,
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let activationEditor: unknown;
    let activationRoot: unknown;
    let apiFactoryRoot: unknown;
    let cleanupReason: unknown;
    let nodeChangeEditor: unknown;
    let textChangeEditor: unknown;
    let transactionChangeEditor: unknown;
    let txEditor: unknown;
    const headerExtension = defineExtension('header-bound-extension', {
      activate(context) {
        const { editor } = context;
        activationEditor = editor;
        activationRoot = context.root;
        context.onCleanup(({ reason }) => {
          cleanupReason = reason;
        });
      },
      api({ root }) {
        apiFactoryRoot = root;

        return {};
      },
      on: {
        commit({ editor }) {
          commitEditors.push(`header:${editor.read.view.root()}`);
        },
        nodeChange({ editor }) {
          nodeChangeEditor = editor;
        },
        textChange({ editor }) {
          textChangeEditor = editor;
        },
        transactionChange({ editor }) {
          transactionChangeEditor = editor;
        },
      },

      read: ({ editor }) => ({
        hostState() {
          return editor;
        },
      }),
      update: ({ editor }) => ({
        hostTx() {
          txEditor = editor;

          return editor.read.view.root();
        },
      }),
    });

    const cleanup = headerEditor.install(headerExtension);

    assert.equal(activationEditor, headerEditor);
    assert.equal(activationRoot, 'header');
    assert.equal(apiFactoryRoot, 'header');
    assert.equal(
      headerEditor.read((state) =>
        (
          state as unknown as {
            'header-bound-extension': { hostState: () => unknown };
          }
        )['header-bound-extension'].hostState()
      ),
      headerEditor
    );

    commitEditors.length = 0;
    headerEditor.update((tx) => {
      assert.equal(
        (
          tx as unknown as {
            'header-bound-extension': { hostTx: () => unknown };
          }
        )['header-bound-extension'].hostTx(),
        'header'
      );
      tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
      tx.nodes.insert(paragraph('next'), { at: [1] });
    });

    assert.deepEqual(commitEditors, ['base:undefined', 'header:header']);
    assert.equal(nodeChangeEditor, headerEditor);
    assert.equal(textChangeEditor, headerEditor);
    assert.equal(transactionChangeEditor, headerEditor);
    assert.equal(txEditor, headerEditor);

    cleanup();

    assert.equal(cleanupReason, 'remove');
  });

  it('does not materialize missing roots for no-op or failed view updates', () => {
    const runtime = createEditor({
      initialValue: { children: [paragraph('body')] },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const expectedValue = { children: [paragraph('body')] };

    headerEditor.update(() => {});

    assert.deepEqual(
      runtime.read((state) => state.value()),
      expectedValue
    );

    assert.throws(() => {
      headerEditor.update(() => {
        throw new Error('boom');
      });
    }, /boom/);

    assert.deepEqual(
      runtime.read((state) => state.value()),
      expectedValue
    );
  });

  it('passes root-scoped afterCommit snapshots for root-bound view updates', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const snapshots: string[] = [];
    const getSnapshotText = (children: readonly Element[]) =>
      (children[0].children[0] as { text: string }).text;

    headerEditor.update((headerTx, { afterCommit }) => {
      afterCommit(({ snapshot }) => {
        snapshots.push(`header:${getSnapshotText(snapshot.children)}`);
      });

      headerTx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });
    });

    mainEditor.update((mainTx, { afterCommit }) => {
      afterCommit(({ snapshot }) => {
        snapshots.push(`main:${getSnapshotText(snapshot.children)}`);
      });

      mainTx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.deepEqual(snapshots, ['header:header!', 'main:body!']);
  });

  it('keeps afterCommit bound to its root after a sibling root commits', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const getSnapshotText = (children: readonly Element[]) =>
      (children[0].children[0] as { text: string }).text;
    let snapshotText = '';

    mainEditor.update((mainTx) => {
      mainTx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    headerEditor.update((headerTx, { afterCommit }) => {
      afterCommit(({ snapshot }) => {
        snapshotText = getSnapshotText(snapshot.children);
      });

      headerTx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });
    });

    assert.equal(snapshotText, 'header!');
  });

  it('keeps main-root view afterCommit selection from the committed snapshot', () => {
    const runtime = createEditor({
      extensions: [
        defineExtension('move-selection-on-commit', {
          on: {
            commit({ commit, editor }) {
              if (commit.changed.has('text')) {
                editor.update((tx: EditorUpdateTransaction) => {
                  tx.selection.set({
                    kind: 'text',
                    anchor: { path: [0, 0], offset: 0, root: 'header' },
                    focus: { path: [0, 0], offset: 0, root: 'header' },
                  });
                });
              }
            },
          },
        }),
      ] as const,
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const mainEditor = createEditorView(runtime);
    let snapshotSelection: unknown = null;

    mainEditor.update((tx, { afterCommit }) => {
      afterCommit(({ snapshot }) => {
        snapshotSelection = snapshot.selection;
      });

      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 'body'.length },
        focus: { path: [0, 0], offset: 'body'.length },
      });
      tx.text.insert('!');
    });

    assert.deepEqual(snapshotSelection, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'body!'.length },
      focus: { path: [0, 0], offset: 'body!'.length },
    });
  });

  it('reads root-local paths through a root-bound view', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'header'.length },
      });
    });
    const mainNodeKey = runtime.read((state) => state.key([0]));
    const viewRead = headerEditor.read((state) => {
      const entry = state.nodes.get([0]);
      assert.ok(entry);

      return {
        children: state.nodes.children(),
        node: entry[0],
        nodeKey: state.key([0]),
        slice: state.slice.export(),
        snapshot: state.runtime.snapshot(),
        text: state.text.string([]),
        value: state.value(),
      };
    });

    assert.deepEqual(viewRead.children, [paragraph('header')]);
    assert.deepEqual(viewRead.node, paragraph('header'));
    assert.deepEqual(viewRead.slice.content, [paragraph('header')]);
    assert.equal(viewRead.text, 'header');
    assert.notEqual(viewRead.nodeKey, mainNodeKey);
    assert.deepEqual(viewRead.snapshot.children, [paragraph('header')]);
    assert.deepEqual(viewRead.value, {
      children: [paragraph('main')],
      roots: { header: [paragraph('header')] },
    });
  });

  it('honors explicit roots on runtime read locations', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerRange = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0, root: 'header' },
      focus: { path: [0, 0], offset: 6, root: 'header' },
    };
    const read = runtime.read((state) => {
      const entry = state.nodes.get(headerRange.anchor);
      assert.ok(entry);

      return {
        end: state.points.end(headerRange),
        entries: state.nodes.toArray({
          at: headerRange,
          match: NodeApi.isText,
        }),
        node: entry[0],
        positions: [...state.points.positions({ at: headerRange })],
        staticText: editorString(runtime, headerRange),
        text: state.text.string(headerRange),
      };
    });

    assert.deepEqual(read.node, { text: 'header' });
    assert.equal(read.text, 'header');
    assert.equal(read.staticText, 'header');
    assert.deepEqual(read.end, { path: [0, 0], offset: 6, root: 'header' });
    assert.deepEqual(
      read.positions.map((point) => point.root),
      Array.from({ length: 7 }, () => 'header')
    );
    assert.deepEqual(
      read.entries.map(([node]) => node),
      [{ text: 'header' }]
    );
  });

  it('honors the current selection root on implicit runtime reads', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });

    runtime.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2, root: 'header' },
        focus: { path: [0, 0], offset: 2, root: 'header' },
      });
    });

    const read = runtime.read((state) => ({
      above: state.nodes.above({ match: NodeApi.isElement }),
      entries: state.nodes.toArray({ match: NodeApi.isText }),
      positions: [...state.points.positions()],
      staticAbove: editorAbove(runtime, { match: NodeApi.isElement }),
    }));

    assert.deepEqual(read.above?.[0], paragraph('header'));
    assert.deepEqual(read.staticAbove?.[0], paragraph('header'));
    assert.deepEqual(
      read.entries.map(([node]) => node),
      [{ text: 'header' }]
    );
    assert.deepEqual(read.positions, [
      { path: [0, 0], offset: 2, root: 'header' },
    ]);
  });

  it('uses main for rootless explicit runtime selections after a sibling root was active', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('m1'), paragraph('m2')],
        roots: { header: [markedParagraph('header', { bold: true })] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });
    runtime.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.selection()),
      {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      }
    );
    assert.equal(
      headerEditor.read((state) => state.marks()),
      null
    );
    assert.deepEqual(
      mainEditor.read((state) => state.marks()),
      {}
    );
  });

  it('keeps implicit view reads on the view root when a sibling root owns selection', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    const read = headerEditor.read((state) => ({
      above: state.nodes.above({ match: NodeApi.isElement }),
      entries: state.nodes.toArray({ match: NodeApi.isText }),
      fragment: state.fragment().map(NodeApi.string),
      positions: [...state.points.positions()],
    }));

    assert.deepEqual(read.above?.[0], paragraph('header'));
    assert.deepEqual(
      read.entries.map(([node]) => node),
      [{ text: 'header' }]
    );
    assert.deepEqual(read.fragment, ['head']);
    assert.deepEqual(
      read.positions.map((point) => point.root),
      Array.from({ length: 5 }, () => 'header')
    );
  });

  it('rejects mixed explicit-root runtime read ranges', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
      },
    });

    assert.throws(() => {
      runtime.read((state) =>
        state.text.string({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0, root: 'header' },
          focus: { path: [0, 0], offset: 6, root: 'footer' },
        })
      );
    }, /across multiple roots/);
  });

  it('reads initial selection through its declared root view', () => {
    const runtime = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 6, root: 'header' },
        focus: { path: [0, 0], offset: 6, root: 'header' },
      },
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    assert.deepEqual(
      headerEditor.read((state) => state.selection()),
      {
        anchor: { path: [0, 0], offset: 6, root: 'header' },
        focus: { path: [0, 0], offset: 6, root: 'header' },
      }
    );
    assert.equal(
      mainEditor.read((state) => state.selection()),
      null
    );
  });

  it('reads marks through the active view root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [markedParagraph('header', { bold: true })] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    assert.deepEqual(
      headerEditor.read((state) => state.marks()),
      { bold: true }
    );
    assert.equal(
      mainEditor.read((state) => state.marks()),
      null
    );
  });

  it('hides sibling-root selection and marks in view snapshots', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      tx.marks.add('bold', true);
    });

    const mainSelection = mainEditor.read(
      (state) => state.runtime.snapshot().selection
    );

    assert.equal(SelectionApi.isText(mainSelection), true);
    assert.deepEqual(
      SelectionApi.isText(mainSelection) ? mainSelection.marks : null,
      { bold: true }
    );
    assert.equal(
      headerEditor.read((state) => state.runtime.snapshot().selection),
      null
    );
  });

  it('keeps selection-dependent view mutations inside the active root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });
    headerEditor.update((tx) => {
      tx.selection.move({ distance: 1, reverse: true });
      tx.marks.add('bold', true);
      tx.text.insert('!');
    });

    assert.deepEqual(
      runtime.read((state) => state.selection()),
      {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      }
    );
    assert.deepEqual(
      mainEditor.read((state) => state.marks()),
      {}
    );
    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );
    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      }
    );
  });

  it('does not reuse a sibling-root selection for slice replacement', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')] as Element[],
        roots: { header: [paragraph('header')] as Element[] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const slice = ContentSlice.closed([{ text: '!' }]);
    let callbackFragment = true;
    let callbackSlice = true;
    let commits = 0;

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });
    const unsubscribe = runtime.subscribeCommit(() => (commits += 1) - 1);

    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );
    assert.equal(
      headerEditor.read((state) => state.slice.fit(slice)),
      false
    );
    assert.equal(headerEditor.update.slice.replace(slice), false);
    assert.equal(headerEditor.update.fragment.replace([{ text: '!' }]), false);
    headerEditor.update((tx) => {
      callbackSlice = tx.slice.replace(slice);
      callbackFragment = tx.fragment.replace([{ text: '!' }]);
    });
    unsubscribe();

    assert.equal(callbackSlice, false);
    assert.equal(callbackFragment, false);
    assert.equal(commits, 0);
    assert.deepEqual(runtime.read.children(), [paragraph('body')]);
    assert.deepEqual(runtime.read.root('header'), [paragraph('header')]);
  });

  it('keeps implicit view node mutations from using sibling-root selections', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('m1'), paragraph('m2')],
        roots: { header: [paragraph('h1'), paragraph('h2')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    });
    headerEditor.update((tx) => {
      tx.nodes.remove();
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('m1'), paragraph('m2')],
        roots: { header: [paragraph('h1'), paragraph('h2')] },
      }
    );

    headerEditor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('m1'), paragraph('m2')],
        roots: { header: [paragraph('h1')] },
      }
    );
  });

  it('keeps changed-range node inserts on the invoking root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('m1')],
        roots: { header: [paragraph('h1')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    headerEditor.update((tx) => {
      tx.nodes.insert([paragraph('h2'), paragraph('h3')], { at: [1] });
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('m1')],
        roots: { header: [paragraph('h1'), paragraph('h2'), paragraph('h3')] },
      }
    );
    assert.equal(
      editorGetLastCommit(runtime)?.changed.has('structure', 'header'),
      true
    );
  });

  it('uses the view root for implicit text inserts when selection is null', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.text.insert('!');
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection()),
      {
        anchor: { path: [0, 0], offset: 7, root: 'header' },
        focus: { path: [0, 0], offset: 7, root: 'header' },
      }
    );
    assert.equal(
      editorGetLastCommit(runtime)?.changed.has('text', 'header'),
      true
    );
  });

  it('keeps full document reads stable inside a root-bound update', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let valueInUpdate: unknown = null;

    headerEditor.update((tx) => {
      valueInUpdate = tx.value();
    });

    assert.deepEqual(valueInUpdate, {
      children: [paragraph('main')],
      roots: { header: [paragraph('header')] },
    });
  });

  it('discards changes in non-main roots when the transaction aborts', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });

    assert.throws(() => {
      runtime.update((tx) => {
        tx.text.insert('!', {
          at: { path: [0, 0], offset: 6, root: 'header' },
        });
        throw new Error('boom');
      });
    }, /boom/);

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      }
    );
  });

  it('keeps base runtime subscriptions on the base snapshot for rooted changes', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    let listenerText: string | undefined;
    let changedHeader = false;
    const unsubscribe = runtime.subscribe((snapshot, change) => {
      listenerText = (
        snapshot.children[0] as Element & {
          children: [{ text: string }];
        }
      ).children[0].text;
      changedHeader = change?.changed.has('text', 'header') ?? false;
    });

    runtime.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6, root: 'header' },
      });
    });
    unsubscribe();

    assert.equal(listenerText, 'body');
    assert.equal(changedHeader, true);
    assert.deepEqual(
      runtime.read((state) => state.runtime.snapshot().children),
      [paragraph('body')]
    );
    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
  });

  it('preserves sibling-root node keys after failed non-main root updates', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainNodeKey = runtime.read((state) => state.key([0]));

    assert.throws(() => {
      headerEditor.update((tx) => {
        tx.text.insert('!', {
          at: { path: [0, 0], offset: 6 },
        });
        throw new Error('boom');
      });
    }, /boom/);

    assert.equal(
      runtime.read((state) => state.key([0])),
      mainNodeKey
    );
    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
  });

  it('keeps path anchors scoped to their owning root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('first'), paragraph('second')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainAnchor = runtime.anchor([1], {
      association: 'forward',
      deletion: 'drop',
    });
    const headerAnchor = headerEditor.anchor([0], {
      association: 'forward',
      deletion: 'drop',
    });

    headerEditor.update((tx) => {
      tx.nodes.insert(paragraph('inserted'), { at: [0] });
    });

    assert.deepEqual(mainAnchor.resolve(), [1]);
    assert.deepEqual(headerAnchor.resolve(), [1]);

    mainAnchor.release();
    headerAnchor.release();
  });

  it('normalizes writes in the invoking view root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    assert.doesNotThrow(() => {
      headerEditor.update((tx) => {
        tx.nodes.insert(
          { type: 'paragraph', children: [] },
          {
            at: [0],
          }
        );
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph(''), paragraph('header')] },
      }
    );
  });

  it('plans writes against the invoking view root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('one'), paragraph('two')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [1, 0], offset: 3 },
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('one'), paragraph('two!')] },
      }
    );
  });

  it('defaults rootless path anchors to the invoking view root during updates', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main'), paragraph('other')],
        roots: { header: [paragraph('first'), paragraph('second')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let anchorPath: unknown = null;

    headerEditor.update((tx) => {
      const anchor = headerEditor.anchor([1], {
        association: 'forward',
        deletion: 'drop',
      });

      tx.nodes.remove({ at: [0] });
      anchorPath = anchor.release();
    });

    assert.deepEqual(anchorPath, [0]);
    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('main'), paragraph('other')],
        roots: { header: [paragraph('second')] },
      }
    );
  });

  it('defaults rootless point and range anchors to the invoking view root during updates', () => {
    const mainSource = createEditor({
      initialValue: [paragraph('main'), paragraph('other')],
    });

    mainSource.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 0 } });
    });
    const mainChange = mainSource.read((state) => state.lastCommit()?.changes);

    assert.ok(mainChange);

    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main'), paragraph('other')],
        roots: { header: [paragraph('first'), paragraph('second')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let point: unknown = null;
    let range: unknown = null;

    headerEditor.update((tx) => {
      const pointAnchor = headerEditor.anchor(
        { path: [1, 0], offset: 0 },
        { association: 'forward', deletion: 'nearest' }
      );
      const rangeAnchor = headerEditor.anchor(
        {
          kind: 'text',
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        },
        { association: 'inward', deletion: 'nearest' }
      );

      tx.nodes.remove({ at: [0] });
      tx.changes.apply(mainChange);
      point = pointAnchor.release();
      range = rangeAnchor.release();
    });

    assert.deepEqual(point, { path: [0, 0], offset: 0 });
    assert.deepEqual(range, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(
      runtime.read((state) => state.children()),
      [paragraph('!main'), paragraph('other')]
    );
  });

  it('defaults rootless anchors to the invoking view root during reads', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const anchor = headerEditor.anchor(
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      },
      { association: 'inward', deletion: 'drop' }
    );

    headerEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });
    });
    mainEditor.update((tx) => {
      tx.text.insert('?', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    const range = anchor.release();

    assert.deepEqual(range, {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    assert.equal(Object.hasOwn(range.anchor, 'root'), false);
    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body?')],
        roots: { header: [paragraph('header!')] },
      }
    );
  });

  it('supports view-default and explicit-root anchors', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const viewAnchor = createRangeAnchor(headerEditor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    });
    const explicitRootAnchor = runtime.anchor(
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      },
      { association: 'inward', deletion: 'drop', root: 'header' }
    );

    headerEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });
    });
    mainEditor.update((tx) => {
      tx.text.insert('?', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.deepEqual(viewAnchor.release(), {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    assert.deepEqual(explicitRootAnchor.release(), {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body?')],
        roots: { header: [paragraph('header!')] },
      }
    );
  });

  it('keeps root-view static transforms from reusing another root selection', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    runtime.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );

    editorInsertText(headerEditor, '!');

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );

    editorInsertText(headerEditor, '!', {
      at: { path: [0, 0], offset: 6 },
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
  });

  it('deletes multi-block selections from the invoking view root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('ab'), paragraph('cd')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [1, 0], offset: 1 },
      });
      tx.text.delete();
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      { children: [paragraph('main')], roots: { header: [paragraph('ad')] } }
    );
  });

  it('restores the view root before notifying subscribers for nested-root structural edits', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('ab'), paragraph('cd')] },
      },
    });
    const mainEditor = createEditorView(runtime);
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const getViewTexts = (editor: typeof mainEditor) =>
      editor.read((state) =>
        state.nodes.children().map((node) => NodeApi.string(node))
      );
    const subscriberReads: string[][] = [];
    const unsubscribe = runtime.subscribe(() => {
      subscriberReads.push(getViewTexts(mainEditor));
    });

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 2 },
      });
      tx.text.delete();
    });

    unsubscribe();

    assert.deepEqual(subscriberReads, [['main']]);
    assert.deepEqual(getViewTexts(mainEditor), ['main']);
    assert.deepEqual(getViewTexts(headerEditor), ['']);
  });

  it('keeps repeated view-local text inserts ordered after rootless selection import', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('Confidential quarterly plan')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });

    for (const text of ['h', 'e', 'l', 'l', 'o']) {
      headerEditor.update((tx) => {
        tx.text.insert(text);
      });
    }

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('helloConfidential quarterly plan')] },
      }
    );
    assert.deepEqual(
      headerEditor.read((state) => state.selection()),
      {
        anchor: { path: [0, 0], offset: 5, root: 'header' },
        focus: { path: [0, 0], offset: 5, root: 'header' },
      }
    );
  });

  it("preserves the focused root selection when undoing another root's batch", () => {
    const runtime = createEditor({
      extensions: [history()] as const,
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const mainSelection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      tx.text.insert('!');
    });
    mainEditor.update((tx) => {
      tx.selection.set(mainSelection);
      tx.text.insert('?');
    });

    mainEditor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection()),
      publicRange(mainSelection)
    );
    assert.deepEqual(
      mainEditor.read((state) => state.selection()),
      publicRange(mainSelection)
    );
    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );

    mainEditor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection()),
      publicRange(mainSelection)
    );
    assert.deepEqual(
      mainEditor.read((state) => state.selection()),
      publicRange(mainSelection)
    );
    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );
  });

  it("preserves the focused root selection when redoing another root's batch", () => {
    const runtime = createEditor({
      extensions: [history()] as const,
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const mainSelection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      tx.text.insert('!');
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });
    mainEditor.update((tx) => {
      tx.selection.set(mainSelection);
    });
    mainEditor.update((tx) => {
      tx.history.undo();
    });
    mainEditor.update((tx) => {
      tx.history.redo();
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection()),
      publicRange(mainSelection)
    );
    assert.deepEqual(
      mainEditor.read((state) => state.selection()),
      publicRange(mainSelection)
    );
    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );
  });

  it('restores null selection when undoing a programmatic non-main root batch', () => {
    const runtime = createEditor({
      extensions: [history()] as const,
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });
    });

    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });
    headerEditor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.equal(
      headerEditor.read((state) => state.selection()),
      null
    );
    assert.equal(
      runtime.read((state) => state.selection()),
      null
    );
  });

  it('applies main-root history changes while inside a non-main view update', () => {
    const runtime = createEditor({
      extensions: [history()] as const,
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });
      tx.text.insert('?');
    });

    assert.doesNotThrow(() => {
      headerEditor.update((tx) => {
        tx.history.undo();
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
  });

  it('applies exported canonical changes to the primary document inside root views', () => {
    const source = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });

    source.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
    });

    const changes = editorGetLastCommit(source)?.changes;
    assert.ok(changes);

    const target = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(target, { root: 'header' });

    headerEditor.update((tx) => {
      tx.changes.apply(changes);
    });

    assert.deepEqual(
      target.read((state) => state.value()),
      {
        children: [paragraph('body!')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.equal(editorGetLastCommit(target)?.changed.has('text'), true);
  });

  it('preserves nested non-main root changes inside another root update', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6, root: 'footer' },
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: {
          footer: [paragraph('footer!')],
          header: [paragraph('header')],
        },
      }
    );
    assert.equal(
      editorGetLastCommit(runtime)?.changed.has('text', 'footer'),
      true
    );
  });

  it('reports dirtiness from the changed root inside sibling view updates', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
      },
    });
    const footerEditor = createEditorView(runtime, { root: 'footer' });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const footerTextKey = footerEditor.read((state) => state.key([0, 0]));
    const headerTextKey = headerEditor.read((state) => state.key([0, 0]));
    let nodeImpactNodeKeys: readonly string[] | null | undefined;
    const unsubscribe = runtime.subscribe((_snapshot, change) => {
      nodeImpactNodeKeys = change?.changed.nodeKeysAll('node');
    });

    headerEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6, root: 'footer' },
      });
    });
    unsubscribe();

    assert.ok(footerTextKey);
    assert.ok(headerTextKey);
    assert.ok(nodeImpactNodeKeys);
    assert.equal(nodeImpactNodeKeys.includes(footerTextKey), true);
    assert.equal(nodeImpactNodeKeys.includes(headerTextKey), false);
    assert.deepEqual(
      editorGetLastCommit(runtime)?.changed.nodeKeys('node'),
      []
    );
  });

  it('reports exact runtime impact for mixed-root commits', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const footerEditor = createEditorView(runtime, { root: 'footer' });
    const footerTextKey = footerEditor.read((state) => state.key([0, 0]));
    const headerTextKey = headerEditor.read((state) => state.key([0, 0]));
    let nodeImpactNodeKeys: readonly string[] | null | undefined;
    const unsubscribe = runtime.subscribe((_snapshot, change) => {
      nodeImpactNodeKeys = change?.changed.nodeKeysAll('node');
    });

    headerEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6, root: 'footer' },
      });
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6, root: 'header' },
      });
    });
    unsubscribe();

    assert.ok(footerTextKey);
    assert.ok(headerTextKey);
    assert.ok(nodeImpactNodeKeys);
    assert.equal(nodeImpactNodeKeys.includes(footerTextKey), true);
    assert.equal(nodeImpactNodeKeys.includes(headerTextKey), true);
  });

  it('reads selection changes made inside a root-bound view transaction', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    let selectionAfterSet: unknown = null;

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    headerEditor.update((tx) => {
      assert.equal(tx.selection(), null);
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      selectionAfterSet = tx.selection();
    });

    assert.deepEqual(selectionAfterSet, {
      anchor: { path: [0, 0], offset: 6, root: 'header' },
      focus: { path: [0, 0], offset: 6, root: 'header' },
    });
  });

  it('switches selection roots when rootless view selection matches main coordinates', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });
    headerEditor.update((tx) => {
      assert.equal(tx.selection(), null);
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      tx.text.insert('!');
    });

    assert.deepEqual(
      runtime.read((state) => state.value()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('!header')] },
      }
    );
    assert.deepEqual(
      headerEditor.read((state) => state.selection()),
      {
        anchor: { path: [0, 0], offset: 1, root: 'header' },
        focus: { path: [0, 0], offset: 1, root: 'header' },
      }
    );
  });

  it('returns view-scoped snapshots from root-bound subscriptions', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    let listenerText: string | undefined;
    const unsubscribe = headerEditor.subscribe((snapshot) => {
      listenerText = (
        snapshot.children[0] as Element & {
          children: [{ text: string }];
        }
      ).children[0].text;
    });

    mainEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 4 },
      });
    });
    headerEditor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });
    });
    unsubscribe();

    assert.equal(listenerText, 'header!');
  });

  it('keeps base snapshots stable when implicit insert targets the selection root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let listenerText: string | undefined;

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
    });

    const unsubscribe = runtime.subscribe((snapshot) => {
      listenerText = (
        snapshot.children[0] as Element & {
          children: [{ text: string }];
        }
      ).children[0].text;
    });

    editorInsertText(runtime, '!');
    unsubscribe();

    assert.equal(listenerText, 'body');
    assert.deepEqual(
      runtime.read((state) => state.root('header')),
      [paragraph('header!')]
    );
  });

  it('keeps base snapshots stable when implicit delete targets the selection root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let listenerText: string | undefined;

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
    });

    const unsubscribe = runtime.subscribe((snapshot) => {
      listenerText = (
        snapshot.children[0] as Element & {
          children: [{ text: string }];
        }
      ).children[0].text;
    });

    editorDeleteBackward(runtime);
    unsubscribe();

    assert.equal(listenerText, 'body');
    assert.deepEqual(
      runtime.read((state) => state.root('header')),
      [paragraph('heade')]
    );
  });

  it('keeps base snapshots stable when update-scoped delete targets the selection root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let listenerText: string | undefined;

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
    });

    const unsubscribe = runtime.subscribe((snapshot) => {
      listenerText = (
        snapshot.children[0] as Element & {
          children: [{ text: string }];
        }
      ).children[0].text;
    });

    runtime.update((tx) => {
      tx.text.deleteBackward({ unit: 'character' });
    });
    unsubscribe();

    assert.equal(listenerText, 'body');
    assert.deepEqual(
      runtime.read((state) => state.root('header')),
      [paragraph('heade')]
    );
  });

  it('keeps root-local collapsed delete ranges in the view root', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('h')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
        reverse: true,
        unit: 'character',
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.root('header')),
      [paragraph('')]
    );
    assert.equal(
      runtime.read((state) =>
        state.lastCommit()?.changed.has('text', 'header')
      ),
      true
    );
  });

  it('keeps sibling root reads isolated inside active root updates', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    let mainTextDuringHeaderUpdate = '';
    let mainSnapshotTextDuringHeaderUpdate = '';

    headerEditor.update(() => {
      mainTextDuringHeaderUpdate = mainEditor.read((state) =>
        state.nodes.children().map(NodeApi.string).join('')
      );
      mainSnapshotTextDuringHeaderUpdate = mainEditor.read((state) =>
        state.runtime.snapshot().children.map(NodeApi.string).join('')
      );
    });

    assert.equal(mainTextDuringHeaderUpdate, 'body');
    assert.equal(mainSnapshotTextDuringHeaderUpdate, 'body');
  });

  it('keeps root-bound node generators lazy', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('one'), paragraph('two')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const seenPaths: Path[] = [];
    const entries = headerEditor.read((state) =>
      state.nodes.entries({
        at: [],
        match: (_node, path) => {
          seenPaths.push(path);

          return true;
        },
      })
    );

    const first = entries.next();

    assert.equal(first.done, false);
    assert.deepEqual(first.value?.[1], []);
    assert.deepEqual(seenPaths, [[]]);

    const second = entries.next();

    assert.equal(second.done, false);
    assert.deepEqual(second.value?.[1], [0]);
    assert.deepEqual(seenPaths, [[], [0]]);
  });

  it('restores runtime root reads while a root-bound generator stays open', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const entries = headerEditor.read((state) =>
      state.nodes.entries({ at: [] })
    );

    const first = entries.next();

    assert.equal(first.done, false);
    assert.deepEqual(first.value?.[1], []);
    assert.equal(
      runtime.read((state) => state.text.string([])),
      'body'
    );
    assert.equal(
      headerEditor.read((state) => state.text.string([])),
      'header'
    );

    const second = entries.next();

    assert.equal(second.done, false);
    assert.deepEqual(second.value?.[1], [0]);
    assert.equal(
      runtime.read((state) => state.text.string([])),
      'body'
    );
    entries.return?.();
  });

  it('forwards root view target runtimes into implicit updates', () => {
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('head')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let calls = 0;

    setEditorTargetRuntime(headerEditor, {
      resolveImplicitTarget() {
        calls += 1;

        return {
          kind: 'text' as const,
          anchor: { path: [0, 0], offset: 0, root: 'header' },
          focus: { path: [0, 0], offset: 4, root: 'header' },
        };
      },
    });

    headerEditor.update((tx) => {
      tx.nodes.set({ type: 'heading-one' } as never);
    });

    assert.equal(calls, 1);
    assert.equal(
      runtime.read((state) => state.children()[0]?.type),
      'paragraph'
    );
    assert.equal(
      runtime.read((state) => state.root('header')[0]?.type),
      'heading-one'
    );
  });
});
