/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import {
  type Descendant,
  ElementApi,
  type Text,
  TextApi,
} from '@platejs/plite';

import type { ComputeDiffOptions } from '../../lib/computeDiff';

import { computeDiff } from '../../lib/computeDiff';
import { dmp } from '../utils/dmp';
import { InlineNodeCharMap } from '../utils/inline-node-char-map';
import { isEqual } from '../utils/is-equal';
import { unusedCharGenerator } from '../utils/unused-char-generator';

// Main function to transform an array of text nodes into another array of text nodes
export function transformDiffTexts(
  nodes: readonly Descendant[],
  nextNodes: readonly Descendant[],
  options: ComputeDiffOptions
): Descendant[] {
  // Validate input - both arrays must have at least one node
  if (nodes.length === 0) throw new Error('must have at least one nodes');
  if (nextNodes.length === 0)
    throw new Error('must have at least one nextNodes');

  // Special handling for single inline elements that might be related
  if (
    nodes.length === 1 &&
    nextNodes.length === 1 &&
    ElementApi.isElement(nodes[0]) &&
    ElementApi.isElement(nextNodes[0]) &&
    options.isInline(nodes[0]) &&
    options.isInline(nextNodes[0])
  ) {
    const element = nodes[0];
    const nextElement = nextNodes[0];

    // If they have the same type and properties (except children), diff their children
    if (
      element.type === nextElement.type &&
      element.children &&
      nextElement.children
    ) {
      // Check if they're equal except for children
      const { children: _1, ...elementProps } = element;
      const { children: _2, ...nextElementProps } = nextElement;

      if (
        isEqual(elementProps, nextElementProps, {
          ignoreDeep: options.ignoreProps,
        })
      ) {
        // Recursively diff the children
        const diffedChildren = computeDiff(
          element.children,
          nextElement.children,
          options
        );

        return [
          {
            ...nextElement,
            children: diffedChildren,
          },
        ];
      }
    }
  }

  const { lineBreakChar } = options;
  const hasLineBreakChar = lineBreakChar !== undefined;

  const charGenerator = unusedCharGenerator({
    // Do not use any char that is present in the text
    skipChars: nodes
      .concat(nextNodes)
      .filter(TextApi.isText)
      .map((n) => n.text)
      .join(''),
  });

  /**
   * Chars to represent inserted and deleted line breaks in the diff. These must
   * have a length of 1 to keep the offsets consistent. `lineBreakChar` itself
   * may have any length.
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
  const texts = nodes
    .map((n) => inlineNodeCharMap.nodeToText(n))
    .map((text) => encodeLineBreaks(text, deletedLineBreakProxyChar));
  const nextTexts = nextNodes
    .map((n) => inlineNodeCharMap.nodeToText(n))
    .map((text) => encodeLineBreaks(text, insertedLineBreakProxyChar));

  let diffTexts = diffTextSpans(texts, nextTexts, options);

  // Replace line break proxy chars with the actual line break char
  if (hasLineBreakChar) {
    diffTexts = diffTexts.map((n) => ({
      ...n,
      text: n.text
        .replaceAll(insertedLineBreakProxyChar, `${lineBreakChar}\n`)
        .replaceAll(deletedLineBreakProxyChar, lineBreakChar),
    }));
  }

  // Restore the original inline nodes
  return diffTexts.flatMap((t) => inlineNodeCharMap.textToNode(t));
}

const encodeLineBreaks = (text: Text, lineBreakChar?: string): Text =>
  lineBreakChar === undefined
    ? text
    : {
        ...text,
        text: text.text.replaceAll('\n', lineBreakChar),
      };

type TextSpan = {
  end: number;
  node: Text;
};

const getSpans = (texts: Text[]): TextSpan[] => {
  let offset = 0;

  return texts.map((node) => {
    offset += node.text.length;

    return { end: offset, node };
  });
};

const getNodeProperties = (node: Text): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(node).filter(
      ([key, value]) => key !== 'text' && value !== undefined
    )
  );

const getPropertyChanges = (
  source: Text,
  target: Text
): {
  newProperties: Record<string, unknown>;
  properties: Record<string, unknown>;
} | null => {
  const sourceProperties = getNodeProperties(source);
  const targetProperties = getNodeProperties(target);
  const keys = new Set([
    ...Object.keys(sourceProperties),
    ...Object.keys(targetProperties),
  ]);
  const properties: Record<string, unknown> = {};
  const newProperties: Record<string, unknown> = {};

  for (const key of keys) {
    if (isEqual(sourceProperties[key], targetProperties[key])) continue;

    if (Object.hasOwn(sourceProperties, key)) {
      properties[key] = sourceProperties[key];
    }
    if (Object.hasOwn(targetProperties, key)) {
      newProperties[key] = targetProperties[key];
    }
  }

  return Object.keys(properties).length > 0 ||
    Object.keys(newProperties).length > 0
    ? { newProperties, properties }
    : null;
};

const appendText = (output: Text[], node: Text) => {
  if (node.text.length === 0) return;

  const previous = output.at(-1);

  if (
    previous &&
    isEqual(getNodeProperties(previous), getNodeProperties(node))
  ) {
    output[output.length - 1] = {
      ...previous,
      text: previous.text + node.text,
    };
  } else {
    output.push(node);
  }
};

const diffTextSpans = (
  source: Text[],
  target: Text[],
  options: ComputeDiffOptions
): Text[] => {
  const sourceSpans = getSpans(source);
  const targetSpans = getSpans(target);
  const sourceText = source.map((node) => node.text).join('');
  const targetText = target.map((node) => node.text).join('');
  const diff = dmp.diff_main(sourceText, targetText);

  dmp.diff_cleanupSemantic(diff);

  const output: Text[] = [];
  let sourceOffset = 0;
  let targetOffset = 0;
  let sourceIndex = 0;
  let targetIndex = 0;

  const advanceSource = () => {
    while (
      sourceIndex < sourceSpans.length &&
      sourceOffset >= sourceSpans[sourceIndex].end
    ) {
      sourceIndex++;
    }
  };
  const advanceTarget = () => {
    while (
      targetIndex < targetSpans.length &&
      targetOffset >= targetSpans[targetIndex].end
    ) {
      targetIndex++;
    }
  };

  for (const [operation, text] of diff) {
    let remaining = text.length;

    while (remaining > 0) {
      advanceSource();
      advanceTarget();

      if (operation === -1) {
        const span = sourceSpans[sourceIndex];
        const length = Math.min(remaining, span.end - sourceOffset);

        appendText(output, {
          ...span.node,
          ...options.getDeleteProps(span.node),
          text: sourceText.slice(sourceOffset, sourceOffset + length),
        });
        sourceOffset += length;
        remaining -= length;
        continue;
      }

      if (operation === 1) {
        const span = targetSpans[targetIndex];
        const length = Math.min(remaining, span.end - targetOffset);

        appendText(output, {
          ...span.node,
          ...options.getInsertProps(span.node),
          text: targetText.slice(targetOffset, targetOffset + length),
        });
        targetOffset += length;
        remaining -= length;
        continue;
      }

      const sourceSpan = sourceSpans[sourceIndex];
      const targetSpan = targetSpans[targetIndex];
      const length = Math.min(
        remaining,
        sourceSpan.end - sourceOffset,
        targetSpan.end - targetOffset
      );
      const propertyChanges = getPropertyChanges(
        sourceSpan.node,
        targetSpan.node
      );
      const targetSlice = {
        ...targetSpan.node,
        text: targetText.slice(targetOffset, targetOffset + length),
      };

      appendText(
        output,
        propertyChanges
          ? {
              ...targetSlice,
              ...options.getUpdateProps(
                targetSlice,
                propertyChanges.properties,
                propertyChanges.newProperties
              ),
            }
          : targetSlice
      );
      sourceOffset += length;
      targetOffset += length;
      remaining -= length;
    }
  }

  if (output.length > 0) return output;

  const targetNode = target[0];
  const sourceNode = source[0];
  const propertyChanges = getPropertyChanges(sourceNode, targetNode);

  return [
    propertyChanges
      ? {
          ...targetNode,
          ...options.getUpdateProps(
            targetNode,
            propertyChanges.properties,
            propertyChanges.newProperties
          ),
        }
      : targetNode,
  ];
};
