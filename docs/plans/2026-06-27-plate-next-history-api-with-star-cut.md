# plate-next history API with-star cut

Objective:
Cut history with-star API; done when Plite/Core use explicit `history.run` API, old names audit clean, checks pass.

Goal plan:
docs/plans/2026-06-27-plate-next-history-api-with-star-cut.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user said "gogo cut the best way" after the previous sweep named `withMerging` and `withNewBatch` as remaining broad `with*` source hits.
- mode: named API packet.
- target surface: `@platejs/plite-history` public history control API plus Plite React and Core mirrored type surfaces.
- broad Core sweep: no; this is a focused public API hard cut.
- completion threshold summary: old history `with*` / `without*` names removed from source/docs/tests except changelog, replacement API tested, `check:core` passes.

First checkpoint:
- Target: cut the remaining history `with*` names the best way, not by making four renamed aliases.
- Scope: Plite history API owner, Plite React type mirror, Core `CorePluginApi` mirror, tests, README/docs that teach current API.
- Non-goals: no broad Core sweep, no full package migration, no commit, no PR.
- Stop condition: stop only if the public API shape needs new user taste; it did not.
- Chosen shape: `editor.api.history.run(options, fn)`, where options express `{ merge: true }`, `{ newBatch: true }`, `{ merge: false }`, and `{ save: false }`.
- Final handoff: changed list, proof commands, old-name audit, remaining review item if any.

Timed checkpoint:
- requested duration: N/A.
- semantics: close when the API cut and proof gates pass.
- initial confidence score: N/A; binary source audit and command proof are the metric.
- improvement loop: patch API, update call sites/tests/docs, run focused proof, run source audit, run `check:core`.
- final score / loop closure: complete; old-name audit clean and `check:core` passed.

Completion threshold:
- `HistoryControlApi` exposes `run`, `isMerging`, and `isSaving`, and does not expose `withMerging`, `withNewBatch`, `withoutMerging`, or `withoutSaving`.
- Source call sites and tests use `editor.api.history.run(...)`.
- Exact audit for old names is clean outside changelog/history references that are intentionally not current API.
- Focused Plite history tests pass.
- `pnpm check:core` passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-history-api-with-star-cut.md` passes after final evidence is recorded.

Verification surface:
- focused tests / commands: Plite history tests and affected type/runtime tests.
- package proof: `pnpm check:core`.
- source audits: exact `rg` for `withMerging|withNewBatch|withoutMerging|withoutSaving`.
- docs proof: `pnpm --filter www check:docs` and Browser smoke on edited docs routes.
- broad Core drift ledger gate: N/A, focused API packet.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-plate-next-history-api-with-star-cut.md`.

Constraints:
- Plate owns product composition; Plite owns history substrate.
- No public compat aliases for old history names.
- Keep undo/redo merge, new-batch, skip-merge, and skip-save behavior.
- Keep Core and Plite type surfaces aligned.
- Docs must teach current API only.

Boundaries:
- allowed edit scope: `packages/plite-history/**`, `packages/plite-react/**` where it mirrors history API, `packages/core/**` where it mirrors history API, current docs/README references, and this plan.
- package/API surfaces: `editor.api.history`.
- docs/browser surfaces: edited Plite history docs pages and `content/docs/plite/api/nodes/editor.mdx`.
- non-goals: no broad Core package sweep, no external issue closure, no commit.
- out-of-scope package errors: classify unless caused by this API hard cut.

Output budget strategy:
- Used exact `rg` and focused file reads.
- Kept broad old-name audits to the target packages/docs and excluded `dist` plus changelog.
- Did not stream generated/build output except `check:core`, which was truncated by the tool after reporting pass.

Blocked condition:
- Block only if the replacement API cannot preserve current history behavior or TypeScript inference without a public API design fork.

Current verdict:
- verdict: complete.
- confidence: high; runtime behavior, type surface, docs, Browser smoke, old-name audit, and `check:core` are green.
- next owner: plate-next.
- keep / revert / quarantine call: keep.
- reason: one explicit `history.run(options, fn)` API replaces four old scoped helper names without aliases.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to cut the remaining history `with*` names the best way; scope and chosen shape recorded above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned null; created goal for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Focused public API packet, not broad Core sweep |
| Broad Core drift ledger initialized when in scope | N/A: not broad Core | Focused API packet; review matrix covers inspected APIs |
| Source of truth and allowed workspace recorded | yes | Read root `VISION.md`, `docs/vision/plate.md`, and `docs/vision/common.md`; cwd `/Users/zbeyens/git/plate-2` |
| Output budget strategy recorded | yes | Exact searches and focused reads only |
| Public API fork routing checked | yes | Shape follows existing history scope semantics and removes aliases; no `plate-plan` stop needed |

