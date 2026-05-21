import React from 'react';

import { type Path, PathApi, type TElement, type TText } from '@platejs/slate';

import { useEditorSelector } from '../../stores';

type NavigationHighlightTarget = Path | TElement | TText | null | undefined;

export const useNavigationHighlight = (target?: NavigationHighlightTarget) => {
  const targetRef = React.useRef(target);

  targetRef.current = target;

  return useEditorSelector(
    (editor) => {
      const activeTarget = editor.api.navigation.activeTarget();

      if (!activeTarget) return null;

      const currentTarget = targetRef.current;

      if (!currentTarget) return null;

      const resolvedPath = Array.isArray(currentTarget)
        ? currentTarget
        : editor.api.findPath(currentTarget);

      if (!resolvedPath) return null;
      if (!PathApi.equals(activeTarget.path, resolvedPath)) return null;

      return activeTarget;
    },
    [target]
  );
};
