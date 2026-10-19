import {
  type Node,
  NodeApi,
  type Path,
  type Point,
  PointApi,
  type Range,
  RangeApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { getDefined } from '../internal/get-defined';
import {
  NO_NODES,
  type NodeList,
  childAtPathIndex,
} from './change/document-index';
import { hasEditorContent, isEditorContent } from './content';
import { getEditorSchema } from './editor-runtime';
import { survivalUnder } from './survival';

type Survives = (node: Node) => boolean;
type Enters = (element: Node) => boolean;
type Direction = 'backward' | 'forward';
type Edge = Point | 'blocked' | null;
type RootChildren = NodeList<Descendant>;

const contentSurvival = (editor: Editor): Survives =>
  survivalUnder<Node>((node) => !isEditorContent(editor, node)).survives;

/** @internal */
export const nodeAt = (document: RootChildren, path: Path) => {
  let children = document;
  let node: Descendant | undefined;

  for (const index of path) {
    node = childAtPathIndex(children, index);
    if (!node) return undefined;
    children = NodeApi.isText(node) ? NO_NODES : node.children;
  }

  return node;
};

const highestGone = (
  document: RootChildren,
  point: Point,
  survives: Survives
): Path | null => {
  for (let depth = 1; depth < point.path.length; depth += 1) {
    const path = point.path.slice(0, depth);
    const node = nodeAt(document, path);

    if (node && !survives(node)) return path;
  }

  return null;
};

const survivingEdge = (
  path: Path,
  node: Node,
  backward: boolean,
  survives: Survives,
  enters: Enters
): Edge => {
  if (NodeApi.isText(node)) {
    return { offset: backward ? node.text.length : 0, path };
  }
  if (!NodeApi.isElement(node)) return null;
  if (!enters(node)) return survives(node) ? 'blocked' : null;

  const { children } = node;

  for (
    let index = backward ? children.length - 1 : 0;
    index >= 0 && index < children.length;
    index += backward ? -1 : 1
  ) {
    const found = survivingEdge(
      [...path, index],
      children[index],
      backward,
      survives,
      enters
    );

    if (found !== null) return found;
  }

  return null;
};

const nearestFrom = (
  document: RootChildren,
  point: Point,
  direction: Direction,
  survives: Survives,
  enters: Enters = survives
): Point | null => {
  const gone = highestGone(document, point, survives);

  if (!gone) return point;

  const parent = gone.slice(0, -1);
  const backward = direction === 'backward';
  const step = backward ? -1 : 1;

  for (let index = getDefined(gone.at(-1)) + step; index >= 0; index += step) {
    const path = [...parent, index];
    const sibling = nodeAt(document, path);

    if (!sibling) break;

    const found = survivingEdge(path, sibling, backward, survives, enters);

    if (found === 'blocked') return null;
    if (found !== null) return { ...point, ...found };
  }

  return null;
};

const writeLanding = (editor: Editor, document: RootChildren) => {
  const survives = contentSurvival(editor);
  const schema = getEditorSchema(editor);
  const writable = (element: Node) =>
    survives(element) && !schema.isVoid(element) && !schema.isReadOnly(element);

  return (point: Point): Point | null =>
    nearestFrom(document, point, 'backward', survives, writable) ??
    nearestFrom(document, point, 'forward', survives, writable);
};

// A command frame passes the stored root's children, because the editor's own
// reads there see the frame's.

/** @internal */
export const isInRemovedContent = (
  editor: Editor,
  point: Point,
  document: RootChildren
) =>
  hasEditorContent(editor) &&
  highestGone(document, point, contentSurvival(editor)) !== null;

/** @internal */
export function landTextWrite(
  editor: Editor,
  at: Point,
  document: RootChildren
): Point;
export function landTextWrite(
  editor: Editor,
  at: Range,
  document: RootChildren
): Range;
export function landTextWrite(
  editor: Editor,
  at: Point | Range,
  document: RootChildren
): Point | Range;
export function landTextWrite(
  editor: Editor,
  at: Point | Range,
  document: RootChildren
): Point | Range {
  if (!hasEditorContent(editor)) return at;

  const landing = writeLanding(editor, document);
  const land = (point: Point) => landing(point) ?? point;

  if (PointApi.isPoint(at)) return land(at);

  const anchor = land(at.anchor);
  const focus = land(at.focus);

  if (anchor === at.anchor && focus === at.focus) return at;

  const [start, end] = RangeApi.isBackward(at)
    ? [focus, anchor]
    : [anchor, focus];

  return PointApi.isAfter(start, end)
    ? { ...at, anchor: start, focus: start }
    : { ...at, anchor, focus };
}
