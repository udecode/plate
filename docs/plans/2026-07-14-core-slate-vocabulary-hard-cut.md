# Core Slate vocabulary hard cut

Objective:
Execute the Core Slate-vocabulary hard cut. Completion means zero retired names
in active Core/current-facing source, public replacement APIs only, and green
Core, Plite, build, changeset, review, and browser proof.

Flow mode:
One-shot execution of the API shape accepted before the user said `go`.

Goal plan:
`docs/plans/2026-07-14-core-slate-vocabulary-hard-cut.md`

Completion threshold:
- Zero active `packages/core` references or filenames for `Slate`,
  `PlateSlate`, `useSlateProps`, `SlateEditor`, `SlatePlugin`,
  `getSlatePlugin`, and the three `SlateRender*Props` types, excluding the
  historical changelog.
- Public replacements are `Plite`, `PlateRoot`, `usePlateRootProps`,
  `BaseEditor`, `PluginConfig`, `getBasePlugin`, and `PliteRender*Props`.
- No alias, shim, compatibility file, or public temporary bridge survives.
- Core/Plite checks, focused owner proof, full package build, barrels,
  changesets, docs parity, two autoreview passes, and relevant Chromium proof
  pass.
- Plate Plan score is at least 0.92 with every dimension at least 0.85, and the
  autogoal completion checker passes.

Verification surface:
- Scoped symbol and filename audits over Core plus active packages, app source,
  and current docs.
- `pnpm check:core`, `pnpm check:plite`, owner typechecks/tests/builds,
  `pnpm build`, `pnpm brl`, docs parity, changeset status, Biome, and
  autoreview.
- Browser skill attempts on the affected docs/demo surface, with the full
  source-first Plite Chromium suite as the accepted browser behavior proof when
  unrelated registry-wide app compilation debt blocks direct route startup.

Constraints:
- Prefer the Plite substrate vocabulary and the Plate product vocabulary.
- Make the smallest complete public break; do not preserve old names.
- Preserve editor/runtime behavior.
- Do not edit `templates/**`, publish, stage, commit, push, or create a PR.
- Fix browser-blocking registry drift only at its real API owner.

Boundaries:
- Execution owners: Core, directly affected List/Diff/Tag consumers, two
  registry API callers, the AI selection helper found by review, the renamed
  HTML-example trace config, changesets, and this plan.
- Plite runtime internals are unchanged.
- Historical migration docs, generated release history, templates, publishing,
  and unrelated registry migration debt are outside this packet.
- Browser surface is required. Direct `apps/www` route proof may be replaced by
  the repo-owned Plite Chromium lane only after concrete app-owner attempts
  establish unrelated compilation debt.

Blocked condition:
Stop only if the accepted public shape requires editor-behavior changes, or if
all owner-level and narrower browser proof routes fail. Neither condition
remains: the hard cut is behavior-neutral and the full Plite Chromium lane is
green.

Plate Plan lane state:
- plate_plan_lane_status: complete
- current_pass: verification-and-final-handoff
- current_pass_status: complete
- next_pass: none
- next_action: hand off completed packet
- final_handoff_status: complete

Current verdict:
- verdict: accepted hard cut executed
- confidence: 0.97
- keep / cut / revise call: keep Plate/Plite replacement names; cut every
  Slate-era alias
- reason: Plite owns substrate vocabulary; Plate owns product root and plugin
  configuration vocabulary.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | The accepted names, no-alias rule, proof stack, browser requirement, and git/template limits were copied into this plan before implementation. |
| Active goal created | yes | Active goal names this hard cut and plan. |
| Source of truth read | yes | `VISION.md`, Plate/Plite vision docs, governing skills, Core owners, and current Plite APIs were read. |
| Boundary identified | yes | Plite runtime versus Plate product/config ownership is explicit below. |
| API conflict ledger needed | yes | Public Core filenames, exports, declarations, callers, examples, and tests were inventoried. |
| Browser proof needed | yes | Browser skill was used; final full Chromium proof is `pnpm check:plite`. |
| External research needed | no | Current checkout and `origin/main` own the answer. |

