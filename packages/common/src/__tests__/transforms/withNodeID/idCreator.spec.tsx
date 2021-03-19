/** @jsx jsx */
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Transforms } from 'slate';
import { withNodeId } from '../../../../../slate-plugins/src/plugins/useNodeIdPlugin';

const input = (
  <editor>
    <hp id={10}>
      tes
      <cursor />t
    </hp>
  </editor>
) as any;

it('should add a random id to the new element', () => {
  const editor: Editor = withNodeId()(input);

  Transforms.splitNodes(editor);

  expect(input.children[1].id).toBeDefined();
});
