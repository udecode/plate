/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { optionsAutoformat } from '../../../../../../stories/config/autoformatRules';
import { withAutoformat } from '../../../createAutoformatPlugin';

jsx;

const input = (
  <editor>
    <hp>
      *hello*
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext italic>hello</htext>{' '}
    </hp>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat(optionsAutoformat)(withReact(input));

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
