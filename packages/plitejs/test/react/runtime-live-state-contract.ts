import { createEditor, createEditorView, TextApi } from 'plitejs';

import {
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
} from '../../src/internal';
import {
  readRuntimeNode,
  readNodeByKey,
  readRuntimeText,
  readTextByKey,
} from '../../src/react/editable/runtime-live-state';
import {
  writeRuntimeMarks,
  writeRuntimeSelection,
} from '../../src/react/editable/runtime-mutation-state';
import {
  readLiveSelection,
  readRuntimeSelection,
} from '../../src/react/editable/runtime-selection-state';

describe('plite-react runtime live state facade', () => {
  test('resolves live nodes and text through root view editors', () => {
    const runtime = createEditor({
      initialValue: {
        children: [{ type: 'block', children: [{ text: 'body' }] }],
        roots: { header: [{ type: 'block', children: [{ text: 'header' }] }] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });

    const block = readRuntimeNode(headerEditor, [0]);
    const text = readRuntimeText(headerEditor, [0, 0]);

    expect(block && 'children' in block).toBe(true);
    expect(text?.text).toBe('header');
  });

  test('resolves live nodes, texts, and node keys through one owner', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: 'alpha' }] }],
      selection: null,
    });

    const snapshot = editorGetSnapshot(editor);
    const blockNodeKey = snapshot.index.keyAt([0]);
    const textNodeKey = snapshot.index.keyAt([0, 0]);

    if (!blockNodeKey || !textNodeKey) {
      throw new Error('Expected node keys for runtime facade contract');
    }

    const block = readRuntimeNode(editor, [0]);
    const text = readRuntimeText(editor, [0, 0]);
    const blockBinding = readNodeByKey(editor, blockNodeKey);
    const textBinding = readTextByKey(editor, textNodeKey);

    expect(block && 'children' in block).toBe(true);
    expect(text?.text).toBe('alpha');
    expect(blockBinding.path).toEqual([0]);
    expect(blockBinding.node).toBe(block);
    expect(textBinding.path).toEqual([0, 0]);
    expect(TextApi.isText(textBinding.text)).toBe(true);
    expect(textBinding.text?.text).toBe('alpha');
  });

  test('publishes runtime selection writes and joins an active transaction', () => {
    const editor = createEditor();
    const selection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    editorReplace(editor, {
      children: [{ type: 'block', children: [{ text: 'alpha' }] }],
      selection: null,
    });

    let commitCount = 0;
    let lastCommit = editor.read.lastCommit();
    const unsubscribe = editor.subscribeCommit((commit) => {
      commitCount += 1;
      lastCommit = commit;
    });

    try {
      writeRuntimeSelection(editor, selection);
      expect(readLiveSelection(editor)).toEqual(selection);
      expect(readRuntimeSelection(editor)).toEqual(selection);
      expect(commitCount).toBe(1);
      expect(lastCommit?.selectionChanged).toBe(true);
      expect(lastCommit?.changed.has('selection')).toBe(true);

      const joinedSelection = {
        ...selection,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      };

      editor.update(() => {
        writeRuntimeSelection(editor, joinedSelection);
        expect(commitCount).toBe(1);
      });

      expect(readRuntimeSelection(editor)).toEqual(joinedSelection);
      expect(commitCount).toBe(2);
      expect(lastCommit?.selectionChanged).toBe(true);
      expect(lastCommit?.changed.has('selection')).toBe(true);
    } finally {
      unsubscribe();
    }

    writeRuntimeMarks(editor, { bold: true });
    expect(editor.read((state) => state.marks())).toEqual({ bold: true });
  });
});
