# Plate Next covered packages check core closure

Objective:
Make `check:core` cover every completed Plate Next package review and pass.

Flow mode:
One-shot correction-driven cross-package gate closure.

Goal plan:
`docs/plans/2026-07-14-plate-next-covered-packages-check-core-closure.md`

Template:
`docs/plans/templates/plate-next.md`

Applied packs:
- agent-native

Plate Next source:
- User correction: covered Plate Next packages must be added to `check:core`; add every already-covered package and repair the gate until it passes.
- Mode: shared-gate repair, not a new package review or broad Core file sweep.
- Review target: best Plate v2 behavior on Plite, with no legacy compatibility shims.
- Target surface: `tooling/scripts/check-core.mjs`, completed-review packages, and the smallest proven Core/Plite/test owners exposed by the expanded gate.

Completion threshold:
- Every current package completed by a Plate Next package-review plan is present in one manifest used by typecheck, lint, and package-test collection.
- Reviewed-package inventory records expected, configured, missing, extra, and intentionally excluded counts.
- Runtime package tests consume freshly built Plite, Core, and Utils artifacts.
- Module-level Bun mocks cannot pollute unrelated test files.
- `pnpm check:core` passes.
- The final reviewer and plan checker pass.

Verification surface:
- Inventory: completed Plate Next package-review plans versus `reviewedPackageSlugs` in `tooling/scripts/check-core.mjs`.
- Focused proof: Plite typecheck/build and cross-instance editor contracts; list-classic 124-test lane; isolated Selection hook tests; Suggestion block-void deletion test.
- Shared proof: `pnpm check:core` across all 42 package targets.
- Final review: `agent-native-reviewer` plus `check-complete.mjs`.
- Browser proof: not applicable; the changed surface is headless tooling, editor runtime behavior, and tests with no package-facing route.

Constraints:
- Do not add packages merely because they exist; only completed review owners belong in this correction.
- Do not count an explicitly deferred package as completed.
- Keep Table excluded until its named Plate Plan runtime contracts land.
- Do not hide failures with skips, compatibility aliases, broad casts, or removed tests.
- Preserve source-first typechecking; use artifact builds only where reviewed package runtime tests consume package exports.
- Keep local editor traversal on the fast internal path and use public reads only for foreign editor module instances.
- Core delete behavior is a generic fallback; feature middleware gets first refusal.
- No rename pass, app/docs/template work, release work, or new package review.

Boundaries:
- Allowed: `tooling/scripts/check-core.mjs`; completed-review package tests required by proof; smallest Core/Plite owner required by a proven failure; changeset consolidation required by the existing release-contract test; this plan.
- Excluded: `packages/table` migration, unreviewed packages, apps, content, templates, generated registry output, and broad Core scoring.
- Git publication is outside scope.

Blocked condition:
Stop only if the same expanded-gate failure repeats three times without a smaller owner fix or requires an unapproved public API decision. Neither condition occurred.

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Inventory | complete | 39 completed reviewed packages, 39 configured, 0 missing, 0 extra; Table deferred | gate expansion |
| Gate implementation | complete | one manifest drives 42 typecheck, lint, and test targets; mock files isolated; base artifacts rebuilt | failure closure |
| Failure closure | complete | Plite/Core and affected package failures repaired at their owners | full proof |
| Full proof | complete | `pnpm check:core` exited 0 and reached Toggle, target 42/42 | final review |
| Final closure | complete | reviewer findings and plan checker recorded below | handoff |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt captured | yes | All covered packages, green check, exclusions, proof, and handoff are explicit above. |
| Plate Next rule read | yes | `.agents/skills/plate-next/SKILL.md` governed this run. |
| Goal active | yes | Durable goal used this plan path and the binary 39/39 plus green-check threshold. |
| Broad Core sweep | no | This is shared-gate closure, not one-row-per-Core-file review. |
| Package review checklist | no | Existing completed reviews are inventory inputs; no package is newly reviewed. |
| Browser | no | No runnable visual surface changed. |

