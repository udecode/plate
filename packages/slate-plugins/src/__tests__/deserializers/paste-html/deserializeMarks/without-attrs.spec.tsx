/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import {
  deserializeMarks,
  DeserializeMarksProps,
} from 'deserializers/paste-html/utils';

const input: DeserializeMarksProps = {
  plugins: [{ deserialize: { leaf: { STRONG: () => false } } }, {}],
  el: document.createElement('strong'),
  children: <fragment>test</fragment>,
} as any;

const output = (
  <fragment>
    <txt>test</txt>
  </fragment>
);

it('should be', () => {
  expect(deserializeMarks(input as any)).toEqual(output);
});
