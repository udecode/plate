import {
  addRangeMarks,
  createPathRef,
  createPointRef,
  createRangeRef,
  getEndPoint,
  getFragment,
  getNode,
  getNodeParent,
  getNodeProps,
  getPreviousPath,
  getStartPoint,
  insertFragment,
  insertNodes,
  isElement,
  isText,
  nanoid,
  PlateEditor,
  setNodes,
  TDescendant,
  TInsertNodeOperation,
  TInsertTextOperation,
  TMergeNodeOperation,
  TOperation,
  TRemoveNodeOperation,
  TRemoveTextOperation,
  TSplitNodeOperation,
  TText,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path, PathRef, Point, PointRef, Range, rangeRef, RangeRef } from 'slate';
import isEqual from 'lodash/isEqual.js';
import uniqWith from 'lodash/uniqWith.js';

import { getSuggestionProps } from '../../transforms';
import { TSuggestionText } from '../../types';

const addPropsToTextsInFragment = (fragment: TDescendant[], props: any): TDescendant[] => {
  return fragment.map((node) => {
    if (isText(node)) {
      return {
        ...node,
        ...props,
      };
    }

    return {
      ...node,
      children: addPropsToTextsInFragment(node.children, props),
    };
  });
};

type InsertedNode = {
  pathRef: PathRef;
};

type InsertedRange = {
  rangeRef: RangeRef;
};

type RemovedNodes = {
  pointRef: PointRef;
  nodes: TDescendant[];
  isFragment: boolean;
};

type UpdatedProperties = {
  rangeRef: RangeRef;
  properties: Record<string, any>;
  newProperties: Record<string, any>;
};

let insertedNodes: InsertedNode[] = [];
let insertedRanges: InsertedRange[] = [];
let removedNodes: RemovedNodes[] = [];
let updatedProperties: UpdatedProperties[] = [];

const handleUpdatedProperties = () => {
  // console.log('updatedProperties', JSON.stringify(updatedProperties.map(({ rangeRef, ...rest }) => ({ range: rangeRef.current, ...rest })), null, 2));

  const unsortedRangePoints = updatedProperties.flatMap(({ rangeRef }) => {
    const range = rangeRef.current;
    if (!range) return [];
    return [range.anchor, range.focus];
  });

  const rangePoints = uniqWith(unsortedRangePoints.sort(Point.compare), Point.equals);
  if (rangePoints.length < 2) return [];

  const flatRanges = Array(rangePoints.length - 1).fill(null).map((_, i) => ({
    anchor: rangePoints[i],
    focus: rangePoints[i + 1],
  }));

  const flatUpdates = flatRanges.map((flatRange) => {
    const intersectingUpdates = updatedProperties.filter(({ rangeRef }) => {
      const range = rangeRef.current;
      if (!range) return false;
      const intersection = Range.intersection(range, flatRange);
      if (!intersection) return false;
      return Range.isExpanded(intersection);
    });

    if (intersectingUpdates.length === 0) return null;

    const initialProps = intersectingUpdates[0].properties;

    const finalProps = intersectingUpdates.reduce((props, { newProperties }) => ({
      ...props,
      ...newProperties,
    }), initialProps);

    // if (isEqual(initialProps, finalProps)) return null;

    const diffProps: Record<string, any> = {};

    Object.keys(finalProps).forEach((key) => {
      if (initialProps[key] !== finalProps[key]) {
        diffProps[key] = finalProps[key];
      }
    });

    Object.keys(initialProps).forEach((key) => {
      if (!(key in finalProps)) {
        diffProps[key] = undefined;
      }
    });

    return {
      range: flatRange,
      diffProps,
    };
  });

  updatedProperties.forEach(({ rangeRef }) => {
    rangeRef.unref();
  });

  return flatUpdates.filter(Boolean) as Exclude<typeof flatUpdates[number], null>[];
};

