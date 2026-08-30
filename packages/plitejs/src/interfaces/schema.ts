import type {
  EditorSchemaSource,
  EditorSchemaSourceProvider,
} from '../core/schema-source.internal';
import type { BaseElement } from './element';
import type { BaseText } from './text';

/** JSON data accepted by schema property defaults. */
export type PropertyJsonValue =
  | boolean
  | null
  | number
  | string
  | readonly PropertyJsonValue[]
  | Readonly<{ [key: string]: PropertyJsonValue }>;

export type PropertyValueKind =
  | 'boolean'
  | 'enum'
  | 'json'
  | 'number'
  | 'set'
  | 'string';

export type PropertyValidation<TValue> =
  | Readonly<{
      validate?: never;
      validationVersion?: never;
    }>
  | Readonly<{
      /** Narrow an untrusted JSON value to the declared property type. */
      validate: (value: unknown) => value is TValue;
      /** Bump whenever validation behavior changes. */
      validationVersion: number;
    }>;

type PropertyValueBaseOptions<TValue> = Readonly<{
  default?: TValue;
  /** Materialize a missing value during local construction. */
  generate?: () => TValue;
  omitDefault?: boolean;
  /** Reject canonical values that omit this property when no default exists. */
  required?: boolean;
}>;

export type PropertyValueOptions<TValue> = PropertyValueBaseOptions<TValue> &
  PropertyValidation<TValue>;

/** One immutable JSON value law shared by text and element properties. */
export interface PropertyValueDescriptor<
  TValue = unknown,
  TKind extends PropertyValueKind = PropertyValueKind,
  TOptions extends PropertyValueOptions<TValue> | undefined =
    | PropertyValueOptions<TValue>
    | undefined,
> {
  /** Type-only carrier for exact property-option inference. */
  readonly '~schema.options'?: TOptions;
  /** Type-only carrier for exact property-value inference. */
  readonly '~schema.value'?: TValue;
  readonly default?: TValue;
  readonly generate?: () => TValue;
  readonly kind: TKind;
  readonly omitDefault: [PropertyValueOptions<TValue> | undefined] extends [
    TOptions,
  ]
    ? boolean
    : TOptions extends { omitDefault: true }
      ? true
      : false;
  readonly required: [PropertyValueOptions<TValue> | undefined] extends [
    TOptions,
  ]
    ? boolean
    : TOptions extends { required: true }
      ? true
      : false;
  /** Runtime validator; excluded from structural schema identity. */
  readonly validate?: (value: unknown) => value is TValue;
  /** Structural identity for `validate`; required whenever it is present. */
  readonly validationVersion?: number;
}

export interface PropertyBooleanDescriptor<
  TOptions extends PropertyValueOptions<boolean> | undefined = undefined,
> extends PropertyValueDescriptor<boolean, 'boolean', TOptions> {}
export interface PropertyEnumDescriptor<
  TValues extends readonly string[] = readonly string[],
  TOptions extends PropertyValueOptions<TValues[number]> | undefined =
    undefined,
> extends PropertyValueDescriptor<TValues[number], 'enum', TOptions> {
  readonly values: TValues;
}
export interface PropertyJsonDescriptor<
  TValue = PropertyJsonValue,
  TOptions extends PropertyValueOptions<TValue> | undefined = undefined,
> extends PropertyValueDescriptor<TValue, 'json', TOptions> {}
export interface PropertyNumberDescriptor<
  TOptions extends PropertyValueOptions<number> | undefined = undefined,
> extends PropertyValueDescriptor<number, 'number', TOptions> {}
export interface PropertyStringDescriptor<
  TOptions extends PropertyValueOptions<string> | undefined = undefined,
> extends PropertyValueDescriptor<string, 'string', TOptions> {}

export interface PropertySetDescriptor<
  TItemDescriptor extends PropertyValueDescriptor = PropertyValueDescriptor,
  TOptions extends
    | PropertySetOptions<PropertyValueOf<TItemDescriptor>>
    | undefined = undefined,
> extends PropertyValueDescriptor<
  ReadonlyArray<PropertyValueOf<TItemDescriptor>>,
  'set',
  TOptions
> {
  readonly item: TItemDescriptor;
}

export type PropertyValueOf<TDescriptor> =
  TDescriptor extends Readonly<{ '~schema.value'?: infer TValue }>
    ? TValue
    : never;

export type PropertyOptionsOf<TDescriptor> =
  TDescriptor extends Readonly<{ '~schema.options'?: infer TOptions }>
    ? TOptions
    : never;

export type PropertySetOptions<TItem> = PropertyValueOptions<readonly TItem[]>;

export type PropertyJsonOptions<TValue = PropertyJsonValue> =
  PropertyValueOptions<TValue>;

export type SchemaKeyPrefix<TPrefix extends string = string> = Readonly<{
  kind: 'prefix';
  prefix: TPrefix;
}>;

/** Exact keys are strings; namespaces use `schema.key.prefix(...)`. */
export type SchemaPropertyKey = SchemaKeyPrefix | string;

export type SchemaTypesTarget<
  TTypes extends readonly string[] = readonly string[],
> = Readonly<{
  kind: 'types';
  types: TTypes;
}>;

/** Element-type-only target used by structural schema contributions. */
export type SchemaElementTarget =
  | Readonly<{
      kind: 'and';
      targets: readonly SchemaElementTarget[];
    }>
  | Readonly<{ group: string; kind: 'group' }>
  | Readonly<{ kind: 'not'; target: SchemaElementTarget }>
  | Readonly<{ kind: 'or'; targets: readonly SchemaElementTarget[] }>
  | Readonly<{ kind: 'type'; type: string }>
  | SchemaTypesTarget;

export type SchemaTarget =
  | Readonly<{ kind: 'and'; targets: readonly SchemaTarget[] }>
  | Readonly<{ group: string; kind: 'group' }>
  | Readonly<{ kind: 'not'; target: SchemaTarget }>
  | Readonly<{ kind: 'or'; targets: readonly SchemaTarget[] }>
  | Readonly<{ kind: 'parent'; target: SchemaTarget }>
  | Readonly<{ kind: 'root'; root: string | null }>
  | Readonly<{ kind: 'type'; type: string }>
  | SchemaTypesTarget;

export type SchemaPropertySplitPolicy = 'drop' | 'preserve';
export type SchemaPropertyCopyPolicy = 'drop' | 'preserve';
export type SchemaPropertyTypeChangePolicy = 'drop' | 'preserve-if-allowed';
export type SchemaPropertyRole = 'content' | 'metadata';

export type SchemaPropertyExclusiveGroup<TId extends string = string> =
  Readonly<{
    id: TId;
    kind: 'exclusive';
  }>;

export type SchemaTextPropertyOptions = Readonly<{
  copy?: SchemaPropertyCopyPolicy;
  exclusive?: readonly SchemaPropertyExclusiveGroup[];
  inclusive?: boolean;
  role?: SchemaPropertyRole;
  split?: SchemaPropertySplitPolicy;
  target?: SchemaTarget;
  typeChange?: SchemaPropertyTypeChangePolicy;
}>;

export type SchemaElementPropertyOptions = Readonly<{
  copy?: SchemaPropertyCopyPolicy;
  role?: SchemaPropertyRole;
  split?: SchemaPropertySplitPolicy;
  target: SchemaTarget;
  typeChange?: SchemaPropertyTypeChangePolicy;
}>;

