import { addRangeMarks, PlateEditor, TDescendant, TOperation, TText, Value } from '@udecode/plate-common';
import { BaseEditor, createEditor, Path, Node, RemoveTextOperation, MergeNodeOperation, RangeRef, SplitNodeOperation, Editor, Point, Range, PointRef, SetNodeOperation, InsertTextOperation, withoutNormalizing } from 'slate';
import {DiffToSuggestionsOptions} from '../../slateDiff';
import isEqual from 'lodash/isEqual.js';
import uniqWith from 'lodash/uniqWith.js';

import { dmp } from '../utils/dmp';
import { getProperties } from '../utils/get-properties';

interface NodesEditor extends BaseEditor {
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
  }[],

  commitDiffs: () => void;
}

const objectWithoutUndefined = (obj: Record<string, any>) => {
  const newObj: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

const flattenPropsChanges = (editor: NodesEditor) => {
  // The set of points at which some `propChanges` range starts or ends
  const unsortedRangePoints = editor.propsChanges.flatMap(({ rangeRef }) => {
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
    // The set of `propChanges` that intersect with `flatRange`
    const intersectingUpdates = editor.propsChanges.filter(({ rangeRef }) => {
      const range = rangeRef.current;
      if (!range) return false;
      const intersection = Range.intersection(range, flatRange);
      if (!intersection) return false;
      return Range.isExpanded(intersection);
    });

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

  editor.propsChanges.forEach(({ rangeRef }) => {
    rangeRef.unref();
  });

  return flatUpdates.filter(Boolean) as Exclude<
    (typeof flatUpdates)[number],
    null
  >[];
}

const withNodesEditor = (editor: NodesEditor, { getInsertProps, getRemoveProps, getUpdateProps }: Required<DiffToSuggestionsOptions>) => {
  const { apply } = editor;

  editor.propsChanges = [];
  editor.insertedTexts = [];
  editor.removedTexts = [];

  let recordingOperations = true;

  const applyInsertText = (op: InsertTextOperation) => {
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

  const applyRemoveText = (op: RemoveTextOperation) => {
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

  const applyMergeNode = (op: MergeNodeOperation) => {
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

  const applySplitNode = (op: SplitNodeOperation) => {
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

  const applySetNode = (op: SetNodeOperation) => {
    apply(op);

    const range = Editor.range(editor, op.path);
    const rangeRef = Editor.rangeRef(editor, range);

    editor.propsChanges.push({
      rangeRef,
      properties: op.properties,
      newProperties: op.newProperties,
    });
  };

  editor.apply = (op) => {
    if (!recordingOperations) {
      return apply(op);
    }

    recordingOperations = false;

    switch (op.type) {
      case 'insert_text':
        applyInsertText(op);
        break;

      case 'remove_text':
        applyRemoveText(op);
        break;

      case 'merge_node':
        applyMergeNode(op);
        break;

      case 'split_node':
        applySplitNode(op);
        break;

      case 'set_node':
        applySetNode(op);
        break;

      default:
        apply(op);
    }

    recordingOperations = true;
  };

  editor.commitDiffs = () => {
    recordingOperations = false;

    editor.removedTexts.forEach(({ pointRef, node }) => {
      const point = pointRef.current;

      if (point) {
        editor.insertNode({
          ...node,
          ...getRemoveProps(node),
        }, { at: point });
      }

      pointRef.unref();
    });

    editor.insertedTexts.forEach(({ rangeRef, node }) => {
      const range = rangeRef.current;

      if (range) {
        addRangeMarks(
          editor as any,
          getInsertProps(node),
          { at: range }
        );
      }

      rangeRef.unref();
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

    recordingOperations = true;
  };

  return editor;
};

// Main function to transform an array of text nodes into another array of text nodes
export function transformDiffTexts<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  nodes: TText[],
  nextNodes: TText[],
  options: Required<DiffToSuggestionsOptions>
): TDescendant[] {
  // Validate input - both arrays must have at least one node
  if (nodes.length === 0) throw new Error('must have at least one nodes');
  if (nextNodes.length === 0)
    throw new Error('must have at least one nextNodes');

  const nodesEditor = withNodesEditor(createEditor() as any, options);
  nodesEditor.children = [{ children: nodes }];

  withoutNormalizing(nodesEditor, () => {
    // Start with the first node in the array, assuming all nodes are to be merged into one
    let node = nodes[0];

    if (nodes.length > 1) {
      // If there are multiple nodes, merge them into one, adding merge operations
      for (let i = 1; i < nodes.length; i++) {
        nodesEditor.apply({
          type: 'merge_node',
          path: [0, 1],
          position: 0, // Required by type; not actually used here
          properties: {}, // Required by type; not actually used here
        });
        // Update the node's text with the merged text (for splitTextNodes)
        node = { ...node, text: node.text + nodes[i].text };
      }
    }

    // After merging, apply split operations based on the target state (`nextNodes`)
    for (const op of splitTextNodes(node, nextNodes)) {
      nodesEditor.apply(op);
    }

    nodesEditor.commitDiffs();
  });

  return (nodesEditor.children[0] as any).children;
}

// Function to compute the text operations needed to transform string `a` into string `b`
function slateTextDiff(a: string, b: string): Op[] {
  // Compute the diff between two strings
  const diff = dmp.diff_main(a, b);
  dmp.diff_cleanupSemantic(diff);

  const operations: Op[] = [];

  // Initialize an offset to track position within the string
  let offset = 0;
  // Initialize an index to iterate through the diff chunks
  let i = 0;

  while (i < diff.length) {
    const chunk = diff[i];
    const op = chunk[0]; // Operation code: -1 = delete, 0 = leave unchanged, 1 = insert
    const text = chunk[1]; // The text associated with this diff chunk

    switch (op) {
      case 0: {
        // For unchanged text, just move the offset forward
        offset += text.length;

        break;
      }
      case -1: {
        // For deletions, add a remove_text operation
        operations.push({ type: 'remove_text', offset, text });

        break;
      }
      case 1: {
        // For insertions, add an insert_text operation
        operations.push({ type: 'insert_text', offset, text });
        // Move the offset forward by the length of the inserted text
        offset += text.length;

        break;
      }
      // No default
    }
    // Move to the next diff chunk
    i += 1;
  }

  return operations;
}

/* Accomplish something like this

node={"text":"xyz A **B** C"} ->
               split={"text":"A "} {"text":"B","bold":true} {"text":" C"}

via a combination of remove_text/insert_text as above and split_node
operations.
*/
// Function to split a single text node into multiple nodes based on the desired target state
function splitTextNodes(
  node: TText,
  split: TText[],
): TOperation[] {
  if (split.length === 0) {
    // If there are no target nodes, simply remove the original node
    return [
      {
        type: 'remove_node',
        node,
        path: [0, 0],
      },
    ];
  }

  // Start with the concatenated text of the target state
  let splitText = '';
  for (const { text } of split) {
    splitText += text;
  }
  const nodeText = node.text;
  const operations: TOperation[] = [];

  // If the concatenated target text differs from the original, compute the necessary text transformations
  if (splitText !== nodeText) {
    // Use diff-match-pach to transform the text in the source node to equal
    // the text in the sequence of target nodes.  Once we do this transform,
    // we can then worry about splitting up the resulting source node.
    for (const op of slateTextDiff(nodeText, splitText)) {
      // TODO: maybe path has to be changed if there are multiple OPS?
      operations.push({ path: [0, 0], ...op });
    }
  }

  // Adjust properties of the initial node to match the first target node, if necessary
  const newProperties = getProperties(split[0], node);
  if (getKeysLength(newProperties) > 0) {
    operations.push({
      type: 'set_node',
      path: [0, 0],
      properties: getProperties(node),
      newProperties,
    });
  }

  let properties = getProperties(split[0]);
  // For each segment in the target state, split the node and adjust properties as needed
  let splitPath = [0, 0];
  for (let i = 0; i < split.length - 1; i++) {
    const part = split[i];
    const nextPart = split[i + 1];
    const newProps = getProperties(nextPart, properties);

    operations.push({
      type: 'split_node',
      path: splitPath,
      position: part.text.length,
      properties: newProps,
    });

    splitPath = Path.next(splitPath);
    properties = getProperties(nextPart);
  }
  return operations;
}

/*
NOTE: the set_node api lets you delete properties by setting
them to null, but the split_node api doesn't (I guess Ian forgot to
implement that... or there is a good reason).  So if there are any
property deletes, then we have to also do a set_node... or just be
ok with undefined values.  For text where values are treated as
booleans, this is fine and that's what we do.   Maybe the reason
is just to keep the operations simple and minimal.
Also setting to undefined / false-ish for a *text* node property
is equivalent to not having it regarding everything else.
*/

function getKeysLength(obj: object | undefined | null): number {
  if (obj == null) {
    return 0;
  }
  return Object.keys(obj).length;
}

interface Op {
  type: 'insert_text' | 'remove_text';
  offset: number;
  text: string;
}
