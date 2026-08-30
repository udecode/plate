# repair isAt migration drift

Objective:
Repair every semantic migration drift from the 29 production `main`
`.api.isAt(...)` calls. The packet closes when all calls are mapped, all 17
drifted uses are corrected, the 12 clean mappings remain clean, and owner,
Browser, source-audit, release-classification, and review gates pass.

Flow mode:
one-shot execution

Goal plan:
`docs/plans/2026-07-16-repair-isat-migration-drift.md`

Template:
`docs/plans/templates/plate-next.md`

Applied packs:
- browser
- package-api

Completion threshold:
- Map all 29 production `main` calls: 17 drifted calls in 13 owners and 12
  already-clean calls.
- Replace semantic drift with Plite-native selection queries; add no
  compatibility `isAt` wrapper and no new Plite API.
- Restore BlockSelection current-block then all-block select-all behavior and
  preserve `disableSelectAll`.
- Prove the affected owners with focused regressions, package tests,
  source-first typechecks, builds, `pnpm check:core`, registry typecheck,
  Browser interaction, lint, source audit, and `autoreview`.
- Record an explicit release-artifact decision relative to `main`.

Verification surface:
- Exact `main` inventory under production `apps/www/src/**` and
  `packages/*/src/**`, excluding tests, docs, changelogs, and Slate internals.
- Core, Selection, Table, Legacy list model, Suggestion, Toggle, and registry owner
  tests; affected package and `www` source-first typechecks.
- `pnpm check:core` across its 45 covered Core/reviewed packages.
- Browser routes `/blocks/block-selection-demo`, `/blocks/editor-ai`, and
  `/blocks/tabbable-demo`, including progressive select-all interaction.
- Final local Codex `autoreview` and mechanical goal-plan checker.

Constraints:
- Target the best Plate v2 shape on Plite, not legacy compatibility.
- Plate owns product composition; Plite owns selection and editor substrate.
- Use direct `editor.read.selection.*` and active `tx.selection.*` methods.
- Do not add wrappers, fake aliases, broad casts, local helper reimplementations,
  or generated registry edits.
- Do not rename files, change exports, edit templates, or perform git writes.

Boundaries:
- Runtime scope: the 13 drifted source owners plus the smallest Core shortcut
  registration owner needed to make BlockSelection fallback precedence real.
- Proof scope: nearest existing tests, one new registry unit test, package
  manifest repair required by the source-first test graph, and this ledger.
- Registry scope: source only; `apps/www/public/r/**` remains CI-generated.
- Release scope: no changeset and no registry changelog because every restored
  user-visible behavior already exists on `main`. An isolated PR should use the
  repository's `skip-changeset` label.

Blocked condition:
Stop only after the same external or tooling blocker recurs three times and no
smaller owner proof or source audit can progress.

Current verdict:
- verdict: complete main-parity cleanup
- confidence: high; exact inventory, owner proof, shared gate, Browser proof,
  and clean final review agree
- Plite gap: none
- Plate gap: none
- compatibility decision: keep the old overloaded `isAt` helper cut

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User accepted the complete scan and repair with “ok go all” |
| Plate Next target | yes | Best Plate v2 shape, no compatibility goal |
| Active goal | yes | Quantitative 29/17/13 objective created before implementation |
| Mode | yes | Broad named-API sweep, not a broad Core or package-file review |
| Browser pack | yes | Registry and BlockSelection behavior require app proof |
| Package/API pack | yes | Published package owners are touched without public signature changes |
| Public API fork | no | Existing Plite selection API fully covers the semantics |
| Barrel generation | no | No export or exported file-layout change |

