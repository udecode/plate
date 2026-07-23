import type React from 'react';

import type {
  DecoratedRange,
  Descendant,
  Element,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  EditorInstalledApiGroups,
  EditorInstalledStateGroups,
  EditorInstalledTxGroups,
  EditorExtension,
  NodeEntry,
  Path,
  Text,
  Value,
} from '@platejs/plite';
import type {
  HotkeysEvent,
  HotkeysOptions,
  Keys,
} from '@udecode/react-hotkeys';
import type { AnyObject, Deep2Partial, Nullable } from '@udecode/utils';

import type {
  AnyPluginConfig,
  AnyBasePlugin,
  BaseDeserializer,
  BaseHtmlDeserializer,
  BaseInjectProps,
  PluginBase,
  PluginBaseContext,
  BaseSerializer,
  BaseTransformOptions,
  EditableProps,
  AnyPluginTx,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  HandlerReturnType,
  InferApi,
  InferDependencies,
  InferNestedPlugins,
  InferOptions,
  InferPluginBehaviorConfig,
  InferPluginApi,
  InferPluginSchemaModel,
  InferPluginTx,
  InferSelectors,
  InferState,
  InferTx,
  InferTxGroup,
  MatchRules,
  NodeComponent,
  NodeComponents,
  Parser,
  PlatePluginTxGroup,
  PlatePluginTxGroups,
  PluginTx,
  PluginConfig,
  PluginReference,
  PluginSchema,
  PluginSchemaModel,
  PluginShortcutInput,
  BasePlugin,
  BasePluginConfig,
  WithAnyKey,
} from '../../lib';
import type {
  InputRulesConfig,
  InputRulesDefinition,
} from '../../lib/plugins/input-rules/types';
import type { PlateElementProps, PlateLeafProps } from '../components';
import type { PlateEditor } from '../editor/PlateEditor';
import type { DOMHandlers } from './DOMHandlers';

export type AnyEditorPlatePlugin = EditorPlatePlugin<AnyPluginConfig>;

export type AnyPlatePlugin = PlatePlugin<AnyPluginConfig>;

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & { entry: NodeEntry }
) => DecoratedRange[] | undefined;

export type Deserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseDeserializer & {
    parse?: (
      options: PlatePluginContext<C> & { element: any }
    ) => Partial<Descendant> | undefined | void;
    query?: (options: PlatePluginContext<C> & { element: any }) => boolean;
  };

export type EditableSiblingComponent = (
  editableProps: EditableProps
) => React.ReactElement<any> | null;

// -----------------------------------------------------------------------------

export type EditorPlatePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  PlatePlugin<C>,
  keyof PlatePluginMethods
>;

export type ExtendEditorApi<
  C extends AnyPluginConfig = PluginConfig,
  EA = {},
> = (ctx: PlatePluginContext<C>) => EA & Deep2Partial<InferApi<C>>;

export type PlateEditorExtension = Omit<EditorExtension<any, any>, 'name'> & {
  key?: string;
  name?: string;
};

export type PlateEditorExtensionInput =
  | PlateEditorExtension
  | readonly PlateEditorExtension[];

type ExtensionInputFromArgument<TExtension> = TExtension extends (
  ...args: any[]
) => infer TResult
  ? NonNullable<TResult>
  : TExtension;

type ExtensionTuple<TExtension> = TExtension extends readonly unknown[]
  ? TExtension
  : readonly [TExtension];

type ExtensionItemWithImplicitName<TExtension> = TExtension extends object
  ? TExtension extends { name: infer TName }
    ? TExtension & { name: TName }
    : TExtension & { name: string }
  : TExtension;

type ExtensionInputWithImplicitNames<TExtension> =
  ExtensionInputFromArgument<TExtension> extends infer TInput
    ? TInput extends readonly unknown[]
      ? { [K in keyof TInput]: ExtensionItemWithImplicitName<TInput[K]> }
      : ExtensionItemWithImplicitName<TInput>
    : never;

type ExtensionApiFromArgument<TExtension> = EditorInstalledApiGroups<
  ExtensionTuple<ExtensionInputWithImplicitNames<TExtension>>
>;

type ExtensionStateFromArgument<TExtension> = EditorInstalledStateGroups<
  Value,
  ExtensionTuple<ExtensionInputWithImplicitNames<TExtension>>
