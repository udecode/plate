import { readFileSync } from 'node:fs';

Bun.plugin({
  name: 'fanout-range-projection-memo-counterfactual',
  setup(builder) {
    builder.onLoad({ filter: /\/range-projection\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const marker = 'export const projectRangeInSnapshot = (';
      const start = '  const [start, end] = RangeApi.edges(range);';
      const end = '  return Object.freeze(segments);';
      if (!source.includes(marker) || !source.includes(start) || !source.includes(end)) throw new Error('Projection-memo counterfactual no longer matches');
      return {
        loader: 'ts',
        contents: source
          .replace(marker, 'const lastProjection = new WeakMap<EditorSnapshot, { range: Range; segments: readonly ProjectedRangeSegment[] }>();\n\n' + marker)
          .replace(start, '  const cached = lastProjection.get(snapshot);\n  if (cached && RangeApi.equals(cached.range, range)) return cached.segments;\n' + start)
          .replace(end, '  const projected = Object.freeze(segments);\n  lastProjection.set(snapshot, { range: { anchor: { ...range.anchor, path: [...range.anchor.path] }, focus: { ...range.focus, path: [...range.focus.path] } }, segments: projected });\n  return projected;'),
      };
    });
  },
});
