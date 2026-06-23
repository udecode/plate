import React from 'react';

import type { Value } from '@platejs/plite';

import type { AnyPluginConfig, InferPlugins } from '../../lib';

import type { TPlateEditor } from './PlateEditor';
import type { PlateRuntimeEditor } from './createPlateRuntimeEditor';
import {
  type CreatePlateEditorOptions,
  type CreatePlateEditorRuntimeOptions,
  type PlateCorePlugin,
  createPlateEditor,
} from './withPlate';

type UsePlateEditorReturn<TEnabled, TEditor> = TEnabled extends false
  ? null
  : TEnabled extends true | undefined
    ? TEditor
    : TEditor | null;

/**
 * Creates a memoized Plate editor for React components.
 *
 * This hook creates a fully configured Plate editor instance that is memoized
 * based on the provided dependencies. It's optimized for React components to
 * prevent unnecessary re-creation of the editor on every render.
 *
 * Examples:
 *
 * ```ts
 * const editor = usePlateEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   value: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom dependencies
 * const editor = usePlateEditor(
 *   {
 *     plugins: [ParagraphPlugin],
 *     enabled,
 *   },
 *   [enabled]
 * ); // Re-create when enabled changes
 * ```
 *
 * @param options - Configuration options for creating the Plate editor
 * @param deps - Additional dependencies for the useMemo hook (default: [])
 * @see {@link createPlateEditor} for detailed information on React editor creation and configuration.
 * @see {@link createBasePlateEditor} for a non-React version of editor creation.
 * @see {@link withPlate} for the underlying React-specific enhancement function.
 */
export function usePlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
  TEnabled extends boolean | undefined = undefined,
>(
  options?: CreatePlateEditorRuntimeOptions<V, P> & { enabled?: TEnabled },
  deps?: React.DependencyList
): UsePlateEditorReturn<
  TEnabled,
  PlateRuntimeEditor<V, readonly [], InferPlugins<P[]>>
>;

export function usePlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
  TEnabled extends boolean | undefined = undefined,
>(
  options?: CreatePlateEditorOptions<V, P> & { enabled?: TEnabled },
  deps?: React.DependencyList
): UsePlateEditorReturn<TEnabled, TPlateEditor<V, P>>;

export function usePlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
  TEnabled extends boolean | undefined = undefined,
>(
  options:
    | (CreatePlateEditorOptions<V, P> & { enabled?: TEnabled })
    | (CreatePlateEditorRuntimeOptions<V, P> & { enabled?: TEnabled }) = {},
  deps: React.DependencyList = []
): UsePlateEditorReturn<
  TEnabled,
  PlateRuntimeEditor<V, readonly [], InferPlugins<P[]>> | TPlateEditor<V, P>
> {
  const [, forceRender] = React.useState({});
  const isMountedRef = React.useRef(false);
  const { enabled, ...editorOptions } = options;

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return React.useMemo(
    () => {
      if (enabled === false) return null;

      if (editorOptions.runtime === 'legacy') {
        const legacyOptions = editorOptions as CreatePlateEditorOptions<V, P>;
        const editor = createPlateEditor({
          ...legacyOptions,
          onReady: (ctx) => {
            if (ctx.isAsync && isMountedRef.current) {
              forceRender({});
            }
            legacyOptions.onReady?.(ctx);
          },
        });

        return editor;
      }

      const runtimeOptions = editorOptions as CreatePlateEditorRuntimeOptions<
        V,
        P
      >;
      const editor = createPlateEditor(runtimeOptions);

      return editor;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorOptions.id, enabled, ...deps]
  ) as UsePlateEditorReturn<
    TEnabled,
    PlateRuntimeEditor<V, readonly [], InferPlugins<P[]>> | TPlateEditor<V, P>
  >;
}
