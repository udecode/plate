import isEqual from 'lodash/isEqual.js';
import uniqWith from 'lodash/uniqWith.js';
import {
  type EditorUpdateTransaction,
  type Editor,
  type Operation,
  type PointRef,
  type RangeRef,
  type Range,
  type Value,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  TextApi,
  type Text,
} from '@platejs/plite';

import type { ComputeDiffOptions } from '../../lib/computeDiff';

type InsertTextOperation = Extract<Operation<Value>, { type: 'insert_text' }>;
type MergeNodeOperation = Extract<Operation<Value>, { type: 'merge_node' }>;
type RemoveTextOperation = Extract<Operation<Value>, { type: 'remove_text' }>;
type SetNodeOperation = Extract<Operation<Value>, { type: 'set_node' }>;
type SplitNodeOperation = Extract<Operation<Value>, { type: 'split_node' }>;

type ChangeTrackingState = {
  insertedTexts: {
    node: Text;
    rangeRef: RangeRef;
  }[];

  propsChanges: {
    newProperties: Record<string, unknown>;
    properties: Record<string, unknown>;
    rangeRef: RangeRef;
  }[];

  recordingOperations: boolean;

  removedTexts: {
    node: Text;
    pointRef: PointRef;
  }[];
};

export type ChangeTrackingSession<E extends Editor<Value>> = {
  editor: E;
  applyOperation: (
    tx: EditorUpdateTransaction<Value>,
    operation: Operation<Value>
  ) => void;
  commitChangesToDiffs: (tx: EditorUpdateTransaction<Value>) => void;
};

export const withChangeTracking = <E extends Editor<Value>>(
  editor: E,
  options: ComputeDiffOptions
): ChangeTrackingSession<E> => {
  const state: ChangeTrackingState = {
    insertedTexts: [],
    propsChanges: [],
    recordingOperations: true,
    removedTexts: [],
  };

  return {
    editor,
    applyOperation: (tx, op) => applyWithChangeTracking(editor, state, tx, op),
    commitChangesToDiffs: (tx) =>
      commitChangesToDiffs(editor, state, tx, options),
  };
};

const applyWithChangeTracking = <E extends Editor<Value>>(
  editor: E,
  state: ChangeTrackingState,
  tx: EditorUpdateTransaction<Value>,
  op: Operation<Value>
) => {
  if (!state.recordingOperations) {
    tx.operations.replay([op]);
    return;
  }

  withoutRecordingOperations(state, () => {
    switch (op.type) {
      case 'insert_text': {
        applyInsertText(editor, state, tx, op);

        break;
      }
      case 'merge_node': {
        applyMergeNode(editor, state, tx, op);

        break;
      }
      case 'remove_text': {
        applyRemoveText(editor, state, tx, op);

        break;
      }
      case 'set_node': {
        applySetNode(editor, state, tx, op);

        break;
      }
      case 'split_node': {
        applySplitNode(editor, state, tx, op);

        break;
      }

      default: {
        tx.operations.replay([op]);
      }
    }
  });
};

const applyInsertText = <E extends Editor<Value>>(
  editor: E,
  state: ChangeTrackingState,
  tx: EditorUpdateTransaction<Value>,
  op: InsertTextOperation
) => {
  const node = NodeApi.get(editor, op.path) as Text;

  tx.operations.replay([op]);

  const startPoint = { offset: op.offset, path: op.path };
  const endPoint = { offset: op.offset + op.text.length, path: op.path };
  const range = { anchor: startPoint, focus: endPoint };
  const rangeRef = tx.refs.range(range, { affinity: 'forward' });

  state.insertedTexts.push({
    node: {
      ...node,
      text: op.text,
    },
    rangeRef,
  });
};

