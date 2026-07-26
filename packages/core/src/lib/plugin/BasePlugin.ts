import type {
  ContentSlice,
  DecoratedRange,
  Descendant,
  Element,
  EditorCommit,
  EditorClipboardMiddlewareMap,
  EditorDocumentValue,
  EditorExtension,
  EditorExtensionApiFactory,
  EditorInstalledApiGroups,
  EditorInstalledStateGroups,
  EditorInstalledTxGroups,
  EditorNodeChangeKind,
  EditorCoreStateView,
  EditorUpdateContext,
  NamedRootKey,
  NodeEntry,
  Path,
  PropertyValueDescriptor,
  PropertyValueOf,
  SchemaElementProperty,
  SchemaProperty,
  SchemaTextProperty,
  Text,
  Value,
} from '@platejs/plite';
import type { TxReadMethod } from '@platejs/plite/internal';
import type { AnyObject, Deep2Partial, Nullable } from '@udecode/utils';

import type {
  PliteElementProps,
  PliteRenderElementProps,
  PliteRenderLeafProps,
  PliteRenderTextProps,
} from '../../static';
import type { BaseEditor } from '../editor';
import type {
  PlatePluginExtensionEditor,
  PlatePluginOwnUpdate,
  PlatePluginReadState,
  PlatePluginTransaction,
} from '../editor/pluginRuntimeTypes';
import type {
  InputRulesConfig,
  InputRulesDefinition,
} from '../plugins/input-rules/types';
import type {
  AnyPluginConfig,
  AnyPluginTx,
  BaseInjectProps,
  PluginBase,
  PluginBaseContext,
  BaseTransformOptions,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  InferApi,
  InferDependencies,
  InferEnabled,
  InferOptions,
  InferPluginBehaviorConfig,
  InferPluginApi,
  InferPluginConfigTree,
  InferExactPluginSchemaContribution,
  InferPluginDocumentType,
  InferPluginTx,
  InferPluginSchemaModel,
  InferSelectors,
  InferState,
  InferTx,
  MatchRules,
  NodeComponent,
  NodeComponents,
  HtmlParserOptions,
  HtmlPluginContext,
  PluginConfig,
  PluginReference,
  PluginSchema,
  PluginSchemaModel,
  WithAnyKey,
} from './PluginConfig';
import { pluginCodecMapDeclaration } from './pluginAuthoringContext';
import type { HandlerReturnType } from './HandlerReturnType';

type ErasedBasePlugin = BasePlugin<any>;
type ErasedPluginInject = Omit<ErasedBasePlugin['inject'], 'nodeProps'> & {
  nodeProps?: any;
};
type ErasedPluginHandlers = {
  onNodeChange?: ((ctx: any) => HandlerReturnType) | null;
  onTextChange?: ((ctx: any) => HandlerReturnType) | null;
};
type ErasedPluginInvariantKey =
  | '__apiExtensions'
  | '__codecExtensions'
  | '__htmlCodecExtensions'
  | '__configurationLayers'
  | '__editorExtensions'
  | '__extensions'
  | '__readExtensions'
  | '__resolved'
  | '__selectorExtensions'
  | '__txExtensions'
  | 'clone'
  | 'configure'
  | 'decorate'
  | 'extend'
  | 'handlers'
  | 'inject'
  | 'options'
  | 'parsers'
  | 'render'
  | 'rules'
  | 'schema'
  | 'transformInitialValue';

/** Type-erased boundary for heterogeneous plugin collections. */
export type AnyBasePlugin = Omit<ErasedBasePlugin, ErasedPluginInvariantKey> & {
  __apiExtensions: ErasedBasePlugin['__apiExtensions'];
  __codecExtensions: ErasedBasePlugin['__codecExtensions'];
  __htmlCodecExtensions: ErasedBasePlugin['__htmlCodecExtensions'];
  __configurationLayers: readonly any[];
  __editorExtensions: ErasedBasePlugin['__editorExtensions'];
  __extensions: ErasedBasePlugin['__extensions'];
  __readExtensions: ErasedBasePlugin['__readExtensions'];
  __resolved?: boolean;
  __selectorExtensions: ErasedBasePlugin['__selectorExtensions'];
  __txExtensions: ErasedBasePlugin['__txExtensions'];
  clone: any;
  configure: any;
  decorate?: any;
  extend: any;
  handlers: ErasedPluginHandlers;
  inject: ErasedPluginInject;
  options: any;
  parsers: any;
  render: any;
  rules: any;
  readonly schema: any;
  transformInitialValue?: any;
};
export type AnyResolvedBasePlugin = Omit<
  ResolvedBasePlugin<AnyPluginConfig>,
  ErasedPluginInvariantKey
> & {
  decorate?: any;
  handlers: ErasedPluginHandlers;
  inject: ErasedPluginInject;
  options: any;
  parsers: any;
  render: any;
  rules: any;
  transformInitialValue?: any;
};

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyPluginConfig = PluginConfig> = (
  ctx: BasePluginContext<C> & { entry: NodeEntry }
) => DecoratedRange[] | undefined;

// -----------------------------------------------------------------------------

export type ResolvedBasePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  BasePlugin<C>,
  keyof BasePluginMethods | 'override'
>;

export type PlateEditorExtension<C extends AnyPluginConfig = PluginConfig> =
  Omit<EditorExtension<any, any>, 'clipboard' | 'name'> & {
    clipboard?: EditorClipboardMiddlewareMap<BaseEditor<Value, C>>;
    key?: string;
    name?: string;
  };

export type PlateEditorExtensionInput<
  C extends AnyPluginConfig = PluginConfig,
> = PlateEditorExtension<C> | readonly PlateEditorExtension<C>[];

type ContextualPlateEditorExtension<C extends AnyPluginConfig = PluginConfig> =
  Omit<
    EditorExtension<PlatePluginExtensionEditor<C>>,
    'api' | 'clipboard' | 'name'
  > & {
    api?:
      | (Record<string, unknown | readonly unknown[]> &
          Deep2Partial<InferApi<C>>)
      | EditorExtensionApiFactory<PlatePluginExtensionEditor<C>>;
    clipboard?: EditorClipboardMiddlewareMap<BaseEditor<Value, C>>;
    key?: string;
    name?: string;
  };

type ContextualPlateEditorExtensionInput<
  C extends AnyPluginConfig = PluginConfig,
> =
  | ContextualPlateEditorExtension<C>
  | readonly ContextualPlateEditorExtension<C>[];

export type AuthoringPlateEditorExtensionInput<
  C extends AnyPluginConfig = PluginConfig,
> = ContextualPlateEditorExtensionInput<C>;

type UnifiedEditorExtensionInput<
  C extends AnyPluginConfig,
  TExtension extends object | readonly object[],
> = TExtension &
  (TExtension extends { api: (...args: any[]) => any }
    ? {}
    : NoInfer<AuthoringPlateEditorExtensionInput<C>>);

/** Context-bound identity helper for extracted editor-extension declarations. */
export type DefineEditorExtension<C extends AnyPluginConfig> = <
  const TExtension extends object | readonly object[],
>(
  extension: UnifiedEditorExtensionInput<C, TExtension>
) => TExtension;

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

type NormalizeExtensionContribution<TContribution> = [TContribution] extends [
  never,
]
  ? {}
  : unknown extends TContribution
    ? {}
    : string extends keyof TContribution
      ? {}
      : TContribution;

type ExtensionApiContribution<TExtension> = [keyof TExtension] extends [never]
  ? {}
  : NormalizeExtensionContribution<ExtensionApiFromArgument<TExtension>>;
