# Plate Next List read hard cut

Objective:
Hard-cut List snapshot queries onto plugin `read`; complete when every final
package row scores 100, package proof passes, and List reports Plate Next v12
current.

Flow mode:
One-shot package implementation.

Goal plan:
`docs/plans/2026-07-26-plate-next-list-read-hard-cut.md`

Template:
`docs/plans/templates/plate-next.md`

Applied packs:
- package-api

Plate Next source:
- User accepted the List `read` audit with “ok go fix”.
- Target: `packages/list` plus only the Core/Plite owners needed to preserve
  dependency `read` inference and installed transaction groups.
- Review target: best Plate v2 shape on Plite, without compatibility aliases.
- Package review mode: yes.
- Broad Core sweep: no.
- Doctrine: v12.
- Start: List v7, source changed, live fingerprint
  `sha256:761c5e672e27818825a4b270a47dc1b4f82162ddbda743059e9b726e41604fe9`,
  13 manifest rows.
- Finish: List v12 current, fingerprint
  `sha256:ac24659472025a87ecbd9361eb3b460307109a28e5e621481783e709e3c96772`,
  14 manifest rows.

First checkpoint:
- Move `getNext`, `getPrevious`, `expandItemsWithChildren`, and `isActive` to
  constructor `read`.
- Keep pure sequence helpers on constructor `api`.
- Use `tx.list.*` inside active transactions and `tx.nodes.some` in rule
  guards.
- Keep independent contributions in the constructor. Retain `.extend()` only
  where the extension consumes an earlier published transaction group.
- Require sibling traversal state internally without exposing a public state
  escape.
- Split hook proof by hook family, remove touched casts and dead `clsx`, update
  the List changeset, prove emitted declarations, and attest v12.
- Do not patch the ten external app/docs consumers or start another package in
  this packet.

Timed checkpoint:
- Requested duration: none.
- Completion metric: 14/14 final package rows at score 100.

Completion threshold:
- Four snapshot-dependent List methods publish only through `read`; two pure
  services remain on `api`.
- Package transaction code calls `tx.list.*`; no nested editor mutation is
  introduced.
- Only one production plugin `.extend()` remains, justified by an earlier
  transaction-group dependency.
- No broad `any`, inferred callback annotations, transaction ferry helper, old
  List state API alias, mixed hook spec, or dead `clsx` remains.
- Core dependency contexts infer dependency `read`; Plite correction/change
  transactions preserve installed extension groups in types and runtime.
- List typecheck, tests, build, lint, source audits, structured review, package
  fingerprint, and version attestation pass.
- The exact List/Core portions of `check:core` pass. The full command’s
  unrelated Utils release-note failure is recorded without expanding scope.

Verification surface:
- `pnpm turbo typecheck --filter=./packages/list`
- `pnpm --filter @platejs/list test`
- `pnpm --filter @platejs/list build`
- `bun test` over four List owner specs
- `pnpm --filter @platejs/core typecheck:contracts`
- `bun test ./packages/plite/test/normalization-contract.ts`
- schema-adoption checker contracts and `pnpm check:core`
- scoped source, cast, topology, dependency, export, and diff audits
- structured local autoreview restricted to this packet
- Plate Next version validate/status/check/fingerprint

Constraints:
- Owner-first colocation; no line ceiling.
- Constructor owns independent declarations. `.extend()` exists only for a
  real earlier-capability dependency or imported/prebuilt adaptation.
- `read` owns state-bound queries, `api` owns pure services, and `update`/active
  `tx` own mutations.
- Fix generic inference at Core/Plite owners; never annotate callbacks or cast
  List around an owner bug.
- No compatibility aliases, helper dumps, app/docs adoption, unrelated package
  cleanup, generated registry output, or template edits.
- New React tests colocate with their hook families.

Boundaries:
- Code: `packages/list`; exact owner repairs in Core plugin typing and Plite
  correction/change transaction publication.
- Proof: corresponding Core type contracts, Plite normalization contract, and
  exact schema-adoption checker allowlist.
- Metadata: List changeset, this plan, and List’s Plate Next version entry.
- Browser: N/A. No app, docs, registry, component, or rendered route changed.
- Barrels: N/A. Public exports and exported source layout are unchanged; only
  private test topology changed.

