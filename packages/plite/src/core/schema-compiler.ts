import type {
  EditorSchemaDerivedDefinition,
  EditorSchemaDefinition,
  EditorSchemaDeclaration,
  EditorSchemaDelta,
  EditorSchemaIdentity,
  EditorSchemaUnknownPolicy,
  PropertyJsonValue,
  PropertyValueDescriptor,
  PropertyValueKind,
  SchemaContent,
  SchemaContentRoot,
  SchemaContentRootContribution,
  SchemaContentRootInput,
  SchemaContentRootOwnership,
  SchemaContentRule,
  SchemaElement,
  SchemaElementTarget,
  SchemaElementProperty,
  SchemaProperty,
  SchemaPropertyKey,
  SchemaTarget,
  SchemaTextProperty,
} from '../interfaces/schema';
import { profileCoreDuration } from './profiling';

const BUILT_IN_GROUPS = [
  'all',
  'block',
  'element',
  'inline',
  'text',
  'textBlock',
] as const;
const BUILT_IN_GROUP_SET = new Set<string>(BUILT_IN_GROUPS);
const COMPLETE_SCHEMA_COMMON_FIELDS = ['root', 'unknown'] as const;
const COMPLETE_SCHEMA_LINEAGE_FIELDS = ['id', 'version'] as const;
const COMPLETE_SCHEMA_FIELDS = [
  ...COMPLETE_SCHEMA_COMMON_FIELDS,
  ...COMPLETE_SCHEMA_LINEAGE_FIELDS,
] as const;
const RESERVED_PRIMARY_ROOT = 'main';
const RESERVED_ELEMENT_KEYS = new Set([
  '__proto__',
  'children',
  'constructor',
  'prototype',
  'type',
]);
const RESERVED_TEXT_KEYS = new Set([
  '__proto__',
  'children',
  'constructor',
  'prototype',
  'text',
  'type',
]);
const UNKNOWN_TYPE = '\u0000unknown-schema-type';

const DEFAULT_DERIVED_EDITOR_SCHEMA: EditorSchemaDefinition = Object.freeze({
  elements: Object.freeze({
    paragraph: Object.freeze({
      content: Object.freeze({
        allowed: Object.freeze({ kind: 'text' as const }),
        default: 'text' as const,
        min: 1,
      }),
    }),
  }),
  root: Object.freeze({
    content: Object.freeze({
      allowed: Object.freeze({
        kind: 'not' as const,
        rule: Object.freeze({ kind: 'text' as const }),
      }),
      default: Object.freeze({ type: 'paragraph' }),
    }),
  }),
  unknown: 'preserve' as const,
});

const DEFAULT_DERIVED_EDITOR_SCHEMA_RECORD: Readonly<{
  contribution: EditorSchemaDeclaration;
  extensionName: string;
}> = Object.freeze({
  contribution: DEFAULT_DERIVED_EDITOR_SCHEMA,
  extensionName: 'plite:derived-base-schema',
});

const isCompleteSchemaDeclaration = (
  declaration: EditorSchemaDeclaration
): declaration is EditorSchemaDefinition => Object.hasOwn(declaration, 'root');

const isDerivedSchemaDefinition = (
  definition: EditorSchemaDefinition
): definition is EditorSchemaDerivedDefinition =>
  !Object.hasOwn(definition, 'id') && !Object.hasOwn(definition, 'version');

const createDerivedBaseSchemaRecord = (
  explicitRecords: readonly EditorSchemaContributionRecord[]
): EditorSchemaContributionRecord => {
  const ownsParagraph = explicitRecords.some(({ contribution }) =>
    Object.hasOwn(contribution.elements ?? {}, 'paragraph')
  );

  if (!ownsParagraph) {
    const inlineTypes = [
      ...new Set(
        explicitRecords.flatMap(({ contribution }) =>
          Object.entries(contribution.elements ?? {})
            .filter(
              ([, element]) =>
                element.inline === true || isInlineVoid(element.void)
            )
            .map(([type]) => type)
        )
      ),
    ].sort((left, right) => left.localeCompare(right));

    if (inlineTypes.length === 0) return DEFAULT_DERIVED_EDITOR_SCHEMA_RECORD;

    return Object.freeze({
      contribution: Object.freeze({
        ...DEFAULT_DERIVED_EDITOR_SCHEMA,
        elements: Object.freeze({
          paragraph: Object.freeze({
            content: Object.freeze({
              allowed: Object.freeze({
                kind: 'any' as const,
                rules: Object.freeze([
                  Object.freeze({ kind: 'text' as const }),
                  Object.freeze({
                    kind: 'types' as const,
                    types: Object.freeze(inlineTypes),
                  }),
                ]),
              }),
              default: 'text' as const,
              min: 1,
            }),
          }),
        }),
      }),
      extensionName: DEFAULT_DERIVED_EDITOR_SCHEMA_RECORD.extensionName,
    });
  }

  return Object.freeze({
    contribution: Object.freeze({
      ...DEFAULT_DERIVED_EDITOR_SCHEMA,
      elements: Object.freeze({}),
    }),
    extensionName: DEFAULT_DERIVED_EDITOR_SCHEMA_RECORD.extensionName,
  });
};

export type EditorSchemaContributionRecord = Readonly<{
  contribution: EditorSchemaDeclaration;
  extensionName: string;
}>;

/** @internal Exact equality for schema identities, including absent metadata. */
export const areEditorSchemaIdentitiesEqual = (
  left: EditorSchemaIdentity | null,
  right: EditorSchemaIdentity | null
) =>
  left === right ||
  (left !== null &&
    right !== null &&
    left.kind === right.kind &&
    left.fingerprint === right.fingerprint &&
    (left.kind === 'derived' ||
      (right.kind === 'named' &&
        left.id === right.id &&
        left.version === right.version)));

/** @internal Strict decoder for persisted editor schema identities. */
export const readEditorSchemaIdentity = (
  value: unknown
): EditorSchemaIdentity | undefined => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return;
  }

  try {
    const prototype = Object.getPrototypeOf(value);

    if (prototype !== Object.prototype && prototype !== null) return;

    const kind = Object.getOwnPropertyDescriptor(value, 'kind');
    const fingerprint = Object.getOwnPropertyDescriptor(value, 'fingerprint');

    if (
      !kind ||
      !Object.hasOwn(kind, 'value') ||
      kind.enumerable !== true ||
      (kind.value !== 'derived' && kind.value !== 'named') ||
      !fingerprint ||
      !Object.hasOwn(fingerprint, 'value') ||
      fingerprint.enumerable !== true ||
      typeof fingerprint.value !== 'string' ||
      fingerprint.value.length === 0
    ) {
      return;
    }

    if (kind.value === 'derived') {
      if (Reflect.ownKeys(value).length !== 2) return;

      return Object.freeze({
        fingerprint: fingerprint.value,
        kind: 'derived',
      });
    }

    if (Reflect.ownKeys(value).length !== 4) return;
    const id = Object.getOwnPropertyDescriptor(value, 'id');
    const version = Object.getOwnPropertyDescriptor(value, 'version');

    if (
      !id ||
      !Object.hasOwn(id, 'value') ||
      id.enumerable !== true ||
      typeof id.value !== 'string' ||
      id.value.length === 0 ||
      !version ||
      !Object.hasOwn(version, 'value') ||
      version.enumerable !== true ||
      !Number.isSafeInteger(version.value) ||
      version.value < 1
    ) {
      return;
    }

    return Object.freeze({
      fingerprint: fingerprint.value,
      id: id.value,
      kind: 'named',
      version: version.value,
    });
  } catch {
    return;
  }
};

export type EditorSchemaDiagnostic = Readonly<{
  code: string;
  extensions: readonly string[];
  message: string;
  path: string;
}>;

export class EditorSchemaCompileError extends Error {
  readonly diagnostics: readonly EditorSchemaDiagnostic[];

  constructor(diagnostics: readonly EditorSchemaDiagnostic[]) {
    const sorted = [...diagnostics].sort(
      (left, right) =>
        left.path.localeCompare(right.path) ||
        left.code.localeCompare(right.code) ||
        left.message.localeCompare(right.message) ||
        left.extensions
          .join('\u0000')
          .localeCompare(right.extensions.join('\u0000'))
    );

    super(sorted.map(({ message }) => message).join('\n'));
    this.name = 'EditorSchemaCompileError';
    this.diagnostics = Object.freeze(
      sorted.map((diagnostic) =>
        Object.freeze({
          ...diagnostic,
          extensions: Object.freeze([...new Set(diagnostic.extensions)].sort()),
        })
      )
    );
  }
}

export type CompiledSchemaConstructionPlan =
  | Readonly<{ kind: 'element'; type: string }>
  | Readonly<{ kind: 'text' }>;

export type CompiledSchemaWrapperPlan = readonly string[];

export type CompiledSchemaContentProgram = Readonly<{
  allowedElementTypes: ReadonlySet<string>;
  allowsText: boolean;
  allowsUnknownElements: boolean;
  defaultPlan: CompiledSchemaConstructionPlan | null;
  max: number | null;
  min: number;
}>;

export type CompiledSchemaContentRoot = Readonly<{
  content: CompiledSchemaContentProgram;
  ownership: SchemaContentRootOwnership;
}>;

