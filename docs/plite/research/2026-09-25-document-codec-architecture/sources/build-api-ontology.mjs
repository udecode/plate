import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const directory = dirname(import.meta.dirname);
const manifestPath = join(directory, 'api-manifest.tsv');
const outputPath = join(directory, 'api-ontology.tsv');

const parseTsv = (source) => {
  const [header, ...lines] = source.trimEnd().split('\n');
  const fields = header.split('\t');

  return lines.map((line) =>
    Object.fromEntries(line.split('\t').map((value, index) => [fields[index], value]))
  );
};

const rowsByApi = new Map();

for (const row of parseTsv(readFileSync(manifestPath, 'utf8'))) {
  const key = [row.symbol, row.member, row.kind, row.source, row.line].join('\0');
  const current = rowsByApi.get(key);

  if (current) {
    current.entrypoints.add(row.entrypoint);
  } else {
    rowsByApi.set(key, { ...row, entrypoints: new Set([row.entrypoint]) });
  }
}

const exactTarget = new Map(
  Object.entries({
    HostCodec: 'DataTransferFormat',
    HostCodecParseContext: 'DataTransferDecodeContext',
    HostCodecPhase: 'DataTransferFormatPhase',
    HostCodecSchemaTarget: 'DataTransferSchemaClaim',
    HostCodecSerializeContext: 'DataTransferEncodeContext',
    HostDataSource: 'DataTransferSnapshot',
    MarkdownNodeCodec: 'MarkdownNodeMapping',
    MarkdownNodeCodecInput: 'MarkdownNodeMappingInput',
    PlainTextNodeCodec: 'PlainTextNodeMapping',
    PlainTextNodeCodecInput: 'PlainTextNodeMappingInput',
    PluginCodecNode: 'PluginFormatNode',
    hostCodecs: 'dataTransferFormats',
    writeHostFragmentData: 'writeDataTransferFragment',
  })
);

