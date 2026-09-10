/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { DiffMatchPatch } from 'diff-match-patch-ts';
import baseIsEqual from 'lodash/isEqual.js';
import isPlainObject from 'lodash/isPlainObject.js';

import {
  type Descendant,
  type Element,
  ElementApi,
  NodeApi,
  type Text,
  TextApi,
} from '../..';

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
  const nodeTokens = new NodeTokens();
  const ignoredPropSet = ignoreProps ? new Set(ignoreProps) : null;

  const m0 = nodeTokens.encode(doc0);
  const m1 = nodeTokens.encode(doc1);

  const diff = diffTokens(m0, m1);

  return transformDiffDescendants(diff, {
    elementsAreRelated,
    getDeleteProps,
    getInsertProps,
    ignoreProps,
    isInline,
    nodeTokens,
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

type TokenDiff = [-1 | 0 | 1, number[]];

const dmp = new DiffMatchPatch();
dmp.Diff_Timeout = 0.2;

const diffTokens = (
  source: readonly number[],
  target: readonly number[],
  semantic = false
): TokenDiff[] => {
  const allTokens = [...source, ...target];
  const used = new Set(allTokens.filter((token) => token < 65_536));
  const encoded = new Map<number, string>();
  const decoded = new Map<string, number>();
  let code = 65;

  for (const token of allTokens) {
    if (token < 65_536 || encoded.has(token)) continue;
    while (code < 65_536 && used.has(code)) code += 1;
    if (code === 65_536) {
      code = 0;
      while (code < 65 && used.has(code)) code += 1;
      if (code === 65) return diffArrays(source, target, Date.now() + 200);
    }
    used.add(code);
    const character = String.fromCharCode(code);
    code += 1;
    encoded.set(token, character);
    decoded.set(character, token);
  }

  const encode = (tokens: readonly number[]) =>
    tokens
      .map((token) => encoded.get(token) ?? String.fromCharCode(token))
      .join('');
  const result = dmp.diff_main(encode(source), encode(target));
  if (semantic) dmp.diff_cleanupSemantic(result);

  return result.map(([operation, text]) => [
    operation,
    text
      .split('')
      .map((character) => decoded.get(character) ?? character.charCodeAt(0)),
  ]);
};

// DMP operates on UTF-16 units; larger alphabets must compare whole tokens.
const diffArrays = (
  source: readonly number[],
  target: readonly number[],
  deadline: number
): TokenDiff[] => {
  let start = 0;
  let sourceEnd = source.length;
  let targetEnd = target.length;
  while (
    start < sourceEnd &&
    start < targetEnd &&
    source[start] === target[start]
  ) {
    start += 1;
  }
  while (
    sourceEnd > start &&
    targetEnd > start &&
    source[sourceEnd - 1] === target[targetEnd - 1]
  ) {
    sourceEnd -= 1;
    targetEnd -= 1;
  }
  const prefix = source.slice(0, start);
  const suffix = source.slice(sourceEnd);
  const left = source.slice(start, sourceEnd);
  const right = target.slice(start, targetEnd);
  let middle: TokenDiff[];

  if (left.length === 0) middle = right.length ? [[1, right]] : [];
  else if (right.length === 0) middle = [[-1, left]];
  else middle = bisect(left, right, deadline);

  return [
    ...(prefix.length ? [[0, prefix] as TokenDiff] : []),
    ...middle,
    ...(suffix.length ? [[0, suffix] as TokenDiff] : []),
  ];
};

const bisect = (
  source: number[],
  target: number[],
  deadline: number
): TokenDiff[] => {
  const max = Math.ceil((source.length + target.length) / 2);
  const offset = max + 1;
  const forward = new Int32Array(2 * max + 3).fill(-1);
  const reverse = new Int32Array(2 * max + 3).fill(-1);
  forward[offset + 1] = 0;
  reverse[offset + 1] = 0;
  const delta = source.length - target.length;
  const odd = delta % 2 !== 0;

  const split = (x: number, y: number): TokenDiff[] => [
    ...diffArrays(source.slice(0, x), target.slice(0, y), deadline),
    ...diffArrays(source.slice(x), target.slice(y), deadline),
  ];

  for (let distance = 0; distance < max && Date.now() <= deadline; distance++) {
    for (let diagonal = -distance; diagonal <= distance; diagonal += 2) {
      const index = offset + diagonal;
      let x =
        diagonal === -distance ||
        (diagonal !== distance && forward[index - 1] < forward[index + 1])
          ? forward[index + 1]
          : forward[index - 1] + 1;
      let y = x - diagonal;
      while (
        x < source.length &&
        y < target.length &&
        source[x] === target[y]
      ) {
        x += 1;
        y += 1;
      }
      forward[index] = x;
      const opposite = offset + delta - diagonal;
      if (
        odd &&
        opposite >= 0 &&
        opposite < reverse.length &&
        reverse[opposite] !== -1 &&
        x >= source.length - reverse[opposite]
      ) {
        return split(x, y);
      }
    }
    for (let diagonal = -distance; diagonal <= distance; diagonal += 2) {
      const index = offset + diagonal;
      let x =
        diagonal === -distance ||
        (diagonal !== distance && reverse[index - 1] < reverse[index + 1])
          ? reverse[index + 1]
          : reverse[index - 1] + 1;
      let y = x - diagonal;
      while (
        x < source.length &&
        y < target.length &&
        source[source.length - x - 1] === target[target.length - y - 1]
      ) {
        x += 1;
        y += 1;
      }
      reverse[index] = x;
      const opposite = offset + delta - diagonal;
      if (
        !odd &&
        opposite >= 0 &&
        opposite < forward.length &&
        forward[opposite] !== -1 &&
        forward[opposite] >= source.length - x
      ) {
        const splitX = forward[opposite];
        return split(splitX, splitX - delta + diagonal);
      }
    }
  }

  return [
    [-1, source],
    [1, target],
  ];
};

const nodeBucket = (node: Descendant): string | undefined => {
  const ancestors = new Set<object>();
  const visit = (value: unknown): unknown => {
    if (typeof value !== 'object' || value === null) {
      if (
        typeof value === 'function' ||
        typeof value === 'symbol' ||
        typeof value === 'bigint'
      ) {
        throw new Error('Node requires exact comparison.');
      }
      return value;
    }
    if (
      ancestors.has(value) ||
      (!Array.isArray(value) && !isPlainObject(value))
    ) {
      throw new Error('Node requires exact comparison.');
    }
    ancestors.add(value);
    const result = Array.isArray(value)
      ? value.map(visit)
      : Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, visit((value as Record<string, unknown>)[key])])
        );
    ancestors.delete(value);
    return result;
  };
  try {
    return JSON.stringify(visit(node));
  } catch {
    return undefined;
  }
};

