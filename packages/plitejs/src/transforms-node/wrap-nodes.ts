import { getEditorSchema } from '../core/editor-runtime';
import {
  contentPaths,
  planInlineWrap,
  trimToContent,
} from '../core/inline-wrap';
import { refuseVetoedWrite } from '../core/node-write-veto';
import {
  applyBuiltDocumentChange,
  getActiveUpdateRoot,
  runEditorTransaction,
} from '../core/public-state';
import { preservesSelectionForExplicitTarget } from '../core/update-root-selection';
import { withoutPlacement } from '../core/view-carets';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Element,
  ElementApi,
  type Location,
  LocationApi,
  NodeApi,
  type Point,
  RangeApi,
  SelectionApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  above as editorAbove,
  after as editorAfter,
  before as editorBefore,
  isBlock as editorIsBlock,
  isEdge as editorIsEdge,
  isEnd as editorIsEnd,
  isStart as editorIsStart,
  leaf as editorLeaf,
  range as editorRange,
} from '../interfaces/editor';
import { type Path, PathApi } from '../interfaces/path';
import type {
  NodeMutationMethods,
  NodeWrapNodesOptions,
} from '../interfaces/transforms/node';
import { getDefined } from '../internal/get-defined';
import { MAIN_ROOT_KEY, stripLocationRoots } from '../internal/root-location';
import { select } from '../transforms-selection/select';
import { matchPath } from '../utils/match-path';
import { normalizeNodeMatch } from '../utils/node-match';
import { mergeNodes } from './merge-nodes';
import { splitNodesKeepingType } from './split-nodes';

