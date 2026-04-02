import type { Path } from '@platejs/slate';

import { useEditorRef } from '../plate';
import { useElementContext } from './useElementStore';

/** Get the memoized path of the closest element. */
export const usePath = (pluginKey?: string): Path => {
  const editor = useEditorRef();
  const value = useElementContext(pluginKey)?.path;

  if (!value) {
    editor.api.debug.warn(
      `usePath(${pluginKey}) hook must be used inside the node component's context`,
      'USE_ELEMENT_CONTEXT'
    );

    return undefined as any;
  }

  return value;
};
