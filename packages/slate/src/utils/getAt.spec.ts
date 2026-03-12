import { createEditor } from '../create-editor';
import { getAt } from './getAt';

describe('getAt', () => {
  it('passes through path-like locations', () => {
    const editor = createEditor();

    expect(getAt(editor, [0, 1])).toEqual([0, 1]);
    expect(getAt(editor, null)).toBeUndefined();
  });

  it('converts a node object into its current path', () => {
    const editor = createEditor({
      children: [{ children: [{ text: 'one' }], type: 'p' }] as any,
    });

    expect(getAt(editor, editor.children[0] as any)).toEqual([0]);
  });
});