const mergeAdjacentTextRunsIn = (editor: Editor, parentPath: Path) => {
  const [parent] = getNode(editor, parentPath);

  if (!ElementApi.isElement(parent)) return;

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

export const wrapNodes = ((
  editor: Editor,
  element: Element,
  options: NodeWrapNodesOptions = {}
) => {
  runEditorTransaction(editor, (tx) => {
    let target = tx.resolveTarget({ at: options.at });
    const mode = options.mode ?? 'lowest';
    const replace = options.replace ?? false;
    const split = options.split ?? false;
    const schema = getEditorSchema(editor);
    const wrapsInline = schema.isInline(element);
    const hasExplicitSelector = options.match != null || options.type != null;
    const trimsToContent =
      split && wrapsInline && !hasExplicitSelector && RangeApi.isRange(target);
    const entersVoids = !trimsToContent && (options.voids ?? false);
    let match = normalizeNodeMatch(options.type, options.match);
    const { children: _children, ...shell } = element;
    const wrapper = { ...shell, children: [] };
    const vetoWrap = (parentPath: Path, index: number, count: number) => {
      const root = getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;

      for (let offset = 0; offset < count; offset++) {
        const path = [...parentPath, index + offset];
        const [node] = getNode(editor, path);

        if (NodeApi.isElement(node)) {
          refuseVetoedWrite(editor, { kind: 'wrap', node, path, root });
        }
      }
    };

    if (!target) {
      return;
    }

    if (SelectionApi.isNode(target)) {
      const anchors = Array.from(
        getNodes(editor, { at: target, match, mode, voids: entersVoids }),
        ([, path]) =>
          editor.anchor(path, {
            association: 'forward',
            deletion: 'drop',
          })
      ).toReversed();

      for (const anchor of anchors) {
        const path = anchor.release();

        if (path) wrapNodes(editor, element, { ...options, at: path });
      }
      return;
    }

    if (replace && trimsToContent && RangeApi.isRange(target)) {
      const root = getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;
      const plans = planInlineWrap(editor, wrapper, target, {
        replace: true,
        root,
        split: true,
      });

      for (const plan of plans) {
        if (plan.status === 'veto' && plan.vetoInput) {
          refuseVetoedWrite(editor, plan.vetoInput);
        }
      }

      const fitting = plans.filter((plan) => plan.status === 'fit');

      if (fitting.length === 0) return;

      const wasBackward = RangeApi.isBackward(target);
      const selectionAnchor =
        options.at == null
          ? editor.anchor(target, {
              association: 'inward',
              deletion: 'nearest',
            })
          : null;
      const blockAnchors = fitting
        .map((plan) => ({
          parentAnchor: editor.anchor(plan.parentPath, {
            association: 'forward',
            deletion: 'drop',
          }),
          rangeAnchor: editor.anchor(plan.range, {
            association: 'inward',
            deletion: 'nearest',
          }),
        }))
        .toReversed();

      for (const { parentAnchor, rangeAnchor } of blockAnchors) {
        const currentParentPath = parentAnchor.resolve();
        const currentRange = rangeAnchor.resolve();

        if (!currentParentPath || !currentRange) {
          parentAnchor.release();
          rangeAnchor.release();
          continue;
        }

        const [blockStart, blockEnd] = RangeApi.edges(currentRange);
        const depth = currentParentPath.length;
        const endChildPath = blockEnd.path.slice(0, depth + 1);

        if (!editorIsEnd(editor, blockEnd, endChildPath)) {
          const [endChild] = getNode(editor, endChildPath);

          if (
            NodeApi.isText(endChild) ||
            (ElementApi.isElement(endChild) && endChild.type === wrapper.type)
          ) {
            splitNodesKeepingType(editor, {
              always: true,
              at: blockEnd,
              match: (_node, path) => PathApi.equals(path, endChildPath),
            });
          }
        }

        const startChildPath = blockStart.path.slice(0, depth + 1);

        if (!editorIsStart(editor, blockStart, startChildPath)) {
          const [startChild] = getNode(editor, startChildPath);

          if (
            NodeApi.isText(startChild) ||
            (ElementApi.isElement(startChild) &&
              startChild.type === wrapper.type)
          ) {
            splitNodesKeepingType(editor, {
              always: true,
              at: blockStart,
              match: (_node, path) => PathApi.equals(path, startChildPath),
            });
          }
        }

        const postSplitRange = rangeAnchor.resolve();
        const postSplitParent = parentAnchor.resolve();
        const trimmedAfterSplit = postSplitRange
          ? trimToContent(editor, postSplitRange)
          : null;

        if (trimmedAfterSplit && postSplitParent) {
          const [splitStart, splitEnd] = RangeApi.edges(trimmedAfterSplit);
          const firstIndex = splitStart.path[postSplitParent.length];
          const lastIndex = splitEnd.path[postSplitParent.length];
          const replacePaths = Array.from(
            getNodes(editor, {
              at: trimmedAfterSplit,
              match: (node, path) =>
                ElementApi.isElement(node) &&
                node.type === wrapper.type &&
                path.length > postSplitParent.length &&
                PathApi.isAncestor(postSplitParent, path) &&
                path[postSplitParent.length] >= firstIndex &&
                path[postSplitParent.length] <= lastIndex,
              mode: 'all',
            }),
            ([, path]) => path
          ).toReversed();

          for (const replacePath of replacePaths) {
            applyBuiltDocumentChange(editor, (builder, activeRoot) =>
              builder.unwrapNode(activeRoot, replacePath)
            );
          }
        }

        const finalParentPath = parentAnchor.release();
        const postUnwrapRange = rangeAnchor.release();
        const finalRange = postUnwrapRange
          ? trimToContent(editor, postUnwrapRange)
          : null;

        if (!finalParentPath || !finalRange) continue;

        const [finalStart, finalEnd] = RangeApi.edges(finalRange);
        const firstChildIndex = finalStart.path[finalParentPath.length];
        const lastChildIndex = finalEnd.path[finalParentPath.length];
        const count = lastChildIndex - firstChildIndex + 1;

        applyBuiltDocumentChange(editor, (builder, activeRoot) =>
          builder.wrapChildren(
            activeRoot,
            finalParentPath,
            firstChildIndex,
            count,
            shell
          )
        );
        if (count > 1) {
          mergeAdjacentTextRunsIn(editor, [
            ...finalParentPath,
            firstChildIndex,
          ]);
        }
      }

      if (selectionAnchor) {
        const mapped = selectionAnchor.release();

        if (mapped) {
          const directed = wasBackward
            ? { anchor: mapped.focus, focus: mapped.anchor }
            : mapped;

          withoutPlacement(editor, () => select(editor, directed));
        }
      }

      return;
    }

    if (match == null) {
      if (LocationApi.isPath(target)) {
        match = matchPath(editor, target);
      } else if (getEditorSchema(editor).isInline(element)) {
        match = (node) =>
          (NodeApi.isElement(node) && getEditorSchema(editor).isInline(node)) ||
          NodeApi.isText(node);
      } else {
        match = (node) =>
          NodeApi.isElement(node) && editorIsBlock(editor, node);
      }
    }

    if (trimsToContent && LocationApi.isRange(target)) {
      const content = trimToContent(editor, target);

      if (!content) return;
      target = content;
    }

    const spanOf = (at: Location) => {
      let firstPath: Path | undefined;
      let lastPath: Path | undefined;

      for (const [, path] of getNodes(editor, {
        at,
        match,
        mode,
        voids: entersVoids,
      })) {
        firstPath ??= path;
        lastPath = path;
      }

      if (!firstPath || !lastPath || firstPath.length === 0) return null;

      const common = PathApi.common(firstPath, lastPath);

      return {
        commonPath: PathApi.equals(common, firstPath)
          ? PathApi.parent(common)
          : common,
        firstPath,
        lastPath,
      };
    };
    const checksFit = wrapsInline && !hasExplicitSelector;
    const spanIn = (rootPath: Path) => {
      const scope = RangeApi.isRange(target)
        ? RangeApi.intersection(
            stripLocationRoots(target),
            stripLocationRoots(editorRange(editor, rootPath))
          )
        : target;

      if (
        !LocationApi.isLocation(scope) ||
        (trimsToContent &&
          RangeApi.isRange(scope) &&
          contentPaths(editor, scope).next().done)
      ) {
        return null;
      }

      const span = spanOf(scope);

      if (!span || !checksFit) return span;

      const [parent] = getNode(editor, span.commonPath);
      const depth = span.commonPath.length;

      return NodeApi.isElement(parent) &&
        schema.canWrapChildren(parent, {
          ...wrapper,
          children: parent.children.slice(
            span.firstPath[depth],
            span.lastPath[depth] + 1
          ),
        })
        ? span
        : null;
    };
    const landsAt = (point: Point) => {
      const block = editorAbove(editor, {
        at: point,
        match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
      });

      return !checksFit || !block || spanIn(block[1]) !== null;
    };

    if (
      checksFit &&
      LocationApi.isRange(target) &&
      !Array.from(
        getNodes(editor, {
          at: target,
          match: (node) =>
            NodeApi.isElement(node) && editorIsBlock(editor, node),
          mode: 'lowest',
          voids: entersVoids,
        }),
        ([, path]) => path
      ).some((path) => spanIn(path))
    ) {
      return;
    }

    if (LocationApi.isPath(target) && !hasExplicitSelector && !split) {
      if (target.length === 0) return;

      const node = NodeApi.get(editor, target);
      if (!NodeApi.isDescendant(node)) return;

      const parentPath = PathApi.parent(target);
      const index = getDefined(target.at(-1));

      vetoWrap(parentPath, index, 1);
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.wrapChildren(root, parentPath, index, 1, shell)
      );
      return;
    }

    if (split && LocationApi.isRange(target)) {
      const [start, end] = RangeApi.edges(target);
      const rangeAnchor = editor.anchor(target, {
        association: 'inward',
        deletion: 'nearest',
      });
      const isAtBlockEdge = (point: Point) => {
        const blockAbove = editorAbove(editor, {
          at: point,
          match: (node) =>
            NodeApi.isElement(node) && editorIsBlock(editor, node),
        });

        return blockAbove && editorIsEdge(editor, point, blockAbove[1]);
      };
      const shouldAlwaysSplit = (point: Point) => !isAtBlockEdge(point);

      if (landsAt(end)) {
        splitNodesKeepingType(editor, {
          at: end,
          match,
          voids: entersVoids,
          always: shouldAlwaysSplit(end),
        });
      }

      if (landsAt(start)) {
        splitNodesKeepingType(editor, {
          at: start,
          match,
          voids: entersVoids,
          always: shouldAlwaysSplit(start),
        });
      }

      target = rangeAnchor.release() ?? target;

      if (!trimsToContent && LocationApi.isRange(target)) {
        let [nextStart, nextEnd] = RangeApi.edges(target);
        const [startLeaf] = editorLeaf(editor, nextStart);
        const [endLeaf] = editorLeaf(editor, nextEnd);

        if (
          NodeApi.isText(startLeaf) &&
          nextStart.offset === startLeaf.text.length
        ) {
          nextStart =
            editorAfter(editor, nextStart, {
              distance: 1,
              unit: 'offset',
            }) ?? nextStart;
        }

        if (NodeApi.isText(endLeaf) && nextEnd.offset === 0) {
          nextEnd =
            editorBefore(editor, nextEnd, {
              distance: 1,
              unit: 'offset',
            }) ?? nextEnd;
        }

        target = { anchor: nextStart, focus: nextEnd };
      }

      if (options.at == null) {
        const trimmed = target;

        withoutPlacement(editor, () => select(editor, trimmed));
      }
    }

    const roots = Array.from(
      getNodes(editor, {
        at: target,
        match: wrapsInline
          ? (node) => NodeApi.isElement(node) && editorIsBlock(editor, node)
          : (node) => NodeApi.isEditor(node),
        mode: 'lowest',
        voids: entersVoids,
      })
    );
    const shouldSelect = !preservesSelectionForExplicitTarget(
      editor,
      options.at != null
    );
    let nextSelection =
      shouldSelect && LocationApi.isRange(target)
        ? {
            anchor: target.anchor,
            focus: target.focus,
          }
        : null;

    for (const [, rootPath] of roots) {
      const span = spanIn(rootPath);

      if (!span) continue;

      const { commonPath, firstPath, lastPath } = span;
      const firstChildIndex = firstPath[commonPath.length];
      const count = lastPath[commonPath.length] - firstChildIndex + 1;
      const finalWrapperPath = [...commonPath, firstChildIndex];

      if (nextSelection) {
        const mapPoint = (point: Point) => {
          const at = point.path.slice(0, finalWrapperPath.length);
          const offset = (at.at(-1) ?? 0) - firstChildIndex;

          return at.length === finalWrapperPath.length &&
            PathApi.equals(PathApi.parent(at), commonPath) &&
            offset >= 0 &&
            offset < count
            ? {
                ...point,
                path: [
                  ...finalWrapperPath,
                  offset,
                  ...point.path.slice(finalWrapperPath.length),
                ],
                offset: point.offset,
              }
            : point;
        };

        nextSelection = {
          anchor: mapPoint(nextSelection.anchor),
          focus: mapPoint(nextSelection.focus),
        };
      }

      vetoWrap(commonPath, firstChildIndex, count);
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.wrapChildren(root, commonPath, firstChildIndex, count, shell)
      );
    }

    if (nextSelection) {
      const mapped = nextSelection;

      withoutPlacement(editor, () => select(editor, mapped));
    }
  });
}) as NodeMutationMethods['wrapNodes'];
