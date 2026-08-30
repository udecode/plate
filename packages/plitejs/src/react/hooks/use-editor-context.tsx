import { createContext, useContext } from 'react';

import type { EditorContextValue } from '../plugin/with-react';

/**
 * A React context for sharing the editor object.
 */

export const EditorContext = createContext<EditorContextValue<any> | null>(
  null
);

/**
 * Get the current editor object from the React context.
 */

export const useEditorContext = (): EditorContextValue<any> => {
  const editor = useOptionalEditorContext();

  if (!editor) {
    throw new Error(
      `The \`useEditorContext\` hook must be used inside the <Plite> component's context.`
    );
  }

  return editor;
};

/** Get the current editor object when a provider is mounted. */
export const useOptionalEditorContext = (): EditorContextValue<any> | null =>
  useContext(EditorContext);