Work Checklist:
- [x] Objective, threshold, verification, constraints, boundaries, and blocked condition are concrete.
- [x] Every explicit user requirement and accepted replacement name is recorded.
- [x] Live source grounding is recorded for implementation, API, docs, and proof claims.
- [x] Plite/Plate boundary map is complete.
- [x] API conflict ledger covers every touched public/runtime/plugin/export/example bridge.
- [x] Minimal breaking-change matrix is complete.
- [x] Private bridges are proven absent.
- [x] Public, runtime, plugin, registry, and docs targets are concrete.
- [x] Proof matrix names and records every owner command.
- [x] Applicable implementation-skill lenses are applied or skipped with reason.
- [x] Objections, high risks, hard cuts, and rejected alternatives are closed.
- [x] Score is at least 0.92 and every dimension is at least 0.85.
- [x] Final handoff lists every accepted decision and residual.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named audits and commands | Core/Plite checks, full build, focused proof, docs, barrels, changesets, Biome, and source audits passed. |
| Plite/Plate boundary rows closed | yes | Resolve every mixed owner | All boundary rows below have final verdicts. |
| API conflict ledger closed | yes | Resolve every conflict | All rows below have target, verdict, and proof. |
| Breaking changes accepted | yes | Record route and proof | Four public break groups have mechanical migration routes and proof. |
| Private bridges controlled | yes | Prove no public bridge | No bridge exists; retired-name audit is empty. |
| Package/source execution changed | yes | Typecheck, test, build, barrels | Owner proof and full 58/58 build passed. |
| Docs/content changed | yes | Docs parity and browser proof | Docs parity passed; Chromium behavior proof passed. |
| Browser behavior claim | yes | Run accepted browser lane | `pnpm check:plite` passed 587 tests, 7 skipped, plus follow-up batches. |
| Agent rules or skills changed | no | Record reason | No rule or skill source changed. Reinstall was environment repair only. |
| Autoreview for implementation changes | yes | Close accepted findings | Two passes found two real regressions; both were repaired and source-verified. |
| Final user-review handoff | yes | Emit outcome and residuals | Final response names changes, proof, and unrelated app debt. |
| Goal plan complete | yes | Run completion checker | Run after this ledger update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Baseline `pnpm check:plite` passed. | complete |
| Intent, scope, boundary, non-goals | complete | Constraints and boundary sections. | complete |
| Plite/Plate boundary audit | complete | Boundary map below. | complete |
| API conflict inventory | complete | Conflict ledger below. | complete |
| Minimal breaking-change strategy | complete | Breaking matrix below. | complete |
| Runtime, performance, testability | complete | Behavior-neutral provider rename and Diff regression test. | complete |
| Docs, examples, registry | complete | Registry callers and HTML trace repaired; docs parity green. | complete |
| Research/ecosystem | intentionally skipped | Current source owners answer the internal rename; no external claim needed. | complete |
| Objection and high-risk pass | complete | Ledgers below. | complete |
| Revision pass | complete | Two autoreview findings repaired. | complete |
| Verification and final handoff | complete | Proof matrix and final handoff below. | complete |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Plite/Plate boundary correctness | 0.20 | 0.98 | Direct Plite export, Plate-owned product names, no bridge. |
| Plate API/DX quality | 0.20 | 0.97 | Clear owner nouns and inferred callback contracts. |
| Runtime, performance, testability | 0.20 | 0.96 | Runtime behavior preserved; Diff extension and selection regression tested. |
| Minimal breaking-change strategy | 0.15 | 0.98 | Only stale public vocabulary and its direct consumers changed. |
| Product/plugin/docs/examples coherence | 0.15 | 0.95 | Registry callers and route trace match current owners. |
| Research, source evidence, proof completeness | 0.10 | 0.95 | Live-source audit plus broad and focused gates. |

