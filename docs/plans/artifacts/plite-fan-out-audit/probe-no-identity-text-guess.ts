import { readFileSync } from 'node:fs';

Bun.plugin({
  name: 'fanout-identity-counterfactual',
  setup(builder) {
    builder.onLoad({ filter: /\/core\/snapshot-index\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const start = source.indexOf('  // Splits and merges can preserve');
      const end = source.indexOf('  for (const sourcePath of orderedSources) {\n    const targetPath = mapPathForward', start);
      if (start < 0 || end < start) throw new Error('Identity counterfactual no longer matches its source');
      return { contents: 'globalThis.__fanoutIdentityCounterfactualLoaded = true;\n' + source.slice(0, start) + source.slice(end), loader: 'ts' };
    });
  },
});