const classify = (row) => {
  const { kind, member, source, symbol } = row;
  const api = member || symbol;
  const keep = (category, reason, target = api) => ({
    category,
    decision: 'keep',
    reason,
    target,
  });
  const rename = (category, reason, target) => ({
    category,
    decision: 'rename',
    reason,
    target,
  });
  const reshape = (category, reason, target) => ({
    category,
    decision: 'reshape',
    reason,
    target,
  });

  if (source.includes('@types/react')) {
    return {
      category: 'lexical-collision',
      decision: 'exclude',
      reason: 'Inherited React DOM attribute; unrelated to document conversion.',
      target: api,
    };
  }

  if (source.endsWith('/dom/plugin/data-transfer-format.ts')) {
    return keep(
      'data-transfer-format',
      'This API negotiates browser DataTransfer payloads and ContentSlice insertion without claiming document-format round trips.'
    );
  }

  if (
    source.endsWith('/lib/plugin/MarkdownNodeMapping.ts') ||
    source.endsWith('/lib/plugin/PlainTextNodeMapping.ts') ||
    source.endsWith('/lib/plugin/pluginNodeTypes.ts')
  ) {
    return keep(
      'plugin-format-mapping',
      'Feature plugins contribute schema-bound, direction-specific format mappings.'
    );
  }

  if (source.endsWith('/dom/plugin/host-codec.ts')) {
    const memberTarget =
      member === 'parse'
        ? 'decode'
        : member === 'query'
          ? 'accept'
          : member === 'serialize'
            ? 'encode'
            : member === 'format'
              ? 'mimeType'
              : member === 'owns'
                ? 'claims'
                : member || undefined;

    return rename(
      'data-transfer-format',
      'This API negotiates browser DataTransfer formats and ContentSlice payloads; host codec overstates its domain and codec laws.',
      memberTarget ??
        exactTarget.get(symbol) ??
        exactTarget.get(api) ??
        api.replaceAll('HostCodec', 'DataTransferFormat')
    );
  }

  if (symbol === 'HtmlCodecHooks') {
    return reshape(
      'plugin-format-mapping',
      'The wrapper mixes generic HTML preparation with DataTransfer acceptance and Word-paste postprocessing. Keep only the evidenced inert-DOM preparation field on HTML mappings; move transfer-specific work to DataTransferFormat.',
      'html.prepareDocument'
    );
  }

  if (
    exactTarget.has(symbol) ||
    exactTarget.has(api) ||
    member === 'codecs' ||
    member === 'defineCodecs'
  ) {
    return rename(
      'plugin-format-mapping',
      'Feature declarations are partial or one-way format mappings, not lawful bidirectional codecs.',
      exactTarget.get(symbol) ??
        exactTarget.get(api) ??
        (member === 'codecs' ? 'formats' : 'defineFormats')
    );
  }

  if (
    source.endsWith('/lib/plugin/MarkdownNodeCodec.ts') ||
    source.endsWith('/lib/plugin/PlainTextNodeCodec.ts') ||
    source.endsWith('/lib/plugin/pluginNodeTypes.ts')
  ) {
    return keep(
      'plugin-format-mapping',
      'Direction-specific mapping context remains valid after the enclosing codec nouns become mappings.',
      exactTarget.get(symbol) ?? exactTarget.get(api) ?? api
    );
  }

  if (
    source.endsWith('/core/value-codec.ts') ||
    ['EditorJsonValue', 'EditorValueCodec', 'EditorValuePersistence'].includes(
      symbol
    )
  ) {
    return keep(
      'persistence-codec',
      'Versioned JSON persistence has typed encode/decode directions and a testable round-trip law.'
    );
  }

  if (
    symbol.startsWith('SerializedEditor') ||
    symbol.startsWith('EditorEffectCollab') ||
    (symbol === 'EditorEffectType' && member === 'codec') ||
    (symbol === 'EditorStateField' && ['deserialize', 'serialize'].includes(member)) ||
    symbol === 'pageSettingsCodec'
  ) {
    return keep(
      'persistence-codec',
      'This API encodes durable editor state or collaboration payloads rather than external document formats.'
    );
  }

  if (source.includes('/migrations/')) {
    return keep(
      'persistence-migration',
      'Versioned document migration is a separate persisted-schema job and must not be folded into lossy format conversion.'
    );
  }

  if (source.includes('/authored/')) {
    return keep(
      'authored-envelope',
      'Authored projection envelopes preserve Plate-owned document state and remain separate from external format parsing.'
    );
  }

  if (source.includes('/docx/')) {
    return keep(
      'docx-conversion',
      'DOCX owns async package processing, cancellation, retained-source correspondence, and format-specific diagnostics.'
    );
  }

  if (source.includes('/csv/')) {
    return {
      category: 'csv-ingress',
      decision: 'defer',
      reason: 'CSV remains table/plain-text ingress; its failure contract needs a format-specific audit before redesign.',
      target: api,
    };
  }

  if (source.includes('/markdown/')) {
    if (symbol === 'MarkdownApi' && member === 'deserialize') {
      return rename(
        'markdown-conversion',
        'Whole-document parsing must state its authority explicitly and return diagnostics.',
        'parseDocument'
      );
    }
    if (symbol === 'MarkdownApi' && member === 'deserializeInline') {
      return reshape(
        'markdown-conversion',
        'Inline parsing is a distinct job but must return ContentSlice instead of an untyped descendant array.',
        'parseInline(...): MarkdownSliceParseResult'
      );
    }
    if (
      symbol === 'MdRules' ||
      symbol === 'MdNodeParser' ||
      symbol.startsWith('convert') ||
      symbol === 'parseAttributes' ||
      symbol === 'parseMarkdownBlocks' ||
      symbol === 'getSerializableListStyle'
    ) {
      return {
        category: 'markdown-internal',
        decision: 'make-private',
        reason: 'These implementation-level parser helpers duplicate the plugin-owned format mapping surface.',
        target: 'package-private',
      };
    }
    if (api === 'rules' || api === 'ruleOverrides') {
      return {
        category: 'markdown-conversion',
        decision: 'delete',
        reason: 'Per-call rule overrides bypass reusable plugin format ownership and compiled schema checks.',
        target: 'plugin formats',
      };
    }
    if (symbol === 'DeserializeMdOptions' && member === 'onError') {
      return reshape(
        'markdown-conversion',
        'Expected malformed input and lossy recovery belong in the returned typed result, not a callback side channel.',
        'MarkdownDeserializeResult'
      );
    }
    if (
      (symbol === 'DeserializeMdOptions' || symbol === 'SerializeMdOptions') &&
      ['allowedNodes', 'allowNode', 'disallowedNodes'].includes(member)
    ) {
      return reshape(
        'markdown-conversion',
        'Filtering remains format-specific but every omitted node must produce a diagnostic.',
        api
      );
    }

    return keep(
      'markdown-conversion',
      'Markdown keeps a format-owned reader/writer API with document, slice, and inline operation contracts.'
    );
  }

  if (
    source.includes('/lib/plugins/html/') ||
    source.includes('/html/server/') ||
    symbol === 'HtmlParserOptions'
  ) {
    if (symbol === 'HtmlApi' && member === 'deserialize') {
      return rename(
        'html-conversion',
        'Fragment parsing must state that it returns a ContentSlice and returns failures directly.',
        'parseSlice'
      );
    }
    if (symbol === 'HtmlApi' && member === 'deserializeDocument') {
      return reshape(
        'html-conversion',
        'Whole-document parsing needs an explicit typed result and deterministic root policy.',
        'parseDocument(...): HtmlDocumentParseResult'
      );
    }
    return keep(
      'html-conversion',
      'HTML keeps a format-owned reader/writer API; detached server decoding lives in a separate server entrypoint.'
    );
  }

  if (
    source.includes('/core/editor-schema.ts') ||
    source.includes('/interfaces/schema.ts') ||
    source.includes('/core/schema-compiler.ts') ||
    symbol === 'DocumentMigrationSchema' ||
    symbol.endsWith('SchemaApi') ||
    api.startsWith('assert') ||
    api.startsWith('fit')
  ) {
    return keep(
      'schema-boundary',
      'Canonical schema validation and explicit coercive fitting are independent model-boundary jobs.'
    );
  }

  if (source.includes('/selection-protocol.ts')) {
    return keep(
      'selection-protocol',
      'Selection wire encoding is a separate durable protocol with its own version and validity laws.'
    );
  }

  if (source.includes('/plain-text.ts') || source.endsWith('/plain-text.ts')) {
    return keep(
      'plain-text-projection',
      'Plain text is a deliberate one-way projection and should remain named as serialization, not codec.'
    );
  }

  if (
    source.includes('/dom/plugin/dom-clipboard-runtime.ts') ||
    source.includes('/dom/plugin/dom-editor.ts') ||
    source.includes('/dom/plugin/dom-html.ts')
  ) {
    return keep(
      'dom-transfer-runtime',
      'DOM assertions and clipboard read/write capabilities are concrete browser operations beneath format declarations.'
    );
  }

  if (
    source.includes('/parseMediaUrl.ts') ||
    source.includes('/dateValue.ts') ||
    source.includes('/features/link/')
  ) {
    return {
      category: 'lexical-collision',
      decision: 'exclude',
      reason: 'Feature-specific URL or scalar parsing is unrelated to document conversion architecture.',
      target: api,
    };
  }

  if (
    kind === 'member' &&
    ['read', 'readMiddleware', 'readOnly', 'validate', 'export', 'write'].includes(member)
  ) {
    return {
      category: 'lexical-collision',
      decision: 'exclude',
      reason: 'Generic editor capability name; independent from import/export and serialization.',
      target: api,
    };
  }

  if (
    source.includes('/editor-read-execution.ts') ||
    source.includes('/external-text.ts') ||
    source.includes('/HistoryPlugin.ts') ||
    source.includes('/history-plugin.ts') ||
    source.includes('/public-root.ts') ||
    source.includes('/public-state.ts')
  ) {
    return keep(
      'independent-editor-protocol',
      'This read, history, root, or external-text API has an independent editor-runtime job.'
    );
  }

  return {
    category: 'lexical-collision',
    decision: 'exclude',
    reason: 'Reviewed lexical match with an independent feature or UI job.',
    target: api,
  };
};

