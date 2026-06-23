import { createContext, useContext } from 'react';
import type { Editor } from '@platejs/plite';
import type { ReactEditorContextValue } from '../plugin/with-react';

/**
 * A React context for sharing the editor object.
 */

export const EditorContext = createContext<ReactEditorContextValue<any> | null>(
  null
);

/**
 * Get the current editor object from the React context.
 */

export const useEditor = <
  TEditor extends Editor<any> = ReactEditorContextValue<any>,
>(): TEditor => {
  const editor = useContext(EditorContext);

  if (!editor) {
    throw new Error(
      `The \`useEditor\` hook must be used inside the <Plite> component's context.`
    );
  }

  return editor as unknown as TEditor;
};
