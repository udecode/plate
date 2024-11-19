/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'www/src/registry/default/components/editor/plugins/autoformat-plugin';

jsxt;

describe('when the start match is not present and the end match is present', () => {
  it('should run default', () => {
    const input = (
      <fragment>
        <hp>
          hello*
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>hello* </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when there is a character before match', () => {
  it('should run default', () => {
    const input = (
      <fragment>
        <hp>
          a**hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>a**hello**</hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText('*');
    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when there is a character before match', () => {
  it('should run default', () => {
    const input = (
      <fragment>
        <hp>
          a**hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>a**hello**</hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText('*');
    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when selection is null', () => {
  it('should run insertText', () => {
    const input = (
      <fragment>
        <hp>**hello**</hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>**hello**</hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [autoformatPlugin],
      value: input,
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
