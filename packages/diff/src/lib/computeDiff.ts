/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import {
  type Descendant,
  type Element,
  ElementApi,
  NodeApi,
  type Text,
  TextApi,
} from '@platejs/plite';
import { failInvariant } from '@platejs/plite/internal';
import { DiffMatchPatch, DiffOp } from 'diff-match-patch-ts';
import baseIsEqual from 'lodash/isEqual.js';
import isPlainObject from 'lodash/isPlainObject.js';

export type DiffDeletion = {
  type: 'delete';
};

export type DiffInsertion = {
  type: 'insert';
};

export type DiffIntent = DiffDeletion | DiffInsertion | DiffUpdate;

export type DiffProps = {
  diff: true;
  diffIntent: DiffIntent;
};

export type DiffUpdate = {
  newProperties: Record<string, unknown>;
  properties: Record<string, unknown>;
  type: 'update';
};

export type DiffProperties = Record<string, unknown>;

export type ComputeDiffOptions = {
  isInline: (element: Descendant) => boolean;
  getDeleteProps: (node: Descendant) => DiffProperties;
  getInsertProps: (node: Descendant) => DiffProperties;
  getUpdateProps: (
    node: Descendant,
    properties: DiffProperties,
    newProperties: DiffProperties
  ) => DiffProperties;
  ignoreProps?: string[];
  lineBreakChar?: string;
  elementsAreRelated?: (
    element: Element,
    nextElement: Element
  ) => boolean | null;
};

export const computeDiff = (
  doc0: readonly Descendant[],
  doc1: readonly Descendant[],
  {
    elementsAreRelated,
    getDeleteProps = defaultGetDeleteProps,
    getInsertProps = defaultGetInsertProps,
    getUpdateProps = defaultGetUpdateProps,
    ignoreProps,
    isInline = () => false,
    ...options
  }: Partial<ComputeDiffOptions> = {}
): Descendant[] => {
  const stringCharMapping = new StringCharMapping();
  const ignoredPropSet = ignoreProps ? new Set(ignoreProps) : null;

  const m0 = stringCharMapping.nodesToString(doc0);
  const m1 = stringCharMapping.nodesToString(doc1);

  const diff = dmp.diff_main(m0, m1);

  return transformDiffDescendants(diff, {
    elementsAreRelated,
    getDeleteProps,
    getInsertProps,
    ignoreProps,
    isInline,
    stringCharMapping,
    getUpdateProps: (node, properties, newProperties) => {
      const changedKeys = new Set([
        ...Object.keys(properties),
        ...Object.keys(newProperties),
      ]);

      // Ignore the update if only ignored props have changed
      if (
        ignoredPropSet &&
        [...changedKeys].every((key) => ignoredPropSet.has(key))
      ) {
        return {};
      }

      return getUpdateProps(node, properties, newProperties);
    },
    ...options,
  });
};

export const defaultGetInsertProps = (): DiffProps => ({
  diff: true,
  diffIntent: {
    type: 'insert',
  },
});

export const defaultGetDeleteProps = (): DiffProps => ({
  diff: true,
  diffIntent: {
    type: 'delete',
  },
});

export const defaultGetUpdateProps = (
  _node: Descendant,
  properties: DiffProperties,
  newProperties: DiffProperties
): DiffProps => ({
  diff: true,
  diffIntent: {
    newProperties,
    properties,
    type: 'update',
  },
});

const dmp = new DiffMatchPatch();

dmp.Diff_Timeout = 0.2;

function* unusedCharGenerator({
  skipChars = '',
}: {
  skipChars?: string;
} = {}): Generator<string, never, void> {
  const skipSet = new Set(skipChars);

  for (
    let code =
      'A'.codePointAt(0) ?? failInvariant('Expected value to be defined');
    ;
    code++
  ) {
    const char = String.fromCodePoint(code);

    if (skipSet.has(char)) continue;

    yield char;
  }
}

class StringCharMapping {
  private readonly charGenerator = unusedCharGenerator();
  private readonly mappedNodes: Array<[Descendant, string]> = [];

  nodesToString(nodes: readonly Descendant[]): string {
    return nodes.map((node) => this.nodeToChar(node)).join('');
  }

