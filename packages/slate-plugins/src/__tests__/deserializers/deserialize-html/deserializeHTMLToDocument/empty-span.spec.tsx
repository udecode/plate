/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core/src';
import { jsx } from '../../../../__test-utils__/jsx';
import { deserializeHTMLToDocument } from '../../../../deserializers/deserialize-html';

const plugins: SlatePlugin[] = [];
const body = document.createElement('span');

const output = (
  <fragment>
    <block>
      <htext />
    </block>
  </fragment>
) as any;

it('should be', () => {
  expect(deserializeHTMLToDocument(plugins)(body)).toEqual(output);
});
