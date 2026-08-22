# Re-enable audited Oxlint rules

Objective:
Re-enable every audited high-value Oxlint rule, repair its diagnostics without
count-based or style-only disables, and finish with the repository check green.

Goal plan:
`docs/plans/2026-08-20-re-enable-audited-oxlint-rules.md`

Task source:
- Direct user request in the current Codex task.
- Acceptance: enable the 14 accepted rules at the correct scope, use no
  exact-file config overrides, keep shared test exceptions structural and
  repository-wide, justify isolated production exceptions inline, and pass
  lint, config audit, typecheck, tests, root check, and P1 review.

Completion threshold:
All 14 accepted rules are active at their agreed production/test scope. Every
diagnostic is fixed or has a narrow documented exception. The final lint,
www typecheck, repository check, repository-owned config audit, plan audit, and
migration-scoped P1 reviews pass.

Verification surface:
Oxlint configuration structure, safe fixer idempotence, lint, package and app
typechecks, tests, `pnpm check`, stale-disable search, registry closure, and P1
autoreview of the migration-owned changes.

Constraints:
- Preserve runtime and public API behavior outside this static-analysis task.
- Never disable a rule because it produces many diagnostics or expresses style.
- Use no exact-file config overrides. Test exceptions use unified test globs.
- Prefer a real fix. Use inline suppression only for a precise invariant with
  an explanation.
- Do not edit CI-controlled `templates/**`.
- Do not create a commit, branch, push, PR, or tracker update.

Boundaries:
- Source of truth: `oxlint.config.ts`, Ultracite policy, repository-owned config
  audit, and current diagnostics.
- Edit scope: config and source/test/tooling files affected by the 14 accepted
  rules. Unrelated dirty-tree features are review findings, not migration work.
- Browser surface: N/A because this is static-analysis configuration and
  behavior-preserving code cleanup.
- Excluded rules: `no-shadow`, `no-empty-function`,
  `typescript/no-unnecessary-condition`, `typescript/no-explicit-any`,
  `import/no-cycle`, `typescript/prefer-nullish-coalescing`, and unrelated
  React architecture/performance changes.

Blocked condition:
Block only after the same external or tooling failure prevents progress for
three consecutive goal turns after safe alternatives and the documented
reinstall retry are exhausted. No such blocker occurred.

Timed checkpoint:
- Duration: N/A; the user set a completion threshold, not a time limit.
- Initial confidence: 82%.
- Final confidence: 98%; all migration gates pass. The remaining 2% is the
  ordinary risk of a repository-wide mechanical cleanup, not an open failure.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | The 14 rules, scope limits, proof commands, and handoff requirements are recorded below. |
| Skills read | yes | Read `task`, `autogoal`, `migrate-to-ultracite`, and `autoreview` before their respective actions. |
| Active goal | yes | The active goal points to this plan. |
| Source of truth read | yes | Read the migration playbook, current config, diagnostics, and repository audit script. |
| Tracker or video evidence | N/A | No tracker, attachment, or video belongs to this task. |
| Browser decision | N/A | No browser-facing behavior was intentionally changed. |
| Branch, commit, PR, or release action | N/A | The user requested local implementation and proof only. |
| Output discipline | yes | Broad diagnostics were saved or summarized with capped command output. |

Explicit requirements checklist:
- [x] Enable and fix `typescript/consistent-return` without relying on
      `noImplicitReturns`.
- [x] Enable `typescript/no-non-null-assertion` in production and keep only the
      unified test-pattern exception.
- [x] Enable `typescript/ban-ts-comment` in tests and describe retained
      directives.
- [x] Enable `typescript/no-misused-promises` in tests and repair intentional
      async boundaries without broad or exact-file exceptions.
- [x] Enable `typescript/no-unnecessary-type-assertion` everywhere.
- [x] Enable `accessor-pairs` and repair or structurally justify the mock.
- [x] Enable and fix `no-param-reassign`.
- [x] Configure `typescript/consistent-type-imports` with
      `disallowTypeAnnotations: false` and `fixStyle: inline-type-imports`.
- [x] Enable `no-new`; retain only precise inline intent where construction is
      itself the validation operation.
- [x] Enable `no-alert`; retain only precise inline intent for native dialogs.
- [x] Enable `no-unreachable-loop` in tests and repair the iterator fixture.
- [x] Enable `typescript/no-unnecessary-type-arguments` in production and keep
      only the unified test-pattern exception.
- [x] Enable `typescript/no-unnecessary-template-expression` everywhere.
- [x] Enable `no-lone-blocks` globally and keep only the unified test-pattern
      exception.
