import { getEditorSchema } from '../core/editor-runtime';
import { refuseVetoedWrite } from '../core/node-write-veto';
import {
  applyBuiltDocumentChange,
  getActiveUpdateRoot,
  runEditorTransaction,
} from '../core/public-state';
import { withoutPlacement } from '../core/view-carets';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import {
  type Element,
  type Location,
  LocationApi,
  NodeApi,
  type Point,
  type Range,
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
  leaf as editorLeaf,
  point as editorPoint,
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
import { splitNodesKeepingType } from './split-nodes';

function* contentPaths(editor: Editor, range: Range) {
  const [start, end] = RangeApi.edges(range);
  const schema = getEditorSchema(editor);

  for (const [node, path] of getNodes(editor, {
    at: range,
    match: (candidate) =>
      NodeApi.isText(candidate) ||
      (NodeApi.isElement(candidate) &&
        schema.isInline(candidate) &&
        schema.isVoid(candidate)),
    mode: 'lowest',
  })) {
    if (
      !NodeApi.isText(node) ||
      (PathApi.equals(path, end.path) ? end.offset : node.text.length) >
        (PathApi.equals(path, start.path) ? start.offset : 0)
    ) {
      yield path;
    }
  }
}

const trimToContent = (editor: Editor, range: Range): Range | null => {
  let first: Path | undefined;
  let last: Path | undefined;

  for (const path of contentPaths(editor, range)) {
    first ??= path;
    last = path;
  }

  if (!first || !last) return null;

  const [start, end] = RangeApi.edges(range);

  return {
    anchor: PathApi.equals(first, start.path)
      ? start
      : editorPoint(editor, first, { edge: 'start' }),
    focus: PathApi.equals(last, end.path)
      ? end
      : editorPoint(editor, last, { edge: 'end' }),
  };
};

export const wrapNodes = ((
  editor: Editor,
  element: Element,
  options: NodeWrapNodesOptions = {}
) => {
  runEditorTransaction(editor, (tx) => {
    let target = tx.resolveTarget({ at: options.at });
    const mode = options.mode ?? 'lowest';
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
        schema.canWrap(parent, {
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
    let nextSelection = LocationApi.isRange(target)
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
