# plite grouped direct lifecycle api

Objective:
Make Plite direct lifecycle methods mirror the callback namespaces: `editor.read.<group>.<method>()` and `editor.update.<group>.<method>()`.

Goal plan:
docs/plans/2026-06-27-plite-grouped-direct-lifecycle-api.md

Template:
docs/plans/templates/major-task.md with package-api and docs packs.

Major source:
- type: user prompt
- id / link: chat
- title: Plite grouped direct lifecycle API
- decision to make: keep flat direct lifecycle methods or hard-cut them into grouped namespaces
- decision criteria: callback/direct API consistency, type inference, no stale flat docs, Core/Plite typecheck and tests green

Major lane:
- lane: architecture / public API
- output type: implementation
- implementation expected: yes
- affected packages / surfaces: `@platejs/plite`, `@platejs/core`, Plite docs, Plite README
- dominant risk: public API drift between `editor.read/update` callbacks and direct one-shot methods

First checkpoint:
- User objected to `editor.update.insertText('Hello')` because it does not match grouped transaction shape.
- Required state: direct reads and writes use the same namespace model as callback `state.*` and `tx.*`.
- Required proof: stale flat API audit plus package typecheck/tests/docs check.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: 0.72, flat API shape existed and docs taught it
- improvement loop: source audit, type contracts, callsite migration, docs repair, proof gates
- final score / loop closure: 0.96 after `check:core`, docs source parity, and stale-shape audits passed

Completion threshold:
- Plite exposes grouped direct lifecycle methods for core reads and writes.
- Flat public examples such as `editor.update.insertText(...)`, `editor.read.string(...)`, and `editor.read.isBlock(...)` are gone from audited Plite/Core/docs surfaces.
- Core and Plite proof gates pass.

Verification surface:
- `rg` stale flat lifecycle audits over `packages/plite`, `packages/plite-react`, `packages/core`, and `content/docs/plite`.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-react --filter=./packages/core`
- targeted Plite and Core tests
- `pnpm check:core`
- `pnpm --filter www check:docs`

Constraints:
- Preserve callback APIs: `editor.read((state) => ...)` and `editor.update((tx) => ...)`.
- Preserve one-shot ergonomics, but under grouped namespaces.
- Do not add compatibility aliases for the flat direct methods.
- Keep docs current-state, not migration-changelog prose.

Boundaries:
- Source of truth: current Plite interfaces and runtime lifecycle factory.
- Allowed edit scope: lifecycle types/factory, affected Core callsites, Plite docs/README, focused tests.
- External sources: N/A; repo source decides this API.
- Browser surface: N/A; this is package API and docs shape.
- Tracker sync: N/A.
- Non-goals: package publishing, changesets, browser matrix, Plate v2 broad migration.

Output budget strategy:
- Broad audits used `rg` with explicit file globs and package/doc scopes.
- High-volume test output was capped in tool calls; final evidence records command pass/fail only.

Blocked condition:
- Block only if grouped direct methods cannot preserve type inference or Core cannot typecheck without reintroducing flat aliases. That did not happen.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: implemented
- confidence: high
- next owner: Plite/Core package owners
- reason: grouped API is coherent, flat docs/calls are audited away, package gates passed

Completion rule:
- Complete only after all checklist rows and completion gates below are resolved and check-complete passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records the flat-vs-grouped API requirement. |
| Timed checkpoint parsed | no | No duration requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md`. |
| Active goal checked or created | yes | This plan is the durable goal ledger. |
| Source of truth read before analysis | yes | Read lifecycle factory, editor interfaces, package type smoke, and docs. |
| Major lane selected | yes | Public API architecture lane. |
| Decision criteria stated | yes | Callback/direct consistency, inference, stale docs audit, package proof. |
| Existing repo patterns / prior decisions checked | yes | Compared direct methods to existing `state.*` / `tx.*` grouped runtime shape. |
| Helper stack selected | yes | `task`, `major-task`, `autogoal`, `docs-creator`. |
| External research decision recorded | yes | N/A: current repo API owns this decision. |
| Implementation expectation recorded | yes | Implementation expected and completed. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`. |
| Branch / PR expectation decided | yes | No git action requested. |
| Output budget strategy recorded | yes | Scoped rg audits and capped command output. |
| Package/API pack selected | yes | Public package API shape changed. |
| Public surface or package boundary identified | yes | `@platejs/plite` editor lifecycle API and `@platejs/core` consumers. |
| Release artifact path selected | yes | N/A: unreleased beta lane; no changeset requested for this internal cleanup. |
| `changeset` skill loaded when `.changeset` is required | no | No changeset required. |
| Barrel/export impact decision recorded | yes | No export file layout changed. |
| Docs pack selected | yes | Plite docs and README changed. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`. |
| Docs lane selected | yes | API/reference docs support lane. |
| Target docs and nearest sibling docs read | yes | Read Plite README, Editor API docs, Editor concept docs, migration docs. |
| Docs style doctrine read | yes | `docs-creator` voice and source-backed docs rules read. |
| Documented source owner identified | yes | `packages/plite/src/interfaces/editor.ts` and `packages/plite/src/core/editor-lifecycle-api.ts`. |