Work Checklist:
- [x] First checkpoint copied every explicit requirement and success criterion.
- [x] Mode classified as focused history API packet.
- [x] Broad Core sweep rows marked N/A because not in scope.
- [x] Review matrix is filled for every inspected API/helper.
- [x] Safe cleanup packet is kept with proof.
- [x] Focused package proof is run after code changes.
- [x] `pnpm brl` is marked N/A: no exported file path or generated barrel source changed; type export is from existing source entry.
- [x] Old compatibility names are source-audited.
- [x] Changed list, needs-attention rows, and next owner are filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused history tests | `pnpm --filter @platejs/plite-history test` passed 18 tests; focused history contract rows passed 4 tests; focused integrity rows passed 3 tests |
| Broad Core drift ledger coverage | N/A: focused API packet | Not a broad Core sweep | Review matrix covers the four old history APIs |
| Score gate | N/A: focused API packet | Not a broad Core sweep | No Core drift score required |
| Package/API proof | yes | Run package/Core proof | `pnpm turbo typecheck --filter=./packages/plite-history --filter=./packages/plite-react --filter=./packages/core --filter=./packages/plite` passed 12 tasks; generic type contracts passed for plite-history and plite-react |
| Non-Core package error triage | yes | Triage proof failures if any | `pnpm --filter @platejs/plite-react lint` remains package-wide unusable with 126 pre-existing diagnostics; touched React contract file passes Biome and tsc |
| Source audit | yes | Audit old names | `rg -n "withMerging|withNewBatch|withoutMerging|withoutSaving" packages/plite-history packages/plite-react packages/core packages/plite content/docs/plite --glob '!**/dist/**' --glob '!**/CHANGELOG.md'` returned no matches |
| Autoreview / review | N/A: narrow API cut | Not requested for this focused packet | Self-review via old-name audit, type contracts, docs check, Browser smoke, and `check:core` |
| Final lint/check | yes | Run `pnpm check:core` | Passed: Core + Plite typecheck/lint/tests, Plite 1008 pass / 85 skip / 0 fail |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Changed list and needs-attention rows filled below |
| Goal plan complete | yes | Run `check-complete.mjs` | To be run after this plan update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `editor.api.history.withMerging` | 4 | hard-cut | plite-history | old `with*` scoped helper naming | Replaced with `history.run({ merge: true }, fn)` |
| `editor.api.history.withNewBatch` | 4 | hard-cut | plite-history | old `with*` scoped helper naming | Replaced with `history.run({ newBatch: true }, fn)` |
| `editor.api.history.withoutMerging` | 4 | hard-cut | plite-history | same compatibility family even if broad `with[A-Z]` does not catch it | Replaced with `history.run({ merge: false }, fn)` |
| `editor.api.history.withoutSaving` | 4 | hard-cut | plite-history | same compatibility family | Replaced with `history.run({ save: false }, fn)` |

Core drift ledger:
- Applies: N/A.
- Manifest command: N/A.
- Manifest owner: focused history API packet.
- Optional type-test owner: focused tests only.
- Ledger location: N/A.
- Expected row count: N/A.
- Actual row count: N/A.
- Missing row count: N/A.
- Extra row count: N/A.
- Score gate: N/A.
- Top drift rows: listed in Review matrix.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Focused API packet | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| history control API | plite-history | four scoped helpers are API noise | packages/plite-history, plite-react mirror, Core mirror, docs/tests | keep | no further history `with*` API work remains in this packet |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `@platejs/plite-react` package lint | 126 package-wide diagnostics including existing component/test cleanup rows | This packet touched only `test/generic-react-editor-contract.tsx`; that file passes Biome and tsc | plite-react cleanup lane |
| full plite-history contract batch | One older selection-only command observer row can fail when run outside the focused API rows | Focused `history.run` rows, package tests, type contracts, and `check:core` passed; not caused by this API cut | history behavior proof lane if reopened |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/plite-history/src/history-state.ts`; `packages/plite-history/src/history-extension.ts`; `packages/plite-react/src/plugin/with-react.ts`; `packages/core/src/lib/plugins/getCorePlugins.ts` |
| tests/proof | `packages/plite-history/test/generic-history-contract.ts`; `packages/plite-history/test/history-contract.ts`; `packages/plite-history/test/integrity-contract.ts`; `packages/plite-react/test/generic-react-editor-contract.tsx`; Plite history undo fixtures changed from `jsx;` to `void jsx;` so package lint is meaningful |
| docs/templates/skills | `packages/plite-history/README.md`; `content/docs/plite/libraries/plite-history/history-extension-setup.mdx`; `content/docs/plite/libraries/plite-history/history.mdx`; `content/docs/plite/libraries/plite-history/history-editor.mdx`; `content/docs/plite/api/nodes/editor.mdx`; this plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None for this API shape | `history.run(options, fn)` is the cleanest cut and proof is green | `editor.api.history` | Keep |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| focused history API hard cut | complete | API, docs, tests, type contracts, Browser smoke, source audit, and `check:core` passed | Close goal |

Findings:
- Current API exposed four scoped helpers under `editor.api.history`: `withMerging`, `withNewBatch`, `withoutMerging`, and `withoutSaving`.
- The clean replacement is one explicit scoped runner, not four renamed methods.
- `plite-react` package-wide lint has older unrelated debt, but the touched type-contract file passes Biome and tsc.

Decisions and tradeoffs:
- Decision: use `history.run(options, fn)`.
- Reason: one public concept covers all scoped history control without `with*` names or alias clutter.
- Risk: overload-by-options can be too generic if it grows beyond history control. Kept options limited to `merge`, `newBatch`, and `save`.
- Decision: keep `isMerging` and `isSaving`.
- Reason: these are state queries, not scoped wrapper APIs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter @platejs/plite-history lint` initially failed | 1 | Fix touched lint issues and old JSX pragma fixture expressions | Passed after `void` cleanup and top-level regex constants |
| `pnpm --filter @platejs/plite-react lint` failed package-wide | 1 | Do not chase unrelated package-wide cleanup; prove touched file directly | Touched file passes Biome and tsc; package lint recorded out of scope |
| `pnpm --filter www dev -- --port 3002` failed | 1 | Start docs with `PORT=3002 pnpm --filter www dev` | Server started and Browser smoke passed |

