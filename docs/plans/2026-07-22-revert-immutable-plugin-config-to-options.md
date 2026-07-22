# Revert immutable plugin config to options

Objective:
Hard-cut Plate's redundant immutable plugin `config` value channel. Plate
plugins have one value bag, `options`; the task is complete when every former
consumer is migrated, every residual `config` match is classified, release and
skill prose teach the final API, and all named proof gates pass.

Flow mode:
One-shot repo-wide named API sweep.

Goal plan:
`docs/plans/2026-07-22-revert-immutable-plugin-config-to-options.md`

Source and mode:
- User direction: "scan all usages of config to revert" after rejecting
  immutable plugin config as unnecessary.
- Target: the separate Plate plugin `config` field, its generic slot, parser and
  schema contexts, lifecycle, host policy, runtime mutation API, packages,
  apps, tests, docs, tooling, barrels, skill doctrine, and release prose.
- Mode: exhaustive named API/caller sweep, not broad Core drift review and not
  package topology review.
- Final owner handoff: freeze source writes and send exact proof to schema task
  `019f89d1-44c3-7ca2-b99c-60a368f0aff4`.

Completion threshold:
- Plate plugin values live only in typed `options`; schema and parser factories
  receive those options during descriptor compilation.
- No production Plate plugin `config` field, immutable-config type/generic,
  `plugin.config`, `editor.configure`, host-policy resource, `define*Config`
  wrapper, or config-specific lifecycle remains.
- Plite extension `config` remains untouched because it is a distinct Plite
  extension model, not the removed Plate plugin channel.
- Every residual literal `config:` match is proven to be an ordinary function,
  build, provider, upload, test-data, app, Plite, or negative-checker concept.
- Affected packages, aggregate exports, docs, app consumers, packed release
  artifacts, and the shared Core gate pass.

Verification surface:
- Exact removed-symbol searches and a full classified `config:` inventory.
- `node tooling/scripts/check-plate-schema-adoption.mjs` over 4,916 source and
  documentation files.
- Source-first typechecks for 16 affected packages, `platejs`, and `www`.
- Behavioral tests for Core, basic-nodes, link, list-classic, CSV, Markdown,
  and Yjs, followed by the broader `pnpm check:core` suite.
- Docs contract audits, barrel generation, skill generation, lint, release
  artifact packing, and the autogoal completion checker.
- Browser proof is not applicable: this changes API ownership, typing, docs,
  and package artifacts without a browser-visible behavior path.

Constraints:
- Do not rename the whole `PluginConfig` contract or generic local variables
  merely because they contain the word `config`.
- Do not invent immutable option tokens, a second value bag, compatibility
  aliases, null overlays, versioned config wrappers, or a replacement host
  policy layer.
- Live `setOptions` updates plugin API behavior but do not rebuild the compiled
  schema or mutate the resolved descriptor snapshot.
- Preserve shared schema-task edits: scoped plugin portals, `initialValue`
  migrations, synchronous initializers, autoformat deletion prose, docs EN/CN
  pairs, registry changelog work, and deleted-package migration prose.
- `.agents/rules/plate-next.mdc` is the source; regenerate the skill mirror with
  `pnpm install` instead of editing `SKILL.md` directly.
- No line ceiling or topology cleanup is part of this named sweep. The updated
  Plate Next doctrine still keeps the user's colocation and inference rules.

Boundaries:
- Allowed: Core plugin contract/runtime, every exact package/app/docs consumer,
  affected tests/tooling, generated barrels, Plate Next rule/mirror, and the
  four overlapping release artifacts explicitly assigned by the schema task.
- Non-goals: unrelated config naming, Plite extension config, build/provider
  config, registry output generation, UI redesign, or a broad package cleanup.
- Shared workspace edits from the schema task are preserved; this lane owns the
  options-only hard cut and its overlapping release prose.

