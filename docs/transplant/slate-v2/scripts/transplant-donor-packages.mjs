#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const donorCommit = 'f0e5ad1ae7caa14027dc57bc38bd457909bd4b97';

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value`);
  }

  return value;
}

const donorRepoInput = readOption('--donor') ?? process.env.SLATE_V2_DONOR_DIR;
if (!donorRepoInput) {
  throw new Error(
    'Missing donor checkout path. Pass --donor <path> or set SLATE_V2_DONOR_DIR.'
  );
}

const donorRepo = path.resolve(repoRoot, donorRepoInput);

const packageVersion = '54.0.0-beta.0';

const packageMap = [
  {
    from: 'slate',
    to: 'slate',
    name: '@platejs/slate',
    customBuild: true,
  },
  {
    from: 'slate-dom',
    to: 'slate-dom',
    name: '@platejs/slate-dom',
    customBuild: true,
  },
  {
    from: 'slate-react',
    to: 'slate-react',
    name: '@platejs/slate-react',
  },
  {
    from: 'slate-history',
    to: 'slate-history',
    name: '@platejs/slate-history',
  },
  {
    from: 'slate-hyperscript',
    to: 'slate-hyperscript',
    name: '@platejs/slate-hyperscript',
  },
  {
    from: 'slate-layout',
    to: 'slate-layout',
    name: '@platejs/slate-layout',
    customBuild: true,
  },
  {
    from: 'slate-browser',
    to: 'browser',
    name: '@platejs/test',
    customBuild: true,
  },
  {
    from: 'slate-yjs',
    to: 'yjs',
    name: '@platejs/yjs',
    customBuild: true,
  },
];

const specifierMap = new Map([
  ['@slate/yjs', '@platejs/yjs'],
  ['slate-browser', '@platejs/test'],
  ['slate-dom', '@platejs/slate-dom'],
  ['slate-history', '@platejs/slate-history'],
  ['slate-hyperscript', '@platejs/slate-hyperscript'],
  ['slate-layout', '@platejs/slate-layout'],
  ['slate-react', '@platejs/slate-react'],
  ['slate', '@platejs/slate'],
]);

const dependencyVersionOverrides = new Map([
  ['@happy-dom/global-registrator', '20.0.10'],
  ['@playwright/test', '1.53.0'],
  ['@testing-library/dom', '10.4.0'],
  ['@testing-library/jest-dom', '6.6.3'],
  ['@testing-library/react', '16.3.0'],
  ['@types/node', '24.12.0'],
  ['@types/react', '19.2.7'],
  ['@types/react-dom', '19.2.3'],
  ['react', '19.2.4'],
  ['react-dom', '19.2.4'],
]);

const generatedSegments = new Set(['dist', '.turbo', 'node_modules']);
const textFilePattern =
  /\.(cjs|cts|d\.ts|js|json|jsx|md|mjs|mts|ts|tsx|txt|yml)$/;
const platejsPackageRegexLiteralPattern = /\/.*@platejs\//;
const slateBrowserHeadingPattern = /^# slate-browser$/m;
const slateBrowserInstallPattern =
  /npm install -D slate-browser @playwright\/test/g;
const slateBrowserSubpathPattern = /slate-browser\//g;
const slateBrowserGreetingPattern = /Hello from slate-browser/g;
const slateBrowserCommandBlockPattern =
  /Root commands:\n\n(?:- `.*`\n)+\nThe package-local/;
const slateSourceTestSetup = '../../config/slate-source-test-setup.ts';
const sourceFirstPaths = {
  '@platejs/test': ['../test/src/index.ts'],
  '@platejs/test/browser': ['../test/src/browser/index.ts'],
  '@platejs/test/playwright': ['../test/src/playwright/index.ts'],
  '@platejs/test/proof': ['../test/src/proof/index.ts'],
  '@platejs/test/react': ['../test/src/react/index.ts'],
  '@platejs/slate': ['../slate/src/index.ts'],
  '@platejs/slate/internal': ['../slate/src/internal/index.ts'],
  '@platejs/slate-dom': ['../slate-dom/src/index.ts'],
  '@platejs/slate-dom/internal': ['../slate-dom/src/internal/index.ts'],
  '@platejs/slate-history': ['../slate-history/src/index.ts'],
  '@platejs/slate-hyperscript': ['../slate-hyperscript/src/index.ts'],
  '@platejs/slate-layout': ['../slate-layout/src/index.ts'],
  '@platejs/slate-layout/react': ['../slate-layout/src/react.tsx'],
  '@platejs/slate-react': ['../slate-react/src/index.ts'],
  '@platejs/yjs': ['../yjs/src/index.ts'],
  '@platejs/yjs/plate': ['../yjs/src/plate/index.ts'],
  '@platejs/yjs/react': ['../yjs/src/react/index.ts'],
};

const runGit = (args, options = {}) =>
  execFileSync('git', ['-C', donorRepo, ...args], {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: 1024 * 1024 * 64,
  });

const ensureDonorCommit = () => {
  const exists = runGit(['cat-file', '-e', `${donorCommit}^{commit}`], {
    encoding: 'buffer',
  });

  if (exists !== '') {
    // `git cat-file -e` has no stdout on success.
  }
};

const listDonorFiles = (packageName) =>
  runGit([
    'ls-tree',
    '-r',
    '--name-only',
    donorCommit,
    `packages/${packageName}`,
  ])
    .split('\n')
    .filter(Boolean)
    .filter((filePath) => {
      const segments = filePath.split('/');

      return !segments.some((segment) => generatedSegments.has(segment));
    });

const readDonorFile = (filePath) =>
  execFileSync('git', ['-C', donorRepo, 'show', `${donorCommit}:${filePath}`], {
    maxBuffer: 1024 * 1024 * 64,
  });

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const escapePlatejsPackageRegexLiterals = (content) =>
  content
    .split('\n')
    .map((line) =>
      platejsPackageRegexLiteralPattern.test(line)
        ? line.replaceAll('@platejs/', '@platejs\\/')
        : line
    )
    .join('\n');

const removePackageDestination = (destination) => {
  const absoluteDestination = path.join(repoRoot, 'packages', destination);

  fs.rmSync(absoluteDestination, { force: true, recursive: true });
  fs.mkdirSync(absoluteDestination, { recursive: true });
};

const rewritePackageSpecifiers = (content) => {
  let rewritten = content;

  for (const [oldName, newName] of specifierMap) {
    const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    rewritten = rewritten.replace(
      new RegExp(`(['"])${escaped}((?:/[A-Za-z0-9_.-]+)*)\\1`, 'g'),
      (_match, quote, subpath) => `${quote}${newName}${subpath}${quote}`
    );
  }

  rewritten = rewritten
    .replaceAll('@slate/yjs', '@platejs/yjs')
    .replaceAll('packages/slate-browser', 'packages/test')
    .replaceAll('packages/slate-yjs', 'packages/yjs')
    .replaceAll('slate-browser/', '@platejs/test/')
    .replaceAll('slate-yjs/', '@platejs/yjs/')
    .replaceAll(
      '../../config/typescript/tsconfig.json',
      '../../tooling/config/tsconfig.base.json'
    )
    .replaceAll(
      '../../config/typescript/tsconfig.dts.json',
      '../../tooling/config/tsconfig.build.json'
    )
    .replaceAll(
      '../../config/tsdown.config.mts',
      '../../tooling/config/tsdown.config.ts'
    );

  return escapePlatejsPackageRegexLiterals(rewritten);
};