export type SchemaTextProperty<
  TKey extends SchemaPropertyKey = SchemaPropertyKey,
  TDescriptor extends PropertyValueDescriptor = PropertyValueDescriptor,
  TTarget extends SchemaTarget | undefined = SchemaTarget | undefined,
> = Readonly<{
  copy: SchemaPropertyCopyPolicy;
  exclusive?: readonly SchemaPropertyExclusiveGroup[];
  inclusive: boolean;
  key: TKey;
  placement: 'text';
  role: SchemaPropertyRole;
  split: SchemaPropertySplitPolicy;
  target?: TTarget;
  typeChange: SchemaPropertyTypeChangePolicy;
  value: TDescriptor;
}>;

export type SchemaElementProperty<
  TKey extends SchemaPropertyKey = SchemaPropertyKey,
  TDescriptor extends PropertyValueDescriptor = PropertyValueDescriptor,
  TTarget extends SchemaTarget = SchemaTarget,
> = Readonly<{
  copy: SchemaPropertyCopyPolicy;
  key: TKey;
  placement: 'element';
  role: SchemaPropertyRole;
  split: SchemaPropertySplitPolicy;
  target: TTarget;
  typeChange: SchemaPropertyTypeChangePolicy;
  value: TDescriptor;
}>;

export type SchemaProperty = SchemaElementProperty | SchemaTextProperty;

/** Element-property law before a keyed owner assigns persisted identity. */
export type SchemaElementPropertyDefinition<
  TDescriptor extends PropertyValueDescriptor = PropertyValueDescriptor,
  TTarget extends SchemaTarget = SchemaTarget,
> = Omit<SchemaElementProperty<SchemaPropertyKey, TDescriptor, TTarget>, 'key'>;

/** Text-property law before a keyed owner assigns persisted identity. */
export type SchemaTextPropertyDefinition<
  TDescriptor extends PropertyValueDescriptor = PropertyValueDescriptor,
  TTarget extends SchemaTarget | undefined = SchemaTarget | undefined,
> = Omit<SchemaTextProperty<SchemaPropertyKey, TDescriptor, TTarget>, 'key'>;

/** Property law accepted by keyed schema-owner maps. */
export type SchemaPropertyDefinition =
  | SchemaElementPropertyDefinition
  | SchemaTextPropertyDefinition;

export type SchemaContentRule =
  | Readonly<{ kind: 'all'; rules: readonly SchemaContentRule[] }>
  | Readonly<{ kind: 'any'; rules: readonly SchemaContentRule[] }>
  | Readonly<{ group: string; kind: 'group' }>
  | Readonly<{ kind: 'not'; rule: SchemaContentRule }>
  | Readonly<{ kind: 'open' }>
  | Readonly<{ kind: 'text' }>
  | Readonly<{ kind: 'type'; type: string }>
  | Readonly<{ kind: 'types'; types: readonly string[] }>;

export type SchemaContentDefault = 'text' | Readonly<{ type: string }>;

export type SchemaContentOptions = Readonly<{
  default?: SchemaContentDefault;
  max?: number;
  min?: number;
}>;

type SchemaContentRuleWitness<TAllowed extends SchemaContentRule> = Readonly<{
  /**
   * Exact rule witness; absent from runtime values.
   *
   * @internal
   */
  '~schema.content.rule'?: TAllowed;
}>;

export type SchemaContent<
  TAllowed extends SchemaContentRule = SchemaContentRule,
  TOptions extends SchemaContentOptions | undefined = undefined,
> = Readonly<
  { allowed: TAllowed } & ([TOptions] extends [undefined]
    ? SchemaContentOptions
    : TOptions) &
    ([SchemaContentRule] extends [TAllowed]
      ? {}
      : SchemaContentRuleWitness<TAllowed>)
>;

export type SchemaContentInput = SchemaContent | SchemaContentRule;

export type SchemaContentRootOwnership = 'exclusive' | 'shared';

/** One element-owned named-root grammar and its ownership law. */
export type SchemaContentRoot<
  TContent extends SchemaContent = SchemaContent,
  TOwnership extends SchemaContentRootOwnership = SchemaContentRootOwnership,
> = Readonly<{
  content: TContent;
  ownership: TOwnership;
}>;

/** Shared roots may use their grammar directly; ownership defaults to shared. */
export type SchemaContentRootInput = SchemaContent | SchemaContentRoot;

/** One content-root slot projected onto matching element types. */
export type SchemaContentRootContribution<
  TSlot extends string = string,
  TRoot extends SchemaContentRoot = SchemaContentRoot,
  TTarget extends SchemaElementTarget = SchemaElementTarget,
> = Readonly<
  TRoot & {
    slot: TSlot;
    target: TTarget;
  }
>;

export type SchemaGroupOptions = Readonly<{
  extends?: readonly string[];
}>;

export type SchemaGroup<
  TOptions extends SchemaGroupOptions = SchemaGroupOptions,
> = Readonly<TOptions>;

export type SchemaElementProperties = Readonly<
  Record<string, PropertyValueDescriptor>
>;

export type SchemaElementSlicePolicy = Readonly<{
  preserveContext?: boolean;
  replaceWhenCovered?: boolean;
}>;

export type SchemaElementInput = Readonly<{
  atom?: boolean;
  content?: SchemaContent;
  /** Projected named-root grammars keyed by the element's `childRoots` slot. */
  contentRoots?: Readonly<Record<string, SchemaContentRootInput>>;
  /** Explicit product groups. Structural groups are compiler-derived. */
  groups?: readonly string[];
  inline?: boolean;
  isolating?: boolean;
  keyboardSelectable?: boolean;
  markableVoid?: boolean;
  properties?: SchemaElementProperties;
  readOnly?: boolean;
  selectable?: boolean;
  slice?: SchemaElementSlicePolicy;
  void?: 'block' | 'editable-island' | 'inline' | 'markable-inline';
}>;

export type SchemaElement<
  TInput extends SchemaElementInput = SchemaElementInput,
> = Readonly<TInput>;

export type SchemaTextBlockOptions = Omit<
  SchemaElementInput,
  'content' | 'inline' | 'void'
>;

/** Immutable compiled content facts exposed by `state.schema.element()`. */
export type EditorSchemaContent = Readonly<{
  allowedElementTypes: readonly string[];
  allowsText: boolean;
  allowsUnknownElements: boolean;
  default: SchemaContentDefault | null;
  max: number | null;
  min: number;
}>;

/** Immutable compiled element-owned root facts. */
export type EditorSchemaContentRoot = Readonly<{
  content: EditorSchemaContent;
  ownership: SchemaContentRootOwnership;
}>;

/** Immutable compiled element facts for one declared element type. */
export type EditorSchemaElement = Readonly<{
  behavior: Readonly<{
    atom: boolean;
    editableIsland: boolean;
    inline: boolean;
    isolating: boolean;
    keyboardSelectable: boolean;
    markableVoid: boolean;
    readOnly: boolean;
    selectable: boolean;
    void: boolean;
    voidKind: SchemaElement['void'] | null;
  }>;
  content: EditorSchemaContent | null;
  contentRoots: Readonly<Record<string, EditorSchemaContentRoot>>;
  groups: readonly string[];
  propertyIds: readonly string[];
  slice: Readonly<{
    preserveContext: boolean;
    replaceWhenCovered: boolean;
  }>;
  type: string;
}>;

