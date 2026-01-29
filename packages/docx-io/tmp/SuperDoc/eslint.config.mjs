import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      // Generated/vendor files that shouldn't be linted
      '**/pdfjs.js',
      '**/worker.js',
      '**/pdfjs-worker.js',
      '**/*.min.js',
      '**/vendor/**',
      '**/lib/**/*.umd.js',
      // Test files
      '**/*.test.js',
      '**/*.spec.js',
      '**/tests/**',
      '**/test/**',
      // Docs generated files
      'docs/.vitepress/cache/**',
      // Examples (different environments and coding styles)
      'examples/**',
      '**/examples/**',
      // Config files (CommonJS/different environments)
      '**/*.config.js',
      '**/commitlint.config.js',
    ],
  },
  {
    languageOptions: {
      // Globals for mixed browser/Node.js codebase
      globals: {
        // Universal APIs (available in both environments)
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // Browser APIs (client-side code)
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        File: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        DOMParser: 'readonly',
        atob: 'readonly',
        screen: 'readonly',
        requestAnimationFrame: 'readonly',
        URLSearchParams: 'readonly',
        TextDecoder: 'readonly',
        FileReader: 'readonly',
        DOMRect: 'readonly',

        // DOM APIs (text editing, clipboard, elements)
        HTMLElement: 'readonly',
        Node: 'readonly',
        DataTransfer: 'readonly',
        ClipboardEvent: 'readonly',
        TextSelection: 'readonly',
        CustomEvent: 'readonly',

        // Prosemirror library APIs
        ReplaceAroundStep: 'readonly',
        mergeAttributes: 'readonly',
        splitCell: 'readonly',

        // Utility functions and constants
        dateFormat: 'readonly',
        fontSize: 'readonly',
        nodeListHandler: 'readonly',
        node: 'readonly',

        // Node.js APIs (server-side code)
        Buffer: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        global: 'readonly',

        // Build constants
        __IS_DEBUG__: 'readonly',
        __APP_VERSION__: 'readonly',
        version: 'readonly',
        superdoc: 'readonly',
      }
    },
    rules: {
      'no-unused-vars': 'warn', // See warnings but don't block

      // Relax these rules - they're more style than bugs
      'no-empty': ['warn', { allowEmptyCatch: true }], // Allow empty catch blocks
      'no-case-declarations': 'off', // Common pattern in switch statements
      'no-control-regex': 'off', // Sometimes needed for text processing
      'no-useless-escape': 'warn', // Warn but don't error

      // Keep as warnings to address gradually
      'no-unsafe-optional-chaining': 'warn', // Important but not critical
      'no-unused-private-class-members': 'warn', // Clean up when refactoring
    }
  },
];