import { getEditorRuntimeOwner, getEditorSchema } from '../core/editor-runtime';
import {
  applyBuiltDocumentChange,
  getPathByNodeKey,
  isBuildingTransactionSpec,
  runEditorTransaction,
} from '../core/public-state';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Descendant,
  type Location,
  LocationApi,
  NodeApi,
  type Path,
  PathApi,
  RangeApi,
} from '../interfaces';
import {
  isBlock as editorIsBlock,
  isEnd as editorIsEnd,
  isInline as editorIsInline,
  point as editorPoint,
  unhangRange as editorUnhangRange,
  void as editorVoid,
} from '../interfaces/editor';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { getDefaultInsertLocation } from '../utils';
import { getNodeKeyForNode, seedNodeKeys } from '../utils/node-keys';
import { select as selectSelection } from '../transforms-selection/select';
import { deleteText } from '../transforms-text/delete-text';
import { splitNodes } from './split-nodes';

export const insertNodes: NodeMutationMethods<any>['insertNodes'] = (
  editor,
  nodes,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    const { hanging = false, voids = false, mode = 'lowest' } = options;
    let at: Location | undefined = options.at;
    let { match, select } = options;

    const nextNodes = (
      Array.isArray(nodes) ? nodes : [nodes]
    ) as readonly Descendant[];

    if (nextNodes.length === 0) {
      return;
    }

    const [node] = nextNodes;

    if (!at) {
      const target = tx.resolveTarget();
      if (target) {
        at = target;
      }
      if (!at && tx.getModelSelection() == null) {
        at = getDefaultInsertLocation(editor);
      }
      if (!at) {
        return;
      }
      if (select !== false) {
        select = true;
      }
    }

    if (select == null) {
      select = false;
    }

    if (LocationApi.isRange(at)) {
      if (!hanging) {
        at = editorUnhangRange(editor, at, { voids });
      }

      if (RangeApi.isCollapsed(at)) {
        at = at.anchor;
      } else {
        const [, end] = RangeApi.edges(at);
        const pointAnchor = editor.anchor(end, {
          association: 'forward',
          deletion: 'nearest',
        });
        deleteText(editor, { at });
        at = pointAnchor.release()!;
      }
    }

    if (LocationApi.isPoint(at)) {
      if (match == null) {
        if (NodeApi.isText(node)) {
          match = (n) => NodeApi.isText(n);
        } else if (
          NodeApi.isElement(node) &&
          getEditorSchema(editor).isInline(node)
        ) {
          match = (n) =>
            NodeApi.isText(n) ||
            (NodeApi.isElement(n) && editorIsInline(editor, n));
        } else {
          match = (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
        }
      }

      const [entry] = getNodes(editor, {
        at: at.path,
        match,
        mode,
        voids,
      });

      if (!entry) {
        return;
      }

      const [, matchPath] = entry;
      const pointAnchor = editor.anchor(at, {
        association: 'forward',
        deletion: 'nearest',
      });
      const isAtEnd = editorIsEnd(editor, at, matchPath);
      splitNodes(editor, { at, match, mode, voids });
      const splitPoint = pointAnchor.release();

      if (!splitPoint) return;

      const [splitEntry] = getNodes(editor, {
        at: splitPoint.path,
        match,
        mode,
        voids,
      });
      const path = splitEntry?.[1] ?? matchPath;

      at = isAtEnd ? PathApi.next(path) : path;
    }

    if (LocationApi.isPath(at) && at.length === 0) {
      throw new Error('Cannot insert into the editor root.');
    }

    const parentPath = PathApi.parent(at);
    let index = at.at(-1)!;

    if (!voids && editorVoid(editor, { at: parentPath })) {
      return;
    }

    for (const child of nextNodes) {
      const path = parentPath.concat(index);
      const owner = getEditorRuntimeOwner(editor);
      const nodeKey = getNodeKeyForNode(child, owner);
      const inheritIdentity =
        nodeKey === null || getPathByNodeKey(editor, nodeKey) === null;

      if (inheritIdentity && !isBuildingTransactionSpec(editor)) {
        seedNodeKeys([child], owner);
      }
      index++;

      applyBuiltDocumentChange(
        editor,
        (builder, root) => builder.insertNode(root, path, child),
        {
          nodeKeyTransfers: inheritIdentity
            ? [{ path, source: child }]
            : undefined,
        }
      );
      at = PathApi.next(at as Path);
    }

    at = PathApi.previous(at);

    if (select) {
      const point = editorPoint(editor, at, { edge: 'end' });

      if (point) {
        selectSelection(editor, point);
      }
    }
  });
};
