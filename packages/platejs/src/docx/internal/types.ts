import type { Path, Range, Value } from '../../core';

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

export type DocxDiagnostic =
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
      code:
        | 'converter-message'
        | 'lossy-content'
        | 'resource-omitted'
        | 'unsupported-content';
      feature?: string;
      message: string;
      part?: string;
      path?: Path;
      root?: string;
      severity: 'warning';
      sourceId?: string;
    }>;
