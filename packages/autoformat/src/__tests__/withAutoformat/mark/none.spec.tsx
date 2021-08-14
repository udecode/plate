/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { optionsAutoformat } from '../../../../../../docs/src/live/config/pluginOptions';
import { withAutoformat } from '../../../createAutoformatPlugin';

jsx;

describe('when the start markup is not present and the end markup is present', () => {
  it('should run default', () => {
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

    const editor = withAutoformat(optionsAutoformat)(withReact(input));

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when there is a character before markup', () => {
  it('should run default', () => {
    const input = (
      <editor>
        <hp>
          a**hello
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>a**hello**</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>hello* </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(optionsAutoformat)(withReact(input));

    editor.insertText('*');
    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});
