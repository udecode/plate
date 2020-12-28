/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Transforms } from 'slate';
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
