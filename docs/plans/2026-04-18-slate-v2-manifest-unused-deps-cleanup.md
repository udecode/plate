---
date: 2026-04-18
topic: slate-v2-manifest-unused-deps-cleanup
status: active
---

# Goal

Remove manifest dependencies in `/Users/zbeyens/git/slate-v2` that no longer
have a real source, config, script, or build owner.

# Findings

- root already carried dead Babel/Jest-era tooling after the Bun/Vitest cut
- package-level `source-map-loader` residue remained in several packages with no
  current owner
- `slate-dom` still had a zombie `test` script despite having no `test/` tree
- `slate-react` still carried a few duplicate or stale test/dev deps after the
  Vitest migration

# Planned Cuts

1. remove dead root tooling deps
2. remove dead package-local Babel/source-map/test baggage
3. keep only deps with live source/config/script ownership
4. refresh lockfile
5. rerun `bun check`
