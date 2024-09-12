/** @jsx jsx */

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { createSlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { BaseAutoformatPlugin } from '../../BaseAutoformatPlugin';

jsx;

describe('when match is an array', () => {
  it('should autoformat', () => {
    const input = (
      <fragment>
        <hp>
          _***hello***
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
        BaseAutoformatPlugin.configure({
          options: {
            rules: [
              {
                ignoreTrim: true,
                match: ['_***', '***_'],
                mode: 'mark',
                type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});

describe('when match is a string', () => {
  it('should autoformat', () => {
    const input = (
      <fragment>
        <hp>
          _***hello***
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
        BaseAutoformatPlugin.configure({
          options: {
            rules: [
              {
                ignoreTrim: true,
                match: '_***',
                mode: 'mark',
                type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
              },
            ],
          },
        }),
      ],
      value: input,
    });

    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
