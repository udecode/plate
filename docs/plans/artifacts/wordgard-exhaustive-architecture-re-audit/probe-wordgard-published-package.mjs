#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const packageSpec = 'wordgard@0.3.1';
const tempRoot = mkdtempSync(join(tmpdir(), 'wordgard-published-package-'));

const npmJson = (...args) =>
  JSON.parse(
    execFileSync('npm', args, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    })
  );

try {
  const dist = npmJson('view', packageSpec, 'dist', '--json');
  const time = npmJson('view', packageSpec, 'time', '--json');
  const [packed] = npmJson(
    'pack',
    packageSpec,
    '--json',
    '--pack-destination',
    tempRoot
  );
  const tarball = join(tempRoot, packed.filename);
  execFileSync('tar', ['-xzf', tarball, '-C', tempRoot]);

  const packageRoot = join(tempRoot, 'package');
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, 'package.json'), 'utf8')
  );
  const packedPaths = new Set(packed.files.map(({ path }) => path));
  let dependencyInstallError = null;
  try {
    execFileSync(
      'npm',
      ['install', '--ignore-scripts', '--no-package-lock', '--omit=dev'],
      {
        cwd: packageRoot,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
  } catch (error) {
    dependencyInstallError =
      error instanceof Error ? error.message : String(error);
  }
  const entries = [];

  for (const [subpath, target] of Object.entries(packageJson.exports)) {
    const runtimePath = target.replace(/^\.\//, '');
    const declarationPath = runtimePath.replace(/\.js$/, '.d.ts');
    const runtimeExists = packedPaths.has(runtimePath);
    const declarationExists = packedPaths.has(declarationPath);
    let importError = null;
    let runtimeExports = [];

    if (runtimeExists) {
      try {
        const runtime = await import(
          `${pathToFileURL(join(packageRoot, runtimePath)).href}?published-probe`
        );
        runtimeExports = Object.keys(runtime).sort();
      } catch (error) {
        importError = error instanceof Error ? error.message : String(error);
      }
    }

    entries.push({
      declarationExists,
      declarationPath,
      importError,
      runtimeExists,
      runtimeExports,
      runtimePath,
      subpath,
    });
  }

  const result = {
    schemaVersion: 1,
    kind: 'wordgard-published-package-contract',
    generatedAt: new Date().toISOString(),
    package: {
      integrity: packed.integrity,
      npmIntegrity: dist.integrity,
      npmShasum: dist.shasum,
      npmTarball: dist.tarball,
      publishedAt: time[packageJson.version],
      spec: packageSpec,
      tarballSha256: createHash('sha256')
        .update(readFileSync(tarball))
        .digest('hex'),
      unpackedSize: packed.unpackedSize,
      version: packageJson.version,
    },
    pack: {
      entryCount: packed.entryCount,
      fileCount: packed.files.length,
      files: packed.files.map(({ path, size }) => ({ path, size })),
    },
    entries,
    validation: {
      dependencyInstallError,
      declarationTargetsMissing: entries
        .filter(({ declarationExists }) => !declarationExists)
        .map(({ subpath }) => subpath),
      importFailures: entries
        .filter(({ importError }) => importError)
        .map(({ importError, subpath }) => ({ importError, subpath })),
      runtimeTargetsMissing: entries
        .filter(({ runtimeExists }) => !runtimeExists)
        .map(({ subpath }) => subpath),
    },
    interpretation:
      'This freezes the npm-published 0.3.1 artifact only. It does not prove current main, whose ignored dist and clean-pack behavior are audited separately.',
  };

  writeFileSync(
    resolve(artifactRoot, 'wordgard-published-package-probe.json'),
    `${JSON.stringify(result, null, 2)}\n`
  );
  process.stdout.write(
    `Probed ${entries.length} published exports across ${packed.files.length} packed files.\n`
  );
} finally {
  rmSync(tempRoot, { force: true, recursive: true });
}
