import type { SchemaTarget } from './schema';

/** Stable runtime schema-validation failure categories. */
export type EditorSchemaValidationCode =
  | 'exclusive-property-conflict'
  | 'invalid-content'
  | 'invalid-document'
  | 'invalid-json'
  | 'invalid-node'
  | 'invalid-property-value'
  | 'invalid-root'
  | 'missing-property'
  | 'property-target-mismatch'
  | 'unknown-element'
  | 'unknown-property';

/** Compiled property candidates relevant to one validation failure. */
export type EditorSchemaValidationPropertyContext = Readonly<{
  /** Contributing extension names, sorted and deduplicated. */
  extensions: readonly string[];
  /** Stable compiled property IDs, in the same order as `targets`. */
  ids: readonly string[];
  /** Exact property key encountered in the document. */
  key: string;
  placement: 'element' | 'text';
  /** Candidate targets aligned with `ids`; `null` means universal. */
  targets: ReadonlyArray<SchemaTarget | null>;
}>;

/** One immutable, path-aware runtime schema validation failure. */
export type EditorSchemaValidationDiagnostic = Readonly<{
  /** Element ancestor types, immediate parent first. */
  ancestorTypes?: readonly string[];
  code: EditorSchemaValidationCode;
  message: string;
  /** Type of the invalid element, or `text` for a text node. */
  nodeType?: string;
  parentType?: string;
  /** Path inside `root`. */
  path: readonly number[];
  property?: EditorSchemaValidationPropertyContext;
  /** `null` means the implicit primary root. */
  root: string | null;
}>;
