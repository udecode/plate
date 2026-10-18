const pluginNames = new WeakMap<object, ReadonlyMap<string, string>>();

export const registerDocumentMigrationPluginNames = (
  target: object,
  pluginNameByPropertyId: ReadonlyMap<string, string>
) => {
  pluginNames.set(target, pluginNameByPropertyId);
};

export const getDocumentMigrationPluginName = (
  target: object,
  propertyId: string
) => {
  const names = pluginNames.get(target);

  if (!names) {
    throw new Error(
      'The Plate v54 migration requires the migration target from defineDocumentMigrations.'
    );
  }

  return names.get(propertyId);
};
