import { describe, expect, it } from 'bun:test';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getWorkspaceSourceEntries } from '../../../../config/workspace-source-entries.mjs';

const require = createRequire(import.meta.url);
const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

describe('Vercel runtime packaging', () => {
  it('aliases every live workspace export and no retired package roots', async () => {
    const { default: getNextConfig } = await import('../../next.config');
    const nextConfig = await getNextConfig('phase-development-server');
    const aliases = nextConfig.turbopack?.resolveAlias ?? {};
    const repoRoot = path.resolve(appRoot, '../..');

    expect(Object.keys(aliases).toSorted()).toEqual(
      getWorkspaceSourceEntries(repoRoot)
        .map(({ specifier }) => specifier)
        .toSorted()
    );
    expect(aliases).toHaveProperty('platejs');
    expect(aliases).toHaveProperty('platejs/react');
    expect(aliases).not.toHaveProperty('@platejs/platejs');
    expect(aliases).not.toHaveProperty('@udecode/plate');
  });

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

  it('traces raw docs into the production search function', async () => {
    const { default: getNextConfig } = await import('../../next.config');
    const nextConfig = await getNextConfig('phase-production-build');

    expect(nextConfig.outputFileTracingIncludes?.['/api/search']).toContain(
      '../../content/docs/**/*'
    );
  });

  it('traces registry files into every production route', async () => {
    const { default: getNextConfig } = await import('../../next.config');
    const nextConfig = await getNextConfig('phase-production-build');
    const tracingIncludes = nextConfig.outputFileTracingIncludes;

    expect(tracingIncludes?.['/*']).toEqual([
      './src/registry/**/*',
      './public/r/**/*',
    ]);
    expect(tracingIncludes?.['/docs/examples/plate-to-html']).toContain(
      './public/tailwind.css'
    );
    expect(tracingIncludes?.['/cn/docs/examples/plate-to-html']).toContain(
      './public/tailwind.css'
    );
  });

  it('traces sparse provider/style overlays into the style route', async () => {
    const { default: getNextConfig } = await import('../../next.config');
    const nextConfig = await getNextConfig('phase-production-build');

    expect(nextConfig.outputFileTracingIncludes?.['/r/[style]/[name]']).toEqual(
      ['./public/r/*.json', './src/__registry__/overlays/**/*.json']
    );
  });
});
