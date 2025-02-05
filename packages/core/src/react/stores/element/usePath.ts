import type { Path } from '@udecode/slate';

import { useStoreValue } from 'jotai-x';

import { useEditorRef } from '../plate';
import { useElementStore } from './useElementStore';

/** Get the memoized path of the closest element. */
export const usePath = (pluginKey?: string): Path => {
  const editor = useEditorRef();
  const value = useStoreValue(useElementStore(pluginKey), 'path');

  if (!value) {
    editor.api.debug.warn(
      `usePath(${pluginKey}) hook must be used inside the node component's context`,
      'USE_ELEMENT_CONTEXT'
    );

    return undefined as any;
  }

  return value;
};
