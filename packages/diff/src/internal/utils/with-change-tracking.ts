import isEqual from 'lodash/isEqual.js';
import uniqWith from 'lodash/uniqWith.js';
import {
  type Editor,
  type InsertTextOperation,
  type MergeNodeOperation,
  type Node,
  type Operation,
  type Path,
  type Range,
  type PointRef,
  type RangeRef,
  type RemoveTextOperation,
  type SetNodeOperation,
  type SplitNodeOperation,
  type Value,
  ElementApi,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  TextApi,
  type Text,
} from '@platejs/plite';
import {
  insertNode as editorInsertNode,
  pointRef as editorPointRef,
  rangeRef as editorRangeRef,
  setNodes as editorSetNodes,
} from '@platejs/plite/internal';

import type { ComputeDiffOptions } from '../../lib/computeDiff';

type ApplyOperation = (operation: Operation) => void;

export type ChangeTrackingEditor = {
  editor: Editor;
  insertedTexts: {
    node: Text;
    rangeRef: RangeRef;
  }[];
  propsChanges: {
    newProperties: Record<string, any>;
    properties: Record<string, any>;
    rangeRef: RangeRef;
  }[];
  recordingOperations: boolean;
  removedTexts: {
    node: Text;
    pointRef: PointRef;
  }[];
  apply: (operation: Operation) => void;
  commitChangesToDiffs: () => void;
  getTextChildren: (path: Path) => Text[];
  replaceChildren: (children: Value) => void;
  withoutNormalizing: (fn: () => void) => void;
};

