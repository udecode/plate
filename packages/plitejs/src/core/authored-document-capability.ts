import type {
  AnyEditor,
  EditorDocumentValue,
  PluginPoint,
} from '../interfaces/editor';
import type { Descendant, Node } from '../interfaces/node';
import { definePluginPoint } from './plugin-point';
import type { RecordOps } from './record-store';
import type { CompiledEditorSchema } from './schema-compiler';

/**
 * A container whose children a projection removed, merged, unwrapped or
 * pulled apart. The pure resolver runs no plugin corrections, so values a
 * correction derives from those children, such as column widths, are not
 * recomputed.
 */
/**
 * `authored-lossy-projection` reports pending changes a projection decided.
 * `authored-uncorrected` names a container whose children a decision
 * removed, merged, unwrapped or pulled apart: the pure resolver runs no
 * plugin corrections, so values derived from those children, such as column
 * widths, are not recomputed.
 */
export type AuthoredProjectionDiagnostic =
  | Readonly<{
      code: 'authored-lossy-projection';
      message: string;
      severity: 'warning';
    }>
  | Readonly<{
      code: 'authored-uncorrected';
      message: string;
      path: readonly number[];
      severity: 'warning';
      type: string | null;
    }>;

export type AuthoredDocumentProjection = Readonly<{
  diagnostics: readonly AuthoredProjectionDiagnostic[];
  document: EditorDocumentValue;
  ok: true;
  /** Pending changes the projection decided. */
  pending: number;
}>;

/**
 * A projection that built nothing. `authored-generated-values`: the schema
 * generates a property value no spare block can hold, so deciding pending
 * changes would mint values that differ between the accepted and proposed
 * documents. `authored-uncovered`: the projection builds an element that
 * needs a generated value, and the document stores no spare block for it.
 */
export type AuthoredProjectionRefusal = Readonly<{
  diagnostics: readonly [
    Readonly<{
      code: 'authored-generated-values' | 'authored-uncovered';
      message: string;
      severity: 'error';
    }>,
  ];
  ok: false;
  pending: number;
}>;

/** Blocks of a projection a pick read, each once, in the projection's order. */
export type AuthoredBlocksProjection = Readonly<{
  blocks: readonly Node[];
  ok: true;
}>;

/**
 * How an editor with suggestions exports its document with them decided, and
 * which nodes hold a pending line break.
 */
export type NativeAuthoredDocumentCapability = Readonly<{
  /**
   * Whether `node` holds a pending join or split of the break before it.
   * `mergeNodes` merges instead of removing an empty previous node when either
   * node holds one, because removing it would drop that change or move it to
   * another line.
   */
  claimsBreakBefore: (node: Node) => boolean;
  pending: (document: EditorDocumentValue) => number;
  project: (
    document: EditorDocumentValue,
    projection: 'accepted' | 'proposed',
    schema: CompiledEditorSchema
  ) => AuthoredDocumentProjection | AuthoredProjectionRefusal;
  /**
   * `document`'s projection as a decision of every pending change builds
   * it: the generators of the values spare blocks hold stay off, and every
   * other generator runs.
   */
  projectDecided: (
    document: EditorDocumentValue,
    projection: 'accepted' | 'proposed',
    schema: CompiledEditorSchema
  ) => AuthoredDocumentProjection | AuthoredProjectionRefusal;
  /**
   * The blocks at `paths` of `root` as the whole document's projection shows
   * them: a block it merges into the line before it reads as that line, and
   * one it removes reads nothing.
   */
  projectBlocks: (
    document: EditorDocumentValue,
    projection: 'accepted' | 'proposed',
    schema: CompiledEditorSchema,
    root: string,
    paths: ReadonlyArray<readonly number[]>
  ) => AuthoredBlocksProjection | AuthoredProjectionRefusal;
  /** `document` with the spares its pending changes need, as a load stores them. */
  repair: (
    document: EditorDocumentValue,
    schema: CompiledEditorSchema
  ) => EditorDocumentValue;
  /**
   * A top-level block of `root` read from a shared room, with each container
   * in it that lacks a required child built from its unbuilt spare, which it
   * marks built, so every editor builds the same line from the same bytes.
   * A container that lacks no required child reads no spare.
   */
  spareBlock: (
    editor: AnyEditor,
    root: string,
    block: Descendant
  ) => Descendant;
  /**
   * The children of `root` read from a shared room, each as `spareBlock`
   * gives it, and the root built from its unbuilt spare records in `records`
   * when it lacks a required child, with the record writes that mark them
   * built. Null when no build took a spare.
   */
  spareRoot: (
    editor: AnyEditor,
    root: string,
    children: readonly Descendant[],
    records: (set: string) => Iterable<readonly [string, unknown]>
  ) => Readonly<{ children: readonly Descendant[]; records: RecordOps }> | null;
}>;

export const authoredDocumentCapabilityPoint: PluginPoint<NativeAuthoredDocumentCapability> =
  definePluginPoint('authored.document');

export const isAuthorId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && !value.includes('\u0000');
