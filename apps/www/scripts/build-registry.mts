import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { rimraf } from 'rimraf';
import {
  type RegistryItem,
  registrySchema,
  type Registry,
} from 'shadcn/schema';

import {
  createPlateRegistry,
  PLATE_REGISTRY_BASES,
  type PlateRegistryBase,
} from '@/registry/registry';
import { PLATE_REGISTRY_VARIANT_ITEM_NAMES } from '@/registry/registry-variants';

import { buildDocsRegistry } from './build-docs-registry.mts';
import {
  getRegistryBuildTargets,
  getRegistryOutputTarget,
  REGISTRY_HOMEPAGE,
} from './registry-build-targets.mts';
import { toPublicRegistryDependencySpecifier } from './registry-dependencies.mts';
import { createRegistryIndexSource } from './registry-index.mts';
import { materializeRegistryStyles } from './registry-style-materializer.mts';
import { loadRegistryStyleMaps } from './registry-style-transform.mts';

const BASE_URL = 'src/';

const isDev = process.env.NODE_ENV === 'development';
function withPublicRegistryDependencies(
  item: RegistryItem,
  registryBaseUrl: string
): RegistryItem {
  return {
    ...item,
    registryDependencies: item.registryDependencies?.map((dependency) =>
      toPublicRegistryDependencySpecifier(dependency, registryBaseUrl)
    ),
  };
}

function createBuildRegistry(
  base: PlateRegistryBase,
  registryBaseUrl: string,
  overlay = false
): Registry {
  const sourceRegistry = createPlateRegistry(REGISTRY_HOMEPAGE, {
    base,
  });

  return registrySchema.parse({
    ...sourceRegistry,
    items: sourceRegistry.items
      .filter(
        (item) => !overlay || PLATE_REGISTRY_VARIANT_ITEM_NAMES.has(item.name)
      )
      .map((item) => withPublicRegistryDependencies(item, registryBaseUrl)),
  });
}

async function buildRegistryIndex(registry: Registry) {
  // Write style index.
  rimraf.sync(path.join(process.cwd(), `${BASE_URL}__registry__/index.tsx`));
  await fs.writeFile(
    path.join(process.cwd(), `${BASE_URL}__registry__/index.tsx`),
    createRegistryIndexSource(registry)
  );
}

function sanitizeRegistry(registry: Registry): Registry {
  return {
    ...registry,
    items: registry.items
      // Filter internal examples.
      .filter((item) => item.meta?.registry !== false)
      .map((item) => {
        const files = item.files?.map((file) => ({
          ...file,
          path: `${BASE_URL}registry/${file.path}`,
        }));

        return {
          ...item,
          files,
        };
      }),
  };
}

async function buildRegistryJsonFile(
  registry: Registry,
  target: string,
  registryBaseUrl: string,
  items: RegistryItem[] = []
) {
  // 1. Fix the path for registry items.
  const fixedRegistry = sanitizeRegistry(registry);

  // 3. Write the content of the registry to `registry.json` and public folder
  let registryJson = fixedRegistry;

  registryJson = {
    ...fixedRegistry,
    items: [
      ...fixedRegistry.items,
      ...items.map((item) =>
        withPublicRegistryDependencies(item, registryBaseUrl)
      ),
    ],
  };

  // Create directories if they don't exist
  const publicTargetDir = path.dirname(path.join(process.cwd(), target));

  await fs.mkdir(publicTargetDir, { recursive: true });
  await fs.writeFile(
    path.join(process.cwd(), target),
    JSON.stringify(registryJson, null, 2)
  );
}

async function buildRegistry(registryFile: string, outputDir: string) {
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
        resolve(undefined);
      } else {
        reject(
          new Error(
            signal
              ? `Process exited with signal ${signal}`
              : `Process exited with code ${code}`
          )
        );
      }
    });
  });
}

try {
  const buildTargets = getRegistryBuildTargets({
    dev: isDev,
  });
  const outputTarget = getRegistryOutputTarget({ dev: isDev });
  const defaultTarget = buildTargets[0];
  const defaultRegistry = createBuildRegistry(
    defaultTarget.base,
    defaultTarget.registryBaseUrl
  );

  if (!isDev) {
    console.info('🗂️ Building registry/__index__.tsx...');
    await buildRegistryIndex(defaultRegistry);
  }

  // Clean up generated registry payloads before rebuilding either owner.
  rimraf.sync(path.join(process.cwd(), outputTarget.canonicalDir));
  for (const base of PLATE_REGISTRY_BASES) {
    rimraf.sync(path.join(process.cwd(), `${BASE_URL}__registry__/${base}`));
  }
  rimraf.sync(path.join(process.cwd(), outputTarget.overlayDir));
  rimraf.sync(path.join(process.cwd(), '.registry-build'));

  console.info('📖 Building registry-docs.json...');
  const docsItems = await buildDocsRegistry();

  for (const target of buildTargets) {
    const { base, kind, outputDir, registryBaseUrl, registryFile } = target;
    const registry = createBuildRegistry(
      base,
      registryBaseUrl,
      kind === 'provider-overlay'
    );

    console.info(`💅 Building ${registryFile}...`);
    if (kind === 'canonical') {
      console.info('🔄 Merging docs into registry.json');
      await buildRegistryJsonFile(
        registry,
        registryFile,
        registryBaseUrl,
        docsItems
      );
    } else {
      await buildRegistryJsonFile(registry, registryFile, registryBaseUrl);
    }

    console.info(`🏗️ Building ${outputDir}...`);
    await buildRegistry(registryFile, outputDir);
  }

  console.info('🎨 Materializing Base/Nova and sparse style overlays...');
  const styleMaps = await loadRegistryStyleMaps();
  const { canonical, combinations } = await materializeRegistryStyles({
    baseRawDir: path.join(process.cwd(), buildTargets[0].outputDir),
    canonicalDir: path.join(process.cwd(), outputTarget.canonicalDir),
    overlayDir: path.join(process.cwd(), outputTarget.overlayDir),
    providerRawDir: path.join(process.cwd(), buildTargets[1].outputDir),
    styleMaps,
  });
  console.info(
    `✅ Materialized ${canonical.size} canonical payloads and ${combinations.length} sparse overlays`
  );

  rimraf.sync(path.join(process.cwd(), '.registry-build'));
} catch (error) {
  console.error(error);
  process.exit(1);
}