export type CompiledSchemaElementBehavior = Readonly<{
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

export type CompiledSchemaElement = Readonly<{
  behavior: CompiledSchemaElementBehavior;
  content: CompiledSchemaContentProgram | null;
  contentRoots: ReadonlyMap<string, CompiledSchemaContentRoot>;
  construction: Readonly<{
    defaultPropertyIds: ReadonlySet<string>;
    propertyIds: ReadonlySet<string>;
  }>;
  groups: ReadonlySet<string>;
  propertyIds: ReadonlySet<string>;
  slice: Readonly<{
    preserveContext: boolean;
    replaceWhenCovered: boolean;
  }>;
  type: string;
}>;

export type CompiledSchemaRoot = Readonly<{
  content: CompiledSchemaContentProgram;
  name: string | null;
}>;

export type CompiledSchemaPropertyMergeStrategy = 'replace' | 'set';

export type CompiledSchemaProperty = Readonly<{
  descriptor: PropertyValueDescriptor;
  id: string;
  key: SchemaPropertyKey;
  lifecycle: Readonly<{
    inclusive: boolean | null;
    split: 'drop' | 'preserve';
    typeChange: 'drop' | 'preserve-if-allowed';
  }>;
  merge: CompiledSchemaPropertyMergeStrategy;
  owner: string;
  placement: 'element' | 'text';
  target: SchemaTarget | null;
}>;

export type CompiledSchemaPropertyKeyPrefix = Readonly<{
  prefix: string;
  propertyIds: readonly string[];
}>;

export type CompiledSchemaPropertyLookup = Readonly<{
  exact: ReadonlyMap<string, readonly string[]>;
  prefixes: readonly CompiledSchemaPropertyKeyPrefix[];
}>;

export type CompiledSchemaVocabulary = Readonly<{
  elementTypes: readonly string[];
  groupNames: readonly string[];
  propertyIds: readonly string[];
  rootNames: readonly string[];
}>;

export type CompiledEditorSchema = Readonly<{
  diagnostics: readonly EditorSchemaDiagnostic[];
  elements: Readonly<{
    allowedChildren: ReadonlyMap<string, ReadonlySet<string>>;
    allowedParents: ReadonlyMap<string, ReadonlySet<string>>;
    byType: ReadonlyMap<string, CompiledSchemaElement>;
    contentPrograms: ReadonlyMap<string, CompiledSchemaContentProgram>;
    defaultPlans: ReadonlyMap<string, CompiledSchemaConstructionPlan>;
    groups: ReadonlyMap<string, ReadonlySet<string>>;
    textGroups: ReadonlySet<string>;
    wrapperPlans: ReadonlyMap<string, CompiledSchemaWrapperPlan>;
  }>;
  identity: EditorSchemaIdentity;
  primaryRoot: CompiledSchemaRoot;
  properties: Readonly<{
    byId: ReadonlyMap<string, CompiledSchemaProperty>;
    elementAllowedByType: ReadonlyMap<string, ReadonlySet<string>>;
    lifecycle: ReadonlyMap<string, CompiledSchemaProperty['lifecycle']>;
    lookup: Readonly<{
      element: CompiledSchemaPropertyLookup;
      text: CompiledSchemaPropertyLookup;
    }>;
    mergeStrategies: ReadonlyMap<string, CompiledSchemaPropertyMergeStrategy>;
    textAllowedByParentType: ReadonlyMap<string, ReadonlySet<string>>;
  }>;
  revision: number;
  roots: ReadonlyMap<string, CompiledSchemaRoot>;
  unknown: EditorSchemaUnknownPolicy;
  vocabulary: CompiledSchemaVocabulary;
}>;

export type StructuralPropertyValueDescriptor = Readonly<{
  default?: unknown;
  item?: StructuralPropertyValueDescriptor;
  kind: PropertyValueKind;
  omitDefault: boolean;
  significant: boolean;
  validationVersion?: number;
}>;

export type StructuralCompiledSchemaProperty = Omit<
  CompiledSchemaProperty,
  'descriptor'
> &
  Readonly<{ descriptor: StructuralPropertyValueDescriptor }>;

/** Structural cache payload with no live validator closure. */
export type StructuralCompiledEditorSchema = Omit<
  CompiledEditorSchema,
  'properties'
> &
  Readonly<{
    properties: Omit<CompiledEditorSchema['properties'], 'byId'> &
      Readonly<{
        byId: ReadonlyMap<string, StructuralCompiledSchemaProperty>;
      }>;
  }>;

export type CompiledSchemaTargetContext = Readonly<{
  /** Immediate parent first. */
  ancestors?: readonly string[];
  /** `null` addresses the implicit primary root. */
  root: string | null;
  type: string;
}>;

export const getCompiledSchemaWrapperPlanKey = (
  parentProgramId: string,
  childType: string | null
) => `${parentProgramId}\u0000${childType ?? '\u0000text'}`;

const COMPILED_WRAPPER_PLAN_CACHE = new WeakMap<
  CompiledEditorSchema,
  Map<string, CompiledSchemaWrapperPlan | null>
>();

const orderedCompiledAllowedTypes = (program: CompiledSchemaContentProgram) => {
  const preferred =
    program.defaultPlan?.kind === 'element' ? program.defaultPlan.type : null;

  return [
    ...(preferred ? [preferred] : []),
    ...[...program.allowedElementTypes]
      .filter((type) => type !== preferred)
      .sort((left, right) => left.localeCompare(right)),
  ];
};

/** Resolve and revision-cache one shortest grammar-only wrapper chain. */
export const resolveCompiledSchemaWrapperPlan = (
  schema: CompiledEditorSchema,
  parentProgramId: string,
  childType: string | null
): CompiledSchemaWrapperPlan | null => {
  const preservedUnknown =
    childType !== null &&
    schema.unknown === 'preserve' &&
    !schema.elements.byType.has(childType);
  const key = getCompiledSchemaWrapperPlanKey(
    parentProgramId,
    preservedUnknown ? UNKNOWN_TYPE : childType
  );
  const direct = schema.elements.wrapperPlans.get(key);

  if (direct) return direct;
  let cache = COMPILED_WRAPPER_PLAN_CACHE.get(schema);

  if (!cache) {
    cache = new Map();
    COMPILED_WRAPPER_PLAN_CACHE.set(schema, cache);
  }
  if (cache.has(key)) return cache.get(key)!;
  return profileCoreDuration('schema-wrapper-plan-search', () => {
    const parent = schema.elements.contentPrograms.get(parentProgramId);

    if (!parent) {
      cache.set(key, null);
      return null;
    }

    if (preservedUnknown && parent.allowsUnknownElements) {
      const plan = Object.freeze([]) as CompiledSchemaWrapperPlan;

      cache.set(key, plan);
      return plan;
    }

    const queue = orderedCompiledAllowedTypes(parent).map((type) => ({
      path: [type],
      type,
    }));
    const seen = new Set(queue.map(({ type }) => type));

    for (const current of queue) {
      const content = schema.elements.contentPrograms.get(
        `element:${current.type}`
      );

      if (!content) continue;
      const matches =
        childType === null
          ? content.allowsText
          : content.allowedElementTypes.has(childType) ||
            (preservedUnknown && content.allowsUnknownElements);

      if (matches) {
        const plan = Object.freeze(current.path);

        cache.set(key, plan);
        return plan;
      }
      for (const type of orderedCompiledAllowedTypes(content)) {
        if (seen.has(type)) continue;
        seen.add(type);
        queue.push({ path: [...current.path, type], type });
      }
    }

    cache.set(key, null);
    return null;
  });
};

type Source<TValue> = Readonly<{
  extensionName: string;
  path: string;
  value: TValue;
}>;

type MutableElement = Readonly<{
  behavior: CompiledSchemaElementBehavior;
  content: SchemaContent;
  contentRoots: Map<string, Source<SchemaContentRoot>>;
  directGroups: Set<string>;
  input: SchemaElement;
  source: Source<SchemaElement>;
  type: string;
}>;

type MutableContentProgram = {
  allowedElementTypes: Set<string>;
  allowsText: boolean;
  allowsUnknownElements: boolean;
  defaultPlan: CompiledSchemaConstructionPlan | null;
  max: number | null;
  min: number;
  source: Source<SchemaContent>;
};

const CANONICAL_VOID_CONTENT = Object.freeze({
  allowed: Object.freeze({ kind: 'text' as const }),
  default: 'text' as const,
  max: 1,
  min: 1,
}) satisfies SchemaContent;

type MutableProperty = Omit<CompiledSchemaProperty, 'descriptor' | 'id'> &
  Readonly<{
    descriptor: PropertyValueDescriptor;
    source: Source<SchemaProperty | PropertyValueDescriptor>;
  }>;

const immutableCollectionMutation = () => {
  throw new Error('Compiled editor schemas are immutable.');
};

const freezeMap = <TKey, TValue>(source: ReadonlyMap<TKey, TValue>) => {
  const map = new Map(source);
  let immutable!: Map<TKey, TValue>;

  immutable = new Proxy(map, {
    get(target, property) {
      if (property === 'clear' || property === 'delete' || property === 'set') {
        return immutableCollectionMutation;
      }
      if (property === 'forEach') {
        return (
          callback: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void,
          thisArg?: unknown
        ) =>
          target.forEach((value, key) => {
            callback.call(thisArg, value, key, immutable);
          });
      }

      const value = Reflect.get(target, property, target);

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  return Object.freeze(immutable) as ReadonlyMap<TKey, TValue>;
};

const freezeSet = <TValue>(source: ReadonlySet<TValue>) => {
  const set = new Set(source);
  let immutable!: Set<TValue>;

  immutable = new Proxy(set, {
    get(target, property) {
      if (property === 'add' || property === 'clear' || property === 'delete') {
        return immutableCollectionMutation;
      }
      if (property === 'forEach') {
        return (
          callback: (value: TValue, key: TValue, set: Set<TValue>) => void,
          thisArg?: unknown
        ) =>
          target.forEach((value) => {
            callback.call(thisArg, value, value, immutable);
          });
      }

      const value = Reflect.get(target, property, target);

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  return Object.freeze(immutable) as ReadonlySet<TValue>;
};

const freezeSetMap = (
  source: ReadonlyMap<string, ReadonlySet<string>>
): ReadonlyMap<string, ReadonlySet<string>> =>
  freezeMap(
    new Map(
      [...source]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, values]) => [key, freezeSet(values)] as const)
    )
  );

const compileFailure = (
  code: string,
  message: string,
  sources: readonly Source<unknown>[] | readonly string[],
  path: string
): never => {
  const extensions = sources.map((source) =>
    typeof source === 'string' ? source : source.extensionName
  );

  throw new EditorSchemaCompileError([
    Object.freeze({ code, extensions, message, path }),
  ]);
};

const assertSchemaDeclarationOwnership = (
  records: readonly EditorSchemaContributionRecord[]
) => {
  const diagnostics: EditorSchemaDiagnostic[] = [];

  for (const { contribution, extensionName } of records) {
    if (isCompleteSchemaDeclaration(contribution)) {
      for (const field of COMPLETE_SCHEMA_COMMON_FIELDS) {
        if (Object.hasOwn(contribution, field)) continue;
        diagnostics.push(
          Object.freeze({
            code: 'missing-complete-schema-field',
            extensions: Object.freeze([extensionName]),
            message: `Complete schema definition "${extensionName}" must own schema field "${field}".`,
            path: `schema.${field}`,
          })
        );
      }
      if (
        Object.hasOwn(contribution, 'id') ||
        Object.hasOwn(contribution, 'version')
      ) {
        for (const field of ['id', 'version'] as const) {
          if (Object.hasOwn(contribution, field)) continue;
          diagnostics.push(
            Object.freeze({
              code: 'missing-complete-schema-field',
              extensions: Object.freeze([extensionName]),
              message: `Named schema definition "${extensionName}" must own schema field "${field}".`,
              path: `schema.${field}`,
            })
          );
        }
      }
      continue;
    }

    for (const field of COMPLETE_SCHEMA_FIELDS) {
      if (!Object.hasOwn(contribution, field)) continue;
      diagnostics.push(
        Object.freeze({
          code: 'partial-schema-complete-field',
          extensions: Object.freeze([extensionName]),
          message: `Partial schema contribution "${extensionName}" cannot declare complete schema field "${field}".`,
          path: `schema.${field}`,
        })
      );
    }
  }

  if (diagnostics.length > 0) throw new EditorSchemaCompileError(diagnostics);
};

const collectSchemaKeyDiagnostics = (
  records: readonly EditorSchemaContributionRecord[]
) => {
  const diagnostics: EditorSchemaDiagnostic[] = [];
  const reportShape = (extensionName: string, path: string, shape: string) => {
    diagnostics.push(
      Object.freeze({
        code: 'invalid-schema-shape',
        extensions: Object.freeze([extensionName]),
        message: `Schema declaration at ${path} must be ${shape}.`,
        path,
      })
    );
  };
  const object = (
    value: unknown,
    extensionName: string,
    path: string
  ): Readonly<Record<string, unknown>> | null => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      reportShape(extensionName, path, 'a plain object');
      return null;
    }
    const prototype = Object.getPrototypeOf(value);
    const plainObject =
      prototype === Object.prototype ||
      prototype === null ||
      Object.getPrototypeOf(prototype) === null;

    if (!plainObject) {
      reportShape(extensionName, path, 'a plain object');
      return null;
    }

    return value as Readonly<Record<string, unknown>>;
  };
  const array = (
    value: unknown,
    extensionName: string,
    path: string
  ): readonly unknown[] | null => {
    if (Array.isArray(value)) return value;
    reportShape(extensionName, path, 'an array');
    return null;
  };
  const check = (
    value: unknown,
    allowed: readonly string[],
    extensionName: string,
    path: string,
    options: Readonly<{
      nonEnumerable?: readonly string[];
      symbols?: boolean;
    }> = {}
  ) => {
    const record = object(value, extensionName, path);

    if (!record) return null;
    const supported = new Set(allowed);
    const supportedNonEnumerable = new Set(options.nonEnumerable ?? []);

    for (const key of Reflect.ownKeys(record)) {
      const descriptor = Object.getOwnPropertyDescriptor(record, key);
      if (typeof key === 'symbol' && options.symbols) continue;
      const supportedKey = typeof key === 'string' && supported.has(key);
      const supportedHiddenKey =
        typeof key === 'string' &&
        descriptor?.enumerable === false &&
        supportedNonEnumerable.has(key);

      if (
        supportedKey &&
        (descriptor?.enumerable !== false || supportedHiddenKey)
      ) {
        continue;
      }
      const label = typeof key === 'symbol' ? `[${String(key)}]` : key;

      diagnostics.push(
        Object.freeze({
          code: 'unknown-schema-key',
          extensions: Object.freeze([extensionName]),
          message: `Schema declaration at ${path} does not support key "${String(key)}".`,
          path: `${path}.${label}`,
        })
      );
    }

    return record;
  };
  const visitDescriptor = (value: unknown, owner: string, path: string) => {
    const descriptor = check(
      value,
      [
        'default',
        'item',
        'kind',
        'omitDefault',
        'significant',
        'validate',
        'validationVersion',
      ],
      owner,
      path,
      { nonEnumerable: ['validate'] }
    );

    if (!descriptor) return;
    if (descriptor.item !== undefined) {
      visitDescriptor(descriptor.item, owner, `${path}.item`);
    }
  };
  const visitTarget = (value: unknown, owner: string, path: string): void => {
    if (value === null) return;
    const target = object(value, owner, path);

    if (!target) return;
    const keys =
      target.kind === 'and' || target.kind === 'or'
        ? ['kind', 'targets']
        : target.kind === 'group'
          ? ['group', 'kind']
          : target.kind === 'not' || target.kind === 'parent'
            ? ['kind', 'target']
            : target.kind === 'root'
              ? ['kind', 'root']
              : target.kind === 'type'
                ? ['kind', 'type']
                : target.kind === 'types'
                  ? ['kind', 'types']
                  : ['kind'];

    check(target, keys, owner, path);
    if (target.targets !== undefined) {
      array(target.targets, owner, `${path}.targets`)?.forEach(
        (child, index) => {
          visitTarget(child, owner, `${path}.targets.${index}`);
        }
      );
    }
    if (target.types !== undefined) {
      array(target.types, owner, `${path}.types`);
    }
    if (target.target !== undefined) {
      visitTarget(target.target, owner, `${path}.target`);
    }
  };
  const visitContentRule = (
    value: unknown,
    owner: string,
    path: string
  ): void => {
    const rule = object(value, owner, path);

    if (!rule) return;
    const keys =
      rule.kind === 'all' || rule.kind === 'any'
        ? ['kind', 'rules']
        : rule.kind === 'group'
          ? ['group', 'kind']
          : rule.kind === 'not'
            ? ['kind', 'rule']
            : rule.kind === 'type'
              ? ['kind', 'type']
              : rule.kind === 'types'
                ? ['kind', 'types']
                : ['kind'];

    check(rule, keys, owner, path);
    if (rule.rules !== undefined) {
      array(rule.rules, owner, `${path}.rules`)?.forEach((child, index) => {
        visitContentRule(child, owner, `${path}.rules.${index}`);
      });
    }
    if (rule.types !== undefined) {
      array(rule.types, owner, `${path}.types`);
    }
    if (rule.rule !== undefined) {
      visitContentRule(rule.rule, owner, `${path}.rule`);
    }
  };
  const visitContent = (value: unknown, owner: string, path: string) => {
    const content = check(
      value,
      ['allowed', 'default', 'max', 'min'],
      owner,
      path
    );

    if (!content) return;
    visitContentRule(content.allowed, owner, `${path}.allowed`);
    if (content.default && content.default !== 'text') {
      check(content.default, ['type'], owner, `${path}.default`);
    }
  };
  const visitContentRoot = (
    value: unknown,
    owner: string,
    path: string,
    targeted: boolean
  ) => {
    if (
      !targeted &&
      typeof value === 'object' &&
      value !== null &&
      Object.hasOwn(value, 'allowed')
    ) {
      visitContent(value, owner, path);
      return;
    }
    const root = check(
      value,
      targeted
        ? ['content', 'ownership', 'slot', 'target']
        : ['content', 'ownership'],
      owner,
      path
    );

    if (!root) return;
    visitContent(root.content, owner, `${path}.content`);
    if (root.target !== undefined) {
      visitTarget(root.target, owner, `${path}.target`);
    }
  };

  for (const { contribution, extensionName } of records) {
    const complete = isCompleteSchemaDeclaration(contribution);
    const declaration = check(
      contribution,
      complete
        ? [
            'contentRoots',
            'elements',
            'groups',
            'id',
            'properties',
            'root',
            'roots',
            'unknown',
            'version',
          ]
        : ['contentRoots', 'elements', 'groups', 'properties', 'roots'],
      extensionName,
      'schema'
    );

    if (!declaration) continue;
    const elements =
      declaration.elements === undefined
        ? null
        : object(declaration.elements, extensionName, 'elements');

    for (const [type, value] of Object.entries(elements ?? {})) {
      const path = `elements.${type}`;
      const element = check(
        value,
        [
          'atom',
          'content',
          'contentRoots',
          'groups',
          'inline',
          'isolating',
          'keyboardSelectable',
          'markableVoid',
          'properties',
          'readOnly',
          'selectable',
          'slice',
          'void',
        ],
        extensionName,
        path
      );

      if (!element) continue;
      if (element.content !== undefined) {
        visitContent(element.content, extensionName, `${path}.content`);
      }
      if (element.groups !== undefined) {
        array(element.groups, extensionName, `${path}.groups`);
      }
      const contentRoots =
        element.contentRoots === undefined
          ? null
          : object(element.contentRoots, extensionName, `${path}.contentRoots`);

      for (const [slot, contentRoot] of Object.entries(contentRoots ?? {})) {
        visitContentRoot(
          contentRoot,
          extensionName,
          `${path}.contentRoots.${slot}`,
          false
        );
      }
      const properties =
        element.properties === undefined
          ? null
          : object(element.properties, extensionName, `${path}.properties`);

      for (const [key, descriptor] of Object.entries(properties ?? {})) {
        visitDescriptor(descriptor, extensionName, `${path}.properties.${key}`);
      }
      if (element.slice !== undefined) {
        check(
          element.slice,
          ['preserveContext', 'replaceWhenCovered'],
          extensionName,
          `${path}.slice`
        );
      }
    }
    const groups =
      declaration.groups === undefined
        ? null
        : object(declaration.groups, extensionName, 'groups');

    for (const [group, value] of Object.entries(groups ?? {})) {
      const groupPath = `groups.${group}`;
      const groupDeclaration = check(
        value,
        ['extends'],
        extensionName,
        groupPath
      );

      if (groupDeclaration?.extends !== undefined) {
        array(groupDeclaration.extends, extensionName, `${groupPath}.extends`);
      }
    }
    const visitRoot = (value: unknown, path: string) => {
      const root = check(value, ['content'], extensionName, path);

      if (root) visitContent(root.content, extensionName, `${path}.content`);
    };

    if (declaration.root !== undefined) visitRoot(declaration.root, 'root');
    const roots =
      declaration.roots === undefined
        ? null
        : object(declaration.roots, extensionName, 'roots');

    for (const [name, value] of Object.entries(roots ?? {})) {
      visitRoot(value, `roots.${name}`);
    }
    if (declaration.contentRoots !== undefined) {
      array(declaration.contentRoots, extensionName, 'contentRoots')?.forEach(
        (value, index) => {
          visitContentRoot(value, extensionName, `contentRoots.${index}`, true);
        }
      );
    }
    if (declaration.properties !== undefined) {
      array(declaration.properties, extensionName, 'properties')?.forEach(
        (value, index) => {
          const path = `properties.${index}`;
          const property = object(value, extensionName, path);
          const placement = property?.placement;

          if (!property) return;
          check(
            property,
            placement === 'text'
              ? [
                  'inclusive',
                  'key',
                  'placement',
                  'split',
                  'target',
                  'typeChange',
                  'value',
                ]
              : ['key', 'placement', 'split', 'target', 'typeChange', 'value'],
            extensionName,
            path
          );
          if (
            property.key !== null &&
            typeof property.key === 'object' &&
            !Array.isArray(property.key)
          ) {
            check(
              property.key,
              ['kind', 'prefix'],
              extensionName,
              `${path}.key`
            );
          }
          visitDescriptor(property.value, extensionName, `${path}.value`);
          if (property.target !== undefined) {
            visitTarget(property.target, extensionName, `${path}.target`);
          }
        }
      );
    }
  }

  if (diagnostics.length > 0) throw new EditorSchemaCompileError(diagnostics);
};

const collectSchemaOwnershipConflictDiagnostics = (
  records: readonly EditorSchemaContributionRecord[]
) => {
  const diagnostics: EditorSchemaDiagnostic[] = [];
  const collect = (
    code: string,
    label: string,
    pathFor: (key: string) => string,
    declarationsFor: (
      contribution: EditorSchemaDeclaration
    ) => Readonly<Record<string, unknown>> | undefined
  ) => {
    const sources = new Map<string, Source<unknown>[]>();

    for (const record of records) {
      for (const [key, value] of Object.entries(
        declarationsFor(record.contribution) ?? {}
      )) {
        const source: Source<unknown> = {
          extensionName: record.extensionName,
          path: pathFor(key),
          value,
        };

        sources.set(key, [...(sources.get(key) ?? []), source]);
      }
    }

    for (const [key, owners] of sources) {
      if (owners.length < 2) continue;
      const names = owners.map(({ extensionName }) => extensionName);
      const ownership =
        names.length === 2
          ? `both "${names[0]}" and "${names[1]}"`
          : `extensions ${names.map((name) => `"${name}"`).join(', ')}`;

      diagnostics.push(
        Object.freeze({
          code,
          extensions: Object.freeze(names),
          message: `Schema ${label} "${key}" is owned by ${ownership}.`,
          path: pathFor(key),
        })
      );
    }
  };

  collect(
    'duplicate-group',
    'group',
    (key) => `groups.${key}`,
    ({ groups }) => groups
  );
  collect(
    'duplicate-element-type',
    'element type',
    (key) => `elements.${key}`,
    ({ elements }) => elements
  );
  collect(
    'duplicate-root',
    'root',
    (key) => `roots.${key}.content`,
    ({ roots }) => roots
  );

  if (diagnostics.length > 0) throw new EditorSchemaCompileError(diagnostics);
};

function assertName(
  value: unknown,
  label: string,
  source: Source<unknown>
): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    compileFailure(
      'invalid-name',
      `${label} must be a non-empty string.`,
      [source],
      source.path
    );
  }
}

