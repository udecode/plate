/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'apps/www/src/autoformat/autoformatPlugin';
import { withReact } from 'slate-react';
import { withAutoformat } from '../../withAutoformat';

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

    const editor = withAutoformat(
      withReact(input),
      mockPlugin(autoformatPlugin as any)
    );

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

    const editor = withAutoformat(
      withReact(input),
      mockPlugin(autoformatPlugin as any)
    );

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

    const editor = withAutoformat(
      withReact(input),
      mockPlugin(autoformatPlugin as any)
    );

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

    const editor = withAutoformat(
      withReact(input),
      mockPlugin(autoformatPlugin as any)
    );

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
