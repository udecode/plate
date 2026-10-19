import type { AnyEditor as Editor } from '../interfaces/editor';
import { getChildren as editorGetChildren } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { type Descendant, NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { admitsEmptyText } from './content-completion';
import { getEditorSchema } from './editor-runtime';
import type { InternalEditorSchemaApi } from './editor-schema';
import { getCompiledEditorSchemaFromApi } from './editor-schema';

export const isNonEditable = (schema: InternalEditorSchemaApi, node: Element) =>
  schema.isVoid(node) || schema.isAtom(node) || schema.isReadOnly(node);

export const isEditablePath = (editor: Editor, path: Path) => {
  const schema = getEditorSchema(editor);
  let children: readonly Descendant[] = editorGetChildren(editor);

  for (const index of path) {
    const node = children[index];

    if (!NodeApi.isElement(node)) return true;
    if (isNonEditable(schema, node)) return false;
    ({ children } = node);
  }

  return true;
};

export const isWritablePoint = (editor: Editor, point: Point) =>
  NodeApi.isText(NodeApi.get(editor, point.path)) &&
  isEditablePath(editor, point.path);

export const canReplaceChildrenWithText = (
  schema: InternalEditorSchemaApi,
  node: unknown
): node is Element => {
  if (!NodeApi.isElement(node) || isNonEditable(schema, node)) return false;

  const content = getCompiledEditorSchemaFromApi(schema)?.elements.byType.get(
    node.type
  )?.content;

  return (
    schema.canContainAt(node, { text: '' }, 0) &&
    (!content || admitsEmptyText(content))
  );
};

const hasText = (node: Descendant): boolean =>
  NodeApi.isText(node) || node.children.some(hasText);

export const holdsWritableText = (
  schema: InternalEditorSchemaApi,
  node: Descendant
): boolean => {
  if (NodeApi.isText(node)) return true;
  if (isNonEditable(schema, node)) return false;

  const first = node.children.find(hasText);

  return !!first && holdsWritableText(schema, first);
};
