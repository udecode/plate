/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { ELEMENT_LINK } from '../../../../../elements/link/src/defaults';
import { withRemoveEmptyNodes } from '../../createRemoveEmptyNodesPlugin';

jsx;

const input = ((
  <editor>
    <hp>
      <ha url="http://google.com">
        <htext />
      </ha>
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp>
      <htext />
    </hp>
  </editor>
) as any;

it('should be', () => {
  const editor = withRemoveEmptyNodes({ type: ELEMENT_LINK })(input);

  editor.normalizeNode([(input.children[0] as any).children[0], [0, 0]]);

  expect(input.children).toEqual(output.children);
});