const canonicalJson = (
  value: unknown,
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
    throw new Error('JSON numbers must be finite.');
  }
  if (typeof value === 'object' && value && ancestors.has(value)) {
    throw new Error('Values cannot be cyclic.');
  }
  if (Array.isArray(value)) {
    ancestors.add(value);
    try {
      return Object.freeze(value.map((item) => canonicalJson(item, ancestors)));
    } finally {
      ancestors.delete(value);
    }
  }
  if (
    typeof value !== 'object' ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    throw new Error('Values must be plain JSON data.');
  }

  ancestors.add(value);
  try {
    return Object.freeze(
      Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [
            key,
            canonicalJson(
              (value as Readonly<Record<string, unknown>>)[key],
              ancestors
            ),
          ])
      )
    );
  } finally {
    ancestors.delete(value);
  }
};

const stableStringify = (value: unknown): string =>
  JSON.stringify(canonicalJson(value));

/** @internal Exact 64-bit FNV-1a over JavaScript UTF-16 code units. */
export const hashSchemaIdentityString = (value: string) => {
  let high = 0xcb_f2_9c_e4;
  let low = 0x84_22_23_25;

  for (let index = 0; index < value.length; index++) {
    low = (low ^ value.charCodeAt(index)) >>> 0;

    const lowProduct = low * 0x01_b3;
    const carry = Math.floor(lowProduct / 0x1_00_00_00_00);

    high = (Math.imul(high, 0x01_b3) + Math.imul(low, 0x01_00) + carry) >>> 0;
    low = lowProduct >>> 0;
  }

  return `${high.toString(16).padStart(8, '0')}${low
    .toString(16)
    .padStart(8, '0')}`;
};

const canonicalDeclaration = (
  value: unknown,
  key: string | null = null,
  ancestors = new Set<object>()
): unknown => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value;
  }
  if (typeof value === 'function') return '[function]';
  if (typeof value !== 'object') return `[${typeof value}]`;
  if (ancestors.has(value)) return '[cycle]';

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const items = value.map((item) =>
        canonicalDeclaration(item, null, ancestors)
      );

      if (
        key === 'extends' ||
        key === 'groups' ||
        key === 'properties' ||
        key === 'rules' ||
        key === 'targets' ||
        key === 'types'
      ) {
        return items.sort((left, right) =>
          JSON.stringify(left).localeCompare(JSON.stringify(right))
        );
      }

      return items;
    }

    const record = value as Readonly<Record<PropertyKey, unknown>>;
    const result = Object.fromEntries(
      Object.keys(record)
        .filter((property) => property !== 'validate')
        .sort()
        .map((property) => {
          const descriptor = Object.getOwnPropertyDescriptor(record, property);

          return [
            property,
            descriptor && Object.hasOwn(descriptor, 'value')
              ? canonicalDeclaration(descriptor.value, property, ancestors)
              : '[accessor]',
          ];
        })
    ) as Record<string, unknown>;
    const exceptionalKeys = Reflect.ownKeys(record)
      .filter((property) => {
        if (property === 'validate') return false;
        if (typeof property === 'symbol') return true;
        const descriptor = Object.getOwnPropertyDescriptor(record, property);

        return descriptor?.enumerable === false;
      })
      .map((property) => {
        const descriptor = Object.getOwnPropertyDescriptor(record, property);

        return {
          key: String(property),
          kind: typeof property === 'symbol' ? 'symbol' : 'non-enumerable',
          value:
            descriptor && Object.hasOwn(descriptor, 'value')
              ? canonicalDeclaration(descriptor.value, null, ancestors)
              : '[accessor]',
        };
      })
      .sort((left, right) =>
        `${left.kind}:${left.key}`.localeCompare(`${right.kind}:${right.key}`)
      );

    if (exceptionalKeys.length > 0) {
      result['\u0000schemaOwnKeys'] = exceptionalKeys;
    }

    if (result.kind === 'set' && Array.isArray(result.default)) {
      result.default = [
        ...new Map(
          result.default.map((item) => [JSON.stringify(item), item] as const)
        ),
      ]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, item]) => item);
    }

    return result;
  } finally {
    ancestors.delete(value);
  }
};

const SCHEMA_CONTRIBUTION_DECLARATION_KEYS = new WeakMap<object, string>();

const getSchemaContributionDeclarationKey = (
  contribution: EditorSchemaDeclaration
) => {
  const known = SCHEMA_CONTRIBUTION_DECLARATION_KEYS.get(contribution);

  if (known) return known;
  const key = hashSchemaIdentityString(
    JSON.stringify(canonicalDeclaration(contribution))
  );

  SCHEMA_CONTRIBUTION_DECLARATION_KEYS.set(contribution, key);

  return key;
};

export const getEditorSchemaDeclarationKey = (
  records: readonly EditorSchemaContributionRecord[]
) => {
  assertSchemaDeclarationOwnership(records);
  const declarations = records
    .map(({ contribution, extensionName }) => ({
      contribution: getSchemaContributionDeclarationKey(contribution),
      extensionName,
    }))
    .sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right))
    );

  return `schema-declaration:${hashSchemaIdentityString(
    JSON.stringify(declarations)
  )}`;
};

const sortedStrings = (values: Iterable<string>) =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));

const isInlineVoid = (kind: SchemaElement['void']) =>
  kind === 'inline' || kind === 'markable-inline';

const isVoid = (kind: SchemaElement['void']) =>
  kind === 'block' ||
  kind === 'editable-island' ||
  kind === 'inline' ||
  kind === 'markable-inline';

const compileElementBehavior = (
  source: Source<SchemaElement>
): CompiledSchemaElementBehavior => {
  const input = source.value;
  const voidKind = input.void ?? null;

  if (
    voidKind !== null &&
    !['block', 'editable-island', 'inline', 'markable-inline'].includes(
      voidKind
    )
  ) {
    compileFailure(
      'invalid-element-behavior',
      `Schema element at ${source.path} has invalid void kind "${voidKind}".`,
      [source],
      source.path
    );
  }

  const inlineFromVoid = isInlineVoid(voidKind ?? undefined);

  if (inlineFromVoid && input.inline === false) {
    compileFailure(
      'invalid-element-behavior',
      `Schema element at ${source.path} cannot declare an inline void as block.`,
      [source],
      source.path
    );
  }

  const inline = input.inline ?? inlineFromVoid;
  const selectable = input.selectable ?? true;
  const atom =
    input.atom ??
    (isVoid(voidKind ?? undefined) && voidKind !== 'editable-island');

  return Object.freeze({
    atom,
    editableIsland: voidKind === 'editable-island',
    inline,
    isolating: input.isolating ?? false,
    keyboardSelectable: input.keyboardSelectable ?? (selectable && atom),
    markableVoid: input.markableVoid ?? voidKind === 'markable-inline',
    readOnly: input.readOnly ?? false,
    selectable,
    void: isVoid(voidKind ?? undefined),
    voidKind,
  });
};

const resolveGroupClosure = (
  group: string,
  parents: ReadonlyMap<string, readonly string[]>,
  cache: Map<string, ReadonlySet<string>>,
  visiting: string[] = []
): ReadonlySet<string> => {
  const cached = cache.get(group);

  if (cached) return cached;
  const cycleIndex = visiting.indexOf(group);

  if (cycleIndex !== -1) {
    const cycle = [...visiting.slice(cycleIndex), group];

    compileFailure(
      'group-cycle',
      `Schema groups contain a cycle: ${cycle.join(' -> ')}.`,
      [],
      `groups.${group}`
    );
  }

  const result = new Set([group]);

  for (const parent of parents.get(group) ?? []) {
    for (const inherited of resolveGroupClosure(parent, parents, cache, [
      ...visiting,
      group,
    ])) {
      result.add(inherited);
    }
  }

  const frozen = freezeSet(result);

  cache.set(group, frozen);

  return frozen;
};

const resolveMembership = (
  direct: ReadonlySet<string>,
  parents: ReadonlyMap<string, readonly string[]>,
  cache: Map<string, ReadonlySet<string>>
) => {
  const result = new Set<string>();

  for (const group of direct) {
    for (const inherited of resolveGroupClosure(group, parents, cache)) {
      result.add(inherited);
    }
  }

  return result;
};

