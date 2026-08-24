import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { rimraf } from 'rimraf';
import { PRESET_BASES, PRESET_STYLES } from 'shadcn/preset';
import {
  type RegistryItem,
  registrySchema,
  type Registry,
} from 'shadcn/schema';

import {
  createPlateRegistry,
  type PlateRegistryBase,
} from '@/registry/registry';

import { buildDocsRegistry } from './build-docs-registry.mts';
import {
  getRegistryBuildTargets,
  REGISTRY_HOMEPAGE,
} from './registry-build-targets.mts';
import { toPublicRegistryDependencySpecifier } from './registry-dependencies.mts';
import { createRegistryIndexSource } from './registry-index.mts';

const BASE_URL = 'src/';

const isDev = process.env.NODE_ENV === 'development';
const MERGE_DOCS = true;
const REGISTRY_STYLES = [
  'new-york',
  'new-york-v4',
  ...PRESET_BASES.flatMap((base) =>
    PRESET_STYLES.map((style) => `${base}-${style}`)
  ),
] as const;

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

function getRegistryBase(style: string): PlateRegistryBase {
  if (style.startsWith('base-')) return 'base';
  if (style.startsWith('aria-')) return 'aria';

  return 'radix';
}

function createBuildRegistry(style: string, registryBaseUrl: string): Registry {
  const sourceRegistry = createPlateRegistry(REGISTRY_HOMEPAGE, {
    base: getRegistryBase(style),
  });

  return registrySchema.parse({
    ...sourceRegistry,
    items: sourceRegistry.items.map((item) =>
      withPublicRegistryDependencies(item, registryBaseUrl)
    ),
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
    styles: REGISTRY_STYLES,
  });
  const defaultTarget = buildTargets[0];
  const defaultRegistry = createBuildRegistry(
    defaultTarget.style,
    defaultTarget.registryBaseUrl
  );

  if (!isDev) {
    console.info('🗂️ Building registry/__index__.tsx...');
    await buildRegistryIndex(defaultRegistry);

    // Clean up the entire public/r directory first
    rimraf.sync(path.join(process.cwd(), defaultTarget.outputDir));
  }

  console.info('📖 Building registry-docs.json...');
  const docsItems = await buildDocsRegistry();

  for (const {
    outputDir,
    registryBaseUrl,
    registryFile,
    style,
  } of buildTargets) {
    const registry = createBuildRegistry(style, registryBaseUrl);

    console.info(`💅 Building ${registryFile}...`);
    if (MERGE_DOCS) {
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
} catch (error) {
  console.error(error);
  process.exit(1);
}
