# audit www registry plite drift

Objective:
Audit every source file under `apps/www/src/registry` against the Plate Next
rules, repair every accepted drift row at the correct Plate or Plite owner, and
close with a score-100 file ledger plus source, package, test, lint, and Browser
proof.

Completion threshold:
- Every tracked and untracked registry file appears exactly once in the linked
  ledger with path, score, verdict, owner, evidence, and next action.
- Every row scores 100; missing, extra, duplicate, and deferred counts are zero.
- Legacy aliases, root option helpers, plugin editor escapes, required public
  reads, explicit normalization, fake plugin typing, added `any`, and one-shot
  read/update callbacks have no accepted matches.
- Corrected package owners and `apps/www` pass source-first typecheck and tests.
- Changed registry UI renders through Browser with no error or warning logs.
- The autogoal completion checker passes after final evidence is recorded.

Verification surface:
- Registry manifest: `rg --files apps/www/src/registry | sort`.
- Ledger: `docs/plans/artifacts/audit-www-registry-plite-drift/registry-drift-ledger.tsv`.
- Source audits: exact `rg` searches for every Plate Next smell class plus a
  manual review of all remaining read/update callbacks.
- Package proof: Plite React, AI, Excalidraw, and Suggestion typechecks/tests.
- App proof: isolated registry Bun tests, `pnpm --filter www typecheck`,
  `pnpm lint:fix`, changelog generator check, and `git diff --check`.
- Browser proof: `/blocks/date-demo`, `/blocks/playground`, and
  `/blocks/footnote-demo`, including date/equation interactions and runtime logs.

Constraints:
- Target the best current Plate v2 composition on Plite; `origin/main` is
  behavior evidence, not a compatibility target.
- Plate owns product/plugin composition. Plite owns raw editor and render
  substrate behavior.
- Prefer direct `editor.read.*` and `editor.update.*`; callbacks remain only for
  grouped operations, branching, loops, shared intermediate state, or a true
  snapshot read.
- Do not add aliases, bridges, local helper dumps, fake casts, explicit callback
  annotations, `required: true`, or manual normalization to hide an owner gap.
- Do not run `build:registry`, edit templates, rename broad surfaces, or change
  unrelated packages.
- Package export changes require barrels; this packet changes no package exports.

Boundaries:
- Primary scope: all files under `apps/www/src/registry`.
- Smallest permitted owner scope: Plite React void rendering, AI adapter,
  Suggestion API policy/types, and Excalidraw data types proven necessary by
  registry call sites.
- Release metadata scope: package changesets and the canonical/generated
  registry changelog entry required by the changelog rule.
- Excluded: broad Core sweep, repo-wide migration, template generation,
  unrelated app cleanup, and public API redesign without a real owner gap.

Blocked condition:
Stop only if a clean fix needs an unresolved public Plate/Plite API decision, a
required route fails after three distinct in-scope attempts, or current source
cannot distinguish intended product composition from migration drift. No such
blocker remains.

Current verdict:
- Verdict: closed; no accepted drift remains in the registry scope.
- Confidence: 100/100 from a 435-row score-100 ledger and fresh proof.
- Next owner: none for this audit.
- Keep/revert call: keep the audited migration and owner fixes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Full registry audit, Plate Next rules, no-drift threshold, owner repair, and final proof are recorded above |
| Plate Next skill read | yes | Local `plate-next` instructions governed manifest, drift scoring, owner boundaries, and related sweeps |
| Active goal created | yes | Goal points to this plan and the quantitative 435-file threshold |
| Mode classified | yes | Full app-registry directory audit; not a broad Core or multi-package sweep |
| Best Plate v2 target fixed | yes | Plate product composition on Plite with no old Slate compatibility goal |
| Output strategy fixed | yes | Count-first searches plus one-row-per-file TSV artifact |
| Browser route selected | yes | Date demo, playground, and footnote demo cover the changed registry runtime |
| Gap policy fixed | yes | Repair the smallest real owner; never invent a local compatibility workaround |

