/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { CONFIG } from '../../../../../docs/src/live/config/config';
import { withAutoformat } from '../../createAutoformatPlugin';

jsx;

describe('when the start match is not present and the end match is present', () => {
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

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when there is a character before match', () => {
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

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText('*');
    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when there is a character before match', () => {
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

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText('*');
    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when selection is null', () => {
  it('should run insertText', () => {
    const input = (
      <editor>
        <hp>**hello**</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>**hello**</hp>
      </editor>
    ) as any;

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
