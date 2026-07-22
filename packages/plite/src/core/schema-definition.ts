import type {
  EditorSchemaDeclaration,
  EditorSchemaDefinition,
  EditorSchemaExtension,
  EditorSchemaSource,
  PropertyJsonDescriptor,
  PropertyJsonOptions,
  PropertyJsonValue,
  PropertyNumberDescriptor,
  PropertyBooleanDescriptor,
  PropertyPolicy,
  PropertyPolicyInput,
  PropertySetDescriptor,
  PropertySetOptions,
  PropertyStringDescriptor,
  PropertyValueDescriptor,
  PropertyValueKind,
  PropertyValueOf,
  PropertyValueOptions,
  SchemaContent,
  SchemaContentDefault,
  SchemaContentInput,
  SchemaContentOptions,
  SchemaElementHandle,
  SchemaElementProperty,
  SchemaElementPropertyHandle,
  SchemaElementPropertyKeys,
  SchemaElementTypes,
  SchemaElementPropertyOptions,
  SchemaKeyPrefix,
  SchemaPropertyKey,
  SchemaTarget,
  SchemaTextProperty,
  SchemaTextPropertyOptions,
} from '../interfaces/schema';
import { isPropertyPolicyToken } from '../interfaces/property-policy';
import { cloneFrozen } from './clone';

const RESERVED_PRIMARY_ROOT = 'main';

type InputRootKeys<TInput> = keyof NonNullable<
  TInput extends { readonly roots?: infer TRoots } ? TRoots : never
>;

type WithoutReservedPrimaryRoot<TInput> =
  string extends InputRootKeys<TInput>
    ? unknown
    : typeof RESERVED_PRIMARY_ROOT extends InputRootKeys<TInput>
      ? TInput extends { readonly roots: infer TRoots }
        ? Readonly<{
            roots: TRoots & Readonly<{ main?: never }>;
          }>
        : Readonly<{ roots?: never }>
      : unknown;

const assertNonEmpty = (value: string, owner: string) => {
  if (value.length === 0) throw new Error(`${owner} cannot be empty.`);
};

const assertVersion = (version: number, owner: string) => {
  if (!Number.isInteger(version) || version < 1) {
    throw new Error(`${owner} version must be a positive integer.`);
  }
};

const assertOnlyKeys = (
  value: Readonly<Record<string, unknown>>,
  allowed: readonly string[],
  owner: string
) => {
  const allowedKeys = new Set(allowed);
  const unknown = Object.keys(value).filter((key) => !allowedKeys.has(key));

  if (unknown.length > 0) {
    throw new Error(`${owner} does not support ${unknown.join(', ')}.`);
  }
};

const cloneFrozenJson = (
  value: unknown,
  owner: string,
  ancestors = new Set<object>()
): unknown => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return value;
  }
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;

    throw new Error(`${owner} must contain only finite JSON numbers.`);
  }
  if (typeof value !== 'object') {
    throw new Error(`${owner} must be JSON data.`);
  }
  if (ancestors.has(value)) throw new Error(`${owner} cannot be cyclic.`);

  const prototype = Object.getPrototypeOf(value);

  if (
    !Array.isArray(value) &&
    prototype !== Object.prototype &&
    prototype !== null
  ) {
    throw new Error(`${owner} must use plain JSON objects.`);
  }

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return Object.freeze(
        Array.from(value, (item) => cloneFrozenJson(item, owner, ancestors))
      );
    }

    return Object.freeze(
      Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [
            key,
            cloneFrozenJson(
              (value as Readonly<Record<string, unknown>>)[key],
              owner,
              ancestors
            ),
          ])
      )
    );
  } finally {
    ancestors.delete(value);
  }
};

