# Plite lane validation

## Machine census

Generated from the live checkout at commit `01847c776dcf16738ba173b60053fc55828cf7a4`.

| Role                    |     Files |       Lines | Top-level declarations |
| ----------------------- | --------: | ----------: | ---------------------: |
| Runtime source          |       479 |     160,176 |                  3,294 |
| Tests and fixtures      |     1,337 |     226,984 |                    347 |
| Benchmarks              |       108 |      64,956 |                    329 |
| Proof tooling           |        28 |      12,000 |                    187 |
| Documentation/research  |       313 |      26,358 |                  1,129 |
| Package/config metadata |        65 |       4,981 |                    756 |
| **Total**               | **2,330** | **495,455** |              **6,042** |

The unusual test/declaration ratio is expected: `packages/plite/test` contains many JSX fixtures and result artifacts whose relevant unit is the file, not an exported declaration.

## Scope counts

| Scope                        | Files |   Lines | Declarations |
| ---------------------------- | ----: | ------: | -----------: |
| `packages/plite`             | 1,216 | 153,842 |        1,818 |
| `packages/plite-dom`         |    62 |  23,057 |          455 |
| `packages/plite-history`     |    44 |   7,589 |           94 |
| `packages/plite-hyperscript` |    46 |   1,913 |           76 |
| `packages/plite-layout`      |    12 |   8,170 |          109 |
| `packages/plite-react`       |   276 | 104,060 |        1,170 |
| `packages/browser`           |    72 |  18,218 |          420 |
| `packages/yjs`               |    71 |  25,104 |          191 |
| `apps/plite`                 |    76 |  50,919 |           52 |
| `benchmarks/editor`          |    68 |  36,213 |          290 |
| `benchmarks/slate-v2`        |    39 |  27,178 |           36 |
| `docs/plite`                 |   313 |  26,358 |        1,129 |
| donor proof tooling          |    14 |   4,921 |           91 |
| root proof toolchain         |    21 |   7,913 |          111 |

## Public entrypoint census

The parser counts top-level exported declarations and re-export statements, not the recursively expanded symbol graph.

| Entrypoint                                   | Export declarations |
| -------------------------------------------- | ------------------: |
| `packages/plite/src/index.ts`                |                 272 |
| `packages/plite/src/internal/index.ts`       |                 194 |
| `packages/plite-dom/src/index.ts`            |                 103 |
| `packages/plite-dom/src/internal/index.ts`   |                 118 |
| `packages/plite-react/src/index.ts`          |                 177 |
| `packages/plite-react/src/internal/index.ts` |                   1 |
| `packages/plite-layout/src/index.ts`         |                  61 |
| `packages/plite-history/src/index.ts`        |                   2 |
| `packages/plite-hyperscript/src/index.ts`    |                   8 |
| `packages/yjs/src/index.ts`                  |                   2 |

## Targeted pressure scans

- Core `DataTransfer`: zero; DOM transport is in `@platejs/plite-dom`.
- Production generic query middleware: zero execution owner, exported types,
  wrappers, registrations, and overridable methods.
- Production caller-owned mark exclusion: zero reciprocal `clear` laws.
- Production global extension-priority consumption: zero.
- Production plugin option mutations: zero.
- Extension dependencies and conflicts are descriptor-authored and published
  through the immutable candidate registry.

## Validation commands

```sh
node docs/plans/artifacts/multi-editor-full-architecture-audit/plite-build-manifest.mjs
node docs/plans/artifacts/multi-editor-full-architecture-audit/plite-build-manifest.mjs --check
```

Observed:

```text
Wrote .../plite-source-manifest.json: 2330 files, 6042 declarations, 0 unmapped.
Plite source manifest verified: 2330 files, 6042 declarations, 0 unmapped.
```

The manifest records SHA-256 per file plus one aggregate source digest:

```text
aaffef5213caef20bdf4fb7bee9fae1284b230cf1ff1a41dc5e3a3df22b44027
```

## Audit closure

- 32 atomic concepts are mapped in `plite-concepts.md`.
- Every included file maps to one or more concept IDs.
- Every parsed top-level declaration inherits a mapped concept.
- Seven current-versus-proposed Plite packets have public shape, internal shape, deletion, adoption, proof, dependency, and owner detail in `plite-pressure-audit.md`.
- Native input/repair, DOM scheduling, mapped view stores, host codec compilation, history, and Yjs were explicitly challenged and retained.
- No product or runtime source was edited.
