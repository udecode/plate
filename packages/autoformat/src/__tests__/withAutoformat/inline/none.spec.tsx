/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { optionsAutoformat } from '../../../../../../docs/src/live/config/pluginOptions';
import { withAutoformat } from '../../../createAutoformatPlugin';

jsx;

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
