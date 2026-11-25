#!/usr/bin/env node
// TypeScript 7 exposes its checker only under `typescript/unstable/*`, so this
// gate uses the stable TypeScript 6 API.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { NON_CODE_EXPORT, readPackageEntrypoints } from './export-targets.mjs';

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
const FENCE_OPEN = /^\s*(`{3,}(?!.*`)|~{3,})\s*([A-Za-z]*)/u;
const FENCE_CLOSE = /^\s*(`{3,}|~{3,})\s*$/u;
const fenceExtension = (word) =>
  /^(?:ts|typescript)$/iu.test(word)
    ? 'ts'
    : /^(?:jsx?|tsx|javascript)$/iu.test(word) && 'tsx';

export const readEntrypoints = (repoRoot) => {
  const problems = [];
  const sourceBySpecifier = new Map();
  for (const name of ['plitejs', 'platejs']) {
    const read = readPackageEntrypoints(path.join(repoRoot, 'packages', name));
    problems.push(...read.problems);
    for (const [specifier, source] of read.sourceBySpecifier) {
      sourceBySpecifier.set(specifier, source);
    }
  }
  const pairs = [...sourceBySpecifier.keys()]
    .filter((specifier) => /^plitejs(?:\/|$)/u.test(specifier))
    .map((lite) => {
      const plate = lite.replace(/^plitejs/u, 'platejs');
      return [lite, sourceBySpecifier.has(plate) ? plate : null];
    });
  return { pairs, problems, sourceBySpecifier };
};

const readCases = (text) => {
  const lineCase = [];
  const markers = new Map();
  const duplicates = [];
  let current = null;

  for (const line of text.split('\n')) {
    const match = MARKER.exec(line);
    if (match) {
      current = match[1] ?? null;
      if (current && markers.has(current)) duplicates.push(current);
      else if (current) markers.set(current, match[2]);
    }
    lineCase.push(current);
  }

  return { duplicates, lineCase, markers };
};

const packageOf = (specifier) => specifier.split('/')[0];

const plateCopy = (text, imports, twins) => {
  let copy = text;
  for (const { fileName, pos } of imports.toSorted((a, b) => b.pos - a.pos)) {
    if (twins.has(fileName)) {
      copy = `${copy.slice(0, pos + 1)}${twins.get(fileName)}${copy.slice(pos + 1 + fileName.length)}`;
    }
  }
  return copy;
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

const typeParameterCount = (symbols) =>
  Math.max(
    0,
    ...symbols.flatMap((symbol) =>
      (symbol.declarations ?? []).map(
        (declaration) => declaration.typeParameters?.length ?? 0
      )
    )
  );

const standInName = (index) => `StandIn${index}`;
const printedStandIns = (text) =>
  [...text.matchAll(/\bStandIn(\d+)\b/gu)].map(([, index]) => Number(index));

// A type argument to a non-generic stand-in errors on every use, so each
// stand-in takes the type parameters either package declares. `export *`
// carries no default, so the module names Plate's.
const standInModule = (specifier, bindings, keepsDefault) =>
  [
    `export * from '${specifier}';`,
    ...(keepsDefault ? [`export { default } from '${specifier}';`] : []),
    ...bindings.flatMap(({ count, index, name, type, typeOnly, value }) => {
      const standIn = standInName(index);
      const keepsPlateValue = typeOnly && value;
      const parameters = Array.from(
        { length: count },
        (_, at) => `T${at} = any`
      ).join(', ');
      const exported = type
        ? standIn
        : value
          ? `value${index}`
          : `space${index}`;
      return [
        ...(keepsPlateValue
          ? [`import type { ${name} as original${index} } from '${specifier}';`]
          : []),
        `declare const brand${index}: unique symbol;`,
        `type ${standIn}${count ? `<${parameters}>` : ''} = { readonly [brand${index}]: true };`,
        ...(value
          ? [
              `declare const ${exported}: ${keepsPlateValue ? `typeof original${index}` : standIn};`,
            ]
          : []),
        ...(type || value ? [] : [`declare namespace ${exported} {}`]),
        `export ${typeOnly || (type && !value) ? 'type ' : ''}{ ${exported} as ${name} };`,
      ];
    }),
  ].join('\n');

const caseErrors = (program, file, lineCase) => {
  const byCase = new Map();
  for (const diagnostic of program.getSemanticDiagnostics(
    program.getSourceFile(file)
  )) {
    const id = lineCase[lineOf(diagnostic)];
    if (!id) continue;
    if (!byCase.has(id)) byCase.set(id, []);
    byCase.get(id).push({
      site: `${diagnostic.start} TS${diagnostic.code}`,
      text: message(diagnostic),
    });
  }
  return byCase;
};

const errorSitesChanged = (base = [], errors = []) => {
  const left = new Map();
  for (const { site } of base) left.set(site, (left.get(site) ?? 0) + 1);
  const added = [];
  for (const error of errors) {
    const count = left.get(error.site) ?? 0;
    if (count > 0) left.set(error.site, count - 1);
    else added.push(error);
  }
  return {
    added,
    changed: added.length > 0 || [...left.values()].some((count) => count > 0),
  };
};

const pliteUse = (checker, node, twins) => {
  const { parent } = node;
  const declaration = (
    ts.isShorthandPropertyAssignment(parent) && parent.name === node
      ? checker.getShorthandAssignmentValueSymbol(parent)
      : checker.getSymbolAtLocation(node)
  )?.declarations?.[0];
  const entrypoint =
    declaration &&
    ts.findAncestor(declaration, ts.isImportDeclaration)?.moduleSpecifier.text;
  if (!twins.has(entrypoint)) return null;
  if (!ts.isNamespaceImport(declaration)) {
    return {
      member:
        ts.isPropertyAccessExpression(parent) && parent.expression === node
          ? parent.name.text
          : undefined,
      module: entrypoint,
      name: ts.isImportSpecifier(declaration)
        ? (declaration.propertyName ?? declaration.name).text
        : 'default',
      node,
    };
  }
  const member = ts.isPropertyAccessExpression(parent)
    ? parent.name
    : ts.isQualifiedName(parent) && parent.right;
  const call = member && parent.parent;
  return {
    member:
      call && ts.isPropertyAccessExpression(call) && call.expression === parent
        ? call.name.text
        : undefined,
    module: entrypoint,
    name: member ? member.text : '*',
    node: member ? parent : node,
  };
};

const caseDependencies = ({ checker, control, lineCase, rebound, twins }) => {
  const reads = new Map();
  const keysOf = (node, stack) => {
    const use = pliteUse(checker, node, twins);
    if (use) {
      return use.name === '*'
        ? [...rebound.keys()].filter((key) => key.startsWith(`${use.module}#`))
        : [`${use.module}#${use.name}`];
    }
    const symbol =
      ts.isShorthandPropertyAssignment(node.parent) && node.parent.name === node
        ? checker.getShorthandAssignmentValueSymbol(node.parent)
        : checker.getSymbolAtLocation(node);
    if (!symbol || stack.has(symbol)) return [];
    if (reads.has(symbol)) return reads.get(symbol);
    const complete = stack.size === 0;
    stack.add(symbol);
    const found = new Set();
    const visit = (child) => {
      if (ts.isIdentifier(child)) {
        for (const key of keysOf(child, stack)) found.add(key);
      }
      ts.forEachChild(child, visit);
    };
    for (const declaration of symbol.declarations ?? []) {
      if (declaration.getSourceFile() !== control) continue;
      visit(
        ts.isBindingElement(declaration)
          ? ts.walkUpBindingElementsAndPatterns(declaration)
          : declaration
      );
    }
    stack.delete(symbol);
    if (complete) reads.set(symbol, found);
    return found;
  };
  const dependencies = new Map();
  const visit = (node) => {
    const id =
      ts.isIdentifier(node) &&
      lineCase[
        control.getLineAndCharacterOfPosition(node.getStart(control)).line
      ];
    if (id) {
      if (!dependencies.has(id)) dependencies.set(id, new Set());
      for (const key of keysOf(node, new Set())) {
        const entry = rebound.get(key);
        if (entry) dependencies.get(id).add(entry.key);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(control);
  return dependencies;
};

const groupNamesNoCaseShares = (keys, dependencies) => {
  const users = (key) =>
    [...dependencies.values()].filter((names) => names.has(key)).length;
  const groups = [];
  for (const key of [...keys].sort(
    (a, b) => users(b) - users(a) || a.localeCompare(b)
  )) {
    const group = groups.find((names) =>
      names.every(
        (other) =>
          ![...dependencies.values()].some(
            (read) => read.has(key) && read.has(other)
          )
      )
    );
    if (group) group.push(key);
    else groups.push([key]);
  }
  return groups;
};

const proveByStandIns = ({
  checker,
  control,
  host,
  lineCase,
  modules,
  options,
  plateFile,
  program,
  rebound,
  twins,
  virtual,
}) => {
  const dependencies = caseDependencies({
    checker,
    control,
    lineCase,
    rebound,
    twins,
  });
  const keys = [...new Set([...rebound.values()].map(({ key }) => key))];
  const groups = groupNamesNoCaseShares(keys, dependencies);

  const standIns = new Map();
  const cache = ts.createModuleResolutionCache(
    host.getCurrentDirectory(),
    (name) => name,
    options
  );
  const standInHost = Object.create(host);
  standInHost.resolveModuleNameLiterals = (
    literals,
    containingFile,
    redirected,
    compilerOptions,
    source
  ) =>
    literals.map((literal) =>
      containingFile === plateFile && standIns.has(literal.text)
        ? {
            resolvedModule: {
              extension: ts.Extension.Ts,
              resolvedFileName: standIns.get(literal.text).file,
            },
          }
        : ts.resolveModuleName(
            literal.text,
            containingFile,
            compilerOptions,
            host,
            cache,
            redirected,
            ts.getModeForUsageLocation(source, literal, compilerOptions)
          )
    );

  const exportOf = (entrypoint, name) =>
    checker
      .getExportsOfModule(modules.get(entrypoint))
      .find((symbol) => symbol.name === name);
  let compiles = 0;
  const compile = (names) => {
    standIns.clear();
    for (const [liteKey, entry] of rebound) {
      if (!names.includes(entry.key)) continue;
      const [lite, name] = liteKey.split('#');
      const plate = twins.get(lite);
      const symbol = exportOf(plate, name);
      const target = resolveAlias(checker, symbol);
      const file = plateFile.replace(
        /\.plate\.tsx?$/u,
        `.stand-in-${compiles}-${plate.replaceAll('/', '-')}.ts`
      );
      if (!standIns.has(plate)) standIns.set(plate, { file, list: [] });
      standIns.get(plate).list.push({
        count: typeParameterCount([
          target,
          resolveAlias(checker, exportOf(lite, name)),
        ]),
        index: keys.indexOf(entry.key),
        name,
        type: Boolean(target.flags & ts.SymbolFlags.Type),
        typeOnly: Boolean(checker.getTypeOnlyAliasDeclaration(symbol)),
        value: Boolean(target.flags & ts.SymbolFlags.Value),
      });
    }
    for (const [plate, { file, list }] of standIns) {
      const keepsDefault =
        exportOf(plate, 'default') &&
        !list.some(({ name }) => name === 'default');
      virtual.set(file, standInModule(plate, list, keepsDefault));
    }
    compiles += 1;
    return caseErrors(
      ts.createProgram([plateFile], options, standInHost),
      plateFile,
      lineCase
    );
  };
  const alone = new Map();
  const compileAlone = (key) => {
    if (!alone.has(key)) alone.set(key, compile([key]));
    return alone.get(key);
  };

  const base = caseErrors(program, plateFile, lineCase);
  const proven = new Map(keys.map((key) => [key, new Set()]));
  const pending = [];
  for (const group of groups) {
    const errors = group.length === 1 ? compileAlone(group[0]) : compile(group);
    for (const id of new Set([...base.keys(), ...errors.keys()])) {
      const { added, changed } = errorSitesChanged(
        base.get(id),
        errors.get(id)
      );
      if (!changed) continue;
      const named =
        group.length === 1
          ? group
          : added.flatMap(({ text }) => {
              const printed = new Set(
                printedStandIns(text).map((index) => keys[index])
              );
              return printed.size === 1 ? [...printed] : [];
            });
      for (const key of named) proven.get(key).add(id);
      if (named.length === 0) pending.push({ group, id });
    }
  }
  const creditBySoloCompile = ({ group, id }) => {
    const read = group.filter((key) => dependencies.get(id)?.has(key));
    return [...read, ...group.filter((key) => !read.includes(key))].find(
      (key) =>
        errorSitesChanged(base.get(id), compileAlone(key).get(id)).changed
    );
  };
  const unattributed = [];
  for (const change of pending) {
    const credited = creditBySoloCompile(change);
    if (credited) proven.get(credited).add(change.id);
    else unattributed.push(change);
  }
  return { proven, unattributed };
};

const readCitations = (source) =>
  [...source.matchAll(CITATION)].map(([, file, start, end]) => ({
    end: Number(end ?? start),
    file: path.posix.normalize(file),
    start: Number(start),
  }));

const callsAny = (text, names) =>
  [...names].some((used) =>
    new RegExp(
      `(?<![\\w$])${used.replaceAll(/[$*]/gu, '\\$&')}(?![\\w$])`,
      'u'
    ).test(text)
  );

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

const walkthroughFences = (repoRoot) => {
  const fences = [];
  const imports = [];
  const directory = path.join(repoRoot, WALKTHROUGHS);
  for (const page of readdirSync(directory).sort()) {
    if (!page.endsWith('.mdx') || page.endsWith('.cn.mdx')) continue;
    const file = path.posix.join(WALKTHROUGHS, page);
    const lines = readFileSync(path.join(directory, page), 'utf-8').split('\n');
    let open = null;
    const close = (end) => {
      if (open.extension) {
        const name = path.join(
          directory,
          `${page}.${open.first}.${open.extension}`
        );
        const code = lines.slice(open.first, end).join('\n');
        fences.push({
          code: [code, ...imports].join('\n'),
          file,
          first: open.first,
          path: name,
        });
        imports.unshift(
          ...ts
            .createSourceFile(name, code, ts.ScriptTarget.Latest, true)
            .statements.filter(ts.isImportDeclaration)
            .map((statement) => statement.getText())
        );
      }
      open = null;
    };
    lines.forEach((line, index) => {
      if (!open) {
        const start = FENCE_OPEN.exec(line);
        if (start) {
          open = {
            extension: fenceExtension(start[2]),
            first: index + 1,
            marker: start[1],
          };
        }
      } else if (FENCE_CLOSE.exec(line)?.[1].startsWith(open.marker)) {
        close(index);
      }
    });
    if (open) close(lines.length);
  }
  return fences;
};

const memberKey = (use) =>
  `${use.module}#${use.name}${use.member ? `.${use.member}` : ''}`;

const walkthroughUses = (program, fences, twins, changes) => {
  const checker = program.getTypeChecker();
  const uses = [];
  for (const fence of fences) {
    const code = program.getSourceFile(fence.path);
    const seen = new Set();
    const visit = (node) => {
      if (ts.isImportDeclaration(node) || ts.isJsxClosingElement(node)) return;
      if (ts.isIdentifier(node)) {
        const use = pliteUse(checker, node, twins);
        const line =
          fence.first +
          1 +
          code.getLineAndCharacterOfPosition(node.getStart(code)).line;
        const key = use && changes(use) && `${line}#${memberKey(use)}`;
        if (key && !seen.has(key)) {
          seen.add(key);
          uses.push({ ...use, file: fence.file, line });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(code);
  }
  return uses;
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
  const typeOnly = new Set();
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
        if (!twin) continue;
        typeOnly.add(`${lite}#${symbol.name}`);
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
  return { drops, rebound, typeOnly };
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

const checkPliteOnly = (pairs, ledger) => {
  const problems = [];
  const twins = new Map(pairs);
  const listed = ledger.pliteOnly ?? [];
  for (const lite of new Set(
    listed.filter((entry, index) => listed.indexOf(entry) !== index)
  )) {
    problems.push(`${LEDGER}: pliteOnly lists ${lite} more than once`);
  }
  for (const [lite, plate] of pairs) {
    if (plate === null && !listed.includes(lite)) {
      problems.push(
        `platejs publishes no twin of ${lite}. Publish one, or add ${lite} to pliteOnly in ${LEDGER}.`
      );
    }
  }
  for (const lite of new Set(listed)) {
    if (twins.get(lite) !== null) {
      problems.push(
        `${LEDGER}: pliteOnly lists ${lite}, ${twins.has(lite) ? `and ${twins.get(lite)} is its twin` : 'which no Plite manifest publishes'}. Delete it.`
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
  sourceBySpecifier,
}) {
  const problems = [...checkPliteOnly(pairs, ledger)];
  const fatal = [];
  const relative = (file) => path.relative(repoRoot, file);
  const twins = new Map(pairs);
  const shared = pairs.filter(([, plate]) => plate);
  const plateRoot = packageOf(shared[0][1]);
  const plateNames = new Map(
    pairs.map(([lite, plate]) => [
      lite,
      plate ?? `${plateRoot}${lite.slice(packageOf(lite).length)}`,
    ])
  );
  const packages = new Set([...sourceBySpecifier.keys()].map(packageOf));
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
  const imports = ts.preProcessFile(controlText, true, true).importedFiles;
  for (const { fileName, pos } of imports) {
    const line = control.getLineAndCharacterOfPosition(pos).line + 1;
    if (
      plateNames.has(fileName) &&
      !control.statements.some(
        (statement) =>
          ts.isImportDeclaration(statement) &&
          statement.moduleSpecifier.getStart(control) === pos
      )
    ) {
      problems.push(
        `${relative(controlFile)}:${line}: the control reads ${fileName} outside an import statement, which the check does not follow. Import the name at the top of the control.`
      );
    }
    if (
      !plateNames.has(fileName) &&
      (/^[./]/u.test(fileName) || packages.has(packageOf(fileName)))
    ) {
      problems.push(
        `${relative(controlFile)}:${line}: the control imports ${fileName}, which is not a Plite entrypoint, so the Plate copy would read it unchanged. Import it from the Plite entrypoint that publishes it.`
      );
    }
  }
  const findImportCalls = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      !node.arguments.slice(0, 1).every(ts.isStringLiteralLike)
    ) {
      problems.push(
        `${relative(controlFile)}:${control.getLineAndCharacterOfPosition(node.getStart(control)).line + 1}: the control calls import() with a specifier the check cannot read. Import the name at the top of the control.`
      );
    }
    ts.forEachChild(node, findImportCalls);
  };
  findImportCalls(control);
  const fences = walkthroughFences(repoRoot);
  const virtual = new Map([
    ...fences.map((fence) => [fence.path, fence.code]),
    [plateFile, plateCopy(controlText, imports, plateNames)],
    [
      censusFile,
      shared
        .flat()
        .map(
          (specifier, index) => `import * as m${index} from '${specifier}';\n`
        )
        .join(''),
    ],
  ]);

  const options = {
    ...compilerOptions,
    noEmit: true,
    stableTypeOrdering: true,
  };
  const host = ts.createCompilerHost(options);
  host.getCurrentDirectory = () => repoRoot;
  const readFile = host.readFile.bind(host);
  host.readFile = (file) => virtual.get(file) ?? readFile(file);
  const getSourceFile = host.getSourceFile.bind(host);
  const parsed = new Map();
  host.getSourceFile = (file, ...rest) => {
    if (!parsed.has(file)) parsed.set(file, getSourceFile(file, ...rest));
    return parsed.get(file);
  };

  const program = ts.createProgram([controlFile, censusFile], options, host);
  const checker = program.getTypeChecker();
  // Plate's errors come from the Plate copy compiled alone, as a Plate app is,
  // so no global type only Plite declares reaches them.
  const plateProgram = ts.createProgram([plateFile], options, host);
  const plateSource = plateProgram.getSourceFile(plateFile);

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

  for (const specifier of Object.keys(options.paths ?? {})) {
    if (
      packages.has(packageOf(specifier)) &&
      !NON_CODE_EXPORT.test(specifier) &&
      !sourceBySpecifier.has(specifier)
    ) {
      problems.push(
        `${specifier}: ${CONFIG} gives it a path alias, and no manifest publishes it. Delete the alias, or publish the entrypoint.`
      );
    }
  }
  const twinsOfPliteOnly = pairs
    .filter(([, plate]) => !plate)
    .map(([lite]) => plateNames.get(lite));
  for (const specifier of new Set([
    ...sourceBySpecifier.keys(),
    ...twinsOfPliteOnly,
  ])) {
    const resolved = ts.resolveModuleName(specifier, controlFile, options, host)
      .resolvedModule?.resolvedFileName;
    const published = sourceBySpecifier.get(specifier);
    if ((resolved && path.resolve(resolved)) !== published) {
      problems.push(
        `${specifier}: the compiler reads ${resolved ? relative(resolved) : 'nothing'}, and its manifest publishes ${published ? relative(published) : 'nothing'}. Make the tsconfig paths of ${CONFIG} and the exports map agree.`
      );
    }
  }

  const { drops, rebound, typeOnly } = readExports(checker, modules, shared);
  const changes = (use) =>
    twins.get(use.module) === null ||
    rebound.has(`${use.module}#${use.name}`) ||
    (drops.get(use.module)?.includes(use.name) &&
      !(
        typeOnly.has(`${use.module}#${use.name}`) &&
        (ts.isPartOfTypeNode(use.node) || ts.isTypeQueryNode(use.node.parent))
      ));
  problems.push(...checkDrops(drops, ledger, twins));

  const { duplicates, lineCase, markers } = readCases(controlText);
  for (const id of duplicates) {
    problems.push(`case ${id}: the control declares it twice`);
  }
  const label = (id) => `case ${id} (${markers.get(id)})`;

  const { proven, unattributed } = proveByStandIns({
    checker,
    control: program.getSourceFile(controlFile),
    host,
    lineCase,
    modules,
    options,
    plateFile,
    program: plateProgram,
    rebound,
    twins,
    virtual,
  });
  for (const { group, id } of unattributed) {
    problems.push(
      `${label(id)}: its Plate errors change when the check replaces ${group.join(', ')} together, and no one of them changes them alone. Check each binding in a case of its own.`
    );
  }

  const caseOf = (node) =>
    lineCase[
      control.getLineAndCharacterOfPosition(node.getStart(control)).line
    ];
  const covered = new Set(
    [...proven].filter(([, ids]) => ids.size > 0).map(([key]) => key)
  );
  const caseUses = new Map([...markers.keys()].map((id) => [id, new Set()]));
  const caseTexts = new Map([...markers.keys()].map((id) => [id, new Set()]));
  const references = new Map();
  const markCovered = (node) => {
    if (ts.isImportDeclaration(node)) return;
    const id = ts.isIdentifier(node) && caseOf(node);
    const use = id && pliteUse(checker, node, twins);
    if (use) {
      if (!references.has(node.text)) references.set(node.text, new Set());
      references.get(node.text).add(id);
      const entry = rebound.get(`${use.module}#${use.name}`);
      if (entry ? proven.get(entry.key).has(id) : changes(use)) {
        caseUses.get(id)?.add(`${use.module}#${use.name}`).add(memberKey(use));
        const text = /^(?:\*|default)$/u.test(use.name) ? node.text : use.name;
        const shown = use.node === node ? node.text : text;
        caseTexts.get(id)?.add(text).add(shown);
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
        `Plate binds ${name} from ${entrypoints.join(' and ')} its own way, and no case checks anything with it: replacing Plate's ${name} with a type nothing fits changes no case's errors. Add a documented call to ${CONTROL}, or give the reason in ${LEDGER}'s unproven list.`
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
  for (const [id, marker] of markers) {
    const names = caseTexts.get(id);
    if (names.size === 0) {
      problems.push(
        `${label(id)}: the case's own lines check nothing with a name Plate binds its own way and use no name Plate drops. Delete it, or move the use it copies onto its lines.`
      );
    }
    const citations = readCitations(marker);
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
      cited.get(file).push({ ...citation, id });
    }
  }
  for (const use of walkthroughUses(
    ts.createProgram(
      fences.map((fence) => fence.path),
      options,
      host
    ),
    fences,
    twins,
    changes
  )) {
    const citing = (cited.get(use.file) ?? []).filter(
      ({ end, start }) => start <= use.line && use.line <= end
    );
    const key = memberKey(use);
    if (citing.some(({ id }) => caseUses.get(id).has(key))) continue;
    const uses = `${use.file}:${use.line}: the walkthrough uses ${use.member ? `${use.name}.${use.member}` : use.name} from ${use.module}`;
    problems.push(
      citing.length === 0
        ? `${uses}, and no case cites the line. Copy the call into ${CONTROL} as a case that cites it.`
        : `${uses}, and no case that cites the line (${[...new Set(citing.map(({ id }) => id))].join(', ')}) uses it. Copy the call into the case that cites it.`
    );
  }

  const liteProgram = ts.createProgram([controlFile], options, host);
  for (const diagnostic of [
    ...liteProgram.getSyntacticDiagnostics(
      liteProgram.getSourceFile(controlFile)
    ),
    ...liteProgram.getSemanticDiagnostics(
      liteProgram.getSourceFile(controlFile)
    ),
  ]) {
    problems.push(
      `${relative(controlFile)}:${lineOf(diagnostic) + 1}: the Plite control does not compile: TS${diagnostic.code} ${message(diagnostic)}`
    );
  }

  const importOwners = (position) => {
    const clause = plateSource.statements.find(
      (statement) =>
        ts.isImportDeclaration(statement) &&
        statement.getStart(plateSource) <= position &&
        position < statement.end
    )?.importClause;
    if (!clause) return [];
    const elements = clause.namedBindings?.elements ?? [];
    const specifier = elements.find(
      (element) =>
        element.getStart(plateSource) <= position && position < element.end
    );
    const locals = specifier
      ? [specifier.name]
      : [
          clause.name,
          ...(clause.namedBindings && !clause.namedBindings.elements
            ? [clause.namedBindings.name]
            : elements.map((element) => element.name)),
        ];
    return [
      ...new Set(
        locals.flatMap((local) => [...(references.get(local?.text) ?? [])])
      ),
    ];
  };

  const refusals = new Map();
  for (const diagnostic of [
    ...plateProgram.getSyntacticDiagnostics(plateSource),
    ...plateProgram.getSemanticDiagnostics(plateSource),
  ]) {
    const line = lineOf(diagnostic);
    const importing = importOwners(diagnostic.start);
    const owners =
      importing.length > 0 || !lineCase[line] ? importing : [lineCase[line]];
    if (owners.length === 0) {
      problems.push(
        `${relative(controlFile)}:${line + 1}: Plate refuses a line no case owns: TS${diagnostic.code} ${message(diagnostic)}. Move the line under its case's // case <id>: <file>:<line> marker, not under // shared.`
      );
      continue;
    }
    for (const id of owners) {
      if (!refusals.has(id)) refusals.set(id, []);
      refusals.get(id).push({
        key: errorKey(diagnostic),
        line: line + 1,
        text: message(diagnostic),
      });
    }
  }

  const rows = new Map();
  for (const row of ledger.refused ?? []) {
    if (rows.has(row.case)) {
      problems.push(`${LEDGER}: case ${row.case} has two rows`);
    }
    rows.set(row.case, row);
    if (!markers.has(row.case)) {
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
    if (!markers.has(id)) continue;
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
    summary: `${markers.size} cases, ${rebound.size} rebound and ${[...drops.values()].flat().length} dropped names, ${rows.size} refused cases recorded`,
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

  const entrypoints = readEntrypoints(repoRoot);
  const { fatal, problems, summary } =
    entrypoints.problems.length > 0
      ? { fatal: entrypoints.problems, problems: [] }
      : checkPliteCallParity({
          compilerOptions: readCompilerOptions(repoRoot),
          controlFile,
          ledger: JSON.parse(
            readFileSync(path.join(repoRoot, LEDGER), 'utf-8')
          ),
          pairs: entrypoints.pairs,
          repoRoot,
          sourceBySpecifier: entrypoints.sourceBySpecifier,
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
