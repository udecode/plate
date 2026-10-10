import { createEditor } from '../core';
import { renderStaticHtml } from './renderStaticHtml';

const createShownEditor = () =>
  createEditor({
    initialValue: [{ children: [{ text: 'Shown' }], type: 'paragraph' }],
  });

describe('static HTML props', () => {
  it('rejects an editor passed through props', async () => {
    await expect(
      renderStaticHtml(createShownEditor(), {
        // @ts-expect-error The rendered editor is the first argument.
        props: { editor: createEditor() },
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('"editor"'),
      name: 'TypeError',
    });
  });

  it('rejects a document passed through props', async () => {
    const editor = createShownEditor();

    await expect(
      renderStaticHtml(editor, {
        // @ts-expect-error Another document goes in the document option.
        props: { document: editor.read.value() },
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining('"document"'),
      name: 'TypeError',
    });
  });
});
