/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { optionsAutoformat } from '../../../../../../stories/config/autoformatRules';
import { withAutoformat } from '../../../useAutoformatPlugin';

const input = (
  <editor>
    <hp>
      hello*
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>hello* </hp>
  </editor>
) as any;

describe('when the start markup is not present and the end markup is present', () => {
  it('should run default', () => {
    const editor = withAutoformat(optionsAutoformat)(withReact(input));

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
