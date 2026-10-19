import { LocationApi } from '../interfaces';
import {
  type AnyEditor,
  type EditorStaticApi,
  getChildren as editorGetChildren,
} from '../interfaces/editor';
import { type Descendant, type Node, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { RangeApi } from '../interfaces/range';
import type { Text } from '../interfaces/text';

const findEdgeText = (
  children: readonly Descendant[],
  edge: 'end' | 'start',
  trail: number[]
): Text | null => {
  for (let step = 0; step < children.length; step += 1) {
    const index = edge === 'end' ? children.length - 1 - step : step;
    const child = children[index];
    const found = NodeApi.isText(child)
      ? child
      : findEdgeText(child.children, edge, trail);

    if (found) {
      trail.push(index);

      return found;
    }
  }

  return null;
};

export const readTextEdge = (
  editor: AnyEditor,
  at: Path,
  edge: 'end' | 'start'
): Point | null => {
  const node = at.length === 0 ? null : NodeApi.get(editor, at);

  if (node && NodeApi.isText(node)) {
    return { offset: edge === 'end' ? node.text.length : 0, path: at };
  }

  const trail: number[] = [];
  const text = findEdgeText(
    NodeApi.isElement(node) ? node.children : editorGetChildren(editor),
    edge,
    trail
  );

  if (!text) return null;

  return {
    offset: edge === 'end' ? text.text.length : 0,
    path: [...at, ...trail.reverse()],
  };
};

export const isStructuralEdge = (
  node: Node,
  path: Path,
  point: Point,
  edge: 'end' | 'start'
) => {
  const [leaf, leafPath] =
    edge === 'end' ? NodeApi.last(node, []) : NodeApi.first(node, []);

  return (
    NodeApi.isText(leaf) &&
    PathApi.equals([...path, ...leafPath], point.path) &&
    point.offset === (edge === 'end' ? leaf.text.length : 0)
  );
};

export const point: EditorStaticApi['point'] = (editor, at, options = {}) => {
  const { edge = 'start' } = options;

  if (LocationApi.isPath(at)) {
    const textEdge = readTextEdge(editor, at, edge);

    if (!textEdge) {
      throw new Error(
        `Cannot get the ${edge} point in the node at path [${at}] because it has no ${edge} text node.`
      );
    }

    return textEdge;
  }

  if (LocationApi.isRange(at)) {
    const [start, end] = RangeApi.edges(at);
    return edge === 'start' ? start : end;
  }

  return at;
};
