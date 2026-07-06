# plite soft break newline semantics

Objective:
Make Plite soft break insert newline text; done when Plite/Utils focused tests
and typecheck pass.

Goal plan:
docs/plans/2026-07-05-plite-soft-break-newline-semantics.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Completion threshold:
- `tx.break.insertSoft()` and `editor.update.break.insertSoft()` insert a text
  newline in normal text flow.
- `SingleBlockPlugin` no longer needs a local `insertSoftBreak` override.
- Plite and Utils focused behavior tests pass.
- Plite and Utils typecheck passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plite-soft-break-newline-semantics.md` passes.

Verification surface:
- Source audit: Plite `insert-soft-break` implementation and SingleBlock
  override removal.
- Focused Plite tests for soft-break/transaction/extension behavior.
- Focused Utils single-block/single-line tests.
- Package typecheck for `packages/plite` and `packages/utils`.
- No browser proof: this is model/runtime behavior with existing focused test
  ownership, not a rendered route change.

Constraints:
- Keep Plite unopinionated: soft break inserts newline text; product plugins
  should not duplicate this core semantic.
- Preserve block-void special behavior if focused tests prove it still matters.
- Do not broaden into Plate package migration.
- Do not add compatibility aliases.
- Do not edit docs unless source proof shows docs need immediate correction.

Boundaries:
- Allowed source edits:
  - `packages/plite/src/editor/insert-soft-break.ts`
  - focused Plite tests under `packages/plite/test/**`
  - `packages/utils/src/lib/plugins/single-block/**`
  - this plan
- Allowed commands: focused Bun tests, package typecheck, exact source audits,
  final `check-complete`.
- Out of scope: broad Plate migration, browser matrix, docs rewrite, public
  package release wiring.

Blocked condition:
- Stop only if changing Plite soft-break semantics breaks a proven Plite
  invariant that cannot be preserved without a new API fork.

Plite Plan lane state:
- plite_plan_lane_status: complete
- current_pass: closed execution
- current_pass_status: complete
- next_pass: none
- next_action: handoff
- final_handoff_status: ready

Current verdict:
- verdict: `tx.break.insertSoft()` should insert newline text by default.
- confidence: 0.95.
- keep / cut / revise call: revise Plite; cut duplicate SingleBlock override.
- reason: `insertBreak` owns structural block split; soft break should be a
  line break inside the current text flow.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `plite-plan` and `autogoal` skills. |
| Active goal checked or created | yes | `get_goal` returned none; created goal for this packet. |
| Source of truth read before edits | yes | Read current Plite `insert-soft-break`, transaction/snapshot tests, upstream Slate equivalent, and SingleBlock plugin/tests. |
| Existing-code solution scan | no | N/A: this was a direct runtime semantic owner change. |
| Live Plate repo root grounding | yes | All commands ran from `/Users/zbeyens/git/plate-2`. |

Work Checklist:
- [x] Accepted user correction captured: `tx.break.insertSoft()` should insert
      `\n` as the standard Plite soft-break behavior.
- [x] Plite owner patched in `packages/plite/src/editor/insert-soft-break.ts`.
- [x] Duplicate product override removed from `SingleBlockPlugin`.
- [x] Plite tests updated from structural split expectation to newline text.
- [x] Block-void soft-break behavior preserved by focused test.
- [x] Focused Utils single-block/single-line tests pass.
- [x] Focused Plite transaction/snapshot/extension/state tests pass.
- [x] Plite and Utils typecheck passes.
- [x] Source audit confirms no duplicate SingleBlock raw newline override.
- [x] Browser proof marked N/A: no rendered route or DOM behavior changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused tests and typecheck named in this plan. | Plite focused contract tests, Utils focused tests, and Plite/Utils typecheck passed. |
| Plite runtime claim | yes | Record live source command/proof. | `insertSoftBreak` now uses transform registry `insertText('\n')`; tests verify command and snapshot behavior. |
| Issue ledger or PR reference changed | no | Sync ledger or record why not. | N/A: no issue/PR claim changed. |
| Autoreview for uncommitted implementation changes | no | Run autoreview or justify skip. | N/A: narrow accepted semantic patch with focused proof; user is actively reviewing this lane file-by-file. |
| Final user-review handoff | yes | Emit final handoff. | Final response will list changes/proof. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plite-soft-break-newline-semantics.md`. | Completion audit passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| current-state read | complete | Read Plite implementation/tests, upstream Slate behavior, and Utils plugin. | none |
| implementation | complete | Patched Plite soft break and removed duplicate SingleBlock override. | none |
| verification | complete | Focused tests and typecheck passed. | none |
| closeout | complete | Plan and source audit closed. | none |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Runtime behavior | 0.25 | 0.95 | `insertSoftBreak` now has distinct text behavior from `insertBreak`; block void exception still passes. |
| Plite API/DX | 0.25 | 0.96 | `tx.break.insertSoft()` now means newline text, matching the user-facing semantic. |
| Plate migration backbone | 0.15 | 0.94 | `SingleBlockPlugin` delegates to Plite instead of duplicating core behavior. |
| Regression-proof testing | 0.25 | 0.95 | Transaction, snapshot, extension, state, and Utils focused tests passed. |
| Scope control | 0.10 | 0.95 | No broad Plate migration, docs rewrite, or browser matrix. |

Source-backed architecture north star:
- target shape: `insertBreak` is structural; `insertSoftBreak` inserts newline
  text.
- source evidence: `packages/plite/src/editor/insert-soft-break.ts` and
  updated tests.
- rejected drift: local `SingleBlockPlugin.insertSoftBreak` override.
- migration posture: breaking behavior versus upstream Slate compatibility is
  accepted because Plite owns cleaner semantics.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| `tx.break.insertSoft()` / `editor.update.break.insertSoft()` | Insert newline text in current text flow. | Shift+Enter-style soft break means `\n`. | Breaks upstream structural split expectation intentionally. | Focused Plite tests pass. | revise |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Plite editor soft-break command | `packages/plite/src/editor/insert-soft-break.ts` | Keep `insert_soft_break` command but apply `insertText('\n')` transform. | Avoids product plugins overriding core soft-break semantics. | Transaction commit remains command `insert_soft_break` with text operation. | keep |

Intent / boundary record:
- intent: make Plite soft-break semantics cleaner than upstream compatibility.
- outcome: newline text insertion is the default soft-break behavior.
- in-scope: Plite runtime, focused Plite tests, SingleBlock duplicate override.
- non-goals: broad Plate migration, browser matrix, docs rewrite.
- decision boundaries: product plugins can still intercept soft breaks, but the
  default substrate behavior is text newline.
- unresolved user-decision points: none.

Decision brief:
- principles: semantic API beats upstream compatibility weirdness.
- top drivers: predictable Shift+Enter behavior, less product duplication,
  clean `insertBreak` vs `insertSoftBreak` boundary.
- viable options: keep structural split, plugin-local override, or Plite
  newline default.
- chosen option: Plite newline default.
- rejected alternatives: structural soft break; plugin-local duplication.
- consequences: Plite tests updated; callers expecting structural soft split
  should use `insertBreak` or `splitNodes`.
- follow-ups: watch later package review for callers that used soft break as a
  structural split by mistake.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | Sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|-------------|---------|
| N/A | N/A | No issue claim. | User-requested runtime cleanup. | Focused tests. | N/A | N/A |

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Upstream Slate | `../slate/packages/slate/src/editor/insert-soft-break.ts` | Structural split for compatibility. | N/A | Command naming only. | Structural split default. | Newline text default. | reject upstream default |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|--------------|-------------|-------|--------|
| Soft break default | Upstream structural split. | Newline text. | Transaction and snapshot tests. | Plite | passed |
| Block void soft break | Creates trailing paragraph. | Preserve. | Snapshot test. | Plite | passed |
| SingleBlock hard break | Enter becomes soft newline. | Delegate to Plite. | Utils focused tests. | Utils | passed |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Model/runtime only | Soft break command semantics | N/A | Focused model tests | Text newline and selection offset advance | passed |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Plite soft break command inserts newline text | `/Users/zbeyens/git/plate-2` | `pnpm --filter @platejs/plite exec bun test ./test/transaction-contract.ts --grep "insertSoftBreak"` | 1 pass | Plite |
| Plite snapshots preserve block void and newline text behavior | `/Users/zbeyens/git/plate-2` | `pnpm --filter @platejs/plite exec bun test ./test/snapshot-contract.ts --grep "insertSoftBreak"` | 2 pass | Plite |
| Wider Plite contract rows still pass | `/Users/zbeyens/git/plate-2` | `pnpm --filter @platejs/plite exec bun test ./test/transaction-contract.ts ./test/snapshot-contract.ts ./test/extension-methods-contract.ts ./test/state-tx-public-api-contract.ts` | 303 pass | Plite |
| Utils single-block behavior still passes | `/Users/zbeyens/git/plate-2` | `pnpm --filter @platejs/utils exec bun test src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx src/lib/plugins/single-block/SingleLinePlugin.spec.tsx src/lib/plugins/single-block/SingleBlockRuntimePlugin.spec.ts` | 14 pass | Utils |
| Plite and Utils types pass | `/Users/zbeyens/git/plate-2` | `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/utils` | 11 successful | Plite/Utils |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| performance | no | N/A | Tiny command semantic; no hot-path benchmark needed. | none |
| tdd | yes | applied | Existing failing structural expectation was updated to desired behavior. | tests updated |
| react-useeffect | no | N/A | No React effects touched. | none |
| docs-creator | no | N/A | No docs edited. | none |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Caller relied on structural soft break | Behavior semantic change | Some caller expected a split from `insertSoftBreak`. | Use `insertBreak` or `splitNodes` for structural splits; source audit found no immediate product caller needing old behavior. | Focused contract tests. | accepted |
| Block void behavior regresses | Runtime behavior change | Soft break inside selectable block void inserts text instead of trailing block. | Preserve `insertParagraphAfterSelectedBlockVoid` guard. | Snapshot test passes. | closed |
| Product plugin keeps duplicate override | Plate/Plite overlap | SingleBlock continues to hide core semantic. | Removed duplicate override. | Source audit has no duplicate override. | closed |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Upstream structural `insertSoftBreak` default | reject | It duplicates `insertBreak` semantics and violates the intuitive soft-break API. | Update tests/callers. | Plite tests updated. | Watch package review. |
| `SingleBlockPlugin.insertSoftBreak` override | cut | It became duplicate product-local core behavior. | none | Utils tests pass. | none |

Plan deltas from review:
- User corrected the semantic decision: `tx.break.insertSoft()` should insert
  newline text. Accepted.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Should docs mention the semantic? | Could help public DX later. | Docs review lane. | docs-creator / plite-plan | deferred |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| Plite behavior check | `/Users/zbeyens/git/plate-2` | focused Plite tests | command/snapshot behavior | passed |
| Utils behavior check | `/Users/zbeyens/git/plate-2` | focused Utils tests | product plugin behavior | passed |
| Typecheck | `/Users/zbeyens/git/plate-2` | Plite/Utils typecheck | public types | passed |

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | passed |
| all pass rows complete or skipped with evidence | phase/pass table closed | passed |
| issue/reference sync closed | no issue claim changed | passed |
| live source grounding complete | source-backed rows cite current owners | passed |
| workspace verification recorded | verification workspace gate closed | passed |
| autoreview clean or N/A | N/A: accepted narrow file-by-file semantic patch with focused proof | passed |
| final handoff emitted | final response will summarize | passed |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-05-plite-soft-break-newline-semantics.md` | passed |

Findings:
- Current Plite inherited upstream Slate structural `insertSoftBreak`.
- That made `SingleBlockPlugin` need a duplicate override to get newline text.
- Changing Plite default to newline text removes the product-local workaround.

Decisions and tradeoffs:
- Accepted breaking semantic change: soft break inserts newline text.
- Preserved block-void special behavior.
- Deferred docs copy to a docs review lane.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial Plite focused commands without `./` path | 2 | Rerun with explicit `./test/...` paths. | Passed. |

External/browser findings:
- N/A: no browser route changed.

Timeline:
- 2026-07-05T20:01:19.236Z Plite Plan goal plan created.
- 2026-07-05T20:05Z Patched Plite `insertSoftBreak` to insert newline text.
- 2026-07-05T20:06Z Removed duplicate `SingleBlockPlugin.insertSoftBreak`.
- 2026-07-05T20:08Z Focused Plite and Utils tests passed.
- 2026-07-05T20:09Z Plite/Utils typecheck passed.

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test ./test/transaction-contract.ts --grep "insertSoftBreak"` -> 1 pass.
- `pnpm --filter @platejs/plite exec bun test ./test/snapshot-contract.ts --grep "insertSoftBreak"` -> 2 pass.
- `pnpm --filter @platejs/plite exec bun test ./test/transaction-contract.ts ./test/snapshot-contract.ts ./test/extension-methods-contract.ts ./test/state-tx-public-api-contract.ts` -> 303 pass.
- `pnpm --filter @platejs/utils exec bun test src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx src/lib/plugins/single-block/SingleLinePlugin.spec.tsx src/lib/plugins/single-block/SingleBlockRuntimePlugin.spec.ts` -> 14 pass.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/utils` -> 11 successful.
- `rg -n -F "tx.text.insert('\\n')" packages/utils/src/lib/plugins/single-block packages/plite/src packages/plite/test --glob '!**/dist/**' || true` -> no duplicate product override matches.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed Plite soft-break semantic execution packet. |
| Where am I going? | Final handoff. |
| What is the goal? | Make Plite soft break insert newline text. |
| What have I learned? | Structural soft break was upstream compatibility baggage; newline text is cleaner Plite semantics. |
| What have I done? | Patched Plite, removed duplicate Utils override, updated tests, ran proof. |

Open risks:
- Possible external caller expected structural `insertSoftBreak`; accepted as
  the intended Plite hard cut. Use `insertBreak` or `splitNodes` for structure.
