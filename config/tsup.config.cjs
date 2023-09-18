import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'tsup';

const cwd = process.cwd();

const INPUT_FILE_PATH = path.join(cwd, 'src/index.ts');
const INPUT_FILE = fs.existsSync(INPUT_FILE_PATH)
  ? INPUT_FILE_PATH
  : path.join(cwd, 'src/index.tsx');

// export default defineConfig({
//   entry: [INPUT_FILE],
//   silent: true,
//   format: ['cjs', 'esm'],
//   outExtension: (ctx) => {
//     return { js: `.${ctx.format === 'esm' ? 'es' : ctx.format}.js` };
//   },
//   outDir: 'dist',
// });

const { dependencies = {}, peerDependencies = {} } = JSON.parse(
  fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')
);

export default defineConfig({
  clean: true,
  outDir: 'dist',
  sourcemap: true,
  format: ['esm', 'cjs'],
  entry: [INPUT_FILE],
  external: [
    ...Object.keys(dependencies),
    ...Object.keys(peerDependencies),
    'react-textarea-autosize',
  ],
  outExtension: (ctx) => {
    return { js: `.${ctx.format === 'esm' ? 'es' : ctx.format}.js` };
  },
  env: {
    NODE_ENV: 'production',
  },
});
