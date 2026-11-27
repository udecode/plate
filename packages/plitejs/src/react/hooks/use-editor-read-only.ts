import {
  createContext,
  createElement,
  useContext,
  type ReactNode,
} from 'react';

import type { EditorStateView } from '../..';
import type { ViewLockScope } from '../../editor-runtime-view';
import { PliteEditingAreaContext } from '../context';
import { useOptionalEditorViewState } from './use-editor-view-state';
import { useOptionalEditor } from './use-plite-runtime';

export const ReadOnlyContext = createContext<boolean | undefined>(undefined);

export const ExplicitReadOnlyOverrideContext = createContext<
  boolean | undefined
>(undefined);

export const ViewLockScopeContext = createContext<ViewLockScope | undefined>(
  undefined
);

const readViewReadOnly = (view: EditorStateView['view']) => view.isReadOnly();

export const useInheritedReadOnly = (): boolean =>
  useContext(ReadOnlyContext) ?? false;

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
    ExplicitReadOnlyOverrideContext.Provider,
    { value: readOnly },
    createElement(
      ReadOnlyContext.Provider,
      { value: readOnly },
      createElement(
        ViewLockScopeContext.Provider,
        { value: readOnly === undefined ? enclosingLock : undefined },
        children
      )
    )
  );
};

/**
 * Return the nearest editor read-only state, or `undefined` when no provider is
 * active yet.
 */
export const useOptionalEditorReadOnly = (): boolean | undefined => {
  const explicitOverride = useContext(ExplicitReadOnlyOverrideContext);
  const insideEditingArea = useContext(PliteEditingAreaContext);
  const inheritedReadOnly = useContext(ReadOnlyContext);
  const target = useOptionalEditor();
  const viewReadOnly = useOptionalEditorViewState(
    explicitOverride === undefined && !insideEditingArea ? target : null,
    readViewReadOnly,
    false,
    true
  );

  if (explicitOverride !== undefined) return explicitOverride;
  if (insideEditingArea) return inheritedReadOnly ?? false;
  if (target !== null) return viewReadOnly;

  return inheritedReadOnly;
};

/**
 * Get the current `readOnly` state of the active editor.
 */
export const useEditorReadOnly = (): boolean =>
  useOptionalEditorReadOnly() ?? false;
