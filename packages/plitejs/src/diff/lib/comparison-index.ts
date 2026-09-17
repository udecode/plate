import type {
  EditorSchemaElementStructure,
  EditorStateSchemaApi,
  Value,
} from '../..';
import {
  isElementNode,
  isTextNode,
  nodeProps,
  type JsonNode,
  type JsonRecord,
} from '../../core/change/tokens';
import type { ComparisonDocument } from './comparison-internal';
import { comparisonHash, stableStringify } from './comparison-internal';
import type { ComparisonSpan } from './comparison-types';

export type ComparisonTextSegment = Readonly<{
  from: number;
  offsetFrom: number;
  offsetTo: number;
  properties: Readonly<JsonRecord>;
  text: string;
  to: number;
}>;

export type ComparisonIndexNode = Readonly<{
  blockContainer: boolean;
  canonical: string;
  childIndexes: readonly number[];
  contentFrom: number;
  contentHash: string;
  contentTo: number;
  exactHash: string;
  from: number;
  index: number;
  inline: boolean;
  kind: 'element' | 'text';
  node: JsonNode;
  parentIndex: number | null;
  path: readonly number[];
  properties: Readonly<JsonRecord>;
  root: string | null;
  span: ComparisonSpan;
  structure: EditorSchemaElementStructure | null;
  text: string;
  textSegments: readonly ComparisonTextSegment[];
  to: number;
  type: string | null;
}>;

export type ComparisonRootIndex = Readonly<{
  length: number;
  name: string | null;
  nodeIndexes: readonly number[];
  topLevelIndexes: readonly number[];
}>;

export type ComparisonDocumentIndex = Readonly<{
  nodes: readonly ComparisonIndexNode[];
  roots: ReadonlyMap<string | null, ComparisonRootIndex>;
  textUnits: number;
}>;

const rootChildren = <V extends Value>(
  document: ComparisonDocument<V>,
  root: string | null
): readonly JsonNode[] =>
  (root === null
    ? document.children
    : (document.roots?.[root] ?? [])) as readonly JsonNode[];

const span = (root: string | null, from: number, to: number) =>
  Object.freeze({ from, root, to });

const elementType = (node: JsonNode) =>
  isElementNode(node) && typeof node.type === 'string' ? node.type : null;