type ExtensionStateContribution<TExtension> = [keyof TExtension] extends [never]
  ? {}
  : NormalizeExtensionContribution<ExtensionStateFromArgument<TExtension>>;
type ExtensionTxContribution<TExtension> = [keyof TExtension] extends [never]
  ? {}
  : NormalizeExtensionContribution<ExtensionTxFromArgument<TExtension>>;

export type InferConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends BasePlugin<infer C>
    ? C
    : P extends AnyPluginConfig
      ? P
      : PluginConfig;

export type InjectNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BaseInjectProps & {
    query?: (
      options: NonNullable<NonNullable<InjectNodeProps>> &
        BasePluginContext<C> & { nodeProps: GetInjectNodePropsOptions }
    ) => boolean;
    transformClassName?: (options: TransformOptions<C>) => any;
    transformNodeValue?: (options: TransformOptions<C>) => any;
    transformProps?: (
      options: TransformOptions<C> & { props: GetInjectNodePropsReturnType }
    ) => AnyObject | undefined;
    transformStyle?: (options: TransformOptions<C>) => AnyObject;
  };

export type LeafStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: PliteRenderLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type NodeStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((
      props: PliteRenderElementProps<Element, C> & PliteRenderLeafProps<Text, C>
    ) => AnyObject | undefined)
  | AnyObject;

/**
 * Transforms a complete document input before schema fitting.
 *
 * Runs for editor initialization and every complete
 * `editor.update.value.replace(...)` load. The transform should be
 * deterministic and safe to reapply to canonical documents.
 */
export type TransformInitialValue<C extends AnyPluginConfig = PluginConfig> = (
  ctx: PluginBaseContext<C> & {
    editor: BaseEditor;
    value: EditorDocumentValue;
  }
) => EditorDocumentValue;

export type HtmlParser<C extends AnyPluginConfig = PluginConfig> = {
  query?: (options: HtmlParserOptions & HtmlPluginContext<C>) => boolean;
  transformData?: (options: HtmlParserOptions & HtmlPluginContext<C>) => string;
  transformFragment?: (
    options: HtmlParserOptions &
      HtmlPluginContext<C> & { fragment: readonly Descendant[] }
  ) => readonly Descendant[];
};

export type HtmlMatchValue = string | readonly string[];

type HtmlMatcherFields = {
  attributes?: Readonly<Record<string, true | HtmlMatchValue>>;
  className?: string;
  style?: Readonly<Record<string, '*' | HtmlMatchValue>>;
  tag?: HtmlMatchValue;
};

export type HtmlMatcher = Readonly<
  | (HtmlMatcherFields & {
      attributes: NonNullable<HtmlMatcherFields['attributes']>;
    })
  | (HtmlMatcherFields & { className: string })
  | (HtmlMatcherFields & { style: NonNullable<HtmlMatcherFields['style']> })
  | (HtmlMatcherFields & { tag: HtmlMatchValue })
>;

export type HtmlAttributes = Readonly<
  Record<string, boolean | number | string | null | undefined>
>;

export type HtmlElementPatch = Readonly<{
  attributes?: HtmlAttributes;
  children?: never;
  style?: Readonly<Record<string, number | string | null | undefined>>;
  tag?: never;
}>;

export type HtmlContentToken = Readonly<{
  readonly __htmlContentToken: true;
}>;

export type HtmlWrapperSpec = Readonly<{
  attributes?: HtmlAttributes;
  style?: Readonly<Record<string, number | string | null | undefined>>;
  tag: string;
}>;

export type HtmlNodeSpec = Readonly<{
  attributes?: HtmlAttributes;
  children?:
    | HtmlContentToken
    | readonly (HtmlContentToken | HtmlNodeSpec | Readonly<{ text: string }>)[];
  patchTarget?: true;
  style?: Readonly<Record<string, number | string | null | undefined>>;
  tag: string;
}>;

type HtmlDecodeContext = Readonly<{
  element: Readonly<HTMLElement>;
  state: EditorCoreStateView;
}>;

type HtmlElementDecodeResult<TProperties extends object> = Readonly<
  Partial<TProperties> & {
    children?: readonly Descendant[];
  }
>;

type HtmlElementEncodeContext<TNode extends Element> = Readonly<{
  content: HtmlContentToken;
  node: Readonly<TNode>;
  state: EditorCoreStateView;
}>;

type HtmlPropertyEncodeContext<TNode, TValue> = Readonly<{
  node: Readonly<TNode>;
  state: EditorCoreStateView;
  value: TValue;
}>;

type HtmlPropertiesEncodeContext<TNode, TValues extends object> = Readonly<{
  node: Readonly<TNode>;
  state: EditorCoreStateView;
  values: Readonly<TValues>;
}>;

type HtmlRuleDirections<TDecode, TEncodeContext, TEncodeResult> =
  | Readonly<{
      decode: (context: HtmlDecodeContext) => TDecode | undefined;
      decodeOnly?: never;
      encode: (context: TEncodeContext) => TEncodeResult | null;
    }>
  | Readonly<{
      decode: (context: HtmlDecodeContext) => TDecode | undefined;
      decodeOnly: true;
      encode?: never;
    }>;

type HtmlRuleBase = Readonly<{
  match: readonly [HtmlMatcher, ...HtmlMatcher[]];
  priority?: number;
}>;

type HtmlContribution<C extends AnyPluginConfig> =
  InferExactPluginSchemaContribution<C>;

type HtmlContributionElements<C extends AnyPluginConfig> =
  HtmlContribution<C> extends Readonly<{
    elements: infer TElements extends Readonly<
      Record<string, import('@platejs/plite').SchemaElement>
    >;
  }>
    ? TElements
    : Readonly<Record<never, never>>;

type HtmlContributionProperties<C extends AnyPluginConfig> =
  HtmlContribution<C> extends Readonly<{
    properties: readonly (infer TProperty extends SchemaProperty)[];
  }>
    ? TProperty
    : never;

type HtmlPropertyName<TKey> = TKey extends string ? TKey : never;

type HtmlPropertyMap<TProperty> = Readonly<{
  [TMember in TProperty as TMember extends SchemaProperty
    ? HtmlPropertyName<TMember['key']>
    : never]?: TMember extends SchemaProperty
    ? PropertyValueOf<TMember['value']>
    : never;
}>;

type HtmlElementSchema<C extends AnyPluginConfig> =
  InferPluginDocumentType<C> extends keyof HtmlContributionElements<C>
    ? HtmlContributionElements<C>[InferPluginDocumentType<C>]
    : never;

type HtmlElementOwnedProperties<C extends AnyPluginConfig> =
  HtmlElementSchema<C> extends Readonly<{
    properties?: infer TProperties extends Readonly<
      Record<string, PropertyValueDescriptor>
    >;
  }>
    ? Readonly<{
        [TKey in keyof TProperties]?: PropertyValueOf<TProperties[TKey]>;
      }>
    : Readonly<Record<never, never>>;

type HtmlOwnedPropertyMap<C extends AnyPluginConfig> =
  HtmlElementOwnedProperties<C> &
    HtmlPropertyMap<HtmlContributionProperties<C>>;

type HtmlHasOnlyExactPropertyKeys<C extends AnyPluginConfig> = [
  Exclude<
    HtmlContributionProperties<C>,
    SchemaProperty & Readonly<{ key: string }>
  >,
] extends [never]
  ? true
  : false;

type IsUnion<T, TWhole = T> = T extends TWhole
  ? [TWhole] extends [T]
    ? false
    : true
  : never;

