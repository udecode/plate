import type {
  EditorSchemaDeclaration,
  EditorSchemaDerivedDefinition,
  EditorSchemaDefinition,
  EditorSchemaNamedDefinition,
  EditorSchemaOverrideInput,
  PropertyEnumDescriptor,
  PropertyJsonDescriptor,
  PropertyJsonOptions,
  PropertyJsonValue,
  PropertyNumberDescriptor,
  PropertyBooleanDescriptor,
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
  SchemaElement,
  SchemaElementHandle,
  SchemaElementProperty,
  SchemaElementPropertyDefinition,
  SchemaElementPropertyKeys,
  SchemaElementTypes,
  SchemaElementPropertyOptions,
  SchemaKeyPrefix,
  SchemaPropertyExclusiveGroup,
  SchemaPropertyKey,
  SchemaPropertyHandle,
  SchemaTarget,
  SchemaTextProperty,
  SchemaTextPropertyDefinition,
  SchemaTextPropertyOptions,
  SchemaTextBlockOptions,
} from '../interfaces/schema';
import type { EditorSchemaSource } from './schema-source.internal';
import { cloneFrozen } from './clone';
import { getCompiledSchemaPropertyId } from './schema-compiler';

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

const assertPropertyValidation = (
  value: Readonly<{
    validate?: unknown;
    validationVersion?: unknown;
  }>,
  owner: string
) => {
  const hasValidate = Object.hasOwn(value, 'validate');
  const hasVersion = Object.hasOwn(value, 'validationVersion');

  if (hasValidate !== hasVersion) {
    throw new Error(
      `${owner} validate and validationVersion must be declared together.`
    );
  }
  if (!hasValidate) return;
  if (typeof value.validate !== 'function') {
    throw new Error(`${owner} validate must be a function.`);
  }
  if (
    typeof value.validationVersion !== 'number' ||
    !Number.isSafeInteger(value.validationVersion) ||
    value.validationVersion < 1
  ) {
    throw new Error(`${owner} validationVersion must be a positive integer.`);
  }
};

const assertPropertyDescriptorValidations = (
  descriptor: PropertyValueDescriptor,
  owner: string
): void => {
  assertPropertyValidation(descriptor, owner);
  if (descriptor.kind !== 'set') return;

  const item = (descriptor as PropertySetDescriptor).item;

  if (item) assertPropertyDescriptorValidations(item, `${owner} item`);
};

const validatePropertyValue = (
  descriptor: PropertyValueDescriptor,
  value: unknown,
  owner: string
) => {
  if (descriptor.validate && !descriptor.validate(value)) {
    throw new Error(`${owner} does not satisfy custom validation.`);
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
    case 'enum': {
      if (
        typeof value !== 'string' ||
        !(descriptor as PropertyEnumDescriptor).values.includes(value)
      ) {
        throw new Error(`${owner} must be a declared enum value.`);
      }
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

      const cloned = Object.freeze(
        [...unique]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([, item]) => item)
      );

      validatePropertyValue(descriptor, cloned, owner);

      return cloned;
    }
  }

  const cloned = cloneFrozenJson(value, owner);

  validatePropertyValue(descriptor, cloned, owner);

  return cloned;
};

const clonePropertyDescriptor = <TDescriptor extends object>(
  descriptor: TDescriptor,
  validate: ((value: unknown) => value is unknown) | undefined,
  generate: (() => unknown) | undefined,
  owner: string
): TDescriptor => {
  if (validate) {
    Object.defineProperty(descriptor, 'validate', {
      enumerable: false,
      value: validate,
    });
  }
  if (generate) {
    Object.defineProperty(descriptor, 'generate', {
      enumerable: false,
      value: generate,
    });
  }

  return cloneFrozenDeclaration(descriptor, owner);
};

const defineValue = <
  TValue,
  TKind extends Exclude<PropertyValueKind, 'set'>,
  const TOptions extends PropertyValueOptions<TValue> = {},
>(
  kind: TKind,
  options: PropertyValueOptions<TValue> & TOptions = {} as TOptions
): PropertyValueDescriptor<TValue, TKind, TOptions> => {
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    [
      'default',
      'generate',
      'omitDefault',
      'required',
      'validate',
      'validationVersion',
    ],
    `property.${kind}`
  );
  assertPropertyValidation(options, `property.${kind}`);

  const hasDefault = Object.hasOwn(options, 'default');
  const hasGenerate = Object.hasOwn(options, 'generate');

  if (options.omitDefault === true && !hasDefault) {
    throw new Error(`property.${kind} omitDefault requires a default.`);
  }
  if (options.required === true && (hasDefault || options.omitDefault)) {
    throw new Error(
      `property.${kind} required cannot be combined with default or omitDefault.`
    );
  }
  if (hasGenerate && (hasDefault || options.omitDefault || options.required)) {
    throw new Error(
      `property.${kind} generate cannot be combined with default, omitDefault, or required.`
    );
  }
  if (hasGenerate && typeof options.generate !== 'function') {
    throw new Error(`property.${kind} generate must be a function.`);
  }

  const defaultValue = hasDefault
    ? (cloneDescriptorValue(
        {
          kind,
          omitDefault: false,
          required: false,
          ...(options.validate
            ? {
                validate: options.validate,
                validationVersion: options.validationVersion,
              }
            : {}),
        },
        options.default,
        `property.${kind} default`
      ) as TValue)
    : undefined;

  return clonePropertyDescriptor(
    {
      ...(hasDefault ? { default: defaultValue as TValue } : {}),
      kind,
      omitDefault: options.omitDefault ?? false,
      required: options.required ?? false,
      ...(options.validate
        ? { validationVersion: options.validationVersion }
        : {}),
    },
    options.validate,
    options.generate,
    `property.${kind}`
  ) as PropertyValueDescriptor<TValue, TKind, TOptions>;
};

