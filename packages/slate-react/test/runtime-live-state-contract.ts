import {
  createEditor,
  createEditorRuntime,
  createEditorView,
  TextApi,
} from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import {
  readRuntimeNode,
  readRuntimeNodeById,
  readRuntimeText,
  readRuntimeTextById,
} from '../src/editable/runtime-live-state';
import {
  writeRuntimeMarks,
  writeRuntimeSelection,
} from '../src/editable/runtime-mutation-state';
import {
  readLiveSelection,
  readRuntimeSelection,
} from '../src/editable/runtime-selection-state';

describe('slate-react runtime live state facade', () => {
  test('resolves live nodes and text through root view editors', () => {
    const runtime = createEditorRuntime({
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

  test('resolves live nodes, texts, and runtime ids through one owner', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [{ type: 'block', children: [{ text: 'alpha' }] }],
      selection: null,
    });

    const snapshot = Editor.getSnapshot(editor);
    const blockRuntimeId = snapshot.index.pathToId['0'];
    const textRuntimeId = snapshot.index.pathToId['0.0'];

    if (!blockRuntimeId || !textRuntimeId) {
      throw new Error('Expected runtime ids for runtime facade contract');
    }

    const block = readRuntimeNode(editor, [0]);
    const text = readRuntimeText(editor, [0, 0]);
    const blockBinding = readRuntimeNodeById(editor, blockRuntimeId);
    const textBinding = readRuntimeTextById(editor, textRuntimeId);

    expect(block && 'children' in block).toBe(true);
    expect(text?.text).toBe('alpha');
    expect(blockBinding.path).toEqual([0]);
    expect(blockBinding.node).toBe(block);
    expect(textBinding.path).toEqual([0, 0]);
    expect(TextApi.isText(textBinding.text)).toBe(true);
    expect(textBinding.text?.text).toBe('alpha');
  });

  test('owns selection and marks fallback writes for react runtime callers', () => {
    const editor = createEditor();
    const selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    Editor.replace(editor, {
      children: [{ type: 'block', children: [{ text: 'alpha' }] }],
      selection: null,
    });

    writeRuntimeSelection(editor, selection);
    expect(readLiveSelection(editor)).toEqual(selection);
    expect(readRuntimeSelection(editor)).toEqual(selection);

    writeRuntimeMarks(editor, { bold: true });
    expect(editor.read((state) => state.marks.get())).toEqual({ bold: true });
  });
});