Reviewed package inventory:
- Base targets: `core`, `plite`, `utils`.
- Completed review targets (39): `ai`, `basic-nodes`, `basic-styles`, `callout`, `caption`, `code-block`, `code-drawing`, `combobox`, `comment`, `csv`, `cursor`, `date`, `diff`, `dnd`, `docx`, `docx-io`, `emoji`, `excalidraw`, `find-replace`, `floating`, `footnote`, `indent`, `juice`, `layout`, `link`, `list`, `list-classic`, `markdown`, `math`, `media`, `mention`, `resizable`, `selection`, `slash-command`, `suggestion`, `tabbable`, `tag`, `toc`, `toggle`.
- Expected reviewed count: 39.
- Configured reviewed count: 39.
- Total gate targets: 42.
- Missing reviewed targets: 0.
- Extra reviewed targets: 0.
- Intentional exclusion: `table`; its source plan records 166/166 rows deferred because Plite runtime contracts are missing. Deferred is not completed.

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternative | Reason | User review |
|---|---|---|---|---|
| `check:core` inventory | One package-slug manifest drives every phase | Repeated hand-maintained per-phase lists | A completed review cannot silently disappear from one phase. | no |
| Typecheck | Turbo `--only` on the 42 explicit targets | Pulling transitive package builds into the explicit gate | Table is intentionally deferred and must not enter through AI dependency traversal. | no |
| Runtime proof | Build Plite, Core, and Utils before feature-package tests | Test current feature sources against stale base `dist` | Reviewed package imports resolve package exports at runtime. | no |
| Bun mocks | Shared non-mock batch plus one process per `mock.module` file | Package-wide mock pollution | Bun module mocks are process-global. | no |
| Editor recognition | Fast runtime identity locally; proxy-safe structural recognition plus public children reads for foreign instances | Treating a foreign editor as an element or calling its private runtime | Package-local symlink instances are real runtime boundaries. | no |
| Core deletion | Generic Override delete middleware runs after feature middleware | Core fallback swallowing Suggestion Backspace | Feature behavior must get first refusal, matching main override semantics. | no |

Plite / Plate gap ledger:
| Gap type | Capability | Owner | Decision | Proof |
|---|---|---|---|---|
| resolved Plite boundary | Recognize editor proxies from another Plite module instance without losing local traversal performance | Plite `is-editor` and Node API | fixed | Plite typecheck; 125k replace-children contract; list-classic 124/124 |
| resolved Plate ordering | Feature transform middleware must run before generic delete rules | Core `OverridePlugin` | fixed with fallback priority | Suggestion block-void deletion passes in full gate |
| deferred Plate Plan | Table still needs named Plite runtime contracts | Table plan owner | excluded until its 166 deferred rows can close | `2026-07-13-plate-next-slash-command-tabbable-table-package-reviews.md` |

Related scoped sweep ledger:
| Trigger | Scope | Method | Matches | Patched | Deferred | Remaining risk |
|---|---|---|---:|---:|---:|---|
| Missing covered packages | Completed Plate Next package plans and current `packages/` owners | Plan inventory versus manifest | 40 named reviewed/deferred owners | 39 | 1 | Table remains explicitly deferred |
| Bun mock pollution | Test files under all 42 targets | `rg -l 'mock\.module\('` | 23 | 23 isolated by runner | 0 | none |
| Foreign editor root handling | Plite editor identity and Node children access | owner-source audit plus focused runtime failures | 2 owner files | 2 | 0 | none after local/foreign split proof |
| Core generic block-void deletion | Override delete middleware and Suggestion failing contract | middleware-order source trace | 1 fallback extension | 1 | 0 | none |
| Incomplete isolated Core mocks | Selection module-mock specs | isolated reruns | 2 | 2 | 0 | none |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|---|---:|---|---|---|---|
| `tooling/scripts/check-core.mjs` | 0 | keep | tooling | 42/42 targets and full green gate | maintain manifest with completed reviews |
| `packages/plite/src/editor/is-editor.ts` | 0 | keep | Plite | proxy-safe foreign identity; local identity unchanged | none |
| `packages/plite/src/interfaces/node.ts` | 0 | keep | Plite | fast local children path and public foreign path | none |
| `packages/core/src/lib/plugins/override/OverridePlugin.ts` | 0 | keep | Core | Suggestion receives delete before generic fallback | none |
| Selection isolated mocks | 0 | keep | Selection tests | both singleton runs pass | none |
| Table | 4 | defer | Plate Plan | 166 rows already deferred with named missing contracts | execute owning plan later |