const rewriteDependencyMap = (dependencies) => {
  if (!dependencies) return;

  const rewritten = {};

  for (const [name, version] of Object.entries(dependencies)) {
    const mapped = specifierMap.get(name) ?? name;

    if (mapped.startsWith('@platejs/')) {
      rewritten[mapped] = 'workspace:^';
      continue;
    }

    rewritten[mapped] = dependencyVersionOverrides.get(mapped) ?? version;
  }

  return Object.keys(rewritten).length > 0 ? rewritten : undefined;
};

const rewritePeerDependencyMap = (dependencies) => {
  if (!dependencies) return;

  const rewritten = {};

  for (const [name, version] of Object.entries(dependencies)) {
    const mapped = specifierMap.get(name) ?? name;

    if (mapped.startsWith('@platejs/')) {
      rewritten[mapped] = `>=${packageVersion}`;
      continue;
    }

    rewritten[mapped] = version;
  }

  return Object.keys(rewritten).length > 0 ? rewritten : undefined;
};

const rewriteTestScript = (script) => {
  const rewritten = rewritePackageSpecifiers(script);

  if (!rewritten.startsWith('bun test')) return rewritten;
  if (rewritten.includes('--preload ')) return rewritten;

  return rewritten.replace(
    'bun test',
    `bun test --preload ${slateSourceTestSetup}`
  );
};

