import type { Element } from '@platejs/slate';

import { useEditorSelector } from 'platejs/react';

import type { TableConfig } from '../../../lib/BaseTablePlugin';

export const useIsCellSelected = (element: Element) =>
  useEditorSelector(
    (editor) =>
      (editor.api as unknown as TableConfig['api']).table.isCellSelected(
        element.id as string | null | undefined
      ),
    [element.id]
  );
