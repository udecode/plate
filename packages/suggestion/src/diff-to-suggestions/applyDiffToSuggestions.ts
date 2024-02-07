import {
  addRangeMarks,
  createPathRef,
  createPointRef,
  createRangeRef,
  getEndPoint,
  getFragment,
  getNode,
  getNodeProps,
  getPreviousPath,
  getStartPoint,
  insertFragment,
  insertNodes,
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
  withoutNormalizing,
} from '@udecode/plate-common';
import isEqual from 'lodash/isEqual.js';
import uniqWith from 'lodash/uniqWith.js';
import { PathRef, Point, PointRef, Range, RangeRef } from 'slate';

import { getSuggestionProps } from '../transforms';

const objectWithoutUndefined = (obj: Record<string, any>) => {
  const newObj: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

const addPropsToTextsInFragment = (
  fragment: TDescendant[],
  props: any
): TDescendant[] => {
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
  locationRef: PathRef | PointRef;
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

  const rangePoints = uniqWith(
    unsortedRangePoints.sort(Point.compare),
    Point.equals
  );
  if (rangePoints.length < 2) return [];

  const flatRanges = Array.from({ length: rangePoints.length - 1 })
    .fill(null)
    .map((_, i) => ({
      anchor: rangePoints[i],
      focus: rangePoints[i + 1],
    }));

  // console.log('flatRanges', JSON.stringify(flatRanges, null, 2));

  const flatUpdates = flatRanges.map((flatRange, i) => {
    const debug = i == 1;

    const intersectingUpdates = updatedProperties.filter(({ rangeRef }) => {
      const range = rangeRef.current;
      if (!range) return false;
      const intersection = Range.intersection(range, flatRange);
      if (!intersection) return false;
      return Range.isExpanded(intersection);
    });

    if (debug) {
      // console.log('flatRange', flatRange);
      // console.log('intersectingUpdates', intersectingUpdates);
    }

    if (intersectingUpdates.length === 0) return null;

    const initialProps = objectWithoutUndefined(
      intersectingUpdates[0].properties
    );

    // const finalProps = intersectingUpdates.reduce((props, { newProperties }) => ({
    //   ...props,
    //   ...newProperties,
    // }), initialProps);

    const finalProps = objectWithoutUndefined(
      intersectingUpdates.at(-1)!.newProperties
    );

    if (isEqual(initialProps, finalProps)) return null;

    if (debug) {
      // console.log('initialProps', initialProps);
      // console.log('finalProps', finalProps);
    }

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

  return flatUpdates.filter(Boolean) as Exclude<
    (typeof flatUpdates)[number],
    null
  >[];
};

const insertTextSuggestion = (
  editor: PlateEditor,
  op: TInsertTextOperation
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
  op: TInsertNodeOperation
) => {
  editor.apply(op);
  const pathRef = createPathRef(editor, op.path);
  insertedNodes.push({ pathRef });
};

export const mergeNodeSuggestion = (
  editor: PlateEditor,
  op: TMergeNodeOperation
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
      locationRef: createPointRef(editor, endOfMerged),
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
  op: TSplitNodeOperation
) => {
  const { path } = op;

  const node = getNode<TDescendant>(editor, path);
  if (!node) return;

  const nodeProps = getNodeProps(node);

  editor.apply(op);

  const nextPath = [...path.slice(0, -1), path.at(-1)! + 1];

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
  op: TRemoveTextOperation
) => {
  const range = {
    anchor: { path: op.path, offset: op.offset },
    focus: { path: op.path, offset: op.offset + op.text.length },
  };
  const fragment = getFragment(editor, range);
  editor.apply(op);
  const pointRef = createPointRef(editor, range.anchor);
  removedNodes.push({
    locationRef: pointRef,
    nodes: fragment,
    isFragment: true,
  });
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
  op: TRemoveNodeOperation
) => {
  // const pointBefore = getPointBefore(editor, op.path);
  // const locationRef = pointBefore
  //   ? createPointRef(editor, pointBefore)
  //   : createPathRef(editor, op.path);

  // console.log('removeNodeSuggestion', op.path, pointBefore, locationRef.current);

  editor.apply(op);

  let nodes = [op.node];

  /**
   * If the current remove invalidated the PathRef of any previous remove,
   * insert the previous remove's nodes into the current remove's node list.
   */
  removedNodes.forEach((removedNodeEntry) => {
    const { locationRef, nodes: oldNodes } = removedNodeEntry;
    if (locationRef.current === null) {
      nodes = [...oldNodes, ...nodes];
      removedNodeEntry.nodes = [];
    }
  });

  const locationRef = createPathRef(editor, op.path);
  removedNodes.push({ locationRef, nodes, isFragment: false });
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
          removeNodeSuggestion(editor, op);
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
          setNodes(editor, getSuggestionProps(editor, idFactory()), {
            at: path,
          });
        }
      }
    });

    insertedRanges.forEach(({ rangeRef }) => {
      const range = rangeRef.current;
      if (range) {
        addRangeMarks(editor, getSuggestionProps(editor, idFactory()), {
          at: range,
        });
      }
      rangeRef.unref();
    });

    removedNodes.forEach(({ locationRef, nodes, isFragment }) => {
      const location = locationRef.current;
      // console.log({ location, nodes, isFragment });
      if (location) {
        const suggestionProps = getSuggestionProps(editor, idFactory(), {
          suggestionDeletion: true,
        });

        if (isFragment) {
          const fragmentWithSuggestion = addPropsToTextsInFragment(
            nodes,
            suggestionProps
          );

          // console.log('fragmentWithSuggestion', fragmentWithSuggestion);

          insertFragment(editor, fragmentWithSuggestion, {
            at: location,
          });
        } else {
          const nodesWithSuggestion = nodes.map((node) => ({
            ...node,
            ...suggestionProps,
          }));

          insertNodes(editor, nodesWithSuggestion, {
            at: location,
          });
        }
      }
      locationRef.unref();
    });

    // Reverse the array to prevent path changes
    const flatUpdates = handleUpdatedProperties().reverse();

    // console.log('flatUpdates', JSON.stringify(flatUpdates, null, 2));

    flatUpdates.forEach(({ range, diffProps }) => {
      addRangeMarks(
        editor,
        {
          ...getSuggestionProps(editor, idFactory()),
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
