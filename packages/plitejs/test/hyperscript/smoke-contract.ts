import { createEditor as createBaseEditor, type Element } from 'plitejs';

import {
  createEditor,
  createEditorFixture,
  createHyperscript,
  createText,
  jsx as pliteJsx,
} from '../../src/hyperscript/index';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
} from '../../src/internal';

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
    const typedElement: Element = element;
    const customTag: Parameters<typeof h>[0] = 'paragraph';
    // @ts-expect-error Custom factories reject undeclared tags.
    const invalidTag: Parameters<typeof h>[0] = 'heading';

    void customTag;
    void invalidTag;
    void typedElement;

    expect(element).toEqual({
      type: 'paragraph',
      children: [{ text: 'hello' }],
    });
  });

  it('creates empty text through the exported text creator', () => {
    expect(createText('text', {}, [])).toEqual({ text: '' });
  });

  it('creates a plain fixture without editor normalization', () => {
    const h = createHyperscript({
      creators: { editor: createEditorFixture },
      elements: {
        date: { type: 'date' },
        paragraph: { type: 'paragraph' },
      },
    });
    const fixture = h(
      'editor',
      {},
      h('paragraph', {}, h('date'), h('cursor'), h('text', {}, 'test'))
    );

    expect(fixture).toEqual({
      children: [
        {
          children: [
            { children: [], type: 'date' },
            { text: '' },
            { text: 'test' },
          ],
          type: 'paragraph',
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 0, path: [0, 1] },
      },
    });
  });

  it('creates an empty editor through the exported editor creator', () => {
    const makeEditor = createEditor(createBaseEditor);
    const editor = makeEditor('editor', {}, []);

    expect(editorGetChildren(editor)).toEqual([]);
    expect(editorGetSelection(editor)).toBeNull();
  });
});
