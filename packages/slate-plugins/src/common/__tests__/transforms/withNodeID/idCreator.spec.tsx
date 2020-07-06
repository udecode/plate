/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { withNodeID } from '../../../plugins/node-id/index';

const input = (
  <editor>
    <hp id={10}>
      tes
      <cursor />t
    </hp>
  </editor>
) as any;

it('should add a random id to the new element', () => {
  const editor: Editor = withNodeID()(input);

  Transforms.splitNodes(editor);

  expect(input.children[1].id).toBeDefined();
});
