import { type Element, type Path, PathApi, type Text } from '@platejs/plite';
import React from 'react';

import {
  useEditor,
  useEditorPluginStore,
  useElementContext,
} from '../../stores';
import { NavigationFeedbackPlugin } from './NavigationFeedbackPlugin';
import type { NavigationFeedbackActiveTarget } from './types';

type NavigationHighlightTarget = Path | Element | Text | null | undefined;

export const useNavigationHighlight = (target?: NavigationHighlightTarget) => {
  const editor = useEditor();
  const currentElementPath = useElementContext()?.path ?? null;
  const activeTarget = useEditorPluginStore(
    editor,
    NavigationFeedbackPlugin,
    'activeTarget'
  );

  return React.useMemo<NavigationFeedbackActiveTarget | null>(() => {
    const currentTarget = target;

    if (!activeTarget || !currentTarget) return null;

    const resolvedPath = Array.isArray(currentTarget)
      ? currentTarget
      : currentElementPath;

    if (!resolvedPath) return null;
    if (!PathApi.equals(activeTarget.path, resolvedPath)) return null;

    return activeTarget;
  }, [activeTarget, currentElementPath, target]);
};
