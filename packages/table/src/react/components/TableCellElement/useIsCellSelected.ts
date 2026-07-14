import type { Element } from '@platejs/plite';

import { useEditorSelector } from '@platejs/core/react';

import { BaseTablePlugin } from '../../../lib/BaseTablePlugin';

export const useIsCellSelected = (element: Element) =>
  useEditorSelector(
    (editor) =>
      editor
        .plugin(BaseTablePlugin)
        .api.isCellSelected(element.id as string | null | undefined),
    [element.id]
  );
