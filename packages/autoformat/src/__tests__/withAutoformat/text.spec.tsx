/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { CONFIG } from '../../../../../docs/src/live/config/config';
import { withAutoformat } from '../../createAutoformatPlugin';

jsx;

describe('when --space', () => {
  it('should insert —', () => {
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
        <hp>
          —
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText('-');

    expect(input.children).toEqual(output.children);
  });
});

describe('when (tm)', () => {
  it('should insert &trade;', () => {
    const input = (
      <editor>
        <hp>
          (tm
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          ™
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText(')');

    expect(input.children).toEqual(output.children);
  });
});

describe('when &sect', () => {
  it('should insert §', () => {
    const input = (
      <editor>
        <hp>
          &sect
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          §
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText(';');

    expect(input.children).toEqual(output.children);
  });
});

describe('when //', () => {
  it('should insert ÷', () => {
    const input = (
      <editor>
        <hp>
          /
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          ÷
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText('/');

    expect(input.children).toEqual(output.children);
  });
});

describe('when typing %%%', () => {
  it('should autoformat', () => {
    const input = (
      <editor>
        <hp>
          %
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output1 = (
      <editor>
        <hp>
          ‰
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output2 = (
      <editor>
        <hp>
          ‱
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

    editor.insertText('%');

    expect(input.children).toEqual(output1.children);

    editor.insertText('%');

    expect(input.children).toEqual(output2.children);
  });
});

describe('when using quotes', () => {
  it('should autoformat to smart quotes', () => {
    const input = (
      <editor>
        <hp>
          "hello
          <cursor /> .
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>“hello” .</hp>
      </editor>
    ) as any;

    const editor = withAutoformat({
      rules: [
        {
          mode: 'text',
          match: '"',
          format: ['“', '”'],
        },
      ],
    })(withReact(input));

    editor.insertText('"');

    expect(input.children).toEqual(output.children);
  });
});
