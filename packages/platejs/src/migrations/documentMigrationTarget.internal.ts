import type { CompiledEditorSchema } from '../facade';
import { failInvariant } from '../internal/failInvariant';
import type { CompiledModelBinding } from '../internal/plugin/compilePlateModel';
import { getPluginSchemaFamily } from '../internal/utils/mergePlugins';

const migrationBindings = new WeakMap<
  object,
  ReadonlyMap<object, CompiledModelBinding>
>();
const migrationSchemas = new WeakMap<object, CompiledEditorSchema>();

export const registerMigrationBindings = (
  target: object,
  modelBindings: readonly CompiledModelBinding[],
  schema: CompiledEditorSchema
) => {
  const bindings = new Map<object, CompiledModelBinding>();

  for (const binding of modelBindings) {
    if (binding.family) bindings.set(binding.family, binding);
  }
  migrationBindings.set(target, bindings);
  migrationSchemas.set(target, schema);
};

export const isDeclaredMigrationTextProperty = (
  target: object,
  key: string
): boolean => {
  const schema = migrationSchemas.get(target);

  if (!schema) {
    throw new Error(
      'A document migration requires the migration target from defineDocumentMigrations.'
    );
  }

  const { exact, prefixes } = schema.properties.lookup.text;

  return (
    exact.has(key) || prefixes.some(({ prefix }) => key.startsWith(prefix))
  );
};

export const getMigrationBinding = (
  target: object,
  plugin: Readonly<{ name: string }>
) => {
  const bindings = migrationBindings.get(target);

  if (!bindings) {
    throw new Error(
      'A document migration requires the migration target from defineDocumentMigrations.'
    );
  }

  const family =
    getPluginSchemaFamily(plugin) ??
    failInvariant(`${plugin.name} is not a plugin descriptor`);

  return bindings.get(family);
};