Blocked condition:
Stop only if three distinct owner-level attempts cannot preserve inferred
dependency `read` or installed transaction groups. That condition did not
occur.

Current verdict:
- Verdict: complete package hard cut.
- Confidence: high.
- Keep: owner-first List colocation and pure sequence helpers on `api`.
- Cut: state-bound List methods on `api`, public state plumbing, mixed hook
  proof, broad casts, dead `clsx`, and the redundant builder stage.
- Next owner: a separate List consumer-adoption packet for the ten app/docs
  calls.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | API ownership, package scope, proof, stop condition, attestation, and handoff recorded before edits |
| Plate Next doctrine | yes | Generated v12 skill read before implementation |
| Goal lifecycle | yes | Quantitative 14-row goal and this plan created |
| Package mode | yes | List plus smallest Core/Plite owners; no broad Core sweep |
| Best Plate v2 target | yes | Constructor `read`, pure `api`, active `tx.list`, no alias |
| Package manifest | yes | 13 start rows materialized before edits; final topology recomputed to 14 |
| Changeset owner | yes | Changeset skill read; existing List major release note updated |
| Browser boundary | no | Package/type/runtime change has no runnable rendered surface in this packet |

Work Checklist:
- [x] Four state-bound methods moved to constructor `read`.
- [x] Pure sequence helpers retained on constructor `api`.
- [x] Active List calls use `tx.list.*`; three rule guards use `tx.nodes.some`.
- [x] Traversal callbacks require captured state; private list-start logic
      accepts resolved domain data.
- [x] Independent `override` and `update` contributions live in the constructor.
- [x] The sole production `.extend()` is justified by its use of the earlier
      `tx.list.outdent` group.
- [x] No production helper taxonomy or standalone transaction-parameter
      function remains.
- [x] Hook tests colocate with `useListToolbarButton` and
      `useTodoListElement`; the mixed spec is deleted.
- [x] Touched List tests contain no broad `any`; callback inference stays
      unannotated.
- [x] Core dependency `read` inference is repaired and compile-tested.
- [x] Plite change/correction transaction groups are preserved and
      runtime-tested.
- [x] Core static wrapper owner typing is exact; the List static proof uses no
      cast.
- [x] `clsx` is removed and dependencies installed.
- [x] Package API, optional-read, normalization, plugin-inference, matcher, and
      one-shot callback audits are closed.
- [x] Every related correction has a scoped sweep row.
- [x] All 14 final package rows score 100.
- [x] Two new proof files are classified as family-owner replacements.
- [x] Focused typecheck, tests, build, lint, diff, and source audits pass.
- [x] Public exports are unchanged, so barrel generation is N/A.
- [x] Existing List major changeset teaches the final API.
- [x] Structured autoreview reports no actionable finding.
- [x] List registry entry is attested at v12 and reports current.
- [x] Changed files, outside callers, external gate failure, and next owner are
      recorded.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | 114/114 focused List tests; package typecheck/test/build green |
| Score gate | yes | 14/14 final package rows checked at 100 |
| Best Plate v2 recommendation | yes | State reads on `read`, pure services on `api`, mutations on active `tx` |
| Core/Plite gaps | yes | Owner fixes compile; Plite normalization contract 37/37 |
| Related scoped sweeps | yes | All package matches patched; ten external consumers counted for the next packet |
| Package doctrine attestation | yes | v12 current; exact 14-file fingerprint unchanged after attestation |
| Helper topology | yes | No helper directory or production tx-parameter function; one justified plugin stage |
| Shared Core coverage | yes | List checker allowlist and its 24 contracts updated; owner stages pass |
| Source audit | yes | Zero stale package API calls, broad any, dead clsx, or forbidden helper topology |
| Extracted file inventory | yes | Two untracked hook specs classified as mixed-spec family replacements |
| Autoreview | yes | Local Codex structured review clean, confidence 0.82 |
| Final lint/check | yes | Package lint and scoped Biome/diff checks green |
| Release artifact | yes | Existing `@platejs/list` major changeset updated; no duplicate Core/Plite note |
| Registry changelog | no | No registry-only change |
| Barrel generation | no | No public export or exported layout change |
| Browser | no | No browser-facing file changed |
| Goal plan checker | yes | Run after this final evidence write |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| API ownership | complete | Four reads moved; two pure services retained |
| Owner typing/runtime | complete | Core contracts and Plite 37/37 pass |
| Package proof | complete | 114/114 focused; typecheck/test/build green |
| Review | complete | Structured autoreview clean |
| Attestation | complete | List v12 current, 14-file fingerprint exact |
| Handoff | complete | External callers and unrelated gate failure recorded |

