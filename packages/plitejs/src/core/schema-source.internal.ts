import type { EditorSchemaDeclaration } from '../interfaces/schema';

/**
 * Deferred exact schema declaration witness carried by host descriptors.
 *
 * @internal
 */
export interface EditorSchemaSourceProvider<
  TDeclarationFactory extends () => EditorSchemaDeclaration =
    () => EditorSchemaDeclaration,
> {
  readonly '~schema.source': TDeclarationFactory;
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
