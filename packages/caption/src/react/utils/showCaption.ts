import type { SlateEditor, TElement } from '@udecode/plate-common';

import { findNodePath } from '@udecode/plate-common/react';

import { captionActions, captionGlobalStore } from '../../lib/captionGlobalStore';

export const showCaption = (editor: SlateEditor, element: TElement) => {
  const path = findNodePath(editor, element);
  captionActions.showCaptionId(element.id as string);

  setTimeout(() => {
    path && captionGlobalStore.set.focusEndCaptionPath(path);
  }, 0);
};