Blocked condition:
A concrete schema or host compilation requirement that typed descriptor
`options` cannot supply without a new public API decision. No such gap was
found.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Scope, exclusions, proof, stop condition, and immutable handoff are recorded above. |
| `plate-next` skill loaded | yes | Skill read before implementation; source rule updated and regenerated. |
| `autogoal` active | yes | This quantitative zero-unresolved-row plan owns the run. |
| `changeset` skill loaded | yes | Four assigned release files were updated to the final options-only API. |
| Mode classified | yes | Repo-wide named API sweep; broad Core and package-review ledgers are not applicable. |
| Public API decision authorized | yes | User explicitly rejected the separate config channel and requested a repo-wide revert. |
| Shared-write coordination | yes | Core/config ownership was exclusive; disjoint schema/docs edits were preserved. |

Work Checklist:
- [x] Capture every explicit requirement and coordination constraint before closure.
- [x] Remove the Core plugin config field, generic, inference, lifecycle, host policy, and `editor.configure` surface.
- [x] Move all former feature values to typed `options` and preserve callback inference.
- [x] Migrate package, app, test, documentation, and tooling consumers.
- [x] Keep Plite extension configuration and unrelated configuration concepts intact.
- [x] Update `.agents/rules/plate-next.mdc` and regenerate `.agents/skills/plate-next/SKILL.md`.
- [x] Repair the four assigned changesets to options-only/scoped-portal/deferred-init truth.
- [x] Run barrels, package/app typechecks, behavioral tests, docs/schema audits, lint, Core, and packed-artifact gates.
- [x] Classify all residual literal `config:` matches and prove zero unresolved Plate plugin-channel rows.
- [x] Record every failed attempt and its distinct repair.
- [x] Preserve all shared schema-task docs and initialization edits.
- [x] Freeze source writes and hand exact proof to the schema task.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run every command listed in Verification evidence | All listed commands pass. |
| Best Plate v2 recommendation | yes | Choose one value owner and reject duplicate lifecycle | `options` is the sole Plate plugin value bag. |
| Plite or Plate capability gap | no | Record whether a missing capability blocks the cut | No gap; descriptor options and scoped portals already own the behavior. |
| Related scoped sweep | yes | Rerun exact deleted-name and residual-config queries after repairs | Zero production removed-name matches; 125 residuals classified. |
| Broad Core drift ledger | no | Explain exclusion | Named API sweep audited every matching Core owner; unrelated Core files were not reviewed. |
| Package file checklist | no | Explain exclusion | This is a repo-wide named API sweep, not sequential package review. |
| Helper topology audit | no | Explain exclusion | No package topology packet is in scope. |
| Package and app proof | yes | Typecheck and test affected owners | 16-package, `platejs`, `www`, focused, and `check:core` gates pass. |
| Source audit | yes | Prove deleted public/runtime names absent | Only two negative doctrine lines mention deleted shapes. |
| Release classification | yes | Update existing release artifacts without duplicate changesets | Four assigned changesets describe the final public API; no new delta from reverting unshipped WIP. |
| Barrel generation | yes | Regenerate after exported file deletion | `pnpm brl` passes. |
| Skill generation | yes | Regenerate source rule mirror | `pnpm install` passes and generated skill contains the options-only rule. |
| Browser proof | no | Explain exclusion | No runnable UI behavior changed; docs, app types, tests, and packed consumers cover this surface. |
| Final lint and Core gate | yes | Run shared gate after formatting repairs | `pnpm check:core` passes all 45 reviewed packages and tests. |
| Immutable task handoff | yes | Notify the schema task after source freeze | Exact command/results handoff is the final action of this run. |
| Goal plan complete | yes | Run the autogoal checker | Run after this evidence write. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Core hard cut | complete | Config field/generic/lifecycle/host policy and `editor.configure` removed. |
| Consumer migration | complete | Feature packages, apps, tests, docs, and tooling use options. |
| Release and doctrine | complete | Changesets and generated Plate Next skill teach final API. |
| Verification | complete | Package, app, docs, artifact, lint, and Core gates pass. |
| Coordination freeze | complete | This plan is immutable; schema-task handoff follows without further source edits. |

