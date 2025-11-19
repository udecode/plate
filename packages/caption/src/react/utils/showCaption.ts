import type { SlateEditor, TElement } from 'platejs';

import { CaptionPlugin } from '../CaptionPlugin';

export const showCaption = (editor: SlateEditor, element: TElement) => {
  const path = editor.api.findPath(element);
  editor.setOption(CaptionPlugin, 'visibleId', element.id as string);

  setTimeout(() => {
    if (path) {
      editor.setOption(CaptionPlugin, 'focusEndPath', path);
    }
  }, 0);
};
