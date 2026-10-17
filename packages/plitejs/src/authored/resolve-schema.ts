import type { JsonNode } from '../core/change/tokens';
import { getEditorSchema } from '../core/editor-runtime';
import { completeChildrenAt } from '../core/representation';
import type { AnyEditor as Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import type { AuthoredResolveSchema } from './tree/resolve';

// One resolve schema per editor and compiled schema, so readers that cache
// resolved content can key on it.
const RESOLVE_SCHEMAS = new WeakMap<
  object,
  Readonly<{ resolve: AuthoredResolveSchema; schema: object }>
>();

export const authoredResolveSchemaOf = (
  editor: Editor
): AuthoredResolveSchema => {
  const schema = getEditorSchema(editor);
  const cached = RESOLVE_SCHEMAS.get(editor);

  if (cached?.schema === schema) return cached.resolve;

  const resolve: AuthoredResolveSchema = {
    canonicalizeTextProperties: (props, path, root, key) =>
      schema.canonicalizeTextPropertiesAt(props, [...path], root, key),
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
            min: content.min,
            prefix: content.prefix?.length ?? 0,
          }
        : null;
    },
  };

  RESOLVE_SCHEMAS.set(editor, { resolve, schema });

  return resolve;
};
