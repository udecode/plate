import { createEditor } from '../../create-editor';

describe('collapseSelection', () => {
  it.each([
    ['anchor', 1, 3, 1],
    ['focus', 1, 3, 3],
    ['start', 3, 1, 1],
    ['end', 3, 1, 3],
  ] as const)('collapses to the %s edge', (edge, anchorOffset, focusOffset, expectedOffset) => {
    const editor: any = createEditor({
      children: [{ type: 'p', children: [{ text: 'word' }] }] as any,
      selection: {
        anchor: { offset: anchorOffset, path: [0, 0] },
        focus: { offset: focusOffset, path: [0, 0] },
      },
    });

    editor.collapse({ edge });

    expect(editor.selection).toEqual({
      anchor: { offset: expectedOffset, path: [0, 0] },
      focus: { offset: expectedOffset, path: [0, 0] },
    });
  });
});
