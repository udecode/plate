/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { useMentionPlugin } from '../../../useMentionPlugin';

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

  const { result } = renderHook(() => useMentionPlugin());

  act(() => {
    result.current
      .getMentionSelectProps()
      .onClickMention?.(editor, { value: 't22' });
  });

  expect(input.children).toEqual(output.children);
});
