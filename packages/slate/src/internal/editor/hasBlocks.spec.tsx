import { createEditor } from '../../create-editor';

describe('hasBlocks', () => {
  it('returns true for elements with block children and false for inline-only content', () => {
    const editor: any = createEditor();

    expect(
      editor.hasBlocks({
        type: 'blockquote',
        children: [{ type: 'p', children: [{ text: 'one' }] }],
      } as any)
    ).toBe(true);
    expect(
      editor.hasBlocks({
        type: 'p',
        children: [{ text: 'one' }],
      } as any)
    ).toBe(false);
  });
});
