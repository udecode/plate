import type {
  DataTransferDecodeContext,
  DataTransferEncodeContext,
} from '../../dom/plite-dom.internal';
import type {
  ContentSlice,
  DefinitionOf as RuntimeDefinitionOf,
  Descendant,
  Element,
  EditorCommitContext,
  RuntimePlugin,
  EditorSchemaPluginProvider,
  RuntimePluginDefinitionInput,
  RuntimePluginReference,
  EditorReadMethodRecord,
  EditorReadMethodTree,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  EditorTransactionChangeContext,
  EditorUpdateContext,
  NodeEntry,
  NodeMatch,
  NodeTypeSelector,
  Path,
  Decoration,
  DecorationAttributes,
  DecorationRefresh,
  PropertyValueDescriptor,
  PropertyValueOf,
  SchemaElementProperty,
  SchemaProperty,
  SchemaTextProperty,
  Text,
  Value,
  EditorSchemaSourceProvider,
  RuntimePluginTypeProviderOf,
  RuntimePluginWitnessFor,
} from '../../facade';
import type { Editor, InternalBaseEditorWithPlugins } from '../editor';
import type {
  InternalSchemaPluginsForPlugin,
  PluginReadCapability,
  PluginReadState,
  PluginTransaction,
  PluginUpdate,
} from '../editor/pluginRuntimeTypes';
import type {
  InputRulesConfig,
  InputRulesDefinition,
} from '../plugins/input-rules/types';
import type {
  HotkeysEvent,
  RenderElementProps,
  StaticRenderLeafProps,
  RenderTextProps,
} from '../types';
import type { AnyObject } from '../types/AnyObject';
import type { Nullable } from '../types/Nullable';
import type {
  BasePluginDependencyDescriptors,
  BasePluginInstalledCapabilityWitness,
  LowerBasePlugin,
} from './basePluginCompiler.internal';
import type { HandlerReturnType } from './HandlerReturnType';
import type { MarkdownNodeMappingInput } from './MarkdownNodeMapping';
import type { PlainTextNodeMappingInput } from './PlainTextNodeMapping';
import type { pluginFormatMapDeclaration } from './pluginAuthoringContext';
import type {
  AnyBasePluginDefinition,
  BaseInjectProps,
  PluginBase,
  PluginBaseContext,
  PluginPortalContext,
  BaseTransformOptions,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  InferApi,
  InferConflicts,
  InferDependencies,
  InferPluginStoreState,
  InferRead,
  InferSelectors,
  InferUpdate,
  NodeComponent,
  BasePluginDefinition,
  BreakRules,
  DeleteRules,
  MergeRules,
  NormalizePluginState,
  NormalizePluginSelectors,
  NormalizeRules,
  PluginReference,
  PluginDefinitionWitness,
  PluginAuthorSchemaView,
  PluginSchema,
  PluginSelectorMethods,
  PluginSelectors,
  SelectionRules,
  WithAnyName,
} from './PluginDefinition';
import type { InternalPluginDefinitionOf } from './pluginDefinitionLookup.internal';
import type {
  MergePluginDefinitions,
  PluginCompatibilityArguments,
  PluginContributionCompatibility,
} from './pluginDefinitionMerge.internal';
import type {
  HtmlMappingDiagnosticInput,
  PluginFormatContext,
  PluginFormatModelView,
} from './PluginFormatContext';
import type { RequiredPluginState } from './pluginInitialState.internal';
import type { ElementWith } from './pluginNodeTypes';
import type {
  InferExactPluginSchemaContribution,
  InferPluginDocumentType,
  InferPluginNodeTypeProvider,
  InferPluginSchema,
  InferPluginSchemaContribution,
} from './pluginSchemaModel.internal';

export type AnyInjectNodeProps = BaseInjectProps & {
  query?: unknown;
  transformClassName?: unknown;
  transformNodeValue?: unknown;
  transformProps?: unknown;
  transformStyle?: unknown;
};

type ResolvePluginSchemaForRead<C extends AnyBasePluginDefinition> =
  C extends Readonly<{ schema: infer TSchema }>
    ? TSchema extends (...args: never[]) => infer TDeclaration
      ? TDeclaration
      : TSchema
    : never;

type PluginReadMethodTree<C extends AnyBasePluginDefinition> =
  ResolvePluginSchemaForRead<C> extends Readonly<{ mark: unknown }>
    ? EditorReadMethodRecord
    : EditorReadMethodTree;

type InferPluginRead<C extends AnyBasePluginDefinition> =
  ResolvePluginSchemaForRead<C> extends Readonly<{ mark: unknown }>
    ? Extract<InferRead<C>, EditorReadMethodRecord>
    : InferRead<C>;
type ErasedPluginInject = {
  excludeBelowPlugins?: ReadonlyArray<PluginReference | string> | null;
  excludePlugins?: ReadonlyArray<PluginReference | string> | null;
  isBlock?: boolean | null;
  isElement?: boolean | null;
  isLeaf?: boolean | null;
  maxLevel?: number | null;
  nodeProps?: AnyInjectNodeProps | null;
};
/** @internal */
export type ErasedPluginCallable<TResult = unknown> = (
  ...args: never[]
) => TResult;
type ErasedDecorate = Readonly<{
  attributes?:
    | DecorationAttributes
    | ErasedPluginCallable<DecorationAttributes>
    | null;
  observe?: ErasedPluginCallable<() => void>;
  read: ErasedPluginCallable<readonly Decoration[]>;
}>;
type ErasedPluginOn = Record<
  string,
  ErasedPluginCallable<HandlerReturnType> | null | undefined
>;
type ErasedPluginRender = {
  attributes?: unknown;
  contentAttributes?: DecorationAttributes | null;
  mark?: Readonly<{
    leafAttributes?: unknown;
    leafComponent?: NodeComponent | null;
    placement?: 'leaf' | 'text' | null;
    textAttributes?: unknown;
  }> | null;
  readsDocument?: boolean | null;
  useViewElementAttributes?: unknown;
};
type ErasedPluginSlots = {
  afterContainer?: NodeComponent | null;
  afterEditable?: NodeComponent | null;
  afterNodeChildren?: ErasedPluginCallable | null;
  beforeContainer?: NodeComponent | null;
  beforeEditable?: NodeComponent | null;
  wrapContent?: NodeComponent<{ children: any }> | null;
  wrapNode?:
    | ErasedPluginCallable
    | Readonly<{
        component: NodeComponent;
        match?: ErasedPluginCallable<boolean>;
      }>
    | null;
  wrapNodeChildren?: ErasedPluginCallable | null;
  wrapRoot?: NodeComponent | null;
};
type ErasedPluginRules = {
  break?: BreakRules<any>;
  delete?: DeleteRules<any>;
  merge?: MergeRules<any>;
  normalize?: NormalizeRules<any>;
  selection?: SelectionRules;
};
/** @internal */
export type ErasedPluginConfigurationLayer =
  | Readonly<{
      kind: 'context';
      value: ErasedPluginCallable<object>;
    }>
  | Readonly<{
      kind: 'object';
      value: object;
    }>;

/** Type-erased boundary for heterogeneous plugin collections. */
type AnyPluginDependencyDescriptor = Readonly<{
  enabled?: boolean;
  name: string;
}>;

export type AnyBasePlugin = {
  activate?: ErasedPluginCallable;
  api?: object | ErasedPluginCallable<object>;
  dataTransferFormats?: object | ErasedPluginCallable<object> | null;
  formats?: object | ErasedPluginCallable<object> | null;
  commands?: ErasedPluginCallable;
  component?: NodeComponent | null;
  configure: ErasedPluginCallable;
  conflicts: readonly AnyPluginDependencyDescriptor[];
  contributions?: readonly unknown[];
  corrections?: readonly unknown[];
  decorate?: ErasedDecorate | null;
  dependencies: readonly AnyPluginDependencyDescriptor[];
  editOnly?: boolean | object;
  effectTypes?: readonly unknown[];
  enabled?: boolean;
  extend: ErasedPluginCallable;
  inject: ErasedPluginInject;
  inputRules: InputRulesDefinition | InputRulesConfig;
  initialState: object;
  name: string;
  on: ErasedPluginOn;
  override: Record<string, ErasedBasePluginOverride>;
  read?: ErasedPluginCallable<EditorReadMethodTree>;
  readMiddleware?: ErasedPluginCallable;
  render: ErasedPluginRender;
  rules: ErasedPluginRules;
  readonly schema: unknown;
  selectors: object;
  shortcuts: Record<string, EditorShortcut | null | undefined>;
  slots: ErasedPluginSlots;
  stateFields?: NonNullable<
    RuntimePluginDefinitionInput<Editor>['stateFields']
  >;
  targetPlugins: ReadonlyArray<PluginReference | string>;
  update?: ErasedPluginCallable<object>;
  validate?: ErasedPluginCallable;
} & PluginReference;
export type AnyPluginBase = Omit<AnyBasePlugin, 'configure' | 'extend'> &
  PluginReference;

