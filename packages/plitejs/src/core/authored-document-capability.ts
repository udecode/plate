import type { EditorDocumentValue, PluginPoint } from '../interfaces/editor';
import { definePluginPoint } from './plugin-point';
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
 * A projection that built nothing: the schema generates property values, so
 * deciding pending changes would mint values that differ between the
 * accepted and proposed documents.
 */
export type AuthoredProjectionRefusal = Readonly<{
  diagnostics: readonly [
    Readonly<{
      code: 'authored-generated-values';
      message: string;
      severity: 'error';
    }>,
  ];
  ok: false;
  pending: number;
}>;

/** How an editor with suggestions exports its document with them decided. */
export type NativeAuthoredDocumentCapability = Readonly<{
  project: (
    document: EditorDocumentValue,
    projection: 'accepted' | 'proposed',
    schema: CompiledEditorSchema
  ) => AuthoredDocumentProjection | AuthoredProjectionRefusal;
}>;

export const authoredDocumentCapabilityPoint: PluginPoint<NativeAuthoredDocumentCapability> =
  definePluginPoint('authored.document');

export const isAuthorId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && !value.includes('\u0000');