const compileContentRule = (
  rule: SchemaContentRule,
  source: Source<SchemaContent>,
  elementTypes: ReadonlySet<string>,
  groups: ReadonlyMap<string, ReadonlySet<string>>,
  textGroups: ReadonlySet<string>,
  unknownPolicy: EditorSchemaUnknownPolicy
): Readonly<{
  allowsText: boolean;
  allowsUnknownElements: boolean;
  types: Set<string>;
}> => {
  switch (rule.kind) {
    case 'open':
      return {
        allowsText: true,
        allowsUnknownElements: unknownPolicy === 'preserve',
        types: new Set(elementTypes),
      };
    case 'text':
      return {
        allowsText: true,
        allowsUnknownElements: false,
        types: new Set(),
      };
    case 'type': {
      if (!elementTypes.has(rule.type)) {
        compileFailure(
          'unknown-element-type',
          `Schema content at ${source.path} references unknown element type "${rule.type}".`,
          [source],
          source.path
        );
      }

      return {
        allowsText: false,
        allowsUnknownElements: false,
        types: new Set([rule.type]),
      };
    }
    case 'types': {
      const types = new Set<string>();

      for (const type of rule.types) {
        if (!elementTypes.has(type)) {
          compileFailure(
            'unknown-element-type',
            `Schema content at ${source.path} references unknown element type "${type}".`,
            [source],
            source.path
          );
        }
        types.add(type);
      }

      return { allowsText: false, allowsUnknownElements: false, types };
    }
    case 'group': {
      const members = groups.get(rule.group);

      if (!members) {
        compileFailure(
          'unknown-group',
          `Schema content at ${source.path} references unknown group "${rule.group}".`,
          [source],
          source.path
        );
      }

      return {
        allowsText: textGroups.has(rule.group),
        allowsUnknownElements: false,
        types: new Set(members),
      };
    }
    case 'not': {
      const excluded = compileContentRule(
        rule.rule,
        source,
        elementTypes,
        groups,
        textGroups,
        unknownPolicy
      );

      return {
        allowsText: !excluded.allowsText,
        allowsUnknownElements:
          unknownPolicy === 'preserve' && !excluded.allowsUnknownElements,
        types: new Set(
          [...elementTypes].filter((type) => !excluded.types.has(type))
        ),
      };
    }
    case 'any': {
      const result = {
        allowsText: false,
        allowsUnknownElements: false,
        types: new Set<string>(),
      };

      for (const child of rule.rules) {
        const compiled = compileContentRule(
          child,
          source,
          elementTypes,
          groups,
          textGroups,
          unknownPolicy
        );

        result.allowsText ||= compiled.allowsText;
        result.allowsUnknownElements ||= compiled.allowsUnknownElements;
        for (const type of compiled.types) result.types.add(type);
      }

      return result;
    }
    case 'all': {
      let allowsText = true;
      let allowsUnknownElements = unknownPolicy === 'preserve';
      let types = new Set(elementTypes);

      for (const child of rule.rules) {
        const compiled = compileContentRule(
          child,
          source,
          elementTypes,
          groups,
          textGroups,
          unknownPolicy
        );

        allowsText &&= compiled.allowsText;
        allowsUnknownElements &&= compiled.allowsUnknownElements;
        types = new Set([...types].filter((type) => compiled.types.has(type)));
      }

      return { allowsText, allowsUnknownElements, types };
    }
  }
};

const compileContent = (
  source: Source<SchemaContent>,
  elementTypes: ReadonlySet<string>,
  groups: ReadonlyMap<string, ReadonlySet<string>>,
  textGroups: ReadonlySet<string>,
  unknownPolicy: EditorSchemaUnknownPolicy
): MutableContentProgram => {
  const { value } = source;
  const min = value.min ?? 0;
  const max = value.max ?? null;

  if (!Number.isSafeInteger(min) || min < 0) {
    compileFailure(
      'invalid-cardinality',
      `Schema content at ${source.path} has invalid minimum ${min}.`,
      [source],
      source.path
    );
  }
  if (max !== null && (!Number.isSafeInteger(max) || max < min)) {
    compileFailure(
      'invalid-cardinality',
      `Schema content at ${source.path} has invalid maximum ${max}.`,
      [source],
      source.path
    );
  }

  const allowed = compileContentRule(
    value.allowed,
    source,
    elementTypes,
    groups,
    textGroups,
    unknownPolicy
  );
  let defaultPlan: CompiledSchemaConstructionPlan | null = null;

  if (value.default === 'text') {
    if (!allowed.allowsText) {
      compileFailure(
        'invalid-content-default',
        `Schema content at ${source.path} defaults to text, but text is not allowed.`,
        [source],
        source.path
      );
    }
    defaultPlan = Object.freeze({ kind: 'text' });
  } else if (value.default) {
    if (!elementTypes.has(value.default.type)) {
      compileFailure(
        'unknown-element-type',
        `Schema content at ${source.path} defaults to unknown element type "${value.default.type}".`,
        [source],
        source.path
      );
    }
    if (!allowed.types.has(value.default.type)) {
      compileFailure(
        'invalid-content-default',
        `Schema content at ${source.path} defaults to disallowed element type "${value.default.type}".`,
        [source],
        source.path
      );
    }
    defaultPlan = Object.freeze({ kind: 'element', type: value.default.type });
  } else if (min > 0) {
    const candidateCount = allowed.types.size + (allowed.allowsText ? 1 : 0);

    if (candidateCount === 1 && allowed.allowsText) {
      defaultPlan = Object.freeze({ kind: 'text' });
    } else if (candidateCount === 1) {
      defaultPlan = Object.freeze({
        kind: 'element',
        type: allowed.types.values().next().value as string,
      });
    } else {
      const candidates = sortedStrings(allowed.types);

      compileFailure(
        'ambiguous-content-default',
        candidates.length === 0
          ? `Required schema content at ${source.path} has no constructible default.`
          : `Required schema content at ${source.path} needs an explicit default; candidates are ${candidates.join(', ')}.`,
        [source],
        source.path
      );
    }
  }

  return {
    allowedElementTypes: allowed.types,
    allowsText: allowed.allowsText,
    allowsUnknownElements: allowed.allowsUnknownElements,
    defaultPlan,
    max,
    min,
    source,
  };
};

const freezeContentProgram = (
  program: MutableContentProgram
): CompiledSchemaContentProgram =>
  Object.freeze({
    allowedElementTypes: freezeSet(program.allowedElementTypes),
    allowsText: program.allowsText,
    allowsUnknownElements: program.allowsUnknownElements,
    defaultPlan: program.defaultPlan,
    max: program.max,
    min: program.min,
  });

const cloneTarget = (
  target: SchemaTarget,
  source: Source<unknown>,
  elementTypes: ReadonlySet<string>,
  groups: ReadonlyMap<string, ReadonlySet<string>>,
  roots: ReadonlySet<string>
): SchemaTarget => {
  switch (target.kind) {
    case 'type':
      if (!elementTypes.has(target.type)) {
        compileFailure(
          'unknown-element-type',
          `Schema target at ${source.path} references unknown element type "${target.type}".`,
          [source],
          source.path
        );
      }
      return Object.freeze({ kind: 'type', type: target.type });
    case 'types': {
      const types = sortedStrings(target.types);

      if (types.length === 0) {
        compileFailure(
          'invalid-target',
          `Schema target at ${source.path} must reference at least one type.`,
          [source],
          source.path
        );
      }
      for (const type of types) {
        if (!elementTypes.has(type)) {
          compileFailure(
            'unknown-element-type',
            `Schema target at ${source.path} references unknown element type "${type}".`,
            [source],
            source.path
          );
        }
      }
      return Object.freeze({ kind: 'types', types: Object.freeze(types) });
    }
    case 'group':
      if (!groups.has(target.group)) {
        compileFailure(
          'unknown-group',
          `Schema target at ${source.path} references unknown group "${target.group}".`,
          [source],
          source.path
        );
      }
      return Object.freeze({ group: target.group, kind: 'group' });
    case 'root':
      if (target.root === RESERVED_PRIMARY_ROOT) {
        compileFailure(
          'reserved-primary-root',
          'Schema targets cannot expose the internal primary root name "main".',
          [source],
          source.path
        );
      }
      if (target.root !== null && !roots.has(target.root)) {
        compileFailure(
          'unknown-root',
          `Schema target at ${source.path} references unknown root "${target.root}".`,
          [source],
          source.path
        );
      }
      return Object.freeze({ kind: 'root', root: target.root });
    case 'parent':
      return Object.freeze({
        kind: 'parent',
        target: cloneTarget(target.target, source, elementTypes, groups, roots),
      });
    case 'not':
      return Object.freeze({
        kind: 'not',
        target: cloneTarget(target.target, source, elementTypes, groups, roots),
      });
    case 'and':
    case 'or': {
      if (target.targets.length < 2) {
        compileFailure(
          'invalid-target',
          `Schema target ${target.kind} at ${source.path} needs at least two operands.`,
          [source],
          source.path
        );
      }
      const targets = target.targets.map((child) =>
        cloneTarget(child, source, elementTypes, groups, roots)
      );

      targets.sort((left, right) =>
        canonicalTarget(left).localeCompare(canonicalTarget(right))
      );

      return Object.freeze({
        kind: target.kind,
        targets: Object.freeze(targets),
      });
    }
  }
};

const cloneElementTarget = (
  target: SchemaElementTarget,
  source: Source<unknown>,
  elementTypes: ReadonlySet<string>,
  groups: ReadonlyMap<string, ReadonlySet<string>>,
  roots: ReadonlySet<string>
): SchemaElementTarget => {
  const cloned = cloneTarget(
    target,
    source,
    elementTypes,
    groups,
    roots
  ) as SchemaElementTarget;
  const hasContextualTarget = (candidate: SchemaTarget): boolean => {
    if (candidate.kind === 'parent' || candidate.kind === 'root') return true;
    if (candidate.kind === 'not') {
      return hasContextualTarget(candidate.target);
    }
    if (candidate.kind === 'and' || candidate.kind === 'or') {
      return candidate.targets.some(hasContextualTarget);
    }

    return false;
  };

  if (hasContextualTarget(cloned)) {
    compileFailure(
      'invalid-content-root-target',
      `Schema content root target at ${source.path} must select element types without parent or root context.`,
      [source],
      source.path
    );
  }

  return cloned;
};

const canonicalTarget = (target: SchemaTarget | null): string => {
  if (!target) return 'all';

  switch (target.kind) {
    case 'type':
      return `type:${JSON.stringify(target.type)}`;
    case 'types':
      return `types:${JSON.stringify(sortedStrings(target.types))}`;
    case 'group':
      return `group:${JSON.stringify(target.group)}`;
    case 'root':
      return `root:${JSON.stringify(target.root)}`;
    case 'parent':
      return `parent(${canonicalTarget(target.target)})`;
    case 'not':
      return `not(${canonicalTarget(target.target)})`;
    case 'and':
    case 'or':
      return `${target.kind}(${target.targets
        .map(canonicalTarget)
        .sort()
        .join(',')})`;
  }
};

export const matchesCompiledSchemaTarget = (
  schema: Pick<CompiledEditorSchema, 'elements'>,
  target: SchemaTarget | null,
  context: CompiledSchemaTargetContext
): boolean => {
  if (!target) return true;

  switch (target.kind) {
    case 'type':
      return context.type === target.type;
    case 'types':
      return target.types.includes(context.type);
    case 'group':
      return (
        schema.elements.groups.get(target.group)?.has(context.type) ?? false
      );
    case 'root':
      return context.root === target.root;
    case 'parent': {
      const [parent, ...ancestors] = context.ancestors ?? [];

      return parent
        ? matchesCompiledSchemaTarget(schema, target.target, {
            ancestors,
            root: context.root,
            type: parent,
          })
        : false;
    }
    case 'not':
      return !matchesCompiledSchemaTarget(schema, target.target, context);
    case 'and':
      return target.targets.every((child) =>
        matchesCompiledSchemaTarget(schema, child, context)
      );
    case 'or':
      return target.targets.some((child) =>
        matchesCompiledSchemaTarget(schema, child, context)
      );
  }
};

const collectTargetAtoms = (
  target: SchemaTarget | null,
  types: Set<string>,
  groups: Set<string>
) => {
  if (!target) return;

  switch (target.kind) {
    case 'type':
      types.add(target.type);
      break;
    case 'types':
      for (const type of target.types) types.add(type);
      break;
    case 'group':
      groups.add(target.group);
      break;
    case 'parent':
    case 'not':
      collectTargetAtoms(target.target, types, groups);
      break;
    case 'and':
    case 'or':
      for (const child of target.targets) {
        collectTargetAtoms(child, types, groups);
      }
      break;
    case 'root':
      break;
  }
};

const getTargetDepth = (target: SchemaTarget | null): number => {
  if (!target) return 0;
  if (target.kind === 'parent') return 1 + getTargetDepth(target.target);
  if (target.kind === 'not') return getTargetDepth(target.target);
  if (target.kind === 'and' || target.kind === 'or') {
    return Math.max(0, ...target.targets.map(getTargetDepth));
  }

  return 0;
};

const representativeTypes = (
  schema: Pick<CompiledEditorSchema, 'elements' | 'unknown'>,
  targets: readonly (SchemaTarget | null)[]
) => {
  const exactTypes = new Set<string>();
  const groupNames = new Set<string>();

  for (const target of targets) {
    collectTargetAtoms(target, exactTypes, groupNames);
  }

  const representatives = new Map<string, string>();

  const types = [
    ...schema.elements.byType.keys(),
    ...(schema.unknown === 'preserve' ? [UNKNOWN_TYPE] : []),
  ];

  for (const type of types) {
    const signature = [
      ...[...exactTypes].sort().map((candidate) => type === candidate),
      ...[...groupNames]
        .sort()
        .map((group) => schema.elements.groups.get(group)?.has(type) ?? false),
    ].join(',');

    if (!representatives.has(signature)) representatives.set(signature, type);
  }

  return [...representatives.values()];
};

