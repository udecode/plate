import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, '../..');
const cacheRoot = path.join(
  repoRoot,
  'node_modules/.cache/plate-toolbar-variants'
);
const variants = ['radix', 'base', 'aria'] as const;

for (const variant of variants) {
  const fixtureRoot = path.join(cacheRoot, variant);
  const sourceRoot = path.join(fixtureRoot, 'src');

  rmSync(fixtureRoot, { force: true, recursive: true });
  mkdirSync(path.join(sourceRoot, 'components/editor'), { recursive: true });
  mkdirSync(path.join(sourceRoot, 'lib'), { recursive: true });

  const toolbarSource =
    variant === 'radix'
      ? path.join(appRoot, 'src/registry/components/editor/toolbar.tsx')
      : path.join(appRoot, `src/registry/bases/${variant}/editor/toolbar.tsx`);

  copyFileSync(
    toolbarSource,
    path.join(sourceRoot, 'components/editor/toolbar.tsx')
  );
  copyFileSync(
    path.join(appRoot, 'src/lib/utils.ts'),
    path.join(sourceRoot, 'lib/utils.ts')
  );
  symlinkSync(
    path.join(appRoot, 'node_modules'),
    path.join(fixtureRoot, 'node_modules'),
    'dir'
  );

  writeFileSync(
    path.join(fixtureRoot, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          esModuleInterop: true,
          jsx: 'react-jsx',
          lib: ['ES2024', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          moduleResolution: 'Bundler',
          noEmit: true,
          paths: { '@/*': ['./src/*'] },
          skipLibCheck: true,
          strict: true,
          target: 'ES2024',
        },
        include: ['src/**/*.ts', 'src/**/*.tsx'],
      },
      null,
      2
    )
  );
  writeFileSync(
    path.join(sourceRoot, 'entry.tsx'),
    `import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Toolbar, ToolbarButton } from './components/editor/toolbar';

function App() {
  return (
    <Toolbar aria-label="Formatting">
      <ToolbarButton aria-label="Bold" pressed>Bold</ToolbarButton>
      <ToolbarButton aria-label="Italic">Italic</ToolbarButton>
      <ToolbarButton aria-label="Underline">Underline</ToolbarButton>
    </Toolbar>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
`
  );
  writeFileSync(
    path.join(fixtureRoot, 'index.html'),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="./dist/entry.js"></script></body></html>'
  );

  execFileSync(
    'pnpm',
    ['exec', 'tsc', '-p', path.join(fixtureRoot, 'tsconfig.json')],
    { cwd: repoRoot, stdio: 'inherit' }
  );
  execFileSync(
    'bun',
    ['build', 'src/entry.tsx', '--outdir', 'dist', '--target', 'browser'],
    { cwd: fixtureRoot, stdio: 'inherit' }
  );
}

console.info('Toolbar variants passed typecheck and browser bundling.');
