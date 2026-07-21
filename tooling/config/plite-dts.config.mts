import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsdown';

import { getPliteDeclarationEntries } from '../scripts/build-plite-package.mjs';

const packageRoot = process.env.PLITE_PACKAGE_ROOT ?? process.cwd();
const packageJson = JSON.parse(
  readFileSync(join(packageRoot, 'package.json'), 'utf8')
);
const entry = Object.fromEntries(
  Object.entries(getPliteDeclarationEntries(packageJson)).map(
    ([name, input]) => [name, join(packageRoot, input)]
  )
);

export default defineConfig({
  clean: false,
  dts: {
    dtsInput: true,
    emitDtsOnly: true,
  },
  entry,
  external: [/^(?![./])/],
  format: ['esm'],
  outDir: join(packageRoot, 'dist'),
  platform: 'neutral',
  sourcemap: false,
});