type HtmlSoleExactProperty<C extends AnyPluginConfig> =
  HtmlContributionProperties<C> extends infer TProperty
    ? [TProperty] extends [never]
      ? never
      : IsUnion<TProperty> extends true
        ? never
        : TProperty extends SchemaProperty & { key: string }
          ? TProperty
          : never
    : never;

type HtmlPropertyDecode<C extends AnyPluginConfig> = [
  HtmlSoleExactProperty<C>,
] extends [never]
  ? HtmlPropertyMap<HtmlContributionProperties<C>>
  : HtmlSoleExactProperty<C> extends SchemaProperty
    ? PropertyValueOf<HtmlSoleExactProperty<C>['value']>
    : never;

type HtmlPropertyEncodeContextFor<C extends AnyPluginConfig> = [
  HtmlSoleExactProperty<C>,
] extends [never]
  ? HtmlPropertiesEncodeContext<Element, HtmlOwnedPropertyMap<C>>
  : HtmlSoleExactProperty<C> extends SchemaProperty
    ? HtmlPropertyEncodeContext<
        Element,
        PropertyValueOf<HtmlSoleExactProperty<C>['value']>
      >
    : never;

type HtmlTextEncodeContextFor<C extends AnyPluginConfig> = [
  HtmlSoleExactProperty<C>,
] extends [never]
  ? HtmlPropertiesEncodeContext<Text, HtmlOwnedPropertyMap<C>>
  : HtmlSoleExactProperty<C> extends SchemaProperty
    ? HtmlPropertyEncodeContext<
        Text,
        PropertyValueOf<HtmlSoleExactProperty<C>['value']>
      >
    : never;

type HtmlElementRule<C extends AnyPluginConfig> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlElementDecodeResult<HtmlOwnedPropertyMap<C>>,
    HtmlElementEncodeContext<Element & HtmlOwnedPropertyMap<C>>,
    HtmlNodeSpec
  > & {
    createsElement?: never;
  };

type HtmlElementPropertyRule<C extends AnyPluginConfig> = HtmlRuleBase &
  (HtmlElementPropertyPatchRule<C> | HtmlElementPropertyCreateRule<C>);

type HtmlElementPropertyPatchRule<C extends AnyPluginConfig> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlPropertyDecode<C>,
    HtmlPropertyEncodeContextFor<C>,
    HtmlElementPatch
  > & {
    createsElement?: never;
  };

type HtmlElementPropertyCreateRule<C extends AnyPluginConfig> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlElementDecodeResult<HtmlOwnedPropertyMap<C>>,
    HtmlElementEncodeContext<Element & HtmlOwnedPropertyMap<C>>,
    HtmlNodeSpec
  > & {
    createsElement: true;
  };

type HtmlTextPropertyRule<C extends AnyPluginConfig> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlPropertyDecode<C>,
    HtmlTextEncodeContextFor<C>,
    HtmlWrapperSpec
  > & {
    createsElement?: never;
  };

type HtmlForeignElementPropertyRule<C extends AnyPluginConfig> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlPropertyDecode<C>,
    HtmlPropertyEncodeContextFor<C>,
    HtmlElementPatch
  > & {
    createsElement?: never;
  };

type HtmlSelfRule<C extends AnyPluginConfig> =
  HtmlHasOnlyExactPropertyKeys<C> extends false
    ? never
    : [HtmlElementSchema<C>] extends [never]
      ? [HtmlContributionProperties<C>] extends [never]
        ? never
        : [Exclude<HtmlContributionProperties<C>, SchemaTextProperty>] extends [
              never,
            ]
          ? HtmlTextPropertyRule<C>
          : [
                Exclude<HtmlContributionProperties<C>, SchemaElementProperty>,
              ] extends [never]
            ? HtmlElementPropertyRule<C>
            : never
      : [
            Exclude<HtmlContributionProperties<C>, SchemaElementProperty>,
          ] extends [never]
        ? HtmlElementRule<C>
        : never;

type HtmlSelfNonCreatingRule<C extends AnyPluginConfig> =
  HtmlHasOnlyExactPropertyKeys<C> extends false
    ? never
    : [HtmlElementSchema<C>] extends [never]
      ? [HtmlContributionProperties<C>] extends [never]
        ? never
        : [Exclude<HtmlContributionProperties<C>, SchemaTextProperty>] extends [
              never,
            ]
          ? HtmlTextPropertyRule<C>
          : [
                Exclude<HtmlContributionProperties<C>, SchemaElementProperty>,
              ] extends [never]
            ? HtmlElementPropertyPatchRule<C>
            : never
      : [
            Exclude<HtmlContributionProperties<C>, SchemaElementProperty>,
          ] extends [never]
        ? HtmlElementRule<C>
        : never;

type HtmlForeignRule<C extends AnyPluginConfig> =
  HtmlHasOnlyExactPropertyKeys<C> extends false
    ? never
    : [HtmlElementSchema<C>] extends [never]
      ? [HtmlContributionProperties<C>] extends [never]
        ? never
        : [Exclude<HtmlContributionProperties<C>, SchemaTextProperty>] extends [
              never,
            ]
          ? HtmlTextPropertyRule<C>
          : [
                Exclude<HtmlContributionProperties<C>, SchemaElementProperty>,
              ] extends [never]
            ? HtmlForeignElementPropertyRule<C>
            : never
      : [
            Exclude<HtmlContributionProperties<C>, SchemaElementProperty>,
          ] extends [never]
        ? HtmlElementRule<C>
        : never;

type ForeignHtmlCodecTarget<
  C extends AnyPluginConfig,
  TTarget extends PluginReference,
> = TTarget['key'] extends C['key'] ? never : TTarget;

type CodecDecodeContext = Readonly<{
  data: string;
  format: string;
  source: Readonly<{
    files: Readonly<{
      readonly [index: number]: File;
      readonly length: number;
      item: (index: number) => File | null;
    }>;
    getData: (format: string) => string;
    types: readonly string[];
  }>;
  state: EditorCoreStateView;
}>;

type CodecEncodeContext = Readonly<{
  format: string;
  slice: ContentSlice;
  state: EditorCoreStateView;
}>;

type CodecDeclaration = Readonly<{
  decode?: (context: CodecDecodeContext) => ContentSlice | null;
  encode?: (context: CodecEncodeContext) => string | null;
  key?: never;
  owner?: never;
  priority?: number;
  query?: (context: CodecDecodeContext) => boolean;
  scope?: 'document';
  target?: never;
}>;

export type PluginProductCodecMap = Readonly<
  Record<string, CodecDeclaration> & {
    /** HTML node codecs use the schema-aware `text/html` declaration. */
    'text/html'?: never;
  }
>;

type PluginSelfHtmlCodec<C extends AnyPluginConfig> = HtmlSelfRule<C> & {
  target?: never;
};

export type PluginSelfHtmlCodecMap<C extends AnyPluginConfig> = Readonly<{
  'text/html':
    | PluginSelfHtmlCodec<C>
    | readonly [PluginSelfHtmlCodec<C>, ...PluginSelfHtmlCodec<C>[]];
}>;

type PluginSelfHtmlElementPropertyCodecMap<C extends AnyPluginConfig, TRule> = [
  HtmlElementSchema<C>,
] extends [never]
  ? [HtmlContributionProperties<C>] extends [never]
    ? never
    : [Exclude<HtmlContributionProperties<C>, SchemaElementProperty>] extends [
          never,
        ]
      ? Readonly<{
          'text/html': TRule | readonly [TRule, ...TRule[]];
        }>
      : never
  : never;