/** Type-erased consumer portal for name-only and heterogeneous lookups. */
export type AnyBasePluginPortal = Omit<
  AnyPluginBase,
  'api' | 'read' | 'schema' | 'update'
> & {
  readonly api: object;
  readonly installed: boolean;
  readonly read: EditorReadMethodTree;
  readonly schema?: Readonly<{ key: string }> | Readonly<{ type: string }>;
  readonly store: object;
  readonly update: object;
};

/** Runtime-checked portal returned for name-only plugin lookups. */
export type DynamicBasePluginPortal = Omit<AnyBasePluginPortal, 'schema'> & {
  readonly schema: Readonly<{ key: string; type: string }>;
};

/** Type-erased authoring context used while compiling plugin callbacks. */
export type AnyBasePluginContext = Omit<DynamicBasePluginPortal, 'schema'> & {
  readonly defineFormats: object;
  readonly editor: object;
  readonly plugin: AnyPluginBase;
  readonly schema: PluginAuthorSchemaView;
};

export type Decorate<C extends AnyBasePluginDefinition = BasePluginDefinition> =
  Readonly<{
    /** Pure presentation applied after read. Observation remains owned by observe. */
    attributes?:
      | DecorationAttributes
      | ((
          ctx: BasePluginContext<C> & {
            decoration: Decoration;
            entry: NodeEntry;
          }
        ) => DecorationAttributes)
      | null;
    observe?: (
      ctx: BasePluginContext<C> & {
        refresh: (input: DecorationRefresh) => void;
      }
    ) => () => void;
    read: (
      ctx: BasePluginContext<C> & { entry: NodeEntry }
    ) => readonly Decoration[];
  }>;

type DecorateInput<C extends AnyBasePluginDefinition> = Omit<
  Decorate<C>,
  'read'
> &
  (C extends { decorate: true }
    ? Partial<Pick<Decorate<C>, 'read'>>
    : Pick<Decorate<C>, 'read'>);

// -----------------------------------------------------------------------------

export type ResolvedPlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BasePluginDescriptor<C>;

export type InjectNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BaseInjectProps & {
  query?: (
    options: NonNullable<NonNullable<InjectNodeProps>> &
      BasePluginContext<C> & { nodeProps: GetInjectNodePropsOptions }
  ) => boolean;
  transformClassName?: (options: TransformOptions<C>) => string | undefined;
  transformNodeValue?: (options: TransformOptions<C>) => unknown;
  /** Pure render transform. React hooks are not supported. */
  transformProps?: (
    options: TransformOptions<C> & { props: GetInjectNodePropsReturnType }
  ) => AnyObject | undefined;
  transformStyle?: (options: TransformOptions<C>) => AnyObject;
};

type BaseRenderNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<
  0 extends 1 & C ? AnyBasePluginContext : BasePluginContext<C>,
  'slots'
> & {
  attributes?: AnyObject;
  className?: string;
  nodeProps?: AnyObject;
  style?: AnyObject;
};

export type LeafStaticProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((
      props: BaseRenderNodeProps<C> & StaticRenderLeafProps
    ) => AnyObject | undefined)
  | AnyObject;

export type NodeStaticProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((
      props: BaseRenderNodeProps<C> & RenderElementProps & StaticRenderLeafProps
    ) => AnyObject | undefined)
  | AnyObject;

export type HtmlMatchValue = string | readonly string[];

type HtmlMatcherFields = {
  attributes?: Readonly<Record<string, true | HtmlMatchValue>>;
  className?: string;
  style?: Readonly<Record<string, HtmlMatchValue>>;
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
    | ReadonlyArray<
        HtmlContentToken | HtmlNodeSpec | Readonly<{ text: string }>
      >;
  patchTarget?: true;
  style?: Readonly<Record<string, number | string | null | undefined>>;
  tag: string;
}>;

export type {
  HtmlMappingDiagnosticInput,
  MarkdownMappingDiagnosticInput,
  PluginFormatContext,
  PluginFormatModelView,
  PluginFormatRegistry,
  PluginFormatSchemaView,
} from './PluginFormatContext';

type HtmlPluginFormatContext<C extends AnyBasePluginDefinition> =
  PluginFormatContext<C> &
    Readonly<{
      report: (diagnostic: HtmlMappingDiagnosticInput) => void;
    }>;

type HtmlDecodeContext<C extends AnyBasePluginDefinition> =
  HtmlPluginFormatContext<C> &
    Readonly<{
      element: Readonly<HTMLElement>;
      /**
       * Claim that the decoded result represents these attributes of
       * `element` or of descendants it reads, such as `'data-list-type'`.
       * Claims count only when `decode` returns a result. Parsing reports each
       * attribute Plate's own mappings write that no decoder claims.
       */
      preserve: (...attributes: readonly string[]) => void;
    }>;

type HtmlElementDecodeResult<TProperties extends object> = Readonly<
  Partial<TProperties> & {
    children?: readonly Descendant[];
  }
>;

type HtmlModelContext<
  C extends AnyBasePluginDefinition,
  TNode,
> = HtmlPluginFormatContext<C> &
  Omit<PluginFormatModelView, 'node'> &
  Readonly<{ node: Readonly<TNode> }>;

type HtmlPreserve<C extends AnyBasePluginDefinition> = Readonly<{
  /**
   * Claim that the returned output represents these properties of `node`.
   * Claims count only when the encoder returns output; unclaimed content
   * properties are reported as omitted.
   */
  preserve: (
    ...keys: ReadonlyArray<Extract<keyof HtmlOwnedPropertyMap<C>, string>>
  ) => void;
}>;

type HtmlElementEncodeContext<
  C extends AnyBasePluginDefinition,
  TNode extends Element,
> = HtmlModelContext<C, TNode> &
  HtmlPreserve<C> &
  Readonly<{ content: HtmlContentToken }>;

/**
 * A returned wrapper, or a patch that writes an attribute or style, represents
 * `value`; return `null` to leave it unrepresented.
 */
type HtmlPropertyEncodeContext<
  C extends AnyBasePluginDefinition,
  TNode,
  TValue,
> = HtmlModelContext<C, TNode> & Readonly<{ value: TValue }>;

type HtmlPropertiesEncodeContext<
  C extends AnyBasePluginDefinition,
  TNode,
  TValues extends object,
> = HtmlModelContext<C, TNode> &
  HtmlPreserve<C> &
  Readonly<{ values: Readonly<TValues> }>;

type HtmlRuleDirections<
  TDecodeContext,
  TDecodeResult,
  TEncodeContext,
  TEncodeResult,
> =
  | Readonly<{
      decode: (context: TDecodeContext) => TDecodeResult | undefined;
      decodeOnly?: never;
      encode: (context: TEncodeContext) => TEncodeResult | null;
    }>
  | Readonly<{
      decode: (context: TDecodeContext) => TDecodeResult | undefined;
      decodeOnly: true;
      encode?: never;
    }>;

type HtmlRuleBase = Readonly<{
  match: readonly [HtmlMatcher, ...HtmlMatcher[]];
  priority?: number;
}>;

type HtmlContribution<C extends AnyBasePluginDefinition> =
  InferExactPluginSchemaContribution<C>;

type HtmlContributionElements<C extends AnyBasePluginDefinition> =
  HtmlContribution<C> extends Readonly<{
    elements: infer TElements extends Readonly<
      Record<string, import('../../facade').SchemaElement>
    >;
  }>
    ? TElements
    : Readonly<Record<never, never>>;

