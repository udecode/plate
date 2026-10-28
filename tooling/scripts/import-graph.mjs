import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';
import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
let compiler;
const loadTypeScript = () =>
  (compiler ??= createRequire(import.meta.url)('@typescript/typescript6'));

const testSidePattern =
  /\/__tests__\/|(?:\.(?:spec|test)|-contract)\.[cm]?[jt]sx?$/u;
const packageSourceRoots = Object.values(entrypointDags).map(
  (definition) => `${path.join(repoRoot, definition.packageRoot, 'src')}/`
);

export const isTypecheckedSource = (filename) =>
  packageSourceRoots.some((root) => filename.startsWith(root)) &&
  !testSidePattern.test(filename);

const moduleCache = new Map();

// A runtime query never changes which file loads, so a template whose
// expressions all follow its `?` names one file.
const literalSpecifier = (node) => {
  if (node?.type === 'StringLiteral') return node.value;
  if (node?.type !== 'TemplateLiteral') return undefined;

  const head = node.quasis[0].value.cooked;

  if (node.expressions.length === 0) return head;
  if (head.includes('?')) return head.slice(0, head.indexOf('?'));

  return undefined;
};

const capabilityModules = new Set([
  'bun',
  'bun:ffi',
  'bun:sqlite',
  'child_process',
  'cluster',
  'fs',
  'fs/promises',
  'module',
  'worker_threads',
]);
const typescriptCompilerPattern = /^(?:typescript|@typescript\/[^/]+)$/u;
// Bun members that neither read files, start processes nor load modules.
const plainBunMembers = new Set([
  'env',
  'gc',
  'main',
  'nanoseconds',
  'version',
]);

export const evictsModules = 'evicts modules from the module registry';
export const passesRegistry =
  'passes the module registry around, so the check cannot see what it changes';

const isMember = (node) =>
  node?.type === 'MemberExpression' ||
  node?.type === 'OptionalMemberExpression';

const propertyName = (member) =>
  member.computed ? undefined : member.property.name;

// `import.meta.require` and Node's `module.require`.
const isRequireMember = (node) =>
  isMember(node) &&
  propertyName(node) === 'require' &&
  (node.object.type === 'MetaProperty' ||
    (node.object.type === 'Identifier' && node.object.name === 'module'));

const isRequireCall = (node) =>
  node.type === 'CallExpression' &&
  ((node.callee.type === 'Identifier' && node.callee.name === 'require') ||
    isRequireMember(node.callee) ||
    (node.callee.type === 'CallExpression' &&
      node.callee.callee.type === 'Identifier' &&
      node.callee.callee.name === 'createRequire'));

// A name inside a type, or a property key, refers to no value.
const namesNoValue = (node, parent) =>
  (parent?.type?.startsWith('TS') && !parent.type.endsWith('Expression')) ||
  (parent?.key === node && !parent.computed && !parent.shorthand);

// A loader that is not called where it is named, such as `names.map(require)`,
// loads modules the import walk cannot follow.
const passesRequire = (node, ancestors) => {
  const parent = ancestors.at(-1);

  if (isRequireMember(node)) {
    return !(parent?.type === 'CallExpression' && parent.callee === node);
  }
  if (node.type !== 'Identifier' || node.name !== 'require') return false;
  if (parent?.type === 'CallExpression' && parent.callee === node) {
    return false;
  }
  if (isMember(parent)) {
    return (
      parent.object === node &&
      !['cache', 'main', 'resolve'].includes(propertyName(parent))
    );
  }

  return !(
    (parent?.type === 'UnaryExpression' && parent.operator === 'typeof') ||
    (parent?.type === 'VariableDeclarator' && parent.id === node) ||
    namesNoValue(node, parent)
  );
};