  stringToNodes(value: string): Descendant[] {
    return value.split('').map((char) => {
      const entry = this.mappedNodes.find(
        ([_node, mappedChar]) => mappedChar === char
      );

      if (!entry) throw new Error(`No node found for char ${char}`);

      return entry[0];
    });
  }

  private nodeToChar(node: Descendant): string {
    const entry = this.mappedNodes.find(([mappedNode]) =>
      baseIsEqual(mappedNode, node)
    );

    if (entry) return entry[1];

    const char = this.charGenerator.next().value;
    this.mappedNodes.push([node, char]);

    return char;
  }
}

type IsEqualOptions = {
  ignoreDeep?: string[];
  ignoreShallow?: string[];
};

const EMPTY_IGNORED_KEYS = new Set<string>();

const withoutIgnoredPropertiesWithSets = (
  value: unknown,
  ignoreDeep: ReadonlySet<string>,
  ignoreShallow: ReadonlySet<string>
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) =>
      withoutIgnoredPropertiesWithSets(item, ignoreDeep, ignoreShallow)
    );
  }
  if (!isPlainObject(value)) return value;

  const result: Record<string, unknown> = {};

  for (const [key, propertyValue] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (ignoreShallow.has(key) || ignoreDeep.has(key)) continue;

    result[key] = withoutIgnoredPropertiesWithSets(
      propertyValue,
      ignoreDeep,
      EMPTY_IGNORED_KEYS
    );
  }

  return result;
};

const withoutIgnoredProperties = (
  value: unknown,
  { ignoreDeep = [], ignoreShallow = [] }: IsEqualOptions = {}
) =>
  withoutIgnoredPropertiesWithSets(
    value,
    new Set(ignoreDeep),
    new Set(ignoreShallow)
  );

const isEqual = (value: unknown, other: unknown, options?: IsEqualOptions) =>
  baseIsEqual(
    withoutIgnoredProperties(value, options),
    withoutIgnoredProperties(other, options)
  );

class InlineNodeCharMap {
  private readonly charGenerator: Generator<string, never, void>;
  private readonly charToNode = new Map<string, Descendant>();

  constructor(charGenerator: Generator<string, never, void>) {
    this.charGenerator = charGenerator;
  }

  nodeToText(node: Descendant): Text {
    if (TextApi.isText(node)) return node;

    const char = this.charGenerator.next().value;
    this.charToNode.set(char, node);

    return { text: char };
  }

  textToNodes(initialTextNode: Text): Descendant[] {
    let outputNodes: Descendant[] = [initialTextNode];

    for (const [char, originalNode] of this.charToNode) {
      outputNodes = outputNodes.flatMap((node) => {
        if (!TextApi.isText(node)) return [node];

        const splitText = node.text.split(char);

        if (splitText.length === 1) return [node];

        const replacementNode = {
          ...originalNode,
          ...NodeApi.extractProps(node),
        };

        return splitText
          .flatMap((text, index) =>
            index === splitText.length - 1
              ? [{ ...node, text }]
              : [{ ...node, text }, replacementNode]
          )
          .filter(
            (splitNode) =>
              !TextApi.isText(splitNode) || splitNode.text.length > 0
          );
      });
    }

    return outputNodes;
  }
}

const isEqualNode = (
  value: Descendant,
  other: Descendant,
  ignoreProps?: string[]
) =>
  ElementApi.isElement(value) &&
  ElementApi.isElement(other) &&
  value.children !== null &&
  other.children !== null &&
  isEqual(value, other, {
    ignoreDeep: ignoreProps,
    ignoreShallow: ['children'],
  });

const isEqualNodeChildren = (value: Descendant, other: Descendant) => {
  if (
    ElementApi.isElement(value) &&
    ElementApi.isElement(other) &&
    isEqual(value.children, other.children)
  ) {
    return true;
  }

  return (
    TextApi.isText(value) &&
    TextApi.isText(other) &&
    isEqual(value.text, other.text)
  );
};

type NodeRelatedItem = {
  originNode: Descendant;
  childrenUpdated?: boolean;
  delete?: boolean;
  insert?: boolean;
  nodeUpdated?: boolean;
  relatedNode?: Descendant;
};

