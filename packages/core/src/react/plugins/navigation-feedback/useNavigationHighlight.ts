import React from 'react';

import { type Element, type Path, PathApi, type Text } from '@platejs/plite';

import type { NavigationFeedbackActiveTarget } from './types';
import { NavigationFeedbackPlugin } from './NavigationFeedbackPlugin';
import {
  useEditorPluginOption,
  useEditor,
  useElementContext,
} from '../../stores';

type NavigationHighlightTarget = Path | Element | Text | null | undefined;

export const useNavigationHighlight = (target?: NavigationHighlightTarget) => {
  const editor = useEditor();
  const currentElementPath = useElementContext()?.path ?? null;
  const storedTarget = useEditorPluginOption(
    editor,
    NavigationFeedbackPlugin,
    'activeTarget'
  );

  return React.useMemo<NavigationFeedbackActiveTarget | null>(() => {
    const path = storedTarget?.pathAnchor.resolve();

    if (!storedTarget || !path) return null;

    const currentTarget = target;

    if (!currentTarget) return null;

    const resolvedPath = Array.isArray(currentTarget)
      ? currentTarget
      : currentElementPath;

    if (!resolvedPath) return null;
    if (!PathApi.equals(path, resolvedPath)) return null;

    const { pathAnchor: _pathAnchor, ...activeTarget } = storedTarget;

    return { ...activeTarget, path };
  }, [currentElementPath, storedTarget, target]);
};