Work Checklist:
- [x] Explicit user requirements and boundaries captured before implementation.
- [x] Completed review inventory derived and compared with the gate manifest.
- [x] Expected 39, configured 39, missing 0, extra 0, total targets 42 recorded.
- [x] Table classified as deferred rather than falsely covered.
- [x] One manifest drives typecheck, lint, and test ownership.
- [x] Turbo dependency expansion prevented with `--only`.
- [x] Bun module mocks isolated by test file.
- [x] Plite, Core, and Utils artifacts rebuilt before reviewed package runtime tests.
- [x] Proven Plite cross-instance editor failure repaired without slowing local traversal.
- [x] Generic Core delete fallback ordered after feature middleware.
- [x] Incomplete Selection mocks preserve real Core exports.
- [x] Focused typecheck, lint, build, and tests pass after each owner repair.
- [x] Full `pnpm check:core` passes.
- [x] No export/barrel change; `pnpm brl` is not applicable.
- [x] Source Plate Next rule requires every completed review in the manifest; `pnpm install` synced the generated skill mirror.
- [x] No visual surface changed; Browser proof is not applicable.
- [x] Changed list, decisions, errors, risks, and final handoff are current.
- [x] Agent-native final review completed and accepted findings resolved.

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Inventory threshold | yes | Reviewed 39/39; missing 0; extra 0; Table deferred. |
| Shared Core coverage | yes | 42 package test-target headers in the final log. |
| Package/API proof | yes | Focused owner proof plus complete gate exit 0. |
| Broad Core ledger | no | Broad Core sweep was outside scope. |
| Package file checklist | no | No new package review occurred. |
| Source compatibility audit | yes | No compatibility alias or old public name was introduced. |
| Rename ledger | no | No names or paths changed. |
| Extracted file inventory | no | No extracted source file was created. |
| Agent source sync | yes | `.agents/rules/plate-next.mdc` changed and `pnpm install` synced `.agents/skills/plate-next/SKILL.md`. |
| Agent-native review | yes | Final reviewer result recorded in Verification evidence. |
| Final lint/check | yes | `pnpm check:core` exited 0. |

Changed list:
| Group | Current-run changes |
|---|---|
| Gate | 39 reviewed packages added to one 42-target manifest; `--only`; automatic lint/test ownership; module-mock isolation; Plite/Core/Utils artifact builds. |
| Runtime | Proxy-safe editor identity; fast local/public foreign Node children paths; Core delete fallback priority. |
| Tests | Selection mocks preserve actual Core React exports; existing package contracts corrected where the expanded gate exposed invalid assumptions. |
| Release contract | Duplicate patch changesets consolidated into the existing Core and Plite changesets so the release-contract test passes. |
| Reverted | Table migration fragments fully restored; only the user’s pre-existing Table edits remain. |
| Agent workflow | Plate Next source rule and generated skill mirror now require every completed review in `reviewedPackageSlugs` plus a green `check:core`. |
| Docs | This closure plan only. |

