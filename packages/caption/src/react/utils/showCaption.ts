import type { SlateEditor, TElement } from '@udecode/plate-common';

import { findNodePath } from '@udecode/plate-common/react';

import { CaptionPlugin } from '../CaptionPlugin';

export const showCaption = (editor: SlateEditor, element: TElement) => {
  const path = findNodePath(editor, element);
  editor.setOption(CaptionPlugin, 'visibleId', element.id as string);

  setTimeout(() => {
    path && editor.setOption(CaptionPlugin, 'focusEndPath', path);
  }, 0);
};
