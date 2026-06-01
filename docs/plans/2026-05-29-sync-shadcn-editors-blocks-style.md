# sync shadcn editors blocks style

Objective:
Plan the scoped `sync-shadcn` editors-to-blocks visual parity lane: compare upstream shadcn `/blocks` with Plate `/editors`, exclude the blocks category nav, Open in v0, and Browse more editors surfaces, write a reviewable sync plan and artifacts, update planned-target status, and stop before implementation.

Flow mode:
Planning mode. Implementation requires a later user acceptance naming the plan and slice.

Goal plan:
docs/plans/2026-05-29-sync-shadcn-editors-blocks-style.md

Primary template:
docs/plans/templates/sync-shadcn.md

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- run artifacts: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/`

Completion threshold:
Complete when the scoped run directory contains full upstream TSV artifacts, scoped inventory, screenshot evidence for upstream `/blocks` and Plate `/editors`, a reviewable plan with decision counts and recommended slices, `docs/sync/shadcn/status.json` parses with `lastPlannedCommit` and `lastPlan` updated while `lastSyncedCommit` stays unchanged, and this goal plan passes `check-complete`.

Verification surface:
- `git -C ../shadcn fetch origin main --tags`
- `git -C ../shadcn merge-base --is-ancestor <base> <target>`
- full range artifacts: `upstream-name-status.tsv`, `upstream-numstat.tsv`, `upstream-commits.txt`
- scoped artifacts: `scope-name-status.tsv`, `target-reference-files.tsv`, `inventory.md`, `plan.md`
- browser screenshots and DOM metrics for `http://localhost:4000/blocks` and `http://localhost:3003/editors`
- `node -e` JSON parse for `docs/sync/shadcn/status.json`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-29-sync-shadcn-editors-blocks-style.md`

Constraints:
- Do not patch `apps/www` in this planning activation.
- Do not run `build:registry`.
- Do not write `.patch` files.
- Do not advance `lastSyncedCommit`.
- Exclude the user-rejected `/blocks` PageNav/BlocksNav wrapper, Open in v0, and Browse more editors surfaces.
- Keep Plate editor demos, registry content, Pro/Potion block, `/view/[name]`, lazy source loading, and `@plate` install commands.

Boundaries:
- Planning edits only: `docs/sync/shadcn/**`, this goal plan, and status planned-target fields.
- Implementation edits are for a later accepted slice only.
- Non-goals: upstream create, v0, charts, colors, Rhea/theme/style registry, generated registry output, and broad docs sync.

Output budget strategy:
Full upstream diffs stay in TSV artifacts. Chat output stays to counts, plan path, screenshots path, decision counts, and the recommended first slice.

Blocked condition:
Only blocked by invalid upstream refs, missing `../shadcn/apps/v4`, inability to capture required visual evidence after a server restart with `NEXT_PUBLIC_APP_URL`, or a contradictory user policy decision.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- target commit: `efdec3ca4523e5edd8a714f633002a7addc203a1`
- run directory: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/`
- planning status: complete
- implementation status: not started; requires user acceptance
- baseline status: `lastSyncedCommit` unchanged

Current verdict:
- verdict: reviewable scoped plan written
- confidence: high
- recommended next owner: user review
- reason: the upstream visual source and Plate target were both captured and the user exclusions are unambiguous.

Completion rule:
All checklist and gate rows are closed; `check-complete` must pass before final response.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | Goal created for editors-to-blocks planning lane. |
| `sync-shadcn` skill/rule read | yes | User supplied skill body; workflow followed as planning mode. |
| Output budget strategy recorded before broad upstream commands | yes | Strategy recorded in this plan before full TSV generation. |
| `docs/sync/shadcn/status.json` read | yes | Status read; base and previous planned target recorded. |
| `docs/sync/shadcn/decisions.md` read | yes | Decisions read; editor demos kept, `/blocks` selective fork, v0 excluded. |
| Prior migration plans/solution notes checked | yes | Comparison plan and shadcn sidebar/source-metrics solution notes read. |
| `../shadcn` clone exists and was fetched intentionally | yes | `../shadcn/apps/v4` exists; `git fetch origin main --tags` completed. |
| Base and target refs resolved to exact SHAs | yes | Base `4a4dc8e...`; target `efdec3c...`. |
| Base ancestry or ref problem proven | yes | `merge-base --is-ancestor` passed. |
| Planning-only vs implementation mode decided | yes | Planning-only; no `apps/www` implementation patch. |
| User-review boundary recorded | yes | Final handoff asks user to review and accept a slice before implementation. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA, target SHA, commit date, and target subject.
- [x] Run directory created under `docs/sync/shadcn/runs/`.
- [x] Complete upstream inventories saved: `upstream-name-status.tsv`, `upstream-numstat.tsv`, and `upstream-commits.txt`.
- [x] Focused diffs inspected and summarized; no `.patch` files were written.
- [x] Upstream shadcn and Plate screenshots were captured at matching desktop/mobile viewports.
- [x] Scoped rows are classified in `inventory.md` with status, path, subsystem, Plate owner, decision, and evidence.
- [x] Decision counts reconcile to the scoped rows and full out-of-scope count.
- [x] Added, modified, and deleted groups are summarized.
- [x] Recommended merge slices include class, files, why, and verification.
- [x] Settled exclusions and Plate forks are recorded with policy evidence.
- [x] Real questions are isolated; no question remains for this scope.
- [x] `docs/sync/shadcn/status.json` update semantics are recorded and applied.
- [x] Planning-mode final handoff asks for review before implementation.
- [x] Workspace authority recorded for verification commands and artifacts.
- [x] Output budget discipline followed.
- [x] Final handoff shape is filled before closeout.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Plan, inventory, screenshots, status update, and check-complete evidence recorded. |
| Upstream range artifacts exist | yes | `upstream-name-status.tsv`, `upstream-numstat.tsv`, and `upstream-commits.txt` exist with 751/751/13 rows. |
| Inventory completeness | yes | `inventory.md` covers 12 scoped changed rows plus 8 target reference rows; 739 range rows are out-of-scope. |
| Decision accounting | yes | Counts: 4 smart-merge, 15 exclude-upstream, 1 no-op, 739 out-of-scope. |
| Status JSON parse and semantics | yes | `status.json` parses; `lastPlannedCommit` target and `lastPlan` scope plan updated; baseline unchanged. |
| Source-backed Plate mapping | yes | `apps/www/src/app/(app)/editors/**`, `BlockDisplay`, and `BlockViewer` inspected. |
| Visual comparison screenshots | yes | Four screenshots saved under the run `screenshots/` directory with DOM metric output. |
| Planning-only no implementation edits | yes | No `apps/www` code patched in this activation. |
| Accepted implementation verification | N/A | No implementation accepted yet. |
| Browser surface changed | N/A | Planning only; browser used for visual evidence, not implementation proof. |
| Package manifests, lockfile, or install graph changed | N/A | No package files changed. |
| Agent rules or skills changed | N/A | No agent rules or skills changed. |
| CI-controlled generated output | yes | No generated registry/template output edited. |
| Baseline advancement | yes | `lastSyncedCommit` unchanged because this is scoped. |
| User review boundary | yes | Final handoff stops for review. |
| Output budget discipline | yes | Broad upstream evidence stored as artifacts. |
| Goal plan complete | yes | `check-complete` passes after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | status/decisions/prior notes read | upstream evidence |
| Upstream range evidence | done | full TSVs and target refs saved | classification |
| Classification and local mapping | done | `inventory.md` | plan artifact |
| Plan artifact and status update | done | `plan.md`, `status.json` | user review |
| User review stop | done | final response will ask for accepted slice | implementation later |
| Accepted implementation | N/A | not accepted yet | later user command |
| Verification and baseline decision | done | JSON parse, screenshots, no baseline advance | closeout |
| Closeout | done | check-complete passes | final response |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `adopt-upstream` | 0 | No wholesale adoption. |
| `smart-merge` | 4 | Header/content band/list/display style only. |
| `plate-fork` | 0 | Preserved forks listed in plan, not counted as changed rows. |
| `exclude-upstream` | 15 | Nav/v0/browse exclusions plus upstream block demo content. |
| `delete-plate-residue` | 0 | No implementation yet. |
| `no-op` | 1 | Category route after nav exclusion. |
| `needs-question` | 0 | User already answered policy exclusions. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Editors page shell parity | `smart-merge` | `apps/www/src/app/(app)/editors/layout.tsx`, `apps/www/src/app/(app)/editors/editor-description.tsx`, `apps/www/src/app/(app)/editors/page.tsx` | Match upstream `/blocks` shell without rejected nav/v0/browse surfaces. | Browser `/editors` desktop/mobile plus eslint/typecheck. |
| 2 | BlockViewer toolbar cleanup for editors | `smart-merge` | `apps/www/src/components/block-viewer.tsx`, maybe `apps/www/src/components/block-display.tsx` | Only if shell parity leaves toolbar density visibly off. | Toolbar DOM metrics plus eslint/typecheck. |

Questions:
- None.

Findings:
- Upstream `/blocks` has centered PageHeader, PageNav category strip, `section-soft`, wider first-card rhythm, Open in v0, and bottom Browse more blocks.
- Plate `/editors` has a left-aligned header inside a route container, no `section-soft`, and a tighter first-card top/side rhythm.
- User-rejected surfaces map to concrete upstream files: `PageNav`, `BlocksNav`, `OpenInV0Button`, and the bottom CTA in `blocks/page.tsx`.

Decisions and tradeoffs:
- Use upstream as visual source, not content source.
- Keep Plate editor demos and registry rendering.
- Exclude the upstream block gallery product controls the user named.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Upstream `/blocks` returned 500 because `NEXT_PUBLIC_APP_URL` was unset | 1 | Restart upstream dev with env var | `NEXT_PUBLIC_APP_URL=http://localhost:4000 pnpm dev` fixed screenshots. |

Verification evidence:
- `git -C ../shadcn fetch origin main --tags` completed; target resolved to `efdec3ca4523e5edd8a714f633002a7addc203a1`.
- `git -C ../shadcn merge-base --is-ancestor 4a4dc8eb0fc793d8e9225e780183ad605f15d2c2 efdec3ca4523e5edd8a714f633002a7addc203a1` passed.
- Full upstream artifacts saved: 751 name-status rows, 751 numstat rows, 13 commits.
- Scoped artifacts saved: 12 changed rows, 8 target reference rows, `inventory.md`, `plan.md`.
- Browser screenshots saved for upstream `/blocks` and Plate `/editors` at 1175x1239 and 390x844.
- `docs/sync/shadcn/status.json` parses after planned-target update.

Open risks:
- None for planning. Implementation still needs browser proof after any accepted patch.

Final handoff:
- Range: `4a4dc8e..efdec3c`
- Plan artifact: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/plan.md`
- Inventory artifact: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/inventory.md`
- Decision counts: 4 smart-merge, 15 exclude-upstream, 1 no-op, 739 out-of-scope.
- Recommended first slice: Editors page shell parity.
- Review request: user should review/accept the first slice before implementation.
- Status JSON: planned target updated, synced baseline unchanged.
- Verification: check-complete passed.
- Baseline: unchanged.

Timeline:
- 2026-05-29: Created sync-shadcn goal and scratchpad.
- 2026-05-29: Fetched upstream `../shadcn`, resolved `efdec3c`, and proved ancestry.
- 2026-05-29: Saved range TSVs, scoped rows, target references, screenshots, inventory, and plan.
- 2026-05-29: Updated status planned target/plan for this scope.
- 2026-05-29: Closed planning run for user review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Scoped planning complete. |
| Where am I going? | Stop for user review. |
| What is the goal? | Plan `/editors` parity with upstream `/blocks` without rejected nav/v0/browse surfaces. |
| What have I learned? | The right slice is route shell/list spacing first; toolbar cleanup is secondary only if still visually off. |
| What remains? | User acceptance before implementation. |

