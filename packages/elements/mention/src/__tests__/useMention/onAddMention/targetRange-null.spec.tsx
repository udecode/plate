/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { createMentionPlugin } from '../../../createMentionPlugin';

jsx;

const input = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

it('should do nothing', () => {
  const editor = createEditorPlugins();

  const { result } = renderHook(() => createMentionPlugin());

  act(() => {
    result.current
      .getMentionSelectProps()
      .onClickMention?.(editor, { value: 't22' });
  });

  expect(input.children).toEqual(output.children);
});