Work Checklist:
- [x] Inventory all 29 production `main` `.api.isAt(...)` calls.
- [x] Classify 17 calls as drifted and 12 as already clean.
- [x] Repair every drifted source owner with Plite selection queries.
- [x] Restore BlockSelection progressive select-all and `disableSelectAll`.
- [x] Repair shortcut conflict ordering through the documented priority owner.
- [x] Add focused regressions for the high-risk semantic corrections.
- [x] Keep direct one-shot reads and active transaction reads idiomatic.
- [x] Confirm no required public API, wrapper, bridge, cast, or helper dump.
- [x] Confirm no `{ required: true }`, explicit normalization, export inference,
      matcher, or live-node-target issue was introduced in scope.
- [x] Classify the new registry spec as proof tooling.
- [x] Run focused tests, full affected-package tests, typechecks, builds, lint,
      `www` validation, and `pnpm check:core`.
- [x] Run exact old-name and suspicious replacement source audits.
- [x] Exercise the affected app behavior with the in-app Browser.
- [x] Record no-artifact release classification relative to `main`.
- [x] Run final `autoreview`; resolve or reject every finding with evidence.
- [x] Fill the review, sweep, changed-file, error, risk, and handoff ledgers.
- [x] Run the final mechanical goal-plan checker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named threshold | yes | Map 29 and repair 17 | 29 mapped; 17 repaired; 12 clean preserved |
| Best Plate v2 recommendation | yes | Record clean owner shape | Existing selection queries own every semantic class |
| Plite/Plate gap ledger | yes | Resolve blockers or N/A | No gap; no wrapper introduced |
| Related scoped sweep | yes | Rescan production caller graph | 29 main matches, 17 patched, 0 deferred |
| Package proof | yes | Test/type/build affected owners | All affected owner commands passed |
| Shared Core gate | yes | Run covered package gate | `pnpm check:core` passed for 45 packages |
| Source audit | yes | Prove stale API absent | Zero production `.api.isAt` calls remain in active current scope |
| Extracted-file inventory | yes | Classify new source/spec paths | One new spec, `justify-new-proof-tooling` |
| Browser proof | yes | Exercise runnable routes | Three routes returned 200; select-all selected six blocks |
| Browser console/network | yes | Inspect errors and route responses | No route-specific error; one unrelated existing script-tag warning; all target GETs 200 |
| Release artifact | yes | Classify main-relative delta | No changeset/changelog; behavior already exists on `main` |
| Autoreview | yes | End with no actionable findings | Final local Codex review clean at confidence 0.82 |
| Final lint/check | yes | Run formatting and whitespace checks | `pnpm lint:fix` and `git diff --check` passed |
| Goal plan complete | yes | Run mechanical checker | Checker passed after this ledger update |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| 1. Inventory | complete | Exact 29-call `main` inventory |
| 2. Classification | complete | 17 drifted, 12 clean |
| 3. Owner regressions | complete | Red tracers covered Override, Selection, Table, and registry |
| 4. Runtime repair | complete | All 13 drift owners corrected |
| 5. Shortcut ownership | complete | Priority registration enforced; fallback priority set |
| 6. Package proof | complete | Tests, types, and builds green |
| 7. Shared gate | complete | `check:core` green |
| 8. Browser proof | complete | Three routes and select-all interaction green |
| 9. Review | complete | Final `autoreview` clean |
| 10. Handoff | complete | Ledgers, release decision, and checker closed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `tabbable-kit.tsx` root point checks | 4 | keep-in-plate after repair | registry TabbableKit | start/end direct tests | none |
| `ai-menu.tsx` root end check | 4 | keep-in-plate after repair | registry AI menu | direct behavior tests | none |
| `OverridePlugin.ts` split reset | 5 | keep-in-plate after repair | Core override middleware | start split regression | none |
| `isAcrossListItems.ts` | 3 | keep-in-plate after repair | Legacy list model query | full package tests | none |
| `toggleList.ts` | 3 | keep-in-plate after repair | Legacy list model transform | full package tests | none |
| `BlockSelectionPlugin.tsx` | 5 | keep-in-plate after repair | Selection plugin | progressive/disabled tests and Browser | none |
| `deleteSuggestion.ts` | 4 | keep-in-plate after repair | Suggestion transaction | full package tests | none |
| `withSuggestion.ts` | 3 | keep-in-plate after repair | Suggestion middleware | full package tests | none |
| `shouldMoveSelectionFromCell.ts` | 5 | keep-in-plate after repair | Table movement query | cross-cell regression | none |
| `withApplyTable.ts` | 5 | keep-in-plate after repair | Table apply middleware | cross-cell preservation regression | none |
| `withDeleteTable.ts` | 3 | keep-in-plate after repair | Table delete middleware | full package tests | none |
| Toggle backward/forward movement | 3 | keep-in-plate after repair | Toggle transforms | full package tests | none |
| `EditorHotkeysEffect.tsx` priority | 4 | keep-in-plate after repair | Core shortcut renderer | priority-order regression | none |
| 12 already-clean production calls | 0 | keep | existing package owners | exact source review plus shared gate | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|-----------------------|--------|------------------|
| Edge checks | `selection.isAtBlockStart/End()` | root `points.isStart/isEnd`, compatibility `isAt` | Expresses the real block semantic directly | none |
| Cross-block checks | `selection.isAcrossBlocks({ at })` | local edge comparison helpers | One canonical Plite query handles direction and roots | none |
| Containment checks | `selection.isWithinBlock({ match })` | anchor-only ancestor lookup | Validates the whole selection, including cross-cell ranges | none |
| Progressive select-all | low-priority Plate shortcut over plugin API | restore removed Slate transform wrapper | Product composition belongs in Plate; precedence belongs in Core shortcuts | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Local workaround risk | Smallest owner | Proof | Decision |
|----------|--------------------|-----------------------|----------------|-------|----------|
| N/A | none | N/A | existing Plite selection queries | state-query contracts and owner tests | no new API |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| `.api.isAt(...)` migration | production main app/package source | exact `git grep`, excluding tests/docs/Slate | 29 | 17 | 0 | none |
| hand-rolled cross-block helpers | 13 repaired owners | local helper and block-path comparison scan | 3 helper classes | 3 | 0 | none |
| root start/end replacements | app/package owners | `points.isStart/isEnd(..., [])` and selection-query scan | 2 drift classes | 2 | 0 | none |
| current stale API | active current production scope | `rg '\.api\.isAt\('` | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: no; this is a named API sweep, not a broad Core manifest review.
- Named Core owners reviewed: OverridePlugin and EditorHotkeysEffect.
- Missing rows: 0.

