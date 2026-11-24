import {
  createContext,
  createElement,
  useContext,
  type ReactNode,
} from 'react';

import type { ViewLockScope } from '../../editor-runtime-view';

export const ReadOnlyContext = createContext<boolean | undefined>(undefined);

export const ViewLockScopeContext = createContext<ViewLockScope | undefined>(
  undefined
);

/**
 * Props for `EditorReadOnlyProvider`.
 */
export type EditorReadOnlyProviderProps = {
  children: ReactNode;
  readOnly?: boolean;
};

/**
 * Share editor read-only state with shell components that render outside a
 * concrete `<Plite>` root.
 */
export const EditorReadOnlyProvider = ({
  children,
  readOnly,
}: EditorReadOnlyProviderProps) => {
  const enclosingLock = useContext(ViewLockScopeContext);

  return createElement(
    ReadOnlyContext.Provider,
    { value: readOnly },
    createElement(
      ViewLockScopeContext.Provider,
      { value: readOnly === undefined ? enclosingLock : undefined },
      children
    )
  );
};

/**
 * Return the nearest editor read-only state, or `undefined` when no provider is
 * active yet.
 */
export const useOptionalEditorReadOnly = (): boolean | undefined =>
  useContext(ReadOnlyContext);

/**
 * Get the current `readOnly` state of the editor.
 */

export const useEditorReadOnly = (): boolean =>
  useOptionalEditorReadOnly() ?? false;
