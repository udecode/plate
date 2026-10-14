import type { JsonNode } from '../core/change/tokens';
import { getEditorSchema } from '../core/editor-runtime';
import { completeChildrenAt } from '../core/representation';
import type { AnyEditor as Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import type { AuthoredResolveSchema } from './tree/resolve';

export const authoredResolveSchemaOf = (
  editor: Editor
): AuthoredResolveSchema => {
  const schema = getEditorSchema(editor);

  return {
    complete: (children, site, root, vacated) => {
      const completion = completeChildrenAt(
        editor,
        site as readonly Element[],
        children as readonly Descendant[],
        root,
        vacated
      );

      return {
        built: completion.built.map(({ node, slot }) => ({
          node: node as JsonNode,
          slot,
        })),
        children: completion.children,
      };
    },
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
};
