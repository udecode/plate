import isEqual from 'lodash/isEqual.js';
import uniqWith from 'lodash/uniqWith.js';
import {
  type EditorUpdateTransaction,
  type Editor,
  type Operation,
  type PointRef,
  type RangeRef,
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

export type ChangeTrackingEditor = {
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
  applyOperation: (
    tx: EditorUpdateTransaction<Value>,
    operation: Operation<Value>
  ) => void;
  commitChangesToDiffs: (tx: EditorUpdateTransaction<Value>) => void;
};

export const withChangeTracking = <E extends Editor<Value>>(
  editor: E,
  options: ComputeDiffOptions
): ChangeTrackingEditor & E => {
  const e = editor as ChangeTrackingEditor & E;

  e.propsChanges = [];
  e.insertedTexts = [];
  e.removedTexts = [];
  e.recordingOperations = true;

  e.applyOperation = (tx, op) => applyWithChangeTracking(e, tx, op);

  e.commitChangesToDiffs = (tx) => commitChangesToDiffs(e, tx, options);

  return e;
};

const applyWithChangeTracking = <E extends Editor<Value>>(
  editor: ChangeTrackingEditor & E,
  tx: EditorUpdateTransaction<Value>,
  op: Operation<Value>
) => {
  if (!editor.recordingOperations) {
    tx.operations.replay([op], { normalize: false });
    return;
  }

  withoutRecordingOperations(editor, () => {
    switch (op.type) {
      case 'insert_text': {
        applyInsertText(editor, tx, op);

        break;
      }
      case 'merge_node': {
        applyMergeNode(editor, tx, op);

        break;
      }
      case 'remove_text': {
        applyRemoveText(editor, tx, op);

        break;
      }
      case 'set_node': {
        applySetNode(editor, tx, op);

        break;
      }
      case 'split_node': {
        applySplitNode(editor, tx, op);

        break;
      }

      default: {
        tx.operations.replay([op], { normalize: false });
      }
    }
  });
};

const applyInsertText = <E extends Editor<Value>>(
  editor: ChangeTrackingEditor & E,
  tx: EditorUpdateTransaction<Value>,
  op: InsertTextOperation
) => {
  const node = NodeApi.get(editor, op.path) as Text;

  tx.operations.replay([op], { normalize: false });

  const startPoint = { offset: op.offset, path: op.path };
  const endPoint = { offset: op.offset + op.text.length, path: op.path };
  const range = { anchor: startPoint, focus: endPoint };
  const rangeRef = tx.refs.range(range);

  editor.insertedTexts.push({
    node: {
      ...node,
      text: op.text,
    },
    rangeRef,
  });
};

const applyRemoveText = <E extends Editor<Value>>(
  editor: ChangeTrackingEditor & E,
  tx: EditorUpdateTransaction<Value>,
  op: RemoveTextOperation
) => {
  const node = NodeApi.get(editor, op.path) as Text;

  tx.operations.replay([op], { normalize: false });

  const point = { offset: op.offset, path: op.path };
  const pointRef = tx.refs.point(point, {
    affinity: 'backward',
  });

  editor.removedTexts.push({
    node: {
      ...node,
      text: op.text,
    },
    pointRef,
  });
};

const applyMergeNode = <E extends Editor<Value>>(
  editor: ChangeTrackingEditor & E,
  tx: EditorUpdateTransaction<Value>,
  op: MergeNodeOperation
) => {
  const oldNode = NodeApi.get(editor, op.path) as Text;
  const properties = NodeApi.extractProps(oldNode);

  const prevNodePath = PathApi.previous(op.path)!;
  const prevNode = NodeApi.get(editor, prevNodePath) as Text;
  const newProperties = NodeApi.extractProps(prevNode);

  tx.operations.replay([op], { normalize: false });

  const startPoint = { offset: prevNode.text.length, path: prevNodePath };
  const endPoint = editor.read.points.end(prevNodePath, { required: true });
  const range = { anchor: startPoint, focus: endPoint };
  const rangeRef = tx.refs.range(range);

  editor.propsChanges.push({
    newProperties,
    properties,
    rangeRef,
  });
};

const applySplitNode = <E extends Editor<Value>>(
  editor: ChangeTrackingEditor & E,
  tx: EditorUpdateTransaction<Value>,
  op: SplitNodeOperation
) => {
  const oldNode = NodeApi.get(editor, op.path) as Text;
  const properties = NodeApi.extractProps(oldNode);
  const newProperties = op.properties;

  tx.operations.replay([op], { normalize: false });

  const newNodePath = PathApi.next(op.path);
  const newNodeRange = editor.read.ranges.get(newNodePath, { required: true });
  const rangeRef = tx.refs.range(newNodeRange);

  editor.propsChanges.push({
    newProperties,
    properties,
    rangeRef,
  });
};

const applySetNode = <E extends Editor<Value>>(
  editor: ChangeTrackingEditor & E,
  tx: EditorUpdateTransaction<Value>,
  op: SetNodeOperation
) => {
  tx.operations.replay(
    [
      {
        ...op,
        newProperties: objectWithoutUndefined(op.newProperties),
      },
    ],
    { normalize: false }
  );

  const range = editor.read.ranges.get(op.path, { required: true });
  const rangeRef = tx.refs.range(range);

  editor.propsChanges.push({
    newProperties: op.newProperties,
    properties: op.properties,
    rangeRef,
  });
};

const commitChangesToDiffs = <E extends Editor<Value>>(
  editor: ChangeTrackingEditor & E,
  tx: EditorUpdateTransaction<Value>,
  { getDeleteProps, getInsertProps, getUpdateProps }: ComputeDiffOptions
) => {
  withoutRecordingOperations(editor, () => {
    // Reverse the array to prevent path changes
    const flatUpdates = flattenPropsChanges(editor).reverse();

    flatUpdates.forEach(({ newProperties, properties, range }) => {
      const node = NodeApi.get(editor, range.anchor.path) as Text;

      tx.nodes.set(getUpdateProps(node, properties, newProperties), {
        at: range,
        match: TextApi.isText,
        split: true,
      });
    });

    editor.removedTexts.forEach(
      ({ node, pointRef }: ChangeTrackingEditor['removedTexts'][number]) => {
        const point = pointRef.current;

        if (point) {
          tx.nodes.insert(
            {
              ...node,
              ...getDeleteProps(node),
            },
            { at: point }
          );
        }

        pointRef.unref();
      }
    );

    editor.insertedTexts.forEach(
      ({ node, rangeRef }: ChangeTrackingEditor['insertedTexts'][number]) => {
        const range = rangeRef.current;

        if (range) {
          tx.nodes.set(getInsertProps(node), {
            at: range,
            match: TextApi.isText,
            split: true,
          });
        }

        rangeRef.unref();
      }
    );
  });
};

const flattenPropsChanges = (editor: ChangeTrackingEditor) => {
  const propChangeRangeRefs = editor.propsChanges.map(
    ({ rangeRef }) => rangeRef
  );

  const insertedTextRangeRefs = editor.insertedTexts.map(
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
    const range = rangeRef.current;

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
        const range = rangeRef.current;

        if (!range) return false;

        const intersection = RangeApi.intersection(range, flatRange);

        if (!intersection) return false;

        return RangeApi.isExpanded(intersection);
      });

    // If the range is part of an insertion, return null
    if (getIntersectingChanges(editor.insertedTexts).length > 0) return null;

    const intersectingUpdates = getIntersectingChanges(editor.propsChanges);

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

  for (const rangeRef of propChangeRangeRefs) {
    rangeRef.unref();
  }

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
  editor: ChangeTrackingEditor,
  fn: () => void
) => {
  editor.recordingOperations = false;
  fn();
  editor.recordingOperations = true;
};
