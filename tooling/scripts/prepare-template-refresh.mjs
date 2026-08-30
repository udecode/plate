#!/usr/bin/env node

import { realpathSync } from 'node:fs';
import { access, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWED_SCOPED_PACKAGES = new Set(['@platejs/test', '@platejs/cli']);
const DEPENDENCY_SECTIONS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'overrides',
  'peerDependencies',
  'resolutions',
];
const GENERATED_SOURCE_DIRECTORIES = [
  'src/app/api',
  'src/app/editor',
  'src/components',
  'src/hooks',
];
const PRESERVED_LIBRARY_FILES = new Set(['src/lib/utils.ts']);
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);
const STALE_SOURCE_PATHS = ['src/app/api/ai/command/prompt/index.ts'];

if (isMainModule()) {
  await main();
}

async function main() {
  const args = process.argv.slice(2);
  const finalize = args[0] === '--finalize';
  const templateDirs = finalize ? args.slice(1) : args;

  if (templateDirs.length === 0) {
    console.error(
      'Usage: node tooling/scripts/prepare-template-refresh.mjs <template-dir> [template-dir...]'
    );
    process.exit(1);
  }

  for (const templateDir of templateDirs) {
    const absoluteTemplateDir = path.resolve(templateDir);

    if (finalize) {
      const result = await finalizeTemplateRefresh(absoluteTemplateDir);

      console.log(
        `Validated retired package removal and normalized ${result.normalizedCssFiles.length} CSS files in ${templateDir}.`
      );
      continue;
    }

    const result = await prepareTemplateRefresh(absoluteTemplateDir);

    console.log(
      `Removed ${result.dependencyNames.length} retired dependencies and ${result.sourceFiles.length} retired source files from ${templateDir}.`
    );
  }
}