type HtmlContributionProperties<C extends AnyBasePluginDefinition> =
  HtmlContribution<C> extends Readonly<{
    properties: ReadonlyArray<infer TProperty extends SchemaProperty>;
  }>
    ? TProperty
    : never;

type HtmlPropertyName<TKey> = TKey extends string ? TKey : never;

type HtmlPropertyMap<TProperty> = Readonly<{
  [
    TMember in TProperty as TMember extends SchemaProperty
      ? HtmlPropertyName<TMember['key']>
      : never
  ]?: TMember extends SchemaProperty
    ? PropertyValueOf<TMember['value']>
    : never;
}>;

type HtmlElementSchema<C extends AnyBasePluginDefinition> =
  InferPluginDocumentType<C> extends keyof HtmlContributionElements<C>
    ? HtmlContributionElements<C>[InferPluginDocumentType<C>]
    : never;

// A plugin without an element schema owns no element properties; checking
// `never` directly would infer a string index from the constraint.
type HtmlElementOwnedProperties<C extends AnyBasePluginDefinition> = [
  HtmlElementSchema<C>,
] extends [never]
  ? Readonly<Record<never, never>>
  : HtmlElementSchema<C> extends Readonly<{
        properties?: infer TProperties extends Readonly<
          Record<string, PropertyValueDescriptor>
        >;
      }>
    ? Readonly<{
        [TKey in keyof TProperties]?: PropertyValueOf<TProperties[TKey]>;
      }>
    : Readonly<Record<never, never>>;

type HtmlOwnedPropertyMap<C extends AnyBasePluginDefinition> =
  HtmlElementOwnedProperties<C> &
    HtmlPropertyMap<HtmlContributionProperties<C>>;

