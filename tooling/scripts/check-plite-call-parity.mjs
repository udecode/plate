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
  /^\s*(?:\/\/|\{?\/\*)\s*case ([A-Za-z][\w-]*):\s*(.*?)\s*(?:\*\/\}?)?\s*$/u;
const CITATION = /([\w./()-]+\.(?:mdx?|tsx?)):(\d+)(?:-(\d+))?/gu;
const FENCE_OPEN = /^\s*(`{3,}(?!.*`)|~{3,})\s*([A-Za-z]*)/u;
const FENCE_CLOSE = /^\s*(`{3,}|~{3,})\s*$/u;
const FREE =
  /^(?:Cannot find name|Cannot find namespace|No value exists in scope for the shorthand property) '([^']+)'/u;
const LOOSE = ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never;
const PREAMBLE_TYPE_KINDS = new Set(
  'ArrayType BigIntKeyword BigIntLiteral BooleanKeyword DeclareKeyword DotDotDotToken FalseKeyword FunctionDeclaration FunctionType Identifier IndexSignature LiteralType MethodSignature NamedTupleMember NullKeyword NumberKeyword NumericLiteral OptionalType Parameter ParenthesizedType PrefixUnaryExpression PropertySignature QualifiedName QuestionToken ReadonlyKeyword RestType StringKeyword StringLiteral SymbolKeyword TrueKeyword TupleType TypeLiteral TypeOperator TypeReference UndefinedKeyword UnionType VariableDeclaration VoidKeyword'
    .split(' ')
    .map((kind) => ts.SyntaxKind[kind])
);
const isMemberName = (node) =>
  (ts.isQualifiedName(node.parent) && node.parent.right === node) ||
  (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node);
const symbolOf = (checker, node) =>
  ts.isShorthandPropertyAssignment(node.parent) && node.parent.name === node
    ? checker.getShorthandAssignmentValueSymbol(node.parent)
    : checker.getSymbolAtLocation(node);
const globalNames = (checker, source) => {
  const names = new Set();
  const visit = (node) => {
    const symbol =
      ts.isIdentifier(node) && !isMemberName(node) && symbolOf(checker, node);
    if (
      symbol &&
      !(symbol.flags & (ts.SymbolFlags.Property | ts.SymbolFlags.Method)) &&
      symbol.declarations?.every(
        (declaration) => declaration.getSourceFile() !== source
      )
    ) {
      names.add(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return names;
};
const preambleDeclarations = (statement) =>
  (ts
    .getModifiers(statement)
    ?.some(({ kind }) => kind === ts.SyntaxKind.DeclareKeyword) &&
    (ts.isFunctionDeclaration(statement)
      ? [statement]
      : ts.isVariableStatement(statement) &&
        statement.declarationList.flags & ts.NodeFlags.Const &&
        statement.declarationList.declarations)) ||
  [];
const boundNames = (name) =>
  ts.isIdentifier(name)
    ? [name.text]
    : name.elements.flatMap((element) =>
        ts.isOmittedExpression(element) ? [] : boundNames(element.name)
      );
const topLevelNames = (statement) =>
  ts.isImportDeclaration(statement)
    ? [
        statement.importClause?.name,
        ...(statement.importClause?.namedBindings?.elements?.map(
          (each) => each.name
        ) ?? [statement.importClause?.namedBindings?.name]),
      ].flatMap((name) => (name ? [name.text] : []))
    : ts.isVariableStatement(statement)
      ? statement.declarationList.declarations.flatMap(({ name }) =>
          boundNames(name)
        )
      : statement.name && ts.isIdentifier(statement.name)
        ? [statement.name.text]
        : [];
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

const plateCopy = (text, twins) => {
  let copy = text;
  for (const { fileName, pos } of ts
    .preProcessFile(text, true, true)
    .importedFiles.toSorted((a, b) => b.pos - a.pos)) {
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

const caseErrors = (program, files, caseAt) => {
  const byCase = new Map();
  for (const diagnostic of files.flatMap((file) =>
    program.getSemanticDiagnostics(program.getSourceFile(file))
  )) {
    const id = caseAt(diagnostic.file.fileName, lineOf(diagnostic));
    if (!id) continue;
    if (!byCase.has(id)) byCase.set(id, []);
    byCase.get(id).push({
      site: `${diagnostic.file.fileName}:${diagnostic.start} TS${diagnostic.code}`,
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
  return {
    module: entrypoint,
    name: member ? member.text : '*',
    node: member ? parent : node,
  };
};

const caseDependencies = ({
  caseAt,
  checker,
  onPreamble,
  rebound,
  sources,
  twins,
}) => {
  const lineOfNode = (node) => {
    const source = node.getSourceFile();
    return [
      source.fileName,
      source.getLineAndCharacterOfPosition(node.getStart(source)).line,
    ];
  };
  const reads = new Map();
  const keysOf = (node, stack) => {
    const use = pliteUse(checker, node, twins);
    if (use) {
      return use.name === '*'
        ? [...rebound.keys()].filter((key) => key.startsWith(`${use.module}#`))
        : [`${use.module}#${use.name}`];
    }
    const symbol = symbolOf(checker, node);
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
      if (
        !sources.includes(declaration.getSourceFile()) ||
        onPreamble(...lineOfNode(declaration))
      ) {
        continue;
      }
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
    if (ts.isImportDeclaration(node)) return;
    const at = ts.isIdentifier(node) && lineOfNode(node);
    const id = at && !onPreamble(...at) && caseAt(...at);
    if (id) {
      if (!dependencies.has(id)) dependencies.set(id, new Set());
      for (const key of keysOf(node, new Set())) {
        const entry = rebound.get(key);
        if (entry) dependencies.get(id).add(entry.key);
      }
    }
    ts.forEachChild(node, visit);
  };
  for (const source of sources) visit(source);
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
  caseAt,
  checker,
  dependencies,
  host,
  modules,
  options,
  plateRoots,
  program,
  rebound,
  twins,
  virtual,
}) => {
  const keys = [...new Set([...rebound.values()].map(({ key }) => key))];
  const groups = groupNamesNoCaseShares(keys, dependencies);

  const standIns = new Map();
  const standInHost = Object.create(host);
  standInHost.resolveModuleNameLiterals = (literals, containingFile, ...rest) =>
    literals.map((literal) =>
      plateRoots.includes(containingFile) && standIns.has(literal.text)
        ? {
            resolvedModule: {
              extension: ts.Extension.Ts,
              resolvedFileName: standIns.get(literal.text).file,
            },
          }
        : host.resolveModuleNameLiterals([literal], containingFile, ...rest)[0]
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
      const file = plateRoots[0].replace(
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
      ts.createProgram(plateRoots, options, standInHost),
      plateRoots,
      caseAt
    );
  };
  const alone = new Map();
  const compileAlone = (key) => {
    if (!alone.has(key)) alone.set(key, compile([key]));
    return alone.get(key);
  };

  const base = caseErrors(program, plateRoots, caseAt);
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
      for (const key of named) {
        if (dependencies.get(id)?.has(key)) proven.get(key).add(id);
      }
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
    if (!credited) unattributed.push(change);
    else if (dependencies.get(change.id)?.has(credited)) {
      proven.get(credited).add(change.id);
    }
  }
  return { proven, unattributed };
};