async function prepareTemplateRefresh(templateDir) {
  const packageJsonPath = path.join(templateDir, 'package.json');
  const sourceDir = path.join(templateDir, 'src');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  const dependencyNames = removeRetiredDependencies(packageJson);
  const sourceFiles = await removeGeneratedSources(templateDir);

  await syncTooltipProvider(templateDir);
  await removeTemporaryBiomeOverrides(path.join(templateDir, 'biome.jsonc'));

  for (const staleSourcePath of STALE_SOURCE_PATHS) {
    if (await removeFileIfExists(path.join(templateDir, staleSourcePath))) {
      sourceFiles.push(staleSourcePath);
    }
  }

  for (const sourceFile of await listFiles(sourceDir)) {
    if (!SOURCE_EXTENSIONS.has(path.extname(sourceFile))) continue;

    const source = await readFile(sourceFile, 'utf-8');

    if (!containsRetiredPackageReference(source)) continue;

    await rm(sourceFile);
    sourceFiles.push(path.relative(templateDir, sourceFile));
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  return {
    dependencyNames: dependencyNames.toSorted((a, b) => a.localeCompare(b)),
    sourceFiles: sourceFiles.toSorted((a, b) => a.localeCompare(b)),
  };
}

async function removeGeneratedSources(templateDir) {
  const sourceFiles = [];

  for (const relativeDirectory of GENERATED_SOURCE_DIRECTORIES) {
    const directory = path.join(templateDir, relativeDirectory);

    try {
      const directoryFiles = await listFiles(directory);

      sourceFiles.push(
        ...directoryFiles.map((filePath) =>
          path.relative(templateDir, filePath)
        )
      );
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }

    await rm(directory, { force: true, recursive: true });
  }

  const libraryDirectory = path.join(templateDir, 'src/lib');

  try {
    for (const filePath of await listFiles(libraryDirectory)) {
      const relativePath = path.relative(templateDir, filePath);

      if (PRESERVED_LIBRARY_FILES.has(relativePath)) continue;

      await rm(filePath);
      sourceFiles.push(relativePath);
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  return sourceFiles;
}

async function removeFileIfExists(filePath) {
  try {
    await rm(filePath);

    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;

    throw error;
  }
}

async function removeTemporaryBiomeOverrides(biomeConfigPath) {
  let source;

  try {
    source = await readFile(biomeConfigPath, 'utf-8');
  } catch (error) {
    if (error?.code === 'ENOENT') return false;

    throw error;
  }

  const normalizedSource = source.replace(
    /^\s*"noBarrelFile":\s*"off"[^\n]*\n/m,
    ''
  );

  if (normalizedSource === source) return false;

  await writeFile(biomeConfigPath, normalizedSource);

  return true;
}

function containsRetiredPackageReference(source) {
  const packageSpecifiers = source.matchAll(/['"]([^'"]+)['"]/g);

  for (const [, packageName] of packageSpecifiers) {
    if (isRetiredPackageName(packageName)) return true;
  }

  return false;
}

function isMainModule() {
  const entrypoint = process.argv[1];

  if (!entrypoint) return false;

  return (
    realpathSync(entrypoint) === realpathSync(fileURLToPath(import.meta.url))
  );
}

function isRetiredPackageName(packageName) {
  if (packageName.startsWith('@udecode/')) return true;
  if (!packageName.startsWith('@platejs/')) return false;

  const [scope, name] = packageName.split('/');
  const packageRoot = `${scope}/${name}`;

  return !ALLOWED_SCOPED_PACKAGES.has(packageRoot);
}

async function listFiles(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function finalizeTemplateRefresh(templateDir) {
  await syncTooltipProvider(templateDir);

  const packageJson = JSON.parse(
    await readFile(path.join(templateDir, 'package.json'), 'utf-8')
  );
  const retiredDependencyNames = [];

  for (const section of DEPENDENCY_SECTIONS) {
    const dependencies = packageJson[section];

    if (!dependencies || typeof dependencies !== 'object') continue;

    for (const dependencyName of Object.keys(dependencies)) {
      if (isRetiredPackageName(dependencyName)) {
        retiredDependencyNames.push(dependencyName);
      }
    }
  }

  const sourceDir = path.join(templateDir, 'src');
  const retiredSourceFiles = [];
  const normalizedCssFiles = [];

  for (const sourceFile of await listFiles(sourceDir)) {
    const extension = path.extname(sourceFile);
    const source = await readFile(sourceFile, 'utf-8');

    if (
      SOURCE_EXTENSIONS.has(extension) &&
      containsRetiredPackageReference(source)
    ) {
      retiredSourceFiles.push(path.relative(templateDir, sourceFile));
    }

    if (extension === '.css') {
      const normalizedSource = normalizeCssImports(source);

      if (normalizedSource !== source) {
        await writeFile(sourceFile, normalizedSource);
        normalizedCssFiles.push(path.relative(templateDir, sourceFile));
      }
    }
  }

  if (retiredDependencyNames.length > 0 || retiredSourceFiles.length > 0) {
    throw new Error(
      [
        'Template refresh produced retired package references.',
        retiredDependencyNames.length > 0
          ? `Dependencies: ${retiredDependencyNames.toSorted().join(', ')}`
          : '',
        retiredSourceFiles.length > 0
          ? `Source files: ${retiredSourceFiles.toSorted().join(', ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
    );
  }

  return { normalizedCssFiles };
}

async function syncTooltipProvider(templateDir) {
  const layoutPath = path.join(templateDir, 'src/app/layout.tsx');
  const tooltipPath = path.join(templateDir, 'src/components/ui/tooltip.tsx');
  const tooltipImport =
    "import { TooltipProvider } from '@/components/ui/tooltip';";
  const wrappedChildren = '<TooltipProvider>{children}</TooltipProvider>';
  let layoutSource;

  try {
    layoutSource = await readFile(layoutPath, 'utf-8');
  } catch (error) {
    if (error?.code === 'ENOENT') return false;

    throw error;
  }

  let hasTooltip = true;

  try {
    await access(tooltipPath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;

    hasTooltip = false;
  }

  let nextLayoutSource = layoutSource;

  if (hasTooltip) {
    if (!nextLayoutSource.includes(tooltipImport)) {
      nextLayoutSource = nextLayoutSource.replace(
        "import localFont from 'next/font/local';",
        `import localFont from 'next/font/local';\n\n${tooltipImport}`
      );
    }
    if (!nextLayoutSource.includes(wrappedChildren)) {
      nextLayoutSource = nextLayoutSource.replace(
        '{children}',
        wrappedChildren
      );
    }
  } else {
    nextLayoutSource = nextLayoutSource
      .replace(`${tooltipImport}\n\n`, '')
      .replace(`${tooltipImport}\n`, '')
      .replace(wrappedChildren, '{children}');
  }

  if (nextLayoutSource === layoutSource) return false;

  await writeFile(layoutPath, nextLayoutSource);

  return true;
}

function normalizeCssImports(source) {
  const lines = source.split('\n');
  const importLines = lines.filter((line) => /^\s*@import\s/.test(line));

  if (importLines.length === 0) return source;

  const bodyLines = lines.filter((line) => !/^\s*@import\s/.test(line));

  while (bodyLines[0]?.trim() === '') bodyLines.shift();

  const normalized = [...importLines, '', ...bodyLines].join('\n');

  return normalized === source ? source : normalized;
}

function removeRetiredDependencies(packageJson) {
  const removedDependencyNames = [];

  for (const section of DEPENDENCY_SECTIONS) {
    const dependencies = packageJson[section];

    if (!dependencies || typeof dependencies !== 'object') continue;

    for (const dependencyName of Object.keys(dependencies)) {
      if (!isRetiredPackageName(dependencyName)) continue;

      delete dependencies[dependencyName];
      removedDependencyNames.push(dependencyName);
    }

    if (Object.keys(dependencies).length === 0) {
      delete packageJson[section];
    }
  }

  return removedDependencyNames;
}

export {
  containsRetiredPackageReference,
  finalizeTemplateRefresh,
  isRetiredPackageName,
  normalizeCssImports,
  prepareTemplateRefresh,
  removeGeneratedSources,
  removeTemporaryBiomeOverrides,
  removeRetiredDependencies,
  syncTooltipProvider,
};
