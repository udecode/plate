/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsx } from '@udecode/plate-test-utils';
import {
  getAutoformatOptions,
  preFormat,
} from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';

jsx;

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

    const editor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({
          options: {
            rules: [
              {
                match: '# ',
                mode: 'block',
                preFormat: preFormat,
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

    const editor = createPlateEditor({
      plugins: [
        AutoformatPlugin.configure({ options: getAutoformatOptions() }),
      ],
      value: input,
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
