import { readFileSync } from 'node:fs';

Bun.plugin({
  name: 'fanout-mapped-membership-reuse-counterfactual',
  setup(builder) {
    builder.onLoad({ filter: /\/stable-id-mapped-source\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const from = source.indexOf('        const previousKeys = new Set(');
      const to = source.indexOf('\n      }\n\n      const nextIdsByOutputKey', from);
      const membership = `        for (const key of previous.outputsByKey.keys()) {
          work.outputCandidateVisits += 1;
          dirtyOutputKeys.add(key);
          if (next.outputsByKey.has(key)) continue;
          const changes = membershipChanges.get(key) ?? new Map();
          changes.set(id, false);
          membershipChanges.set(key, changes);
        }
        for (const key of next.outputsByKey.keys()) {
          if (previous.outputsByKey.has(key)) continue;
          work.outputCandidateVisits += 1;
          dirtyOutputKeys.add(key);
          const changes = membershipChanges.get(key) ?? new Map();
          changes.set(id, true);
          membershipChanges.set(key, changes);
        }`;
      const idsFrom = source.indexOf('        const ids = (state.idsByOutputKey.get(key) ?? []).filter(');
      const idsTo = source.indexOf('        nextIdsByOutputKey.set(key, ids);', idsFrom);
      const ids = `        let ids = state.idsByOutputKey.get(key) ?? [];
        if (changes) {
          ids = ids.filter(id => changes.get(id) !== false);
          changes.forEach((included, id) => { if (included) ids.push(id); });
          ids.sort((left, right) => (state.indexById.get(left) ?? failInvariant('Expected value to be defined')) - (state.indexById.get(right) ?? failInvariant('Expected value to be defined')));
        }
`;
      if (from < 0 || to < 0 || idsFrom < 0 || idsTo < 0) throw new Error('Membership counterfactual no longer matches');
      return { loader: 'ts', contents: source.slice(0, from) + membership + source.slice(to, idsFrom) + ids + source.slice(idsTo) };
    });
  },
});
