# sync shadcn accepted slices

Objective:
Implement accepted slices from
`docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1/plan.md`: apply docs
shell parity polish without command-menu changes, audit/adopt `shadcn@4.8.2`,
record `/r/registries.json` as deferred, keep Rhea/theme/create/homepage
excluded, and record this as a partial sync without advancing
`lastSyncedCommit`.

Flow mode:
implementation mode. The user reviewed the prior range plan and accepted slice
1 with command-menu skipped, slice 2, deferred slice 3, and excluded slice 4.

Goal plan:
docs/plans/2026-05-28-sync-shadcn-accepted-slices.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- docs
- browser

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`
- run artifacts:
  `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1/`

Completion threshold:
- Planning-only run: complete only when the upstream range has exact base and
  target SHAs, ancestry is proven or the ref problem is recorded, every
  upstream added/modified/deleted `apps/v4` file is classified in a durable
  inventory, decision counts reconcile to the upstream TSV, the plan lists
  recommended slices and real questions, `lastPlannedCommit` points at the
  target, `lastSyncedCommit` is unchanged, the final response asks the user to
  review the plan and invoke `sync-shadcn` again with the accepted plan/slice,
  and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-accepted-slices.md`
  passes.
- Accepted implementation run: complete only when the accepted slice is
  implemented and verified, excluded/forked rows remain recorded, partial sync
  or baseline advancement semantics are updated in `status.json`, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-accepted-slices.md`
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
- Allowed implementation edits: `apps/www/src/app/(app)/docs/[[...slug]]/doc-content.tsx`,
  `apps/www/src/components/docs-nav.tsx`, `apps/www/package.json`,
  `pnpm-lock.yaml`, `docs/sync/shadcn/status.json`, and this goal plan.
- Explicitly excluded from this run: `apps/www/src/components/command-menu.tsx`,
  `/r/registries.json`, Rhea/style/theme/create/homepage imports, generated
  registry output, and `build:registry`.
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
- range kind: accepted partial implementation from reviewed plan
- run directory: `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1/`
- planning status: complete, prior plan reviewed by user
- implementation status: active
- user review status: accepted for slices 1 and 2; slice 3 deferred; slice 4 excluded
- baseline status: keep `lastSyncedCommit` unchanged; record `partialSyncs`

Current verdict:
- verdict: implement accepted partial sync
- confidence: high
- recommended next owner: sync-shadcn
- reason: User explicitly accepted docs shell polish without command-menu and
  package bump audit/adopt, deferred registry directory, and excluded
  Rhea/create/theme/homepage.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until the range plan or accepted
  implementation evidence is recorded below and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-accepted-slices.md`
  passes.
- Do not create hook state. This plan, `docs/sync/shadcn/status.json`, and the
  run artifact directory are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | `get_goal` returned no goal; `create_goal` created this accepted-slice implementation objective. |
| `sync-shadcn` skill/rule read | yes | Current `sync-shadcn` rule and accepted range plan read. |
| Output budget strategy recorded before broad upstream commands | yes | Use exact file reads, focused diffs, and artifacts. One broad exclusion search was too noisy and is recorded below. |
| `docs/sync/shadcn/status.json` read | yes | Read current status; `lastSyncedCommit` remains `4a4dc8e`, `lastPlannedCommit` is `360e8a1`, `partialSyncs` empty before implementation. |
| `docs/sync/shadcn/decisions.md` read | yes | Read durable policy: sidebar fork, lazy code source, create/theme exclusions. |
| Prior migration plans/solution notes checked | yes | Accepted range plan and decision doc read; detailed prior comparison is the plan source. |
| `../shadcn` clone exists and was fetched/pulled intentionally | yes | `../shadcn` currently at `360e8a19c3ee13ac78b656027462007c8bdaa6d5`. |
| Base and target refs resolved to exact SHAs | yes | Base `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`; target `360e8a19c3ee13ac78b656027462007c8bdaa6d5`. |
| Base ancestry or ref problem proven | yes | `git -C ../shadcn merge-base --is-ancestor 4a4dc8e 360e8a1` passed. |
| Planning-only vs implementation mode decided | yes | Implementation mode from user acceptance. |
| User-review boundary recorded | yes | User accepted slices after reviewing prompted decisions. |

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
- [ ] `docs/sync/shadcn/status.json` update semantics are recorded:
      `lastPlannedCommit`, `lastPlan`, partial sync, or baseline advancement.
- [x] Planning-mode final handoff explicitly asks the user to review the plan
      and invoke `sync-shadcn` again with the accepted plan path and slice.
