import fs from 'fs'
import path from 'path';
import { defineConfig } from 'tsup';

const PACKAGE_ROOT_PATH = process.cwd();
const INPUT_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.ts');
const INPUT_FILE = fs.existsSync(INPUT_FILE_PATH)
    ? INPUT_FILE_PATH
    : path.join(PACKAGE_ROOT_PATH, 'src/index.tsx');

export default defineConfig({
    outDir: 'dist',
    minify: 'terser',
    format: ['esm', 'cjs'],
    entryPoints: [INPUT_FILE],
    external: ['react-textarea-autosize'],
    env: {
        NODE_ENV: 'production'
    },
});
