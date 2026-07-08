import type { SlateEditor, TElement } from 'platejs';

import { CaptionPlugin } from '../CaptionPlugin';

export const showCaption = (editor: SlateEditor, element: TElement) => {
  const path = editor.api.findPath(element);
  editor.plugin(CaptionPlugin).setOption('visibleId', element.id as string);

  setTimeout(() => {
    if (path) {
      editor.plugin(CaptionPlugin).setOption('focusEndPath', path);
    }
  }, 0);
};
