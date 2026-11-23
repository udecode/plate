import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, posix } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Registry } from 'shadcn/schema';

import type { PlateRegistryBase } from '@/lib/plate-registry-styles';

import { ICON_PLACEHOLDER_MODULE } from '../src/lib/registry-icon-placeholder.ts';
import { readIconPlaceholders, toServedIcons } from './icon-placeholders.mts';
import { parseModuleImports } from './registry-imports.mts';

type RegistryItem = Registry['items'][number];
type RegistryFile = NonNullable<RegistryItem['files']>[number];

// The installed shadcn CLI runs this on each component it installs, and it
// changes only a base-* style, where it turns Radix's asChild into Base UI's
// render. Resolving it through shadcn keeps it the version that CLI installs
// with.
const { transformAsChild } = (await import(
  pathToFileURL(
    createRequire(import.meta.resolve('shadcn')).resolve(
      '@shadcn/registry/internal/transformers/transform-aschild'
    )
  ).href
)) as {
  transformAsChild: (
    code: string,
    opts: { config: { style: string }; filename: string; raw: string }
  ) => string | Promise<string>;
};

type TreeFile = {
  source: string;
  treePath: string;
  registryType?: RegistryFile['type'];
};

export const CREATE_PREVIEW_DIR = 'src/__registry__/create-preview';

const SHADCN_UI_ICON_PLACEHOLDER = '@/app/(create)/components/icon-placeholder';
const ICON_PLACEHOLDER_IMPORTS = new Set([
  SHADCN_UI_ICON_PLACEHOLDER,
  ICON_PLACEHOLDER_MODULE,
]);
const PREVIEW_ICON_PLACEHOLDER = '@/app/(view)/create-preview/icon-placeholder';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.js', '.jsx', '.json'];
const UI_IMPORT_REGEX =
  /^@\/(?:components|registry\/bases\/[^/]+)\/ui\/([^/]+)$/;