Work Checklist:
- [x] Copied the target, constraints, proof surface, stop condition, and handoff requirements into this plan.
- [x] Generated and reconciled the complete registry manifest before closure.
- [x] Scored every registry file at 100 with owner, evidence, and next action.
- [x] Reviewed every changed and unchanged file through the manifest ledger rather than a diff-only sample.
- [x] Removed all accepted legacy alias, option portal, required-read, normalization, plugin typing, cast, and added-`any` drift.
- [x] Audited every read/update callback and converted all one-shot leftovers to direct methods.
- [x] Recorded the best Plate v2 shape and rejected compatibility workarounds.
- [x] Fixed the real Plite React void-rendering owner gap with regression proof.
- [x] Fixed registry date and equation trigger semantics with accessible native buttons.
- [x] Classified both new registry changelog files against `origin/main` and generator ownership.
- [x] Ran related scoped sweeps after each correction and recorded counts below.
- [x] Ran package owner typechecks/tests and the complete isolated registry test set.
- [x] Ran app typecheck, lint, source parity, registry source, changelog, and diff checks.
- [x] Verified the affected runtime and interactions with Browser and checked logs.
- [x] Recorded changed groups, errors, risks, reboot status, and final handoff evidence.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| File-complete threshold | yes | Manifest 435; ledger 435; score-100 435; missing 0; extra 0; duplicates 0; deferred 0 |
| Best Plate v2 recommendation | yes | Keep content-only `renderVoid`; fall back to `renderElement` when no void renderer exists; keep controls native and named |
| Plite/Plate gap ledger | yes | One Plite React owner gap was repaired; no unresolved gap remains |
| Related scoped sweep | yes | Legacy/policy/plugin/type smells 0; callbacks 20 update and 7 read, all remaining justified; Popover triggers 6, corrected 3 |
| Package owner proof | yes | Plite React 844 tests; AI 71; Excalidraw 5; Suggestion 103; source graph 61/61 tasks |
| Shared Core gate | no | No Core package or Core-adjacent product package was reviewed; `check:core` is outside this app packet |
| Source audit | yes | Exact searches report zero forbidden legacy, normalization, required-read, plugin typing, and added-`any` matches |
| Rename/barrel gate | no | No renames or package export changes |
| Extracted-file inventory | yes | Two new registry changelog files are canonical source/generated release artifacts and generator check passes |
| Plate Next review | yes | Full 435-row ledger plus correction-triggered sweeps is the owning review gate |
| Final lint/check | yes | `pnpm lint:fix`, final www typecheck, changelog check, and `git diff --check` pass |
| Browser interaction proof | yes | Date picker and both equation popovers open; playground and footnote content render |
| Browser console/network check | yes | Final logs contain info/log only; affected routes returned HTTP 200 |
| Goal plan complete | yes | Autogoal checker is the final command after this evidence is saved |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Manifest and ledger | complete | 435 exact rows, all score 100 |
| Static Plate Next audit | complete | Forbidden smell searches clean; remaining callbacks justified |
| Owner repair | complete | Plite React, AI, Suggestion, Excalidraw, and registry corrections landed |
| Package and app proof | complete | Typechecks, package tests, isolated registry tests, lint, and generators pass |
| Browser proof | complete | Final playground HTTP 200, named equation buttons, working popovers, clean logs |
| Closure | complete | No unresolved drift, gap, deferral, or user decision |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Full registry manifest | 0 | keep audited rows | registry | Linked ledger has 435 score-100 rows | none |
| Plite React void rendering | 0 | fix owner gap | `@platejs/plite-react` | Void nodes use content-only `renderVoid` when supplied and `renderElement` otherwise; 844 tests pass | none |
| Date trigger | 0 | fix registry drift | registry UI | Native button opens calendar in Browser; focused tests pass | none |
| Equation triggers | 0 | fix registry drift | registry UI | Two named native buttons open inline/block dialogs in Browser | none |
| One-shot policy updates | 0 | fix registry drift | registry transforms/chat | Three callback wrappers converted to direct policy-aware updates | none |
| AI chat adapter | 0 | fix package owner | `@platejs/ai` | Typed adapter factory; typecheck and 71 tests pass | none |
| Suggestion API | 0 | fix package owner | `@platejs/suggestion` | Raw node/text contracts, type guard, and update policy; 103 tests pass | none |
| Excalidraw data | 0 | fix package owner | `@platejs/excalidraw` | Concrete data/elements types; 5 tests pass | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User review |
|--------|-------------------|-----------------------|--------|-------------|
| Void rendering | `renderVoid` owns content-only customization; `renderElement` remains the fallback when it is omitted | Always forcing the default void shell or teaching registry components a Plite exception | Preserves Plite substrate ownership and lets Plate components compose normally | not needed |
| Registry controls | Real `button` elements with stable accessible names inside void nodes | Clickable `span`, `div`, role imitation, or Plite selector exceptions | Correct browser semantics, Radix trigger behavior, keyboard handling, and accessibility | not needed |
| Transactions | Direct policy-aware methods for one operation; callbacks only for true grouped/snapshot work | Single-operation `editor.update((tx) => ...)` wrappers | Best API inference and least ceremony | not needed |

