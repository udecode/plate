import { addRangeMarks, TText } from '@udecode/plate-common';
import isEqual from 'lodash/isEqual.js';
import uniqWith from 'lodash/uniqWith.js';
import {
  BaseEditor,
  Editor,
  InsertTextOperation,
  MergeNodeOperation,
  Node,
  Operation,
  Path,
  Point,
  PointRef,
  Range,
  RangeRef,
  RemoveTextOperation,
  SetNodeOperation,
  SplitNodeOperation,
} from 'slate';

import { ComputeDiffOptions } from '../../computeDiff';

export interface ChangeTrackingEditor {
  propsChanges: {
    rangeRef: RangeRef;
    properties: Record<string, any>;
    newProperties: Record<string, any>;
  }[];

  insertedTexts: {
    rangeRef: RangeRef;
    node: TText;
  }[];

  removedTexts: {
    pointRef: PointRef;
    node: TText;
  }[];

  recordingOperations: boolean;
  commitChangesToDiffs: () => void;
}

export const withChangeTracking = <E extends BaseEditor>(
  editor: E,
  options: ComputeDiffOptions
): E & ChangeTrackingEditor => {
  const e = editor as E & ChangeTrackingEditor;

  e.propsChanges = [];
  e.insertedTexts = [];
  e.removedTexts = [];
  e.recordingOperations = true;

  const { apply } = e;
  e.apply = (op) => applyWithChangeTracking(e, apply, op);

  e.commitChangesToDiffs = () => commitChangesToDiffs(e, options);

  return e;
};

const applyWithChangeTracking = <E extends BaseEditor>(
  editor: E & ChangeTrackingEditor,
  apply: E['apply'],
  op: Operation
) => {
  if (!editor.recordingOperations) {
    return apply(op);
  }

  withoutRecordingOperations(editor, () => {
    switch (op.type) {
      case 'insert_text': {
        applyInsertText(editor, apply, op);
        break;
      }

      case 'remove_text': {
        applyRemoveText(editor, apply, op);
        break;
      }

      case 'merge_node': {
        applyMergeNode(editor, apply, op);
        break;
      }

      case 'split_node': {
        applySplitNode(editor, apply, op);
        break;
      }

      case 'set_node': {
        applySetNode(editor, apply, op);
        break;
      }

      default: {
        apply(op);
      }
    }
  });
};

const applyInsertText = <E extends BaseEditor>(
  editor: E & ChangeTrackingEditor,
  apply: E['apply'],
  op: InsertTextOperation
) => {
  const node = Node.get(editor, op.path) as TText;

  apply(op);

  const startPoint = { path: op.path, offset: op.offset };
  const endPoint = { path: op.path, offset: op.offset + op.text.length };
  const range = { anchor: startPoint, focus: endPoint };
  const rangeRef = Editor.rangeRef(editor, range);

  editor.insertedTexts.push({
    rangeRef,
    node: {
      ...node,
      text: op.text,
    },
  });
};

const applyRemoveText = <E extends BaseEditor>(
  editor: E & ChangeTrackingEditor,
  apply: E['apply'],
  op: RemoveTextOperation
) => {
  const node = Node.get(editor, op.path) as TText;

  apply(op);

  const point = { path: op.path, offset: op.offset };
  const pointRef = Editor.pointRef(editor, point, {
    affinity: 'backward',
  });

  editor.removedTexts.push({
    pointRef,
    node: {
      ...node,
      text: op.text,
    },
  });
};

const applyMergeNode = <E extends BaseEditor>(
  editor: E & ChangeTrackingEditor,
  apply: E['apply'],
  op: MergeNodeOperation
) => {
  const oldNode = Node.get(editor, op.path) as TText;
  const properties = Node.extractProps(oldNode);

  const prevNodePath = Path.previous(op.path);
  const prevNode = Node.get(editor, prevNodePath) as TText;
  const newProperties = Node.extractProps(prevNode);

  apply(op);

  const startPoint = { path: prevNodePath, offset: prevNode.text.length };
  const endPoint = Editor.end(editor, prevNodePath);
  const range = { anchor: startPoint, focus: endPoint };
  const rangeRef = Editor.rangeRef(editor, range);

  editor.propsChanges.push({
    rangeRef,
    properties,
    newProperties,
  });
};

const applySplitNode = <E extends BaseEditor>(
  editor: E & ChangeTrackingEditor,
  apply: E['apply'],
  op: SplitNodeOperation
) => {
  const oldNode = Node.get(editor, op.path) as TText;
  const properties = Node.extractProps(oldNode);
  const newProperties = op.properties;

  apply(op);

  const newNodePath = Path.next(op.path);
  const newNodeRange = Editor.range(editor, newNodePath);
  const rangeRef = Editor.rangeRef(editor, newNodeRange);

  editor.propsChanges.push({
    rangeRef,
    properties,
    newProperties,
  });
};

const applySetNode = <E extends BaseEditor>(
  editor: E & ChangeTrackingEditor,
  apply: E['apply'],
  op: SetNodeOperation
) => {
  apply(op);

  const range = Editor.range(editor, op.path);
  const rangeRef = Editor.rangeRef(editor, range);

  editor.propsChanges.push({
    rangeRef,
    properties: op.properties,
    newProperties: op.newProperties,
  });
};

const commitChangesToDiffs = <E extends BaseEditor>(
  editor: E & ChangeTrackingEditor,
  { getInsertProps, getDeleteProps, getUpdateProps }: ComputeDiffOptions
) => {
  withoutRecordingOperations(editor, () => {
    editor.removedTexts.forEach(({ pointRef, node }) => {
      const point = pointRef.current;

      if (point) {
        editor.insertNode(
          {
            ...node,
            ...getDeleteProps(node),
          },
          { at: point }
        );
      }

      pointRef.unref();
    });

    // Reverse the array to prevent path changes
    const flatUpdates = flattenPropsChanges(editor).reverse();

    flatUpdates.forEach(({ range, properties, newProperties }) => {
      const node = Node.get(editor, range.anchor.path) as TText;

      addRangeMarks(
        editor as any,
        getUpdateProps(node, properties, newProperties),
        { at: range }
      );
    });

    editor.insertedTexts.forEach(({ rangeRef, node }) => {
      const range = rangeRef.current;

      if (range) {
        addRangeMarks(editor as any, getInsertProps(node), { at: range });
      }

      rangeRef.unref();
    });
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
    unsortedRangePoints.sort(Point.compare),
    Point.equals
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
        const intersection = Range.intersection(range, flatRange);
        if (!intersection) return false;
        return Range.isExpanded(intersection);
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

    const properties = {} as Record<string, any>;
    const newProperties = {} as Record<string, any>;

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
      range: flatRange,
      properties,
      newProperties,
    };
  });

  propChangeRangeRefs.forEach((rangeRef) => rangeRef.unref());

  return flatUpdates.filter(Boolean) as Exclude<
    (typeof flatUpdates)[number],
    null
  >[];
};

const objectWithoutUndefined = (obj: Record<string, any>) => {
  const newObj: Record<string, any> = {};

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
