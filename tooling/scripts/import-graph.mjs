import { createHash, randomBytes } from 'node:crypto';
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

const parsesAsModule = (filename) =>
  /\.[cm]?[jt]sx?$/u.test(filename) && !filename.endsWith('.d.ts');

const parseSource = (filename, text) => {
  const specifiers = [];
  const valueSpecifiers = [];
  const effects = new Set();

  if (parsesAsModule(filename)) {
    const sourceFile = parse(text(), {
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

  return {
    effects: [...effects].sort((a, b) => a.localeCompare(b)),
    specifiers,
    valueSpecifiers,
  };
};

const parseModule = (filename) => {
  if (!moduleCache.has(filename)) {
    moduleCache.set(
      filename,
      parseSource(filename, () => fs.readFileSync(filename, 'utf-8'))
    );
  }

  return moduleCache.get(filename);
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
const readCompilerOptions = (ts, configPath, host) =>
  configPath === undefined
    ? {
        allowJs: true,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        resolveJsonModule: true,
      }
    : ts.parseJsonConfigFileContent(
        ts.readConfigFile(configPath, host.readFile).config,
        { ...host, readDirectory: () => [] },
        path.dirname(configPath)
      ).options;

const compilerOptionsByConfig = new Map();

const compilerOptions = (directory) => {
  const ts = loadTypeScript();
  const configPath = ts.findConfigFile(directory, ts.sys.fileExists);

  if (!compilerOptionsByConfig.has(configPath)) {
    compilerOptionsByConfig.set(
      configPath,
      readCompilerOptions(ts, configPath, ts.sys)
    );
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

// `io` answers every file system question resolution asks: `host` is the
// TypeScript module resolution host, and the rest are this module's own reads.
const resolveWith = (io, fromFile, specifier) => {
  const directory = path.dirname(fromFile);
  const request = specifier.split('?')[0];
  let resolved = testPreloadAliases.get(request);

  if (!resolved) {
    const ts = loadTypeScript();
    const { resolvedModule } = ts.resolveModuleName(
      request,
      fromFile,
      io.options(directory),
      io.host
    );

    if (resolvedModule && !resolvedModule.isExternalLibraryImport) {
      resolved = resolvedModule.resolvedFileName;

      // TypeScript resolves a JavaScript module to its declaration file, but
      // the runtime loads the module.
      const runtimeFile = resolved.replace(
        /\.d\.([cm]?)ts$/u,
        (_, kind) => `.${kind}js`
      );

      if (runtimeFile !== resolved && io.exists(runtimeFile)) {
        resolved = runtimeFile;
      }
    } else if (request.startsWith('.')) {
      const candidate = path.resolve(directory, request);

      if (io.isFile(candidate)) resolved = candidate;
    }
  }
  if (resolved) resolved = io.realpath(resolved);

  return resolved && !resolved.includes('/node_modules/') ? resolved : null;
};

const isFile = (file) => fs.existsSync(file) && fs.statSync(file).isFile();

const systemIo = {
  exists: fs.existsSync,
  get host() {
    return loadTypeScript().sys;
  },
  isFile,
  options: compilerOptions,
  realpath: fs.realpathSync,
};

const resolutionCache = new Map();

export const resolveImport = (fromFile, specifier) => {
  const key = `${path.dirname(fromFile)}\0${specifier}`;

  if (!resolutionCache.has(key)) {
    resolutionCache.set(key, resolveWith(systemIo, fromFile, specifier));
  }

  return resolutionCache.get(key);
};

const sha1 = (data) => createHash('sha1').update(data).digest('hex');

const writeAtomically = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${randomBytes(6).toString('hex')}`;
  fs.writeFileSync(temp, text);
  fs.renameSync(temp, file);
};

const STORE_DAYS = 14;

const sweepStore = (directory, keep) => {
  const cutoff = Date.now() - STORE_DAYS * 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(directory)) {
    const entry = path.join(directory, name);
    if (keep.has(entry) || fs.statSync(entry).mtimeMs > cutoff) continue;
    fs.rmSync(entry, { force: true, recursive: true });
  }
};

// The specifier store keeps at most this many entries per file a scan reads,
// so other checkouts' files stay without the store growing for ever.
const STORED_SPECIFIERS_PER_FILE = 3;

const isStringArray = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
// A missing or corrupt store file reads as empty, so the scan works it out again.
const readRecord = (file) => {
  try {
    const value = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
};

// TypeScript's system host reads a file this way.
const decodeText = (bytes) => {
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = Buffer.from(bytes.subarray(0, bytes.length & ~1));
    swapped.swap16();
    return swapped.toString('utf16le', 2);
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return bytes.toString('utf16le', 2);
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  ) {
    return bytes.toString('utf-8', 3);
  }
  return bytes.toString('utf-8');
};

const statOf = (file) => {
  try {
    return fs.statSync(file, { throwIfNoEntry: false });
  } catch {
    return undefined;
  }
};

const nativeRealpath = (file) => {
  try {
    return process.platform === 'win32' && file.length >= 260
      ? fs.realpathSync(file)
      : fs.realpathSync.native(file);
  } catch {
    return file;
  }
};

const storeSalt = () => {
  const require = createRequire(import.meta.url);
  return sha1(
    JSON.stringify([
      fs.readFileSync(fileURLToPath(import.meta.url), 'utf-8'),
      fs.realpathSync(require.resolve('@babel/parser')),
      fs.realpathSync(require.resolve('@typescript/typescript6')),
      [...testPreloadAliases],
      process.cwd(),
    ])
  );
};

// A stamp taken this soon after a file changed can miss a second change made
// within the same timestamp tick, so such a file is read again next time.
const SETTLE_NS = 2_000_000_000n;

const stampOf = (stat) =>
  `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`;

/**
 * `moduleSpecifiers` and `resolveImport` for a scan of the whole checkout at
 * `root` that remembers, under `directory`, what it learned. Each file's
 * specifiers are kept by the file's content, for every checkout of the clone.
 * Each resolution is kept for this checkout with the answer to every file
 * system question it asked, and is reused only while each question gets the
 * same answer, so a repeat scan parses and resolves only what changed. `save`
 * writes what this scan learned and drops what it did not use.
 */
export const storedGraph = (directory, root) => {
  const store = path.join(directory, storeSalt());
  const specifiersFile = path.join(store, 'specifiers.json');
  const checkoutFile = path.join(store, `checkout-${sha1(root)}.json`);
  const settled = BigInt(Date.now()) * 1_000_000n - SETTLE_NS;

  const storedSpecifiers = readRecord(specifiersFile);
  const checkout = readRecord(checkoutFile);
  const storedFiles =
    checkout.files && typeof checkout.files === 'object' ? checkout.files : {};
  const usedSpecifiers = new Map();
  const files = new Map();
  let parsed = false;
  let restamped = false;

  const knownSpecifiers = (key) => {
    const specifiers =
      usedSpecifiers.get(key) ??
      (Object.hasOwn(storedSpecifiers, key) ? storedSpecifiers[key] : null);
    return isStringArray(specifiers) ? specifiers : undefined;
  };
  const specifiersOf = (filename) => {
    if (!parsesAsModule(filename)) return [];
    const stat = fs.statSync(filename, { bigint: true });
    const stamp = stampOf(stat);
    const kept = Object.hasOwn(storedFiles, filename)
      ? storedFiles[filename]
      : null;
    let key = Array.isArray(kept) && kept[0] === stamp ? kept[1] : undefined;
    let specifiers = typeof key === 'string' && knownSpecifiers(key);
    if (!specifiers) {
      const bytes = fs.readFileSync(filename);
      key = sha1(bytes);
      specifiers = knownSpecifiers(key);
      if (!specifiers) {
        ({ specifiers } = parseSource(filename, () => bytes.toString('utf-8')));
        parsed = true;
      }
      restamped = true;
    }
    usedSpecifiers.set(key, specifiers);
    if (stat.ctimeNs < settled && stat.mtimeNs < settled) {
      files.set(filename, [stamp, key]);
    }
    return specifiers;
  };

  const texts = new Map();
  const realDirectories = new Map();
  // fs.realpathSync, sharing each directory's real path across files.
  const realpath = (file) => {
    const parent = path.dirname(file);
    if (parent === file || fs.lstatSync(file).isSymbolicLink()) {
      return fs.realpathSync(file);
    }
    if (!realDirectories.has(parent)) {
      realDirectories.set(parent, realpath(parent));
    }
    return path.join(realDirectories.get(parent), path.basename(file));
  };
  // Each file system question resolution asks, answered as TypeScript's
  // system host or this module's own read answers it.
  const questions = {
    directory: (file) => statOf(file)?.isDirectory() ?? false,
    exists: (file) => fs.existsSync(file),
    file: (file) => statOf(file)?.isFile() ?? false,
    isFile,
    nativeRealpath,
    read: (file) => {
      let bytes;
      try {
        bytes = fs.readFileSync(file);
      } catch {
        return null;
      }
      texts.set(file, decodeText(bytes));
      return sha1(bytes);
    },
    realpath,
  };
  const answers = new Map();
  let asked;
  const ask = (key, kind, file) => {
    asked?.add(key);
    if (!answers.has(key)) answers.set(key, questions[kind](file));
    return answers.get(key);
  };
  const askNew = (kind, file) => ask(JSON.stringify([kind, file]), kind, file);

  let host;
  const recordingHost = () => {
    const { sys } = loadTypeScript();
    host ??= {
      directoryExists: (file) => askNew('directory', file),
      fileExists: (file) => askNew('file', file),
      getCurrentDirectory: sys.getCurrentDirectory,
      readFile: (file) =>
        askNew('read', file) === null ? undefined : texts.get(file),
      realpath: (file) => askNew('nativeRealpath', file),
      useCaseSensitiveFileNames: sys.useCaseSensitiveFileNames,
    };
    return host;
  };
  // A directory's options come from questions that its first resolution asks,
  // so every later resolution from it asks them again.
  const configs = new Map();
  const io = {
    exists: (file) => askNew('exists', file),
    get host() {
      return recordingHost();
    },
    isFile: (file) => askNew('isFile', file),
    options: (fromDirectory) => {
      if (!configs.has(fromDirectory)) {
        const outer = asked;
        asked = new Set();
        const ts = loadTypeScript();
        const configPath = ts.findConfigFile(
          fromDirectory,
          recordingHost().fileExists
        );
        const options = readCompilerOptions(ts, configPath, recordingHost());
        configs.set(fromDirectory, { asked, options });
        asked = outer;
      }
      const config = configs.get(fromDirectory);
      for (const key of config.asked) asked.add(key);
      return config.options;
    },
    realpath: (file) => askNew('realpath', file),
  };

  const storedQuestions = Array.isArray(checkout.questions)
    ? checkout.questions
    : [];
  // Each stored question's key while its answer still holds, else null.
  const holding = [];
  const holds = (index) => {
    if (!Number.isInteger(index)) return null;
    if (holding[index] === undefined) {
      holding[index] = null;
      const question = storedQuestions[index];
      if (Array.isArray(question) && Object.hasOwn(questions, question[0])) {
        const [kind, file, answer] = question;
        const key = JSON.stringify([kind, file]);
        try {
          if (typeof file === 'string' && ask(key, kind, file) === answer) {
            holding[index] = key;
          }
        } catch {
          // A question that now throws has a different answer.
        }
      }
    }
    return holding[index];
  };
  const storedResolutions = new Map(
    Array.isArray(checkout.resolutions)
      ? checkout.resolutions
          .filter(
            (entry) =>
              Array.isArray(entry) &&
              typeof entry[0] === 'string' &&
              (entry[1] === null || typeof entry[1] === 'string')
          )
          .map(([key, result, ...indexes]) => [key, { indexes, result }])
      : []
  );
  const resolutions = new Map();
  let resolved = false;

  const resolve = (fromFile, specifier) => {
    const key = `${path.dirname(fromFile)}\0${specifier}`;
    if (resolutions.has(key)) return resolutions.get(key).result;
    const kept = storedResolutions.get(key);
    const keys = kept?.indexes.map(holds);
    // Every resolution asks at least for its file's real path.
    if (keys?.length > 0 && keys.every(Boolean)) {
      resolutions.set(key, { asked: keys, result: kept.result });
      return kept.result;
    }
    asked = new Set();
    const result = resolveWith(io, fromFile, specifier);
    resolutions.set(key, { asked: [...asked], result });
    asked = undefined;
    resolved = true;
    return result;
  };

  const save = () => {
    try {
      if (parsed) {
        const entries = [
          ...Object.entries(readRecord(specifiersFile)).filter(
            ([key]) => !usedSpecifiers.has(key)
          ),
          ...usedSpecifiers,
        ];
        writeAtomically(
          specifiersFile,
          JSON.stringify(
            Object.fromEntries(
              entries.slice(
                -STORED_SPECIFIERS_PER_FILE * Math.max(usedSpecifiers.size, 1)
              )
            )
          )
        );
      }
      if (parsed || resolved || restamped) {
        const indexOf = new Map();
        const written = [...resolutions].map(
          ([key, { asked: questionKeys, result }]) => [
            key,
            result,
            ...questionKeys.map((question) => {
              if (!indexOf.has(question)) indexOf.set(question, indexOf.size);
              return indexOf.get(question);
            }),
          ]
        );
        writeAtomically(
          checkoutFile,
          JSON.stringify({
            files: Object.fromEntries(files),
            questions: [...indexOf.keys()].map((question) => [
              ...JSON.parse(question),
              answers.get(question),
            ]),
            resolutions: written,
          })
        );
        sweepStore(directory, new Set([store]));
        sweepStore(store, new Set([specifiersFile, checkoutFile]));
      }
    } catch {
      // The store only saves time; a scan that cannot write it is still right.
    }
  };

  return { moduleSpecifiers: specifiersOf, resolveImport: resolve, save };
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
