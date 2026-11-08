import type {
  DocumentChange,
  EditorDocumentValue,
  EditorSchemaIdentity,
  Value,
} from '../..';

/** A comparison-local interval in the canonical document token coordinate. */
export type ComparisonSpan = Readonly<{
  from: number;
  /** `null` addresses the primary document. */
  root: string | null;
  to: number;
}>;

export type ComparisonSnapshot<V extends Value = Value> = Readonly<{
  document: Pick<EditorDocumentValue<V>, 'children' | 'roots'>;
  /** Exact non-content input envelope used only for stale-import detection. */
  envelopeFingerprint: string | null;
  fingerprint: string;
  projection: 'accepted' | 'proposed';
  schema: EditorSchemaIdentity;
}>;

export type ComparisonDiagnostic = Readonly<{
  code:
    | 'ambiguous'
    | 'coarse-replacement'
    | 'expired-lineage'
    | 'identity-hint-rejected'
    | 'incompatible-schema'
    | 'invalid-resolution'
    | 'unsupported-structure'
    | 'work-limit';
  message: string;
  severity: 'info' | 'warning';
  spans?: readonly ComparisonSpan[];
}>;

export type ComparisonEvidence =
  | Readonly<{
      kind: 'inferred';
      basis: 'exact' | 'replacement' | 'structure' | 'unique-content';
    }>
  | Readonly<{
      kind: 'recorded';
      operationIds: readonly string[];
    }>;

/** One primary or explanatory relationship between endpoint content spans. */
export type ComparisonCorrespondence = Readonly<{
  after: readonly ComparisonSpan[];
  before: readonly ComparisonSpan[];
  evidence: ComparisonEvidence;
  id: string;
  /** Copies explain origin without inheriting source identity or provenance. */
  kind: 'copy' | 'primary';
}>;

type ComparisonEffectBase = Readonly<{
  after: readonly ComparisonSpan[];
  before: readonly ComparisonSpan[];
  id: string;
}>;

export type ComparisonEffect = ComparisonEffectBase &
  (
    | Readonly<{ kind: 'delete' | 'insert' | 'structure' }>
    | Readonly<{
        afterText: string;
        beforeText: string;
        kind: 'text';
      }>
    | Readonly<{
        afterProperties: ReadonlyArray<Readonly<Record<string, unknown>>>;
        beforeProperties: ReadonlyArray<Readonly<Record<string, unknown>>>;
        kind: 'property';
      }>
    | Readonly<{
        kind: 'placement';
        sourcePath: readonly number[];
        sourceRoot: string | null;
        targetPath: readonly number[];
        targetRoot: string | null;
      }>
    | Readonly<{
        kind: 'split';
        parts: number;
      }>
    | Readonly<{
        kind: 'join';
        parts: number;
      }>
    | Readonly<{
        afterType: string | null;
        beforeType: string | null;
        kind: 'node-type';
      }>
    | Readonly<{
        action: 'add' | 'remove';
        kind: 'wrapper';
        type: string | null;
      }>
    | Readonly<{
        kind: 'root-create' | 'root-delete';
        root: string;
      }>
  );

/**
 * One edit. A run is the changed content between two blocks that both
 * documents keep in place. Importing a set of groups writes each run whose
 * groups are all selected, between the same two blocks as in the document the
 * run comes from. Groups with edits in one run require each other, and groups
 * that move a word found once in each document from one run to another are
 * one group.
 */
export type ComparedChange = Readonly<{
  after: readonly ComparisonSpan[];
  before: readonly ComparisonSpan[];
  /** Three-way branch contribution. Omitted for ordinary two-way results. */
  branches?: readonly ComparisonBranch[];
  correspondence: readonly ComparisonCorrespondence[];
  effects: readonly ComparisonEffect[];
  evidence: ComparisonEvidence;
  id: string;
  /**
   * Groups that must be selected with this one. The list is not closed: select
   * what each listed group requires too, transitively. Groups with edits in
   * one run require each other this way, and a container's group requires the
   * edits inside it that it repeats, such as bold applied across a quote, each
   * of which still selects alone.
   */
  requiredChangeIds: readonly string[];
}>;

export type TwoWayComparison<V extends Value = Value> = Readonly<{
  after: ComparisonSnapshot<V>;
  before: ComparisonSnapshot<V>;
  change: DocumentChange;
  changes: readonly ComparedChange[];
  diagnostics: readonly ComparisonDiagnostic[];
  id: string;
  kind: 'two-way';
  policy: Readonly<{ id: 'structural-diff'; version: 1 }>;
}>;

export type ComparisonBranch = 'local' | 'remote';

export type ComparisonConflictAlternative = Readonly<{
  branch: ComparisonBranch;
  /**
   * This branch's groups in the conflict, with every group of the branch that
   * one of them requires or that requires one of them, transitively.
   */
  changeIds: readonly string[];
  spans: readonly ComparisonSpan[];
}>;

export type ComparisonConflict = Readonly<{
  base: readonly ComparisonSpan[];
  changeIds: readonly string[];
  id: string;
  kind: 'delete-edit' | 'grid' | 'order' | 'placement' | 'root' | 'structure';
  local: ComparisonConflictAlternative;
  remote: ComparisonConflictAlternative;
  requiredChangeIds: readonly string[];
}>;

export type ThreeWayComparison<V extends Value = Value> = Readonly<{
  base: ComparisonSnapshot<V>;
  changes: readonly ComparedChange[];
  conflicts: readonly ComparisonConflict[];
  diagnostics: readonly ComparisonDiagnostic[];
  id: string;
  kind: 'three-way';
  local: ComparisonSnapshot<V>;
  policy: Readonly<{ id: 'structural-diff'; version: 1 }>;
  remote: ComparisonSnapshot<V>;
}>;

export type Comparison<V extends Value = Value> =
  | ThreeWayComparison<V>
  | TwoWayComparison<V>;

export type ComparisonResolution = Readonly<{
  comparisonId: string;
  conflictId: string;
  choice: ComparisonBranch | Readonly<{ document: unknown; kind: 'custom' }>;
}>;

export type ComparisonResolutionResult<V extends Value = Value> =
  | Readonly<{
      comparison: TwoWayComparison<V>;
      status: 'resolved';
    }>
  | Readonly<{
      conflicts: readonly ComparisonConflict[];
      status: 'unresolved';
    }>
  | Readonly<{
      diagnostics: readonly ComparisonDiagnostic[];
      status: 'invalid';
    }>;
