import type { BaseElement } from './element';
import type { PropertyPolicy, PropertyPolicyInput } from './property-policy';
import type { BaseText } from './text';

export type { PropertyPolicy, PropertyPolicyInput } from './property-policy';

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
  | 'json'
  | 'number'
  | 'set'
  | 'string';

export type PropertyValueOptions<TValue> = Readonly<{
  default?: TValue;
  omitDefault?: boolean;
  policy?: PropertyPolicy<TValue>;
  significant?: boolean;
}>;

/** One immutable JSON value law shared by text and element properties. */
export type PropertyValueDescriptor<
  TValue = unknown,
  TKind extends PropertyValueKind = PropertyValueKind,
> = Readonly<{
  default?: TValue;
  kind: TKind;
  omitDefault: boolean;
  policy?: PropertyPolicyInput<TValue>;
  /** Defaults to `true`; set `false` for cache-only identity or metadata. */
  significant?: boolean;
}>;

export type PropertyBooleanDescriptor = PropertyValueDescriptor<
  boolean,
  'boolean'
>;
export type PropertyJsonDescriptor<TValue = PropertyJsonValue> =
  PropertyValueDescriptor<TValue, 'json'>;
export type PropertyNumberDescriptor = PropertyValueDescriptor<
  number,
  'number'
>;
export type PropertyStringDescriptor = PropertyValueDescriptor<
  string,
  'string'
>;

export type PropertySetDescriptor<
  TItemDescriptor extends PropertyValueDescriptor = PropertyValueDescriptor,
> = Omit<
  PropertyValueDescriptor<readonly PropertyValueOf<TItemDescriptor>[], 'set'>,
  'policy'
> &
  Readonly<{
    item: TItemDescriptor;
  }>;

export type PropertyValueOf<TDescriptor> =
  TDescriptor extends PropertyValueDescriptor<infer TValue> ? TValue : never;

export type PropertySetOptions<TItem> = Readonly<{
  default?: readonly TItem[];
  omitDefault?: boolean;
  significant?: boolean;
}>;

export type PropertyJsonOptions = Readonly<{
  default?: PropertyJsonValue;
  omitDefault?: boolean;
  significant?: boolean;
}>;

export type PropertyTypedOptions<TValue> = Readonly<{
  default?: TValue;
  omitDefault?: boolean;
  significant?: boolean;
}>;

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
export type SchemaPropertyTypeChangePolicy = 'drop' | 'preserve-if-allowed';

export type SchemaTextPropertyOptions = Readonly<{
  inclusive?: boolean;
  split?: SchemaPropertySplitPolicy;
  target?: SchemaTarget;
  typeChange?: SchemaPropertyTypeChangePolicy;
}>;

export type SchemaElementPropertyOptions = Readonly<{
  split?: SchemaPropertySplitPolicy;
  target: SchemaTarget;
  typeChange?: SchemaPropertyTypeChangePolicy;
}>;

export type SchemaTextProperty<
  TKey extends SchemaPropertyKey = SchemaPropertyKey,
  TDescriptor extends PropertyValueDescriptor = PropertyValueDescriptor,
  TTarget extends SchemaTarget | undefined = SchemaTarget | undefined,
> = Readonly<{
  inclusive: boolean;
  key: TKey;
  placement: 'text';
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
  key: TKey;
  placement: 'element';
  split: SchemaPropertySplitPolicy;
  target: TTarget;
  typeChange: SchemaPropertyTypeChangePolicy;
  value: TDescriptor;
}>;

export type SchemaProperty =
  | SchemaElementProperty<SchemaPropertyKey, PropertyValueDescriptor>
  | SchemaTextProperty<SchemaPropertyKey, PropertyValueDescriptor>;

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

export type SchemaContent = Readonly<{
  allowed: SchemaContentRule;
  default?: SchemaContentDefault;
  max?: number;
  min?: number;
}>;

export type SchemaContentInput = SchemaContent | SchemaContentRule;

export type SchemaGroupOptions = Readonly<{
  extends?: readonly string[];
}>;

export type SchemaGroup<
  TOptions extends SchemaGroupOptions = SchemaGroupOptions,
> = Readonly<TOptions>;

export type SchemaRoot = Readonly<{
  content: SchemaContent;
}>;

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
  contentRoots?: Readonly<Record<string, SchemaContent>>;
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

/** Immutable compiled content facts exposed by `state.schema.element()`. */
export type EditorSchemaContent = Readonly<{
  allowedElementTypes: readonly string[];
  allowsText: boolean;
  allowsUnknownElements: boolean;
  default: SchemaContentDefault | null;
  max: number | null;
  min: number;
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
  contentRoots: Readonly<Record<string, EditorSchemaContent>>;
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
    inclusive: boolean | null;
    split: SchemaPropertySplitPolicy;
    typeChange: SchemaPropertyTypeChangePolicy;
  }>;
  merge: 'replace' | 'set';
  placement: 'element' | 'text';
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
  roots: readonly (string | null)[];
}>;

