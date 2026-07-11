import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';

import { BaseCaptionPlugin } from '../../lib';

export const showCaption = (editor: BaseEditor, element: Element) => {
  const path = editor.read.nodes.path(element);

  const caption = editor.plugin(BaseCaptionPlugin);

  caption.setOption('visibleId', element.id as string);

  setTimeout(() => {
    if (path) {
      caption.setOption('focusEndPath', path);
    }
  }, 0);
};
