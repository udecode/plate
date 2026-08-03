import {
  applyBuiltDocumentChange,
  getActiveUpdateRoot,
  runEditorTransaction,
} from '../core/public-state';
import { getEditorSchema } from '../core/editor-runtime';
import { node as editorNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { end as editorEnd } from '../editor/end';
import { LocationApi } from '../interfaces';
import {
  isBlock as editorIsBlock,
  isEnd as editorIsEnd,
  isStart as editorIsStart,
  leaf as editorLeaf,
  parent as editorParent,
  range as editorRange,
  unhangRange as editorUnhangRange,
} from '../interfaces/editor';
import type { AnyEditor as Editor, Value } from '../interfaces/editor';
import type { NodeMatchPredicate } from '../interfaces/node';
import { type Node, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Range, RangeApi } from '../interfaces/range';
import type { NodeMutationMethods } from '../interfaces/transforms/node';
import { select } from '../transforms-selection/select';
import { splitNodes } from './split-nodes';
import { normalizeNodeMatch } from '../utils/node-match';
import { matchPath } from '../utils/match-path';
type SetNodeUpdate = {
  newProperties: Record<string, unknown>;
  path: Path;
  properties: Record<string, unknown>;
};

const NON_SETTABLE_NODE_PROPERTIES = [
  'children',
  'text',
  ...Object.getOwnPropertyNames(Object.prototype),
];

const trimSplitRangeEndAtTextStart = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  range: Range,
  match: NodeMatchPredicate<Node>
): Range => {
  const [start, end] = RangeApi.edges(range);

  if (
    end.offset !== 0 ||
    PathApi.equals(start.path, end.path) ||
    !PathApi.hasPrevious(end.path)
  ) {
    return range;
  }

  const endNode = NodeApi.get(editor, end.path);

  if (!NodeApi.isText(endNode) || !match(endNode, end.path)) {
    return range;
  }

  const previousEnd = editorEnd(editor, PathApi.previous(end.path));
  const trimmedRange = { anchor: start, focus: previousEnd };

  if (RangeApi.isCollapsed(trimmedRange)) {
    return range;
  }

  return RangeApi.isBackward(range)
    ? { anchor: trimmedRange.focus, focus: trimmedRange.anchor }
    : trimmedRange;
};

