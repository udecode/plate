import type { Value } from '@platejs/slate';

import type { AnyPlatePlugin } from '../plugin';
import type { EventEditorPlugin, SlateReactExtensionPlugin } from '../plugins';
import type { PlateEditor, TPlateEditor } from './PlateEditor';
import { createPlatePlugin } from '../plugin/createPlatePlugin';
import {
  createCurrentRuntimeEditor,
  type CurrentRuntimeEditor as Editor,
} from '../../internal/currentRuntimeBridge';

import {
  type AnyPluginConfig,
  type BaseWithSlateOptions,
  type CorePlugin,
  getCorePlugins,
  type InferPlugins,
  type WithSlateOptions,
  withSlate,
} from '../../lib';
import {
  createPlateRuntimeEditor,
  type CreatePlateRuntimeEditorOptions,
  type PlateRuntimeEditor,
} from './createPlateRuntimeEditor';
import { createZustandStore } from '../libs/zustand';
import { getPlateCorePlugins } from './getPlateCorePlugins';

export type PlateCorePlugin =
  | CorePlugin
  | typeof EventEditorPlugin
  | typeof SlateReactExtensionPlugin;

export type WithPlateOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = BaseWithSlateOptions<P> &
  Pick<
    Partial<AnyPlatePlugin>,
    | 'api'
    | 'decorate'
    | 'extendEditor'
    | 'handlers'
    | 'inject'
    | 'transformInitialValue'
    | 'normalizeInitialValue'
    | 'options'
    | 'override'
    | 'priority'
    | 'render'
    | 'shortcuts'
    | 'useHooks'
  > & {
    // override?: {
    //   /** Enable or disable plugins */
    //   enabled?: Partial<Record<KeyofPlugins<InferPlugins<P[]>>, boolean>>;
    //   plugins?: Partial<
    //     Record<
    //       KeyofPlugins<InferPlugins<P[]>>,
    //       Partial<EditorPlatePlugin<AnyPluginConfig>>
    //     >
    //   >;
    // };
    value?: ((editor: PlateEditor) => Promise<V> | V) | V | string;
    rootPlugin?: (plugin: AnyPlatePlugin) => AnyPlatePlugin;
    onReady?: (ctx: {
      editor: PlateEditor;
      isAsync: boolean;
      value: V;
    }) => void;
  };

/**
 * Applies Plate enhancements to an editor instance (React version).
 *
 * @remarks
 *   This function supports React-specific features including component rendering,
 *   event handlers, and React hooks integration.
 * @see {@link createPlateEditor} for a higher-level React editor creation function.
 * @see {@link usePlateEditor} for a memoized version in React components.
 * @see {@link withSlate} for the non-React version of editor enhancement.
 */
export const withPlate = <
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>(
  e: Editor,
  options: WithPlateOptions<V, P> = {}
): TPlateEditor<V, InferPlugins<P[]>> => {
  const {
    navigationFeedback,
    optionsStoreFactory,
    plugins = [],
    ...rest
  } = options;

  const editor = withSlate<V, PlateCorePlugin | P>(e, {
    navigationFeedback,
    ...rest,
    optionsStoreFactory: optionsStoreFactory ?? createZustandStore,
    plugins: [...getPlateCorePlugins({ navigationFeedback }), ...plugins],
  } as WithSlateOptions<V, PlateCorePlugin | P>) as unknown as TPlateEditor<
    V,
    InferPlugins<P[]>
  >;

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
  editor?: Editor;
  runtime: 'legacy';
};

export type CreatePlateEditorRuntimeOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = Pick<
  BaseWithSlateOptions<P>,
  | 'affinity'
  | 'chunking'
  | 'components'
  | 'id'
  | 'maxLength'
  | 'navigationFeedback'
  | 'nodeId'
  | 'plugins'
  | 'readOnly'
  | 'selection'
  | 'shouldNormalizeEditor'
  | 'userId'
> & {
  autoSelect?: boolean | 'end' | 'start';
  decorate?: AnyPlatePlugin['decorate'];
  handlers?: PlateRuntimeRootHandlers;
  inject?: AnyPlatePlugin['inject'];
  onReady?: (ctx: {
    editor: RuntimePlateEditor<V, P>;
    isAsync: false;
    value: V;
  }) => void;
  optionsStoreFactory?: CreatePlateRuntimeEditorOptions<
    V,
    readonly [],
    InferPlugins<P[]>
  >['optionsStoreFactory'];
  options?: AnyPlatePlugin['options'];
  override?: AnyPlatePlugin['override'];
  render?: AnyPlatePlugin['render'];
  rootPlugin?: (plugin: AnyPlatePlugin) => AnyPlatePlugin;
  runtime?: 'slate-v2';
  shortcuts?: AnyPlatePlugin['shortcuts'];
  transformInitialValue?: AnyPlatePlugin['transformInitialValue'];
  useHooks?: AnyPlatePlugin['useHooks'];
  value?: V | null;
};

type RuntimePlateEditor<
  V extends Value,
  P extends AnyPluginConfig,
> = PlateRuntimeEditor<V, readonly [], InferPlugins<P[]>>;

type PlateRuntimeRootHandlers = Pick<
  NonNullable<AnyPlatePlugin['handlers']>,
  'onChange' | 'onKeyDown' | 'onNodeChange' | 'onTextChange'
>;

const unsupportedPlateRuntimeOptionKeys = [
  'api',
  'editor',
  'extendEditor',
  'normalizeInitialValue',
  'priority',
  'skipInitialization',
] as const;