type HtmlHasOnlyExactPropertyKeys<C extends AnyBasePluginDefinition> = [
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

type HtmlSoleExactProperty<C extends AnyBasePluginDefinition> =
  HtmlContributionProperties<C> extends infer TProperty
    ? [TProperty] extends [never]
      ? never
      : IsUnion<TProperty> extends true
        ? never
        : TProperty extends SchemaProperty & { key: string }
          ? TProperty
          : never
    : never;

type HtmlPropertyDecode<C extends AnyBasePluginDefinition> = [
  HtmlSoleExactProperty<C>,
] extends [never]
  ? HtmlPropertyMap<HtmlContributionProperties<C>>
  : HtmlSoleExactProperty<C> extends SchemaProperty
    ? PropertyValueOf<HtmlSoleExactProperty<C>['value']>
    : never;

type HtmlPropertyEncodeContextFor<C extends AnyBasePluginDefinition> = [
  HtmlSoleExactProperty<C>,
] extends [never]
  ? HtmlPropertiesEncodeContext<C, Element, HtmlOwnedPropertyMap<C>>
  : HtmlSoleExactProperty<C> extends SchemaProperty
    ? HtmlPropertyEncodeContext<
        C,
        Element,
        PropertyValueOf<HtmlSoleExactProperty<C>['value']>
      >
    : never;

type HtmlTextEncodeContextFor<C extends AnyBasePluginDefinition> = [
  HtmlSoleExactProperty<C>,
] extends [never]
  ? HtmlPropertiesEncodeContext<C, Text, HtmlOwnedPropertyMap<C>>
  : HtmlSoleExactProperty<C> extends SchemaProperty
    ? HtmlPropertyEncodeContext<
        C,
        Text,
        PropertyValueOf<HtmlSoleExactProperty<C>['value']>
      >
    : never;

type HtmlElementRule<C extends AnyBasePluginDefinition> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlDecodeContext<C>,
    HtmlElementDecodeResult<HtmlOwnedPropertyMap<C>>,
    HtmlElementEncodeContext<
      C,
      Element &
        Readonly<{ type: InferPluginDocumentType<C> }> &
        HtmlOwnedPropertyMap<C>
    >,
    HtmlNodeSpec
  > & {
    createsElement?: never;
  };

type HtmlElementPropertyRule<C extends AnyBasePluginDefinition> = HtmlRuleBase &
  (HtmlElementPropertyPatchRule<C> | HtmlElementPropertyCreateRule<C>);

type HtmlElementPropertyPatchRule<C extends AnyBasePluginDefinition> =
  HtmlRuleBase &
    HtmlRuleDirections<
      HtmlDecodeContext<C>,
      HtmlPropertyDecode<C>,
      HtmlPropertyEncodeContextFor<C>,
      HtmlElementPatch
    > & {
      createsElement?: never;
    };

type HtmlElementPropertyCreateRule<C extends AnyBasePluginDefinition> =
  HtmlRuleBase &
    HtmlRuleDirections<
      HtmlDecodeContext<C>,
      HtmlElementDecodeResult<HtmlOwnedPropertyMap<C>>,
      HtmlElementEncodeContext<C, Element & HtmlOwnedPropertyMap<C>>,
      HtmlNodeSpec
    > & {
      /**
       * Matched content becomes the plugin's primary target, the schema's
       * default block when that is a target, carrying the decoded properties;
       * a matched element holding exactly one block those properties apply to
       * carries them on that block instead. Encoding writes the output in
       * place of the primary target's element and around the HTML of every
       * other target.
       */
      createsElement: true;
    };

type HtmlTextPropertyRule<C extends AnyBasePluginDefinition> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlDecodeContext<C>,
    HtmlPropertyDecode<C>,
    HtmlTextEncodeContextFor<C>,
    HtmlWrapperSpec
  > & {
    createsElement?: never;
  };

type HtmlForeignElementPropertyRule<C extends AnyBasePluginDefinition> =
  HtmlRuleBase &
    HtmlRuleDirections<
      HtmlDecodeContext<C>,
      HtmlPropertyDecode<C>,
      HtmlPropertyEncodeContextFor<C>,
      HtmlElementPatch
    > & {
      createsElement?: never;
    };

type HtmlSelfRule<C extends AnyBasePluginDefinition> =
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
        ? C extends Readonly<{
            schema: Readonly<{ element: unknown }>;
          }>
          ? HtmlElementRule<C>
          : HtmlElementPropertyRule<C>
        : never;

type HtmlSelfNonCreatingRule<C extends AnyBasePluginDefinition> =
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

type HtmlForeignRule<C extends AnyBasePluginDefinition> =
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

type ForeignHtmlMappingTarget<
  C extends AnyBasePluginDefinition,
  TTarget extends PluginReference,
> = TTarget['name'] extends C['name'] ? never : TTarget;

type ForeignFormatDefinition<
  C extends AnyBasePluginDefinition,
  TTarget extends AnyBasePlugin & PluginReference,
  TTargetDefinition extends AnyBasePluginDefinition =
    InternalPluginDefinitionOf<TTarget>,
> = Omit<C, 'name' | 'schema'> &
  Readonly<{
    formatOwnerName: C['name'];
    name: TTargetDefinition['name'];
  }> &
  ('schema' extends keyof C
    ? 'schema' extends keyof TTargetDefinition
      ? Readonly<{
          schema: C['schema'] & TTargetDefinition['schema'];
        }>
      : Pick<C, 'schema'>
    : 'schema' extends keyof TTargetDefinition
      ? Pick<TTargetDefinition, 'schema'>
      : Readonly<Record<never, never>>);

/** Static context for declaring schema-owned format mappings. */
export type PluginFormatAuthoringContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Readonly<{
  defineFormats: DefinePluginFormats<C>;
  schema: PluginAuthorSchemaView<C>;
}>;

export type PluginDataTransferDecodeContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = DataTransferDecodeContext & PluginFormatContext<C>;

export type PluginDataTransferEncodeContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = DataTransferEncodeContext & PluginFormatContext<C>;

export type PluginDataTransferFormatDeclaration<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Readonly<{
  accept?: (context: PluginDataTransferDecodeContext<C>) => boolean;
  decode?: (context: PluginDataTransferDecodeContext<C>) => ContentSlice | null;
  encode?: (context: PluginDataTransferEncodeContext<C>) => string | null;
  key?: never;
  mimeType: string;
  owner?: never;
  priority?: number;
  scope?: 'document';
  target?: never;
}>;

/** Schema format mappings registered through `defineFormats`. */
export interface PluginProductNodeMappingRegistry<
  C extends AnyBasePluginDefinition,
> {
  plainText: PlainTextNodeMappingInput<C>;
  markdown: MarkdownNodeMappingInput<C>;
}

type PluginProductNodeMappingMap<C extends AnyBasePluginDefinition> = Readonly<
  Partial<PluginProductNodeMappingRegistry<C>>
>;

type PluginProductNodeMappingOnlyMap<C extends AnyBasePluginDefinition> = {
  [TFormat in keyof PluginProductNodeMappingRegistry<C>]: Readonly<
    Pick<PluginProductNodeMappingRegistry<C>, TFormat> &
      Partial<Omit<PluginProductNodeMappingRegistry<C>, TFormat>> & {
        html?: never;
      }
  >;
}[keyof PluginProductNodeMappingRegistry<C>];

type PluginSelfHtmlMapping<C extends AnyBasePluginDefinition> =
  HtmlSelfRule<C> & {
    target?: never;
  };

type HtmlPrepareDocument<C extends AnyBasePluginDefinition> = Readonly<{
  prepareDocument?: (
    context: HtmlPluginFormatContext<C> & Readonly<{ document: Document }>
  ) => void;
}>;

type PluginHtmlMappingInput<C extends AnyBasePluginDefinition, TRule> = TRule &
  HtmlPrepareDocument<C>;

export type PluginSelfHtmlMappingMap<C extends AnyBasePluginDefinition> =
  Readonly<{
    html:
      | PluginHtmlMappingInput<C, PluginSelfHtmlMapping<C>>
      | readonly [
          PluginHtmlMappingInput<C, PluginSelfHtmlMapping<C>>,
          ...Array<PluginHtmlMappingInput<C, PluginSelfHtmlMapping<C>>>,
        ];
  }>;

type PluginSelfHtmlElementPropertyMappingMap<
  C extends AnyBasePluginDefinition,
  TRule,
> =
  C extends Readonly<{
    targetPlugins: ReadonlyArray<PluginReference | string>;
  }>
    ? [HtmlContributionProperties<C>] extends [never]
      ? never
      : [
            Exclude<HtmlContributionProperties<C>, SchemaElementProperty>,
          ] extends [never]
        ? Readonly<{
            html:
              | PluginHtmlMappingInput<C, TRule>
              | readonly [
                  PluginHtmlMappingInput<C, TRule>,
                  ...Array<PluginHtmlMappingInput<C, TRule>>,
                ];
            markdown?: never;
          }>
        : never
    : never;

type PluginSelfHtmlMappingMapForRule<
  C extends AnyBasePluginDefinition,
  TRule,
> = Readonly<{
  html:
    | PluginHtmlMappingInput<C, TRule>
    | readonly [
        PluginHtmlMappingInput<C, TRule>,
        ...Array<PluginHtmlMappingInput<C, TRule>>,
      ];
  markdown?: never;
}>;

type PluginTargetedHtmlCreateMappingMap<C extends AnyBasePluginDefinition> =
  C extends Readonly<{ targetPlugins: ReadonlyArray<PluginReference | string> }>
    ? PluginSelfHtmlMappingMapForRule<C, HtmlElementPropertyCreateRule<C>>
    : never;

type PluginTargetedHtmlMixedMappingMap<C extends AnyBasePluginDefinition> =
  C extends Readonly<{ targetPlugins: ReadonlyArray<PluginReference | string> }>
    ? Readonly<{
        html: readonly [
          PluginHtmlMappingInput<C, HtmlElementPropertyCreateRule<C>>,
          PluginHtmlMappingInput<C, HtmlSelfNonCreatingRule<C>>,
          ...Array<PluginHtmlMappingInput<C, HtmlSelfNonCreatingRule<C>>>,
        ];
        markdown?: never;
      }>
    : never;

type PluginSelfHtmlProductNodeMappingMap<C extends AnyBasePluginDefinition> =
  PluginSelfHtmlMappingMap<C> &
    Readonly<{
      plainText?: PlainTextNodeMappingInput<C>;
      markdown: MarkdownNodeMappingInput<C>;
    }>;

export type PluginForeignHtmlMappingMap<
  C extends AnyBasePluginDefinition,
  TTarget extends AnyBasePlugin & PluginReference,
> = Readonly<{
  html:
    | (HtmlForeignRule<ForeignFormatDefinition<C, NoInfer<TTarget>>> & {
        target: ForeignHtmlMappingTarget<C, TTarget>;
      })
    | readonly [
        HtmlForeignRule<ForeignFormatDefinition<C, NoInfer<TTarget>>> & {
          target: ForeignHtmlMappingTarget<C, TTarget>;
        },
        ...Array<
          HtmlForeignRule<ForeignFormatDefinition<C, NoInfer<TTarget>>> & {
            target: ForeignHtmlMappingTarget<C, TTarget>;
          }
        >,
      ];
}>;

type PluginForeignHtmlMappingInput<
  C extends AnyBasePluginDefinition,
  TTarget extends AnyBasePlugin & PluginReference,
> = Readonly<{
  html:
    | PluginHtmlMappingInput<
        ForeignFormatDefinition<C, NoInfer<TTarget>>,
        HtmlForeignRule<ForeignFormatDefinition<C, NoInfer<TTarget>>>
      >
    | readonly [
        PluginHtmlMappingInput<
          ForeignFormatDefinition<C, NoInfer<TTarget>>,
          HtmlForeignRule<ForeignFormatDefinition<C, NoInfer<TTarget>>>
        >,
        ...Array<
          PluginHtmlMappingInput<
            ForeignFormatDefinition<C, NoInfer<TTarget>>,
            HtmlForeignRule<ForeignFormatDefinition<C, NoInfer<TTarget>>>
          >
        >,
      ];
}>;

/** Schema-checked format map produced by `defineFormats`. */
export type PluginFormatMapDeclaration = Readonly<Record<string, unknown>> & {
  readonly [pluginFormatMapDeclaration]: true;
};

/** Context-bound format definition with exact owner and foreign-target typing. */
export type DefinePluginFormats<C extends AnyBasePluginDefinition> = {
  // Separate overloads preserve exact self-mapping inference.
  bivarianceHack(
    formats: PluginSelfHtmlProductNodeMappingMap<C>
  ): PluginFormatMapDeclaration;
  bivarianceHack(
    formats: PluginTargetedHtmlCreateMappingMap<C>
  ): PluginFormatMapDeclaration;
  bivarianceHack(
    formats: PluginTargetedHtmlMixedMappingMap<C>
  ): PluginFormatMapDeclaration;
  bivarianceHack(
    formats: PluginSelfHtmlMappingMapForRule<C, HtmlSelfNonCreatingRule<C>>
  ): PluginFormatMapDeclaration;
  bivarianceHack(
    formats: PluginSelfHtmlElementPropertyMappingMap<
      C,
      HtmlElementPropertyCreateRule<C>
    >
  ): PluginFormatMapDeclaration;
  bivarianceHack(
    formats: PluginProductNodeMappingOnlyMap<C>
  ): PluginFormatMapDeclaration;
  bivarianceHack<const TTarget extends AnyBasePlugin & PluginReference>(
    target: TTarget,
    formats:
      | PluginForeignHtmlMappingInput<C, TTarget>
      | PluginProductNodeMappingMap<
          ForeignFormatDefinition<C, NoInfer<TTarget>>
        >
  ): PluginFormatMapDeclaration;
}['bivarianceHack'];

export type PartialBasePlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<
  Partial<PluginBase<C>>,
  'decorate' | 'initialState' | 'render' | 'slots'
> & {
  decorate?: DecorateInput<C> | null;
  initialState?: Partial<InferPluginStoreState<C>>;
  render?: Partial<NonNullable<BasePluginAuthorFields<C>['render']>>;
  slots?: Partial<NonNullable<BasePluginAuthorFields<C>['slots']>>;
};

/**
 * Type-erased weak override carried by plugin descriptors.
 *
 * Keep this boundary independent from `BasePlugin`: descriptors contain weak
 * overrides, so deriving their stored value from `BasePlugin` would make the
 * public generic below recursively expand itself.
 */
type ErasedBasePluginOverride = Partial<{
  component: NodeComponent;
  decorate: unknown;
  editOnly: unknown;
  enabled: boolean;
  inject: object;
  inputRules: unknown;
  initialState: object;
  on: object;
  render: object;
  rules: object;
  selectors: object;
  shortcuts: object;
  slots: object;
  targetPlugins: ReadonlyArray<PluginReference | string>;
}>;

/**
 * Configuration-only patch for an already-installed foreign plugin.
 *
 * The target name cannot provide target-specific inference. Pass the target
 * config type explicitly when exact initial-state checking is required.
 */
export type BasePluginOverride<
  C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = Omit<
  PartialBasePlugin<C>,
  'configure' | 'dependencies' | 'extend' | 'name' | 'override' | 'schema'
>;

type RenderStaticNodeWrapperSource = AnyBasePluginDefinition | AnyBasePlugin;

type RenderStaticNodeWrapperDefinition<
  TSource extends RenderStaticNodeWrapperSource,
> = 0 extends 1 & TSource
  ? any
  : TSource extends AnyBasePluginDefinition
    ? TSource
    : Extract<InternalPluginDefinitionOf<TSource>, AnyBasePluginDefinition>;

export type RenderStaticNodeWrapper<
  TSource extends RenderStaticNodeWrapperSource = any,
> = {
  bivarianceHack(
    props: RenderStaticNodeWrapperProps<TSource>
  ): RenderStaticNodeWrapperFunction<TSource>;
}['bivarianceHack'];

export type RenderStaticNodeWrapperFunction<
  TSource extends RenderStaticNodeWrapperSource = any,
> =
  | {
      bivarianceHack(hocProps: RenderStaticNodeWrapperProps<TSource>): any;
    }['bivarianceHack']
  | null
  | undefined;

export type RenderStaticNodeWrapperProps<
  TSource extends RenderStaticNodeWrapperSource = any,
> =
  RenderStaticNodeWrapperDefinition<TSource> extends infer C extends
    AnyBasePluginDefinition
    ? BaseRenderNodeProps<C> &
        RenderElementProps<
          0 extends 1 & TSource ? Element : ElementWith<WithAnyName<C>>
        > & {
          path: Path;
        }
    : never;

/** Cache the full invariant editor shape across author callback comparisons. */
export interface BasePluginContextEditor<
  in out C extends AnyBasePluginDefinition = BasePluginDefinition,
> extends InternalBaseEditorWithPlugins<Value, C> {}

export type BasePluginImplementationContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PluginBaseContext<C> & {
  editor: BasePluginContextEditor<C>;
  plugin: ResolvedPlugin<C>;
};

type BasePluginLifecycleContext<
  C extends AnyBasePluginDefinition,
  TContext extends { editor: object },
> = Omit<TContext, 'editor' | 'tx'> &
  BasePluginContext<C> & {
    editor: BasePluginContextEditor<C>;
    plugin: ResolvedPlugin<C>;
  } & ('tx' extends keyof TContext
    ? Readonly<{
        tx: PluginTransaction<C>;
      }>
    : {});

export type BasePluginOn<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Readonly<{
  commit?: (
    context: BasePluginLifecycleContext<
      C,
      EditorCommitContext<BasePluginContextEditor<C>>
    >
  ) => void;
  nodeChange?: (
    context: BasePluginLifecycleContext<
      C,
      EditorNodeChangeContext<BasePluginContextEditor<C>>
    >
  ) => void;
  textChange?: (
    context: BasePluginLifecycleContext<
      C,
      EditorTextChangeContext<BasePluginContextEditor<C>>
    >
  ) => void;
  transactionChange?: (
    context: BasePluginLifecycleContext<
      C,
      EditorTransactionChangeContext<BasePluginContextEditor<C>>
    >
  ) => void;
}>;

type BaseRuntimePluginFields<C extends AnyBasePluginDefinition> = Omit<
  RuntimePluginDefinitionInput<BasePluginContextEditor<C>>,
  | 'api'
  | 'conflicts'
  | 'corrections'
  | 'dependencies'
  | 'enabled'
  | 'name'
  | 'on'
  | 'read'
  | 'schema'
  | 'update'
>;

type BaseNativeCorrection<C extends AnyBasePluginDefinition> = NonNullable<
  RuntimePluginDefinitionInput<BasePluginContextEditor<C>>['corrections']
>[number];

type BaseNativeCorrectionContext<C extends AnyBasePluginDefinition> =
  Parameters<BaseNativeCorrection<C>['correct']>[0];

type BasePluginCorrectionType =
  | NodeTypeSelector
  | PluginReference
  | ReadonlyArray<NodeTypeSelector | PluginReference>;

type BasePluginCorrection<C extends AnyBasePluginDefinition> = Omit<
  BaseNativeCorrection<C>,
  'correct' | 'query'
> & {
  correct: (
    context: Omit<BaseNativeCorrectionContext<C>, 'tx'> & {
      tx: BaseNativeCorrectionContext<C>['tx'] & PluginTransaction<C>;
    }
  ) => void;
  query?:
    | 'root'
    | Readonly<{
        match?: NodeMatch;
        type?: BasePluginCorrectionType;
      }>;
};

type BasePluginAuthorFields<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<PluginBase<C>, 'dependencies' | 'render' | 'slots'> &
  BaseRuntimePluginFields<C> & {
    api?: (context: BasePluginContext<C>) => InferApi<C>;
    conflicts: BasePluginDependencyDescriptors<InferConflicts<C>>;
    corrections?: ReadonlyArray<BasePluginCorrection<C>>;
    dependencies: BasePluginDependencyDescriptors<InferDependencies<C>>;
    on: BasePluginOn<C>;
    read?: (
      context: BasePluginContext<C> & {
        state: PluginReadState<C>;
      }
    ) => InferPluginRead<C>;
    update?: (
      context: BasePluginContext<C> & {
        context: EditorUpdateContext;
        tx: PluginTransaction<C>;
      }
    ) => InferUpdate<C>;
  } & Nullable<{
    dataTransferFormats?: ReadonlyArray<PluginDataTransferFormatDeclaration<C>>;
    formats?:
      | PluginFormatMapDeclaration
      | ((
          context: PluginFormatAuthoringContext<C>
        ) => PluginFormatMapDeclaration);
    decorate?: Decorate<C>;
  }> &
  BasePluginMethods<C> & {
    inject: Nullable<{
      nodeProps?: InjectNodeProps<C>;
    }>;
    /**
     * Weakly adapts already-installed foreign plugins by name.
     *
     * Missing targets are ignored. Direct target configuration remains the
     * authoritative, inferred path.
     */
    override: Record<string, ErasedBasePluginOverride>;
    render: Nullable<{
      /** Adds attributes to the primary element, leaf, or text renderer. */
      attributes?: NodeStaticProps<WithAnyName<C>>;
      /**
       * Adds static presentation to the existing live and static content root.
       * Enabled plugins compose in compiled order: classes append, styles
       * merge, and later attributes win. Explicit content props apply last.
       * Core identity and editable-state attributes are reserved. Use `null`
       * to clear inherited configuration; use slots for actual structure.
       */
      contentAttributes?: DecorationAttributes;
      /** Configures rendering for a schema mark. */
      mark?:
        | Readonly<{
            /** Adds attributes to the leaf host while the mark is active. */
            leafAttributes?: LeafStaticProps<WithAnyName<C>>;
            leafComponent?: never;
            /** The primary component renders around each leaf by default. */
            placement?: 'leaf';
            /** Adds attributes to the text host while the mark is active. */
            textAttributes?: TextStaticProps<WithAnyName<C>>;
          }>
        | Readonly<{
            /** Adds attributes to the leaf host while the mark is active. */
            leafAttributes?: LeafStaticProps<WithAnyName<C>>;
            /** Optional secondary component rendered around active leaves. */
            leafComponent?: NodeComponent;
            /** The primary component renders once around the text node. */
            placement: 'text';
            /** Adds attributes to the text host while the mark is active. */
            textAttributes?: TextStaticProps<WithAnyName<C>>;
          }>;
      /**
       * Whether rendering this plugin's element reads content after the
       * element, such as a table of contents listing every heading. Static
       * rendering reuses a block while it and every block before it are
       * unchanged; these elements render again whenever the document changes.
       */
      readsDocument?: boolean;
    }>;
    slots: Omit<PluginBase<C>['slots'], 'wrapContent' | 'wrapRoot'> &
      Nullable<{
        /** Renders a component after the main editor container. */
        afterContainer?: () => any;
        /** Renders a component after the Editable. */
        afterEditable?: () => any;
        /** Renders content after a node's children. */
        afterNodeChildren?: (props: RenderStaticNodeWrapperProps<C>) => any;
        /** Renders a component before the main editor container. */
        beforeContainer?: () => any;
        /** Renders a component before the Editable. */
        beforeEditable?: () => any;
        /** Wraps the Editable content and its lifecycle effects. */
        wrapContent?: NodeComponent<{ children: any }>;
        /** Wraps a rendered node. */
        wrapNode?: RenderStaticNodeWrapper<C>;
        /** Wraps a rendered node's children. */
        wrapNodeChildren?: RenderStaticNodeWrapper<C>;
        /** Wraps the complete editor root for this view. */
        wrapRoot?: NodeComponent<{ children: any }>;
      }>;
    /**
     * Keyboard shortcuts configuration mapping shortcut names to their key
     * combinations and handlers. Each shortcut can link to a public update
     * command, an API method, or use a custom handler function.
     */
    shortcuts: Record<string, EditorShortcut | null | undefined>;
    inputRules: InputRulesDefinition | InputRulesConfig;
  };

type ProjectBasePluginFields<C extends AnyBasePluginDefinition> = Readonly<{
  [
    TKey in Extract<
      Exclude<keyof C, BasePluginRuntimeField | 'decorate'>,
      keyof BasePluginAuthorFields<C>
    >
  ]-?: Exclude<BasePluginAuthorFields<C>[TKey], undefined>;
}>;

type ProjectBasePluginContextualFields<C extends AnyBasePluginDefinition> =
  Readonly<{
    [TKey in Extract<keyof C, 'decorate'>]-?: Exclude<
      BasePluginAuthorFields<C>[TKey],
      undefined
    >;
  }>;

type BasePluginRuntimeField =
  | 'conflicts'
  | 'dependencies'
  | 'inject'
  | 'initialState'
  | 'inputRules'
  | 'on'
  | 'override'
  | 'render'
  | 'rules'
  | 'schema'
  | 'selectors'
  | 'shortcuts'
  | 'slots'
  | 'targetPlugins';

type BasePluginRuntimeShell<C extends AnyBasePluginDefinition> = Pick<
  BasePluginAuthorFields<C>,
  Exclude<BasePluginRuntimeField, 'inject' | 'on' | 'render' | 'slots'>
>;

/** Context-bound fields kept outside the renderer-neutral core. */
type BasePluginContextualDescriptor<C extends AnyBasePluginDefinition> = Pick<
  BasePluginAuthorFields<C>,
  'inject' | 'on' | 'render' | 'slots'
> &
  ProjectBasePluginContextualFields<C>;

/** Nominal identity carried across renderer adapters. */
type BasePluginDescriptorCarrier<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = RuntimePluginWitnessFor<() => LowerBasePlugin<C>> &
  BasePluginInstalledCapabilityWitness<C> &
  InferPluginNodeTypeProvider<C> &
  EditorSchemaPluginProvider<() => InternalSchemaPluginsForPlugin<C>> &
  EditorSchemaSourceProvider<() => InferPluginSchemaContribution<C>> &
  PluginReference<C['name']> &
  PluginDefinitionWitness<C>;

/** Structural runtime fields shared by Base and React descriptors. */
type BasePluginRuntimeDescriptor<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<
  RuntimePlugin<LowerBasePlugin<C>>,
  | 'api'
  | 'conflicts'
  | 'decorate'
  | 'dependencies'
  | 'inject'
  | 'name'
  | 'on'
  | 'read'
  | 'render'
  | 'schema'
  | 'update'
> &
  BasePluginRuntimeShell<C> &
  ProjectBasePluginFields<C>;

/** Method-free renderer-neutral descriptor projection. */
type BasePluginDescriptor<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BasePluginDescriptorCarrier<C> &
  BasePluginRuntimeDescriptor<C> &
  BasePluginContextualDescriptor<C>;

type BasePluginRuntime = Omit<
  AnyBasePlugin,
  | 'api'
  | 'configure'
  | 'conflicts'
  | 'dependencies'
  | 'enabled'
  | 'extend'
  | 'initialState'
  | 'key'
  | 'name'
  | 'read'
  | 'schema'
  | 'selectors'
  | 'targetPlugins'
  | 'type'
  | 'update'
>;

/** Exact Plate plugin descriptor with schema, behavior, and rendering. */
export interface BasePlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
>
  extends
    BasePluginRuntime,
    BasePluginMethods<C>,
    RuntimePluginWitnessFor<() => LowerBasePlugin<C>>,
    BasePluginInstalledCapabilityWitness<C>,
    InferPluginNodeTypeProvider<C>,
    EditorSchemaPluginProvider<() => InternalSchemaPluginsForPlugin<C>>,
    EditorSchemaSourceProvider<() => InferPluginSchemaContribution<C>>,
    PluginReference<C['name']>,
    PluginDefinitionWitness<C> {
  api?: (context: BasePluginContext<C>) => InferApi<C>;
  readonly conflicts: BasePluginDependencyDescriptors<InferConflicts<C>>;
  dependencies: BasePluginDependencyDescriptors<InferDependencies<C>>;
  readonly initialState: InferPluginStoreState<C>;
  readonly name: C['name'];
  read?: (
    context: BasePluginContext<C> & {
      state: PluginReadState<C>;
    }
  ) => InferPluginRead<C>;
  readonly schema: InferPluginSchema<C>;
  readonly selectors: InferSelectors<C>;
  readonly targetPlugins: C extends {
    targetPlugins: infer TTargetPlugins extends ReadonlyArray<
      PluginReference | string
    >;
  }
    ? TTargetPlugins
    : readonly [];
  update?: (
    context: BasePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PluginTransaction<C>;
    }
  ) => InferUpdate<C>;
}

