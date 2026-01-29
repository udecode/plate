import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vue from '@vitejs/plugin-vue'

import { version as superdocVersion } from '../superdoc/package.json';

export default defineConfig(({ mode }) => {
  const plugins = [vue()];

  if (mode !== 'test') plugins.push(nodePolyfills());

  return {
    plugins,
    // Combined test configuration
    test: {
      globals: true,
      environment: 'jsdom',
      exclude: [
        '**/*.spec.js',
      ],
    },
    define: {
      __APP_VERSION__: JSON.stringify(superdocVersion),
    },
    optimizeDeps: {
      exclude: ['yjs', 'tippy.js', '@floating-ui/dom']
    },
    build: {
      target: 'es2020',
      lib: {
        entry: "src/index.js",
        formats: ['es'],
        name: "super-editor",
        cssFileName: 'style',
      },
      rollupOptions: {
        external: [
          'vue',
          'yjs',
          'y-protocols',
        ],
        input: {
          'super-editor': 'src/index.js',
          'editor': '@core/Editor',
          'converter': '@core/super-converter/SuperConverter',
          'docx-zipper': '@core/DocxZipper',
          'toolbar': '@components/toolbar/Toolbar.vue',
          'file-zipper': '@core/super-converter/zipper.js',
          'ai-writer': '@components/toolbar/AIWriter.vue',
        },
        output: {
          globals: {
            'vue': 'Vue',
            'tippy.js': 'tippy',
          },
          manualChunks: {
            'converter': ['@core/super-converter/SuperConverter'],
            'editor': ['@core/Editor'],
            'docx-zipper': ['@core/DocxZipper'],
            'toolbar': ['@components/toolbar/Toolbar.vue'],
            'super-input': ['@components/SuperInput.vue'],
            'file-zipper': ['@core/super-converter/zipper.js'],
            'ai-writer': ['@components/toolbar/AIWriter.vue'],
          },
          entryFileNames: '[name].es.js',
          chunkFileNames: 'chunks/[name]-[hash].js'
        }
      },
      minify: false,
      sourcemap: false,
    },
    server: {
      port: 9096,
      host: '0.0.0.0',
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
        '@extensions': fileURLToPath(new URL('./src/extensions', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@helpers': fileURLToPath(new URL('./src/core/helpers', import.meta.url)),
        '@packages': fileURLToPath(new URL('../', import.meta.url)),
        '@converter': fileURLToPath(new URL('./src/core/super-converter', import.meta.url)),
        '@tests': fileURLToPath(new URL('./src/tests', import.meta.url)),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
    css: {
      postcss: './postcss.config.cjs',
    },
  }
})
