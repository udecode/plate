import type { CompiledModelBinding } from '../internal/plugin/compilePlateModel';
import { getFirstPartyPluginName } from '../internal/plugin/firstPartyPlugin';
import type { DocumentMigrationTarget } from './documentMigrations';

type FirstPartyBinding = DocumentMigrationTarget['bindings'][number];

type FirstPartyTable = Readonly<{
  bindings: ReadonlyMap<string, FirstPartyBinding>;
  propertyOwners: ReadonlyMap<string, string>;
}>;

const firstPartyTables = new WeakMap<object, FirstPartyTable>();

export const registerDocumentMigrationFirstParty = (
  target: DocumentMigrationTarget,
  modelBindings: readonly CompiledModelBinding[]
) => {
  const bindings = new Map<string, FirstPartyBinding>();
  const propertyOwners = new Map<string, string>();

  modelBindings.forEach((binding, index) => {
    const builtInName = binding.family
      ? getFirstPartyPluginName(binding.family)
      : undefined;

    if (!builtInName) return;
    bindings.set(builtInName, target.bindings[index]);
    binding.propertyIds.forEach((id) => {
      propertyOwners.set(id, builtInName);
    });
  });
  firstPartyTables.set(target, { bindings, propertyOwners });
};

const getFirstPartyTable = (target: object) => {
  const table = firstPartyTables.get(target);

  if (!table) {
    throw new Error(
      'A document migration requires the migration target from defineDocumentMigrations.'
    );
  }

  return table;
};

export const getFirstPartyBinding = (target: object, builtInName: string) =>
  getFirstPartyTable(target).bindings.get(builtInName);

export const getFirstPartyType = (target: object, builtInName: string) =>
  getFirstPartyBinding(target, builtInName)?.type;

export const getFirstPartyPropertyOwner = (
  target: object,
  propertyId: string
) => getFirstPartyTable(target).propertyOwners.get(propertyId);
