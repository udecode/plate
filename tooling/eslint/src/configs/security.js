import pluginSecurity from 'eslint-plugin-security';

import { defineConfig } from '../utils.js';

export default defineConfig(pluginSecurity.configs.recommended, {
  rules: {
    'security/detect-non-literal-fs-filename': 'off',
    'security/detect-non-literal-regexp': 'off',
    'security/detect-non-literal-require': 'off',
    'security/detect-object-injection': 'off',
    'security/detect-unsafe-regex': 'off',
  },
});
