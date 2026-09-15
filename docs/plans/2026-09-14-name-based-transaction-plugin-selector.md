# Name-based transaction plugin selector

Use this file only when the task benefits from durable state. Task owns the
lifecycle under `.agents/rules/task/references/workflow.md`; apply the user's
standing Autogoal request for long-running work unless they opt out. Publication
retains its separate authority. Add only relevant domain
packs. A template is not a list of actions every task must perform.

Objective:
Replace computed transaction capability access such as
`tx[plugin.name].method()` with one name-based active-transaction selector,
`tx.plugin(pluginName).method()`, across raw Plite and Plate. Extend the existing
descriptor overload rather than replacing it: descriptor input remains the
typed nominal path, while name input is the intentionally decoupled path.
Remove the old public computed-group contract, migrate every first-party
caller, and align runtime, types, tests, Vision, reusable rules, and release
teaching.

Goal plan:
docs/plans/2026-09-14-name-based-transaction-plugin-selector.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- User request: "ok go cut all tx[plugin.name]" after selecting
  `tx.plugin(pluginName)` as the descriptor-free package boundary.
- Accepted correction: the existing nominal descriptor selector gains a plugin
  capability-name overload for package-decoupled callers. Both inputs reuse the
  active transaction and must not create a nested update or a second
  installed-plugin registry.

Completion threshold:
- Public transaction types and runtime expose both `tx.plugin(Plugin)` and
  `tx.plugin(name)` backed by the existing active transaction groups.
  Descriptor input preserves exact inference and nominal validation; literal
  names infer from the transaction's known groups, while widened names use the
  explicit erased path.
- First-party production, test, docs, and rule call sites contain no computed
  plugin-group access (`tx[*.name]`) and no separate descriptor transaction
  portal.
- Missing installed names fail through the existing guarded-group behavior;
  widened strings receive only the intentionally erased compatibility surface.
- Raw Plite and Plate share the same selector semantics without adding a
  cross-package descriptor dependency.
- Focused runtime, type, package, doctrine-generation, and stale-surface checks
  pass, with required release artifacts updated if the public package delta
  requires them.

Verification surface:
- `packages/plitejs/src/interfaces/editor.ts` and transaction materialization:
  focused Plite transaction tests plus `@platejs/plite` typecheck/build owner.
- `packages/platejs/src/lib/editor/withPlite.slow.ts`, feature callers, and
  `packages/platejs/type-tests/**`: focused Core runtime/type proof and Core
  package build/typecheck.
- `docs/vision/{plate,plite}.md`, `.agents/rules/**`, generated skill mirrors:
  stale-call audit, `pnpm install`, mirror/source validation, and Agent Native
  Reviewer method.
- Package release surface: affected changesets and release-artifact checks.

Constraints:
- Preserve package independence: the transaction selector accepts a capability
  name and does not require importing a foreign plugin descriptor. Keep the
  existing descriptor overload for callers that already own the descriptor.
- Preserve one active transaction, rollback, history, schema fitting, guarded
  installed-group lookup, and exact literal-name inference.
- Keep type erasure confined to the widened-name overload and runtime boundary;
  do not weaken descriptor or literal-name inference or reintroduce a second
  transaction registry.
- Work in the authorized current checkout on `next`; no commit, push, PR,
  release, registry generation, or external publication was requested.

Boundaries:
- Plite owns transaction construction, group lookup, and public transaction
  types. Plate owns feature adoption and framework-facing inference proof.
- Vision and `.agents/rules/**` own durable doctrine; generated `SKILL.md`
  mirrors are regenerated, never edited directly.
- Existing editor-level `editor.plugin(Plugin)` remains descriptor-only and is
  outside this migration.

Timing:
- N/A.

Blocked condition:
- Three distinct owner-level attempts show that a name-keyed selector cannot
  preserve active-transaction semantics and literal-name inference without a
  second registry or descriptor dependency, and no useful migration/proof work
  remains.

Task state:
- current_phase: closure
- next: none
- status: complete

Work Checklist:
- [x] Every applicable user, method, reference and template obligation maps to a source-linked row here or an existing linked ledger; exclusions have reasons.
- [x] Final reconciliation against the original checklists found no omitted requirement; evidence and applicable semantic/completion checks cover the full scope.
- [x] Capture the full outcome, acceptance criteria, scope and actual authority.
- [x] Inspect the named source, current owners and relevant evidence.
- [x] Make the change at its durable owner and adopt every affected consumer.
- [x] Run applicable proof and resolve verified in-scope findings.
- [x] Record the final outcome, evidence, material limits and next action.

Decisions and tradeoffs:

