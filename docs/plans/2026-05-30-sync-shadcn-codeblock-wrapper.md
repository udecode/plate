# sync shadcn codeblock wrapper

Objective:
Sync `mdx/codeblock-collapsible-wrapper` by porting upstream
`CodeCollapsibleWrapper` behavior into Plate's `CodeBlockWrapper` while keeping
Plate's `full`, `open`, and `expandButtonTitle` props, then mark the dashboard
row `synced` after verification.

Flow mode:
One-shot `sync-shadcn apply` implementation mode. The user accepted the row by
answering `ok go` after choosing sync instead of fork.

Goal plan:
docs/plans/2026-05-30-sync-shadcn-codeblock-wrapper.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- browser

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`

Completion threshold:
Complete when `apps/www/src/components/code-block-wrapper.tsx` uses upstream
top-right expand/collapse controls, separator, bottom gradient trigger,
closed-state `content-visibility:auto`, and cleaner figure/pre handling while
preserving Plate `full`, `open`, and `expandButtonTitle`; the dashboard row is
`synced`; dashboard artifacts are regenerated; `lastSyncedCommit` remains
unchanged; typecheck, lint, JSON/script checks, source audit, browser proof,
and autogoal completion pass.

Verification surface:
- `apps/www/src/components/code-block-wrapper.tsx`
- `apps/www/src/components/mdx-components.tsx`
- `apps/www/src/components/component-source.tsx`
- `../shadcn/apps/v4/components/code-collapsible-wrapper.tsx`
- `docs/sync/shadcn/deltas.json`
- `docs/sync/shadcn/dashboard.json`
- `docs/sync/shadcn/dashboard.html`
- `docs/sync/shadcn/status.json`

Constraints:
- Do not run `build:registry`.
- Do not edit generated registry/template output.
- Do not advance `lastSyncedCommit`; this is a partial row apply.
- Do not remove Plate-only `full`, `open`, or `expandButtonTitle` support.
- Use browser proof because this touches visible docs UI.

Boundaries:
- In scope: wrapper component, dashboard metadata, dashboard generation, focused
  verification, browser proof, and this goal plan.
- Out of scope: broader MDX component adoption, content rewrites, package
  changes, upstream full-range planning, registry output, and baseline
  advancement.

Output budget strategy:
Use focused file reads and `rg` audits only. Avoid broad upstream diffs; the
accepted row already names the upstream and Plate owner files. Keep browser
proof to one docs route that renders `ComponentSource`.

Blocked condition:
Blocked only if the wrapper cannot preserve Plate props while compiling, the
dashboard cannot regenerate, or browser proof cannot load a docs page using
`ComponentSource` after a real repair attempt.

Sync state:
- base commit: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- target commit: `efdec3ca4523e5edd8a714f633002a7addc203a1`
- range kind: accepted dashboard row implementation
- run directory: N/A for apply mode
- implementation status: complete
- baseline status: unchanged

Current verdict:
- verdict: complete
- confidence: high
- recommended next owner: sync-shadcn
- reason: upstream wrapper behavior is implemented, Plate props are preserved,
  row state is synced, and focused verification passed

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | Active goal created for the accepted row implementation. |
| `sync-shadcn` skill/rule read | yes | User supplied the skill body and row came from dashboard apply flow. |
| Output budget strategy recorded before broad upstream commands | yes | Focused row files only; no broad upstream diff. |
| `docs/sync/shadcn/status.json` read | yes | Baseline fields read and checked unchanged. |
| `docs/sync/shadcn/decisions.md` read | yes | Durable Plate docs sync policy read before implementation. |
| Prior migration plans/solution notes checked | yes | Memory confirmed `../shadcn/apps/v4` as the upstream reference and Plate docs has product-owned forks. |
| `../shadcn` clone exists and was fetched/pulled intentionally | yes | Existing clone file `../shadcn/apps/v4/components/code-collapsible-wrapper.tsx` read. |
| Base and target refs resolved to exact SHAs | no | Direct row implementation used existing dashboard target; no new range plan. |
| Base ancestry or ref problem proven | no | Direct row implementation used existing dashboard target; no new range plan. |
| Planning-only vs implementation mode decided | yes | User said `ok go` after choosing sync; implementation mode active. |
| User-review boundary recorded | yes | User accepted the row; no additional review stop before implementation. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Read upstream wrapper implementation.
- [x] Read Plate wrapper implementation.
- [x] Found local wrapper entry points and prop usage.
- [x] Ported upstream wrapper behavior while preserving Plate props.
- [x] Marked `codeblock-collapsible-wrapper` synced in `deltas.json`.
- [x] Regenerated dashboard artifacts.
- [x] Ran source audit, JSON/script checks, typecheck, lint, and browser proof.
- [x] Recorded final evidence and closeout status.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove implementation, synced row, and verification | Source audit, dashboard JSON, typecheck, lint, and browser proof passed. |
| Upstream range artifacts exist | no | Apply-mode row implementation exception | No new run artifacts required. |
| Inventory completeness | no | Apply-mode row implementation exception | Row came from existing dashboard inventory. |
| Decision accounting | yes | Verify only accepted row changed | `codeblock-collapsible-wrapper` is the only row intentionally changed in this slice. |
| Status JSON parse and semantics | yes | Verify baseline unchanged | `lastSyncedCommit` remains `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`. |
| Source-backed Plate mapping | yes | Audit wrapper props and upstream behavior | `rg` found `Separator`, top-right control, `content-visibility:auto`, bottom gradient, and preserved props. |
| Visual comparison screenshots | yes | Browser-proof a docs page using the wrapper | `/docs/kbd` loaded with source wrapper class present, source content present, and no Next error overlay. |
| Planning-only no implementation edits | no | Implementation accepted | User said `ok go`. |
| Accepted implementation verification | yes | Run focused typecheck/lint/source/browser proof | Verification commands listed below passed. |
| Browser surface changed | yes | Browser proof required | In-app browser loaded `http://localhost:3004/docs/kbd`; GET returned 200. |
| Package manifests, lockfile, or install graph changed | no | No package changes | No install graph command needed. |
| Agent rules or skills changed | no | No agent source edits | No generated skill sync needed. |
| CI-controlled generated output | yes | Avoid registry/template generation | No registry build was run; only sync dashboard artifacts regenerated. |
| Baseline advancement | no | Keep baseline unchanged | Partial row apply cannot advance `lastSyncedCommit`. |
| User review boundary | yes | User accepted implementation | `ok go` after sync/fork decision. |
| Output budget discipline | yes | Keep evidence focused | One accidental broad `ps` output occurred; recovery recorded below and no further broad process output used. |
| Goal plan complete | yes | Run autogoal completion check | Ready for final closeout command. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | Source files and row context read | none |
| Implementation | done | Wrapper source updated | none |
| Sync metadata | done | Dashboard row marked synced and regenerated | none |
| Verification | done | Typecheck, lint, JSON, source, and browser checks passed | none |
| Closeout | done | This plan records final evidence | none |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| synced | 1 | `codeblock-collapsible-wrapper` implemented and verified. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Codeblock collapsible wrapper implementation | synced | `apps/www/src/components/code-block-wrapper.tsx`, `docs/sync/shadcn/deltas.json` | Upstream wrapper behavior is better; Plate props remain local API. | Passed. |

