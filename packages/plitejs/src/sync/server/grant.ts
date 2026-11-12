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

export type SyncCover =
  | Readonly<{ claims: readonly ChangeClaim[]; covered: true }>
  | Readonly<{ covered: false }>;

export type SyncWriteCheck = (
  step: SyncStep,
  grant: SyncGrant,
  schema: CompiledEditorSchema
) => SyncCover;

export type SyncClaimsReader = (
  document: JsonEditorValue
) => readonly ChangeClaim[];

export type SyncAuthored = Readonly<{
  claimsIn: SyncClaimsReader;
  covers: SyncWriteCheck;
  decidedIn: (document: JsonEditorValue) => readonly string[];
}>;

export const readSyncGrant = (value: unknown): SyncGrant | null => {
  if (typeof value !== 'object' || value === null) return null;

  const { access, actor, decide } = value as Record<string, unknown>;

  return (access === 'edit' || access === 'suggest') &&
    typeof actor === 'string' &&
    actor.length > 0 &&
    typeof decide === 'boolean'
    ? Object.freeze({ access, actor, decide })
    : null;
};
