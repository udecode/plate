import { execFileSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative, resolve } from 'node:path';

import type { Command } from 'commander';
import kleur from 'kleur';
import prompts from 'prompts';

import { getPackageManager } from '../deps/utils/get-package-manager';
import { CODEMODS, getCodemod } from './registry';
import type { CodemodDiagnostic } from './types';

const SOURCE_EXTENSIONS = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);

const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.source',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);

const PLITE_RESIDUAL_PATTERN =
  /(?:from\s+|import\s*\(\s*|require\s*\(\s*|vi\.mock\s*\(\s*|jest\.mock\s*\(\s*|mock\.module\s*\(\s*)['"]plitejs(?:\/[^'"]*)?['"]/;

const readCliVersion = (): string => {
  const req = createRequire(import.meta.url);

  for (const rel of ['../package.json', '../../package.json']) {
    try {
      const pkg = req(rel) as { name?: string; version?: string };
      if (pkg.name === '@platejs/cli' && typeof pkg.version === 'string') {
        return pkg.version;
      }
    } catch {
      // Bundled dist/bin.js resolves ../package.json; source tests resolve ../../package.json.
    }
  }

  return '0.0.0';
};

const cliVersion = readCliVersion();

export type RunCodemodOptions = Readonly<{
  cwd?: string;
  dry?: boolean;
  force?: boolean;
  install?: boolean;
  packageJson?: boolean;
  path?: string;
  print?: boolean;
  transform: string;
  yes?: boolean;
}>;

export type PackageJsonSwapResult = Readonly<{
  addedPlatejs: boolean;
  packageJsonPath: string | null;
  removedPlitejs: boolean;
  residualFiles: readonly string[];
  updated: boolean;
}>;

export type RunCodemodSummary = Readonly<{
  diagnostics: readonly CodemodDiagnostic[];
  filesChanged: number;
  filesScanned: number;
  filesSkipped: number;
  packageJson: PackageJsonSwapResult;
  printed: ReadonlyArray<Readonly<{ code: string; file: string }>>;
}>;

const collectSourceFiles = (entryPath: string): string[] => {
  const stats = statSync(entryPath);
  if (stats.isFile()) {
    return SOURCE_EXTENSIONS.has(extname(entryPath).toLowerCase())
      ? [entryPath]
      : [];
  }
  if (!stats.isDirectory()) return [];

  const results: string[] = [];
  const stack = [entryPath];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const entries = readdirSync(current, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue;
        stack.push(join(current, entry.name));
      } else if (
        entry.isFile() &&
        SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase())
      ) {
        results.push(join(current, entry.name));
      }
    }
  }

  return results.sort();
};

const getDirtyGitFiles = (cwd: string): string[] | null => {
  try {
    const inside = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (inside !== 'true') return null;

    const status = execFileSync('git', ['status', '--porcelain'], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const lines = status
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return lines;
  } catch {
    return null;
  }
};

const findNearestPackageJson = (startPath: string): string | null => {
  let current = statSync(startPath).isDirectory()
    ? startPath
    : dirname(startPath);

  while (true) {
    const candidate = join(current, 'package.json');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
};

const scanPackageForResidualPlite = (packageRoot: string): string[] => {
  const files = collectSourceFiles(packageRoot);
  const residual: string[] = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    if (PLITE_RESIDUAL_PATTERN.test(content)) {
      residual.push(file);
    }
  }

  return residual;
};

type PackageJsonDoc = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
};

const DEP_SECTIONS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
] as const;

const updateOwningPackageJson = (
  targetPath: string,
  dry: boolean
): PackageJsonSwapResult => {
  const packageJsonPath = findNearestPackageJson(targetPath);
  if (!packageJsonPath) {
    return {
      addedPlatejs: false,
      packageJsonPath: null,
      removedPlitejs: false,
      residualFiles: [],
      updated: false,
    };
  }

  const packageRoot = dirname(packageJsonPath);
  const residualFiles = scanPackageForResidualPlite(packageRoot);
  const raw = readFileSync(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(raw) as PackageJsonDoc;

  const hasExistingPlatejs = DEP_SECTIONS.some(
    (section) => typeof pkg[section]?.platejs === 'string'
  );
  const plitejsSection = DEP_SECTIONS.find(
    (section) => typeof pkg[section]?.plitejs === 'string'
  );
  const plitejsSpec = plitejsSection ? pkg[plitejsSection]?.plitejs : undefined;

  let addedPlatejs = false;
  let removedPlitejs = false;

  if (!hasExistingPlatejs) {
    const nextSpec =
      plitejsSpec &&
      (plitejsSpec.startsWith('workspace:') ||
        plitejsSpec.startsWith('catalog:'))
        ? plitejsSpec
        : `^${cliVersion}`;
    const targetSection = plitejsSection ?? 'dependencies';
    pkg[targetSection] = {
      ...pkg[targetSection],
      platejs: nextSpec,
    };
    addedPlatejs = true;
  }

  if (residualFiles.length === 0) {
    for (const section of DEP_SECTIONS) {
      const deps = pkg[section];
      if (deps && Object.hasOwn(deps, 'plitejs')) {
        delete deps.plitejs;
        removedPlitejs = true;
      }
    }
  }

  const updated = addedPlatejs || removedPlitejs;
  if (updated && !dry) {
    for (const section of DEP_SECTIONS) {
      const deps = pkg[section];
      if (deps) {
        const sorted: Record<string, string> = {};
        for (const key of Object.keys(deps).sort()) {
          const val = deps[key];
          if (val !== undefined) {
            sorted[key] = val;
          }
        }
        pkg[section] = sorted;
      }
    }
    writeFileSync(
      packageJsonPath,
      `${JSON.stringify(pkg, null, 2)}\n`,
      'utf-8'
    );
  }

  return {
    addedPlatejs,
    packageJsonPath,
    removedPlitejs,
    residualFiles,
    updated,
  };
};

export const runCodemod = async (
  options: RunCodemodOptions
): Promise<RunCodemodSummary> => {
  const codemod = getCodemod(options.transform);
  if (!codemod) {
    const available = CODEMODS.map((c) => c.id).join(', ');
    throw new Error(
      `Unknown codemod "${options.transform}". Available codemods: ${available}`
    );
  }

  const cwd = resolve(options.cwd ?? process.cwd());
  const targetPath = resolve(cwd, options.path ?? '.');
  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist: ${targetPath}`);
  }

  const dry = Boolean(options.dry);
  const force = Boolean(options.force);

  // Dirty git working tree guard: ONLY --force bypasses it (never --yes / non-TTY).
  if (!dry && !force) {
    const dirty = getDirtyGitFiles(cwd);
    if (dirty && dirty.length > 0) {
      const preview = dirty.slice(0, 10).join('\n  ');
      const extra =
        dirty.length > 10 ? `\n  ... and ${dirty.length - 10} more` : '';
      throw new Error(
        `Git working tree has uncommitted changes:\n  ${preview}${extra}\nCommit or stash your changes first, or pass --force to run anyway.`
      );
    }
  }

  const files = collectSourceFiles(targetPath);
  const diagnostics: CodemodDiagnostic[] = [];
  const printed: Array<{ code: string; file: string }> = [];
  let filesChanged = 0;
  let filesSkipped = 0;

  for (const file of files) {
    const source = readFileSync(file, 'utf-8');
    const result = codemod.transform({ filePath: file, source });
    diagnostics.push(...result.diagnostics);

    if (result.skipped) {
      filesSkipped += 1;
      continue;
    }

    if (result.changed) {
      filesChanged += 1;
      if (options.print) {
        printed.push({ code: result.code, file });
      }
      if (!dry) {
        writeFileSync(file, result.code, 'utf-8');
      }
    }
  }

  let packageJson: PackageJsonSwapResult = {
    addedPlatejs: false,
    packageJsonPath: null,
    removedPlitejs: false,
    residualFiles: [],
    updated: false,
  };

  if (
    codemod.updatesPackageJson &&
    options.packageJson !== false &&
    filesChanged > 0
  ) {
    packageJson = updateOwningPackageJson(targetPath, dry);

    if (
      !dry &&
      packageJson.updated &&
      packageJson.packageJsonPath &&
      options.install !== false
    ) {
      const packageRoot = dirname(packageJson.packageJsonPath);
      const pm = await getPackageManager(packageRoot);
      execFileSync(pm, ['install'], {
        cwd: packageRoot,
        stdio: 'inherit',
      });
    }
  }

  return {
    diagnostics,
    filesChanged,
    filesScanned: files.length,
    filesSkipped,
    packageJson,
    printed,
  };
};

const formatSummary = (
  summary: RunCodemodSummary,
  cwd: string,
  dry: boolean
): string => {
  const lines: string[] = [];
  const verb = dry ? 'Would transform' : 'Transformed';
  lines.push(
    kleur.bold(
      `${verb} ${summary.filesChanged} of ${summary.filesScanned} files (${summary.filesSkipped} skipped).`
    )
  );

  if (summary.packageJson.packageJsonPath) {
    const relPkg =
      relative(cwd, summary.packageJson.packageJsonPath) || 'package.json';
    if (summary.packageJson.updated) {
      const actions: string[] = [];
      if (summary.packageJson.addedPlatejs) actions.push('added platejs');
      if (summary.packageJson.removedPlitejs) actions.push('removed plitejs');
      lines.push(
        `${dry ? 'Would update' : 'Updated'} ${relPkg} (${actions.join(', ')}).`
      );
    }
    if (summary.packageJson.residualFiles.length > 0) {
      lines.push(
        kleur.yellow(
          `Kept plitejs in ${relPkg} because ${summary.packageJson.residualFiles.length} file(s) still reference plitejs:`
        )
      );
      for (const file of summary.packageJson.residualFiles.slice(0, 10)) {
        lines.push(`  - ${relative(cwd, file)}`);
      }
    }
  }

  if (summary.diagnostics.length > 0) {
    const byKind = {
      manual: summary.diagnostics.filter((d) => d.kind === 'manual'),
      scaffold: summary.diagnostics.filter((d) => d.kind === 'scaffold'),
      warning: summary.diagnostics.filter((d) => d.kind === 'warning'),
    };
    lines.push(
      `\nDiagnostics: ${byKind.manual.length} manual, ${byKind.scaffold.length} scaffold, ${byKind.warning.length} warning`
    );
    for (const diag of summary.diagnostics) {
      const rel = relative(cwd, diag.file) || diag.file;
      const badge =
        diag.kind === 'manual'
          ? kleur.red('[manual]')
          : diag.kind === 'scaffold'
            ? kleur.cyan('[scaffold]')
            : kleur.yellow('[warning]');
      lines.push(
        `  ${badge} ${rel}:${diag.line}:${diag.column} (${diag.code}) ${diag.message}`
      );
      if (diag.hint) {
        lines.push(`    hint: ${diag.hint}`);
      }
    }
  }

  lines.push(
    '\nNext step: run `npx @platejs/cli generate` once your Plate plugins are wired.'
  );

  return `${lines.join('\n')}\n`;
};

export const registerCodemodCommand = (program: Command) => {
  program
    .command('codemod')
    .description('Run automated Plate migration codemods.')
    .argument('[transform]', 'codemod name (e.g. plite-to-plate)')
    .argument('[path]', 'target file or directory', '.')
    .option('--dry', 'preview changes without writing files or package.json')
    .option('--print', 'print transformed file contents to stdout')
    .option(
      '--force',
      'run even when the git working tree has uncommitted changes'
    )
    .option('-y, --yes', 'skip interactive confirmation prompts')
    .option(
      '--no-install',
      'skip running package manager install after package.json update'
    )
    .option('--no-package-json', 'skip updating package.json dependencies')
    .option('--cwd <path>', 'working directory', process.cwd())
    .action(
      async (
        transformArg: string | undefined,
        pathArg: string | undefined,
        cliOptions: Readonly<{
          cwd: string;
          dry?: boolean;
          force?: boolean;
          install?: boolean;
          packageJson?: boolean;
          print?: boolean;
          yes?: boolean;
        }>
      ) => {
        const isInteractive = Boolean(process.stdin.isTTY) && !cliOptions.yes;
        let transform = transformArg;
        let targetPath = pathArg ?? '.';

        if (!transform) {
          if (!isInteractive) {
            const available = CODEMODS.map((c) => c.id).join(', ');
            throw new Error(
              `Missing codemod name. Available codemods: ${available}`
            );
          }
          const response = await prompts({
            choices: CODEMODS.map((c) => ({
              description: c.description,
              title: c.id,
              value: c.id,
            })),
            message: 'Select a codemod to run:',
            name: 'transform',
            type: 'select',
          });
          if (!response.transform) {
            throw new Error('Codemod cancelled.');
          }
          transform = String(response.transform);
        }

        if (!pathArg && isInteractive) {
          const response = await prompts({
            initial: '.',
            message: 'Target directory or file:',
            name: 'path',
            type: 'text',
          });
          if (typeof response.path === 'string' && response.path.trim()) {
            targetPath = response.path.trim();
          }
        }

        const summary = await runCodemod({
          cwd: cliOptions.cwd,
          dry: cliOptions.dry,
          force: cliOptions.force,
          install: cliOptions.install,
          packageJson: cliOptions.packageJson,
          path: targetPath,
          print: cliOptions.print,
          transform,
          yes: cliOptions.yes || !process.stdin.isTTY,
        });

        for (const item of summary.printed) {
          const rel = relative(cliOptions.cwd, item.file) || item.file;
          process.stdout.write(`=== ${rel} ===\n${item.code}\n`);
        }

        process.stdout.write(
          formatSummary(
            summary,
            resolve(cliOptions.cwd),
            Boolean(cliOptions.dry)
          )
        );
      }
    );
};
