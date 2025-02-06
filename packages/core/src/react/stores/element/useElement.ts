import type { TElement } from '@udecode/slate';

import { useAtomStoreValue } from 'jotai-x';

import { useEditorRef } from '../plate';
import { SCOPE_ELEMENT, useElementStore } from './useElementStore';

/**
 * Get the element by plugin key. If no element is found in the context, it will
 * return an empty object.
 */
export const useElement = <T extends TElement = TElement>(
  pluginKey = SCOPE_ELEMENT
): T => {
  const editor = useEditorRef();
  const value = useAtomStoreValue(useElementStore(pluginKey), 'element');

  if (!value) {
    editor.api.debug.warn(
      `useElement(${pluginKey}) hook must be used inside the node component's context`,
      'USE_ELEMENT_CONTEXT'
    );

    return {} as T;
  }

  return value as T;
};