const assertSupportedPlateRuntimeOptions = (
  options: Record<string, unknown>
) => {
  const unsupportedKeys = unsupportedPlateRuntimeOptionKeys.filter(
    (key) => options[key] !== undefined
  );

  if (unsupportedKeys.length > 0) {
    throw new Error(
      `[Plate] createPlateEditor({ runtime: 'slate-v2' }) does not support these options yet: ${unsupportedKeys.join(', ')}.`
    );
  }

  if (
    typeof options.value === 'function' ||
    typeof options.value === 'string'
  ) {
    throw new Error(
      "[Plate] createPlateEditor({ runtime: 'slate-v2' }) currently accepts only array values or null."
    );
  }
};

const createPlateRuntimePluginList = <
  V extends Value,
  P extends AnyPluginConfig,
>({
  affinity = true,
  chunking = true,
  components,
  decorate,
  handlers,
  inject,
  maxLength,
  navigationFeedback,
  nodeId,
  options,
  override,
  plugins = [],
  render,
  rootPlugin,
  shortcuts,
  transformInitialValue,
  useHooks,
}: CreatePlateEditorRuntimeOptions<V, P>): unknown[] => {
  const pluginList = [
    ...getPlateCorePlugins({ navigationFeedback }),
    ...plugins,
  ];
  const corePlugins = getCorePlugins({
    affinity,
    chunking,
    maxLength,
    navigationFeedback,
    nodeId,
    plugins: pluginList,
  });
  let rootPluginInstance =
    components ||
    decorate ||
    handlers ||
    inject ||
    options ||
    override ||
    render ||
    rootPlugin ||
    shortcuts ||
    transformInitialValue ||
    useHooks
      ? createPlatePlugin({
          decorate,
          handlers,
          inject,
          key: 'root',
          options,
          override:
            components || override
              ? {
                  ...override,
                  components: {
                    ...components,
                    ...override?.components,
                  },
                }
              : undefined,
          plugins: [...corePlugins, ...pluginList],
          priority: 10_000,
          render,
          shortcuts,
          transformInitialValue,
          useHooks,
        })
      : null;

  if (rootPluginInstance && rootPlugin) {
    rootPluginInstance = rootPlugin(rootPluginInstance);
  }

  return rootPluginInstance
    ? [rootPluginInstance]
    : [...corePlugins, ...pluginList];
};

const applyPlateRuntimeInitializationOptions = <
  V extends Value,
  P extends AnyPluginConfig,
>(
  editor: RuntimePlateEditor<V, P>,
  {
    autoSelect,
    onReady,
    selection,
    shouldNormalizeEditor,
  }: Pick<
    CreatePlateEditorRuntimeOptions<V, P>,
    'autoSelect' | 'onReady' | 'selection' | 'shouldNormalizeEditor'
  >
) => {
  if (!selection && autoSelect) {
    const edge = autoSelect === true ? 'end' : autoSelect;
    const point = editor.read((state) =>
      edge === 'start' ? state.points.start([]) : state.points.end([])
    );

    editor.update(
      (tx) => {
        tx.selection.set({ anchor: point, focus: point });
      },
      { metadata: { history: { mode: 'skip' } } }
    );
  }

  if (shouldNormalizeEditor) {
    editor.update(
      (tx) => {
        tx.normalize({ force: true });
      },
      { metadata: { history: { mode: 'skip' } } }
    );
  }

  onReady?.({
    editor,
    isAsync: false,
    value: editor.read((state) => state.value.root()) as V,
  });
};

/**
 * Creates a Plate editor (React version).
 *
 * This function creates a fully configured Plate editor instance with
 * React-specific enhancements including component rendering, event handlers,
 * and hooks integration. It applies all specified plugins and configurations to
 * create a functional editor.
 *
 * Examples:
 *
 * ```ts
 * const editor = createPlateEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   value: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom components
 * const editor = createPlateEditor({
 *   plugins: [ParagraphPlugin.withComponent(ParagraphElement)],
 *   components: { [CodePlugin.key]: CodeLeaf },
 * });
 *
 * // Editor with React-specific options
 * const editor = createPlateEditor({
 *   plugins: [ParagraphPlugin],
 *   handlers: { onKeyDown: customKeyHandler },
 * });
 * ```
 *
 * @see {@link createSlateEditor} for a non-React version of editor creation.
 * @see {@link usePlateEditor} for a memoized version in React components.
 * @see {@link withPlate} for the underlying function that applies Plate enhancements to an editor.
 */
export function createPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>(options?: CreatePlateEditorRuntimeOptions<V, P>): RuntimePlateEditor<V, P>;

export function createPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>(options: CreatePlateEditorOptions<V, P>): TPlateEditor<V, InferPlugins<P[]>>;

export function createPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>(
  options:
    | CreatePlateEditorOptions<V, P>
    | CreatePlateEditorRuntimeOptions<V, P> = {}
): RuntimePlateEditor<V, P> | TPlateEditor<V, InferPlugins<P[]>> {
  if (options.runtime !== 'legacy') {
    assertSupportedPlateRuntimeOptions(options as Record<string, unknown>);

    const { id, optionsStoreFactory, readOnly, selection, userId, value } =
      options;

    const editor = createPlateRuntimeEditor<V, readonly [], InferPlugins<P[]>>({
      id,
      initialSelection: selection,
      initialValue: value ?? undefined,
      optionsStoreFactory,
      plugins: createPlateRuntimePluginList(
        options
      ) as CreatePlateRuntimeEditorOptions<
        V,
        readonly [],
        InferPlugins<P[]>
      >['plugins'],
      readOnly,
      userId,
    });

    applyPlateRuntimeInitializationOptions(editor, options);

    return editor;
  }

  const {
    editor = createCurrentRuntimeEditor(),
    runtime: _runtime,
    ...legacyOptions
  } = options;

  return withPlate<V, P>(editor, legacyOptions);
}
