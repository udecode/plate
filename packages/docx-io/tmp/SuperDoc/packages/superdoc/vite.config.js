import path from 'path';
import copy from 'rollup-plugin-copy'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { visualizer } from 'rollup-plugin-visualizer';
import vue from '@vitejs/plugin-vue'

import { version } from './package.json';

const visualizerConfig = {
  filename: './dist/bundle-analysis.html',
  template: 'treemap',
  gzipSize: true,
  brotliSize: true,
  open: true
}

export const getAliases = (isDev) => {
  const aliases = {
    '@superdoc': fileURLToPath(new URL('./src', import.meta.url)),
    '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
    '@packages': fileURLToPath(new URL('../', import.meta.url)),

    // Super Editor aliases
    '@': fileURLToPath(new URL('../super-editor/src', import.meta.url)),
    '@core': fileURLToPath(new URL('../super-editor/src/core', import.meta.url)),
    '@extensions': fileURLToPath(new URL('../super-editor/src/extensions', import.meta.url)),
    '@features': fileURLToPath(new URL('../super-editor/src/features', import.meta.url)),
    '@components': fileURLToPath(new URL('../super-editor/src/components', import.meta.url)),
    '@helpers': fileURLToPath(new URL('../super-editor/src/core/helpers', import.meta.url)),
    '@converter': fileURLToPath(new URL('../super-editor/src/core/super-converter', import.meta.url)),
    '@tests': fileURLToPath(new URL('../super-editor/src/tests', import.meta.url)),
  };

  if (isDev) {
    aliases['@harbour-enterprises/super-editor'] = path.resolve(__dirname, '../super-editor/src');
  };

  return aliases;
};


// https://vitejs.dev/config/
export default defineConfig(({ mode, command}) => {
  const plugins = [
    vue(),
    copy({
      targets: [
        {
          src: path.resolve(__dirname, '../super-editor/dist/*'),
          dest: 'dist/super-editor',
        },
        { 
          src: path.resolve(__dirname, '../../node_modules/pdfjs-dist/web/images/*'), 
          dest: 'dist/images',
        },
      ],
      hook: 'writeBundle'
    }),
    // visualizer(visualizerConfig)
  ];
  if (mode !== 'test') plugins.push(nodePolyfills());
  const isDev = command === 'serve';

  return {
    define: {
      __APP_VERSION__: JSON.stringify(version),
      __IS_DEBUG__: true,
    },
    plugins,
    build: {
      target: 'es2022',
      cssCodeSplit: false,
      lib: {
        entry: "src/index.js",
        name: "SuperDoc",
        cssFileName: 'style',
      },
      minify: false,
      sourcemap: false,
      rollupOptions: {
        input: {
          'superdoc': 'src/index.js',
          'super-editor': 'src/super-editor.js',
        },
        external: [
          'yjs',
          '@hocuspocus/provider',
          'pdfjs-dist',
          'vite-plugin-node-polyfills',
        ],
        output: [
          {
            format: 'es',
            entryFileNames: '[name].es.js',
            chunkFileNames: 'chunks/[name]-[hash].es.js',
            manualChunks: {
              'vue': ['vue'],
              'blank-docx': ['@harbour-enterprises/common/data/blank.docx?url'],
              'jszip': ['jszip'],
              'eventemitter3': ['eventemitter3'],
              'uuid': ['uuid'],
              'xml-js': ['xml-js'],
            }
          },
          {
            format: 'cjs',
            entryFileNames: '[name].cjs',
            chunkFileNames: 'chunks/[name]-[hash].cjs',
            manualChunks: {
              'vue': ['vue'],
              'blank-docx': ['@harbour-enterprises/common/data/blank.docx?url'],
              'jszip': ['jszip'],
              'eventemitter3': ['eventemitter3'],
              'uuid': ['uuid'],
              'xml-js': ['xml-js'],
            }
          }
        ],        
      }
    },
    optimizeDeps: {
      include: ['pdfjs-dist', 'yjs', '@hocuspocus/provider'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
    resolve: {
      alias: getAliases(isDev),
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
    css: {
      postcss: './postcss.config.cjs',
    },
    server: {
      port: 9094,
      host: '0.0.0.0',
      fs: {
        allow: [
          path.resolve(__dirname, '../super-editor'),
          '../',
          '../../',
        ],
      },
    },
  }
});