>;

type ExtensionTxFromArgument<TExtension> = EditorInstalledTxGroups<
  Value,
  ExtensionTuple<ExtensionInputWithImplicitNames<TExtension>>
>;

export type ExtendPlateEditorExtension<
  C extends AnyPluginConfig = PluginConfig,
> = (
  ctx: PlatePluginContext<InferPluginBehaviorConfig<C>>
) => PlateEditorExtensionInput | undefined;

export type HtmlDeserializer<C extends AnyPluginConfig = PluginConfig> =
  BaseHtmlDeserializer & {
    parse?: (
      options: PlatePluginContext<C> & {
        element: HTMLElement;
        node: AnyObject;
      }
    ) => Partial<Descendant> | undefined | void;
    query?: (
      options: PlatePluginContext<C> & { element: HTMLElement }
    ) => boolean;
  };

export type HtmlReactSerializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: React.FC<PlateElementProps<Element, C> & PlateLeafProps<Text, C>>;
  query?: (options: PlateElementProps) => boolean;
};

// -----------------------------------------------------------------------------

export type HtmlSerializer<C extends AnyPluginConfig = PluginConfig> = {
  parse?: (options: PlatePluginContext<C> & { node: Descendant }) => string;
  query?: (options: PlatePluginContext<C> & { node: Descendant }) => boolean;
};

export type InferConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends PlatePlugin<infer C> | BasePlugin<infer C>
    ? C
    : P extends AnyPluginConfig
      ? P
      : PluginConfig;

/** Properties used by Plate to inject props into any {@link NodeComponent}. */
export type InjectNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BaseInjectProps & {
    /** Whether to inject the props. If true, overrides all other checks. */
    query?: (
      options: NonNullable<NonNullable<InjectNodeProps>> &
        PlatePluginContext<C> & {
          nodeProps: GetInjectNodePropsOptions;
        }
    ) => boolean;
    /**
     * Transform the className.
     *
     * @default clsx(className, classNames[value])
     */
    transformClassName?: (options: TransformOptions<C>) => any;
    /**
     * Transform the node value for the style or className.
     *
     * @default nodeValue
     */
    transformNodeValue?: (options: TransformOptions<C>) => any;
    /** Transform the injected props. */
    transformProps?: (
      options: TransformOptions<C> & {
        props: GetInjectNodePropsReturnType;
      }
    ) => AnyObject | undefined;
    /**
     * Transform the style.
     *
     * @default { ...style, [styleKey]: value }
     */
    transformStyle?: (options: TransformOptions<C>) => CSSStyleDeclaration;
  };

// -----------------------------------------------------------------------------

export type LeafNodeProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: PlateLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

/**
 * Property used by Plate to override node `component` props. If function, its
 * returning value will be shallow merged to the old props, with the old props
 * as parameter. If object, its value will be shallow merged to the old props.
 */
export type NodeProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: PlateElementProps<Element, C> & PlateLeafProps<Text, C>
    ) => AnyObject | undefined)
  | AnyObject;

export type TransformInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & { value: Value }
) => Value;

// -----------------------------------------------------------------------------

/**
 * Function called whenever a canonical node change occurs. Return `true`
 * to prevent calling the next plugin handler.
 */
export type OnNodeChange<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & Omit<EditorNodeChangeContext, 'editor'>
) => HandlerReturnType;

/**
 * Function called whenever a canonical text change occurs. Return `true`
 * to prevent calling the next plugin handler.
 */
export type OnTextChange<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C> & Omit<EditorTextChangeContext, 'editor'>
) => HandlerReturnType;

/**
 * Used by parser plugins like html to deserialize inserted data to a Plite
 * fragment. The fragment will be inserted to the editor if not empty.
 */
// -----------------------------------------------------------------------------

