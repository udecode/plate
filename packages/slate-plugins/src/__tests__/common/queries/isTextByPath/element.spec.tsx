/** @jsx jsx */
import { jsx } from '__test-utils__/jsx';
import { isTextByPath } from 'common/queries/isTextByPath';
import { Editor } from 'slate';

const editor = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

const path = [0];

const output = false;

it('should be', () => {
  expect(isTextByPath(editor, path)).toEqual(output);
});
