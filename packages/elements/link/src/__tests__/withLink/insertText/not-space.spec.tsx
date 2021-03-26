/** @jsx jsx */

jsx;
import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { withLink } from '../../../withLink';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const text = 'test';

const output = (
  <editor>
    <hp>testtest</hp>
  </editor>
) as any;

describe('when inserting a character that is not a space', () => {
  it('should run default insertText', () => {
    const editor = withLink()(withReact(input));

    editor.insertText(text);

    expect(input.children).toEqual(output.children);
  });
});