const defineSet = <
  TItemDescriptor extends PropertyValueDescriptor,
  const TOptions extends PropertySetOptions<
    PropertyValueOf<TItemDescriptor>
  > = {},
>(
  item: TItemDescriptor,
  options: PropertySetOptions<PropertyValueOf<TItemDescriptor>> &
    TOptions = {} as TOptions
): PropertySetDescriptor<TItemDescriptor, TOptions> => {
  assertPropertyDescriptorValidations(item, 'property.set');
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    [
      'default',
      'generate',
      'omitDefault',
      'required',
      'validate',
      'validationVersion',
    ],
    'property.set'
  );
  assertPropertyValidation(options, 'property.set');
  const hasDefault = Object.hasOwn(options, 'default');
  const hasGenerate = Object.hasOwn(options, 'generate');

  if (options.omitDefault === true && !hasDefault) {
    throw new Error('property.set omitDefault requires a default.');
  }
  if (options.required === true && (hasDefault || options.omitDefault)) {
    throw new Error(
      'property.set required cannot be combined with default or omitDefault.'
    );
  }
  if (hasGenerate && (hasDefault || options.omitDefault || options.required)) {
    throw new Error(
      'property.set generate cannot be combined with default, omitDefault, or required.'
    );
  }
  if (hasGenerate && typeof options.generate !== 'function') {
    throw new Error('property.set generate must be a function.');
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
    validatePropertyValue(
      {
        item,
        kind: 'set',
        omitDefault: false,
        required: false,
        ...(options.validate
          ? {
              validate: options.validate,
              validationVersion: options.validationVersion,
            }
          : {}),
      } as PropertySetDescriptor<TItemDescriptor>,
      defaultValue,
      'property.set default'
    );
  }

  return clonePropertyDescriptor(
    {
      ...(defaultValue ? { default: defaultValue } : {}),
      item,
      kind: 'set' as const,
      omitDefault: options.omitDefault ?? false,
      required: options.required ?? false,
      ...(options.validate
        ? { validationVersion: options.validationVersion }
        : {}),
    },
    options.validate,
    options.generate,
    'property.set'
  ) as unknown as PropertySetDescriptor<TItemDescriptor, TOptions>;
};

const defineEnum = <
  const TValues extends readonly [string, ...string[]],
  const TOptions extends PropertyValueOptions<TValues[number]> = {},
>(
  values: TValues,
  options: PropertyValueOptions<TValues[number]> & TOptions = {} as TOptions
): PropertyEnumDescriptor<TValues, TOptions> => {
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    [
      'default',
      'generate',
      'omitDefault',
      'required',
      'validate',
      'validationVersion',
    ],
    'property.enum'
  );
  assertPropertyValidation(options, 'property.enum');

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('property.enum values cannot be empty.');
  }
  values.forEach((value) => {
    assertNonEmpty(value, 'property.enum value');
  });
  if (new Set(values).size !== values.length) {
    throw new Error('property.enum values must be unique.');
  }

  const clonedValues = Object.freeze([...values]) as unknown as TValues;
  const hasDefault = Object.hasOwn(options, 'default');
  const hasGenerate = Object.hasOwn(options, 'generate');

  if (options.omitDefault === true && !hasDefault) {
    throw new Error('property.enum omitDefault requires a default.');
  }
  if (options.required === true && (hasDefault || options.omitDefault)) {
    throw new Error(
      'property.enum required cannot be combined with default or omitDefault.'
    );
  }
  if (hasGenerate && (hasDefault || options.omitDefault || options.required)) {
    throw new Error(
      'property.enum generate cannot be combined with default, omitDefault, or required.'
    );
  }
  if (hasGenerate && typeof options.generate !== 'function') {
    throw new Error('property.enum generate must be a function.');
  }

  const descriptor = {
    kind: 'enum' as const,
    omitDefault: false,
    required: false,
    values: clonedValues,
    ...(options.validate
      ? {
          validate: options.validate,
          validationVersion: options.validationVersion,
        }
      : {}),
  };
  const defaultValue = hasDefault
    ? (cloneDescriptorValue(
        descriptor,
        options.default,
        'property.enum default'
      ) as TValues[number])
    : undefined;

  return clonePropertyDescriptor(
    {
      ...(hasDefault ? { default: defaultValue } : {}),
      kind: 'enum' as const,
      omitDefault: options.omitDefault ?? false,
      required: options.required ?? false,
      ...(options.validate
        ? { validationVersion: options.validationVersion }
        : {}),
      values: clonedValues,
    },
    options.validate,
    options.generate,
    'property.enum'
  ) as unknown as PropertyEnumDescriptor<TValues, TOptions>;
};

