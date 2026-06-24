import { createEditor as createBaseEditor } from '@platejs/plite';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
} from '@platejs/plite/internal';

import {
  createEditor,
  createHyperscript,
  createText,
  jsx as pliteJsx,
} from '../src/index';

describe('plite-hyperscript smoke contract', () => {
  it('creates an empty editor tree through the default jsx factory', () => {
    const editor = pliteJsx('editor');

    expect(editorGetChildren(editor)).toEqual([]);
    expect(editorGetSelection(editor)).toBeNull();
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
    const makeEditor = createEditor(createBaseEditor);
    const editor = makeEditor('editor', {}, []);

    expect(editorGetChildren(editor)).toEqual([]);
    expect(editorGetSelection(editor)).toBeNull();
  });
});
