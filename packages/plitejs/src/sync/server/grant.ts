import type { DocumentChange } from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import type { CompiledEditorSchema } from '../../core/schema-compiler';

export type SyncGrant = Readonly<{
  access: 'edit' | 'suggest';
  actor: string;
  decide: boolean;
}>;

export type SyncStep = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
}>;

export type ChangeClaim = Readonly<{ author: string; change: string }>;

/** The batch writes no verdict record, so the room asks again at its head. */
export type SyncAtHead = Readonly<{ kind: 'at-head' }>;

export type SyncCover =
  | Readonly<{
      claims: readonly ChangeClaim[];
      /**
       * The room's own change at the head to the result the batch gives. When
       * set, the room logs it in place of the batch's bytes.
       */
      change?: DocumentChange;
      kind: 'covered';
      /**
       * Set for a decision on a split, join, wrap or unwrap. When it crossed
       * entries, the batch rebased over them must give `change`'s result.
       */
      structure?: true;
    }>
  | Readonly<{ kind: 'refused' }>
  /** A decided change changed between the batch's base and the head. */
  | Readonly<{ kind: 'stale' }>
  | SyncTakeBack;

/**
 * The batch only drops verdict records, so the room covers it only as its own
 * take-back of the writer's entry that put every one of them.
 */
export type SyncTakeBack = Readonly<{
  claims: readonly ChangeClaim[];
  kind: 'takes-back';
  /**
   * The changes the dropped verdicts reject, or null when one accepts. When
   * the writer's actor owns each, the undo is a withdrawal's.
   */
  rejected: readonly string[] | null;
  /** The record set that holds the dropped verdicts. */
  set: string;
  verdicts: readonly [string, ...string[]];
}>;

/**
 * A batch that writes verdict records is judged at its base, with `head` the
 * room's document when that differs from the base. Any other batch is judged
 * at the room's head, so with `head` set it answers `at-head`.
 */
export type SyncWriteCheck = {
  (step: SyncStep, grant: SyncGrant, schema: CompiledEditorSchema): SyncCover;
  (
    step: SyncStep,
    grant: SyncGrant,
    schema: CompiledEditorSchema,
    head: JsonEditorValue | undefined
  ): SyncAtHead | SyncCover;
};

export type SyncClaimsReader = (
  document: JsonEditorValue
) => readonly ChangeClaim[];

export type SyncAuthored = Readonly<{
  claimsIn: SyncClaimsReader;
  covers: SyncWriteCheck;
  decidedIn: (document: JsonEditorValue) => readonly string[];
}>;

const MAX_ACTOR_LENGTH = 256;

export const readSyncGrant = (value: unknown): SyncGrant | null => {
  if (typeof value !== 'object' || value === null) return null;

  const { access, actor, decide } = value as Record<string, unknown>;

  return (access === 'edit' || access === 'suggest') &&
    typeof actor === 'string' &&
    actor.length > 0 &&
    actor.length <= MAX_ACTOR_LENGTH &&
    typeof decide === 'boolean'
    ? Object.freeze({ access, actor, decide })
    : null;
};
