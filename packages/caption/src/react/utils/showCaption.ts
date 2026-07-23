import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';

import { BaseCaptionPlugin } from '../../lib';

export const showCaption = (editor: BaseEditor, element: Element) => {
  if (typeof element.id !== 'string') return;

  const caption = editor.plugin(BaseCaptionPlugin);

  caption.setOption('visibleId', element.id);

  setTimeout(() => {
    const path = editor.read.nodes.path(element);

    if (!path) return;

    caption.setOption('focusEndPath', path);
  }, 0);
};
