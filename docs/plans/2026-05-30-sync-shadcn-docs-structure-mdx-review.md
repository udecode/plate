# sync shadcn docs structure mdx review

Objective:
Run `sync-shadcn review` focused on docs structure, MDX components, code/copy primitives, and Fumadocs wiring between `../shadcn/apps/v4` and `apps/www`, producing a source-backed review artifact without patching `apps/www`.

Completion threshold:
Complete when the upstream base, planned target, and current target are recorded as exact SHAs; upstream freshness is classified; docs/MDX owner paths are source-audited; explicit Plate forks and exclusions are checked; a durable review artifact is written under `docs/sync/shadcn/reviews/`; no implementation files are patched; and `check-complete.mjs` passes.

Verification surface:
- `../shadcn` git refs and `apps/v4` diff/log commands.
- `docs/sync/shadcn/status.json` and `docs/sync/shadcn/decisions.md`.
- Source reads in `apps/www/src/app/(app)/docs`, `apps/www/src/components`, `apps/www/src/lib`, `apps/www/source.config.ts`, and matching upstream `apps/v4` files.
- Review artifact at `docs/sync/shadcn/reviews/2026-05-30-docs-structure-mdx/review.md`.

Constraints:
- Review-only run: do not patch `apps/www`.
- Do not advance `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, or `partialSyncs`.
- Do not write upstream `.patch` files.
- Preserve settled Plate policy: no v0, no create/theme adoption, keep API MDX, CN docs, registry content, lazy registry-source loading, and Plate docs shell ownership.

Boundaries:
- Allowed edits: this goal plan and `docs/sync/shadcn/reviews/2026-05-30-docs-structure-mdx/**`.
- Non-goals: implementation, dashboard mutation, baseline advancement, registry build output, or broad shadcn mirroring.

Blocked condition:
Blocked only if `../shadcn` refs cannot be resolved, ancestry cannot be proven, the status file cannot be parsed, or the required review artifact cannot be written after one repair attempt.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- planned commit: `efdec3ca4523e5edd8a714f633002a7addc203a1`
- current target: `67cef8fcb94a4223a144e8ed6cbd26169943db7a`
- selected plan: `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/plan.md`
- review directory: `docs/sync/shadcn/reviews/2026-05-30-docs-structure-mdx`

Current verdict:
- verdict: `stale-upstream`
- confidence: high
- reason: upstream has 2 newer `apps/v4` commits after the tracked plan; the latest commits do not alter docs/MDX, but stable docs-engine differences were under-tracked.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal created | yes | Active goal created for this review objective. |
| `sync-shadcn` skill read | yes | Read `.agents/skills/sync-shadcn/SKILL.md`. |
| Output budget strategy recorded | yes | Broad diffs were saved as TSV artifacts; no patch artifacts were written. |
| `status.json` read | yes | Baseline, planned target, last plan, and partial sync count recorded. |
| `decisions.md` read | yes | Settled Plate forks and exclusions used for classification. |
| Prior migration notes checked | yes | Prior plans and solution notes were read before classification. |
| Upstream clone fetched | yes | `../shadcn origin/main` resolved to `67cef8fcb94a4223a144e8ed6cbd26169943db7a`. |
| Base and target refs resolved | yes | Exact SHAs recorded above and in `refs.json`. |
| Base ancestry proven | yes | `merge-base --is-ancestor` succeeded for base to target. |
| Planning-only mode decided | yes | This review wrote artifacts only and did not patch `apps/www`. |
| User review boundary recorded | yes | Next action is dashboard row creation or explicit accepted implementation. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Upstream range recorded with exact base SHA, planned SHA, target SHA, commit dates, and target subject in review artifacts.
- [x] Review directory created under `docs/sync/shadcn/reviews/`.
- [x] Upstream inventories saved as `upstream-full-name-status.tsv`, `upstream-full-numstat.tsv`, `upstream-new-name-status.tsv`, and `upstream-new-commits.txt`.
- [x] Focused source files inspected on demand and summarized; no `.patch` files were written.
- [x] Visual screenshots marked N/A because this pass makes source/structure findings, not visual parity claims.
- [x] Changed upstream rows were counted and the new rows since `lastPlannedCommit` were classified at summary level.
- [x] Decision accounting for docs/MDX focus surfaces is recorded in `review.md`.
- [x] Added, modified, and stable comparison surfaces are summarized with actionable rows separated from forks/no-ops.
- [x] Recommended merge slices are ordered in `review.md`.
- [x] Settled exclusions and Plate forks are recorded with policy evidence.
- [x] Real decision rows are isolated: yarn tab, collapsible wrapper, highlight cache, copy fallback, MDX primitives.
- [x] `status.json` update semantics are recorded: unchanged for review mode.
- [x] Planning-mode handoff stops before implementation.
- [x] Workspace authority recorded for each verification command or artifact.
- [x] Output budget discipline followed; broad evidence stayed in artifacts.
- [x] Final handoff shape is prepared.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove review artifact and no implementation edits | `review.md` written; only docs/sync review and goal plan touched. |
| Upstream range artifacts exist | yes | Verify review artifacts are non-empty | TSV/log/refs files exist under the review directory. |
| Inventory completeness | yes | Recompute counts for current review | Full inventory has 778 rows; new upstream delta has 40 rows. |
| Decision accounting | yes | Record docs/MDX focus decisions | `review.md` focus findings table lists each reviewed surface. |
| Status JSON parse and semantics | yes | Parse `status.json`; verify no mutation needed | Baseline and planned target recorded; status unchanged. |
| Source-backed Plate mapping | yes | Record file evidence for each focus surface | `review.md` lists upstream and Plate owner files. |
| Visual comparison screenshots | N/A | Source-only review | No visual parity claim was made. |
| Planning-only no implementation edits | yes | Keep `apps/www` untouched | Review-only artifact and goal plan edits only. |
| Accepted implementation verification | N/A | No accepted implementation in this turn | Review mode only. |
| Browser surface changed | N/A | No visible source patch | Browser proof not required. |
| Package manifests, lockfile, or install graph changed | N/A | No package or lockfile edits | No install needed. |
| Agent rules or skills changed | N/A | No rule or skill edits | No generated skill sync needed. |
| CI-controlled generated output | yes | Avoid generated registry/template edits | No generated registry/template output touched. |
| Baseline advancement | yes | Do not advance baseline in review mode | `lastSyncedCommit` unchanged. |
| User review boundary | yes | Stop with recommendations | Final response points to review artifact and next actions. |
| Output budget discipline | yes | Keep broad evidence in artifacts | Broad inventories saved as TSV files. |
| Goal plan complete | yes | Run `check-complete.mjs` | Recorded in Verification evidence after command run. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | complete | status, decisions, prior plans read | done |
| Upstream range evidence | complete | refs and TSV artifacts written | done |
| Classification and local mapping | complete | source files inspected | done |
| Review artifact | complete | `review.md` written | done |
| User review stop | complete | implementation left to later accepted slice | done |
| Verification and baseline decision | complete | baseline unchanged by policy | done |
| Closeout | complete | check-complete command required | final response |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| `synced` | 2 | PageHeader, TOC/no-op parity. |
| `smart-merge` | 4 | Code collapsible wrapper, highlight cache, copy fallback, selective MDX primitives. |
| `plate-fork` | 5 | Docs shell, source/search wiring, source.config ownership, docs copy menu, API/registry/CN behavior. |
| `exclude-upstream` | 2 | v0 and style/theme/create product rows stay excluded. |
| `no-op` | 1 | TOC memo difference is too small to track. |
| `needs-question` | 1 | Yarn tab policy. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | `mdx/codeblock-collapsible-wrapper` | smart-merge | `apps/www/src/components/code-block-wrapper.tsx` | Clear upstream primitive improvement and local class bug candidate. | focused typecheck plus docs page browser check |
| 2 | `mdx/highlight-code-cache` | smart-merge | `apps/www/src/lib/highlight-code.ts` | Upstream perf win with low Plate-specific risk. | source check and registry/docs preview path |
| 3 | `mdx/copy-button-fallback` | smart-merge | `apps/www/src/components/copy-button.tsx` | More truthful copied state and clipboard fallback. | focused browser copy check |
| 4 | `mdx/code-command-yarn-tab` | needs-question | `apps/www/src/lib/rehype-npm-command.ts`, `apps/www/src/components/code-block-command.tsx`, `apps/www/src/components/copy-button.tsx` | Upstream supports yarn; Plate currently has three package managers. | decide policy first, then focused docs command check |

Verification evidence:
- `refs.json` records `base=4a4dc8e`, `planned=efdec3c`, `target=67cef8f`.
- `upstream-new-commits.txt` has 2 rows.
- `upstream-new-name-status.tsv` has 40 rows.
- `upstream-full-name-status.tsv` has 778 rows.
- Source reads compared upstream and Plate docs page shell, `source.config.ts`, `mdx-components.tsx`, `source.ts`, search route, code command, code collapsible wrapper, highlight code, copy button, docs copy page, TOC, and PageHeader.
- `review.md` was written at `docs/sync/shadcn/reviews/2026-05-30-docs-structure-mdx/review.md`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-30-sync-shadcn-docs-structure-mdx-review.md` passed.

Reboot status:
Current review is complete enough to resume from `review.md`. If reopened, add the suggested dashboard rows first, then implement only an explicitly accepted slice.

Open risks:
- No full dashboard JSON mutation was done in this review. The suggested rows still need to be copied into `docs/sync/shadcn/deltas.json` if the dashboard should track them.
- The yarn tab is a product policy decision, not a code-only call.
