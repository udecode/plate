import { ChangeDraft } from '../core/change/builder';
import {
  DocumentChange,
  getInternalDocumentRootChange,
  type DocumentChangeJson,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import {
  applyPropertyModifications,
  invertPropertyModifications,
  RootChange,
  type RootChangeSection,
  type RootChangeJson,
} from '../core/change/root-change';
import {
  nodeProps,
  type JsonRecord,
  jsonEqual,
  isTextBoundaryToken,
  isTextNode,
  PreparedTokenSlice,
  tokenLength,
  type JsonEditorValue,
} from '../core/change/tokens';
import { profileCoreDuration } from '../core/profiling';
import { constructCanonicalDocumentChange } from '../core/representation';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type { AnyEditor as Editor } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import {
  authoredContentLocations,
  authoredCounterpartIntervals,
  authoredInsertionAncestry,
  authoredInsertionOrigin,
  authoredOriginalLocation,
  isLaterAuthoredInsertion,
  resolveConcurrentAuthoredInsertion,
} from './counterparts';
import {
  authoredOriginSpans,
  authoredPositionAt,
  authoredPositionSpans,
  createAuthoredPositions,
  replaceAuthoredPositions,
  resolveAuthoredPosition,
  type AuthoredPosition,
  type AuthoredPositions,
  type AuthoredSpan,
} from './positions';
import {
  authoredCausalPropertyConflicts,
  authoredPropertyConflicts,
  authoredPropertyDependencies,
  matchingAuthoredProperties,
  projectAuthoredProperties,
  restoreAuthoredProperties,
  writeAuthoredProperties,
} from './properties';
import {
  readRecord,
  records,
  removeRecord,
  writeRecord,
  type RecordTree,
} from './record-tree';
import {
  captureAuthoredRetainedContent,
  readAuthoredRetainedContent,
  readAuthoredTextBoundary,
  type AuthoredRetainedData,
} from './retained';
import {
  authoredOriginOperation,
  indexAuthoredState,
  observesAuthoredOperation,
  authoredContentRemovals,
  isAuthoredEditVisible,
  authoredDeletionsAt,
  authoredContributionSteps,
  authoredPropertyWrites,
  authoredPropertyKeys,
  authoredTextPropertyWrites,
  authoredTextBoundary,
  authoredOperationPropertySteps,
  type AuthoredContributionStep,
  type AuthoredEditIdentity,
  type AuthoredOperation,
  type AuthoredRecord,
  type AuthoredState,
} from './state';

export class AuthoredMappingConflictError extends Error {
  readonly identities: readonly string[];

  constructor(identities: readonly string[]) {
    super('Authored decision conflicts with retained contributions.');
    this.name = 'AuthoredMappingConflictError';
    this.identities = identities;
  }
}

export type AuthoredPositionRoots = RecordTree<
  Readonly<{
    birth: string | null;
    present: boolean;
    positions: AuthoredPositions;
  }>
> | null;
export type AuthoredRootTarget = Readonly<{
  after: Readonly<{ birth: string | null; present: boolean }> | null;
  before: Readonly<{ birth: string | null; present: boolean }> | null;
  root: string;
}>;
export type AuthoredTarget = Readonly<{
  boundaries?: ReadonlyArray<
    Readonly<{
      position: NonNullable<AuthoredPosition['left']>;
      spans: readonly AuthoredSpan[];
    }>
  >;
  association: 'left' | 'right' | null;
  afterFrom: AuthoredPosition;
  afterTo: AuthoredPosition;
  from: AuthoredPosition;
  inserted: readonly AuthoredSpan[];
  insertedContent?: AuthoredRetainedData | null;
  removed: readonly AuthoredSpan[];
  retained: AuthoredRetainedData | null;
  root: string;
  section: number;
  to: AuthoredPosition;
}>;

export type AuthoredInsertion = Readonly<{
  association: 'left' | 'right';
  position: number;
  root: string;
}>;

const spanInsertionAssociation = (
  state: AuthoredState,
  current: AuthoredSpan
) => {
  const operation = authoredOriginOperation(state, current.origin);
  if (operation?.kind !== 'edit') return null;
  for (const step of authoredContributionSteps(operation)) {
    for (const target of step.targets) {
      if (
        target.association &&
        target.inserted.some(
          (span) =>
            span.origin === current.origin &&
            span.offset <= current.offset &&
            span.offset + span.length > current.offset
        )
      ) {
        return target.association;
      }
    }
  }
  return null;
};

export const resolveAuthoredRetainedPosition = (
  state: AuthoredState,
  positions: AuthoredPositions,
  position: AuthoredPosition
) => {
  const from = resolveAuthoredPosition(
    positions,
    { left: position.left, right: null },
    'left',
    'collapse'
  );
  const to = resolveAuthoredPosition(
    positions,
    { left: null, right: position.right },
    'right',
    'collapse'
  );
  if (from === null || to === null) return to ?? from;
  if (from === null || to === null || from >= to) return to;
  const query = position.right ?? position.left;
  for (const current of authoredPositionSpans(positions, from, to)) {
    for (const { anchor, insertion, span } of authoredInsertionAncestry(
      state,
      positions,
      current.span
    )) {
      if (!query || !anchor || query.origin !== anchor.origin) continue;
      const replacedFrom =
        insertion.replacedFrom?.right ?? insertion.replacedFrom?.left;
      const replacesFromBeforeQuery =
        replacedFrom?.origin === query.origin &&
        replacedFrom.offset < query.offset;
      if (anchor.offset > query.offset && !replacesFromBeforeQuery) {
        return current.from;
      }
      if (
        anchor.offset === query.offset &&
        spanInsertionAssociation(state, span) === 'right'
      ) {
        return current.from;
      }
      break;
    }
  }
  return to;
};

export type AuthoredStep = Readonly<{
  forward: DocumentChangeJson;
  rootTargets: readonly AuthoredRootTarget[];
  targets: readonly AuthoredTarget[];
}>;

// An undo restores only what its original removed; a redo re-applies the
// original edit, so it overrides removals it observed just like the original.
const isAuthoredUndo = (state: AuthoredState, operation: AuthoredOperation) => {
  let undo = false;
  let current: AuthoredOperation | null = operation;
  while (current?.kind === 'edit' && current.inverseOf) {
    undo = !undo;
    current = readRecord(state.operations, current.inverseOf);
  }
  return undo;
};

export const authoredRootNodes = (value: JsonEditorValue, root: string) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);
export const authoredOperationOrigin = (id: string, root: string) =>
  `${id}:${root}`;

export const authoredPositionRoot = (
  roots: AuthoredPositionRoots,
  preferredRoot: string,
  position: AuthoredPosition,
  association: 'left' | 'right'
): string | null => {
  for (const side of association === 'left'
    ? (['left', 'right'] as const)
    : (['right', 'left'] as const)) {
    if (!position[side]) continue;
    const endpoint =
      side === 'left'
        ? { left: position.left, right: null }
        : { left: null, right: position.right };
    const preferred = readRecord(roots, preferredRoot);
    if (
      preferred?.present &&
      resolveAuthoredPosition(preferred.positions, endpoint, side) !== null
    ) {
      return preferredRoot;
    }
    for (const [root, current] of records(roots)) {
      if (
        root !== preferredRoot &&
        current.present &&
        resolveAuthoredPosition(current.positions, endpoint, side) !== null
      ) {
        return root;
      }
    }
  }
  return null;
};

export function* authoredContentSpans(
  roots: AuthoredPositionRoots,
  preferredRoot: string,
  content: Pick<AuthoredSpan, 'length' | 'offset' | 'origin'>
): Generator<{ from: number; to: number; root: string }> {
  let remaining = content.length;
  const preferred = readRecord(roots, preferredRoot);
  function* visit(root: string, positions: AuthoredPositions) {
    for (const fragment of authoredOriginSpans(positions, content.origin, {
      from: content.offset,
      to: content.offset + content.length,
    })) {
      const from = Math.max(content.offset, fragment.span.offset);
      const to = Math.min(
        content.offset + content.length,
        fragment.span.offset + fragment.span.length
      );
      if (from < to) {
        remaining -= to - from;
        yield {
          from: fragment.from + from - fragment.span.offset,
          to: fragment.from + to - fragment.span.offset,
          root,
        };
      }
    }
  }
  if (preferred?.present) yield* visit(preferredRoot, preferred.positions);
  if (remaining === 0) return;
  for (const [root, current] of records(roots)) {
    if (root !== preferredRoot && current.present) {
      yield* visit(root, current.positions);
    }
    if (remaining === 0) return;
  }
}

export const createAuthoredPositionRoots = (
  value: JsonEditorValue,
  documentId: string
): AuthoredPositionRoots => {
  let roots: AuthoredPositionRoots = null;
  for (const root of ['main', ...Object.keys(value.roots ?? {})]) {
    roots = writeRecord(roots, root, {
      birth: null,
      present: true,
      positions: createAuthoredPositions(
        DocumentIndex.fromValue(authoredRootNodes(value, root)).length,
        `${documentId}:base:${root}`
      ),
    });
  }
  return roots;
};

const authoredProposalRemovesText = (
  state: AuthoredState,
  proposal: AuthoredRecord
) =>
  [...records(proposal.operations)].some(([, id]) => {
    const operation = readRecord(state.operations, id);
    return (
      operation?.kind === 'edit' &&
      authoredContributionSteps(operation).some((step) =>
        step.targets.some((target) => {
          const removed = readAuthoredRetainedContent(target);
          return (
            removed?.kind === 'delete' &&
            DocumentIndex.fromValue(removed.slice.content)
              .slice(removed.from, removed.to)
              .toJSON()
              .some((token) => token.kind === 'text' && token.text.length > 0)
          );
        })
      )
    );
  });

export const authoredEditTarget = (
  change: DocumentChange,
  roots: AuthoredPositionRoots,
  state: AuthoredState,
  options: Readonly<{
    adjacentDeletions: boolean;
    authorId: string;
    value?: JsonEditorValue;
  }>
): string | null => {
  if (change.createRoots.size || change.deleteRoots.size) return null;
  const documents = new Map<string, DocumentIndex>();
  // A mark boundary between text nodes has width but no content, so a
  // deletion just across it still continues the same run.
  const acrossTextBoundaries = (root: string, position: number) => {
    const { value } = options;
    if (!value) return [position];
    let document = documents.get(root);
    if (!document) {
      document = DocumentIndex.fromValue(authoredRootNodes(value, root));
      documents.set(root, document);
    }
    const isTextBoundary = (from: number) => {
      if (from < 0 || from + 1 > document.length) return false;
      const [token, ...rest] = document.slice(from, from + 1).toJSON();
      return rest.length === 0 && !!token && isTextBoundaryToken(token);
    };
    const positions = [position];
    for (let next = position; isTextBoundary(next); next += 1) {
      positions.push(next + 1);
    }
    for (let previous = position; isTextBoundary(previous - 1); previous -= 1) {
      positions.push(previous - 1);
    }
    return positions;
  };
  const isForeign = (identity: string) =>
    readRecord(state.changes, identity)?.authorId !== options.authorId;
  let adjacentTarget: string | null = null;
  let containedTarget: string | null = null;
  let mixed = false;
  let uncovered = false;
  for (const [root, sections] of rootSections(change.toJSON())) {
    const index = readRecord(roots, root)?.positions;
    if (!index) return null;
    let position = 0;
    for (const section of sections) {
      if (section.replacement || section.properties) {
        const insertion = section.length === 0;
        const from = section.length ? position : position - 1;
        const to = section.length ? position + section.length : position + 1;
        for (const { span } of authoredPositionSpans(
          index,
          Math.max(0, from),
          Math.min(index.root?.length ?? 0, to)
        )) {
          const identities = section.properties
            ? [
                ...authoredPropertyDependencies(
                  span.properties,
                  section.properties.operations
                ),
                span.birth,
              ]
            : insertion
              ? [span.birth, span.placement].filter(
                  (identity): identity is string => identity !== null
                )
              : [span.placement ?? span.birth];
          let covered = false;

          for (const identity of identities) {
            if (!identity) continue;
            const proposal = readRecord(state.changes, identity);
            if (
              proposal?.status !== 'pending' ||
              (insertion && proposal.authorId !== options.authorId)
            ) {
              continue;
            }
            if (containedTarget && identity !== containedTarget) mixed = true;
            containedTarget ??= identity;
            covered = true;
          }
          if (!insertion && !covered) uncovered = true;
          if (
            !insertion &&
            span.placement &&
            span.placement !== containedTarget
          ) {
            mixed = true;
          }
        }
        if (section.replacement && options.adjacentDeletions) {
          const carriesText =
            section.replacement.length === 0 ||
            section.replacement.some((token) => token.kind === 'text');
          const editFrom = position;
          const editTo = insertion ? position : position + section.length;
          for (const deletionPosition of (insertion
            ? [editFrom]
            : [editFrom, editTo]
          ).flatMap((edge) => acrossTextBoundaries(root, edge))) {
            for (const { operation, target: deletion } of authoredDeletionsAt(
              state,
              root,
              authoredPositionAt(index, deletionPosition)
            )) {
              const proposal = readRecord(state.changes, operation.changeId);
              if (
                proposal?.status !== 'pending' ||
                proposal.authorId !== options.authorId
              ) {
                continue;
              }
              // Input carrying text continues an adjacent deletion. A bare
              // block break joins it only when that suggestion removed no
              // text, as a paragraph join does, or restores deleted content.
              if (
                !carriesText &&
                authoredProposalRemovesText(state, proposal) &&
                !restoredAuthoredSpans({
                  state,
                  roots,
                  positions: index,
                  changeId: proposal.id,
                  root,
                  from: editFrom,
                  to: editTo,
                  replacement: section.replacement,
                })
              ) {
                continue;
              }
              const deletedFrom = resolveAuthoredPosition(
                index,
                deletion.from,
                'left',
                'collapse'
              );
              const deletedTo = resolveAuthoredPosition(
                index,
                deletion.to,
                'right',
                'collapse'
              );
              if (
                deletedFrom === null ||
                deletedTo === null ||
                deletionPosition < deletedFrom ||
                deletionPosition > deletedTo ||
                // Another author's content between them keeps the edit apart.
                [
                  ...authoredPositionSpans(
                    index,
                    Math.min(deletionPosition, deletedFrom, deletedTo),
                    Math.max(deletionPosition, deletedFrom, deletedTo)
                  ),
                ].some(({ span }) => {
                  const birth =
                    span.birth && readRecord(state.changes, span.birth);
                  return !!birth && birth.authorId !== options.authorId;
                })
              ) {
                continue;
              }
              if (
                containedTarget &&
                !isForeign(containedTarget) &&
                containedTarget !== proposal.id
              ) {
                mixed = true;
              }
              adjacentTarget ??= proposal.id;
            }
          }
        }
      }
      position += section.length;
    }
  }
  if (mixed || (containedTarget && uncovered)) return null;
  // Deleting inside another author's insertion continues the adjacent own
  // deletion instead of amending their proposal.
  return (
    (containedTarget && !isForeign(containedTarget) ? containedTarget : null) ??
    (options.adjacentDeletions ? adjacentTarget : null) ??
    containedTarget
  );
};

