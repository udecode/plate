import { useCallback, useSyncExternalStore } from 'react';

import { useEditorRootElement } from '../../plite-react';
import { useEditor } from '../plate/useEditor';
import { getLastEditableTracker } from './document-focus.internal';

/** Whether this editor was last focused in its owning document, including toolbar focus. */
export function useFocusedLast(): boolean {
  const element = useEditorRootElement(useEditor());

  return useSyncExternalStore(
    useCallback(
      (listener) =>
        element
          ? getLastEditableTracker(element.ownerDocument).subscribe(
              element,
              listener
            )
          : () => {},
      [element]
    ),
    () =>
      !!element &&
      getLastEditableTracker(element.ownerDocument).isLast(element),
    () => false
  );
}