type BasePluginInputFields<C extends AnyBasePluginDefinition> = Omit<
  Partial<BasePluginAuthorFields<C>>,
  | keyof BasePluginMethods<C>
  | 'api'
  | 'dependencies'
  | 'initialState'
  | 'key'
  | 'name'
  | 'read'
  | 'schema'
  | 'type'
  | 'update'
> & {
  api?: (context: BasePluginContext<C>) => InferApi<C>;
  dependencies?: InferDependencies<C>;
  initialState?:
    | Partial<InferPluginStoreState<C>>
    | ((context: BasePluginContext<C>) => InferPluginStoreState<C>);
  name: C['name'];
  read?: (
    context: BasePluginContext<C> & {
      state: PluginReadState<C>;
    }
  ) => InferPluginRead<C>;
  schema?: PluginSchema<C> | null;
  update?: (
    context: BasePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PluginTransaction<C>;
    }
  ) => InferUpdate<C>;
};

export type BasePluginDefinitionInput<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BasePluginInputFields<C> & Readonly<{ component?: NodeComponent }>;

type BasePluginStageObject<C extends AnyBasePluginDefinition> = Omit<
  BasePluginInputFields<C>,
  | 'api'
  | 'decorate'
  | 'dependencies'
  | 'initialState'
  | 'key'
  | 'name'
  | 'read'
  | 'schema'
  | 'selectors'
  | 'type'
  | 'update'