Plite / Plate gap ledger:
| Gap type | Missing capability | Smallest owner | Decision | Proof |
|----------|--------------------|----------------|----------|-------|
| Resolved Plite gap | Void nodes skipped `renderElement` when `renderVoid` was omitted | `packages/plite-react` | Add the correct fallback without changing content-only `renderVoid` | Existing surface-contract test extended; full Plite React suite and Browser pass |
| Unresolved gaps | No capability is missing after the owner repair | none | no workaround or deferral | Full ledger and final proof |

Related scoped sweep ledger:
| Trigger | Scope | Query / method | Matches | Patched | Deferred | Remaining risk |
|---------|-------|----------------|---------|---------|----------|----------------|
| API migration cleanup | Full registry | Legacy editor aliases, plugin editor escapes, root options, flat node aliases, required reads, and normalization | 0 accepted | all historical matches closed | 0 | none |
| Plugin/type cleanup | Full registry | Plugin export casts/annotations, empty configs, extension wrappers, inferred local types, and added `any` | 0 accepted | all historical matches closed | 0 | none |
| One-shot wrappers | Full registry | Manual review of `editor.update` and `editor.read` callbacks | 20 update; 7 read remain | 3 final one-shot callbacks | 0 | Remaining callbacks group operations, branch/loop, reuse intermediate state, or require one snapshot |
| Popover trigger semantics | Full registry | All `PopoverTrigger asChild` call sites | 6 | 3 triggers: date plus inline/block equation | 0 | Other 3 already use Button/input controls |
| Registry tests | Full registry | Enumerate every `.test`, `.spec`, and `.slow` file and run each in isolation | 23 files; 22 executable suites | 2 regression files updated | 0 | One type-only spec intentionally reports zero runtime tests |

Core drift ledger:
- Applies: no; this was an app registry audit, not a broad Core sweep.
- Core manifest, rows, scores, and `check:core`: not applicable.
- The smallest substrate owner was Plite React and received focused/full proof.

Package file checklist:
- Applies as the equivalent full-directory registry ledger.
- Manifest command: `rg --files apps/www/src/registry | sort`.
- Expected rows: 435.
- Actual rows: 435.
- Checked score-100 rows: 435.
- Missing, extra, duplicate, unchecked, and deferred rows: 0.
- [x] Linked ledger: `docs/plans/artifacts/audit-www-registry-plite-drift/registry-drift-ledger.tsv`.

Packet ledger:
| Packet | Owner | Decision | Proof | Next |
|--------|-------|----------|-------|------|
| Registry API migration | registry | keep after direct API and typing cleanup | Full ledger, static audits, isolated tests, www typecheck | none |
| Void renderer behavior | Plite React | repair owner | Regression test, 844 tests, Browser | none |
| AI/Suggestion/Excalidraw owner types | package owners | repair owner instead of registry casts | Source graph and package tests | none |
| Date/equation interaction semantics | registry UI | use named native controls | Focused tests and Browser interactions | none |
| Registry changelog | registry changelog | keep canonical source plus generated event/index updates | Generator check | none |

Extracted file ledger:
| Path | Bucket | Origin/main check | Decision | Proof |
|------|--------|-------------------|----------|-------|
| `apps/www/src/registry/changelog/entries/2026-07-15-fix-date-picker-trigger.mdx` | canonical registry release source | absent as expected for this fix | keep | Registry changelog skill format and generator check pass |
| `apps/www/src/registry/changelog/2026-07-15-fix-date-picker-trigger.json` | generated registry release artifact | absent as expected for this fix | keep | Generated from canonical MDX; generator check passes |

Out-of-scope package drift:
- None. The only transient package failures were local dist races caused by a
  parallel proof attempt; reinstall plus sequential proof closed them.

Out-of-scope matches discovered:
- None requiring another owner packet. Intentional `any` remains only in mock
  boundaries or the external Slate comparison and no new `any` was added.

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| Registry runtime/API | Plate Next API cleanup; direct one-shot updates; native named date/equation triggers |
| Package owners | Plite React void fallback; AI adapter typing; Suggestion API/policy; Excalidraw data typing |
| Tests/proof | Plite React regression; registry date/equation assertions; package changesets |
| Release metadata | Canonical and generated registry changelog event; package changesets |
| Docs/templates/skills | This goal plan and ledger only; no template or skill edits |
| Reverted/quarantined work | none |

Needs your attention:
- No user decision is required. No unresolved public API fork, behavior tradeoff,
  deferred drift row, or browser caveat remains.

Findings:
- Current manifest: 435 files — 344 TSX, 41 TS, 25 JSON, 24 MDX, 1 Markdown.
- Ledger reconciliation: expected 435, actual 435, score-100 435, missing 0,
  extra 0, duplicates 0, deferred 0.
- The manifest grew from 433 to 435 only because the date-trigger fix requires
  one canonical changelog source and one generated changelog event.
