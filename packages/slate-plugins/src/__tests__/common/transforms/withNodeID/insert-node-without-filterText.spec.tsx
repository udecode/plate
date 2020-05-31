/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { idCreatorFixture } from '__tests__/common/transforms/withNodeID/fixtures';
import { withNodeID } from 'common/transforms/node-id';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';

const input = ((
  <editor>
    <hp id={10}>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp id={10}>test</hp>
    <hli id={1}>
      <hp id={2}>
        <htext id={3}>inserted</htext>
      </hp>
    </hli>
  </editor>
) as any;

it('should add an id to the new nodes', () => {
  const editor = withNodeID({
    idCreator: idCreatorFixture,
    filterText: false,
  })(withHistory(input));

  editor.insertNode(
    (
      <hli>
        <hp>inserted</hp>
      </hli>
    ) as any
  );

  expect(input.children).toEqual(output.children);
});