const insertTextSuggestion = (
  editor: PlateEditor,
  op: TInsertTextOperation,
) => {
  const anchor = { path: op.path, offset: op.offset };
  editor.apply(op);
  const focus = { path: op.path, offset: op.offset + op.text.length };
  const rangeRef = createRangeRef(editor, { anchor, focus });
  insertedRanges.push({ rangeRef });
  // const text = op.text;
  // const id = idFactory();

  // const target = getNode(editor, op.path);

  // insertNodes<TSuggestionText>(
  //   editor,
  //   {
  //     ...target,
  //     text,
  //     ...getSuggestionProps(editor, id),
  //   },
  //   {
  //     at: {
  //       path: op.path,
  //       offset: op.offset,
  //     },
  //   }
  // );

  // Assume selection is collapsed
};

export const insertNodeSuggestion = (
  editor: PlateEditor,
  op: TInsertNodeOperation,
) => {
  editor.apply(op);
  const pathRef = createPathRef(editor, op.path);
  insertedNodes.push({ pathRef });
};

export const mergeNodeSuggestion = (
  editor: PlateEditor,
  op: TMergeNodeOperation,
) => {
  const { path } = op;

  const node = getNode<TDescendant>(editor, path);
  if (!node) return;

  const prevPath = getPreviousPath(path);
  if (!prevPath) return;

  const prev = getNode<TDescendant>(editor, prevPath);
  if (!prev) return;

  // Get the range of merged children
  const endOfPrev = getEndPoint(editor, prevPath);
  editor.apply(op);
  const endOfMerged = getEndPoint(editor, prevPath);

  const mergedRange = {
    anchor: endOfPrev,
    focus: endOfMerged,
  };

  const mergedRangeRef = createRangeRef(editor, mergedRange);

  const nodeProps = getNodeProps(node);
  const prevProps = getNodeProps(prev);
  // const propsEqual = true; // isEqual(nodeProps, prevProps);

  // Element case
  if (!isText(node) || !isText(prev)) {
    insertedRanges.push({ rangeRef: mergedRangeRef });

    removedNodes.push({
      pointRef: createPointRef(editor, endOfMerged),
      nodes: [node],
      isFragment: false,
    });
    return;
  }

  // Text case
  updatedProperties.push({
    rangeRef: mergedRangeRef,
    properties: nodeProps,
    newProperties: prevProps,
  });
};

export const splitNodeSuggestion = (
  editor: PlateEditor,
  op: TSplitNodeOperation,
) => {
  const { path } = op;

  const node = getNode<TDescendant>(editor, path);
  if (!node) return;

  const nodeProps = getNodeProps(node);

  editor.apply(op);

  const nextPath = [...path.slice(0, -1), path[path.length - 1] + 1];

  const range = {
    anchor: getStartPoint(editor, nextPath),
    focus: getEndPoint(editor, nextPath),
  };

  const rangeRef = createRangeRef(editor, range);

  updatedProperties.push({
    rangeRef,
    properties: nodeProps,
    newProperties: op.properties,
  });
};

// export const mergeNodeSuggestion = (
//   editor: PlateEditor,
//   op: TMergeNodeOperation,
//   {
//     idFactory,
//   }: {
//     idFactory: () => string;
//   }
// ) => {
//   const { path } = op;
//   const node = getNode<TDescendant>(editor, path);
// 
//   if (!node) return;
// 
//   const prevPath = getPreviousPath(path);
//   if (!prevPath) return;
// 
//   const prev = getNode<TDescendant>(editor, prevPath);
//   if (!prev) return;
// 
//   const parent = getNodeParent(editor, path);
//   if (!parent) return;
// 
//   if (isText(node) && isText(prev)) {
//     removeTextSuggestion(
//       editor,
//       {
//         type: 'remove_text',
//         path: path,
//         offset: 0,
//         text: node.text,
//       },
//       { idFactory }
//     );
// 
//     insertNodeSuggestion(
//       editor,
//       {
//         type: 'insert_node',
//         node: {
//           ...prev,
//           text: node.text,
//         },
//         path: Path.next(path),
//       },
//       { idFactory }
//     );
//   } else if (!isText(node) && !isText(prev)) {
//     let index = prev.children.length;
//     node.children.forEach((child) => {
//       insertNodeSuggestion(
//         editor,
//         {
//           type: 'insert_node',
//           node: child,
//           path: prevPath.concat([index]),
//         },
//         { idFactory }
//       );
//       index += 1;
//     });
// 
//     removeNodeSuggestion(
//       editor,
//       {
//         type: 'remove_node',
//         path,
//         node,
//       },
//       { idFactory }
//     );
//   } else {
//     return;
//   }
// };

