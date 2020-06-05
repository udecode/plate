/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeserializeHTML } from 'deserializers/deserialize-html';
import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { pipe } from '../../../../common/utils';
import { withInlineVoid } from '../../../../element';
import { MENTION, MentionPlugin } from '../../../../elements/mention';
import { ParagraphPlugin } from '../../../../elements/paragraph';

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
    `<html><body><span data-slate-type=${MENTION} data-slate-value="mention" /></body></html>`,
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
    withInlineVoid({ inlineTypes: [MENTION], voidTypes: [MENTION] }),
    withDeserializeHTML({ plugins: [ParagraphPlugin(), MentionPlugin()] })
  );

  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