/** Context for resolving one compiled property declaration. */
export type EditorSchemaPropertyQuery = Readonly<{
  /** Immediate parent type first. */
  ancestors?: readonly string[];
  key: string;
  placement: 'element' | 'text';
  /** `null` or omission addresses the implicit primary root. */
  root?: string | null;
  /** Target element type, or text-parent type for text properties. */
  type?: string;
}>;

/** Immutable compiled property facts returned by `state.schema.property()`. */
export type EditorSchemaProperty = Readonly<{
  id: string;
  key: SchemaPropertyKey;
  lifecycle: Readonly<{
    copy: SchemaPropertyCopyPolicy;
    inclusive: boolean | null;
    split: SchemaPropertySplitPolicy;
    typeChange: SchemaPropertyTypeChangePolicy;
  }>;
  merge: 'replace' | 'set';
  placement: 'element' | 'text';
  role: SchemaPropertyRole;
  target: SchemaTarget | null;
  value: PropertyValueDescriptor;
}>;

export type EditorSchemaUnknownPolicy = 'preserve' | 'reject';

/** Exact semantic identity for a schema without application-owned lineage. */
export type DerivedEditorSchemaIdentity = Readonly<{
  fingerprint: string;
  kind: 'derived';
}>;

/** Stable application-owned lineage plus its exact semantic fingerprint. */
export type NamedEditorSchemaIdentity = Readonly<{
  fingerprint: string;
  id: string;
  kind: 'named';
  version: number;
}>;

/** Published schema identity. Runtime configuration revisions stay separate. */
export type EditorSchemaIdentity =
  | DerivedEditorSchemaIdentity
  | NamedEditorSchemaIdentity;

/** Semantic schema resources changed by the last configuration publication. */
export type EditorSchemaDelta = Readonly<{
  constructionTypes: readonly string[];
  elementTypes: readonly string[];
  propertyIds: readonly string[];
  /** `null` identifies the implicit primary root. */
  roots: ReadonlyArray<string | null>;
}>;

/** One closed-composition element relationship override. */
export type EditorSchemaElementOverride = Readonly<{
  /** Element type owned by `source` before application overrides. */
  element: string;
  kind: 'element';
  /** Extension that owns the element declaration. */
  source: string;
  /** Replace the element's child grammar. */
  content?: SchemaContent;
  /** Replace explicit product-group membership. */
  groups?: readonly string[];
  /** Replace the persisted element discriminator. */
  type?: string;
}>;

/** One closed-composition property relationship override. */
export type EditorSchemaPropertyOverride = Readonly<{
  /** Compiled id of the property before application overrides. */
  id: string;
  kind: 'property';
  /** Extension that owns the property declaration. */
  source: string;
  /** Replace the property's target relationship. */
  target?: SchemaTarget | null;
}>;

/** Narrow schema policy applied before deterministic compilation. */
export type EditorSchemaOverride =
  | EditorSchemaElementOverride
  | EditorSchemaPropertyOverride;

/** Element facets accepted by one closed-application override. */
export type EditorSchemaElementOverrideInput = Readonly<{
  content?: SchemaContent;
  groups?: readonly string[];
  type?: string;
}>;

/** Property relationship facets accepted by one closed-application override. */
export type EditorSchemaPropertyOverrideInput = Readonly<{
  target?: SchemaTarget | null;
}>;

/** Source-bound policy authored before the owning schema is compiled. */
type EditorSchemaOverrideSourceName<TSource> = TSource extends string
  ? TSource
  : TSource extends Readonly<{ name: infer TName extends string }>
    ? TName
    : never;

export type EditorSchemaOverrideInput<
  TSource extends string | Readonly<{ name: string }> =
    | string
    | Readonly<{ name: string }>,
  TProperties extends Readonly<
    Record<string, EditorSchemaPropertyOverrideInput>
  > = Readonly<Record<string, EditorSchemaPropertyOverrideInput>>,
> = Readonly<{
  element?: EditorSchemaElementOverrideInput;
  kind: 'schema-override';
  properties?: TProperties;
  source: EditorSchemaOverrideSourceName<TSource>;
}>;

/** One partial schema declaration. Complete lineage and primary-root fields are forbidden. */
export type EditorSchemaContribution<
  TElements extends Readonly<Record<string, SchemaElement>> = Readonly<
    Record<string, SchemaElement>
  >,
  TProperties extends readonly SchemaProperty[] = readonly SchemaProperty[],
  TGroups extends Readonly<Record<string, SchemaGroup>> = Readonly<
    Record<string, SchemaGroup>
  >,
  TRoots extends Readonly<Record<string, SchemaContent>> = Readonly<
    Record<string, SchemaContent>
  >,
  TContentRoots extends readonly SchemaContentRootContribution[] =
    readonly SchemaContentRootContribution[],
> = Readonly<{
  /** Element-owned root slots projected onto matching element types. */
  contentRoots?: TContentRoots;
  elements?: TElements;
  groups?: TGroups;
  id?: never;
  /** Closed-composition policy; ordinary feature contributions omit this. */
  overrides?: readonly EditorSchemaOverride[];
  properties?: TProperties;
  /** The complete schema definition exclusively owns the primary root. */
  root?: never;
  /** Named secondary roots only. The reserved key `main` is invalid. */
  roots?: TRoots;
  unknown?: never;
  version?: never;
}>;

type EditorSchemaDefinitionBase<
  TElements extends Readonly<Record<string, SchemaElement>>,
  TProperties extends readonly SchemaProperty[],
  TGroups extends Readonly<Record<string, SchemaGroup>>,
  TRoots extends Readonly<Record<string, SchemaContent>>,
  TContentRoots extends readonly SchemaContentRootContribution[],
> = Readonly<{
  contentRoots?: TContentRoots;
  elements?: TElements;
  groups?: TGroups;
  overrides?: never;
  properties?: TProperties;
  /** The implicit primary document root. */
  root: SchemaContent;
  /** Named secondary roots only. The reserved key `main` is invalid. */
  roots?: TRoots;
  unknown?: EditorSchemaUnknownPolicy;
}>;

/** One complete schema whose identity is derived only from compiled semantics. */
export type EditorSchemaDerivedDefinition<
  TElements extends Readonly<Record<string, SchemaElement>> = Readonly<
    Record<string, SchemaElement>
  >,
  TProperties extends readonly SchemaProperty[] = readonly SchemaProperty[],
  TGroups extends Readonly<Record<string, SchemaGroup>> = Readonly<
    Record<string, SchemaGroup>
  >,
  TRoots extends Readonly<Record<string, SchemaContent>> = Readonly<
    Record<string, SchemaContent>
  >,
  TContentRoots extends readonly SchemaContentRootContribution[] =
    readonly SchemaContentRootContribution[],
> = EditorSchemaDefinitionBase<
  TElements,
  TProperties,
  TGroups,
  TRoots,
  TContentRoots
> &
  Readonly<{
    id?: never;
    version?: never;
  }>;

/** One complete schema with application-owned persisted lineage. */
export type EditorSchemaNamedDefinition<
  TId extends string = string,
  TElements extends Readonly<Record<string, SchemaElement>> = Readonly<
    Record<string, SchemaElement>
  >,
  TProperties extends readonly SchemaProperty[] = readonly SchemaProperty[],
  TGroups extends Readonly<Record<string, SchemaGroup>> = Readonly<
    Record<string, SchemaGroup>
  >,
  TRoots extends Readonly<Record<string, SchemaContent>> = Readonly<
    Record<string, SchemaContent>
  >,
  TContentRoots extends readonly SchemaContentRootContribution[] =
    readonly SchemaContentRootContribution[],