const createScripts = (donorPackageJson, customBuild) => {
  const scripts = {
    brl: "echo 'No barrels to generate'",
    build: customBuild
      ? 'tsdown --config ./tsdown.config.mts --log-level warn'
      : 'plate-pkg p:build',
    clean: 'rimraf dist lib',
    lint: 'plate-pkg p:lint',
    'lint:fix': 'plate-pkg p:lint:fix',
    test: rewriteTestScript(donorPackageJson.scripts?.test ?? 'bun test'),
    typecheck: 'tsc --project tsconfig.json --noEmit',
  };

  for (const [name, script] of Object.entries(donorPackageJson.scripts ?? {})) {
    if (name.startsWith('test:')) {
      scripts[name] = rewriteTestScript(script);
    }
  }

  return scripts;
};

const createTsConfig = (packageName) => {
  const types = packageName === 'browser' ? ['node'] : [];
  const usesReactJsx =
    packageName === 'slate-react' ||
    packageName === 'slate-layout' ||
    packageName === 'yjs';

  if (usesReactJsx) {
    types.push('node', 'react', 'react-dom');
  }

  return {
    extends: '../../tooling/config/tsconfig.base.json',
    include: ['src', '../../tooling/config/global.d.ts'],
    exclude: [],
    compilerOptions: {
      paths: sourceFirstPaths,
      ...(usesReactJsx ? { jsx: 'react-jsx' } : {}),
      ...(types.length > 0 ? { types: [...new Set(types)] } : {}),
    },
  };
};

const createTsBuildConfig = (packageName) => ({
  extends: '../../tooling/config/tsconfig.build.json',
  compilerOptions: {
    outDir: './dist',
    ...(packageName === 'slate-react' ||
    packageName === 'slate-layout' ||
    packageName === 'yjs'
      ? { jsx: 'react-jsx' }
      : {}),
  },
  include: ['src'],
});

const updatePackageJson = (target, packageEntry) => {
  const packageJsonPath = path.join(
    repoRoot,
    'packages',
    packageEntry.to,
    'package.json'
  );
  const donorPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const exportsField = {
    ...donorPackageJson.exports,
    './package.json': './package.json',
  };
  const dependencies = rewriteDependencyMap(donorPackageJson.dependencies);
  const devDependencies = {
    ...rewriteDependencyMap(donorPackageJson.devDependencies),
    '@plate/scripts': 'workspace:*',
  };
  const peerDependencies = rewritePeerDependencyMap(
    donorPackageJson.peerDependencies
  );
  const peerDependenciesMeta = donorPackageJson.peerDependenciesMeta;

  const rewritten = {
    name: packageEntry.name,
    version: packageVersion,
    description: donorPackageJson.description,
    keywords: donorPackageJson.keywords,
    homepage: 'https://platejs.org',
    bugs: {
      url: 'https://github.com/udecode/plate/issues',
    },
    repository: {
      type: 'git',
      url: 'https://github.com/udecode/plate.git',
      directory: `packages/${packageEntry.to}`,
    },
    license: 'MIT',
    sideEffects: donorPackageJson.sideEffects ?? false,
    type: 'module',
    exports: exportsField,
    main: donorPackageJson.main,
    module: donorPackageJson.module ?? donorPackageJson.main,
    types: donorPackageJson.types,
    files: ['dist/**/*'],
    scripts: createScripts(donorPackageJson, packageEntry.customBuild),
    dependencies,
    devDependencies,
    peerDependencies,
    peerDependenciesMeta,
    publishConfig: {
      access: 'public',
    },
  };

  for (const key of [
    'dependencies',
    'peerDependencies',
    'peerDependenciesMeta',
  ]) {
    if (!rewritten[key]) {
      delete rewritten[key];
    }
  }

  writeFile(packageJsonPath, `${JSON.stringify(rewritten, null, 2)}\n`);
  writeFile(
    path.join(target, 'tsconfig.json'),
    `${JSON.stringify(createTsConfig(packageEntry.to), null, 2)}\n`
  );
  writeFile(
    path.join(target, 'tsconfig.build.json'),
    `${JSON.stringify(createTsBuildConfig(packageEntry.to), null, 2)}\n`
  );
};