type PluginSelfHtmlCodecMapForRule<TRule> = Readonly<{
  'text/html': TRule | readonly [TRule, ...TRule[]];
}>;

export type PluginForeignHtmlCodecMap<
  C extends AnyPluginConfig,
  TTarget extends PluginReference & {
    readonly __config: AnyPluginConfig;
  },
> = Readonly<{
  'text/html':
    | (HtmlForeignRule<InferConfig<NoInfer<TTarget>>> & {
        target: ForeignHtmlCodecTarget<C, TTarget>;
      })
    | readonly [
        HtmlForeignRule<InferConfig<NoInfer<TTarget>>> & {
          target: ForeignHtmlCodecTarget<C, TTarget>;
        },
        ...(HtmlForeignRule<InferConfig<NoInfer<TTarget>>> & {
          target: ForeignHtmlCodecTarget<C, TTarget>;
        })[],
      ];
}>;

type PluginForeignHtmlCodecInput<
  TTarget extends PluginReference & {
    readonly __config: AnyPluginConfig;
  },
> = Readonly<{
  'text/html':
    | HtmlForeignRule<InferConfig<NoInfer<TTarget>>>
    | readonly [
        HtmlForeignRule<InferConfig<NoInfer<TTarget>>>,
        ...HtmlForeignRule<InferConfig<NoInfer<TTarget>>>[],
      ];
}>;

/** Schema-checked codec map produced by `defineCodecs`. */
export type PluginCodecMapDeclaration = Readonly<Record<string, unknown>> & {
  readonly [pluginCodecMapDeclaration]: true;
};

/** Context-bound codec definition with exact owner and foreign-target typing. */
export type DefinePluginCodecs<C extends AnyPluginConfig> = {
  // biome-ignore lint/style/useUnifiedTypeSignatures: Distinct overloads preserve exact self-codec inference.
  (
    codecs: PluginSelfHtmlElementPropertyCodecMap<
      C,
      HtmlElementPropertyCreateRule<C>
    >
  ): PluginCodecMapDeclaration;
  (
    codecs: PluginSelfHtmlCodecMapForRule<HtmlSelfNonCreatingRule<C>>
  ): PluginCodecMapDeclaration;
  (codecs: PluginProductCodecMap): PluginCodecMapDeclaration;
  <
    const TTarget extends PluginReference & {
      readonly __config: AnyPluginConfig;
    },
  >(
    target: TTarget,
    codecs: PluginForeignHtmlCodecInput<TTarget>
  ): PluginCodecMapDeclaration;
};

export type PartialBasePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<ResolvedBasePlugin<C>>,
  'options' | 'render'
> & {
  options?: Partial<InferOptions<C>>;
  render?: Partial<Omit<NonNullable<BasePlugin<C>['render']>, 'node'>>;
};

/**
 * Type-erased weak override carried by plugin descriptors.
 *
 * Keep this boundary independent from `BasePlugin`: descriptors contain weak
 * overrides, so deriving their stored value from `BasePlugin` would make the
 * public generic below recursively expand itself.
 */
type ErasedBasePluginOverride = Partial<{
  decorate: any;
  editOnly: any;
  enabled: boolean;
  handlers: any;
  inject: any;
  inputRules: any;
  options: any;
  parsers: any;
  priority: number;
  render: any;
  rules: any;
  selectors: any;
  shortcuts: any;
  targetPluginKeys: readonly string[];
  transformInitialValue: any;
  tx: any;
  type: string;
}>;

/**
 * Configuration-only patch for an already-installed foreign plugin.
 *
 * The target key cannot provide target-specific inference. Pass the target
 * config type explicitly when exact option checking is required.
 */
export type BasePluginOverride<C extends AnyPluginConfig = any> = Omit<
  PartialBasePlugin<C>,
  | '__apiExtensions'
  | '__codecExtensions'
  | '__htmlCodecExtensions'
  | '__config'
  | '__configurationLayers'
  | '__editorExtensions'
  | '__extensions'
  | '__readExtensions'
  | '__pluginReference'
  | '__selectorExtensions'
  | '__txExtensions'
  | 'clone'
  | 'configure'
  | 'dependencies'
  | 'extend'
  | 'key'
  | 'override'
  | 'schema'
>;

export type RenderStaticNodeWrapper<C extends AnyPluginConfig = any> = (
  props: RenderStaticNodeWrapperProps<C>
) => RenderStaticNodeWrapperFunction;

export type RenderStaticNodeWrapperFunction =
  | ((hocProps: PliteRenderElementProps) => React.ReactNode)
  | null
  | undefined;

export interface RenderStaticNodeWrapperProps<C extends AnyPluginConfig = any>
  extends PliteRenderElementProps<Element, C> {
  key: string;
}

export type PlatePluginTxGroup<
  TGroup extends object = object,
  C extends AnyPluginConfig = AnyPluginConfig,
> = (
  transaction: PlatePluginTransaction<InferPluginConfigTree<C>>,
  editor: BaseEditor,
  context: EditorUpdateContext
) => TGroup;

export type PlatePluginTxGroups = Record<
  string,
  PlatePluginTxGroup | undefined
>;

export type PlatePluginTxExtension = ((
  ctx: BasePluginImplementationContext<AnyPluginConfig>
) => PlatePluginTxGroups) & {
  __plateOwnTxGroup?: true;
  __plateTxGroupKey?: string;
};

export type PlatePluginReadGroup<
  TGroup extends object = object,
  C extends AnyPluginConfig = AnyPluginConfig,
> = (
  state: PlatePluginReadState<InferPluginConfigTree<C>>,
  editor: BaseEditor
) => TGroup;

export type PlatePluginReadGroups = Record<
  string,
  PlatePluginReadGroup | undefined
>;

export type PlatePluginReadExtension = (
  ctx: BasePluginImplementationContext<AnyPluginConfig>
) => PlatePluginReadGroups;

export type PlatePluginApiExtension = Readonly<{
  extension: (ctx: BasePluginContext<AnyPluginConfig>) => any;
  isPluginSpecific: boolean;
}>;

export type BasePluginContextEditor<C extends AnyPluginConfig = PluginConfig> =
  Omit<BaseEditor, 'api' | 'update'> & {
    readonly api: BaseEditor<Value, InferPluginConfigTree<C>>['api'];
    update: PlatePluginOwnUpdate<C>;
  };

export type BasePluginImplementationContext<
  C extends AnyPluginConfig = PluginConfig,
> = PluginBaseContext<C> & {
  editor: {
    readonly api: BaseEditor<Value, InferPluginConfigTree<C>>['api'];
    update: BaseEditor<Value, InferPluginConfigTree<C>>['update'];
  } & BasePluginContextEditor<C>;
  plugin: BasePlugin<C>;
};

type BasePluginDependencyDescriptors<D extends readonly PluginReference[]> = {
  readonly [TIndex in keyof D]: D[TIndex] extends {
    readonly __config: infer C extends AnyPluginConfig;
  }
    ? BasePlugin<C>
    : D[TIndex];
};

/** Base interface for non-React Plate editor plugins. */
export type BasePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  PluginBase<C>,
  'dependencies'
