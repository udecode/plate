import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import type {
  Descendant,
  Element,
  Selection,
  Editor as SlateEditor,
} from '@platejs/slate';
import {
  createEditor,
  createEditorRuntime,
  createEditorView,
} from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';

import { History, history } from '../src';

const paragraph = (
  text: string,
  props: Record<string, unknown> = {}
): Descendant => ({
  type: 'paragraph',
  ...props,
  children: [{ text }],
});

const historyTestEditor = () => createEditor({ extensions: [history()] });

const getHistory = (editor: SlateEditor) =>
  editor.read((state: any) => state.history.get());

const undo = (editor: SlateEditor) => {
  editor.update((tx) => {
    tx.history.undo();
  });
};

const redo = (editor: SlateEditor) => {
  editor.update((tx) => {
    tx.history.redo();
  });
};

const replace = (
  editor: SlateEditor,
  children: Descendant[],
  selection: Selection = null
) => {
  Editor.replace(editor, {
    children: structuredClone(children),
    selection: structuredClone(selection),
    marks: null,
  });
};

const getVisibleState = (editor: SlateEditor) => {
  const snapshot = Editor.getSnapshot(editor);

  return {
    children: snapshot.children,
    selection: snapshot.selection,
  };
};

const write = (
  editor: SlateEditor,
  fn: Parameters<SlateEditor['update']>[0],
  options?: Parameters<SlateEditor['update']>[1]
) => {
  editor.update(fn, options);
};

