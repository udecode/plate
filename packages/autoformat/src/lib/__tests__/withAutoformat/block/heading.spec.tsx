/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate-common';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsxt } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'www/src/registry/default/components/editor/plugins/autoformat-plugin';

import { BaseAutoformatPlugin } from '../../../BaseAutoformatPlugin';

jsxt;

describe('when #space', () => {
  it('should set block type to h1', () => {
    const input = (
      <fragment>
        <hp>
          #
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hh1>hello</hh1>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        BaseAutoformatPlugin.configure({
          options: {
            rules: [
              {
                match: '# ',
                mode: 'block',
                // preFormat: preFormat,
                type: HEADING_KEYS.h1,
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ##space', () => {
  it('should set block type to h2', () => {
    const input = (
      <fragment>
        <hp>
          ##
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hh2>hello</hh2>
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