const isRegistry = (node) =>
  isMember(node) &&
  ((propertyName(node) === 'cache' &&
    ((node.object.type === 'Identifier' && node.object.name === 'require') ||
      (node.object.type === 'CallExpression' &&
        node.object.callee.type === 'Identifier' &&
        node.object.callee.name === 'createRequire'))) ||
    propertyName(node) === '_cache' ||
    (propertyName(node) === 'registry' &&
      node.object.type === 'Identifier' &&
      node.object.name === 'Loader'));

const isObjectKeysCall = (node) =>
  node?.type === 'CallExpression' &&
  isMember(node.callee) &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name === 'Object' &&
  ['entries', 'keys', 'values'].includes(propertyName(node.callee));

// `lineage` runs from the program down to the registry access.
const registryUse = (lineage) => {
  const registry = lineage.at(-1);
  let index = lineage.length - 1;

  while (
    isMember(lineage[index - 1]) &&
    lineage[index - 1].object === lineage[index]
  ) {
    index -= 1;
  }

  const top = lineage[index];
  const parent = lineage[index - 1];

  if (
    (parent?.type === 'UnaryExpression' && parent.operator === 'delete') ||
    (parent?.type === 'AssignmentExpression' && parent.left === top) ||
    (parent?.type === 'CallExpression' &&
      parent.callee === top &&
      ['clear', 'delete', 'set'].includes(propertyName(top)))
  ) {
    return evictsModules;
  }
  // Only a member read or a key listing can use the registry itself;
  // anything else hands it to code the scan cannot follow.
  if (top === registry && !isObjectKeysCall(parent)) return passesRegistry;

  return 'reads the module registry';
};

// A reference to the Bun global, or a property named Bun such as
// `globalThis.Bun`, that is not a plain member read.
const bunUse = (node, ancestors) => {
  const parent = ancestors.at(-1);

  if (namesNoValue(node, parent)) return undefined;

  const isProperty = isMember(parent) && parent.property === node;

  if (isProperty && parent.computed) return undefined;

  const reference = isProperty ? parent : node;
  const user = isProperty ? ancestors.at(-2) : parent;

  if (user?.type === 'UnaryExpression' && user.operator === 'typeof') {
    return undefined;
  }
  if (isMember(user) && user.object === reference) {
    const member = propertyName(user);

    return plainBunMembers.has(member)
      ? undefined
      : `uses Bun.${member ?? '[…]'}`;
  }

  return 'uses the Bun global';
};

const parseModule = (filename) => {
  if (moduleCache.has(filename)) return moduleCache.get(filename);

  const specifiers = [];
  const valueSpecifiers = [];
  const effects = new Set();

  if (/\.[cm]?[jt]sx?$/u.test(filename) && !filename.endsWith('.d.ts')) {
    const sourceFile = parse(fs.readFileSync(filename, 'utf-8'), {
      plugins: ['jsx', 'typescript'],
      sourceFilename: filename,
      sourceType: 'unambiguous',
    });
    const addLoad = (node, typeOnly = false) => {
      const specifier = literalSpecifier(node);

      if (specifier === undefined) {
        effects.add('loads a module by a computed path');

        return;
      }

      specifiers.push(specifier);
      if (typeOnly) return;
      valueSpecifiers.push(specifier);
      if (capabilityModules.has(specifier.replace(/^node:/u, ''))) {
        effects.add(`loads ${specifier}`);
      } else if (typescriptCompilerPattern.test(specifier)) {
        effects.add('runs the TypeScript compiler');
      }
    };
    const ancestors = [];
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'ImportDeclaration') {
        addLoad(node.source, node.importKind === 'type');
      } else if (
        (node.type === 'ExportAllDeclaration' ||
          node.type === 'ExportNamedDeclaration') &&
        node.source
      ) {
        addLoad(node.source, node.exportKind === 'type');
      } else if (node.type === 'TSExternalModuleReference') {
        addLoad(node.expression);
      } else if (node.type === 'TSImportType') {
        addLoad(node.argument, true);
      } else if (node.type === 'ImportExpression') {
        addLoad(node.source);
      } else if (
        node.type === 'CallExpression' &&
        (node.callee.type === 'Import' || isRequireCall(node))
      ) {
        addLoad(node.arguments[0]);
      } else if (node.type === 'Identifier' && node.name === 'Bun') {
        const use = bunUse(node, ancestors);

        if (use) effects.add(use);
      } else if (
        isMember(node) &&
        node.object.type === 'Identifier' &&
        node.object.name === 'process' &&
        ['binding', 'dlopen'].includes(propertyName(node))
      ) {
        effects.add(`uses process.${propertyName(node)}`);
      } else if (
        node.type === 'NewExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'Worker'
      ) {
        effects.add('starts a worker');
      } else if (isRegistry(node)) {
        effects.add(registryUse([...ancestors, node]));
      } else if (passesRequire(node, ancestors)) {
        effects.add('uses require other than in a direct call');
      }

      ancestors.push(node);
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) {
          for (const child of value) visit(child);
        } else if (value && typeof value === 'object') {
          visit(value);
        }
      }
      ancestors.pop();
    };

    visit(sourceFile);
  }

  const result = {
    effects: [...effects].sort((a, b) => a.localeCompare(b)),
    specifiers,
    valueSpecifiers,
  };

  moduleCache.set(filename, result);

  return result;
};

