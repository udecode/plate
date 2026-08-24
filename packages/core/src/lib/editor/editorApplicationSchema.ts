import type {
  EditorSchemaOverrideInput,
  SchemaContent,
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
  /**
   * Primary-root grammar with a positive integer minimum. Omit it for Plate's
   * standard paragraph root. Descriptor sources must match the installed
   * plugin family; the first source in `schema.content.elements` is default.
   */
  root?: SchemaContent & Readonly<{ min: number }>;
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

    return undefined;
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
