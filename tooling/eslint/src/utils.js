import { fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

export const defineConfig = tseslint.config;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

export function legacyPlugin(name, alias = name) {
  const plugin = compat.plugins(name)[0]?.plugins?.[alias];

  if (!plugin) {
    throw new Error(`Unable to resolve plugin ${name} and/or alias ${alias}`);
  }

  return fixupPluginRules(plugin);
}
