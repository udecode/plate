import { useEditorRef } from '../plate';
import { useElementStore } from './useElementStore';

/** Get the memoized path of the closest element. */
export const usePath = (pluginKey?: string) => {
  const editor = useEditorRef();
  const value = useElementStore(pluginKey).get.path();

  if (!value) {
    editor.api.debug.warn(
      `usePath(${pluginKey}) hook must be used inside the node component's context`,
      'USE_ELEMENT_CONTEXT'
    );

    return undefined;
  }

  return value;
};
