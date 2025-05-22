import React from 'react';

import {
  useComposing,
  useEditorRef,
  usePlateStore,
  useReadOnly,
} from '../../react';

/**
 * Trick to run effect only once per Editable.
 *
 * - `useComposing` is only available inside Editable, so we cache it in the
 *   store.
 * - `useReadOnly` is handled in PlateContent
 * - `useFocused` is accessible outside Editable
 */
export function FirstBlockEffect() {
  const editor = useEditorRef();
  const store = usePlateStore();
  const composing = useComposing();
  const readOnly = useReadOnly();

  editor.dom.readOnly = readOnly;
  // editor.dom.composing = composing;

  React.useLayoutEffect(() => {
    store.set('composing', composing);
  }, [composing, store]);

  return null;
}