| Decision | Owner and source | Chosen fix | Material alternative rejected | Proof |
| --- | --- | --- | --- | --- |
| Transaction capability selection | User correction; Plite transaction-group owner | One overloaded `tx.plugin(pluginOrName)` selector: descriptor is typed/nominal, name is decoupled; both return the existing active group | `tx[name]` leaks the storage shape; separate selectors duplicate the job | Runtime/type tests and zero stale computed callers |
| Dynamic typing | Plite and Plate transaction types | Preserve exact methods for descriptors and known literal names; confine erasure to widened name input | Making every name lookup dynamic would discard available group inference | Positive type contracts and runtime missing-name proof |
| Runtime ownership | Plite transaction materialization | Reuse one guarded group map and active transaction | A Plate projection hook or nested one-shot update duplicates ownership | Rollback/missing-group runtime tests |

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Name selector runtime and types | pass | Plite source plus focused transaction/type proof | 9 portal tests; contracts, package typecheck and build pass |
| Complete caller migration | pass | bounded repository source audit | zero computed plugin-name transaction indexes outside immutable history |
| Plate feature and broad-editor inference | pass | focused Core tests/type contracts/build | 120 feature tests; contracts, 85-partition typecheck, core lint and build pass |
| Vision and reusable workflow doctrine | pass | source edits, `pnpm install`, mirror and agent-native checks | generated mirrors exact; Plate Next v193 validates; Agent Native Review PASS |
| Public package release contract | pass | changeset/release-artifact owner checks | existing major changesets updated; `pnpm changeset status` passes |
| Self-review | pass | inspect final diff; Autoreview N/A on `next` | targeted Ultracite and `git diff --check` pass |

Select proof from the actual change. Verify Plate owns package, browser,
native-device, CLI and artifact claims; Testing owns test value. Generated
skills use the source generator. Public API adoption, registry/changelog,
security and release mechanics stay with their domain owners. Link their
existing receipts here instead of copying their full checklists.

Task's shared review budget applies only to an explicit review request or
actual PR closeout and never runs Autoreview on `next`. A budget cap does not
end useful authorized repairs. Record an actual review or its N/A reason.
For authorized PRs use the real repository template and Task's PR-body contract.
For authorized tracker messages read back the result. Neither follows merely
from creating this file.

Verification evidence:

- `pnpm --filter plitejs test:bun -- test/plugin-portal.test.ts`: 9 passed.
- `pnpm --filter plitejs typecheck:contracts`, package `typecheck`, and
  `build`: passed.
- `pnpm --filter platejs test -- BaseComboboxPlugin.spec.ts BaseFootnotePlugin.spec.ts BaseLinkPlugin.spec.tsx BaseTablePlugin.presentation.spec.tsx`:
  120 passed.
- `pnpm --filter platejs typecheck:contracts`, package `typecheck`,
  `lint:partition:core`, and `build`: passed.
- Targeted Ultracite checks for every changed TypeScript file passed. The full
  Plite lint reached an unrelated pre-existing format error in
  `packages/plitejs/src/authored/retained.ts`; no file in this migration
  failed its targeted lint.
- `pnpm --filter www build:source`, `pnpm changeset status`,
  `version.mjs validate`, `sync-resources.mjs --check`, the stale-call
  source audit, and `git diff --check`: passed.

Findings and remaining work:

- Name-based access is capability selection after installation. It deliberately
  does not claim nominal descriptor identity.
- Literal names retain exact group inference. Widened Plate names use the
  explicitly untyped command surface requested for open package boundaries;
  widened raw Plite names use a callable dynamic tree returning `unknown`.
- Historical plans, artifacts, and immutable doctrine versions retain their
  original computed-index examples as evidence. Current source, docs, Vision,
  rules, and generated mirrors contain no such call sites.

Final handoff:

- Outcome and owning fix: Plite owns one overloaded
  `tx.plugin(pluginOrName)` runtime selector; Plate projects exact literal-name
  inference and the open-name fallback. All former computed callers use it.
- Proof and limits: runtime, type, lint, build, docs, doctrine, release and stale
  source checks pass; only the unrelated full-Plite-lint formatting issue noted
  above remains outside scope.
- Local / integrated / published state: complete in the authorized current
  checkout; no commit, push, PR or release was requested.
- Next action or completion: complete.

Timeline:

- 2026-09-14T08:24:02.108Z Plan created.
- 2026-09-14: User accepted a `tx.plugin(pluginName)` overload beside the
  descriptor form and authorized removing all computed
  `tx[plugin.name]` access.
- 2026-09-14: Plite runtime/types, Plate inference, first-party callers, docs,
  Vision, changesets and workflow doctrine migrated; Plate Next v193 appended
  and all applicable proof closed.

Open risks:

- The existing direct-group collision surface remains unchanged. A plugin named
  `plugin` is explicitly covered by runtime proof for descriptor, name and
  direct-group access.