> & {
  dependencies: BasePluginDependencyDescriptors<InferDependencies<C>>;
} & Nullable<{
    decorate?: Decorate<C>;
    transformInitialValue?: TransformInitialValue<WithAnyKey<C>>;
  }> &
  BasePluginMethods<C> & {
    handlers: Nullable<{
      onNodeChange?: (
        ctx: BasePluginContext<C> & {
          commit: EditorCommit;
          kind: EditorNodeChangeKind;
          node: Descendant | null;
          path: Path;
          previousPath: Path | null;
          prevNode: Descendant | null;
          root: NamedRootKey | undefined;
        }
      ) => HandlerReturnType;
      onTextChange?: (
        ctx: BasePluginContext<C> & {
          commit: EditorCommit;
          node: Descendant | null;
          path: Path;
          previousPath: Path;
          prevText: string;
          root: NamedRootKey | undefined;
          text: string;
        }
      ) => HandlerReturnType;
    }>;
    inject: Nullable<{
      nodeProps?: InjectNodeProps<C>;
    }>;
    override: {
      components?: NodeComponents;
      /**
       * Weakly adapts already-installed foreign plugins by key.
       *
       * Missing targets are ignored. Direct target configuration remains the
       * authoritative, inferred path.
       */
      plugins?: Record<string, ErasedBasePluginOverride>;
    };
    parsers: {
      html?: Nullable<HtmlParser<WithAnyKey<C>>>;
    };
    render: Nullable<{
      /**
       * When other plugins' `node` components are rendered, this function can
       * return an optional wrapper function that turns a `node`'s props to a
       * wrapper React node as its parent. Useful for wrapping or decorating
       * nodes with additional UI elements.
       *
       * NOTE: The function can run React hooks. NOTE: Do not run React hooks
       * in the wrapper function. It is not equivalent to a React component.
       */
      aboveNodes?: RenderStaticNodeWrapper<WithAnyKey<C>>;
      /**
       * When other plugins' `node` components are rendered, this function can
       * return an optional wrapper function that turns a `node`'s props to a
       * wrapper React node. The wrapper node is the `node`'s child and its
       * original children's parent. Useful for wrapping or decorating nodes
       * with additional UI elements.
       *
       * NOTE: The function can run React hooks. NOTE: Do not run React hooks
       * in the wrapper function. It is not equivalent to a React component.
       */
      belowNodes?: RenderStaticNodeWrapper<WithAnyKey<C>>;
      /** Renders a component after the main editor container. */
      afterContainer?: () => React.ReactElement<any> | null;
      /**
       * Renders a component after the `Editable` component. This is the last
       * render position within the editor structure.
       */
      afterEditable?: () => React.ReactElement<any> | null;
      /** Renders a component before the main editor container. */
      beforeContainer?: () => React.ReactElement<any> | null;
      /** Renders a component before the `Editable` component. */
      beforeEditable?: () => React.ReactElement<any> | null;
      /**
       * Function to render content below the root element but above its
       * children. Similar to belowNodes but renders directly in the element
       * rather than wrapping. Multiple plugins can provide this, and all
       * their content will be rendered in sequence.
       */
      belowRootNodes?: (
        props: PliteElementProps<Element, WithAnyKey<C>>
      ) => React.ReactNode;
      /** Override `data-plite-leaf` element attributes. */
      leafProps?: LeafStaticProps<WithAnyKey<C>>;
      /** Override rendered element/text/leaf attributes. */
      nodeProps?: NodeStaticProps<WithAnyKey<C>>;
      /** Override `data-plite-node="text"` element attributes. */
      textProps?: TextStaticProps<WithAnyKey<C>>;
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
        } & BasePluginContext<C>
      ) => boolean;
    };
    /**
     * Keyboard shortcuts configuration mapping shortcut names to their key
     * combinations and handlers. Each shortcut can link to a public update
     * command, an API method, or use a custom handler function.
     */
    shortcuts: Record<string, EditorShortcut | null | undefined>;
    inputRules: InputRulesDefinition | InputRulesConfig;
    tx: PlatePluginTxGroups;
  };

export type BasePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  State = {},
  D extends readonly PluginReference[] = readonly [],
  EO = {},
  EA = {},
  ES = {},
  SchemaModel = never,
  PluginApi = {},
  Enabled extends boolean = boolean,
> = Partial<
  Omit<
    BasePlugin<
      PluginConfig<K, O, A, Tx, S, State, D, SchemaModel, PluginApi, Enabled>
    >,
    keyof BasePluginMethods | 'api' | 'options' | 'render' | 'schema' | 'type'
  > & {
    api: Deep2Partial<A> & EA;
    options: Partial<O> & EO;
    render: Omit<
      NonNullable<
        BasePlugin<
          PluginConfig<
            K,
            O,
            A,
            Tx,
            S,
            State,
            D,
            SchemaModel,
            PluginApi,
            Enabled
          >
        >['render']
      >,
      'node'
    > | null;
    schema: PluginSchema<
      PluginConfig<K, O, A, Tx, S, State, D, SchemaModel, PluginApi, Enabled>
    > | null;
    selectors: Partial<S> & ES;
    type: string;
  }
>;

type RuntimeBasePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
> = Omit<
  BasePluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    EO,
    EA,
    ES,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    InferEnabled<C>
  >,
  'codecs' | 'dependencies' | 'render' | 'schema' | 'type'
> & {
  render?: Omit<NonNullable<BasePlugin<C>['render']>, 'node'> | null;
};

export type BasePluginExtensionContract = {
  api?: object;
  extension?: object | readonly object[];
  options?: object;
  read?: object;
  selectors?: object;
  update?: object;
};

type ExtensionContractField<
  TContract extends BasePluginExtensionContract,
  TKey extends keyof BasePluginExtensionContract,
> = TKey extends keyof TContract
  ? TContract[TKey] extends object
    ? TContract[TKey]
    : {}
  : {};

type ExtensionContractApi<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'api'>;

type ExtensionContractOptions<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'options'>;

type ExtensionContractRead<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'read'>;

type ExtensionContractSelectors<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'selectors'>;

type ExtensionContractUpdate<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'update'>;

type ExtensionContractExtension<
  _C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
> = 'extension' extends keyof TContract
  ? TContract['extension'] extends object | readonly object[]
    ? TContract['extension']
    : {}
  : {};

type TransactionReadGroup<TGroup extends object> = {
  [TKey in keyof TGroup]: TGroup[TKey] extends (...args: any[]) => any
    ? TxReadMethod<TGroup[TKey]>
    : TGroup[TKey];
};

type AdditiveContract<TCurrent, TAddition> = [keyof TAddition] extends [never]
  ? TCurrent
  : [keyof TCurrent] extends [never]
    ? TAddition
    : Omit<TAddition, keyof TCurrent> & TCurrent;

type EffectiveExtensionContractField<
  TContract extends BasePluginExtensionContract,
  TKey extends Exclude<keyof BasePluginExtensionContract, 'extension'>,
  TInferred extends object,
> = [keyof ExtensionContractField<NoInfer<TContract>, TKey>] extends [never]
  ? TInferred
  : ExtensionContractField<NoInfer<TContract>, TKey>;

type EffectiveExtensionContract<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
  TExtension extends object | readonly object[],
> = [keyof ExtensionContractExtension<C, NoInfer<TContract>>] extends [never]
  ? TExtension
  : ExtensionContractExtension<C, NoInfer<TContract>>;

type WithPluginGroup<TGroups, TKey extends string, TGroup extends object> = [
  keyof TGroups,
] extends [never]
  ? Record<TKey, TGroup>
  : Omit<TGroups, TKey> & Record<TKey, TGroup>;

type UnifiedPluginTx<TContract extends BasePluginExtensionContract> =
  AdditiveContract<
    TransactionReadGroup<ExtensionContractRead<TContract>>,
    ExtensionContractUpdate<TContract>
  >;

