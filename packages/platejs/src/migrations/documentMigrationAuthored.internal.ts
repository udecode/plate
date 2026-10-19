import type { NativeAuthoredDocumentCapability } from '../facade';

const authoredCapabilities = new WeakMap<
  object,
  NativeAuthoredDocumentCapability
>();

export const registerDocumentMigrationAuthoredCapability = (
  target: object,
  capability: NativeAuthoredDocumentCapability
) => {
  authoredCapabilities.set(target, capability);
};

export const getDocumentMigrationAuthoredCapability = (
  target: object
): NativeAuthoredDocumentCapability => {
  const capability = authoredCapabilities.get(target);

  if (!capability) {
    throw new Error(
      'Persisted authored metadata requires the authored plugin in the migration target.'
    );
  }

  return capability;
};
