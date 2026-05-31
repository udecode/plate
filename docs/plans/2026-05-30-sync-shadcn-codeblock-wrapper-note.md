# sync shadcn codeblock wrapper note

Objective:
Apply the dashboard metadata request for
`mdx/codeblock-collapsible-wrapper`: keep the row in `pending`, ensure the note
reads `Pull upstream wrapper behavior first; keep Plate full/open/expandButtonTitle support.`, regenerate the dashboard view, and verify no baseline or implementation state changed.

Flow mode:
One-shot `sync-shadcn apply` metadata update. This is not implementation mode
because the target state is `pending`.

Goal plan:
docs/plans/2026-05-30-sync-shadcn-codeblock-wrapper-note.md

Primary template:
docs/plans/templates/sync-shadcn.md

Applied packs:
- none

Sync source:
- upstream repo: `shadcn-ui/ui`
- upstream clone: `../shadcn`
- upstream app: `../shadcn/apps/v4`
- Plate docs app: `apps/www`
- durable state: `docs/sync/shadcn/status.json`
- durable policy: `docs/sync/shadcn/decisions.md`

Completion threshold:
Complete when `docs/sync/shadcn/deltas.json` and
`docs/sync/shadcn/dashboard.json` both show
`codeblock-collapsible-wrapper` with state `pending` and the requested note,
`pnpm sync-shadcn dashboard` has regenerated the view, JSON parsing passes, and
`docs/sync/shadcn/status.json:lastSyncedCommit` remains unchanged.

Verification surface:
- `docs/sync/shadcn/deltas.json`
- `docs/sync/shadcn/dashboard.json`
- `docs/sync/shadcn/dashboard.html`
- `docs/sync/shadcn/status.json`
- `.agents/rules/sync-shadcn/scripts/build-dashboard.mjs`

Constraints:
- Do not patch `apps/www`; this is a metadata-only pending row.
- Do not mark the row synced before upstream wrapper behavior is implemented.
- Do not change `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, or `partialSyncs`.
- Do not run `build:registry`.

Boundaries:
- In scope: confirm or update the row note, regenerate dashboard artifacts, and
  verify sync JSON.
- Out of scope: implementing the collapsible wrapper, screenshots, broader MDX
  primitive review, upstream range planning, and baseline advancement.

Output budget strategy:
Use focused JSON extraction and capped source reads only. No upstream diff,
inventory, screenshots, or run artifacts are needed for a direct metadata row.

Blocked condition:
Blocked only if the durable JSON cannot parse, the dashboard generator fails,
or the row cannot be found in both `deltas.json` and `dashboard.json`.

Sync state:
- baseline: unchanged at `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- row state: `pending`
- implementation status: not started; future work must pull upstream wrapper
  behavior while preserving Plate `full`, `open`, and `expandButtonTitle` props

Current verdict:
- verdict: complete
- confidence: high
- recommended next owner: sync-shadcn implementation slice when the user asks
- reason: the requested pending note is already durable and dashboard output was regenerated

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal checked/created | yes | Active goal created for this metadata-only apply request. |
| `sync-shadcn` skill/rule read | yes | User provided the active skill body; apply rules followed. |
| Output budget strategy recorded before broad upstream commands | yes | No broad upstream commands used; focused JSON checks only. |
| `docs/sync/shadcn/status.json` read | yes | Baseline fields read and unchanged. |
| `docs/sync/shadcn/decisions.md` read | yes | Durable policy read before closeout. |
| Prior migration plans/solution notes checked | yes | Memory lookup confirmed `../shadcn/apps/v4` as the upstream reference for Plate docs syncs. |
| `../shadcn` clone exists and was fetched/pulled intentionally | no | Direct metadata apply did not need upstream ref refresh. |
| Base and target refs resolved to exact SHAs | no | No upstream range plan was created for this row. |
| Base ancestry or ref problem proven | no | No upstream range plan was created for this row. |
| Planning-only vs implementation mode decided | yes | Target state is `pending`, so this is metadata-only apply mode. |
| User-review boundary recorded | yes | Wrapper implementation remains a future accepted slice, not part of this request. |