Package file checklist:
- Applies: no; the user requested a cross-package API sweep, not sequential
  package file scoring.
- All named source owners are represented in the review matrix.

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `apps/www/src/registry/components/editor/plugins/tabbable-kit.spec.ts` | justify-new-proof-tooling | no equivalent focused owner test on main | keep | 3 direct semantic rows pass |

Release artifact matrix:
| Surface | Main-relative user-visible delta | Artifact | Reason |
|---------|----------------------------------|----------|--------|
| Published packages | none | no changeset | Restores behavior already present on `main`; isolated PR uses `skip-changeset` |
| Registry source | none | no registry changelog | Same main-parity correction, not a new registry feature |
| Barrels/exports | none | no `pnpm brl` | No public export or file-layout change |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking | Owner / next |
|-------------------|---------------|------------------|--------------|
| N/A | none | All named and shared gates passed | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched | Next owner |
|---------------|----------------------|-----------------|------------|
| N/A | none | Exact production inventory fully mapped | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| runtime | 13 drift owners plus Core shortcut priority registration |
| tests | Core Override/hotkeys, Selection, Table, and two registry specs |
| manifest | Legacy list model test-only Media dev dependency and lock importer |
| plan | this execution ledger |
| generated/release | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | Packet is closed | this plan | continue the next migration packet |

