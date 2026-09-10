import type { EditorSchemaDeclaration } from '../interfaces/schema';

declare const EDITOR_SCHEMA_SOURCE: unique symbol;

/**
 * Deferred exact schema declaration witness carried by host descriptors.
 *
 * @internal
 */
export interface EditorSchemaSourceProvider<
  TDeclarationFactory extends () => EditorSchemaDeclaration =
    () => EditorSchemaDeclaration,
> {
  readonly [EDITOR_SCHEMA_SOURCE]: TDeclarationFactory;
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
