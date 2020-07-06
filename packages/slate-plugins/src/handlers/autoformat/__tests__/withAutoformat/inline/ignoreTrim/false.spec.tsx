/** @jsx jsx */

import { withReact } from 'slate-react';
import { autoformatRulesFixtures } from '../../../../../../__fixtures__/autoformat.fixtures';
import { jsx } from '../../../../../../__test-utils__/jsx';
import { withAutoformat } from '../../../../withAutoformat';

const input = (
  <editor>
    <hp>
      **hello **
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>**hello ** </hp>
  </editor>
) as any;

describe('when the markup text is not trimmed', () => {
  it('should run default', () => {
    const editor = withAutoformat({ rules: autoformatRulesFixtures })(
      withReact(input)
    );

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