const applyRemoveText = <E extends Editor<Value>>(
  editor: E,
  state: ChangeTrackingState,
  tx: EditorUpdateTransaction<Value>,
  op: RemoveTextOperation
) => {
  const node = NodeApi.get(editor, op.path) as Text;

  tx.operations.replay([op]);

  const point = { offset: op.offset, path: op.path };
  const pointRef = tx.refs.point(point, {
    affinity: 'backward',
  });

  state.removedTexts.push({
    node: {
      ...node,
      text: op.text,
    },
    pointRef,
  });
};

const applyMergeNode = <E extends Editor<Value>>(
  editor: E,
  state: ChangeTrackingState,
  tx: EditorUpdateTransaction<Value>,
  op: MergeNodeOperation
) => {
  const oldNode = NodeApi.get(editor, op.path) as Text;
  const properties = NodeApi.extractProps(oldNode);

  const prevNodePath = PathApi.previous(op.path)!;
  const prevNode = NodeApi.get(editor, prevNodePath) as Text;
  const newProperties = NodeApi.extractProps(prevNode);

  tx.operations.replay([op]);

  const startPoint = { offset: prevNode.text.length, path: prevNodePath };
  const endPoint = editor.read.points.end(prevNodePath);

  if (!endPoint) {
    throw new Error('Change tracking merge replay produced no end point.');
  }

  const range = { anchor: startPoint, focus: endPoint };
  const rangeRef = tx.refs.range(range);

  state.propsChanges.push({
    newProperties,
    properties,
    rangeRef,
  });
};

const applySplitNode = <E extends Editor<Value>>(
  editor: E,
  state: ChangeTrackingState,
  tx: EditorUpdateTransaction<Value>,
  op: SplitNodeOperation
) => {
  const oldNode = NodeApi.get(editor, op.path) as Text;
  const properties = NodeApi.extractProps(oldNode);
  const newProperties = op.properties;

  tx.operations.replay([op]);

  const newNodePath = PathApi.next(op.path);
  const newNodeRange = editor.read.ranges.get(newNodePath);

  if (!newNodeRange) {
    throw new Error('Change tracking split replay produced no node range.');
  }

  const rangeRef = tx.refs.range(newNodeRange);

  state.propsChanges.push({
    newProperties,
    properties,
    rangeRef,
  });
};

const applySetNode = <E extends Editor<Value>>(
  editor: E,
  state: ChangeTrackingState,
  tx: EditorUpdateTransaction<Value>,
  op: SetNodeOperation
) => {
  tx.operations.replay([
    {
      ...op,
      newProperties: objectWithoutUndefined(op.newProperties),
    },
  ]);

  const range = editor.read.ranges.get(op.path);

  if (!range) {
    throw new Error('Change tracking set-node replay produced no node range.');
  }

  const rangeRef = tx.refs.range(range);

  state.propsChanges.push({
    newProperties: op.newProperties,
    properties: op.properties,
    rangeRef,
  });
};

const commitChangesToDiffs = <E extends Editor<Value>>(
  editor: E,
  state: ChangeTrackingState,
  tx: EditorUpdateTransaction<Value>,
  { getDeleteProps, getInsertProps, getUpdateProps }: ComputeDiffOptions
) => {
  withoutRecordingOperations(state, () => {
    const resolvedRanges = new Map(
      [...state.propsChanges, ...state.insertedTexts].map(({ rangeRef }) => [
        rangeRef,
        rangeRef.unref(),
      ])
    );
    const insertedRangeRefs = new Map(
      state.insertedTexts.map(({ rangeRef }) => {
        const range = resolvedRanges.get(rangeRef);

        return [
          rangeRef,
          range ? tx.refs.range(range, { affinity: rangeRef.affinity }) : null,
        ];
      })
    );
    const flatUpdates = flattenPropsChanges(state, resolvedRanges).reverse();

    // Reverse the array to prevent path changes
    flatUpdates.forEach(({ newProperties, properties, range }) => {
      const node = NodeApi.get(editor, range.anchor.path) as Text;

      tx.nodes.set(getUpdateProps(node, properties, newProperties), {
        at: range,
        match: TextApi.isText,
        split: true,
      });
    });

    state.insertedTexts.forEach(({ node, rangeRef }) => {
      const range = insertedRangeRefs.get(rangeRef)?.unref();

      if (range) {
        tx.nodes.set(getInsertProps(node), {
          at: range,
          match: TextApi.isText,
          split: true,
        });
      }
    });

    state.removedTexts.forEach(({ node, pointRef }) => {
      const point = pointRef.unref();

      if (point) {
        tx.nodes.insert(
          {
            ...node,
            ...getDeleteProps(node),
          },
          { at: point }
        );
      }
    });
  });
};

