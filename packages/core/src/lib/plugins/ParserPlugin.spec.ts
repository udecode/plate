import { getCurrentRuntimeTransforms } from '../../internal/currentRuntimeBridge';
import { createPlateRuntimeEditor } from '../../react/editor/createPlateRuntimeEditor';
import { createEditorPlugin } from '../plugin';
import { ParserPlugin } from './ParserPlugin';

const createParagraph = (text: string) => ({
  children: [{ text }],
  type: 'p',
});

describe('ParserPlugin', () => {
  it('pipes matching parser data into fragment insertion', () => {
    const PlainPlugin = createEditorPlugin({
      key: 'plain',
      parser: {
        format: 'plain',
        query: ({ data }) => data === 'hello',
        transformData: ({ data }) => `${data}-world`,
        deserialize: ({ data }) => [createParagraph(data)],
        transformFragment: ({ fragment }) => [
          ...fragment,
          createParagraph('tail'),
        ],
      },
    });
    const editor = createPlateRuntimeEditor({
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
      plugins: [ParserPlugin, PlainPlugin],
    });

    let inserted: unknown;

    editor.update(() => {
      inserted = getCurrentRuntimeTransforms(editor).insertData({
        files: [],
        getData: mock((mimeType: string) =>
          mimeType === 'text/plain' ? 'hello' : ''
        ),
      } as any);
    });

    expect(inserted).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      createParagraph('hello-world'),
      createParagraph('tail'),
    ]);
  });

  it('falls back to the previous insertData transform when no parser inserts', () => {
    const PlainPlugin = createEditorPlugin({
      key: 'plain',
      parser: {
        format: 'plain',
        deserialize: () => [],
      },
    });
    const initialValue = [createParagraph('initial')];
    const editor = createPlateRuntimeEditor({
      initialValue,
      plugins: [ParserPlugin, PlainPlugin],
    });
    const dataTransfer = {
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } as any;

    let inserted: unknown;

    editor.update(() => {
      inserted = getCurrentRuntimeTransforms(editor).insertData(dataTransfer);
    });

    expect(inserted).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      createParagraph('initialhello'),
    ]);
  });
});
