# sync shadcn header scope

Objective:
Create a planning-only `sync-shadcn header` scoped audit: resolve the tracked
upstream shadcn range, inventory header-relevant upstream changes from
`../shadcn/apps/v4` against `apps/www`, write durable `docs/sync/shadcn`
artifacts and status planning pointers, then stop for user review without
patching `apps/www`.

Flow mode:
planning mode by default: one-shot execution to write a reviewable range plan,
then stop for user review. Implementation mode starts only on a later user
instruction that accepts a named plan and slice. Use collaborative planning only
when the user asks to decide policy before any range plan is written.

Goal plan:
docs/plans/2026-05-28-sync-shadcn-header-scope.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- none by default
- add `docs` if docs/content pages are edited during an accepted implementation
- add `browser` if browser-visible docs UI is edited
- add `agent-native` if `.agents/**`, `.claude/**`, `.codex/**`, skills,
  commands, prompts, or user-action tooling are edited

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`
- run artifacts: `docs/sync/shadcn/runs/<date>-<base>-to-<target>/`

Completion threshold:
- Planning-only run: complete only when the upstream range has exact base and
  target SHAs, ancestry is proven or the ref problem is recorded, every
  upstream added/modified/deleted `apps/v4` file is classified in a durable
  inventory, decision counts reconcile to the upstream TSV, the plan lists
  recommended slices and real questions, `lastPlannedCommit` points at the
  target, `lastSyncedCommit` is unchanged, the final response asks the user to
  review the plan and invoke `sync-shadcn` again with the accepted plan/slice,
  and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-header-scope.md`
  passes.
