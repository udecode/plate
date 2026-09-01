import { readFileSync } from 'node:fs';

Bun.plugin({
  name: 'fanout-serialized-identity-counterfactual',
  setup(builder) {
    builder.onLoad({ filter: /\/core\/change\/root-change\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const marker = '  const split = document.withSplicedNodes(path.slice(0, -1), index, 1, [';
      const start = source.indexOf(marker, source.indexOf('export const splitNodeChange'));
      const end = source.indexOf('  return RootChange.between(document, split);', start);
      if (start < 0 || end < start) throw new Error('Structural boundary counterfactual no longer matches');
      return {
        contents: 'globalThis.__fanoutSerializedIdentityCounterfactualLoaded = true;\n' + source.slice(0, start) + `
  const nodeKind = isTextNode(node) ? 'text' : 'element';
  const boundary = isTextNode(node)
    ? document.positionAt({ path, offset: position })
    : document.childPosition(path, position);
  return RootChange.create(document, {
    from: boundary,
    insert: PreparedTokenSlice.fromTokens([
      { kind: 'close', nodeKind },
      openToken(nodeKind, nodeProps(after)),
    ]),
  });` + source.slice(end + '  return RootChange.between(document, split);'.length),
        loader: 'ts',
      };
    });
  },
});
