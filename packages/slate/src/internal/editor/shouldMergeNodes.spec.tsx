import { createEditor } from '../../create-editor';

describe('shouldMergeNodes', () => {
  it('removes an empty previous element instead of merging into it', () => {
    const editor: any = createEditor({
      children: [
        { type: 'p', children: [{ text: '' }] },
        { type: 'p', children: [{ text: 'two' }] },
      ] as any,
    });

    expect(
      editor.shouldMergeNodes(
        [{ type: 'p', children: [{ text: '' }] } as any, [0]],
        [{ type: 'p', children: [{ text: 'two' }] } as any, [1]]
      )
    ).toBe(false);

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'two' }] },
    ]);
  });

  it('removes an empty previous text node when it is not the first child', () => {
    const editor: any = createEditor({
      children: [
        {
          type: 'p',
          children: [{ text: 'one' }, { text: '' }, { text: 'two' }],
        },
      ] as any,
    });

    expect(
      editor.shouldMergeNodes(
        [{ text: '' } as any, [0, 1]],
        [{ text: 'two' } as any, [0, 2]]
      )
    ).toBe(false);

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'onetwo' }] },
    ]);
  });

  it('keeps an empty first child so formatting is preserved', () => {
    const editor: any = createEditor({
      children: [
        {
          type: 'p',
          children: [{ text: '' }, { bold: true, text: 'two' }],
        },
      ] as any,
    });

    expect(
      editor.shouldMergeNodes(
        [{ text: '' } as any, [0, 0]],
        [{ bold: true, text: 'two' } as any, [0, 1]]
      )
    ).toBe(true);

    expect(editor.children).toEqual([
      {
        type: 'p',
        children: [{ text: '' }, { bold: true, text: 'two' }],
      },
    ]);
  });
});