const diffNodes = (
  originNodes: readonly Descendant[],
  targetNodes: readonly Descendant[],
  { elementsAreRelated, ignoreProps }: ComputeDiffOptions
) => {
  const result: NodeRelatedItem[] = [];
  const remainingTargetNodes = [...targetNodes];

  for (const originNode of originNodes) {
    let childrenUpdated = false;
    let nodeUpdated = false;
    const relatedNode = remainingTargetNodes.find((targetNode) => {
      if (
        ElementApi.isElement(originNode) &&
        ElementApi.isElement(targetNode)
      ) {
        const relatedResult =
          elementsAreRelated?.(originNode, targetNode) ?? null;

        if (relatedResult !== null) return relatedResult;
      }

      childrenUpdated = isEqualNode(originNode, targetNode, ignoreProps);
      nodeUpdated = isEqualNodeChildren(originNode, targetNode);

      return nodeUpdated || childrenUpdated;
    });

    if (relatedNode) {
      const insertNodes = remainingTargetNodes.splice(
        0,
        remainingTargetNodes.indexOf(relatedNode)
      );

      insertNodes.forEach((insertNode) => {
        result.push({ insert: true, originNode: insertNode });
      });
      remainingTargetNodes.splice(0, 1);
    }

    result.push({
      childrenUpdated,
      delete: !relatedNode,
      nodeUpdated,
      originNode,
      relatedNode,
    });
  }

  remainingTargetNodes.forEach((insertNode) => {
    result.push({ insert: true, originNode: insertNode });
  });

  return result;
};

type DiffNodeHandler = (
  node: Descendant,
  nextNode: Descendant,
  options: ComputeDiffOptions
) => Descendant[] | false;

const childrenOnlyStrategy: DiffNodeHandler = (node, nextNode, options) => {
  if (
    ElementApi.isElement(node) &&
    ElementApi.isElement(nextNode) &&
    isEqual(node, nextNode, {
      ignoreDeep: options.ignoreProps,
      ignoreShallow: ['children'],
    })
  ) {
    return [
      {
        ...nextNode,
        children: computeDiff(node.children, nextNode.children, options),
      },
    ];
  }

  return false;
};

const propsOnlyStrategy: DiffNodeHandler = (
  node,
  nextNode,
  { getUpdateProps }
) => {
  const properties: Record<string, unknown> = {};
  const newProperties: Record<string, unknown> = {};

  for (const key in node) {
    if (isEqual(node[key], nextNode[key])) continue;
    if (key === 'children' || key === 'text') return false;

    if (node[key] !== undefined) properties[key] = node[key];
    if (Object.hasOwn(nextNode, key) && nextNode[key] !== undefined) {
      newProperties[key] = nextNode[key];
    }
  }

  for (const key in nextNode) {
    if (Object.hasOwn(node, key)) continue;
    if (key === 'children' || key === 'text') return false;
    if (nextNode[key] !== undefined) newProperties[key] = nextNode[key];
  }

  return [
    {
      ...nextNode,
      ...getUpdateProps(node, properties, newProperties),
    },
  ];
};

