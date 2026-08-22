import React from 'react';

import {
  type CreateStaticEditorOptions,
  type StaticEditor,
  createStaticEditor,
} from '../../static/editor/withStatic';

/**
 * Creates a memoized static Plate editor for view-only React components.
 *
 * This hook creates a fully configured static Plate editor instance that is
 * memoized based on the provided dependencies. It's optimized for React
 * components to prevent unnecessary re-creation of the editor on every render.
 * Uses createStaticEditor.
 *
 * @param options - Configuration options for creating the static Plate editor
 * @param deps - Additional dependencies for the useMemo hook (default: [])
 * @see {@link createStaticEditor} for detailed information on static editor creation and configuration.
 */
export function usePlateViewEditor<
  const P extends readonly unknown[] = readonly [],
  TEnabled extends boolean | undefined = undefined,
>(
  options: CreateStaticEditorOptions<P> & {
    enabled?: TEnabled;
  } = {},
  deps: React.DependencyList = []
): TEnabled extends false
  ? null
  : TEnabled extends true | undefined
    ? StaticEditor<P>
    : StaticEditor<P> | null {
  return React.useMemo(
    (): any => {
      if (options.enabled === false) return null;
      return createStaticEditor(options);
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] This API intentionally keys editor ownership by id, enabled state, and caller-supplied dependencies rather than every options-object identity.
    [options.id, options.enabled, ...deps]
  );
}
