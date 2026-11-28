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

/** Detached document snapshot captured at one side of a comparison. */
export type ComparisonSnapshot<V extends Value = Value> = Readonly<{
  document: Pick<EditorDocumentValue<V>, 'children' | 'roots'>;
  /** Exact non-content input envelope used only for stale-import detection. */
  envelopeFingerprint: string | null;
  fingerprint: string;
  projection: 'accepted' | 'proposed';
  schema: EditorSchemaIdentity;
}>;

/** Warning or informational notice produced while comparing two documents. */
export type ComparisonDiagnostic = Readonly<{
  code:
    | 'ambiguous'
    | 'coarse-replacement'
    | 'expired-lineage'
    | 'identity-hint-rejected'
    | 'incompatible-schema'
    | 'unsupported-structure'
    | 'work-limit';
  message: string;
  severity: 'info' | 'warning';
  spans?: readonly ComparisonSpan[];
}>;

/** Provenance describing how a correspondence or group was established. */
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

/** Typed semantic edit recorded inside a compared change group. */
export type ComparisonEffect = ComparisonEffectBase &
  (
    | Readonly<{ kind: 'structure' }>
    | Readonly<{
        /** The inserted content's text, with a line break between blocks. */
        afterText: string;
        kind: 'insert';
      }>
    | Readonly<{
        /** The deleted content's text, with a line break between blocks. */
        beforeText: string;
        kind: 'delete';
      }>
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

/** Immutable structural comparison between two schema-valid documents. */
export type Comparison<V extends Value = Value> = Readonly<{
  after: ComparisonSnapshot<V>;
  before: ComparisonSnapshot<V>;
  change: DocumentChange;
  changes: readonly ComparedChange[];
  diagnostics: readonly ComparisonDiagnostic[];
  id: string;
  policy: Readonly<{ id: 'structural-diff'; version: 1 }>;
}>;
