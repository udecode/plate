import { useCallback, useState } from 'react';
import type { Value } from '@platejs/plite';
import { subscribeEditableRuntimeFocus } from '../editable/editable-dom-runtime';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export const useRuntimeFocusState = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
) => {
  const [focused, setFocused] = useState(ReactEditor.isFocused(editor));
  const [focusVersion, setFocusVersion] = useState(0);
  const refreshFocused = useCallback(() => {
    setFocused(ReactEditor.isFocused(editor));
  }, [editor]);
  const publishFocusState = useCallback(() => {
    refreshFocused();
    setFocusVersion((version) => version + 1);
  }, [refreshFocused]);

  useIsomorphicLayoutEffect(() => {
    refreshFocused();

    return subscribeEditableRuntimeFocus(editor, publishFocusState);
  }, [editor, publishFocusState, refreshFocused]);

  return { focused, focusVersion, refreshFocused };
};
