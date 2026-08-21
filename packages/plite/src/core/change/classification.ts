import type {
  EditorTransactionTopLevelRange,
  TopLevelRuntimeRange,
} from '../../interfaces/editor';
import type { DocumentIndex } from './document-index';
import type { RootChange } from './root-change';
import {
  isTextNode,
  jsonEqual,
  type JsonNode,
  nodeProps,
  pathKey,
} from './tokens';

export type DocumentChangeRootClassification = Readonly<{
  paths: readonly (readonly number[])[];
  properties: boolean;
  structure: boolean;
  text: boolean;
}>;

/**
 * Final-coordinate node candidate for node key publication.
 *
 * @internal
 */
export type DocumentChangeRuntimeCandidate = Readonly<{
  node: JsonNode;
  path: readonly number[];
}>;

export const classifyDocumentRange = (
  document: DocumentIndex,
  from: number,
  to: number
) => {
  const entries =
    from === to
      ? []
      : document
          .nodeRangesTouching(from, to)
          .filter((entry) => entry.from < to && from < entry.to);
  const structure = entries
    .flatMap((entry) => [
      ...(from <= entry.from && entry.from < to
        ? [
            {
              position: entry.from,
              signature: `open:${entry.kind}`,
            },
          ]
        : []),
      ...(from <= entry.to - 1 && entry.to - 1 < to
        ? [
            {
              position: entry.to - 1,
              signature: `close:${entry.kind}`,
            },
          ]
        : []),
    ])
    .sort((left, right) => left.position - right.position)
    .map(({ signature }) => signature);
  const text = entries
    .filter((entry) => entry.kind === 'text')
    .sort((left, right) => left.contentFrom - right.contentFrom)
    .flatMap((entry) => {
      const start = Math.max(from, entry.contentFrom);
      const end = Math.min(to, entry.contentTo);

      if (start >= end) return [];

      const node = document.node(entry.path);

      return isTextNode(node)
        ? [node.text.slice(start - entry.contentFrom, end - entry.contentFrom)]
        : [];
    });
  const properties = entries
    .filter((entry) => from <= entry.from && entry.from < to)
    .sort((left, right) => left.from - right.from)
    .map((entry) => nodeProps(document.node(entry.path)));

  return { properties, structure, text };
};

export const classifyRootChangeWithRuntimeCandidates = (
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex
): Readonly<{
  classification: DocumentChangeRootClassification;
  runtimeCandidates: readonly DocumentChangeRuntimeCandidate[];
}> => {
  const paths = new Map<string, readonly number[]>();
  const runtimeCandidates = new Map<string, DocumentChangeRuntimeCandidate>();
  const movedNode = change.movedNode(before);
  let properties = false;
  let structure = movedNode !== null;
  let text = false;

  if (movedNode) {
    paths.set(pathKey(movedNode.path), Object.freeze([...movedNode.path]));
    paths.set(
      pathKey(movedNode.targetPath),
      Object.freeze([...movedNode.targetPath])
    );
    runtimeCandidates.set(
      pathKey(movedNode.targetPath),
      Object.freeze({
        node: after.node(movedNode.targetPath),
        path: Object.freeze([...movedNode.targetPath]),
      })
    );
  }

  let positionBefore = 0;
  let positionAfter = 0;

  for (let index = 0; index < change.sections.length;) {
    const length = change.sections[index++]!;
    const inserted = change.sections[index++]!;
    const fromBefore = positionBefore;
    const toBefore = positionBefore + length;
    const fromAfter = positionAfter;
    const toAfter = positionAfter + (inserted < 0 ? length : inserted);

    positionBefore = toBefore;
    positionAfter = toAfter;

    if (inserted === -1) continue;

    const overlappingRanges = (
      document: DocumentIndex,
      from: number,
      to: number
    ) =>
      from === to
        ? []
        : document
            .nodeRangesTouching(from, to)
            .filter((entry) => entry.from < to && from < entry.to);

    const beforeEntries = overlappingRanges(before, fromBefore, toBefore);
    const afterEntries = overlappingRanges(after, fromAfter, toAfter);

    for (const entry of [...beforeEntries, ...afterEntries]) {
      paths.set(pathKey(entry.path), Object.freeze([...entry.path]));
    }
    for (const entry of [
      ...after.nodeRangesTouching(fromAfter, toAfter),
      ...after.nodeRangesTouching(fromAfter),
      ...after.nodeRangesTouching(toAfter),
    ]) {
      const key = pathKey(entry.path);

      if (runtimeCandidates.has(key)) continue;
      runtimeCandidates.set(
        key,
        Object.freeze({
          node: after.node(entry.path),
          path: Object.freeze([...entry.path]),
        })
      );
    }

    if (inserted === -2) {
      properties = true;
      continue;
    }

    const beforeRange = classifyDocumentRange(before, fromBefore, toBefore);
    const afterRange = classifyDocumentRange(after, fromAfter, toAfter);
    const beforeStructure = beforeRange.structure;
    const afterStructure = afterRange.structure;
    const rangeStructureChanged =
      beforeStructure.length !== afterStructure.length ||
      beforeStructure.some(
        (signature, index) => signature !== afterStructure[index]
      );

    if (rangeStructureChanged) {
      structure = true;
      continue;
    }

    if (movedNode) continue;

    const beforeText = beforeRange.text;
    const afterText = afterRange.text;

    if (
      beforeText.length !== afterText.length ||
      beforeText.some((value, index) => value !== afterText[index])
    ) {
      text = true;
    }

    const beforeOpen = beforeRange.properties;
    const afterOpen = afterRange.properties;

    if (
      beforeOpen.length !== afterOpen.length ||
      beforeOpen.some(
        (token, index) =>
          !afterOpen[index] || !jsonEqual(token, afterOpen[index])
      )
    ) {
      properties = true;
    }
  }

  return Object.freeze({
    classification: Object.freeze({
      paths: Object.freeze([...paths.values()]),
      properties,
      structure,
      text,
    }),
    runtimeCandidates: Object.freeze([...runtimeCandidates.values()]),
  });
};

