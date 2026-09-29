import type { AuthoredProjectionDiagnostic } from '../../authored';
import type {
  EditorSchemaRepairCode,
  Path,
  Range,
  RootKey,
  Value,
} from '../../core';

export type DocxImportLimits = Readonly<{
  maxComments: number;
  maxEntries: number;
  maxEntryBytes: number;
  maxExpandedBytes: number;
  maxInputBytes: number;
  maxRelationships: number;
  maxRevisions: number;
  maxXmlDepth: number;
  maxXmlNodes: number;
}>;

export type DocxSourceLocation = Readonly<{
  endCodeUnit: number;
  part: string;
  qName: string;
  startCodeUnit: number;
}>;

export type DocxComment = Readonly<{
  author: Readonly<{ initials?: string; name: string }> | null;
  body: Value;
  createdAt: string | null;
  durableId: string | null;
  id: string;
  parentId: string | null;
  resolved: boolean | null;
  target: Readonly<{ range: Range }> | null;
}>;

/** Canonical model location affected by one DOCX schema repair. */
export type DocxModelLocation = Readonly<{
  path: readonly number[];
  property?: string;
  root: RootKey;
}>;

type DocxPolicyDiagnostic<T extends object> =
  | Readonly<T & { severity: 'error' }>
  | Readonly<T & { severity: 'warning' }>;

export type DocxDiagnostic =
  | AuthoredProjectionDiagnostic
  | DocxPolicyDiagnostic<{
      code: 'authored-conflict';
      count: number;
      message: string;
    }>
  | Readonly<{
      actual: number;
      code: 'limit-exceeded';
      limit: keyof DocxImportLimits;
      maximum: number;
      message: string;
      severity: 'error';
    }>
  | Readonly<{
      code: 'native-data-ignored';
      message: string;
      part: 'editor/authored.json';
      reason:
        | 'digest-mismatch'
        | 'invalid'
        | 'projection-mismatch'
        | 'signature-invalid'
        | 'signature-missing'
        | 'unsupported-version';
      severity: 'warning';
    }>
  | Readonly<{
      code: 'decode-failed' | 'invalid-package';
      message: string;
      part?: string;
      severity: 'error';
    }>
  | Readonly<{
      code: 'source-unavailable';
      message: string;
      reason: 'disposed' | 'invalid' | 'schema-mismatch';
      severity: 'warning';
    }>
  | Readonly<{
      code: 'source-unavailable';
      message: string;
      /** Package part outside the passive vocabulary exact reuse admits. */
      part: string;
      reason: 'ineligible';
      severity: 'warning';
    }>
  | Readonly<{
      code: 'source-rewritten';
      message: string;
      reason:
        | 'comments-changed'
        | 'document-changed'
        | 'output-options-changed'
        | 'projection-changed';
      severity: 'warning';
    }>
  | Readonly<{
      code: 'source-part-omitted';
      message: string;
      part: string;
      reason:
        | 'active-content'
        | 'conflict'
        | 'external-relationship'
        | 'invalidated'
        | 'multiple-sections'
        | 'unreachable';
      severity: 'warning';
    }>
  | Readonly<{
      code: 'converter-message';
      message: string;
      severity: 'warning';
    }>
  | DocxPolicyDiagnostic<{
      code: 'lossy-content' | 'resource-omitted';
      feature?: string;
      message: string;
      part?: string;
      path?: Path;
      root?: string;
      sourceId?: string;
    }>
  | DocxPolicyDiagnostic<{
      code: 'schema-repair';
      impact: 'lossless' | 'lossy';
      inputs: readonly DocxModelLocation[];
      message: string;
      outputs: readonly DocxModelLocation[];
      owner: 'document' | 'grammar' | 'property' | 'representation';
      repair: EditorSchemaRepairCode;
    }>
  | DocxPolicyDiagnostic<{
      action: 'dropped' | 'replaced' | 'unwrapped';
      code: 'unsupported-content';
      feature?: string;
      message: string;
      part?: string;
      path?: Path;
      root?: string;
      sourceId?: string;
      sourceLocation?: DocxSourceLocation;
    }>;

export type DocxWarningDiagnostic = Extract<
  DocxDiagnostic,
  { severity: 'warning' }
>;

export type DocxErrorDiagnostic = Extract<
  DocxDiagnostic,
  { severity: 'error' }
>;