- [ ] Workspace authority recorded for each verification command or artifact.
- [ ] Output budget discipline followed; large evidence stayed in artifacts.
- [ ] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Prove the planning or accepted-implementation threshold named above | pending |
| Upstream range artifacts exist | pending | Verify required run artifacts are non-empty or record a target-only bootstrap exception | pending |
| Inventory completeness | pending | Reconcile `inventory.md` row count with `upstream-name-status.tsv` | pending |
| Decision accounting | pending | Verify decision counts cover every upstream row and no `needs-question` row is hidden | pending |
| Status JSON parse and semantics | pending | Parse `docs/sync/shadcn/status.json`; verify planned/synced commit semantics | pending |
| Source-backed Plate mapping | pending | Record local `rg`/file evidence for every actionable adoption, fork, exclusion, or question group | pending |
| Planning-only no implementation edits | pending | Verify no `apps/www` implementation patch was made, or record accepted implementation scope | pending |
| Accepted implementation verification | pending | If a slice was accepted, run its focused typecheck/test/lint/browser/source proof; otherwise N/A | pending |
| Browser surface changed | pending | Capture Browser Use proof when accepted implementation touches visible docs UI; otherwise N/A | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks when touched; otherwise N/A | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync when touched; otherwise N/A | pending |
| CI-controlled generated output | pending | Verify no generated registry/template output was manually edited, or record intentional owner | pending |
| Baseline advancement | pending | Advance `lastSyncedCommit` only if all rows through target are complete and accepted; otherwise record why unchanged | pending |
| User review boundary | pending | In planning mode, stop and ask the user to review the plan; in implementation mode, record the accepted plan/slice | pending |
| Output budget discipline | pending | Verify broad output was artifacted/capped, or record accidental output and recovery | pending |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-sync-shadcn-accepted-slices.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | complete | Goal plan created; status, decisions, accepted plan, local owners, and upstream focused diff read. | upstream range evidence |
| Upstream range evidence | complete | Existing run artifacts cover `4a4dc8e..360e8a1`; ancestry confirmed. | classification |
| Classification and local mapping | complete | Accepted rows mapped to doc-content, docs-nav, package bump; command-menu skipped, registry route deferred, Rhea/create excluded. | plan artifact |
| Plan artifact and status update | in_progress | Partial sync status update pending after implementation. | user review stop |
| User review stop | complete | User accepted slices in latest message. | implementation |
| Accepted implementation | in_progress | | verification or N/A; implementation mode only |
| Verification and baseline decision | pending | | closeout |
| Closeout | pending | | final response |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 1 accepted | `shadcn@4.8.2` package bump audit/adopt. |
| `smart-merge` | 1 accepted, 1 deferred | Docs shell polish accepted without command-menu; `/r/registries.json` deferred. |
| `plate-fork` | 6 preserved | Existing Plate forks preserved from plan. |
| `exclude-upstream` | 566 plus slice 4 accepted | Rhea/theme/create/homepage excluded; `/create` may be reviewed later as a Plate product. |
| `delete-plate-residue` | 0 | No residue cleanup accepted in this slice. |
| `no-op` | 156 | Existing no-op rows unchanged. |
| `needs-question` | 0 remaining for this implementation | Registry route deferred; no implementation question remains. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Docs shell parity polish, command-menu skipped | `smart-merge` | `doc-content.tsx`, `docs-nav.tsx` | User accepted upstream text token/sidebar parity while preserving Plate sidebar UX. | `pnpm --filter www typecheck`, `pnpm lint:fix`, browser proof if available. |
| 2 | shadcn package bump audit/adopt | `adopt-upstream` | `apps/www/package.json`, `pnpm-lock.yaml` | User accepted bump to `shadcn@4.8.2`; upstream changed from `4.8.0`. | `pnpm install`, registry source check, `pnpm --filter www typecheck`. |
| 3 | Registry directory route | `defer` | none | User deferred until whole registry review. | Record partial sync, keep baseline unchanged. |
| 4 | Rhea/create/theme/homepage | `exclude-upstream` | none | User accepted exclusion; `/create` may be revisited later as Plate product. | Focused source audit for accidental Rhea/style/create route import. |

Questions:
- None for this implementation. Registry directory is deferred.

Findings:
- Upstream docs page changed `text-neutral-800 dark:text-neutral-300` to
  `text-foreground dark:text-foreground`; Plate has the same neutral tokens in
  `doc-content.tsx` and should adopt the foreground token while preserving
  Plate width variants.
- Upstream docs sidebar removed the decorative vertical border and changed
  sidebar content padding to `px-2.5`; Plate already has `px-2.5` but still has
  the border.
- Upstream changed command-menu trigger style, but user explicitly said to skip
  command-menu for now.
- Plate pins `shadcn` `4.8.0`; upstream moved to `4.8.2`. Upstream also bumped
  `@base-ui/react`, but Plate does not currently depend on `@base-ui/react`.

Decisions and tradeoffs:
- Defer `/r/registries.json` rather than adding a public registry-directory
  surface in this slice.
- Exclude Rhea/theme/create/homepage changes; `/create` can be reviewed later as
  a Plate product, not imported from upstream now.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` with `create` across docs/app printed many legitimate Plate API docs | 1 | Narrow exclusion audit to `rhea`, `style-rhea`, `style-registry`, and route/product paths instead of generic `create` | Pending narrow rerun. |

Verification evidence:
- Pending.

Final handoff:
- Range: pending
- Plan artifact: pending
- Inventory artifact: pending
- Decision counts: pending
- Recommended first slice: pending
- Review request: pending
- Question: pending or N/A; must ask for review before implementation in
  planning mode
- Status JSON: pending
- Verification: pending
- Baseline: pending

Timeline:
- 2026-05-28T14:39:58.325Z Sync Shadcn goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Accepted implementation |
| Where am I going? | Patch docs shell/package, update partial sync status, verify, closeout |
| What is the goal? | Implement accepted shadcn sync slices without command-menu or registry-directory route. |
| What have I learned? | See Findings |
| What have I done? | Created implementation goal plan and mapped accepted slices to local owners. |

Open risks:
- Pending.
