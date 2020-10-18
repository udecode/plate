/** @jsx jsx */

import { Transforms } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { withInlineVoid } from '../../../../common/plugins/inline-void/withInlineVoid';
import { ELEMENT_LINK } from '../../defaults';
import { upsertLinkAtSelection } from '../../transforms/upsertLinkAtSelection';
import { withLink } from '../../withLink';

const urlInput = 'http://input.com';

const input = (
  <editor>
    <hp>
      insert link
      <element type={ELEMENT_LINK} url={urlInput}>
        here
      </element>
      .
    </hp>
  </editor>
) as any;

const urlOutput = 'http://output.com';

const output = (
  <editor>
    <hp>
      insert link
      <element type={ELEMENT_LINK} url={urlOutput}>
        here
      </element>
      .
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
  );

  const selection = {
    anchor: { path: [0, 1, 0], offset: 1 },
    focus: { path: [0, 1, 0], offset: 1 },
  };
  Transforms.select(editor, selection);

  upsertLinkAtSelection(editor, urlOutput, { wrap: true });
  expect(input.children).toEqual(output.children);
});
