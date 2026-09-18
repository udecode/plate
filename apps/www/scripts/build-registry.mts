import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import {
  access,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
  type Registry,
  type RegistryItem,
  registrySchema,
} from 'shadcn/schema';

import {
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLE_NAMES,
  type PlateRegistryBase,
} from '@/lib/plate-registry-styles';
import {
  type RegistryPayload,
  serializeRegistryPayload,
} from '@/lib/registry-payload';
import { createRegistryResponse } from '@/lib/registry-response';
import { createPlateRegistry } from '@/registry/registry';
import { PLATE_REGISTRY_VARIANT_ITEM_NAMES } from '@/registry/registry-variants';

import { createDocsRegistry } from './build-docs-registry.mts';
import {
  acquireRegistryBuildLock,
  createRegistryGeneration,
  fingerprintRegistryDirectory,
  publishRegistryGeneration,
  recoverRegistryBuildLock,
  releaseRegistryBuildLock,
} from './registry-build-publication.mts';
import {
  getRegistryBuildTargets,
  getRegistryStageTargets,
  REGISTRY_HOMEPAGE,
  REGISTRY_PUBLIC_TARGETS,
} from './registry-build-targets.mts';
import { createRegistryIndexSource } from './registry-index.mts';
import { deriveRegistryPackageDependencies } from './registry-package-dependencies.mts';
import { materializeRegistryStyles } from './registry-style-materializer.mts';
import {
  loadRegistryStyleMaps,
  SHADCN_STYLE_SOURCE_COMMIT,
} from './registry-style-transform.mts';

const REGISTRY_SOURCE_PREFIX = 'src/';
const root = process.cwd();
const buildRoot = path.join(root, '.registry-build');
const sourceRoot = path.join(root, 'src/registry');

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

async function exists(filePath: string) {
  try {
    await access(filePath, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sanitizeRegistry(registry: Registry): Registry {
  return {
    ...registry,
    items: registry.items
      .filter((item) => item.meta?.registry !== false)
      .map((item) => ({
        ...item,
        files: item.files?.map((file) => ({
          ...file,
          path: `${REGISTRY_SOURCE_PREFIX}registry/${file.path}`,
        })),
      })),
  };
}

function createRawRegistry(
  registry: Registry,
  kind: 'canonical' | 'provider-overlay',
  docsItems: RegistryItem[]
) {
  const sourceItems =
    kind === 'canonical'
      ? registry.items
      : registry.items.filter((item) =>
          PLATE_REGISTRY_VARIANT_ITEM_NAMES.has(item.name)
        );
  const sanitized = sanitizeRegistry({ ...registry, items: sourceItems });

  return registrySchema.parse({
    ...sanitized,
    items: [...sanitized.items, ...docsItems],
  });
}

function buildShadcn(registryFile: string, outputDir: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      'pnpm',
      ['exec', 'shadcn', 'build', registryFile, '--output', outputDir],
      { stdio: 'inherit' }
    );

    console.info(
      `pnpm exec shadcn build ${registryFile} --output ${outputDir}`
    );
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            signal
              ? `Registry build exited with signal ${signal}`
              : `Registry build exited with code ${code}`
          )
        );
      }
    });
  });
}

async function serializeCanonicalDirectory({
  sourceDir,
  targetBaseUrl,
  targetDir,
}: {
  sourceDir: string;
  targetBaseUrl: string;
  targetDir: string;
}) {
  const directoryEntries = await readdir(sourceDir);
  const fileNames = directoryEntries
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();

  await mkdir(targetDir, { recursive: true });
  for (const fileName of fileNames) {
    const payload = JSON.parse(
      await readFile(path.join(sourceDir, fileName), 'utf-8')
    ) as RegistryPayload;
    await writeJson(
      path.join(targetDir, fileName),
      serializeRegistryPayload(payload, targetBaseUrl)
    );
  }
}

async function getPayloadHashes(stageDir: string) {
  const stage = getRegistryStageTargets(stageDir);
  const entries: Array<[string, string]> = [];

  for (const { directory } of REGISTRY_PUBLIC_TARGETS) {
    const hashes = await fingerprintRegistryDirectory(
      stage.publicDirectories[directory]
    );

    for (const [fileName, hash] of Object.entries(hashes)) {
      entries.push([`${directory}/${fileName}`, hash]);
    }
  }

  const overlayHashes = await fingerprintRegistryDirectory(stage.overlayDir);
  for (const [fileName, hash] of Object.entries(overlayHashes)) {
    if (fileName === 'manifest.json') continue;
    entries.push([`overlays/${fileName}`, hash]);
  }

  return Object.fromEntries(
    entries.sort(([left], [right]) => left.localeCompare(right, 'en'))
  );
}

