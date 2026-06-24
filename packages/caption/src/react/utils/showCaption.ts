import type { Path, BasePlateEditor, TCaptionElement } from 'platejs';

import { CaptionPlugin } from '../CaptionPlugin';

export const showCaption = (
  editor: BasePlateEditor,
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
