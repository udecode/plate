import { createContext, useContext } from 'react';

import type { EditorStateView } from '../..';
import { PliteEditingAreaContext } from '../context';
import { useOptionalEditorViewState } from './use-editor-view-state';
import { useOptionalEditor } from './use-plite-runtime';

export const ComposingContext = createContext(false);

const readViewComposing = (view: EditorStateView['view']) => view.isComposing();

/**
 * Get the current `composing` state of the active editor.
 */
export const useEditorComposing = (): boolean => {
  const insideEditingArea = useContext(PliteEditingAreaContext);
  const surfaceComposing = useContext(ComposingContext);
  const target = useOptionalEditor();
  const targetComposing = useOptionalEditorViewState(
    insideEditingArea ? null : target,
    readViewComposing,
    false
  );

  return insideEditingArea ? surfaceComposing : targetComposing;
};
