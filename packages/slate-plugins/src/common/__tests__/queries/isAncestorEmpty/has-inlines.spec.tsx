/** @jsx jsx */

import { Editor, Element } from 'slate';
import { withReact } from 'slate-react';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_MENTION } from '../../../../elements/mention/defaults';
import { withInlineVoid } from '../../../plugins/inline-void/withInlineVoid';
import { isAncestorEmpty } from '../../../queries/index';
import { pipe } from '../../../utils/pipe';

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
