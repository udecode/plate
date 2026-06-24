import type { Path, TCaptionElement } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import { useEditorRef, useElement, useNodePath } from 'platejs/react';

import { BaseCaptionPlugin } from '../../lib';

export type CaptionButtonState = {
  editor: PlateEditor;
  element: TCaptionElement;
  path: Path | null;
};

export const useCaptionButtonState = (): CaptionButtonState => {
  const editor = useEditorRef<PlateEditor>();
  const element = useElement<TCaptionElement>();
  const path = useNodePath(element) ?? null;

  return { editor, element, path };
};

export const useCaptionButton = ({
  editor,
  element,
  path,
}: ReturnType<typeof useCaptionButtonState>) => ({
  props: {
    onClick: () => {
      editor.setOption(BaseCaptionPlugin, 'visibleId', element.id as string);
      setTimeout(() => {
        if (path) {
          editor.setOption(BaseCaptionPlugin, 'focusEndPath', path);
        }
      }, 0);
    },
  },
});