Verification evidence:
- `rg -n "withMerging|withNewBatch|withoutMerging|withoutSaving" packages/plite-history packages/plite-react packages/core packages/plite content/docs/plite --glob '!**/dist/**' --glob '!**/CHANGELOG.md'` -> no matches.
- `pnpm --filter @platejs/plite-history lint` -> passed.
- `pnpm --filter @platejs/plite-history exec tsc --project test/tsconfig.generic-types.json --noEmit` -> passed.
- `pnpm --filter @platejs/plite-react exec tsc --project test/tsconfig.generic-types.json --noEmit` -> passed.
- `pnpm --filter @platejs/plite-history test` -> 18 pass / 0 fail.
- `pnpm --filter @platejs/plite-history exec bun test --preload ../../config/plite-source-test-setup.ts ./test/history-contract.ts --test-name-pattern "history.run|documents React-owned"` -> 4 pass / 0 fail.
- `pnpm --filter @platejs/plite-history exec bun test --preload ../../config/plite-source-test-setup.ts ./test/integrity-contract.ts --test-name-pattern "history.run"` -> 3 pass / 0 fail.
- `pnpm exec biome check packages/plite-react/test/generic-react-editor-contract.tsx packages/plite-history/test/generic-history-contract.ts packages/plite-history/test/history-contract.ts` -> passed.
- `pnpm turbo typecheck --filter=./packages/plite-history --filter=./packages/plite-react --filter=./packages/core --filter=./packages/plite` -> 12 successful / 12 total.
- `pnpm --filter www check:docs` -> passed docs source parity.
- Browser smoke at `http://localhost:3002/docs/plite/libraries/plite-history/history-extension-setup` -> rendered `history.run`, rendered `usePliteEditor`, old-name matches `[]`.
- Browser smoke at `/docs/plite/libraries/plite-history/history`, `/docs/plite/libraries/plite-history/history-editor`, and `/docs/plite/api/nodes/editor` -> rendered `history.run`, old-name matches `[]`.
- `pnpm check:core` -> passed Core + Plite typecheck/lint/tests; Plite 1008 pass / 85 skip / 0 fail.

Final handoff contract:
- target surface and mode: focused history API hard cut.
- files/APIs reviewed: `editor.api.history.withMerging`, `withNewBatch`, `withoutMerging`, `withoutSaving`; replacement `history.run`.
- broad Core drift score coverage: N/A focused packet.
- verdict matrix summary: four hard cuts, no aliases.
- changes made: current-run changed list above.
- tests/proof commands: verification evidence above.
- old compatibility names audited: exact old-name audit returned no matches outside changelog/dist exclusions.
- needs attention: none.
- next best Plate Next packet: continue Core/package sweep for remaining package-wide lint debt or broader Plate API cleanup, but no further action is needed for this history packet.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Focused history API hard cut |
| Where am I going? | Final plan check and goal close |
| What is the goal? | Old history `with*`/`without*` API gone with behavior preserved |
| What have I learned? | The API owner is Plite history; Core and Plite React only mirror it |
| What have I done? | Replaced old scoped helpers with `history.run`, updated docs/tests, ran source/docs/browser/type/Core proof |

Open risks:
- No risk requiring user review for this packet.