export const moduleSpecifiers = (filename) => parseModule(filename).specifiers;

// What a module does that the import graph cannot follow: reading files,
// starting processes, loading modules by computed paths or touching the module
// registry.
export const moduleEffects = (filename) => parseModule(filename).effects;

const commentRanges = new Map();

const babelComments = (filename, text) => {
  try {
    return parse(text, {
      errorRecovery: true,
      plugins: /\.[cm]?tsx?$/u.test(filename)
        ? ['typescript', ...(filename.endsWith('x') ? ['jsx'] : [])]
        : ['jsx'],
      sourceType: 'unambiguous',
    }).comments.map(({ end, start }) => [start, end]);
  } catch {
    return [];
  }
};

const wholeLineShellComments = (text) =>
  [...text.matchAll(/^[\t ]*#.*$/gmu)].map((match) => [
    match.index,
    match.index + match[0].length,
  ]);

const commentsOf = (filename, text) => {
  if (!commentRanges.has(filename)) {
    let ranges = [];

    if (/\.[cm]?[jt]sx?$/u.test(filename)) {
      ranges = babelComments(filename, text);
    } else if (filename.endsWith('.sh')) {
      ranges = wholeLineShellComments(text);
    }
    commentRanges.set(filename, ranges);
  }

  return commentRanges.get(filename);
};

const certainlyCode = (text, index) => {
  const line = text.lastIndexOf('\n', index) + 1;
  if (text.slice(line, index).includes('//')) return false;
  const open = text.lastIndexOf('/*', index);
  if (open === -1) return true;
  const close = text.indexOf('*/', open + 2);
  return close !== -1 && close + 2 <= index;
};

/**
 * Whether `pattern` matches `filename` outside its comments. JavaScript and
 * TypeScript comments come from Babel and shell comments from whole `#`
 * lines; every other file is all code, so a JSON config's mention counts.
 */
export const mentionsOutsideComments = (filename, pattern) => {
  const text = fs.readFileSync(filename, 'utf-8');
  const flags = pattern.flags.includes('g')
    ? pattern.flags
    : `${pattern.flags}g`;
  const indexes = Array.from(
    text.matchAll(new RegExp(pattern.source, flags)),
    (match) => match.index
  );
  if (
    /\.[cm]?[jt]sx?$/u.test(filename) &&
    indexes.some((index) => certainlyCode(text, index))
  ) {
    return true;
  }
  const ranges = commentsOf(filename, text);

  return indexes.some(
    (index) => !ranges.some(([start, end]) => index >= start && index < end)
  );
};

const testPreloadAliases = new Map(
  getWorkspaceSourceEntries(repoRoot).map(({ sourceEntry, specifier }) => [
    specifier,
    sourceEntry,
  ])
);
const compilerOptionsByConfig = new Map();

