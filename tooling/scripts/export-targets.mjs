import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const NON_CODE_EXPORT = /\.(?:css|json)$/u;

const readableConditions = (value) => {
  if (typeof value === 'string') return [['default', value]];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const conditions = Object.entries(value);
  return conditions.every(([, target]) => typeof target === 'string') &&
    conditions.some(([name]) => name === 'import' || name === 'default')
    ? conditions
    : null;
};

const isBuilt = (target, extension) => {
  const [dot, dist, ...rest] = target.split('/');
  return (
    dot === '.' &&
    dist === 'dist' &&
    rest.length > 0 &&
    rest.every((segment) => segment && segment !== '.' && segment !== '..') &&
    target.endsWith(extension)
  );
};

const sourceOfTarget = (packageRoot, target) => {
  const stem = target
    .replace(/^\.\/dist\//u, 'src/')
    .replace(/\.d\.ts$|\.js$/u, '');

  return ['.ts', '.tsx', '.mts']
    .map((extension) => path.join(packageRoot, `${stem}${extension}`))
    .find(existsSync);
};

export const readPackageEntrypoints = (packageRoot) => {
  const problems = [];
  const sourceBySpecifier = new Map();
  const manifest = JSON.parse(
    readFileSync(path.join(packageRoot, 'package.json'), 'utf-8')
  );
  if (!manifest.exports) {
    problems.push(`${manifest.name}: package.json has no exports map`);
    return { problems, sourceBySpecifier };
  }

  const exportsMap =
    typeof manifest.exports === 'object' &&
    Object.keys(manifest.exports).some((key) => key.startsWith('.'))
      ? manifest.exports
      : { '.': manifest.exports };

  for (const [subpath, value] of Object.entries(exportsMap)) {
    if (value === null) continue;

    const specifier =
      subpath === '.' ? manifest.name : `${manifest.name}${subpath.slice(1)}`;
    const conditions = readableConditions(value);
    if (!conditions) {
      problems.push(
        `${specifier}: the exports map gives it ${JSON.stringify(value)}. This check reads a string, or conditions that each give a string with an import or default condition among them.`
      );
      continue;
    }

    const code = conditions.filter(
      ([, target]) => !NON_CODE_EXPORT.test(target)
    );
    if (code.length === 0) continue;

    if (subpath.includes('*')) {
      problems.push(
        `${specifier}: the exports map publishes a pattern, which this check does not resolve. List each subpath it publishes.`
      );
      continue;
    }

    const sources = code.map(([, target]) => [
      target,
      sourceOfTarget(packageRoot, target),
    ]);
    const missing = sources.find(([, source]) => !source);
    const notCode = conditions.find(([, target]) =>
      NON_CODE_EXPORT.test(target)
    );
    const notBuilt = code
      .map(([name, target]) => [
        name,
        target,
        name === 'types' ? '.d.ts' : '.js',
      ])
      .find(([, target, extension]) => !isBuilt(target, extension));

    if (notCode) {
      problems.push(
        `${specifier}: its ${notCode[0]} condition gives ${notCode[1]} beside code targets, and this check reads only entrypoints whose conditions all give code`
      );
    } else if (notBuilt) {
      problems.push(
        `${specifier}: its ${notBuilt[0]} condition gives ${notBuilt[1]}, which is not a ${notBuilt[2]} file under ./dist/`
      );
    } else if (missing) {
      problems.push(`${specifier}: no source file for ${missing[0]}`);
    } else if (new Set(sources.map(([, source]) => source)).size > 1) {
      problems.push(
        `${specifier}: export conditions point at different files (${code.map(([, target]) => target).join(', ')})`
      );
    } else {
      sourceBySpecifier.set(specifier, sources[0][1]);
    }
  }

  return { problems, sourceBySpecifier };
};