type PropertyJsonOptionsWithoutValidation = Readonly<{
  default?: PropertyJsonValue;
  generate?: () => PropertyJsonValue;
  omitDefault?: boolean;
  required?: boolean;
  validate?: never;
  validationVersion?: never;
}>;

type JsonValueGuard = (value: unknown) => value is PropertyJsonValue;

type GuardedJsonValue<TGuard extends JsonValueGuard> = TGuard extends (
  value: unknown
) => value is infer TValue
  ? TValue
  : never;

type PropertyJsonOptionsWithValidation = Readonly<{
  default?: PropertyJsonValue;
  generate?: () => PropertyJsonValue;
  omitDefault?: boolean;
  required?: boolean;
  validate: JsonValueGuard;
  validationVersion: number;
}>;

function defineJson<
  const TOptions extends PropertyJsonOptionsWithoutValidation = {},
>(
  options?: PropertyJsonOptionsWithoutValidation & TOptions
): PropertyJsonDescriptor<PropertyJsonValue, TOptions>;
function defineJson<const TOptions extends PropertyJsonOptionsWithValidation>(
  options: TOptions &
    Readonly<{
      default?: NoInfer<GuardedJsonValue<TOptions['validate']>>;
    }>
): PropertyJsonDescriptor<
  GuardedJsonValue<TOptions['validate']>,
  TOptions & PropertyValueOptions<GuardedJsonValue<TOptions['validate']>>
>;
function defineJson<
  TValue = PropertyJsonValue,
  const TOptions extends PropertyJsonOptions<TValue> = {},
>(
  options: PropertyJsonOptions<TValue> = {}
): PropertyJsonDescriptor<TValue, TOptions> {
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    [
      'default',
      'generate',
      'omitDefault',
      'required',
      'validate',
      'validationVersion',
    ],
    'property.json'
  );

  return defineValue<TValue, 'json', TOptions>(
    'json',
    options as TOptions
  ) as PropertyJsonDescriptor<TValue, TOptions>;
}

/** Shared JSON property value builders. */
export interface PropertyBuilderApi {
  readonly boolean: <const TOptions extends PropertyValueOptions<boolean> = {}>(
    options?: PropertyValueOptions<boolean> & TOptions
  ) => PropertyBooleanDescriptor<TOptions>;
  readonly enum: typeof defineEnum;
  readonly json: typeof defineJson;
  readonly number: <const TOptions extends PropertyValueOptions<number> = {}>(
    options?: PropertyValueOptions<number> & TOptions
  ) => PropertyNumberDescriptor<TOptions>;
  readonly set: <
    TItemDescriptor extends PropertyValueDescriptor,
    const TOptions extends PropertySetOptions<
      PropertyValueOf<TItemDescriptor>
    > = {},
  >(
    item: TItemDescriptor,
    options?: PropertySetOptions<PropertyValueOf<TItemDescriptor>> & TOptions
  ) => PropertySetDescriptor<TItemDescriptor, TOptions>;
  readonly string: <const TOptions extends PropertyValueOptions<string> = {}>(
    options?: PropertyValueOptions<string> & TOptions
  ) => PropertyStringDescriptor<TOptions>;
}

export const property = Object.freeze({
  boolean: <const TOptions extends PropertyValueOptions<boolean> = {}>(
    options: PropertyValueOptions<boolean> & TOptions = {} as TOptions
  ) => defineValue<boolean, 'boolean', TOptions>('boolean', options),
  enum: defineEnum,
  json: defineJson,
  number: <const TOptions extends PropertyValueOptions<number> = {}>(
    options: PropertyValueOptions<number> & TOptions = {} as TOptions
  ) => defineValue<number, 'number', TOptions>('number', options),
  set: defineSet,
  string: <const TOptions extends PropertyValueOptions<string> = {}>(
    options: PropertyValueOptions<string> & TOptions = {} as TOptions
  ) => defineValue<string, 'string', TOptions>('string', options),
}) as unknown as PropertyBuilderApi;

const freezeStringSet = <const TValues extends readonly string[]>(
  values: TValues,
  owner: string,
  allowEmpty = false
): TValues => {
  if (!allowEmpty && values.length === 0) {
    throw new Error(`${owner} cannot be empty.`);
  }

  for (const value of values) assertNonEmpty(value, owner);

  return Object.freeze([...new Set(values)].sort()) as unknown as TValues;
};

const typeTarget = <const TType extends string>(type: TType) => {
  assertNonEmpty(type, 'Schema target type');

  return Object.freeze({ kind: 'type', type });
};

const elementReferenceName = <
  const TSource extends string | Readonly<{ name: string }>,
>(
  source: TSource
) => {
  const name = typeof source === 'string' ? source : source.name;

  assertNonEmpty(name, 'Schema element source');

  return name;
};