/** The `PlatePlugin` interface is a React interface for all plugins. */
export type PlatePlugin<C extends AnyPluginConfig = PluginConfig> =
  PluginBase<C> &
    Nullable<{
      /** @see {@link Decorate} */
      decorate?: Decorate<WithAnyKey<C>>;
      /** Transform the initial value before the editor is ready. */
      transformInitialValue?: TransformInitialValue<WithAnyKey<C>>;
      /** @see {@link UseHooks} */
      useHooks?: UseHooks<WithAnyKey<C>>;
    }> &
    PlatePluginMethods<C> & {
      /**
       * Handlers called whenever the corresponding event occurs in the editor.
       * Event handlers can return a boolean flag to specify whether the event
       * can be treated as being handled. If it returns `true`, the next
       * handlers will not be called.
       */
      handlers: Nullable<
        DOMHandlers<WithAnyKey<C>> & {
          /** @see {@link OnNodeChange} */
          onNodeChange?: OnNodeChange<WithAnyKey<C>>;
          /** @see {@link OnTextChange} */
          onTextChange?: OnTextChange<WithAnyKey<C>>;
        }
      >;
      /** Plugin injection. */
      inject: Nullable<{
        nodeProps?: InjectNodeProps<WithAnyKey<C>>;
        /**
         * Property that can be used by a plugin to allow other plugins to
         * inject code. For example, if multiple plugins have defined
         * `inject.plugins` for `key=HtmlPlugin.key`,
         * the insert-data pipeline will call all of these `transformData` for
         * `HtmlPlugin.key` plugin. Differs from `override.plugins` as this is
         * not overriding any plugin.
         */
        plugins?: Record<string, Partial<EditorPlatePlugin<AnyPluginConfig>>>;
        /**
         * A function that returns a plugin config to be injected into other
         * plugins `inject.plugins` specified by `targetPluginKeys`.
         */
        targetPluginToInject?: (
          ctx: PlatePluginContext<C> & { targetPlugin: string }
        ) => Partial<PlatePlugin<AnyPluginConfig>>;
      }>;
      override: {
        /** Replace plugin {@link NodeComponent} by key. */
        components?: NodeComponents;
        /** Extend {@link PlatePlugin} by key. */
        plugins?: Record<string, Partial<EditorPlatePlugin<AnyPluginConfig>>>;
      };
      /** @see {@link Parser} */
      parser: Nullable<Parser<WithAnyKey<C>>>;
      parsers:
        | (Record<
            string,
            {
              /** @see {@link Deserializer} */
              deserializer?: Deserializer<WithAnyKey<C>>;
              /** @see {@link Serializer} */
              serializer?: Serializer<WithAnyKey<C>>;
            }
          > & { html?: never; htmlReact?: never })
        | {
            html?: Nullable<{
              /** @see {@link HtmlDeserializer} */
              deserializer?: HtmlDeserializer<WithAnyKey<C>>;
              /** @see {@link HtmlSerializer} */
              serializer?: HtmlSerializer<WithAnyKey<C>>;
            }>;
            htmlReact?: Nullable<{
              /** Function to deserialize HTML to Plite nodes using React. */
              serializer?: HtmlReactSerializer<WithAnyKey<C>>;
            }>;
          };
      /**
       * Recursive plugin support to allow having multiple plugins in a single
       * plugin. Plate eventually flattens all the plugins into the editor.
       */
      plugins: any[];
      render: Nullable<{
        /**
         * When other plugins' node components are rendered, this function can
         * return an optional wrapper function that turns a node's props to a
         * wrapper React node as its parent. Useful for wrapping or decorating
         * nodes with additional UI elements.
         *
         * NOTE: The function can run React hooks. NOTE: Do not run React hooks
         * in the wrapper function. It is not equivalent to a React component.
         */
        aboveNodes?: RenderNodeWrapper<WithAnyKey<C>>;
        /** Renders a component after the `Container` component. */
        afterContainer?: EditableSiblingComponent;
        /**
         * Renders a component after the `Editable` component. This is the last
         * render position within the editor structure.
         */
        afterEditable?: EditableSiblingComponent;
        /** Renders a component before the `Container` component. */
        beforeContainer?: EditableSiblingComponent;
        /** Renders a component before the `Editable` component. */
        beforeEditable?: EditableSiblingComponent;
        /**
         * When other plugins' node components are rendered, this function can
         * return an optional wrapper function that turns a node's props to a
         * wrapper React node. The wrapper node is the node's child and its
         * original children's parent. Useful for wrapping or decorating nodes
         * with additional UI elements.
         *
         * NOTE: The function can run React hooks. NOTE: Do not run React hooks
         * in the wrapper function. It is not equivalent to a React component.
         */
        belowNodes?: RenderNodeWrapper<WithAnyKey<C>>;
        /**
         * Function to render content below the root element but above its
         * children. Similar to belowNodes but renders directly in the element
         * rather than wrapping. Multiple plugins can provide this, and all
         * their content will be rendered in sequence.
         */
        belowRootNodes?: (
          props: PlateElementProps<Element, C>
        ) => React.ReactNode;
        /** Override `data-plite-leaf` element attributes. */
        leafProps?: LeafNodeProps<WithAnyKey<C>>;
        /** Override rendered element/text/leaf attributes. */
        nodeProps?: NodeProps<WithAnyKey<C>>;
        /** Override `data-plite-node="text"` element attributes. */
        textProps?: TextNodeProps<WithAnyKey<C>>;
      }>;
      rules: {
        /**
         * Function to determine if this plugin's rules should apply to a node.
         * Used to override behavior based on node properties beyond just type
         * matching.
         *
         * Example: List plugin sets `match: ({ node }) => !!node.listStyleType`
         * to override paragraph behavior when the paragraph is a list item.
         *
         * @default type === node.type
         */
        match?: (
          options: {
            node: Element;
            path: Path;
            rule: MatchRules;
          } & PlatePluginContext<C>
        ) => boolean;
      };
      /**
       * Keyboard shortcuts configuration mapping shortcut names to their key
       * combinations and handlers. Each shortcut can link to a public update
       * command, an API method, or use a custom handler function.
       */
      shortcuts: Record<string, Shortcut | null | undefined>;
      inputRules: InputRulesDefinition | InputRulesConfig;
      tx: PlatePluginTxGroups;
    };

