/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createBoldPlugin } from '../../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import {
  deserializeHTMLToMarks,
  DeserializeMarksProps,
} from '../../utils/deserializeHTMLToMarks';

jsx;

const input: DeserializeMarksProps = {
  element: document.createElement('strong'),
  children: <fragment>test</fragment>,
} as any;

const output = (
  <fragment>
    <htext bold>test</htext>
  </fragment>
);

it('should be', () => {
  expect(
    deserializeHTMLToMarks(
      createPlateUIEditor({
        plugins: [createBoldPlugin()],
      }),
      input as any
    )
  ).toEqual(output);
});
