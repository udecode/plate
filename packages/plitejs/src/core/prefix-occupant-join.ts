import { node as getNode } from '../editor/node';
import { NodeApi, PathApi, TextApi } from '../interfaces';
import {
  type AnyEditor as Editor,
  isBlock as editorIsBlock,
  isEmpty as editorIsEmpty,
} from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant, NodeEntry } from '../interfaces/node';
import type { Text } from '../interfaces/text';
import { authoredDocumentCapabilityPoint } from './authored-document-capability';
import {
  childAtPathIndex,
  NO_NODES,
  type NodeList,
  rootNodesOf,
} from './change/document-index';
import { getEditorRuntimeOwner, getEditorSchema } from './editor-runtime';
import { getPluginContributions } from './plugin-registry';
import {
  getActiveUpdateRoot,
  getChildList,
  getUpdateStartSnapshot,
} from './public-state';
import { EditorSchemaValidationError } from './schema-validation';

/**
 * An occupant the update moved into its slot, replaced or edited is not one
 * completion keeps there, so a join must not fill it. A nested command's
 * snapshot does not count, because the update's last completion compares
 * against the update's start.
 */
const heldSlotAtUpdateStart = (
  editor: Editor,
  root: string,
  [occupant, path]: NodeEntry<Element>
) => {
  const roots = getUpdateStartSnapshot(editor)?.roots;

  if (!roots) return true;

  let siblings: NodeList<Descendant> = rootNodesOf(roots, root);
  let held: Descendant | undefined;

  for (const index of path) {
    held = childAtPathIndex(siblings, index);
    siblings = NodeApi.isElement(held) ? held.children : NO_NODES;
  }

  return held === undefined || held === occupant;
};

const holdsOccupantText = (occupant: Element, joined: Element) =>
  joined.children.every((text) =>
    occupant.children.every((own) =>
      TextApi.equals(text as Text, own as Text, { loose: true })
    )
  );

/**
 * True only when the join fits without building any block: the parent keeps
 * its minimum without the joined block, and the occupant takes the joined
 * children as they are.
 */
export const joinKeepsPrefixOccupant = (
  editor: Editor,
  [occupant, path]: NodeEntry,
  [joined, joinedPath]: NodeEntry
) => {
  const slot = path.at(-1);

  if (
    slot === undefined ||
    !PathApi.equals(joinedPath, PathApi.next(path)) ||
    !NodeApi.isElement(occupant) ||
    !NodeApi.isElement(joined) ||
    !editorIsEmpty(editor, occupant) ||
    getPluginContributions(
      getEditorRuntimeOwner(editor),
      authoredDocumentCapabilityPoint
    ).length > 0
  ) {
    return false;
  }

  const schema = getEditorSchema(editor);
  const root = getActiveUpdateRoot(editor) ?? 'main';
  const parent =
    path.length > 1
      ? (getNode(editor, PathApi.parent(path))[0] as Element)
      : null;
  const content = parent
    ? schema.getElementContent(String(parent.type))
    : schema.getRootContent(root);

  if (
    !content?.prefix ||
    slot >= content.prefix.length ||
    !heldSlotAtUpdateStart(editor, root, [occupant, path])
  ) {
    return false;
  }

  const siblings = parent
    ? parent.children.length
    : getChildList(editor).length;
  const { children } = joined;

  if (
    [occupant, joined].some(
      (element) =>
        schema.isAtom(element) ||
        schema.isVoid(element) ||
        schema.isReadOnly(element)
    ) ||
    schema.getElementOwnedRoots(joined).length > 0 ||
    children.some(
      (child) => NodeApi.isElement(child) && editorIsBlock(editor, child)
    ) ||
    (editorIsEmpty(editor, joined) && !holdsOccupantText(occupant, joined)) ||
    siblings - 1 < (content.min ?? 0) ||
    !schema.canPlaceAt(occupant, [], children, 0, { root }) ||
    !schema.canPlaceAtPath(joinedPath, [], { removing: [slot + 1], root })
  ) {
    return false;
  }

  const ancestors: Element[] = [];

  for (let depth = path.length - 1; depth > 0; depth--) {
    ancestors.push(getNode(editor, path.slice(0, depth))[0] as Element);
  }

  try {
    schema.validateChildrenAt(children, root, [occupant, ...ancestors]);

    return true;
  } catch (error) {
    if (error instanceof EditorSchemaValidationError) return false;

    throw error;
  }
};
