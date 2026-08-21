import type {
  EditorSchemaOverrideInput,
  SchemaProperty,
  SchemaPropertyDefinition,
} from '@platejs/plite';

export type EditorSchemaIdentity = Readonly<{
  id: string;
  version: number;
}>;

type EditorSchemaLineage =
  | EditorSchemaIdentity
  | Readonly<{
      id?: never;
      version?: never;
    }>;

/** Application-owned schema policy and optional persisted lineage. */
export type EditorApplicationSchema = Readonly<{
  overrides?: readonly EditorSchemaOverrideInput[];
  properties?: Readonly<
    Record<string, SchemaProperty | SchemaPropertyDefinition>
  >;
}> &
  EditorSchemaLineage;

/**
 * Extract schema lineage only when the application declares it.
 *
 * @internal
 */
export const getEditorSchemaIdentity = (
  schema: EditorApplicationSchema | undefined
): EditorSchemaIdentity | undefined => {
  if (schema?.id === undefined) {
    if (schema?.version !== undefined) {
      throw new TypeError(
        'Editor schema lineage requires both id and version.'
      );
    }

    return;
  }
  if (
    typeof schema.id !== 'string' ||
    schema.id.length === 0 ||
    typeof schema.version !== 'number'
  ) {
    throw new TypeError('Editor schema lineage requires both id and version.');
  }

  return Object.freeze({ id: schema.id, version: schema.version });
};