const updateFixtureRunner = (target, packageEntry) => {
  if (packageEntry.to !== 'slate' && packageEntry.to !== 'slate-history') {
    return;
  }

  const runnerPath = path.join(target, 'test/index.spec.ts');

  if (!fs.existsSync(runnerPath)) return;

  const runner = fs.readFileSync(runnerPath, 'utf8');

  if (runner.startsWith("import './index.js'\n")) return;

  writeFile(runnerPath, `import './index.js'\n${runner}`);
};

const updateBrowserReadme = (target, packageEntry) => {
  if (packageEntry.to !== 'browser') return;

  const readmePath = path.join(target, 'README.md');

  if (!fs.existsSync(readmePath)) return;

  const readme = fs.readFileSync(readmePath, 'utf8');
  const rewritten = readme
    .replace(slateBrowserHeadingPattern, '# @platejs/test')
    .replace(/`slate-browser`/g, '`@platejs/test`')
    .replace(
      slateBrowserInstallPattern,
      'npm install -D @platejs/test @playwright/test'
    )
    .replace(slateBrowserSubpathPattern, '@platejs/test/')
    .replace(slateBrowserGreetingPattern, 'Hello from @platejs/test')
    .replace(
      slateBrowserCommandBlockPattern,
      `${[
        'Package commands:',
        '',
        '- `pnpm --filter @platejs/test build`',
        '- `pnpm --filter @platejs/test test`',
        '- `pnpm --filter @platejs/test test:proof`',
        '- `pnpm --filter @platejs/test test:dom`',
        '- `pnpm --filter @platejs/test test:selection`',
      ].join('\n')}\n\nThe package-local`
    );

  writeFile(readmePath, rewritten);
};

const copyPackage = (packageEntry) => {
  const target = path.join(repoRoot, 'packages', packageEntry.to);
  removePackageDestination(packageEntry.to);

  const donorFiles = listDonorFiles(packageEntry.from);

  for (const donorFilePath of donorFiles) {
    const relativePath = donorFilePath.slice(
      `packages/${packageEntry.from}/`.length
    );
    const normalizedRelativePath =
      relativePath === 'Readme.md' ? 'README.md' : relativePath;
    const destinationPath = path.join(target, normalizedRelativePath);
    const content = readDonorFile(donorFilePath);

    if (textFilePattern.test(relativePath)) {
      writeFile(
        destinationPath,
        rewritePackageSpecifiers(content.toString('utf8'))
      );
      continue;
    }

    writeFile(destinationPath, content);
  }

  updatePackageJson(target, packageEntry);
  updateFixtureRunner(target, packageEntry);
  updateBrowserReadme(target, packageEntry);

  return {
    package: packageEntry.name,
    path: `packages/${packageEntry.to}`,
    copiedFiles: donorFiles.length,
  };
};

ensureDonorCommit();

const results = packageMap.map(copyPackage);

console.log(JSON.stringify({ donorCommit, packages: results }, null, 2));