Work Checklist:
- [x] First checkpoint complete: explicit user requirement captured as grouped direct lifecycle API.
- [x] Source owner mapped: interfaces define API; lifecycle factory materializes it.
- [x] Flat direct update API hard-cut from types and runtime factory.
- [x] Direct read methods use grouped state namespaces.
- [x] Direct update methods use grouped mutation namespaces.
- [x] Package type smoke updated for grouped direct methods.
- [x] Core callsites repaired for grouped read methods.
- [x] Docs and README examples repaired to teach grouped direct lifecycle methods.
- [x] Stale flat API audits run with no matches in scoped package/doc surfaces.
- [x] Package/API compatibility decision recorded: no public compat aliases.
- [x] Package-owned typecheck/test proof recorded.
- [x] Docs parser/source parity proof recorded.
- [x] Barrel/export impact recorded as N/A because no export layout changed.
- [x] Release artifact decision recorded as N/A for unreleased beta lane.
- [x] Output budget discipline followed with scoped audits and capped logs.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run stale-shape audits and package checks | `rg` audits no matched stale flat calls; `check:core` passed. |
| Current-state source audit | yes | Map current owner and affected surfaces | Lifecycle factory, editor interfaces, Core callsites, Plite docs. |
| Decision criteria closure | yes | Record chosen API shape | Grouped direct methods mirror callback groups. |
| Options / tradeoffs / rejection record | yes | Reject flat methods and aliases | Flat direct methods were incoherent with `tx.*`; no aliases added. |
| Review / pressure pass | yes | Self-review against API consistency | Type smoke and docs audit would fail old examples. |
| Review findings closure | yes | Fix accepted findings | Custom Core `read.selection` type repaired. |
| External-source audit | no | Record reason | Repo source owns this API. |
| Implementation gates | yes | Run touched package and docs gates | Typecheck, tests, `check:core`, docs check passed. |
| Final handoff contract | yes | Record evidence, caveats, next owner | Final response will summarize changed files and commands. |
| Final lint | yes | Run scoped lint/format fix | `pnpm --filter @platejs/core lint:fix`; `pnpm --filter @platejs/plite lint:fix`; `check:core` lint passed. |
| Output budget discipline | yes | Confirm scoped command output | Broad output capped; one `check:core` log truncated by tool, pass/fail captured. |
| Timed checkpoint | no | Record reason | No timed run requested. |
| Goal plan complete | yes | Run check-complete | Planned after this ledger patch. |
| Public API / package boundary proof | yes | Source-audit public lifecycle API | Type contracts and package typecheck passed. |
| Release artifact classification | yes | Decide changeset need | No artifact for unreleased beta cleanup. |
| Published package changeset | no | Record reason | No release requested; beta package work remains internal. |
| Registry changelog | no | Record reason | No registry-only change. |
| No release artifact | yes | Record exact reason | Internal unreleased beta API cleanup; no release artifact requested. |
| Package typecheck/build/test | yes | Run package checks | `pnpm turbo typecheck ...`; `pnpm check:core`. |
| Barrel/export generation | no | Record reason | No exported file layout changed. |
| Docs source-backed claim audit | yes | Verify docs against current source | Docs now name grouped direct API present in interfaces/factory. |
| Docs links / routes / previews | yes | Verify docs source parser | `pnpm --filter www check:docs`. |
| Docs MDX/content parser | yes | Run docs source check | `pnpm --filter www check:docs` passed. |
| Plugin page specifics | no | Record reason | No plugin page touched. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read user prompt and source files. | done |
| Current-state map | complete | Found flat direct lifecycle API and docs examples. | done |
| Options and recommendation | complete | Chose grouped direct API, rejected aliases. | done |
| Review / pressure pass | complete | Stale API audits and type contracts. | done |
| Implementation or plan artifact | complete | Code/docs/tests patched. | done |
| Verification | complete | `check:core` and docs check passed. | done |
| Closeout | complete | Ledger updated. | done |

