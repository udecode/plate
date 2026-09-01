import { readFileSync } from 'node:fs';

Bun.plugin({
  name: 'fanout-anchor-point-memo-counterfactual',
  setup(builder) {
    builder.onLoad({ filter: /\/core\/anchor\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const before = `      const mappedPoints = pointStates.map((state, index) =>
        resolveMappedPoint(
          state,
          change,
          getSourceDocument(),
          nextDocument(),
          associations[index],
          context?.replace === true,
          context
        )
      );`;
      const after = `      const mappedPoints = pointStates.map((state, index) => {
        const read = () => resolveMappedPoint(state, change, getSourceDocument(), nextDocument(), associations[index], context?.replace === true, context);
        if (!context) return read();
        const mapped = context.memoize(JSON.stringify(['point', root, state.point.path, state.point.offset, state.nodeKey, state.includeRoot, associations[index], track]), read);
        return mapped ? { ...mapped, point: withPublicPointRoot(mapped.point, root, state.includeRoot) } : null;
      });`;
      if (!source.includes(before)) throw new Error('Point-memo counterfactual no longer matches');
      return { contents: source.replace(before, after), loader: 'ts' };
    });
  },
});
