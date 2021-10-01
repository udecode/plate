/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { createMentionPlugin } from '../../../createMentionPlugin';

jsx;

const input = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as Editor;

it('should do nothing', () => {
  const editor = createEditorPlugins({
    editor: input,
  });

  const { result } = renderHook(() => createMentionPlugin());

  act(() => {
    result.current.plugin.onChange?.(editor)([]);
  });

  expect(result.current.getMentionSelectProps().valueIndex).toBe(0);
});