export const coalesceAuthoredReplacements = (
  sections: RootChangeJson
): RootChangeJson => {
  const joined: Array<RootChangeJson[number]> = [];
  for (const section of sections) {
    const prior = joined.at(-1);
    if (prior?.replacement && section.replacement) {
      joined[joined.length - 1] = {
        length: prior.length + section.length,
        replacement: [...prior.replacement, ...section.replacement],
      };
    } else joined.push(section);
  }
  return joined;
};

const rootSections = (
  change: DocumentChangeJson
): ReadonlyArray<readonly [string, RootChangeJson]> => [
  ...(change.primary ? [['main', change.primary] as const] : []),
  ...Object.entries(change.roots ?? {}),
];

export const partitionAuthoredTextEdit = (
  change: DocumentChange,
  roots: AuthoredPositionRoots,
  state: AuthoredState,
  authorId: string,
  value: JsonEditorValue
): ReadonlyArray<{
  change: DocumentChange;
  changeId: string | null;
}> | null => {
  if (change.createRoots.size || change.deleteRoots.size) return null;
  const edits: Array<{
    root: string;
    from: number;
    length: number;
    changeId: string | null;
    replacement: NonNullable<RootChangeJson[number]['replacement']>;
  }> = [];
  const insertions: typeof edits = [];
  const owners = new Set<string | null>();
  const lengths = new Map<string, number>();
  for (const [root, sections] of rootSections(change.toJSON())) {
    const positions = readRecord(roots, root)?.positions;
    if (!positions) return null;
    const document = DocumentIndex.fromValue(authoredRootNodes(value, root));
    lengths.set(root, document.length);
    let from = 0;
    let removedLength = 0;
    for (const section of sections) {
      if (section.properties) return null;
      if (section.replacement) {
        if (
          PreparedTokenSlice.fromTokens(section.replacement).tokens.some(
            (token) => token.kind !== 'text'
          )
        ) {
          return null;
        }
        if (
          document
            .slice(from, from + section.length)
            .tokens.some((token) => token.kind !== 'text')
        ) {
          return null;
        }
        if (section.replacement.length) {
          insertions.push({
            root,
            from: from - removedLength,
            length: 0,
            changeId: null,
            replacement: section.replacement,
          });
        }
        let position = from;
        for (const span of removedSpans(
          positions,
          from,
          from + section.length
        )) {
          const proposal = span.birth
            ? readRecord(state.changes, span.birth)
            : null;
          const owner =
            proposal?.authorId === authorId && proposal.status === 'pending'
              ? proposal.id
              : null;
          edits.push({
            root,
            from: position,
            length: span.length,
            changeId: owner,
            replacement: [],
          });
          position += span.length;
          owners.add(owner);
        }
        removedLength += section.length;
      }
      from += section.length;
    }
  }
  if ([...owners].every((owner) => owner === null)) {
    return null;
  }
  // Right-to-left edits retain their original coordinates and avoid pairwise rebasing.
  return edits
    .reverse()
    .concat(insertions.reverse())
    .map(({ root, from, length, changeId, replacement }) => {
      const currentLength = getDefined(lengths.get(root));
      const sections = [
        { length: from },
        { length, replacement },
        { length: currentLength - from - length },
      ];
      lengths.set(
        root,
        currentLength -
          length +
          PreparedTokenSlice.fromTokens(replacement).length
      );
      return {
        changeId,
        change: DocumentChange.fromJSON({
          version: 3,
          ...(root === 'main'
            ? { primary: sections }
            : { roots: { [root]: sections } }),
        }),
      };
    });
};

const removedSpans = (positions: AuthoredPositions, from: number, to: number) =>
  [...authoredPositionSpans(positions, from, to)].map(
    ({ from: start, span, to: end }) => ({
      ...span,
      length: Math.min(to, end) - Math.max(from, start),
      offset: span.offset + Math.max(0, from - start),
    })
  );

export const partitionAuthoredStructuralEdit = (
  change: DocumentChange,
  roots: AuthoredPositionRoots,
  state: AuthoredState,
  authorId: string,
  value: JsonEditorValue
): ReturnType<typeof partitionAuthoredTextEdit> => {
  if (change.createRoots.size || change.deleteRoots.size) return null;
  if (crossRootMovement(change, value)) return null;
  const regions: Array<{
    root: string;
    from: number;
    to: number;
    changeId: string;
  }> = [];
  const lengths = new Map<string, number>();
  for (const [root, sections] of rootSections(change.toJSON())) {
    const positions = readRecord(roots, root)?.positions;
    if (!positions) return null;
    const document = DocumentIndex.fromValue(authoredRootNodes(value, root));
    if (getInternalDocumentRootChange(change, root)?.movedNode(document)) {
      return null;
    }
    if (sections.some((section) => section.properties)) return null;
    lengths.set(root, document.length);
    const candidates: typeof regions = [];
    let from = 0;
    for (const section of sections) {
      if (section.replacement && section.length) {
        let position = from;
        for (const span of removedSpans(
          positions,
          from,
          from + section.length
        )) {
          const proposal = span.birth
            ? readRecord(state.changes, span.birth)
            : null;
          if (
            proposal?.authorId === authorId &&
            proposal.status === 'pending'
          ) {
            const previous = candidates.at(-1);
            if (
              previous?.changeId === proposal.id &&
              previous.to === position
            ) {
              previous.to += span.length;
            } else {
              candidates.push({
                root,
                from: position,
                to: position + span.length,
                changeId: proposal.id,
              });
            }
          }
          position += span.length;
        }
      }
      from += section.length;
    }
    const enclosing = (position: number) =>
      document
        .openContextAt(position)
        .filter((entry) => entry.from < position && position < entry.to)
        .map((entry) => entry.kind);
    for (const candidate of candidates) {
      const before = enclosing(candidate.from);
      const after = enclosing(candidate.to);
      if (jsonEqual(before, after)) regions.push(candidate);
      else {
        let position = candidate.from;
        for (const token of document.slice(candidate.from, candidate.to)
          .tokens) {
          const length = tokenLength(token);
          if (token.kind === 'text') {
            regions.push({
              ...candidate,
              from: position,
              to: position + length,
            });
          }
          position += length;
        }
      }
    }
  }
  if (!regions.length) return null;
  const draft = new ChangeDraft(value);
  const parts: Array<
    NonNullable<ReturnType<typeof partitionAuthoredTextEdit>>[number]
  > = [];
  for (const { root, from, to, changeId } of regions.reverse()) {
    const length = getDefined(lengths.get(root));
    const sections = [
      { length: from },
      { length: to - from, replacement: [] },
      { length: length - to },
    ];
    const deletion = DocumentChange.fromJSON({
      version: 3,
      ...(root === 'main'
        ? { primary: sections }
        : { roots: { [root]: sections } }),
    });
    draft.apply(deletion, { classify: false });
    lengths.set(root, length - (to - from));
    parts.push({ changeId, change: deletion });
  }
  const residual = DocumentChange.transform(change, draft.change, value).a;
  if (!residual.empty) parts.push({ changeId: null, change: residual });
  return parts;
};

const sameContent = (
  left: readonly AuthoredSpan[],
  right: readonly AuthoredSpan[]
) => {
  let rightIndex = 0;
  let rightOffset = 0;
  for (const span of left) {
    let offset = 0;
    while (offset < span.length) {
      const other = right[rightIndex];
      if (
        !other ||
        span.origin !== other.origin ||
        span.offset + offset !== other.offset + rightOffset
      ) {
        return false;
      }
      const length = Math.min(span.length - offset, other.length - rightOffset);
      offset += length;
      rightOffset += length;
      if (rightOffset === other.length) {
        rightIndex += 1;
        rightOffset = 0;
      }
    }
  }
  return rightIndex === right.length;
};

const ancestorsAt = (value: DocumentIndex, position: number) => {
  const starts = new Set<number>();
  for (const side of [-1, 1] as const) {
    const point = value.pointAt(position, side);
    if (!point) continue;
    for (let length = 1; length <= point.path.length; length++) {
      const ancestor = value.nodeRange(point.path.slice(0, length));
      if (position > ancestor.from && position < ancestor.to) {
        starts.add(ancestor.from);
      }
    }
  }
  return starts;
};

const crossRootMovement = (change: DocumentChange, value: JsonEditorValue) => {
  if (change.createRoots.size || change.deleteRoots.size) return null;
  const changed = rootSections(change.toJSON());
  if (changed.length !== 2) return null;
  if (
    changed.some(([, sections]) =>
      sections.some((section) => section.properties)
    )
  ) {
    return null;
  }
  const replacements = changed.flatMap(([root, sections]) => {
    let position = 0;
    return sections.flatMap((section) => {
      const from = position;
      position += section.length;
      return section.replacement
        ? [{ from, to: position, insert: section.replacement, root }]
        : [];
    });
  });
  if (replacements.length !== 2) return null;
  const removed = replacements.find(
    (replacement) =>
      replacement.from < replacement.to && replacement.insert.length === 0
  );
  const inserted = replacements.find(
    (replacement) =>
      replacement.from === replacement.to && replacement.insert.length > 0
  );
  if (!removed || !inserted || removed.root === inserted.root) return null;
  const source = DocumentIndex.fromValue(
    authoredRootNodes(value, removed.root)
  );
  const target = DocumentIndex.fromValue(
    authoredRootNodes(value, inserted.root)
  );
  const node = source.nodeStartingAt(removed.from);
  if (
    !node ||
    node.to !== removed.to ||
    !target.childBoundaryAt(inserted.from) ||
    !jsonEqual(source.slice(removed.from, removed.to).toJSON(), inserted.insert)
  ) {
    return null;
  }
  return { removed, inserted };
};

