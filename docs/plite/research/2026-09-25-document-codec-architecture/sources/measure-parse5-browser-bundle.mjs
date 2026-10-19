import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const require = createRequire(join(process.cwd(), 'packages/cli/package.json'));
const { build } = require('esbuild');
const probeNodeModules =
  process.env.PLATE_HTML_PROBE_NODE_MODULES ??
  join(process.cwd(), 'node_modules/.pnpm/node_modules');
const workspaceRequire = createRequire(join(probeNodeModules, 'plate-probe.cjs'));
const parse5Path = workspaceRequire
  .resolve('parse5')
  .replace('/dist/cjs/index.js', '/dist/index.js');
const result = await build({
  bundle: true,
  format: 'esm',
  minify: true,
  platform: 'browser',
  stdin: {
    contents: `
      import { parse, parseFragment } from ${JSON.stringify(parse5Path)};
      export { parse, parseFragment };
    `,
    resolveDir: process.cwd(),
    sourcefile: 'plate-html-parse5-entry.js',
  },
  treeShaking: true,
  write: false,
});
const code = result.outputFiles[0].contents;
const artifact = {
  gzipBytes: gzipSync(code, { level: 9 }).byteLength,
  minifiedBytes: code.byteLength,
  package: process.env.PLATE_HTML_PROBE_PARSE5_VERSION ?? 'parse5@8.0.1',
};
const output = join(
  process.cwd(),
  'docs/plite/research/2026-09-25-document-codec-architecture/parse5-browser-bundle.json'
);

writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify(artifact));