> & {
  api?: (context: BasePluginContext<C>) => object;
  decorate?: DecorateInput<C>;
  component?: never;
  initialState?: object | ((context: BasePluginContext<C>) => object);
  read?: (
    context: BasePluginContext<C> & {
      state: PluginReadState<C>;
    }
  ) => PluginReadMethodTree<C>;
  selectors?: PluginSelectors<InferPluginStoreState<C>>;
  update?: (
    context: BasePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PluginTransaction<C>;
    }
  ) => object;
};

type BasePluginShortcutRecord = Record<
  string,
  EditorShortcut | null | undefined
>;

type BasePluginStageConflictInput<TNames extends readonly string[]> = {
  readonly [TIndex in keyof TNames]: (
    | RuntimePluginReference
    | PluginReference
  ) &
    Readonly<{ name: TNames[TIndex] }>;
};

type BasePluginStageInput<
  C extends AnyBasePluginDefinition,
  TKeys extends keyof BasePluginStageObject<C>,
  S extends object,
  TApi extends object,
  TRead extends PluginReadMethodTree<C>,
  TSelectors extends PluginSelectors<InferPluginStoreState<C>>,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
  TShortcuts extends BasePluginShortcutRecord,
> = Readonly<Record<TKeys, unknown>> &
  Pick<BasePluginStageObject<C>, Exclude<TKeys, BasePluginStageSpecialKey>> &
  Readonly<{
    api?: (context: BasePluginContext<C>) => TApi;
    conflicts?: BasePluginStageConflictInput<TConflictNames>;
    decorate?: DecorateInput<C>;
    enabled?: TEnabled;
    initialState?:
      | (S & RequiredPluginState<NoInfer<S>>)
      | ((
          context: BasePluginContext<C>
        ) => S & RequiredPluginState<NoInfer<S>>);
    read?: (
      context: BasePluginContext<C> & {
        state: PluginReadState<C>;
      }
    ) => TRead;
    selectors?: TSelectors & PluginSelectors<InferPluginStoreState<C>>;
    shortcuts?: PluginShortcutInput<C, TShortcuts>;
    targetPlugins?: TTargetPlugins;
    update?: (
      context: BasePluginContext<C> & {
        context: EditorUpdateContext;
        tx: PluginTransaction<C>;
      }
    ) => TUpdate;
  }>;