const restoredAuthoredSpans = (input: {
  state: AuthoredState;
  roots: AuthoredPositionRoots;
  positions: AuthoredPositions;
  changeId: string;
  root: string;
  from: number;
  to: number;
  replacement: NonNullable<RootChangeJson[number]['replacement']>;
}): readonly AuthoredSpan[] | null => {
  const replacement = PreparedTokenSlice.fromTokens(input.replacement);
  if (!replacement.length) return null;
  const candidates = new Set<AuthoredTarget>();
  for (const position of [input.from, input.to]) {
    for (const { operation, target } of authoredDeletionsAt(
      input.state,
      input.root,
      authoredPositionAt(input.positions, position)
    )) {
      if (operation.changeId === input.changeId) candidates.add(target);
    }
  }
  for (const target of candidates) {
    const from = resolveAuthoredPosition(
      input.positions,
      target.from,
      'left',
      'collapse'
    );
    const to = resolveAuthoredPosition(
      input.positions,
      target.to,
      'right',
      'collapse'
    );
    if (from === null || to === null || input.from < from || input.to > to) {
      continue;
    }
    const retained = readAuthoredRetainedContent(target);
    if (!retained || retained.kind !== 'delete') continue;
    const document = DocumentIndex.fromValue(retained.slice.content);
    let offset = retained.from;
    const missing: Array<{ from: number; to: number; span: AuthoredSpan }> = [];
    for (const span of target.removed) {
      const present = [...authoredContentLocations(input.roots, span)]
        .filter(
          (location) =>
            location.root !== input.root ||
            location.from < input.from ||
            location.to > input.to
        )
        .sort((a, b) => a.fromOffset - b.fromOffset);
      let cursor = span.offset;
      for (const location of present) {
        if (cursor < location.fromOffset) {
          missing.push({
            from: offset + cursor - span.offset,
            to: offset + location.fromOffset - span.offset,
            span: {
              ...span,
              offset: cursor,
              length: location.fromOffset - cursor,
            },
          });
        }
        cursor = Math.max(cursor, location.toOffset);
      }
      if (cursor < span.offset + span.length) {
        missing.push({
          from: offset + cursor - span.offset,
          to: offset + span.length,
          span: {
            ...span,
            offset: cursor,
            length: span.offset + span.length - cursor,
          },
        });
      }
      offset += span.length;
    }
    if (!missing.length) continue;
    const content = PreparedTokenSlice.concat(
      missing.map((entry) => document.slice(entry.from, entry.to))
    );
    if (replacement.length > content.length) continue;
    for (const start of new Set([0, content.length - replacement.length])) {
      if (
        !jsonEqual(
          content.slice(start, start + replacement.length).toJSON(),
          replacement.toJSON()
        )
      ) {
        continue;
      }
      let position = 0;
      const spans: AuthoredSpan[] = [];
      for (const { span } of missing) {
        const begin = Math.max(start, position);
        const end = Math.min(
          start + replacement.length,
          position + span.length
        );
        if (begin < end) {
          spans.push({
            ...span,
            offset: span.offset + begin - position,
            length: end - begin,
          });
        }
        position += span.length;
      }
      return spans;
    }
  }
  return null;
};

const captureAuthoredStep = (input: {
  schema?: CompiledEditorSchema | null;
  state?: AuthoredState;
  associations?: ReadonlyArray<AuthoredTarget['association']>;
  insertion?: AuthoredInsertion;
  afterPositions?: AuthoredPositionRoots;
  restoreIdentity?: boolean;
  change: DocumentChange;
  changeId: string;
  operationId: string;
  positions: AuthoredPositionRoots;
  value: JsonEditorValue;
  offsets: Map<string, number>;
}) =>
  profileCoreDuration('authored-capture', () => {
    const json = input.change.toJSON();
    const afterRoots =
      json.roots || json.createRoots || json.deleteRoots
        ? new ChangeDraft(input.value).apply(input.change).after.roots
        : input.value.roots;
    const crossMovement = crossRootMovement(input.change, input.value);
    let roots = input.positions;
    const dependencies = new Set<string>();
    const publicationDependencies = new Set<string>();
    const structuralDependencies = new Set<string>();
    const targets: AuthoredTarget[] = [];
    const rootTargets: AuthoredRootTarget[] = [];
    const depend = (identity: string | null) => {
      if (identity && identity !== input.changeId) {
        dependencies.add(identity);
        publicationDependencies.add(identity);
      }
    };
    const dependOnTarget = (
      targetDependencies: Set<string>,
      identity: string | null
    ) => {
      if (identity && identity !== input.changeId) {
        targetDependencies.add(identity);
      }
    };
    for (const root of [
      ...input.change.createRoots,
      ...input.change.deleteRoots,
    ]) {
      const previous = readRecord(roots, root);
      if (previous) {
        depend(previous.birth);
        dependOnTarget(structuralDependencies, previous.birth);
      }
      rootTargets.push({
        root,
        before: previous
          ? { birth: previous.birth, present: previous.present }
          : null,
        after:
          input.afterPositions !== undefined
            ? (() => {
                const after = readRecord(input.afterPositions, root);
                return after
                  ? { birth: after.birth, present: after.present }
                  : null;
              })()
            : {
                birth: input.changeId,
                present: input.change.createRoots.has(root),
              },
      });
    }
    for (const [root, sections] of rootSections(json)) {
      const previousRoot = readRecord(roots, root);
      if (previousRoot) {
        depend(previousRoot.birth);
        dependOnTarget(structuralDependencies, previousRoot.birth);
      }
      const before =
        previousRoot?.positions ??
        createAuthoredPositions(0, `${input.operationId}:empty:${root}`);
      const native = DocumentIndex.fromValue(
        authoredRootNodes(input.value, root)
      );
      const movement = getInternalDocumentRootChange(
        input.change,
        root
      )?.movedNode(native);
      const movedSpans =
        crossMovement?.inserted.root === root
          ? removedSpans(
              getDefined(
                readRecord(input.positions, crossMovement.removed.root)
              ).positions,
              crossMovement.removed.from,
              crossMovement.removed.to
            ).map((span) => ({ ...span, placement: input.changeId }))
          : movement
            ? (() => {
                const range = native.nodeRange(movement.path);
                return removedSpans(before, range.from, range.to).map(
                  (span) => ({
                    ...span,
                    placement: input.changeId,
                  })
                );
              })()
            : null;
      let positions = before;
      const positionEdits: Array<{
        from: number;
        to: number;
        spans: readonly AuthoredSpan[];
      }> = [];
      let fromBefore = 0;
      let fromAfter = 0;
      let insertedOffset = input.offsets.get(root) ?? 0;
      const pending: Array<
        Omit<AuthoredTarget, 'afterFrom' | 'afterTo' | 'retained'> & {
          afterFromOffset: number;
          afterToOffset: number;
          beforeFromOffset: number;
          beforeToOffset: number;
          dependencies: readonly string[];
          publicationDependencies: readonly string[];
          retainedKind: 'delete' | 'move' | 'properties';
        }
      > = [];
      for (const [sectionIndex, section] of sections.entries()) {
        const replacementLength = section.replacement?.reduce(
          (sum, token) => sum + tokenLength(token),
          0
        );
        const outputLength = replacementLength ?? section.length;
        if (section.replacement || section.properties) {
          const targetDependencies = new Set<string>();
          const targetPublicationDependencies = new Set<string>();
          const dependOnPublication = (identity: string | null) => {
            dependOnTarget(targetDependencies, identity);
            dependOnTarget(targetPublicationDependencies, identity);
          };
          const removed = removedSpans(
            before,
            fromBefore,
            fromBefore + section.length
          );
          const propertyNode = section.properties
            ? native.nodeStartingAt(fromBefore)
            : null;
          const propertyContent =
            propertyNode?.kind === 'text'
              ? removedSpans(before, propertyNode.from + 1, propertyNode.to - 1)
              : [];
          for (const span of [...removed, ...propertyContent]) {
            dependOnPublication(span.birth);
            dependOnPublication(span.placement);
            dependOnTarget(structuralDependencies, span.placement);
            for (const writer of section.properties
              ? authoredPropertyDependencies(
                  span.properties,
                  section.properties.operations
                )
              : Object.values(span.properties)) {
              dependOnPublication(writer);
            }
          }
          // Structural context orders replay. It does not make an edit to
          // accepted content reviewable merely because an ancestor is pending.
          for (const position of ancestorsAt(native, fromBefore)) {
            for (const { span } of authoredPositionSpans(
              before,
              position,
              position + 1
            )) {
              dependOnTarget(targetDependencies, span.birth);
              dependOnTarget(targetDependencies, span.placement);
              dependOnTarget(structuralDependencies, span.placement);
            }
          }
          if (
            section.length === 0 &&
            fromBefore > 0 &&
            fromBefore < native.length
          ) {
            const left = [
              ...authoredPositionSpans(before, fromBefore - 1, fromBefore),
            ][0];
            const right = [
              ...authoredPositionSpans(before, fromBefore, fromBefore + 1),
            ][0];
            if (left && right) {
              if (section.replacement?.some((token) => token.kind !== 'text')) {
                dependOnTarget(targetDependencies, left.span.birth);
                dependOnTarget(targetDependencies, right.span.birth);
              }
              if (left.span.birth && right.span.birth) {
                dependOnPublication(left.span.birth);
                dependOnPublication(right.span.birth);
              }
              if (left.span.placement && right.span.placement) {
                dependOnPublication(left.span.placement);
                dependOnTarget(structuralDependencies, left.span.placement);
                dependOnPublication(right.span.placement);
                dependOnTarget(structuralDependencies, right.span.placement);
              }
            }
          }
          const spans =
            input.afterPositions !== undefined
              ? removedSpans(
                  readRecord(input.afterPositions, root)?.positions ??
                    createAuthoredPositions(
                      0,
                      `${input.operationId}:empty:${root}`
                    ),
                  fromAfter,
                  fromAfter + outputLength
                ).map((span) =>
                  input.restoreIdentity
                    ? {
                        ...span,
                        birth: input.changeId,
                        placement: null,
                      }
                    : span
                )
              : section.properties
                ? removed.map((span) => ({
                    ...span,
                    properties: writeAuthoredProperties(
                      span.properties,
                      getDefined(section.properties).operations,
                      input.changeId
                    ),
                  }))
                : outputLength
                  ? (movedSpans ??
                    (input.state && section.replacement
                      ? restoredAuthoredSpans({
                          state: input.state,
                          roots: input.positions,
                          positions: before,
                          changeId: input.changeId,
                          root,
                          from: fromBefore,
                          to: fromBefore + section.length,
                          replacement: section.replacement,
                        })
                      : null) ?? [
                      {
                        birth: input.changeId,
                        length: outputLength,
                        offset: insertedOffset,
                        origin: authoredOperationOrigin(
                          input.operationId,
                          root
                        ),
                        placement: null,
                        properties: {},
                      },
                    ])
                  : [];
          pending.push({
            association:
              section.length === 0 && replacementLength
                ? (input.associations?.[targets.length + pending.length] ??
                  (input.insertion?.root === root &&
                  fromBefore === input.insertion.position
                    ? input.insertion.association
                    : input.state && spans[0]
                      ? spanInsertionAssociation(input.state, spans[0])
                      : null))
                : null,
            from: authoredPositionAt(before, fromBefore),
            to: authoredPositionAt(before, fromBefore + section.length),
            root,
            section: sectionIndex,
            removed,
            inserted: spans,
            afterFromOffset: fromAfter,
            afterToOffset: fromAfter + outputLength,
            beforeFromOffset: fromBefore,
            beforeToOffset: fromBefore + section.length,
            dependencies: [...targetDependencies],
            publicationDependencies: [...targetPublicationDependencies],
            retainedKind: section.properties
              ? 'properties'
              : movement || crossMovement
                ? 'move'
                : 'delete',
          });
          positionEdits.push({
            from: fromBefore,
            to: fromBefore + section.length,
            spans,
          });
          if (replacementLength !== undefined) {
            insertedOffset += replacementLength;
          }
        }
        fromBefore += section.length;
        fromAfter += outputLength;
      }
      positions =
        input.afterPositions !== undefined
          ? (readRecord(input.afterPositions, root)?.positions ??
            createAuthoredPositions(0, `${input.operationId}:empty:${root}`))
          : applyPositionEdits(before, positionEdits, !!movement);
      if (input.restoreIdentity) {
        for (const target of pending) {
          positions = replaceAuthoredPositions(
            positions,
            target.afterFromOffset,
            target.afterToOffset,
            target.inserted
          );
        }
      }
      input.offsets.set(root, insertedOffset);
      const afterNative = RootChange.fromJSON(sections).apply(native);
      for (const target of pending) {
        const {
          afterFromOffset,
          afterToOffset,
          beforeFromOffset,
          beforeToOffset,
          dependencies: targetDependencies,
          publicationDependencies: targetPublicationDependencies,
          retainedKind,
          ...saved
        } = target;
        const captured = snapshotEditorJsonValue(
          {
            ...saved,
            afterFrom: authoredPositionAt(positions, afterFromOffset),
            afterTo: authoredPositionAt(positions, afterToOffset),
            insertedContent: captureAuthoredRetainedContent(
              afterNative,
              afterFromOffset,
              afterToOffset,
              retainedKind,
              positions,
              afterRoots,
              input.schema
            ),
            retained: captureAuthoredRetainedContent(
              native,
              beforeFromOffset,
              beforeToOffset,
              retainedKind,
              before,
              input.value.roots,
              input.schema
            ),
          },
          'Authored target'
        );
        const boundarySpans = [
          ...(captured.retained?.kind === 'properties'
            ? (captured.retained.spans ?? [])
            : []),
          ...(sections[captured.section].replacement?.every(
            (token) => token.kind === 'text'
          )
            ? captured.inserted
            : input.afterPositions
              ? afterNative
                  .nodeRangesTouching(afterFromOffset, afterToOffset)
                  .flatMap((node) => {
                    if (node.kind !== 'text') return [];
                    const from = Math.max(afterFromOffset, node.from + 1);
                    const to = Math.min(afterToOffset, node.to - 1);
                    return [...authoredPositionSpans(positions, from, to)].map(
                      (entry) => ({
                        ...entry.span,
                        offset:
                          entry.span.offset + Math.max(from - entry.from, 0),
                        length:
                          Math.min(to, entry.to) - Math.max(from, entry.from),
                      })
                    );
                  })
              : []),
        ];
        if (boundarySpans.length) {
          const endpoints = new Map<
            string,
            NonNullable<AuthoredPosition['left']>
          >();
          for (const span of boundarySpans) {
            for (const offset of [span.offset, span.offset + span.length]) {
              const endpoint = { origin: span.origin, offset };
              endpoints.set(JSON.stringify(endpoint), endpoint);
            }
          }
          const boundaries = [...endpoints.values()].map((position) => ({
            position,
            spans: [
              {
                birth: null,
                placement: null,
                properties: {},
                origin: `${input.operationId}:boundary:${JSON.stringify([root, position.origin, position.offset])}`,
                offset: 0,
                length: 2,
              },
            ],
          }));
          targets.push(
            snapshotEditorJsonValue(
              { ...captured, boundaries },
              'Authored property boundaries'
            )
          );
        }
        targetDependencies.forEach((dependency) =>
          dependencies.add(dependency)
        );
        if (
          !readAuthoredTextBoundary(
            captured,
            getDefined(sections[captured.section])
          )
        ) {
          // Canonical text-boundary cleanup is causal bookkeeping, not intent.
          targetPublicationDependencies.forEach((dependency) =>
            publicationDependencies.add(dependency)
          );
        }
        if (
          input.afterPositions === undefined &&
          captured.retained?.kind === 'properties' &&
          captured.retained.spans
        ) {
          const modifications = getDefined(
            sections[captured.section].properties
          ).operations;
          for (const span of captured.retained.spans) {
            const locations = authoredOriginSpans(positions, span.origin, {
              from: span.offset,
              to: span.offset + span.length,
            });
            for (const location of locations) {
              const from = Math.max(location.span.offset, span.offset);
              const to = Math.min(
                location.span.offset + location.span.length,
                span.offset + span.length
              );
              positions = replaceAuthoredPositions(
                positions,
                location.from + from - location.span.offset,
                location.from + to - location.span.offset,
                [
                  {
                    ...location.span,
                    offset: from,
                    length: to - from,
                    properties: writeAuthoredProperties(
                      location.span.properties,
                      modifications,
                      input.changeId
                    ),
                  },
                ]
              );
            }
          }
        }
        if (!boundarySpans.length) targets.push(captured);
      }
      roots = writeRecord(roots, root, {
        birth: input.change.createRoots.has(root)
          ? input.changeId
          : (previousRoot?.birth ?? null),
        present: true,
        positions,
      });
    }
    for (const root of input.change.createRoots) {
      if (!readRecord(roots, root)?.present) {
        roots = writeRecord(roots, root, {
          birth: input.changeId,
          present: true,
          positions: createAuthoredPositions(
            0,
            `${input.operationId}:empty:${root}`
          ),
        });
      }
    }
    for (const root of input.change.deleteRoots) {
      roots = writeRecord(roots, root, {
        birth: input.changeId,
        present: false,
        positions: createAuthoredPositions(
          0,
          `${input.operationId}:empty:${root}`
        ),
      });
    }
    return {
      dependencies: [...dependencies].sort(),
      structuralDependencies: [...structuralDependencies].sort(),
      publicationDependencies: [...publicationDependencies].sort(),
      positions:
        input.afterPositions === undefined ? roots : input.afterPositions,
      rootTargets: snapshotEditorJsonValue(
        rootTargets,
        'Authored root targets'
      ),
      targets: snapshotEditorJsonValue(targets, 'Authored targets'),
    };
  });