const targetCombinationIsSatisfiable = (
  schema: Pick<CompiledEditorSchema, 'elements' | 'roots' | 'unknown'>,
  targets: readonly (SchemaTarget | null)[],
  fixedType?: string,
  cache?: Map<string, boolean>
) => {
  const roots: Array<string | null> = [null, ...schema.roots.keys()];
  const depth = Math.max(0, ...targets.map(getTargetDepth));

  if (fixedType && depth === 0) {
    const result = roots.some((root) =>
      targets.every((target) =>
        matchesCompiledSchemaTarget(schema, target, {
          ancestors: [],
          root,
          type: fixedType,
        })
      )
    );

    return result;
  }

  const cacheKey = `${fixedType ?? '*'}\u0000${targets
    .map(canonicalTarget)
    .sort()
    .join('\u0001')}`;
  const cached = cache?.get(cacheKey);

  if (cached !== undefined) return cached;

  const types = representativeTypes(schema, targets);
  const currentTypes = fixedType ? [fixedType] : types;

  const visitAncestors = (
    currentType: string,
    root: string | null,
    ancestors: string[],
    remaining: number
  ): boolean => {
    const context = { ancestors, root, type: currentType };

    if (
      targets.every((target) =>
        matchesCompiledSchemaTarget(schema, target, context)
      )
    ) {
      return true;
    }
    if (remaining === 0) return false;

    return types.some((type) =>
      visitAncestors(currentType, root, [...ancestors, type], remaining - 1)
    );
  };

  const result = currentTypes.some((type) =>
    roots.some((root) => visitAncestors(type, root, [], depth))
  );

  cache?.set(cacheKey, result);
  return result;
};

const canonicalizePropertyValue = (
  descriptor: PropertyValueDescriptor,
  value: unknown,
  source: Source<unknown>
): PropertyJsonValue => {
  let canonical!: PropertyJsonValue;

  if (descriptor.kind === 'set') {
    if (!Array.isArray(value)) {
      compileFailure(
        'invalid-property-default',
        `Set property default at ${source.path} must be an array.`,
        [source],
        source.path
      );
    }
    const itemDescriptor = (
      descriptor as PropertyValueDescriptor & {
        item?: PropertyValueDescriptor;
      }
    ).item;

    if (!itemDescriptor) {
      compileFailure(
        'invalid-property-descriptor',
        `Set property at ${source.path} needs an item descriptor.`,
        [source],
        source.path
      );
    }
    const items = new Map<string, PropertyJsonValue>();

    for (const item of value as readonly unknown[]) {
      const compiled = canonicalizePropertyValue(itemDescriptor!, item, source);

      items.set(stableStringify(compiled), compiled);
    }

    canonical = Object.freeze(
      [...items]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, item]) => item)
    );
  } else {
    try {
      canonical = canonicalJson(value) as PropertyJsonValue;
    } catch (error) {
      compileFailure(
        'invalid-property-default',
        `Schema property default at ${source.path} is not JSON: ${(error as Error).message}`,
        [source],
        source.path
      );
    }

    const validKind =
      descriptor.kind === 'json' ||
      (descriptor.kind === 'boolean' && typeof canonical === 'boolean') ||
      (descriptor.kind === 'number' && typeof canonical === 'number') ||
      (descriptor.kind === 'string' && typeof canonical === 'string');

    if (!validKind) {
      compileFailure(
        'invalid-property-default',
        `Schema property default at ${source.path} does not match kind "${descriptor.kind}".`,
        [source],
        source.path
      );
    }
  }

  if (descriptor.validate) {
    let valid = false;

    try {
      valid = descriptor.validate(canonical);
    } catch (error) {
      compileFailure(
        'property-validation-failure',
        `Schema property validation at ${source.path} threw: ${(error as Error).message}`,
        [source],
        source.path
      );
    }
    if (!valid) {
      compileFailure(
        'property-validation-failure',
        `Schema property default at ${source.path} fails custom validation.`,
        [source],
        source.path
      );
    }
  }

  return canonical;
};

const clonePropertyDescriptor = (
  descriptor: PropertyValueDescriptor,
  source: Source<unknown>
): PropertyValueDescriptor => {
  if (
    !['boolean', 'json', 'number', 'set', 'string'].includes(descriptor.kind) ||
    typeof descriptor.omitDefault !== 'boolean' ||
    (descriptor.significant !== undefined &&
      typeof descriptor.significant !== 'boolean')
  ) {
    compileFailure(
      'invalid-property-descriptor',
      `Schema property at ${source.path} has an invalid value descriptor.`,
      [source],
      source.path
    );
  }

  const hasValidate = Object.hasOwn(descriptor, 'validate');
  const hasValidationVersion = Object.hasOwn(descriptor, 'validationVersion');

  if (hasValidate !== hasValidationVersion) {
    compileFailure(
      'invalid-property-validation',
      `Schema property validation at ${source.path} must declare validate and validationVersion together.`,
      [source],
      source.path
    );
  }
  if (hasValidate) {
    if (typeof descriptor.validate !== 'function') {
      compileFailure(
        'invalid-property-validation',
        `Schema property validation at ${source.path} must provide a validator function.`,
        [source],
        source.path
      );
    }
    if (
      typeof descriptor.validationVersion !== 'number' ||
      !Number.isSafeInteger(descriptor.validationVersion) ||
      descriptor.validationVersion < 1
    ) {
      compileFailure(
        'invalid-property-validation',
        `Schema property validationVersion at ${source.path} must be a positive integer.`,
        [source],
        source.path
      );
    }
  }

  let item: PropertyValueDescriptor | undefined;

  if (descriptor.kind === 'set') {
    const rawItem = (
      descriptor as PropertyValueDescriptor & {
        item?: PropertyValueDescriptor;
      }
    ).item;

    if (!rawItem) {
      compileFailure(
        'invalid-property-descriptor',
        `Set property at ${source.path} needs an item descriptor.`,
        [source],
        source.path
      );
    }
    item = clonePropertyDescriptor(rawItem!, source);
  }

  const hasDefault = Object.hasOwn(descriptor, 'default');
  let defaultValue: PropertyJsonValue | undefined;

  if (hasDefault) {
    defaultValue = canonicalizePropertyValue(
      Object.freeze({
        ...descriptor,
        ...(item ? { item } : {}),
      }) as PropertyValueDescriptor,
      descriptor.default,
      source
    );
  }
  if (descriptor.omitDefault && !hasDefault) {
    compileFailure(
      'invalid-property-default',
      `Schema property at ${source.path} cannot omit a missing default.`,
      [source],
      source.path
    );
  }

  const cloned: Record<PropertyKey, unknown> = {
    ...(hasDefault ? { default: defaultValue } : {}),
    ...(item ? { item } : {}),
    kind: descriptor.kind,
    omitDefault: descriptor.omitDefault,
    significant: descriptor.significant ?? true,
    ...(hasValidationVersion
      ? { validationVersion: descriptor.validationVersion }
      : {}),
  };

  if (descriptor.validate) {
    Object.defineProperty(cloned, 'validate', {
      enumerable: false,
      value: descriptor.validate,
    });
  }

  return Object.freeze(cloned) as PropertyValueDescriptor;
};

const propertyKeyLabel = (key: SchemaPropertyKey) =>
  typeof key === 'string' ? key : `${key.prefix}*`;

/** Canonical persisted identity for one schema property declaration. */
export const getCompiledSchemaPropertyId = (
  declaration: Readonly<{
    key: SchemaPropertyKey;
    placement: 'element' | 'text';
    target?: SchemaTarget | null;
  }>
) => {
  const selector =
    typeof declaration.key === 'string'
      ? `exact:${declaration.key}`
      : `prefix:${declaration.key.prefix}`;

  return `${declaration.placement}:${propertyKeyLabel(declaration.key)}@${hashSchemaIdentityString(
    `${selector}\u0000${canonicalTarget(declaration.target ?? null)}`
  )}`;
};

const propertySelectorsOverlap = (
  left: SchemaPropertyKey,
  right: SchemaPropertyKey
) => {
  if (typeof left === 'string') {
    return typeof right === 'string'
      ? left === right
      : left.startsWith(right.prefix);
  }
  if (typeof right === 'string') return right.startsWith(left.prefix);

  return (
    left.prefix.startsWith(right.prefix) || right.prefix.startsWith(left.prefix)
  );
};

const validatePropertyKey = (
  key: SchemaPropertyKey,
  placement: 'element' | 'text',
  source: Source<unknown>
) => {
  const reserved =
    placement === 'element' ? RESERVED_ELEMENT_KEYS : RESERVED_TEXT_KEYS;

  if (typeof key === 'string') {
    assertName(key, 'Schema property key', source);
    if (reserved.has(key)) {
      compileFailure(
        'reserved-property-key',
        `Schema ${placement} property at ${source.path} cannot claim reserved key "${key}".`,
        [source],
        source.path
      );
    }

    return key;
  }

  assertName(key.prefix, 'Schema property key prefix', source);
  const conflict = [...reserved].find((reservedKey) =>
    reservedKey.startsWith(key.prefix)
  );

  if (conflict) {
    compileFailure(
      'reserved-property-key',
      `Schema ${placement} property prefix "${key.prefix}" claims reserved key "${conflict}".`,
      [source],
      source.path
    );
  }

  return Object.freeze({ kind: 'prefix' as const, prefix: key.prefix });
};

const canonicalDescriptor = (descriptor: PropertyValueDescriptor): unknown => ({
  ...(Object.hasOwn(descriptor, 'default')
    ? { default: canonicalJson(descriptor.default) }
    : {}),
  ...(descriptor.kind === 'set'
    ? {
        item: canonicalDescriptor(
          (
            descriptor as PropertyValueDescriptor & {
              item: PropertyValueDescriptor;
            }
          ).item
        ),
      }
    : {}),
  kind: descriptor.kind,
  omitDefault: descriptor.omitDefault,
  ...(descriptor.validationVersion
    ? { validationVersion: descriptor.validationVersion }
    : {}),
  significant: descriptor.significant ?? true,
});

const compilePropertyLookup = (
  properties: readonly CompiledSchemaProperty[],
  placement: 'element' | 'text'
): CompiledSchemaPropertyLookup => {
  const exact = new Map<string, string[]>();
  const prefixes = new Map<string, string[]>();

  for (const property of properties) {
    if (property.placement !== placement) continue;
    const map = typeof property.key === 'string' ? exact : prefixes;
    const key =
      typeof property.key === 'string' ? property.key : property.key.prefix;
    const values = map.get(key) ?? [];

    values.push(property.id);
    map.set(key, values);
  }

  return Object.freeze({
    exact: freezeMap(
      new Map(
        [...exact]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, values]) => [key, Object.freeze(values.sort())] as const)
      )
    ),
    prefixes: Object.freeze(
      [...prefixes]
        .sort(
          ([left], [right]) =>
            right.length - left.length || left.localeCompare(right)
        )
        .map(([prefix, propertyIds]) =>
          Object.freeze({
            prefix,
            propertyIds: Object.freeze(propertyIds.sort()),
          })
        )
    ),
  });
};

export const resolveCompiledSchemaProperty = (
  schema: Pick<CompiledEditorSchema, 'elements' | 'properties'>,
  placement: 'element' | 'text',
  key: string,
  context: CompiledSchemaTargetContext
): CompiledSchemaProperty | null => {
  const lookup = schema.properties.lookup[placement];
  const candidateIds = [
    ...(lookup.exact.get(key) ?? []),
    ...lookup.prefixes.flatMap(({ prefix, propertyIds }) =>
      key.startsWith(prefix) ? propertyIds : []
    ),
  ];

  for (const id of candidateIds) {
    const property = schema.properties.byId.get(id);

    if (
      property &&
      matchesCompiledSchemaTarget(schema, property.target, context)
    ) {
      return property;
    }
  }

  return null;
};

export const getCompiledPropertyMergeStrategy = (
  schema: Pick<CompiledEditorSchema, 'elements' | 'properties'>,
  placement: 'element' | 'text',
  key: string,
  context: CompiledSchemaTargetContext
): CompiledSchemaPropertyMergeStrategy | null =>
  resolveCompiledSchemaProperty(schema, placement, key, context)?.merge ?? null;