class NodeTokens {
  private readonly nodes: Descendant[] = [];
  private readonly buckets = new Map<string, number[]>();
  private readonly fallback: number[] = [];

  encode(nodes: readonly Descendant[]): number[] {
    return nodes.map((node) => {
      const key = nodeBucket(node);
      // Non-plain values may equal plain ones, so both directions share the fallback.
      const candidates =
        key === undefined
          ? this.nodes.keys()
          : [...(this.buckets.get(key) ?? []), ...this.fallback];
      for (const token of candidates) {
        if (baseIsEqual(this.nodes[token], node)) return token + 65_536;
      }
      const token = this.nodes.length;
      this.nodes.push(node);
      if (key === undefined) this.fallback.push(token);
      else {
        const bucket = this.buckets.get(key);
        if (bucket) bucket.push(token);
        else this.buckets.set(key, [token]);
      }
      return token + 65_536;
    });
  }

  decode(tokens: readonly number[]): Descendant[] {
    return tokens.map((token) => this.nodes[token - 65_536]);
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

type TokenText = { node: Text; tokens: number[] };

class InlineTokens {
  private nextToken = 65_536;
  private readonly nodes = new Map<number, Descendant>();
  private readonly insertedBreak: number | undefined;
  private readonly deletedBreak: number | undefined;

  private readonly lineBreakChar: string | undefined;

  constructor(lineBreakChar?: string) {
    this.lineBreakChar = lineBreakChar;
    if (lineBreakChar !== undefined) {
      this.insertedBreak = this.nextToken;
      this.nextToken += 1;
      this.deletedBreak = this.nextToken;
      this.nextToken += 1;
    }
  }

  encode(nodes: readonly Descendant[], inserted: boolean): TokenText[] {
    return nodes.map((node) => {
      if (!TextApi.isText(node)) {
        const token = this.nextToken;
        this.nextToken += 1;
        this.nodes.set(token, node);
        return { node: { text: '' }, tokens: [token] };
      }
      const lineBreak = inserted ? this.insertedBreak : this.deletedBreak;
      return {
        node,
        tokens: node.text
          .split('')
          .map((character) =>
            character === '\n' && lineBreak !== undefined
              ? lineBreak
              : character.charCodeAt(0)
          ),
      };
    });
  }

  decode(tokens: readonly number[], node: Text): Descendant[] {
    const output: Descendant[] = [];
    let text = '';
    for (const token of tokens) {
      const inline = this.nodes.get(token);
      if (inline) {
        if (text) output.push({ ...node, text });
        text = '';
        output.push({ ...inline, ...NodeApi.extractProps(node) });
      } else if (token === this.insertedBreak) {
        text += `${this.lineBreakChar}\n`;
      } else if (token === this.deletedBreak) text += this.lineBreakChar;
      else text += String.fromCharCode(token);
    }
    if (text || output.length === 0) output.push({ ...node, text });
    return output;
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

type TextSpan = {
  end: number;
  node: Text;
};

const getSpans = (texts: TokenText[]): TextSpan[] => {
  let offset = 0;

  return texts.map(({ node, tokens }) => {
    offset += tokens.length;

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

const appendText = (output: Descendant[], node: Descendant) => {
  if (!TextApi.isText(node)) {
    output.push(node);
    return;
  }
  if (node.text.length === 0) return;

  const previous = output.at(-1);

  if (
    previous &&
    TextApi.isText(previous) &&
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
  source: TokenText[],
  target: TokenText[],
  options: ComputeDiffOptions,
  inlineTokens: InlineTokens
): Descendant[] => {
  const sourceSpans = getSpans(source);
  const targetSpans = getSpans(target);
  const sourceText = source.flatMap(({ tokens }) => tokens);
  const targetText = target.flatMap(({ tokens }) => tokens);
  const diff = diffTokens(sourceText, targetText, true);

  const output: Descendant[] = [];
  const append = (tokens: number[], node: Text) => {
    for (const descendant of inlineTokens.decode(tokens, node)) {
      appendText(output, descendant);
    }
  };
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

      if (operation === -1) {
        const span = sourceSpans[sourceIndex];
        const length = Math.min(remaining, span.end - sourceOffset);

        append(sourceText.slice(sourceOffset, sourceOffset + length), {
          ...span.node,
          ...options.getDeleteProps(span.node),
        });
        sourceOffset += length;
        remaining -= length;
        continue;
      }

      if (operation === 1) {
        const span = targetSpans[targetIndex];
        const length = Math.min(remaining, span.end - targetOffset);

        append(targetText.slice(targetOffset, targetOffset + length), {
          ...span.node,
          ...options.getInsertProps(span.node),
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
      const tokens = targetText.slice(targetOffset, targetOffset + length);
      const targetSlice = {
        ...targetSpan.node,
        text: inlineTokens
          .decode(tokens, targetSpan.node)
          .filter(TextApi.isText)
          .map((node) => node.text)
          .join(''),
      };

      append(
        tokens,
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

  const targetNode = target[0].node;
  const sourceNode = source[0].node;
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

  const inlineTokens = new InlineTokens(options.lineBreakChar);
  return diffTextSpans(
    inlineTokens.encode(nodes, false),
    inlineTokens.encode(nextNodes, true),
    options,
    inlineTokens
  );
};

type DiffOperation = -1 | 0 | 1;

const transformDiffDescendants = (
  diff: ReadonlyArray<[DiffOperation, number[]]>,
  {
    nodeTokens,
    ...options
  }: ComputeDiffOptions & {
    nodeTokens: NodeTokens;
  }
): Descendant[] => {
  const { getDeleteProps, getInsertProps, ignoreProps, isInline } = options;
  const children: Descendant[] = [];
  let index = 0;
  let insertBuffer: Descendant[] = [];
  let deleteBuffer: Descendant[] = [];

  const flushBuffers = () => {
    for (const node of deleteBuffer) children.push(node);
    for (const node of insertBuffer) children.push(node);
    insertBuffer = [];
    deleteBuffer = [];
  };
  const insertNode = (node: Descendant) =>
    insertBuffer.push({ ...node, ...getInsertProps(node) });
  const deleteNode = (node: Descendant) =>
    deleteBuffer.push({ ...node, ...getDeleteProps(node) });
  const passThroughNodes = (nodes: readonly Descendant[]) => {
    flushBuffers();
    for (const node of nodes) children.push(node);
  };
  const isInlineList = (nodes: Descendant[]) =>
    nodes.every((node) => TextApi.isText(node) || isInline(node));

  while (index < diff.length) {
    const [operation, value] = diff[index];
    const nodes = nodeTokens.decode(value);

    if (operation === 0) {
      passThroughNodes(nodes);
      index += 1;
      continue;
    }

    if (operation === -1) {
      if (index < diff.length - 1 && diff[index + 1][0] === 1) {
        const nextNodes = nodeTokens.decode(diff[index + 1][1]);

        if (isEqual(nodes, nextNodes, { ignoreDeep: ignoreProps })) {
          passThroughNodes(nextNodes);
          index += 2;
          continue;
        }

        if (isInlineList(nodes) && isInlineList(nextNodes)) {
          passThroughNodes(transformDiffTexts(nodes, nextNodes, options));
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
              passThroughNodes(diffNodesResult);
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