type ExistingPluginTx<C extends AnyPluginConfig> =
  InferTx<C> extends Record<C['key'], infer TTx extends object> ? TTx : {};

type ExtendedPluginTx<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
> = keyof UnifiedPluginTx<TContract> extends never
  ? InferTx<C>
  : WithPluginGroup<
      InferTx<C>,
      C['key'],
      AdditiveContract<ExistingPluginTx<C>, UnifiedPluginTx<TContract>>
    >;

type ExistingPluginState<C extends AnyPluginConfig> =
  InferState<C> extends Record<C['key'], infer TState extends object>
    ? TState
    : {};

type ExtendedPluginState<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
> = keyof ExtensionContractRead<TContract> extends never
  ? InferState<C>
  : WithPluginGroup<
      InferState<C>,
      C['key'],
      AdditiveContract<ExistingPluginState<C>, ExtensionContractRead<TContract>>
    >;

export type UnifiedRuntimeBasePluginConfig<
  C extends AnyPluginConfig,
  TOptions extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TExtension extends object | readonly object[],
  TShortcuts extends BaseShortcutRecord,
> = {
  /** Immutable API owned by this plugin. */
  api?: TApi & Deep2Partial<InferPluginApi<C>>;
  codecs?: PluginCodecMapDeclaration;
  /** Raw Plite editor behavior contributed by this authoring stage. */
  extension?: UnifiedEditorExtensionInput<C, TExtension>;
  options?: TOptions & Partial<InferOptions<C>>;
  /** State-bound reads owned by this plugin. */
  read?: (context: {
    state: PlatePluginReadState<InferPluginConfigTree<C>>;
  }) => TRead & Partial<ExistingPluginState<C>>;
  selectors?: TSelectors & Partial<InferSelectors<C>>;
  /** Transaction-bound updates owned by this plugin. */
  update?: (context: {
    context: EditorUpdateContext;
    tx: PlatePluginTransaction<InferPluginConfigTree<C>>;
  }) => TUpdate;
} & Omit<
  WithValidatedBaseShortcuts<
    C,
    RuntimeBasePluginConfig<C, TOptions, {}, {}>,
    TShortcuts
  >,
  'api' | 'options' | 'selectors'
>;

type PortableRuntimeBasePluginConfig<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
  TShortcuts extends BaseShortcutRecord,
> = Omit<
  UnifiedRuntimeBasePluginConfig<
    C,
    ExtensionContractField<TContract, 'options'>,
    ExtensionContractField<TContract, 'api'>,
    ExtensionContractField<TContract, 'read'>,
    ExtensionContractField<TContract, 'selectors'>,
    ExtensionContractField<TContract, 'update'>,
    EffectiveExtensionContract<C, TContract, {}>,
    TShortcuts
  >,
  'extension'
> & {
  /**
   * Accepts an already-built Plite extension without claiming undeclared
   * editor-wide capabilities in this plugin's contract.
   */
  extension?: PlateEditorExtensionInput;
};

type InferredExtensionContract<
  TOptions extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> = {
  api: TApi;
  options: TOptions;
  read: TRead;
  selectors: TSelectors;
  update: TUpdate;
};

type EffectiveInferredExtensionContract<
  TContract extends BasePluginExtensionContract,
  TOptions extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> = InferredExtensionContract<
  EffectiveExtensionContractField<TContract, 'options', TOptions>,
  EffectiveExtensionContractField<TContract, 'api', TApi>,
  EffectiveExtensionContractField<TContract, 'read', TRead>,
  EffectiveExtensionContractField<TContract, 'selectors', TSelectors>,
  EffectiveExtensionContractField<TContract, 'update', TUpdate>
>;

type StaticBasePluginConfigBase<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  Enabled extends boolean = InferEnabled<C>,
> = Omit<
  BasePluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    EO,
    EA,
    ES,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    Enabled
  >,
  'dependencies'
>;

type StaticBasePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  Enabled extends boolean = InferEnabled<C>,
> = Omit<StaticBasePluginConfigBase<C, EO, EA, ES, Enabled>, 'schema'> & {
  schema?: never;
};

type RequireAtLeastOne<T extends object> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

type TerminalBasePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  Enabled extends boolean = InferEnabled<C>,
> = Omit<StaticBasePluginConfig<C, EO, EA, ES, Enabled>, 'schema'> & {
  /** Binds this Base descriptor to a renderer component for static consumers. */
  component?: NodeComponent;
  schema?: never;
};

type ContextualBasePluginConfig<C extends AnyPluginConfig> = Omit<
  Pick<
    RuntimeBasePluginConfig<C>,
    'handlers' | 'options' | 'render' | 'shortcuts'
  >,
  'render'
> & {
  render?: Omit<
    NonNullable<BasePlugin<C>['render']>,
    'isDecoration' | 'node'
  > | null;
};

export type BaseShortcutRecord = Record<
  string,
  EditorShortcut | null | undefined
>;

type WithValidatedBaseShortcuts<
  C extends AnyPluginConfig,
  TConfig,
  TShortcuts extends BaseShortcutRecord,
> = Omit<TConfig, 'shortcuts'> & {
  shortcuts?: PluginShortcutInput<C, TShortcuts>;
};

type PluginConfigurationLayer<C extends AnyPluginConfig> =
  | Readonly<{
      kind: 'context';
      value: (ctx: BasePluginContext<C>) => ContextualBasePluginConfig<C>;
    }>
  | Readonly<{
      kind: 'object';
      value: BasePluginConfig<
        C['key'],
        InferOptions<C>,
        InferApi<C>,
        InferTx<C>,
        InferSelectors<C>,
        InferState<C>,
        InferDependencies<C>,
        {},
        {},
        {},
        InferPluginSchemaModel<C>,
        InferPluginApi<C>,
        InferEnabled<C>
      >;
    }>;

/** Plugin descriptor returned by `extend`, with its inferred additions merged. */
export type ExtendedBasePlugin<
  C extends AnyPluginConfig,
  EO,
  EA,
  ES,
  Enabled extends boolean = InferEnabled<C>,
> = BasePlugin<
  PluginConfig<
    C['key'],
    EO & InferOptions<C>,
    EA & InferApi<C>,
    InferTx<C>,
    ES & InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    Enabled
  >
>;

type UnifiedExtendedBasePluginConfig<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
> = PluginConfig<
  C['key'],
  AdditiveContract<InferOptions<C>, ExtensionContractOptions<TContract>>,
  InferApi<C>,
  ExtendedPluginTx<C, TContract>,
  AdditiveContract<InferSelectors<C>, ExtensionContractSelectors<TContract>>,
  ExtendedPluginState<C, TContract>,
  InferDependencies<C>,
  InferPluginSchemaModel<C>,
  AdditiveContract<InferPluginApi<C>, ExtensionContractApi<TContract>>,
  InferEnabled<C>
>;

/** @internal Nameable boundary for downstream declaration emit. */
export type ExtendedBasePluginWithExtension<
  C extends AnyPluginConfig,
  TExtensionApi,
  TExtensionTx,
  TExtensionState,
> = BasePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C> & TExtensionApi,
    InferTx<C> & TExtensionTx,
    InferSelectors<C>,
    InferState<C> & TExtensionState,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    InferEnabled<C>
  >
>;

export type UnifiedExtendedBasePlugin<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
  TExtensionApi = {},
  TExtensionTx = {},
  TExtensionState = {},
