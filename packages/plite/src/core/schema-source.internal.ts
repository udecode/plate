import type { EditorSchemaDeclaration } from '../interfaces/schema';

declare const EDITOR_SCHEMA_SOURCE: unique symbol;

/** @internal Exact schema declaration witness carried by host descriptors. */
export interface EditorSchemaSourceProvider<
  TDeclaration extends EditorSchemaDeclaration = EditorSchemaDeclaration,
> {
  readonly [EDITOR_SCHEMA_SOURCE]: TDeclaration;
}

/** @internal Descriptor shape accepted by schema inference utilities. */
export type EditorSchemaSource =
  | EditorSchemaSourceProvider
  | Readonly<{
      schema:
        | EditorSchemaDeclaration
        | ((...args: any[]) => EditorSchemaDeclaration);
    }>;
