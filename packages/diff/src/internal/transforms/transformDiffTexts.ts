/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { isText, TDescendant, TOperation, TText } from '@udecode/plate-common';
import { createEditor, Path, withoutNormalizing } from 'slate';

import { ComputeDiffOptions } from '../../computeDiff';
import { dmp } from '../utils/dmp';
import { getProperties } from '../utils/get-properties';
import { InlineNodeCharMap } from '../utils/inline-node-char-map';
import { unusedCharGenerator } from '../utils/unused-char-generator';
import { withChangeTracking } from '../utils/with-change-tracking';

// Main function to transform an array of text nodes into another array of text nodes
export function transformDiffTexts(
  nodes: TDescendant[],
  nextNodes: TDescendant[],
  options: ComputeDiffOptions
): TDescendant[] {
  // Validate input - both arrays must have at least one node
  if (nodes.length === 0) throw new Error('must have at least one nodes');
  if (nextNodes.length === 0)
    throw new Error('must have at least one nextNodes');

  const { lineBreakChar } = options;
  const hasLineBreakChar = lineBreakChar !== undefined;

  const charGenerator = unusedCharGenerator({
    // Do not use any char that is present in the text
    skipChars: nodes
      .concat(nextNodes)
      .filter(isText)
      .map((n) => n.text)
      .join(''),
  });

  /**
   * Chars to represent inserted and deleted line breaks in the diff. These
   * must have a length of 1 to keep the offsets consistent. `lineBreakChar`
   * itself may have any length.
   */
  const insertedLineBreakProxyChar = hasLineBreakChar
    ? charGenerator.next().value
    : undefined;
  const deletedLineBreakProxyChar = hasLineBreakChar
    ? charGenerator.next().value
    : undefined;

  const inlineNodeCharMap = new InlineNodeCharMap({
    charGenerator,
  });

  // Map inlines nodes to unique text nodes
  const texts = nodes.map((n) => inlineNodeCharMap.nodeToText(n));
  const nextTexts = nextNodes.map((n) => inlineNodeCharMap.nodeToText(n));

  const nodesEditor = withChangeTracking(createEditor(), options);
  nodesEditor.children = [{ children: texts }];

  withoutNormalizing(nodesEditor, () => {
    // Start with the first node in the array, assuming all nodes are to be merged into one
    let node = texts[0];

    if (texts.length > 1) {
      // If there are multiple nodes, merge them into one, adding merge operations
      for (let i = 1; i < texts.length; i++) {
        nodesEditor.apply({
          type: 'merge_node',
          path: [0, 1],
          position: 0, // Required by type; not actually used here
          properties: {}, // Required by type; not actually used here
        });
        // Update the node's text with the merged text (for splitTextNodes)
        node = { ...node, text: node.text + texts[i].text };
      }
    }

    // After merging, apply split operations based on the target state (`nextTexts`)
    for (const op of splitTextNodes(node, nextTexts, {
      insertedLineBreakChar: insertedLineBreakProxyChar,
      deletedLineBreakChar: deletedLineBreakProxyChar,
    })) {
      nodesEditor.apply(op);
    }

    nodesEditor.commitChangesToDiffs();
  });

  let diffTexts: TText[] = (nodesEditor.children[0] as any).children;

  // Replace line break proxy chars with the actual line break char
  if (hasLineBreakChar) {
    diffTexts = diffTexts.map((n) => ({
      ...n,
      text: n.text
        .replaceAll(insertedLineBreakProxyChar, lineBreakChar + '\n')
        .replaceAll(deletedLineBreakProxyChar, lineBreakChar),
    }));
  }

  // Restore the original inline nodes
  return diffTexts.flatMap((t) => inlineNodeCharMap.textToNode(t));
}

interface LineBreakCharsOptions {
  insertedLineBreakChar?: string;
  deletedLineBreakChar?: string;
}

// Function to compute the text operations needed to transform string `a` into string `b`
function slateTextDiff(
  a: string,
  b: string,
  { insertedLineBreakChar, deletedLineBreakChar }: LineBreakCharsOptions
): Op[] {
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
        operations.push({
          type: 'remove_text',
          offset,
          text:
            deletedLineBreakChar === undefined
              ? text
              : text.replaceAll('\n', deletedLineBreakChar),
        });

        break;
      }
      case 1: {
        // For insertions, add an insert_text operation
        operations.push({
          type: 'insert_text',
          offset,
          text:
            insertedLineBreakChar === undefined
              ? text
              : text.replaceAll('\n', insertedLineBreakChar),
        });
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
  options: LineBreakCharsOptions
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
    for (const op of slateTextDiff(nodeText, splitText, options)) {
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

    const newProps = getProperties(nextPart);

    Object.keys(properties).forEach((key) => {
      if (!newProps.hasOwnProperty(key)) {
        newProps[key] = undefined;
      }
    });

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
