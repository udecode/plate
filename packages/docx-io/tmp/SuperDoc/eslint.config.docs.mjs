import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    files: ['packages/super-editor/src/extensions/**/*.js'],
    plugins: {
      jsdoc
    },
    rules: {
      // Require minimal JSDoc for extensions
      'jsdoc/require-jsdoc': ['warn', {
        publicOnly: true,
        require: {
          FunctionDeclaration: false,
          MethodDefinition: false,
          ClassDeclaration: false,
          ArrowFunctionExpression: false,
          FunctionExpression: false
        },
        contexts: [
          // Document the extension module
          'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > CallExpression[callee.property.name="create"]'

          // Note: We document commands/helpers with @param/@returns
          // inside addCommands/addHelpers, not with require-jsdoc
        ]
      }],

      // When JSDoc exists, validate it's correct
      'jsdoc/require-param': 'error',             // All params must be documented
      'jsdoc/require-param-type': 'error',        // @param must have {Type}
      'jsdoc/check-param-names': 'error',         // @param names must match
      'jsdoc/check-types': 'error',               // Valid type syntax (string not String)

      // Optional - we use @returns {Function} or skip it
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-type': 'off',

      // Don't require descriptions if obvious
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-description': 'off',

      // Don't require examples - nice to have but not essential
      'jsdoc/require-example': 'off',

      // Simple formatting
      'jsdoc/require-hyphen-before-param-description': 'off', // Optional: @param {Type} name - Description

      // Allow types from our .d.ts files and common types
      'jsdoc/no-undefined-types': ['warn', {
        definedTypes: [
          // Allow any type that starts with capital letter (likely imported)
          '/^[A-Z]/',

          // Common utility types
          'Partial', 'Required', 'Readonly', 'Pick', 'Omit',

          // Built-in types
          'Function', 'Object', 'Array', 'Promise',

          // DOM
          'HTMLElement', 'Element', 'Event'
        ]
      }],

      // Don't enforce these
      'jsdoc/valid-types': 'off',                 // We use TypeScript syntax
      'jsdoc/check-tag-names': 'off',             // Allow @module, @typedef, etc.
      'jsdoc/check-alignment': 'off',             // Don't worry about alignment
      'jsdoc/multiline-blocks': 'off'             // Allow single or multi-line
    },
    settings: {
      jsdoc: {
        mode: 'typescript',      // Understand TypeScript syntax in JSDoc
        preferredTypes: {
          object: 'Object',      // Use Object not object
          array: 'Array',        // Use Array not array
          'Array.<>': 'Array<>', // Use Array<Type> not Array.<Type>
        }
      }
    }
  }
];