- [x] Never disable a rule because of diagnostic count or style preference.
- [x] Add no exact-file config override; all test handling uses one repository-
      wide test selector.
- [x] Preserve runtime behavior and do not edit `templates/**`.
- [x] Finish with lint, config audit, typecheck, tests, `pnpm check`, stale-
      disable audit, and P1 autoreview evidence.

Work Checklist:
- [x] Prompt scope, non-goals, timing, stop condition, deliverables, handoff,
      verification, and success criteria were captured before implementation.
- [x] Objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Nearby instructions and the owning config patterns were read first.
- [x] Fixes were made at the owning boundary; local helpers remain private and
      unified test policy remains repository-wide.
- [x] Release artifact is N/A: no intended package behavior or public API
      change; an accidentally weakened existing generic API was restored.
- [x] Branch handling is N/A: no branch, commit, push, or PR was requested.
- [x] Local environment reinstall is N/A: failures traced to source changes,
      not install corruption.
- [x] Workspace authority is the repository root plus owning package/app
      commands recorded under Verification evidence.
- [x] High-risk runtime and API regressions introduced by aggressive automated
      suggestions were identified, repaired, and covered by tests/typechecks.
- [x] P1 review used actual local changes, split by ownership to stay within the
      helper pass budget.
- [x] Agent-native review is N/A: no `.agents/**`, skill, hook, command, or
      user-action tooling source was changed by this task.
- [x] Broad command output was capped or summarized.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Final lint, www typecheck, root check, config audit, and plan audit pass. |
| Bug reproduction | N/A | This was a diagnostic-driven migration; the initial Oxlint diagnostics were the failing proof. |
| Targeted behavior proof | yes | Focused package typechecks/tests and the full 3,243-test run pass. |
| TypeScript and typed config | yes | Owning package typechecks, www typecheck, and root check pass. |
| Package exports or public file layout | N/A | New narrowing helpers are private and unexported; no barrel change applies. |
| Manifest, lockfile, or install graph | N/A | None changed for this task. |
| Agent rules or skills | N/A | None changed for this task. |
| Workspace authority | yes | Commands ran from `/Users/zbeyens/git/plate-2` or via the owning package filter. |
| Browser proof | N/A | No browser surface change; static and runtime test proof is the correct lane. |
| CI-controlled templates | yes | `templates/**` was not edited. |
| Changeset | N/A | No intended package behavior or public API change. |
| Registry changelog | N/A | No registry feature or component behavior change. |
| Docs rendering | N/A | Only this execution ledger and an internal release prompt placeholder changed. |
| High-risk mini gate | yes | Nullable caches, DOM boundaries, exhaustive switches, React anchors, and generic hook APIs were specifically reviewed and repaired. |
| Agent-native review | N/A | No agent/tooling doctrine source changed. |
| Local install corruption | N/A | No matching corruption signal occurred. |
| P1 autoreview | yes | Migration-owned scopes reran clean after accepted fixes; unrelated dirty-tree findings are recorded below. |
| PR and tracker work | N/A | No PR or tracker mutation was requested. |
| Final lint | yes | Final `pnpm lint` passes; safe fix mode is idempotent. |
| Output budget | yes | High-volume outputs were capped and findings summarized. |
| Timed checkpoint | N/A | No duration was requested. |
| Goal plan audit | yes | The final autogoal checker command is recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Requirements, skills, config, and diagnostics read | implementation |
| Implementation | completed | All 14 rules enabled and diagnostics repaired | verification |
| Verification | completed | Final repository gates pass | closeout |
| PR / tracker sync | N/A | No external mutation requested | closeout |
| Closeout | completed | Review and evidence ledger complete | final response |

Findings:
- The previous config had policy debt: several valuable correctness rules were
  disabled broadly, and exact-file exemptions would have hidden ownership.
- Aggressive Oxlint suggestion fixes are not behavior-safe. They introduced
  nullable-cache throws, removed a public generic contract, and created eager
  UI invariants. Each regression was repaired before closure.
- The generic global migration checker is older than this repository policy: it
  requires `consistent-return` and production non-null assertions to stay off
  and does not model this repository's unified test override. The repository-
  owned structural checker is authoritative and green.

Decisions and tradeoffs:
- Keep only three unified test exceptions: `no-lone-blocks`,
  `typescript/no-non-null-assertion`, and
  `typescript/no-unnecessary-type-arguments`.
- Keep `CreateEditorView` and Plite hook generic inference intact instead of
  silencing callers with casts.
- Use local unexported `getDefined` helpers where an internal map invariant is
  real; preserve `null` where it represents a legitimate cache miss.
- Stop using suggestion-grade autofixes after they proved semantically unsafe;
  use safe fixes plus reviewed manual repairs.

