import {
  type PlateEditor,
  type TElement,
  findNodePath,
} from '@udecode/plate-common';

import { captionActions, captionGlobalStore } from '../captionGlobalStore';

export const showCaption = (editor: PlateEditor, element: TElement) => {
  const path = findNodePath(editor, element);
  captionActions.showCaptionId(element.id as string);

  setTimeout(() => {
    path && captionGlobalStore.set.focusEndCaptionPath(path);
  }, 0);
};
