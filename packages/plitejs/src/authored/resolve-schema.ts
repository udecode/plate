import type { JsonNode } from '../core/change/tokens';
import { getEditorSchema } from '../core/editor-runtime';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { completeChildrenAt } from '../core/representation';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import type { AnyEditor as Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import type { AuthoredResolveSchema } from './tree/resolve';

// One resolve schema per editor and compiled schema, so readers that cache
// resolved content can key on it.
const RESOLVE_SCHEMAS = new WeakMap<
  object,
  Readonly<{ resolve: AuthoredResolveSchema; schema: CompiledEditorSchema }>
>();
const OWNERSHIP_SCHEMAS = new WeakMap<
  CompiledEditorSchema,
  AuthoredResolveSchema
>();

export const ownershipResolveSchemaOf = (
  schema: CompiledEditorSchema
): AuthoredResolveSchema => {
  let resolve = OWNERSHIP_SCHEMAS.get(schema);

  if (!resolve) {
    resolve = { content: () => null, ownership: schema };
    OWNERSHIP_SCHEMAS.set(schema, resolve);
  }

  return resolve;
};

export const authoredResolveSchemaOf = (
  editor: Editor
): AuthoredResolveSchema => {
  const compiled = getCompiledEditorSchema(editor);
  const cached = RESOLVE_SCHEMAS.get(editor);

  if (cached?.schema === compiled) return cached.resolve;

  const schema = getEditorSchema(editor);
  const resolve: AuthoredResolveSchema = {
    canonicalizeTextProperties: (props, types, root, key) =>
      schema.canonicalizeTextPropertiesIn(props, types, root, key),
    complete: (children, site, root, vacated, part) => {
      const completion = completeChildrenAt(
        editor,
        site as readonly Element[],
        children as readonly Descendant[],
        root,
        vacated,
        part
      );

      return {
        built: completion.built.map(({ node, slot }) => ({
          node: node as JsonNode,
          slot,
        })),
        children: completion.children,
      };
    },
    fitsPrefix: (node, slot, root) =>
      schema.canContainAt(null, node as Descendant, slot, root),
    content: (type, root) => {
      const content =
        type === null
          ? schema.getRootContent(root)
          : schema.getElementContent(type);

      return content
        ? {
            allowsText: content.allowsText,
            max: content.max,
            min: content.min,
            prefix: content.prefix?.length ?? 0,
          }
        : null;
    },
    ownership: compiled,
  };

  RESOLVE_SCHEMAS.set(editor, { resolve, schema: compiled });

  return resolve;
};
