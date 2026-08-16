# restore plate editor geometry contracts

Objective:
Restore floating and cursor geometry helpers to their public `PlateEditor`
owner. Completion requires both fake editor aliases and stale direct DOM-package
dependencies to be gone without changing runtime geometry behavior.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-16-restore-dom-editor-geometry-contracts.md

Template:
docs/plans/templates/task.md with the package-api pack

Task source:
- type: direct user correction
- id / link: N/A: no tracker item
- title: Remove redundant geometry editor aliases
- acceptance criteria: delete `GeometryEditor` and `CursorGeometryEditor`; use
  the existing public editor type that honestly owns these Plate-only helpers;
  preserve runtime behavior; prove both packages; close P2 review.

Completion threshold:
Both local structural editor aliases, redundant editor generics, and direct
`@platejs/plite-dom` dependencies have zero matches in the two package owners.
All exported geometry helpers accept `PlateEditor`. Floating and cursor
typechecks, focused tests, builds, emitted declarations, scoped lint, source
audit, and exact-patch P2 autoreview pass. The autogoal completion checker must
also pass before the active goal is closed.

Verification surface:
- `pnpm install`
- `pnpm turbo typecheck --filter=./packages/floating --filter=./packages/cursor`
- `pnpm --filter @platejs/floating test`
- `pnpm --filter @platejs/cursor test`
- `pnpm turbo build --filter=./packages/floating --filter=./packages/cursor`
- scoped Biome, diff check, source audit, and emitted declaration audit
- `best-api repair` doctrine audit
- exact source/manifest/lockfile P2 autoreview

Constraints:
- Preserve runtime geometry behavior.
- Fix the owning public type instead of adding another local structural alias.
- Do not widen `DOMEditor` or change unrelated editor contracts.
- Do not commit, push, create a PR, or mutate a tracker.

Boundaries:
- Source of truth: the user correction, current callers, public editor types,
  Plate core plugin installation, the exact local diff, and the completed
  2026-07-12 floating geometry cleanup plan.
- Allowed implementation scope: `packages/floating/src/geometry.ts`,
  `packages/cursor/src/cursorGeometry.ts`, their package manifests, and the
  corresponding lockfile importer entries.
- Planning scope: this goal plan plus an owning rule/Vision/worker only if the
  required `best-api repair` audit proved current doctrine stale.
- Browser surface: N/A: the patch changes TypeScript declarations and dependency
  edges only; mounted DOM tests own the unchanged runtime behavior.
- Tracker and PR scope: N/A: no public mutation was requested.
- Non-goals: runtime geometry changes, new behavior, export/file moves,
  `DOMEditor` redesign, unrelated cleanup, commit, push, or PR creation.

Blocked condition:
Stop only if the existing public Plate editor owner cannot express the helper
contract without changing runtime behavior or requiring a broader public API
decision. No such blocker remains.

Task state:
- task_type: public type-contract cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final handoff
- goal_status: ready for completion

Current verdict:
- verdict: delete both fake aliases and use `PlateEditor`
- confidence: 99%, backed by callers, declarations, package proof, and P2 review
- owner: `@platejs/core/react` `PlateEditor`
- reason: every production caller supplies a Plate editor, Plate core installs
  DOM by default, and no helper returns an editor-dependent generic type.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Alias hard cut, owner decision, behavior preservation, proof, and no public mutation were recorded. |
| Timed checkpoint parsed | no | N/A: no duration was requested. |
| Required skills loaded | yes | Loaded `autogoal`, `task`, `best-api`, `changeset`, and `autoreview`. |
| Active goal created | yes | Goal names the alias cleanup, package proof, P2 gate, and this plan. |
| Source of truth read | yes | Read both modules and callers, Plite/DOM/Plate editor types, core plugins, prior plan, and current doctrine. |
| TDD decision | no | N/A: type-only owner repair with unchanged behavior; existing mounted geometry tests provide regression proof. |
| Browser decision | no | N/A: no runtime or rendered surface changed. |
| Branch, PR, and tracker decision | no | N/A: current checkout only; no commit, PR, or tracker mutation requested. |
| Package/API pack selected | yes | Exported helper parameter types and direct package dependencies changed. |
| Release artifact decision | yes | No changeset: this cleanup creates no separate user-visible package delta from `main`; the consolidated branch-owned files are absent there. |
| Barrel impact decided | no | N/A: no export or file layout change. |

Work Checklist:
- [x] Captured every explicit requirement, boundary, proof surface, stop
      condition, deliverable, and final-handoff field before closeout.