- Current checkout differs from `origin/main` in 265 registry paths and has 211
  tracked uncommitted registry paths plus 2 new changelog files; diff-only
  review would have been materially incomplete.
- The substantive owner defect was in Plite React void rendering. The registry
  trigger bugs then exposed invalid clickable spans/divs that native buttons fix.

Decisions and tradeoffs:
- Preserve content-only `renderVoid`; add `renderElement` fallback rather than
  moving Plate component behavior into Plite.
- Keep callbacks that prove transaction/snapshot semantics; cut every one-shot
  callback with a direct API.
- Keep the two changelog files because they are required source/generated
  release metadata, not accidental source extraction.
- Do not add `check:core` coverage for an app directory or product-only package.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|------------------------|-------|----------------|------------|
| First Browser navigation exceeded its first-compile timeout | 1 | Poll the running server and inspect the loaded tab | Route compiled and Browser proof continued |
| Package tests raced Turbo dist rebuilding and reported missing exports/modules | 1 | Run the mandated reinstall, then prove sequentially | Clean source graph and all package tests passed |
| Date regression test still expected a span | 1 | Update the test to the correct button contract | Focused and isolated registry suites passed |
| Aggregate Bun registry run leaked file-level module mocks | 1 | Run each test file in its own Bun process | All 22 executable suites passed |
| Initial isolated loop omitted `./` for `.slow.tsx` paths | 1 | Prefix every path with `./` | Complete 23-file enumeration finished cleanly |

Verification evidence:
- Manifest/ledger script: manifest 435, ledger 435, score-100 435, missing 0,
  extra 0, duplicates 0.
- Static sweeps: legacy/policy smells 0; plugin/type smells 0; added `any` 0;
  remaining callbacks 20 update and 7 read, each manually justified.
- `pnpm turbo typecheck --filter=./packages/plite-react --filter=./packages/ai --filter=./packages/excalidraw --filter=./packages/suggestion --filter=./apps/www`:
  61/61 tasks passed after clean reinstall.
- Sequential package tests: Plite React 61 files/844 tests, AI 71 tests,
  Excalidraw 5 tests, Suggestion 103 tests; all passed.
- Isolated registry tests: 23 files enumerated, 22 executable suites and 71
  tests passed; the type-only spec intentionally has no runtime tests.
- Final `pnpm --filter www typecheck`: docs source parity, registry source,
  TypeScript, and package integration passed.
- Final `pnpm lint:fix`: 4,836 files checked with no remaining fix.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: passed.
- Browser: date button opened the calendar; both named equation buttons opened
  their dialogs; playground and footnote rendered; final playground returned
  HTTP 200; runtime logs contained no warnings or errors.
- Final `git diff --check`: passed.

Final handoff contract:
- Target/mode: full `apps/www/src/registry` Plate Next audit.
- Files reviewed: all 435 current manifest files, including two new changelog files.
- Broad Core coverage: not applicable; no broad Core sweep.
- Checklist coverage: 435/435 score 100; zero deferrals.
- Best Plate v2 shape: Plate product composition on Plite, content-only
  `renderVoid`, `renderElement` fallback, native named controls, direct one-shot APIs.
- Gaps: one Plite React owner gap fixed; zero unresolved gaps.
- Related sweeps: policy/type smells zero; 27 justified callbacks remain; six
  popover trigger sites reviewed and three corrected.
- Changes: registry migration cleanup, owner type/API repairs, void rendering
  fix, interaction semantics, tests, changesets, and registry changelog.
- Proof: package tests/typechecks, 71 isolated registry tests, app typecheck,
  lint, generator check, diff check, and Browser runtime/interactions.
- Needs attention: none.
- Next Plate Next packet: none from this registry audit; choose the next
  uncovered package or app surface from the global migration ledger.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure of the full registry Plate Next audit |
| Where am I going? | Final mechanical plan check, then goal completion |
| What is the goal? | Every current registry file score 100 with no accepted drift and green proof |
| What have I learned? | Plite React needed a void renderer fallback; registry controls needed native named triggers; three one-shot callbacks remained |
| What have I done? | Reconciled 435 files, fixed owner and registry drift, ran all proof, and recorded the final ledger |

Timeline:
- 2026-07-15T22:00:39.328Z: goal and complete registry ledger created.
- 2026-07-15T22:40:00+02:00: static review and owner repairs completed.
- 2026-07-15T23:30:00+02:00: date/equation Browser interactions and logs verified.
- 2026-07-15T23:35:00+02:00: final callback sweep, isolated tests, app typecheck,
  lint, and final Browser runtime proof completed.

Open risks:
- No accepted Plate Next drift remains. Intentional mock-boundary and external
  comparison types stay outside runtime API ownership, and the ledger records
  no deferred work.
