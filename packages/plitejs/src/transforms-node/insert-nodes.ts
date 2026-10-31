import { getEditorRuntimeOwner, getEditorSchema } from '../core/editor-runtime';
import {
  applyBuiltDocumentChange,
  findLiveNodeKeys,
  isBuildingTransactionSpec,
  runEditorTransaction,
} from '../core/public-state';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Descendant,
  type Location,
  LocationApi,
  type Node,
  type NodeKey,
  NodeApi,
  type NodeTypeSelector,
  PathApi,
  RangeApi,
  SelectionApi,
} from '../interfaces';
import {
  type AnyEditor,
  isBlock as editorIsBlock,
  isEnd as editorIsEnd,
  isInline as editorIsInline,
  isStart as editorIsStart,
  point as editorPoint,
  unhangRange as editorUnhangRange,
  void as editorVoid,
} from '../interfaces/editor';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type {
  NodeInsertNodesOptions,
  NodeMutationMethods,
} from '../interfaces/transforms/node';
import { getDefined } from '../internal/get-defined';
import { select as selectSelection } from '../transforms-selection/select';
import { prepareRemoval, removeText } from '../transforms-text/delete-text';
import { isInTextCell } from '../transforms-text/delete-text-grid';
import { getDefaultInsertLocation } from '../utils';
import {
  getNodeKeyForNode,
  mintNodeKeys,
  setNodeKey,
  settleDeferredNodeKeys,
} from '../utils/node-keys';
import { normalizeNodeMatch } from '../utils/node-match';
import { splitNodes } from './split-nodes';

type InsertedNode = {
  children: readonly InsertedNode[];
  kind: 'copy' | 'fresh' | 'move';
  source: Descendant;
};

const planInsertedNodes = (
  editor: AnyEditor,
  nodes: readonly Descendant[]
): readonly InsertedNode[] => {
  const owner = getEditorRuntimeOwner(editor);
  const nodeKeys = new Map<Descendant, NodeKey | null>();
  const collectKeys = (node: Descendant) => {
    nodeKeys.set(node, getNodeKeyForNode(node, owner));
    if (NodeApi.isElement(node)) node.children.forEach(collectKeys);
  };

  nodes.forEach(collectKeys);
  if (
    [...nodeKeys.values()].includes(null) &&
    settleDeferredNodeKeys(owner) > 0
  ) {
    nodes.forEach(collectKeys);
  }
  const live = findLiveNodeKeys(
    owner,
    [...nodeKeys.values()].filter((nodeKey) => nodeKey !== null)
  );
  const placed = new Set<Descendant | NodeKey>();
  const plan = (source: Descendant): InsertedNode => {
    const nodeKey = nodeKeys.get(source) ?? null;
    const identity = nodeKey ?? source;
    const placedBefore = placed.has(identity);
    const heldElsewhere = nodeKey !== null && live.has(nodeKey);

    placed.add(identity);

    return {
      children: NodeApi.isElement(source) ? source.children.map(plan) : [],
      kind: placedBefore || heldElsewhere ? 'copy' : nodeKey ? 'move' : 'fresh',
      source,
    };
  };

  return nodes.map(plan);
};

const keyInsertedNodes = (
  editor: AnyEditor,
  plans: readonly InsertedNode[]
): readonly Descendant[] => {
  const owner = getEditorRuntimeOwner(editor);
  const fresh: Descendant[] = [];
  const collect = (inserted: InsertedNode) => {
    if (inserted.kind === 'fresh') fresh.push(inserted.source);
    inserted.children.forEach(collect);
  };

  plans.forEach(collect);
  mintNodeKeys(
    fresh,
    owner,
    isBuildingTransactionSpec(editor) ? 'prepared' : 'live'
  );

  const toPlaced = (inserted: InsertedNode): Descendant => {
    const { source } = inserted;
    const children = inserted.children.map(toPlaced);
    const keeps = inserted.kind !== 'copy';

    if (
      keeps &&
      children.every(
        (child, index) => child === inserted.children[index].source
      )
    ) {
      return source;
    }

    const standIn: Descendant = NodeApi.isElement(source)
      ? { ...source, children }
      : { ...source };

    if (keeps) {
      setNodeKey(standIn, owner, getDefined(getNodeKeyForNode(source, owner)));
    }

    return standIn;
  };

  return plans.map(toPlaced);
};

const landsInTextCell = (editor: AnyEditor, at: Point | Range) => {
  if (LocationApi.isPoint(at)) return isInTextCell(editor, at.path);
  if (RangeApi.isCollapsed(at)) return isInTextCell(editor, at.anchor.path);

  const removal = prepareRemoval(editor, { at, writes: true });

  if (removal?.kind !== 'grid') {
    return RangeApi.edges(at).some((edge) => isInTextCell(editor, edge.path));
  }

  const { landing } = removal.plan;

  if (landing?.kind === 'point') return isInTextCell(editor, landing.at.path);

  return landing?.kind === 'cell' && isInTextCell(editor, landing.at);
};

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
      if (SelectionApi.isNode(target)) return;
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

    if (LocationApi.isRange(at) && !hanging) {
      at = editorUnhangRange(editor, at, { voids });
    }

    if (
      match == null &&
      NodeApi.isElement(node) &&
      !getEditorSchema(editor).isInline(node) &&
      !LocationApi.isPath(at) &&
      landsInTextCell(editor, at)
    ) {
      return;
    }

    if (LocationApi.isRange(at)) {
      if (RangeApi.isCollapsed(at)) {
        at = at.anchor;
      } else {
        const [, end] = RangeApi.edges(at);
        const pointAnchor = editor.anchor(end, {
          association: 'forward',
          deletion: 'nearest',
        });
        const removal = removeText(editor, { at, writes: true });
        const preservedEnd = pointAnchor.release();

        if (!removal) return;

        const landing =
          removal.kind === 'grid' ? removal.landing : getDefined(preservedEnd);

        if (!landing) return;
        at = landing;
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
      // splitNodes keeps the left half at matchPath, and at an inline edge the
      // point stays in that left half, so placement comes from the original point.
      const isBefore =
        editorIsStart(editor, at, matchPath) &&
        !editorIsEnd(editor, at, matchPath);
      splitNodes(editor, { at, match, mode, voids });

      at = isBefore ? matchPath : PathApi.next(matchPath);
    }

    if (LocationApi.isPath(at) && at.length === 0) {
      throw new Error('Cannot insert into the editor root.');
    }

    const parentPath = PathApi.parent(at);
    let index = getDefined(at.at(-1));

    if (!voids && editorVoid(editor, { at: parentPath })) {
      return;
    }

    const inserted = keyInsertedNodes(
      editor,
      planInsertedNodes(editor, nextNodes)
    );

    applyBuiltDocumentChange(
      editor,
      (builder, root) =>
        builder.replaceChildren(root, parentPath, index, 0, inserted),
      {
        nodeKeyTransfers: inserted.map((source, offset) => ({
          path: parentPath.concat(index + offset),
          source,
        })),
      }
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