- [x] Read the actual callers and public editor owners before choosing the type.
- [x] Removed `GeometryEditor` and `CursorGeometryEditor`.
- [x] Rejected generic raw `DOMEditor` after a real layered caller typecheck
      failure; recorded the failure and chose the honest Plate owner.
- [x] Changed exported geometry helper editor parameters to `PlateEditor`.
- [x] Removed redundant value/extension generics and stale imports.
- [x] Removed unused direct `@platejs/plite-dom` dependencies and regenerated
      only their lockfile importer entries with `pnpm install`.
- [x] Audited public declarations and verified runtime geometry logic is unchanged.
- [x] Ran package-owned typecheck, tests, and build in
      `/Users/zbeyens/git/plate-2`.
- [x] Ran scoped Biome, diff check, and rejected-shape source audit.
- [x] Applied package release-artifact classification; no changeset is needed
      because this cleanup has no separate released-package delta from `main`.
- [x] Recorded compatibility decision: hard-cut the uncommitted fake aliases;
      no compatibility layer or migration note.
- [x] Ran `best-api repair`: existing rule, Plate Vision, plugin-owner, and
      Plate-next doctrine already prohibit this one-off editor shape.
- [x] Recorded agent-native review as N/A: no agent rule, skill, prompt, hook,
      command, or generated mirror changed.
- [x] Ran exact-patch P2 autoreview and closed with zero findings.
- [x] Recorded local environment policy: N/A; no install-corruption signal
      occurred, so `pnpm run reinstall` was not warranted.
- [x] Kept all exploration and command output bounded to exact owners and files.
- [x] Recorded final handoff, PR, tracker, browser, risk, and caveat fields.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Every command and audit in Verification evidence passed. |
| Bug reproduced before fix | yes | Generic `DOMEditor<V, TExtensions>` failed both package typechecks at the layered Plate callers; local aliases were proven uncommitted duplicates. |
| Targeted behavior verification | yes | Floating 25 tests and cursor 14 tests passed with no runtime edits. |
| TypeScript changed | yes | Combined package typecheck passed 12 of 12 tasks. |
| Package manifests and lockfile changed | yes | `pnpm install` succeeded; exact diff removes two unused importer edges. |
| Package build and declarations | yes | Combined build passed 12 of 12 tasks; emitted helpers accept `PlateEditor`. |
| Package exports or file layout changed | no | N/A: no barrel or path change; `pnpm brl` is unnecessary. |
| Package public type changed | yes | No changeset: there is no separate user-visible delta from `main`; this repairs uncommitted branch-local migration work. |
| Browser surface changed | no | N/A: type declarations and dependency edges only; no runnable UI behavior changed. |
| Agent rules or skills changed | no | N/A: doctrine was reaffirmed without source or generated mirror edits. |
| High-risk mini gate | yes | Failure mode was rejecting layered Plate callers; typecheck, emitted declarations, callers, tests, and build prove the chosen Plate owner. |
| P2 autoreview | yes | Exact isolated five-file patch reviewed with Codex Sol high; clean with 0.99 correctness and no P0-P2 findings. |
| Final lint | yes | Scoped Biome checked four changed source/manifest files with no fixes needed. |
| Diff and source audit | yes | `git diff --check` passed; rejected aliases and direct DOM dependency have zero scoped matches. |
| PR create or update | no | N/A: no PR requested. |
| Tracker sync | no | N/A: no tracker target. |
| CI template output | no | N/A: no template file changed. |
| Registry changelog | no | N/A: no registry file changed. |
| Timed checkpoint | no | N/A: no duration requested. |
| Output budget discipline | yes | Searches, diffs, review, and proof were file-scoped and output-capped. |
| Final handoff contract | yes | Exact outcome, tests, browser decision, design, caveat, and public-mutation status are recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Public types, callers, plugin chain, prior plan, and doctrine inspected | implementation |
| Implementation | complete | PlateEditor parameters and dependency cleanup applied | verification |
| Verification | complete | Install, 39 tests, typecheck, build, declarations, lint, audit, and review passed | closeout |
| PR / tracker sync | complete | N/A: no public mutation requested | closeout |
| Closeout | complete | Final plan receipts recorded | final response |

Findings:
- The local `GeometryEditor` and `CursorGeometryEditor` aliases duplicated a
  public editor contract and leaked method-level structural typing into exports.
- Restoring generic `DOMEditor<V, TExtensions>` does not typecheck against
  layered `PlateEditorWithStore` callers because `DOMEditor` reconstructs the
  raw Plite editor read surface.
- Every production caller is Plate-owned, and Plate core installs DOM and React
  plugins by default. `PlateEditor` is the honest product owner.
- These helpers return no editor-dependent type, so value/extension generics
  provide no inference benefit.
