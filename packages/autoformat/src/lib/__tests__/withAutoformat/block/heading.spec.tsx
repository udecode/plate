/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';
import { AutoformatKit } from 'www/src/registry/components/editor/plugins/autoformat-kit';

import { AutoformatPlugin } from '../../../AutoformatPlugin';

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
        AutoformatPlugin.configure({
          options: {
            rules: [
              {
                match: '# ',
                mode: 'block',
                // preFormat: preFormat,
                type: 'h1',
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.tf.insertText(' ');

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
      plugins: AutoformatKit,
      value: input,
    });

    editor.tf.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
