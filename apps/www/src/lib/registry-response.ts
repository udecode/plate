import { promises as fs } from 'node:fs';
import path from 'node:path';

import { getPlateRegistryStyle } from './plate-registry-styles';

const ITEM_FILE_REGEX = /^[a-z0-9-]+\.json$/;

type RegistryItemPayload = {
  items?: RegistryItemPayload[];
  name?: string;
  registryDependencies?: string[];
  [key: string]: unknown;
};

function rewriteDependencies(
  payload: RegistryItemPayload,
  sourceBaseUrl: string,
  targetBaseUrl: string
): RegistryItemPayload {
  return {
    ...payload,
    items: payload.items?.map((item) =>
      rewriteDependencies(item, sourceBaseUrl, targetBaseUrl)
    ),
    registryDependencies: payload.registryDependencies?.map((dependency) =>
      dependency.startsWith(`${sourceBaseUrl}/`)
        ? `${targetBaseUrl}/${dependency.slice(sourceBaseUrl.length + 1)}`
        : dependency
    ),
  };
}

async function readPayload(filePath: string) {
  try {
    return JSON.parse(
      await fs.readFile(filePath, 'utf-8')
    ) as RegistryItemPayload;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;

    throw error;
  }
}

function withoutFileContent(item: RegistryItemPayload) {
  return {
    ...item,
    files: Array.isArray(item.files)
      ? item.files.map((file) => {
          if (!file || typeof file !== 'object') return file;

          const { content: _content, ...metadata } = file as Record<
            string,
            unknown
          >;

          return metadata;
        })
      : item.files,
  };
}

export async function createRegistryResponse({
  directory,
  fileName,
  origin,
  style,
}: {
  directory: 'r' | 'rd';
  fileName: string;
  origin: string;
  style: string;
}) {
  const registryStyle = getPlateRegistryStyle(style);

  if (!registryStyle || !ITEM_FILE_REGEX.test(fileName)) return null;

  const sourceBaseUrl =
    directory === 'r' ? 'https://platejs.org/r' : 'http://localhost:3000/rd';
  const targetBaseUrl = `${origin}/${directory}/${style}`;
  const canonicalPayload = await readPayload(
    path.join(process.cwd(), 'public', directory, fileName)
  );

  if (!canonicalPayload) return null;

  let payload = canonicalPayload;
  const overlayPath = path.join(
    process.cwd(),
    'src/__registry__/overlays',
    `${registryStyle.base}-${registryStyle.style}`,
    fileName
  );
  const overlayPayload = await readPayload(overlayPath);

  if (overlayPayload && fileName === 'registry.json') {
    const overlayItems = new Map(
      overlayPayload.items?.map((item) => [item.name, withoutFileContent(item)])
    );

    payload = {
      ...canonicalPayload,
      items: canonicalPayload.items?.map(
        (item) => overlayItems.get(item.name) ?? item
      ),
    };
  } else if (overlayPayload) {
    payload = overlayPayload;
  }

  return rewriteDependencies(payload, sourceBaseUrl, targetBaseUrl);
}
