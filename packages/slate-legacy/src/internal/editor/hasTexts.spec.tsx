import { createEditor } from '../../create-editor';

describe('hasTexts', () => {
  it('returns true for elements with text children and false for block-only content', () => {
    const editor: any = createEditor();

    expect(
      editor.hasTexts({
        type: 'p',
        children: [{ text: 'one' }],
      } as any)
    ).toBe(true);
    expect(
      editor.hasTexts({
        type: 'blockquote',
        children: [{ type: 'p', children: [{ text: 'one' }] }],
      } as any)
    ).toBe(false);
  });
});
