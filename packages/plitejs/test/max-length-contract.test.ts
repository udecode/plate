import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  DocumentChange,
  editorCommands,
  type Element,
  SelectionApi,
} from 'plitejs';
import { history } from 'plitejs/history';

import { dispatchCommand } from '../src/core/command-registry';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const createLimitedEditor = (maxLength?: number) =>
  createEditor({
    initialSelection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    initialValue: [paragraph('')],
    maxLength,
  });

const slice123456 = () =>
  ContentSlice.fromJSON({
    content: [paragraph('123456')],
    openEnd: 1,
    openStart: 1,
  });

const rootText = (nodes: readonly Element[]) =>
  nodes
    .map((node) =>
      node.children.map((child) => ('text' in child ? child.text : '')).join('')
    )
    .join('');

describe('maxLength editor option', () => {
  it('does not limit text when maxLength is absent', () => {
    const editor = createLimitedEditor();

    editor.update.text.insert('Hello world');

    assert.equal(editor.read.text.string([]), 'Hello world');
  });

  it('truncates inserted text at the configured limit', () => {
    const editor = createLimitedEditor(5);

    editor.update.text.insert('Hello world');

    assert.equal(editor.read.text.string([]), 'Hello');
  });

  it('keeps later insertions inside the configured limit', () => {
    const editor = createLimitedEditor(5);

    editor.update.text.insert('Hel');
    editor.update.text.insert('lo world');

    assert.equal(editor.read.text.string([]), 'Hello');
  });

  it('counts selected replacement text before truncating', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 5 },
      },
      initialValue: [paragraph('Hello')],
      maxLength: 5,
    });

    editor.update.text.insert('y there');

    assert.equal(editor.read.text.string([]), 'Hey t');
  });

  it('limits command-owned replacement of fully selected sibling blocks', () => {
    const initialValue = [paragraph('abc'), paragraph('def')];
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 3 },
      },
      initialValue,
      maxLength: 5,
      plugins: [history()],
    });

    editor.update.text.insert('123456789');

    assert.deepEqual(editor.read.children(), [paragraph('12345')]);

    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), initialValue);
  });

  it('limits full-block replacement in the active named root', () => {
    const initialHeader = [paragraph('abc'), paragraph('def')];
    const editor = createEditor({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: initialHeader },
      },
      maxLength: 5,
      plugins: [history()],
    });
    const header = createEditorView(editor, { root: 'header' });

    header.update.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    });
    header.update.text.insert('123456789');

    assert.deepEqual(editor.read.children(), [paragraph('body')]);
    assert.deepEqual(header.read.children(), [paragraph('12345')]);

    editor.api.history.undo();

    assert.deepEqual(header.read.children(), initialHeader);
  });

  it('limits a paste by the text of the root it lands in', () => {
    const pastes = {
      'explicit at': (
        editor: ReturnType<typeof createEditor>,
        offset: number
      ) =>
        editor.update.slice.replace(slice123456(), {
          at: { offset, path: [0, 0], root: 'header' },
        }),
      'main-document view, explicit at': (
        editor: ReturnType<typeof createEditor>,
        offset: number
      ) =>
        createEditorView(editor).update.slice.replace(slice123456(), {
          at: { offset, path: [0, 0], root: 'header' },
        }),
      'header view, explicit at': (
        editor: ReturnType<typeof createEditor>,
        offset: number
      ) =>
        createEditorView(editor, { root: 'header' }).update.slice.replace(
          slice123456(),
          { at: { offset, path: [0, 0] } }
        ),
      'header view dispatch, explicit at': (
        editor: ReturnType<typeof createEditor>,
        offset: number
      ) =>
        dispatchCommand(
          createEditorView(editor, { root: 'header' }),
          editorCommands.replaceSlice,
          { options: { at: { offset, path: [0, 0] } }, slice: slice123456() }
        ),
      'view of a view, explicit at': (
        editor: ReturnType<typeof createEditor>,
        offset: number
      ) =>
        createEditorView(createEditorView(editor)).update.slice.replace(
          slice123456(),
          { at: { offset, path: [0, 0], root: 'header' } }
        ),
      'header view': (
        editor: ReturnType<typeof createEditor>,
        offset: number
      ) => {
        const header = createEditorView(editor, { root: 'header' });

        header.update.selection.set(
          SelectionApi.text({
            anchor: { offset, path: [0, 0] },
            focus: { offset, path: [0, 0] },
          })
        );

        return header.update.slice.replace(slice123456());
      },
      'selection in the root': (
        editor: ReturnType<typeof createEditor>,
        offset: number
      ) => {
        editor.update.selection.set(
          SelectionApi.text({
            anchor: { offset, path: [0, 0], root: 'header' },
            focus: { offset, path: [0, 0], root: 'header' },
          })
        );

        return editor.update.slice.replace(slice123456());
      },
    };
    const layouts = [
      { header: 'abcdef', landed: 'abcdef1', main: 'b' },
      { header: 'ab', landed: 'ab12345', main: 'bbbbbb' },
    ];
    const results = layouts.flatMap(({ header, main }) =>
      Object.entries(pastes).map(([name, paste]) => {
        const editor = createEditor({
          initialValue: {
            children: [paragraph(main)],
            roots: { header: [paragraph(header)] },
          },
          maxLength: 7,
        });

        paste(editor, header.length);

        return [
          name,
          rootText(editor.read.root('header')),
          rootText(editor.read.children()),
        ];
      })
    );

    assert.deepEqual(
      results,
      layouts.flatMap(({ landed, main }) =>
        Object.keys(pastes).map((name) => [name, landed, main])
      )
    );
  });

  it('limits a paste through a main-document view', () => {
    const cases = [
      { initial: '', maxLength: 0, pasted: 'x' },
      { initial: 'ab', maxLength: 3, pasted: 'WXYZ' },
    ];
    const results = cases.map(({ initial, maxLength, pasted }) => {
      const editor = createEditor({
        initialValue: [paragraph(initial)],
        maxLength,
      });
      const view = createEditorView(editor);
      const point = { offset: initial.length, path: [0, 0] };

      view.update.selection.set(
        SelectionApi.text({ anchor: point, focus: point })
      );

      return [
        view.update.slice.replace(
          ContentSlice.fromJSON({
            content: [paragraph(pasted)],
            openEnd: 1,
            openStart: 1,
          })
        ),
        editor.read.text.string([]),
      ];
    });

    assert.deepEqual(results, [
      [false, ''],
      [true, 'abW'],
    ]);
  });

  it('limits a paste by the root its target names, not the view root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('m')],
        roots: { header: [paragraph('ab')], notes: [paragraph('n')] },
      },
      maxLength: 7,
    });

    createEditorView(editor, { root: 'header' }).update.slice.replace(
      slice123456(),
      { at: { offset: 1, path: [0, 0], root: 'notes' } }
    );

    assert.deepEqual(
      [
        rootText(editor.read.root('notes')),
        rootText(editor.read.root('header')),
      ],
      ['n123456', 'ab']
    );
  });

  it('limits a paste at a node key by the root that holds the node', () => {
    const cases = [
      { main: 'm', maxLength: 7, notes: 'nnnnnn', pasted: '123456' },
      { main: 'mmmmmm', maxLength: 7, notes: 'n', pasted: '123456' },
      { main: 'full', maxLength: 4, notes: '', pasted: 'X' },
    ];
    const results = cases.map(({ main, maxLength, notes, pasted }) => {
      const editor = createEditor({
        initialValue: {
          children: [paragraph(main)],
          roots: { notes: [paragraph(notes)] },
        },
        maxLength,
      });
      const ok = editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [paragraph(pasted)],
          openEnd: 1,
          openStart: 1,
        }),
        { at: editor.read.key(editor.read.root('notes')[0]) }
      );

      return [ok, rootText(editor.read.root('notes'))];
    });

    assert.deepEqual(results, [
      [true, '1nnnnnn'],
      [true, '123456n'],
      [true, 'X'],
    ]);
  });

  it('pastes into an empty named root while the main document is full', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('full')],
        roots: { notes: [paragraph('')] },
      },
      maxLength: 4,
    });

    assert.equal(
      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [paragraph('X')],
          openEnd: 1,
          openStart: 1,
        }),
        { at: { offset: 0, path: [0, 0], root: 'notes' } }
      ),
      true
    );
    assert.deepEqual(editor.read.root('notes'), [paragraph('X')]);
  });

  it('counts exact node-selection replacement before constructing its block', () => {
    const editor = createEditor({
      initialSelection: null,
      initialValue: [paragraph('aa'), paragraph('b'), paragraph('cc')],
      maxLength: 5,
    });

    editor.update.selection.set(SelectionApi.nodes([[0], [2]]));
    editor.update.text.insert('123456');

    assert.deepEqual(editor.read.children(), [
      paragraph('1234'),
      paragraph('b'),
    ]);
  });

  it('limits a paste at an explicit caret by the caret, not the selected node', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0]]),
      initialValue: [paragraph('aa'), paragraph('b'), paragraph('cc')],
      maxLength: 7,
    });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('123456')]), {
        at: { offset: 1, path: [1, 0] },
      }),
      true
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('aa'),
      paragraph('b12'),
      paragraph('cc'),
    ]);
  });

  it('limits an open paste over a selected block after freeing its text', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[1]]),
      initialValue: [paragraph('aa'), paragraph('b'), paragraph('cc')],
      maxLength: 7,
    });

    assert.equal(
      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [paragraph('12'), paragraph('3456')],
          openEnd: 1,
          openStart: 1,
        })
      ),
      true
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('aa'),
      paragraph('12'),
      paragraph('3'),
      paragraph('cc'),
    ]);
  });

  it('lands the empty blocks that survive a dropped head', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      },
      initialValue: [paragraph('full'), paragraph('')],
      maxLength: 4,
    });

    assert.equal(
      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [paragraph('abc'), paragraph(''), paragraph('')],
          openEnd: 1,
          openStart: 1,
        })
      ),
      true
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('full'),
      paragraph(''),
      paragraph(''),
    ]);
  });

  it('frees the length a same-update removal releases', () => {
    const editor = createEditor({
      initialValue: [paragraph('AAAAA'), paragraph('BBBBB')],
      maxLength: 10,
    });

    editor.update((tx) => {
      tx.nodes.remove({ at: SelectionApi.nodes([[0]]) });
      tx.text.insert('AAAAA', { at: { path: [0, 0], offset: 5 } });
    });

    assert.equal(editor.read.text.string([]), 'BBBBBAAAAA');
  });

  it('permits an empty replacement when maxLength is zero', () => {
    const editor = createEditor({
      initialSelection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      initialValue: [paragraph('abc')],
      maxLength: 0,
    });

    editor.update.text.insert('replacement');

    assert.deepEqual(editor.read.children(), [paragraph('')]);
  });

  it('truncates inserted fragments', () => {
    const editor = createLimitedEditor(5);

    editor.update((tx) => {
      tx.fragment.replace([paragraph('Hel'), paragraph('lo world')]);
    });

    assert.equal(editor.read.text.string([]), 'Hello');
  });

  it('truncates inserted nodes', () => {
    const editor = createLimitedEditor(5);

    editor.update.nodes.insert(paragraph('Hello world'), { at: [1] });

    assert.equal(editor.read.text.string([]), 'Hello');
  });

  it('does not limit imported canonical changes', () => {
    const editor = createLimitedEditor(5);
    const before = editor.read.value();
    const change = DocumentChange.between(before, {
      ...before,
      children: [paragraph('Hello world')],
    });

    editor.update((tx) => tx.changes.apply(change));

    assert.equal(editor.read.text.string([]), 'Hello world');
  });

  it('rejects invalid maxLength values', () => {
    assert.throws(
      () => createEditor({ maxLength: -1 }),
      /maxLength must be a non-negative safe integer/
    );
  });
});
