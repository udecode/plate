#!/usr/bin/env node
// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// gate uses the stable TypeScript 6 API.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const CONTROL = 'packages/plitejs/type-tests/plite-call-parity.tsx';
const LEDGER = 'tooling/scripts/plite-call-parity.json';
const CONFIG = 'tooling/config/tsconfig.type-tests.json';
const WALKTHROUGHS = 'content/docs/plite/walkthroughs';
const CITABLE = [
  'content/docs/plite/',
  'packages/plitejs/README.md',
  'apps/www/src/app/(app)/examples/plite/',
];

const MARKER =
  /^\s*(?:\/\/|\{?\/\*)\s*(?:case ([A-Za-z][\w-]*):\s*(.*?)\s*(?:\*\/\}?)?|shared)\s*$/u;
const CITATION = /([\w./()-]+\.(?:mdx?|tsx?)):(\d+)(?:-(\d+))?/gu;
const FENCE = /^\s*```(\S*)/u;
const CODE_FENCE = /^(?:[jt]sx?|typescript|javascript)$/u;

export const readPairs = (repoRoot) => {
  const entries = (name) =>
    Object.keys(
      JSON.parse(
        readFileSync(
          path.join(repoRoot, 'packages', name, 'package.json'),
          'utf-8'
        )
      ).exports
    ).filter((key) => key !== './package.json');
  const plate = new Set(entries('platejs'));
  return entries('plitejs')
    .filter((key) => plate.has(key))
    .map((key) => [
      path.posix.join('plitejs', key),
      path.posix.join('platejs', key),
    ]);
};

const readCases = (text) => {
  const lineCase = [];
  const sources = new Map();
  const duplicates = [];
  let current = null;

  for (const line of text.split('\n')) {
    const match = MARKER.exec(line);
    if (match) {
      current = match[1] ?? null;
      if (current && sources.has(current)) duplicates.push(current);
      else if (current) sources.set(current, match[2]);
    }
    lineCase.push(current);
  }

  return { duplicates, lineCase, sources };
};

const plateCopy = (sourceFile, twins) => {
  const edits = [];
  for (const statement of sourceFile.statements) {
    const specifier =
      (ts.isImportDeclaration(statement) ||
        ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier;
    if (
      specifier &&
      ts.isStringLiteral(specifier) &&
      twins.has(specifier.text)
    ) {
      edits.push([
        specifier.getStart(sourceFile) + 1,
        specifier.end - 1,
        twins.get(specifier.text),
      ]);
    }
  }

  let { text } = sourceFile;
  for (const [start, end, replacement] of edits.reverse()) {
    text = text.slice(0, start) + replacement + text.slice(end);
  }
  return text;
};

const resolveAlias = (checker, symbol) =>
  symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;

const message = (diagnostic) =>
  ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');

const lineOf = (diagnostic) =>
  diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line;

const pointedText = (diagnostic) =>
  diagnostic.file.text
    .slice(diagnostic.start, diagnostic.start + diagnostic.length)
    .split('\n')[0]
    .trim()
    .slice(0, 40)
    .replaceAll('"', "'");

const errorKey = (diagnostic) =>
  `TS${diagnostic.code} ${pointedText(diagnostic)}: ${ts
    .flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    .split('\n')
    .map((line) => line.trim())
    .join(' ')}`;

const hasDeclare = (node) =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some(
    (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword
  );

const typesBuiltValue = (reference) => {
  for (let node = reference; node; node = node.parent) {
    if (hasDeclare(node)) return false;
    if (ts.isVariableDeclaration(node)) {
      const { initializer } = node;
      return Boolean(
        initializer &&
        initializer.kind !== ts.SyntaxKind.NullKeyword &&
        !(ts.isIdentifier(initializer) && initializer.text === 'undefined')
      );
    }
  }
  return true;
};

const checksName = (node) => {
  const { parent } = node;
  if (ts.isCallExpression(parent) || ts.isNewExpression(parent)) {
    return parent.expression === node;
  }
  if (ts.isJsxOpeningElement(parent) || ts.isJsxSelfClosingElement(parent)) {
    return parent.tagName === node;
  }
  if (ts.isTypeReferenceNode(parent)) {
    return parent.typeName === node && typesBuiltValue(parent);
  }
  return false;
};

const readCitations = (source) =>
  [...source.matchAll(CITATION)].map(([, file, start, end]) => ({
    end: Number(end ?? start),
    file: path.posix.normalize(file),
    start: Number(start),
  }));

const callsAny = (text, names) =>
  [...names].some((used) => new RegExp(`\\b${used}\\b`, 'u').test(text));

const nearestCalling = (lines, { end, start }, names) => {
  for (let shift = 1; shift < lines.length; shift += 1) {
    for (const from of [start - shift, start + shift]) {
      const to = from + end - start;
      if (
        from >= 1 &&
        to <= lines.length &&
        callsAny(lines.slice(from - 1, to).join('\n'), names)
      ) {
        return `${from}-${to}`;
      }
    }
  }
  return null;
};

const fenceUses = (text, names) => {
  const code = ts.createSourceFile(
    'fence.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const uses = new Map();
  const visit = (node) => {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node) && names.has(node.text)) {
      const { line } = code.getLineAndCharacterOfPosition(node.getStart(code));
      if (!uses.has(line)) uses.set(line, node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(code);
  return uses;
};

const walkthroughCalls = (repoRoot, names) => {
  const calls = [];
  const directory = path.join(repoRoot, WALKTHROUGHS);
  for (const page of readdirSync(directory).sort()) {
    if (!page.endsWith('.mdx') || page.endsWith('.cn.mdx')) continue;
    const file = path.posix.join(WALKTHROUGHS, page);
    const lines = readFileSync(path.join(directory, page), 'utf-8').split('\n');
    let open = null;
    lines.forEach((line, index) => {
      const fence = FENCE.exec(line);
      if (!fence) return;
      if (!open) {
        open = { code: CODE_FENCE.test(fence[1]), first: index + 1 };
        return;
      }
      if (open.code) {
        const text = lines.slice(open.first, index).join('\n');
        for (const [at, name] of fenceUses(text, names)) {
          calls.push({ file, line: open.first + 1 + at, name });
        }
      }
      open = null;
    });
  }
  return calls;
};

const readExports = (checker, modules, pairs) => {
  const valueNames = (entry) =>
    new Set(
      checker
        .getPropertiesOfType(checker.getTypeOfSymbol(modules.get(entry)))
        .map((symbol) => symbol.name)
    );
  const rebound = new Map();
  const drops = new Map();
  const pairKeys = new Map();
  for (const [lite, plate] of pairs) {
    const plateExports = new Map(
      checker
        .getExportsOfModule(modules.get(plate))
        .map((symbol) => [symbol.name, symbol])
    );
    const liteValues = valueNames(lite);
    const plateValues = valueNames(plate);
    const dropped = [];
    for (const symbol of checker.getExportsOfModule(modules.get(lite))) {
      const twin = plateExports.get(symbol.name);
      if (
        !twin ||
        (liteValues.has(symbol.name) && !plateValues.has(symbol.name))
      ) {
        dropped.push(symbol.name);
        continue;
      }
      const liteTarget = resolveAlias(checker, symbol);
      const plateTarget = resolveAlias(checker, twin);
      if (liteTarget === plateTarget) continue;
      if (!pairKeys.has(liteTarget)) pairKeys.set(liteTarget, new Map());
      const byPlate = pairKeys.get(liteTarget);
      if (!byPlate.has(plateTarget)) {
        byPlate.set(plateTarget, `${plate}#${symbol.name}`);
      }
      rebound.set(`${lite}#${symbol.name}`, {
        key: byPlate.get(plateTarget),
        name: symbol.name,
      });
    }
    drops.set(
      lite,
      dropped.sort((a, b) => a.localeCompare(b))
    );
  }
  return { drops, rebound };
};