type BasePluginStageCompatibility<
  C extends AnyBasePluginDefinition,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
> = PluginContributionCompatibility<InferApi<C>, TApi> &
  PluginContributionCompatibility<InferPluginStoreState<C>, S> &
  PluginContributionCompatibility<InferRead<C>, TRead> &
  PluginContributionCompatibility<InferSelectors<C>, TSelectors> &
  PluginContributionCompatibility<InferUpdate<C>, TUpdate>;

type BasePluginRuntimeCompatibility<
  C extends AnyBasePluginDefinition,
  TPlugin extends RuntimePluginReference,
> = PluginContributionCompatibility<
  InferApi<C>,
  InferApi<PluginStageResult<TPlugin>>
> &
  PluginContributionCompatibility<
    InferRead<C>,
    InferRead<PluginStageResult<TPlugin>>
  > &
  PluginContributionCompatibility<
    InferUpdate<C>,
    InferUpdate<PluginStageResult<TPlugin>>
  >;

export type BasePluginExtendInput<C extends AnyBasePluginDefinition> =
  | BasePluginStageObject<C>
  | RuntimePluginReference
  | ((
      context: BasePluginContext<C>
    ) => BasePluginStageObject<C> | RuntimePluginReference);

type PluginStageResult<TInput> = TInput extends (
  ...args: any[]
) => infer TResult
  ? PluginStageResult<TResult>
  : TInput extends RuntimePluginReference
    ? Omit<RuntimeDefinitionOf<TInput>, 'conflicts' | 'dependencies' | 'name'>
    : TInput;

/**
 * Exact result of extending one Base descriptor with a runtime plugin.
 *
 * @internal
 */
export type InternalBasePluginRuntimeExtension<
  TSource,
  C extends AnyBasePluginDefinition,
  TPlugin extends RuntimePluginReference,
> = BasePlugin<
  MergePluginDefinitions<
    C,
    PluginStageResult<TPlugin>,
    PluginStageResult<TPlugin>
  >
> &
  RuntimePluginTypeProviderOf<TSource> &
  RuntimePluginTypeProviderOf<TPlugin>;

type NonCallbackPlugin<TPlugin> = TPlugin extends (...args: never[]) => unknown
  ? never
  : TPlugin;

type BasePluginStageSpecialKey =
  | 'api'
  | 'conflicts'
  | 'decorate'
  | 'enabled'
  | 'initialState'
  | 'read'
  | 'selectors'
  | 'shortcuts'
  | 'targetPlugins'
  | 'update';

type BasePluginStageConflictReferences<TNames extends readonly string[]> = {
  readonly [TIndex in keyof TNames]: PluginReference<
    Extract<TNames[TIndex], string>
  >;
};

type BasePluginStageContribution<
  TKeys extends PropertyKey,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends object,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string>,
> = Readonly<{
  [TKey in Exclude<TKeys, BasePluginStageSpecialKey>]: true;
}> &
  ('initialState' extends TKeys
    ? Readonly<{ initialState: NormalizePluginState<S> }>
    : Readonly<Record<never, never>>) &
  ('api' extends TKeys
    ? Readonly<{ api: TApi }>
    : Readonly<Record<never, never>>) &
  ('read' extends TKeys
    ? Readonly<{ read: TRead }>
    : Readonly<Record<never, never>>) &
  ('selectors' extends TKeys
    ? Readonly<{ selectors: TSelectors }>
    : Readonly<Record<never, never>>) &
  ('update' extends TKeys
    ? Readonly<{ update: TUpdate }>
    : Readonly<Record<never, never>>) &
  ('decorate' extends TKeys
    ? Readonly<{ decorate: true }>
    : Readonly<Record<never, never>>) &
  ('conflicts' extends TKeys
    ? Readonly<{
        conflicts: BasePluginStageConflictReferences<TConflictNames>;
      }>
    : Readonly<Record<never, never>>) &
  ('enabled' extends TKeys
    ? Readonly<{ enabled: TEnabled }>
    : Readonly<Record<never, never>>) &
  ('targetPlugins' extends TKeys
    ? Readonly<{ targetPlugins: TTargetPlugins }>
    : Readonly<Record<never, never>>) &
  ('shortcuts' extends TKeys
    ? Readonly<{ shortcuts: true }>
    : Readonly<Record<never, never>>);

type BasePluginStageDefinition<
  C extends AnyBasePluginDefinition,
  TKeys extends PropertyKey,
  S extends object = {},
  TApi extends object = {},
  TRead extends object = {},
  TSelectors extends object = {},
  TUpdate extends object = {},
  TConflictNames extends readonly string[] = readonly [],
  TEnabled extends boolean = boolean,
  TTargetPlugins extends ReadonlyArray<PluginReference | string> = readonly [],
> = MergePluginDefinitions<
  C,
  BasePluginStageContribution<
    TKeys,
    S,
    TApi,
    TRead,
    NormalizePluginSelectors<
      NormalizePluginState<
        Extract<InferPluginStoreState<C>, object> &
          Omit<S, keyof Extract<InferPluginStoreState<C>, object>>
      >,
      PluginSelectorMethods<TSelectors>
    >,
    TUpdate,
    TConflictNames,
    TEnabled,
    TTargetPlugins
  >,
  BasePluginStageContribution<
    TKeys,
    S,
    TApi,
    TRead,
    NormalizePluginSelectors<
      NormalizePluginState<
        Extract<InferPluginStoreState<C>, object> &
          Omit<S, keyof Extract<InferPluginStoreState<C>, object>>
      >,
      PluginSelectorMethods<TSelectors>
    >,
    TUpdate,
    TConflictNames,
    TEnabled,
    TTargetPlugins
  >
>;

export type BasePluginConfiguration<C extends AnyBasePluginDefinition> = Omit<
  BasePluginInputFields<C>,
  | 'activate'
  | 'api'
  | 'dataTransferFormats'
  | 'formats'
  | 'commands'
  | 'conflicts'
  | 'contributions'
  | 'corrections'
  | 'decorate'
  | 'dependencies'
  | 'enabled'
  | 'effectTypes'
  | 'initialState'
  | 'key'
  | 'name'
  | 'read'
  | 'readMiddleware'
  | 'schema'
  | 'stateFields'
  | 'targetPlugins'
  | 'type'
  | 'update'
  | 'validate'
> & {
  /** Replace this descriptor's node component for static or live consumers. */
  component?: NodeComponent;
  decorate?: DecorateInput<C> | null;
  enabled?: boolean;
  initialState?: Partial<InferPluginStoreState<C>>;
  targetPlugins?: ReadonlyArray<PluginReference | string>;
};

