/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { autoformatRulesFixtures } from '../../../../../__fixtures__/autoformat.fixtures';
import { withAutoformat } from '../../../useAutoformatPlugin';

const input = (
  <editor>
    <hul>
      <hli>
        <hp>
          #
          <cursor />
          hello
        </hp>
      </hli>
    </hul>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>hello</hh1>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat({ rules: autoformatRulesFixtures })(
    withReact(input)
  );

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
