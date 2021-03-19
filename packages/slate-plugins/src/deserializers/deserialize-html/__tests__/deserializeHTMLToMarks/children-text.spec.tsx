/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { useBoldPlugin } from '../../../../marks/bold/useBoldPlugin';
import {
  deserializeHTMLToMarks,
  DeserializeMarksProps,
} from '../../utils/deserializeHTMLToMarks';

const input: DeserializeMarksProps = {
  plugins: [useBoldPlugin()],
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
