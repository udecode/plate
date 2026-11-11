import { getEditorSchema } from '../core/editor-runtime';
import { refuseVetoedWrite } from '../core/node-write-veto';
import {
  applyBuiltDocumentChange,
  getActiveUpdateRoot,
  getCurrentSelection,
  runEditorTransaction,
} from '../core/public-state';
import { withoutPlacement } from '../core/view-carets';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Ancestor,
  type Descendant,
  type Element,
  LocationApi,
  type Node,
  NodeApi,
  type Range,
  RangeApi,
  SelectionApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  getChildren as editorGetChildren,
  hasPath as editorHasPath,
  isBlock as editorIsBlock,
  isEnd as editorIsEnd,
  isStart as editorIsStart,
  range as editorRange,
} from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type {
  NodeMutationMethods,
  NodeUnwrapNodesOptions,
} from '../interfaces/transforms/node';
import { MAIN_ROOT_KEY, stripLocationRoots } from '../internal/root-location';
import { matchPath } from '../utils/match-path';
import { normalizeNodeMatch } from '../utils/node-match';
import { liftNodes } from './lift-nodes';
import { mergeNodes } from './merge-nodes';
import { splitNodesKeepingType } from './split-nodes';

const getChildren = (editor: Editor, node: Ancestor): readonly Descendant[] =>
  NodeApi.isEditor(node) ? editorGetChildren(editor) : node.children;

const comparePoints = (left: Point, right: Point) => {
  const pathComparison = PathApi.compare(left.path, right.path);

  if (pathComparison !== 0) {
    return pathComparison;
  }

  if (left.offset === right.offset) {
    return 0;
  }

  return left.offset < right.offset ? -1 : 1;
};

const mergeAdjacentTextRuns = (editor: Editor, parentPath: Path) => {
  if (parentPath.length === 0 || !editorHasPath(editor, parentPath)) return;

  const [parent] = getNode(editor, parentPath);

  if (!NodeApi.isElement(parent)) return;

  for (let index = parent.children.length - 1; index > 0; index--) {
    const [node] = getNode(editor, [...parentPath, index]);
    const [previous] = getNode(editor, [...parentPath, index - 1]);

    if (
      NodeApi.isText(node) &&
      NodeApi.isText(previous) &&
      JSON.stringify(NodeApi.extractProps(node)) ===
        JSON.stringify(NodeApi.extractProps(previous))
    ) {
      mergeNodes(editor, { at: [...parentPath, index] });
    }
  }
};