> = EditorSchemaDefinitionBase<
  TElements,
  TProperties,
  TGroups,
  TRoots,
  TContentRoots
> &
  Readonly<{
    id: TId;
    identity?: never;
    version: number;
  }>;

export type EditorSchemaDefinition<
  TId extends string = string,
  TElements extends Readonly<Record<string, SchemaElement>> = Readonly<
    Record<string, SchemaElement>
  >,
  TProperties extends readonly SchemaProperty[] = readonly SchemaProperty[],
  TGroups extends Readonly<Record<string, SchemaGroup>> = Readonly<
    Record<string, SchemaGroup>
  >,
  TRoots extends Readonly<Record<string, SchemaContent>> = Readonly<
    Record<string, SchemaContent>
  >,
  TContentRoots extends readonly SchemaContentRootContribution[] =
    readonly SchemaContentRootContribution[],
> =
  | EditorSchemaDerivedDefinition<
      TElements,
      TProperties,
      TGroups,
      TRoots,
      TContentRoots
    >
  | EditorSchemaNamedDefinition<
      TId,
      TElements,
      TProperties,
      TGroups,
      TRoots,
      TContentRoots
    >;

export type EditorSchemaDeclaration =
  | EditorSchemaContribution
  | EditorSchemaDefinition;

/** A complete schema packaged as one raw Plite extension contribution. */
export type EditorSchemaExtension<
  TDefinition extends EditorSchemaDefinition = EditorSchemaDefinition,
  TName extends string = string,
> = Readonly<{
  name: TName;
  schema: TDefinition;
}>;

type SchemaDefinitionOf<TSchema extends EditorSchemaSource> =
  TSchema extends EditorSchemaSourceProvider<infer TDeclaration>
    ? TDeclaration
    : TSchema extends { schema: infer TSchemaDeclaration }
      ? TSchemaDeclaration extends (...args: any[]) => infer TDeclaration
        ? Extract<TDeclaration, EditorSchemaDeclaration>
        : Extract<TSchemaDeclaration, EditorSchemaDeclaration>
      : never;

export type SchemaElementTypes<TSchema extends EditorSchemaSource> = Extract<
  keyof NonNullable<SchemaDefinitionOf<TSchema>['elements']>,
  string
>;

export type SchemaElementHandle<
  TSchema extends object = EditorSchemaSource,
  TType extends string = TSchema extends EditorSchemaSource
    ? SchemaElementTypes<TSchema>
    : string,
> = Readonly<{
  kind: 'schema-element';
  schema: TSchema;
  type: TType;
}>;

export type SchemaBuiltInGroupName =
  | 'all'
  | 'block'
  | 'element'
  | 'inline'
  | 'text'
  | 'textBlock';

export type SchemaGroupNames<TSchema extends EditorSchemaSource> =
  | SchemaBuiltInGroupName
  | Extract<keyof NonNullable<SchemaDefinitionOf<TSchema>['groups']>, string>;

export type SchemaRootNames<TSchema extends EditorSchemaSource> = Extract<
  keyof NonNullable<SchemaDefinitionOf<TSchema>['roots']>,
  string
>;

type SchemaPropertyName<TKey extends SchemaPropertyKey> = TKey extends string
  ? TKey
  : TKey extends SchemaKeyPrefix
    ? `${TKey['prefix']}${string}`
    : never;

type SchemaPropertyLabel<TKey extends SchemaPropertyKey> = TKey extends string
  ? TKey
  : TKey extends SchemaKeyPrefix
    ? `${TKey['prefix']}*`
    : never;

type SchemaOwnedPropertyRecord<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  NonNullable<
    SchemaDefinitionOf<TSchema>['elements']
  >[TType] extends SchemaElement<infer TInput>
    ? TInput extends { properties: infer TProperties }
      ? TProperties extends SchemaElementProperties
        ? TProperties
        : Readonly<Record<never, never>>
      : Readonly<Record<never, never>>
    : Readonly<Record<never, never>>;

type SchemaElementInputForType<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  NonNullable<
    SchemaDefinitionOf<TSchema>['elements']
  >[TType] extends SchemaElement<infer TInput>
    ? TInput
    : SchemaElementInput;

type SchemaTargetAnd<TMatch> = false extends TMatch
  ? false
  : 'unknown' extends TMatch
    ? 'unknown'
    : true;

type SchemaTargetOr<TMatch> = true extends TMatch
  ? true
  : 'unknown' extends TMatch
    ? 'unknown'
    : false;

type SchemaTargetNot<TMatch> = [TMatch] extends [true]
  ? false
  : [TMatch] extends [false]
    ? true
    : 'unknown';

type SchemaTargetCollapse<TMatch> = [TMatch] extends [true]
  ? true
  : [TMatch] extends [false]
    ? false
    : 'unknown';

type SchemaIsUnion<TValue, TWhole = TValue> = TValue extends unknown
  ? [TWhole] extends [TValue]
    ? false
    : true
  : never;

type SchemaHasRuntimeUnion<TValue> =
  true extends SchemaIsUnion<TValue> ? true : false;

type SchemaIsAny<TValue> = 0 extends 1 & TValue ? true : false;

type SchemaVoidIsInline<TVoid> = [TVoid] extends ['inline' | 'markable-inline']
  ? true
  : [Extract<TVoid, 'inline' | 'markable-inline'>] extends [never]
    ? false
    : 'unknown';

type SchemaElementIsInlineVariant<TInput> = SchemaElementInput extends TInput
  ? 'unknown'
  : TInput extends { inline: infer TInline }
    ? [TInline] extends [true]
      ? true
      : [TInline] extends [false]
        ? false
        : 'unknown'
    : TInput extends { void: infer TVoid }
      ? SchemaVoidIsInline<TVoid>
      : false;

type SchemaElementIsInline<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> = SchemaTargetCollapse<
  SchemaElementInputForType<TSchema, TType> extends infer TInput
    ? TInput extends unknown
      ? SchemaElementIsInlineVariant<TInput>
      : never
    : 'unknown'
>;

type SchemaElementDerivedGroupMatch<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TGroup extends string,
> = TGroup extends 'all' | 'element'
  ? true
  : TGroup extends 'inline'
    ? SchemaElementIsInline<TSchema, TType>
    : TGroup extends 'block'
      ? SchemaTargetNot<SchemaElementIsInline<TSchema, TType>>
      : false;

type SchemaGroupListReachesVariant<
  TSchema extends EditorSchemaSource,
  TGroups extends readonly string[],
  TTarget extends string,
  TSeen extends string,
> = number extends TGroups['length']
  ? 'unknown'
  : TGroups extends readonly [
        infer THead extends string,
        ...infer TTail extends readonly string[],
      ]
    ? SchemaTargetOr<
        | SchemaGroupReaches<TSchema, THead, TTarget, TSeen>
        | SchemaGroupListReachesVariant<TSchema, TTail, TTarget, TSeen>
      >
    : false;

type SchemaGroupListReaches<
  TSchema extends EditorSchemaSource,
  TGroups extends readonly string[],
  TTarget extends string,
  TSeen extends string,
