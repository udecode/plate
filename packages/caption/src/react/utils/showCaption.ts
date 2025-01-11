import type { SlateEditor, TElement } from '@udecode/plate';

import { CaptionPlugin } from '../CaptionPlugin';

export const showCaption = (editor: SlateEditor, element: TElement) => {
  const path = editor.api.findPath(element);
  editor.setOption(CaptionPlugin, 'visibleId', element.id as string);

  setTimeout(() => {
    path && editor.setOption(CaptionPlugin, 'focusEndPath', path);
  }, 0);
};
