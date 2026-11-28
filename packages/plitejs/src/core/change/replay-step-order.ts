import { getDefined } from '../../internal/get-defined';
import type { DocumentChange } from './document-change';
import type { RootChange } from './root-change';
import { PreparedTokenSlice } from './tokens';

const DOCUMENT_CHANGE_STEP_FIRST_AT = new WeakMap<
  DocumentChange,
  ReadonlyMap<string, ReadonlySet<number>>
>();

const ROOT_CHANGE_STEP_FIRST_AT = new WeakMap<
  RootChange,
  ReadonlySet<number>
>();

/** @internal */
export const withInternalDocumentChangeStepFirstAt = (
  change: DocumentChange,
  stepFirstAt: ReadonlyMap<string, ReadonlySet<number>>
): DocumentChange => {
  if (stepFirstAt.size > 0) {
    DOCUMENT_CHANGE_STEP_FIRST_AT.set(change, stepFirstAt);
  }

  return change;
};

/** @internal */
export const getInternalDocumentChangeStepFirstAt = (
  change: DocumentChange
): ReadonlyMap<string, ReadonlySet<number>> | undefined =>
  DOCUMENT_CHANGE_STEP_FIRST_AT.get(change);

/** @internal */
export const hasInternalDocumentChangeStepFirstAt = (
  change: DocumentChange
): boolean => DOCUMENT_CHANGE_STEP_FIRST_AT.has(change);

/** @internal */
export const withRootChangeStepFirstAt = (
  change: RootChange,
  stepFirstAt: ReadonlySet<number> | undefined
): RootChange => {
  if (stepFirstAt?.size) ROOT_CHANGE_STEP_FIRST_AT.set(change, stepFirstAt);

  return change;
};

/** @internal */
export const getRootChangeStepFirstAt = (
  change: RootChange
): ReadonlySet<number> | undefined => ROOT_CHANGE_STEP_FIRST_AT.get(change);

const isTextOnlySlice = (slice: PreparedTokenSlice | null) =>
  slice !== null &&
  slice.tokens.length > 0 &&
  slice.tokens.every(
    (token) => token.kind === 'text' || token.nodeKind === 'text'
  );

/** @internal */
export const replayStepWinsTie = (
  a: PreparedTokenSlice | null,
  b: PreparedTokenSlice | null,
  position: number,
  stepFirstAt: ReadonlySet<number> | undefined
): boolean =>
  (isTextOnlySlice(a) && isTextOnlySlice(b)) ||
  stepFirstAt?.has(position) === true;

const structuralInsertStarts = (
  change: RootChange
): ReadonlySet<number> | null => {
  let starts: Set<number> | null = null;
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = getDefined(change.sections[index]);
    const inserted = getDefined(change.sections[index + 1]);

    if (length === 0 && inserted > 0) {
      const slice = change.data[index / 2];

      if (slice instanceof PreparedTokenSlice && !isTextOnlySlice(slice)) {
        starts ??= new Set();
        starts.add(position);
      }
    }
    position += length;
  }

  return starts;
};

/** @internal */
export const propagateRootStepFirstAt = (
  editRoot: RootChange,
  stepRoot: RootChange | undefined,
  existing: ReadonlySet<number> | undefined
): ReadonlySet<number> | undefined => {
  if (!existing?.size) return undefined;

  const consumed = stepRoot ? structuralInsertStarts(stepRoot) : null;
  let result: Set<number> | undefined;
  let position = 0;

  for (let index = 0; index < editRoot.sections.length; index += 2) {
    const length = getDefined(editRoot.sections[index]);
    const inserted = getDefined(editRoot.sections[index + 1]);

    if (
      length === 0 &&
      inserted > 0 &&
      existing.has(position) &&
      !consumed?.has(position)
    ) {
      const mapped = stepRoot ? stepRoot.mapPos(position, 1) : position;

      if (mapped !== null) {
        result ??= new Set();
        result.add(mapped);
      }
    }
    position += length;
  }

  return result;
};
