# Plite docs public API DX parity

Objective:
Run one Plite automation loop to make Plite docs and public API DX closer to classic Plite where it is a true improvement, while keeping v2's higher architecture bar.

Completion threshold:
- Prompt requirements are captured as checkable rows.
- Classic Plite docs/API surface is compared against Plite.
- Safe Plite-close public API aliases are added only where semantics are exact.
- Deliberate non-parity remains documented by proof or existing contracts.
- Missing high-value docs pages from classic Plite become current-state v2 docs, not stale migration prose.
- Focused package/docs verification passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-plite-docs-public-api-dx-parity.md` passes.

Verification surface:
- `.tmp/plite`: `bun --filter plite-react typecheck`
- `.tmp/plite`: `cd packages/plite-react && bun vitest run --config ./vitest.config.mjs test/surface-contract.test.tsx test/generic-react-editor-contract.tsx`
- `.tmp/plite`: `bun --filter plite-react build`
- `.tmp/plite`: `bun test ./packages/plite/test/format-debug-value-contract.ts`
- `plate-2`: `pnpm docs:plite:audit`
- Source audits with `rg`, doc-path diff, `git diff --check`, and trailing-whitespace scan.

Constraints:
- Closest possible to classic Plite does not mean preserving every legacy API.
- Do not export `ReactEditor`, `DOMEditor`, `withReact`, `withHistory`, or root editor mutation APIs.
- Keep Plite unopinionated; Plate owns product opinion.
- Docs must describe current API state, not public changelog/migration prose.
- Plite is continuous private alpha; no changeset/release/publish step unless explicitly requested.
- No branch, commit, push, PR, or GitHub mutation.

Boundaries:
- Source of truth: `.tmp/plite` live source, docs, and tests.
- Legacy reference: `../slate` docs and package public surface.
- Edited package/API owner: `.tmp/plite/packages/plite-react`.
- Edited docs owner: `.tmp/plite/docs`.
- Browser surface: N/A; no route/editor runtime behavior changed.
- Non-goals: migration guide rewrite, bundled UMD source docs, pagination/perf work, release readiness, PR body work.

Blocked condition:
- None for this loop. Remaining broader API redesign belongs to `plite-plan` if the next step is more than safe aliases/docs.

Task state:
- task_type: Plite docs and public API DX loop
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until final close

Current verdict:
- verdict: complete for this loop
- confidence: high for alias/docs packet; medium for total API parity because a deeper API plan could still find larger surfaces
- next owner: `plite-plan` only if pursuing bigger public API shape changes
- reason: safe Plite-close aliases and current-state docs were patched and verified; legacy mutation APIs remain intentionally cut

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements copied below: docs and public API DX, closest possible to Plite, keep v2 perfect, do not lower bar. |
| Skill analysis before edits | yes | Read `plite-automation`, `autogoal`, `vision`, `plite-plan`, and `docs/plite/agent-start.md`. |
| Active goal checked or created | yes | `get_goal` returned none; created this Plite API/docs DX goal. |
| Source of truth read before edits | yes | Read `.tmp/plite` docs/API surfaces and `../slate` reference docs/API surfaces. |
| Docs pack selected | yes | Docs changed under `.tmp/plite/docs`. |
| Package/API pack selected | yes | Public barrel changed in `packages/plite-react/src/index.ts`. |
| Release artifact decision | yes | N/A: Plite private alpha; no release/publish/changeset requested. |
| Browser tool decision | yes | N/A: public exports and docs only; no visible route/runtime behavior changed. |
| Output budget strategy recorded | yes | Used scoped `sed`, `rg`, and doc-path diff; no giant repo dumps. |

Work Checklist:
- [x] First checkpoint captured explicit requirements: use `plite-automation`; improve docs and public API DX; keep it as close as possible to Plite; do not lower v2's architecture bar.
- [x] Compared classic Plite docs tree against `.tmp/plite/docs`.
- [x] Compared `plite-react` public export shape against classic Plite and existing v2 surface contracts.
- [x] Added safe Plite-close hook aliases only for exact existing v2 equivalents.
- [x] Kept non-equivalent legacy APIs cut: `ReactEditor`, `DOMEditor`, `withReact`, `withHistory`, and root editor mutation APIs.
- [x] Added type coverage for new aliases in the existing generic React editor contract.
- [x] Added current-state docs for debug value scrubbing.
- [x] Added current-state docs at old `with-react`, `with-history`, and `history-editor` paths without resurrecting wrapper APIs.
- [x] Updated Plite React hook docs with the alias/equivalent matrix.
- [x] Updated docs nav and proof map.
- [x] Marked the old changelog page as historical so stale old API statements do not read as current v2 truth.
- [x] Intentionally skipped `concepts/xx-migrating.md` and `walkthroughs/08-using-the-bundled-source.md` as migration/distribution docs, not current v2 API reference.
- [x] Recorded no changeset/release artifact because Plite is private alpha and no ship/release/publish prompt was given.
- [x] Verified from the owning `.tmp/plite` package and parent docs audit.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Public API / package boundary proof | yes | Source-audit public exports and existing surface contracts | `packages/plite-react/src/index.ts` exports only safe aliases; surface test still asserts no `ReactEditor`, `DOMEditor`, or `withReact` root export. |
| Package typecheck/build/test | yes | Run owning package proof | `bun --filter plite-react typecheck` passed; `bun --filter plite-react build` passed; focused surface vitest passed. |
| Docs source-backed claim audit | yes | Verify docs claims against source/tests | Docs proof map points new pages to `format-debug-value`, `with-react`, `plite-history`, and type contract sources. |
| Docs audit | yes | Run Plite docs audit | `pnpm docs:plite:audit` passed. |
| Debug scrubber proof | yes | Run focused core test for the new API doc | `bun test ./packages/plite/test/format-debug-value-contract.ts` passed. |
| Browser proof | no | Browser proof applies to route/runtime behavior | N/A: no UI/runtime behavior changed. |
| Release artifact classification | yes | Record changeset decision | N/A: Plite private alpha; no release/publish/ship prompt. |
| Barrel/export generation | no | Run generated barrel command only when repo owns one | N/A: direct package public barrel edited; no parent `pnpm brl` owner for `.tmp/plite`. |
| Autoreview | no | Optional for this small API/docs packet | N/A: focused source contracts and docs audit cover the changed surface. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-plite-docs-public-api-dx-parity.md` | Pending final check. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read skills, north-star, agent-start, Plite Plan, docs/API surfaces in v2 and classic Plite. | implementation |
| Implementation | complete | Added safe aliases and current-state docs. | verification |
| Verification | complete | Package typecheck/build/focused tests/docs audit passed. | closeout |
| Closeout | complete | Plan updated with evidence. | final response |