export const unwrapNodes = ((
  editor: Editor,
  options: NodeUnwrapNodesOptions = {}
) => {
  const vetoUnwrap = (node: Element, path: Path) =>
    refuseVetoedWrite(editor, {
      kind: 'unwrap',
      node,
      path,
      root: getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY,
    });
  const unwrapNodeAtPath = (path: Path) => {
    const [node] = getNode(editor, path);

    if (!NodeApi.isElement(node) || path.length === 0) {
      return;
    }

    vetoUnwrap(node, path);
    applyBuiltDocumentChange(editor, (builder, root) =>
      builder.unwrapNode(root, path)
    );
  };
  // The text cleanup reads only the parent whose children the unwrap changed.
  const unwrapAndJoin = (path: Path) => {
    unwrapNodeAtPath(path);
    if (path.length > 0) mergeAdjacentTextRuns(editor, PathApi.parent(path));
  };

  const unwrapSelectedText = (path: Path, selected: Range) => {
    const overlap = RangeApi.intersection(
      stripLocationRoots(selected),
      stripLocationRoots(editorRange(editor, path))
    );

    if (!overlap || RangeApi.isCollapsed(overlap)) return;

    const [start, end] = RangeApi.edges(overlap);
    const match = (_node: Node, nodePath: Path) =>
      PathApi.equals(nodePath, path);
    let selectedPath = path;

    if (!editorIsEnd(editor, end, path)) {
      splitNodesKeepingType(editor, { always: true, at: end, match });
    }
    if (!editorIsStart(editor, start, path)) {
      splitNodesKeepingType(editor, { always: true, at: start, match });
      selectedPath = PathApi.next(path);
    }

    unwrapAndJoin(selectedPath);
  };

  runEditorTransaction(editor, (tx) => {
    let target = tx.resolveTarget({ at: options.at });
    const mode = options.mode ?? 'lowest';
    const split = options.split ?? false;
    const voids = options.voids ?? false;
    let match = normalizeNodeMatch(options.type, options.match);

    if (!target) {
      return;
    }

    if (SelectionApi.isNode(target)) {
      const anchors = Array.from(
        getNodes(editor, { at: target, match, mode, voids }),
        ([, path]) =>
          editor.anchor(path, {
            association: 'forward',
            deletion: 'drop',
          })
      ).toReversed();

      for (const anchor of anchors) {
        const path = anchor.release();

        if (path) unwrapNodes(editor, { ...options, at: path });
      }
      return;
    }

    const wantsGenericBehavior =
      match != null || mode !== 'lowest' || split || voids;

    if (wantsGenericBehavior) {
      if (match == null) {
        match = LocationApi.isPath(target)
          ? matchPath(editor, target)
          : (node) => NodeApi.isElement(node) && editorIsBlock(editor, node);
      }

      if (LocationApi.isPath(target)) {
        target = editorRange(editor, target);
      }

      const rangeAnchor = LocationApi.isRange(target)
        ? editor.anchor(target, {
            association: 'inward',
            deletion: 'nearest',
          })
        : null;
      const pathAnchors = Array.from(
        getNodes(editor, { at: target, match, mode, voids }),
        ([, path]) =>
          editor.anchor(path, {
            association: 'forward',
            deletion: 'drop',
          })
      ).reverse();

      for (const pathAnchor of pathAnchors) {
        const path = pathAnchor.release();

        if (!path) {
          continue;
        }

        const [node] = getNode(editor, path);
        let range = editorRange(editor, path);
        const holdsText =
          !NodeApi.isText(node) &&
          getChildren(editor, node).some(NodeApi.isText);

        if (!split && holdsText) {
          unwrapAndJoin(path);
          continue;
        }

        const anchoredRange = rangeAnchor?.resolve();

        if (
          holdsText &&
          NodeApi.isElement(node) &&
          getEditorSchema(editor).isInline(node)
        ) {
          if (anchoredRange && RangeApi.isExpanded(anchoredRange)) {
            unwrapSelectedText(path, anchoredRange);
          } else {
            unwrapAndJoin(path);
          }
          continue;
        }

        if (split && anchoredRange) {
          const currentSelection = getCurrentSelection(editor);
          const liveRange = RangeApi.isRange(currentSelection)
            ? currentSelection
            : anchoredRange;
          const intersection = RangeApi.intersection(liveRange, range);

          if (!intersection) {
            continue;
          }

          range = intersection;
        }

        if (NodeApi.isElement(node)) vetoUnwrap(node, path);
        liftNodes(editor, {
          at: range,
          match: (candidate, candidatePath) =>
            !NodeApi.isText(node) &&
            !NodeApi.isText(candidate) &&
            candidatePath.length === path.length + 1 &&
            PathApi.equals(candidatePath.slice(0, -1), path),
          voids,
        });
        mergeAdjacentTextRuns(editor, PathApi.parent(path));
      }

      rangeAnchor?.release();
      return;
    }

    if (Array.isArray(target)) {
      unwrapNodeAtPath(target);
      return;
    }

    if (!LocationApi.isRange(target)) {
      return;
    }

    const [start, end] =
      comparePoints(target.anchor, target.focus) <= 0
        ? [target.anchor, target.focus]
        : [target.focus, target.anchor];

    if (start.path.length < 2 || end.path.length < 2) {
      return;
    }

    const startWrapperPath = start.path.slice(0, -2);
    const endWrapperPath = end.path.slice(0, -2);

    if (startWrapperPath.length !== 1 || endWrapperPath.length !== 1) {
      return;
    }

    const startWrapperIndex = startWrapperPath[0];
    const endWrapperIndex = endWrapperPath[0];

    for (
      let wrapperIndex = startWrapperIndex;
      wrapperIndex <= endWrapperIndex;
      wrapperIndex += 1
    ) {
      const [wrapperNode] = getNode(editor, [wrapperIndex]);

      if (
        NodeApi.isText(wrapperNode) ||
        getChildren(editor, wrapperNode).some((child) => NodeApi.isText(child))
      ) {
        return;
      }
    }
    const anchor = editor.anchor(target.anchor, { deletion: 'drop' });
    const focus = editor.anchor(target.focus, { deletion: 'drop' });

    try {
      for (
        let wrapperIndex = endWrapperIndex;
        wrapperIndex >= startWrapperIndex;
        wrapperIndex -= 1
      ) {
        unwrapNodeAtPath([wrapperIndex]);
      }
    } finally {
      const nextAnchor = anchor.release();
      const nextFocus = focus.release();

      if (nextAnchor && nextFocus) {
        withoutPlacement(editor, () =>
          tx.setSelection(
            SelectionApi.text({ anchor: nextAnchor, focus: nextFocus })
          )
        );
      }
    }
  });
}) as NodeMutationMethods['unwrapNodes'];
