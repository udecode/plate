/** @jsx jsx */

import { createPlateEditor } from "@udecode/plate-common/react";
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../AutoformatPlugin';
import { withAutoformat } from '../../withAutoformat';

jsx;

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

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
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

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
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

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
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

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