/** @internal Nameable boundary for downstream declaration emit. */
export type ExtendedPlatePluginWithExtension<
  C extends AnyPluginConfig,
  TExtensionApi,
  TExtensionTx,
  TExtensionState,
> = PlatePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C> & TExtensionApi,
    InferTx<C> & TExtensionTx,
    InferSelectors<C>,
    InferState<C> & TExtensionState,
    InferDependencies<C>,
    InferNestedPlugins<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>
  >
>;

export type PlatePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  D extends readonly unknown[] = readonly [],
  EO = {},
  EA = {},
  ES = {},
  P extends readonly unknown[] = readonly PluginReference[],
  SchemaModel = never,
  PluginApi = {},
> = Partial<
  Omit<
    PlatePlugin<PluginConfig<K, O, A, Tx, S, {}, D, P, SchemaModel, PluginApi>>,
    keyof PlatePluginMethods | 'api' | 'options' | 'schema'
  > & {
    api: EA;
    options: Partial<O> & EO;
    schema: PluginSchema<
      PluginConfig<K, O, A, Tx, S, {}, D, P, SchemaModel, PluginApi>
    > | null;
    selectors: ES;
  }
>;

export type PlatePluginContext<
  C extends AnyPluginConfig = PluginConfig,
  E extends PlateEditor<any, C> = PlateEditor<any, C>,
> = PluginBaseContext<C> & {
  editor: E;
  plugin: EditorPlatePlugin<C>;
};

export type PlateExtendTx<
  C extends AnyPluginConfig = PluginConfig,
  TGroup extends PlatePluginTxGroup<object, C> = PlatePluginTxGroup<object, C>,
> = (ctx: PlatePluginContext<C>) => TGroup;

export type PlateExtendTxGroups<
  C extends AnyPluginConfig = PluginConfig,
  ETx extends PlatePluginTxGroups = PlatePluginTxGroups,
> = (ctx: PlatePluginContext<C>) => ETx;

type OwnPluginTx<C extends AnyPluginConfig> =
  InferPluginTx<C> extends object ? InferPluginTx<C> : never;

type HasOwnPluginTx<C extends AnyPluginConfig> = [OwnPluginTx<C>] extends [
  never,
]
  ? false
  : keyof OwnPluginTx<C> extends never
    ? false
    : true;

type ResolvedPlatePluginTxGroup<
  C extends AnyPluginConfig,
  K extends string,
  TGroup extends PlatePluginTxGroup<any, any>,
> = K extends keyof InferTx<C>
  ? PlatePluginTxGroup<Extract<InferTx<C>[K], object>, C>
  : TGroup;

type InferPlatePluginInputConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends PlatePlugin<infer C>
    ? C
    : P extends BasePlugin<infer C>
      ? C
      : InferConfig<P>;