> = SchemaTargetCollapse<
  TGroups extends unknown
    ? SchemaGroupListReachesVariant<TSchema, TGroups, TTarget, TSeen>
    : never
>;

type SchemaGroupReachesVariant<
  TSchema extends EditorSchemaSource,
  TCurrent extends string,
  TTarget extends string,
  TSeen extends string = never,
> = TCurrent extends TTarget
  ? true
  : TCurrent extends TSeen
    ? false
    : TCurrent extends SchemaGroupNames<TSchema>
      ? NonNullable<
          SchemaDefinitionOf<TSchema>['groups']
        >[TCurrent] extends infer TDefinition
        ? TDefinition extends object
          ? 'extends' extends keyof TDefinition
            ? TDefinition extends {
                extends: infer TParents extends readonly string[];
              }
              ? SchemaGroupListReaches<
                  TSchema,
                  TParents,
                  TTarget,
                  TSeen | TCurrent
                >
              : 'unknown'
            : false
          : 'unknown'
        : 'unknown'
      : false;

type SchemaGroupReaches<
  TSchema extends EditorSchemaSource,
  TCurrent extends string,
  TTarget extends string,
  TSeen extends string = never,
> = string extends TCurrent | TTarget
  ? 'unknown'
  : SchemaTargetCollapse<
      TCurrent extends unknown
        ? SchemaGroupReachesVariant<TSchema, TCurrent, TTarget, TSeen>
        : never
    >;

type SchemaElementDeclaredGroupMatchVariant<
  TSchema extends EditorSchemaSource,
  TInput,
  TGroup extends string,
> = SchemaElementInput extends TInput
  ? 'unknown'
  : TInput extends { groups: infer TGroups extends readonly string[] }
    ? SchemaGroupListReaches<TSchema, TGroups, TGroup, never>
    : false;

type SchemaElementDeclaredGroupMatch<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TGroup extends string,
> = SchemaTargetCollapse<
  SchemaElementInputForType<TSchema, TType> extends infer TInput
    ? TInput extends unknown
      ? SchemaElementDeclaredGroupMatchVariant<TSchema, TInput, TGroup>
      : never
    : 'unknown'
>;

type SchemaElementInGroup<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TGroup extends string,
> = SchemaTargetOr<
  | SchemaElementDerivedGroupMatch<TSchema, TType, TGroup>
  | SchemaElementDeclaredGroupMatch<TSchema, TType, TGroup>
>;

type SchemaTypeListContainsVariant<
  TTypes extends readonly string[],
  TType extends string,
> = number extends TTypes['length']
  ? 'unknown'
  : TTypes extends readonly [
        infer THead extends string,
        ...infer TTail extends readonly string[],
      ]
    ? SchemaHasRuntimeUnion<THead> extends true
      ? 'unknown'
      : SchemaTargetOr<
          | (TType extends THead ? true : false)
          | SchemaTypeListContainsVariant<TTail, TType>
        >
    : false;

type SchemaTypeListContains<
  TTypes extends readonly string[],
  TType extends string,
> = SchemaTargetCollapse<
  TTypes extends unknown ? SchemaTypeListContainsVariant<TTypes, TType> : never
>;

type SchemaTargetListAndVariant<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTargets extends readonly SchemaTarget[],
  TAncestors extends readonly string[] | undefined,
  TRoot extends string | null | undefined,
> = number extends TTargets['length']
  ? 'unknown'
  : TTargets extends readonly [
        infer THead extends SchemaTarget,
        ...infer TTail extends readonly SchemaTarget[],
      ]
    ? SchemaTargetAnd<
        | SchemaTargetMatch<TSchema, TType, THead, TAncestors, TRoot>
        | SchemaTargetListAndVariant<TSchema, TType, TTail, TAncestors, TRoot>
      >
    : true;

type SchemaTargetListAnd<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTargets extends readonly SchemaTarget[],
  TAncestors extends readonly string[] | undefined,
  TRoot extends string | null | undefined,
> = SchemaTargetCollapse<
  TTargets extends unknown
    ? SchemaTargetListAndVariant<TSchema, TType, TTargets, TAncestors, TRoot>
    : never
>;

type SchemaTargetListOrVariant<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTargets extends readonly SchemaTarget[],
  TAncestors extends readonly string[] | undefined,
  TRoot extends string | null | undefined,
> = number extends TTargets['length']
  ? 'unknown'
  : TTargets extends readonly [
        infer THead extends SchemaTarget,
        ...infer TTail extends readonly SchemaTarget[],
      ]
    ? SchemaTargetOr<
        | SchemaTargetMatch<TSchema, TType, THead, TAncestors, TRoot>
        | SchemaTargetListOrVariant<TSchema, TType, TTail, TAncestors, TRoot>
      >
    : false;

type SchemaTargetListOr<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTargets extends readonly SchemaTarget[],
  TAncestors extends readonly string[] | undefined,
  TRoot extends string | null | undefined,
> = SchemaTargetCollapse<
  TTargets extends unknown
    ? SchemaTargetListOrVariant<TSchema, TType, TTargets, TAncestors, TRoot>
    : never
>;

type SchemaTargetMatchVariant<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTarget extends SchemaTarget,
  TAncestors extends readonly string[] | undefined = undefined,
  TRoot extends string | null | undefined = undefined,
> = TTarget extends { kind: 'type'; type: infer TTargetType extends string }
  ? SchemaHasRuntimeUnion<TTargetType> extends true
    ? 'unknown'
    : string extends TTargetType
      ? 'unknown'
      : TType extends TTargetType
        ? true
        : false
  : TTarget extends SchemaTypesTarget<infer TTypes>
    ? SchemaTypeListContains<TTypes, TType>
    : TTarget extends { group: infer TGroup extends string; kind: 'group' }
      ? SchemaHasRuntimeUnion<TGroup> extends true
        ? 'unknown'
        : string extends TGroup
          ? 'unknown'
          : SchemaElementInGroup<TSchema, TType, TGroup>
      : TTarget extends {
            kind: 'and';
            targets: infer TTargets extends readonly SchemaTarget[];
          }
        ? SchemaTargetListAnd<TSchema, TType, TTargets, TAncestors, TRoot>
        : TTarget extends {
              kind: 'or';
              targets: infer TTargets extends readonly SchemaTarget[];
            }
          ? SchemaTargetListOr<TSchema, TType, TTargets, TAncestors, TRoot>
          : TTarget extends {
                kind: 'not';
                target: infer TChild extends SchemaTarget;
              }
            ? SchemaTargetNot<
                SchemaTargetMatch<TSchema, TType, TChild, TAncestors, TRoot>
              >
            : TTarget extends {
                  kind: 'root';
                  root: infer TTargetRoot extends string | null;
                }
              ? [TRoot] extends [undefined]
                ? 'unknown'
                : string extends Exclude<TRoot, null | undefined>
                  ? 'unknown'
                  : SchemaHasRuntimeUnion<TRoot> extends true
                    ? 'unknown'
                    : [TRoot] extends [TTargetRoot]
                      ? [TTargetRoot] extends [TRoot]
                        ? true
                        : false
                      : false
              : TTarget extends {
                    kind: 'parent';
                    target: infer TParentTarget extends SchemaTarget;
                  }
                ? [TAncestors] extends [undefined]
                  ? 'unknown'
                  : TAncestors extends readonly [
                        infer TParent extends SchemaElementTypes<TSchema>,
                        ...infer TRest extends readonly string[],
                      ]
                    ? SchemaTargetMatch<
                        TSchema,
                        TParent,
                        TParentTarget,
                        TRest,
                        TRoot
                      >
                    : number extends NonNullable<TAncestors>['length']
                      ? 'unknown'
                      : false
                : 'unknown';

