import { createEditor } from 'slate';
import { withTable } from '..';

const content = [
  { type: 'p', children: [{ text: 'A' }] },
  {
    type: 'table',
    children: [
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'A1' }] },
          { type: 'td', children: [{ text: 'B1' }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'A2' }] },
          { type: 'td', children: [{ text: 'B2' }] },
        ],
      },
    ],
  },
  { type: 'p', children: [{ text: 'B' }] },
] as any;

const out = [...content];
out[1].children[0].children[0].children[0].text = '';
out[1].children[0].children[1].children[0].text = '';

describe('withTable', () => {
  it('should prevent cell deletions on deleteBackward from outside the table', () => {
    const editor = withTable()(createEditor());
    editor.children = content;
    editor.selection = {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    };
    editor.deleteBackward('character');
    expect(editor.children).toEqual(content);
  });
  it('should prevent cell deletions on deleteForward from outside the table', () => {
    const editor = withTable()(createEditor());
    editor.children = content;
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    editor.deleteForward('character');
    expect(editor.children).toEqual(content);
  });
  it('should prevent cell deletions when selecting multiple cells', () => {
    const editor = withTable()(createEditor());
    editor.children = content;
    editor.selection = {
      anchor: { path: [1, 0, 0, 0], offset: 0 },
      focus: { path: [1, 0, 1, 0], offset: 0 },
    };
    editor.deleteFragment();
    expect(editor.children).toEqual(out);
  });
  it.todo('should prevent cell deletions on insertText');
  it.todo('should prevent cell deletions on delete within a cell');
});