async function validateStagedGeneration(stageDir: string) {
  const stage = getRegistryStageTargets(stageDir);
  const publicFileSets = await Promise.all(
    REGISTRY_PUBLIC_TARGETS.map(async ({ directory }) => {
      const directoryEntries = await readdir(
        stage.publicDirectories[directory]
      );

      return directoryEntries
        .filter((fileName) => fileName.endsWith('.json'))
        .sort();
    })
  );

  if (JSON.stringify(publicFileSets[0]) !== JSON.stringify(publicFileSets[1])) {
    throw new Error('Registry public roots contain different payload sets.');
  }

  const registry = JSON.parse(
    await readFile(
      path.join(stage.publicDirectories.r, 'registry.json'),
      'utf-8'
    )
  ) as RegistryPayload;
  const expectedFiles = [
    'registry-docs.json',
    'registry.json',
    ...(registry.items ?? []).map((item) => `${item.name}.json`),
  ].sort();

  if (JSON.stringify(publicFileSets[0]) !== JSON.stringify(expectedFiles)) {
    throw new Error('Registry public root is missing an indexed payload.');
  }

  const manifest = JSON.parse(
    await readFile(path.join(stage.overlayDir, 'manifest.json'), 'utf-8')
  ) as {
    combinations: Array<{ files: string[]; style: string }>;
    payloads: Record<string, string>;
  };
  const expectedStyles = PLATE_REGISTRY_BASES.flatMap((base) =>
    PLATE_REGISTRY_STYLE_NAMES.map((style) => `${base}-${style}`)
  ).filter((style) => style !== 'base-nova');

  if (
    JSON.stringify(manifest.combinations.map(({ style }) => style).sort()) !==
    JSON.stringify(expectedStyles.sort())
  ) {
    throw new Error('Registry manifest does not contain every style.');
  }

  for (const combination of manifest.combinations) {
    for (const fileName of combination.files) {
      if (!manifest.payloads[`overlays/${combination.style}/${fileName}`]) {
        throw new Error(
          `Registry manifest has no hash for ${combination.style}/${fileName}.`
        );
      }
    }
  }

  const routeStyles = [
    ...PLATE_REGISTRY_BASES.flatMap((base) =>
      PLATE_REGISTRY_STYLE_NAMES.map((style) => `${base}-${style}`)
    ),
    'new-york',
    'new-york-v4',
  ];
  for (const { directory } of REGISTRY_PUBLIC_TARGETS) {
    for (const style of routeStyles) {
      const response = await createRegistryResponse({
        directory,
        fileName: 'registry.json',
        origin:
          directory === 'r' ? 'https://platejs.org' : 'http://localhost:3000',
        root: stageDir,
        style,
      });

      if (!response) {
        throw new Error(
          `Registry response validation failed: ${directory}/${style}`
        );
      }
    }
  }
}

async function pathsEqual(staged: string, destination: string) {
  if (!(await exists(destination))) return false;
  const [stagedStat, destinationStat] = await Promise.all([
    stat(staged),
    stat(destination),
  ]);

  if (stagedStat.isDirectory() !== destinationStat.isDirectory()) return false;
  if (stagedStat.isDirectory()) {
    const [stagedHash, destinationHash] = await Promise.all([
      fingerprintRegistryDirectory(staged),
      fingerprintRegistryDirectory(destination),
    ]);

    return JSON.stringify(stagedHash) === JSON.stringify(destinationHash);
  }

  const [stagedSource, destinationSource] = await Promise.all([
    readFile(staged),
    readFile(destination),
  ]);

  return stagedSource.equals(destinationSource);
}

async function assertFresh(
  targets: Array<{ destination: string; staged: string }>
) {
  const stale: string[] = [];

  for (const target of targets) {
    if (!(await pathsEqual(target.staged, target.destination))) {
      stale.push(path.relative(root, target.destination));
    }
  }

  if (stale.length > 0) {
    throw new Error(
      `Generated registry output is stale:\n${stale
        .map((filePath) => `- ${filePath}`)
        .join('\n')}\nRun pnpm --filter www build:registry.`
    );
  }
}

function getRecoverToken() {
  const argument = process.argv.find((value) =>
    value.startsWith('--recover-lock=')
  );

  if (argument) return argument.slice('--recover-lock='.length);
  const index = process.argv.indexOf('--recover-lock');

  return index === -1 ? null : (process.argv[index + 1] ?? '');
}