Review matrix:
| Path / API | Final score | Verdict | Owner | Evidence |
|------------|-------------|---------|-------|----------|
| State-bound List API | 100 | hard-cut-to-read | `BaseListPlugin` | Four methods publish through constructor `read` |
| Pure List API | 100 | keep-in-api | `BaseListPlugin` | Two state-independent sequence helpers |
| Active reads/writes | 100 | tx-owned | `BaseListPlugin` | Internal calls use `tx.list`; guards use `tx.nodes.some` |
| Builder stages | 100 | constructor-first | `BaseListPlugin` | One remaining stage consumes earlier `tx.list.outdent` |
| Hook proof | 100 | family-colocated | React hook owners | Two owner specs replace one mixed spec |
| Test typing | 100 | inference-owned | List specs | Zero broad `any`; emitted build green |
| Dependency read | 100 | Core owner fix | Core plugin context | Dependency config state slot and context `read` fixed |
| Correction tx groups | 100 | Plite owner fix | Plite state publication | Installed groups copied by registered key and type-preserved |

Best Plate v2 recommendation:
| Target | Final shape | Rejected shape | Reason |
|--------|-------------|----------------|--------|
| List queries | `editor.read.list.*` / portal `.read.*` | `.api.*` with state arguments | Snapshot ownership is explicit and transaction-local |
| List services | `.api.getSequenceSiblingOptions` and `.api.isSequenceBoundary` | Put every query-sounding function on `read` | Both are pure |
| List mutations | `editor.update.list.*` or active `tx.list.*` | Nested editor updates and tx ferry helpers | One transaction owns composition |
| Plugin authoring | constructor plus one dependent extension stage | Multiple taxonomic `.extend*` stages | Constructor owns independent declarations |

Plite / Plate gap ledger:
| Gap | Owner | Repair | Proof | Status |
|-----|-------|--------|-------|--------|
| Dependency projection placed plugin state in the options slot | Core `PluginConfig` | Correct generic slots and type context `read` from dependency tree | Core contracts and List emitted build | closed |
| Change/correction contexts dropped installed tx groups | Plite editor/public state | Preserve `ExtensionsOf<TEditor>` and copy registered runtime groups | 37/37 normalization contract | closed |
| Static wrapper context widened the owning config | Core `BasePlugin` | Keep exact config through static wrapper props | Fully typed List wrapper spec and Core contracts | closed |

Related scoped sweep ledger:
| Correction | Scope | Query / method | Matches | Patched | Outside packet | Result |
|------------|-------|----------------|---------|---------|----------------|--------|
| State API hard cut | `packages/list` | Four method declarations plus same-package calls/mocks | 33 | 33 | 0 | zero stale package `.api` calls |
| Active tx routing | List runtime | Seven internal state calls plus three guards | 10 | 10 | 0 | `tx.list.*` / `tx.nodes.some` |
| Hook ownership | List React | Two hook owners plus one mixed spec | 3 owners | delete 1, add 2 | 0 | owner-colocated proof |
| Broad casts | List package | `as any`, `: any`, `<any>`, `any[]` | 55 start | 55 | 0 | zero final matches |
| Builder stages | List source | `.extend(` inventory | 1 production, 2 test adaptations, 2 transaction-spec extensions | 0 needed | 0 | all justified |
| Helper topology | List production | helper directories and standalone tx parameters | 0 | 0 | 0 | clean |
| Consumer adoption | `apps/www` + `content` read-only | old List portal state calls | 10 | 0 | 10 | separate packet required |

Core drift ledger:
- Applies: no; this is named package mode.
- Exact owner rows: `PluginConfig.ts`, `BasePlugin.ts`, and
  `base-plugin-contracts.ts`.
- Broad manifest expected/actual/missing/extra: 0/0/0/0.
- The exact owner rows score 100; no broad Core claim is made.

Package file checklist:
- Manifest command:
  `node .agents/rules/plate-next/scripts/version.mjs fingerprint list`
- Expected final rows: 14.
- Actual final rows: 14.
- Checked at score 100: 14.
- Unchecked: 0.
- Missing: 0.
- Extra: 0.
- Top drift: none.