const applyPositionEdits = (
  before: AuthoredPositions,
  edits: ReadonlyArray<{
    from: number;
    to: number;
    spans: readonly AuthoredSpan[];
  }>,
  moving: boolean
) => {
  let positions = before;
  if (moving) {
    // Remove first so one content origin never has two live placements.
    for (const { from, to } of [...edits].reverse()) {
      if (from !== to) {
        positions = replaceAuthoredPositions(positions, from, to, []);
      }
    }
  }
  let delta = 0;
  for (const { from, to, spans } of edits) {
    positions = replaceAuthoredPositions(
      positions,
      from + delta,
      moving ? from + delta : to + delta,
      spans
    );
    delta +=
      spans.reduce((length, span) => length + span.length, 0) - (to - from);
  }
  return positions;
};

const textPropertyContext = (
  document: DocumentIndex,
  root: string,
  path: readonly number[]
) => {
  const ancestors: string[] = [];
  for (let depth = path.length - 1; depth > 0; depth--) {
    const parent = document.node(path.slice(0, depth));
    ancestors.push(typeof parent.type === 'string' ? parent.type : '');
  }
  return {
    root: root === 'main' ? null : root,
    type: ancestors[0] ?? '',
    ancestors: ancestors.slice(1),
  };
};

type AuthoredMappingInput = {
  insertionBounds?: Readonly<{ root: string; from: number; to: number }>;
  target?: 'accepted' | 'proposed';
  independent?: boolean;
  ignoreTextBoundaries?: boolean;
  state: AuthoredState;
  properties?: Readonly<{
    state: AuthoredState;
    editor?: Editor;
    schema?: CompiledEditorSchema | null;
    isVisible: (operation: AuthoredEditIdentity) => boolean;
    refuseCausalOverwrite?: boolean;
  }>;
  acceptedEdit?: boolean;
  accepted?: Readonly<{
    isAccepted: (identity: string) => boolean;
    positions: AuthoredPositionRoots;
    value: JsonEditorValue;
  }>;
  change: DocumentChangeJson;
  changeId: string;
  direction: 'forward' | 'inverse';
  operationId: string;
  positions: AuthoredPositionRoots;
  rootTargets: readonly AuthoredRootTarget[];
  targets: readonly AuthoredTarget[];
  value: JsonEditorValue;
};

export const authoredMovementTargets = (targets: readonly AuthoredTarget[]) => {
  if (targets.length !== 2) return null;
  const inserted = targets.find(
    (target) => target.removed.length === 0 && target.inserted.length > 0
  );
  const removed = targets.find(
    (target) => target.inserted.length === 0 && target.removed.length > 0
  );
  if (
    !inserted ||
    !removed ||
    !sameContent(inserted.inserted, removed.removed)
  ) {
    return null;
  }
  return { inserted, removed };
};

const mapMovement = (
  input: AuthoredMappingInput,
  targets: readonly AuthoredTarget[]
) => {
  const movement = authoredMovementTargets(targets);
  if (!movement) return null;
  const { inserted, removed } = movement;
  const original = input.direction === 'forward' ? removed : inserted;
  const destination = input.direction === 'forward' ? inserted : removed;
  const source = readRecord(input.positions, original.root);
  const target = readRecord(input.positions, destination.root);
  if (!source?.present || !target?.present) {
    throw new AuthoredMappingConflictError([input.changeId]);
  }
  const from = resolveAuthoredPosition(
    source.positions,
    input.direction === 'forward' ? original.from : original.afterFrom,
    'right'
  );
  const to = resolveAuthoredPosition(
    source.positions,
    input.direction === 'forward' ? original.to : original.afterTo,
    'left'
  );
  const at = resolveAuthoredPosition(
    target.positions,
    input.direction === 'forward' ? destination.from : destination.afterFrom,
    'right'
  );
  const sameRoot = original.root === destination.root;
  if (
    from === null ||
    to === null ||
    at === null ||
    to <= from ||
    (sameRoot && at > from && at < to)
  ) {
    throw new AuthoredMappingConflictError([input.changeId]);
  }
  const document = DocumentIndex.fromValue(
    authoredRootNodes(input.value, original.root)
  );
  const targetDocument = sameRoot
    ? document
    : DocumentIndex.fromValue(authoredRootNodes(input.value, destination.root));
  const moved = document.nodeStartingAt(from);
  if (!moved || moved.to !== to || !targetDocument.childBoundaryAt(at)) {
    throw new AuthoredMappingConflictError([input.changeId]);
  }
  const spans = removedSpans(source.positions, from, to).map((span) => {
    const expected = (
      input.direction === 'forward' ? removed.removed : inserted.inserted
    ).find(
      (previous) =>
        previous.origin === span.origin &&
        previous.offset <= span.offset &&
        previous.offset + previous.length > span.offset
    );
    if (
      !input.acceptedEdit &&
      expected &&
      span.placement !== expected.placement
    ) {
      throw new AuthoredMappingConflictError([
        span.placement ?? input.changeId,
      ]);
    }
    const desired =
      input.direction === 'forward' ? inserted.inserted : removed.removed;
    const restored = desired.find(
      (previous) =>
        previous.origin === span.origin &&
        previous.offset <= span.offset &&
        previous.offset + previous.length > span.offset
    );
    return {
      ...span,
      placement: restored
        ? restored.placement
        : (desired[0]?.placement ?? null),
    };
  });
  if (sameRoot && (at === from || at === to)) {
    return { change: DocumentChange.empty, positions: input.positions };
  }
  const changes: Record<string, RootChangeJson> = {};
  let { positions } = input;
  if (sameRoot) {
    changes[original.root] = RootChange.create(document, [
      { from, to },
      { from: at, insert: document.slice(from, to) },
    ]).toJSON();
    positions = writeRecord(positions, original.root, {
      ...source,
      positions: applyPositionEdits(
        source.positions,
        [
          { from, to, spans: [] },
          { from: at, to: at, spans },
        ].sort((left, right) => left.from - right.from),
        true
      ),
    });
  } else {
    changes[original.root] = RootChange.create(document, [
      { from, to },
    ]).toJSON();
    changes[destination.root] = RootChange.create(targetDocument, [
      { from: at, insert: document.slice(from, to) },
    ]).toJSON();
    positions = writeRecord(positions, original.root, {
      ...source,
      positions: replaceAuthoredPositions(source.positions, from, to, []),
    });
    positions = writeRecord(positions, destination.root, {
      ...target,
      positions: replaceAuthoredPositions(target.positions, at, at, spans),
    });
  }
  const { main, ...roots } = changes;
  return {
    change: DocumentChange.fromJSON({
      version: 3,
      ...(main ? { primary: main } : {}),
      ...(Object.keys(roots).length ? { roots } : {}),
    }),
    positions,
  };
};

const subtractInterval = (
  part: Readonly<{ from: number; to: number }>,
  removed: Readonly<{ from: number; to: number }>
) =>
  removed.from >= part.to || removed.to <= part.from
    ? [part]
    : [
        ...(part.from < removed.from
          ? [{ from: part.from, to: removed.from }]
          : []),
        ...(part.to > removed.to ? [{ from: removed.to, to: part.to }] : []),
      ];

