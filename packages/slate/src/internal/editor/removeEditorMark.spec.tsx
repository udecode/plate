import { createEditor } from '../../create-editor';

describe('removeEditorMark', () => {
  it('removes a mark from the selected text', () => {
    const editor: any = createEditor({
      children: [
        { type: 'p', children: [{ bold: true, text: 'word' }] },
      ] as any,
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    });

    editor.removeMark('bold');

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'word' }] },
    ]);
  });
});