const compileEditorSchemaInternal = (
  inputRecords: readonly EditorSchemaContributionRecord[],
  revision: number
): CompiledEditorSchema => {
  if (!Number.isSafeInteger(revision) || revision < 0) {
    compileFailure(
      'invalid-schema-revision',
      'Compiled schema revision must be a non-negative integer.',
      [],
      'revision'
    );
  }
  assertSchemaDeclarationOwnership(inputRecords);
  collectSchemaKeyDiagnostics(inputRecords);

  const explicitRecords = [...inputRecords].sort((left, right) =>
    left.extensionName.localeCompare(right.extensionName)
  );
  const duplicateExtension = explicitRecords.find(
    (record, index) =>
      explicitRecords[index - 1]?.extensionName === record.extensionName
  );

  if (duplicateExtension) {
    compileFailure(
      'duplicate-schema-contribution',
      `Editor extension "${duplicateExtension.extensionName}" contributes schema more than once.`,
      [duplicateExtension.extensionName],
      'schema'
    );
  }

  const complete = explicitRecords.filter(({ contribution }) =>
    isCompleteSchemaDeclaration(contribution)
  );

  if (complete.length > 1) {
    compileFailure(
      'duplicate-complete-schema',
      `Schema contributions contain multiple complete schemas: ${complete
        .map(({ extensionName }) => extensionName)
        .join(', ')}.`,
      complete.map(({ extensionName }) => extensionName),
      'schema'
    );
  }

  const derivedBaseRecord = createDerivedBaseSchemaRecord(explicitRecords);
  const completeRecord: EditorSchemaContributionRecord =
    complete[0] ?? derivedBaseRecord;
  const records: readonly EditorSchemaContributionRecord[] = (
    complete.length === 0
      ? [...explicitRecords, derivedBaseRecord]
      : explicitRecords
  ).sort((left, right) =>
    left.extensionName.localeCompare(right.extensionName)
  );

  collectSchemaOwnershipConflictDiagnostics(records);
  const definition = completeRecord.contribution as EditorSchemaDefinition;
  const identitySource: Source<unknown> = {
    extensionName: completeRecord.extensionName,
    path: 'schema',
    value: definition,
  };

  const derived = isDerivedSchemaDefinition(definition);

  if (!derived) {
    assertName(definition.id, 'Editor schema id', identitySource);
    if (
      typeof definition.version !== 'number' ||
      !Number.isSafeInteger(definition.version) ||
      definition.version < 1
    ) {
      compileFailure(
        'invalid-schema-version',
        `Editor schema "${definition.id}" version must be a positive integer.`,
        [identitySource],
        'schema.version'
      );
    }
  }
  if (definition.unknown !== 'preserve' && definition.unknown !== 'reject') {
    compileFailure(
      'invalid-unknown-policy',
      `${derived ? 'Derived editor schema' : `Editor schema "${definition.id}"`} unknown policy must be "preserve" or "reject".`,
      [identitySource],
      'schema.unknown'
    );
  }
  const unknownPolicy = definition.unknown as EditorSchemaUnknownPolicy;

  const groupParents = new Map<string, readonly string[]>(
    BUILT_IN_GROUPS.map((group) => [group, Object.freeze([])] as const)
  );
  const groupSources = new Map<string, Source<unknown>>();

  for (const record of records) {
    for (const [group, declaration] of Object.entries(
      record.contribution.groups ?? {}
    ).sort(([left], [right]) => left.localeCompare(right))) {
      const source: Source<unknown> = {
        extensionName: record.extensionName,
        path: `groups.${group}`,
        value: declaration,
      };

      assertName(group, 'Schema group name', source);
      if (BUILT_IN_GROUP_SET.has(group)) {
        compileFailure(
          'reserved-group',
          `Schema group "${group}" is compiler-owned and cannot be redeclared.`,
          [source],
          source.path
        );
      }
      const known = groupSources.get(group);

      if (known) {
        compileFailure(
          'duplicate-group',
          `Schema group "${group}" is owned by both "${known.extensionName}" and "${record.extensionName}".`,
          [known, source],
          source.path
        );
      }
      const parents = sortedStrings(declaration.extends ?? []);

      groupSources.set(group, source);
      groupParents.set(group, Object.freeze(parents));
    }
  }

  for (const [group, parents] of groupParents) {
    for (const parent of parents) {
      if (!groupParents.has(parent)) {
        const source = groupSources.get(group)!;

        compileFailure(
          'unknown-group',
          `Schema group "${group}" extends unknown group "${parent}".`,
          source ? [source] : [],
          `groups.${group}`
        );
      }
    }
  }
  const groupClosure = new Map<string, ReadonlySet<string>>();

  for (const group of [...groupParents.keys()].sort()) {
    resolveGroupClosure(group, groupParents, groupClosure);
  }

  const mutableElements = new Map<string, MutableElement>();

  for (const record of records) {
    for (const [type, input] of Object.entries(
      record.contribution.elements ?? {}
    ).sort(([left], [right]) => left.localeCompare(right))) {
      const source: Source<SchemaElement> = {
        extensionName: record.extensionName,
        path: `elements.${type}`,
        value: input,
      };

      assertName(type, 'Schema element type', source);
      const known = mutableElements.get(type);

      if (known) {
        compileFailure(
          'duplicate-element-type',
          `Schema element type "${type}" is owned by both "${known.source.extensionName}" and "${record.extensionName}".`,
          [known.source, source],
          source.path
        );
      }

      const behavior = compileElementBehavior(source);
      const derivesVoidContent = behavior.void && !behavior.editableIsland;

      if (derivesVoidContent && input.content) {
        compileFailure(
          'redundant-void-content',
          `Schema element "${type}" derives its canonical empty text child from void kind "${behavior.voidKind}" and cannot declare content.`,
          [source],
          `${source.path}.content`
        );
      }
      if (!derivesVoidContent && !input.content) {
        compileFailure(
          'missing-element-content',
          `Schema element "${type}" must declare content explicitly. Use schema.content.open() for intentionally open content.`,
          [source],
          `${source.path}.content`
        );
      }
      const elementContent = derivesVoidContent
        ? CANONICAL_VOID_CONTENT
        : input.content!;
      const directGroups = new Set<string>([
        'all',
        'element',
        behavior.inline ? 'inline' : 'block',
      ]);

      for (const group of input.groups ?? []) {
        if (!groupParents.has(group)) {
          compileFailure(
            'unknown-group',
            `Schema element "${type}" references unknown group "${group}".`,
            [source],
            source.path
          );
        }
        if (group === 'text' || group === 'inline' || group === 'block') {
          compileFailure(
            'invalid-built-in-group',
            `Schema element "${type}" cannot declare compiler-owned group "${group}". Element and text membership is derived from the element definition.`,
            [source],
            source.path
          );
        }
        directGroups.add(group);
      }

      mutableElements.set(type, {
        behavior,
        content: elementContent,
        contentRoots: new Map(
          Object.entries(input.contentRoots ?? {}).map(
            ([slot, contentRoot]: [string, SchemaContentRootInput]) => [
              slot,
              {
                extensionName: record.extensionName,
                path: `${source.path}.contentRoots.${slot}`,
                value: Object.hasOwn(contentRoot, 'allowed')
                  ? Object.freeze({
                      content: contentRoot as SchemaContent,
                      ownership: 'shared' as const,
                    })
                  : (contentRoot as SchemaContentRoot),
              },
            ]
          )
        ),
        directGroups,
        input,
        source,
        type,
      });
    }
  }

  const elementTypes = new Set(mutableElements.keys());
  const textGroups = resolveMembership(
    new Set(['all', 'inline', 'text']),
    groupParents,
    groupClosure
  );
  const getMemberships = () => {
    const memberships = new Map<string, Set<string>>();

    for (const [type, element] of mutableElements) {
      memberships.set(
        type,
        resolveMembership(element.directGroups, groupParents, groupClosure)
      );
    }

    return memberships;
  };
  const toGroupMembers = (
    memberships: ReadonlyMap<string, ReadonlySet<string>>
  ) => {
    const groups = new Map<string, Set<string>>(
      [...groupParents.keys()].map((group) => [group, new Set()])
    );

    for (const [type, names] of memberships) {
      for (const group of names) groups.get(group)?.add(type);
    }

    return groups;
  };

  const initialMemberships = getMemberships();
  for (const [type, names] of initialMemberships) {
    const element = mutableElements.get(type)!;
    const invalidClassification =
      names.has('text') ||
      names.has('inline') !== element.behavior.inline ||
      (element.behavior.inline && names.has('block'));

    if (invalidClassification) {
      const source = element.source;

      compileFailure(
        'invalid-built-in-group',
        `Schema element "${type}" has compiler-owned group membership that contradicts its behavior.`,
        [source],
        source.path
      );
    }
  }
  const initialGroups = toGroupMembers(initialMemberships);

  for (const element of mutableElements.values()) {
    if (!element.behavior.inline) {
      const source: Source<SchemaContent> = {
        extensionName: element.source.extensionName,
        path: `${element.source.path}.content`,
        value: element.content,
      };
      const program = compileContent(
        source,
        elementTypes,
        initialGroups,
        textGroups,
        unknownPolicy
      );

      if (
        program.allowsText &&
        (!element.behavior.void || element.behavior.editableIsland)
      ) {
        element.directGroups.add('textBlock');
      }
    }
  }

  const memberships = getMemberships();
  const mutableGroups = toGroupMembers(memberships);
  const rootsByName = new Map<string, Source<SchemaContent>>();
  const primaryRoot: Source<SchemaContent> = {
    extensionName: completeRecord.extensionName,
    path: 'root.content',
    value: definition.root.content,
  };

  for (const record of records) {
    for (const [name, root] of Object.entries(
      record.contribution.roots ?? {}
    ).sort(([left], [right]) => left.localeCompare(right))) {
      const source: Source<SchemaContent> = {
        extensionName: record.extensionName,
        path: `roots.${name}.content`,
        value: root.content,
      };

      assertName(name, 'Schema root name', source);
      if (name === RESERVED_PRIMARY_ROOT) {
        compileFailure(
          'reserved-primary-root',
          'Named schema roots cannot declare "main"; use the singular root field.',
          [source],
          source.path
        );
      }
      const known = rootsByName.get(name);

      if (known) {
        compileFailure(
          'duplicate-root',
          `Schema root "${name}" is owned by both "${known.extensionName}" and "${record.extensionName}".`,
          [known, source],
          source.path
        );
      }
      rootsByName.set(name, source);
    }
  }

  const rootNames = new Set(rootsByName.keys());
  const targetSchema = {
    elements: {
      byType: mutableElements,
      groups: mutableGroups,
    },
    roots: rootsByName,
    unknown: unknownPolicy,
  } as unknown as Pick<CompiledEditorSchema, 'elements' | 'roots' | 'unknown'>;
  const targetSatisfiabilityCache = new Map<string, boolean>();
  const assertContentRoot = (
    root: SchemaContentRoot,
    source: Source<unknown>
  ) => {
    if (root.ownership !== 'exclusive' && root.ownership !== 'shared') {
      compileFailure(
        'invalid-content-root-ownership',
        `Schema content root at ${source.path} ownership must be "exclusive" or "shared".`,
        [source],
        `${source.path}.ownership`
      );
    }
  };

  for (const element of mutableElements.values()) {
    for (const [slot, root] of element.contentRoots) {
      assertName(slot, 'Schema content root slot', root);
      assertContentRoot(root.value, root);
    }
  }
  for (const record of records) {
    for (const [index, contribution] of (
      record.contribution.contentRoots ?? []
    ).entries()) {
      const source: Source<SchemaContentRootContribution> = {
        extensionName: record.extensionName,
        path: `contentRoots.${index}`,
        value: contribution,
      };

      assertName(contribution.slot, 'Schema content root slot', source);
      assertContentRoot(contribution, source);
      const projectedTarget = cloneElementTarget(
        contribution.target,
        {
          ...source,
          path: `${source.path}.target`,
        },
        elementTypes,
        mutableGroups,
        rootNames
      );
      let matched = false;

      for (const [type, element] of mutableElements) {
        if (
          !targetCombinationIsSatisfiable(
            targetSchema,
            [projectedTarget],
            type,
            targetSatisfiabilityCache
          )
        ) {
          continue;
        }
        matched = true;
        const previous = element.contentRoots.get(contribution.slot);

        if (previous) {
          compileFailure(
            'content-root-slot-conflict',
            `Schema content root slot "${contribution.slot}" for element type "${type}" is declared by both "${previous.extensionName}" and "${record.extensionName}".`,
            [previous, source],
            source.path
          );
        }
        element.contentRoots.set(
          contribution.slot,
          Object.freeze({
            extensionName: record.extensionName,
            path: source.path,
            value: Object.freeze({
              content: contribution.content,
              ownership: contribution.ownership,
            }),
          })
        );
      }
      if (!matched) {
        compileFailure(
          'unsatisfied-content-root-target',
          `Schema content root slot "${contribution.slot}" at ${source.path} does not target any element type.`,
          [source],
          `${source.path}.target`
        );
      }
    }
  }

  const mutablePrograms = new Map<string, MutableContentProgram>();

  for (const element of mutableElements.values()) {
    const source: Source<SchemaContent> = {
      extensionName: element.source.extensionName,
      path: `${element.source.path}.content`,
      value: element.content,
    };
    const program = compileContent(
      source,
      elementTypes,
      mutableGroups,
      textGroups,
      unknownPolicy
    );
    const blockChildTypes = sortedStrings(
      [...program.allowedElementTypes].filter(
        (type) => mutableElements.get(type)?.behavior.inline === false
      )
    );
    const inlineChildTypes = sortedStrings(
      [...program.allowedElementTypes].filter(
        (type) => mutableElements.get(type)?.behavior.inline
      )
    );

    if (element.behavior.inline && blockChildTypes.length > 0) {
      const blockChildren =
        blockChildTypes.length === 1
          ? `block child type "${blockChildTypes[0]}"`
          : `block child types ${blockChildTypes
              .map((type) => `"${type}"`)
              .join(', ')}`;

      compileFailure(
        'inline-content-rejects-blocks',
        `Schema inline element "${element.type}" allows ${blockChildren}, but inline element content can contain only text and inline elements.`,
        [
          source,
          ...blockChildTypes.map((type) => mutableElements.get(type)!.source),
        ],
        source.path
      );
    }
    if (element.behavior.inline && program.allowsUnknownElements) {
      compileFailure(
        'inline-content-rejects-unknown-elements',
        `Schema inline element "${element.type}" allows unknown element children, but undeclared elements cannot be proven inline.`,
        [source],
        source.path
      );
    }

    if (inlineChildTypes.length > 0) {
      const inlineChildren =
        inlineChildTypes.length === 1
          ? `inline child type "${inlineChildTypes[0]}"`
          : `inline child types ${inlineChildTypes
              .map((type) => `"${type}"`)
              .join(', ')}`;

      if (!program.allowsText) {
        compileFailure(
          'inline-content-requires-text',
          `Schema element "${element.type}" allows ${inlineChildren}, but canonical inline content requires text spacers.`,
          [source],
          source.path
        );
      }
      if (program.max !== null && program.max < 3) {
        compileFailure(
          'inline-content-requires-spacers',
          `Schema element "${element.type}" allows ${inlineChildren}, but maximum content cardinality ${program.max} cannot fit one inline child and its two canonical text spacers.`,
          [source],
          source.path
        );
      }
    }

    mutablePrograms.set(`element:${element.type}`, program);
    for (const [slot, root] of element.contentRoots) {
      const contentSource: Source<SchemaContent> = {
        extensionName: root.extensionName,
        path: `${root.path}.content`,
        value: root.value.content,
      };

      assertName(slot, 'Schema content root slot', contentSource);
      const program = compileContent(
        contentSource,
        elementTypes,
        mutableGroups,
        textGroups,
        unknownPolicy
      );

      if (program.allowsText) {
        compileFailure(
          'text-in-root-content',
          `Projected root grammar at ${contentSource.path} cannot allow text nodes.`,
          [contentSource],
          contentSource.path
        );
      }
      mutablePrograms.set(`contentRoot:${element.type}:${slot}`, program);
    }
  }

  const primaryProgram = compileContent(
    primaryRoot!,
    elementTypes,
    mutableGroups,
    textGroups,
    unknownPolicy
  );

  if (primaryProgram.allowsText) {
    compileFailure(
      'text-in-root-content',
      'The primary root grammar cannot allow text nodes.',
      [primaryRoot!],
      primaryRoot!.path
    );
  }
  mutablePrograms.set('root', primaryProgram);
  for (const [name, source] of [...rootsByName].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const program = compileContent(
      source,
      elementTypes,
      mutableGroups,
      textGroups,
      unknownPolicy
    );

    if (program.allowsText) {
      compileFailure(
        'text-in-root-content',
        `Named root "${name}" grammar cannot allow text nodes.`,
        [source],
        source.path
      );
    }
    mutablePrograms.set(`root:${name}`, program);
  }

  const constructible = new Set<string>();
  const constructing: string[] = [];
  const validateElementConstruction = (type: string) => {
    if (constructible.has(type)) return;
    const cycleIndex = constructing.indexOf(type);

    if (cycleIndex !== -1) {
      const cycle = [...constructing.slice(cycleIndex), type];
      const element = mutableElements.get(type)!;

      compileFailure(
        'cyclic-content-default',
        `Schema construction defaults contain a cycle: ${cycle.join(' -> ')}.`,
        [element.source],
        element.source.path
      );
    }

    constructing.push(type);
    const contentRootProgramIds = [
      ...(mutableElements.get(type)?.contentRoots.keys() ?? []),
    ].map((slot) => `contentRoot:${type}:${slot}`);

    for (const programId of [`element:${type}`, ...contentRootProgramIds]) {
      const plan = mutablePrograms.get(programId)?.defaultPlan;

      if (plan?.kind === 'element') validateElementConstruction(plan.type);
    }
    constructing.pop();
    constructible.add(type);
  };

  for (const program of mutablePrograms.values()) {
    if (program.defaultPlan?.kind === 'element') {
      validateElementConstruction(program.defaultPlan.type);
    }
  }

  const frozenPrograms = new Map<string, CompiledSchemaContentProgram>();
  const defaultPlans = new Map<string, CompiledSchemaConstructionPlan>();

  for (const [id, program] of [...mutablePrograms].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const frozen = freezeContentProgram(program);

    frozenPrograms.set(id, frozen);
    if (frozen.defaultPlan) defaultPlans.set(id, frozen.defaultPlan);
  }

  const mutableProperties: MutableProperty[] = [];
  const addProperty = (
    raw: SchemaProperty | PropertyValueDescriptor,
    key: SchemaPropertyKey,
    placement: 'element' | 'text',
    target: SchemaTarget | null,
    lifecycle: CompiledSchemaProperty['lifecycle'],
    source: Source<SchemaProperty | PropertyValueDescriptor>
  ) => {
    const clonedKey = validatePropertyKey(key, placement, source);
    const clonedTarget = target
      ? cloneTarget(target, source, elementTypes, mutableGroups, rootNames)
      : null;
    const descriptor = clonePropertyDescriptor(
      'value' in raw ? raw.value : raw,
      source
    );

    mutableProperties.push({
      descriptor,
      key: clonedKey,
      lifecycle,
      merge: descriptor.kind === 'set' ? 'set' : 'replace',
      owner: source.extensionName,
      placement,
      source,
      target: clonedTarget,
    });
  };

  for (const element of mutableElements.values()) {
    for (const [key, descriptor] of Object.entries(
      element.input.properties ?? {}
    ).sort(([left], [right]) => left.localeCompare(right))) {
      const source: Source<PropertyValueDescriptor> = {
        extensionName: element.source.extensionName,
        path: `${element.source.path}.properties.${key}`,
        value: descriptor,
      };

      addProperty(
        descriptor,
        key,
        'element',
        Object.freeze({ kind: 'type', type: element.type }),
        Object.freeze({
          inclusive: null,
          split: 'preserve',
          typeChange: 'drop',
        }),
        source
      );
    }
  }

  for (const record of records) {
    for (const [index, property] of (
      record.contribution.properties ?? []
    ).entries()) {
      const source: Source<SchemaProperty> = {
        extensionName: record.extensionName,
        path: `properties.${index}`,
        value: property,
      };

      if (property.placement === 'element') {
        const elementProperty = property as SchemaElementProperty;

        if (!elementProperty.target) {
          compileFailure(
            'missing-property-target',
            `Schema element property at ${source.path} requires a target.`,
            [source],
            source.path
          );
        }
        addProperty(
          property,
          property.key,
          'element',
          elementProperty.target,
          Object.freeze({
            inclusive: null,
            split: property.split,
            typeChange: property.typeChange,
          }),
          source
        );
      } else if (property.placement === 'text') {
        const textProperty = property as SchemaTextProperty;

        addProperty(
          property,
          property.key,
          'text',
          textProperty.target ?? null,
          Object.freeze({
            inclusive: textProperty.inclusive,
            split: property.split,
            typeChange: property.typeChange,
          }),
          source
        );
      } else {
        compileFailure(
          'invalid-property-placement',
          `Schema property at ${source.path} has invalid placement.`,
          [source],
          source.path
        );
      }
    }
  }

  const selectorDiagnostics: EditorSchemaDiagnostic[] = [];

  for (let leftIndex = 0; leftIndex < mutableProperties.length; leftIndex++) {
    const left = mutableProperties[leftIndex]!;

    for (
      let rightIndex = leftIndex + 1;
      rightIndex < mutableProperties.length;
      rightIndex++
    ) {
      const right = mutableProperties[rightIndex]!;

      if (
        left.placement !== right.placement ||
        !propertySelectorsOverlap(left.key, right.key) ||
        !targetCombinationIsSatisfiable(
          targetSchema,
          [left.target, right.target],
          undefined,
          targetSatisfiabilityCache
        )
      ) {
        continue;
      }

      selectorDiagnostics.push(
        Object.freeze({
          code: 'property-selector-conflict',
          extensions: Object.freeze([left.owner, right.owner]),
          message: `Schema ${left.placement} property selectors "${propertyKeyLabel(left.key)}" and "${propertyKeyLabel(right.key)}" overlap in declarations from "${left.owner}" and "${right.owner}".`,
          path: right.source.path,
        })
      );
    }
  }

  if (selectorDiagnostics.length > 0) {
    throw new EditorSchemaCompileError(selectorDiagnostics);
  }

  const compiledProperties = mutableProperties
    .map((property) => {
      const id = getCompiledSchemaPropertyId(property);

      return Object.freeze({
        descriptor: property.descriptor,
        id,
        key: property.key,
        lifecycle: property.lifecycle,
        merge: property.merge,
        owner: property.owner,
        placement: property.placement,
        target: property.target,
      }) satisfies CompiledSchemaProperty;
    })
    .sort((left, right) => left.id.localeCompare(right.id));
  const byId = new Map<string, CompiledSchemaProperty>();

  for (const property of compiledProperties) {
    if (byId.has(property.id)) {
      compileFailure(
        'property-id-collision',
        `Compiled schema property ID collision for "${property.id}".`,
        [property.owner],
        'properties'
      );
    }
    byId.set(property.id, property);
  }

  const propertyIdsByElement = new Map<string, Set<string>>(
    [...elementTypes].map((type) => [type, new Set()])
  );
  const textIdsByParent = new Map<string, Set<string>>(
    [...elementTypes].map((type) => [type, new Set()])
  );

  for (const property of compiledProperties) {
    const destination =
      property.placement === 'element' ? propertyIdsByElement : textIdsByParent;

    for (const type of elementTypes) {
      if (
        targetCombinationIsSatisfiable(
          targetSchema,
          [property.target],
          type,
          targetSatisfiabilityCache
        )
      ) {
        destination.get(type)!.add(property.id);
      }
    }
  }

  const compiledElements = new Map<string, CompiledSchemaElement>();

  for (const [type, element] of [...mutableElements].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const propertyIds = freezeSet<string>(
      propertyIdsByElement.get(type) ?? new Set<string>()
    );
    const defaultPropertyIds = freezeSet<string>(
      new Set(
        [...propertyIds].filter((id) =>
          Object.hasOwn(byId.get(id)?.descriptor ?? {}, 'default')
        )
      )
    );
    const contentRoots = freezeMap(
      new Map(
        [...element.contentRoots]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([slot, root]) => [
            slot,
            Object.freeze({
              content: frozenPrograms.get(`contentRoot:${type}:${slot}`)!,
              ownership: root.value.ownership,
            }),
          ])
      )
    );
    const explicitPreserveContext = Object.hasOwn(
      element.input.slice ?? {},
      'preserveContext'
    );

    if (
      explicitPreserveContext &&
      (element.behavior.atom ||
        (element.behavior.void && !element.behavior.editableIsland))
    ) {
      compileFailure(
        'invalid-slice-policy',
        `Schema element "${type}" cannot preserve slice context because it does not expose editable child content.`,
        [element.source],
        `${element.source.path}.slice.preserveContext`
      );
    }
    const preserveContext = element.input.slice?.preserveContext ?? false;

    compiledElements.set(
      type,
      Object.freeze({
        behavior: element.behavior,
        content: frozenPrograms.get(`element:${type}`)!,
        contentRoots,
        construction: Object.freeze({ defaultPropertyIds, propertyIds }),
        groups: freezeSet(memberships.get(type) ?? new Set<string>()),
        propertyIds,
        slice: Object.freeze({
          preserveContext,
          replaceWhenCovered:
            element.input.slice?.replaceWhenCovered ?? !preserveContext,
        }),
        type,
      })
    );
  }

  const allowedChildren = new Map<string, ReadonlySet<string>>();
  const allowedParents = new Map<string, Set<string>>(
    [...elementTypes].map((type) => [type, new Set()])
  );

  for (const [id, program] of frozenPrograms) {
    allowedChildren.set(id, program.allowedElementTypes);
    for (const type of program.allowedElementTypes) {
      allowedParents.get(type)?.add(id);
    }
  }

  const wrapperPlans = new Map<string, CompiledSchemaWrapperPlan>();

  for (const [programId, program] of frozenPrograms) {
    const emptyPlan = Object.freeze([]) as CompiledSchemaWrapperPlan;

    if (program.allowsText) {
      wrapperPlans.set(
        getCompiledSchemaWrapperPlanKey(programId, null),
        emptyPlan
      );
    }
    for (const type of program.allowedElementTypes) {
      wrapperPlans.set(
        getCompiledSchemaWrapperPlanKey(programId, type),
        emptyPlan
      );
    }
  }

  const roots = new Map<string, CompiledSchemaRoot>();

  for (const name of sortedStrings(rootNames)) {
    roots.set(
      name,
      Object.freeze({ content: frozenPrograms.get(`root:${name}`)!, name })
    );
  }

  const elementLookup = compilePropertyLookup(compiledProperties, 'element');
  const textLookup = compilePropertyLookup(compiledProperties, 'text');
  const mergeStrategies = new Map(
    compiledProperties.map((property) => [property.id, property.merge] as const)
  );
  const lifecycle = new Map(
    compiledProperties.map(
      (property) => [property.id, property.lifecycle] as const
    )
  );
  const canonicalModel = {
    elements: [...compiledElements].map(([type, element]) => ({
      behavior: element.behavior,
      content: element.content
        ? {
            allowedElementTypes: sortedStrings(
              element.content.allowedElementTypes
            ),
            allowsText: element.content.allowsText,
            allowsUnknownElements: element.content.allowsUnknownElements,
            defaultPlan: element.content.defaultPlan,
            max: element.content.max,
            min: element.content.min,
          }
        : null,
      contentRoots: [...element.contentRoots].map(([slot, root]) => ({
        content: {
          allowedElementTypes: sortedStrings(root.content.allowedElementTypes),
          allowsText: root.content.allowsText,
          allowsUnknownElements: root.content.allowsUnknownElements,
          defaultPlan: root.content.defaultPlan,
          max: root.content.max,
          min: root.content.min,
        },
        ownership: root.ownership,
        slot,
      })),
      construction: {
        defaultPropertyIds: sortedStrings(
          element.construction.defaultPropertyIds
        ),
        propertyIds: sortedStrings(element.construction.propertyIds),
      },
      groups: sortedStrings(element.groups),
      slice: element.slice,
      type,
    })),
    groups: [...groupParents]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([group, parents]) => ({ group, parents: sortedStrings(parents) })),
    properties: compiledProperties.map((property) => ({
      descriptor: canonicalDescriptor(property.descriptor),
      id: property.id,
      key:
        typeof property.key === 'string'
          ? { exact: property.key }
          : { prefix: property.key.prefix },
      lifecycle: property.lifecycle,
      merge: property.merge,
      placement: property.placement,
      target: canonicalTarget(property.target),
    })),
    root: {
      allowedElementTypes: sortedStrings(primaryProgram.allowedElementTypes),
      allowsUnknownElements: primaryProgram.allowsUnknownElements,
      defaultPlan: primaryProgram.defaultPlan,
      max: primaryProgram.max,
      min: primaryProgram.min,
    },
    roots: [...roots].map(([name, root]) => ({
      allowedElementTypes: sortedStrings(root.content.allowedElementTypes),
      allowsUnknownElements: root.content.allowsUnknownElements,
      defaultPlan: root.content.defaultPlan,
      max: root.content.max,
      min: root.content.min,
      name,
    })),
    unknown: unknownPolicy,
  };
  const fingerprint = `fnv1a64:${hashSchemaIdentityString(
    stableStringify(canonicalModel)
  )}`;
  const vocabulary = Object.freeze({
    elementTypes: Object.freeze(sortedStrings(elementTypes)),
    groupNames: Object.freeze(sortedStrings(groupParents.keys())),
    propertyIds: Object.freeze(compiledProperties.map(({ id }) => id)),
    rootNames: Object.freeze(sortedStrings(rootNames)),
  });
  const frozenGroups = freezeSetMap(mutableGroups);
  const elements = Object.freeze({
    allowedChildren: freezeMap(allowedChildren),
    allowedParents: freezeSetMap(allowedParents),
    byType: freezeMap(compiledElements),
    contentPrograms: freezeMap(frozenPrograms),
    defaultPlans: freezeMap(defaultPlans),
    groups: frozenGroups,
    textGroups: freezeSet(textGroups),
    wrapperPlans: freezeMap(wrapperPlans),
  });

  return Object.freeze({
    diagnostics: Object.freeze([]),
    elements,
    identity: derived
      ? Object.freeze({ fingerprint, kind: 'derived' })
      : Object.freeze({
          fingerprint,
          id: definition.id,
          kind: 'named',
          version: definition.version,
        }),
    primaryRoot: Object.freeze({
      content: frozenPrograms.get('root')!,
      name: null,
    }),
    properties: Object.freeze({
      byId: freezeMap(byId),
      elementAllowedByType: freezeSetMap(propertyIdsByElement),
      lifecycle: freezeMap(lifecycle),
      lookup: Object.freeze({ element: elementLookup, text: textLookup }),
      mergeStrategies: freezeMap(mergeStrategies),
      textAllowedByParentType: freezeSetMap(textIdsByParent),
    }),
    revision,
    roots: freezeMap(roots),
    unknown: unknownPolicy,
    vocabulary,
  });
};

