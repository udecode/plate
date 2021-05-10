/** @jsx jsx */
import { TEditor } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Transforms } from 'slate';
import { withNodeId } from '../createNodeIdPlugin';

jsx;

const input = (
  <editor>
    <hp id={10}>
      tes
      <cursor />t
    </hp>
  </editor>
) as any;

it('should add a random id to the new element', () => {
  const editor: TEditor = withNodeId()(input);

  Transforms.splitNodes(editor);

  expect(input.children[1].id).toBeDefined();
});
