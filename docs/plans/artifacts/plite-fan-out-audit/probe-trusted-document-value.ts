import { readFileSync } from 'node:fs';

Bun.plugin({
  name: 'fanout-trusted-document-value-counterfactual',
  setup(builder) {
    builder.onLoad({ filter: /\/core\/public-state\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const start = source.indexOf('  const immutableChildren = Object.isFrozen(mainChildren)');
      const end = source.indexOf('  const value = {', start);
      if (start < 0 || end < start) throw new Error('Trusted value counterfactual no longer matches');
      return {
        contents: source.slice(0, start) + '  const immutableChildren = mainChildren;\n  const immutableRoots = hasExtraRoots ? Object.freeze(extraRoots) : undefined;\n' + source.slice(end),
        loader: 'ts',
      };
    });
  },
});
