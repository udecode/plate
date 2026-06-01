import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'bun:test';

const require = createRequire(import.meta.url);
const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

describe('Vercel runtime packaging', () => {
  it('keeps generated Next.js server files loadable by the CommonJS launcher', async () => {
    const packageJson = await Bun.file(
      path.join(appRoot, 'package.json')
    ).json();

    expect(packageJson.type).toBeUndefined();
  });

  it('keeps the PostCSS config loadable without package-level ESM', () => {
    const postcssConfig = require(path.join(appRoot, 'postcss.config.js'));

    expect(postcssConfig.plugins).toHaveProperty('@tailwindcss/postcss');
  });
});