const mapAuthoredStep = (input: AuthoredMappingInput) =>
  profileCoreDuration('authored-map', () => {
    let roots = input.positions;
    const output: Record<string, RootChangeJson> = {};
    for (const target of input.rootTargets) {
      const expected =
        input.direction === 'forward' ? target.before : target.after;
      const actual = readRecord(roots, target.root);
      if (
        !!expected !== !!actual ||
        (expected &&
          actual &&
          (expected.birth !== actual.birth ||
            expected.present !== actual.present))
      ) {
        throw new AuthoredMappingConflictError([
          actual?.birth ?? input.changeId,
        ]);
      }
    }
    if (!input.rootTargets.length) {
      const movement = mapMovement(input, input.targets);
      if (movement) return movement;
    }
    const sectionsByRoot = new Map(rootSections(input.change));
    const targetsByRoot = new Map<string, AuthoredTarget[]>();
    for (const target of input.targets) {
      const root = input.rootTargets.some(
        (lifecycle) => lifecycle.root === target.root
      )
        ? target.root
        : (authoredPositionRoot(
            roots,
            target.root,
            input.direction === 'forward' ? target.from : target.afterFrom,
            'right'
          ) ?? target.root);
      const current = targetsByRoot.get(root) ?? [];
      current.push(target);
      targetsByRoot.set(root, current);
    }
    for (const [root, rootTargets] of targetsByRoot) {
      const before =
        readRecord(roots, root)?.positions ??
        createAuthoredPositions(0, `${input.operationId}:empty:${root}`);
      let positions = before;
      const document = DocumentIndex.fromValue(
        authoredRootNodes(input.value, root)
      );
      const { length } = document;
      const movement = mapMovement({ ...input, positions: roots }, rootTargets);
      if (movement) {
        const json = movement.change.toJSON();
        const mapped = root === 'main' ? json.primary : json.roots?.[root];
        if (mapped) output[root] = mapped;
        roots = movement.positions;
        continue;
      }
      type MappedTarget = {
        from: number;
        to: number;
        section: RootChangeJson[number];
        target: AuthoredTarget;
        replacementSpans: readonly AuthoredSpan[];
        propertyWriters: AuthoredSpan['properties'] | undefined;
      };
      const mapped = rootTargets
        .flatMap<MappedTarget | null>(
          (target): MappedTarget | readonly MappedTarget[] | null => {
            let section = sectionsByRoot.get(target.root)?.[target.section];
            if (!section || (!section.replacement && !section.properties)) {
              throw new Error('Missing authored change section.');
            }
            if (
              input.ignoreTextBoundaries &&
              readAuthoredTextBoundary(target, section)
            ) {
              return null;
            }
            if (
              input.properties &&
              target.retained?.kind === 'properties' &&
              target.retained.spans?.length
            ) {
              if (
                input.properties.refuseCausalOverwrite &&
                section.properties
              ) {
                const proposal = readRecord(
                  input.properties.state.operations,
                  input.operationId
                );
                if (proposal?.kind === 'edit') {
                  const conflicts = new Set<string>();
                  for (const original of target.retained.spans) {
                    for (const location of authoredContentLocations(
                      roots,
                      original
                    )) {
                      const span = {
                        ...location.span,
                        offset: location.fromOffset,
                        length: location.toOffset - location.fromOffset,
                      };
                      const currentDocument =
                        location.root === root
                          ? document
                          : DocumentIndex.fromValue(
                              authoredRootNodes(input.value, location.root)
                            );
                      const at =
                        location.from +
                        location.fromOffset -
                        location.span.offset;
                      const node = currentDocument
                        .nodeRangesTouching(at, at + span.length)
                        .find((range) => range.kind === 'text');
                      for (const identity of authoredCausalPropertyConflicts({
                        ...input.properties,
                        textContext: node
                          ? textPropertyContext(
                              currentDocument,
                              location.root,
                              node.path
                            )
                          : undefined,
                        proposal,
                        current: location.span.properties,
                        original: original.properties,
                        modifications: section.properties.operations,
                        writes: [
                          ...authoredTextPropertyWrites(
                            input.properties.state,
                            span
                          ),
                        ].map((write) => write.value),
                      })) {
                        conflicts.add(identity);
                      }
                    }
                  }
                  if (conflicts.size) {
                    throw new AuthoredMappingConflictError([...conflicts]);
                  }
                }
              }
              return null;
            }
            if (input.direction === 'inverse') {
              const retained = readAuthoredRetainedContent(target);
              if (section.properties) {
                if (retained?.kind !== 'properties') {
                  throw new Error('Missing retained authored properties.');
                }
                section = {
                  length: section.length,
                  properties: {
                    version: 1,
                    operations: invertPropertyModifications(
                      retained.properties,
                      section.properties.operations
                    ),
                  },
                };
              } else {
                if (
                  target.removed.length &&
                  (!retained || retained.kind === 'properties')
                ) {
                  throw new Error('Missing retained authored replacement.');
                }
                section = {
                  length: target.inserted.reduce(
                    (total, span) => total + span.length,
                    0
                  ),
                  replacement:
                    retained && retained.kind !== 'properties'
                      ? DocumentIndex.fromValue(retained.slice.content)
                          .slice(retained.from, retained.to)
                          .toJSON()
                      : [],
                };
              }
            }
            const insertion =
              input.direction === 'forward' &&
              section.length === 0 &&
              target.inserted[0]?.origin ===
                authoredOperationOrigin(input.operationId, root)
                ? authoredInsertionOrigin(input.state, target.inserted[0])
                : null;
            let from =
              (input.direction === 'forward'
                ? resolveConcurrentAuthoredInsertion(
                    input.state,
                    before,
                    input.operationId,
                    target,
                    input.insertionBounds?.root === root
                      ? input.insertionBounds
                      : undefined
                  )
                : null) ??
              (insertion &&
              resolveAuthoredPosition(
                before,
                insertion.position,
                insertion.association
              ) === null
                ? resolveAuthoredRetainedPosition(
                    input.state,
                    before,
                    insertion.position
                  )
                : null) ??
              (insertion
                ? resolveAuthoredPosition(
                    before,
                    {
                      left:
                        insertion.association === 'left'
                          ? insertion.position.left
                          : null,
                      right:
                        insertion.association === 'right'
                          ? insertion.position.right
                          : null,
                    },
                    insertion.association,
                    'collapse'
                  )
                : resolveAuthoredPosition(
                    before,
                    input.direction === 'forward'
                      ? target.from
                      : target.afterFrom,
                    input.direction === 'forward' && section.length === 0
                      ? (target.association ?? 'right')
                      : 'right'
                  ));
            if (input.direction === 'inverse' && section.length === 0) {
              from = resolveAuthoredRetainedPosition(
                input.state,
                before,
                target.afterFrom
              );
              if (input.accepted && target.removed.length) {
                const original = authoredContentLocations(
                  input.accepted.positions,
                  target.removed[0]
                ).next().value;
                const left = resolveAuthoredPosition(
                  before,
                  { left: target.afterFrom.left, right: null },
                  'left',
                  'collapse'
                );
                const right = resolveAuthoredPosition(
                  before,
                  { left: null, right: target.afterFrom.right },
                  'right',
                  'collapse'
                );
                if (
                  original?.root === root &&
                  left !== null &&
                  right !== null &&
                  left < right
                ) {
                  const position =
                    original.from + original.fromOffset - original.span.offset;
                  for (const entry of authoredPositionSpans(
                    before,
                    left,
                    right
                  )) {
                    const current = authoredOriginalLocation(
                      input.state,
                      input.accepted.positions,
                      {
                        ...entry.span,
                        offset:
                          entry.span.offset + Math.max(left - entry.from, 0),
                        length:
                          Math.min(right, entry.to) -
                          Math.max(left, entry.from),
                      }
                    );
                    if (current?.root === root && current.offset > position) {
                      from = Math.max(left, entry.from);
                      break;
                    }
                  }
                }
              }
            }
            if (
              from === null &&
              input.independent &&
              input.direction === 'forward' &&
              section.length === 0 &&
              section.replacement?.length
            ) {
              from = resolveAuthoredPosition(
                before,
                target.from,
                target.association ?? 'right',
                'collapse'
              );
            }
            let to =
              section.length === 0
                ? from
                : resolveAuthoredPosition(
                    before,
                    input.direction === 'forward' ? target.to : target.afterTo,
                    'left'
                  );
            const originalSection = getDefined(
              sectionsByRoot.get(target.root)?.[target.section]
            );
            const originalRetained = readAuthoredRetainedContent(target);
            const removedTokens =
              originalRetained && originalRetained.kind !== 'properties'
                ? DocumentIndex.fromValue(originalRetained.slice.content)
                    .slice(originalRetained.from, originalRetained.to)
                    .toJSON()
                : [];
            const mappedOperation = readRecord(
              input.state.operations,
              input.operationId
            );
            const restoresOriginal =
              !(
                mappedOperation?.kind === 'edit' && mappedOperation.inverseOf
              ) &&
              !!section.replacement &&
              input.direction === 'inverse' &&
              !!input.accepted;
            const restoresAccepted =
              restoresOriginal &&
              target.removed.length > 0 &&
              target.removed.every(
                (span) =>
                  span.birth === null || input.accepted?.isAccepted(span.birth)
              );
            const acceptedCounterpart = (() => {
              if (!restoresAccepted || !input.accepted) return null;
              const { accepted } = input;
              const operation =
                mappedOperation?.kind === 'edit' ? mappedOperation : null;
              const acceptedRoot =
                authoredPositionRoot(
                  accepted.positions,
                  target.root,
                  target.from,
                  'right'
                ) ?? target.root;
              const current = readRecord(
                accepted.positions,
                acceptedRoot
              )?.positions;
              if (!current) {
                throw new AuthoredMappingConflictError([input.changeId]);
              }
              const acceptedBefore = resolveAuthoredPosition(
                current,
                target.from,
                'left'
              );
              const after = resolveAuthoredPosition(
                current,
                target.to,
                'right'
              );
              const locations = target.removed
                .flatMap((span) => [
                  ...authoredContentLocations(accepted.positions, span),
                ])
                .filter((location) => location.root === acceptedRoot);
              // Content absent from the accepted document has no counterpart
              // there; the ordinary restore below handles it.
              if (!locations.length) return null;
              const start = Math.min(
                ...locations.map(
                  (location) =>
                    location.from + location.fromOffset - location.span.offset
                ),
                acceptedBefore ?? Infinity
              );
              const end = Math.max(
                ...locations.map(
                  (location) =>
                    location.from + location.toOffset - location.span.offset
                ),
                after ?? -Infinity
              );
              if (
                !Number.isFinite(start) ||
                !Number.isFinite(end) ||
                end < start
              ) {
                throw new AuthoredMappingConflictError([input.changeId]);
              }
              const intervals = authoredCounterpartIntervals({
                from: start,
                to: end,
                operation,
                positions: current,
                proposed: input.positions,
                spans: target.removed,
                state: input.state,
              });
              const acceptedDocument = DocumentIndex.fromValue(
                authoredRootNodes(accepted.value, acceptedRoot)
              );
              return {
                tokens: intervals.flatMap((interval) =>
                  acceptedDocument.slice(interval.from, interval.to).toJSON()
                ),
                spans: intervals.flatMap((interval) => interval.spans),
              };
            })();
            const restoresDirect =
              input.acceptedEdit &&
              input.target === 'accepted' &&
              mappedOperation?.kind === 'edit' &&
              !!mappedOperation.inverseOf &&
              section.length === 0 &&
              section.replacement?.some(
                (token) => token.kind === 'text' || token.nodeKind !== 'text'
              );
            const deletesTextNode =
              input.acceptedEdit &&
              section.replacement?.length === 0 &&
              removedTokens.some((token) => token.kind !== 'text') &&
              removedTokens.every(
                (token) => token.kind === 'text' || token.nodeKind === 'text'
              );
            if (
              section.replacement &&
              !section.properties &&
              (restoresDirect ||
                deletesTextNode ||
                (originalSection.replacement?.every(
                  (token) => token.kind === 'text'
                ) &&
                  removedTokens.every((token) => token.kind === 'text')) ||
                [...target.inserted, ...target.removed].some(
                  (span) =>
                    span.birth &&
                    span.birth !==
                      (span.origin ===
                      authoredOperationOrigin(input.operationId, root)
                        ? input.changeId
                        : authoredOriginOperation(input.state, span.origin)
                            ?.changeId)
                ))
            ) {
              if (
                input.acceptedEdit &&
                input.target === 'proposed' &&
                !input.independent &&
                section.length === 0 &&
                !target.removed.length &&
                (from === null || to === null)
              ) {
                return [];
              }
              const removed =
                input.direction === 'forward'
                  ? target.removed
                  : target.inserted;
              const restored =
                input.direction === 'forward'
                  ? target.inserted
                  : (acceptedCounterpart?.spans ?? target.removed);
              const visible =
                input.properties?.isVisible ??
                ((edit) =>
                  readRecord(input.state.changes, edit.changeId)?.status ===
                  'accepted');
              const mixedRestoration =
                restoresOriginal &&
                input.accepted &&
                target.removed.some(
                  (span) =>
                    span.birth && !input.accepted?.isAccepted(span.birth)
                ) &&
                target.removed.some(
                  (span) =>
                    span.birth === null ||
                    input.accepted?.isAccepted(span.birth)
                );
              const replacement = PreparedTokenSlice.fromTokens(
                acceptedCounterpart?.tokens ?? section.replacement
              );
              let offset = 0;
              const pieces: Array<{
                tokens: ReturnType<typeof replacement.toJSON>;
                span: AuthoredSpan;
              }> = [];
              for (const span of restored) {
                let intervals = [
                  { from: span.offset, to: span.offset + span.length },
                ];
                const origin = authoredOriginOperation(
                  input.state,
                  span.origin
                );
                if (
                  origin &&
                  origin.id !== input.operationId &&
                  !visible(origin)
                ) {
                  intervals = [];
                }
                if (span.birth && span.birth !== input.changeId) {
                  const birth = readRecord(input.state.changes, span.birth);
                  const first =
                    birth?.operations &&
                    readRecord(
                      input.state.operations,
                      getDefined(
                        readRecord(birth.operations, birth.operations.first)
                      )
                    );
                  if (first?.kind === 'edit' && !visible(first)) intervals = [];
                }
                const restorationState = input.properties?.state ?? input.state;
                const birth =
                  span.birth && span.birth !== origin?.changeId
                    ? readRecord(restorationState.changes, span.birth)
                    : null;
                const restorations = birth
                  ? [...records(birth.operations)].flatMap(([, id]) => {
                      const operation = readRecord(
                        restorationState.operations,
                        id
                      );
                      if (operation?.kind !== 'edit' || !visible(operation)) {
                        return [];
                      }
                      return authoredContributionSteps(operation).flatMap(
                        (step) =>
                          step.targets.flatMap((frameTarget) =>
                            frameTarget.inserted
                              .filter(
                                (inserted) =>
                                  inserted.birth === span.birth &&
                                  inserted.origin === span.origin
                              )
                              .map((inserted) => ({
                                operation,
                                from: inserted.offset,
                                to: inserted.offset + inserted.length,
                              }))
                          )
                      );
                    })
                  : [];
                for (const removal of authoredContentRemovals(
                  input.state,
                  span
                )) {
                  if (
                    removal.value.id === input.operationId ||
                    !isAuthoredEditVisible(
                      input.state,
                      removal.value,
                      visible
                    ) ||
                    (input.direction === 'forward' &&
                      mappedOperation?.kind === 'edit' &&
                      !isAuthoredUndo(input.state, mappedOperation) &&
                      observesAuthoredOperation(mappedOperation, removal.value))
                  ) {
                    continue;
                  }
                  let remaining = [{ from: removal.from, to: removal.to }];
                  for (const restoration of restorations) {
                    if (
                      observesAuthoredOperation(
                        restoration.operation,
                        removal.value
                      )
                    ) {
                      remaining = remaining.flatMap((part) =>
                        subtractInterval(part, restoration)
                      );
                    }
                  }
                  for (const removedInterval of remaining) {
                    intervals = intervals.flatMap((part) =>
                      subtractInterval(part, removedInterval)
                    );
                  }
                }
                if (mixedRestoration && input.accepted) {
                  const boundaries = [
                    ...authoredContentLocations(input.accepted.positions, span),
                  ].flatMap((location) => [
                    location.fromOffset,
                    location.toOffset,
                  ]);
                  intervals = intervals.flatMap((part) => {
                    const cuts = [
                      ...new Set([
                        part.from,
                        ...boundaries.filter(
                          (at) => at > part.from && at < part.to
                        ),
                        part.to,
                      ]),
                    ].sort((a, b) => a - b);
                    return cuts
                      .slice(1)
                      .map((end, index) => ({ from: cuts[index], to: end }));
                  });
                }
                if (restoresDirect) {
                  for (const entry of authoredOriginSpans(before, span.origin, {
                    from: span.offset,
                    to: span.offset + span.length,
                  })) {
                    intervals = intervals.flatMap((part) =>
                      subtractInterval(part, {
                        from: entry.span.offset,
                        to: entry.span.offset + entry.span.length,
                      })
                    );
                  }
                }
                for (const part of intervals) {
                  pieces.push({
                    tokens: replacement
                      .slice(
                        offset + part.from - span.offset,
                        offset + part.to - span.offset
                      )
                      .toJSON(),
                    span: {
                      ...span,
                      offset: part.from,
                      length: part.to - part.from,
                    },
                  });
                }
                offset += span.length;
              }
              if (
                restoresDirect &&
                section.replacement[0]?.kind === 'open' &&
                section.replacement[0].nodeKind === 'text' &&
                section.replacement.at(-1)?.kind === 'close' &&
                section.replacement
                  .slice(1, -1)
                  .every((token) => token.kind === 'text') &&
                (pieces[0]?.tokens[0]?.kind !== 'open' ||
                  pieces.at(-1)?.tokens.at(-1)?.kind !== 'close')
              ) {
                for (const piece of pieces) {
                  const opening = piece.tokens[0]?.kind === 'open' ? 1 : 0;
                  const closing = piece.tokens.at(-1)?.kind === 'close' ? 1 : 0;
                  piece.tokens = piece.tokens.filter(
                    (token) => token.kind === 'text'
                  );
                  piece.span = {
                    ...piece.span,
                    offset: piece.span.offset + opening,
                    length: piece.span.length - opening - closing,
                  };
                }
              }
              const intervals = removed
                .flatMap((span) =>
                  [
                    ...authoredOriginSpans(before, span.origin, {
                      from: span.offset,
                      to: span.offset + span.length,
                    }),
                  ].flatMap((entry) => {
                    const start = Math.max(span.offset, entry.span.offset);
                    const end = Math.min(
                      span.offset + span.length,
                      entry.span.offset + entry.span.length
                    );
                    return start < end
                      ? [
                          {
                            from: entry.from + start - entry.span.offset,
                            to: entry.from + end - entry.span.offset,
                          },
                        ]
                      : [];
                  })
                )
                .sort((a, b) => a.from - b.from);
              const merged: Array<{ from: number; to: number }> = [];
              const contentIntervals = deletesTextNode
                ? intervals.flatMap(({ from: startAt, to: endAt }) =>
                    document
                      .nodeRangesTouching(startAt, endAt)
                      .flatMap((node) => {
                        if (node.kind !== 'text') return [];
                        const start = Math.max(startAt, node.from + 1);
                        const end = Math.min(endAt, node.to - 1);
                        return start < end ? [{ from: start, to: end }] : [];
                      })
                  )
                : intervals;
              for (const part of contentIntervals) {
                const prior = merged.at(-1);
                if (prior && part.from <= prior.to) {
                  prior.to = Math.max(prior.to, part.to);
                } else merged.push({ ...part });
              }
              const tokens = pieces.flatMap((piece) => piece.tokens);
              if (from === null && tokens.length) {
                const position =
                  input.direction === 'forward'
                    ? target.from
                    : target.afterFrom;
                from = resolveAuthoredPosition(
                  before,
                  position,
                  target.association ?? 'right',
                  'collapse'
                );
                for (const side of ['left', 'right'] as const) {
                  if (from !== null) break;
                  const endpoint = position[side];
                  if (!endpoint) continue;
                  const location = authoredOriginalLocation(
                    input.state,
                    roots,
                    {
                      birth: null,
                      placement: null,
                      properties: {},
                      length: 1,
                      origin: endpoint.origin,
                      offset: endpoint.offset - (side === 'left' ? 1 : 0),
                    }
                  );
                  if (location?.root === root) {
                    from = location.offset;
                    break;
                  }
                }
              }
              const rows = merged.map((part) => ({
                ...part,
                section: {
                  length: part.to - part.from,
                  replacement: [] as typeof tokens,
                },
                target: { ...target, inserted: [] as AuthoredSpan[] },
                replacementSpans: [] as AuthoredSpan[],
                propertyWriters: undefined,
              }));
              for (const piece of pieces) {
                if (!piece.span.length) continue;
                const endpoint = {
                  origin: piece.span.origin,
                  offset: piece.span.offset,
                };
                const restoredFrom =
                  piece.span.origin !==
                    authoredOperationOrigin(input.operationId, root) &&
                  readRecord(before.deleted, piece.span.origin)
                    ? resolveAuthoredPosition(
                        before,
                        { left: endpoint, right: endpoint },
                        'right',
                        'collapse'
                      )
                    : null;
                const gap =
                  input.direction === 'forward'
                    ? target.from
                    : target.afterFrom;
                const hasLiveNeighbourOutsidePiece = (
                  ['left', 'right'] as const
                ).some((side) => {
                  const neighbour = gap[side];
                  return (
                    neighbour &&
                    // Steps of one operation take increasing offsets in its
                    // origin, so a same-origin anchor before the piece is an
                    // earlier step's live text and outranks origin adjacency.
                    (neighbour.origin !== piece.span.origin ||
                      neighbour.offset < piece.span.offset) &&
                    resolveAuthoredPosition(
                      before,
                      {
                        left: side === 'left' ? neighbour : null,
                        right: side === 'right' ? neighbour : null,
                      },
                      side
                    ) !== null
                  );
                });
                const hasAcceptedBoundary =
                  acceptedCounterpart &&
                  pieces.length === 1 &&
                  gap.left &&
                  resolveAuthoredPosition(
                    before,
                    { left: gap.left, right: null },
                    'left'
                  ) !== null;
                let at =
                  (hasLiveNeighbourOutsidePiece && !acceptedCounterpart) ||
                  hasAcceptedBoundary
                    ? (from ?? restoredFrom)
                    : (restoredFrom ?? from);
                if (
                  restoresDirect &&
                  piece.tokens.every((token) => token.kind === 'text')
                ) {
                  let prior: number | null = null;
                  for (const entry of authoredOriginSpans(
                    before,
                    piece.span.origin
                  )) {
                    if (
                      entry.span.offset >=
                      piece.span.offset + piece.span.length
                    ) {
                      at = prior ?? entry.from;
                      break;
                    }
                    if (
                      entry.span.offset + entry.span.length <=
                      piece.span.offset
                    ) {
                      prior = entry.to;
                      at = prior;
                    }
                  }
                }
                if (mixedRestoration && input.accepted) {
                  const original = authoredOriginalLocation(
                    input.state,
                    input.accepted.positions,
                    piece.span
                  );
                  const left = resolveAuthoredPosition(
                    before,
                    { left: gap.left, right: null },
                    'left',
                    'collapse'
                  );
                  const right = resolveAuthoredPosition(
                    before,
                    { left: null, right: gap.right },
                    'right',
                    'collapse'
                  );
                  if (
                    original?.root === root &&
                    left !== null &&
                    right !== null &&
                    left <= right
                  ) {
                    at = right;
                    for (const entry of authoredPositionSpans(
                      before,
                      left,
                      right
                    )) {
                      const location = authoredOriginalLocation(
                        input.state,
                        input.accepted.positions,
                        entry.span
                      );
                      if (
                        location?.root === root &&
                        location.offset >= original.offset
                      ) {
                        at = Math.max(left, entry.from);
                        break;
                      }
                    }
                  }
                }
                if (at === null) {
                  throw new AuthoredMappingConflictError([input.changeId]);
                }
                const containing = rows.find(
                  (row) => row.from <= at && row.to >= at
                );
                if (containing) {
                  containing.section.replacement.push(...piece.tokens);
                  containing.target.inserted.push(piece.span);
                  containing.replacementSpans.push(piece.span);
                } else {
                  rows.push({
                    from: at,
                    to: at,
                    section: { length: 0, replacement: [...piece.tokens] },
                    target: { ...target, inserted: [piece.span] },
                    replacementSpans: [piece.span],
                    propertyWriters: undefined,
                  });
                }
              }
              return rows;
            }
            if (
              input.acceptedEdit &&
              target.removed.length &&
              (section.properties || from === null || to === null)
            ) {
              const fragments = target.removed.flatMap((span) =>
                [...authoredOriginSpans(before, span.origin)].flatMap(
                  (fragment) => {
                    const start = Math.max(span.offset, fragment.span.offset);
                    const end = Math.min(
                      span.offset + span.length,
                      fragment.span.offset + fragment.span.length
                    );
                    return start < end
                      ? [
                          {
                            from: fragment.from + start - fragment.span.offset,
                            to: fragment.from + end - fragment.span.offset,
                          },
                        ]
                      : [];
                  }
                )
              );
              if (!fragments.length) return null;
              from = Math.min(...fragments.map((fragment) => fragment.from));
              to = Math.max(...fragments.map((fragment) => fragment.to));
            }
            if (from === null || to === null || to < from) {
              if (input.acceptedEdit) return null;
              throw new AuthoredMappingConflictError([input.changeId]);
            }
            let replacementSpans = target.removed;
            if (section.replacement) {
              const conflicts = new Set<string>();
              const currentOperation = readRecord(
                input.state.operations,
                input.operationId
              );
              const operation =
                currentOperation?.kind === 'edit' ? currentOperation : null;
              for (const span of removedSpans(before, from, to)) {
                const originals = (
                  input.direction === 'forward'
                    ? target.removed
                    : target.inserted
                )
                  .filter(
                    (retained) =>
                      retained.origin === span.origin &&
                      retained.offset < span.offset + span.length &&
                      retained.offset + retained.length > span.offset
                  )
                  .sort((left, right) => left.offset - right.offset);
                const covered = sameContent(
                  [span],
                  originals.map((retained) => {
                    const offset = Math.max(span.offset, retained.offset);
                    return {
                      ...retained,
                      offset,
                      length:
                        Math.min(
                          span.offset + span.length,
                          retained.offset + retained.length
                        ) - offset,
                    };
                  })
                );
                if (!covered) {
                  const laterAcceptedInsertion =
                    input.direction === 'forward' &&
                    span.birth !== null &&
                    input.accepted?.isAccepted(span.birth) &&
                    isLaterAuthoredInsertion(input.state, operation, span);
                  if (!laterAcceptedInsertion) {
                    conflicts.add(span.birth ?? input.changeId);
                  }
                } else if (
                  input.direction === 'forward' &&
                  !input.acceptedEdit
                ) {
                  for (const original of originals) {
                    if (
                      span.placement !== original.placement &&
                      span.placement !== input.changeId
                    ) {
                      conflicts.add(span.placement ?? input.changeId);
                    }
                    for (const [key, writer] of Object.entries(
                      span.properties
                    )) {
                      if (
                        writer !== input.changeId &&
                        writer !== original.properties[key]
                      ) {
                        conflicts.add(writer);
                      }
                    }
                  }
                }
              }
              if (conflicts.size) {
                throw new AuthoredMappingConflictError([...conflicts]);
              }
              if (acceptedCounterpart) {
                section = {
                  ...section,
                  replacement: acceptedCounterpart.tokens,
                };
                replacementSpans = acceptedCounterpart.spans;
              }
            }
            let propertyWriters: AuthoredSpan['properties'] | undefined;
            if (section.properties) {
              const current = removedSpans(before, from, to)[0];
              const original = (
                input.direction === 'forward' ? target.removed : target.inserted
              )[0];
              if (!current || !original) {
                throw new AuthoredMappingConflictError([input.changeId]);
              }
              if (input.properties) {
                const propertyState = input.properties.state;
                const node = getDefined(document.nodeStartingAt(from));
                const textContext =
                  node.kind === 'text'
                    ? textPropertyContext(document, root, node.path)
                    : undefined;
                const proposal = readRecord(
                  propertyState.operations,
                  input.operationId
                );
                if (
                  input.properties.refuseCausalOverwrite &&
                  proposal?.kind === 'edit'
                ) {
                  const superseded = authoredCausalPropertyConflicts({
                    ...input.properties,
                    textContext,
                    proposal,
                    current: current.properties,
                    original: original.properties,
                    modifications: section.properties.operations,
                    writes: [
                      ...new Set(
                        textContext
                          ? authoredPropertyKeys(
                              propertyState,
                              current.origin,
                              current.offset
                            )
                          : section.properties.operations.map(
                              (entry) => entry.key
                            )
                      ),
                    ].flatMap((key) => [
                      ...authoredPropertyWrites(
                        propertyState,
                        current.origin,
                        current.offset,
                        key
                      ),
                    ]),
                  });
                  if (superseded.size) {
                    throw new AuthoredMappingConflictError([...superseded]);
                  }
                }
                const nodeProperties = Object.fromEntries(
                  Object.entries(document.node(node.path)).filter(
                    ([key]) => key !== 'text' && key !== 'children'
                  )
                );
                const projected = projectAuthoredProperties({
                  ...input.properties,
                  span: current,
                  modifications: section.properties.operations,
                  current: nodeProperties,
                  textContext,
                });
                propertyWriters = projected.writers;
                section = {
                  ...section,
                  properties: {
                    version: 1,
                    operations: projected.modifications,
                  },
                };
              } else {
                const operations =
                  input.direction === 'inverse'
                    ? matchingAuthoredProperties(
                        current.properties,
                        section.properties.operations,
                        original.properties
                      )
                    : section.properties.operations;
                const conflicts = input.acceptedEdit
                  ? new Set<string>()
                  : authoredPropertyConflicts(
                      current.properties,
                      original.properties,
                      operations,
                      input.changeId
                    );
                if (conflicts.size) {
                  throw new AuthoredMappingConflictError([...conflicts]);
                }
                section = operations.length
                  ? { ...section, properties: { version: 1, operations } }
                  : { length: section.length };
              }
            }
            return {
              from,
              to,
              section,
              target,
              replacementSpans,
              propertyWriters,
            };
          }
        )
        .filter((step) => step !== null)
        .sort(
          (left, right) =>
            left.from - right.from || left.target.section - right.target.section
        );
      const encoded: Array<RootChangeJson[number]> = [];
      const positionEdits: Array<{
        from: number;
        to: number;
        spans: readonly AuthoredSpan[];
      }> = [];
      let previous = 0;
      for (const {
        from,
        to,
        section,
        target,
        replacementSpans,
        propertyWriters,
      } of mapped) {
        if (from < previous) {
          throw new AuthoredMappingConflictError([input.changeId]);
        }
        if (from > previous) encoded.push({ length: from - previous });
        encoded.push({ ...section, length: to - from });
        const outputLength =
          section.replacement?.reduce(
            (sum, token) => sum + tokenLength(token),
            0
          ) ?? to - from;
        const spans =
          !section.properties && !section.replacement
            ? removedSpans(before, from, to)
            : input.direction === 'inverse' && !section.properties
              ? replacementSpans
              : section.properties
                ? removedSpans(before, from, to).map((span) => {
                    const original = (
                      input.direction === 'forward'
                        ? target.inserted
                        : target.removed
                    ).find(
                      (retained) =>
                        retained.origin === span.origin &&
                        retained.offset <= span.offset &&
                        retained.offset + retained.length > span.offset
                    );
                    return {
                      ...span,
                      properties:
                        propertyWriters ??
                        restoreAuthoredProperties(
                          span.properties,
                          original?.properties ?? {},
                          getDefined(section.properties).operations
                        ),
                    };
                  })
                : target.inserted;
        if (
          spans.reduce((sum, span) => sum + span.length, 0) !== outputLength
        ) {
          throw new AuthoredMappingConflictError([input.changeId]);
        }
        positionEdits.push({ from, to, spans });
        previous = to;
      }
      positions = applyPositionEdits(
        before,
        positionEdits,
        mapped.some(({ target }) =>
          target.inserted.some((span) => span.placement === input.changeId)
        )
      );
      if (previous < length) encoded.push({ length: length - previous });
      output[root] = encoded;
      roots = writeRecord(roots, root, {
        birth: readRecord(roots, root)?.birth ?? null,
        present: true,
        positions,
      });
    }
    for (const target of input.rootTargets) {
      const after =
        input.direction === 'forward' ? target.after : target.before;
      roots = after
        ? writeRecord(roots, target.root, {
            ...after,
            positions: after.present
              ? (readRecord(roots, target.root)?.positions ??
                createAuthoredPositions(
                  0,
                  `${input.operationId}:empty:${target.root}`
                ))
              : createAuthoredPositions(
                  0,
                  `${input.operationId}:empty:${target.root}`
                ),
          })
        : removeRecord(roots, target.root);
    }
    const { main, ...named } = output;
    const createRoots =
      input.direction === 'forward'
        ? input.change.createRoots
        : input.change.deleteRoots;
    const deleteRoots =
      input.direction === 'forward'
        ? input.change.deleteRoots
        : input.change.createRoots;
    return {
      change: DocumentChange.fromJSON({
        version: 3,
        ...(main ? { primary: main } : {}),
        ...(Object.keys(named).length ? { roots: named } : {}),
        ...(createRoots ? { createRoots } : {}),
        ...(deleteRoots ? { deleteRoots } : {}),
      }),
      positions: roots,
    };
  });

