/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { SlatePlugin } from '../../../../../core/src/types/SlatePlugin/SlatePlugin';
import { createEditorPlugins } from '../../../../../slate-plugins/src/__fixtures__/editor.fixtures';
import { deserializeHTMLToDocument } from '../../utils/deserializeHTMLToDocument';

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