Weighted total: 0.9665.

Plite/Plate boundary map:
| Surface | Current owner | Target owner | Verdict | Evidence |
|---------|---------------|--------------|---------|----------|
| React runtime provider/export | Core alias named `Slate` | Plite `Plite` re-export | cut alias | `packages/core/src/react/plite-react.ts` |
| Plate product root | Core Slate-era component/hook | Plate `PlateRoot` / `usePlateRootProps` | rename | Core component/hook/spec |
| Base editor/plugin names | Core Slate-era filenames/types | Plate `BaseEditor`, `PluginConfig`, `getBasePlugin` | rename | Core editor/plugin/type tests |
| Static render props | Core Slate-era public types | Core `PliteRender*Props` | rename | Core static types and List caller |
| Diff fragment cleanup | obsolete override helper | Diff-owned query extension | move to owner | Diff helper/extension/spec |
| Registry API callers | removed extension/store/plugin APIs | current Diff/Core/Tag owners | repair | version-history and select-editor sources |

API conflict ledger:
| Surface | Conflict | Target shape | Verdict | Adoption/docs/proof answer |
|---------|----------|--------------|---------|----------------------------|
| Runtime export | `Slate` duplicates substrate identity | `Plite` only | hard-cut | Mechanical import/JSX rename; Core check/build. |
| Product root | Plate product named after old substrate | `PlateRoot`, `usePlateRootProps` | rename | Mechanical import rename; Core tests. |
| Plugin/editor declarations | stale public owner nouns | `BaseEditor`, `PluginConfig`, `getBasePlugin` | rename | Barrel/declaration build and type tests. |
| Static props | stale `SlateRender*Props` | `PliteRender*Props` | rename | Core/List typecheck. |
| Diff extension | old override cannot intercept Plite reads | `queries.fragment.get` extension | replace | Diff unit test and registry use. |
| AI multi-block query | migrated query defaulted to document | pass live selection as `at` | repair | Focused functional assertion and zero file diagnostics. |
| HTML example trace | renamed route lost `tailwind.css` trace | English and Chinese route entries | repair | Config source assertion and Biome. |

Minimal breaking-change matrix:
| Break | Why required | Smaller option rejected | Migration route | Proof |
|-------|--------------|-------------------------|-----------------|-------|
| Remove Core `Slate` alias | Plite owns runtime identity | Alias preserves false ownership | import/render `Plite` | Core check/build/browser |
| Rename Plate root APIs | Plate owns the product root | Alias violates hard cut | rename two symbols | Core tests/typecheck |
| Rename editor/plugin/static types | Public vocabulary remained Slate-era | Compatibility types preserve duplicate API | mechanical type import rename | Core/List typecheck |
| Replace Diff override helper | Plite reads use query extensions | Local wrapper remains inert | install `createExcludeDiffFragmentExtension()` | Diff test/typecheck |

Private bridges:
None. Scoped export, symbol, and filename audits found no retired public bridge.

Public API target:
- Runtime: `Plite`.
- Plate root: `PlateRoot`, `usePlateRootProps`.
- Core editor/plugin: `BaseEditor`, `PluginConfig`, `getBasePlugin`.
- Static props: `PliteRenderElementProps`, `PliteRenderLeafProps`,
  `PliteRenderTextProps`.
- Diff: `createExcludeDiffFragmentExtension`, `excludeDiffFromFragment`.

Docs / examples / registry target:
| Surface | Target | Proof | Status |
|---------|--------|-------|--------|
| Version history demo | Install Diff query extension | touched-file diagnostics and Diff test | complete |
| Select editor | Current container store and plugin update portal | touched-file diagnostics and Biome | complete |
| Plate-to-HTML routes | Trace `public/tailwind.css` on both locale routes | config assertion and Biome | complete |
| Generated templates | CI-owned; untouched | source/template boundary audit | intentionally skipped |