- Accepted implementation run: complete only when the accepted slice is
  implemented and verified, excluded/forked rows remain recorded, partial sync
  or baseline advancement semantics are updated in `status.json`, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-header-scope.md`
  passes.

Verification surface:
- `../shadcn` git commands for fetch/pull, base/target resolution, ancestry,
  upstream commit list, and `apps/v4` file status.
- Run artifacts: `upstream-name-status.tsv`, `upstream-numstat.tsv`,
  `upstream-commits.txt`, focused patch files, `inventory.md`, and `plan.md`.
- Source audits in `apps/www`, `content/docs`, `docs/sync/shadcn`, and relevant
  `docs/solutions/**` notes.
- JSON parse and commit-semantics check for `docs/sync/shadcn/status.json`.
- For implementation slices only: focused typecheck/lint/test/browser proof
  owned by the touched Plate surface.

Constraints:
- Do not run `build:registry`.
- Do not edit generated registry output, template output, or generated skill
  mirrors by hand.
- Do not patch `apps/www` during planning-only runs.
- Do not advance `lastSyncedCommit` until every upstream row through the target
  is accounted for and the user accepts the final accounting.
- Preserve settled Plate policy unless the user explicitly changes it: discard
  v0/create/charts/colors/theme/customizer surfaces; keep Plate API MDX, CN
  docs, MCP, Plate Plus hooks, GA, home page, editor demos, registry content,
  lazy registry-source loading, and sidebar accordion/filter UX.

Boundaries:
- Allowed planning edits: `docs/sync/shadcn/**`, this goal plan, and generated
  run artifacts.
- Allowed implementation edits only in implementation mode, after later user
  acceptance of a named plan/slice: the files named by the accepted slice plus
  required lock/config/test/doc updates.
- Non-goals: broad shadcn mirroring, homepage/create/theme adoption, registry
  build output, and unrelated docs redesign.

Output budget strategy:
- Do not stream broad upstream diffs or full generated registry output into
  chat. Save complete TSVs and patches under the run directory.
- Use counts and focused slices first: `git diff --name-status`,
  `git diff --numstat`, `git log --oneline`, `wc -l`, and narrow `sed`/`rg`
  reads.
- Cap command output for source reads. If output is still too large, write an
  artifact and inspect exact ranges.

Blocked condition:
- Block only when the upstream clone/ref state is invalid, the target range
  cannot be proven, a required user policy decision changes whether the plan is
  truthful, or verification tooling cannot instantiate/check the goal plan
  after a real repair attempt.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- target commit: `360e8a19c3ee13ac78b656027462007c8bdaa6d5`
- range kind: scoped planning lane for `header`
- run directory: `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1-header`
- planning status: plan artifact written and ready for user review
- implementation status: N/A for this activation; requires later accepted plan/slice
- user review status: final handoff asks for review
- baseline status: unchanged; scoped plan cannot advance `lastSyncedCommit`

Current verdict:
- verdict: header scope is accounted for; no immediate header patch recommended
- confidence: high for header-scope accounting; command-menu styling remains deferred by prior user decision
- recommended next owner: user review, then optional later `sync-shadcn command-menu`
- reason: 5 direct header rows were audited; Plate already owns/adopted the useful header shell pieces except deferred command-menu trigger styling

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until the range plan or accepted
  implementation evidence is recorded below and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-header-scope.md`
  passes.
- Do not create hook state. This plan, `docs/sync/shadcn/status.json`, and the
  run artifact directory are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | `create_goal` created active objective; `create-goal-scratchpad.mjs --template sync-shadcn --title "sync shadcn header scope"` produced this plan |
| `sync-shadcn` skill/rule read | yes | User supplied `.agents/skills/sync-shadcn/SKILL.md`; scoped planning lane for `header` selected |
| Output budget strategy recorded before broad upstream commands | yes | Output budget strategy section records capped output and artifact-first diffs before upstream diff/log commands |
| `docs/sync/shadcn/status.json` read | yes | `lastSyncedCommit=4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; `lastPlannedCommit=360e8a19c3ee13ac78b656027462007c8bdaa6d5`; one partial sync recorded |
| `docs/sync/shadcn/decisions.md` read | yes | Durable decisions read; header/nav default is `smart merge`; v0/create/charts/colors/theme exclusions are settled |
| Prior migration plans/solution notes checked | yes | Read docs restart comparison, base migration progress, shadcn header nav locale note, sidebar parity note, registry/init notes, Fumadocs pageTree note, shadcn-parity rule, and memory registry note for docs restart context |
| `../shadcn` clone exists and was fetched/pulled intentionally | yes | `test -d ../shadcn/.git`, `git -C ../shadcn fetch origin main --tags`, and `test -d ../shadcn/apps/v4` passed |
| Base and target refs resolved to exact SHAs | yes | Base `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; target `360e8a19c3ee13ac78b656027462007c8bdaa6d5` |
| Base ancestry or ref problem proven | yes | `git -C ../shadcn merge-base --is-ancestor "$BASE" "$TARGET"` returned success |
| Planning-only vs implementation mode decided | yes | This activation is scoped planning only; no `apps/www` patching or `task` delegation |
| User-review boundary recorded | yes | Planning mode stops with plan path and review request; implementation needs a later accepted plan/slice |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and
      blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA, target SHA, commit dates,
      and target subject.
- [x] Run directory created under `docs/sync/shadcn/runs/`.
- [x] Complete upstream inventories saved: `upstream-name-status.tsv`,
      `upstream-numstat.tsv`, and `upstream-commits.txt`.
- [x] Focused patches saved or explicitly split/skipped with reason.
- [x] Every changed upstream `apps/v4` row is classified in `inventory.md` with
      status, path, subsystem, Plate owner, decision, and evidence.
- [x] Decision counts reconcile to the upstream TSV row count.
- [x] Added, modified, and deleted groups are summarized with actionable rows
      separated from exclusions/no-ops.
- [x] Recommended merge slices are ordered and include class, files, why, and
      verification.
- [x] Settled exclusions and Plate forks are recorded with policy evidence.
- [x] Real `needs-question` rows are isolated; settled policy is not re-asked.
- [x] `docs/sync/shadcn/status.json` update semantics are recorded:
      `lastPlannedCommit`, `lastPlan`, partial sync, or baseline advancement.
- [x] Planning-mode final handoff explicitly asks the user to review the plan
      and invoke `sync-shadcn` again with the accepted plan path and slice.
- [x] Workspace authority recorded for each verification command or artifact.
- [x] Output budget discipline followed; large evidence stayed in artifacts.
- [x] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove the scoped planning threshold named above | Fresh scoped plan and inventory written under `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1-header` |
| Upstream range artifacts exist | yes | Verify required run artifacts are non-empty | `upstream-name-status.tsv`, `upstream-numstat.tsv`, `upstream-commits.txt`, `header-scope.patch`, and focused patch files exist; command output recorded byte/row counts |
| Inventory completeness | yes | Reconcile `inventory.md` row count with `upstream-name-status.tsv` | Node check returned `{ inventoryRows: 739, tsvRows: 739, match: true }` |
| Decision accounting | yes | Verify decision counts cover every upstream row and no hidden question remains | `summary.json` records 739 rows: 672 exclude, 62 no-op, 3 plate-fork, 2 smart-merge; 0 needs-question |
| Status JSON parse and semantics | yes | Parse `docs/sync/shadcn/status.json`; verify planned/synced commit semantics | JSON parse passed; `lastPlan` points at header scoped plan, `lastFullPlan` preserves the full plan, `lastSyncedCommit` unchanged |
| Source-backed Plate mapping | yes | Record local `rg`/file evidence for every actionable adoption, fork, exclusion, or question group | Plan records line evidence for layout, site-header, logo, mobile-nav, command-menu, decisions.md, and prior solution notes |
| Planning-only no implementation edits | yes | Verify no `apps/www` implementation patch was made, or record accepted implementation scope | Only `docs/plans/**`, `docs/sync/shadcn/**`, and `docs/sync/shadcn/status.json` were written in this activation |
| Accepted implementation verification | N/A | If a slice was accepted, run focused proof | No implementation slice was accepted in this activation |
| Browser surface changed | N/A | Capture browser proof when accepted implementation touches visible docs UI | Planning artifacts only; no browser-visible source patch |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and package checks when touched | No package or lockfile edit in this activation |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync when touched | No agent rule or skill edit in this activation |
| CI-controlled generated output | yes | Verify no generated registry/template output was manually edited | No `apps/www/public/r`, `apps/www/public/rd`, or `templates/**` output was edited |
| Baseline advancement | yes | Advance `lastSyncedCommit` only if complete and accepted; otherwise record why unchanged | `lastSyncedCommit` unchanged because scoped plan covers only 7 candidate rows and command-menu styling is deferred |
| User review boundary | yes | In planning mode, stop and ask the user to review the plan | Final handoff will ask for plan review and later accepted plan/slice before implementation |
| Output budget discipline | yes | Verify broad output was artifacted/capped | Broad diffs saved to artifacts; chat output used counts and focused file reads |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-header-scope.md` | Passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | completed | status, decisions, prior plans, solution notes, memory registry, and skill policy read | done |
| Upstream range evidence | completed | base/target resolved, ancestry proven, 739-row TSV and patch artifacts written | done |
| Classification and local mapping | completed | `inventory.md` and `summary.json` classify all rows; header line evidence recorded | done |
| Plan artifact and status update | completed | `plan.md` written; `status.json` updated to header scoped plan while preserving `lastFullPlan` | done |
| User review stop | completed | final response will ask for review before implementation | done |
| Accepted implementation | N/A | planning-only activation; no accepted slice | none |
| Verification and baseline decision | completed | inventory row count reconciled; status semantics checked; baseline unchanged | done |
| Closeout | completed | autogoal checker to run before final | done |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 0 | No direct header row needs pure adoption in this scoped lane |
| `smart-merge` | 2 | `command-menu.tsx` deferred; `docs-sidebar.tsx` adjacent/out of header scope |
| `plate-fork` | 3 | `site-header.tsx`, `mobile-nav.tsx`, and `lib/config.ts` preserve Plate header decisions |
| `exclude-upstream` | 672 | Rhea/create/theme/product/style rows, including header-adjacent announcement copy |
| `delete-plate-residue` | 0 | No header-owned residue found in this scoped activation |
| `no-op` | 62 | Layout already adopted plus out-of-scope generated/routing rows |
| `needs-question` | 0 | Command-menu is deferred by existing user decision, not a new question |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Header accounting only | `plate-fork` / `no-op` | `site-header.tsx`, `mobile-nav.tsx`, `config/site.ts`, `app/layout.tsx` | Plate already has/adopts the useful header shell pieces and intentionally preserves Plate product links, logo Home, locale, Discord, GitHub, MCP, and create/v0 exclusion | Source audit only; no implementation patch |
| 2 | Command-menu trigger styling | `smart-merge` deferred | `command-menu.tsx` | Upstream trigger styling is the only remaining header-mounted candidate; user said command-menu later | Later `sync-shadcn command-menu` lane with typecheck/lint/browser proof |

Questions:
- None for this scoped header plan. Command-menu trigger styling remains deferred by prior user decision.

Findings:
- Target equals the previously planned full-range target: `360e8a19c3ee13ac78b656027462007c8bdaa6d5`.
- Fresh range evidence has 739 changed upstream rows: 561 added, 156 modified, 22 deleted.
- Header scope has 7 candidate rows: 5 direct header rows, 2 header-adjacent rows, 732 out-of-scope rows.
- Plate already has the useful upstream layout header-height cleanup.
- Plate should keep desktop Home on the logo, not re-add a `Home` text nav item.
- Upstream command-menu trigger styling is the only direct header smart-merge candidate, but it is deferred.

Decisions and tradeoffs:
- Scoped plan updates `lastPlan` to the header plan but preserves the full-range plan in `lastFullPlan`.
- `lastSyncedCommit` stays unchanged because this plan is scoped and command-menu remains deferred.
- Sidebar changes are not pulled into the header lane; they belong to the sidebar accordion lane.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `git -C ../shadcn fetch origin main --tags` succeeded.
- Base: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; target: `360e8a19c3ee13ac78b656027462007c8bdaa6d5`.
- `git -C ../shadcn merge-base --is-ancestor "$BASE" "$TARGET"` succeeded.
- Run artifacts written under `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1-header`.
- Row reconciliation passed: `inventoryRows=739`, `tsvRows=739`, `match=true`.
- `docs/sync/shadcn/status.json` parses and leaves `lastSyncedCommit` unchanged.
- No package, app source, registry output, template output, or browser-visible implementation files were edited.

Final handoff:
- Range: `4a4dc8e..360e8a1`
- Plan artifact: `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1-header/plan.md`
- Inventory artifact: `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1-header/inventory.md`
- Decision counts: 672 exclude-upstream, 62 no-op, 3 plate-fork, 2 smart-merge, 0 needs-question
- Recommended first slice: header accounting only; no implementation patch recommended
- Review request: ask user to review the plan before any implementation
- Question: none; command-menu styling is deferred by prior user decision
- Status JSON: `lastPlan` points at the header scoped plan, `lastFullPlan` preserves the full plan, `lastSyncedCommit` unchanged
- Verification: fetch/ref/ancestry, artifact row counts, inventory reconciliation, JSON parse, no implementation edits
- Baseline: unchanged

Timeline:
- 2026-05-28T20:48:22.770Z Sync Shadcn goal plan created.
- 2026-05-28T20:48:58Z Start gates filled for scoped `header` planning: autogoal active, status/decisions/prior notes read, output budget recorded, and review boundary set.
- 2026-05-28T20:49:00Z Fetched `../shadcn`, resolved base/target, proved ancestry, wrote 739-row upstream artifacts, generated header scoped plan/inventory/summary, and updated status JSON.
- 2026-05-28T20:49:00Z Autogoal completion check passed for this plan.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Header scoped plan complete; final review handoff next |
| Where am I going? | User review boundary; implementation only after later accepted plan/slice |
| What is the goal? | Produce a planning-only `sync-shadcn header` scoped audit and stop for review |
| What have I learned? | Header has 5 direct rows; only command-menu trigger styling remains deferred |
| What have I done? | Wrote scoped run artifacts, updated status JSON, and verified inventory counts |

Open risks:
- Command-menu trigger styling is a real upstream header-mounted polish item, but it is intentionally deferred.
- `lastPlan` now points at the scoped header plan; `lastFullPlan` preserves the broader range plan for full-sync review.
- No browser proof was run because this was planning-only and did not patch browser-visible source.
