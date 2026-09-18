import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { getPlateRegistryStyle } from './plate-registry-styles';
import {
  mergeRegistryOverlay,
  normalizeRegistryPayload,
  type RegistryPayload,
  serializeRegistryPayload,
} from './registry-payload';

const ITEM_FILE_REGEX = /^[a-z0-9-]+\.json$/;

type RegistryManifest = {
  canonical: 'base-nova';
  combinations: Array<{ files: string[]; style: string }>;
  generation: string;
  payloads: Record<string, string>;
};

type RegistryGeneration = {
  generation: string;
  manifestSha256: string;
};

type RegistryMetadata = {
  generation: string;
};

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

async function readText(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

function parseJson<T>(source: string, filePath: string) {
  try {
    return JSON.parse(source) as T;
  } catch {
    throw new Error(`Invalid generated registry JSON: ${filePath}`);
  }
}

async function readGeneration(root: string) {
  const markerPath = path.join(root, 'src/__registry__/generation.json');
  const metadataPath = path.join(
    root,
    'src/__registry__/registry-metadata.json'
  );
  const manifestPath = path.join(
    root,
    'src/__registry__/overlays/manifest.json'
  );
  const [markerSource, metadataSource, manifestSource] = await Promise.all([
    readText(markerPath),
    readText(metadataPath),
    readText(manifestPath),
  ]);

  if (!markerSource || !metadataSource || !manifestSource) {
    throw new Error('Registry generation metadata is missing.');
  }

  const marker = parseJson<RegistryGeneration>(markerSource, markerPath);
  const metadata = parseJson<RegistryMetadata>(metadataSource, metadataPath);
  const manifest = parseJson<RegistryManifest>(manifestSource, manifestPath);

  if (
    marker.generation !== manifest.generation ||
    marker.generation !== metadata.generation ||
    marker.manifestSha256 !== sha256(manifestSource)
  ) {
    throw new Error('Registry generation metadata does not match.');
  }

  return { manifest, marker };
}

async function readVerifiedPayload({
  filePath,
  key,
  manifest,
}: {
  filePath: string;
  key: string;
  manifest: RegistryManifest;
}) {
  const expected = manifest.payloads[key];

  if (!expected) return null;

  const source = await readText(filePath);
  if (!source) {
    throw new Error(`Registry manifest lists a missing payload: ${key}`);
  }
  if (sha256(source) !== expected) {
    throw new Error(`Registry payload does not match its generation: ${key}`);
  }

  return parseJson<RegistryPayload>(source, filePath);
}

function getCombination(
  manifest: RegistryManifest,
  style: string
): { files: string[]; style: string } | null {
  if (style === manifest.canonical) return { files: [], style };

  return manifest.combinations.find((entry) => entry.style === style) ?? null;
}

async function readStyledPayload({
  directory,
  fileName,
  manifest,
  root,
  style,
}: {
  directory: 'r' | 'rd';
  fileName: string;
  manifest: RegistryManifest;
  root: string;
  style: string;
}) {
  const canonical = await readVerifiedPayload({
    filePath: path.join(root, 'public', directory, fileName),
    key: `${directory}/${fileName}`,
    manifest,
  });

  if (!canonical) return null;

  const combination = getCombination(manifest, style);
  if (!combination) {
    throw new Error(`Registry manifest has no style: ${style}`);
  }
  if (!combination.files.includes(fileName)) return canonical;

  const overlay = await readVerifiedPayload({
    filePath: path.join(root, 'src/__registry__/overlays', style, fileName),
    key: `overlays/${style}/${fileName}`,
    manifest,
  });

  if (!overlay) {
    throw new Error(
      `Registry manifest lists a missing overlay: ${style}/${fileName}`
    );
  }

  return mergeRegistryOverlay(canonical, overlay, fileName);
}

async function isIndexedPayload({
  directory,
  fileName,
  manifest,
  root,
  style,
}: {
  directory: 'r' | 'rd';
  fileName: string;
  manifest: RegistryManifest;
  root: string;
  style: string;
}) {
  if (fileName === 'registry.json' || fileName === 'registry-docs.json') {
    return true;
  }

  const index = await readStyledPayload({
    directory,
    fileName: 'registry.json',
    manifest,
    root,
    style,
  });
  const itemName = fileName.slice(0, -'.json'.length);

  if (!index) {
    throw new Error('Registry manifest has no canonical index payload.');
  }

  return index.items?.some((item) => item.name === itemName) ?? false;
}

export async function createRegistryResponse({
  directory,
  fileName,
  origin,
  root = process.cwd(),
  style,
}: {
  directory: 'r' | 'rd';
  fileName: string;
  origin: string;
  root?: string;
  style: string;
}) {
  const registryStyle = getPlateRegistryStyle(style);

  if (!registryStyle || !ITEM_FILE_REGEX.test(fileName)) return null;

  const { manifest } = await readGeneration(root);
  const normalizedStyle = `${registryStyle.base}-${registryStyle.style}`;
  const isIndexed = await isIndexedPayload({
    directory,
    fileName,
    manifest,
    root,
    style: normalizedStyle,
  });

  if (!isIndexed) return null;

  const payload = await readStyledPayload({
    directory,
    fileName,
    manifest,
    root,
    style: normalizedStyle,
  });

  if (!payload) {
    throw new Error(`Registry manifest has no canonical payload: ${fileName}`);
  }

  const sourceBaseUrl =
    directory === 'r' ? 'https://platejs.org/r' : 'http://localhost:3000/rd';
  const neutral = normalizeRegistryPayload(payload, sourceBaseUrl);

  return serializeRegistryPayload(neutral, `${origin}/${directory}/${style}`);
}
