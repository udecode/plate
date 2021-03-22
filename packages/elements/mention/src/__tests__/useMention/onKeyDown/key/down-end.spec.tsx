/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from '../../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { useMentionPlugin } from '../../../../useMentionPlugin';
import { mentionables } from '../mentionables.fixture';

const input = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const withOverrides = [withReact, withHistory] as const;

it('should go down then back to the first index', () => {
  const editor = createEditorPlugins({
    editor: input,
  });

  const { result } = renderHook(() => useMentionPlugin({ mentionables }));

  act(() => {
    result.current.onChange?.(editor)([]);
  });

  act(() => {
    result.current.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'ArrowDown' })
    );
  });
  act(() => {
    result.current.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'ArrowDown' })
    );
  });
  act(() => {
    result.current.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'ArrowDown' })
    );
  });

  expect(result.current.getMentionSelectProps().valueIndex).toBe(0);
});
