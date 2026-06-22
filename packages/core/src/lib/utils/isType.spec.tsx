import { createSlateEditor } from '../editor';
import { isType } from './isType';

const editor = createSlateEditor({
  value: [{ children: [{ text: 'test' }], type: 'p' }],
});

it('returns true when type matches', () => {
  expect(isType(editor, editor.children[0], 'p')).toEqual(true);
});
