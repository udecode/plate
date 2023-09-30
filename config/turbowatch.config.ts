import { readFileSync } from 'node:fs';
import { GlobSync } from 'glob';
import { defineConfig } from 'turbowatch';

const foundPackageJson = new GlobSync('packages/**/package.json').found;

type PathToPackageNameMap = Map<string, string>;

const allPackages = foundPackageJson.reduce<PathToPackageNameMap>(
  (all, current) => {
    try {
      const packageJson = readFileSync(current, 'utf8');
      const packageJsonParsed = JSON.parse(packageJson) as {
        dependencies: Record<string, string>;
        name: string | undefined;
      };

      const packageName = packageJsonParsed.name;

      if (!packageName) {
        return all;
      }
    } catch (_) {}

    return all;
  },
  new Map()
);

// const spawnWithPiping = async (command: string, args: string[]) => {
//   const task = spawn(command, args, {
//     stdio: 'inherit',
//     detached: false,
//     windowsHide: true,
//   });

//   task.stdout?.pipe(process.stdout);

//   task.stderr?.pipe(process.stderr!);

//   await new Promise<void>((resolve) => {
//     task.on('close', () => {
//       resolve();
//     });
//   });
// };

export default defineConfig({
  project: process.cwd(),
  triggers: [
    {
      expression: [
        'allof',
        ['not', ['dirname', 'node_modules']],
        ['not', ['dirname', 'dist']],
        ['match', 'packages/*/src/**/*.{ts,tsx}'],
      ],
      interruptible: true,
      name: 'build',
      onChange: async ({ spawn, files }) => {
        console.log(files);
      },
    },
  ],
});
