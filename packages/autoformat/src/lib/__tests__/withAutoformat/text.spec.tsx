/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'www/src/registry/default/components/editor/plugins/autoformat-plugin';

jsxt;

describe('when --space', () => {
  it('should insert —', () => {
    const input = (
      <fragment>
        <hp>
          -
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          —
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText('-');

    expect(input.children).toEqual(output.children);
  });

  it('should not insert — with multiple in between chars', () => {
    const input = (
      <fragment>
        <hp>
          -OO
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          -OO-
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText('-');

    expect(input.children).toEqual(output.children);
  });

  it('should not insert — with 1 in between char', () => {
    const input = (
      <fragment>
        <hp>
          -O
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          -O-
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText('-');

    expect(input.children).toEqual(output.children);
  });
});

describe('when (tm)', () => {
  it('should insert &trade;', () => {
    const input = (
      <fragment>
        <hp>
          (tm
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          ™
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText(')');

    expect(input.children).toEqual(output.children);
  });
});

describe('when &sect', () => {
  it('should insert §', () => {
    const input = (
      <fragment>
        <hp>
          &sect
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          §
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText(';');

    expect(input.children).toEqual(output.children);
  });
});

describe('when //', () => {
  it('should insert ÷', () => {
    const input = (
      <fragment>
        <hp>
          /
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          ÷
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText('/');

    expect(input.children).toEqual(output.children);
  });
});

describe('when typing %%%', () => {
  it('should autoformat', () => {
    const input = (
      <fragment>
        <hp>
          %
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output1 = (
      <fragment>
        <hp>
          ‰
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output2 = (
      <fragment>
        <hp>
          ‱
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText('%');

    expect(input.children).toEqual(output1.children);

    editor.insertText('%');

    expect(input.children).toEqual(output2.children);
  });
});

describe('when using quotes', () => {
  it('should autoformat to smart quotes', () => {
    const input = (
      <fragment>
        <hp>
          "hello
          <cursor /> .
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>“hello” .</hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        autoformatPlugin.configure({
          options: {
            rules: [
              {
                format: ['“', '”'],
                match: '"',
                mode: 'text',
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.insertText('"');

    expect(input.children).toEqual(output.children);
  });
});
