import { createEditor as createSlateEditor } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';

import {
  createEditor,
  createHyperscript,
  createText,
  jsx as slateJsx,
} from '../src/index';

describe('slate-hyperscript smoke contract', () => {
  it('creates an empty editor tree through the default jsx factory', () => {
    const editor = slateJsx('editor');

    expect(Editor.getChildren(editor)).toEqual([]);
    expect(Editor.getSelection(editor)).toBeNull();
  });

  it('creates a custom element shorthand through createHyperscript', () => {
    const h = createHyperscript({
      elements: {
        paragraph: { type: 'paragraph' },
      },
    });

    const element = h('paragraph', {}, 'hello');

    expect(element).toEqual({
      type: 'paragraph',
      children: [{ text: 'hello' }],
    });
  });

  it('creates empty text through the exported text creator', () => {
    expect(createText('text', {}, [])).toEqual({ text: '' });
  });

  it('creates an empty editor through the exported editor creator', () => {
    const makeEditor = createEditor(createSlateEditor);
    const editor = makeEditor('editor', {}, []);

    expect(Editor.getChildren(editor)).toEqual([]);
    expect(Editor.getSelection(editor)).toBeNull();
  });
});