export const captureAuthoredChange = (input: {
  schema?: CompiledEditorSchema | null;
  state?: AuthoredState;
  associations?: ReadonlyArray<ReadonlyArray<AuthoredTarget['association']>>;
  insertionsByStep?: ReadonlyMap<DocumentChange, AuthoredInsertion>;
  afterPositions?: AuthoredPositionRoots;
  restoreIdentity?: boolean;
  change?: DocumentChange;
  changeId: string;
  operationId: string;
  positions: AuthoredPositionRoots;
  steps?: readonly DocumentChange[];
  value: JsonEditorValue;
}) => {
  const changes = input.steps?.length
    ? input.steps
    : [getDefined(input.change)];
  const draft = changes.length > 1 ? new ChangeDraft(input.value) : undefined;
  const offsets = new Map<string, number>();
  const dependencies = new Set<string>();
  const publicationDependencies = new Set<string>();
  const structuralDependencies = new Set<string>();
  const steps: AuthoredStep[] = [];
  let { positions } = input;
  for (const [stepIndex, change] of changes.entries()) {
    const captured = captureAuthoredStep({
      ...input,
      associations: input.associations?.[stepIndex],
      insertion: input.insertionsByStep?.get(change),
      change,
      offsets,
      positions,
      value: draft?.value ?? input.value,
    });
    steps.push({
      forward: change.toJSON(),
      rootTargets: captured.rootTargets,
      targets: captured.targets,
    });
    for (const dependency of captured.dependencies) {
      dependencies.add(dependency);
    }
    for (const dependency of captured.structuralDependencies) {
      structuralDependencies.add(dependency);
    }
    for (const dependency of captured.publicationDependencies) {
      publicationDependencies.add(dependency);
    }
    ({ positions } = captured);
    draft?.apply(change, { classify: false });
  }
  const change = draft?.change ?? getDefined(changes[0]);
  if (input.change && !jsonEqual(change.toJSON(), input.change.toJSON())) {
    throw new Error('Authored steps do not match the published change.');
  }
  return {
    dependencies: [...dependencies].sort(),
    structuralDependencies: [...structuralDependencies].sort(),
    publicationDependencies: [...publicationDependencies].sort(),
    change,
    positions,
    steps: snapshotEditorJsonValue(steps, 'Authored steps'),
  };
};

