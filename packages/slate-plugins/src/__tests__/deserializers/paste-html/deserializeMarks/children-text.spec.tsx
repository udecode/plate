/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import {
  deserializeMarks,
  DeserializeMarksProps,
} from 'deserializers/deserialize-html/utils';
import { BoldPlugin } from 'marks/bold';

const input: DeserializeMarksProps = {
  plugins: [BoldPlugin()],
  el: document.createElement('strong'),
  children: <fragment>test</fragment>,
} as any;

const output = (
  <fragment>
    <htext bold>test</htext>
  </fragment>
);

it('should be', () => {
  expect(deserializeMarks(input as any)).toEqual(output);
});