Review matrix:
| Path or API | Drift score | Verdict | Owner | Evidence | Next |
|-------------|-------------|---------|-------|----------|------|
| Core plugin `config` channel | 5 | cut | `packages/core` | Types, runtime lifecycle, host policy, and tests removed; Core gate green. | none |
| Feature immutable values | 5 | move to options | owning packages | Heading, Link, List Classic, CSV, Markdown, NodeId, and related consumers typecheck/test. | none |
| `editor.configure` | 5 | cut | Core editor runtime | Exact source scan has no production match. | none |
| Plite extension `config` | 0 | keep | `packages/plite` | Separate extension contract and docs; explicitly excluded by checker/doctrine. | none |
| Generic `config` names | 0 | keep | local owners | 125 residual literals classified; none is the removed Plate field. | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User review need |
|--------|-------------------|-----------------------|--------|------------------|
| Plugin-owned values | One typed `options` bag; descriptor `.configure({ options })`; scoped live `getOptions` and `setOptions` | Immutable config bag, tokens, overlays, host-policy resources, `editor.configure`, versioned wrappers | Shortest inference path, one ownership model, and no fake lifecycle distinction | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is wrong | Smallest owner | Proof | Decision |
|----------|--------------------|-------------------------------|----------------|-------|----------|
| none | none | A replacement config abstraction would only duplicate options | Core plugin contract | Typechecks, tests, schema audit, packed consumer | no gap |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query or method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|-----------------------|---------|---------|----------|----------------|
| Core channel removal | repo source/docs/releases/skill | deleted types, `plugin.config`, `editor.configure`, host policy, wrappers | 2 negative doctrine lines | 0 | 0 | none |
| Target/levels docs migration | current Plate docs EN/CN | `config.targets`, `config.levels`, immutable plugin config prose | 0 final | all discovered | 0 | none |
| Literal residual classification | packages/apps/content/tooling | `\\bconfig\\s*:` with generated/history exclusions | 125 ordinary rows | 0 | 0 | none; schema checker rejects Plate plugin fields |
| Release API consistency | four assigned changesets | config/editor.configure/null-overlay and portal scans | 0 final | 4 files | 0 | none |

Residual `config:` classification:
| Category | Count | Decision |
|----------|-------|----------|
| Core plugin declaration and method parameter names | 21 | keep; these name plugin declaration objects and method inputs, not a value field |
| Core input-rule and plugin-factory parameters | 10 | keep |
| Plite extension/runtime configuration | 16 | keep; distinct owner |
| App/build/registry/performance configuration | 41 | keep |
| Docs generic function or Plite configuration | 13 | keep |
| Media upload utility configuration | 11 | keep |
| Tooling configuration | 6 | keep |
| Markdown AST fixture data | 2 | keep |
| Negative schema-checker fixtures | 2 | keep; prove rejection |
| Other ordinary configuration | 3 | keep: loose-plugin test input, AI prompt config, primitive component config |
| Total | 125 | zero unresolved Plate plugin-channel rows |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| Code/runtime/API | Core options-only contract; removed host policy/config lifecycle; feature package option migrations; app editor-kit inference repair. |
| Tests/proof | Rewritten option behavior tests, checker fixtures/counts, packed consumer snapshot/live-option contract. |
| Docs/skills | EN/CN options and target-key docs; Plate Next source rule and generated skill mirror. |
| Release | Assigned `platejs`, Core portal, CSV, and Markdown changesets repaired to final API. |
| Preserved shared work | Scoped portals, initialization docs/tests, autoformat deletion, registry changelog, and schema-task docs edits. |

Release artifact decision:
- Existing changesets are the correct artifacts because this reverts an
  unshipped branch-only config design into the final options-only API. Adding
  package-by-package changesets would describe a transient API users never
  receive.
- The packed consumer proves both runtime and declaration exports from ten
  public packages and explicitly distinguishes immutable descriptor options
  from live portal options.

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | none | All named rows are closed | this plan | schema task can resume integration |

Findings:
- The separate config bag had no independent semantic owner; it duplicated
  options and forced lifecycle, equality, host-policy, and mutation machinery.
- A resolved plugin descriptor is a compiled snapshot. `setOptions` must update
  scoped live behavior without rewriting that snapshot or rebuilding schema.
- The old `PlateEditor<Value, EditorKit[number]>` app alias depended on an
  accidental structural match. `InferPlugins<typeof EditorKit>` is the honest
  plugin-contract type.

Decisions and tradeoffs:
- Keep the public `PluginConfig` type name. It describes the whole plugin type
  contract; renaming it would be cosmetic churn unrelated to the removed field.
