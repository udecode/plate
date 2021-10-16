/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { ELEMENT_H2 } from '../../../../../elements/heading/src/defaults';
import { withNormalizeTypes } from '../../../createNormalizeTypesPlugin';

jsx;

const input = (
  <editor>
    <hh1>test</hh1>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>test</hh1>
    <hh2>
      <htext />
    </hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = withNormalizeTypes({
    rules: [{ path: [1], type: ELEMENT_H2 }],
  })(input as Editor);

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
