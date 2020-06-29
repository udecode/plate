/** @jsx jsx */
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { jsx } from '../../../../__test-utils__/jsx';
import { withNodeID, withTransforms } from '../../../../common/transforms';
import { idCreatorFixture } from './fixtures';

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
    <hp id={1}>inserted</hp>
    <hp id={2}>inserted</hp>
  </editor>
) as any;

it('should add an id to the new elements', () => {
  const editor = withNodeID({ idCreator: idCreatorFixture })(
    withTransforms()(withHistory(input))
  );

  editor.insertNodes(
    (
      <fragment>
        <hp>inserted</hp>
        <hp>inserted</hp>
      </fragment>
    ) as any
  );

  editor.undo();
  editor.redo();
  editor.undo();
  editor.redo();

  expect(input.children).toEqual(output.children);
});
