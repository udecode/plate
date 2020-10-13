/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { BoldPlugin } from '../../../../marks/bold/index';
import {
  deserializeHTMLToMarks,
  DeserializeMarksProps,
} from '../../utils/index';

const input: DeserializeMarksProps = {
  plugins: [BoldPlugin()],
  element: document.createElement('strong'),
  children: <fragment>test</fragment>,
} as any;

const output = (
  <fragment>
    <htext bold>test</htext>
  </fragment>
);

it('should be', () => {
  expect(deserializeHTMLToMarks(input as any)).toEqual(output);
});