type SchemaTargetMatch<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTarget extends SchemaTarget,
  TAncestors extends readonly string[] | undefined = undefined,
  TRoot extends string | null | undefined = undefined,
> = SchemaTarget extends TTarget
  ? 'unknown'
  : SchemaElementTarget extends TTarget
    ? 'unknown'
    : SchemaTargetCollapse<
        TTarget extends unknown
          ? SchemaTargetMatchVariant<TSchema, TType, TTarget, TAncestors, TRoot>
          : never
      >;

type SchemaOwnedContentRootSlots<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  SchemaElementInputForType<TSchema, TType> extends infer TInput
    ? TInput extends {
        contentRoots: infer TRoots extends Readonly<
          Record<string, SchemaContentRootInput>
        >;
      }
      ? Extract<keyof TRoots, string>
      : never
    : never;

type SchemaDeclaredContentRoot<TSchema extends EditorSchemaSource> =
  NonNullable<SchemaDefinitionOf<TSchema>['contentRoots']>[number];

type SchemaTargetedContentRootSlot<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TRoot = SchemaDeclaredContentRoot<TSchema>,
> =
  TRoot extends SchemaContentRootContribution<
    infer TSlot,
    SchemaContentRoot,
    infer TTarget
  >
    ? [SchemaTargetMatch<TSchema, TType, TTarget>] extends [true]
      ? TSlot
      : never
    : never;

/** Required `childRoots` slots inferred for one schema element type. */
export type SchemaContentRootSlotsFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  | SchemaOwnedContentRootSlots<TSchema, TType>
  | SchemaTargetedContentRootSlot<TSchema, TType>;

type SchemaElementContentRootsFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  SchemaContentRootSlotsFor<TSchema, TType> extends infer TSlots extends string
    ? [TSlots] extends [never]
      ? Readonly<Record<never, never>>
      : Readonly<{
          childRoots: Readonly<Record<TSlots, string>>;
        }>
    : never;

type SchemaOwnedElementPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> = {
  [TKey in Extract<keyof SchemaOwnedPropertyRecord<TSchema, TType>, string>]: {
    definite: true;
    key: TKey;
    placement: 'element';
    value: SchemaOwnedPropertyRecord<TSchema, TType>[TKey];
  };
}[Extract<keyof SchemaOwnedPropertyRecord<TSchema, TType>, string>];

type SchemaDeclaredProperty<TSchema extends EditorSchemaSource> = NonNullable<
  SchemaDefinitionOf<TSchema>['properties']
>[number];

type SchemaTargetedElementPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TAncestors extends readonly string[] | undefined = undefined,
  TRoot extends string | null | undefined = undefined,
  TIncludePossible extends boolean = false,
  TProperty = SchemaDeclaredProperty<TSchema>,
> =
  TProperty extends SchemaElementProperty<
    infer TKey,
    infer TDescriptor,
    infer TTarget
  >
    ? SchemaTargetMatch<
        TSchema,
        TType,
        TTarget,
        TAncestors,
        TRoot
      > extends infer TMatch
      ? TIncludePossible extends true
        ? [TMatch] extends [false]
          ? never
          : {
              definite: [TMatch] extends [true] ? true : false;
              key: TKey;
              placement: 'element';
              value: TDescriptor;
            }
        : [TMatch] extends [true]
          ? {
              definite: true;
              key: TKey;
              placement: 'element';
              value: TDescriptor;
            }
          : never
      : never
    : never;

type SchemaElementPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TAncestors extends readonly string[] | undefined = undefined,
  TRoot extends string | null | undefined = undefined,
  TIncludePossible extends boolean = false,
> =
  | SchemaOwnedElementPropertyEntry<TSchema, TType>
  | SchemaTargetedElementPropertyEntry<
      TSchema,
      TType,
      TAncestors,
      TRoot,
      TIncludePossible
    >;

type SchemaTextPropertyEntry<
  TSchema extends EditorSchemaSource,
  TParent extends SchemaElementTypes<TSchema> | undefined = undefined,
  TAncestors extends readonly string[] | undefined = undefined,
  TRoot extends string | null | undefined = undefined,
  TIncludePossible extends boolean = false,
  TProperty = SchemaDeclaredProperty<TSchema>,
> =
  TProperty extends SchemaTextProperty<
    infer TKey,
    infer TDescriptor,
    infer TTarget extends SchemaTarget | undefined
  >
    ? TTarget extends SchemaTarget
      ? TParent extends SchemaElementTypes<TSchema>
        ? SchemaTargetMatch<
            TSchema,
            TParent,
            TTarget,
            TAncestors,
            TRoot
          > extends infer TMatch
          ? TIncludePossible extends true
            ? [TMatch] extends [false]
              ? never
              : {
                  definite: [TMatch] extends [true] ? true : false;
                  key: TKey;
                  placement: 'text';
                  value: TDescriptor;
                }
            : [TMatch] extends [true]
              ? {
                  definite: true;
                  key: TKey;
                  placement: 'text';
                  value: TDescriptor;
                }
              : never
          : never
        : TIncludePossible extends true
          ? {
              definite: false;
              key: TKey;
              placement: 'text';
              value: TDescriptor;
            }
          : never
      : {
          definite: true;
          key: TKey;
          placement: 'text';
          value: TDescriptor;
        }
    : never;

type SchemaEntryKey<TEntry> = TEntry extends {
  key: infer TKey extends SchemaPropertyKey;
}
  ? SchemaPropertyName<TKey>
  : never;

type SchemaEntryValue<TEntry, TKey extends string> = TEntry extends {
  key: infer TPropertyKey extends SchemaPropertyKey;
  value: infer TDescriptor;
}
  ? TPropertyKey extends string
    ? TKey extends TPropertyKey
      ? PropertyValueOf<TDescriptor>
      : never
    : TPropertyKey extends SchemaKeyPrefix
      ? TKey extends `${TPropertyKey['prefix']}${string}`
        ? PropertyValueOf<TDescriptor>
        : never
      : never
  : never;

type SchemaEntryRequiredKey<TEntry> = TEntry extends {
  definite: true;
  key: infer TKey extends string;
  value: infer TDescriptor;
}
  ? TDescriptor extends { required: true }
    ? TKey
    : PropertyOptionsOf<TDescriptor> extends {
          generate: (...args: never[]) => unknown;
        }
      ? TKey
      : PropertyOptionsOf<TDescriptor> extends { default: unknown }
        ? TDescriptor extends { omitDefault: false }
          ? TKey
          : never
        : never
  : never;

type SchemaEntryConstructionRequiredKey<TEntry> = TEntry extends {
  definite: true;
  key: infer TKey extends string;
  value: infer TDescriptor;
}
  ? TDescriptor extends { required: true }
    ? TKey
    : never
  : never;

type SchemaPropertiesFromEntries<TEntry> = Readonly<
  {
    [TKey in SchemaEntryRequiredKey<TEntry>]: SchemaEntryValue<TEntry, TKey>;
  } & {
    [
      TKey in Exclude<SchemaEntryKey<TEntry>, SchemaEntryRequiredKey<TEntry>>
    ]?: SchemaEntryValue<TEntry, TKey>;
  }