const escape = (value) => String(value).replaceAll('\t', ' ').replaceAll('\n', ' ');
const outputRows = [...rowsByApi.values()]
  .map((row) => ({ ...row, ...classify(row) }))
  .sort((left, right) =>
    [left.category, left.source, left.symbol, left.member]
      .join('\0')
      .localeCompare([right.category, right.source, right.symbol, right.member].join('\0'))
  );
const header = [
  'api_key',
  'entrypoints',
  'symbol',
  'member',
  'kind',
  'source',
  'line',
  'category',
  'decision',
  'target',
  'reason',
  'reviewed',
];

writeFileSync(
  outputPath,
  `${header.join('\t')}\n${outputRows
    .map((row) =>
      [
        `${row.symbol}${row.member ? `.${row.member}` : ''}`,
        [...row.entrypoints].sort().join(','),
        row.symbol,
        row.member,
        row.kind,
        row.source,
        row.line,
        row.category,
        row.decision,
        row.target,
        row.reason,
        'yes',
      ]
        .map(escape)
        .join('\t')
    )
    .join('\n')}\n`
);

console.log(
  JSON.stringify({
    decisions: Object.fromEntries(
      [...new Set(outputRows.map(({ decision }) => decision))]
        .sort()
        .map((decision) => [
          decision,
          outputRows.filter((row) => row.decision === decision).length,
        ])
    ),
    output: outputPath,
    reviewed: outputRows.length,
  })
);
