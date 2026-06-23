import { createBasePlateEditor } from '../editor';
import { createEditorPlugin } from '../plugin';

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
    const editor = createBasePlateEditor({
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
    const baseEditor = createBasePlateEditor();

    baseEditor.insertData = fallbackInsertData as any;
    baseEditor.tf.insertData = fallbackInsertData as any;

    const PlainPlugin = createEditorPlugin({
      key: 'plain',
      parser: {
        format: 'plain',
        deserialize: () => [],
      },
    });
    const editor = createBasePlateEditor({
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
