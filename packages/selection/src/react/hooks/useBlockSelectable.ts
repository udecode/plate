import type React from 'react';

import type { Element, Path } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { useEditorPlugin } from '@platejs/core/react';
import { useElementContext } from '@platejs/core/react/internal';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

export const useBlockSelectable = ({
  element: elementProp,
  path: pathProp,
}: {
  element?: Element;
  path?: Path;
} = {}) => {
  const elementContext = useElementContext();
  const element = elementProp ?? elementContext?.element;
  const path = pathProp ?? elementContext?.path;
  const { api } = useEditorPlugin<BlockSelectionConfig>({
    key: KEYS.blockSelection,
  });

  return {
    props:
      element && path && api?.isSelectable(element, path)
        ? {
            className: 'plite-selectable',
            onContextMenu: (
              event: React.MouseEvent<HTMLDivElement, MouseEvent>
            ) => api.addOnContextMenu({ element, event }),
          }
        : {},
  };
};