const readCitations = (source) =>
  [...source.matchAll(CITATION)].map(([, file, start, end]) => ({
    end: Number(end ?? start),
    file: path.posix.normalize(file),
    start: Number(start),
  }));

const readFences = (repoRoot, files) => {
  const fences = [];
  for (const file of files) {
    const page = [];
    const lines = readFileSync(path.join(repoRoot, file), 'utf-8').split('\n');
    let open = null;
    const close = (end) => {
      if (open.extension) {
        const fence = {
          code: lines.slice(open.first, end).join('\n'),
          earlier: [...page],
          extension: open.extension,
          file,
          first: open.first,
          last: end,
          path: path.join(repoRoot, `${file}.${open.first}.${open.extension}`),
        };
        fences.push(fence);
        page.unshift(fence);
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

const importOf = (statement, name) => {
  const clause = statement.importClause;
  const element = clause?.namedBindings?.elements?.find(
    (each) => each.name.text === name
  );
  const binding = element
    ? `{ ${element.getText().replaceAll(/\s+/gu, ' ')} }`
    : clause?.name?.text === name
      ? name
      : clause?.namedBindings?.name?.text === name && `* as ${name}`;
  return (
    binding &&
    `import ${clause.isTypeOnly ? 'type ' : ''}${binding} from ${statement.moduleSpecifier.getText()};`
  );
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
        if (!twin) continue;
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
  const { duplicates, lineCase, markers } = readCases(controlText);
  for (const statement of control.statements) {
    const { line } = control.getLineAndCharacterOfPosition(
      statement.getStart(control)
    );
    if (ts.isModuleDeclaration(statement)) {
      problems.push(
        `${relative(controlFile)}:${line + 1}: the control declares a global or module augmentation, which reaches every case. Delete it.`
      );
    } else if (!lineCase[line] && !ts.isImportDeclaration(statement)) {
      problems.push(
        `${relative(controlFile)}:${line + 1}: the control holds code above its first case marker. Move it under the case that uses it.`
      );
    }
  }
  const citations = new Map(
    [...markers].map(([id, marker]) => [id, readCitations(marker)])
  );
  const walkthroughs = readdirSync(path.join(repoRoot, WALKTHROUGHS))
    .filter((page) => page.endsWith('.mdx') && !page.endsWith('.cn.mdx'))
    .sort()
    .map((page) => path.posix.join(WALKTHROUGHS, page));
  const fences = readFences(repoRoot, [
    ...walkthroughs,
    ...new Set(
      [...citations.values()]
        .flat()
        .map(({ file }) => file)
        .filter(
          (file) =>
            /\.mdx?$/u.test(file) &&
            !walkthroughs.includes(file) &&
            CITABLE.some((prefix) => file.startsWith(prefix)) &&
            existsSync(path.join(repoRoot, file))
        )
    ),
  ]);
  const selects = ({ end, file, start }) =>
    fences.filter(
      (fence) => fence.file === file && start <= fence.last && end > fence.first
    );
  const selected = new Map(
    [...citations].map(([id, list]) => [
      id,
      [...new Set(list.flatMap(selects))],
    ])
  );
  const fenceCase = (id) => selected.get(id)?.length > 0;
  const unread = fences.filter(
    (fence) => ![...selected.values()].flat().includes(fence)
  );
  const liteText = controlText
    .split('\n')
    .map((line, at) =>
      fenceCase(lineCase[at]) ? ' '.repeat(line.length) : line
    )
    .join('\n');
  const virtual = new Map([
    ...fences.map((fence) => [fence.path, `${fence.code}\nexport {};`]),
    [controlFile, liteText],
    [plateFile, plateCopy(liteText, plateNames)],
    [
      censusFile,
      pairs
        .flat()
        .filter(Boolean)
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
  const cache = ts.createModuleResolutionCache(
    repoRoot,
    (name) => name,
    options
  );
  const isRelativeImportFromFence = (file, specifier) =>
    virtual.has(file) && specifier.startsWith('.');
  host.resolveModuleNameLiterals = (
    literals,
    containingFile,
    redirected,
    resolution,
    source
  ) =>
    literals.map((literal) =>
      isRelativeImportFromFence(containingFile, literal.text)
        ? { resolvedModule: undefined }
        : ts.resolveModuleName(
            literal.text,
            containingFile,
            resolution,
            host,
            cache,
            redirected,
            ts.getModeForUsageLocation(source, literal, resolution)
          )
    );

  const program = ts.createProgram(
    [censusFile, ...fences.map((fence) => fence.path)],
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
    else if (twins.get(statement.moduleSpecifier.text) !== null) {
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

  const { drops, rebound } = readExports(checker, modules, shared);
  problems.push(...checkDrops(drops, ledger, twins));

  for (const id of duplicates) {
    problems.push(`case ${id}: the control declares it twice`);
  }
  const label = (id) => `case ${id} (${markers.get(id)})`;

  const exportingEntrypoints = new Map();
  for (const [lite] of pairs) {
    for (const { name } of modules.has(lite)
      ? checker.getExportsOfModule(modules.get(lite))
      : []) {
      exportingEntrypoints.set(name, [
        ...(exportingEntrypoints.get(name) ?? []),
        lite,
      ]);
    }
  }
  for (const fence of fences) {
    fence.source = program.getSourceFile(fence.path);
    fence.free = program
      .getSemanticDiagnostics(fence.source)
      .map((diagnostic) => FREE.exec(message(diagnostic))?.[1])
      .filter(Boolean);
    fence.global = globalNames(checker, fence.source);
  }
  const bindPageNames = (fence, imported = new Set()) => {
    const own = new Set([
      ...fence.source.statements.flatMap(topLevelNames),
      ...imported,
    ]);
    const rows = new Map();
    const unbound = new Set();
    const add = (line) => line && rows.set(line, [line, 'an import it adds']);
    const bindImport = (statement, name) =>
      own.has(name) || add(importOf(statement, name));
    const carry = (earlier, statement) => {
      const [first, last] = [
        statement.getStart(earlier.source),
        statement.end,
      ].map(
        (position) =>
          earlier.source.getLineAndCharacterOfPosition(position).line
      );
      const key = `${earlier.path}:${first}`;
      if (
        rows.has(key) ||
        topLevelNames(statement).some((name) => own.has(name))
      ) {
        return;
      }
      rows.set(key, null);
      const visit = (node) => {
        if (ts.isIdentifier(node) && !isMemberName(node)) {
          const symbol = symbolOf(checker, node);
          const declaration = symbol?.declarations?.find(
            (each) => each.getSourceFile() === earlier.source
          );
          const top =
            declaration &&
            ts.findAncestor(
              declaration,
              (each) => each.parent === earlier.source
            );
          if (top) {
            if (ts.isImportDeclaration(top)) bindImport(top, node.text);
            else if (top !== statement) carry(earlier, top);
          } else if (symbol) {
            if (earlier.global.has(node.text)) need(earlier, node.text);
          } else if (
            earlier.free.includes(node.text) &&
            !need(earlier, node.text)
          ) {
            unbound.add(node.text);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(statement);
      rows.delete(key);
      const lines = earlier.code.split('\n');
      for (let line = first; line <= last; line += 1) {
        rows.set(`${earlier.path}:${line}`, [
          lines[line],
          `${earlier.file}:${earlier.first + line + 1}`,
        ]);
      }
    };
    const need = (from, name) => {
      for (const earlier of from.earlier) {
        for (const statement of earlier.source.statements) {
          if (ts.isImportDeclaration(statement)) {
            if (topLevelNames(statement).includes(name)) {
              return bindImport(statement, name);
            }
          } else if (topLevelNames(statement).includes(name)) {
            carry(earlier, statement);
            return true;
          }
        }
      }
      const exporters = exportingEntrypoints.get(name) ?? [];
      return (
        from.free.includes(name) &&
        exporters.length === 1 &&
        add(`import { ${name} } from '${exporters[0]}';`)
      );
    };
    for (const name of new Set([...fence.free, ...fence.global])) {
      if (!need(fence, name) && fence.free.includes(name)) unbound.add(name);
    }
    return { rows: [...rows.values()].filter(Boolean), unbound };
  };
  const units = [];
  const moduleUnit = new Map();
  const controlLines = controlText.split('\n');
  const preambles = [];
  for (const [id, list] of selected) {
    if (list.length === 0) continue;
    const at = controlLines.flatMap((line, index) =>
      lineCase[index] === id ? [index] : []
    );
    const source = ts.createSourceFile(
      `${id}.tsx`,
      at.map((index) => controlLines[index]).join('\n'),
      ts.ScriptTarget.Latest,
      true
    );
    const preamble = source.statements.map((statement) => {
      const start = source.getLineAndCharacterOfPosition(
        statement.getStart(source)
      );
      const typeNames = new Set();
      const visit = (node) => {
        if (ts.isTypeReferenceNode(node)) {
          let name = node.typeName;
          while (ts.isQualifiedName(name)) name = name.left;
          typeNames.add(name.text);
        }
        ts.forEachChild(node, visit);
      };
      visit(statement);
      return {
        binds: ts.isImportDeclaration(statement)
          ? topLevelNames(statement)
          : [],
        column: start.character,
        declares: preambleDeclarations(statement).map(({ name }) => name.text),
        id,
        lines: at.slice(
          start.line,
          source.getLineAndCharacterOfPosition(statement.end).line + 1
        ),
        typeNames,
      };
    });
    preambles.push(...preamble);
    const where = (lines) =>
      `${label(id)}: ${relative(controlFile)}:${lines[0] + 1}: the preamble`;
    const read = new Set();
    for (const fence of list) {
      let header = bindPageNames(fence);
      const free = header.unbound;
      const declared = preamble.filter(({ declares }) =>
        declares.some((name) => free.has(name))
      );
      const lines = [
        ...new Set(
          preamble
            .filter(
              (entry) =>
                declared.includes(entry) ||
                entry.binds.some((name) =>
                  declared.some(({ typeNames }) => typeNames.has(name))
                )
            )
            .flatMap((entry) => entry.lines)
        ),
      ].sort((a, b) => a - b);
      const imported = preamble.flatMap((entry) =>
        lines.includes(entry.lines[0]) ? entry.binds : []
      );
      header = bindPageNames(fence, new Set(imported));
      const rows = [
        ...header.rows,
        ...lines.map((index) => [
          controlLines[index],
          `${relative(controlFile)}:${index + 1}`,
        ]),
      ];
      const start = rows.length;
      rows.push(
        ...fence.code
          .split('\n')
          .map((line, index) => [
            line,
            `${fence.file}:${fence.first + index + 1}`,
          ]),
        ['export {};', 'its end']
      );
      const [lite, plate] = ['', '.plate'].map((copy) =>
        path.join(
          dir,
          `${base}.case-${id}-${units.length}${copy}.${fence.extension}`
        )
      );
      const text = rows.map(([line]) => line).join('\n');
      virtual.set(lite, text).set(plate, plateCopy(text, plateNames));
      const unit = {
        id,
        lite,
        origins: rows.map(([, origin]) => origin),
        plate,
        preambleStart: header.rows.length,
        start,
      };
      units.push(unit);
      moduleUnit.set(lite, unit).set(plate, unit);
      for (const entry of declared) {
        entry.unit ??= {
          line: unit.preambleStart + lines.indexOf(entry.lines[0]),
          lite,
        };
        for (const name of entry.declares) {
          if (free.has(name)) read.add(name);
        }
      }
    }
    for (const { binds, declares, lines } of preamble) {
      if (!declares.length && !binds.length) {
        problems.push(
          `${where(lines)} holds a statement other than declare const, declare function and import declarations.`
        );
      }
      for (const name of binds) {
        if (
          list.some(
            (fence) => fence.free.includes(name) || fence.global.has(name)
          )
        ) {
          problems.push(
            `${where(lines)} imports ${name}, which a cited fence reads. The page imports what its code reads.`
          );
        }
      }
      for (const name of declares) {
        if (exportingEntrypoints.has(name) || !read.has(name)) {
          problems.push(
            `${where(lines)} declares ${name}, which ${exportingEntrypoints.has(name) ? `Plite exports from ${exportingEntrypoints.get(name).join(' and ')}, so the page imports it` : 'no cited fence reads and leaves unbound'}.`
          );
        }
      }
    }
  }
  const caseAt = (file, line) => moduleUnit.get(file)?.id ?? lineCase[line];
  const onPreamble = (file, line) => {
    const unit = moduleUnit.get(file);
    return Boolean(unit) && line >= unit.preambleStart && line < unit.start;
  };
  const readPath = (fence) => fence.path.replace(/\.(tsx?)$/u, '.read.$1');
  for (const fence of unread) {
    const { rows } = bindPageNames(fence);
    fence.start = rows.length;
    virtual.set(
      readPath(fence),
      [...rows.map(([line]) => line), fence.code, 'export {};'].join('\n')
    );
  }
  const liteProgram = ts.createProgram(
    [controlFile, ...units.map(({ lite }) => lite), ...unread.map(readPath)],
    options,
    host
  );
  const liteChecker = liteProgram.getTypeChecker();
  const liteControl = liteProgram.getSourceFile(controlFile);
  const sources = [controlFile, ...units.map(({ lite }) => lite)].map((file) =>
    liteProgram.getSourceFile(file)
  );
  for (const diagnostic of sources.flatMap((source) => [
    ...liteProgram.getSyntacticDiagnostics(source),
    ...liteProgram.getSemanticDiagnostics(source),
  ])) {
    const unit = moduleUnit.get(diagnostic.file.fileName);
    problems.push(
      unit
        ? `${label(unit.id)}: ${unit.origins[lineOf(diagnostic)]}: the cited code does not compile against Plite: TS${diagnostic.code} ${message(diagnostic)}`
        : `${relative(controlFile)}:${lineOf(diagnostic) + 1}: the Plite control does not compile: TS${diagnostic.code} ${message(diagnostic)}`
    );
  }

  const isLib = (symbol) =>
    symbol?.declarations?.some((declaration) =>
      liteProgram.isSourceFileDefaultLibrary(declaration.getSourceFile())
    );
  for (const { column, id, unit: at } of preambles) {
    if (!at) continue;
    const unit = moduleUnit.get(at.lite);
    const source = liteProgram.getSourceFile(at.lite);
    const position = source.getPositionOfLineAndCharacter(at.line, column);
    const statement = source.statements.find(
      (each) => each.getStart(source) === position
    );
    const named = (node) => {
      const symbol = liteChecker.getSymbolAtLocation(node);
      if (!(symbol?.flags & ts.SymbolFlags.Alias)) return isLib(symbol);
      const declaration = symbol.declarations[0];
      if (declaration.getSourceFile() !== source) return false;
      const { line } = source.getLineAndCharacterOfPosition(
        declaration.getStart(source)
      );
      return line >= unit.preambleStart && line < unit.start;
    };
    const typed = (node) =>
      PREAMBLE_TYPE_KINDS.has(node.kind) &&
      !('type' in node && !node.type) &&
      !(
        ts.isTypeOperatorNode(node) &&
        node.operator !== ts.SyntaxKind.ReadonlyKeyword
      ) &&
      !(
        ts.isTypeReferenceNode(node) &&
        node.typeArguments &&
        isLib(liteChecker.getSymbolAtLocation(node.typeName))
      ) &&
      !(
        ts.isIdentifier(node) &&
        [node.parent.typeName, node.parent.left].includes(node) &&
        !named(node)
      ) &&
      !ts.forEachChild(node, (child) => !typed(child));
    const loose = (node) =>
      (ts.isTypeNode(node) &&
        liteChecker.getTypeFromTypeNode(node).flags & LOOSE) ||
      ts.forEachChild(node, loose);
    for (const declaration of ts.isVariableStatement(statement)
      ? statement.declarationList.declarations
      : [statement]) {
      const fault = !typed(declaration)
        ? ' with a type that can take its type from the code under test. Type it by a name a package exports or the lib declares, a primitive, a literal, or an object, function, array, tuple or union of those, and give a lib type no type arguments'
        : loose(declaration) &&
          ' as any, unknown or never, which fits whatever Plate gives';
      if (fault) {
        problems.push(
          `${label(id)}: ${unit.origins[at.line]}: the preamble declares ${declaration.name.text}${fault}.`
        );
      }
    }
  }

  const probeCode = new Set();
  const visitProbe = (node) => {
    const at = liteControl.getLineAndCharacterOfPosition(
      node.getStart(liteControl)
    ).line;
    const id = lineCase[at];
    const checked = !fenceCase(id);
    const where = () =>
      `${id ? `${label(id)}: ` : ''}${relative(controlFile)}:${at + 1}: the probe holds ${node.getText(liteControl).split('\n')[0]}`;
    if (
      id &&
      checked &&
      (ts.isCallExpression(node) ||
        ts.isNewExpression(node) ||
        ts.isJsxElement(node) ||
        ts.isJsxSelfClosingElement(node))
    ) {
      probeCode.add(id);
    }
    if (
      checked &&
      (ts.isTypeAssertionExpression(node) ||
        ts.isNonNullExpression(node) ||
        (ts.isAsExpression(node) && !ts.isConstTypeReference(node.type)))
    ) {
      problems.push(
        `${where()}, a type assertion, which hides the type Plate gives.`
      );
    } else if (
      checked &&
      ts.isExpression(node) &&
      node.parent.tagName !== node &&
      !(ts.isStringLiteral(node) && ts.isJsxAttribute(node.parent)) &&
      liteChecker.getTypeAtLocation(node).flags & LOOSE
    ) {
      problems.push(
        `${where()}, which the Plite compiler types any, unknown or never, so it fits whatever Plate gives.`
      );
    }
    if (!ts.isImportDeclaration(node) && !ts.isTypeNode(node)) {
      ts.forEachChild(node, visitProbe);
    }
  };
  visitProbe(liteControl);

  const plateRoots = [plateFile, ...units.map(({ plate }) => plate)];
  const plateAppProgram = ts.createProgram(plateRoots, options, host);
  const plateSource = plateAppProgram.getSourceFile(plateFile);
  const dependencies = caseDependencies({
    caseAt,
    checker: liteChecker,
    onPreamble,
    rebound,
    sources,
    twins,
  });
  const { proven, unattributed } = proveByStandIns({
    caseAt,
    checker,
    dependencies,
    host,
    modules,
    options,
    plateRoots,
    program: plateAppProgram,
    rebound,
    twins,
    virtual,
  });
  for (const { group, id } of unattributed) {
    problems.push(
      `${label(id)}: its Plate errors change when the check replaces ${group.join(', ')} together, and no one of them changes them alone. Check each binding in a case of its own.`
    );
  }

  const covered = new Set(
    [...proven].filter(([, ids]) => ids.size > 0).map(([key]) => key)
  );
  const references = new Map();
  const markReferences = (node) => {
    if (ts.isImportDeclaration(node)) return;
    const id =
      ts.isIdentifier(node) &&
      lineCase[
        liteControl.getLineAndCharacterOfPosition(node.getStart(liteControl))
          .line
      ];
    if (id && pliteUse(liteChecker, node, twins)) {
      if (!references.has(node.text)) references.set(node.text, new Set());
      references.get(node.text).add(id);
    }
    ts.forEachChild(node, markReferences);
  };
  markReferences(liteControl);

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

  for (const [id, list] of citations) {
    if (list.length === 0) {
      problems.push(
        `${label(id)}: the case cites no docs lines. Write its marker as // case ${id}: <file>:<line> or <file>:<start>-<end>, naming each call it copies from a file under ${CITABLE.join(' or ')}.`
      );
    }
    if (!fenceCase(id) && !probeCode.has(id)) {
      problems.push(
        `${label(id)}: it cites no fence, so its lines are a probe, and they hold no call, new expression or JSX element. Cite the fence it copies, or write the call it checks.`
      );
    }
    for (const citation of list) {
      const { end, file, start } = citation;
      if (fenceCase(id) && selects(citation).length === 0) {
        problems.push(
          `${label(id)}: ${file}:${start}-${end} selects no fence, and the case compiles only the fences it cites. Cite a fence, or drop the citation.`
        );
      }
      const absolute = path.join(repoRoot, file);
      if (
        !CITABLE.some((prefix) => file.startsWith(prefix)) ||
        !existsSync(absolute) ||
        end > readFileSync(absolute, 'utf-8').split('\n').length
      ) {
        problems.push(
          `${label(id)}: ${file}:${start}-${end} is not a line range of a file under ${CITABLE.join(' or ')}`
        );
      }
    }
  }
  const unboundUses = (node) =>
    ts.isIdentifier(node) &&
    node.parent.name !== node &&
    !liteChecker.getSymbolAtLocation(node)
      ? (exportingEntrypoints.get(node.text) ?? []).map((module) => ({
          module,
          name: node.text,
          node,
        }))
      : [];
  for (const fence of unread) {
    const lines = `${fence.file}:${fence.first + 1}-${fence.last}`;
    if (walkthroughs.includes(fence.file)) {
      problems.push(
        `${lines}: no case cites this walkthrough fence. Cite it from a case in ${CONTROL}.`
      );
    }
    const reads = new Map();
    const source = liteProgram.getSourceFile(readPath(fence));
    const visit = (node) => {
      if (
        ts.isImportDeclaration(node) ||
        source.getLineAndCharacterOfPosition(node.end).line < fence.start
      ) {
        return;
      }
      const use = ts.isIdentifier(node) && pliteUse(liteChecker, node, twins);
      for (const each of use ? [use] : unboundUses(node)) {
        const key = `${each.module}#${each.name}`;
        if (rebound.has(key)) {
          reads.set(rebound.get(key).key, `${each.name} from ${each.module}`);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    for (const [id, list] of citations) {
      const probed = [...reads].filter(([key]) =>
        dependencies.get(id)?.has(key)
      );
      if (
        probed.length > 0 &&
        !fenceCase(id) &&
        list.some(({ file }) => file === fence.file)
      ) {
        problems.push(
          `${label(id)}: ${lines} reads ${probed.map(([, name]) => name).join(', ')}, which the probe reads, and no case cites that fence. Cite it from a case.`
        );
      }
    }
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
  const refuse = (id, diagnostic, where) => {
    if (!refusals.has(id)) refusals.set(id, []);
    refusals.get(id).push({
      key: errorKey(diagnostic),
      text: `${where}: ${message(diagnostic)}`,
    });
  };
  for (const diagnostic of [
    ...plateAppProgram.getSyntacticDiagnostics(plateSource),
    ...plateAppProgram.getSemanticDiagnostics(plateSource),
  ]) {
    const line = lineOf(diagnostic);
    const importing = importOwners(diagnostic.start);
    const owners =
      importing.length > 0 || !lineCase[line] ? importing : [lineCase[line]];
    if (owners.length === 0) {
      problems.push(
        `${relative(controlFile)}:${line + 1}: Plate refuses a line no case owns: TS${diagnostic.code} ${message(diagnostic)}. Move the line under its case's // case <id>: <file>:<line> marker.`
      );
    }
    for (const id of owners) refuse(id, diagnostic, `line ${line + 1}`);
  }
  for (const { id, origins, plate } of units) {
    for (const diagnostic of plateAppProgram.getSemanticDiagnostics(
      plateAppProgram.getSourceFile(plate)
    )) {
      refuse(id, diagnostic, origins[lineOf(diagnostic)]);
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
    const first = found[0]?.text;
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