export const setNodes: NodeMutationMethods['setNodes'] = (
  editor,
  props: Partial<Node>,
  options = {}
) => {
  runEditorTransaction(editor, (tx) => {
    const {
      at: optionAt,
      compare: optionCompare,
      hanging = false,
      match: optionMatch,
      marks = false,
      merge: optionMerge,
      mode: optionMode = 'lowest',
      split: optionSplit = false,
      voids: optionVoids = false,
    } = options;
    let match = normalizeNodeMatch(optionMatch);
    let at = optionAt === undefined ? tx.resolveTarget() : optionAt;
    let compare = optionCompare;
    const merge = optionMerge;
    let mode = optionMode;
    let split = optionSplit;
    let voids = optionVoids;

    if (!at) {
      return;
    }
    const root =
      (LocationApi.isRange(at)
        ? (at.anchor.root ?? at.focus.root)
        : undefined) ??
      getActiveUpdateRoot(editor) ??
      'main';

    if (marks) {
      if (LocationApi.isPath(at)) {
        at = editorRange(editor, at);
      }
      if (!LocationApi.isRange(at)) {
        return;
      }

      const originalMatch = match;
      const markKeys = Object.keys(props).filter(
        (key) => !NON_SETTABLE_NODE_PROPERTIES.includes(key)
      );

      const marksMatch: NodeMatchPredicate<Node> = (node, path) => {
        if (!NodeApi.isText(node)) {
          return false;
        }
        if (originalMatch && !originalMatch(node, path)) {
          return false;
        }

        const [parentNode] = editorParent(editor, path);

        if (!NodeApi.isElement(parentNode)) {
          return false;
        }

        return (
          markKeys.every((key) =>
            getEditorSchema(editor).isTextPropertyAllowedAt(key, path, root)
          ) &&
          (!getEditorSchema(editor).isVoid(parentNode) ||
            getEditorSchema(editor).isMarkableVoid(parentNode))
        );
      };
      const isExpandedRange = RangeApi.isExpanded(at);
      let markAcceptingVoidSelected = false;

      if (!isExpandedRange) {
        const [selectedNode, selectedPath] = editorNode(editor, at);

        if (marksMatch(selectedNode, selectedPath)) {
          const [parentNode] = editorParent(editor, selectedPath);
          markAcceptingVoidSelected =
            NodeApi.isElement(parentNode) &&
            getEditorSchema(editor).isMarkableVoid(parentNode);
        }
      }

      if (!isExpandedRange && !markAcceptingVoidSelected) {
        return;
      }

      match = marksMatch;
      mode = 'lowest';
      split = true;
      voids = true;
    }

    if (match == null) {
      match = LocationApi.isPath(at)
        ? matchPath(editor, at)
        : (n) => NodeApi.isElement(n) && editorIsBlock(editor, n);
    }

    if (!hanging && LocationApi.isRange(at)) {
      at = editorUnhangRange(editor, at, { voids });
    }

    if (split && LocationApi.isRange(at)) {
      if (
        RangeApi.isCollapsed(at) &&
        editorLeaf(editor, at.anchor)[0].text.length > 0
      ) {
        // If the range is collapsed in a non-empty node and 'split' is true, there's nothing to
        // set that won't get normalized away
        return;
      }
      const rangeAnchor = editor.anchor(at, {
        association: 'inward',
        deletion: 'nearest',
      });
      const [start, end] = RangeApi.edges(at);
      const splitMode = mode === 'lowest' ? 'lowest' : 'highest';
      const endAtEndOfNode = editorIsEnd(editor, end, end.path);
      splitNodes(editor, {
        at: end,
        match,
        mode: splitMode,
        voids,
        always: !endAtEndOfNode,
      });
      const startAtStartOfNode = editorIsStart(editor, start, start.path);
      splitNodes(editor, {
        at: start,
        match,
        mode: splitMode,
        voids,
        always: !startAtStartOfNode,
      });
      at = rangeAnchor.release()!;

      if (optionAt !== undefined && LocationApi.isRange(at)) {
        at = trimSplitRangeEndAtTextStart(editor, at, match);
      }

      if (options.at == null) {
        select(editor, at);
      }
    }

    if (!compare) {
      compare = (prop, nodeProp) => prop !== nodeProp;
    }

    const updates: SetNodeUpdate[] = [];

    for (const [node, path] of getNodes(editor, {
      at,
      match,
      mode,
      voids,
    })) {
      const properties: Record<string, unknown> = {};
      const newProperties: Record<string, unknown> = {};

      // You can't set properties on the editor node.
      if (path.length === 0) {
        continue;
      }

      let hasChanges = false;

      for (const k in props) {
        if (NON_SETTABLE_NODE_PROPERTIES.includes(k)) {
          continue;
        }

        const value: unknown = Object.hasOwn(node, k)
          ? node[<keyof Node>k]
          : undefined;

        const newValue: unknown = props[<keyof Node>k];

        if (compare(newValue, value)) {
          hasChanges = true;
          // Omit new properties from the old properties list
          if (Object.hasOwn(node, k)) properties[k] = value;
          // Omit properties that have been removed from the new properties list
          if (merge) {
            if (newValue != null) newProperties[k] = merge(value, newValue);
          } else if (newValue != null) {
            newProperties[k] = marks
              ? getEditorSchema(editor).mergeTextPropertyAt(
                  k,
                  value,
                  newValue,
                  path,
                  root
                )
              : newValue;
          }
        }
      }

      if (hasChanges) {
        if (NodeApi.isElement(node) && typeof newProperties.type === 'string') {
          const nextParent = { ...node, ...newProperties };
          const preservedElementProperties = getEditorSchema(
            editor
          ).elementPropertiesForTypeChangeAt(node, nextParent, path, root);

          for (const [key, value] of Object.entries(
            NodeApi.extractProps(node)
          )) {
            if (
              key === 'type' ||
              Object.hasOwn(props, key) ||
              Object.hasOwn(preservedElementProperties, key)
            ) {
              continue;
            }
            properties[key] = value;
          }

          node.children.forEach((child, index) => {
            if (!NodeApi.isText(child)) return;

            const preserved = getEditorSchema(
              editor
            ).textPropertiesForTypeChangeAt(
              child,
              node,
              nextParent,
              path.concat(index),
              root
            );
            const removedProperties = Object.fromEntries(
              Object.entries(NodeApi.extractProps(child)).filter(
                ([key]) => !Object.hasOwn(preserved, key)
              )
            );

            if (Object.keys(removedProperties).length === 0) return;

            updates.push({
              path: path.concat(index),
              properties: removedProperties,
              newProperties: {},
            });
          });
        }
        updates.push({
          path,
          properties,
          newProperties,
        });
      }
    }

    for (const update of updates) {
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.setNode(
          root,
          update.path,
          update.newProperties,
          update.properties
        )
      );
    }
  });
};