const cloneFrozenDeclaration = <TValue>(
  value: TValue,
  owner: string,
  ancestors = new Set<object>()
): TValue => {
  if (
    value === null ||
    (typeof value !== 'object' && typeof value !== 'function') ||
    typeof value === 'function'
  ) {
    return value;
  }
  if (isPropertyPolicyToken(value)) return value;
  if (ancestors.has(value)) throw new Error(`${owner} cannot be cyclic.`);

  const prototype = Object.getPrototypeOf(value);
  const plainObject =
    prototype === Object.prototype ||
    prototype === null ||
    Object.getPrototypeOf(prototype) === null;

  if (!Array.isArray(value) && !plainObject) {
    throw new Error(`${owner} must use plain declaration objects.`);
  }

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return Object.freeze(
        Array.from(value, (item) =>
          cloneFrozenDeclaration(item, owner, ancestors)
        )
      ) as TValue;
    }

    const clone: Record<PropertyKey, unknown> = {};

    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);

      if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
        throw new Error(`${owner} cannot contain property accessors.`);
      }

      Object.defineProperty(clone, key, {
        enumerable: descriptor.enumerable,
        value: cloneFrozenDeclaration(descriptor.value, owner, ancestors),
      });
    }

    return Object.freeze(clone) as TValue;
  } finally {
    ancestors.delete(value);
  }
};

const structuralKey = (value: unknown) => JSON.stringify(value);

const assertPropertyPolicy = (policy: unknown, owner: string) => {
  if (!isPropertyPolicyToken(policy)) {
    throw new Error(
      `${owner} must use a property policy created by definePropertyPolicy.`
    );
  }
};

const assertPropertyDescriptorPolicies = (
  descriptor: PropertyValueDescriptor,
  owner: string
): void => {
  if (descriptor.policy) assertPropertyPolicy(descriptor.policy, owner);
  if (descriptor.kind !== 'set') return;

  const item = (descriptor as PropertySetDescriptor).item;

  if (item) assertPropertyDescriptorPolicies(item, `${owner} item`);
};

const validatePolicy = (
  policy: PropertyPolicyInput<unknown> | undefined,
  value: unknown,
  owner: string
) => {
  if (policy && !policy.validate(value)) {
    throw new Error(`${owner} does not satisfy policy "${policy.id}".`);
  }
};

