import type { TElement } from 'platejs';

import { useEditorSelector } from 'platejs/react';

import { TablePlugin } from '../../TablePlugin';

export const useIsCellSelected = (element: TElement) =>
  useEditorSelector(
    (editor) =>
      editor
        .getApi(TablePlugin)
        .table.isCellSelected(element.id as string | null | undefined),
    [element.id]
  );