const transformDiffNodes = (
  node: Descendant,
  nextNode: Descendant,
  options: ComputeDiffOptions
): Descendant[] | false => {
  for (const strategy of [childrenOnlyStrategy, propsOnlyStrategy]) {
    const operations = strategy(node, nextNode, options);

    if (operations) return operations;
  }

  return false;
};

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
      sourceIndex += 1;
    }
  };
  const advanceTarget = () => {
    while (
      targetIndex < targetSpans.length &&
      targetOffset >= targetSpans[targetIndex].end
    ) {
      targetIndex += 1;
    }
  };

  for (const [operation, text] of diff) {
    let remaining = text.length;

    while (remaining > 0) {
      advanceSource();
      advanceTarget();

      if (operation === DiffOp.Delete) {
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

      if (operation === DiffOp.Insert) {
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

const transformDiffTexts = (
  nodes: readonly Descendant[],
  nextNodes: readonly Descendant[],
  options: ComputeDiffOptions
): Descendant[] => {
  if (nodes.length === 0) throw new Error('must have at least one nodes');
  if (nextNodes.length === 0) {
    throw new Error('must have at least one nextNodes');
  }

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

    if (
      element.type === nextElement.type &&
      element.children &&
      nextElement.children
    ) {
      const { children: _children, ...elementProps } = element;
      const { children: _nextChildren, ...nextElementProps } = nextElement;

      if (
        isEqual(elementProps, nextElementProps, {
          ignoreDeep: options.ignoreProps,
        })
      ) {
        return [
          {
            ...nextElement,
            children: computeDiff(
              element.children,
              nextElement.children,
              options
            ),
          },
        ];
      }
    }
  }

  const { lineBreakChar } = options;
  const charGenerator = unusedCharGenerator({
    skipChars: nodes
      .concat(nextNodes)
      .filter(TextApi.isText)
      .map((node) => node.text)
      .join(''),
  });
  const lineBreakProxyChars =
    lineBreakChar === undefined
      ? null
      : {
          inserted: charGenerator.next().value,
          deleted: charGenerator.next().value,
        };
  const inlineNodeCharMap = new InlineNodeCharMap(charGenerator);
  const texts = nodes
    .map((node) => inlineNodeCharMap.nodeToText(node))
    .map((text) => encodeLineBreaks(text, lineBreakProxyChars?.deleted));
  const nextTexts = nextNodes
    .map((node) => inlineNodeCharMap.nodeToText(node))
    .map((text) => encodeLineBreaks(text, lineBreakProxyChars?.inserted));

  let diffTexts = diffTextSpans(texts, nextTexts, options);

  if (lineBreakProxyChars && lineBreakChar !== undefined) {
    diffTexts = diffTexts.map((node) => ({
      ...node,
      text: node.text
        .replaceAll(lineBreakProxyChars.inserted, `${lineBreakChar}\n`)
        .replaceAll(lineBreakProxyChars.deleted, lineBreakChar),
    }));
  }

  return diffTexts.flatMap((text) => inlineNodeCharMap.textToNodes(text));
};

type DiffOperation = -1 | 0 | 1;

const transformDiffDescendants = (
  diff: ReadonlyArray<[DiffOperation, string]>,
  {
    stringCharMapping,
    ...options
  }: ComputeDiffOptions & {
    stringCharMapping: StringCharMapping;
  }
): Descendant[] => {
  const { getDeleteProps, getInsertProps, ignoreProps, isInline } = options;
  const children: Descendant[] = [];
  let index = 0;
  let insertBuffer: Descendant[] = [];
  let deleteBuffer: Descendant[] = [];

  const flushBuffers = () => {
    children.push(...deleteBuffer, ...insertBuffer);
    insertBuffer = [];
    deleteBuffer = [];
  };
  const insertNode = (node: Descendant) =>
    insertBuffer.push({ ...node, ...getInsertProps(node) });
  const deleteNode = (node: Descendant) =>
    deleteBuffer.push({ ...node, ...getDeleteProps(node) });
  const passThroughNodes = (...nodes: Descendant[]) => {
    flushBuffers();
    children.push(...nodes);
  };
  const isInlineList = (nodes: Descendant[]) =>
    nodes.every((node) => TextApi.isText(node) || isInline(node));

  while (index < diff.length) {
    const [operation, value] = diff[index];
    const nodes = stringCharMapping.stringToNodes(value);

    if (operation === 0) {
      passThroughNodes(...nodes);
      index += 1;
      continue;
    }

    if (operation === -1) {
      if (index < diff.length - 1 && diff[index + 1][0] === 1) {
        const nextNodes = stringCharMapping.stringToNodes(diff[index + 1][1]);

        if (isEqual(nodes, nextNodes, { ignoreDeep: ignoreProps })) {
          passThroughNodes(...nextNodes);
          index += 2;
          continue;
        }

        if (isInlineList(nodes) && isInlineList(nextNodes)) {
          passThroughNodes(...transformDiffTexts(nodes, nextNodes, options));
          index += 2;
          continue;
        }

        diffNodes(nodes, nextNodes, options).forEach((item) => {
          if (item.delete) deleteNode(item.originNode);
          if (item.insert) insertNode(item.originNode);

          if (item.relatedNode) {
            const diffNodesResult = transformDiffNodes(
              item.originNode,
              item.relatedNode,
              options
            );

            if (diffNodesResult) {
              passThroughNodes(...diffNodesResult);
            } else {
              deleteNode(item.originNode);
              insertNode(item.relatedNode);
            }
          }
        });
        index += 2;
        continue;
      }

      nodes.forEach(deleteNode);
      index += 1;
      continue;
    }

    nodes.forEach(insertNode);
    index += 1;
  }

  flushBuffers();

  return children;
};
