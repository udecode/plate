/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { optionsAutoformat } from '../../../../../../docs/src/live/config/autoformatRules';
import { withAutoformat } from '../../../createAutoformatPlugin';

jsx;

const input = (
  <editor>
    <hp>
      hello``
      <cursor />
      world
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>helloworld</hp>
    <hcodeblock>
      <hcodeline>new</hcodeline>
    </hcodeblock>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat(optionsAutoformat)(withReact(input));

  editor.insertText('`');
  editor.insertText('new');

  expect(input.children).toEqual(output.children);
});
