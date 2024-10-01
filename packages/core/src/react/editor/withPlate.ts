/* eslint-disable react-hooks/rules-of-hooks */
import { type TEditor, type Value, createTEditor } from '@udecode/slate';

import type { AnyPlatePlugin } from '../plugin';
import type { PlateApiPlugin } from '../plugins';
import type { TPlateEditor } from './PlateEditor';

import {
  type AnyPluginConfig,
  type BaseWithSlateOptions,
  type CorePlugin,
  type InferPlugins,
  withSlate,
} from '../../lib';
import { getPlateCorePlugins } from './getPlateCorePlugins';

export type PlateCorePlugin = CorePlugin | typeof PlateApiPlugin;

export type WithPlateOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = BaseWithSlateOptions<V, P> &
  Pick<
    Partial<AnyPlatePlugin>,
    | 'api'
    | 'decorate'
    | 'extendEditor'
    | 'handlers'
    | 'inject'
    | 'normalizeInitialValue'
    | 'options'
    | 'override'
    | 'priority'
    | 'render'
    | 'shortcuts'
    | 'transforms'
    | 'useHooks'
  > & {
    rootPlugin?: (plugin: AnyPlatePlugin) => AnyPlatePlugin;
  };

/**
 * Applies Plate-specific enhancements to an editor instance with ReactPlugin.
 *
 * @see {@link createPlateEditor} for a higher-level React editor creation function.
 * @see {@link usePlateEditor} for a memoized version in React components.
 * @see {@link withSlate} for the non-React version of editor enhancement
 */
export const withPlate = <
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>(
  e: TEditor,
  { plugins = [], ...options }: WithPlateOptions<V, P> = {}
): TPlateEditor<V, InferPlugins<P[]>> => {
  const editor = withSlate<V, P>(e, {
    ...options,
    plugins: [...getPlateCorePlugins(), ...plugins],
  } as any) as unknown as TPlateEditor<V, InferPlugins<P[]>>;

  editor.useOptions = ((plugin: any, selector: any, equalityFn: any) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) {
      editor.api.debug.warn(
        `editor.useOptions: ${plugin.key} plugin is missing`,
        'PLUGIN_MISSING'
      );

      return {};
    }

    return store.useStore(selector, equalityFn);
  }) as any;

  editor.useOption = (plugin: any, key: any, ...args: any) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) {
      editor.api.debug.warn(
        `editor.useOption: ${plugin.key} plugin is missing`,
        'PLUGIN_MISSING'
      );

      return;
    }

    const useState = (store as any)?.use[key];

    if (useState) {
      return useState(...args);
    }

    editor.api.debug.error(
      `editor.useOption: ${key} option is not defined in plugin ${plugin.key}`,
      'OPTION_UNDEFINED'
    );
  };

  return editor;
};

export type CreatePlateEditorOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = WithPlateOptions<V, P> & {
  /**
   * Initial editor to be extended with `withPlate`.
   *
   * @default createEditor()
   */
  editor?: TEditor;
};

/**
 * Creates a fully configured Plate editor with optional customizations.
 *
 * @remarks
 *   This function creates a Plate editor with the following enhancements and
 *   configurations:
 *
 *   1. Editor Initialization:
 *
 *   - Assigns a unique ID to the editor if not already present.
 *   - Extend editor state properties.
 *
 *   2. Plugin System:
 *
 *   - Integrates core plugins and user-provided plugins.
 *   - Creates a root plugin that encapsulates all other plugins.
 *   - Resolves plugins into editor.plugins, editor.pluginList.
 *
 *   3. Content Initialization:
 *
 *   - Sets initial editor content if provided.
 *   - Ensures the editor always has content by using a default factory if empty.
 *
 *   4. Selection Handling:
 *
 *   - Applies initial selection if provided.
 *   - Supports auto-selection at start or end of the document.
 *
 *   5. Normalization:
 *
 *   - Performs initial value normalization.
 *   - Optionally applies full editor normalization.
 *
 *   6. Extensibility:
 *
 *   - Allows for deep customization through plugins and overrides.
 *   - Supports custom editor types and configurations.
 *
 *   The resulting editor is a fully-initialized Plate instance, ready for use
 *   with Plate components and APIs, with all core functionalities and custom
 *   plugins applied.
 * @example
 *   const editor = createPlateEditor({
 *     plugins: [ParagraphPlugin, BoldPlugin],
 *     override: {
 *       components: {
 *         [ParagraphPlugin.key]: CustomParagraphComponent,
 *       },
 *     },
 *   });
 *
 * @template V - The value type.
 * @template P - The plugins type.
 * @see {@link createSlateEditor} for a non-React version of editor creation.
 *  * @see {@link usePlateEditor} for a memoized version, suitable for use in React components.
 *  * @see {@link withPlate} for the underlying function that applies Plate enhancements to an editor.
 *  * @see {@link withSlate} for a non-React version of editor enhancement.
 */
export const createPlateEditor = <
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>({
  editor = createTEditor(),
  ...options
}: CreatePlateEditorOptions<V, P> = {}): TPlateEditor<V, InferPlugins<P[]>> => {
  return withPlate<V, P>(editor, options);
};
