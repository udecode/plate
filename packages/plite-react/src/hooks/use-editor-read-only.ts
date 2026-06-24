import { createContext, useContext } from 'react';

/**
 * A React context for sharing the `readOnly` state of the editor.
 */

export const ReadOnlyContext = createContext(false);

/**
 * Get the current `readOnly` state of the editor.
 */

export const useEditorReadOnly = (): boolean => useContext(ReadOnlyContext);