const cloneDescriptorValue = (
  descriptor: PropertyValueDescriptor,
  value: unknown,
  owner: string
): unknown => {
  switch (descriptor.kind) {
    case 'boolean': {
      if (typeof value !== 'boolean')
        throw new Error(`${owner} must be boolean.`);
      break;
    }
    case 'number': {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${owner} must be a finite number.`);
      }
      break;
    }
    case 'string': {
      if (typeof value !== 'string')
        throw new Error(`${owner} must be a string.`);
      break;
    }
    case 'json': {
      break;
    }
    case 'set': {
      if (!Array.isArray(value)) throw new Error(`${owner} must be an array.`);

      const setDescriptor = descriptor as PropertySetDescriptor;
      const unique = new Map<string, unknown>();

      for (const item of value) {
        const cloned = cloneDescriptorValue(
          setDescriptor.item,
          item,
          `${owner} item`
        );

        unique.set(structuralKey(cloned), cloned);
      }

      return Object.freeze(
        [...unique]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([, item]) => item)
      );
    }
  }

  const cloned = cloneFrozenJson(value, owner);

  validatePolicy(descriptor.policy, cloned, owner);

  return cloned;
};

const defineValue = <TValue, TKind extends Exclude<PropertyValueKind, 'set'>>(
  kind: TKind,
  options: PropertyValueOptions<TValue> = {}
): PropertyValueDescriptor<TValue, TKind> => {
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    ['default', 'omitDefault', 'policy', 'significant'],
    `property.${kind}`
  );
  if (options.policy) {
    assertPropertyPolicy(options.policy, `property.${kind}`);
  }

  const hasDefault = Object.hasOwn(options, 'default');

  if (options.omitDefault === true && !hasDefault) {
    throw new Error(`property.${kind} omitDefault requires a default.`);
  }

  const defaultValue = hasDefault
    ? (cloneDescriptorValue(
        {
          kind,
          omitDefault: false,
        },
        options.default,
        `property.${kind} default`
      ) as TValue)
    : undefined;

  if (hasDefault) {
    validatePolicy(options.policy, defaultValue, `property.${kind} default`);
  }

  return cloneFrozenDeclaration(
    {
      ...(hasDefault ? { default: defaultValue as TValue } : {}),
      kind,
      omitDefault: options.omitDefault ?? false,
      ...(options.policy ? { policy: options.policy } : {}),
      ...(options.significant === false ? { significant: false } : {}),
    },
    `property.${kind}`
  );
};

const defineSet = <TItemDescriptor extends PropertyValueDescriptor>(
  item: TItemDescriptor,
  options: PropertySetOptions<PropertyValueOf<TItemDescriptor>> = {}
): PropertySetDescriptor<TItemDescriptor> => {
  assertPropertyDescriptorPolicies(item, 'property.set');
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    ['default', 'omitDefault', 'significant'],
    'property.set'
  );
  const hasDefault = Object.hasOwn(options, 'default');

  if (options.omitDefault === true && !hasDefault) {
    throw new Error('property.set omitDefault requires a default.');
  }

  let defaultValue: readonly PropertyValueOf<TItemDescriptor>[] | undefined;

  if (hasDefault) {
    if (!Array.isArray(options.default)) {
      throw new Error('property.set default must be an array.');
    }

    const unique = new Map<string, PropertyValueOf<TItemDescriptor>>();

    for (const value of options.default) {
      const cloned = cloneDescriptorValue(
        item,
        value,
        'property.set default item'
      ) as PropertyValueOf<TItemDescriptor>;

      unique.set(structuralKey(cloned), cloned);
    }

    defaultValue = Object.freeze(
      [...unique]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, value]) => value)
    );
  }

  return cloneFrozenDeclaration(
    {
      ...(defaultValue ? { default: defaultValue } : {}),
      item,
      kind: 'set' as const,
      omitDefault: options.omitDefault ?? false,
      ...(options.significant === false ? { significant: false } : {}),
    },
    'property.set'
  ) as PropertySetDescriptor<TItemDescriptor>;
};

type PropertyJsonOptionsWithoutPolicy<TValue extends PropertyJsonValue> = Omit<
  PropertyJsonOptions<TValue>,
  'policy'
> &
  Readonly<{
    policy?: never;
  }>;

type PropertyJsonOptionsWithPolicy<TValue> = Omit<
  PropertyJsonOptions<TValue>,
  'policy'
> &
  Readonly<{
    policy: PropertyPolicy<TValue>;
  }>;

function defineJson<TValue extends PropertyJsonValue = PropertyJsonValue>(
  options?: PropertyJsonOptionsWithoutPolicy<TValue>
): PropertyJsonDescriptor<TValue>;
function defineJson<TValue>(
  options: PropertyJsonOptionsWithPolicy<TValue>
): PropertyJsonDescriptor<TValue>;
function defineJson<TValue = PropertyJsonValue>(
  options: PropertyJsonOptions<TValue> = {}
): PropertyJsonDescriptor<TValue> {
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    ['default', 'omitDefault', 'policy', 'significant'],
    'property.json'
  );

  return defineValue('json', options);
}

/** Shared JSON property value builders. */
type PropertyBuilderApi = Readonly<{
  boolean: (
    options?: PropertyValueOptions<boolean>
  ) => PropertyBooleanDescriptor;
  json: typeof defineJson;
  number: (options?: PropertyValueOptions<number>) => PropertyNumberDescriptor;
  set: <TItemDescriptor extends PropertyValueDescriptor>(
    item: TItemDescriptor,
    options?: PropertySetOptions<PropertyValueOf<TItemDescriptor>>
  ) => PropertySetDescriptor<TItemDescriptor>;
  string: (options?: PropertyValueOptions<string>) => PropertyStringDescriptor;
}>;

export const property: PropertyBuilderApi = Object.freeze({
  boolean: (options: PropertyValueOptions<boolean> = {}) =>
    defineValue('boolean', options),
  json: defineJson,
  number: (options: PropertyValueOptions<number> = {}) =>
    defineValue('number', options) as PropertyNumberDescriptor,
  set: defineSet,
  string: (options: PropertyValueOptions<string> = {}) =>
    defineValue('string', options) as PropertyStringDescriptor,
});

const freezeStringSet = (
  values: readonly string[],
  owner: string,
  allowEmpty = false
): readonly string[] => {
  if (!allowEmpty && values.length === 0) {
    throw new Error(`${owner} cannot be empty.`);
  }

  for (const value of values) assertNonEmpty(value, owner);

  return Object.freeze([...new Set(values)].sort());
};

const typeTarget = <const TType extends string>(type: TType) => {
  assertNonEmpty(type, 'Schema target type');

  return Object.freeze({ kind: 'type', type });
};

const typesTarget = <const TTypes extends readonly string[]>(types: TTypes) => {
  if (types.length === 0) {
    throw new Error('Schema target types cannot be empty.');
  }
  for (const type of types) assertNonEmpty(type, 'Schema target types');

  return Object.freeze({
    kind: 'types' as const,
    types: cloneFrozen(types),
  });
};

const groupTarget = <const TGroup extends string>(group: TGroup) => {
  assertNonEmpty(group, 'Schema target group');

  return Object.freeze({ group, kind: 'group' });
};

function rootTarget(): Readonly<{ kind: 'root'; root: null }>;
function rootTarget<const TRoot extends string>(
  root: TRoot extends typeof RESERVED_PRIMARY_ROOT ? never : TRoot
): Readonly<{ kind: 'root'; root: TRoot }>;
function rootTarget(root?: string): SchemaTarget {
  if (root === RESERVED_PRIMARY_ROOT) {
    throw new Error(
      'target.root("main") is invalid. Omit the argument for the primary root.'
    );
  }
  if (root !== undefined) assertNonEmpty(root, 'Schema target root');

  return Object.freeze({ kind: 'root', root: root ?? null });
}

const combineTargets = <
  const TKind extends 'and' | 'or',
  const TTargets extends readonly [
    SchemaTarget,
    SchemaTarget,
    ...SchemaTarget[],
  ],
>(
  kind: TKind,
  targets: TTargets
): Readonly<{
  kind: TKind;
  targets: TTargets;
}> => {
  if (targets.length < 2) {
    throw new Error(`target.${kind} requires at least two targets.`);
  }

  return cloneFrozenDeclaration(
    { kind, targets: Object.freeze([...targets]) },
    `target.${kind}`
  ) as Readonly<{ kind: TKind; targets: TTargets }>;
};

/** Frozen serializable property-placement target builders. */
export const target = Object.freeze({
  and: <
    const TTargets extends readonly [
      SchemaTarget,
      SchemaTarget,
      ...SchemaTarget[],
    ],
  >(
    ...targets: TTargets
  ) => combineTargets('and', targets),
  group: groupTarget,
  not: <const TTarget extends SchemaTarget>(target: TTarget) =>
    cloneFrozenDeclaration({ kind: 'not' as const, target }, 'target.not'),
  or: <
    const TTargets extends readonly [
      SchemaTarget,
      SchemaTarget,
      ...SchemaTarget[],
    ],
  >(
    ...targets: TTargets
  ) => combineTargets('or', targets),
  parent: <const TTarget extends SchemaTarget>(target: TTarget) =>
    cloneFrozenDeclaration(
      { kind: 'parent' as const, target },
      'target.parent'
    ),
  root: rootTarget,
  type: typeTarget,
  types: typesTarget,
});

const assertPropertyKey = (key: SchemaPropertyKey) => {
  if (typeof key === 'string') assertNonEmpty(key, 'Schema property key');
  else assertNonEmpty(key.prefix, 'Schema property key prefix');
};

type TextPropertyTarget<TOptions extends SchemaTextPropertyOptions> =
  TOptions extends { target: infer TTarget extends SchemaTarget }
    ? TTarget
    : undefined;

const textProperty = <
  const TKey extends SchemaPropertyKey,
  TDescriptor extends PropertyValueDescriptor,
  const TOptions extends SchemaTextPropertyOptions = SchemaTextPropertyOptions,
>(
  key: TKey,
  value: TDescriptor,
  options: TOptions = {} as TOptions
): SchemaTextProperty<TKey, TDescriptor, TextPropertyTarget<TOptions>> => {
  assertPropertyKey(key);
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    ['inclusive', 'split', 'target', 'typeChange'],
    'schema.textProperty options'
  );

  return cloneFrozenDeclaration(
    {
      inclusive: options.inclusive ?? true,
      key,
      placement: 'text' as const,
      split: options.split ?? 'preserve',
      ...(options.target ? { target: options.target } : {}),
      typeChange: options.typeChange ?? 'drop',
      value,
    },
    'schema.textProperty'
  ) as SchemaTextProperty<TKey, TDescriptor, TextPropertyTarget<TOptions>>;
};

const elementProperty = <
  const TKey extends SchemaPropertyKey,
  TDescriptor extends PropertyValueDescriptor,
  const TOptions extends SchemaElementPropertyOptions,
>(
  key: TKey,
  value: TDescriptor,
  options: TOptions
): SchemaElementProperty<TKey, TDescriptor, TOptions['target']> => {
  assertPropertyKey(key);
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    ['split', 'target', 'typeChange'],
    'schema.elementProperty options'
  );

  return cloneFrozenDeclaration(
    {
      key,
      placement: 'element' as const,
      split: options.split ?? 'preserve',
      target: options.target,
      typeChange: options.typeChange ?? 'drop',
      value,
    },
    'schema.elementProperty'
  ) as SchemaElementProperty<TKey, TDescriptor, TOptions['target']>;
};

const keyPrefix = <const TPrefix extends string>(
  prefix: TPrefix
): SchemaKeyPrefix<TPrefix> => {
  assertNonEmpty(prefix, 'Schema property key prefix');

  return Object.freeze({ kind: 'prefix', prefix });
};

const assertContentOptions = (options: SchemaContentOptions) => {
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    ['default', 'max', 'min'],
    'Schema content options'
  );
  for (const [key, value] of [
    ['min', options.min],
    ['max', options.max],
  ] as const) {
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
      throw new Error(`Schema content ${key} must be a non-negative integer.`);
    }
  }
  if (
    options.min !== undefined &&
    options.max !== undefined &&
    options.min > options.max
  ) {
    throw new Error('Schema content min cannot exceed max.');
  }
};

const freezeContentDefault = (
  value: SchemaContentDefault | undefined
): SchemaContentDefault | undefined => {
  if (value === undefined || value === 'text') return value;

  assertNonEmpty(value.type, 'Schema content default type');

  return Object.freeze({ type: value.type });
};

const content = (
  allowed: SchemaContent['allowed'],
  options: SchemaContentOptions = {}
): SchemaContent => {
  assertContentOptions(options);
  const defaultValue = freezeContentDefault(options.default);

  return cloneFrozenDeclaration(
    {
      allowed,
      ...(defaultValue === undefined ? {} : { default: defaultValue }),
      ...(options.max === undefined ? {} : { max: options.max }),
      ...(options.min === undefined ? {} : { min: options.min }),
    },
    'Schema content'
  ) as SchemaContent;
};

const toContentRule = (input: SchemaContentInput): SchemaContent['allowed'] => {
  if (!('allowed' in input)) return input;
  if (
    input.default !== undefined ||
    input.max !== undefined ||
    input.min !== undefined
  ) {
    throw new Error(
      'Nested schema content rules cannot declare default, min, or max.'
    );
  }

  return input.allowed;
};

const combineContent = (
  kind: 'all' | 'any',
  inputs: readonly [SchemaContentInput, ...SchemaContentInput[]],
  options: SchemaContentOptions = {}
): SchemaContent => {
  if (inputs.length === 0) {
    throw new Error(`schema.content.${kind} requires at least one rule.`);
  }

  return content(
    Object.freeze({
      kind,
      rules: Object.freeze(inputs.map(toContentRule)),
    }),
    options
  );
};

const elementHandle = <
  const TSchema extends EditorSchemaSource,
  const TType extends SchemaElementTypes<TSchema>,
>(
  schema: TSchema,
  type: TType
): SchemaElementHandle<TSchema, TType> =>
  Object.freeze({ kind: 'schema-element', schema, type });

const elementPropertyHandle = <
  const TSchema extends EditorSchemaSource,
  const TType extends SchemaElementTypes<TSchema>,
  const TKey extends SchemaElementPropertyKeys<TSchema, TType>,
>(
  element: SchemaElementHandle<TSchema, TType>,
  key: TKey
): SchemaElementPropertyHandle<TSchema, TType, TKey> =>
  Object.freeze({ element, key, kind: 'schema-element-property' });

/** Placement, key, grammar, and root declaration builders. */
export const schema = Object.freeze({
  content: Object.freeze({
    all: (
      inputs: readonly [SchemaContentInput, ...SchemaContentInput[]],
      options: SchemaContentOptions = {}
    ) => combineContent('all', inputs, options),
    any: (
      inputs: readonly [SchemaContentInput, ...SchemaContentInput[]],
      options: SchemaContentOptions = {}
    ) => combineContent('any', inputs, options),
    group: (group: string, options: SchemaContentOptions = {}) => {
      assertNonEmpty(group, 'Schema content group');

      return content(Object.freeze({ group, kind: 'group' }), options);
    },
    open: (options: SchemaContentOptions = {}) =>
      content(Object.freeze({ kind: 'open' }), options),
    text: (options: SchemaContentOptions = {}) =>
      content(Object.freeze({ kind: 'text' }), options),
    type: (type: string, options: SchemaContentOptions = {}) => {
      assertNonEmpty(type, 'Schema content type');

      return content(Object.freeze({ kind: 'type', type }), options);
    },
    not: (input: SchemaContentInput, options: SchemaContentOptions = {}) =>
      content(
        Object.freeze({ kind: 'not', rule: toContentRule(input) }),
        options
      ),
    types: (types: readonly string[], options: SchemaContentOptions = {}) =>
      content(
        Object.freeze({
          kind: 'types',
          types: freezeStringSet(types, 'Schema content types'),
        }),
        options
      ),
  }),
  elementProperty,
  handle: Object.freeze({
    element: elementHandle,
    property: elementPropertyHandle,
  }),
  key: Object.freeze({ prefix: keyPrefix }),
  textProperty,
});

const NORMALIZED_SCHEMA_DECLARATIONS = new WeakSet<object>();

/** @internal Clone and freeze one public declaration exactly once. */
export const normalizeEditorSchemaDeclaration = <
  const TDeclaration extends EditorSchemaDeclaration,
>(
  declaration: TDeclaration
): TDeclaration => {
  if (NORMALIZED_SCHEMA_DECLARATIONS.has(declaration)) return declaration;

  const normalized = cloneFrozenDeclaration(
    declaration,
    'Editor schema declaration'
  );

  NORMALIZED_SCHEMA_DECLARATIONS.add(normalized);
  return normalized;
};

/**
 * Define one complete immutable schema extension and its inferred value
 * vocabulary. Use `identity: 'derived'` for exact semantic matching without
 * application-owned persistence lineage, or `id` and `version` for named
 * History, collaboration, and migration lineage.
 */
export const defineEditorSchema = <const TInput extends EditorSchemaDefinition>(
  input: TInput &
    Record<
      Exclude<
        keyof TInput,
        | 'elements'
        | 'groups'
        | 'id'
        | 'identity'
        | 'properties'
        | 'root'
        | 'roots'
        | 'unknown'
        | 'version'
      >,
      never
    > &
    WithoutReservedPrimaryRoot<TInput>
): EditorSchemaExtension<TInput> => {
  assertOnlyKeys(
    input as Readonly<Record<string, unknown>>,
    [
      'elements',
      'groups',
      'id',
      'identity',
      'properties',
      'root',
      'roots',
      'unknown',
      'version',
    ],
    'Editor schema'
  );
  if ('identity' in input) {
    if (input.identity !== 'derived') {
      throw new Error('Derived editor schema identity must equal "derived".');
    }
  } else {
    assertNonEmpty(input.id, 'Editor schema id');
    assertVersion(input.version, `Editor schema "${input.id}"`);
  }
  if (!['preserve', 'reject'].includes(input.unknown)) {
    throw new Error('Editor schema unknown must be "preserve" or "reject".');
  }
  const definition = normalizeEditorSchemaDeclaration(input);

  return Object.freeze({
    name: 'identity' in input ? 'schema:derived' : `schema:${input.id}`,
    schema: definition,
  }) as unknown as EditorSchemaExtension<TInput>;
};
