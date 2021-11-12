/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_H1 } from '../../../../../../elements/heading/src/constants';
import { withNormalizeTypes } from '../../../withNormalizeTypes';

jsx;

const input = (
  <editor>
    <hh2>test</hh2>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>test</hh1>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = withNormalizeTypes({
    rules: [{ path: [0], strictType: ELEMENT_H1 }],
  })(input as PlateEditor);

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