- Keep Plite extension config. Deleting it would cross the explicit Plate/Plite
  boundary and solve a different problem.
- Keep schema-affecting values in descriptor options. Runtime option changes do
  not recompile schema; callers configure those values before editor creation.

Error attempts:
| Error or failed attempt | Count | Different move | Resolution |
|-------------------------|-------|----------------|------------|
| Oversized broad `rg` output truncated | 1 | Narrow exact deleted symbols, then count/classify literal residuals | 125 residuals classified; zero unresolved |
| TypeScript package AST helper exposed only version metadata | 1 | Use the repo Babel-based schema checker and source typechecks | 4,916-file audit passes |
| Initial multi-package typecheck exposed List Classic nested schema inference loss | 1 | Restore inference at the owning plugin declaration | affected package graph passes |
| `www` typecheck rejected `EditorKit[number]` as a plugin contract | 1 | Use `InferPlugins<typeof EditorKit>` in both kits | full `www` typecheck passes |
| Schema checker unit fixture expected five removed Yjs lineage calls | 1 | Align the synthetic fixture with the two real reviewed calls | all checker tests pass |
| `check:core` revealed formatter debt behind fail-fast packages | 3 | Run scoped `lint:fix` across all 16 affected packages | final `check:core` passes |
| Turbo had no `lint:fix` task | 1 | Use pnpm multi-filter package scripts | all affected package lint fixes pass |
| Packed consumer expected live options to mutate descriptor snapshot | 1 | Assert snapshot stays `draft` while portal API reads `published` | packed runtime/declaration/DCE proof passes |

Verification evidence:
- `pnpm brl` — 56/56 barrel tasks pass.
- `pnpm install` — passes; Plate Next skill mirror regenerated.
- `pnpm turbo typecheck` for 16 affected packages — 39/39 tasks pass.
- `pnpm turbo typecheck --filter=./packages/plate --filter=./apps/www` —
  58/58 tasks pass after the editor-kit inference repair.
- `pnpm turbo test` for Core, basic-nodes, link, list-classic, CSV, Markdown,
  and Yjs — 7/7 package tasks pass; Yjs reports 215/215 tests.
- Four checker test files — 37/37 tests pass.
- Plate schema adoption source audit — 4,916 files pass.
- Plate docs code contract audit — 366 current docs pass.
- Plite v2 docs audit — passes.
- `pnpm check:core` — passes: contracts, audits, 45-package typecheck/lint,
  Core/Plite, and every reviewed package test batch.
- Packed release artifacts — 10 packages, 34 public subpaths, NodeNext and
  Bundler declarations, Node runtime, package direction, and bare/named DCE pass.
- Exact removed-name scan — two doctrine-only negative references; zero
  production matches.
- Residual inventory — 125 literal matches, all classified above.

Final handoff contract:
- Target/mode: repo-wide Plate plugin config-to-options named API hard cut.
- Files/APIs reviewed: Core plugin types/builders/runtime, exact consumers in 16
  packages, apps, current docs, tooling, barrels, skill, and assigned changesets.
- Best shape: options-only Plate plugins with scoped portals; no second channel.
- Gaps/blockers: none.
- Out-of-scope residuals: ordinary configuration and Plite extension config,
  fully classified above.
- Proof: every command in Verification evidence passes.
- Old compatibility names: zero production matches.
- Source state: frozen after this plan/checker write; schema task may resume.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final immutable handoff |
| Where am I going? | Schema-task integration resumes on this frozen source snapshot |
| What is the goal? | Keep Plate options-only and prevent the duplicate config channel from returning |
| What have I learned? | Descriptor snapshot and live option state are intentionally different owners |
| What have I done? | Hard-cut, migrated, documented, generated, tested, audited, packed, and frozen |

Timeline:
- 2026-07-22: created quantitative goal and accepted the options-only public API.
- 2026-07-22: removed Core config machinery and migrated every discovered consumer.
- 2026-07-22: repaired docs, releases, skill doctrine, inference, checker, and artifact contracts.
- 2026-07-22: completed final source audits and proof gates.

Open risks:
None in this lane. The schema task owns broader integration after the immutable
handoff and must preserve the options-only rule.