> = ExtendedBasePluginWithExtension<
  UnifiedExtendedBasePluginConfig<C, TContract>,
  TExtensionApi,
  TExtensionTx,
  TExtensionState
>;

export type UnifiedStageExtendedBasePlugin<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
  TOptions extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TExtension extends object | readonly object[],
> = UnifiedExtendedBasePlugin<
  C,
  EffectiveInferredExtensionContract<
    TContract,
    TOptions,
    TApi,
    TRead,
    TSelectors,
    TUpdate
  >,
  ExtensionApiContribution<
    EffectiveExtensionContract<C, TContract, TExtension>
  >,
  ExtensionTxContribution<EffectiveExtensionContract<C, TContract, TExtension>>,
  ExtensionStateContribution<
    EffectiveExtensionContract<C, TContract, TExtension>
  >
>;

type AuthoringBasePluginContextConfig<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
> = InferConfig<
  UnifiedStageExtendedBasePlugin<
    C,
    TContract,
    {},
    {},
    {},
    {},
    {},
    EffectiveExtensionContract<C, TContract, {}>
  >
>;

export type BasePluginAuthoringContext<
  C extends AnyPluginConfig = PluginConfig,
  TContract extends BasePluginExtensionContract = {},
> = Omit<BasePluginContext<C>, 'api' | 'editor' | 'read' | 'update'> & {
  api: BasePluginContext<AuthoringBasePluginContextConfig<C, TContract>>['api'];
  editor: Omit<BasePluginContextEditor<C>, 'api' | 'update'> & {
    readonly api: BasePluginContextEditor<
      AuthoringBasePluginContextConfig<C, TContract>
    >['api'];
    update: BasePluginContextEditor<
      AuthoringBasePluginContextConfig<C, TContract>
    >['update'];
  };
  read: BasePluginContext<
    AuthoringBasePluginContextConfig<C, TContract>
  >['read'];
  update: BasePluginContext<
    AuthoringBasePluginContextConfig<C, TContract>
  >['update'];
};

type UnifiedStaticExtendedBasePlugin<
  C extends AnyPluginConfig,
  EO,
  EA,
  ES,
  Enabled extends boolean,
  TExtension extends object | readonly object[],
> = ExtendedBasePluginWithExtension<
  InferConfig<ExtendedBasePlugin<C, EO, EA, ES, Enabled>>,
  ExtensionApiContribution<TExtension>,
  ExtensionTxContribution<TExtension>,
  ExtensionStateContribution<TExtension>
>;

type PluginAuthoringMethod = 'clone' | 'configure' | 'extend';

type TerminalPluginAuthoringMethods = {
  [K in PluginAuthoringMethod]: never;
};

/** Plugin descriptor after its single consumer configuration. */
export type ConfiguredBasePlugin<C extends AnyPluginConfig = PluginConfig> =
  BasePlugin<C> &
    TerminalPluginAuthoringMethods & {
      /** @internal Prevents authoring after consumer configuration. */
      readonly __configured: true;
    };

type ConfiguredBasePluginType<
  C extends AnyPluginConfig,
  TType extends string,
  Enabled extends boolean = InferEnabled<C>,
> = ConfiguredBasePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    [InferPluginSchemaModel<C>] extends [never]
      ? PluginSchemaModel<TType, null>
      : InferPluginSchemaModel<C> extends PluginSchemaModel<
            string,
            infer TSchema
          >
        ? PluginSchemaModel<TType, TSchema>
        : PluginSchemaModel<TType, null>,
    InferPluginApi<C>,
    Enabled
  >
>;

type ConfiguredBasePluginEnabled<
  C extends AnyPluginConfig,
  Enabled extends boolean,
> = ConfiguredBasePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    InferTx<C>,
    InferSelectors<C>,
    InferState<C>,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    InferPluginApi<C>,
    Enabled
  >
>;

export type BasePluginContext<C extends AnyPluginConfig = PluginConfig> =
  PluginBaseContext<C> & {
    defineCodecs: DefinePluginCodecs<C>;
    defineEditorExtension: DefineEditorExtension<C>;
    editor: BasePluginContextEditor<C>;
    plugin: BasePlugin<C>;
  };

export type BasePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: PlatePluginApiExtension[];
  /** @internal Codec authoring callbacks compiled with the Plate model. */
  __codecExtensions: ((
    context: BasePluginContext<InferPluginBehaviorConfig<AnyPluginConfig>>
  ) => PluginProductCodecMap)[];
  /** @internal HTML node-codec authoring callbacks compiled with the Plate model. */
  __htmlCodecExtensions: readonly Readonly<{
    extension: (context: BasePluginContext<AnyPluginConfig>) => unknown;
    targetKey: string | null;
  }>[];
  __configurationLayers: readonly PluginConfigurationLayer<C>[];
  __editorExtensions: ((
    ctx: BasePluginContext<InferPluginBehaviorConfig<AnyPluginConfig>>
  ) => PlateEditorExtensionInput | undefined)[];
  __extensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __readExtensions: PlatePluginReadExtension[];
  __selectorExtensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __txExtensions: PlatePluginTxExtension[];
  clone(): BasePlugin<C>;
  /**
   * Applies this descriptor's single terminal consumer configuration.
   *
   * Declare reusable behavior with `extend` before this call. Contextual
   * callbacks can override existing options, handlers, renderers, and
   * shortcuts without widening the plugin contract. Extensions read the
   * configured values, while this configuration remains the final override.
   */
  // biome-ignore lint/style/useUnifiedTypeSignatures: Distinct overloads preserve contextual callback and literal static inference.
  configure<const TShortcuts extends BaseShortcutRecord = {}>(
    config: (
      ctx: BasePluginContext<C>
    ) => WithValidatedBaseShortcuts<
      C,
      ContextualBasePluginConfig<C>,
      TShortcuts
    >
  ): ConfiguredBasePlugin<C>;
  configure<
    const TType extends string,
    const Enabled extends boolean,
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    config: WithValidatedBaseShortcuts<
      C,
      TerminalBasePluginConfig<C, {}, {}, {}, Enabled> & {
        enabled: Enabled;
        type: TType;
      },
      TShortcuts
    >
  ): ConfiguredBasePluginType<C, TType, Enabled>;
  configure<
    const TType extends string,
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    config: WithValidatedBaseShortcuts<
      C,
      TerminalBasePluginConfig<C> & { type: TType },
      TShortcuts
    >
  ): ConfiguredBasePluginType<C, TType>;
  configure<
    const Enabled extends boolean,
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    config: WithValidatedBaseShortcuts<
      C,
      TerminalBasePluginConfig<C, {}, {}, {}, Enabled> & {
        enabled: Enabled;
      },
      TShortcuts
    >
  ): ConfiguredBasePluginEnabled<C, Enabled>;
  configure<const TShortcuts extends BaseShortcutRecord = {}>(
    config: WithValidatedBaseShortcuts<
      C,
      TerminalBasePluginConfig<C>,
      TShortcuts
    >
  ): ConfiguredBasePlugin<C>;
  extend<
    const TContract extends BasePluginExtensionContract = {},
    const TOptions extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends object = {},
    const TUpdate extends object = {},
    const TExtension extends object | readonly object[] = {},
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    extendConfig: (
      ctx: BasePluginContext<C>
    ) => UnifiedRuntimeBasePluginConfig<
      C,
      EffectiveExtensionContractField<TContract, 'options', TOptions>,
      EffectiveExtensionContractField<TContract, 'api', TApi>,
      EffectiveExtensionContractField<TContract, 'read', TRead>,
      EffectiveExtensionContractField<TContract, 'selectors', TSelectors>,
      EffectiveExtensionContractField<TContract, 'update', TUpdate>,
      EffectiveExtensionContract<C, TContract, TExtension>,
      TShortcuts
    >
  ): UnifiedExtendedBasePlugin<
    C,
    EffectiveInferredExtensionContract<
      TContract,
      TOptions,
      TApi,
      TRead,
      TSelectors,
      TUpdate
    >,
    ExtensionApiContribution<
      EffectiveExtensionContract<C, TContract, TExtension>
    >,
    ExtensionTxContribution<
      EffectiveExtensionContract<C, TContract, TExtension>
    >,
    ExtensionStateContribution<
      EffectiveExtensionContract<C, TContract, TExtension>
    >
  >;
  extend<
    const TContract extends BasePluginExtensionContract,
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    extendConfig: (
      ctx: BasePluginContext<C>
    ) => PortableRuntimeBasePluginConfig<C, TContract, TShortcuts>
  ): UnifiedStageExtendedBasePlugin<
    C,
    TContract,
    {},
    {},
    {},
    {},
    {},
    EffectiveExtensionContract<C, TContract, {}>
  >;
  extend<
    const TOptions extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends object = {},
    const TUpdate extends object = {},
    const TExtension extends object | readonly object[] = {},
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    extendConfig: UnifiedRuntimeBasePluginConfig<
      C,
      TOptions,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TExtension,
      TShortcuts
    >
  ): UnifiedStageExtendedBasePlugin<
    C,
    {},
    TOptions,
    TApi,
    TRead,
    TSelectors,
    TUpdate,
    TExtension
  >;
  extend<const TExtension extends PlateEditorExtensionInput>(
    extendConfig: StaticBasePluginConfig<C> & {
      extension: TExtension;
    }
  ): UnifiedStaticExtendedBasePlugin<
    C,
    {},
    {},
    {},
    InferEnabled<C>,
    TExtension
  >;
  extend<
    EO = {},
    EA = {},
    ES = {},
    const TExtension extends object | readonly object[] = {},
    const TShortcuts extends BaseShortcutRecord = {},
    const Enabled extends boolean = InferEnabled<C>,
  >(
    extendConfig: WithValidatedBaseShortcuts<
      PluginConfig<
        C['key'],
        InferOptions<C>,
        EA & InferApi<C>,
        InferTx<C>,
        InferSelectors<C>,
        InferState<C>,
        InferDependencies<C>,
        InferPluginSchemaModel<C>,
        InferPluginApi<C>,
        Enabled
      >,
      RequireAtLeastOne<
        StaticBasePluginConfig<C, EO, EA, ES, Enabled> & {
          extension?: UnifiedEditorExtensionInput<C, TExtension>;
        }
      >,
      TShortcuts
    >
  ): UnifiedStaticExtendedBasePlugin<C, EO, EA, ES, Enabled, TExtension>;
  __resolved?: boolean;
};