/** One partial schema declaration. Complete identity fields are forbidden. */
export type EditorSchemaContribution<
  TElements extends Readonly<Record<string, SchemaElement>> = Readonly<
    Record<string, SchemaElement>
  >,
  TProperties extends readonly SchemaProperty[] = readonly SchemaProperty[],
  TGroups extends Readonly<Record<string, SchemaGroup>> = Readonly<
    Record<string, SchemaGroup>
  >,
  TRoots extends Readonly<Record<string, SchemaRoot>> = Readonly<
    Record<string, SchemaRoot>
  >,
> = Readonly<{
  elements?: TElements;
  groups?: TGroups;
  id?: never;
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
  TRoots extends Readonly<Record<string, SchemaRoot>>,
> = Readonly<{
  elements: TElements;
  groups?: TGroups;
  properties?: TProperties;
  /** The implicit primary document root. */
  root: SchemaRoot;
  /** Named secondary roots only. The reserved key `main` is invalid. */
  roots?: TRoots;
  unknown: EditorSchemaUnknownPolicy;
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
  TRoots extends Readonly<Record<string, SchemaRoot>> = Readonly<
    Record<string, SchemaRoot>
  >,
> = EditorSchemaDefinitionBase<TElements, TProperties, TGroups, TRoots> &
  Readonly<{
    id?: never;
    identity: 'derived';
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
  TRoots extends Readonly<Record<string, SchemaRoot>> = Readonly<
    Record<string, SchemaRoot>
  >,
> = EditorSchemaDefinitionBase<TElements, TProperties, TGroups, TRoots> &
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
  TRoots extends Readonly<Record<string, SchemaRoot>> = Readonly<
    Record<string, SchemaRoot>
  >,
> =
  | EditorSchemaDerivedDefinition<TElements, TProperties, TGroups, TRoots>
  | EditorSchemaNamedDefinition<TId, TElements, TProperties, TGroups, TRoots>;

export type EditorSchemaDeclaration =
  | EditorSchemaContribution
  | EditorSchemaDefinition;

/** A complete schema packaged as one raw Plite extension contribution. */
export type EditorSchemaExtension<
  TDefinition extends EditorSchemaDefinition = EditorSchemaDefinition,
> = Readonly<{
  name: TDefinition extends { id: infer TId extends string }
    ? `schema:${TId}`
    : 'schema:derived';
  schema: TDefinition;
}>;

declare const EDITOR_SCHEMA_SOURCE: unique symbol;

/** Type-only exact schema contribution witness for host descriptors. */
export interface EditorSchemaSourceProvider<
  TDeclaration extends EditorSchemaDeclaration = EditorSchemaDeclaration,
> {
  readonly [EDITOR_SCHEMA_SOURCE]: TDeclaration;
}

/** Any descriptor that owns or type-provides one schema contribution. */
export type EditorSchemaSource =
  | EditorSchemaSourceProvider
  | Readonly<{
      schema:
        | EditorSchemaDeclaration
        | ((...args: any[]) => EditorSchemaDeclaration);
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
  TSchema extends EditorSchemaSource = EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
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
  TDepth extends readonly unknown[],
> = number extends TTargets['length']
  ? 'unknown'
  : TTargets extends readonly [
        infer THead extends SchemaTarget,
        ...infer TTail extends readonly SchemaTarget[],
      ]
    ? SchemaTargetAnd<
        | SchemaTargetMatch<TSchema, TType, THead, TDepth>
        | SchemaTargetListAndVariant<TSchema, TType, TTail, TDepth>
      >
    : true;

type SchemaTargetListAnd<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTargets extends readonly SchemaTarget[],
  TDepth extends readonly unknown[],
> = SchemaTargetCollapse<
  TTargets extends unknown
    ? SchemaTargetListAndVariant<TSchema, TType, TTargets, TDepth>
    : never
>;

type SchemaTargetListOrVariant<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTargets extends readonly SchemaTarget[],
  TDepth extends readonly unknown[],
> = number extends TTargets['length']
  ? 'unknown'
  : TTargets extends readonly [
        infer THead extends SchemaTarget,
        ...infer TTail extends readonly SchemaTarget[],
      ]
    ? SchemaTargetOr<
        | SchemaTargetMatch<TSchema, TType, THead, TDepth>
        | SchemaTargetListOrVariant<TSchema, TType, TTail, TDepth>
      >
    : false;

type SchemaTargetListOr<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTargets extends readonly SchemaTarget[],
  TDepth extends readonly unknown[],
> = SchemaTargetCollapse<
  TTargets extends unknown
    ? SchemaTargetListOrVariant<TSchema, TType, TTargets, TDepth>
    : never
>;

type SchemaTargetMatchVariant<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTarget extends SchemaTarget,
  TDepth extends readonly unknown[] = readonly [],
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
        ? SchemaTargetListAnd<TSchema, TType, TTargets, [...TDepth, unknown]>
        : TTarget extends {
              kind: 'or';
              targets: infer TTargets extends readonly SchemaTarget[];
            }
          ? SchemaTargetListOr<TSchema, TType, TTargets, [...TDepth, unknown]>
          : TTarget extends {
                kind: 'not';
                target: infer TChild extends SchemaTarget;
              }
            ? SchemaTargetNot<
                SchemaTargetMatch<TSchema, TType, TChild, [...TDepth, unknown]>
              >
            : 'unknown';

type SchemaTargetMatch<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TTarget extends SchemaTarget,
  TDepth extends readonly unknown[] = readonly [],
> = TDepth['length'] extends 8
  ? 'unknown'
  : SchemaTargetCollapse<
      TTarget extends unknown
        ? SchemaTargetMatchVariant<TSchema, TType, TTarget, TDepth>
        : never
    >;

type SchemaOwnedElementPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> = {
  [TKey in Extract<keyof SchemaOwnedPropertyRecord<TSchema, TType>, string>]: {
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
  TProperty = SchemaDeclaredProperty<TSchema>,
> =
  TProperty extends SchemaElementProperty<
    infer TKey,
    infer TDescriptor,
    infer TTarget
  >
    ? [SchemaTargetMatch<TSchema, TType, TTarget>] extends [true]
      ? { key: TKey; placement: 'element'; value: TDescriptor }
      : never
    : never;

type SchemaElementPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> =
  | SchemaOwnedElementPropertyEntry<TSchema, TType>
  | SchemaTargetedElementPropertyEntry<TSchema, TType>;

type SchemaTextPropertyEntry<
  TSchema extends EditorSchemaSource,
  TProperty = SchemaDeclaredProperty<TSchema>,
> =
  TProperty extends SchemaTextProperty<
    infer TKey,
    infer TDescriptor,
    SchemaTarget | undefined
  >
    ? { key: TKey; placement: 'text'; value: TDescriptor }
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

/** Element property keys accepted for one schema element type. */
export type SchemaElementPropertyKeys<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> = SchemaEntryKey<SchemaElementPropertyEntry<TSchema, TType>>;

/** Optional JSON property values accepted for one schema element type. */
export type SchemaElementPropertiesFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
> = {
  [TKey in SchemaElementPropertyKeys<TSchema, TType>]?: SchemaEntryValue<
    SchemaElementPropertyEntry<TSchema, TType>,
    TKey
  >;
};

export type SchemaElementPropertyValue<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema>,
  TKey extends SchemaElementPropertyKeys<TSchema, TType>,
> = SchemaEntryValue<SchemaElementPropertyEntry<TSchema, TType>, TKey>;

export type SchemaElementPropertyHandle<
  TSchema extends EditorSchemaSource = EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
  TKey extends SchemaElementPropertyKeys<
    TSchema,
    TType
  > = SchemaElementPropertyKeys<TSchema, TType>,
> = Readonly<{
  element: SchemaElementHandle<TSchema, TType>;
  key: TKey;
  kind: 'schema-element-property';
}>;

/** Exact and prefix-pattern text property keys declared by a schema. */
export type SchemaTextPropertyKeys<TSchema extends EditorSchemaSource> =
  SchemaEntryKey<SchemaTextPropertyEntry<TSchema>>;

/** Optional JSON property values accepted on schema text leaves. */
export type SchemaTextProperties<TSchema extends EditorSchemaSource> = {
  [TKey in SchemaTextPropertyKeys<TSchema>]?: SchemaEntryValue<
    SchemaTextPropertyEntry<TSchema>,
    TKey
  >;
};

type SchemaAllPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
> =
  TType extends SchemaElementTypes<TSchema>
    ?
        | SchemaElementPropertyEntry<TSchema, TType>
        | SchemaTextPropertyEntry<TSchema>
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
export type SchemaText<TSchema extends EditorSchemaSource> = {
  text: string;
} & SchemaTextProperties<TSchema>;

type SchemaAllElementPropertyEntry<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
> =
  TType extends SchemaElementTypes<TSchema>
    ? SchemaElementPropertyEntry<TSchema, TType>
    : never;

type PreservedSchemaElementProperties<TSchema extends EditorSchemaSource> = {
  [TKey in SchemaEntryKey<
    SchemaAllElementPropertyEntry<TSchema>
  >]?: SchemaEntryValue<SchemaAllElementPropertyEntry<TSchema>, TKey>;
};

type PreservedSchemaText<TSchema extends EditorSchemaSource> = {
  [key: string]: unknown;
  text: string;
} & SchemaTextProperties<TSchema>;

type PreservedSchemaElement<TSchema extends EditorSchemaSource> = {
  [key: string]: unknown;
  children: PreservedSchemaDescendant<TSchema>[];
  type: string;
} & PreservedSchemaElementProperties<TSchema>;

type PreservedSchemaDescendant<TSchema extends EditorSchemaSource> =
  | PreservedSchemaElement<TSchema>
  | PreservedSchemaText<TSchema>
  | SchemaElementFor<TSchema>
  | SchemaText<TSchema>;

/** One element variant inferred from a frozen schema definition. */
export type SchemaElementFor<
  TSchema extends EditorSchemaSource,
  TType extends SchemaElementTypes<TSchema> = SchemaElementTypes<TSchema>,
  TDepth extends readonly unknown[] = readonly [],
> =
  TType extends SchemaElementTypes<TSchema>
    ? {
        children: SchemaDescendant<TSchema, [...TDepth, unknown]>[];
        type: TType;
      } & SchemaElementPropertiesFor<TSchema, TType>
    : never;

/** Any descendant accepted by a closed schema definition. */
export type SchemaDescendant<
  TSchema extends EditorSchemaSource,
  TDepth extends readonly unknown[] = readonly [],
> = TDepth['length'] extends 5
  ? BaseElement | BaseText
  :
      | SchemaElementFor<TSchema, SchemaElementTypes<TSchema>, TDepth>
      | SchemaText<TSchema>;

declare const EDITOR_SCHEMA_VALUE: unique symbol;

type SchemaValueBrand<TSchema extends EditorSchemaExtension> = Readonly<{
  [EDITOR_SCHEMA_VALUE]?: TSchema;
}>;

/** Default editor value inferred from a complete schema extension. */
export type SchemaValue<TSchema extends EditorSchemaExtension> =
  (SchemaDefinitionOf<TSchema>['unknown'] extends 'preserve'
    ? PreservedSchemaElement<TSchema>[]
    : SchemaElementFor<TSchema>[]) &
    SchemaValueBrand<TSchema>;

type SchemaDescendantOfExtension<TSchema> =
  TSchema extends EditorSchemaExtension
    ? SchemaDefinitionOf<TSchema>['unknown'] extends 'preserve'
      ? PreservedSchemaDescendant<TSchema>
      : SchemaDescendant<TSchema>
    : never;

/** @internal Non-recursive schema descendant lookup for editor API generics. */
export type SchemaDescendantInValue<V extends readonly unknown[]> =
  typeof EDITOR_SCHEMA_VALUE extends keyof V
    ? V extends SchemaValueBrand<infer TSchema>
      ? SchemaDescendantOfExtension<TSchema>
      : never
    : never;

declare const EDITOR_SCHEMA_EXTENSIONS: unique symbol;

/** @internal Type-only schema forwarding for extension slots. */
export type EditorSchemaExtensionProvider<
  TSchema extends EditorSchemaExtension = EditorSchemaExtension,
> = Readonly<{
  [EDITOR_SCHEMA_EXTENSIONS]: TSchema;
}>;

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
  TValue extends unknown
    ? (value: TValue) => void
    : never
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

type SchemaDeclarationRoots<TDeclaration> = TDeclaration extends {
  roots?: infer TRoots;
}
  ? NonNullable<TRoots>
  : Readonly<Record<never, never>>;

type SchemaDeclarationProperty<TDeclaration> = TDeclaration extends {
  properties?: readonly (infer TProperty)[];
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

type SchemaComposedIdentity<TComplete extends EditorSchemaDefinition> =
  TComplete extends {
    id: infer TId extends string;
    version: infer TVersion extends number;
  }
    ? Readonly<{ id: TId; version: TVersion }>
    : Readonly<{ identity: 'derived' }>;

type SchemaComposedDefinition<
  TInput,
  TComplete extends EditorSchemaDefinition,
  TDeclarations = SchemaDeclarationOf<TInput>,
> = Readonly<
  {
    elements: SchemaUnionToIntersection<
      SchemaDeclarationElements<TDeclarations>
    >;
    groups: SchemaUnionToIntersection<SchemaDeclarationGroups<TDeclarations>>;
    properties: readonly SchemaDeclarationProperty<TDeclarations>[];
    root: TComplete['root'];
    roots: SchemaUnionToIntersection<SchemaDeclarationRoots<TDeclarations>>;
    unknown: TComplete['unknown'];
  } & SchemaComposedIdentity<TComplete>
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