Decisions and tradeoffs:
- Table is excluded because its review is deferred, not because its current build is inconvenient.
- `--only` expresses exact gate ownership; a transitive build is not proof that a deferred package was reviewed.
- Artifact builds are deliberate here because reviewed feature tests import base package exports.
- Module mocks pay extra process startup cost for deterministic isolation.
- Foreign editor instances use public reads; local instances keep private runtime speed.
- Generic Core behavior has lower priority than feature behavior.

Error attempts:
| Failure | Count | Resolution |
|---|---:|---|
| Table entered through Turbo dependency traversal | 1 | Added `--only` to explicit typecheck targets. |
| Bun package-wide mock pollution | 1 class | Isolated all 23 `mock.module` files. |
| Foreign editor treated as an element | 1 class | Fixed proxy-safe editor identity. |
| Foreign editor routed into private runtime | 1 class | Split local fast path from public foreign path. |
| 125k Plite contract slowed by public reads | 1 | Restored local private-runtime fast path. |
| Selection isolated mocks omitted required exports | 2 files | Spread actual Core React exports before hook overrides. |
| Suggestion block-void deletion swallowed by Core | 1 | Lowered generic delete fallback middleware priority. |
| Feature tests consumed stale Core artifact | 1 | Added Core and Utils builds beside Plite. |

Verification evidence:
- `pnpm --filter @platejs/plite typecheck` passed.
- Plite `operations-contract.ts`: 28/28 passed; the 125,000-child row completed in about 3.3 seconds.
- List Classic: 124/124 passed.
- Selection isolated hook specs: 2/2 and 2/2 passed.
- Suggestion block-void deletion focused row passed after rebuilding Core.
- Final `pnpm check:core` exited 0, emitted 42 package test-target headers, emitted no failure lines, and completed at `@platejs/toggle`.
- Final agent-native review: one P2 discoverability finding accepted and fixed in the source rule; mirror sync verified; no remaining actionable finding.
- Browser: not applicable because no UI route or rendering surface changed.

Agent-Native Review:
- Verdict: PASS.
- User action: close a Plate Next package review.
- Agent route: `plate-next`.
- Source owner: `.agents/rules/plate-next.mdc`.
- Generated mirror: `.agents/skills/plate-next/SKILL.md`.
- Proof: `reviewedPackageSlugs` manifest, `pnpm check:core`, `pnpm install`, and source/mirror parity search.
- Accepted finding: P2 discoverability gap; the prior wording allowed agents to interpret manifest inclusion as Core-adjacent only.
- Fix: every completed package review must add its slug before closure; only deferred/blocked or explicitly excluded plans may omit it.
- Rejected findings: none.
- Needs attention: none.

Final handoff contract:
- Target: durable `check:core` coverage for every completed Plate Next package review.
- Coverage: 39 reviewed packages plus Core, Plite, and Utils; 42 total.
- Exclusion: Table remains explicitly deferred to its Plate Plan owner.
- Best shape: one exact manifest, deterministic mocks, fresh base artifacts, public foreign-editor boundary, feature-before-fallback middleware.
- Gaps: no blocking gap; Table’s existing gap remains deferred.
- Proof: focused owner gates and full `pnpm check:core` green.
- Needs attention: none for this closure.
- Next packet: the next genuinely unreviewed package; do not revisit covered packages or Table until its owner plan is accepted.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Final closure after a green 42-target gate. |
| Where am I going? | Reviewer, plan checker, goal completion, handoff. |
| What is the goal? | Keep every completed Plate Next review enforced by `check:core`. |
| What have I learned? | The missing gate exposed mock isolation, artifact freshness, cross-module editor identity, and middleware-order drift. |
| What have I done? | Closed inventory, repaired owners, and passed the full gate. |

Open risks:
- Table is intentionally not covered because its 166 review rows remain deferred to a named Plate Plan runtime boundary.
- Adding a future completed package still requires adding its slug to the manifest; the manifest then owns all phases automatically.

Timeline:
- 2026-07-14: Goal created, 39-package inventory closed, gate expanded, failures repaired, full 42-target proof passed, final review/checker completed.
