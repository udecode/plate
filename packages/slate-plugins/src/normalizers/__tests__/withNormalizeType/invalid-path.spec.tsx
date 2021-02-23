/** @jsx jsx */

import { Editor } from 'slate';
import { options } from '../../../../../../stories/config/initialValues';
import { jsx } from '../../../__test-utils__/jsx';
import { withNormalizeTypes } from '../../index';

const input = (<editor />) as any;

const output = (<editor />) as any;

it('should be', () => {
  const editor = withNormalizeTypes({
    rules: [
      {
        path: [0, 0],
        strictType: options.h1.type,
      },
      { path: [0, 1], type: options.p.type },
    ],
  })(input as Editor);

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