export const removeTextSuggestion = (
  editor: PlateEditor,
  op: TRemoveTextOperation,
) => {
  const range = {
    anchor: { path: op.path, offset: op.offset },
    focus: { path: op.path, offset: op.offset + op.text.length },
  };
  const fragment = getFragment(editor, range);
  editor.apply(op);
  const pointRef = createPointRef(editor, range.anchor);
  removedNodes.push({ pointRef, nodes: fragment, isFragment: true });
  // const id = idFactory();

  // addRangeMarks(
  //   editor,
  //   getSuggestionProps(editor, id, { suggestionDeletion: true }),
  //   {
  //     at: {
  //       anchor: {
  //         path: op.path,
  //         offset: op.offset,
  //       },
  //       focus: {
  //         path: op.path,
  //         offset: op.offset + op.text.length,
  //       },
  //     },
  //   }
  // );
};

export const removeNodeSuggestion = (
  editor: PlateEditor,
  op: TRemoveNodeOperation,
  {
    idFactory,
  }: {
    idFactory: () => string;
  }
) => {
  setNodes(
    editor,
    getSuggestionProps(editor, idFactory(), {
      suggestionDeletion: true,
    }),
    { at: op.path }
  );
};

export const applyDiffToSuggestions = (
  editor: PlateEditor,
  diffOperations: TOperation[],
  {
    idFactory = nanoid,
  }: {
    idFactory?: () => string;
  } = {}
) => {
  withoutNormalizing(editor, () => {
    diffOperations.forEach((op) => {
      switch (op.type) {
        case 'insert_text': {
          insertTextSuggestion(editor, op);
          return;
        }
        case 'remove_text': {
          removeTextSuggestion(editor, op);
          return;
        }
        case 'insert_node': {
          insertNodeSuggestion(editor, op);
          return;
        }
        case 'remove_node': {
          // removeNodeSuggestion(editor, op, { idFactory });
          editor.apply(op);
          return;
        }
        case 'merge_node': {
          mergeNodeSuggestion(editor, op);
          return;
        }
        case 'split_node': {
          splitNodeSuggestion(editor, op);
          return;
        }
        case 'set_node': {
          editor.apply(op);
          return;
        }
        case 'move_node': {
          // never
          editor.apply(op);
          return;
        }
        case 'set_selection': {
          // never
          editor.apply(op);
          return;
        }
        // No default
      }
    });

    insertedNodes.forEach(({ pathRef }) => {
      const path = pathRef.current;
      if (path) {
        const node = getNode(editor, path);
        if (node) {
          setNodes(
            editor,
            getSuggestionProps(editor, idFactory()),
            { at: path }
          );
        }
      }
    });

    insertedRanges.forEach(({ rangeRef }) => {
      const range = rangeRef.current;
      if (range) {
        addRangeMarks(
          editor,
          getSuggestionProps(editor, idFactory()),
          { at: range }
        );
      }
      rangeRef.unref();
    });

    removedNodes.forEach(({ pointRef, nodes, isFragment }) => {
      const point = pointRef.current;
      if (point) {
        const suggestionProps = getSuggestionProps(editor, idFactory(), {
          suggestionDeletion: true,
        });

        if (isFragment) {
          const fragmentWithSuggestion = addPropsToTextsInFragment(
            nodes,
            suggestionProps
          );

          insertFragment(editor, fragmentWithSuggestion, {
            at: point,
          });
        } else {
          const nodesWithSuggestion = nodes.map((node) => ({
            ...node,
            ...suggestionProps,
          }));

          insertNodes(editor, nodesWithSuggestion, {
            at: point,
          });
        }
      }
      pointRef.unref();
    });

    const flatUpdates = handleUpdatedProperties();

    flatUpdates.forEach(({ range, diffProps }) => {
      addRangeMarks(
        editor,
        {
          suggestionUpdate: diffProps,
        },
        { at: range }
      );
    });
  });

  insertedNodes = [];
  insertedRanges = [];
  removedNodes = [];
  updatedProperties = [];

  // console.log(JSON.stringify(editor.children, null, 2));
};
