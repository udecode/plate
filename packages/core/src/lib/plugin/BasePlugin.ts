import type {
  ContentSlice,
  DecoratedRange,
  Descendant,
  Element,
  EditorCommit,
  EditorClipboardMiddlewareMap,
  EditorDocumentValue,
  EditorExtension,
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
  | '__editorApi'
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
  | 'extendApi'
  | 'extendCodecs'
  | 'extendHtmlCodec'
  | 'extendEditorApi'
  | 'extendExtension'
  | 'extendSelectors'
  | 'extendTx'
  | 'extendTxGroup'
  | 'handlers'
  | 'inject'
  | 'options'
  | 'parsers'
  | 'render'
  | 'rules'
  | 'schema'
  | 'transformInitialValue'
  | 'withComponent';

/** Type-erased boundary for heterogeneous plugin collections. */
export type AnyBasePlugin = Omit<ErasedBasePlugin, ErasedPluginInvariantKey> & {
  __apiExtensions: ErasedBasePlugin['__apiExtensions'];
  __codecExtensions: ErasedBasePlugin['__codecExtensions'];
  __htmlCodecExtensions: ErasedBasePlugin['__htmlCodecExtensions'];
  __configurationLayers: readonly any[];
  __editorApi: ErasedBasePlugin['__editorApi'];
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
  extendApi: any;
  extendCodecs: any;
  extendHtmlCodec: any;
  extendEditorApi: any;
  extendExtension: any;
  extendSelectors: any;
  extendTx: any;
  extendTxGroup: any;
  handlers: ErasedPluginHandlers;
  inject: ErasedPluginInject;
  options: any;
  parsers: any;
  render: any;
  rules: any;
  readonly schema: any;
  transformInitialValue?: any;
  withComponent: any;
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
  Omit<PlateEditorExtension<C>, 'commands'> & {
    commands?: EditorExtension<PlatePluginExtensionEditor<C>>['commands'];
  };

type ContextualPlateEditorExtensionInput<
  C extends AnyPluginConfig = PluginConfig,
> =
  | ContextualPlateEditorExtension<C>
  | readonly ContextualPlateEditorExtension<C>[];

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
  ctx: BasePluginContext<InferPluginBehaviorConfig<C>>
) => PlateEditorExtensionInput<C> | undefined;

export type ExtendEditorApi<
  C extends AnyPluginConfig = PluginConfig,
  EA = {},
> = (ctx: BasePluginContext<C>) => EA & Deep2Partial<InferApi<C>>;

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

declare const htmlContentToken: unique symbol;

export type HtmlContentToken = Readonly<{
  [htmlContentToken]: true;
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
  (
    | (HtmlRuleDirections<
        HtmlPropertyDecode<C>,
        HtmlPropertyEncodeContextFor<C>,
        HtmlElementPatch
      > & {
        createsElement?: never;
      })
    | (HtmlRuleDirections<
        HtmlElementDecodeResult<HtmlOwnedPropertyMap<C>>,
        HtmlElementEncodeContext<Element & HtmlOwnedPropertyMap<C>>,
        HtmlNodeSpec
      > & {
        createsElement: true;
      })
  );

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

export type ExtendHtmlCodec<C extends AnyPluginConfig> = (
  context: BasePluginContext<InferPluginBehaviorConfig<C>>
) => HtmlSelfRule<C>;

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

export type ExtendForeignHtmlCodec<
  C extends AnyPluginConfig,
  TTarget extends AnyPluginConfig,
> = (
  context: BasePluginContext<InferPluginBehaviorConfig<C>>
) => HtmlForeignRule<TTarget>;

export type ForeignHtmlCodecTarget<
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

type CodecMap = Readonly<
  Record<string, CodecDeclaration> & {
    /** HTML node codecs use the inferred `.extendHtmlCodec()` surface. */
    'text/html'?: never;
  }
>;

type ExtendCodecs<C extends AnyPluginConfig = PluginConfig> = (
  context: BasePluginContext<InferPluginBehaviorConfig<C>>
) => CodecMap;

export type PartialBasePlugin<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<ResolvedBasePlugin<C>>,
  'render'
> & {
  render?: Partial<NonNullable<BasePlugin<C>['render']>>;
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
  | '__editorApi'
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
  | 'extendApi'
  | 'extendCodecs'
  | 'extendHtmlCodec'
  | 'extendEditorApi'
  | 'extendExtension'
  | 'extendSelectors'
  | 'extendTx'
  | 'extendTxGroup'
  | 'key'
  | 'override'
  | 'schema'
  | 'withComponent'
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

export type PluginTx<K extends string, Group extends object> = Record<K, Group>;

export type ExtendTx<
  C extends AnyPluginConfig = PluginConfig,
  TGroup extends PlatePluginTxGroup<object, C> = PlatePluginTxGroup<object, C>,
> = (ctx: BasePluginImplementationContext<C>) => TGroup;

export type ExtendTxGroups<
  C extends AnyPluginConfig = PluginConfig,
  ETx extends PlatePluginTxGroups = PlatePluginTxGroups,
> = (ctx: BasePluginImplementationContext<C>) => ETx;

export type PlatePluginTxExtension = ExtendTxGroups<AnyPluginConfig> & {
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

export type InferTxGroup<TGroup extends (...args: any[]) => any> =
  ReturnType<TGroup>;

type OwnPluginTx<C extends AnyPluginConfig> =
  InferPluginTx<C> extends object ? InferPluginTx<C> : never;

type HasOwnPluginTx<C extends AnyPluginConfig> = [OwnPluginTx<C>] extends [
  never,
]
  ? false
  : keyof OwnPluginTx<C> extends never
    ? false
    : true;

type ResolvedPluginTxGroup<
  C extends AnyPluginConfig,
  K extends string,
  TGroup extends PlatePluginTxGroup<any, any>,
> = K extends keyof InferTx<C>
  ? PlatePluginTxGroup<Extract<InferTx<C>[K], object>, C>
  : TGroup;

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

/** Base interface for non-React Plate editor plugins. */
export type BasePlugin<C extends AnyPluginConfig = PluginConfig> =
  PluginBase<C> &
    Nullable<{
      decorate?: Decorate<WithAnyKey<C>>;
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
    keyof BasePluginMethods | 'api' | 'options' | 'schema' | 'type'
  > & {
    api: Deep2Partial<A> & EA;
    options: Partial<O> & EO;
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
  'dependencies' | 'parsers' | 'render' | 'schema' | 'type'
> & {
  render?: Omit<NonNullable<BasePlugin<C>['render']>, 'isDecoration'> | null;
};

export type BasePluginExtensionContract = {
  api?: object;
  read?: object;
  selectors?: object;
  update?: object;
};

type ExtensionContractField<
  TContract extends BasePluginExtensionContract,
  TKey extends keyof BasePluginExtensionContract,
> = TContract[TKey] extends object ? TContract[TKey] : {};

type ExtensionContractApi<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'api'>;

type ExtensionContractRead<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'read'>;

type ExtensionContractSelectors<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'selectors'>;

type ExtensionContractUpdate<TContract extends BasePluginExtensionContract> =
  ExtensionContractField<TContract, 'update'>;

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

type UnifiedCapabilityConfig<
  C extends AnyPluginConfig,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> =
  | {
      /** Immutable API owned by this plugin. */
      api: Deep2Partial<InferPluginApi<C>> & TApi;
    }
  | {
      /** Raw Plite editor behavior contributed by this authoring stage. */
      extension: ContextualPlateEditorExtensionInput<C>;
    }
  | {
      /** State-bound reads owned by this plugin. */
      read: (context: {
        state: PlatePluginReadState<InferPluginConfigTree<C>>;
      }) => TRead;
    }
  | {
      selectors: Partial<InferSelectors<C>> & TSelectors;
    }
  | {
      /** Transaction-bound updates owned by this plugin. */
      update: (context: {
        tx: PlatePluginTransaction<InferPluginConfigTree<C>>;
      }) => TUpdate;
    };

type UnifiedRuntimeBasePluginConfig<
  C extends AnyPluginConfig,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> = {
  /** Immutable API owned by this plugin. */
  api?: Deep2Partial<InferPluginApi<C>> & TApi;
  /** Raw Plite editor behavior contributed by this authoring stage. */
  extension?: ContextualPlateEditorExtensionInput<C>;
  /** State-bound reads owned by this plugin. */
  read?: (context: {
    state: PlatePluginReadState<InferPluginConfigTree<C>>;
  }) => TRead;
  selectors?: Partial<InferSelectors<C>> & TSelectors;
  /** Transaction-bound updates owned by this plugin. */
  update?: (context: {
    tx: PlatePluginTransaction<InferPluginConfigTree<C>>;
  }) => TUpdate;
} & UnifiedCapabilityConfig<C, TApi, TRead, TSelectors, TUpdate>;

type InferredExtensionContract<
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> = {
  api: TApi;
  read: TRead;
  selectors: TSelectors;
  update: TUpdate;
};

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

type TerminalBasePluginConfig<
  C extends AnyPluginConfig,
  EO = {},
  EA = {},
  ES = {},
  Enabled extends boolean = InferEnabled<C>,
> = Omit<StaticBasePluginConfig<C, EO, EA, ES, Enabled>, 'schema'> & {
  schema?: never;
};

type ContextualBasePluginConfig<C extends AnyPluginConfig> = Pick<
  RuntimeBasePluginConfig<C>,
  'handlers' | 'options' | 'render' | 'shortcuts'
>;

type BaseShortcutRecord = Record<string, EditorShortcut | null | undefined>;

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

export type UnifiedExtendedBasePlugin<
  C extends AnyPluginConfig,
  TContract extends BasePluginExtensionContract,
> = BasePlugin<
  PluginConfig<
    C['key'],
    InferOptions<C>,
    InferApi<C>,
    ExtendedPluginTx<C, TContract>,
    AdditiveContract<InferSelectors<C>, ExtensionContractSelectors<TContract>>,
    ExtendedPluginState<C, TContract>,
    InferDependencies<C>,
    InferPluginSchemaModel<C>,
    AdditiveContract<InferPluginApi<C>, ExtensionContractApi<TContract>>,
    InferEnabled<C>
  >
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

type PluginAuthoringMethod =
  | 'clone'
  | 'configure'
  | 'extend'
  | 'extendApi'
  | 'extendCodecs'
  | 'extendHtmlCodec'
  | 'extendEditorApi'
  | 'extendExtension'
  | 'extendSelectors'
  | 'extendTx'
  | 'extendTxGroup'
  | 'withComponent';

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
    editor: BasePluginContextEditor<C>;
    plugin: BasePlugin<C>;
  };

export type BasePluginMethods<C extends AnyPluginConfig = PluginConfig> = {
  __apiExtensions: PlatePluginApiExtension[];
  /** @internal Codec authoring callbacks compiled with the Plate model. */
  __codecExtensions: ExtendCodecs<AnyPluginConfig>[];
  /** @internal HTML node-codec authoring callbacks compiled with the Plate model. */
  __htmlCodecExtensions: readonly Readonly<{
    extension: (context: BasePluginContext<AnyPluginConfig>) => unknown;
    targetKey: string | null;
  }>[];
  __configurationLayers: readonly PluginConfigurationLayer<C>[];
  /** @internal Root editor API declarations carried by this descriptor. */
  __editorApi: InferApi<C>;
  __editorExtensions: ExtendPlateEditorExtension<AnyPluginConfig>[];
  __extensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __readExtensions: PlatePluginReadExtension[];
  __selectorExtensions: ((ctx: BasePluginContext<AnyPluginConfig>) => any)[];
  __txExtensions: PlatePluginTxExtension[];
  clone(): BasePlugin<C>;
  /**
   * Applies this descriptor's single terminal consumer configuration.
   *
   * Declare reusable behavior with `extend*` before this call. Contextual
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
    const TApi extends object = ExtensionContractApi<TContract>,
    const TRead extends object = ExtensionContractRead<TContract>,
    const TSelectors extends object = ExtensionContractSelectors<TContract>,
    const TUpdate extends object = ExtensionContractUpdate<TContract>,
  >(
    extendConfig: (
      ctx: BasePluginContext<C>
    ) => UnifiedRuntimeBasePluginConfig<C, TApi, TRead, TSelectors, TUpdate>
  ): UnifiedExtendedBasePlugin<
    C,
    InferredExtensionContract<TApi, TRead, TSelectors, TUpdate>
  >;
  extend<
    EO = {},
    EA = {},
    ES = {},
    const TShortcuts extends BaseShortcutRecord = {},
  >(
    extendConfig: (
      ctx: BasePluginContext<C>
    ) => WithValidatedBaseShortcuts<
      C,
      RuntimeBasePluginConfig<C, EO, EA, ES>,
      TShortcuts
    >
  ): ExtendedBasePlugin<C, EO, EA, ES>;
  extend<
    EO = {},
    EA = {},
    ES = {},
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
      StaticBasePluginConfig<C, EO, EA, ES, Enabled>,
      TShortcuts
    >
  ): ExtendedBasePlugin<C, EO, EA, ES, Enabled>;
  /**
   * Declares MIME-keyed product codecs with owner and schema claims inferred
   * from this plugin.
   */
  extendCodecs(extension: ExtendCodecs<C>): BasePlugin<C>;
  /**
   * Declares this plugin's inferred HTML element, property, or mark codec.
   */
  extendHtmlCodec(extension: ExtendHtmlCodec<C>): BasePlugin<C>;
  /**
   * Declares an inferred HTML codec for another typed plugin descriptor.
   */
  extendHtmlCodec<
    const TTarget extends PluginReference & {
      readonly __config: AnyPluginConfig;
    },
  >(
    target: ForeignHtmlCodecTarget<C, TTarget>,
    extension: ExtendForeignHtmlCodec<C, InferConfig<TTarget>>
  ): BasePlugin<C>;
  extendExtension<
    const TExtension extends ContextualPlateEditorExtensionInput<C>,
  >(
    extension: (
      ctx: BasePluginContext<InferPluginBehaviorConfig<C>>
    ) => TExtension | undefined
  ): ExtendedBasePluginWithExtension<
    C,
    ExtensionApiFromArgument<TExtension>,
    ExtensionTxFromArgument<TExtension>,
    ExtensionStateFromArgument<TExtension>
  >;
  extendExtension<const TExtension extends PlateEditorExtensionInput<C>>(
    extension:
      | TExtension
      | ((
          ctx: BasePluginContext<InferPluginBehaviorConfig<C>>
        ) => TExtension | undefined)
  ): ExtendedBasePluginWithExtension<
    C,
    ExtensionApiFromArgument<TExtension>,
    ExtensionTxFromArgument<TExtension>,
    ExtensionStateFromArgument<TExtension>
  >;
  extendExtension<
    const TKey extends string,
    const TExtension extends ContextualPlateEditorExtensionInput<C>,
  >(
    key: TKey,
    extension: (
      ctx: BasePluginContext<InferPluginBehaviorConfig<C>>
    ) => TExtension | undefined
  ): ExtendedBasePluginWithExtension<
    C,
    ExtensionApiFromArgument<TExtension>,
    ExtensionTxFromArgument<TExtension>,
    ExtensionStateFromArgument<TExtension>
  >;
  extendExtension<
    const TKey extends string,
    const TExtension extends PlateEditorExtensionInput<C>,
  >(
    key: TKey,
    extension:
      | TExtension
      | ((
          ctx: BasePluginContext<InferPluginBehaviorConfig<C>>
        ) => TExtension | undefined)
  ): ExtendedBasePluginWithExtension<
    C,
    ExtensionApiFromArgument<TExtension>,
    ExtensionTxFromArgument<TExtension>,
    ExtensionStateFromArgument<TExtension>
  >;
  /**
   * Adds feature API methods published at `editor.api[plugin.key]`.
   * `editor.plugin(plugin).api` exposes the same immutable API for generic code.
   */
  extendApi<
    EA extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: BasePluginContext<C>) => EA
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C> & EA,
      InferEnabled<C>
    >
  >;
  extendEditorApi<
    EA extends Record<
      string,
      ((...args: any[]) => any) | Record<string, (...args: any[]) => any>
    > = Record<string, never>,
  >(
    extension: ExtendEditorApi<C, EA>
  ): BasePlugin<
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
      InferPluginSchemaModel<C>,
      InferPluginApi<C>,
      InferEnabled<C>
    >
  >;
  extendSelectors<
    ES extends Record<string, (...args: any[]) => any> = Record<string, never>,
  >(
    extension: (ctx: BasePluginContext<C>) => ES
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C>,
      ES & InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>,
      InferEnabled<C>
    >
  >;
  extendTx(
    extension: HasOwnPluginTx<C> extends true
      ? ExtendTx<C, PlatePluginTxGroup<OwnPluginTx<C>, C>>
      : never
  ): BasePlugin<C>;
  extendTx<TGroup extends object>(
    extension: ExtendTx<C, PlatePluginTxGroup<TGroup, C>>
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C> & PluginTx<C['key'], TGroup>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>,
      InferEnabled<C>
    >
  >;
  extendTxGroup<
    K extends string,
    TGroup extends PlatePluginTxGroup<any, any> = PlatePluginTxGroup,
  >(
    key: K,
    extension: (
      ctx: BasePluginImplementationContext<C>
    ) => ResolvedPluginTxGroup<C, K, TGroup>
  ): BasePlugin<
    PluginConfig<
      C['key'],
      InferOptions<C>,
      InferApi<C>,
      InferTx<C> &
        PluginTx<K, InferTxGroup<ResolvedPluginTxGroup<C, K, TGroup>>>,
      InferSelectors<C>,
      InferState<C>,
      InferDependencies<C>,
      InferPluginSchemaModel<C>,
      InferPluginApi<C>,
      InferEnabled<C>
    >
  >;
  /** Returns a new instance of the plugin with the component. */
  withComponent(component: NodeComponent): BasePlugin<C>;
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
