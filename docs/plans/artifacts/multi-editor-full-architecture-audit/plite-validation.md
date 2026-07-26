# Plite lane validation

## Machine census

Generated from the live checkout at commit `979c00b350f0c139c28f5bfb3b52adc51d18d5dd`.

| Role                    |     Files |       Lines | Top-level declarations |
| ----------------------- | --------: | ----------: | ---------------------: |
| Runtime source          |       474 |     158,725 |                  3,258 |
| Tests and fixtures      |     1,332 |     226,365 |                    345 |
| Benchmarks              |       106 |      64,627 |                    329 |
| Proof tooling           |        28 |      11,999 |                    187 |
| Documentation/research  |       313 |      26,358 |                  1,129 |
| Package/config metadata |        65 |       4,975 |                    756 |
| **Total**               | **2,318** | **493,049** |              **6,004** |

The unusual test/declaration ratio is expected: `packages/plite/test` contains many JSX fixtures and result artifacts whose relevant unit is the file, not an exported declaration.

## Scope counts

| Scope                        | Files |   Lines | Declarations |
| ---------------------------- | ----: | ------: | -----------: |
| `packages/plite`             | 1,212 | 153,422 |        1,805 |
| `packages/plite-dom`         |    62 |  22,525 |          439 |
| `packages/plite-history`     |    44 |   7,586 |           94 |
| `packages/plite-hyperscript` |    46 |   1,913 |           76 |
| `packages/plite-layout`      |    12 |   8,170 |          109 |
| `packages/plite-react`       |   276 | 103,972 |        1,171 |
| `packages/browser`           |    71 |  18,177 |          420 |
| `packages/yjs`               |    69 |  24,869 |          187 |
| `apps/plite`                 |    73 |  50,164 |           46 |
| `benchmarks/editor`          |    66 |  35,909 |          290 |
| `benchmarks/slate-v2`        |    39 |  27,188 |           36 |
| `docs/plite`                 |   313 |  26,358 |        1,129 |
| donor proof tooling          |    14 |   4,921 |           91 |
| root proof toolchain         |    21 |   7,875 |          111 |

## Public entrypoint census

The parser counts top-level exported declarations and re-export statements, not the recursively expanded symbol graph.

| Entrypoint                                   | Export declarations |
| -------------------------------------------- | ------------------: |
| `packages/plite/src/index.ts`                |                 269 |
| `packages/plite/src/internal/index.ts`       |                 192 |
| `packages/plite-dom/src/index.ts`            |                  98 |
| `packages/plite-dom/src/internal/index.ts`   |                 113 |
| `packages/plite-react/src/index.ts`          |                 177 |
| `packages/plite-react/src/internal/index.ts` |                   1 |
| `packages/plite-layout/src/index.ts`         |                  61 |
| `packages/plite-history/src/index.ts`        |                   2 |
| `packages/plite-hyperscript/src/index.ts`    |                   8 |
| `packages/yjs/src/index.ts`                  |                   2 |

## Targeted pressure scans

- Core `DataTransfer`: 11 source lines across 2 core files.
- Production `context.capabilities<T>(...)`: 1 call in 1 file, the host codec compiler.
- Production raw capability-registry access: 9 lines across 5 implementation files. Those accesses cover registration, public API aggregation, core and projected clipboard dispatch, configuration/activation contexts, and host codecs rather than one coherent concept.
- Production generic query middleware: 5 registrations in 4 files.
- Production caller-owned mark exclusion: reciprocal `clear` declarations in superscript and subscript, plus generic toolbar forwarding.
- Production Plite extension-wide priority: one clear registration, `OverridePlugin`. Plate plugin, codec, shortcut, input-rule, and schema-rule priorities are distinct and were not counted as Plite extension priority.
- Plite-family source dependency/conflict strings: one direct conflict (`react` against `dom`); Plate plugin dependencies are already descriptor-authored and lowered at the adapter.

## Validation commands

```sh
node docs/plans/artifacts/multi-editor-full-architecture-audit/plite-build-manifest.mjs
node docs/plans/artifacts/multi-editor-full-architecture-audit/plite-build-manifest.mjs --check
```

Observed:

```text
Wrote .../plite-source-manifest.json: 2318 files, 6004 declarations, 0 unmapped.
Plite source manifest verified: 2318 files, 6004 declarations, 0 unmapped.
```

The manifest records SHA-256 per file plus one aggregate source digest:

```text
7a55d7c0e41a1289a1a1b39328a6249418206e0ac4467d169551114335520e85
```

## Audit closure

- 32 atomic concepts are mapped in `plite-concepts.md`.
- Every included file maps to one or more concept IDs.
- Every parsed top-level declaration inherits a mapped concept.
- Seven current-versus-proposed Plite packets have public shape, internal shape, deletion, adoption, proof, dependency, and owner detail in `plite-pressure-audit.md`.
- Native input/repair, DOM scheduling, mapped view stores, host codec compilation, history, and Yjs were explicitly challenged and retained.
- No product or runtime source was edited.