export const withChangeTracking = (
  editor: Editor,
  options: ComputeDiffOptions
): ChangeTrackingEditor => {
  let activeTx: Parameters<Parameters<Editor['update']>[0]>[0] | null = null;

  const readNode = (path: Path): Node => {
    if (activeTx) {
      return activeTx.nodes.get(path)[0];
    }

    return editor.read((state) => state.nodes.get(path)[0]);
  };

  const readRange = (path: Path) => {
    if (activeTx) {
      return activeTx.ranges.get(path);
    }

    return editor.read((state) => state.ranges.get(path));
  };

  const readEnd = (path: Path) => {
    if (activeTx) {
      return activeTx.points.end(path);
    }

    return editor.read((state) => state.points.end(path));
  };

  const apply = (operation: Operation) => {
    const replayOperation = cloneOperation(operation);

    if (activeTx) {
      activeTx.operations.replay([replayOperation]);
      return;
    }

    editor.update((tx) => {
      tx.operations.replay([replayOperation]);
    });
  };

  const tracker: ChangeTrackingEditor = {
    editor,
    insertedTexts: [],
    propsChanges: [],
    recordingOperations: true,
    removedTexts: [],
    apply: (operation) => applyWithChangeTracking(tracker, apply, operation),
    commitChangesToDiffs: () => commitChangesToDiffs(tracker, options),
    getTextChildren: (path) => {
      const node = editor.read((state) => state.nodes.get(path)[0]);

      if (!ElementApi.isElement(node) || !NodeApi.isNodeList(node.children)) {
        return [];
      }

      return node.children.filter(TextApi.isText);
    },
    replaceChildren: (children) => {
      editor.update((tx) => {
        tx.value.replace({ children });
      });
    },
    withoutNormalizing: (fn) => {
      editor.update((tx) => {
        const previousTx = activeTx;

        activeTx = tx;
        tx.withoutNormalizing(fn);
        activeTx = previousTx;
      });
    },
  };

  const applyInsertText = (op: InsertTextOperation) => {
    const node = readNode(op.path) as Text;

    apply(op);

    const startPoint = { offset: op.offset, path: op.path };
    const endPoint = { offset: op.offset + op.text.length, path: op.path };
    const range = { anchor: startPoint, focus: endPoint };
    const rangeRef = editorRangeRef(editor, range);

    tracker.insertedTexts.push({
      node: {
        ...node,
        text: op.text,
      },
      rangeRef,
    });
  };

  const applyRemoveText = (op: RemoveTextOperation) => {
    const node = readNode(op.path) as Text;

    apply(op);

    const point = { offset: op.offset, path: op.path };
    const pointRef = editorPointRef(editor, point, {
      affinity: 'backward',
    });

    tracker.removedTexts.push({
      node: {
        ...node,
        text: op.text,
      },
      pointRef,
    });
  };

  const applyMergeNode = (op: MergeNodeOperation) => {
    const oldNode = readNode(op.path) as Text;
    const properties = NodeApi.extractProps(oldNode);

    const prevNodePath = PathApi.previous(op.path)!;
    const prevNode = readNode(prevNodePath) as Text;
    const newProperties = NodeApi.extractProps(prevNode);

    apply(op);

    const startPoint = { offset: prevNode.text.length, path: prevNodePath };
    const endPoint = readEnd(prevNodePath);
    const range = { anchor: startPoint, focus: endPoint };
    const rangeRef = editorRangeRef(editor, range);

    tracker.propsChanges.push({
      newProperties,
      properties,
      rangeRef,
    });
  };

  const applySplitNode = (op: SplitNodeOperation) => {
    const oldNode = readNode(op.path) as Text;
    const properties = NodeApi.extractProps(oldNode);
    const newProperties = op.properties;

    apply(op);

    const newNodePath = PathApi.next(op.path);
    const newNodeRange = readRange(newNodePath);
    const rangeRef = editorRangeRef(editor, newNodeRange);

    tracker.propsChanges.push({
      newProperties,
      properties,
      rangeRef,
    });
  };

  const applySetNode = (op: SetNodeOperation) => {
    apply(op);

    const range = readRange(op.path);
    const rangeRef = editorRangeRef(editor, range);

    tracker.propsChanges.push({
      newProperties: op.newProperties,
      properties: op.properties,
      rangeRef,
    });
  };

  const applyWithChangeTracking = (
    editor: ChangeTrackingEditor,
    apply: ApplyOperation,
    op: Operation
  ) => {
    if (!editor.recordingOperations) {
      return apply(op);
    }

    withoutRecordingOperations(editor, () => {
      switch (op.type) {
        case 'insert_text': {
          applyInsertText(op);

          break;
        }
        case 'merge_node': {
          applyMergeNode(op);

          break;
        }
        case 'remove_text': {
          applyRemoveText(op);

          break;
        }
        case 'set_node': {
          applySetNode(op);

          break;
        }
        case 'split_node': {
          applySplitNode(op);

          break;
        }

        default: {
          apply(op);
        }
      }
    });
  };

  return tracker;
};

