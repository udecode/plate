/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_H1 } from '../../../../../elements/heading/src/constants';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { withNormalizeTypes } from '../../withNormalizeTypes';

jsx;

const input = (
  <editor>
    <element />
  </editor>
) as any;

const output = (
  <editor>
    <element>
      <hh1>
        <htext />
      </hh1>
      <hp>
        <htext />
      </hp>
    </element>
  </editor>
) as any;

it('should be', () => {
  const editor = withNormalizeTypes({
    rules: [
      {
        path: [0, 0],
        strictType: ELEMENT_H1,
      },
      { path: [0, 1], type: ELEMENT_PARAGRAPH },
    ],
  })(input as PlateEditor);

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
