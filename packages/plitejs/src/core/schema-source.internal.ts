import type { EditorSchemaDeclaration } from '../interfaces/schema';

declare const EDITOR_SCHEMA_SOURCE: unique symbol;

/**
 * Exact schema declaration witness carried by host descriptors.
 *
 * @internal
 */
export interface EditorSchemaSourceProvider<
  TDeclaration extends EditorSchemaDeclaration = EditorSchemaDeclaration,
> {
  readonly [EDITOR_SCHEMA_SOURCE]: TDeclaration;
}

/**
 * Descriptor shape accepted by schema inference utilities.
 *
 * @internal
 */
export type EditorSchemaSource =
  | EditorSchemaSourceProvider
  | Readonly<{
      schema:
        | EditorSchemaDeclaration
        | ((...args: any[]) => EditorSchemaDeclaration);
    }>;
