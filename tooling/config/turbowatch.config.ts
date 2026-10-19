import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { defineConfig, type Expression } from 'turbowatch';

const foundPackageJson = readdirSync('packages', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join('packages', entry.name, 'package.json'));
const SRC_PATH_REGEX = /\/src\/.*/;

type PathToPackageNameMap = Map<string, string>;

const allPackages = foundPackageJson.reduce<PathToPackageNameMap>(
  (acc, current) => {
    try {
      const packageJson = readFileSync(current, 'utf-8');
      const packageJsonParsed = JSON.parse(packageJson) as {
        dependencies: Record<string, string>;
        name: string | undefined;
      };

      const packageName = packageJsonParsed.name;

      if (!packageName) {
        return acc;
      }

      acc.set(current, packageName);
      return acc;
    } catch {
      // Ignore workspace entries without a readable package manifest.
    }

    return acc;
  },
  new Map()
);

const dirList = [...allPackages.keys()].map(
  (dir) => ['dirname', dir.replace('/package.json', '')] satisfies Expression
);

export default defineConfig({
  project: process.cwd(),
  triggers: [
    {
      expression: [
        'allof',
        ['not', ['anyof', ['dirname', 'node_modules'], ['dirname', 'dist']]],
        ['anyof', ...dirList],
        [
          'anyof',
          ['match', '*.ts', 'basename'],
          ['match', '*.tsx', 'basename'],
          ['match', '*.js', 'basename'],
        ],
      ],
      interruptible: true,
      name: 'build',
      onChange: async ({ spawn, files }) => {
        const changedPackages = new Set<string>();
        for (const file of files) {
          const pkgJsonPath = file.name
            .replace(`${process.cwd()}/`, '')
            .replace(SRC_PATH_REGEX, '/package.json');

          const packageName = allPackages.get(pkgJsonPath);

          if (!packageName) {
            continue;
          }

          changedPackages.add(packageName);
        }

        if (changedPackages.size === 0) {
          return;
        }

        await spawn`turbo run build --filter=${[...changedPackages].join(',')}`;
      },
    },
  ],
});