export type BasePluginPortal<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  S = C,
  TApi = PluginPortalContext<C>['api'],
> = Omit<ResolvedPlugin<C>, keyof PluginPortalContext<C> | 'schema'> &
  PluginReference<C['name']> &
  Omit<PluginPortalContext<C>, 'api' | 'read' | 'update'> & {
    /** API scoped directly to this plugin. */
    api: TApi;
    /** State-bound reads scoped directly to this plugin. */
    read: PluginReadCapability<C>;
    /** One-shot updates scoped directly to this plugin. */
    update: PluginUpdate<C, S>;
  };

// Author capabilities replace consumer methods; do not build that portal first.
type BasePluginContextFields<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<
  ResolvedPlugin<C>,
  keyof PluginPortalContext<C> | keyof PluginBaseContext<C> | 'schema'
> &
  PluginBaseContext<C> & {
    defineFormats: DefinePluginFormats<C>;
    editor: BasePluginContextEditor<C>;
    plugin: ResolvedPlugin<C>;
  };

export type BasePluginContext<
  in out C extends AnyBasePluginDefinition = BasePluginDefinition,
> = {
  [K in keyof BasePluginContextFields<C>]: BasePluginContextFields<C>[K];
};

interface BasePluginMethods<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> {
  configure(
    config:
      | BasePluginConfiguration<C>
      | ((context: BasePluginContext<C>) => BasePluginConfiguration<C>)
  ): ConfiguredBasePlugin<C>;
  // Callback overload must precede the runtime-plugin overload for contextual inference.
  extend<
    const TKeys extends keyof BasePluginStageObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends PluginReadMethodTree<C> = {},
    const TSelectors extends PluginSelectors<InferPluginStoreState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
      readonly [],
    const TShortcuts extends BasePluginShortcutRecord = {},
  >(
    stage: (
      context: BasePluginContext<C>
    ) => BasePluginStageInput<
      C,
      TKeys,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TConflictNames,
      TEnabled,
      TTargetPlugins,
      TShortcuts
    >,
    ...compatibility: PluginCompatibilityArguments<
      BasePluginStageCompatibility<C, S, TApi, TRead, TSelectors, TUpdate>
    >
  ): BasePlugin<
    BasePluginStageDefinition<
      C,
      TKeys,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TConflictNames,
      TEnabled,
      TTargetPlugins
    >
  > &
    RuntimePluginTypeProviderOf<this>;
  extend<const TPlugin extends RuntimePluginReference>(
    plugin: (
      context: BasePluginContext<C>
    ) => TPlugin & Readonly<{ decorate?: never }>,
    ...compatibility: PluginCompatibilityArguments<
      BasePluginRuntimeCompatibility<C, TPlugin>
    >
  ): InternalBasePluginRuntimeExtension<this, C, TPlugin>;
  extend<const TPlugin extends RuntimePluginReference>(
    plugin: NonCallbackPlugin<TPlugin>,
    ...compatibility: PluginCompatibilityArguments<
      BasePluginRuntimeCompatibility<C, TPlugin>
    >
  ): InternalBasePluginRuntimeExtension<this, C, TPlugin>;
  extend<
    const TKeys extends keyof BasePluginStageObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends PluginReadMethodTree<C> = {},
    const TSelectors extends PluginSelectors<InferPluginStoreState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends ReadonlyArray<PluginReference | string> =
      readonly [],
    const TShortcuts extends BasePluginShortcutRecord = {},
  >(
    // Invalid callbacks must not fall through to the object overload.
    stage: Readonly<{ call?: never }> &
      BasePluginStageInput<
        C,
        TKeys,
        S,
        TApi,
        TRead,
        TSelectors,
        TUpdate,
        TConflictNames,
        TEnabled,
        TTargetPlugins,
        TShortcuts
      >,
    ...compatibility: PluginCompatibilityArguments<
      BasePluginStageCompatibility<C, S, TApi, TRead, TSelectors, TUpdate>
    >
  ): BasePlugin<
    BasePluginStageDefinition<
      C,
      TKeys,
      S,
      TApi,
      TRead,
      TSelectors,
      TUpdate,
      TConflictNames,
      TEnabled,
      TTargetPlugins
    >
  > &
    RuntimePluginTypeProviderOf<this>;
}

export declare class ConfiguredPluginDescriptor {
  protected readonly configuredPluginDescriptor: true;
}

export type ConfiguredBasePlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<BasePlugin<C>, 'configure' | 'extend'> &
  ConfiguredPluginDescriptor & {
    configure: never;
    extend: never;
  } & PluginReference<C['name']>;

export type BasePlugins = AnyBasePlugin[];

export type TextStaticProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((props: BaseRenderNodeProps<C> & RenderTextProps) => AnyObject | undefined)
  | AnyObject;

export type TransformOptions<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BaseTransformOptions & BasePluginContext<C>;

type EditorShortcutOptions = {
  keys?: ReadonlyArray<readonly string[]> | readonly string[] | string | null;
  delimiter?: string;
  description?: string;
  enabled?: Trigger;
  enableOnContentEditable?: boolean;
  enableOnFormTags?:
    | ReadonlyArray<
        'INPUT' | 'SELECT' | 'TEXTAREA' | 'input' | 'select' | 'textarea'
      >
    | boolean;
  ignoreEventWhenPrevented?: boolean;
  ignoreModifiers?: boolean;
  keydown?: boolean;
  keyup?: boolean;
  preventDefault?: Trigger;
  priority?: number;
  splitKey?: string;
  useKey?: boolean;
  ignoreEventWhen?: (e: KeyboardEvent) => boolean;
};

export type EditorShortcut = EditorShortcutOptions &
  (
    | {
        handler: (ctx: {
          editor: Editor;
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

type ShortcutFunctionKey<T> = {
  [K in keyof T]-?: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T] &
  string;

type PluginShortcutUpdateKey<C extends AnyBasePluginDefinition> =
  ShortcutFunctionKey<PluginUpdate<C>>;

type PluginShortcutApiKey<C extends AnyBasePluginDefinition> =
  ShortcutFunctionKey<InferApi<C>>;

type PluginShortcutApiScopeCollisionKey<C extends AnyBasePluginDefinition> =
  Extract<PluginShortcutApiKey<C>, PluginShortcutUpdateKey<C>>;

type ShortcutWithHandler<TShortcut> = Extract<
  TShortcut,
  { handler: (...args: never[]) => unknown }
>;

type ShortcutWithoutHandler<TShortcut> = Exclude<
  TShortcut,
  ShortcutWithHandler<TShortcut>
>;

type PluginShortcutForKey<
  C extends AnyBasePluginDefinition,
  K extends string,
  TShortcut,
> =
  K extends PluginShortcutApiScopeCollisionKey<C>
    ?
        | ShortcutWithHandler<TShortcut>
        | (ShortcutWithoutHandler<TShortcut> & {
            target: 'api' | 'update';
          })
    : K extends PluginShortcutUpdateKey<C>
      ?
          | ShortcutWithHandler<TShortcut>
          | (ShortcutWithoutHandler<TShortcut> & { target?: 'update' })
      : K extends PluginShortcutApiKey<C>
        ?
            | ShortcutWithHandler<TShortcut>
            | (ShortcutWithoutHandler<TShortcut> & { target?: 'api' })
        : ShortcutWithHandler<TShortcut>;

/** Shortcut declarations for capabilities already named by an explicit config. */
export type DeclaredPluginShortcutInput<
  C extends AnyBasePluginDefinition,
  TShortcut = EditorShortcut,
> = Partial<{
  [
    K in PluginShortcutApiKey<C> | PluginShortcutUpdateKey<C>
  ]: PluginShortcutForKey<C, K, TShortcut> | null;
}>;

/**
 * Validate inferred shortcut object keys against callable plugin commands.
 * Unknown names require a custom handler; ambiguous names require an explicit
 * route, except plugin/editor API collisions which require a custom handler.
 */
export type PluginShortcutInput<
  C extends AnyBasePluginDefinition,
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
  | ((keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => boolean)
  | boolean;
