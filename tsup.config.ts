console.log('TS Bundler: [TSUP]')

import fs from 'fs';
import path from 'path';
import { defineConfig } from 'tsup';

const PACKAGE_ROOT_PATH = process.cwd();
const INPUT_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.ts');
const INPUT_FILE = fs.existsSync(INPUT_FILE_PATH)
  ? INPUT_FILE_PATH
  : path.join(PACKAGE_ROOT_PATH, 'src/index.tsx');
const PKG_JSON = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT_PATH, 'package.json'), 'utf8'));

export default defineConfig({
  clean: true,
  outDir: 'dist',
  sourcemap: true,
  // minify: 'terser',
  format: ['esm', 'cjs'],
  entryPoints: [INPUT_FILE],
  external: [
    ...Object.keys(PKG_JSON.dependencies || {}),
    ...Object.keys(PKG_JSON.peerDependencies || {}),
    'react-textarea-autosize',
  ],
  env: {
    NODE_ENV: 'production'
  },
  tsconfig: `${process.env.TS_CONFIG}/tsconfig.json`
});