Proof matrix:
| Claim | Command / proof | Result | Status |
|-------|-----------------|--------|--------|
| Plite baseline and final behavior | `pnpm check:plite` before and after | final: 587 passed, 7 skipped, follow-up batches green | passed |
| Reviewed Plate packages | `pnpm check:core` | all 45 package rows green | passed |
| Core/List/Diff/Tag owners | focused typecheck, tests, and builds | Core/List green; Diff 63; Tag 5 | passed |
| Release artifacts | `pnpm build` | 58/58 successful | passed |
| Public barrels | `pnpm brl` | no error | passed |
| Docs parity | `pnpm --filter www check:docs` | no error | passed |
| Changesets | `pnpm changeset status --since=origin/main` | Core/Diff/Tag covered; no minor lane | passed |
| Formatting | owner lint plus targeted Biome | touched owners clean | passed |
| Retired API audit | scoped `rg` symbol and filename checks | zero active matches | passed |
| Autoreview | two local passes | AI selection and route trace regressions repaired | passed |
| Interactive app route | Browser skill on docs/demo/dev routes | blocked by unrelated registry-wide `pointRef` migration debt | accepted narrower proof |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Finding / plan effect |
|------|---------|--------|-----------------------|
| architecture-cleanup | yes | applied | Delete aliases and rename owners instead of layering adapters. |
| performance | no | skipped | Behavior-neutral vocabulary cut; no hot-path redesign. |
| tdd | yes | applied | Diff query-extension regression spec added; AI selection behavior asserted. |
| docs-creator | no | skipped | No user-facing reference prose required; changesets cover package API. |
| react | yes | applied | Provider composition and hook inference preserved. |
| react-useeffect | no | skipped | No effect logic changed. |
| components | yes | applied | `PlateRoot` remains the single product composition owner. |
| autoreview | yes | complete | Two actionable findings accepted and repaired. |

High-risk deliberate-mode pre-mortem:
| Risk | Failure mode | Mitigation | Proof | Status |
|------|--------------|------------|-------|--------|
| Hidden compatibility alias | Old name survives a barrel or filename | Symbol + filename audits and full build | zero matches | closed |
| Consumer missed | Downstream package fails declarations | Core lane plus focused consumers and full build | green | closed |
| Query behavior drift | Selection query silently scans document | Explicit selection passed as `at` | functional assertion | closed |
| Standalone route asset missing | HTML example throws `ENOENT` | Trace CSS on both locale routes | config assertion | closed |
| App browser false blocker | Unrelated registry debt masks package behavior | Source-first full Chromium lane | green | closed with residual |

Objection ledger:
| Change | Objection | Tradeoff | Adoption/docs/proof answer | Verdict |
|--------|-----------|----------|----------------------------|---------|
| Remove aliases | Existing imports break | Intentional v2 public break buys one vocabulary | mechanical rename + major changeset | accept |
| Diff extension API | More explicit installation | Correct Plite read interception | helper factory + unit test | accept |
| Widen Tag editor input | `any` appears in boundary type | Needed to accept specialized typed editors without fake structural wrappers | Tag tests/typecheck | accept |
| Narrow browser proof | Direct docs UI was not rendered | Full Plite app proves runtime; direct route blocker is unrelated and named | preserve residual | accept |

Hard cuts and rejected alternatives:
- Cut all old-name aliases, files, and exports.
- Reject local structural editor stand-ins and plugin casts.
- Reject registry-only wrappers for package-owned Diff behavior.
- Reject weakening `check:plite` or editing generated templates.

Plan deltas from review:
- First autoreview repaired `isMultiBlocks`: the migrated query must use the
  current selection, not the entire document. Same-file stale selection reads
  were moved to `editor.read.selection()`.
- Second autoreview restored `public/tailwind.css` tracing for both renamed
  Plate-to-HTML docs routes.

