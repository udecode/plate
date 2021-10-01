/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/plate-test-utils';
import { Editor, Transforms } from 'slate';
import { createEditorPlugins } from '../../../../../../../plate/src/utils/createEditorPlugins';
import { createMentionPlugin } from '../../../../createMentionPlugin';
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

  const { result } = renderHook(() => createMentionPlugin({ mentionables }));

  act(() => {
    result.current.plugin.onChange?.(editor)([]);
  });

  act(() => {
    result.current.plugin.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'ArrowUp' }) as any
    );
  });

  expect(result.current.getMentionSelectProps().valueIndex).toBe(2);
});