const schemaElementSourceReference = Symbol('schema.element.source');

const attachElementSourceReference = <T extends object>(
  value: T,
  source: unknown
): T => {
  Object.defineProperty(value, schemaElementSourceReference, {
    value: () => source,
  });

  return value;
};

/** @internal Recover the nominal source retained by element relationship builders. */
export const getSchemaElementSourceReference = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') return;

  const read = Reflect.get(value, schemaElementSourceReference);

  return typeof read === 'function'
    ? Reflect.apply(read, undefined, [])
    : undefined;
};

type SchemaElementSourceName<TSource> = TSource extends string
  ? TSource
  : TSource extends Readonly<{ name: infer TName extends string }>
    ? TName
    : never;

type SchemaElementContentOptions = Omit<SchemaContentOptions, 'default'>;
type SchemaElementContentRule<
  TSource extends string | Readonly<{ name: string }>,
> = Readonly<{
  kind: 'type';
  source: SchemaElementSourceName<TSource>;
  type: SchemaElementSourceName<TSource>;
}>;
type SchemaElementContentRules<
  TSources extends readonly (string | Readonly<{ name: string }>)[],
> = {
  readonly [TIndex in keyof TSources]: TSources[TIndex] extends
    | string
    | Readonly<{ name: string }>
    ? SchemaElementContentRule<TSources[TIndex]>
    : never;
};

const elementTarget = <
  const TSource extends string | Readonly<{ name: string }>,
>(
  source: TSource
): Readonly<{
  kind: 'type';
  source: SchemaElementSourceName<TSource>;
  type: SchemaElementSourceName<TSource>;
}> => {
  const name = elementReferenceName(source);

  return Object.freeze(
    attachElementSourceReference(
      {
        kind: 'type' as const,
        source: name,
        type: name,
      },
      source
    )
  ) as Readonly<{
    kind: 'type';
    source: SchemaElementSourceName<TSource>;
    type: SchemaElementSourceName<TSource>;
  }>;
};

type SchemaElementTargetNames<
  TSources extends readonly (string | Readonly<{ name: string }>)[],
> = {
  readonly [TIndex in keyof TSources]: SchemaElementSourceName<
    TSources[TIndex]
  >;
};

const elementTargets = <
  const TSources extends readonly [
    string | Readonly<{ name: string }>,
    ...(string | Readonly<{ name: string }>)[],
  ],
>(
  sources: TSources
) => {
  if (sources.length === 0) {
    throw new Error('Schema target elements cannot be empty.');
  }

  const names = sources.map(
    elementReferenceName
  ) as unknown as SchemaElementTargetNames<TSources>;

  return Object.freeze(
    attachElementSourceReference(
      {
        kind: 'types' as const,
        sources: Object.freeze([...names]),
        types: Object.freeze([...names]),
      },
      Object.freeze([...sources])
    )
  );
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
  element: elementTarget,
  elements: elementTargets,
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

const exclusivePropertyGroup = <const TId extends string>(
  id: TId
): SchemaPropertyExclusiveGroup<TId> => {
  assertNonEmpty(id, 'Schema exclusive property group');

  return Object.freeze({ id, kind: 'exclusive' });
};

type TextPropertyTarget<TOptions extends SchemaTextPropertyOptions> =
  TOptions extends { target: infer TTarget extends SchemaTarget }
    ? TTarget
    : undefined;

type PropertyCopyOptions<TDescriptor extends PropertyValueDescriptor> =
  TDescriptor extends { readonly required: true }
    ? Readonly<{ copy?: 'preserve' }>
    : unknown;

const assertPropertyCopyPolicy = (
  value: PropertyValueDescriptor,
  copy: SchemaTextPropertyOptions['copy'],
  owner: string
) => {
  if (value.required && copy === 'drop') {
    throw new Error(`${owner} required cannot use copy: drop.`);
  }
};

function textProperty<
  TDescriptor extends PropertyValueDescriptor,
  const TOptions extends SchemaTextPropertyOptions = SchemaTextPropertyOptions,
>(
  value: TDescriptor,
  options?: TOptions & PropertyCopyOptions<TDescriptor>
): SchemaTextPropertyDefinition<TDescriptor, TextPropertyTarget<TOptions>>;
function textProperty<
  const TKey extends SchemaPropertyKey,
  TDescriptor extends PropertyValueDescriptor,
  const TOptions extends SchemaTextPropertyOptions = SchemaTextPropertyOptions,
>(
  key: TKey,
  value: TDescriptor,
  options?: TOptions & PropertyCopyOptions<TDescriptor>
): SchemaTextProperty<TKey, TDescriptor, TextPropertyTarget<TOptions>>;
function textProperty(
  keyOrValue: SchemaPropertyKey | PropertyValueDescriptor,
  valueOrOptions: PropertyValueDescriptor | SchemaTextPropertyOptions = {},
  maybeOptions?: SchemaTextPropertyOptions
): SchemaTextProperty | SchemaTextPropertyDefinition {
  const keyed =
    typeof keyOrValue === 'string' ||
    ('kind' in keyOrValue && keyOrValue.kind === 'prefix');
  const key = keyed ? (keyOrValue as SchemaPropertyKey) : null;
  const value = (
    keyed ? valueOrOptions : keyOrValue
  ) as PropertyValueDescriptor;
  const options = (
    keyed ? (maybeOptions ?? {}) : valueOrOptions
  ) as SchemaTextPropertyOptions;

  if (key) assertPropertyKey(key);
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    ['copy', 'exclusive', 'inclusive', 'role', 'split', 'target', 'typeChange'],
    'schema.textProperty options'
  );
  assertPropertyCopyPolicy(value, options.copy, 'schema.textProperty');

  return cloneFrozenDeclaration(
    {
      copy: options.copy ?? 'preserve',
      ...(options.exclusive ? { exclusive: options.exclusive } : {}),
      inclusive: options.inclusive ?? true,
      ...(key ? { key } : {}),
      placement: 'text' as const,
      role: options.role ?? 'content',
      split: options.split ?? 'preserve',
      ...(options.target ? { target: options.target } : {}),
      typeChange: options.typeChange ?? 'drop',
      value,
    },
    'schema.textProperty'
  ) as SchemaTextProperty | SchemaTextPropertyDefinition;
}

