/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { CONFIG } from '../../../../../../../docs/src/live/config/config';
import { withNormalizeTypes } from '../../../withNormalizeTypes';

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
    rules: [{ path: [1], strictType: CONFIG.options.h2.type }],
  })(input as PlateEditor);

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
