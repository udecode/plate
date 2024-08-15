/** @jsx jsx */

import { createPlateEditor } from "@udecode/plate-common/react";
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import {
  getAutoformatOptions,
  preFormat,
} from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';
import { withAutoformat } from '../../../withAutoformat';

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

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({
        options: {
          rules: [
            {
              match: '# ',
              mode: 'block',
              preFormat: preFormat,
              type: ELEMENT_H1,
            },
          ],
        },
      }),]
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

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
