import { createEditor } from 'slate';
import { withTable } from '..';
import { content, out, output2 } from './fixtures';

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
  it('should allow deletions within a cell without deleting the cell', () => {
    const editor = withTable()(createEditor());
    editor.children = content;
    editor.selection = {
      anchor: { path: [1, 0, 0, 0], offset: 1 },
      focus: { path: [1, 0, 0, 0], offset: 1 },
    };
    editor.deleteBackward('character');
    editor.deleteBackward('character');
    expect(editor.children).toEqual(output2);
  });
  it.todo('should prevent cell deletions on insertText');
});
