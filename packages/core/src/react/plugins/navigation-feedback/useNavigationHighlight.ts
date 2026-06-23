import React from 'react';

import { type Element, type Path, PathApi, type Text } from '@platejs/slate';

import type {
  NavigationFeedbackActiveTarget,
  NavigationFeedbackStoredTarget,
} from '../../../lib/plugins/navigation-feedback/types';
import { NavigationFeedbackPluginKey } from '../../../lib/plugins/navigation-feedback/types';
import {
  useEditorPluginOption,
  useEditorRef,
  useElementContext,
} from '../../stores';

type NavigationHighlightTarget = Path | Element | Text | null | undefined;

export const useNavigationHighlight = (target?: NavigationHighlightTarget) => {
  const editor = useEditorRef();
  const currentElementPath = useElementContext()?.path ?? null;
  const storedTarget = useEditorPluginOption(
    editor,
    NavigationFeedbackPluginKey,
    'activeTarget'
  ) as NavigationFeedbackStoredTarget | null;

  return React.useMemo<NavigationFeedbackActiveTarget | null>(() => {
    const path = storedTarget?.pathRef.current;

    if (!storedTarget || !path) return null;

    const currentTarget = target;

    if (!currentTarget) return null;

    const resolvedPath = Array.isArray(currentTarget)
      ? currentTarget
      : currentElementPath;

    if (!resolvedPath) return null;
    if (!PathApi.equals(path, resolvedPath)) return null;

    const { pathRef: _pathRef, ...activeTarget } = storedTarget;

    return { ...activeTarget, path };
  }, [currentElementPath, editor, storedTarget, target]);
};