const flattenPropsChanges = (
  state: ChangeTrackingState,
  resolvedRanges: Map<RangeRef, Range | null>
) => {
  const propChangeRangeRefs = state.propsChanges.map(
    ({ rangeRef }) => rangeRef
  );

  const insertedTextRangeRefs = state.insertedTexts.map(
    ({ rangeRef }) => rangeRef
  );

  /**
   * The set of points at which some range starts or ends. Insertion ranges are
   * included because we don't want to return props changes for them.
   */
  const unsortedRangePoints = [
    ...propChangeRangeRefs,
    ...insertedTextRangeRefs,
  ].flatMap((rangeRef) => {
    const range = resolvedRanges.get(rangeRef);

    if (!range) return [];

    return [range.anchor, range.focus];
  });

  const rangePoints = uniqWith(
    unsortedRangePoints.sort(PointApi.compare),
    PointApi.equals
  );

  if (rangePoints.length < 2) return [];

  /**
   * A continuous set of non-overlapping ranges spanning the first and last
   * `rangePoints`.
   */
  const flatRanges = Array.from({ length: rangePoints.length - 1 })
    .fill(null)
    .map((_, i) => ({
      anchor: rangePoints[i],
      focus: rangePoints[i + 1],
    }));

  const flatUpdates = flatRanges.map((flatRange) => {
    // The set of changes of a certain type that intersect with `flatRange`
    const getIntersectingChanges = <T extends { rangeRef: RangeRef }>(
      changes: T[]
    ) =>
      changes.filter(({ rangeRef }) => {
        const range = resolvedRanges.get(rangeRef);

        if (!range) return false;

        const intersection = RangeApi.intersection(range, flatRange);

        if (!intersection) return false;

        return RangeApi.isExpanded(intersection);
      });

    // If the range is part of an insertion, return null
    if (getIntersectingChanges(state.insertedTexts).length > 0) return null;

    const intersectingUpdates = getIntersectingChanges(state.propsChanges);

    if (intersectingUpdates.length === 0) return null;

    // Get the props of the range before and after the updates
    const initialProps = objectWithoutUndefined(
      intersectingUpdates[0].properties
    );

    const finalProps = objectWithoutUndefined(
      intersectingUpdates.at(-1)!.newProperties
    );

    if (isEqual(initialProps, finalProps)) return null;

    const properties: Record<string, unknown> = {};
    const newProperties: Record<string, unknown> = {};

    for (const key of Object.keys(finalProps)) {
      if (!isEqual(initialProps[key], finalProps[key])) {
        properties[key] = initialProps[key];
        newProperties[key] = finalProps[key];
      }
    }

    for (const key of Object.keys(initialProps)) {
      if (finalProps[key] === undefined) {
        properties[key] = initialProps[key];
        newProperties[key] = undefined;
      }
    }

    return {
      newProperties,
      properties,
      range: flatRange,
    };
  });

  return flatUpdates.filter(Boolean) as Exclude<
    (typeof flatUpdates)[number],
    null
  >[];
};

const objectWithoutUndefined = (obj: Record<string, unknown>) => {
  const newObj: Record<string, unknown> = {};

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

const withoutRecordingOperations = (
  state: ChangeTrackingState,
  fn: () => void
) => {
  const previous = state.recordingOperations;

  state.recordingOperations = false;

  try {
    fn();
  } finally {
    state.recordingOperations = previous;
  }
};
