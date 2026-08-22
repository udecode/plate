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
  type Node,
  NodeApi,
  type NodeTypeSelector,
  PathApi,
  RangeApi,
} from '../interfaces';
import {
  type AnyEditor,
  isBlock as editorIsBlock,
  isEnd as editorIsEnd,
  isInline as editorIsInline,
  point as editorPoint,
  unhangRange as editorUnhangRange,
  void as editorVoid,
} from '../interfaces/editor';
import type {
  NodeInsertNodesOptions,
  NodeMutationMethods,
} from '../interfaces/transforms/node';
import { getDefined } from '../internal/get-defined';
import { select as selectSelection } from '../transforms-selection/select';
import { deleteText } from '../transforms-text/delete-text';
import { getDefaultInsertLocation } from '../utils';
import { getNodeKeyForNode, seedNodeKeys } from '../utils/node-keys';
import { normalizeNodeMatch } from '../utils/node-match';
import { splitNodes } from './split-nodes';

const insertNodesRuntime = (
  editor: AnyEditor,
  nodes: Descendant | readonly Descendant[],
  options: NodeInsertNodesOptions<Node, NodeTypeSelector | undefined> = {}
) => {
  runEditorTransaction(editor, (tx) => {
    const { hanging = false, voids = false, mode = 'lowest' } = options;
    let at: Location | undefined = options.at;
    let { select } = options;
    let match = normalizeNodeMatch(options.split?.type, options.split?.match);

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
        at = getDefined(pointAnchor.release());
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
    let index = getDefined(at.at(-1));

    if (!voids && editorVoid(editor, { at: parentPath })) {
      return;
    }

    const owner = getEditorRuntimeOwner(editor);
    const nodeKeyTransfers = nextNodes.flatMap((child, offset) => {
      const path = parentPath.concat(index + offset);
      const nodeKey = getNodeKeyForNode(child, owner);
      const inheritIdentity =
        nodeKey === null || getPathByNodeKey(editor, nodeKey) === null;

      if (inheritIdentity && !isBuildingTransactionSpec(editor)) {
        seedNodeKeys([child], owner);
      }

      return inheritIdentity ? [{ path, source: child }] : [];
    });

    applyBuiltDocumentChange(
      editor,
      (builder, root) =>
        builder.replaceChildren(root, parentPath, index, 0, nextNodes),
      { nodeKeyTransfers }
    );
    index += nextNodes.length;
    at = parentPath.concat(index - 1);

    if (select) {
      const point = editorPoint(editor, at, { edge: 'end' });

      if (point) {
        selectSelection(editor, point);
      }
    }
  });
};

export const insertNodes =
  insertNodesRuntime as NodeMutationMethods<any>['insertNodes'];
