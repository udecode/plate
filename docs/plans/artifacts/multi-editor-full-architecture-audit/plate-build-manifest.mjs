import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('../../../../node_modules/.pnpm/typescript@6.0.2/node_modules/typescript');

const root = path.resolve(import.meta.dirname, '../../../..');
const outputPath = path.join(
  import.meta.dirname,
  'plate-coverage-manifest.json'
);

const conceptIds = Object.freeze([
  'PL-BND-01',
  'PL-BND-02',
  'PL-DESC-01',
  'PL-DESC-02',
  'PL-DESC-03',
  'PL-DESC-04',
  'PL-DESC-05',
  'PL-DESC-06',
  'PL-OPT-01',
  'PL-CTX-01',
  'PL-CAP-01',
  'PL-SCHEMA-01',
  'PL-SCHEMA-02',
  'PL-SCHEMA-03',
  'PL-CODEC-01',
  'PL-CODEC-02',
  'PL-CODEC-03',
  'PL-CODEC-04',
  'PL-CODEC-05',
  'PL-CMD-01',
  'PL-CMD-02',
  'PL-INPUT-01',
  'PL-INPUT-02',
  'PL-INPUT-03',
  'PL-RENDER-01',
  'PL-RENDER-02',
  'PL-RENDER-03',
  'PL-REACT-01',
  'PL-REACT-02',
  'PL-DOM-01',
  'PL-SEL-01',
  'PL-TABLE-01',
  'PL-LIST-01',
  'PL-COLLAB-01',
  'PL-COLLAB-02',
  'PL-AI-01',
  'PL-MEDIA-01',
  'PL-COMBO-01',
  'PL-FEATURE-01',
  'PL-FEATURE-02',
  'PL-PRODUCT-01',
  'PL-PRODUCT-02',
  'PL-DOCS-01',
  'PL-PROOF-01',
  'PL-PROOF-02',
]);

const packageDomains = Object.freeze({
  ai: ['PL-AI-01'],
  'basic-nodes': ['PL-FEATURE-01'],
  'basic-styles': ['PL-FEATURE-01'],
  browser: ['PL-DOM-01', 'PL-PROOF-02'],
  callout: ['PL-FEATURE-02'],
  'code-block': ['PL-FEATURE-02'],
  'code-drawing': ['PL-FEATURE-02'],
  combobox: ['PL-COMBO-01'],
  comment: ['PL-COLLAB-02'],
  core: ['PL-BND-01'],
  csv: ['PL-CODEC-05'],
  cursor: ['PL-COLLAB-02'],
  date: ['PL-FEATURE-02'],
  diff: ['PL-COLLAB-02'],
  dnd: ['PL-MEDIA-01'],
  docx: ['PL-CODEC-05'],
  'docx-io': ['PL-CODEC-05'],
  emoji: ['PL-COMBO-01'],
  excalidraw: ['PL-FEATURE-02'],
  'find-replace': ['PL-FEATURE-02'],
  floating: ['PL-REACT-02'],
  footnote: ['PL-FEATURE-02'],
  indent: ['PL-LIST-01'],
  juice: ['PL-CODEC-05'],
  layout: ['PL-FEATURE-02'],
  link: ['PL-FEATURE-01'],
  list: ['PL-LIST-01'],
  markdown: ['PL-CODEC-04'],
  math: ['PL-FEATURE-02'],
  media: ['PL-MEDIA-01'],
  mention: ['PL-COMBO-01'],
  plate: ['PL-BND-01'],
  resizable: ['PL-MEDIA-01'],
  selection: ['PL-SEL-01'],
  'slash-command': ['PL-COMBO-01'],
  suggestion: ['PL-COLLAB-02'],
  tabbable: ['PL-DOM-01', 'PL-SEL-01'],
  table: ['PL-TABLE-01'],
  tag: ['PL-FEATURE-02'],
  'test-utils': ['PL-PROOF-01'],
  toc: ['PL-FEATURE-02'],
  toggle: ['PL-FEATURE-02'],
  utils: ['PL-CMD-01'],
  yjs: ['PL-COLLAB-01'],
});

const unique = (values) => [...new Set(values)].sort();
const relative = (file) => path.relative(root, file).replaceAll(path.sep, '/');
const exists = (file) => fs.existsSync(file);