function elementProperty<
  TDescriptor extends PropertyValueDescriptor,
  const TOptions extends SchemaElementPropertyOptions,
>(
  value: TDescriptor,
  options: TOptions & PropertyCopyOptions<TDescriptor>
): SchemaElementPropertyDefinition<TDescriptor, TOptions['target']>;
function elementProperty<
  const TKey extends SchemaPropertyKey,
  TDescriptor extends PropertyValueDescriptor,
  const TOptions extends SchemaElementPropertyOptions,
>(
  key: TKey,
  value: TDescriptor,
  options: TOptions & PropertyCopyOptions<TDescriptor>
): SchemaElementProperty<TKey, TDescriptor, TOptions['target']>;
function elementProperty(
  keyOrValue: SchemaPropertyKey | PropertyValueDescriptor,
  valueOrOptions: PropertyValueDescriptor | SchemaElementPropertyOptions,
  maybeOptions?: SchemaElementPropertyOptions
): SchemaElementProperty | SchemaElementPropertyDefinition {
  const keyed =
    typeof keyOrValue === 'string' ||
    ('kind' in keyOrValue && keyOrValue.kind === 'prefix');
  const key = keyed ? (keyOrValue as SchemaPropertyKey) : null;
  const value = (
    keyed ? valueOrOptions : keyOrValue
  ) as PropertyValueDescriptor;
  const options = (
    keyed ? maybeOptions : valueOrOptions
  ) as SchemaElementPropertyOptions;

  if (key) assertPropertyKey(key);
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    ['copy', 'role', 'split', 'target', 'typeChange'],
    'schema.elementProperty options'
  );
  assertPropertyCopyPolicy(value, options.copy, 'schema.elementProperty');

  return cloneFrozenDeclaration(
    {
      copy: options.copy ?? 'preserve',
      ...(key ? { key } : {}),
      placement: 'element' as const,
      role: options.role ?? 'content',
      split: options.split ?? 'preserve',
      target: options.target,
      typeChange: options.typeChange ?? 'drop',
      value,
    },
    'schema.elementProperty'
  ) as SchemaElementProperty | SchemaElementPropertyDefinition;
}

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

const content = <
  const TAllowed extends SchemaContent['allowed'],
  const TOptions extends SchemaContentOptions = {},
>(
  allowed: TAllowed,
  options: TOptions = {} as TOptions
): SchemaContent<TAllowed, TOptions> => {
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
  ) as SchemaContent<TAllowed, TOptions>;
};

type ContentRuleOf<TInput extends SchemaContentInput> =
  TInput extends SchemaContent<infer TRule, SchemaContentOptions | undefined>
    ? TRule
    : Extract<TInput, SchemaContent['allowed']>;

const toContentRule = <const TInput extends SchemaContentInput>(
  input: TInput
): ContentRuleOf<TInput> => {
  if (!('allowed' in input)) return input as ContentRuleOf<TInput>;
  if (
    input.default !== undefined ||
    input.max !== undefined ||
    input.min !== undefined
  ) {
    throw new Error(
      'Nested schema content rules cannot declare default, min, or max.'
    );
  }

  return input.allowed as ContentRuleOf<TInput>;
};

type ContentRulesOf<TInputs extends readonly SchemaContentInput[]> = {
  readonly [TIndex in keyof TInputs]: ContentRuleOf<TInputs[TIndex]>;
};

type CombinedContentRule<
  TKind extends 'all' | 'any',
  TInputs extends readonly SchemaContentInput[],
> = TKind extends 'all'
  ? Readonly<{ kind: 'all'; rules: ContentRulesOf<TInputs> }>
  : Readonly<{ kind: 'any'; rules: ContentRulesOf<TInputs> }>;

const combineContent = <
  const TKind extends 'all' | 'any',
  const TInputs extends readonly [SchemaContentInput, ...SchemaContentInput[]],
  const TOptions extends SchemaContentOptions = {},