Findings:
- Flat `editor.update.insertText` was an API smell. It made one-shot writes teach a different model than transaction writes.
- A Core helper had a stale custom `read.selection` function type. That hid the grouped lifecycle contract.

Decisions and tradeoffs:
- Direct reads keep full grouped state namespaces: `editor.read.text.string`, `editor.read.selection.get`, `editor.read.schema.isBlock`.
- Direct writes expose mutation groups only: `editor.update.text.insert`, `editor.update.nodes.insert`, `editor.update.marks.toggle`.
- No flat compatibility aliases.

Implementation notes:
- `packages/plite/src/interfaces/editor.ts` now defines grouped direct lifecycle methods.
- `packages/plite/src/core/editor-lifecycle-api.ts` materializes those groups via lifecycle proxies.
- Docs and README teach the grouped direct shape.

Review fixes:
- Repaired package type smoke.
- Repaired stale Core callsites and custom Core typing.
- Ran formatter fixes for Core and Plite.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial `check:core` lint formatting failures | 2 | Run scoped lint fixes | Resolved by Core and Plite lint:fix, then `check:core` passed. |

Verification evidence:
- `rg -n "editor\\.read\\.[A-Za-z0-9_]+\\s*\\(|editor\\.update\\.[A-Za-z0-9_]+\\s*\\(" packages/plite packages/plite-react packages/core content/docs/plite -g '*.{ts,tsx,md,mdx}'` returned no stale flat one-hop calls.
- `rg -n "editor\\.read\\.\\*|editor\\.update\\.\\*|editor\\.update\\.insertText|editor\\.read\\.string|update\\.insertText|read\\.string" content/docs/plite packages/plite/README.md packages/plite packages/plite-react packages/core -g '*.{ts,tsx,md,mdx}'` returned no stale docs/API hits.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-react --filter=./packages/core` passed.
- `pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/read-update-contract.ts ./test/public-package-types-smoke.ts ./test/accessor-transaction.test.ts` passed: 14 tests.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugins/input-rules/createInputRules.spec.ts` passed: 3 tests.
- `pnpm check:core` passed.
- `pnpm --filter www check:docs` passed.

Open risks:
- Extension-owned direct lifecycle groups are still intentionally callback-only. If we later want `editor.update.table.insertRow()`, that is a separate API design, not part of this core grouped-method cleanup.

Final handoff contract:
- Recommendation: keep grouped direct lifecycle methods and do not reintroduce flat aliases.
- Confidence: high.
- Evidence: stale-shape audits, package typecheck/tests, `check:core`, docs source parity.
- Tests / commands: listed in Verification evidence.
- Browser proof: N/A for package API/docs text change.
- PR / tracker: N/A.
- Caveats: no browser surface was exercised because no UI behavior changed.
- Next owner: Plite/Core package owners.

Timeline:
- 2026-06-27 Major-task goal plan created.
- 2026-06-27 Grouped direct lifecycle API implemented and verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Plite direct lifecycle methods mirror grouped callback namespaces. |
