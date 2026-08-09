import type {
  ContentSlice,
  DecoratedRange,
  DefinitionOf as PliteDefinitionOf,
  Descendant,
  Element,
  EditorCommitContext,
  EditorDocumentValue,
  EditorExtension,
  EditorSchemaExtensionProvider,
  EditorExtensionDefinitionInput,
  EditorExtensionReference,
  EditorNodeChangeContext,
  EditorCoreStateView,
  EditorTextChangeContext,
  EditorTransactionChangeContext,
  EditorUpdateContext,
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
import type {
  EditorSchemaSourceProvider,
  InternalEditorExtensionTypeProviderOf,
  InternalEditorExtensionWitnessFor,
} from '@platejs/plite/internal';
import type { HotkeysEvent } from '@udecode/react-hotkeys';
import type { AnyObject, Nullable } from '@udecode/utils';

import type {
  PliteElementProps,
  PliteRenderElementProps,
  PliteRenderLeafProps,
  PliteRenderTextProps,
} from '../../static';
import type { BaseEditor, InternalBaseEditorWithPlatePlugins } from '../editor';
import type {
  InternalPlateSchemaExtensionForPlugin,
  PlatePluginRead,
  PlatePluginReadState,
  PlatePluginTransaction,
  PlatePluginUpdate,
} from '../editor/pluginRuntimeTypes';
import type {
  InputRulesConfig,
  InputRulesDefinition,
} from '../plugins/input-rules/types';
import type { MarkdownNodeCodecInput } from './MarkdownNodeCodec';
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
  MatchRules,
  NodeComponent,
  NodeComponents,
  HtmlParserOptions,
  HtmlPluginContext,
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
import type {
  InferExactPluginSchemaContribution,
  InferPluginDocumentType,
  InferPluginNodeTypeProvider,
  InferPluginSchema,
  InferPluginSchemaContribution,
} from './pluginSchemaModel.internal';
import type {
  BasePluginDependencyDescriptors,
  BasePluginInstalledCapabilityWitness,
  LowerBasePlugin,
} from './basePluginCompiler.internal';
import type { InternalPluginDefinitionOf } from './pluginDefinitionLookup.internal';
import type { MergePluginDefinitions } from './pluginDefinitionMerge.internal';
import { pluginCodecMapDeclaration } from './pluginAuthoringContext';
import type { HandlerReturnType } from './HandlerReturnType';

export type AnyInjectNodeProps = BaseInjectProps & {
  query?: unknown;
  transformClassName?: unknown;
  transformNodeValue?: unknown;
  transformProps?: unknown;
  transformStyle?: unknown;
};
type ErasedPluginInject = {
  excludeBelowPlugins?: readonly (PluginReference | string)[] | null;
  excludePlugins?: readonly (PluginReference | string)[] | null;
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
type ErasedPluginOn = Record<
  string,
  ErasedPluginCallable<HandlerReturnType> | null | undefined
>;
type ErasedPluginRender = {
  aboveEditable?: React.FC<{ children: React.ReactNode }> | null;
  aboveNodes?: ErasedPluginCallable<unknown> | null;
  abovePlite?: React.FC<{ children: React.ReactNode }> | null;
  afterContainer?: React.ComponentType<any> | null;
  afterEditable?: React.ComponentType<any> | null;
  as?: keyof HTMLElementTagNameMap | null;
  beforeContainer?: React.ComponentType<any> | null;
  beforeEditable?: React.ComponentType<any> | null;
  belowNodes?: ErasedPluginCallable<unknown> | null;
  belowRootNodes?: ErasedPluginCallable<React.ReactNode> | null;
  isDecoration?: boolean | null;
  leaf?: NodeComponent | null;
  leafProps?: unknown;
  node?: NodeComponent | null;
  nodeProps?: unknown;
  textProps?: unknown;
};
type ErasedPluginRules = {
  break?: BreakRules;
  delete?: DeleteRules;
  match?: ErasedPluginCallable<boolean> | null;
  merge?: MergeRules;
  normalize?: NormalizeRules;
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
type AnyPluginDependencyDescriptor =
  | PluginReference
  | Readonly<Pick<EditorExtensionReference, 'enabled' | 'name'>>;

export type AnyBasePlugin = {
  activate?: ErasedPluginCallable;
  api?: object | ErasedPluginCallable<object>;
  codecs?: object | ErasedPluginCallable<object> | null;
  commands?: ErasedPluginCallable;
  configure: ErasedPluginCallable;
  conflicts: readonly AnyPluginDependencyDescriptor[];
  contributions?: readonly unknown[];
  corrections?: readonly unknown[];
  decorate?: ErasedPluginCallable<DecoratedRange[] | undefined> | null;
  dependencies: readonly AnyPluginDependencyDescriptor[];
  editOnly?: boolean | object;
  effectTypes?: readonly unknown[];
  enabled?: boolean;
  extend: ErasedPluginCallable;
  facetProviders?: readonly unknown[];
  inject: ErasedPluginInject;
  inputRules: InputRulesDefinition | InputRulesConfig;
  initialState: object;
  name: string;
  on: ErasedPluginOn;
  override: {
    components?: NodeComponents;
    plugins?: Record<string, object>;
  };
  read?: ErasedPluginCallable<object>;
  readMiddleware?: ErasedPluginCallable;
  render: ErasedPluginRender;
  rules: ErasedPluginRules;
  readonly schema: unknown;
  selectionKinds?: readonly unknown[];
  selectors: object;
  shortcuts: Record<string, EditorShortcut | null | undefined>;
  stateFields?: NonNullable<
    EditorExtensionDefinitionInput<BaseEditor>['stateFields']
  >;
  targetPlugins: readonly (PluginReference | string)[];
  transformInitialValue?: ErasedPluginCallable<
    EditorDocumentValue | Value
  > | null;
  update?: ErasedPluginCallable<object>;
  useHooks?: ErasedPluginCallable | null;
  validate?: ErasedPluginCallable;
} & PluginReference;
export type AnyPluginBase = Omit<AnyBasePlugin, 'configure' | 'extend'>;

/** Type-erased consumer portal for name-only and heterogeneous lookups. */
export type AnyBasePluginPortal = Omit<
  AnyPluginBase,
  'api' | 'read' | 'schema' | 'update'
> & {
  readonly api: object;
  readonly installed: boolean;
  readonly read: object;
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
  readonly defineCodecs: object;
  readonly editor: object;
  readonly plugin: AnyPluginBase;
  readonly schema: PluginAuthorSchemaView<AnyBasePluginDefinition>;
};

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<C extends AnyBasePluginDefinition = BasePluginDefinition> =
  (
    ctx: BasePluginContext<C> & { entry: NodeEntry }
  ) => DecoratedRange[] | undefined;

// -----------------------------------------------------------------------------

export type ResolvedPlatePlugin<
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
  transformProps?: (
    options: TransformOptions<C> & { props: GetInjectNodePropsReturnType }
  ) => AnyObject | undefined;
  transformStyle?: (options: TransformOptions<C>) => AnyObject;
};

export type LeafStaticProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((props: PliteRenderLeafProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type NodeStaticProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
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
export type TransformInitialValue<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (
  ctx: PluginBaseContext<C> & {
    editor: BaseEditor;
    value: EditorDocumentValue;
  }
) => EditorDocumentValue;

export type HtmlCodecHooks<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = {
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

type HtmlContribution<C extends AnyBasePluginDefinition> =
  InferExactPluginSchemaContribution<C>;

type HtmlContributionElements<C extends AnyBasePluginDefinition> =
  HtmlContribution<C> extends Readonly<{
    elements: infer TElements extends Readonly<
      Record<string, import('@platejs/plite').SchemaElement>
    >;
  }>
    ? TElements
    : Readonly<Record<never, never>>;

type HtmlContributionProperties<C extends AnyBasePluginDefinition> =
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

type HtmlElementSchema<C extends AnyBasePluginDefinition> =
  InferPluginDocumentType<C> extends keyof HtmlContributionElements<C>
    ? HtmlContributionElements<C>[InferPluginDocumentType<C>]
    : never;

type HtmlElementOwnedProperties<C extends AnyBasePluginDefinition> =
  HtmlElementSchema<C> extends Readonly<{
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
  ? HtmlPropertiesEncodeContext<Element, HtmlOwnedPropertyMap<C>>
  : HtmlSoleExactProperty<C> extends SchemaProperty
    ? HtmlPropertyEncodeContext<
        Element,
        PropertyValueOf<HtmlSoleExactProperty<C>['value']>
      >
    : never;

type HtmlTextEncodeContextFor<C extends AnyBasePluginDefinition> = [
  HtmlSoleExactProperty<C>,
] extends [never]
  ? HtmlPropertiesEncodeContext<Text, HtmlOwnedPropertyMap<C>>
  : HtmlSoleExactProperty<C> extends SchemaProperty
    ? HtmlPropertyEncodeContext<
        Text,
        PropertyValueOf<HtmlSoleExactProperty<C>['value']>
      >
    : never;

type HtmlElementRule<C extends AnyBasePluginDefinition> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlElementDecodeResult<HtmlOwnedPropertyMap<C>>,
    HtmlElementEncodeContext<
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
      HtmlPropertyDecode<C>,
      HtmlPropertyEncodeContextFor<C>,
      HtmlElementPatch
    > & {
      createsElement?: never;
    };

type HtmlElementPropertyCreateRule<C extends AnyBasePluginDefinition> =
  HtmlRuleBase &
    HtmlRuleDirections<
      HtmlElementDecodeResult<HtmlOwnedPropertyMap<C>>,
      HtmlElementEncodeContext<Element & HtmlOwnedPropertyMap<C>>,
      HtmlNodeSpec
    > & {
      createsElement: true;
    };

type HtmlTextPropertyRule<C extends AnyBasePluginDefinition> = HtmlRuleBase &
  HtmlRuleDirections<
    HtmlPropertyDecode<C>,
    HtmlTextEncodeContextFor<C>,
    HtmlWrapperSpec
  > & {
    createsElement?: never;
  };

type HtmlForeignElementPropertyRule<C extends AnyBasePluginDefinition> =
  HtmlRuleBase &
    HtmlRuleDirections<
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

type ForeignHtmlCodecTarget<
  C extends AnyBasePluginDefinition,
  TTarget extends PluginReference,
> = TTarget['name'] extends C['name'] ? never : TTarget;

type ForeignCodecDefinition<
  C extends AnyBasePluginDefinition,
  TTarget extends AnyBasePlugin & PluginReference,
  TTargetDefinition extends
    AnyBasePluginDefinition = InternalPluginDefinitionOf<TTarget>,
> = Omit<C, 'name' | 'schema'> &
  Readonly<{
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

/** Schema codec declarations registered through `defineCodecs`. */
export interface PluginProductNodeCodecRegistry<
  C extends AnyBasePluginDefinition,
> {
  'text/markdown': MarkdownNodeCodecInput<C>;
}

type PluginProductNodeCodecMap<C extends AnyBasePluginDefinition> = Readonly<
  Partial<PluginProductNodeCodecRegistry<C>>
>;

type PluginProductNodeCodecOnlyMap<C extends AnyBasePluginDefinition> = {
  [TFormat in keyof PluginProductNodeCodecRegistry<C>]: Readonly<
    Pick<PluginProductNodeCodecRegistry<C>, TFormat> &
      Partial<Omit<PluginProductNodeCodecRegistry<C>, TFormat>> & {
        'text/html'?: never;
      }
  >;
}[keyof PluginProductNodeCodecRegistry<C>];

export type PluginProductCodecMap = Readonly<
  Record<string, CodecDeclaration> & {
    /** HTML node codecs use the schema-aware `text/html` declaration. */
    'text/html'?: never;
    /**
     * Document-level Markdown codecs must opt into document scope. Feature
     * node codecs use the schema-aware `text/markdown` declaration instead.
     */
    'text/markdown'?: CodecDeclaration & Readonly<{ scope: 'document' }>;
  }
>;

type PluginSelfHtmlCodec<C extends AnyBasePluginDefinition> =
  HtmlSelfRule<C> & {
    target?: never;
  };

type PluginHtmlCodecInput<C extends AnyBasePluginDefinition, TRule> =
  | HtmlCodecHooks<C>
  | (TRule & HtmlCodecHooks<C>);

export type PluginSelfHtmlCodecMap<C extends AnyBasePluginDefinition> =
  Readonly<{
    'text/html':
      | PluginHtmlCodecInput<C, PluginSelfHtmlCodec<C>>
      | readonly [
          PluginHtmlCodecInput<C, PluginSelfHtmlCodec<C>>,
          ...PluginHtmlCodecInput<C, PluginSelfHtmlCodec<C>>[],
        ];
  }>;

type PluginSelfHtmlElementPropertyCodecMap<
  C extends AnyBasePluginDefinition,
  TRule,
> =
  C extends Readonly<{
    targetPlugins: readonly (PluginReference | string)[];
  }>
    ? [HtmlContributionProperties<C>] extends [never]
      ? never
      : [
            Exclude<HtmlContributionProperties<C>, SchemaElementProperty>,
          ] extends [never]
        ? Readonly<{
            'text/html':
              | PluginHtmlCodecInput<C, TRule>
              | readonly [
                  PluginHtmlCodecInput<C, TRule>,
                  ...PluginHtmlCodecInput<C, TRule>[],
                ];
            'text/markdown'?: never;
          }>
        : never
    : never;

type PluginSelfHtmlCodecMapForRule<
  C extends AnyBasePluginDefinition,
  TRule,
> = Readonly<{
  'text/html':
    | PluginHtmlCodecInput<C, TRule>
    | readonly [
        PluginHtmlCodecInput<C, TRule>,
        ...PluginHtmlCodecInput<C, TRule>[],
      ];
  'text/markdown'?: never;
}>;

type PluginTargetedHtmlCreateCodecMap<C extends AnyBasePluginDefinition> =
  C extends Readonly<{ targetPlugins: readonly (PluginReference | string)[] }>
    ? PluginSelfHtmlCodecMapForRule<C, HtmlElementPropertyCreateRule<C>>
    : never;

type PluginTargetedHtmlMixedCodecMap<C extends AnyBasePluginDefinition> =
  C extends Readonly<{ targetPlugins: readonly (PluginReference | string)[] }>
    ? Readonly<{
        'text/html': readonly [
          PluginHtmlCodecInput<C, HtmlElementPropertyCreateRule<C>>,
          PluginHtmlCodecInput<C, HtmlSelfNonCreatingRule<C>>,
          ...PluginHtmlCodecInput<C, HtmlSelfNonCreatingRule<C>>[],
        ];
        'text/markdown'?: never;
      }>
    : never;

type PluginSelfHtmlProductNodeCodecMap<C extends AnyBasePluginDefinition> =
  PluginSelfHtmlCodecMap<C> &
    Readonly<{
      'text/markdown': MarkdownNodeCodecInput<C>;
    }>;

export type PluginForeignHtmlCodecMap<
  C extends AnyBasePluginDefinition,
  TTarget extends AnyBasePlugin & PluginReference,
> = Readonly<{
  'text/html':
    | (HtmlForeignRule<ForeignCodecDefinition<C, NoInfer<TTarget>>> & {
        target: ForeignHtmlCodecTarget<C, TTarget>;
      })
    | readonly [
        HtmlForeignRule<ForeignCodecDefinition<C, NoInfer<TTarget>>> & {
          target: ForeignHtmlCodecTarget<C, TTarget>;
        },
        ...(HtmlForeignRule<ForeignCodecDefinition<C, NoInfer<TTarget>>> & {
          target: ForeignHtmlCodecTarget<C, TTarget>;
        })[],
      ];
}>;

type PluginForeignHtmlCodecInput<
  C extends AnyBasePluginDefinition,
  TTarget extends AnyBasePlugin & PluginReference,
> = Readonly<{
  'text/html':
    | PluginHtmlCodecInput<
        ForeignCodecDefinition<C, NoInfer<TTarget>>,
        HtmlForeignRule<ForeignCodecDefinition<C, NoInfer<TTarget>>>
      >
    | readonly [
        PluginHtmlCodecInput<
          ForeignCodecDefinition<C, NoInfer<TTarget>>,
          HtmlForeignRule<ForeignCodecDefinition<C, NoInfer<TTarget>>>
        >,
        ...PluginHtmlCodecInput<
          ForeignCodecDefinition<C, NoInfer<TTarget>>,
          HtmlForeignRule<ForeignCodecDefinition<C, NoInfer<TTarget>>>
        >[],
      ];
}>;

/** Schema-checked codec map produced by `defineCodecs`. */
export type PluginCodecMapDeclaration = Readonly<Record<string, unknown>> & {
  readonly [pluginCodecMapDeclaration]: true;
};

/** Context-bound codec definition with exact owner and foreign-target typing. */
export type DefinePluginCodecs<C extends AnyBasePluginDefinition> = {
  // biome-ignore lint/style/useUnifiedTypeSignatures: Separate overloads preserve exact self-codec inference.
  bivarianceHack(
    codecs: PluginSelfHtmlProductNodeCodecMap<C>
  ): PluginCodecMapDeclaration;
  bivarianceHack(
    codecs: PluginTargetedHtmlCreateCodecMap<C>
  ): PluginCodecMapDeclaration;
  bivarianceHack(
    codecs: PluginTargetedHtmlMixedCodecMap<C>
  ): PluginCodecMapDeclaration;
  bivarianceHack(
    codecs: PluginSelfHtmlCodecMapForRule<C, HtmlSelfNonCreatingRule<C>>
  ): PluginCodecMapDeclaration;
  bivarianceHack(
    codecs: PluginSelfHtmlElementPropertyCodecMap<
      C,
      HtmlElementPropertyCreateRule<C>
    >
  ): PluginCodecMapDeclaration;
  bivarianceHack(
    codecs: PluginProductNodeCodecOnlyMap<C>
  ): PluginCodecMapDeclaration;
  bivarianceHack(codecs: PluginProductCodecMap): PluginCodecMapDeclaration;
  bivarianceHack<const TTarget extends AnyBasePlugin & PluginReference>(
    target: TTarget,
    codecs:
      | PluginForeignHtmlCodecInput<C, TTarget>
      | PluginProductNodeCodecMap<ForeignCodecDefinition<C, NoInfer<TTarget>>>
  ): PluginCodecMapDeclaration;
}['bivarianceHack'];

export type PartialBasePlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<Partial<PluginBase<C>>, 'initialState' | 'render'> & {
  initialState?: Partial<InferPluginStoreState<C>>;
  render?: Partial<
    Omit<NonNullable<BasePluginAuthorFields<C>['render']>, 'node'>
  >;
};

/**
 * Type-erased weak override carried by plugin descriptors.
 *
 * Keep this boundary independent from `BasePlugin`: descriptors contain weak
 * overrides, so deriving their stored value from `BasePlugin` would make the
 * public generic below recursively expand itself.
 */
type ErasedBasePluginOverride = Partial<{
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
  targetPlugins: readonly (PluginReference | string)[];
  transformInitialValue: unknown;
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

export type RenderStaticNodeWrapper<C extends AnyBasePluginDefinition = any> = (
  props: RenderStaticNodeWrapperProps<C>
) => RenderStaticNodeWrapperFunction<C>;

export type RenderStaticNodeWrapperFunction<
  C extends AnyBasePluginDefinition = any,
> =
  | ((hocProps: PliteRenderElementProps<Element, C>) => React.ReactNode)
  | null
  | undefined;

export type RenderStaticNodeWrapperProps<
  C extends AnyBasePluginDefinition = any,
> = PliteRenderElementProps<Element, C>;

export type BasePluginContextEditor<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = InternalBaseEditorWithPlatePlugins<Value, C>;

export type BasePluginImplementationContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PluginBaseContext<C> & {
  editor: BasePluginContextEditor<C>;
  plugin: ResolvedPlatePlugin<C>;
};

type BasePluginLifecycleContext<
  C extends AnyBasePluginDefinition,
  TContext extends { editor: object },
> = Omit<TContext, 'editor' | 'tx'> &
  BasePluginContext<C> & {
    editor: BasePluginContextEditor<C>;
    plugin: ResolvedPlatePlugin<C>;
  } & ('tx' extends keyof TContext
    ? Readonly<{
        tx: PlatePluginTransaction<C>;
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

type BaseNativeExtensionFields<C extends AnyBasePluginDefinition> = Omit<
  EditorExtensionDefinitionInput<BasePluginContextEditor<C>>,
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
  EditorExtensionDefinitionInput<BasePluginContextEditor<C>>['corrections']
>[number];

type BaseNativeCorrectionContext<C extends AnyBasePluginDefinition> =
  Parameters<BaseNativeCorrection<C>['correct']>[0];

type BasePluginCorrection<C extends AnyBasePluginDefinition> = Omit<
  BaseNativeCorrection<C>,
  'correct'
> & {
  correct: (
    context: Omit<BaseNativeCorrectionContext<C>, 'tx'> & {
      tx: BaseNativeCorrectionContext<C>['tx'] & PlatePluginTransaction<C>;
    }
  ) => void;
};

type BasePluginAuthorFields<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<PluginBase<C>, 'dependencies' | 'render'> &
  BaseNativeExtensionFields<C> & {
    api?: (context: BasePluginContext<C>) => InferApi<C>;
    conflicts: BasePluginDependencyDescriptors<InferConflicts<C>>;
    corrections?: readonly BasePluginCorrection<C>[];
    dependencies: BasePluginDependencyDescriptors<InferDependencies<C>>;
    on: BasePluginOn<C>;
    read?: (
      context: BasePluginContext<C> & {
        state: PlatePluginReadState<C>;
      }
    ) => InferRead<C>;
    update?: (
      context: BasePluginContext<C> & {
        context: EditorUpdateContext;
        tx: PlatePluginTransaction<C>;
      }
    ) => InferUpdate<C>;
  } & Nullable<{
    codecs?:
      | PluginCodecMapDeclaration
      | ((context: BasePluginContext<C>) => PluginCodecMapDeclaration);
    decorate?: Decorate<C>;
    transformInitialValue?: TransformInitialValue<WithAnyName<C>>;
  }> &
  BasePluginMethods<C> & {
    inject: Nullable<{
      nodeProps?: InjectNodeProps<C>;
    }>;
    override: {
      components?: NodeComponents;
      /**
       * Weakly adapts already-installed foreign plugins by name.
       *
       * Missing targets are ignored. Direct target configuration remains the
       * authoritative, inferred path.
       */
      plugins?: Record<string, ErasedBasePluginOverride>;
    };
    render: Omit<PluginBase<C>['render'], 'node'> &
      Readonly<{ node?: never }> &
      Nullable<{
        /**
         * When other plugins' `node` components are rendered, this function can
         * return an optional wrapper function that turns a `node`'s props to a
         * wrapper React node as its parent. Useful for wrapping or decorating
         * nodes with additional UI elements.
         *
         * NOTE: The function can run React hooks. NOTE: Do not run React hooks
         * in the wrapper function. It is not equivalent to a React component.
         */
        aboveNodes?: RenderStaticNodeWrapper<C>;
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
        belowNodes?: RenderStaticNodeWrapper<C>;
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
          props: PliteElementProps<Element, WithAnyName<C>>
        ) => React.ReactNode;
        /** Override `data-plite-leaf` element attributes. */
        leafProps?: LeafStaticProps<WithAnyName<C>>;
        /** Override rendered element/text/leaf attributes. */
        nodeProps?: NodeStaticProps<WithAnyName<C>>;
        /** Override `data-plite-node="text"` element attributes. */
        textProps?: TextStaticProps<WithAnyName<C>>;
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
       * No implicit capability-name or schema-identity match is applied.
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
  };

type ProjectBasePluginFields<C extends AnyBasePluginDefinition> = Readonly<{
  [TKey in Extract<
    Exclude<
      keyof C,
      BasePluginRuntimeField | 'decorate' | 'transformInitialValue' | 'useHooks'
    >,
    keyof BasePluginAuthorFields<C>
  >]-?: Exclude<BasePluginAuthorFields<C>[TKey], undefined>;
}>;

type ProjectBasePluginContextualFields<C extends AnyBasePluginDefinition> =
  Readonly<{
    [TKey in Extract<
      keyof C,
      ('decorate' | 'transformInitialValue' | 'useHooks') &
        keyof BasePluginAuthorFields<C>
    >]-?: Exclude<BasePluginAuthorFields<C>[TKey], undefined>;
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
  | 'targetPlugins';

type BasePluginRuntimeShell<C extends AnyBasePluginDefinition> = Pick<
  BasePluginAuthorFields<C>,
  Exclude<BasePluginRuntimeField, 'inject' | 'on' | 'render'>
>;

/** Context-bound fields kept outside the renderer-neutral core. */
type BasePluginContextualDescriptor<C extends AnyBasePluginDefinition> = Pick<
  BasePluginAuthorFields<C>,
  'inject' | 'on' | 'render'
> &
  ProjectBasePluginContextualFields<C>;

/** Nominal identity carried across renderer adapters. */
type BasePluginDescriptorCarrier<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = InternalEditorExtensionWitnessFor<LowerBasePlugin<C>> &
  BasePluginInstalledCapabilityWitness<C> &
  InferPluginNodeTypeProvider<C> &
  EditorSchemaExtensionProvider<InternalPlateSchemaExtensionForPlugin<C>> &
  EditorSchemaSourceProvider<InferPluginSchemaContribution<C>> &
  PluginReference<C['name']> &
  PluginDefinitionWitness<C>;

/** Structural runtime fields shared by Base and React descriptors. */
type BasePluginRuntimeDescriptor<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<
  EditorExtension<LowerBasePlugin<C>>,
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
  | 'transformInitialValue'
  | 'update'
  | 'useHooks'
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

/** Exact render-capable Plate descriptor built once on a Plite extension. */
export interface BasePlugin<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> extends BasePluginRuntime,
    BasePluginMethods<C>,
    InternalEditorExtensionWitnessFor<LowerBasePlugin<C>>,
    BasePluginInstalledCapabilityWitness<C>,
    InferPluginNodeTypeProvider<C>,
    EditorSchemaExtensionProvider<InternalPlateSchemaExtensionForPlugin<C>>,
    EditorSchemaSourceProvider<InferPluginSchemaContribution<C>>,
    PluginReference<C['name']>,
    PluginDefinitionWitness<C> {
  api?: (context: BasePluginContext<C>) => InferApi<C>;
  readonly conflicts: BasePluginDependencyDescriptors<InferConflicts<C>>;
  dependencies: BasePluginDependencyDescriptors<InferDependencies<C>>;
  readonly initialState: InferPluginStoreState<C>;
  readonly name: C['name'];
  read?: (
    context: BasePluginContext<C> & {
      state: PlatePluginReadState<C>;
    }
  ) => InferRead<C>;
  readonly schema: InferPluginSchema<C>;
  readonly selectors: InferSelectors<C>;
  readonly targetPlugins: C extends {
    targetPlugins: infer TTargetPlugins extends readonly (
      | PluginReference
      | string
    )[];
  }
    ? TTargetPlugins
    : readonly [];
  update?: (
    context: BasePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PlatePluginTransaction<C>;
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
      state: PlatePluginReadState<C>;
    }
  ) => InferRead<C>;
  schema?: PluginSchema<C> | null;
  update?: (
    context: BasePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PlatePluginTransaction<C>;
    }
  ) => InferUpdate<C>;
};

export type BasePluginDefinitionInput<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BasePluginInputFields<C> & Readonly<{ component?: NodeComponent }>;

type BasePluginExtensionObject<C extends AnyBasePluginDefinition> = Omit<
  BasePluginInputFields<C>,
  | 'api'
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
  component?: never;
  initialState?: object | ((context: BasePluginContext<C>) => object);
  read?: (
    context: BasePluginContext<C> & {
      state: PlatePluginReadState<C>;
    }
  ) => object;
  selectors?: PluginSelectors<InferPluginStoreState<C>>;
  update?: (
    context: BasePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PlatePluginTransaction<C>;
    }
  ) => object;
};

type BasePluginShortcutRecord = Record<
  string,
  EditorShortcut | null | undefined
>;

type BasePluginStageConflictInput<TNames extends readonly string[]> = {
  readonly [TIndex in keyof TNames]: (
    | EditorExtensionReference
    | PluginReference
  ) &
    Readonly<{ name: TNames[TIndex] }>;
};

type BasePluginStageInput<
  C extends AnyBasePluginDefinition,
  TKeys extends keyof BasePluginExtensionObject<C>,
  S extends object,
  TApi extends object,
  TRead extends object,
  TSelectors extends PluginSelectors<InferPluginStoreState<C>>,
  TUpdate extends object,
  TConflictNames extends readonly string[],
  TEnabled extends boolean,
  TTargetPlugins extends readonly (PluginReference | string)[],
  TShortcuts extends BasePluginShortcutRecord,
> = Readonly<Record<TKeys, unknown>> &
  Pick<
    BasePluginExtensionObject<C>,
    Exclude<TKeys, BasePluginStageSpecialKey>
  > &
  Readonly<{
    api?: (context: BasePluginContext<C>) => TApi;
    conflicts?: BasePluginStageConflictInput<TConflictNames>;
    enabled?: TEnabled;
    initialState?: S | ((context: BasePluginContext<C>) => S);
    read?: (
      context: BasePluginContext<C> & {
        state: PlatePluginReadState<C>;
      }
    ) => TRead;
    selectors?: TSelectors & PluginSelectors<InferPluginStoreState<C>>;
    shortcuts?: PluginShortcutInput<C, TShortcuts, EditorShortcut>;
    targetPlugins?: TTargetPlugins;
    update?: (
      context: BasePluginContext<C> & {
        context: EditorUpdateContext;
        tx: PlatePluginTransaction<C>;
      }
    ) => TUpdate;
  }>;

export type BasePluginExtendInput<C extends AnyBasePluginDefinition> =
  | BasePluginExtensionObject<C>
  | EditorExtensionReference
  | ((
      context: BasePluginContext<C>
    ) => BasePluginExtensionObject<C> | EditorExtensionReference);

type ExtensionResult<TInput> = TInput extends (...args: any[]) => infer TResult
  ? ExtensionResult<TResult>
  : TInput extends EditorExtensionReference
    ? Omit<PliteDefinitionOf<TInput>, 'conflicts' | 'dependencies' | 'name'>
    : TInput;

type NonCallbackExtension<TExtension> = TExtension extends (
  ...args: never[]
) => unknown
  ? never
  : TExtension;

type BasePluginStageSpecialKey =
  | 'api'
  | 'conflicts'
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
  TTargetPlugins extends readonly (PluginReference | string)[],
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
  TTargetPlugins extends readonly (PluginReference | string)[] = readonly [],
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
  | 'codecs'
  | 'commands'
  | 'conflicts'
  | 'contributions'
  | 'corrections'
  | 'dependencies'
  | 'enabled'
  | 'effectTypes'
  | 'facetProviders'
  | 'initialState'
  | 'key'
  | 'name'
  | 'read'
  | 'readMiddleware'
  | 'schema'
  | 'selectionKinds'
  | 'stateFields'
  | 'targetPlugins'
  | 'type'
  | 'update'
  | 'validate'
> & {
  /** Replace this descriptor's node component for static or live consumers. */
  component?: NodeComponent;
  enabled?: boolean;
  initialState?: Partial<InferPluginStoreState<C>>;
  targetPlugins?: readonly (PluginReference | string)[];
};

export type BasePluginPortal<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<ResolvedPlatePlugin<C>, keyof PluginPortalContext<C> | 'schema'> &
  Omit<PluginPortalContext<C>, 'read' | 'update'> & {
    /** State-bound reads scoped directly to this plugin. */
    read: PlatePluginRead<C>;
    /** One-shot updates scoped directly to this plugin. */
    update: PlatePluginUpdate<C>;
  };

export type BasePluginContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<BasePluginPortal<C>, keyof PluginBaseContext<C>> &
  PluginBaseContext<C> & {
    defineCodecs: DefinePluginCodecs<C>;
    editor: BasePluginContextEditor<C>;
    plugin: ResolvedPlatePlugin<C>;
  };

interface BasePluginMethods<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> {
  configure<
    const TConfig extends
      | BasePluginConfiguration<C>
      | ((context: BasePluginContext<C>) => BasePluginConfiguration<C>),
  >(config: TConfig): ConfiguredBasePlugin<C>;
  // biome-ignore lint/style/useUnifiedTypeSignatures: Callback overload must precede the raw-extension overload for contextual inference.
  extend<
    const TKeys extends keyof BasePluginExtensionObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<InferPluginStoreState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends readonly (
      | PluginReference
      | string
    )[] = readonly [],
    const TShortcuts extends BasePluginShortcutRecord = {},
  >(
    extension: (
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
    InternalEditorExtensionTypeProviderOf<this>;
  extend<const TExtension extends EditorExtensionReference>(
    extension: (context: BasePluginContext<C>) => TExtension
  ): BasePlugin<
    MergePluginDefinitions<
      C,
      ExtensionResult<TExtension>,
      ExtensionResult<TExtension>
    >
  > &
    InternalEditorExtensionTypeProviderOf<this> &
    InternalEditorExtensionTypeProviderOf<TExtension>;
  extend<const TExtension extends EditorExtensionReference>(
    extension: NonCallbackExtension<TExtension>
  ): BasePlugin<
    MergePluginDefinitions<
      C,
      ExtensionResult<TExtension>,
      ExtensionResult<TExtension>
    >
  > &
    InternalEditorExtensionTypeProviderOf<this> &
    InternalEditorExtensionTypeProviderOf<TExtension>;
  extend<
    const TKeys extends keyof BasePluginExtensionObject<C>,
    S extends object = {},
    const TApi extends object = {},
    const TRead extends object = {},
    const TSelectors extends PluginSelectors<InferPluginStoreState<C>> = {},
    const TUpdate extends object = {},
    const TConflictNames extends readonly string[] = readonly [],
    const TEnabled extends boolean = boolean,
    const TTargetPlugins extends readonly (
      | PluginReference
      | string
    )[] = readonly [],
    const TShortcuts extends BasePluginShortcutRecord = {},
  >(
    extension: BasePluginStageInput<
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
    InternalEditorExtensionTypeProviderOf<this>;
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
  };

export type BasePlugins = AnyBasePlugin[];

export type TextStaticProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> =
  | ((props: PliteRenderTextProps<Text, C>) => AnyObject | undefined)
  | AnyObject;

export type TransformOptions<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BaseTransformOptions & BasePluginContext<C>;

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
          editor: BaseEditor;
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
  ShortcutFunctionKey<PlatePluginUpdate<C>>;

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