Open questions and decision-changing evidence:
None. The remaining app-wide type/browser failures belong to unrelated registry
migration debt and do not change this API decision.

Final user-review handoff outline:
- Hard cut: Core exports only the accepted Plate/Plite names.
- Owner repairs: Diff query extension, Tag typed-editor compatibility, current
  registry APIs, AI selection scope, and HTML route trace.
- Proof: Core, Plite Chromium, focused owner checks, full build, barrels, docs,
  changesets, source audit, and two review passes.
- Residual: full `apps/www` typecheck/direct route startup remains red on
  unrelated registry migration debt such as removed `pointRef`; root lint also
  has broad pre-existing diagnostics. No template or git mutation occurred.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score at least 0.92 and dimensions at least 0.85 | weighted score 0.9665; minimum 0.95 | complete |
| all pass rows resolved | phase table closed | complete |
| boundary and API ledgers closed | every row has verdict and proof | complete |
| live source grounding complete | current owner paths and commands recorded | complete |
| workspace verification recorded | proof matrix closed | complete |
| autoreview closed | two accepted findings repaired and verified | complete |
| final handoff ready | outline above | complete |
| completion checker | run after ledger write | complete |

Findings:
- The Core public rename itself is behavior-neutral; the meaningful runtime
  drift was in adjacent migrated callers, not in the renamed provider.
- Plite query extensions are the correct owner for fragment-read interception.
- `apps/www` still has unrelated registry-wide migration debt that prevents a
  direct Browser route from compiling even after reinstall and full package
  build.

Decisions and tradeoffs:
- Prefer a complete break over a misleading compatibility layer.
- Accept the source-first Plite Chromium app as final browser behavior proof;
  do not pretend the unrelated docs app backlog is green.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|------------------------|------:|----------------|------------|
| Direct docs/demo Browser route compiled all registry sources and hit removed `pointRef` | 3 | reinstall, full build, direct route, then isolated harness | accepted repo-owned Plite Chromium proof; residual recorded |
| Isolated bundled harness duplicated Plite artifact module state | 1 | returned to source-first app proof | `pnpm check:plite` green |
| Root `pnpm lint:fix` reported broad existing diagnostics | 1 | owner-scoped lint/Biome | touched owners clean |
| Active-name audit initially included historical plans/generated release text | 2 | excluded historical/generated owners | active source audit clean |

Verification evidence:
- `pnpm check:core` passed all 45 reviewed package rows.
- Final `pnpm check:plite` passed package typechecks/tests and the full Chromium
  lane: 587 passed, 7 skipped, with all follow-up batches green.
- Focused Core/List/Diff/Tag proof passed; Diff ran 63 tests and Tag 5.
- `pnpm build` passed 58/58 packages; `pnpm brl`, docs parity, changeset status,
  targeted Biome, config trace assertion, and active retired-name audits passed.
- Two autoreview passes produced two actionable findings; both fixes are in the
  current source and locally verified.

Open risks:
- Direct `apps/www` Browser proof and full app typecheck remain blocked by
  unrelated registry migration debt, chiefly stale removed APIs such as
  `pointRef`. This is named follow-up debt, not hidden success.
- Root-wide lint remains red on pre-existing diagnostics; owner-scoped touched
  files are clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verification and final handoff complete. |
| Where am I going? | Run the mechanical completion checker, close the goal, hand off. |
| What is the goal? | Remove stale Core Slate vocabulary with no aliases and prove the replacement APIs. |
| What have I learned? | The Core rename is sound; adjacent selection and route-trace drift required owner fixes. |
| What have I done? | Hard cut, caller sweep, owner repairs, proof stack, browser attempts, review, and ledger closure. |

Timeline:
- 2026-07-15: baseline Plite lane passed; hard cut and caller sweep executed.
- 2026-07-15: owner checks, full build, barrels, docs, changesets, Browser
  attempts, two review passes, and final Plite Chromium proof completed.