Package file rows:
- [x] `packages/list/package.json` — 100 — dead `clsx` removed; package proof.
- [x] `packages/list/src/index.ts` — 100 — export audit unchanged.
- [x] `packages/list/src/lib/BaseListPlugin.slow.tsx` — 100 — required state,
      typed fixtures, slow proof.
- [x] `packages/list/src/lib/BaseListPlugin.spec.tsx` — 100 — read/tx/type/static
      contracts with no broad cast.
- [x] `packages/list/src/lib/BaseListPlugin.tsx` — 100 — final API ownership,
      constructor-first stages, owner colocation.
- [x] `packages/list/src/lib/index.ts` — 100 — export audit unchanged.
- [x] `packages/list/src/react/ListPlugin.tsx` — 100 — inferred descriptor.
- [x] `packages/list/src/react/index.ts` — 100 — export audit unchanged.
- [x] `packages/list/src/react/useListToolbarButton.spec.tsx` — 100 — toolbar
      hook-family proof.
- [x] `packages/list/src/react/useListToolbarButton.ts` — 100 — portal
      `.read.isActive`.
- [x] `packages/list/src/react/useTodoListElement.spec.tsx` — 100 — todo hook
      family proof.
- [x] `packages/list/src/react/useTodoListElement.ts` — 100 — family source
      unchanged and covered.
- [x] `packages/list/tsconfig.build.json` — 100 — declaration build green.
- [x] `packages/list/tsconfig.json` — 100 — source typecheck green.

Package doctrine / sync ledger:
| Package | Start | Final | Start fingerprint | Final fingerprint | Proof | Registry |
|---------|-------|-------|-------------------|-------------------|-------|----------|
| list | v7 stale | v12 | `761c5e67…fe9` (13) | `ac246594…c96772` (14) | package + Core/Plite contracts + review | current |

Helper topology ledger:
| Surface | Count | Decision | Evidence |
|---------|-------|----------|----------|
| Production helper taxonomy | 0 | clean | no `transforms/`, `queries/`, `utils/`, `helpers/`, `with*`, or `decorate*` files |
| Standalone production function accepting `tx` | 0 | clean | scoped declaration search |
| Plugin `.extend()` | 1 | keep | extension callbacks consume earlier `tx.list.outdent` |
| Test `H1Plugin.extend({ type })` | 2 | keep | prebuilt descriptor adaptation |
| `state.transaction.extend` | 2 | keep | Plite transaction-result continuation, not plugin authoring |
| One-shot callbacks | 2 tests | keep | one proves installed `tx.indent`; one builds a shared HTML snapshot context |

Extracted file ledger:
| Path | Bucket | Origin owner check | Decision | Proof |
|------|--------|--------------------|----------|-------|
| `useListToolbarButton.spec.tsx` | merge-existing-owner | cases came from mixed `ListPlugin.spec.tsx` | colocate with toolbar hook | focused hook proof |
| `useTodoListElement.spec.tsx` | merge-existing-owner | cases came from mixed `ListPlugin.spec.tsx` | colocate with todo hook | focused hook proof |
| `ListPlugin.spec.tsx` | delete-duplicate | mixed two durable hook owners | delete | replacement specs cover all three tests |

Out-of-scope package drift:
| Surface | Evidence | Classification | Next |
|---------|----------|----------------|------|
| Utils release note | `check:core` stops at `.changeset/utils-plite-node-types.md:30` on `editor.tf.exitBreak.insert` | unrelated shared current-tree prose; every preceding List/Core stage passes | Utils owner replaces the stale release-note call |
| List consumers | six docs calls and four registry calls still use List `.api` state methods | package-mode exclusion | separate app/docs adoption with Browser proof |

Changed list:
| Group | Changes |
|-------|---------|
| List runtime/API | Four methods to `read`; tx-local calls; constructor stage consolidation; required traversal state |
| List React/tests | Portal `.read`; mixed spec replaced by two hook-family specs; casts removed |
| Core | Dependency config state slot, dependency-tree context `read`, exact static wrapper typing, contracts |
| Plite | Extension-aware correction/change transaction types and runtime group publication |
| Tooling | Exact List stage checker allowlist and regression contract |
| Metadata | `clsx` removed; List changeset, v12 attestation, and this evidence plan updated |
| Reverted/quarantined | none |