>(
  kind: TKind,
  inputs: TInputs,
  options: TOptions = {} as TOptions
): SchemaContent<CombinedContentRule<TKind, TInputs>, TOptions> => {
  if (inputs.length === 0) {
    throw new Error(`schema.content.${kind} requires at least one rule.`);
  }

  return content(
    Object.freeze({
      kind,
      rules: Object.freeze(
        inputs.map(toContentRule)
      ) as ContentRulesOf<TInputs>,
    }) as CombinedContentRule<TKind, TInputs>,
    options
  );
};

type TextBlockContent = SchemaContent<
  Readonly<{
    kind: 'any';
    rules: readonly [
      Readonly<{ kind: 'text' }>,
      Readonly<{ group: 'inline'; kind: 'group' }>,
    ];
  }>,
  Readonly<{ default: 'text'; min: 1 }>
>;

function textBlock(): SchemaElement<{ content: TextBlockContent }>;
function textBlock<const TOptions extends SchemaTextBlockOptions>(
  options: TOptions
): SchemaElement<TOptions & { content: TextBlockContent }>;
function textBlock(
  options: SchemaTextBlockOptions = {}
): SchemaElement<SchemaTextBlockOptions & { content: TextBlockContent }> {
  assertOnlyKeys(
    options as Readonly<Record<string, unknown>>,
    [
      'atom',
      'contentRoots',
      'groups',
      'isolating',
      'keyboardSelectable',
      'markableVoid',
      'properties',
      'readOnly',
      'selectable',
      'slice',
    ],
    'schema.element.textBlock options'
  );

  return cloneFrozenDeclaration(
    {
      ...options,
      content: combineContent(
        'any',
        [
          content(Object.freeze({ kind: 'text' })),
          content(Object.freeze({ group: 'inline', kind: 'group' })),
        ],
        { default: 'text', min: 1 }
      ),
    },
    'schema.element.textBlock'
  );
}

const elementHandle = <
  const TSchema extends EditorSchemaSource,
  const TType extends SchemaElementTypes<TSchema>,
>(
  schema: TSchema,
  type: TType
): SchemaElementHandle<TSchema, TType> =>
  Object.freeze({ kind: 'schema-element', schema, type });

function propertyHandle<
  const TSchema extends EditorSchemaSource,
  const TType extends SchemaElementTypes<TSchema>,
  const TKey extends SchemaElementPropertyKeys<TSchema, TType>,
>(
  element: SchemaElementHandle<TSchema, TType>,
  key: TKey
): SchemaPropertyHandle<
  TKey,
  import('../interfaces/schema').SchemaElementPropertyValue<
    TSchema,
    TType,
    TKey
  >,
  'element'
>;
function propertyHandle<
  const TProperty extends import('../interfaces/schema').SchemaProperty,
>(
  property: TProperty
): SchemaPropertyHandle<
  TProperty['key'],
  PropertyValueOf<TProperty['value']>,
  TProperty['placement']
>;
function propertyHandle(
  elementOrProperty:
    | SchemaElementHandle<EditorSchemaSource, string>
    | import('../interfaces/schema').SchemaProperty,
  key?: string
): SchemaPropertyHandle {
  const isElement = (
    value: typeof elementOrProperty
  ): value is SchemaElementHandle<EditorSchemaSource, string> =>
    'schema' in value && value.kind === 'schema-element';
  const property = isElement(elementOrProperty)
    ? {
        key: key!,
        placement: 'element' as const,
        target: Object.freeze({
          kind: 'type' as const,
          type: elementOrProperty.type,
        }),
      }
    : elementOrProperty;

  assertPropertyKey(property.key);

  return Object.freeze({
    id: getCompiledSchemaPropertyId(property),
    key: property.key,
    kind: 'schema-property',
    placement: property.placement,
  });
}