export const projectAuthoredTextProperties = (input: {
  before: JsonEditorValue;
  change: DocumentChange;
  changeId: string;
  operationId: string;
  positions: AuthoredPositionRoots;
  properties: NonNullable<AuthoredMappingInput['properties']>;
  steps: readonly AuthoredContributionStep[];
  value: JsonEditorValue;
}) => {
  const documents = new Map<string, DocumentIndex>();
  const contentLanes = input.steps.flatMap((step) =>
    step.targets.flatMap((target) =>
      [target.retained, target.insertedContent].flatMap((data) => {
        if (!data || data.kind === 'properties') return [];
        return [
          {
            root: target.root,
            target,
            content: data,
            document: DocumentIndex.fromValue(data.slice.content),
          },
        ];
      })
    )
  );
  const propertyIndex = indexAuthoredState(input.properties.state);
  const plainContent =
    !propertyIndex.properties &&
    !propertyIndex.textProperties &&
    contentLanes.every(({ content, document }) =>
      document
        .nodeRangesTouching(content.from, content.to)
        .every(
          (node) =>
            node.kind !== 'text' ||
            Object.keys(nodeProps(document.node(node.path))).length === 0
        )
    );
  const sourceProperties = (
    root: string,
    span: AuthoredSpan,
    fallback: JsonRecord
  ) => {
    for (const lane of contentLanes) {
      if (lane.root !== root) continue;
      const content = readAuthoredRetainedContent({
        ...lane.target,
        retained: lane.content,
      });
      if (!content || content.kind === 'properties') continue;
      for (const location of authoredOriginSpans(
        content.positions,
        span.origin,
        { from: span.offset, to: span.offset + 1 }
      )) {
        const at = location.from + span.offset - location.span.offset;
        if (at < lane.content.from || at >= lane.content.to) continue;
        const text = lane.document
          .nodeRangesTouching(at, at + 1)
          .find((node) => node.kind === 'text');
        if (text) return nodeProps(lane.document.node(text.path));
      }
    }
    return fallback;
  };
  const touched = new Map<string, Set<number>>();
  const touch = (root: string, from: number, to: number) => {
    if (!readRecord(input.positions, root)?.present) return;
    let document = documents.get(root);
    if (!document) {
      document = DocumentIndex.fromValue(authoredRootNodes(input.value, root));
      documents.set(root, document);
    }
    const starts = touched.get(root) ?? new Set<number>();
    for (const node of [
      ...document.nodeRangesTouching(from, to),
      ...document.nodeRangesTouching(from),
      ...document.nodeRangesTouching(to),
    ]) {
      if (node.kind === 'text' && node.to - node.from > 2) {
        starts.add(node.from);
      }
    }
    touched.set(root, starts);
  };
  for (const [root, sections] of rootSections(input.change.toJSON())) {
    let at = 0;
    for (const section of sections) {
      const length =
        section.replacement?.reduce(
          (sum, token) => sum + tokenLength(token),
          0
        ) ?? section.length;
      if (section.replacement || section.properties) {
        touch(root, at, at + length);
      }
      at += length;
    }
  }
  for (const step of input.steps) {
    for (const target of step.targets) {
      if (target.retained?.kind !== 'properties' || !target.retained.spans) {
        continue;
      }
      for (const span of target.retained.spans) {
        for (const location of authoredContentLocations(
          input.positions,
          span
        )) {
          touch(
            location.root,
            location.from + location.fromOffset - location.span.offset,
            location.from + location.toOffset - location.span.offset
          );
        }
      }
    }
  }
  let { positions } = input;
  const output: Record<string, RootChangeJson> = {};
  const boundaryPart = (span: AuthoredSpan, part: 0 | 1) => {
    const boundary = authoredTextBoundary(
      input.properties.state,
      span.origin,
      span.offset
    );
    if (!boundary) return null;
    let offset = 0;
    return boundary.spans.flatMap((piece) => {
      const start = offset;
      offset += piece.length;
      return start <= part && part < offset
        ? [{ ...piece, offset: piece.offset + part - start, length: 1 }]
        : [];
    });
  };
  for (const [root, starts] of touched) {
    const document = getDefined(documents.get(root));
    const currentRoot = getDefined(readRecord(positions, root));
    const updates: RootChangeSection[] = [];
    const positionEdits: Array<{
      from: number;
      to: number;
      spans: readonly AuthoredSpan[];
    }> = [];
    for (const from of [...starts].sort((a, b) => a - b)) {
      const node = getDefined(document.nodeStartingAt(from));
      const value = document.node(node.path);
      if (!isTextNode(value)) continue;
      const { text, ...current } = value;
      if (plainContent && Object.keys(current).length === 0) continue;
      const textContext = textPropertyContext(document, root, node.path);
      const pieces: Array<{
        from: number;
        to: number;
        properties: typeof current;
        span: AuthoredSpan;
      }> = [];
      for (const part of authoredPositionSpans(
        currentRoot.positions,
        node.from + 1,
        node.to - 1
      )) {
        const start = Math.max(node.from + 1, part.from);
        const end = Math.min(node.to - 1, part.to);
        const span = {
          ...part.span,
          offset: part.span.offset + start - part.from,
          length: end - start,
        };
        const writes = [
          ...authoredTextPropertyWrites(input.properties.state, span),
        ].sort((a, b) => a.id.localeCompare(b.id));
        const cuts = [
          ...new Set([
            span.offset,
            span.offset + span.length,
            ...writes.flatMap((write) => [
              Math.max(span.offset, write.from),
              Math.min(span.offset + span.length, write.to),
            ]),
          ]),
        ].sort((a, b) => a - b);
        for (let index = 1; index < cuts.length; index++) {
          const offset = cuts[index - 1];
          const length = cuts[index] - offset;
          const selected = writes
            .filter((write) => write.from <= offset && offset < write.to)
            .map((write) => write.value);
          const baseline = sourceProperties(
            root,
            { ...span, offset, length },
            current
          );
          const projected = projectAuthoredProperties({
            ...input.properties,
            span: { ...span, offset, length },
            modifications: selected.flatMap((write) => write.modifications),
            current: baseline,
            textContext,
            writes: selected,
          });
          pieces.push({
            from: start + offset - span.offset,
            to: start + offset - span.offset + length,
            properties: applyPropertyModifications(
              baseline,
              projected.modifications
            ),
            span: { ...span, offset, length, properties: projected.writers },
          });
        }
      }
      const first = getDefined(pieces[0]);
      const opening = removedSpans(
        currentRoot.positions,
        node.from,
        node.from + 1
      );
      const closing = removedSpans(currentRoot.positions, node.to - 1, node.to);
      const groups: Array<{
        from: number;
        to: number;
        properties: typeof current;
        spans: AuthoredSpan[];
      }> = [];
      for (const piece of pieces) {
        const previous = groups.at(-1);
        if (previous && jsonEqual(previous.properties, piece.properties)) {
          previous.to = piece.to;
          previous.spans.push(piece.span);
        } else groups.push({ ...piece, spans: [piece.span] });
      }
      if (groups.length === 1) {
        if (!jsonEqual(current, first.properties)) {
          updates.push({
            from: node.from,
            to: node.from + 1,
            properties: {
              set: first.properties,
              unset: Object.keys(current).filter(
                (key) => !Object.hasOwn(first.properties, key)
              ),
            },
          });
        }
        positionEdits.push({
          from: node.from,
          to: node.to,
          spans: [
            ...opening.map((span) => ({
              ...span,
              properties: first.span.properties,
            })),
            ...pieces.map((piece) => piece.span),
            ...closing,
          ],
        });
      } else {
        updates.push({
          from: node.from,
          to: node.to,
          insert: PreparedTokenSlice.fromNodes(
            groups.map((group) => ({
              ...group.properties,
              text: text.slice(
                group.from - node.from - 1,
                group.to - node.from - 1
              ),
            }))
          ),
        });
        const spans: AuthoredSpan[] = [];
        for (const [index, group] of groups.entries()) {
          const previousSpan = groups[index - 1]?.spans.at(-1);
          const groupOpening =
            index === 0
              ? opening
              : (boundaryPart(group.spans[0], 1) ??
                (previousSpan
                  ? boundaryPart(
                      {
                        ...previousSpan,
                        offset: previousSpan.offset + previousSpan.length,
                      },
                      1
                    )
                  : null));
          const lastGroupSpan = getDefined(group.spans.at(-1));
          const nextGroup = groups[index + 1];
          const groupClosing = nextGroup
            ? (boundaryPart(nextGroup.spans[0], 0) ??
              boundaryPart(
                {
                  ...lastGroupSpan,
                  offset: lastGroupSpan.offset + lastGroupSpan.length,
                },
                0
              ))
            : closing;
          if (!groupOpening || !groupClosing) {
            throw new AuthoredMappingConflictError([input.changeId]);
          }
          spans.push(
            ...groupOpening.map((span) => ({
              ...span,
              properties: group.spans[0].properties,
            })),
            ...group.spans,
            ...groupClosing
          );
        }
        positionEdits.push({ from: node.from, to: node.to, spans });
      }
    }
    if (updates.length) {
      output[root] = RootChange.create(document, updates).toJSON();
    }
    if (positionEdits.length) {
      positions = writeRecord(positions, root, {
        ...currentRoot,
        positions: applyPositionEdits(
          currentRoot.positions,
          positionEdits,
          false
        ),
      });
    }
  }
  const { main, ...roots } = output;
  let change = DocumentChange.fromJSON({
    version: 3,
    ...(main ? { primary: main } : {}),
    ...(Object.keys(roots).length ? { roots } : {}),
  });
  if (input.properties.editor) {
    const draft = new ChangeDraft(input.value);
    draft.apply(change, { classify: false });
    const correction = constructCanonicalDocumentChange(
      input.properties.editor,
      draft.value,
      input.change.compose(change, input.before),
      { before: input.before }
    );
    if (!correction.empty) {
      ({ positions } = captureAuthoredChange({
        schema: input.properties.schema,
        change: correction,
        changeId: input.changeId,
        operationId: `${input.operationId}:representation`,
        positions,
        value: draft.value,
      }));
      draft.apply(correction, { classify: false });
      ({ change } = draft);
    }
  }
  return {
    change,
    positions,
  };
};