Needs your attention:
| Rank | Item | Why | Recommendation |
|------|------|-----|----------------|
| 1 | Ten external List consumers | Hard-cut package API leaves six docs and four registry calls stale | Run a separate consumer-adoption packet with Browser proof |
| 2 | Utils release-note call | It alone blocks the tail of repo-wide `check:core` | Let the Utils owner replace `editor.tf.exitBreak.insert` |

Findings:
- `read` is the correct owner only for snapshot-dependent behavior. Moving pure
  sequence logic there would be API theater.
- The List refactor exposed real owner bugs: Core dropped dependency state from
  config projection, and Plite dropped installed tx groups from correction and
  change contexts.
- One `.extend()` is justified; more would merely encode compiler taxonomy.

Decisions and tradeoffs:
- Package source is complete without compatibility aliases.
- External app/docs calls remain outside this packet by package-mode law.
- Core/Plite fixes are narrow owner corrections, not List-specific casts.
- No browser or barrel work is fabricated for a package-only type/runtime
  packet.

Error attempts:
| Error | Count | Different move | Resolution |
|-------|-------|----------------|------------|
| Initial Turbo graph hit transient Utils source-resolution errors | 1 | Run direct List TypeScript, repair owners, then rerun Turbo | final Turbo 14/14 |
| Dependency `read` and extension/correction `tx.list` missing | 1 | Repair Core/Plite owners | contracts and emitted build pass |
| Stale checker expected three List stages | 1 | Update exact allowlist and negative contract | checker 24/24 |
| Plite Bun path omitted `./` | 1 | Rerun as an explicit path | 37/37 |
| Full `check:core` tail hits unrelated Utils changeset | 1 | Preserve package boundary and record external owner | all preceding owner stages green |

Verification evidence:
- List focused tests: 114 pass, 0 fail, 224 expectations across four files.
- List Turbo typecheck: 14/14 tasks.
- List package test: pass.
- List declaration build: pass.
- Core type contracts: pass.
- Plite normalization contract: 37 pass, 0 fail.
- Schema-adoption checker contracts: 24 pass, 0 fail.
- `check:core`: Core runner 6/6, declaration leak 3/3, brand 2/2,
  schema-adoption 24/24 plus 4,603-file source audit, docs code contracts 15/15
  plus 363-file audit; unrelated Utils release-note call blocks the later Plite
  docs audit.
- Source audits: zero stale package List `.api` state calls, zero broad `any`,
  zero dead `clsx`, zero forbidden helper topology, zero production
  transaction-parameter functions, and clean scoped `git diff --check`.
- Autoreview command: `.agents/skills/autoreview/scripts/autoreview --mode
  local --prompt <scoped List/Core/Plite baseline> --stream-engine-output`.
- Autoreview: clean, no accepted/actionable findings, correctness “patch is
  correct”, confidence 0.82.
- Version registry: valid; List v12 current; zero stale or drifted tracked List
  packages; fingerprint `ac246594…c96772` over 14 files.
- Browser: N/A because no browser-facing file changed.
- Barrels: N/A because no public export changed.

Final handoff contract:
- Surface/mode: `packages/list`, package hard cut.
- Checklist: 14/14 score 100, zero unchecked.
- Doctrine: v7 stale/source-changed to v12 current.
- API: snapshot reads on `read`, pure services on `api`, active mutations on
  `tx.list`.
- Gaps: three owner type/runtime gaps repaired and proven.
- Outside matches: ten consumer calls recorded, zero patched here.
- Release: existing List major changeset updated.
- Review: clean.
- Next: List registry/docs consumer adoption, then continue the package audit.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Package closeout complete |
| Where am I going? | Separate List consumer adoption |
| What is the goal? | 14/14 List rows at 100 and v12 current |
| What did I learn? | Dependency state and installed tx groups needed owner fixes |
| What did I do? | Hard-cut List reads, repaired owners, proved and attested v12 |

Timeline:
- 2026-07-26: goal created, implementation completed, proof/review passed, List
  attested at v12.

Open risks:
- Ten app/docs consumers still call the removed List state methods through
  `.api`; they require a separately authorized adoption packet.
- The unrelated Utils changeset keeps the full current-tree `check:core`
  command red after every List/Core-owned stage passes.