type SchemaContentApi = (<
  const TAllowed extends SchemaContent['allowed'],
  const TOptions extends SchemaContentOptions = {},
>(
  allowed: TAllowed,
  options?: TOptions
) => SchemaContent<TAllowed, TOptions>) &
  Readonly<{
    all: <
      const TInputs extends readonly [
        SchemaContentInput,
        ...SchemaContentInput[],
      ],
      const TOptions extends SchemaContentOptions = {},
    >(
      inputs: TInputs,
      options?: TOptions
    ) => SchemaContent<CombinedContentRule<'all', TInputs>, TOptions>;
    any: <
      const TInputs extends readonly [
        SchemaContentInput,
        ...SchemaContentInput[],
      ],
      const TOptions extends SchemaContentOptions = {},
    >(
      inputs: TInputs,
      options?: TOptions
    ) => SchemaContent<CombinedContentRule<'any', TInputs>, TOptions>;
    group: <
      const TGroup extends string,
      const TOptions extends SchemaContentOptions = {},
    >(
      group: TGroup,
      options?: TOptions
    ) => SchemaContent<Readonly<{ group: TGroup; kind: 'group' }>, TOptions>;
    element: <
      const TSource extends string | Readonly<{ name: string }>,
      const TOptions extends SchemaElementContentOptions = {},
    >(
      source: TSource,
      options?: TOptions
    ) => SchemaContent<
      Readonly<{
        kind: 'type';
        source: SchemaElementSourceName<TSource>;
        type: SchemaElementSourceName<TSource>;
      }>,
      TOptions &
        Readonly<{
          default: Readonly<{ type: SchemaElementSourceName<TSource> }>;
        }>
    >;
    elements: <
      const TSources extends readonly [
        string | Readonly<{ name: string }>,
        ...(string | Readonly<{ name: string }>)[],
      ],
      const TOptions extends SchemaElementContentOptions = {},
    >(
      sources: TSources,
      options?: TOptions
    ) => SchemaContent<
      CombinedContentRule<'any', SchemaElementContentRules<TSources>>,
      TOptions &
        Readonly<{
          default: Readonly<{
            type: SchemaElementSourceName<TSources[0]>;
          }>;
        }>
    >;
    not: <
      const TInput extends SchemaContentInput,
      const TOptions extends SchemaContentOptions = {},
    >(
      input: TInput,
      options?: TOptions
    ) => SchemaContent<
      Readonly<{ kind: 'not'; rule: ContentRuleOf<TInput> }>,
      TOptions
    >;
    open: <const TOptions extends SchemaContentOptions = {}>(
      options?: TOptions
    ) => SchemaContent<Readonly<{ kind: 'open' }>, TOptions>;
    text: <const TOptions extends SchemaContentOptions = {}>(
      options?: TOptions
    ) => SchemaContent<Readonly<{ kind: 'text' }>, TOptions>;
    type: <
      const TType extends string,
      const TOptions extends SchemaContentOptions = {},
    >(
      type: TType,
      options?: TOptions
    ) => SchemaContent<Readonly<{ kind: 'type'; type: TType }>, TOptions>;
    types: <
      const TTypes extends readonly string[],
      const TOptions extends SchemaContentOptions = {},
    >(
      types: TTypes,
      options?: TOptions
    ) => SchemaContent<Readonly<{ kind: 'types'; types: TTypes }>, TOptions>;
  }>;

type SchemaDefinitionApi = Readonly<{
  content: SchemaContentApi;
  element: Readonly<{ textBlock: typeof textBlock }>;
  elementProperty: typeof elementProperty;
  handle: Readonly<{
    element: typeof elementHandle;
    property: typeof propertyHandle;
  }>;
  key: Readonly<{ prefix: typeof keyPrefix }>;
  override: typeof schemaOverride;
  property: Readonly<{ exclusive: typeof exclusivePropertyGroup }>;
  textProperty: typeof textProperty;
}>;

const schemaOverride = <
  const TSource extends string | Readonly<{ name: string }>,
  const TPatch extends Omit<
    EditorSchemaOverrideInput<TSource>,
    'kind' | 'source'
  >,
>(
  source: TSource,
  patch: TPatch
): EditorSchemaOverrideInput<
  TSource,
  TPatch extends Readonly<{ properties: infer TProperties }>
    ? Extract<
        TProperties,
        Readonly<
          Record<
            string,
            import('../interfaces/schema').EditorSchemaPropertyOverrideInput
          >
        >
      >
    : Readonly<Record<never, never>>
> =>
  cloneFrozenDeclaration(
    attachElementSourceReference(
      {
        ...patch,
        kind: 'schema-override' as const,
        source: elementReferenceName(source),
      },
      source
    ),
    'schema.override'
  ) as never;

