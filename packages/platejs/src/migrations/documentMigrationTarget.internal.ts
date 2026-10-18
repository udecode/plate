import { failInvariant } from '../internal/failInvariant';
import type { CompiledModelBinding } from '../internal/plugin/compilePlateModel';
import { getPluginSchemaFamily } from '../internal/utils/mergePlugins';

const migrationBindings = new WeakMap<
  object,
  ReadonlyMap<object, CompiledModelBinding>
>();

export const registerMigrationBindings = (
  target: object,
  modelBindings: readonly CompiledModelBinding[]
) => {
  const bindings = new Map<object, CompiledModelBinding>();

  for (const binding of modelBindings) {
    if (binding.family) bindings.set(binding.family, binding);
  }
  migrationBindings.set(target, bindings);
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
