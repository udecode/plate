import { useCallback, useSyncExternalStore } from 'react';

import { useEditorRootElement } from '../../plite-react';
import { useEditor } from '../plate/useEditor';
import { getDocumentFocus } from './document-focus.internal';

/** Whether this editor was last focused in its owning document, including toolbar focus. */
export function useFocusedLast(): boolean {
  const editor = useEditor();
  const element = useEditorRootElement(editor);
  const document = element?.ownerDocument;

  return useSyncExternalStore(
    useCallback(
      (listener) =>
        document
          ? getDocumentFocus(document).subscribe(editor, listener)
          : () => {},
      [document, editor]
    ),
    () => !!document && getDocumentFocus(document).isLast(editor),
    () => false
  );
}
