/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from '../../../../../../../plate/src/utils/createEditorPlugins';
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

const withOverrides = [withReact, withHistory] as const;

it('should go down then back to the first index', () => {
  const editor = createEditorPlugins({
    editor: input,
  });

  const { result } = renderHook(() => useMentionPlugin({ mentionables }));

  act(() => {
    result.current.plugin.onChange?.(editor)([]);
  });

  act(() => {
    result.current.plugin.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any
    );
  });
  act(() => {
    result.current.plugin.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any
    );
  });
  act(() => {
    result.current.plugin.onKeyDown?.(editor)(
      new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any
    );
  });

  expect(result.current.getMentionSelectProps().valueIndex).toBe(0);
});
