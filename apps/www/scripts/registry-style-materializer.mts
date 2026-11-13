import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLE_NAMES,
  type PlateRegistryBase,
  type PlateRegistryStyleName,
} from '@/lib/plate-registry-styles';

import {
  getCommonRegistryStyleMarkers,
  type RegistryStyleMaps,
  SHADCN_STYLE_SOURCE_COMMIT,
  transformRegistryStyleSource,
} from './registry-style-transform.mts';

type RegistryFilePayload = {
  content?: string;
  path?: string;
  [key: string]: unknown;
};

export type RegistryPayload = {
  files?: RegistryFilePayload[];
  items?: RegistryPayload[];
  name?: string;
  [key: string]: unknown;
};

const SOURCE_FILE_REGEX = /\.[cm]?[jt]sx?$/;

async function readPayloads(directory: string) {
  const directoryEntries = await fs.readdir(directory);
  const fileNames = directoryEntries
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();
  const entries = await Promise.all(
    fileNames.map(async (fileName) => [
      fileName,
      JSON.parse(
        await fs.readFile(path.join(directory, fileName), 'utf-8')
      ) as RegistryPayload,
    ])
  );

  return new Map(entries as Array<[string, RegistryPayload]>);
}

async function writePayload(
  directory: string,
  fileName: string,
  payload: RegistryPayload
) {
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(
    path.join(directory, fileName),
    `${JSON.stringify(payload, null, 2)}\n`
  );
}

function payloadsEqual(left: RegistryPayload, right: RegistryPayload) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export async function transformRegistryPayload({
  commonMarkers,
  payload,
  styleMap,
}: {
  commonMarkers: ReadonlySet<string>;
  payload: RegistryPayload;
  styleMap: Record<string, string>;
}): Promise<RegistryPayload> {
  return {
    ...payload,
    files: payload.files
      ? await Promise.all(
          payload.files.map(async (file) => {
            if (
              typeof file.content !== 'string' ||
              typeof file.path !== 'string' ||
              !SOURCE_FILE_REGEX.test(file.path)
            ) {
              return file;
            }

            return {
              ...file,
              content: await transformRegistryStyleSource({
                commonMarkers,
                source: file.content,
                styleMap,
              }),
            };
          })
        )
      : payload.files,
    items: payload.items
      ? await Promise.all(
          payload.items.map((item) =>
            transformRegistryPayload({ commonMarkers, payload: item, styleMap })
          )
        )
      : payload.items,
  };
}

export function mergeRegistryProviderOverlay(
  canonicalRegistry: RegistryPayload,
  providerRegistry: RegistryPayload
) {
  const providerItems = new Map(
    providerRegistry.items?.map((item) => [item.name, item])
  );

  return {
    ...canonicalRegistry,
    items: canonicalRegistry.items?.map(
      (item) => providerItems.get(item.name) ?? item
    ),
  };
}

export function createSparseRegistryIndexOverlay(
  canonicalRegistry: RegistryPayload,
  registry: RegistryPayload
) {
  const canonicalItems = new Map(
    canonicalRegistry.items?.map((item) => [item.name, item])
  );
  const changedItems = registry.items?.filter((item) => {
    const canonicalItem = canonicalItems.get(item.name);

    return !canonicalItem || !payloadsEqual(canonicalItem, item);
  });

  if (!changedItems || changedItems.length === 0) return null;

  return { ...registry, items: changedItems };
}

async function createRegistryView({
  base,
  basePayloads,
  commonMarkers,
  providerPayloads,
  style,
  styleMaps,
}: {
  base: PlateRegistryBase;
  basePayloads: Map<string, RegistryPayload>;
  commonMarkers: ReadonlySet<string>;
  providerPayloads: Map<string, RegistryPayload>;
  style: PlateRegistryStyleName;
  styleMaps: RegistryStyleMaps;
}) {
  const entries = await Promise.all(
    [...basePayloads].map(async ([fileName, payload]) => [
      fileName,
      await transformRegistryPayload({
        commonMarkers,
        payload,
        styleMap: styleMaps[style],
      }),
    ])
  );
  const view = new Map(entries as Array<[string, RegistryPayload]>);

  if (base === 'base') return view;

  for (const [fileName, payload] of providerPayloads) {
    const transformed = await transformRegistryPayload({
      commonMarkers,
      payload,
      styleMap: styleMaps[style],
    });

    if (fileName === 'registry.json') {
      const registry = view.get(fileName);
      if (!registry) throw new Error('Canonical registry index is missing');
      view.set(fileName, mergeRegistryProviderOverlay(registry, transformed));
    } else {
      view.set(fileName, transformed);
    }
  }

  return view;
}

export async function materializeRegistryStyles({
  baseRawDir,
  canonicalDir,
  overlayDir,
  providerRawDir,
  styleMaps,
}: {
  baseRawDir: string;
  canonicalDir: string;
  overlayDir: string;
  providerRawDir: string;
  styleMaps: RegistryStyleMaps;
}) {
  const basePayloads = await readPayloads(baseRawDir);
  const providerPayloads = await readPayloads(providerRawDir);
  const commonMarkers = getCommonRegistryStyleMarkers(styleMaps);
  const canonical = await createRegistryView({
    base: 'base',
    basePayloads,
    commonMarkers,
    providerPayloads,
    style: 'nova',
    styleMaps,
  });

  await fs.rm(canonicalDir, { force: true, recursive: true });
  await fs.rm(overlayDir, { force: true, recursive: true });

  for (const [fileName, payload] of canonical) {
    await writePayload(canonicalDir, fileName, payload);
  }

  const combinations: Array<{
    files: string[];
    style: `${PlateRegistryBase}-${PlateRegistryStyleName}`;
  }> = [];

  for (const base of PLATE_REGISTRY_BASES) {
    for (const style of PLATE_REGISTRY_STYLE_NAMES) {
      if (base === 'base' && style === 'nova') continue;

      const key = `${base}-${style}` as const;
      const view = await createRegistryView({
        base,
        basePayloads,
        commonMarkers,
        providerPayloads,
        style,
        styleMaps,
      });
      const changedFiles: string[] = [];

      for (const [fileName, payload] of view) {
        const canonicalPayload = canonical.get(fileName);
        if (!canonicalPayload) {
          throw new Error(`Canonical registry payload is missing: ${fileName}`);
        }

        const overlayPayload =
          fileName === 'registry.json'
            ? createSparseRegistryIndexOverlay(canonicalPayload, payload)
            : payloadsEqual(canonicalPayload, payload)
              ? null
              : payload;

        if (!overlayPayload) continue;

        changedFiles.push(fileName);
        await writePayload(
          path.join(overlayDir, key),
          fileName,
          overlayPayload
        );
      }

      combinations.push({ files: changedFiles.sort(), style: key });
    }
  }

  await fs.mkdir(overlayDir, { recursive: true });
  await fs.writeFile(
    path.join(overlayDir, 'manifest.json'),
    `${JSON.stringify(
      {
        canonical: 'base-nova',
        combinations,
        itemCount: canonical.size - 1,
        shadcnStyleCommit: SHADCN_STYLE_SOURCE_COMMIT,
      },
      null,
      2
    )}\n`
  );

  return { canonical, combinations };
}