export const mapAuthoredChange = (
  input: Omit<
    Parameters<typeof mapAuthoredStep>[0],
    'change' | 'rootTargets' | 'targets'
  > & {
    deferTextProperties?: boolean;
    captureAs?: Readonly<{ changeId: string; operationId: string }>;
    steps: readonly AuthoredStep[];
  }
) => {
  const draft =
    input.steps.length > 1 ? new ChangeDraft(input.value) : undefined;
  let change = DocumentChange.empty;
  const steps: AuthoredStep[] = [];
  const dependencies = new Set<string>();
  const offsets = new Map<string, number>();
  let { positions } = input;
  const operation = readRecord(input.state.operations, input.operationId);
  const propertySteps =
    operation?.kind === 'edit'
      ? authoredOperationPropertySteps(input.state, operation)
      : input.steps;
  const ignoreTextBoundaries =
    !!input.properties &&
    propertySteps.some((step) =>
      step.targets.some(
        (target) =>
          target.retained?.kind === 'properties' &&
          target.retained.spans?.length
      )
    );
  for (const frame of input.direction === 'forward'
    ? input.steps
    : [...input.steps].reverse()) {
    const mapped = mapAuthoredStep({
      ...input,
      ignoreTextBoundaries,
      change: frame.forward,
      rootTargets: frame.rootTargets,
      targets: frame.targets,
      positions,
      value: draft?.value ?? input.value,
    });
    if (input.captureAs) {
      const captured = captureAuthoredStep({
        schema: input.properties?.schema,
        ...input.captureAs,
        state: input.state,
        afterPositions: mapped.positions,
        change: mapped.change,
        offsets,
        positions,
        value: draft?.value ?? input.value,
      });
      steps.push({
        forward: mapped.change.toJSON(),
        rootTargets: captured.rootTargets,
        targets: captured.targets,
      });
      for (const dependency of captured.dependencies) {
        dependencies.add(dependency);
      }
    }
    draft?.apply(mapped.change, { classify: false });
    change = draft?.change ?? mapped.change;
    ({ positions } = mapped);
  }
  if (input.properties && !input.deferTextProperties) {
    const value =
      draft?.value ??
      new ChangeDraft(input.value).apply(change, { classify: false }).after;
    const projected = projectAuthoredTextProperties({
      before: input.value,
      change,
      changeId: input.changeId,
      operationId: input.operationId,
      positions,
      properties: input.properties,
      steps: propertySteps,
      value,
    });
    if (input.captureAs && !projected.change.empty) {
      const captured = captureAuthoredStep({
        schema: input.properties?.schema,
        ...input.captureAs,
        state: input.state,
        afterPositions: projected.positions,
        change: projected.change,
        offsets,
        positions,
        value,
      });
      steps.push({
        forward: projected.change.toJSON(),
        rootTargets: captured.rootTargets,
        targets: captured.targets,
      });
      for (const dependency of captured.dependencies) {
        dependencies.add(dependency);
      }
    }
    change = change.compose(projected.change, input.value);
    ({ positions } = projected);
  }
  return {
    change,
    dependencies: [...dependencies].sort(),
    positions,
    steps: snapshotEditorJsonValue(steps, 'Authored steps'),
  };
};

export const invertAuthoredSteps = (
  steps: readonly AuthoredStep[]
): readonly AuthoredStep[] =>
  [...steps].reverse().map((step) => {
    const sections = Object.fromEntries(
      rootSections(step.forward).map(([root, entries]) => [
        root,
        entries.map((section, index) => {
          const target = step.targets.find(
            (item) => item.root === root && item.section === index
          );
          if (!target) return section;
          if (section.properties) {
            if (target.retained?.kind !== 'properties') {
              throw new Error('Missing property inverse');
            }
            return {
              length: section.length,
              properties: {
                version: 1 as const,
                operations: invertPropertyModifications(
                  target.retained.properties,
                  section.properties.operations
                ),
              },
            };
          }
          return {
            length: target.inserted.reduce((sum, span) => sum + span.length, 0),
            replacement:
              target.retained && target.retained.kind !== 'properties'
                ? DocumentIndex.fromValue(target.retained.slice.content)
                    .slice(target.retained.from, target.retained.to)
                    .toJSON()
                : [],
          };
        }),
      ])
    );
    const { createRoots, deleteRoots, ...forward } = step.forward;
    return {
      forward: {
        ...forward,
        ...(sections.main ? { primary: sections.main } : {}),
        ...(step.forward.roots
          ? {
              roots: Object.fromEntries(
                Object.entries(sections).filter(([root]) => root !== 'main')
              ),
            }
          : {}),
        ...(step.forward.createRoots
          ? { deleteRoots: step.forward.createRoots }
          : {}),
        ...(step.forward.deleteRoots
          ? { createRoots: step.forward.deleteRoots }
          : {}),
      },
      rootTargets: step.rootTargets.map((target) => ({
        ...target,
        before: target.after,
        after: target.before,
      })),
      targets: step.targets.map((target) => ({
        ...target,
        from: target.afterFrom,
        to: target.afterTo,
        afterFrom: target.from,
        afterTo: target.to,
        inserted: target.removed,
        removed: target.inserted,
        retained: target.insertedContent ?? null,
        insertedContent: target.retained,
      })),
    };
  });
