/** @jsx jsx */

import { pipe } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Element } from 'slate';
import { withReact } from 'slate-react';
import { ELEMENT_MENTION } from '../../../../../slate-plugins/src/elements/mention/defaults';
import { withInlineVoid } from '../../../../../slate-plugins/src/plugins/withInlineVoid/withInlineVoid';
import { isAncestorEmpty } from '../../../queries/index';

const input = ((
  <hp>
    <cursor />
    <hmention value="mention">
      <htext />
    </hmention>
  </hp>
) as any) as Editor;

const output = false;

it('should be', () => {
  const editor = pipe(
    input,
    withReact,
    withInlineVoid({
      inlineTypes: [ELEMENT_MENTION],
      voidTypes: [ELEMENT_MENTION],
    })
  );

  expect(isAncestorEmpty(editor, editor as Element)).toEqual(output);
});
