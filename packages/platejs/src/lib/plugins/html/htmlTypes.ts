import type {
  ContentSlice,
  EditorDocumentValue,
  EditorSchemaValidationDiagnostic,
  InternalEditorSchemaApi,
  NativeAuthoredProjectionDiagnostic,
  RootKey,
  RuntimePluginReference,
  Value,
} from '../../../facade';
import type { EditorApplicationSchema } from '../../editor/editorApplicationSchema';

export type HtmlParseLimits = Readonly<{
  maxBytes: number;
  maxDepth: number;
  maxNodes: number;
}>;

export type HtmlSourceLocation =
  | Readonly<{
      endCodeUnit: number;
      excerpt?: string;
      kind: 'source';
      startCodeUnit: number;
    }>
  | Readonly<{
      kind: 'tree';
      path: readonly number[];
      tag?: string;
    }>;

export type HtmlModelLocation = Readonly<{
  path?: readonly number[];
  property?: string;
  root?: RootKey;
}>;

type HtmlDiagnosticContext = Readonly<{
  model?: HtmlModelLocation;
  source?: HtmlSourceLocation;
}>;

type HtmlSchemaRepairCode = ReturnType<
  InternalEditorSchemaApi['fitDocumentWithReport']
>['repairs'][number]['code'];

type HtmlPolicyDiagnostic<T extends object> =
  | Readonly<T & { severity: 'error' }>
  | Readonly<T & { severity: 'warning' }>;

export type HtmlDiagnostic =
  | NativeAuthoredProjectionDiagnostic
  | (HtmlDiagnosticContext &
      Readonly<{
        code: 'html-invalid-source';
        message: string;
        reason: 'parser-failure';
        severity: 'error';
      }>)
  | (HtmlDiagnosticContext &
      Readonly<{
        code: 'html-parser-recovery';
        message: string;
        parserCode: string;
        severity: 'warning';
      }>)
  | (HtmlDiagnosticContext &
      Readonly<{
        actual: number;
        code: 'html-limit-exceeded';
        limit: keyof HtmlParseLimits;
        maximum: number;
        message: string;
        severity: 'error';
      }>)
  | Readonly<{
      code: 'html-multiple-editor-roots';
      count: number;
      message: string;
      severity: 'error';
    }>
  | (HtmlDiagnosticContext &
      Readonly<{
        code: 'html-schema-invalid';
        message: string;
        schema: EditorSchemaValidationDiagnostic;
        severity: 'error';
      }>)
  | (HtmlDiagnosticContext &
      HtmlPolicyDiagnostic<{
        action: 'dropped' | 'replaced' | 'unwrapped';
        code: 'html-schema-repair';
        impact: 'lossless' | 'lossy';
        inputs: readonly HtmlModelLocation[];
        message: string;
        outputs: readonly HtmlModelLocation[];
        owner: 'document' | 'grammar' | 'property' | 'representation';
        repair: HtmlSchemaRepairCode;
      }>)
  | (HtmlDiagnosticContext &
      HtmlPolicyDiagnostic<{
        action: 'removed';
        code: 'html-unsafe-content';
        /** Whether the mandatory removal also dropped visible content. */
        impact: 'lossless' | 'lossy';
        kind: 'attribute' | 'element' | 'style' | 'url';
        message: string;
      }>)
  | (HtmlDiagnosticContext &
      HtmlPolicyDiagnostic<{
        action: 'dropped' | 'replaced' | 'unwrapped';
        code: 'html-unsupported-content';
        kind: 'attribute' | 'element' | 'style';
        message: string;
        owner: string;
        phase: 'parse' | 'serialize';
      }>)
  | Readonly<{
      code: 'html-unsupported-metadata';
      key: string;
      message: string;
      severity: 'warning';
    }>
  | Readonly<{
      code: 'html-unsupported-root';
      message: string;
      root: RootKey;
      severity: 'warning';
    }>;

export type HtmlWarningDiagnostic = Extract<
  HtmlDiagnostic,
  { severity: 'warning' }
>;

export type HtmlErrorDiagnostic = Extract<
  HtmlDiagnostic,
  { severity: 'error' }
>;

export type HtmlDocumentParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly HtmlWarningDiagnostic[];
      document: EditorDocumentValue<V>;
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];
      ok: false;
    }>;

export type HtmlSliceParseResult<V extends Value = Value> =
  | Readonly<{
      diagnostics: readonly HtmlWarningDiagnostic[];
      ok: true;
      slice: ContentSlice<V>;
    }>
  | Readonly<{
      diagnostics: readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];
      ok: false;
    }>;

export type HtmlSerializeResult =
  | Readonly<{
      data: string;
      diagnostics: readonly HtmlWarningDiagnostic[];
      ok: true;
    }>
  | Readonly<{
      diagnostics: readonly [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];
      ok: false;
    }>;

export type HtmlParseOptions = Readonly<{
  collapseWhitespace?: boolean;
  limits?: Partial<HtmlParseLimits>;
  lossPolicy?: 'allow' | 'reject';
  plugins: readonly RuntimePluginReference[];
  schema?: EditorApplicationSchema;
}>;

export type HtmlSerializeOptions = Readonly<{
  lossPolicy?: 'allow' | 'reject';
  plugins: readonly RuntimePluginReference[];
  projection?: 'accepted' | 'proposed';
  schema?: EditorApplicationSchema;
}>;

export type HtmlEditorParseOptions = Omit<
  HtmlParseOptions,
  'plugins' | 'schema'
>;

export type HtmlEditorSerializeOptions = Readonly<{
  document?: EditorDocumentValue;
  lossPolicy?: 'allow' | 'reject';
  projection?: 'accepted' | 'proposed';
}>;

export type HtmlApi<V extends Value = Value> = Readonly<{
  parse: (
    source: string,
    options?: HtmlEditorParseOptions
  ) => HtmlDocumentParseResult<V>;
  parseSlice: (
    source: string,
    options?: HtmlEditorParseOptions
  ) => HtmlSliceParseResult<V>;
  serialize: (options?: HtmlEditorSerializeOptions) => HtmlSerializeResult;
}>;