const recoverToken = getRecoverToken();
if (recoverToken !== null) {
  if (!recoverToken) throw new Error('--recover-lock requires an owner token.');
  await recoverRegistryBuildLock({ buildRoot, token: recoverToken });
  console.info(`Recovered registry build lock ${recoverToken}.`);
  process.exit(0);
}

const checkOnly = process.argv.includes('--check');
const docsRegistry = await createDocsRegistry();
const derivedRegistries = Object.fromEntries(
  PLATE_REGISTRY_BASES.map((base) => [
    base,
    deriveRegistryPackageDependencies(
      createPlateRegistry(REGISTRY_HOMEPAGE, { base }),
      { sourceRoot }
    ),
  ])
) as Record<PlateRegistryBase, Registry>;
const sourceIdentity = sha256(
  JSON.stringify({
    docsRegistry,
    registries: derivedRegistries,
    shadcnStyleCommit: SHADCN_STYLE_SOURCE_COMMIT,
  })
);
const build = await acquireRegistryBuildLock({ buildRoot, sourceIdentity });

try {
  const buildTargets = getRegistryBuildTargets(build.stageDir);
  const stage = getRegistryStageTargets(build.stageDir);

  for (const target of buildTargets) {
    const rawRegistry = createRawRegistry(
      derivedRegistries[target.base],
      target.kind,
      target.kind === 'canonical' ? docsRegistry.items : []
    );

    console.info(`Building neutral ${target.base} registry source...`);
    await writeJson(target.registryFile, rawRegistry);
    await buildShadcn(target.registryFile, target.outputDir);
    if (target.kind === 'canonical') {
      await writeJson(
        path.join(target.outputDir, 'registry-docs.json'),
        docsRegistry
      );
    }
  }

  console.info('Materializing neutral provider and style overlays...');
  const { canonical, combinations } = await materializeRegistryStyles({
    baseRawDir: buildTargets[0].outputDir,
    canonicalDir: stage.canonicalDir,
    overlayDir: stage.overlayDir,
    providerRawDir: buildTargets[1].outputDir,
    styleMaps: await loadRegistryStyleMaps(),
  });

  for (const target of REGISTRY_PUBLIC_TARGETS) {
    await serializeCanonicalDirectory({
      sourceDir: stage.canonicalDir,
      targetBaseUrl: target.baseUrl,
      targetDir: stage.publicDirectories[target.directory],
    });
  }

  const payloads = await getPayloadHashes(build.stageDir);
  const generation = createRegistryGeneration(payloads, sourceIdentity);
  await writeJson(stage.metadataFile, {
    generation,
    registries: derivedRegistries,
  });
  await mkdir(path.dirname(stage.previewIndexFile), { recursive: true });
  await writeFile(
    stage.previewIndexFile,
    createRegistryIndexSource(derivedRegistries.base, generation)
  );

  const manifestPath = path.join(stage.overlayDir, 'manifest.json');
  await writeJson(manifestPath, {
    canonical: 'base-nova',
    combinations,
    generation,
    itemCount: canonical.size - 1,
    payloads,
    shadcnStyleCommit: SHADCN_STYLE_SOURCE_COMMIT,
  });
  const markerFile = path.join(
    build.stageDir,
    'src/__registry__/generation.json'
  );
  await writeJson(markerFile, {
    generation,
    manifestSha256: sha256(await readFile(manifestPath, 'utf-8')),
  });
  await validateStagedGeneration(build.stageDir);

  const targets = [
    ...REGISTRY_PUBLIC_TARGETS.map(({ directory }) => ({
      destination: path.join(root, `public/${directory}`),
      staged: stage.publicDirectories[directory],
    })),
    {
      destination: path.join(root, 'src/__registry__/overlays'),
      staged: stage.overlayDir,
    },
    {
      destination: path.join(root, 'src/__registry__/registry-metadata.json'),
      staged: stage.metadataFile,
    },
    {
      destination: path.join(root, 'src/__registry__/index.tsx'),
      staged: stage.previewIndexFile,
    },
  ];
  const marker = {
    destination: path.join(root, 'src/__registry__/generation.json'),
    staged: markerFile,
  };

  if (checkOnly) {
    await assertFresh([...targets, marker]);
    console.info(`Registry generation ${generation} is fresh.`);
  } else {
    await publishRegistryGeneration({
      marker,
      targets,
      token: build.lock.token,
    });
    console.info(
      `Published registry generation ${generation} with ${canonical.size} canonical payloads.`
    );
  }
} finally {
  await releaseRegistryBuildLock(build);
}
