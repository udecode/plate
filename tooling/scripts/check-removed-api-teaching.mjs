import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { byCodeUnit, grepFiles, showAt } from './private-files.mjs';
import { generatedPrefixes, releaseNotePrefixes } from './teaching-sweep.mjs';

// TypeScript 7 exposes its parser only under `typescript/unstable/*`, so this
// script uses the pinned TypeScript 6 compiler API.
const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const manifestPath = 'apps/www/src/generated/api-reference-manifest.json';
const notAfterScopeOrPath = '(^|[^@A-Za-z0-9_./-])';
const notBeforeLongerPath = '($|[^A-Za-z0-9_/-])';
const memberPattern = /^\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*[(:<]/gmu;
const wordPattern = /[A-Za-z_$][\w$]*/gu;

const teachingPaths = [
  '.agents/playbooks',
  '.agents/rules',
  'AGENTS.md',
  'CODING_STANDARDS.md',
  'README.md',
  'VISION.md',
  'apps',
  'content/docs',
  'docs/development',
  'docs/editor-behavior',
  'docs/plans/topics',
  'docs/research/sources',
  'packages',
];
const pathspecs = [
  ...teachingPaths,
  ...[...generatedPrefixes, ...releaseNotePrefixes].map(
    (p) => `:(exclude)${p}`
  ),
  ':(exclude,glob)**/CHANGELOG.md',
  ':(exclude,glob)packages/*/type-tests/**',
];
const intentionalMentionsOfCutMembers = [
  'apps',
  'content/docs/migration',
  'content/docs/plite/to-plate.mdx',
  'content/docs/plite/to-plate.cn.mdx',
  'docs/plans/topics',
];
const memberPathspecs = [
  ...pathspecs,
  ...intentionalMentionsOfCutMembers.map((path) => `:(exclude)${path}`),
];
const rule3AndProseExemptPrefixes = [
  'apps/',
  'content/docs/migration/',
  'content/docs/plite/',
  'docs/plans/topics/',
  'docs/research/sources/',
  'packages/plitejs/',
];
const isMarkdownFile = (file) => /\.(?:md|mdc|mdx)$/iu.test(file);
const isCodeFile = (file) => /\.(?:[cm]?[jt]sx?)$/iu.test(file);
const isProseHit = (hit) => /^[^:]+\.(md|mdc|mdx):/u.test(hit);
const isCompoundName = (name) => /[a-z0-9][A-Z]|[A-Z]{2}[a-z]|_/u.test(name);
const isRule3AndProseExempt = (file) =>
  rule3AndProseExemptPrefixes.some((prefix) => file.startsWith(prefix));
const sourcePathspecs = [
  'apps',
  'packages',
  ...generatedPrefixes.map((prefix) => `:(exclude)${prefix}`),
  ':(exclude,glob)**/*.md',
  ':(exclude,glob)**/*.mdx',
];
const codeFenceLangs = new Set([
  'cjs',
  'cts',
  'javascript',
  'js',
  'jsx',
  'mjs',
  'mts',
  'ts',
  'tsx',
  'typescript',
]);
const codeLeadPattern =
  /^\s*(?:import(?:\s|[{*'"])|export(?:\s|[{*])|type\s+[A-Za-z_$]|interface\s+[A-Za-z_$]|declare\s+|(?:const|let|var)\s+[A-Za-z_${[]|function\s|class\s|enum\s|typeof\s+import\s*\()/u;

const K = ts.SyntaxKind;
const nonRefParentKinds = new Set([
  K.ImportSpecifier,
  K.ExportSpecifier,
  K.ImportClause,
  K.NamespaceImport,
  K.NamespaceExport,
  K.JsxClosingElement,
]);
const namedDeclKinds = new Set([
  K.VariableDeclaration,
  K.FunctionDeclaration,
  K.ClassDeclaration,
  K.InterfaceDeclaration,
  K.TypeAliasDeclaration,
  K.EnumDeclaration,
  K.Parameter,
  K.TypeParameter,
  K.BindingElement,
  K.ImportEqualsDeclaration,
]);
const namedMemberKinds = new Set([
  ...namedDeclKinds,
  K.PropertyAssignment,
  K.PropertySignature,
  K.MethodSignature,
  K.MethodDeclaration,
  K.PropertyDeclaration,
  K.GetAccessor,
  K.SetAccessor,
  K.EnumMember,
  K.JsxAttribute,
]);
const labelKinds = new Set([
  K.LabeledStatement,
  K.BreakStatement,
  K.ContinueStatement,
]);

const scriptKindFor = (name, lang = '') => {
  const lower = (lang || name).toLowerCase();
  if (lower.endsWith('tsx') || lower === 'tsx') return ts.ScriptKind.TSX;
  if (lower.endsWith('jsx') || lower === 'jsx') return ts.ScriptKind.JSX;
  if (
    lower.endsWith('js') ||
    lower.endsWith('mjs') ||
    lower.endsWith('cjs') ||
    lower === 'javascript'
  ) {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
};

const parseSource = (name, text, kind) => {
  const sf = ts.createSourceFile(
    name,
    text,
    ts.ScriptTarget.Latest,
    true,
    kind
  );
  if (
    sf.parseDiagnostics.length > 0 &&
    kind !== ts.ScriptKind.TSX &&
    kind !== ts.ScriptKind.JSX
  ) {
    const jsxSf = ts.createSourceFile(
      name,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    if (jsxSf.parseDiagnostics.length < sf.parseDiagnostics.length) {
      return jsxSf;
    }
  }
  return sf;
};

const maskPreserveNewlines = (text, pattern) =>
  text.replace(pattern, (match) => match.replace(/[^\n]/gu, ' '));

const splitMarkdown = (text) => {
  const rawLines = text.split('\n');
  let startIndex = 0;
  if (rawLines[0] === '---') {
    const closeIndex = rawLines.indexOf('---', 1);
    if (closeIndex !== -1) startIndex = closeIndex + 1;
  }
  const codeFences = [];
  const outsideLines = [];
  let fence = null;
  for (let i = startIndex; i < rawLines.length; i += 1) {
    const line = rawLines[i];
    if (fence) {
      const closeMatch = /^ {0,3}(`{3,}|~{3,})[ \t]*$/u.exec(line);
      if (
        closeMatch &&
        closeMatch[1].startsWith(fence.char) &&
        closeMatch[1].length >= fence.len
      ) {
        if (codeFenceLangs.has(fence.lang)) {
          codeFences.push({
            lang: fence.lang,
            startLine: fence.startLine,
            text: fence.lines.join('\n'),
          });
        }
        fence = null;
      } else {
        fence.lines.push(line);
      }
      continue;
    }
    const openMatch = /^ {0,3}(`{3,}|~{3,})([^\n]*)$/u.exec(line);
    if (
      openMatch &&
      (!openMatch[1].startsWith('`') || !openMatch[2].includes('`'))
    ) {
      const lang = openMatch[2].trim().split(/\s+/u)[0]?.toLowerCase() ?? '';
      fence = {
        char: openMatch[1][0],
        lang,
        len: openMatch[1].length,
        lines: [],
        startLine: i + 1,
      };
      continue;
    }
    outsideLines.push({ lineIndex: i, text: line });
  }
  if (fence && codeFenceLangs.has(fence.lang)) {
    codeFences.push({
      lang: fence.lang,
      startLine: fence.startLine,
      text: fence.lines.join('\n'),
    });
  }
  return { codeFences, outsideLines, totalLines: rawLines.length };
};

const extractOutsideCodeAndProse = (file, outsideLines, totalLines) => {
  const lineMap = new Map(
    outsideLines.map((item) => [item.lineIndex, item.text])
  );
  const rawOutside = Array.from(
    { length: totalLines },
    (_, idx) => lineMap.get(idx) ?? ''
  ).join('\n');
  const maskedLines = maskPreserveNewlines(
    maskPreserveNewlines(rawOutside, /<!--[\s\S]*?-->/gu),
    /\{\/\*[\s\S]*?\*\/\}/gu
  ).split('\n');
  const codeBuffer = Array.from({ length: totalLines }, () => '');
  const proseLineIndices = [];
  const seenNamespaces = new Set();

  for (let i = 0; i < outsideLines.length;) {
    const { lineIndex } = outsideLines[i];
    const text = maskedLines[lineIndex];
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('//')) {
      i += 1;
      continue;
    }
    if (trimmed.startsWith('/*')) {
      let j = i;
      while (
        j < outsideLines.length &&
        !maskedLines[outsideLines[j].lineIndex].includes('*/')
      ) {
        j += 1;
      }
      i = Math.min(outsideLines.length, j + 1);
      continue;
    }
    const nsContinuation = [...seenNamespaces].some((ns) =>
      new RegExp(`^\\s*${ns}\\s*[.\\[]`, 'u').test(text)
    );
    if (codeLeadPattern.test(text) || nsContinuation) {
      let matchedEnd = -1;
      const limit = Math.min(outsideLines.length, i + 50);
      for (let j = i; j < limit; j += 1) {
        if (
          j > i &&
          outsideLines[j].lineIndex !== outsideLines[j - 1].lineIndex + 1
        ) {
          break;
        }
        const chunk = outsideLines
          .slice(i, j + 1)
          .map((item) => maskedLines[item.lineIndex])
          .join('\n');
        const sf = parseSource(file, chunk, ts.ScriptKind.TS);
        if (sf.parseDiagnostics.length === 0) {
          matchedEnd = j;
          for (const stmt of sf.statements) {
            if (
              ts.isImportDeclaration(stmt) &&
              stmt.importClause?.namedBindings &&
              ts.isNamespaceImport(stmt.importClause.namedBindings)
            ) {
              seenNamespaces.add(stmt.importClause.namedBindings.name.text);
            }
          }
          break;
        }
      }
      if (matchedEnd !== -1) {
        for (let k = i; k <= matchedEnd; k += 1) {
          const idx = outsideLines[k].lineIndex;
          codeBuffer[idx] = maskedLines[idx];
        }
        i = matchedEnd + 1;
        continue;
      }
    }
    proseLineIndices.push(lineIndex);
    i += 1;
  }
  return {
    codeText: codeBuffer.join('\n'),
    hasCode: codeBuffer.some(Boolean),
    maskedLines,
    proseLineIndices,
  };
};

const isReferenceIdentifier = (node) => {
  const { parent } = node;
  if (!parent || nonRefParentKinds.has(parent.kind)) return false;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
    return false;
  }
  if (ts.isQualifiedName(parent) && parent.right === node) return false;
  if (ts.isImportTypeNode(parent) && parent.qualifier === node) return false;
  if (namedMemberKinds.has(parent.kind) && parent.name === node) return false;
  if (labelKinds.has(parent.kind) && parent.label === node) return false;
  return true;
};

const collectDeclaredNames = (node, bound) => {
  const visit = (current) => {
    if (
      namedDeclKinds.has(current.kind) &&
      current.name &&
      ts.isIdentifier(current.name)
    ) {
      bound.add(current.name.text);
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
};

export const findRemovedApiTeaching = ({ base, cwd = process.cwd() }) => {
  const git = (args) =>
    spawnSync('git', args, {
      cwd,
      encoding: 'utf-8',
      maxBuffer: 256 * 1024 * 1024,
    });
  const root = git(['rev-parse', '--show-toplevel']).stdout.trim();
  const commit = git([
    'rev-parse',
    '--verify',
    '--quiet',
    `${base}^{commit}`,
  ]).stdout.trim();
  if (!commit) throw new Error(`cannot resolve the base commit ${base}`);

  const readBase = (path) => {
    const result = showAt(root, commit, path);
    return result.status === 0 ? result.stdout : null;
  };
  const readHead = (path) => {
    try {
      return readFileSync(join(root, path), 'utf-8');
    } catch {
      return null;
    }
  };
  const baseManifest = readBase(manifestPath);
  const headManifest = readHead(manifestPath);
  if (baseManifest === null || headManifest === null) {
    throw new Error(
      `${manifestPath} is missing ${baseManifest === null ? `at ${base}` : 'from the working tree'}`
    );
  }

  const publicNames = (manifest) => {
    const parsed = JSON.parse(manifest);
    const exportsByEntrypoint = new Map();
    const packages = new Set(Object.keys(parsed.packages));
    const symbols = [];
    for (const [pkgName, entry] of Object.entries(parsed.packages)) {
      for (const [key, sym] of Object.entries(entry.symbols)) {
        const entrypoint =
          sym.entrypoint ??
          (key.includes(':') ? key.slice(0, key.lastIndexOf(':')) : pkgName);
        symbols.push(sym);
        const names = exportsByEntrypoint.get(entrypoint) ?? new Set();
        names.add(sym.name);
        exportsByEntrypoint.set(entrypoint, names);
      }
    }
    return {
      exports: new Set(symbols.map(({ name }) => name)),
      exportsByEntrypoint,
      members: new Set(
        symbols.flatMap(({ signature = '' }) =>
          [...signature.matchAll(memberPattern)].map(([, member]) => member)
        )
      ),
      mentionedWords: new Set(
        symbols.flatMap(({ name, signature = '' }) => [
          name,
          ...(signature.match(wordPattern) ?? []),
        ])
      ),
      packages,
    };
  };
  const entrypoints = (read, directories) =>
    new Set(
      directories.flatMap((directory) => {
        const manifest = read(`packages/${directory}/package.json`);
        if (manifest === null) return [];
        const { exports = {}, name } = JSON.parse(manifest);
        return Object.keys(exports)
          .filter(
            (key) =>
              key.startsWith('./') &&
              !key.includes('*') &&
              key !== './package.json'
          )
          .map((key) => `${name}/${key.slice(2)}`);
      })
    );
  const baseDirectories = git([
    'ls-tree',
    '-d',
    '--name-only',
    commit,
    'packages/',
  ])
    .stdout.split('\n')
    .filter(Boolean)
    .map((path) => path.slice('packages/'.length));
  const headDirectories = readdirSync(join(root, 'packages'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const baseNames = publicNames(baseManifest);
  const headNames = publicNames(headManifest);
  const headEntrypoints = entrypoints(readHead, headDirectories);
  const specifiers = [...entrypoints(readBase, baseDirectories)]
    .filter((specifier) => !headEntrypoints.has(specifier))
    .sort((left, right) => left.localeCompare(right));

  const platePackages = new Set([...baseNames.packages, ...headNames.packages]);
  const isPlateEntrypoint = (specifier) =>
    platePackages.has(specifier) ||
    [...platePackages].some((pkg) => specifier.startsWith(`${pkg}/`));

  const removedByEntrypoint = new Map();
  for (const [entrypoint, baseSet] of baseNames.exportsByEntrypoint) {
    const headSet = headNames.exportsByEntrypoint.get(entrypoint);
    const removed = new Set([...baseSet].filter((name) => !headSet?.has(name)));
    if (removed.size > 0) removedByEntrypoint.set(entrypoint, removed);
  }
  const removedExports = new Set(
    [...removedByEntrypoint.values()].flatMap((set) => [...set])
  );
  const exports = [...removedExports];
  const compoundGone = new Set(
    exports.filter(
      (name) => isCompoundName(name) && !headNames.exports.has(name)
    )
  );
  const isRemovedFromEntrypoint = (specifier, name) =>
    isPlateEntrypoint(specifier) &&
    removedExports.has(name) &&
    !headNames.exportsByEntrypoint.get(specifier)?.has(name);

  const analyzeCode = (
    file,
    sourceFile,
    lineOffset,
    fileLines,
    exemptFromRule3
  ) => {
    const hits = [];
    const hitLines = new Set();
    const bound = new Set();
    const namespaces = new Map();
    const recordHit = (node) => {
      const line =
        lineOffset +
        sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
          .line +
        1;
      if (hitLines.has(line)) return;
      hitLines.add(line);
      hits.push(`${file}:${line}:${fileLines[line - 1] ?? ''}`);
    };

    for (const stmt of sourceFile.statements) {
      if (
        ts.isImportDeclaration(stmt) &&
        ts.isStringLiteral(stmt.moduleSpecifier)
      ) {
        const specifier = stmt.moduleSpecifier.text;
        const clause = stmt.importClause;
        if (!clause) continue;
        if (clause.name) {
          if (isRemovedFromEntrypoint(specifier, clause.name.text)) {
            recordHit(stmt);
          } else bound.add(clause.name.text);
        }
        if (clause.namedBindings) {
          if (ts.isNamespaceImport(clause.namedBindings)) {
            const ns = clause.namedBindings.name.text;
            namespaces.set(ns, specifier);
            bound.add(ns);
          } else if (ts.isNamedImports(clause.namedBindings)) {
            for (const element of clause.namedBindings.elements) {
              const imported = element.propertyName
                ? element.propertyName.text
                : element.name.text;
              if (isRemovedFromEntrypoint(specifier, imported)) recordHit(stmt);
              else bound.add(element.name.text);
            }
          }
        }
      } else if (
        ts.isExportDeclaration(stmt) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier) &&
        stmt.exportClause &&
        ts.isNamedExports(stmt.exportClause)
      ) {
        const specifier = stmt.moduleSpecifier.text;
        for (const element of stmt.exportClause.elements) {
          const exported = element.propertyName
            ? element.propertyName.text
            : element.name.text;
          if (isRemovedFromEntrypoint(specifier, exported)) recordHit(stmt);
        }
      }
    }

    collectDeclaredNames(sourceFile, bound);

    const visit = (node) => {
      if (
        ts.isPropertyAccessExpression(node) &&
        ts.isIdentifier(node.expression) &&
        namespaces.has(node.expression.text)
      ) {
        if (
          isRemovedFromEntrypoint(
            namespaces.get(node.expression.text),
            node.name.text
          )
        ) {
          recordHit(node);
        }
      } else if (
        ts.isElementAccessExpression(node) &&
        ts.isIdentifier(node.expression) &&
        namespaces.has(node.expression.text) &&
        node.argumentExpression &&
        ts.isStringLiteral(node.argumentExpression)
      ) {
        if (
          isRemovedFromEntrypoint(
            namespaces.get(node.expression.text),
            node.argumentExpression.text
          )
        ) {
          recordHit(node);
        }
      } else if (
        ts.isQualifiedName(node) &&
        ts.isIdentifier(node.left) &&
        namespaces.has(node.left.text)
      ) {
        if (
          isRemovedFromEntrypoint(
            namespaces.get(node.left.text),
            node.right.text
          )
        ) {
          recordHit(node);
        }
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal) &&
        node.qualifier
      ) {
        let { qualifier } = node;
        while (ts.isQualifiedName(qualifier)) qualifier = qualifier.left;
        if (
          ts.isIdentifier(qualifier) &&
          isRemovedFromEntrypoint(node.argument.literal.text, qualifier.text)
        ) {
          recordHit(node);
        }
      } else if (
        !exemptFromRule3 &&
        ts.isIdentifier(node) &&
        compoundGone.has(node.text) &&
        !bound.has(node.text) &&
        isReferenceIdentifier(node)
      ) {
        recordHit(node);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return { bound, hits };
  };

  const scanFile = (file) => {
    const text = readHead(file);
    if (text === null) return [];
    const fileLines = text.split('\n');
    const exempt = isRule3AndProseExempt(file);
    if (isMarkdownFile(file)) {
      const hits = [];
      const { codeFences, outsideLines, totalLines } = splitMarkdown(text);
      for (const fence of codeFences) {
        const sf = parseSource(
          file,
          fence.text,
          scriptKindFor(file, fence.lang)
        );
        hits.push(
          ...analyzeCode(file, sf, fence.startLine, fileLines, exempt).hits
        );
      }
      const { codeText, hasCode, maskedLines, proseLineIndices } =
        extractOutsideCodeAndProse(file, outsideLines, totalLines);
      let topLevelBound = new Set();
      if (hasCode) {
        const result = analyzeCode(
          file,
          parseSource(file, codeText, ts.ScriptKind.TS),
          0,
          fileLines,
          exempt
        );
        topLevelBound = result.bound;
        hits.push(...result.hits);
      }
      if (!exempt && compoundGone.size > 0) {
        for (const idx of proseLineIndices) {
          const words = maskedLines[idx].match(wordPattern) ?? [];
          if (words.some((w) => compoundGone.has(w) && !topLevelBound.has(w))) {
            hits.push(`${file}:${idx + 1}:${fileLines[idx]}`);
          }
        }
      }
      return hits;
    }
    if (isCodeFile(file)) {
      return analyzeCode(
        file,
        parseSource(file, text, scriptKindFor(file)),
        0,
        fileLines,
        exempt
      ).hits;
    }
    return [];
  };

  const grep = (flags, patterns, specs) =>
    patterns.length === 0
      ? []
      : grepFiles(
          root,
          [
            '-I',
            '--no-color',
            ...flags,
            ...patterns.flatMap((pattern) => ['-e', pattern]),
          ],
          specs
        )
          .split('\n')
          .filter(Boolean);
  const lines = ['-n', '--full-name'];
  const membersGoneFromApi = [...baseNames.members].filter(
    (name) =>
      isCompoundName(name) &&
      !removedExports.has(name) &&
      !headNames.mentionedWords.has(name)
  );
  const stillInSource = new Set(
    grep(['-o', '-h', '-w', '-F'], membersGoneFromApi, sourcePathspecs)
  );
  const members = membersGoneFromApi.filter((name) => !stillInSource.has(name));
  const names = [...new Set([...exports, ...members])].sort((left, right) =>
    left.localeCompare(right)
  );
  const candidateFiles = [
    ...new Set(grep(['-l', '-w', '-F'], exports, pathspecs)),
  ];
  const hits = [
    ...candidateFiles.flatMap(scanFile),
    ...grep([...lines, '-w', '-F'], members, memberPathspecs).filter(
      isProseHit
    ),
    ...grep(
      [...lines, '-E'],
      specifiers.map(
        (specifier) =>
          `${notAfterScopeOrPath}${specifier.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&')}${notBeforeLongerPath}`
      ),
      pathspecs
    ),
  ];
  return { hits: [...new Set(hits)].sort(byCodeUnit), names, specifiers };
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const base = process.env.PLATE_BASELINE_BASE || 'HEAD';
  let found;
  try {
    found = findRemovedApiTeaching({ base });
  } catch (error) {
    console.error(`[removed-api-teaching] ${error.message}`);
    process.exit(2);
  }
  const removed = [...found.names, ...found.specifiers];
  if (found.hits.length > 0) {
    console.error(
      `[removed-api-teaching] ${found.hits.length} lines still name an export or type member removed since ${base} (${removed.join(', ')}). Teach what replaced it, or delete the line:`
    );
    for (const hit of found.hits) console.error(`  ${hit.slice(0, 200)}`);
    process.exit(1);
  }
  console.info(
    `[removed-api-teaching] no teaching file names the ${removed.length} exports and type members removed since ${base}.`
  );
}
