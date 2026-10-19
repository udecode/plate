import type {
  EditorElementBehavior,
  EditorStateSchemaApi,
} from '../interfaces/editor';
import { type Element, ElementApi } from '../interfaces/element';
import { type Node, NodeApi, type NodeEntry } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { type Range, RangeApi } from '../interfaces/range';

export const isEmptyElement = (
  element: Element,
  behavior: EditorElementBehavior
): boolean =>
  !behavior.void &&
  !behavior.atom &&
  !behavior.object &&
  element.children.every((child) => NodeApi.isText(child) && child.text === '');

export const getReplaceableEmptyBlock = (
  range: Range,
  getNode: (path: Path) => Node | null | undefined,
  schema: Pick<
    EditorStateSchemaApi,
    'getElementBehavior' | 'getElementContentRoots' | 'getElementSlicePolicy'
  >
): NodeEntry<Element> | null => {
  if (!RangeApi.isCollapsed(range)) return null;
  const path = range.anchor.path.slice(0, -1);
  const block = getNode(path);

  if (!ElementApi.isElement(block)) return null;
  const behavior = schema.getElementBehavior(block);

  return !behavior.inline &&
    isEmptyElement(block, behavior) &&
    Object.keys(schema.getElementContentRoots(block)).length === 0 &&
    !schema.getElementSlicePolicy(block).preserveContext
    ? [block, path]
    : null;
};
