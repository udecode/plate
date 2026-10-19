import { getDesktopProjects } from './desktop-projects.mjs';

const mode = process.argv[2] ?? 'desktop';

if (mode !== 'desktop') {
  throw new Error(`unknown stress project mode: ${mode}`);
}

process.stdout.write(
  getDesktopProjects()
    .map((project) => `--project=${project}`)
    .join(' ')
);