export const createComparisonIndex = <V extends Value>(
  document: ComparisonDocument<V>,
  schema: EditorStateSchemaApi<V>
): ComparisonDocumentIndex => {
  const nodes: ComparisonIndexNode[] = [];
  const roots = new Map<string | null, ComparisonRootIndex>();
  const rootNames: Array<string | null> = [
    null,
    ...Object.keys(document.roots ?? {}).sort(),
  ];
  let textUnits = 0;

  for (const root of rootNames) {
    let position = 0;
    const rootNodeIndexes: number[] = [];
    const topLevelIndexes: number[] = [];

    const visit = (
      node: JsonNode,
      path: readonly number[],
      parentIndex: number | null
    ): number => {
      const index = nodes.length;
      const from = position;

      position += 1;
      nodes.push(undefined as never);

      const contentFrom = position;
      const childIndexes: number[] = [];
      let text: string;
      let textSegments: ComparisonTextSegment[];

      if (isTextNode(node)) {
        const { text: nodeText } = node;

        text = nodeText;
        textUnits += nodeText.length;
        position += nodeText.length;
        textSegments = [
          Object.freeze({
            from: contentFrom,
            offsetFrom: 0,
            offsetTo: nodeText.length,
            properties: nodeProps(node),
            text: nodeText,
            to: contentFrom + nodeText.length,
          }),
        ];
      } else {
        for (const [childIndex, child] of node.children.entries()) {
          childIndexes.push(visit(child, [...path, childIndex], index));
        }
        let offset = 0;

        textSegments = childIndexes.flatMap((childIndex) =>
          nodes[childIndex].textSegments.map((segment) => {
            const length = segment.offsetTo - segment.offsetFrom;
            const result = Object.freeze({
              ...segment,
              offsetFrom: offset,
              offsetTo: offset + length,
            });

            offset += length;

            return result;
          })
        );
        text = childIndexes
          .map((childIndex) => nodes[childIndex].text)
          .join('');
      }

      const contentTo = position;

      position += 1;
      const to = position;
      const canonical = stableStringify(node);
      const properties = nodeProps(node);
      const type = elementType(node);
      const element = type === null ? null : schema.element(type);
      const record: ComparisonIndexNode = Object.freeze({
        blockContainer: childIndexes.some(
          (childIndex) =>
            nodes[childIndex].kind === 'element' && !nodes[childIndex].inline
        ),
        canonical,
        childIndexes: Object.freeze(childIndexes),
        contentFrom,
        contentHash: comparisonHash(
          stableStringify({
            kind: isElementNode(node) ? 'element' : 'text',
            properties,
            text,
            type,
          })
        ),
        contentTo,
        exactHash: comparisonHash(canonical),
        from,
        index,
        inline: element?.behavior.inline ?? false,
        kind: isElementNode(node) ? 'element' : 'text',
        node,
        parentIndex,
        path: Object.freeze([...path]),
        properties,
        root,
        span: span(root, from, to),
        structure: element?.structure ?? null,
        text,
        textSegments: Object.freeze(textSegments),
        to,
        type,
      });

      nodes[index] = record;
      rootNodeIndexes.push(index);

      return index;
    };

    rootChildren(document, root).forEach((node, index) => {
      topLevelIndexes.push(visit(node, [index], null));
    });
    roots.set(
      root,
      Object.freeze({
        length: position,
        name: root,
        nodeIndexes: Object.freeze(rootNodeIndexes),
        topLevelIndexes: Object.freeze(topLevelIndexes),
      })
    );
  }

  return Object.freeze({
    nodes: Object.freeze(nodes),
    roots,
    textUnits,
  });
};

export const comparisonTextSpans = (
  node: ComparisonIndexNode,
  from: number,
  to: number
) => {
  if (from === to) return Object.freeze([]);

  return Object.freeze(
    node.textSegments.flatMap((segment) => {
      const overlapFrom = Math.max(from, segment.offsetFrom);
      const overlapTo = Math.min(to, segment.offsetTo);

      return overlapFrom < overlapTo
        ? [
            span(
              node.root,
              segment.from + overlapFrom - segment.offsetFrom,
              segment.from + overlapTo - segment.offsetFrom
            ),
          ]
        : [];
    })
  );
};

export const comparisonTextPoint = (
  node: ComparisonIndexNode,
  offset: number
): ComparisonSpan => {
  const bounded = Math.max(0, Math.min(offset, node.text.length));
  const segment =
    node.textSegments.find(
      (candidate) =>
        candidate.offsetFrom <= bounded && bounded <= candidate.offsetTo
    ) ?? node.textSegments.at(-1);
  const position = segment
    ? segment.from +
      Math.max(0, Math.min(bounded - segment.offsetFrom, segment.text.length))
    : node.contentFrom;

  return span(node.root, position, position);
};

export const comparisonTextRuns = (node: ComparisonIndexNode) => {
  const runs: Array<
    Readonly<{
      from: number;
      properties: Readonly<JsonRecord>;
      text: string;
      to: number;
    }>
  > = [];

  for (const segment of node.textSegments) {
    const previous = runs.at(-1);

    if (
      previous &&
      stableStringify(previous.properties) ===
        stableStringify(segment.properties)
    ) {
      runs[runs.length - 1] = Object.freeze({
        from: previous.from,
        properties: previous.properties,
        text: previous.text + segment.text,
        to: segment.to,
      });
      continue;
    }
    runs.push(
      Object.freeze({
        from: segment.from,
        properties: segment.properties,
        text: segment.text,
        to: segment.to,
      })
    );
  }

  return Object.freeze(runs);
};