function getCandidates(path: string) {
  if (posix.extname(path)) return [path];

  return [
    ...SOURCE_EXTENSIONS.map((extension) => `${path}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => `${path}/index${extension}`),
  ];
}

const ALIAS_DIRS = {
  components: 'components',
  hooks: 'hooks',
  lib: 'lib',
  ui: 'components/ui',
};

const isAlias = (key: string): key is keyof typeof ALIAS_DIRS =>
  Object.hasOwn(ALIAS_DIRS, key);

const TYPE_DIRS: Partial<Record<RegistryFile['type'], string>> = {
  'registry:hook': ALIAS_DIRS.hooks,
  'registry:lib': ALIAS_DIRS.lib,
  'registry:ui': ALIAS_DIRS.ui,
};

// shadcn's resolveFilePath at SHADCN_STYLE_SOURCE_COMMIT, for the Next app
// without a src folder that `shadcn create --template next` makes.
function getTreePath(file: RegistryFile) {
  if (file.target) {
    if (file.target.startsWith('~/')) return file.target.slice(2);

    const [, alias, rest] = /^@([^/]+)\/(.+)$/.exec(file.target) ?? [];

    if (alias && isAlias(alias)) return `${ALIAS_DIRS[alias]}/${rest}`;

    return (alias ? `${alias}/${rest}` : file.target).replace('src/', '');
  }

  const dir = TYPE_DIRS[file.type] ?? ALIAS_DIRS.components;
  const segments = file.path.split('/');
  const index = segments.indexOf(posix.basename(dir));

  return `${dir}/${index === -1 ? segments.at(-1) : segments.slice(index + 1).join('/')}`;
}

const isApiRoute = (file: RegistryFile) => file.path.startsWith('app/api/');

function getEditorFiles(registry: Registry, editor: string) {
  const items = new Map(registry.items.map((item) => [item.name, item]));
  const files: RegistryFile[] = [];
  const ui = new Set<string>();
  const seen = new Set<string>();

  const visit = (name: string) => {
    if (seen.has(name)) return;
    seen.add(name);

    const item = items.get(name);

    if (!item) throw new Error(`${editor}: no registry item ${name}`);

    files.push(...(item.files ?? []).filter((file) => !isApiRoute(file)));

    for (const dependency of item.registryDependencies ?? []) {
      if (dependency.startsWith('@plate/')) {
        visit(dependency.slice('@plate/'.length));
      } else if (/^[a-z-]+$/.test(dependency)) {
        ui.add(dependency);
      } else {
        throw new Error(
          `${name}: unexpected registry dependency ${dependency}`
        );
      }
    }
  };

  visit(editor);

  return { files, ui };
}

export async function createPreviewTree({
  base,
  editor,
  registry,
  sourceRoot,
}: {
  base: PlateRegistryBase;
  editor: string;
  registry: Registry;
  sourceRoot: string;
}) {
  const { files, ui } = getEditorFiles(registry, editor);
  const bySource = new Map<string, string>();
  const byTreePath = new Map<string, string>();
  const tree: TreeFile[] = [];

  const add = (file: TreeFile) => {
    const { source, treePath } = file;
    const existing = byTreePath.get(treePath);

    if (existing === source) return;
    if (existing) {
      throw new Error(
        `${base}/${editor}: ${existing} and ${source} both install to ${treePath}`
      );
    }

    bySource.set(source, treePath);
    byTreePath.set(treePath, source);
    tree.push(file);
  };
  const addUi = (name: string) =>
    add({
      source: `bases/${base}/ui/${name}.tsx`,
      treePath: `components/ui/${name}.tsx`,
    });

  for (const file of files) {
    add({
      registryType: file.type,
      source: file.path,
      treePath: getTreePath(file),
    });
  }
  for (const name of ui) addUi(name);

  const fromSource = (path: string) =>
    getCandidates(path)
      .map((candidate) => bySource.get(candidate))
      .find(Boolean);
  const fromTreePath = (path: string) =>
    getCandidates(path).find((candidate) => byTreePath.has(candidate));

  const resolve = (file: TreeFile, specifier: string) => {
    const uiName = UI_IMPORT_REGEX.exec(specifier)?.[1];

    if (uiName) {
      addUi(uiName);

      return `components/ui/${uiName}.tsx`;
    }
    if (specifier.startsWith('@/registry/')) {
      const path = specifier.slice('@/registry/'.length);

      return fromSource(path) ?? fromTreePath(path);
    }
    if (specifier.startsWith('.')) {
      return (
        fromSource(posix.join(posix.dirname(file.source), specifier)) ??
        fromTreePath(posix.join(posix.dirname(file.treePath), specifier))
      );
    }
    if (/^@\/(?:components|hooks)\//.test(specifier)) {
      return fromTreePath(specifier.slice(2));
    }

    return null;
  };

  const root = `@/__registry__/create-preview/${base}/${editor}`;
  const getReplacement = (file: TreeFile, specifier: string) => {
    if (ICON_PLACEHOLDER_IMPORTS.has(specifier)) {
      return PREVIEW_ICON_PLACEHOLDER;
    }

    const treePath = resolve(file, specifier);

    if (treePath) return `${root}/${treePath.replace(/\.[cm]?[jt]sx?$/, '')}`;
    if (/^(?:\.|@\/(?:registry|components|hooks)\/)/.test(specifier)) {
      throw new Error(
        `${base}/${editor}: ${file.source} imports ${specifier}, which no installed file provides`
      );
    }

    return null;
  };
  const output: Array<{ content: string; source: string; treePath: string }> =
    [];

  for (const file of tree) {
    const raw = await readFile(join(sourceRoot, file.source), 'utf-8');
    let content = file.registryType
      ? toServedIcons({
          content: raw,
          path: file.source,
          type: file.registryType,
        })
      : raw;

    for (const { specifier } of parseModuleImports(content, {
      filePath: file.source,
    })) {
      const replacement = getReplacement(file, specifier);

      if (!replacement) continue;

      content = content.replaceAll(
        new RegExp(
          String.raw`(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])${escapeRegex(specifier)}\2`,
          'g'
        ),
        `$1$2${replacement}$2`
      );
    }

    output.push({
      content: await transformAsChild(content, {
        config: { style: `${base}-nova` },
        filename: file.treePath,
        raw: content,
      }),
      source: file.source,
      treePath: file.treePath,
    });
  }

  return output.sort((a, b) => a.treePath.localeCompare(b.treePath));
}

function escapeRegex(value: string) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);

      return entry.isDirectory() ? listFiles(path) : [path];
    })
  );

  return nested.flat();
}

export async function writeCreatePreviewTrees({
  editors,
  outDir,
  registries,
  sourceRoot,
}: {
  editors: readonly string[];
  outDir: string;
  registries: Record<PlateRegistryBase, Registry>;
  sourceRoot: string;
}) {
  const files = new Map<string, string>();
  const keys: string[] = [];
  const drawnLucideIcons = new Set<string>();

  for (const [base, registry] of Object.entries(registries) as Array<
    [PlateRegistryBase, Registry]
  >) {
    for (const editor of editors) {
      const tree = await createPreviewTree({
        base,
        editor,
        registry,
        sourceRoot,
      });

      for (const { content, source, treePath } of tree) {
        files.set(join(outDir, base, editor, treePath), content);

        for (const { lucide } of readIconPlaceholders(content, source)) {
          drawnLucideIcons.add(lucide);
        }
      }

      keys.push(`${base}/${editor}`);
    }
  }

  const header = '// Generated by scripts/build-registry.mts. Do not edit.\n';

  // www's tsconfig excludes the trees, and the declaration file keeps tsc from
  // following the index into them. The install check owns the trees' types.
  files.set(
    join(outDir, 'index.js'),
    `${header}import { lazy } from 'react';\n\nexport const createPreviewPages = {\n${keys.map((key) => `  '${key}': lazy(() => import('./${key}/app/editor/page')),`).join('\n')}\n};\n`
  );
  files.set(
    join(outDir, 'index.d.ts'),
    `${header}import type { ComponentType, LazyExoticComponent } from 'react';\n\nexport declare const createPreviewPages: Record<\n${keys.map((key) => `  | '${key}'`).join('\n')},\n  LazyExoticComponent<ComponentType>\n>;\n`
  );
  files.set(
    join(outDir, 'icons/__lucide__.ts'),
    `${header}export {\n${[...drawnLucideIcons]
      .sort()
      .map((name) => `  ${name},`)
      .join('\n')}\n} from 'lucide-react';\n`
  );
  files.set(
    join(outDir, 'icons/lucide.tsx'),
    `${header}import type * as React from 'react';\n\nimport * as icons from './__lucide__';\n\nexport default function Icon({\n  name,\n  ...props\n}: React.ComponentProps<'svg'> & { name: keyof typeof icons }) {\n  const Svg = icons[name];\n\n  return <Svg {...props} />;\n}\n`
  );

  for (const stale of await listFiles(outDir)) {
    if (!files.has(stale)) await rm(stale);
  }
  for (const [path, content] of files) {
    const current = await readFile(path, 'utf-8').catch(() => null);

    if (current === content) continue;

    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
  }

  return files.size;
}