const schemaContent: SchemaContentApi = Object.assign(content, {
  all: <
    const TInputs extends readonly [
      SchemaContentInput,
      ...SchemaContentInput[],
    ],
    const TOptions extends SchemaContentOptions = {},
  >(
    inputs: TInputs,
    options: TOptions = {} as TOptions
  ) => combineContent('all', inputs, options),
  any: <
    const TInputs extends readonly [
      SchemaContentInput,
      ...SchemaContentInput[],
    ],
    const TOptions extends SchemaContentOptions = {},
  >(
    inputs: TInputs,
    options: TOptions = {} as TOptions
  ) => combineContent('any', inputs, options),
  element: <
    const TSource extends string | Readonly<{ name: string }>,
    const TOptions extends SchemaElementContentOptions = {},
  >(
    source: TSource,
    options: TOptions = {} as TOptions
  ) => {
    const reference = elementTarget(source);

    return content(reference, {
      ...options,
      default: { type: reference.type },
    });
  },
  elements: <
    const TSources extends readonly [
      string | Readonly<{ name: string }>,
      ...(string | Readonly<{ name: string }>)[],
    ],
    const TOptions extends SchemaElementContentOptions = {},
  >(
    sources: TSources,
    options: TOptions = {} as TOptions
  ) => {
    const references = sources.map(elementTarget) as unknown as [
      SchemaElementContentRule<TSources[0]>,
      ...SchemaElementContentRule<TSources[number]>[],
    ];

    return combineContent('any', references, {
      ...options,
      default: { type: references[0].type },
    }) as never;
  },
  group: <
    const TGroup extends string,
    const TOptions extends SchemaContentOptions = {},
  >(
    group: TGroup,
    options: TOptions = {} as TOptions
  ) => {
    assertNonEmpty(group, 'Schema content group');

    return content(Object.freeze({ group, kind: 'group' }), options);
  },
  open: <const TOptions extends SchemaContentOptions = {}>(
    options: TOptions = {} as TOptions
  ) => content(Object.freeze({ kind: 'open' }), options),
  text: <const TOptions extends SchemaContentOptions = {}>(
    options: TOptions = {} as TOptions
  ) => content(Object.freeze({ kind: 'text' }), options),
  type: <
    const TType extends string,
    const TOptions extends SchemaContentOptions = {},
  >(
    type: TType,
    options: TOptions = {} as TOptions
  ) => {
    assertNonEmpty(type, 'Schema content type');

    return content(Object.freeze({ kind: 'type', type }), options);
  },
  not: <
    const TInput extends SchemaContentInput,
    const TOptions extends SchemaContentOptions = {},
  >(
    input: TInput,
    options: TOptions = {} as TOptions
  ) =>
    content(
      Object.freeze({ kind: 'not', rule: toContentRule(input) }),
      options
    ),
  types: <
    const TTypes extends readonly string[],
    const TOptions extends SchemaContentOptions = {},
  >(
    types: TTypes,
    options: TOptions = {} as TOptions
  ) =>
    content(
      Object.freeze({
        kind: 'types',
        types: freezeStringSet(types, 'Schema content types'),
      }),
      options
    ),
});

/** Placement, key, grammar, and root declaration builders. */
export const schema: SchemaDefinitionApi = Object.freeze({
  content: Object.freeze(schemaContent),
  element: Object.freeze({ textBlock }),
  elementProperty,
  handle: Object.freeze({
    element: elementHandle,
    property: propertyHandle,
  }),
  key: Object.freeze({ prefix: keyPrefix }),
  override: schemaOverride,
  property: Object.freeze({ exclusive: exclusivePropertyGroup }),
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

type NormalizedEditorSchemaFields<TInput extends EditorSchemaDefinition> =
  Readonly<{
    elements: 'elements' extends keyof TInput
      ? NonNullable<TInput['elements']>
      : Readonly<Record<never, never>>;
    unknown: 'unknown' extends keyof TInput
      ? NonNullable<TInput['unknown']>
      : 'reject';
  }>;

export type NormalizedEditorSchemaInput<TInput extends EditorSchemaDefinition> =
  TInput extends EditorSchemaNamedDefinition
    ? Omit<TInput, 'elements' | 'unknown'> &
        NormalizedEditorSchemaFields<TInput>
    : TInput extends EditorSchemaDerivedDefinition
      ? Omit<TInput, 'elements' | 'unknown'> &
          NormalizedEditorSchemaFields<TInput>
      : never;

/**
 * Define one complete immutable schema extension and its inferred value
 * vocabulary. Omit `id` and `version` for exact semantic matching without
 * application-owned persistence lineage, or provide both for named History,
 * collaboration, and migration lineage.
 */
export type EditorSchemaDefinitionInput<TInput extends EditorSchemaDefinition> =
  TInput &
    Record<
      Exclude<
        keyof TInput,
        | 'contentRoots'
        | 'elements'
        | 'groups'
        | 'id'
        | 'properties'
        | 'root'
        | 'roots'
        | 'unknown'
        | 'version'
      >,
      never
    > &
    WithoutReservedPrimaryRoot<TInput>;

/** @internal Normalize complete schema grammar before extension compilation. */
export const normalizeEditorSchemaDefinition = <
  const TInput extends EditorSchemaDefinition,
>(
  name: string,
  input: EditorSchemaDefinitionInput<TInput>
): NormalizedEditorSchemaInput<TInput> => {
  assertNonEmpty(name, 'Editor schema name');
  assertOnlyKeys(
    input as Readonly<Record<string, unknown>>,
    [
      'contentRoots',
      'elements',
      'groups',
      'id',
      'properties',
      'root',
      'roots',
      'unknown',
      'version',
    ],
    'Editor schema'
  );
  const named = Object.hasOwn(input, 'id') || Object.hasOwn(input, 'version');

  if (named) {
    const id = input.id;
    const version = input.version;

    if (typeof id !== 'string') {
      throw new Error('Named editor schema must define a non-empty id.');
    }
    assertNonEmpty(id, 'Editor schema id');
    if (typeof version !== 'number') {
      throw new Error(
        `Editor schema "${id}" version must be a positive integer.`
      );
    }
    assertVersion(version, `Editor schema "${id}"`);
  }
  const unknown = input.unknown ?? 'reject';

  if (!['preserve', 'reject'].includes(unknown)) {
    throw new Error('Editor schema unknown must be "preserve" or "reject".');
  }
  const definition = normalizeEditorSchemaDeclaration({
    ...input,
    elements: input.elements ?? {},
    unknown,
  }) as NormalizedEditorSchemaInput<TInput>;

  return definition;
};
