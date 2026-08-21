import {
  applyBuiltDocumentChange,
  runEditorTransaction,
} from '../core/public-state';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { type Ancestor, LocationApi, NodeApi, RangeApi } from '../interfaces';
import {
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
} from '../interfaces/editor';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import type {
  NodeLiftNodesOptions,
  NodeMutationMethods,
} from '../interfaces/transforms/node';
import { deselect, select } from '../transforms-selection';
import { matchPath } from '../utils/match-path';
import { normalizeNodeMatch } from '../utils/node-match';
import { moveNodes } from './move-nodes';
import { removeNodes } from './remove-nodes';

const getChildren = (editor: Editor, node: Ancestor) =>
  NodeApi.isEditor(node) ? editorGetChildren(editor) : node.children;

export const liftNodes = ((
  editor: Editor,
  options: NodeLiftNodesOptions = {}
) => {
  const liftNodeAtPath = (path: Path) => {
    const [node] = getNode(editor, path);

    if (NodeApi.isText(node)) {
      return;
    }

    if (path.length < 2) {
      return;
    }

    const parentPath = path.slice(0, -1);
    const [parent] = getNode(editor, parentPath);

    if (NodeApi.isText(parent)) {
      return;
    }

    const index = path.at(-1)!;
    const childCount = getChildren(editor, parent).length;

    if (childCount === 1) {
      moveNodes(editor, {
        at: path,
        to: [...parentPath.slice(0, -1), parentPath.at(-1)! + 1],
      });
      removeNodes(editor, { at: parentPath });
      return;
    }

    if (index === 0) {
      moveNodes(editor, {
        at: path,
        to: parentPath,
      });
      return;
    }

    if (index === childCount - 1) {
      moveNodes(editor, {
        at: path,
        to: [...parentPath.slice(0, -1), parentPath.at(-1)! + 1],
      });
      return;
    }

    applyBuiltDocumentChange(editor, (builder, root) =>
      builder.splitNode(
        root,
        parentPath,
        index + 1,
        PathApi.equals(parentPath, []) || NodeApi.isEditor(parent)
          ? {}
          : NodeApi.extractProps(parent)
      )
    );

    moveNodes(editor, {
      at: path,
      to: [...parentPath.slice(0, -1), parentPath.at(-1)! + 1],
    });
  };

  runEditorTransaction(editor, (tx) => {
    const target = tx.resolveTarget({ at: options.at });
    const selectionBefore = tx.getModelSelection();
    const mode = options.mode ?? 'lowest';
    const voids = options.voids ?? false;
    let match = normalizeNodeMatch(options.type, options.match);

    if (!target) {
      return;
    }

    if (match != null || !LocationApi.isRange(target)) {
      if (match == null) {
        match = LocationApi.isPath(target)
          ? matchPath(editor, target)
          : (node) => NodeApi.isElement(node) && editorIsBlock(editor, node);
      }

      if (
        LocationApi.isPath(target) &&
        options.match == null &&
        options.type == null
      ) {
        liftNodeAtPath(target);

        if (selectionBefore == null) {
          deselect(editor);
        }

        return;
      }

      const pathAnchors = Array.from(
        getNodes(editor, { at: target, match, mode, voids }),
        ([, path]) =>
          editor.anchor(path, {
            association: 'forward',
            deletion: 'drop',
          })
      );

      for (const pathAnchor of pathAnchors) {
        const path = pathAnchor.release();

        if (path) {
          liftNodeAtPath(path);
        }
      }

      return;
    }

    const [start, end] = RangeApi.edges(target);
    const startChildPath = start.path.slice(0, -1);
    const endChildPath = end.path.slice(0, -1);
    const startParentPath = startChildPath.slice(0, -1);
    const endParentPath = endChildPath.slice(0, -1);

    if (
      startParentPath.length !== 1 ||
      endParentPath.length !== 1 ||
      PathApi.compare(startParentPath, endParentPath) !== 0
    ) {
      return;
    }

    const startIndex = startChildPath.at(-1);
    const endIndex = endChildPath.at(-1);

    if (startIndex == null || endIndex == null) {
      return;
    }

    const wrapperIndex = startParentPath[0]!;
    const selectedBaseIndex = wrapperIndex + (startIndex > 0 ? 1 : 0);

    for (let childIndex = endIndex; childIndex >= startIndex; childIndex -= 1) {
      liftNodeAtPath([...startParentPath, childIndex]);
    }

    const mapPoint = (point: typeof start) => ({
      path: [
        selectedBaseIndex + (point.path[1]! - startIndex),
        ...point.path.slice(2),
      ],
      offset: point.offset,
    });

    select(editor, {
      anchor: mapPoint(start),
      focus: mapPoint(end),
    });
  });
}) as NodeMutationMethods['liftNodes'];