const walk = (directory, accept) => {
  if (!exists(directory)) return [];
  const files = [];
  const stack = [directory];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === 'dist' ||
          entry.name === 'node_modules' ||
          entry.name === '.next'
        ) {
          continue;
        }
        stack.push(file);
      } else if (accept(file)) {
        files.push(file);
      }
    }
  }

  return files.sort();
};

const isProofPath = (file) =>
  /(?:^|\/)(?:test|tests|type-tests|__tests__)(?:\/|$)/.test(file) ||
  /\.(?:spec|test|slow)\.[cm]?[jt]sx?$/.test(file);

const excludedReason = (file) => {
  if (file.startsWith('packages/plate-scripts/')) {
    return 'Repository build tooling, not a Plate editor architecture surface.';
  }
  if (file.startsWith('packages/platejs/src/features/list/')) {
    return 'Maintenance-only legacy-list-model package; excluded from target architecture by VISION.md.';
  }
  if (file.startsWith('apps/www/src/registry/changelog/')) {
    return 'Historical registry changelog, not a current architecture contract.';
  }
  if (file.startsWith('content/docs/migration/')) {
    return 'Historical migration documentation, not the current public shape.';
  }
  if (file.endsWith('.cn.mdx') || file.endsWith('.cn.md')) {
    return 'Translated duplicate; the corresponding English source is the architecture evidence owner.';
  }

  return null;
};

const domainForText = (text) => {
  const value = text.toLowerCase();
  const concepts = [];

  if (/(^|[/_-])(table|cell|row)([/_.-]|$)/.test(value)) {
    concepts.push('PL-TABLE-01');
  }
  if (/(^|[/_-])(list|indent)([/_.-]|$)/.test(value)) {
    concepts.push('PL-LIST-01');
  }
  if (/(yjs|collaboration|awareness)/.test(value)) {
    concepts.push('PL-COLLAB-01');
  }
  if (/(comment|suggestion|cursor|discussion|diff)/.test(value)) {
    concepts.push('PL-COLLAB-02');
  }
  if (/(^|[/_-])ai([/_.-]|$)|copilot|chat/.test(value)) {
    concepts.push('PL-AI-01');
  }
  if (/(media|image|video|audio|file|upload|dnd|drag|resize)/.test(value)) {
    concepts.push('PL-MEDIA-01');
  }
  if (/(combobox|mention|emoji|slash)/.test(value)) {
    concepts.push('PL-COMBO-01');
  }
  if (/(markdown)/.test(value)) concepts.push('PL-CODEC-04');
  if (
    /(docx|html|csv|juice|serialize|deserialize|codec|clipboard)/.test(value)
  ) {
    concepts.push('PL-CODEC-05');
  }
  if (/(selection|selectable|affinity|tabbable)/.test(value)) {
    concepts.push('PL-SEL-01');
  }
  if (
    /(code-block|codeblock|callout|column|layout|toggle|toc|footnote|math|date|tag|excalidraw|drawing)/.test(
      value
    )
  ) {
    concepts.push('PL-FEATURE-02');
  }
  if (
    /(basic|paragraph|heading|blockquote|mark|bold|italic|underline|link|font|style)/.test(
      value
    )
  ) {
    concepts.push('PL-FEATURE-01');
  }

  return concepts;
};