type PluginMethodConfig<P, EO = {}, EA = {}, ES = {}> = BasePluginConfig<
  any,
  InferOptions<InferPlatePluginInputConfig<P>>,
  InferApi<InferPlatePluginInputConfig<P>>,
  InferTx<InferPlatePluginInputConfig<P>>,
  InferSelectors<InferPlatePluginInputConfig<P>>,
  InferState<InferPlatePluginInputConfig<P>>,
  InferDependencies<InferPlatePluginInputConfig<P>>,
  EO,
  EA,
  ES,
  InferNestedPlugins<InferPlatePluginInputConfig<P>>,
  InferPluginSchemaModel<InferPlatePluginInputConfig<P>>,
  InferPluginApi<InferPlatePluginInputConfig<P>>
>;

type RuntimePlatePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
> = Omit<
  PlatePluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferDependencies<C>,
    EO,
    EA,
    ES,
    InferNestedPlugins<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>
  >,
  'host' | 'parser' | 'parsers' | 'plugins' | 'render' | 'schema' | 'type'
> & {
  plugins?: readonly AnyBasePlugin[];
  render?: Omit<NonNullable<PlatePlugin<C>['render']>, 'isDecoration'> | null;
};

type ContextualPlatePluginConfig<C extends AnyPluginConfig> = Pick<
  RuntimePlatePluginConfig<C>,
  'handlers' | 'options' | 'render' | 'shortcuts'
>;

type PlateShortcutRecord = Record<string, Shortcut | null | undefined>;

type WithValidatedPlateShortcuts<
  C extends AnyPluginConfig,
  TConfig,
  TShortcuts extends PlateShortcutRecord,
> = Omit<TConfig, 'shortcuts'> & {
  shortcuts?: PluginShortcutInput<C, TShortcuts, Shortcut>;
};

/** Plugin descriptor returned by `extend`, with its inferred additions merged. */
export type ExtendedPlatePlugin<
  C extends AnyPluginConfig,
  EO,
  EA,
  ES,
> = PlatePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferNestedPlugins<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>
  >
>;

type PlatePluginAuthoringMethod =
  | 'clone'
  | 'configure'
  | 'configurePlugin'
  | 'extend'
  | 'extendApi'
  | 'extendEditorApi'
  | 'extendExtension'
  | 'extendPlugin'
  | 'extendSelectors'
  | 'extendTx'
  | 'extendTxGroup'
  | 'withComponent';

type TerminalPlatePluginAuthoringMethods = {
  [K in PlatePluginAuthoringMethod]: never;
};

/** Plate plugin descriptor after its single consumer configuration. */
export type ConfiguredPlatePlugin<C extends AnyPluginConfig = PluginConfig> =
  PlatePlugin<C> &
    TerminalPlatePluginAuthoringMethods & {
      /** @internal Prevents authoring after consumer configuration. */
      readonly __configured: true;
    };

type ConfiguredPlatePluginType<
  C extends AnyPluginConfig,
  TType extends string,
> = ConfiguredPlatePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferNestedPlugins<C>,
    [InferPluginSchemaModel<C>] extends [never]
      ? PluginSchemaModel<TType, null>
      : InferPluginSchemaModel<C> extends PluginSchemaModel<
            string,
            infer TSchema
          >
        ? PluginSchemaModel<TType, TSchema>
        : PluginSchemaModel<TType, null>,
    InferPluginApi<C>
  >
>;

