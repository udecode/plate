import { createBaseEditor } from '../editor';
import { isType } from './isType';

const editor = createBaseEditor({
  initialValue: [{ children: [{ text: 'test' }], type: 'p' }],
});

it('returns true when type matches', () => {
  expect(isType(editor, editor.read.children()[0], 'p')).toEqual(true);
});
