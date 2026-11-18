import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLE_NAMES,
  type PlateRegistryBase,
} from '@/lib/plate-registry-styles';

export const SHADCN_STYLE_SOURCE_COMMIT =
  'ee628d75dea87325735fafa7c54f5d7d7edb8774';

export const SHADCN_UI_COPIES = ['toggle', 'tooltip'] as const;

export type ShadcnUiCopy = (typeof SHADCN_UI_COPIES)[number];

const REGISTRY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/registry'
);
export const SHADCN_PROVENANCE_PATH = path.join(
  REGISTRY_ROOT,
  'styles/provenance.json'
);

const COPY_IMPORT_REGEX = /^@\/registry\/bases\/([^/]+)\/ui\/([^/]+)$/;
const COPY_SOURCE_REGEX = /^bases\/[^/]+\/ui\//;
const BASE_SOURCE_REGEX = /^bases\/([^/]+)\//;
const PROJECT_UI_PREFIX = '@/components/ui/';

export function getShadcnCopyPath(base: PlateRegistryBase, name: ShadcnUiCopy) {
  return `bases/${base}/ui/${name}.tsx`;
}

function parseShadcnCopyImport(specifier: string) {
  const match = COPY_IMPORT_REGEX.exec(specifier);

  if (!match) return null;

  const base = PLATE_REGISTRY_BASES.find((served) => served === match[1]);
  const name = SHADCN_UI_COPIES.find((copy) => copy === match[2]);

  if (!base || !name) {
    throw new Error(
      `${specifier}: Plate copies only ${SHADCN_UI_COPIES.join(', ')} from shadcn's ${PLATE_REGISTRY_BASES.join(', ')} bases.`
    );
  }

  return { base, name };
}

export function isShadcnCopySource(filePath: string) {
  return COPY_SOURCE_REGEX.test(filePath);
}

export function getShadcnRegistryName(specifier: string, filePath: string) {
  if (specifier.startsWith(PROJECT_UI_PREFIX)) {
    return specifier.slice(PROJECT_UI_PREFIX.length);
  }

  const copy = parseShadcnCopyImport(specifier);

  if (!copy) return null;
  if (BASE_SOURCE_REGEX.exec(filePath)?.[1] !== copy.base) {
    throw new Error(
      `${filePath} -> ${specifier}: only a file under bases/${copy.base}/ may import the ${copy.base} copy of ${copy.name}.`
    );
  }

  return copy.name;
}

const sha256 = (source: string) =>
  createHash('sha256').update(source).digest('hex');

export async function verifyVendoredShadcn() {
  const { files } = JSON.parse(
    await fs.readFile(SHADCN_PROVENANCE_PATH, 'utf-8')
  ) as { files: Record<string, string> };
  const copies = new Set(
    PLATE_REGISTRY_BASES.flatMap((base) =>
      SHADCN_UI_COPIES.map((name) => getShadcnCopyPath(base, name))
    )
  );
  const problems: string[] = [];

  for (const base of await fs.readdir(path.join(REGISTRY_ROOT, 'bases'))) {
    const copied = await fs
      .readdir(path.join(REGISTRY_ROOT, `bases/${base}/ui`))
      .catch(() => []);

    for (const fileName of copied) {
      const relativePath = `bases/${base}/ui/${fileName}`;

      if (!copies.has(relativePath)) {
        problems.push(
          `${relativePath} is not a shadcn copy Plate lists; move it out of bases/${base}/ui/, or add its name to SHADCN_UI_COPIES and rerun scripts/sync-shadcn-registry-styles.mts.`
        );
      }
    }
  }
  for (const relativePath of [
    ...PLATE_REGISTRY_STYLE_NAMES.map((style) => `styles/style-${style}.css`),
    ...copies,
  ]) {
    if (!files[relativePath]) {
      problems.push(
        `${relativePath} has no provenance; rerun scripts/sync-shadcn-registry-styles.mts.`
      );
    }
  }

  await Promise.all(
    Object.entries(files).map(async ([relativePath, expected]) => {
      const filePath = path.join(REGISTRY_ROOT, relativePath);
      const source = await fs.readFile(filePath, 'utf-8').catch(() => null);

      if (source === null || sha256(source) !== expected) {
        problems.push(
          `${relativePath} differs from shadcn ${SHADCN_STYLE_SOURCE_COMMIT}; restore it with git checkout -- ${path.relative(process.cwd(), filePath)} (rerunning scripts/sync-shadcn-registry-styles.mts needs ../shadcn at that commit).`
        );
      }
    })
  );

  if (problems.length > 0) {
    throw new Error(`Vendored shadcn files:\n- ${problems.join('\n- ')}`);
  }
}