const compilerOptions = (directory) => {
  const ts = loadTypeScript();
  const configPath = ts.findConfigFile(directory, ts.sys.fileExists);

  if (!compilerOptionsByConfig.has(configPath)) {
    if (configPath === undefined) {
      compilerOptionsByConfig.set(configPath, {
        allowJs: true,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        resolveJsonModule: true,
      });
    } else {
      const { config } = ts.readConfigFile(configPath, ts.sys.readFile);

      compilerOptionsByConfig.set(
        configPath,
        ts.parseJsonConfigFileContent(
          config,
          { ...ts.sys, readDirectory: () => [] },
          path.dirname(configPath)
        ).options
      );
    }
  }

  return compilerOptionsByConfig.get(configPath);
};

// Bun and Vite compile each file with its nearest tsconfig.json and the files
// that one extends.
export const tsconfigChain = (filename) => {
  const ts = loadTypeScript();
  const chain = [];
  const visitConfig = (configPath) => {
    if (!configPath || chain.includes(configPath)) return;

    chain.push(configPath);

    const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);

    if (error) {
      throw new Error(`${configPath} does not parse, so its chain is unknown`);
    }

    for (const parent of [config.extends ?? []].flat()) {
      if (!parent.startsWith('.')) {
        throw new Error(
          `${configPath} extends ${parent}, which the hash model cannot follow`
        );
      }

      visitConfig(path.resolve(path.dirname(configPath), parent));
    }
  };

  visitConfig(ts.findConfigFile(path.dirname(filename), ts.sys.fileExists));

  return chain;
};

const resolutionCache = new Map();

export const resolveImport = (fromFile, specifier) => {
  const directory = path.dirname(fromFile);
  const key = `${directory}\0${specifier}`;

  if (resolutionCache.has(key)) return resolutionCache.get(key);

  const request = specifier.split('?')[0];
  let resolved = testPreloadAliases.get(request);

  if (!resolved) {
    const ts = loadTypeScript();
    const { resolvedModule } = ts.resolveModuleName(
      request,
      fromFile,
      compilerOptions(directory),
      ts.sys
    );

    if (resolvedModule && !resolvedModule.isExternalLibraryImport) {
      resolved = resolvedModule.resolvedFileName;

      // TypeScript resolves a JavaScript module to its declaration file, but
      // the runtime loads the module.
      const runtimeFile = resolved.replace(
        /\.d\.([cm]?)ts$/u,
        (_, kind) => `.${kind}js`
      );

      if (runtimeFile !== resolved && fs.existsSync(runtimeFile)) {
        resolved = runtimeFile;
      }
    } else if (request.startsWith('.')) {
      const candidate = path.resolve(directory, request);

      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        resolved = candidate;
      }
    }
  }
  if (resolved) resolved = fs.realpathSync(resolved);

  const result =
    resolved && !resolved.includes('/node_modules/') ? resolved : null;

  resolutionCache.set(key, result);

  return result;
};

export const importClosure = (
  files,
  follows = () => true,
  specifiersOf = moduleSpecifiers
) => {
  const seen = new Set();
  const pending = [...files];

  while (pending.length > 0) {
    const filename = pending.pop();

    if (seen.has(filename)) continue;

    seen.add(filename);
    if (!follows(filename)) continue;

    for (const specifier of specifiersOf(filename)) {
      const resolved = resolveImport(filename, specifier);

      if (resolved) pending.push(resolved);
    }
  }

  return [...seen];
};

// The modules that loading `files` runs, leaving out type-only imports.
export const runtimeClosure = (files) =>
  importClosure(
    files,
    () => true,
    (filename) => parseModule(filename).valueSpecifiers
  );

export const usesMockModule = (file) =>
  importClosure([file], (filename) => !isTypecheckedSource(filename)).some(
    (filename) => fs.readFileSync(filename, 'utf-8').includes('mock.module(')
  );