describe('slate-history contract', () => {
  it('documents React-owned history setup through useSlateEditor', () => {
    const docs = readFileSync(
      new URL(
        '../../../docs/libraries/slate-history/history-extension-setup.md',
        import.meta.url
      ),
      'utf8'
    );

    assert.match(docs, /import \{ createEditor \} from '@platejs\/slate'/);
    assert.match(
      docs,
      /import \{ useSlateEditor \} from '@platejs\/slate-react'/
    );
    assert.match(docs, /const editor = useSlateEditor\(\{/);
    assert.doesNotMatch(docs, /createReactEditor/);
  });

  it('keeps History.isHistory true before edits and across edit, undo, and redo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Initial text')], {
      anchor: { path: [0, 0], offset: 12 },
      focus: { path: [0, 0], offset: 12 },
    });

    assert.equal(History.isHistory(getHistory(editor)), true);

    write(editor, (tx) => {
      tx.text.insert(' additional text');
    });
    assert.equal(History.isHistory(getHistory(editor)), true);

    undo(editor);
    assert.equal(History.isHistory(getHistory(editor)), true);

    redo(editor);
    assert.equal(History.isHistory(getHistory(editor)), true);
  });

  it('keeps empty undo and redo stacks as no-op commands', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Initial text')], {
      anchor: { path: [0, 0], offset: 12 },
      focus: { path: [0, 0], offset: 12 },
    });

    const before = getVisibleState(editor);

    undo(editor);
    redo(editor);

    assert.deepEqual(getVisibleState(editor), before);
    assert.deepEqual(getHistory(editor).undos, []);
    assert.deepEqual(getHistory(editor).redos, []);
  });

  it('undoes a plain insertText commit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('text');
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes a deferred native text burst to the original insertion offset', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], null);

    write(
      editor,
      (tx) => {
        for (let offset = 1; offset <= 10; offset++) {
          tx.selection.set({
            anchor: { path: [0, 0], offset },
            focus: { path: [0, 0], offset },
          });
        }

        tx.text.insert('XXXXXXXXXX', {
          at: { path: [0, 0], offset: 1 },
        });
        tx.selection.set({
          anchor: { path: [0, 0], offset: 11 },
          focus: { path: [0, 0], offset: 11 },
        });
        tx.selection.set({
          anchor: { path: [0, 0], offset: 10 },
          focus: { path: [0, 0], offset: 10 },
        });
        tx.selection.set({
          anchor: { path: [0, 0], offset: 11 },
          focus: { path: [0, 0], offset: 11 },
        });
      },
      {
        metadata: { origin: { kind: 'native-text-input' } },
      }
    );
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });
  });

  it('undoes a stale native text burst selection to the inserted offset', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });

    write(
      editor,
      (tx) => {
        tx.operations.replay([
          {
            offset: 1,
            path: [0, 0],
            text: 'XXXXXXXXXX',
            type: 'insert_text',
          },
          {
            newProperties: {
              anchor: { path: [0, 0], offset: 11 },
              focus: { path: [0, 0], offset: 11 },
            },
            properties: {
              anchor: { path: [0, 0], offset: 15 },
              focus: { path: [0, 0], offset: 15 },
            },
            type: 'set_selection',
          },
        ]);
      },
      {
        metadata: { origin: { kind: 'native-text-input' } },
      }
    );
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    redo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('CXXXXXXXXXXondico uredo ante arca umbra.')],
      selection: {
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      },
    });
  });

  it('restores pre-insert selection for non-native long text inserts before the caret', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });

    write(editor, (tx) => {
      tx.operations.replay([
        {
          offset: 1,
          path: [0, 0],
          text: 'XXXXXXXXXX',
          type: 'insert_text',
        },
        {
          newProperties: {
            anchor: { path: [0, 0], offset: 11 },
            focus: { path: [0, 0], offset: 11 },
          },
          properties: {
            anchor: { path: [0, 0], offset: 15 },
            focus: { path: [0, 0], offset: 15 },
          },
          type: 'set_selection',
        },
      ]);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
    });
  });

  it('restores leading selection ops for non-native long text inserts before the caret', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Condico uredo ante arca umbra.')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    write(editor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
      tx.text.insert('XYZ', {
        at: { path: [0, 0], offset: 1 },
      });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('Condico uredo ante arca umbra.')],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
  });

  it('does not merge adjacent text history batches across roots', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('x')],
        roots: { header: [paragraph('')] },
      },
    });

    write(editor, (tx) => {
      tx.text.insert('a', {
        at: { offset: 0, path: [0, 0], root: 'header' },
      });
    });
    write(editor, (tx) => {
      tx.text.insert('b', {
        at: { offset: 1, path: [0, 0] },
      });
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);
    assert.deepEqual(
      editor.read((state) => state.value.get()),
      { children: [paragraph('x')], roots: { header: [paragraph('a')] } }
    );

    undo(editor);
    assert.deepEqual(
      editor.read((state) => state.value.get()),
      { children: [paragraph('x')], roots: { header: [paragraph('')] } }
    );
  });

  it('does not merge view-local text history batches across roots', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('m')],
        roots: { footer: [paragraph('f')], header: [paragraph('h')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const footerEditor = createEditorView(runtime, { root: 'footer' });

    write(headerEditor, (tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.text.insert('1');
    });
    write(mainEditor, (tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.text.insert('1');
    });
    write(footerEditor, (tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.text.insert('1');
    });
    write(headerEditor, (tx) => {
      tx.selection.set({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      tx.text.insert('2');
    });
    write(mainEditor, (tx) => {
      tx.selection.set({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      tx.text.insert('2');
    });

    assert.equal(getHistory(runtime).undos.length, 5);

    undo(headerEditor);
    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('m1')],
        roots: { footer: [paragraph('f1')], header: [paragraph('h12')] },
      }
    );
  });

  it('does not let explicit merge metadata merge text batches across roots', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('m')],
        roots: { footer: [paragraph('f')], header: [paragraph('h')] },
      },
    });

    editor.update((tx) => {
      tx.text.insert('1', {
        at: { offset: 1, path: [0, 0], root: 'footer' },
      });
    });
    editor.update(
      (tx) => {
        tx.text.insert('2', {
          at: { offset: 1, path: [0, 0], root: 'header' },
        });
      },
      { metadata: { history: { mode: 'merge' } } }
    );

    assert.equal(getHistory(editor).undos.length, 2);
  });

  it('lets explicit merge metadata merge same-root non-text batches', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('alpha')], null);
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.nodes.insert(paragraph('beta'), { at: [1] });
    });
    editor.update(
      (tx) => {
        tx.nodes.insert(paragraph('gamma'), { at: [2] });
      },
      { metadata: { history: { mode: 'merge' } } }
    );

    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      paragraph('alpha'),
      paragraph('beta'),
      paragraph('gamma'),
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not let native merge metadata merge same-node caret jumps', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('abcd')], {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    editor.update(
      (tx) => {
        tx.text.insert('X', {
          at: { offset: 1, path: [0, 0] },
        });
      },
      { metadata: { origin: { kind: 'native-text-input' } } }
    );
    editor.update(
      (tx) => {
        tx.text.insert('Y', {
          at: { offset: 4, path: [0, 0] },
        });
      },
      {
        metadata: {
          history: { mode: 'merge' },
          origin: { kind: 'native-text-input' },
        },
      }
    );

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);

    assert.deepEqual(Editor.getSnapshot(editor).children, [paragraph('aXbcd')]);
  });

  it('does not restore a primary selection into a sibling root undo batch', () => {
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const mainEditor = createEditorView(runtime);
    const headerEditor = createEditorView(runtime, { root: 'header' });

    write(mainEditor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });

    write(headerEditor, (tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
    });

    undo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      }
    );
    assert.deepEqual(
      mainEditor.read((state) => state.selection.get()),
      {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      }
    );
    assert.equal(
      headerEditor.read((state) => state.selection.get()),
      null
    );
  });

  it('undoes and redoes an island insert with its explicit child root', () => {
    const childRoot = 'island:body';
    const island = {
      type: 'editable-void',
      childRoots: { body: childRoot },
      children: [{ text: '' }],
    } as Descendant;
    const editor = createEditor({
      extensions: [history()],
      initialValue: { children: [paragraph('body')] },
    });

    write(editor, (tx) => {
      tx.operations.replay([
        {
          children: [],
          index: 0,
          newChildren: [paragraph('child')],
          newSelection: null,
          path: [],
          root: childRoot,
          selection: null,
          type: 'replace_children',
        },
      ]);
      tx.nodes.insert(island, { at: [1] });
    });

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body'), island],
        roots: { [childRoot]: [paragraph('child')] },
      }
    );

    undo(editor);

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      { children: [paragraph('body')] }
    );

    redo(editor);

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body'), island],
        roots: { [childRoot]: [paragraph('child')] },
      }
    );
  });

  it('undoes a full-document selected text replacement as one structural batch', () => {
    const editor = historyTestEditor();
    const selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 'two'.length },
    };

    replace(editor, [paragraph('one'), paragraph('two')], selection);
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('Z', { at: selection });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [paragraph('Z')]);
    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(
      getHistory(editor).undos[0]?.operations.map(
        (operation) => operation.type
      ),
      ['replace_children']
    );

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes a full-document fragment deletion as one structural batch', () => {
    const editor = historyTestEditor();
    const selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [2, 0], offset: 'three'.length },
    };

    replace(
      editor,
      [paragraph('one'), paragraph('two'), paragraph('three')],
      selection
    );
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.fragment.delete({ direction: 'backward' });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [paragraph('')]);
    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(
      getHistory(editor).undos[0]?.operations.map(
        (operation) => operation.type
      ),
      ['replace_children']
    );

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('keeps replace_children undo batches when a remote insert shifts the parent path', () => {
    const editor = historyTestEditor();
    const oldChild = paragraph('old');
    const newChild = paragraph('new');

    replace(
      editor,
      [
        paragraph('intro'),
        {
          type: 'quote',
          children: [oldChild, paragraph('tail')],
        } as Descendant,
      ],
      {
        anchor: { path: [1, 0, 0], offset: 3 },
        focus: { path: [1, 0, 0], offset: 3 },
      }
    );

    write(editor, (tx) => {
      tx.operations.replay([
        {
          type: 'replace_children',
          path: [1],
          index: 0,
          children: [oldChild],
          newChildren: [newChild],
          selection: {
            anchor: { path: [1, 0, 0], offset: 3 },
            focus: { path: [1, 0, 0], offset: 3 },
          },
          newSelection: {
            anchor: { path: [1, 0, 0], offset: 3 },
            focus: { path: [1, 0, 0], offset: 3 },
          },
        },
      ]);
    });

    editor.update(
      (tx) => {
        tx.operations.replay([
          {
            type: 'insert_node',
            path: [0],
            node: paragraph('remote'),
          },
        ]);
      },
      {
        metadata: { collab: { origin: 'remote', saveToHistory: false } },
        tag: ['collaboration', 'remote-insert'],
      }
    );

    const operation = getHistory(editor).undos[0]?.operations[0];

    assert.equal(getHistory(editor).undos.length, 1);

    if (operation?.type !== 'replace_children') {
      assert.fail('Expected replace_children to remain in undo history');
    }

    assert.deepEqual(operation.path, [2]);
    assert.equal(operation.index, 0);
  });

  it('rebases rootless replacement selections through non-main root edits', () => {
    const oldChild = paragraph('old');
    const newChild = paragraph('new');
    const runtime = createEditorRuntime({
      extensions: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [oldChild, paragraph('tail')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    write(headerEditor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });

    write(headerEditor, (tx) => {
      tx.operations.replay([
        {
          children: [oldChild],
          index: 0,
          newChildren: [newChild],
          newSelection: {
            anchor: { path: [0, 0], offset: 3 },
            focus: { path: [0, 0], offset: 3 },
          },
          path: [],
          root: 'header',
          selection: {
            anchor: { path: [0, 0], offset: 3 },
            focus: { path: [0, 0], offset: 3 },
          },
          type: 'replace_children',
        },
      ]);
    });

    headerEditor.api.history.withoutSaving(() => {
      write(headerEditor, (tx) => {
        tx.operations.replay([
          {
            node: paragraph('remote'),
            path: [0],
            root: 'header',
            type: 'insert_node',
          },
        ]);
      });
    });

    const operation = getHistory(headerEditor).undos[0]?.operations[0];

    if (operation?.type !== 'replace_children') {
      assert.fail('Expected replace_children to remain in undo history');
    }

    assert.deepEqual(operation.selection?.anchor.path, [1, 0]);
    assert.deepEqual(operation.newSelection?.anchor.path, [1, 0]);

    undo(headerEditor);

    assert.deepEqual(
      runtime.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        roots: { header: [paragraph('remote'), oldChild, paragraph('tail')] },
      }
    );
    assert.deepEqual(
      runtime.read((state) => state.selection.get()),
      {
        anchor: { path: [1, 0], offset: 3, root: 'header' },
        focus: { path: [1, 0], offset: 3, root: 'header' },
      }
    );
  });

  it('rebases saved undo batches across local withoutSaving document edits', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('abcdef')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    write(editor, (tx) => {
      tx.text.insert('X');
    });

    editor.api.history.withoutSaving(() => {
      write(editor, (tx) => {
        tx.text.insert('Y', { at: { path: [0, 0], offset: 0 } });
      });
    });

    const operation = getHistory(editor).undos[0]?.operations[0];

    if (operation?.type !== 'insert_text') {
      assert.fail('Expected insert_text to remain in undo history');
    }

    assert.equal(operation.offset, 4);

    undo(editor);

    assert.equal(Editor.string(editor, [0]), 'Yabcdef');
  });

  it('drops saved undo batches deleted by local withoutSaving edits', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('ab')], {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    write(editor, (tx) => {
      tx.text.insert('X');
    });

    assert.equal(Editor.string(editor, [0]), 'aXb');
    assert.equal(getHistory(editor).undos.length, 1);

    editor.api.history.withoutSaving(() => {
      write(editor, (tx) => {
        tx.text.delete({
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 2 },
          },
        });
      });
    });

    assert.equal(Editor.string(editor, [0]), 'b');
    assert.equal(getHistory(editor).undos.length, 0);

    undo(editor);

    assert.equal(Editor.string(editor, [0]), 'b');
    assert.equal(getHistory(editor).undos.length, 0);
    assert.equal(getHistory(editor).redos.length, 0);
  });

  it('rebases saved non-main split positions across withoutSaving text edits', () => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('abcdef')] },
      },
    });

    write(editor, (tx) => {
      tx.operations.replay([
        {
          path: [0, 0],
          position: 3,
          properties: {},
          root: 'header',
          type: 'split_node',
        },
      ]);
    });

    editor.api.history.withoutSaving(() => {
      write(editor, (tx) => {
        tx.text.insert('Y', {
          at: { offset: 0, path: [0, 0], root: 'header' },
        });
      });
    });

    undo(editor);
    redo(editor);

    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('main')],
        roots: {
          header: [
            {
              type: 'paragraph',
              children: [{ text: 'Yabc' }, { text: 'def' }],
            },
          ],
        },
      }
    );
  });

  it('routes tx undo and redo through history commands', () => {
    const editor = historyTestEditor();
    const commands: string[] = [];

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const unsubscribeUndo = Editor.registerCommand(
      editor,
      'history_undo',
      (context, next) => {
        commands.push(context.command.type);
        return next();
      }
    );
    const unsubscribeRedo = Editor.registerCommand(
      editor,
      'history_redo',
      (context, next) => {
        commands.push(context.command.type);
        return next();
      }
    );

    write(editor, (tx) => {
      tx.text.insert('!');
    });
    undo(editor);
    redo(editor);
    unsubscribeUndo();
    unsubscribeRedo();

    assert.deepEqual(commands, ['history_undo', 'history_redo']);
    assert.equal(Editor.string(editor, [0]), 'one!');
  });

  it('merges contiguous insertText commits into one undo unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('t');
    });
    write(editor, (tx) => {
      tx.text.insert('w');
    });
    write(editor, (tx) => {
      tx.text.insert('o');
    });

    assert.equal(getHistory(editor).undos.length, 1);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('merges typing after selected text replacement into one undo unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('This is editable plain text')], {
      anchor: { path: [0, 0], offset: 'This is editable '.length },
      focus: { path: [0, 0], offset: 'This is editable plain '.length },
    });

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('s');
    });
    for (const text of ['i', 'm', 'p', 'l', 'e']) {
      write(editor, (tx) => {
        tx.text.insert(text);
      });
    }

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(Editor.string(editor, [0]), 'This is editable simpletext');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('merges typing after multi-leaf selected text replacement into one undo unit', () => {
    const editor = historyTestEditor();

    replace(
      editor,
      [
        {
          type: 'paragraph',
          children: [
            { text: 'This is editable ' },
            { bold: true, text: 'rich' },
            { text: ' text, much better' },
          ],
        } as Descendant,
      ],
      {
        anchor: { path: [0, 0], offset: 'This is '.length },
        focus: { path: [0, 2], offset: ' text'.length },
      }
    );

    const before = getVisibleState(editor);

    for (const text of ['e', 'x', 'a', 'm', 'p', 'l', 'e']) {
      write(editor, (tx) => {
        tx.text.insert(text);
      });
    }

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(Editor.string(editor, [0]), 'This is example, much better');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('uses update metadata to push, merge, and skip history batches', () => {
    const pushEditor = historyTestEditor();

    replace(pushEditor, [paragraph('')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    pushEditor.update((tx) => {
      tx.text.insert('a');
    });
    pushEditor.update(
      (tx) => {
        tx.text.insert('b');
      },
      { metadata: { history: { mode: 'push' } } }
    );

    assert.equal(getHistory(pushEditor).undos.length, 2);

    const mergeEditor = historyTestEditor();

    replace(mergeEditor, [paragraph('')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    mergeEditor.update((tx) => {
      tx.text.insert('a');
    });
    mergeEditor.update(
      (tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
        tx.text.insert('b');
      },
      { metadata: { history: { mode: 'merge' } } }
    );

    assert.equal(getHistory(mergeEditor).undos.length, 1);

    const skipEditor = historyTestEditor();

    replace(skipEditor, [paragraph('')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    skipEditor.update(
      (tx) => {
        tx.text.insert('a');
      },
      { metadata: { history: { mode: 'skip' } } }
    );

    assert.equal(getHistory(skipEditor).undos.length, 0);
  });

  it('clears redo history when a new edit follows undo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one')], {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('a');
    });
    undo(editor);

    assert.equal(getHistory(editor).undos.length, 0);
    assert.equal(getHistory(editor).redos.length, 1);

    write(editor, (tx) => {
      tx.text.insert('b');
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(getHistory(editor).redos.length, 0);
    assert.equal(Editor.string(editor, [0]), 'oneb');

    redo(editor);

    assert.equal(Editor.string(editor, [0]), 'oneb');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes and redoes a selected block property change', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('AAA'), paragraph('BBB')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.nodes.set<Element>({ type: 'quote' }, { at: [0] });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'quote',
        children: [{ text: 'AAA' }],
      },
      paragraph('BBB'),
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);

    redo(editor);

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'quote',
        children: [{ text: 'AAA' }],
      },
      paragraph('BBB'),
    ]);
  });

  it('merges repeated block property changes into one undo unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('AAA', { status: 'draft' })], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.nodes.set<Element>({ status: 'review' }, { at: [0] });
    });
    write(editor, (tx) => {
      tx.nodes.set<Element>({ status: 'published' }, { at: [0] });
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      paragraph('AAA', { status: 'published' }),
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes and redoes custom text property changes', () => {
    const editor = historyTestEditor();

    replace(editor, [
      {
        type: 'paragraph',
        children: [{ text: 'Styled text', className: 'token' }],
      },
    ]);
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.operations.replay([
        {
          type: 'set_node',
          path: [0, 0],
          properties: { className: 'token' },
          newProperties: { className: 'highlight' },
        },
      ]);
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'Styled text', className: 'highlight' }],
      },
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);

    redo(editor);

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'Styled text', className: 'highlight' }],
      },
    ]);
  });

  it('saves node property commits but ignores empty updates', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Initial text')], {
      anchor: { path: [0, 0], offset: 12 },
      focus: { path: [0, 0], offset: 12 },
    });
    const before = getVisibleState(editor);

    editor.update(() => {});

    assert.equal(getHistory(editor).undos.length, 0);

    editor.update((tx) => {
      tx.operations.replay([
        {
          type: 'set_node',
          path: [0],
          properties: {},
          newProperties: { role: 'updated' },
        },
      ]);
    });

    assert.equal(getHistory(editor).undos.length, 1);
    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        role: 'updated',
        children: [{ text: 'Initial text' }],
      },
    ]);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not save no-op boundary deletes to history', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    write(editor, (tx) => {
      tx.text.deleteBackward();
    });
    write(editor, (tx) => {
      tx.text.deleteForward();
    });

    assert.equal(getHistory(editor).undos.length, 0);
    assert.deepEqual(Editor.getSnapshot(editor).children, [paragraph('')]);
  });

  it('merges contiguous text commits when selection import shares a text commit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('')], null);
    const before = getVisibleState(editor);

    editor.update((tx) => {
      tx.operations.replay([
        {
          offset: 0,
          path: [0, 0],
          text: 'U',
          type: 'insert_text',
        },
      ]);
    });
    editor.update((tx) => {
      tx.operations.replay([
        {
          newProperties: {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 1 },
          },
          properties: null,
          type: 'set_selection',
        },
        {
          offset: 1,
          path: [0, 0],
          text: 'n',
          type: 'insert_text',
        },
      ]);
    });

    assert.equal(getHistory(editor).undos.length, 1);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undo restores the imported caret when selection import leads a text commit', () => {
    const editor = historyTestEditor();
    const start = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const middle = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };

    replace(editor, [paragraph('abcdef')], start);

    editor.update((tx) => {
      tx.operations.replay([
        {
          newProperties: middle,
          properties: start,
          type: 'set_selection',
        },
        {
          offset: 3,
          path: [0, 0],
          text: 'X',
          type: 'insert_text',
        },
      ]);
    });

    assert.equal(Editor.string(editor, [0]), 'abcXdef');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcdef')],
      selection: middle,
    });

    redo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcXdef')],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
    });
  });

  it('redo preserves explicit selection after the first saveable operation', () => {
    const editor = historyTestEditor();
    const middle = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    };
    const afterInsert = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };
    const trailing = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    replace(editor, [paragraph('abcdef')], middle);

    editor.update((tx) => {
      tx.operations.replay([
        {
          offset: 3,
          path: [0, 0],
          text: 'X',
          type: 'insert_text',
        },
        {
          newProperties: trailing,
          properties: afterInsert,
          type: 'set_selection',
        },
      ]);
    });

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcXdef')],
      selection: trailing,
    });

    undo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcdef')],
      selection: middle,
    });

    redo(editor);

    assert.deepEqual(getVisibleState(editor), {
      children: [paragraph('abcXdef')],
      selection: trailing,
    });
  });

  it('undoes a committed composition as one history unit', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('This is editable')], {
      anchor: { path: [0, 0], offset: 'This is '.length },
      focus: { path: [0, 0], offset: 'This is '.length },
    });
    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('す');
    });
    editor.update(
      (tx) => {
        tx.text.insert('し');
      },
      { metadata: { history: { mode: 'merge' } }, tag: 'composition' }
    );

    assert.equal(getHistory(editor).undos.length, 1);
    assert.equal(Editor.string(editor, [0]), 'This is すしeditable');

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not save canceled composition text to history', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('This is editable')], {
      anchor: { path: [0, 0], offset: 'This is '.length },
      focus: { path: [0, 0], offset: 'This is '.length },
    });
    const before = getVisibleState(editor);

    editor.update(
      (tx) => {
        tx.text.insert('す');
        tx.text.delete({ reverse: true });
      },
      { metadata: { history: { mode: 'skip' } }, tag: 'composition-cancel' }
    );

    assert.equal(getHistory(editor).undos.length, 0);
    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not replay partial set_selection patches during undo after selection is cleared', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    const before = getVisibleState(editor);

    editor.update((tx) => {
      tx.operations.replay([
        {
          offset: 0,
          path: [0, 0],
          text: 'A',
          type: 'insert_text',
        },
        {
          newProperties: {
            focus: { path: [0, 0], offset: 0 },
          },
          properties: {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 1 },
          },
          type: 'set_selection',
        },
      ]);
    });
    write(editor, (tx) => {
      tx.selection.clear();
    });

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('does not merge follow-up typing into a structural text batch', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Alpha')], {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });

    write(editor, (tx) => {
      Editor.insertBreak(editor);
      tx.text.insert('Beta');
    });
    const afterStructuralBatch = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.insert('!');
    });

    assert.equal(getHistory(editor).undos.length, 2);

    undo(editor);

    assert.deepEqual(getVisibleState(editor), afterStructuralBatch);
  });

  it('reselects the restored text after deleteFragment and undo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('abcdef')], {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });

    write(editor, () => {
      Editor.deleteFragment(editor);
    });
    undo(editor);

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      paragraph('abcdef'),
    ]);
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
  });

  it('restores the saved expanded selection after deleteFragment, blur, refocus, and undo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Hello')], {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    write(editor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      });
    });
    write(editor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 0 },
      });
    });

    write(editor, () => {
      Editor.deleteFragment(editor);
    });
    write(editor, (tx) => {
      tx.selection.clear();
    });
    write(editor, (tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });

    undo(editor);

    assert.deepEqual(Editor.getSnapshot(editor).children, [paragraph('Hello')]);
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  it('restores the saved multi-block selection after insertBreak and undo', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one'), paragraph('two'), paragraph('three')], {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [2, 0], offset: 3 },
    });

    const before = getVisibleState(editor);

    write(editor, () => {
      Editor.insertBreak(editor);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('restores marks and selection after marked Enter undo', () => {
    const editor = historyTestEditor();

    const children: Descendant[] = [
      {
        type: 'paragraph',
        children: [{ text: 'hey ' }, { bold: true, text: 'you' }],
      },
    ];
    const selection: Selection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };

    replace(editor, children, selection);

    const before = getVisibleState(editor);

    write(editor, () => {
      Editor.insertBreak(editor);
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'paragraph',
        children: [{ text: 'hey ' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }, { bold: true, text: 'you' }],
      },
    ]);
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes a moveNodes commit back to the original tree and selection', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('one'), paragraph('two'), paragraph('three')], {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    const before = getVisibleState(editor);

    write(editor, () => {
      Editor.moveNodes(editor, { at: [0], to: [3] });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes reverse block joins cleanly', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('Hello'), paragraph('world!')], {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    const before = getVisibleState(editor);

    write(editor, () => {
      Editor.deleteBackward(editor);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes reverse nested block joins cleanly', () => {
    const editor = historyTestEditor();

    replace(
      editor,
      [
        paragraph('Hello'),
        {
          type: 'paragraph',
          children: [paragraph('world!')],
        } as unknown as Descendant,
      ],
      {
        anchor: { path: [1, 0, 0], offset: 0 },
        focus: { path: [1, 0, 0], offset: 0 },
      }
    );

    const before = getVisibleState(editor);

    write(editor, () => {
      Editor.deleteBackward(editor);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes reverse same-text deletes cleanly', () => {
    const editor = historyTestEditor();

    replace(editor, [paragraph('word')], {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.delete({ reverse: true });
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes same-text deletes without dropping custom props', () => {
    const editor = historyTestEditor();

    replace(
      editor,
      [paragraph('one', { a: true }), paragraph('two', { b: true })],
      {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [1, 0], offset: 2 },
      }
    );

    const before = getVisibleState(editor);

    write(editor, (tx) => {
      tx.text.delete();
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });

  it('undoes insertBreak commits cleanly', () => {
    const editor = historyTestEditor();

    replace(
      editor,
      [
        {
          type: 'paragraph',
          children: [paragraph('one'), paragraph('two')],
        } as unknown as Descendant,
      ],
      {
        anchor: { path: [0, 0, 0], offset: 2 },
        focus: { path: [0, 0, 0], offset: 2 },
      }
    );

    const before = getVisibleState(editor);

    write(editor, () => {
      Editor.insertBreak(editor);
    });
    undo(editor);

    assert.deepEqual(getVisibleState(editor), before);
  });
});
