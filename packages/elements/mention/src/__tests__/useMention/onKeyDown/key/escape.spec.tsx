/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { useMentionPlugin } from '../../../../useMentionPlugin';
import { mentionables } from '../mentionables.fixture';

jsx;

const input = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

it('should go down', () => {
  const editor = createEditorPlugins({
    editor: input,
  });

  const { result } = renderHook(() => useMentionPlugin({ mentionables }));

  act(() => {
    result.current.plugin.onChange?.(editor)([]);
  });

  act(() => {
    result.current.plugin.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'Escape' })
    );
  });

  expect(result.current.getMentionSelectProps().at).toEqual(null);
});
