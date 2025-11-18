import React from 'react';

import type { Value } from '@platejs/slate';

import type { AnyPluginConfig } from '../../lib';

import { createStaticEditor } from '../../static/editor/withStatic';

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
  V extends Value = Value,
  P extends AnyPluginConfig = any,
  TEnabled extends boolean | undefined = undefined,
>(
  options: Parameters<typeof createStaticEditor<V, P>>[0] & {
    enabled?: TEnabled;
  } = {},
  deps: React.DependencyList = []
): TEnabled extends false
  ? null
  : TEnabled extends true | undefined
    ? ReturnType<typeof createStaticEditor<V, P>>
    : ReturnType<typeof createStaticEditor<V, P>> | null {
  const isMountedRef = React.useRef(false);
  const [, forceRender] = React.useState({});

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return React.useMemo(
    (): any => {
      if (options.enabled === false) return null;
      // No onReady/async logic for static editor
      return createStaticEditor({
        ...options,
        onReady: (ctx) => {
          if (ctx.isAsync && isMountedRef.current) {
            forceRender({});
          }
          options.onReady?.(ctx);
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options?.id, options?.enabled, ...deps]
  );
}