Findings:
- The migration had 17 semantic drifts, not a missing Plite capability.
- Shortcut `priority` was resolved into runtime metadata but ignored during
  listener registration. Sorting registrations and keeping BlockSelection at
  fallback priority makes the public shortcut contract real.
- Tabbable's standalone demo config does not import TabbableKit; the direct kit
  spec is the authoritative proof for that registry source.

Decisions and tradeoffs:
- No compatibility `isAt` API: the explicit selection vocabulary is clearer.
- No changeset/changelog: version artifacts describe main-relative product
  delta, and this packet restores main behavior on the migration branch.
- Keep BlockSelection select-all in Plate, with Core enforcing documented
  shortcut precedence; no Plite product-policy transform was introduced.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|------------------------|-------|----------------|------------|
| Override used `tx.break.insert()` inside its own middleware | 1 | invoke captured `next()` | recursion removed; regression passes |
| package tests resolved stale/missing Utils output | 1 | run the documented reinstall repair | full package tests passed |
| Legacy list model test imported undeclared Media package | 1 | declare test-only dev edge and install | source-first graph passed |
| `www` typecheck needed Table artifact after aborted graph | 1 | build the intentional artifact owner | `www` typecheck passed |
| narrow Table fixture inferred an invariant generic | 1 | deliberately widen the test editor to `Value` | typecheck passed |
| first Browser URL used a non-existent block name | 1 | inspect registry owner and use exact routes | target routes returned 200 |
| first autoreview treated no changeset as an omission | 1 | supply verified main-parity release context | final review clean |

Verification evidence:
- Exact source audit: 29 production `main` calls, 17 repaired calls, 12 clean
  calls preserved, zero current production `.api.isAt` calls in scope.
- Focused regressions: Core/Selection/Table owner rows passed; registry
  `tabbable-kit.spec.ts` plus `ai-menu.spec.tsx` passed 5/5.
- Full affected package tests: Core 736, Selection 113, Table 271, List
  Classic 124, Suggestion 103, Toggle 13; zero failures.
- Source-first typechecks passed for Core, Selection, Table, Legacy list model,
  Suggestion, Toggle, and `www`; affected build graph passed 20/20 tasks.
- `pnpm check:core` passed typecheck/lint/tests for all 45 configured packages.
- `pnpm lint:fix` checked 4,819 files; final package lint and
  `git diff --check` passed.
- `www` docs parity and registry source checks passed.
- Browser: block-selection, AI editor, and Tabbable routes returned 200;
  progressive select-all visibly selected all six blocks. No target-specific
  console error appeared; one existing generic React script-tag warning was
  unrelated to this packet.
- Final command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --stream-engine-output --prompt <main-parity release context>`
  returned no actionable findings; correctness 0.82.

Final handoff contract:
- target surface and mode: all production main `.api.isAt` migrations, broad
  named-API sweep
- files/APIs reviewed: 29 calls across app/package owners plus Core shortcut
  precedence
- best Plate v2 recommendation: explicit Plite selection queries; product
  select-all remains in Plate
- verdict summary: 17 repaired, 12 kept, 0 deferred
- Plite/Plate gaps: none
- release artifacts: none, with exact main-parity reason
- next best packet: resume Plate Next from the next uncovered migration owner

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verified handoff |
| Where am I going? | Close the active goal and return control |
| What is the goal? | 29 mapped, 17 repaired, all proof gates green |
| What have I learned? | Explicit selection queries cover every old `isAt` semantic class |
| What have I done? | Repaired owners, added proof, closed shared gate, Browser, and review |

Timeline:
- 2026-07-16: inventoried 29 calls and classified 17 drifted.
- 2026-07-16: repaired 13 owners and Core shortcut precedence.
- 2026-07-16: passed owner, package, shared Core, registry, Browser, and review gates.

Open risks:
- None in the repaired caller graph. The app still emits one pre-existing
  generic React warning about script tags; it is unrelated to these files and
  appeared identically across the local demo routes.