Work Checklist:
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are filled from the active goal.
- [x] Verified the row exists in `docs/sync/shadcn/deltas.json`.
- [x] Verified the row already has state `pending`.
- [x] Verified the row already has the requested suggestion note.
- [x] Regenerated `docs/sync/shadcn/dashboard.html` and `dashboard.json`.
- [x] Parsed `deltas.json` and `dashboard.json`.
- [x] Verified the generated dashboard row keeps state `pending` and the requested note.
- [x] Verified `status.json` baseline fields remained unchanged.
- [x] Recorded that implementation and screenshots are out of scope for this metadata-only apply.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove row state and note in durable and generated JSON | Node extraction returned `pending` and the exact note from both JSON files. |
| Upstream range artifacts exist | no | Record metadata-only exception | No range artifacts needed for target state `pending`. |
| Inventory completeness | no | Record metadata-only exception | No upstream inventory generated. |
| Decision accounting | yes | Confirm only listed row handled | Only `codeblock-collapsible-wrapper` was evaluated. |
| Status JSON parse and semantics | yes | Parse status and verify baseline unchanged | Status fields read with `lastSyncedCommit` unchanged. |
| Source-backed Plate mapping | no | Record implementation deferral | Future source work remains in `apps/www/src/components/code-block-wrapper.tsx`. |
| Visual comparison screenshots | no | Record metadata-only exception | No browser-visible implementation changed. |
| Planning-only no implementation edits | yes | Verify mode did not require `apps/www` edits | Target state `pending`; no implementation patch was made. |
| Accepted implementation verification | no | Record future slice boundary | Implementation not accepted in this request. |
| Browser surface changed | no | Record metadata-only exception | No UI source changed. |
| Package manifests, lockfile, or install graph changed | no | Record metadata-only exception | No package files touched. |
| Agent rules or skills changed | no | Record metadata-only exception | No `.agents/**` source edited. |
| CI-controlled generated output | yes | Avoid registry/template generation | Only sync dashboard artifacts regenerated. |
| Baseline advancement | no | Keep baseline unchanged | `lastSyncedCommit` remains `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`. |
| User review boundary | yes | Keep implementation as future request | Row remains pending with implementation guidance. |
| Output budget discipline | yes | Use focused JSON reads | No broad diff output produced. |
| Goal plan complete | yes | Run autogoal completion check | Recorded in final closeout. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | Status JSON and row read | none |
| Metadata apply | done | Note already matched requested text | none |
| Dashboard regeneration | done | `pnpm sync-shadcn dashboard` passed | none |
| Verification | done | JSON parse and row extraction passed | none |
| Closeout | done | This plan records the evidence | none |

Decision counts:
| Decision | Count | Notes |
|----------|------:|-------|
| metadata-only pending | 1 | `codeblock-collapsible-wrapper` remains pending with implementation guidance. |

Recommended merge slices:
| Order | Slice | Class | Files | Why | Verification |
|------:|-------|-------|-------|-----|--------------|
| 1 | Codeblock collapsible wrapper implementation | smart-merge | `apps/www/src/components/code-block-wrapper.tsx`, `../shadcn/apps/v4/components/code-collapsible-wrapper.tsx` | Pull upstream wrapper behavior while preserving Plate `full`, `open`, and `expandButtonTitle`. | Future source audit, focused typecheck, lint, and screenshots if visual behavior changes. |

Questions:
- N/A.

Findings:
- The requested note was already present in `deltas.json`; dashboard regeneration confirmed it in generated JSON too.

Decisions and tradeoffs:
- Kept the row pending because the user explicitly requested `pending -> pending`; marking it synced before implementation would be fake progress.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm sync-shadcn dashboard` passed.
- `node --check .agents/rules/sync-shadcn/scripts/build-dashboard.mjs` passed.
- Node parsed `docs/sync/shadcn/deltas.json` and `docs/sync/shadcn/dashboard.json`.
- Node extraction showed `codeblock-collapsible-wrapper` is `pending` in both JSON files with the exact requested suggestion.
- Status JSON read showed baseline fields unchanged.

Final handoff:
- Range: N/A metadata-only dashboard apply.
- Plan artifact: `docs/plans/2026-05-30-sync-shadcn-codeblock-wrapper-note.md`
- Inventory artifact: N/A metadata-only dashboard apply.
- Decision counts: 1 metadata-only pending row.
- Recommended first slice: future codeblock wrapper smart-merge.
- Review request: N/A; user already supplied the pending decision.
- Question: N/A.
- Status JSON: unchanged.
- Verification: passed.
- Baseline: unchanged.

Timeline:
- 2026-05-30T22:22:25.678Z Sync Shadcn goal plan created.
- Dashboard row and baseline inspected.
- Dashboard regenerated and JSON verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | No remaining work for this request. |
| What is the goal? | Keep `codeblock-collapsible-wrapper` pending with the requested note and regenerated dashboard. |
| What have I learned? | The requested note was already durable before regeneration. |
| What have I done? | Regenerated dashboard, verified row state/note, verified status baseline unchanged. |

Open risks:
- None for this metadata-only apply. The actual wrapper implementation remains future work.