export const compileEditorSchemaContributions = (
  records: readonly EditorSchemaContributionRecord[],
  options: Readonly<{ revision?: number }> = {}
): CompiledEditorSchema =>
  profileCoreDuration('schema-compile', () =>
    compileEditorSchemaInternal(records, options.revision ?? 0)
  );

type RuntimePropertyDescriptor = Readonly<{
  descriptor: PropertyValueDescriptor;
  source: Source<SchemaProperty | PropertyValueDescriptor>;
}>;

const collectRuntimePropertyDescriptors = (
  records: readonly EditorSchemaContributionRecord[]
) => {
  const descriptors = new Map<string, RuntimePropertyDescriptor>();

  for (const record of records) {
    for (const [type, element] of Object.entries(
      record.contribution.elements ?? {}
    )) {
      for (const [key, descriptor] of Object.entries(
        element.properties ?? {}
      )) {
        descriptors.set(
          getCompiledSchemaPropertyId({
            key,
            placement: 'element',
            target: Object.freeze({ kind: 'type', type }),
          }),
          Object.freeze({
            descriptor,
            source: {
              extensionName: record.extensionName,
              path: `elements.${type}.properties.${key}`,
              value: descriptor,
            },
          })
        );
      }
    }
    for (const [index, property] of (
      record.contribution.properties ?? []
    ).entries()) {
      descriptors.set(
        getCompiledSchemaPropertyId({
          key: property.key,
          placement: property.placement,
          target: property.target ?? null,
        }),
        Object.freeze({
          descriptor: property.value,
          source: {
            extensionName: record.extensionName,
            path: `properties.${index}`,
            value: property,
          },
        })
      );
    }
  }

  return descriptors;
};