Questions:
- N/A.

Findings:
- Plate had two wrapper entry points: MDX `CodeBlockWrapper` and `ComponentSource`.
- Current content renders `ComponentSource` with `full` by default, so browser proof validates the current visible full branch; collapsed branch behavior is source-audited because no current docs content directly renders the non-full wrapper.

Decisions and tradeoffs:
- `synced` is the right dashboard state. This is not a fork because upstream behavior is adopted; the preserved Plate props are local API compatibility, not a deliberate divergent implementation.
- `lastSyncedCommit` remains unchanged because this is one dashboard row, not full-range accounting.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad process inspection printed an unrelated long process argument | 1 | Stop process-argument inspection and return to focused source/JSON/browser evidence | Recovered; no further broad process output used. |
| Autoreview helper produced no output and was killed | 1 | Report the blocked helper honestly; rely on focused verification and source review for this slice | Helper was not counted as a clean review result. |

Verification evidence:
- `pnpm sync-shadcn dashboard` passed and regenerated `docs/sync/shadcn/dashboard.html` plus `docs/sync/shadcn/dashboard.json`.
- `node -e` JSON parse passed for `deltas.json`, `dashboard.json`, and `status.json`.
- `node --check .agents/rules/sync-shadcn/scripts/build-dashboard.mjs` passed.
- Focused `rg` source audit found the imported `Separator`, top-right control, `content-visibility:auto`, bottom `from-code/70` gradient, preserved `full`, preserved `open`, preserved `expandButtonTitle`, and synced dashboard row state.
- `pnpm --filter www typecheck` passed after lint formatting.
- `pnpm lint:fix` passed after checking 3154 files and formatting two files.
- Browser proof on `http://localhost:3004/docs/kbd`: page title `Kbd - Plate`, `basic-marks-kit` source content present, 12 code surfaces found, one wrapper class sample `md:-mx-1 relative overflow-hidden rounded-md`, no Next error overlay text, and dev server logged `GET /docs/kbd 200`.

Final handoff:
- Range: direct dashboard row apply.
- Plan artifact: `docs/plans/2026-05-30-sync-shadcn-codeblock-wrapper.md`
- Inventory artifact: N/A apply-mode row implementation.
- Decision counts: one synced row.
- Recommended first slice: N/A; slice implemented.
- Review request: N/A; user accepted with `ok go`.
- Question: N/A.
- Status JSON: unchanged.
- Verification: passed except autoreview helper blocked with no output.
- Baseline: unchanged.

Timeline:
- Goal created for accepted sync row.
- Upstream and Plate wrapper files read.
- Wrapper implemented with upstream behavior and preserved Plate props.
- Dashboard row marked synced and regenerated.
- Typecheck, lint, JSON/script, source, and browser proof passed.
- Autoreview helper attempted, hung without output, and was killed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementation and verification are complete. |
| Where am I going? | Run autogoal completion check, close goal, and hand off. |
| What is the goal? | Sync the codeblock collapsible wrapper row. |
| What have I learned? | The visible current route exercises the `full` branch; the collapsed branch is future-facing for direct MDX wrapper usage. |
| What have I done? | Implemented wrapper behavior, synced metadata, regenerated dashboard, and verified. |

Open risks:
- Autoreview helper did not return a clean result. Focused source review and verification passed, and there are no known actionable issues in this slice.
