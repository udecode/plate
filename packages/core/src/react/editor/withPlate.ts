import { type TEditor, type Value, createTEditor } from '@udecode/slate';

import type { AnyPlatePlugin } from '../plugin';
import type { TPlateEditor } from './PlateEditor';

import {
  type AnyPluginConfig,
  type BaseWithSlateOptions,
  type CorePlugin,
  type InferPlugins,
  withSlate,
} from '../../lib';
import { getPlateCorePlugins } from './getPlateCorePlugins';

export type WithPlateOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = {
  rootPlugin?: (plugin: AnyPlatePlugin) => AnyPlatePlugin;
} & BaseWithSlateOptions<V, P> &
  Pick<
    Partial<AnyPlatePlugin>,
    | 'api'
    | 'decorate'
    | 'handlers'
    | 'inject'
    | 'normalizeInitialValue'
    | 'options'
    | 'override'
    | 'renderAboveEditable'
    | 'renderAboveSlate'
    | 'renderAfterEditable'
    | 'renderBeforeEditable'
    | 'transforms'
    | 'useHooks'
    | 'withOverrides'
  >;

/**
 * Applies Plate-specific enhancements to an editor instance with ReactPlugin.
 *
 * @see {@link createPlateEditor} for a higher-level React editor creation function.
 * @see {@link usePlateEditor} for a memoized version in React components.
 * @see {@link withSlate} for the non-React version of editor enhancement
 */
export const withPlate = <
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
>(
  e: TEditor,
  { plugins = [], ...options }: WithPlateOptions<V, P> = {}
): TPlateEditor<V, InferPlugins<P[]>> => {
  return withSlate<V, P>(e, {
    ...options,
    plugins: [...getPlateCorePlugins(), ...plugins],
  } as any) as any;
};

export type CreatePlateEditorOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = {
  /**
   * Initial editor to be extended with `withPlate`.
   *
   * @default createEditor()
   */
  editor?: TEditor;
} & WithPlateOptions<V, P>;

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
  P extends AnyPluginConfig = CorePlugin,
>({
  editor = createTEditor(),
  ...options
}: CreatePlateEditorOptions<V, P> = {}): TPlateEditor<V, InferPlugins<P[]>> => {
  return withPlate<V, P>(editor, options);
};