- The final type owner makes both direct `@platejs/plite-dom` dependencies unused.

Decisions and tradeoffs:
- Use `PlateEditor`, not `DOMEditor<any, any>`. The latter hides a layered type
  mismatch with `any` and misstates Plate-only helpers as raw Plite utilities.
- Use `PlateEditor`, not local structural aliases. One existing public owner is
  clearer and produces simpler declarations.
- Do not widen `DOMEditor`; its raw Plite role is valid, and changing it would
  expand this cleanup into a separate cross-layer API decision.
- Hard-cut the uncommitted aliases. No compatibility or migration layer is useful.
- Reaffirm existing `best-api` doctrine; no Vision, rule, worker, doctrine
  version, or generated mirror edit is needed.

Implementation notes:
- `packages/floating/src/geometry.ts` imports `PlateEditor` from
  `@platejs/core/react` and uses it on all four editor-facing helpers.
- `packages/cursor/src/cursorGeometry.ts` uses `PlateEditor` on
  `getSelectionRects`.
- Both manifests and lockfile importers drop the unused direct DOM package.
- Runtime statements and geometry algorithms are unchanged.

Review fixes:
- None. The first and final P2 review returned zero accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Generic `DOMEditor<V, TExtensions>` rejected at layered Plate callers | 1 | Trace the product caller owner instead of weakening with `any` | `PlateEditor` passed both package typechecks and declarations. |
| First isolated review staging command ran `git archive` from the empty temp directory | 1 | Use `git -C /Users/zbeyens/git/plate-2 archive` | Fresh isolated review repository created; review passed; both temp directories moved to Trash. |

Verification evidence:
- cwd: `/Users/zbeyens/git/plate-2`.
- `pnpm install`: passed and removed only the two direct DOM importer entries
  from the relevant lockfile sections.
- combined floating/cursor Turbo typecheck: 12/12 tasks passed.
- floating tests: 25 passed, 0 failed.
- cursor tests: 14 passed, 0 failed.
- combined floating/cursor Turbo build: 12/12 tasks passed.
- emitted declarations: every affected helper accepts `PlateEditor`; neither
  fake alias nor generic `DOMEditor` is emitted.
- scoped Biome: 4 files checked, no fixes needed on final pass.
- scoped `git diff --check`: passed.
- source audit: zero matches for either fake alias or direct DOM dependency in
  the two package owners.
- autoreview command: `.agents/skills/autoreview/scripts/autoreview --mode local
  --max-priority P2 --prompt <scoped invariant>` in an isolated exact-patch repo.
- autoreview result: clean, no accepted/actionable findings; correctness 0.99.
- Browser: N/A: no runtime or rendered surface changed.

Final handoff contract:
- PR: N/A: not requested and not created.
- Issue / tracker: N/A: no target and no mutation requested.
- Confidence: 99%.
- Flow table:
  - Reproduced: generic raw `DOMEditor` failed layered Plate caller typechecks;
    Browser N/A.
  - Verified: 39 tests, 12/12 typecheck tasks, 12/12 build tasks, declarations,
    lint, source audit, and P2 review passed; Browser N/A.
- Outcome: exported geometry helpers use the existing Plate editor owner; fake
  structural aliases, redundant generics, and stale direct DOM dependencies are gone.
- Caveat: no changeset was added because this is branch-local migration repair
  with no separate package delta from `main`.
- Design:
  - Chosen boundary: `PlateEditor`, the actual editor product used by every caller.
  - Why not quick patch: another local structural alias would preserve duplicate ownership.
  - Why not broader change: widening raw `DOMEditor` is unnecessary and changes a different layer.
- Verified: package proof and final P2 review are green.
- PR body verified: N/A: no PR exists.

Final handoff / sync:
- PR: N/A: not created.
- Issue / tracker: N/A: none.
- Browser proof: N/A: type-only public contract cleanup.
- Caveats: no runtime, release, or public-mutation work remains.

Timeline:
- 2026-08-16T07:57:44.063Z: goal plan created.
- 2026-08-16T10:04:30+02:00: implementation, package proof, doctrine audit,
  exact-patch P2 review, and closeout receipts completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Validate this plan, close the active goal, and hand off. |
| What is the goal? | Restore geometry helpers to the honest public Plate editor owner. |
| What have I learned? | Raw generic `DOMEditor` does not model layered Plate callers; `PlateEditor` does. |
| What have I done? | Removed aliases and stale dependencies; install, typecheck, tests, build, declarations, lint, audit, and P2 review all pass. |

Open risks:
- None within scope. The remaining broader question of raw `DOMEditor`
  cross-layer assignability belongs to a separate API decision and is not needed
  by these Plate-only packages.