export const classifyRootChange = (
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex
): DocumentChangeRootClassification =>
  classifyRootChangeWithRuntimeCandidates(change, before, after).classification;

/**
 * Classify one root without publishing classification metadata.
 *
 * @internal
 */
export const classifyDocumentChangeRoot = (
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex
): DocumentChangeRootClassification =>
  classifyRootChange(change, before, after);

export const getDocumentRangePaths = (
  document: DocumentIndex,
  from: number,
  to: number
) => {
  const paths = new Map<string, readonly number[]>();

  for (const entry of [
    ...document.nodeRangesTouching(from, to),
    ...document.nodeRangesTouching(from),
    ...document.nodeRangesTouching(to),
  ]) {
    const path = Object.freeze([...entry.path]);

    paths.set(pathKey(path), path);
  }

  return Object.freeze([...paths.values()]);
};

export const getTopLevelRange = (
  paths: readonly (readonly number[])[]
): TopLevelRuntimeRange | null => {
  const indices = paths.flatMap((path) =>
    path[0] === undefined ? [] : [path[0]]
  );

  return indices.length === 0
    ? null
    : Object.freeze([Math.min(...indices), Math.max(...indices)]);
};

/**
 * Final-coordinate paths at or inside one root change. Removed-only
 * ranges resolve to their surviving boundary; an empty result means the root.
 *
 * @internal
 */
export const getDocumentChangeAfterPaths = (
  change: RootChange,
  after: DocumentIndex
): readonly (readonly number[])[] => {
  const paths = new Map<string, readonly number[]>();

  change.iterChangedRanges((_fromBefore, _toBefore, fromAfter, toAfter) => {
    for (const path of getDocumentRangePaths(after, fromAfter, toAfter)) {
      paths.set(pathKey(path), path);
    }
  });

  return Object.freeze([...paths.values()]);
};

/**
 * Bounded top-level windows for each changed root range.
 *
 * @internal
 */
export const getDocumentChangeTopLevelRanges = (
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex
): readonly EditorTransactionTopLevelRange[] => {
  const ranges: EditorTransactionTopLevelRange[] = [];

  change.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
    ranges.push(
      Object.freeze({
        after: getTopLevelRange(
          getDocumentRangePaths(after, fromAfter, toAfter)
        ),
        before: getTopLevelRange(
          getDocumentRangePaths(before, fromBefore, toBefore)
        ),
      })
    );
  });

  return Object.freeze(ranges);
};
