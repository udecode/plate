import type { Path, SlateEditor, TCaptionElement } from 'platejs';

import { CaptionPlugin } from '../CaptionPlugin';

export const showCaption = (
  editor: SlateEditor,
  element: TCaptionElement,
  path: Path | null
) => {
  editor.setOption(CaptionPlugin, 'visibleId', element.id as string);

  setTimeout(() => {
    if (path) {
      editor.setOption(CaptionPlugin, 'focusEndPath', path);
    }
  }, 0);
};
