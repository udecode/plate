import { act, renderHook } from '@testing-library/react';

import { createPlateEditor } from '../../editor';
import {
  BLUR_EDITOR_EVENT,
  FOCUS_EDITOR_EVENT,
  useFocusEditorEvents,
} from './useFocusEditorEvents';

describe('useFocusEditorEvents', () => {
  it('calls focus and blur handlers only for the matching editor id', () => {
    const editor = createPlateEditor({ id: 'editor-a' });
    const onEditorFocus = mock();
    const onEditorBlur = mock();

    const { unmount } = renderHook(() =>
      useFocusEditorEvents({
        editorRef: editor,
        onEditorBlur,
        onEditorFocus,
      })
    );

    act(() => {
      document.dispatchEvent(
        new CustomEvent(FOCUS_EDITOR_EVENT, {
          detail: { id: 'editor-b' },
        })
      );
      document.dispatchEvent(
        new CustomEvent(BLUR_EDITOR_EVENT, {
          detail: { id: 'editor-a' },
        })
      );
      document.dispatchEvent(
        new CustomEvent(FOCUS_EDITOR_EVENT, {
          detail: { id: 'editor-a' },
        })
      );
    });

    expect(onEditorBlur).toHaveBeenCalledTimes(1);
    expect(onEditorFocus).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      document.dispatchEvent(
        new CustomEvent(FOCUS_EDITOR_EVENT, {
          detail: { id: 'editor-a' },
        })
      );
    });

    expect(onEditorFocus).toHaveBeenCalledTimes(1);
  });
});
