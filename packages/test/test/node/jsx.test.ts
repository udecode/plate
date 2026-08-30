import { createEditorFromFixture, jsxt } from '../../src';

describe('@platejs/test', () => {
  it('builds a headless Plate editor fixture', () => {
    const fixture = jsxt(
      'editor',
      {},
      jsxt('hp', {}, 'Hello', jsxt('cursor', {}))
    );
    const editor = createEditorFromFixture(fixture);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Hello' }], type: 'paragraph' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
  });
});
