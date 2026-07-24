import type {
  EditorSchemaDeclaration,
  EditorSchemaDelta,
} from '../interfaces/schema';
import {
  compileEditorSchemaContributions,
  type CompiledEditorSchema,
  createCompiledEditorSchemaDelta,
  type EditorSchemaContributionRecord,
  getEditorSchemaDeclarationKey,
  rebindCompiledEditorSchemaRuntimeValidations,
  stripCompiledEditorSchemaRuntimeValidations,
  type StructuralCompiledEditorSchema,
} from './schema-compiler';

export type EditorSchemaContributionRegistration =
  EditorSchemaContributionRecord;

export type EditorSchemaContributionRegistry = {
  compiled: CompiledEditorSchema;
  declarationKey: string | null;
  delta: EditorSchemaDelta | null;
  records: Map<string, EditorSchemaContributionRegistration>;
};

const COMPILED_SCHEMA_CACHE_LIMIT = 64;
const COMPILED_SCHEMA_CACHE = new Map<string, StructuralCompiledEditorSchema>();

const getCachedSchema = (key: string) => {
  const compiled = COMPILED_SCHEMA_CACHE.get(key);

  if (compiled) {
    COMPILED_SCHEMA_CACHE.delete(key);
    COMPILED_SCHEMA_CACHE.set(key, compiled);
  }

  return compiled ?? null;
};

const cacheSchema = (key: string, compiled: CompiledEditorSchema) => {
  COMPILED_SCHEMA_CACHE.delete(key);
  COMPILED_SCHEMA_CACHE.set(
    key,
    stripCompiledEditorSchemaRuntimeValidations(compiled)
  );

  while (COMPILED_SCHEMA_CACHE.size > COMPILED_SCHEMA_CACHE_LIMIT) {
    const oldest = COMPILED_SCHEMA_CACHE.keys().next().value;

    if (oldest === undefined) break;
    COMPILED_SCHEMA_CACHE.delete(oldest);
  }
};

const EMPTY_SCHEMA_DECLARATION_KEY = getEditorSchemaDeclarationKey([]);

const getDerivedBaseSchema = (revision: number) => {
  const cached = getCachedSchema(EMPTY_SCHEMA_DECLARATION_KEY);
  const compiled = cached
    ? rebindCompiledEditorSchemaRuntimeValidations(cached, [], revision)
    : compileEditorSchemaContributions([], { revision });

  if (!cached) cacheSchema(EMPTY_SCHEMA_DECLARATION_KEY, compiled);

  return compiled;
};

const immutableRegistryMutation = () => {
  throw new Error('Published schema contribution registries are immutable.');
};

const freezeMap = <TKey, TValue>(source: ReadonlyMap<TKey, TValue>) => {
  const map = new Map(source);
  let immutable!: Map<TKey, TValue>;

  immutable = new Proxy(map, {
    get(target, property) {
      if (property === 'clear' || property === 'delete' || property === 'set') {
        return immutableRegistryMutation;
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

export const createSchemaContributionRegistry = (
  revision = 0
): EditorSchemaContributionRegistry => ({
  compiled: getDerivedBaseSchema(revision),
  declarationKey: EMPTY_SCHEMA_DECLARATION_KEY,
  delta: null,
  records: new Map(),
});

export const finalizeSchemaContributionRegistry = (
  registry: EditorSchemaContributionRegistry
): EditorSchemaContributionRegistry =>
  Object.freeze({
    compiled: registry.compiled,
    declarationKey: registry.declarationKey,
    delta: registry.delta,
    records: freezeMap(registry.records) as Map<
      string,
      EditorSchemaContributionRegistration
    >,
  });

export const registerSchemaContribution = (
  registry: EditorSchemaContributionRegistry,
  extensionName: string,
  contribution: EditorSchemaDeclaration
) => {
  if (registry.records.has(extensionName)) {
    throw new Error(
      `Editor extension "${extensionName}" cannot register schema twice.`
    );
  }

  const registration = Object.freeze({
    contribution,
    extensionName,
  });

  registry.records.set(extensionName, registration);

  return () => {
    if (registry.records.get(extensionName) === registration) {
      registry.records.delete(extensionName);
    }
  };
};

export const mergeSchemaContributionRegistries = (
  configured: EditorSchemaContributionRegistry,
  base: EditorSchemaContributionRegistry,
  revision: number,
  previous: EditorSchemaContributionRegistry | null = null
): EditorSchemaContributionRegistry => {
  const records = new Map<string, EditorSchemaContributionRegistration>();

  for (const registration of [
    ...configured.records.values(),
    ...base.records.values(),
  ]) {
    const known = records.get(registration.extensionName);

    if (known) {
      throw new Error(
        `Configured schema contribution from "${registration.extensionName}" conflicts with a built-in contribution.`
      );
    }
    records.set(registration.extensionName, registration);
  }

  const declarationKey = getEditorSchemaDeclarationKey([...records.values()]);
  const reusable =
    previous?.declarationKey === declarationKey
      ? previous.compiled
      : getCachedSchema(declarationKey);
  const compiled = reusable
    ? rebindCompiledEditorSchemaRuntimeValidations(
        reusable,
        [...records.values()],
        revision
      )
    : compileEditorSchemaContributions([...records.values()], { revision });

  cacheSchema(declarationKey, compiled);
  const delta = createCompiledEditorSchemaDelta(
    previous?.compiled ?? null,
    compiled
  );

  return finalizeSchemaContributionRegistry({
    compiled,
    declarationKey,
    delta,
    records,
  });
};