>;

type SchemaConstructionPropertiesFromEntries<TEntry> = Readonly<
  {
    [TKey in SchemaEntryConstructionRequiredKey<TEntry>]: SchemaEntryValue<
      TEntry,
      TKey
    >;
  } & {
    [
      TKey in Exclude<
        SchemaEntryKey<TEntry>,
        SchemaEntryConstructionRequiredKey<TEntry>
      >
    ]?: SchemaEntryValue<TEntry, TKey>;
  }
>;

/** Element property keys accepted for one schema element type. */
export type SchemaElementPropertyKeys<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  string extends SchemaElementTypes<TSchema>
    ? string
    : SchemaEntryKey<
        SchemaElementPropertyEntry<TSchema, TType, undefined, undefined, true>
      >;

/** Optional JSON property values accepted for one schema element type. */
export type SchemaElementPropertiesFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  string extends SchemaElementTypes<TSchema>
    ? Readonly<Record<string, unknown>>
    : SchemaPropertiesFromEntries<
        SchemaElementPropertyEntry<TSchema, TType, undefined, undefined, true>
      >;

/** Element properties accepted before schema defaults are materialized. */
export type SchemaElementConstructionPropertiesFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  string extends SchemaElementTypes<TSchema>
    ? Readonly<Record<string, unknown>>
    : SchemaConstructionPropertiesFromEntries<
        SchemaElementPropertyEntry<TSchema, TType, undefined, undefined, true>
      >;

export type SchemaElementPropertyValue<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TKey extends SchemaElementPropertyKeys<TSchema, TType>,
> = SchemaEntryValue<
  SchemaElementPropertyEntry<TSchema, TType, undefined, undefined, true>,
  TKey
>;

declare const schemaPropertyHandleValue: unique symbol;

/** One exact authored or compiled property identity. */
export type SchemaPropertyHandle<
  TKey extends SchemaPropertyKey = SchemaPropertyKey,
  TValue = unknown,
  TPlacement extends 'element' | 'text' = 'element' | 'text',
> = Readonly<{
  id: string;
  key: TKey;
  kind: 'schema-property';
  placement: TPlacement;
  /**
   * Covariant value witness; absent from runtime values.
   *
   * @internal
   */
  readonly [schemaPropertyHandleValue]?: TValue;
}>;

export type SchemaPropertyHandleValue<THandle> =
  THandle extends SchemaPropertyHandle<SchemaPropertyKey, infer TValue>
    ? TValue
    : never;

/** Exact and prefix-pattern text property keys declared by a schema. */
export type SchemaTextPropertyKeys<TSchema extends EditorSchemaSource> =
  string extends SchemaElementTypes<TSchema>
    ? string
    : SchemaEntryKey<
        SchemaTextPropertyEntry<TSchema, undefined, undefined, undefined, true>
      >;

/** Optional JSON property values accepted on schema text leaves. */
export type SchemaTextProperties<TSchema extends EditorSchemaSource> =
  string extends SchemaElementTypes<TSchema>
    ? Readonly<Record<string, unknown>>
    : SchemaPropertiesFromEntries<
        SchemaTextPropertyEntry<TSchema, undefined, undefined, undefined, true>
      >;

type SchemaAllPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
> =
  TType extends SchemaElementTypes<TSchema>
    ?
        | SchemaElementPropertyEntry<TSchema, TType>
        | SchemaTextPropertyEntry<
            TSchema,
            undefined,
            undefined,
            undefined,
            true
          >
    : never;

/** Stable compiled property-ID patterns. Hash suffixes remain runtime-derived. */
export type SchemaPropertyIds<TSchema extends EditorSchemaSource> =
  SchemaAllPropertyEntry<TSchema> extends infer TEntry
    ? TEntry extends {
        key: infer TKey extends SchemaPropertyKey;
        placement: infer TPlacement extends 'element' | 'text';
      }
      ? `${TPlacement}:${SchemaPropertyLabel<TKey>}@${string}`
      : never
    : never;

/** One text leaf inferred from a frozen schema definition. */
export type SchemaText<TSchema extends EditorSchemaSource> =
  string extends SchemaElementTypes<TSchema>
    ? BaseText
    : Readonly<{ text: string }> & SchemaTextProperties<TSchema>;

type SchemaAllElementPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
> =
  TType extends SchemaElementTypes<TSchema>
    ? SchemaElementPropertyEntry<TSchema, TType>
    : never;

type PreservedSchemaElementProperties<TSchema extends EditorSchemaSource> = {
  readonly [
    TKey in SchemaEntryKey<SchemaAllElementPropertyEntry<TSchema>>
  ]?: SchemaEntryValue<SchemaAllElementPropertyEntry<TSchema>, TKey>;
};

type PreservedSchemaElement<TSchema extends EditorSchemaSource> = {
  readonly [key: string]: unknown;
  readonly children: BaseElement['children'];
  readonly type: string;
} & PreservedSchemaElementProperties<TSchema>;

type SchemaNodeElementFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
> =
  string extends SchemaElementTypes<TSchema>
    ? BaseElement
    : TType extends SchemaElementTypes<TSchema>
      ? Readonly<{
          children: BaseElement['children'];
          type: TType;
        }> &
          SchemaElementPropertiesFor<TSchema, TType> &
          SchemaElementContentRootsFor<TSchema, TType>
      : never;

/**
 * Compact schema-node inference witness.
 *
 * @internal
 */
export interface SchemaNodeTypeProvider<
  TElement extends BaseElement = BaseElement,
  TText extends BaseText = BaseText,
> {
  readonly element: () => TElement;
  readonly text: () => TText;
}

type SchemaNodeTypeProviderFor<TSchema extends EditorSchemaSource> =
  TSchema extends EditorSchemaSource
    ? SchemaNodeTypeProvider<
        Extract<SchemaNodeElementFor<TSchema>, BaseElement>,
        Extract<SchemaText<TSchema>, BaseText>
      >
    : never;

/**
 * One element variant inferred from a frozen schema definition.
 *
 * Its discriminator and properties are exact. Its descendants stay broad;
 * runtime schema owns parent/child grammar and recursive validation.
 */
export type SchemaElementFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
> =
  string extends SchemaElementTypes<TSchema>
    ? BaseElement
    : TType extends SchemaElementTypes<TSchema>
      ? Readonly<{
          '~schema.node'?: SchemaNodeTypeProviderFor<TSchema>;
        }> &
          SchemaNodeElementFor<TSchema, TType>
      : never;

/**
 * One schema-owned element shape before it is placed in an installed editor.
 * A descriptor owns its discriminator and properties; runtime schema owns its
 * legal parent/child relationships.
 */
export type SchemaElementShapeFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
> =
  string extends SchemaElementTypes<TSchema>
    ? BaseElement
    : TType extends SchemaElementTypes<TSchema>
      ? Readonly<{
          '~schema.node'?: SchemaNodeTypeProviderFor<TSchema>;
        }> &
          SchemaNodeElementFor<TSchema, TType>
      : never;

/** Any descendant accepted by a closed schema definition. */
export type SchemaDescendant<TSchema extends EditorSchemaSource> =
  string extends SchemaElementTypes<TSchema>
    ? BaseElement | BaseText
    : SchemaElementFor<TSchema> | SchemaText<TSchema>;

