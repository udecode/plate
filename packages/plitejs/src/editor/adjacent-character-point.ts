import type { NodeList } from '../core/change/document-index';
import { getEditorRuntime, getEditorSchema } from '../core/editor-runtime';
import { getLiveNode, getLiveText } from '../core/public-state';
import { isNonEditable } from '../core/writable-text';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  above as editorAbove,
  isEditor as editorIsEditor,
  isElementReadOnly as editorIsElementReadOnly,
  isInline as editorIsInline,
  isVoid as editorIsVoid,
  point as editorPoint,
} from '../interfaces/editor';
import { type Descendant, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { getDefined } from '../internal/get-defined';
import { getCharacterDistance } from '../utils/string';
import { type Reach, skipsPoint } from './reach';

type Direction = 'backward' | 'forward';

type ChildContainer = {
  children: readonly Descendant[];
};

const getChildren = (
  editor: Editor,
  node: unknown
): NodeList<Descendant> | null => {
  if (editorIsEditor(node)) {
    return getEditorRuntime(editor).getChildList();
  }

  return node &&
    typeof node === 'object' &&
    'children' in node &&
    Array.isArray((node as ChildContainer).children)
    ? (node as ChildContainer).children
    : null;
};

const getNodeAtPath = (editor: Editor, path: Path) =>
  path.length === 0 ? editor : getLiveNode(editor, path);

export const canUseAdjacentCharacterFastPath = (
  editor: Editor,
  point: Point
) => {
  if (point.path.length < 2) {
    return false;
  }

  if (!getLiveText(editor, point.path)) {
    return false;
  }

  const parentPath = point.path.slice(0, -1);
  const parent = getLiveNode(editor, parentPath);

  if (
    !parent ||
    !NodeApi.isElement(parent) ||
    editorIsInline(editor, parent) ||
    editorIsVoid(editor, parent) ||
    editorIsElementReadOnly(editor, parent) ||
    parent.children.some((child) => !NodeApi.isText(child))
  ) {
    return false;
  }

  for (let depth = 1; depth < parentPath.length; depth += 1) {
    const ancestor = getLiveNode(editor, parentPath.slice(0, depth));

    if (
      ancestor &&
      NodeApi.isElement(ancestor) &&
      (editorIsInline(editor, ancestor) ||
        editorIsVoid(editor, ancestor) ||
        editorIsElementReadOnly(editor, ancestor))
    ) {
      return false;
    }
  }

  return true;
};

const getFirstTextPoint = (editor: Editor, path: Path): Point | null => {
  let node = getNodeAtPath(editor, path);
  const currentPath = [...path];

  while (node && !NodeApi.isText(node)) {
    const children = getChildren(editor, node);

    if (!children?.length) {
      return null;
    }

    node = children.at(0);
    currentPath.push(0);
  }

  return node && NodeApi.isText(node) ? { path: currentPath, offset: 0 } : null;
};

const getLastTextPoint = (editor: Editor, path: Path): Point | null => {
  let node = getNodeAtPath(editor, path);
  const currentPath = [...path];

  while (node && !NodeApi.isText(node)) {
    const children = getChildren(editor, node);

    if (!children?.length) {
      return null;
    }

    const lastIndex = children.length - 1;
    node = children.at(lastIndex);
    currentPath.push(lastIndex);
  }

  return node && NodeApi.isText(node)
    ? { path: currentPath, offset: node.text.length }
    : null;
};

const getNextTextStartPoint = (editor: Editor, path: Path): Point | null => {
  let currentPath = [...path];

  while (currentPath.length > 0) {
    const parentPath = currentPath.slice(0, -1);
    const parent = getNodeAtPath(editor, parentPath);
    const children = getChildren(editor, parent);
    const currentIndex = getDefined(currentPath.at(-1));

    if (children) {
      for (let index = currentIndex + 1; index < children.length; index += 1) {
        const point = getFirstTextPoint(editor, [...parentPath, index]);

        if (point) {
          return point;
        }
      }
    }

    currentPath = parentPath;
  }

  return null;
};

const getPreviousTextEndPoint = (editor: Editor, path: Path): Point | null => {
  let currentPath = [...path];

  while (currentPath.length > 0) {
    const parentPath = currentPath.slice(0, -1);
    const parent = getNodeAtPath(editor, parentPath);
    const children = getChildren(editor, parent);
    const currentIndex = getDefined(currentPath.at(-1));

    if (children) {
      for (let index = currentIndex - 1; index >= 0; index -= 1) {
        const point = getLastTextPoint(editor, [...parentPath, index]);

        if (point) {
          return point;
        }
      }
    }

    currentPath = parentPath;
  }

  return null;
};

const getNextCharacterPoint = (editor: Editor, point: Point): Point | null => {
  const text = getLiveText(editor, point.path);

  if (text && point.offset < text.text.length) {
    return {
      path: [...point.path],
      offset:
        point.offset + getCharacterDistance(text.text.slice(point.offset)),
    };
  }

  const next = getNextTextStartPoint(editor, point.path);

  return next && PathApi.isSibling(next.path, point.path)
    ? getNextCharacterPoint(editor, next)
    : next;
};

const getPreviousCharacterPoint = (
  editor: Editor,
  point: Point
): Point | null => {
  const text = getLiveText(editor, point.path);

  if (text && point.offset > 0) {
    return {
      path: [...point.path],
      offset:
        point.offset -
        getCharacterDistance(text.text.slice(0, point.offset), true),
    };
  }

  const previous = getPreviousTextEndPoint(editor, point.path);

  return previous && PathApi.isSibling(previous.path, point.path)
    ? getPreviousCharacterPoint(editor, previous)
    : previous;
};

export const getAdjacentCharacterPoint = (
  editor: Editor,
  point: Point,
  {
    direction,
    distance,
    reach,
    voids,
  }: {
    direction: Direction;
    distance: number;
    reach: Reach;
    voids: boolean;
  }
): Point | undefined => {
  let current: Point | null = point;
  let remaining = distance;

  while (current && remaining > 0) {
    current =
      direction === 'forward'
        ? getNextCharacterPoint(editor, current)
        : getPreviousCharacterPoint(editor, current);

    if (!current || (!voids && skipsPoint(editor, current, reach))) continue;

    const atom =
      reach === 'content' && !voids
        ? editorAbove(editor, {
            at: current,
            match: (node) =>
              NodeApi.isElement(node) &&
              isNonEditable(getEditorSchema(editor), node),
            mode: 'highest',
            voids: true,
          })
        : undefined;

    if (atom && editorIsInline(editor, atom[0])) {
      current = editorPoint(editor, atom[1], {
        edge: direction === 'forward' ? 'end' : 'start',
      });
    }

    remaining -= 1;
  }

  return current ?? undefined;
};
