import type { TElement } from '@platejs/slate';

import { useEditorRef } from '../plate';
import { SCOPE_ELEMENT, useElementContext } from './useElementStore';

/**
 * Get the element by plugin key. If no element is found in the context, it will
 * return an empty object.
 */
export const useElement = <T extends TElement = TElement>(
  pluginKey = SCOPE_ELEMENT
): T => {
  const editor = useEditorRef();
  const value = useElementContext(pluginKey)?.element;

  if (!value) {
    editor.api.debug.warn(
      `useElement(${pluginKey}) hook must be used inside the node component's context`,
      'USE_ELEMENT_CONTEXT'
    );

    return {} as T;
  }

  return value as T;
};
