/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { autoformatPlugin } from 'www/src/lib/plate/demo/plugins/autoformatPlugin';

import { withAutoformat } from '../../../withAutoformat';

jsx;

describe('when -space', () => {
  it('should format to ul', () => {
    const input = (
      <editor>
        <hp>
          -
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>hello</hlic>
          </hli>
        </hul>
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

describe('when 1.space', () => {
  it('should format to ol', () => {
    const input = (
      <editor>
        <hp>
          1.
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hol>
          <hli>
            <hlic>hello</hlic>
          </hli>
        </hol>
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

describe('when [].space', () => {
  it('should format to todo list', () => {
    const input = (
      <editor>
        <hp>
          []
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <htodoli>hello</htodoli>
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

describe('when [x].space', () => {
  it('should format to todo list', () => {
    const input = (
      <editor>
        <hp>
          [x]
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <htodoli checked>hello</htodoli>
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

// TODO Add toggle test
