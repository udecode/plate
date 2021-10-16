/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { ELEMENT_H1 } from '../../../../elements/heading/src/defaults';
import { ELEMENT_PARAGRAPH } from '../../../../elements/paragraph/src/defaults';
import { withNormalizeTypes } from '../../createNormalizeTypesPlugin';

jsx;

const input = (<editor />) as any;

const output = (<editor />) as any;

it('should be', () => {
  const editor = withNormalizeTypes({
    rules: [
      {
        path: [0, 0],
        strictType: ELEMENT_H1,
      },
      { path: [0, 1], type: ELEMENT_PARAGRAPH },
    ],
  })(input as Editor);

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
