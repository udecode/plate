import fs from 'node:fs';
import path from 'node:path';

import { PREVIEW_ICON_PACKAGES } from '../src/lib/registry-icon-placeholder.ts';

export const PAGE_LOAD_REPORT = 'page-load-report.json';

const SITE_ICON_PACKAGES = new Set([PREVIEW_ICON_PACKAGES.tabler]);

export const PREVIEW_ONLY_ICON_PACKAGES = Object.values(
  PREVIEW_ICON_PACKAGES
).filter((name) => !SITE_ICON_PACKAGES.has(name));

const PREVIEW_TREES = '/src/__registry__/create-preview/';

export type PageLoadReport = Record<
  string,
  { css: string[]; icons: Record<string, number>; trees: number }
>;

type Module = { modules?: Module[]; resource?: string };
type Chunk = { files: Set<string> };
type ChunkGroup = {
  chunks: Chunk[];
  getChildren: () => ChunkGroup[];
  isInitial: () => boolean;
};
type Compilation = {
  chunkGraph: { getChunkModulesIterable: (chunk: Chunk) => Iterable<Module> };
  entrypoints: Map<string, ChunkGroup>;
};
type Compiler = {
  hooks: {
    done: {
      tap: (
        name: string,
        callback: (stats: { compilation: Compilation }) => void
      ) => void;
    };
  };
  outputPath: string;
};

function reachableChunkGroups(entrypoint: ChunkGroup) {
  const groups = new Set<ChunkGroup>();
  const visit = (group: ChunkGroup) => {
    if (groups.has(group) || (group !== entrypoint && group.isInitial())) {
      return;
    }
    groups.add(group);
    for (const child of group.getChildren()) visit(child);
  };

  visit(entrypoint);

  return groups;
}

export function pageLoadReport(appRoot: string) {
  return {
    apply(compiler: Compiler) {
      const roots = PREVIEW_ONLY_ICON_PACKAGES.map(
        (name) =>
          [
            name,
            `${fs.realpathSync(path.join(appRoot, 'node_modules', name))}/`,
          ] as const
      );

      compiler.hooks.done.tap('PageLoadReport', ({ compilation }) => {
        const report: PageLoadReport = {};

        for (const [name, entrypoint] of compilation.entrypoints) {
          const css = new Set<string>();
          const trees = new Set<string>();
          const icons = new Map<string, Set<string>>();

          for (const group of reachableChunkGroups(entrypoint)) {
            for (const chunk of group.chunks) {
              for (const file of chunk.files) {
                if (file.endsWith('.css')) css.add(file);
              }
              for (const module of compilation.chunkGraph.getChunkModulesIterable(
                chunk
              )) {
                for (const { resource = '' } of module.modules ?? [module]) {
                  if (resource.includes(PREVIEW_TREES)) trees.add(resource);

                  const owner = roots.find(([, root]) =>
                    resource.startsWith(root)
                  )?.[0];

                  if (owner) {
                    icons.set(
                      owner,
                      (icons.get(owner) ?? new Set()).add(resource)
                    );
                  }
                }
              }
            }
          }

          report[name] = {
            css: [...css],
            icons: Object.fromEntries(
              [...icons].map(([owner, modules]) => [owner, modules.size])
            ),
            trees: trees.size,
          };
        }

        fs.writeFileSync(
          path.join(compiler.outputPath, PAGE_LOAD_REPORT),
          JSON.stringify(report, null, 1)
        );
      });
    },
  };
}