const commitChangesToDiffs = (
  editor: ChangeTrackingEditor,
  { getDeleteProps, getInsertProps, getUpdateProps }: ComputeDiffOptions
) => {
  withoutRecordingOperations(editor, () => {
    const insertedTexts = editor.insertedTexts.flatMap(({ node, rangeRef }) => {
      const range = rangeRef.unref();

      return range ? [{ node, range }] : [];
    });

    const propsChanges = editor.propsChanges.flatMap(
      ({ newProperties, properties, rangeRef }) => {
        const range = rangeRef.unref();

        return range ? [{ newProperties, properties, range }] : [];
      }
    );
    const insertedTextRefs = insertedTexts.map(({ node, range }) => ({
      node,
      rangeRef: editorRangeRef(editor.editor, range),
    }));

    // Reverse the array to prevent path changes.
    const flatUpdates = flattenPropsChanges(propsChanges, insertedTexts)
      .toSorted(compareRangeStart)
      .reverse();

    flatUpdates.forEach(({ newProperties, properties, range }) => {
      const node = editor.editor.read(
        (state) => state.nodes.get(range.anchor.path)[0]
      ) as Text;

      setTextNodes(
        editor,
        range,
        getUpdateProps(node, properties, newProperties)
      );
    });

    insertedTextRefs
      .flatMap(({ node, rangeRef }) => {
        const range = rangeRef.unref();

        return range ? [{ node, range }] : [];
      })
      .toSorted(compareRangeStart)
      .reverse()
      .forEach(({ node, range }) => {
        setTextNodes(editor, range, getInsertProps(node));
      });

    editor.removedTexts.forEach(({ node, pointRef }) => {
      const point = pointRef.unref();

      if (point) {
        editorInsertNode(
          editor.editor,
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
  propsChanges: {
    newProperties: Record<string, any>;
    properties: Record<string, any>;
    range: Range;
  }[],
  insertedTexts: {
    node: Text;
    range: Range;
  }[]
) => {
  /**
   * The set of points at which some range starts or ends. Insertion ranges are
   * included because we don't want to return props changes for them.
   */
  const unsortedRangePoints = [
    ...propsChanges.map(({ range }) => range),
    ...insertedTexts.map(({ range }) => range),
  ].flatMap((range) => [range.anchor, range.focus]);

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
    const getIntersectingChanges = <T extends { range: Range }>(changes: T[]) =>
      changes.filter(({ range }) => {
        const intersection = RangeApi.intersection(range, flatRange);

        if (!intersection) return false;

        return RangeApi.isExpanded(intersection);
      });

    if (getIntersectingChanges(insertedTexts).length > 0) return null;

    const intersectingUpdates = getIntersectingChanges(propsChanges);

    if (intersectingUpdates.length === 0) return null;

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
        if (initialProps[key] !== undefined) {
          properties[key] = initialProps[key];
        }
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

const compareRangeStart = (a: { range: Range }, b: { range: Range }) =>
  PointApi.compare(RangeApi.start(a.range), RangeApi.start(b.range));

const setTextNodes = (
  editor: ChangeTrackingEditor,
  range: Range,
  props: Record<string, any>
) => {
  const normalizedRange = normalizeTextRange(editor, range);

  if (!normalizedRange || RangeApi.isCollapsed(normalizedRange)) {
    return;
  }

  editorSetNodes(editor.editor, props, {
    at: normalizedRange,
    match: TextApi.isText,
    split: true,
  });
};

const normalizeTextRange = (
  editor: ChangeTrackingEditor,
  range: Range
): Range | null => {
  const [start, end] = RangeApi.edges(range);
  const normalizedEnd =
    end.offset === 0 && !PathApi.equals(start.path, end.path)
      ? previousTextEnd(editor, end.path)
      : clampTextPoint(editor, end);

  const normalizedStart = clampTextPoint(editor, start);

  if (!normalizedStart || !normalizedEnd) {
    return null;
  }

  return RangeApi.isBackward(range)
    ? { anchor: normalizedEnd, focus: normalizedStart }
    : { anchor: normalizedStart, focus: normalizedEnd };
};

const clampTextPoint = (
  editor: ChangeTrackingEditor,
  point: Range['anchor']
): Range['anchor'] | null => {
  const node = editor.editor.read((state) => state.nodes.get(point.path)[0]);

  if (!TextApi.isText(node)) {
    return null;
  }

  return {
    ...point,
    offset: Math.max(0, Math.min(point.offset, node.text.length)),
  };
};

const previousTextEnd = (
  editor: ChangeTrackingEditor,
  path: Path
): Range['anchor'] | null => {
  const previousPath = PathApi.previous(path);

  if (!previousPath) {
    return null;
  }

  const node = editor.editor.read((state) => state.nodes.get(previousPath)[0]);

  if (!TextApi.isText(node)) {
    return null;
  }

  return {
    offset: node.text.length,
    path: previousPath,
  };
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

const cloneOperation = (operation: Operation): Operation =>
  structuredClone(operation) as Operation;

const withoutRecordingOperations = (
  editor: ChangeTrackingEditor,
  fn: () => void
) => {
  editor.recordingOperations = false;
  fn();
  editor.recordingOperations = true;
};
