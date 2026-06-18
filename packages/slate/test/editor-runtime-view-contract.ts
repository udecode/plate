import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { history } from '@platejs/slate-history';

import {
  createEditorRuntime,
  createEditorView,
  type Descendant,
  defineEditorExtension,
  NodeApi,
} from '../src';
import { getDirtyPathsForRoot } from '../src/core/update-dirty-paths';
import { Editor } from '../src/interfaces/editor';
import { setEditorTargetRuntime } from '../src/internal';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

const markedParagraph = (text: string, marks: Record<string, unknown>) =>
  ({
    type: 'paragraph',
    children: [{ text, ...marks }],
  }) satisfies Descendant;

describe('editor runtime/view contract', () => {
  it('rejects explicit public main view roots', () => {
    const runtime = createEditorRuntime({
      initialValue: [paragraph('body')],
    });

    assert.throws(
      () => createEditorView(runtime, { root: 'main' }),
      /Omit root to target the primary document/
    );
  });

  it('routes static replace and reset through root-bound view runtime', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const commits: string[] = [];
    const unsubscribe = headerEditor.subscribe((snapshot) => {
      commits.push(
        ((snapshot.children[0] as Descendant).children[0] as { text: string })
          .text
      );
    });

    Editor.replace(headerEditor, {
      children: [paragraph('replaced header')],
      selection: {
        anchor: { path: [0, 0], offset: 8 },
        focus: { path: [0, 0], offset: 8 },
      },
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('replaced header')] },
      }
    );
    assert.deepEqual(
      headerEditor.read((state) => state.selection.get()),
      {
        anchor: { path: [0, 0], offset: 8, root: 'header' },
        focus: { path: [0, 0], offset: 8, root: 'header' },
      }
    );

    Editor.reset(headerEditor, {
      children: [paragraph('reset header')],
      selection: null,
    });

    unsubscribe();

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('reset header')] },
      }
    );
    assert.equal(
      headerEditor.read((state) => state.selection.get()),
      null
    );
    assert.deepEqual(commits, ['replaced header', 'reset header']);
  });

  it('lets one runtime own value while root-bound views own view policy', () => {
    const runtime = createEditorRuntime({
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
    assert.equal(Editor.isEditor(mainEditor), true);
    assert.equal(NodeApi.isEditor(headerEditor), true);
    assert.equal(mainEditor.runtime, runtime);
    assert.equal(headerEditor.runtime, runtime);
    assert.equal(
      mainEditor.read((state) => state.view.root()),
      'main'
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
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body!')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(
      headerEditor.read((state) => state.value.get()),
      mainEditor.read((state) => state.value.get())
    );
    assert.equal(
      Editor.getLastCommit(runtime.editor)?.operations[0]?.root,
      'header'
    );
  });

  it('shares extension capabilities with root-bound views', () => {
    const runtime = createEditorRuntime({
      extensions: [
        defineEditorExtension({
          name: 'custom-clipboard',
          clipboard: {
            insertData() {
              return true;
            },
          },
        }),
      ],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const runtimeRegistry = Editor.getExtensionRegistry(runtime.editor);
    const viewRegistry = Editor.getExtensionRegistry(headerEditor);

    assert.equal(viewRegistry, runtimeRegistry);
    assert.equal(
      viewRegistry.capabilities.get('clipboard.insertData')?.length,
      1
    );
  });

  it('does not materialize missing roots for no-op or failed view updates', () => {
    const runtime = createEditorRuntime({
      initialValue: { children: [paragraph('body')] },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const expectedValue = { children: [paragraph('body')] };

    headerEditor.update(() => {});

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      expectedValue
    );

    assert.throws(() => {
      headerEditor.update(() => {
        throw new Error('boom');
      });
    }, /boom/);

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      expectedValue
    );
  });

  it('passes root-scoped afterCommit snapshots for nested root-bound view updates', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const snapshots: string[] = [];
    const getSnapshotText = (children: readonly Descendant[]) =>
      (children[0]?.children[0] as { text: string }).text;

    headerEditor.update((headerTx, { afterCommit }) => {
      afterCommit(({ snapshot }) => {
        snapshots.push(`header:${getSnapshotText(snapshot.children)}`);
      });

      headerTx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });

      mainEditor.update((mainTx, { afterCommit }) => {
        afterCommit(({ snapshot }) => {
          snapshots.push(`main:${getSnapshotText(snapshot.children)}`);
        });

        mainTx.text.insert('!', {
          at: { path: [0, 0], offset: 4 },
        });
      });
    });

    assert.deepEqual(snapshots, ['header:header!', 'main:body!']);
  });

  it('keeps afterCommit bound to the context root when registered during a nested update', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const getSnapshotText = (children: readonly Descendant[]) =>
      (children[0]?.children[0] as { text: string }).text;
    let snapshotText = '';

    headerEditor.update((_headerTx, context) => {
      mainEditor.update((mainTx) => {
        context.afterCommit(({ snapshot }) => {
          snapshotText = getSnapshotText(snapshot.children);
        });

        mainTx.text.insert('!', {
          at: { path: [0, 0], offset: 4 },
        });
      });
    });

    assert.equal(snapshotText, 'header');
  });

  it('keeps main-root view afterCommit selection from the committed snapshot', () => {
    const runtime = createEditorRuntime({
      extensions: [
        defineEditorExtension({
          name: 'move-selection-on-commit',
          onCommit({ commit, editor }) {
            if (
              commit.operations.some(
                (operation) =>
                  operation.type === 'insert_text' &&
                  'text' in operation &&
                  operation.text === '!'
              )
            ) {
              editor.update((tx) => {
                tx.selection.set({
                  anchor: { path: [0, 0], offset: 0, root: 'header' },
                  focus: { path: [0, 0], offset: 0, root: 'header' },
                });
              });
            }
          },
        }),
      ],
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
        anchor: { path: [0, 0], offset: 'body'.length },
        focus: { path: [0, 0], offset: 'body'.length },
      });
      tx.text.insert('!');
    });

    assert.deepEqual(snapshotSelection, {
      anchor: { path: [0, 0], offset: 'body!'.length },
      focus: { path: [0, 0], offset: 'body!'.length },
    });
  });

  it('reads root-local paths through a root-bound view', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    const mainRuntimeId = runtime.read((state) => state.runtime.idAt([0]));
    const viewRead = headerEditor.read((state) => ({
      children: state.nodes.children(),
      node: state.nodes.get([0])[0],
      runtimeId: state.runtime.idAt([0]),
      snapshot: state.runtime.snapshot(),
      text: state.text.string([]),
      value: state.value.get(),
    }));

    assert.deepEqual(viewRead.children, [paragraph('header')]);
    assert.deepEqual(viewRead.node, paragraph('header'));
    assert.equal(viewRead.text, 'header');
    assert.notEqual(viewRead.runtimeId, mainRuntimeId);
    assert.deepEqual(viewRead.snapshot.children, [paragraph('header')]);
    assert.deepEqual(viewRead.value, {
      children: [paragraph('main')],
      roots: { header: [paragraph('header')] },
    });
  });

  it('honors explicit roots on runtime read locations', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerRange = {
      anchor: { path: [0, 0], offset: 0, root: 'header' },
      focus: { path: [0, 0], offset: 6, root: 'header' },
    };
    const read = runtime.read((state) => ({
      end: state.points.end(headerRange),
      entries: state.nodes.toArray({
        at: headerRange,
        match: NodeApi.isText,
      }),
      node: state.nodes.get(headerRange.anchor)[0],
      positions: [...state.points.positions({ at: headerRange })],
      staticText: Editor.string(runtime.editor, headerRange),
      text: state.text.string(headerRange),
    }));

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
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });

    runtime.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 2, root: 'header' },
        focus: { path: [0, 0], offset: 2, root: 'header' },
      });
    });

    const read = runtime.read((state) => ({
      above: state.nodes.above({ match: NodeApi.isElement }),
      entries: state.nodes.toArray({ match: NodeApi.isText }),
      positions: [...state.points.positions()],
      staticAbove: Editor.above(runtime.editor, { match: NodeApi.isElement }),
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
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('m1'), paragraph('m2')],
        roots: { header: [markedParagraph('header', { bold: true })] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });
    runtime.update((tx) => {
      tx.selection.set({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      }
    );
    assert.equal(
      headerEditor.read((state) => state.marks.get()),
      null
    );
    assert.deepEqual(
      mainEditor.read((state) => state.marks.get()),
      {}
    );
  });

  it('keeps implicit view reads on the view root when a sibling root owns selection', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    const read = headerEditor.read((state) => ({
      above: state.nodes.above({ match: NodeApi.isElement }),
      entries: state.nodes.toArray({ match: NodeApi.isText }),
      fragment: state.fragment.get().map(NodeApi.string),
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
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
      },
    });

    assert.throws(() => {
      runtime.read((state) =>
        state.text.string({
          anchor: { path: [0, 0], offset: 0, root: 'header' },
          focus: { path: [0, 0], offset: 6, root: 'footer' },
        })
      );
    }, /across multiple roots/);
  });

  it('reads initial selection through its declared root view', () => {
    const runtime = createEditorRuntime({
      initialSelection: {
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
      headerEditor.read((state) => state.selection.get()),
      {
        anchor: { path: [0, 0], offset: 6, root: 'header' },
        focus: { path: [0, 0], offset: 6, root: 'header' },
      }
    );
    assert.equal(
      mainEditor.read((state) => state.selection.get()),
      null
    );
  });

  it('reads marks through the active view root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [markedParagraph('header', { bold: true })] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    assert.deepEqual(
      headerEditor.read((state) => state.marks.get()),
      { bold: true }
    );
    assert.equal(
      mainEditor.read((state) => state.marks.get()),
      null
    );
  });

  it('hides sibling-root selection and marks in view snapshots', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      tx.marks.add('bold', true);
    });

    assert.deepEqual(
      mainEditor.read((state) => state.runtime.snapshot().marks),
      { bold: true }
    );
    assert.equal(
      headerEditor.read((state) => state.runtime.snapshot().selection),
      null
    );
    assert.equal(
      headerEditor.read((state) => state.runtime.snapshot().marks),
      null
    );
  });

  it('keeps selection-dependent view mutations inside the active root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
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
      runtime.read((state) => state.selection.get()),
      {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      }
    );
    assert.deepEqual(
      mainEditor.read((state) => state.marks.get()),
      {}
    );
    assert.equal(
      headerEditor.read((state) => state.selection.get()),
      null
    );
    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      }
    );
  });

  it('keeps implicit view node mutations from using sibling-root selections', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('m1'), paragraph('m2')],
        roots: { header: [paragraph('h1'), paragraph('h2')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    });
    headerEditor.update((tx) => {
      tx.nodes.remove();
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('m1'), paragraph('m2')],
        roots: { header: [paragraph('h1'), paragraph('h2')] },
      }
    );

    headerEditor.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('m1'), paragraph('m2')],
        roots: { header: [paragraph('h1')] },
      }
    );
  });

  it('keeps batched view node insert dirty paths on the invoking root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('m1')],
        roots: { header: [paragraph('h1')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let mainDirtyInside: unknown;

    headerEditor.update((tx) => {
      tx.nodes.insert([paragraph('h2'), paragraph('h3')], { at: [1] });
      mainDirtyInside = getDirtyPathsForRoot(runtime.editor, 'main');
    });

    assert.deepEqual(mainDirtyInside, []);
    assert.deepEqual(getDirtyPathsForRoot(runtime.editor, 'main'), []);
    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('m1')],
        roots: { header: [paragraph('h1'), paragraph('h2'), paragraph('h3')] },
      }
    );
    assert.deepEqual(
      Editor.getLastCommit(runtime.editor)?.operations.map(
        (operation) => operation.root
      ),
      ['header', 'header']
    );
  });

  it('uses the view root for implicit text inserts when selection is null', () => {
    const runtime = createEditorRuntime({
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
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      {
        anchor: { path: [0, 0], offset: 7, root: 'header' },
        focus: { path: [0, 0], offset: 7, root: 'header' },
      }
    );
    assert.equal(
      Editor.getLastCommit(runtime.editor)?.operations.at(-1)?.root,
      'header'
    );
  });

  it('keeps full document reads stable inside a root-bound update', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let valueInUpdate: unknown = null;

    headerEditor.update((tx) => {
      valueInUpdate = tx.value.get();
    });

    assert.deepEqual(valueInUpdate, {
      children: [paragraph('main')],
      roots: { header: [paragraph('header')] },
    });
  });

  it('rolls back imported operations in non-main roots', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      },
    });

    assert.throws(() => {
      runtime.update((tx) => {
        tx.operations.replay([
          {
            offset: 6,
            path: [0, 0],
            root: 'header',
            text: '!',
            type: 'insert_text',
          },
        ]);
        throw new Error('boom');
      });
    }, /boom/);

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('main')],
        roots: { header: [paragraph('header')] },
      }
    );
  });

  it('keeps base runtime subscriptions on the base snapshot for rooted replay', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    let listenerText: string | undefined;
    let listenerOperationRoot: string | undefined;
    const unsubscribe = runtime.subscribe((snapshot, change) => {
      listenerText = (
        snapshot.children[0] as Descendant & {
          children: [{ text: string }];
        }
      ).children[0].text;
      listenerOperationRoot = change?.operations[0]?.root;
    });

    runtime.update((tx) => {
      tx.operations.replay([
        {
          offset: 6,
          path: [0, 0],
          root: 'header',
          text: '!',
          type: 'insert_text',
        },
      ]);
    });
    unsubscribe();

    assert.equal(listenerText, 'body');
    assert.equal(listenerOperationRoot, 'header');
    assert.deepEqual(
      runtime.read((state) => state.runtime.snapshot().children),
      [paragraph('body')]
    );
    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
  });

  it('preserves sibling-root runtime ids after failed non-main root updates', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainRuntimeId = runtime.read((state) => state.runtime.idAt([0]));

    assert.throws(() => {
      headerEditor.update((tx) => {
        tx.text.insert('!', {
          at: { path: [0, 0], offset: 6 },
        });
        throw new Error('boom');
      });
    }, /boom/);

    assert.equal(
      runtime.read((state) => state.runtime.idAt([0])),
      mainRuntimeId
    );
    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
  });

  it('keeps path refs scoped to their owning root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('first'), paragraph('second')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainRef = Editor.pathRef(runtime.editor, [1]);
    const headerRef = Editor.pathRef(
      headerEditor as unknown as typeof runtime.editor,
      [0]
    );

    headerEditor.update((tx) => {
      tx.nodes.insert(paragraph('inserted'), { at: [0] });
    });

    assert.deepEqual(mainRef.current, [1]);
    assert.deepEqual(headerRef.current, [1]);

    mainRef.unref();
    headerRef.unref();
  });

  it('normalizes writes in the invoking view root', () => {
    const emptyParagraph = {
      type: 'paragraph',
      children: [],
    } as Descendant;
    const runtime = createEditorRuntime({
      initialValue: {
        children: [emptyParagraph],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    assert.doesNotThrow(() => {
      headerEditor.update((tx) => {
        tx.nodes.insert(paragraph('inserted'), { at: [0] });
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [emptyParagraph],
        roots: { header: [paragraph('inserted'), paragraph('header')] },
      }
    );
  });

  it('plans writes against the invoking view root', () => {
    const runtime = createEditorRuntime({
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
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('one'), paragraph('two!')] },
      }
    );
  });

  it('defaults rootless path refs to the invoking view root during updates', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main'), paragraph('other')],
        roots: { header: [paragraph('first'), paragraph('second')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let refPath: unknown = null;

    headerEditor.update((tx) => {
      const ref = Editor.pathRef(runtime.editor, [1]);

      tx.nodes.remove({ at: [0] });
      refPath = ref.unref();
    });

    assert.deepEqual(refPath, [0]);
    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('main'), paragraph('other')],
        roots: { header: [paragraph('second')] },
      }
    );
  });

  it('defaults rootless point and range refs to the invoking view root during updates', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main'), paragraph('other')],
        roots: { header: [paragraph('first'), paragraph('second')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let point: unknown = null;
    let range: unknown = null;

    headerEditor.update((tx) => {
      const pointRef = Editor.pointRef(runtime.editor, {
        path: [1, 0],
        offset: 0,
      });
      const rangeRef = Editor.rangeRef(runtime.editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      });

      assert.equal(Object.hasOwn(pointRef, 'root'), false);
      assert.equal(Object.hasOwn(rangeRef, 'root'), false);

      tx.nodes.remove({ at: [0] });
      tx.operations.replay([
        {
          offset: 0,
          path: [0, 0],
          root: 'main',
          text: '!',
          type: 'insert_text',
        },
      ]);
      point = pointRef.unref();
      range = rangeRef.unref();
    });

    assert.deepEqual(point, { path: [0, 0], offset: 0 });
    assert.deepEqual(range, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    assert.deepEqual(
      runtime.read((state) => state.value.root()),
      [paragraph('!main'), paragraph('other')]
    );
  });

  it('defaults rootless bookmarks to the invoking view root during reads', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const bookmark = headerEditor.read((state) =>
      state.ranges.bookmark({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      })
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

    const range = bookmark.unref();

    assert.deepEqual(range, {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    assert.equal(Object.hasOwn(range!.anchor, 'root'), false);
    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body?')],
        roots: { header: [paragraph('header!')] },
      }
    );
  });

  it('defaults rootless static bookmarks to the invoking view root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const viewBookmark = Editor.bookmark(headerEditor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    });
    let activeRootBookmark: ReturnType<typeof Editor.bookmark> | null = null;

    headerEditor.update((tx) => {
      activeRootBookmark = Editor.bookmark(runtime.editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 6 },
      });
    });
    mainEditor.update((tx) => {
      tx.text.insert('?', {
        at: { path: [0, 0], offset: 4 },
      });
    });

    assert.deepEqual(viewBookmark.unref(), {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    assert.deepEqual(activeRootBookmark!.unref(), {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body?')],
        roots: { header: [paragraph('header!')] },
      }
    );
  });

  it('keeps root-view static transforms from reusing another root selection', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    runtime.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    assert.equal(
      headerEditor.read((state) => state.selection.get()),
      null
    );

    Editor.insertText(headerEditor, '!');

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );

    Editor.insertText(headerEditor, '!', {
      at: { path: [0, 0], offset: 6 },
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
  });

  it('deletes multi-block selections from the invoking view root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('ab'), paragraph('cd')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [1, 0], offset: 1 },
      });
      tx.text.delete();
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      { children: [paragraph('main')], roots: { header: [paragraph('ad')] } }
    );
  });

  it('restores the view root before notifying subscribers for nested-root structural edits', () => {
    const runtime = createEditorRuntime({
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
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('Confidential quarterly plan')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.selection.set({
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
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('helloConfidential quarterly plan')] },
      }
    );
    assert.deepEqual(
      headerEditor.read((state) => state.selection.get()),
      {
        anchor: { path: [0, 0], offset: 5, root: 'header' },
        focus: { path: [0, 0], offset: 5, root: 'header' },
      }
    );
  });

  it("preserves the focused root selection when undoing another root's batch", () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const mainSelection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };

    headerEditor.update((tx) => {
      tx.selection.set({
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
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      mainSelection
    );
    assert.deepEqual(
      mainEditor.read((state) => state.selection.get()),
      mainSelection
    );
    assert.equal(
      headerEditor.read((state) => state.selection.get()),
      null
    );

    mainEditor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      mainSelection
    );
    assert.deepEqual(
      mainEditor.read((state) => state.selection.get()),
      mainSelection
    );
    assert.equal(
      headerEditor.read((state) => state.selection.get()),
      null
    );
    assert.equal(
      Editor.getLastCommit(runtime.editor)?.operations.some(
        (operation) =>
          operation.type === 'set_selection' && operation.root === 'header'
      ),
      false
    );
  });

  it("preserves the focused root selection when redoing another root's batch", () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const mainSelection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      tx.text.insert('!');
      tx.selection.set({
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
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header!')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      mainSelection
    );
    assert.deepEqual(
      mainEditor.read((state) => state.selection.get()),
      mainSelection
    );
    assert.equal(
      headerEditor.read((state) => state.selection.get()),
      null
    );
  });

  it('restores null selection when undoing a programmatic non-main root batch', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
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
      headerEditor.read((state) => state.selection.get()),
      null
    );

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });
    headerEditor.update((tx) => {
      tx.history.undo();
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.equal(
      headerEditor.read((state) => state.selection.get()),
      null
    );
    assert.equal(
      runtime.read((state) => state.selection.get()),
      null
    );
  });

  it('applies main-root replay operations while inside a non-main view update', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
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
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
  });

  it('replays exported primary commit operations against the primary document inside root views', () => {
    const source = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });

    source.update((tx) => {
      tx.operations.replay([
        {
          offset: 4,
          path: [0, 0],
          text: '!',
          type: 'insert_text',
        },
      ]);
    });

    const operations = Editor.getLastCommit(source.editor)?.operations;
    assert.deepEqual(operations, [
      {
        offset: 4,
        path: [0, 0],
        text: '!',
        type: 'insert_text',
      },
    ]);
    assert(operations);

    const target = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(target, { root: 'header' });

    headerEditor.update((tx) => {
      tx.operations.replay(operations);
    });

    assert.deepEqual(
      target.read((state) => state.value.get()),
      {
        children: [paragraph('body!')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.deepEqual(Editor.getLastCommit(target.editor)?.operations, [
      {
        offset: 4,
        path: [0, 0],
        text: '!',
        type: 'insert_text',
      },
    ]);
  });

  it('preserves nested non-main root replay operations inside another root update', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.operations.replay([
        {
          offset: 6,
          path: [0, 0],
          root: 'footer',
          text: '!',
          type: 'insert_text',
        },
      ]);
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: {
          footer: [paragraph('footer!')],
          header: [paragraph('header')],
        },
      }
    );
    assert.deepEqual(Editor.getLastCommit(runtime.editor)?.operations.at(-1), {
      offset: 6,
      path: [0, 0],
      root: 'footer',
      text: '!',
      type: 'insert_text',
    });
  });

  it('reports replay dirtiness from the operation root inside sibling view updates', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
      },
    });
    const footerEditor = createEditorView(runtime, { root: 'footer' });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const footerTextId = footerEditor.read((state) =>
      state.runtime.idAt([0, 0])
    );
    const headerTextId = headerEditor.read((state) =>
      state.runtime.idAt([0, 0])
    );
    let nodeImpactRuntimeIds: readonly string[] | null | undefined;
    const unsubscribe = runtime.subscribe((_snapshot, change) => {
      nodeImpactRuntimeIds = change?.nodeImpactRuntimeIds;
    });

    headerEditor.update((tx) => {
      tx.operations.replay([
        {
          offset: 6,
          path: [0, 0],
          root: 'footer',
          text: '!',
          type: 'insert_text',
        },
      ]);
    });
    unsubscribe();

    assert.ok(footerTextId);
    assert.ok(headerTextId);
    assert.ok(nodeImpactRuntimeIds);
    assert.equal(nodeImpactRuntimeIds.includes(footerTextId), true);
    assert.equal(nodeImpactRuntimeIds.includes(headerTextId), false);
  });

  it('uses unknown runtime impact for mixed-root replay commits', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { footer: [paragraph('footer')], header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let nodeImpactRuntimeIds: readonly string[] | null | undefined;
    const unsubscribe = runtime.subscribe((_snapshot, change) => {
      nodeImpactRuntimeIds = change?.nodeImpactRuntimeIds;
    });

    headerEditor.update((tx) => {
      tx.operations.replay([
        {
          offset: 6,
          path: [0, 0],
          root: 'footer',
          text: '!',
          type: 'insert_text',
        },
        {
          offset: 6,
          path: [0, 0],
          root: 'header',
          text: '!',
          type: 'insert_text',
        },
      ]);
    });
    unsubscribe();

    assert.equal(nodeImpactRuntimeIds, null);
  });

  it('reads selection changes made inside a root-bound view transaction', () => {
    const runtime = createEditorRuntime({
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
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    headerEditor.update((tx) => {
      assert.equal(tx.selection.get(), null);
      tx.selection.set({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      selectionAfterSet = tx.selection.get();
    });

    assert.deepEqual(selectionAfterSet, {
      anchor: { path: [0, 0], offset: 6, root: 'header' },
      focus: { path: [0, 0], offset: 6, root: 'header' },
    });
  });

  it('switches selection roots when rootless view selection matches main coordinates', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);

    mainEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });
    headerEditor.update((tx) => {
      assert.equal(tx.selection.get(), null);
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      tx.text.insert('!');
    });

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('!header')] },
      }
    );
    assert.deepEqual(
      headerEditor.read((state) => state.selection.get()),
      {
        anchor: { path: [0, 0], offset: 1, root: 'header' },
        focus: { path: [0, 0], offset: 1, root: 'header' },
      }
    );
  });

  it('returns view-scoped snapshots from root-bound subscriptions', () => {
    const runtime = createEditorRuntime({
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
        snapshot.children[0] as Descendant & {
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
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let listenerText: string | undefined;

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
    });

    const unsubscribe = runtime.subscribe((snapshot) => {
      listenerText = (
        snapshot.children[0] as Descendant & {
          children: [{ text: string }];
        }
      ).children[0].text;
    });

    Editor.insertText(runtime.editor, '!');
    unsubscribe();

    assert.equal(listenerText, 'body');
    assert.deepEqual(
      runtime.read((state) => state.value.root('header')),
      [paragraph('header!')]
    );
  });

  it('keeps base snapshots stable when implicit delete targets the selection root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let listenerText: string | undefined;

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
    });

    const unsubscribe = runtime.subscribe((snapshot) => {
      listenerText = (
        snapshot.children[0] as Descendant & {
          children: [{ text: string }];
        }
      ).children[0].text;
    });

    Editor.deleteBackward(runtime.editor);
    unsubscribe();

    assert.equal(listenerText, 'body');
    assert.deepEqual(
      runtime.read((state) => state.value.root('header')),
      [paragraph('heade')]
    );
  });

  it('keeps base snapshots stable when update-scoped delete targets the selection root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    let listenerText: string | undefined;

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
    });

    const unsubscribe = runtime.subscribe((snapshot) => {
      listenerText = (
        snapshot.children[0] as Descendant & {
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
      runtime.read((state) => state.value.root('header')),
      [paragraph('heade')]
    );
  });

  it('keeps root-local collapsed delete ranges in the view root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('h')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    headerEditor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
        reverse: true,
        unit: 'character',
      });
    });

    assert.deepEqual(
      runtime.read((state) => state.value.root('header')),
      [paragraph('')]
    );
    assert.deepEqual(
      runtime
        .read((state) => state.value.lastCommit()?.operations ?? [])
        .filter((operation) => operation.type !== 'set_selection'),
      [
        {
          offset: 0,
          path: [0, 0],
          root: 'header',
          text: 'h',
          type: 'remove_text',
        },
      ]
    );
  });

  it('keeps sibling root reads isolated inside active root updates', () => {
    const runtime = createEditorRuntime({
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
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('one'), paragraph('two')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const seenPaths: number[][] = [];
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
    const runtime = createEditorRuntime({
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
    const runtime = createEditorRuntime({
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
      runtime.read((state) => state.value.root()[0]?.type),
      'paragraph'
    );
    assert.equal(
      runtime.read((state) => state.value.root('header')[0]?.type),
      'heading-one'
    );
  });
});
