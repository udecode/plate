/** @jsx jsx */

import { createPlateEditor } from "@udecode/plate-common/react";
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';
import { withAutoformat } from '../../../withAutoformat';

jsx;

const input = (
  <fragment>
    <hp>
      ~~hello~
      <cursor />
    </hp>
  </fragment>
) as any;

const output = (
  <fragment>
    <hp>
      <htext strikethrough>hello</htext>
    </hp>
  </fragment>
) as any;

it('should autoformat', () => {
  const editor = createPlateEditor({ value: input,
    plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
  });

  editor.insertText('~');

  expect(input.children).toEqual(output.children);
});
