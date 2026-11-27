import { createContext, useContext } from 'react';

import type { EditorStateView } from '../..';
import { PliteEditingAreaContext } from '../context';
import { useOptionalEditorViewState } from './use-editor-view-state';
import { useOptionalEditor } from './use-plite-runtime';

export const FocusedContext = createContext(false);

const readViewFocused = (view: EditorStateView['view']) => view.isFocused();

/**
 * Get the current `focused` state of the active editor.
 */
export const useEditorFocused = (): boolean => {
  const insideEditingArea = useContext(PliteEditingAreaContext);
  const surfaceFocused = useContext(FocusedContext);
  const target = useOptionalEditor();
  const targetFocused = useOptionalEditorViewState(
    insideEditingArea ? null : target,
    readViewFocused,
    false
  );

  return insideEditingArea ? surfaceFocused : targetFocused;
};