Packet ledger:
| Packet | Owner | Decision | Evidence | Reason |
|--------|-------|----------|----------|--------|
| Plite-close hook aliases | `plite-react` package API | keep | Typecheck, focused surface vitest, build | Exact v2 equivalents improve Plite-close DX without restoring legacy mutation APIs. |
| Current-state compatibility docs | Plite docs | keep | Docs audit, source `rg`, proof map | Old high-value paths no longer 404 and now teach v2 APIs. |
| Migration/bundled-source docs | Plite docs | defer/skip | Doc-path diff leaves only those two missing paths | They are historical migration/distribution docs, not current v2 public API reference. |

Changed list:
- code/runtime/API: `packages/plite-react/src/index.ts` exports `usePliteStatic`, `useComposing`, `useFocused`, `useReadOnly`, `useSelected`, `usePliteSelection`, `usePliteSelector`, and `useElementIf`.
- tests/oracles: `packages/plite-react/test/generic-react-editor-contract.tsx` proves the aliases are typed and keeps `withReact` cut.
- docs: added `docs/api/scrubber.md`, `docs/libraries/slate-react/with-react.md`, `docs/libraries/slate-history/with-history.md`, and `docs/libraries/slate-history/history-editor.md`.
- docs: updated `docs/Summary.md`, Plite React/History READMEs, hook docs, proof map, and historical changelog banner.
- benchmarks/metrics: none.
- skills/workflow: none.
- reverted/quarantined packets: none.

Needs your attention:
- Inspect closely: the new hook aliases in `.tmp/plite/packages/plite-react/src/index.ts`. Recommendation: accept; they are exact equivalents and type-proved.
- Inspect closely: the old-path docs for `with-react`, `with-history`, and `history-editor`. Recommendation: accept; they keep URL/DX familiarity while teaching the v2 API.
- Defer: `concepts/xx-migrating.md` and `walkthroughs/08-using-the-bundled-source.md`. Recommendation: keep out unless you explicitly want migration/distribution docs.

Stopping checkpoints to unblock:
- None. Larger public API compatibility beyond safe aliases should start a `plite-plan` lane.

Findings:
- Classic Plite had docs pages for `withReact`, `withHistory`, `HistoryEditor`, and `Scrubber`; v2 had no equivalent pages.
- V2 already had a strict surface test that blocks root `ReactEditor`, `DOMEditor`, and `withReact` exports, so those were not safe parity candidates.
- V2 had exact hook equivalents for several classic Plite React names, but did not export the familiar aliases.
- The historical changelog carried old hook rename text that can be mistaken for current v2 API unless clearly labeled.

Decisions and tradeoffs:
- Add safe aliases when behavior is exact.
- Do not alias APIs that imply wrapper/mutation architecture.
- Add docs at old paths when they can teach current state.
- Do not add migration/bundled-source pages in this loop.

Verification evidence:
- `.tmp/plite`: `bun --filter plite-react typecheck` passed after formatting.
- `.tmp/plite`: `cd packages/plite-react && bun vitest run --config ./vitest.config.mjs test/surface-contract.test.tsx test/generic-react-editor-contract.tsx` passed with 29 tests.
- `.tmp/plite`: `bun --filter plite-react build` passed.
- `.tmp/plite`: `bun test ./packages/plite/test/format-debug-value-contract.ts` passed with 4 tests.
- `plate-2`: `pnpm docs:plite:audit` passed.
- `.tmp/plite`: `git diff --check` passed for tracked touched files.
- `.tmp/plite`: trailing-whitespace scan over touched tracked and new docs returned no hits.
- Doc-path diff now leaves only `concepts/xx-migrating.md` and `walkthroughs/08-using-the-bundled-source.md` missing from v2.

Reboot status:
- Current loop is complete. If resumed, next owner is `plite-plan` for broader public API compatibility decisions or another docs/API parity packet for migration/distribution docs.

Open risks:
- This was not a full release-readiness run.
- New docs pages were not rendered in a browser; the repo docs audit passed, and the changed docs are plain Markdown API reference.
- Safe aliases expand the public API surface. That is intentional for Plite-close DX, but should be reviewed before any eventual release.

Final handoff contract:
- Goal plan path: `docs/plans/2026-06-04-plite-docs-public-api-dx-parity.md`.
- Surface: `.tmp/plite` docs and `plite-react` public API.
- Invocation mode: full-loop, one API/docs packet plus doc-path parity packet.
- Behavior/visual proof: N/A for route behavior; package/docs proof used.
- Primary metric: doc-path parity improved from six missing legacy docs paths to two intentional skips.
- Outcome: safe public aliases plus current-state docs added.
- Caveat: no full browser/docs render or release gate.
