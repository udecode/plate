import type {
  CompiledEditorSchema,
  EditorDocumentValue,
  NativeAuthoredDocumentCapability,
} from '../facade';

/** The authored capability of a migration target, bound to its schema. */
export type DocumentMigrationAuthored = Readonly<{
  pending: (document: EditorDocumentValue) => number;
  projectDecided: (
    document: EditorDocumentValue,
    projection: 'accepted' | 'proposed'
  ) => ReturnType<NativeAuthoredDocumentCapability['projectDecided']>;
  repair: (document: EditorDocumentValue) => EditorDocumentValue;
}>;

const authoredCapabilities = new WeakMap<object, DocumentMigrationAuthored>();

export const registerDocumentMigrationAuthoredCapability = (
  target: object,
  capability: NativeAuthoredDocumentCapability,
  schema: CompiledEditorSchema
) => {
  authoredCapabilities.set(
    target,
    Object.freeze({
      pending: capability.pending,
      projectDecided: (document, projection) =>
        capability.projectDecided(document, projection, schema),
      repair: (document) => capability.repair(document, schema),
    })
  );
};

/** The target's authored capability, when it installs the authored plugin. */
export const findDocumentMigrationAuthoredCapability = (target: object) =>
  authoredCapabilities.get(target);

export const getDocumentMigrationAuthoredCapability = (
  target: object
): DocumentMigrationAuthored => {
  const capability = authoredCapabilities.get(target);

  if (!capability) {
    throw new Error(
      'Persisted authored metadata requires the authored plugin in the migration target.'
    );
  }

  return capability;
};
