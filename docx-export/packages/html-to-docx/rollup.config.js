import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve as resolve } from '@rollup/plugin-node-resolve';
import cleaner from 'rollup-plugin-cleaner';
import builtins from 'rollup-plugin-node-builtins';
import { terser } from 'rollup-plugin-terser';

import * as meta from './package.json';

export default {
  input: 'index.js',
  external: [
    'color-name',
    'html-to-vdom',
    'jszip',
    'virtual-dom',
    'xmlbuilder2',
    'html-entities',
  ],
  plugins: [
    resolve(),
    json(),
    commonjs(),
    builtins(),
    terser({
      mangle: false,
    }),
    cleaner({
      targets: ['./dist/'],
    }),
  ],
  output: [
    {
      file: 'dist/html-to-docx.esm.js',
      format: 'es',
      sourcemap: true,
      banner: `// ${meta.homepage} v${meta.version} Copyright ${new Date().getFullYear()} ${
        meta.author
      }`,
    },
    {
      file: 'dist/html-to-docx.umd.js',
      format: 'umd',
      name: 'HTMLToDOCX',
      sourcemap: true,
      banner: `// ${meta.homepage} v${meta.version} Copyright ${new Date().getFullYear()} ${
        meta.author
      }`,
    },
  ],
};