const conceptsFor = (file) => {
  const concepts = [];
  const packageMatch = file.match(/^packages\/([^/]+)\//);

  if (packageMatch) {
    concepts.push('PL-BND-01', ...(packageDomains[packageMatch[1]] ?? []));
  }

  if (/^packages\/core\/src\/lib\/plugin\//.test(file)) {
    concepts.push(
      'PL-DESC-01',
      'PL-DESC-02',
      'PL-DESC-03',
      'PL-DESC-04',
      'PL-CTX-01',
      'PL-CAP-01'
    );
  }
  if (/^packages\/core\/src\/react\/plugin\//.test(file)) {
    concepts.push(
      'PL-BND-02',
      'PL-DESC-02',
      'PL-DESC-03',
      'PL-DESC-04',
      'PL-RENDER-01'
    );
  }
  if (/^packages\/core\/src\/internal\/plugin\//.test(file)) {
    concepts.push('PL-DESC-05', 'PL-DESC-06');
  }
  if (
    /pluginOptionsStore|usePluginOption|useEditorPlugin|getEditorPlugin/.test(
      file
    )
  ) {
    concepts.push('PL-OPT-01', 'PL-CTX-01', 'PL-REACT-02');
  }
  if (/compilePlateModel|withPlite|schema/.test(file)) {
    concepts.push('PL-SCHEMA-01', 'PL-SCHEMA-02', 'PL-SCHEMA-03');
  }
  if (/compilePlateCodecs|ProductCodecs/.test(file)) {
    concepts.push('PL-CODEC-01');
  }
  if (/compilePlateHtmlCodec|html/i.test(file)) {
    concepts.push('PL-CODEC-02');
  }
  if (/legacy|deserializeHtml|htmlParser/i.test(file)) {
    concepts.push('PL-CODEC-03');
  }
  if (/input-rule|inputRule/i.test(file)) concepts.push('PL-INPUT-02');
  if (/shortcut|hotkey/i.test(file)) concepts.push('PL-INPUT-01');
  if (/handler|event|DOMPlugin/.test(file)) concepts.push('PL-INPUT-03');
  if (/\/react\//.test(file)) concepts.push('PL-BND-02', 'PL-REACT-01');
  if (/render|component|nodeProps|PlateContent/.test(file)) {
    concepts.push('PL-RENDER-01', 'PL-RENDER-02');
  }
  if (/\/static\//.test(file)) concepts.push('PL-BND-02', 'PL-RENDER-03');
  if (/command|update|transform/.test(file)) concepts.push('PL-CMD-01');
  if (/EditorExtension|extension/.test(file)) concepts.push('PL-CMD-02');
  if (/dom|clipboard|editable/i.test(file)) concepts.push('PL-DOM-01');

  if (file.startsWith('apps/www/src/registry/components/editor/plugins/')) {
    concepts.push('PL-PRODUCT-01');
  } else if (file.startsWith('apps/www/src/registry/')) {
    concepts.push('PL-PRODUCT-02');
  }
  if (file.startsWith('apps/www/src/__tests__/')) {
    concepts.push('PL-PRODUCT-02', 'PL-PROOF-01');
  }
  if (file.startsWith('content/docs/')) {
    concepts.push('PL-DOCS-01');
  }
  if (isProofPath(file)) concepts.push('PL-PROOF-01');
  if (file.startsWith('packages/browser/test/')) concepts.push('PL-PROOF-02');

  concepts.push(...domainForText(file));

  return unique(concepts.length > 0 ? concepts : ['PL-BND-01']);
};

const declarationName = (node, sourceFile) => {
  if (
    ts.isFunctionDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isEnumDeclaration(node) ||
    ts.isModuleDeclaration(node)
  ) {
    return node.name?.getText(sourceFile) ?? '<default>';
  }
  if (ts.isVariableStatement(node)) {
    return node.declarationList.declarations
      .map((declaration) => declaration.name.getText(sourceFile))
      .join(', ');
  }
  if (ts.isExportDeclaration(node)) {
    const module = node.moduleSpecifier?.getText(sourceFile) ?? '<local>';
    const names = node.exportClause?.getText(sourceFile) ?? '*';
    return `export ${names} from ${module}`;
  }
  if (ts.isExportAssignment(node)) return 'export default';

  return null;
};

const declarationKind = (node) => {
  if (ts.isFunctionDeclaration(node)) return 'function';
  if (ts.isClassDeclaration(node)) return 'class';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isModuleDeclaration(node)) return 'module';
  if (ts.isVariableStatement(node)) return 'variable';
  if (ts.isExportDeclaration(node)) return 're-export';
  if (ts.isExportAssignment(node)) return 'default-export';

  return 'other';
};

const isExported = (node) =>
  !!node.modifiers?.some(
    (modifier) =>
      modifier.kind === ts.SyntaxKind.ExportKeyword ||
      modifier.kind === ts.SyntaxKind.DefaultKeyword
  ) ||
  ts.isExportDeclaration(node) ||
  ts.isExportAssignment(node);

const declarationsFor = (file, source) => {
  const scriptKind = file.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );
  const concepts = conceptsFor(file);
  const declarations = [];

  for (const statement of sourceFile.statements) {
    const name = declarationName(statement, sourceFile);
    if (!name) continue;
    const start = sourceFile.getLineAndCharacterOfPosition(
      statement.getStart()
    );
    declarations.push({
      concepts,
      exported: isExported(statement),
      kind: declarationKind(statement),
      line: start.line + 1,
      name,
    });
  }

  return declarations;
};

const packageDirectories = fs
  .readdirSync(path.join(root, 'packages'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const platePackages = packageDirectories.filter(
  (name) => !name.startsWith('plite')
);
const scopedFiles = [];

for (const packageName of platePackages) {
  const packageRoot = path.join(root, 'packages', packageName);
  const packageJson = path.join(packageRoot, 'package.json');
  if (exists(packageJson)) scopedFiles.push(packageJson);

  for (const directory of ['src', 'test', 'type-tests']) {
    scopedFiles.push(
      ...walk(path.join(packageRoot, directory), (file) =>
        /\.[cm]?[jt]sx?$/.test(file)
      )
    );
  }
}

scopedFiles.push(
  ...walk(path.join(root, 'apps/www/src/registry'), (file) =>
    /\.[cm]?[jt]sx?$/.test(file)
  ),
  ...walk(path.join(root, 'apps/www/src/__tests__'), (file) =>
    /\.[cm]?[jt]sx?$/.test(file)
  ),
  ...walk(path.join(root, 'content/docs'), (file) => /\.mdx?$/.test(file))
);

const files = unique(scopedFiles.map(relative)).map((file) => {
  const absolute = path.join(root, file);
  const source = fs.readFileSync(absolute, 'utf8');
  const exclusion = excludedReason(file);
  const packageJson = file.endsWith('/package.json');
  const concepts = exclusion ? [] : conceptsFor(file);
  const packageMetadata = packageJson
    ? (() => {
        const value = JSON.parse(source);

        return {
          exports:
            value.exports && typeof value.exports === 'object'
              ? Object.keys(value.exports).sort()
              : [],
          name: value.name ?? null,
        };
      })()
    : null;

  return {
    bytes: Buffer.byteLength(source),
    concepts,
    declarations:
      exclusion || packageJson || /\.mdx?$/.test(file)
        ? []
        : declarationsFor(file, source),
    exclusion,
    kind: packageJson
      ? 'package'
      : /\.mdx?$/.test(file)
        ? 'documentation'
        : isProofPath(file)
          ? 'proof'
          : file.startsWith('apps/www/src/registry/')
            ? 'product'
            : 'source',
    lines: source.split(/\r?\n/).length,
    package: packageMetadata,
    path: file,
    sha256: crypto.createHash('sha256').update(source).digest('hex'),
  };
});

const includedFiles = files.filter((file) => !file.exclusion);
const declarations = includedFiles.flatMap((file) => file.declarations);
const sourceLines = (file) => {
  const absolute = path.join(root, file);

  return fs.existsSync(absolute)
    ? fs.readFileSync(absolute, 'utf8').split(/\r?\n/)
    : [];
};
const countLineMatches = (paths, pattern, accept = () => true) =>
  paths.reduce(
    (count, file) =>
      count +
      sourceLines(file).filter(
        (line, index) => pattern.test(line) && accept(file, line, index + 1)
      ).length,
    0
  );
const productionOptionMutations = includedFiles
  .filter((file) => file.kind === 'product' || file.kind === 'source')
  .flatMap((file) =>
    sourceLines(file.path).flatMap((line, index) =>
      /\bsetOptions?\s*\(/.test(line)
        ? [{ file: file.path, line: index + 1 }]
        : []
    )
  );
const priorityTypePaths = [
  'packages/core/src/lib/plugin/BasePlugin.ts',
  'packages/core/src/lib/plugin/PluginConfig.ts',
  'packages/plite/src/interfaces/editor.ts',
];
const priorityConsumerPaths = [
  'packages/core/src/internal/plugin/resolvePlugins.ts',
  'packages/core/src/internal/plugin/compilePlateHtmlCodec.ts',
  'packages/core/src/internal/plugin/compilePlateCodecs.ts',
  'packages/plite/src/core/editor-extension.ts',
];
const queryReadPaths = [
  'packages/plite/src/core/editor-query-runtime.ts',
  'packages/plite/src/core/public-state.ts',
  'packages/plite/src/core/query-middleware.ts',
];
const queryRegistrationPaths = [
  'packages/core/src/lib/plugins/override/OverridePlugin.ts',
  'packages/diff/src/lib/excludeDiffFromFragment.ts',
  'packages/table/src/lib/BaseTablePlugin.ts',
  'packages/toggle/src/react/TogglePlugin.tsx',
];
const markClearPaths = [
  'packages/plite/src/interfaces/editor.ts',
  'packages/plite/src/editor/toggle-mark.ts',
  'packages/plite/src/core/editor-commands.ts',
  'packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts',
  'packages/basic-nodes/src/lib/BaseSuperscriptPlugin.ts',
  'packages/utils/src/react/hooks/useMarkToolbarButton.ts',
];
const orderedCorrectionPaths = [
  'packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts',
  'packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts',
  'packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts',
  'packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts',
];
const pressure = {
  globalPriority: {
    conceptualPublicScalars: 2,
    consumptionSites: countLineMatches(
      priorityConsumerPaths,
      /(?:\bplugin\??\.priority|\bownerPlugin\.priority|\b(?:a|b)\.resolved\.priority|\bextension\.priority)/
    ),
    repeatedTypeDeclarations: countLineMatches(
      priorityTypePaths,
      /\bpriority\??:\s*number;/
    ),
  },
  mixedPluginOptions: {
    contextAndPortalMethods: 4,
    mutationFiles: new Set(productionOptionMutations.map(({ file }) => file))
      .size,
    mutationLines: productionOptionMutations.length,
    reactHookNames: 4,
  },
  mutualMarkClear: {
    files: markClearPaths.length,
    occurrences: countLineMatches(
      markClearPaths,
      /\bclear\b/,
      (file, line) =>
        file !== 'packages/plite/src/interfaces/editor.ts' ||
        /clear\?: string\[\] \| string/.test(line)
    ),
  },
  orderedContentPressure: {
    activeCorrectionEntries: countLineMatches(
      orderedCorrectionPaths,
      /\bevent:\s*'(?:children|content)'/
    ),
    activeCorrectionOwners: orderedCorrectionPaths.length,
    legacyListModelPositionalAssumptions: countLineMatches(
      ['packages/platejs/src/features/list/src/lib/BaseListPlugin.ts'],
      /concat\(0\)|concat\(\[1\]\)|concat\(1\)|children\[0\]|children\[1\]|\[\.\.\.liPath, 1(?:, 0)?\]/
    ),
  },
  queryMiddleware: {
    executionOwnerLines: 0,
    exportedTypes: 0,
    plateRegistrationFiles: queryRegistrationPaths.filter((file) =>
      fs.existsSync(path.join(root, file))
    ).length,
    plateRegistrations: countLineMatches(queryRegistrationPaths, /\bqueries:/),
    wrapperCalls: countLineMatches(
      queryReadPaths,
      /\bexecuteQueryMiddleware\(/
    ),
    overridableMethods: 0,
  },
};
const summary = {
  bytes: files.reduce((sum, file) => sum + file.bytes, 0),
  declarations: declarations.length,
  excludedFiles: files.length - includedFiles.length,
  exportedDeclarations: declarations.filter((item) => item.exported).length,
  files: files.length,
  includedFiles: includedFiles.length,
  kinds: Object.fromEntries(
    unique(files.map((file) => file.kind)).map((kind) => [
      kind,
      files.filter((file) => file.kind === kind).length,
    ])
  ),
  lines: files.reduce((sum, file) => sum + file.lines, 0),
  packages: platePackages.length,
  publicPackages: platePackages.filter((packageName) =>
    exists(path.join(root, 'packages', packageName, 'package.json'))
  ).length,
  targetPublicPackages: files.filter(
    (file) => file.kind === 'package' && !file.exclusion
  ).length,
};

const manifest = {
  conceptIds,
  generatedAt: new Date().toISOString(),
  pressure,
  repositoryHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  scope: {
    exclusions: [
      {
        path: 'packages/plite*/**',
        reason:
          'Plite substrate is mapped by the parallel Plite lane; Plate dependencies on it remain mapped here.',
      },
      {
        path: 'templates/**',
        reason: 'CI-generated output; registry source is authoritative.',
      },
      {
        path: 'apps/www/src/generated/**',
        reason: 'Generated website artifacts, not architecture owners.',
      },
      {
        path: 'apps/plite/**',
        reason:
          'Plite browser proof is mapped by the parallel Plite/proof lane; Plate registry sources remain in scope.',
      },
      {
        path: 'packages/udecode/**',
        reason:
          'Generic udecode utility workspaces are not Plate editor architecture owners.',
      },
    ],
    roots: [
      'packages/<non-plite>/{package.json,src/**,test/**,type-tests/**}',
      'apps/www/src/registry/**',
      'apps/www/src/__tests__/**',
      'content/docs/**',
    ],
  },
  summary,
  files,
};

fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