const checkDrops = (drops, ledger, twins) => {
  const problems = [];
  const recorded = ledger.dropped ?? {};
  for (const [lite, names] of drops) {
    const known = new Set(recorded[lite]);
    if (known.size !== (recorded[lite] ?? []).length) {
      problems.push(`${LEDGER}: dropped["${lite}"] lists a name twice`);
    }
    for (const name of names) {
      if (!known.has(name)) {
        problems.push(
          `${twins.get(lite)} drops ${name}, or exports only its type, where ${lite} exports it. Export it from ${twins.get(lite)}, or add it to dropped["${lite}"] in ${LEDGER}.`
        );
      }
    }
    for (const name of known) {
      if (!names.includes(name)) {
        problems.push(
          `${LEDGER}: dropped["${lite}"] lists ${name}, and ${twins.get(lite)} exports it as ${lite} does. Delete it.`
        );
      }
    }
  }
  for (const lite of Object.keys(recorded)) {
    if (!drops.has(lite)) {
      problems.push(
        `${LEDGER}: dropped["${lite}"] names an entrypoint the two packages do not share. Delete it.`
      );
    }
  }
  return problems;
};

export function checkPliteCallParity({
  compilerOptions,
  controlFile,
  ledger,
  pairs,
  repoRoot,
}) {
  const problems = [];
  const fatal = [];
  const relative = (file) => path.relative(repoRoot, file);
  const twins = new Map(pairs);
  const { dir, ext, name: base } = path.parse(controlFile);
  const plateFile = path.join(dir, `${base}.plate${ext}`);
  const censusFile = path.join(dir, `${base}.census.ts`);
  const controlText = readFileSync(controlFile, 'utf-8');
  const control = ts.createSourceFile(
    controlFile,
    controlText,
    ts.ScriptTarget.Latest,
    true
  );
  const virtual = new Map([
    [plateFile, plateCopy(control, twins)],
    [
      censusFile,
      pairs
        .flat()
        .map(
          (specifier, index) => `import * as m${index} from '${specifier}';\n`
        )
        .join(''),
    ],
  ]);

  const options = { ...compilerOptions, noEmit: true };
  const host = ts.createCompilerHost(options);
  host.getCurrentDirectory = () => repoRoot;
  const readFile = host.readFile.bind(host);
  host.readFile = (file) => virtual.get(file) ?? readFile(file);

  const program = ts.createProgram(
    [controlFile, plateFile, censusFile],
    options,
    host
  );
  const checker = program.getTypeChecker();

  for (const diagnostic of [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
  ]) {
    fatal.push(`compiler: ${message(diagnostic)}`);
  }

  const modules = new Map();
  for (const statement of program.getSourceFile(censusFile).statements) {
    const symbol = checker.getSymbolAtLocation(statement.moduleSpecifier);
    if (symbol) modules.set(statement.moduleSpecifier.text, symbol);
    else {
      fatal.push(
        `${statement.moduleSpecifier.text}: the compiler did not resolve this entrypoint`
      );
    }
  }
  if (fatal.length > 0) return { fatal, problems };

  const { drops, rebound } = readExports(checker, modules, pairs);
  problems.push(...checkDrops(drops, ledger, twins));

  const { duplicates, lineCase, sources } = readCases(controlText);
  for (const id of duplicates) {
    problems.push(`case ${id}: the control declares it twice`);
  }
  const label = (id) => `case ${id} (${sources.get(id)})`;

  const covered = new Set();
  const caseNames = new Map([...sources.keys()].map((id) => [id, new Set()]));
  const markCovered = (node) => {
    const id =
      ts.isIdentifier(node) &&
      lineCase[
        control.getLineAndCharacterOfPosition(node.getStart(control)).line
      ];
    if (id && checksName(node)) {
      const symbol = checker.getSymbolAtLocation(node);
      const specifier = symbol?.declarations?.find(ts.isImportSpecifier);
      if (specifier) {
        const importDeclaration = specifier.parent.parent.parent;
        const imported = (specifier.propertyName ?? specifier.name).text;
        const entry = rebound.get(
          `${importDeclaration.moduleSpecifier.text}#${imported}`
        );
        if (entry) {
          covered.add(entry.key);
          caseNames.get(id)?.add(imported);
        }
      }
    }
    ts.forEachChild(node, markCovered);
  };
  markCovered(program.getSourceFile(controlFile));

  const unproven = new Map();
  for (const [liteKey, entry] of rebound) {
    if (covered.has(entry.key)) continue;
    if (!unproven.has(entry.name)) unproven.set(entry.name, []);
    unproven.get(entry.name).push(liteKey.split('#')[0]);
  }
  const reasons = new Map();
  for (const row of ledger.unproven ?? []) {
    if (reasons.has(row.name)) {
      problems.push(`${LEDGER}: unproven ${row.name} has two rows`);
    }
    reasons.set(row.name, row);
  }
  for (const [name, entrypoints] of unproven) {
    const row = reasons.get(name);
    if (!row) {
      problems.push(
        `Plate binds ${name} from ${entrypoints.join(' and ')} its own way, and no case calls, renders or types a value with Plite's ${name}. Add a documented call to ${CONTROL}, or give the reason in ${LEDGER}'s unproven list.`
      );
    } else if (
      JSON.stringify(
        [...(row.entrypoints ?? [])].sort((a, b) => a.localeCompare(b))
      ) !== JSON.stringify([...entrypoints].sort((a, b) => a.localeCompare(b)))
    ) {
      problems.push(
        `${LEDGER}: unproven ${name} names ${JSON.stringify(row.entrypoints ?? [])}, and Plate binds it its own way from ${JSON.stringify(entrypoints)}. Name exactly the entrypoints its reason covers.`
      );
    } else if (typeof row.reason !== 'string' || row.reason.trim() === '') {
      problems.push(`${LEDGER}: unproven ${name} gives no reason`);
    }
  }
  for (const name of reasons.keys()) {
    if (!unproven.has(name)) {
      problems.push(
        `${LEDGER}: unproven ${name} is stale, because a case uses it now or Plate no longer binds it its own way. Delete its row.`
      );
    }
  }

  const cited = new Map();
  for (const [id, source] of sources) {
    const names = caseNames.get(id);
    if (names.size === 0) {
      problems.push(
        `${label(id)}: the case calls, renders and types no name Plate binds its own way. Delete it, or make it use one.`
      );
    }
    const citations = readCitations(source);
    if (citations.length === 0) {
      problems.push(
        `${label(id)}: the case cites no docs lines. Write its marker as // case ${id}: <file>:<line> or <file>:<start>-<end>, naming each call it copies from a file under ${CITABLE.join(' or ')}.`
      );
    }
    for (const citation of citations) {
      const { file } = citation;
      const absolute = path.join(repoRoot, file);
      const lines =
        CITABLE.some((prefix) => file.startsWith(prefix)) &&
        existsSync(absolute)
          ? readFileSync(absolute, 'utf-8').split('\n')
          : null;
      const quoted = lines?.slice(citation.start - 1, citation.end).join('\n');
      if (!lines || citation.end > lines.length) {
        problems.push(
          `${label(id)}: ${file}:${citation.start}-${citation.end} is not a line range of a file under ${CITABLE.join(' or ')}`
        );
      } else if (!callsAny(quoted, names)) {
        const moved = nearestCalling(lines, citation, names);
        problems.push(
          `${label(id)}: ${file}:${citation.start}-${citation.end} calls none of ${JSON.stringify([...names])}, which the case uses${moved ? `; ${file}:${moved} is the nearest range that does, so cite it when a docs edit moved the snippet` : ''}`
        );
      }
      if (!cited.has(file)) cited.set(file, []);
      cited.get(file).push(citation);
    }
  }
  const changedNames = new Set([
    ...[...rebound.values()].map((entry) => entry.name),
    ...[...drops.values()].flat(),
  ]);
  for (const call of walkthroughCalls(repoRoot, changedNames)) {
    const covering = (cited.get(call.file) ?? []).some(
      ({ end, start }) => start <= call.line && call.line <= end
    );
    if (!covering) {
      problems.push(
        `${call.file}:${call.line}: the walkthrough uses ${call.name}, and no case cites the line. Copy the call into ${CONTROL} as a case that cites it.`
      );
    }
  }

  for (const diagnostic of [
    ...program.getSyntacticDiagnostics(program.getSourceFile(controlFile)),
    ...program.getSemanticDiagnostics(program.getSourceFile(controlFile)),
  ]) {
    problems.push(
      `${relative(controlFile)}:${lineOf(diagnostic) + 1}: the Plite control does not compile: TS${diagnostic.code} ${message(diagnostic)}`
    );
  }

  const refusals = new Map();
  for (const diagnostic of [
    ...program.getSyntacticDiagnostics(program.getSourceFile(plateFile)),
    ...program.getSemanticDiagnostics(program.getSourceFile(plateFile)),
  ]) {
    const line = lineOf(diagnostic);
    const id = lineCase[line];
    if (!id) {
      problems.push(
        `${relative(controlFile)}:${line + 1}: Plate refuses a line no case owns: TS${diagnostic.code} ${message(diagnostic)}. Move the line under its case's // case <id>: <file>:<line> marker, not under // shared.`
      );
      continue;
    }
    if (!refusals.has(id)) refusals.set(id, []);
    refusals.get(id).push({
      key: errorKey(diagnostic),
      line: line + 1,
      text: message(diagnostic),
    });
  }

  const rows = new Map();
  for (const row of ledger.refused ?? []) {
    if (rows.has(row.case)) {
      problems.push(`${LEDGER}: case ${row.case} has two rows`);
    }
    rows.set(row.case, row);
    if (!sources.has(row.case)) {
      problems.push(`${LEDGER}: case ${row.case} is not a case of ${CONTROL}`);
    }
    if (typeof row.removedBy !== 'string' || row.removedBy.trim() === '') {
      problems.push(
        `${LEDGER}: case ${row.case} names no step or phase that removes it`
      );
    }
  }

  const list = (keys) =>
    JSON.stringify([...keys].sort((a, b) => a.localeCompare(b)));
  for (const id of new Set([...refusals.keys(), ...rows.keys()])) {
    if (!sources.has(id)) continue;
    const found = refusals.get(id) ?? [];
    const row = rows.get(id);
    const actual = list(found.map(({ key }) => key));
    const first = found[0] && `line ${found[0].line}: ${found[0].text}`;
    if (!row) {
      problems.push(
        `${label(id)}: Plate refuses it with ${actual}, and ${LEDGER} has no row for it. Make Plate take the call, or record it with the step or phase that removes it. First error at ${first}`
      );
    } else if (found.length === 0) {
      problems.push(
        `${label(id)}: Plate takes the call now, so its row in ${LEDGER} is stale. Delete the row.`
      );
    } else if (actual !== list(row.errors)) {
      problems.push(
        `${label(id)}: ${LEDGER} expects ${list(row.errors)}, and Plate gives ${actual}. First error at ${first}`
      );
    }
  }

  return {
    fatal,
    problems,
    summary: `${sources.size} cases, ${rebound.size} rebound and ${[...drops.values()].flat().length} dropped names, ${rows.size} refused cases recorded`,
  };
}

const readCompilerOptions = (repoRoot) => {
  const configPath = path.join(repoRoot, CONFIG);
  const { config, error } = ts.readConfigFile(configPath, (file) =>
    ts.sys.readFile(file)
  );
  if (error) throw new Error(message(error));
  const parsed = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(configPath)
  );
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.map(message).join('\n'));
  }
  return parsed.options;
};

const main = () => {
  const repoRoot = path.resolve(import.meta.dirname, '../..');
  const controlFile = path.join(repoRoot, CONTROL);
  if (!existsSync(controlFile)) {
    console.error(
      `${CONTROL} is missing. It lives in the private half, so attach plate-private first.`
    );
    process.exitCode = 2;
    return;
  }

  const { fatal, problems, summary } = checkPliteCallParity({
    compilerOptions: readCompilerOptions(repoRoot),
    controlFile,
    ledger: JSON.parse(readFileSync(path.join(repoRoot, LEDGER), 'utf-8')),
    pairs: readPairs(repoRoot),
    repoRoot,
  });

  if (fatal.length > 0) {
    console.error(fatal.join('\n'));
    process.exitCode = 2;
  } else if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`plite-call-parity: ${summary}`);
  }
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
