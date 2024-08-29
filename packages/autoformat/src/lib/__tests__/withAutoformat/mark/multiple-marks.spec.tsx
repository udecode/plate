/** @jsx jsx */

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createSlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';

jsx;

describe('when inserting ***', () => {
  it('should autoformat to italic bold', () => {
    const input = (
      <fragment>
        <hp>
          ***hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext bold italic>
            hello
          </htext>
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        AutoformatPlugin.configure({ options: getAutoformatOptions() }),
      ],
      value: input,
    });

    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when inserting ***___', () => {
  it('should autoformat to italic bold', () => {
    const input = (
      <fragment>
        <hp>
          ___***hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext bold italic underline>
            hello
          </htext>
        </hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        AutoformatPlugin.configure({
          options: {
            rules: [
              {
                match: { end: '***__', start: '___***' },
                mode: 'mark',
                trigger: '_',
                type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('_');
    editor.insertText('_');
    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
