/** @jsx jsx */

import { ELEMENT_H1 } from '@udecode/plate-heading';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import {
  autoformatOptions,
  preFormat,
} from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';
import { withAutoformat } from '../../../withAutoformat';

jsx;

describe('when #space', () => {
  it('should set block type to h1', () => {
    const input = (
      <editor>
        <hp>
          #
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hh1>hello</hh1>
      </editor>
    ) as any;

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure({
        rules: [
          {
            match: '# ',
            mode: 'block',
            preFormat: preFormat,
            type: ELEMENT_H1,
          },
        ],
      }),
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ##space', () => {
  it('should set block type to h2', () => {
    const input = (
      <editor>
        <hp>
          ##
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hh2>hello</hh2>
      </editor>
    ) as any;

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure(autoformatOptions),
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