/**
 * Exact schema elements reachable from one schema-owned node.
 *
 * @internal
 */
export type SchemaElementInNode<TNode> = '~schema.node' extends keyof TNode
  ? NonNullable<TNode[Extract<'~schema.node', keyof TNode>]> extends Readonly<{
      element: infer TElement;
    }>
    ? TElement extends () => infer TElementResult
      ? Extract<TElementResult, BaseElement> &
          Pick<TNode, Extract<'~schema.node', keyof TNode>>
      : never
    : never
  : never;

/**
 * Exact schema text variants reachable from one schema-owned node.
 *
 * @internal
 */
export type SchemaTextInNode<TNode> = '~schema.node' extends keyof TNode
  ? NonNullable<TNode[Extract<'~schema.node', keyof TNode>]> extends Readonly<{
      text: infer TText;
    }>
    ? TText extends () => infer TTextResult
      ? Extract<TTextResult, BaseText> &
          Pick<TNode, Extract<'~schema.node', keyof TNode>>
      : never
    : never
  : never;

declare const EDITOR_SCHEMA_VALUE: unique symbol;

type SchemaValueBrand<TSchema extends EditorSchemaExtension> = Readonly<{
  [EDITOR_SCHEMA_VALUE]?: SchemaNodeTypeProviderFor<TSchema>;
}>;

/**
 * Finite installed element vocabulary inferred from one complete schema.
 * Runtime schema validates primary and named-root grammar.
 */
export type SchemaValue<TSchema extends EditorSchemaExtension> = ReadonlyArray<
  string extends SchemaElementTypes<TSchema>
    ? BaseElement
    :
        | SchemaElementFor<TSchema>
        | (SchemaDefinitionOf<TSchema>['unknown'] extends 'preserve'
            ? PreservedSchemaElement<TSchema>
            : never)
> &
  SchemaValueBrand<TSchema>;

/**
 * Non-recursive schema descendant lookup for editor API generics.
 *
 * @internal
 */
export type SchemaDescendantInValue<V extends readonly unknown[]> =
  SchemaIsAny<V> extends true
    ? never
    : typeof EDITOR_SCHEMA_VALUE extends keyof V
      ? NonNullable<
          V[Extract<typeof EDITOR_SCHEMA_VALUE, keyof V>]
        > extends Readonly<{
          element: infer TElement;
          text: infer TText;
        }>
        ? Extract<
            | (TElement extends () => infer TElementResult
                ? TElementResult
                : never)
            | (TText extends () => infer TTextResult ? TTextResult : never),
            BaseElement | BaseText
          >
        : never
      : never;

/**
 * Type-only schema forwarding for extension slots.
 *
 * @internal
 */
export interface EditorSchemaExtensionProvider<
  TSchema extends EditorSchemaExtension = EditorSchemaExtension,
> {
  readonly '~schema.extensions': TSchema;
}

type SchemaDeclarationOf<TInput> = TInput extends readonly unknown[]
  ? SchemaDeclarationOf<TInput[number]>
  : TInput extends EditorSchemaExtensionProvider<infer TSchema>
    ? TSchema['schema']
    : TInput extends { schema: infer TSchema }
      ? TSchema extends (...args: any[]) => infer TResult
        ? TResult extends EditorSchemaDeclaration
          ? TResult
          : never
        : TSchema extends EditorSchemaDeclaration
          ? TSchema
          : never
      : never;

type SchemaUnionToIntersection<TValue> = (
  TValue extends unknown ? (value: TValue) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type SchemaDeclarationElements<TDeclaration> = TDeclaration extends {
  elements?: infer TElements;
}
  ? NonNullable<TElements>
  : Readonly<Record<never, never>>;

type SchemaDeclarationGroups<TDeclaration> = TDeclaration extends {
  groups?: infer TGroups;
}
  ? NonNullable<TGroups>
  : Readonly<Record<never, never>>;

type SchemaDeclarationContentRoot<TDeclaration> = TDeclaration extends {
  contentRoots?: ReadonlyArray<infer TContentRoot>;
}
  ? Extract<TContentRoot, SchemaContentRootContribution>
  : never;

type SchemaDeclarationRoots<TDeclaration> = TDeclaration extends {
  roots?: infer TRoots;
}
  ? NonNullable<TRoots>
  : Readonly<Record<never, never>>;

type SchemaDeclarationProperty<TDeclaration> = TDeclaration extends {
  properties?: ReadonlyArray<infer TProperty>;
}
  ? TProperty
  : never;

type SchemaCompleteDeclaration<TInput> = Extract<
  SchemaDeclarationOf<TInput>,
  EditorSchemaDefinition
>;

type SchemaDefaultDerivedDefinition = EditorSchemaDerivedDefinition<
  Readonly<Record<never, never>>,
  readonly [],
  Readonly<Record<never, never>>,
  Readonly<Record<never, never>>
>;

type SchemaCompleteOrDerivedDeclaration<TInput> = [
  SchemaCompleteDeclaration<TInput>,
] extends [never]
  ? SchemaDefaultDerivedDefinition
  : SchemaCompleteDeclaration<TInput>;

type SchemaComposedLineage<TComplete extends EditorSchemaDefinition> =
  TComplete extends {
    id: infer TId extends string;
    version: infer TVersion extends number;
  }
    ? Readonly<{ id: TId; version: TVersion }>
    : Readonly<Record<never, never>>;

type SchemaComposedUnknown<TComplete extends EditorSchemaDefinition> =
  TComplete extends Readonly<{
    unknown: infer TUnknown extends EditorSchemaUnknownPolicy;
  }>
    ? TUnknown
    : 'reject';

type SchemaComposedDefinition<
  TInput,
  TComplete extends EditorSchemaDefinition,
  TDeclarations = SchemaDeclarationOf<TInput>,
> = Readonly<
  {
    contentRoots: ReadonlyArray<SchemaDeclarationContentRoot<TDeclarations>>;
    elements: SchemaUnionToIntersection<
      SchemaDeclarationElements<TDeclarations>
    >;
    groups: SchemaUnionToIntersection<SchemaDeclarationGroups<TDeclarations>>;
    properties: ReadonlyArray<SchemaDeclarationProperty<TDeclarations>>;
    root: TComplete['root'];
    roots: SchemaUnionToIntersection<SchemaDeclarationRoots<TDeclarations>>;
    unknown: SchemaComposedUnknown<TComplete>;
  } & SchemaComposedLineage<TComplete>
>;

type SchemaComposedExtension<TInput> = [SchemaDeclarationOf<TInput>] extends [
  never,
]
  ? never
  : SchemaCompleteOrDerivedDeclaration<TInput> extends infer TComplete
    ? TComplete extends EditorSchemaDefinition
      ? SchemaComposedDefinition<TInput, TComplete> extends infer TDefinition
        ? TDefinition extends EditorSchemaDefinition
          ? EditorSchemaExtension<TDefinition>
          : never
        : never
      : never
    : never;

/** Complete schema vocabulary composed from every installed contribution. */
export type SchemaExtensionsOf<TInput> = SchemaComposedExtension<TInput>;

/** Default document value derived from the composed installed schema. */
export type SchemaValueFromExtensions<TInput> =
  SchemaComposedExtension<TInput> extends infer TSchema
    ? TSchema extends EditorSchemaExtension
      ? SchemaValue<TSchema>
      : never
    : never;
