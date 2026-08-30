import { createEditor, PLUGINS } from '../../core';
import { BaseCodeDrawingPlugin } from './BaseCodeDrawingPlugin';

describe('BaseCodeDrawingPlugin', () => {
  it('owns flat code, language, and view properties', () => {
    const editor = createEditor({ plugins: [BaseCodeDrawingPlugin] });
    const plugin = editor.plugin(BaseCodeDrawingPlugin);
    const element = { children: [{ text: '' }], type: 'codeDrawing' };

    expect(plugin.name).toBe(PLUGINS.codeDrawing);
    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property({ key: 'code', placement: 'element' })?.value
        .kind
    ).toBe('string');
    expect(
      editor.read.schema.property({ key: 'language', placement: 'element' })
        ?.value.kind
    ).toBe('enum');
    expect(
      editor.read.schema.property({ key: 'view', placement: 'element' })?.value
        .kind
    ).toBe('enum');
  });

  it('rejects unsupported languages and views', () => {
    const editor = createEditor({ plugins: [BaseCodeDrawingPlugin] });
    const document = (properties: Record<string, unknown>) => ({
      children: [
        {
          children: [{ text: '' }],
          ...properties,
          type: 'codeDrawing',
        },
      ],
    });

    expect(() =>
      editor.read.schema.assertDocument(document({ language: 'unsupported' }))
    ).toThrow(/property "language"/);
    expect(() =>
      editor.read.schema.assertDocument(document({ view: 'unsupported' }))
    ).toThrow(/property "view"/);
  });

  it('inserts the complete default node shape', () => {
    const editor = createEditor({
      plugins: [BaseCodeDrawingPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'before' }], type: 'paragraph' }],
    });

    editor.plugin(BaseCodeDrawingPlugin).update.insert();

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'before' }], type: 'paragraph' },
      {
        children: [{ text: '' }],
        code: '',
        language: 'mermaid',
        type: 'codeDrawing',
        view: 'split',
      },
    ]);
  });

  it('inserts explicit flat drawing properties', () => {
    const editor = createEditor({
      plugins: [BaseCodeDrawingPlugin],
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.plugin(BaseCodeDrawingPlugin).update.insert(
      {
        code: 'graph TD; A-->B',
        language: 'graphviz',
        view: 'preview',
      },
      { at: [1] }
    );

    expect(editor.read.children().at(-1)).toMatchObject({
      children: [{ text: '' }],
      code: 'graph TD; A-->B',
      language: 'graphviz',
      type: 'codeDrawing',
      view: 'preview',
    });
  });
});