export type PlatePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __configurationLayers: BasePlugin<C>['__configurationLayers'];
  /** @internal Root editor API declarations carried by this descriptor. */
  __editorApi: BasePlugin<C>['__editorApi'];
  __editorExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __extensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __selectorExtensions: ((ctx: PlatePluginContext<AnyPluginConfig>) => any)[];
  __txExtensions: PlateExtendTxGroups<AnyPluginConfig>[];
  clone: () => PlatePlugin<C>;
  /**
   * Applies this descriptor's single terminal consumer configuration.
   *
   * Declare reusable behavior with `extend*` before this call. Contextual
   * callbacks can override existing options, handlers, renderers, and
   * shortcuts without widening the plugin contract. Extensions read the
   * configured values, while this configuration remains the final override.
   */
  configure<const TShortcuts extends PlateShortcutRecord = {}>(
    config: (
      ctx: PlatePluginContext<C>
    ) => WithValidatedPlateShortcuts<
      C,
      ContextualPlatePluginConfig<C>,
      TShortcuts
    >
  ): ConfiguredPlatePlugin<C>;
  configure<
    const TType extends string,
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    config: WithValidatedPlateShortcuts<
      C,
      PlatePluginConfig<
        C['key'],
        InferOptions<C>,
        InferApi<C>,
        InferTx<C>,
        InferSelectors<C>,
        InferDependencies<C>,
        {},
        {},
        {},
        InferNestedPlugins<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>
      > & { type: TType },
      TShortcuts
    >
  ): ConfiguredPlatePluginType<C, TType>;
  configure<
    const TShortcuts extends PlateShortcutRecord = {},
    const TConfiguration extends PlatePluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      InferSelectors<C>,
      InferDependencies<C>,
      {},
      {},
      {},
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    > = PlatePluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      InferSelectors<C>,
      InferDependencies<C>,
      {},
      {},
      {},
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >,
  >(
    config: WithValidatedPlateShortcuts<C, TConfiguration, TShortcuts>
  ): TConfiguration extends Readonly<{
    type: infer TType extends string;
  }>
    ? ConfiguredPlatePluginType<C, TType>
    : ConfiguredPlatePlugin<C>;
  configurePlugin: <P extends AnyPlatePlugin | AnyBasePlugin | { key: string }>(
    plugin: P,
    config: PluginMethodConfig<P>
  ) => PlatePlugin<C>;
  extend<
    EO = {},
    EA = {},
    ES = {},
    const TShortcuts extends PlateShortcutRecord = {},
  >(
    extendConfig:
      | ((
          ctx: PlatePluginContext<C>
        ) => WithValidatedPlateShortcuts<
          C,
          RuntimePlatePluginConfig<C, EO, EA, ES>,
          TShortcuts
        >)
      | WithValidatedPlateShortcuts<
          PluginConfig<
            C['key'],
            InferOptions<C>,
            EA & InferApi<C>,
            InferTx<C>,
            InferSelectors<C>,
            InferState<C>,
            InferDependencies<C>,
            InferNestedPlugins<C>,
            InferPluginSchemaModel<C>,
            InferPluginApi<C>
          >,
          PlatePluginConfig<
            C['key'],
            InferOptions<C>,
            InferApi<C>,
            InferTx<C>,
            InferSelectors<C>,
            InferDependencies<C>,
            EO,
            EA,
            ES,
            InferNestedPlugins<C>,
            InferPluginSchemaModel<C>,
            InferPluginApi<C>
          >,
          TShortcuts
        >
  ): ExtendedPlatePlugin<C, EO, EA, ES>;
  extendApi: <
    EA extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: PlatePluginContext<C>) => EA
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C> & EA
    >
  >;
  /**
   * Extends the plugin's API with new methods or nested objects.
   *
   * This method allows you to add new functionality to the plugin's API or
   * extend existing ones. You can add top-level methods, nested objects with
   * methods, or extend existing nested objects. The types of existing methods
   * and nested objects are preserved, while new ones are inferred.
   *
   * @remarks
   *   - New methods can be added at the top level or within nested objects.
   *   - Existing methods can be overridden, but their parameter and return types
   *       must match the original.
   *   - When extending nested objects, you don't need to specify all existing
   *       properties; they will be preserved.
   *   - Only one level of nesting is supported for API objects.
   *
   * @example
   *   ```typescript
   *   const extendedPlugin = basePlugin.extendEditorApi(({ plugin }) => ({
   *     newMethod: (param: string) => param.length,
   *     existingMethod: (n) => n * 2, // Must match original signature
   *     nested: {
   *       newNestedMethod: () => 'new nested method',
   *     },
   *   }));
   *   ```;
   *
   * @template EA - The type of the extended API, inferred from the returned
   *   object.
   * @param extendedApi - A function that returns an object with the new or
   *   extended API methods.
   * @returns A new instance of the plugin with the extended API.
   */
  extendEditorApi: <
    EA extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: ExtendEditorApi<C, EA>
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      {
        [TApiKey in keyof (EA & InferApi<C>)]: (EA &
          InferApi<C>)[TApiKey] extends (...args: any[]) => any
          ? (EA & InferApi<C>)[TApiKey]
          : {
              [TMethodKey in keyof (EA & InferApi<C>)[TApiKey]]: (EA &
                InferApi<C>)[TApiKey][TMethodKey];
            };
      },
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >
  >;
  extendExtension: {
    <const TExtension>(
      extension: TExtension &
        (ExtendPlateEditorExtension<C> | PlateEditorExtensionInput)
    ): ExtendedPlatePluginWithExtension<
      C,
      ExtensionApiFromArgument<TExtension>,
      ExtensionTxFromArgument<TExtension>,
      ExtensionStateFromArgument<TExtension>
    >;
    <const TKey extends string, const TExtension>(
      key: TKey,
      extension: TExtension &
        (ExtendPlateEditorExtension<C> | PlateEditorExtensionInput)
    ): ExtendedPlatePluginWithExtension<
      C,
      ExtensionApiFromArgument<TExtension>,
      ExtensionTxFromArgument<TExtension>,
      ExtensionStateFromArgument<TExtension>
    >;
  };
  extendPlugin: <
    P extends AnyPlatePlugin | AnyBasePlugin | { key: string },
    EO = {},
    EA = {},
    ES = {},
  >(
    plugin: P,
    extendConfig: PluginMethodConfig<P, EO, EA, ES>
  ) => PlatePlugin<C>;
  extendSelectors: <
    ES extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: PlatePluginContext<C>) => ES
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      ES & InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >
  >;
  extendTx: {
    (
      extension: HasOwnPluginTx<C> extends true
        ? PlateExtendTx<C, PlatePluginTxGroup<OwnPluginTx<C>, C>>
        : never
    ): PlatePlugin<C>;
    <TGroup extends object>(
      extension: PlateExtendTx<C, PlatePluginTxGroup<TGroup, C>>
    ): PlatePlugin<
      PluginConfig<
        C['key'],
        InferOptions<C>,
        InferApi<C>,
        InferTx<C> & PluginTx<C['key'], TGroup>,
        InferSelectors<C>,
        InferState<C>,
        InferDependencies<C>,
        InferNestedPlugins<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>
      >
    >;
  };
  extendTxGroup: <
    K extends string,
    TGroup extends PlatePluginTxGroup<any, any> = PlatePluginTxGroup,
  >(
    key: K,
    extension: (
      ctx: PlatePluginContext<C>
    ) => ResolvedPlatePluginTxGroup<C, K, TGroup>
  ) => PlatePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C> &
        PluginTx<K, InferTxGroup<ResolvedPlatePluginTxGroup<C, K, TGroup>>>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferNestedPlugins<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>
    >
  >;
  /** Returns a new instance of the plugin with the component. */
  withComponent: (component: NodeComponent) => PlatePlugin<C>;
  __resolved?: boolean;
};

