import { createEditor as createBaseEditor } from '@platejs/slate';

import { createSlateEditor } from '../editor';
import { createSlatePlugin } from '../plugin';

const createParagraph = (text: string) => ({
  children: [{ text }],
  type: 'p',
});

describe('ParserPlugin', () => {
  it('pipes matching parser data into fragment insertion', () => {
    const PlainPlugin = createSlatePlugin({
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
    const editor = createSlateEditor({
      plugins: [PlainPlugin],
    });

    editor.tf.insertFragment = mock() as any;

    editor.tf.insertData({
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } as any);

    expect(editor.tf.insertFragment).toHaveBeenCalledWith([
      createParagraph('hello-world'),
      createParagraph('tail'),
    ]);
  });

  it('falls back to the previous insertData transform when no parser inserts', () => {
    const fallbackInsertData = mock();
    const baseEditor = createBaseEditor();

    baseEditor.insertData = fallbackInsertData as any;
    baseEditor.tf.insertData = fallbackInsertData as any;

    const PlainPlugin = createSlatePlugin({
      key: 'plain',
      parser: {
        format: 'plain',
        deserialize: () => [],
      },
    });
    const editor = createSlateEditor({
      editor: baseEditor,
      plugins: [PlainPlugin],
    });
    const dataTransfer = {
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
    } as any;

    editor.tf.insertData(dataTransfer);

    expect(fallbackInsertData).toHaveBeenCalledWith(dataTransfer);
  });
});
