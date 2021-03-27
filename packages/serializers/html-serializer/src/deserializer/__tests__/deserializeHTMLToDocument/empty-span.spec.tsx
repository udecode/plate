/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { SlatePlugin } from '../../../../../../core/src/types/SlatePlugin/SlatePlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { deserializeHTMLToDocument } from '../../utils/deserializeHTMLToDocument';

jsx;

const plugins: SlatePlugin[] = [];
const body = document.createElement('span');

const output = (
  <fragment>
    <element>
      <htext />
    </element>
  </fragment>
) as any;

it('should be', () => {
  expect(
    deserializeHTMLToDocument(
      createEditorPlugins({
        plugins,
      }),
      {
        plugins,
        element: body,
      }
    )
  ).toEqual(output);
});
