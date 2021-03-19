/** @jsx jsx */

import { withInlineVoid } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { ELEMENT_MENTION } from '../../../../elements/mention/defaults';
import { useMentionPlugin } from '../../../../elements/mention/useMentionPlugin';
import { useParagraphPlugin } from '../../../../elements/paragraph/useParagraphPlugin';
import { pipe } from '../../../../pipe/pipe';
import { withDeserializeHTML } from '../../useDeserializeHTMLPlugin';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

// noinspection CheckTagEmptyBody
const data = {
  getData: () =>
    `<html><body><span data-slate-value="mention" class="slate-mention" /></body></html>`,
};

const output = (
  <editor>
    <hp>
      test
      <hmention value="mention">
        <htext />
      </hmention>
      <cursor />
    </hp>
  </editor>
) as any;

it('should do nothing', () => {
  const editor = pipe(
    input,
    withReact,
    withInlineVoid({
      inlineTypes: [ELEMENT_MENTION],
      voidTypes: [ELEMENT_MENTION],
    }),
    withDeserializeHTML({ plugins: [useParagraphPlugin(), useMentionPlugin()] })
  );

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