export type PlatePlugins = AnyPlatePlugin[];

export type RenderNodeWrapper<C extends AnyPluginConfig = any> = (
  props: RenderNodeWrapperProps<C>
) => RenderNodeWrapperFunction;

export type RenderNodeWrapperFunction =
  | ((elementProps: PlateElementProps) => React.ReactNode)
  | undefined;

export interface RenderNodeWrapperProps<C extends AnyPluginConfig = any>
  extends PlateElementProps<Element, C> {
  key: string;
}

export type Serializer<C extends AnyPluginConfig = PluginConfig> =
  BaseSerializer & {
    parser?: (options: PlatePluginContext<C> & { node: Descendant }) => any;
    query?: (options: PlatePluginContext<C> & { node: Descendant }) => boolean;
  };

type ShortcutOptions = HotkeysOptions & {
  keys?: Keys | null;
  priority?: number;
};

export type Shortcut = ShortcutOptions &
  (
    | {
        handler: (ctx: {
          editor: PlateEditor;
          event: KeyboardEvent;
          eventDetails: HotkeysEvent;
        }) => boolean | void;
        target?: never;
      }
    | {
        handler?: never;
        /** Disambiguates a command name present in both public namespaces. */
        target?: 'api' | 'update';
      }
  );

export type Shortcuts = Record<string, Shortcut | null | undefined>;

export type TextNodeProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: PlateLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & PlatePluginContext<C>;

/** Hook called when the editor is initialized. */
export type UseHooks<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PlatePluginContext<C>
) => void;
