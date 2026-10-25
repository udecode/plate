import type { JsonNode } from '../core/change/tokens';
import { getEditorSchema } from '../core/editor-runtime';
import {
  createDetachedEditorSchema,
  getRepresentationEditorFromApi,
  type InternalEditorSchemaApi,
} from '../core/editor-schema';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { completeChildrenAt } from '../core/representation';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import type {
  AnyEditor as Editor,
  EditorDocumentValue,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import type { AuthoredResolveSchema } from './tree/resolve';

// One resolve schema per editor and compiled schema, so readers that cache
// resolved content can key on it.
const RESOLVE_SCHEMAS = new WeakMap<
  object,
  Readonly<{ resolve: AuthoredResolveSchema; schema: CompiledEditorSchema }>
>();

const resolveSchemaOver = (
  editor: Editor,
  schema: InternalEditorSchemaApi,
  compiled: CompiledEditorSchema
): AuthoredResolveSchema => ({
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
      sources: completion.sources,
    };
  },
  fitsPrefix: (node, slot, root) =>
    schema.canContainAt(null, node as Descendant, slot, root),
  continuationType: (source, slot, site, root) => {
    const parent = (site[0] ?? null) as Element | null;
    const content = parent
      ? schema.getElementContent(String(parent.type))
      : schema.getRootContent(root);

    if (
      !content ||
      schema.canContainAt(parent, source as Descendant, slot, root)
    ) {
      return typeof source.type === 'string' ? source.type : null;
    }
    const plan = content.prefix?.[slot] ?? content.defaultPlan;

    return plan && 'type' in plan ? plan.type : null;
  },
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
});

export const authoredResolveSchemaOf = (
  editor: Editor
): AuthoredResolveSchema => {
  const compiled = getCompiledEditorSchema(editor);
  const cached = RESOLVE_SCHEMAS.get(editor);

  if (cached?.schema === compiled) return cached.resolve;

  const resolve = resolveSchemaOver(editor, getEditorSchema(editor), compiled);

  RESOLVE_SCHEMAS.set(editor, { resolve, schema: compiled });

  return resolve;
};

/**
 * Resolves `document` through `schema` alone, for a read with no live editor
 * of that schema, such as a detached export. Built nodes carry no node keys.
 */
export const storedResolveSchemaOf = (
  schema: CompiledEditorSchema,
  document: EditorDocumentValue
): AuthoredResolveSchema => {
  const detached = createDetachedEditorSchema(schema, document);

  return resolveSchemaOver(
    getRepresentationEditorFromApi(detached),
    detached,
    schema
  );
};