Implementation notes:
- Removed root disables for all 14 accepted rules and configured consistent
  type imports as requested.
- Removed test disables for ban comments, misused promises, and unreachable
  loops. No exact-file config overrides were added.
- Repaired exhaustive control flow, parameter mutation, assertions, async test
  boundaries, native dialog intent, type imports, and template expressions.
- Restored runtime behavior at nullable caches, DOM event boundaries, React
  anchor timing, workload selection, schema wrappers, and Plite public generic
  inference.
- Refreshed the generated API reference through its owning command after the
  www typecheck detected stale output.

Review fixes:
- Plite review: restored `useElement` / `useOptionalElement` public generics;
  the rerun was clean.
- www review: repaired workload fallthrough and two eager anchor assertions;
  the rerun was clean.
- Misc review: repaired the release prompt placeholder; the migration/config
  rerun was clean.
- Package review: repaired the `CAN_USE_DOM` null guard. The migration-owned
  package scope is green; the helper's three-invocation cap was respected.

Unrelated P1 follow-ups:
- Two staged render-wrapper findings: `renderPath` is omitted for one
  `belowNodes` path, and the static renderer does not support the new
  `{ component, match }` `aboveNodes` descriptor.
- Four staged regression-validator findings: placeholder pass values are
  accepted, receipts are not bound to selected proof, corpus replay evidence
  is not bound to cases/command, and the failed-fix architecture trigger is not
  reconciled.
- One staged selection finding: a document-level `selectionchange` listener
  clears selection globally while block selection is active.
- One staged resizable finding: a touchmove listener is passive although its
  semantics require `preventDefault()`.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|------------------------|-------|----------------|------------|
| Whole dirty-tree autoreview exceeded the eight-pass bundle cap | 1 | Split review by owning scope | Migration scopes completed within their per-scope limits. |
| `oxlint --fix-suggestions -A all` introduced semantic/type regressions | 1 | Stop suggestion fixes and manually audit affected categories | All migration regressions repaired; final tests and checks pass. |
| Generic migration strict checker rejects the repository's newer policy | 1 | Use the repository-owned structural checker | Repo checker passes; accepted rules remain enabled. |

Verification evidence:
- `pnpm lint`: pass on the finished tree.
- `pnpm --filter www typecheck`: pass, including editor check, API reference
  check, docs source, registry closure, app TypeScript, and package integration.
- `pnpm test`: 3,243 tests pass, zero failures.
- `pnpm check`: pass on the finished tree.
- `pnpm --filter @udecode/react-utils typecheck`: pass.
- `pnpm --filter @udecode/react-utils test`: 26 pass.
- `pnpm --filter @platejs/plite-react typecheck`: pass.
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/browser typecheck`: pass.
- `node tooling/scripts/check-oxlint-config.mjs`: final pass recorded during
  closeout; 181 root rules and 355 selector/rule pairs.
- P1 autoreview: Plite rerun clean; www rerun clean; scoped misc rerun clean;
  accepted package migration findings fixed. Eight unrelated dirty-tree P1s
  remain explicitly listed above.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-20-re-enable-audited-oxlint-rules.md`: final pass recorded
  during closeout.

Final handoff contract:
- PR: N/A; none requested or created.
- Issue / tracker: N/A; none exists for this task.
- Confidence: 98%.
- Reproduced: initial Oxlint diagnostics; browser N/A.
- Verified: lint, config structure, typechecks, 3,243 tests, root check, and
  migration-scoped P1 review.
- Browser check: N/A; no browser surface changed.
- Outcome: all 14 accepted rules are enabled at their intended scope with no
  count/style disable and no exact-file config override.
- Caveat: eight real P1 findings in unrelated staged work remain for their
  owners; none is hidden or attributed to this migration.
- Design: correctness rules stay enabled; unified test exceptions express test
  structure; precise runtime invariants live in code rather than config.
- PR body verification: N/A; no PR was created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final handoff |
| What is the goal? | Enable and repair all 14 audited Oxlint rules without weak policy exceptions |
| What have I learned? | Suggestion autofixes require semantic review; repository policy is stricter than the generic baseline |
| What have I done? | Enabled the rules, repaired diagnostics and regressions, ran final checks, and recorded review findings |

Open risks:
- No open migration failure. Eight unrelated dirty-tree P1 findings remain
  listed under Unrelated P1 follow-ups and were not silently folded into this
  tooling task.

Timeline:
- 2026-08-20: Goal plan created and requirements captured.
- 2026-08-21: All 14 rules enabled; diagnostics and autofix regressions repaired.
- 2026-08-21: Final lint, typecheck, tests, root check, config audit, and review
  closure completed.