export type BasePlugins = AnyBasePlugin[];

export type TextStaticProps<C extends AnyPluginConfig = PluginConfig> =
  | ((props: PliteRenderTextProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type TransformOptions<C extends AnyPluginConfig = PluginConfig> =
  BaseTransformOptions & BasePluginContext<C>;

type EditorShortcutOptions = {
  keys?: (({} & string)[][] | readonly string[] | string) | null;
  delimiter?: string;
  description?: string;
  document?: Document;
  enabled?: Trigger;
  enableOnContentEditable?: boolean;
  enableOnFormTags?: boolean;
  ignoreEventWhenPrevented?: boolean;
  ignoreModifiers?: boolean;
  keydown?: boolean;
  keyup?: boolean;
  preventDefault?: Trigger;
  priority?: number;
  scopes?: readonly string[] | string;
  splitKey?: string;
  useKey?: boolean;
  ignoreEventWhen?: (e: KeyboardEvent) => boolean;
};

export type EditorShortcut = EditorShortcutOptions &
  (
    | {
        handler: (ctx: {
          editor: BaseEditor<any, any>;
          event: KeyboardEvent;
          eventDetails: any;
        }) => boolean | void;
        target?: never;
      }
    | {
        handler?: never;
        /** Disambiguates a command name present in both public namespaces. */
        target?: 'api' | 'update';
      }
  );

type ShortcutFunctionKey<T> = {
  [K in keyof T]-?: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T] &
  string;

type PluginShortcutUpdateKey<C extends AnyPluginConfig> = ShortcutFunctionKey<
  InferPluginTx<C>
>;

type PluginShortcutPluginApiKey<C extends AnyPluginConfig> =
  ShortcutFunctionKey<InferPluginApi<C>>;

type PluginShortcutEditorApiKey<C extends AnyPluginConfig> =
  ShortcutFunctionKey<InferApi<C>>;

type PluginShortcutApiKey<C extends AnyPluginConfig> =
  | PluginShortcutEditorApiKey<C>
  | PluginShortcutPluginApiKey<C>;

type PluginShortcutApiScopeCollisionKey<C extends AnyPluginConfig> = Extract<
  PluginShortcutEditorApiKey<C>,
  PluginShortcutPluginApiKey<C>
>;

type ShortcutWithHandler<TShortcut> = Extract<
  TShortcut,
  { handler: (...args: any[]) => any }
>;

type ShortcutWithoutHandler<TShortcut> = Exclude<
  TShortcut,
  ShortcutWithHandler<TShortcut>
>;

type PluginShortcutForKey<
  C extends AnyPluginConfig,
  K extends string,
  TShortcut,
> =
  K extends PluginShortcutApiScopeCollisionKey<C>
    ? ShortcutWithHandler<TShortcut>
    : K extends PluginShortcutUpdateKey<C>
      ? K extends PluginShortcutApiKey<C>
        ?
            | ShortcutWithHandler<TShortcut>
            | (ShortcutWithoutHandler<TShortcut> & {
                target: 'api' | 'update';
              })
        :
            | ShortcutWithHandler<TShortcut>
            | (ShortcutWithoutHandler<TShortcut> & { target?: 'update' })
      : K extends PluginShortcutApiKey<C>
        ?
            | ShortcutWithHandler<TShortcut>
            | (ShortcutWithoutHandler<TShortcut> & { target?: 'api' })
        : ShortcutWithHandler<TShortcut>;

/** Shortcut declarations for capabilities already named by an explicit config. */
export type DeclaredPluginShortcutInput<
  C extends AnyPluginConfig,
  TShortcut = EditorShortcut,
> = Partial<{
  [K in
    | PluginShortcutApiKey<C>
    | PluginShortcutUpdateKey<C>]: PluginShortcutForKey<C, K, TShortcut> | null;
}>;

/**
 * Validate inferred shortcut object keys against callable plugin commands.
 * Unknown names require a custom handler; ambiguous names require an explicit
 * route, except plugin/editor API collisions which require a custom handler.
 */
export type PluginShortcutInput<
  C extends AnyPluginConfig,
  TShortcuts extends Record<string, TShortcut | null | undefined>,
  TShortcut = EditorShortcut,
> = TShortcuts & {
  [K in keyof TShortcuts]: K extends string
    ?
        | Extract<TShortcuts[K], null | undefined>
        | (Exclude<TShortcuts[K], null | undefined> extends never
            ? never
            : PluginShortcutForKey<C, K, TShortcut>)
    : never;
};

type Trigger =
  | ((keyboardEvent: KeyboardEvent, hotkeysEvent: any) => boolean)
  | boolean;