type RuntimeComparablePropertyDescriptor =
  | PropertyValueDescriptor
  | StructuralPropertyValueDescriptor;

const getRuntimeValidationBinding = (
  descriptor: RuntimeComparablePropertyDescriptor
) => {
  const validate = Reflect.get(descriptor, 'validate');

  return typeof validate === 'function' ? validate : null;
};

const haveEquivalentRuntimeValidationBindings = (
  left: RuntimeComparablePropertyDescriptor,
  right: RuntimeComparablePropertyDescriptor
): boolean => {
  if (
    getRuntimeValidationBinding(left) !== getRuntimeValidationBinding(right)
  ) {
    return false;
  }
  if (left.kind !== 'set' || right.kind !== 'set') {
    return left.kind === right.kind;
  }

  const leftItem = (
    left as RuntimeComparablePropertyDescriptor & {
      item?: RuntimeComparablePropertyDescriptor;
    }
  ).item;
  const rightItem = (
    right as RuntimeComparablePropertyDescriptor & {
      item?: RuntimeComparablePropertyDescriptor;
    }
  ).item;

  return Boolean(
    leftItem &&
      rightItem &&
      haveEquivalentRuntimeValidationBindings(leftItem, rightItem)
  );
};

/** @internal Compare only live validators; declaration keys own structure. */
export const haveEquivalentEditorSchemaRuntimeValidationBindings = (
  leftRecords: readonly EditorSchemaContributionRecord[],
  rightRecords: readonly EditorSchemaContributionRecord[]
) => {
  const left = collectRuntimePropertyDescriptors(leftRecords);
  const right = collectRuntimePropertyDescriptors(rightRecords);

  return (
    left.size === right.size &&
    [...left].every(([id, property]) => {
      const candidate = right.get(id);

      return Boolean(
        candidate &&
          haveEquivalentRuntimeValidationBindings(
            property.descriptor,
            candidate.descriptor
          )
      );
    })
  );
};

const replaceCompiledPropertyDescriptors = (
  schema: CompiledEditorSchema | StructuralCompiledEditorSchema,
  descriptors: ReadonlyMap<string, PropertyValueDescriptor>,
  revision: number
): CompiledEditorSchema => {
  const byId = new Map<string, CompiledSchemaProperty>();

  for (const [id, property] of schema.properties.byId) {
    const descriptor = descriptors.get(id);

    if (!descriptor) {
      throw new Error(`Missing runtime schema property descriptor "${id}".`);
    }
    byId.set(id, Object.freeze({ ...property, descriptor }));
  }

  const compiled: CompiledEditorSchema = Object.freeze({
    ...schema,
    properties: Object.freeze({
      ...schema.properties,
      byId: freezeMap(byId),
    }),
    revision,
  });

  return compiled;
};

const toStructuralPropertyDescriptor = (
  descriptor: PropertyValueDescriptor
): StructuralPropertyValueDescriptor => {
  const item =
    descriptor.kind === 'set'
      ? toStructuralPropertyDescriptor(
          (
            descriptor as PropertyValueDescriptor & {
              item: PropertyValueDescriptor;
            }
          ).item
        )
      : null;
  return Object.freeze({
    ...(Object.hasOwn(descriptor, 'default')
      ? { default: descriptor.default }
      : {}),
    ...(item ? { item } : {}),
    kind: descriptor.kind,
    omitDefault: descriptor.omitDefault,
    significant: descriptor.significant ?? true,
    ...(descriptor.validationVersion
      ? { validationVersion: descriptor.validationVersion }
      : {}),
  });
};

/** @internal Cache only structural schema data, never live validator closures. */
export const stripCompiledEditorSchemaRuntimeValidations = (
  schema: CompiledEditorSchema
): StructuralCompiledEditorSchema => {
  const byId = new Map<string, StructuralCompiledSchemaProperty>();

  for (const [id, property] of schema.properties.byId) {
    byId.set(
      id,
      Object.freeze({
        ...property,
        descriptor: toStructuralPropertyDescriptor(property.descriptor),
      })
    );
  }

  return Object.freeze({
    ...schema,
    properties: Object.freeze({
      ...schema.properties,
      byId: freezeMap(byId),
    }),
  });
};

/** @internal Bind one reused structural schema to the current configuration. */
export const rebindCompiledEditorSchemaRuntimeValidations = (
  schema: CompiledEditorSchema | StructuralCompiledEditorSchema,
  records: readonly EditorSchemaContributionRecord[],
  revision: number
): CompiledEditorSchema => {
  const current = collectRuntimePropertyDescriptors(records);

  if (
    schema.revision === revision &&
    schema.properties.byId.size === current.size &&
    [...schema.properties.byId].every(([id, property]) => {
      const runtime = current.get(id);

      return Boolean(
        runtime &&
          haveEquivalentRuntimeValidationBindings(
            property.descriptor,
            runtime.descriptor
          )
      );
    })
  ) {
    return schema as CompiledEditorSchema;
  }

  const descriptors = new Map<string, PropertyValueDescriptor>();

  for (const id of schema.properties.byId.keys()) {
    const runtime = current.get(id);

    if (!runtime) {
      throw new Error(`Missing current schema property descriptor "${id}".`);
    }
    descriptors.set(
      id,
      clonePropertyDescriptor(runtime.descriptor, runtime.source)
    );
  }

  return replaceCompiledPropertyDescriptors(schema, descriptors, revision);
};

const canonicalCompiledContent = (
  content: CompiledSchemaContentProgram | null
) =>
  content
    ? {
        allowedElementTypes: sortedStrings(content.allowedElementTypes),
        allowsText: content.allowsText,
        allowsUnknownElements: content.allowsUnknownElements,
        defaultPlan: content.defaultPlan,
        max: content.max,
        min: content.min,
      }
    : null;

const canonicalCompiledElement = (element: CompiledSchemaElement | null) =>
  element
    ? {
        behavior: element.behavior,
        content: canonicalCompiledContent(element.content),
        contentRoots: [...element.contentRoots].map(([slot, root]) => ({
          content: canonicalCompiledContent(root.content),
          ownership: root.ownership,
          slot,
        })),
        groups: sortedStrings(element.groups),
        propertyIds: sortedStrings(element.propertyIds),
        slice: element.slice,
      }
    : null;

const canonicalCompiledConstruction = (
  element: CompiledSchemaElement | null
) =>
  element
    ? {
        content: canonicalCompiledContent(element.content),
        contentRoots: [...element.contentRoots].map(([slot, root]) => ({
          content: canonicalCompiledContent(root.content),
          ownership: root.ownership,
          slot,
        })),
        defaultPropertyIds: sortedStrings(
          element.construction.defaultPropertyIds
        ),
        propertyIds: sortedStrings(element.construction.propertyIds),
      }
    : null;

const canonicalCompiledProperty = (property: CompiledSchemaProperty | null) =>
  property
    ? {
        descriptor: canonicalDescriptor(property.descriptor),
        key: property.key,
        lifecycle: property.lifecycle,
        merge: property.merge,
        placement: property.placement,
        target: canonicalTarget(property.target),
      }
    : null;

const canonicalCompiledPropertyConstruction = (
  property: CompiledSchemaProperty | null
) =>
  property &&
  property.placement === 'element' &&
  Object.hasOwn(property.descriptor, 'default')
    ? {
        default: canonicalJson(property.descriptor.default),
        omitDefault: property.descriptor.omitDefault,
      }
    : null;

const getPropertyAffectedElementTypes = (
  schema: CompiledEditorSchema | null,
  propertyIds: readonly string[],
  placement?: CompiledSchemaProperty['placement']
) => {
  if (!schema || propertyIds.length === 0) return [];
  const affected = new Set<string>();

  for (const propertyId of propertyIds) {
    const property = schema.properties.byId.get(propertyId);

    if (!property || (placement && property.placement !== placement)) continue;
    const allowedByType =
      property.placement === 'element'
        ? schema.properties.elementAllowedByType
        : schema.properties.textAllowedByParentType;

    for (const [type, allowedPropertyIds] of allowedByType) {
      if (allowedPropertyIds.has(propertyId)) affected.add(type);
    }
  }

  return [...affected];
};

const canonicalCompiledRoot = (root: CompiledSchemaRoot | null) =>
  root ? canonicalCompiledContent(root.content) : null;

const changedKeys = <TKey extends string | null>(
  keys: Iterable<TKey>,
  changed: (key: TKey) => boolean
) => [...new Set(keys)].filter(changed);

/** Compare two compiled publications without treating live validators as data. */
export const createCompiledEditorSchemaDelta = (
  previous: CompiledEditorSchema | null,
  next: CompiledEditorSchema | null
): EditorSchemaDelta | null => {
  if (previous === next) return null;
  const elementTypes = sortedStrings([
    ...(previous?.elements.byType.keys() ?? []),
    ...(next?.elements.byType.keys() ?? []),
  ]);
  const propertyIds = sortedStrings([
    ...(previous?.properties.byId.keys() ?? []),
    ...(next?.properties.byId.keys() ?? []),
  ]);
  const rootNames = sortedStrings([
    ...(previous?.roots.keys() ?? []),
    ...(next?.roots.keys() ?? []),
  ]);
  const unknownPolicyChanged = previous?.unknown !== next?.unknown;
  const changedPropertyIds = unknownPolicyChanged
    ? propertyIds
    : changedKeys(
        propertyIds,
        (id) =>
          stableStringify(
            canonicalCompiledProperty(previous?.properties.byId.get(id) ?? null)
          ) !==
          stableStringify(
            canonicalCompiledProperty(next?.properties.byId.get(id) ?? null)
          )
      );
  const directChangedElementTypes = unknownPolicyChanged
    ? elementTypes
    : changedKeys(
        elementTypes,
        (type) =>
          !Object.is(
            stableStringify(
              canonicalCompiledElement(
                previous?.elements.byType.get(type) ?? null
              )
            ),
            stableStringify(
              canonicalCompiledElement(next?.elements.byType.get(type) ?? null)
            )
          )
      );
  const changedElementTypes = sortedStrings([
    ...directChangedElementTypes,
    ...getPropertyAffectedElementTypes(previous, changedPropertyIds),
    ...getPropertyAffectedElementTypes(next, changedPropertyIds),
  ]);
  const constructionPropertyIds = changedPropertyIds.filter(
    (id) =>
      stableStringify(
        canonicalCompiledPropertyConstruction(
          previous?.properties.byId.get(id) ?? null
        )
      ) !==
      stableStringify(
        canonicalCompiledPropertyConstruction(
          next?.properties.byId.get(id) ?? null
        )
      )
  );
  const directChangedConstructionTypes = unknownPolicyChanged
    ? elementTypes
    : changedKeys(
        elementTypes,
        (type) =>
          stableStringify(
            canonicalCompiledConstruction(
              previous?.elements.byType.get(type) ?? null
            )
          ) !==
          stableStringify(
            canonicalCompiledConstruction(
              next?.elements.byType.get(type) ?? null
            )
          )
      );
  const changedConstructionTypes = sortedStrings([
    ...directChangedConstructionTypes,
    ...getPropertyAffectedElementTypes(
      previous,
      constructionPropertyIds,
      'element'
    ),
    ...getPropertyAffectedElementTypes(
      next,
      constructionPropertyIds,
      'element'
    ),
  ]);
  const roots: (string | null)[] = [null, ...rootNames];
  const changedRoots = unknownPolicyChanged
    ? roots
    : changedKeys(roots, (name) => {
        const previousRoot = name
          ? (previous?.roots.get(name) ?? null)
          : (previous?.primaryRoot ?? null);
        const nextRoot = name
          ? (next?.roots.get(name) ?? null)
          : (next?.primaryRoot ?? null);

        return (
          stableStringify(canonicalCompiledRoot(previousRoot)) !==
          stableStringify(canonicalCompiledRoot(nextRoot))
        );
      });

  if (
    changedElementTypes.length === 0 &&
    changedConstructionTypes.length === 0 &&
    changedPropertyIds.length === 0 &&
    changedRoots.length === 0
  ) {
    return null;
  }

  return Object.freeze({
    constructionTypes: Object.freeze(changedConstructionTypes),
    elementTypes: Object.freeze(changedElementTypes),
    propertyIds: Object.freeze(changedPropertyIds),
    roots: Object.freeze(changedRoots),
  });
};
