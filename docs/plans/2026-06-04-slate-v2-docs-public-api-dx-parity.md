# Slate v2 docs public API DX parity

Objective:
Run one Slate automation loop to make Slate v2 docs and public API DX closer to classic Slate where it is a true improvement, while keeping v2's higher architecture bar.

Completion threshold:
- Prompt requirements are captured as checkable rows.
- Classic Slate docs/API surface is compared against Slate v2.
- Safe Slate-close public API aliases are added only where semantics are exact.
- Deliberate non-parity remains documented by proof or existing contracts.
- Missing high-value docs pages from classic Slate become current-state v2 docs, not stale migration prose.
- Focused package/docs verification passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-slate-v2-docs-public-api-dx-parity.md` passes.

Verification surface:
- `.tmp/slate-v2`: `bun --filter slate-react typecheck`
- `.tmp/slate-v2`: `cd packages/slate-react && bun vitest run --config ./vitest.config.mjs test/surface-contract.test.tsx test/generic-react-editor-contract.tsx`
- `.tmp/slate-v2`: `bun --filter slate-react build`
- `.tmp/slate-v2`: `bun test ./packages/slate/test/format-debug-value-contract.ts`
- `plate-2`: `pnpm docs:slate-v2:audit`
- Source audits with `rg`, doc-path diff, `git diff --check`, and trailing-whitespace scan.

Constraints:
- Closest possible to classic Slate does not mean preserving every legacy API.
- Do not export `ReactEditor`, `DOMEditor`, `withReact`, `withHistory`, or root editor mutation APIs.
- Keep Slate v2 unopinionated; Plate owns product opinion.
- Docs must describe current API state, not public changelog/migration prose.
- Slate v2 is continuous private alpha; no changeset/release/publish step unless explicitly requested.
- No branch, commit, push, PR, or GitHub mutation.

Boundaries:
- Source of truth: `.tmp/slate-v2` live source, docs, and tests.
- Legacy reference: `../slate` docs and package public surface.
- Edited package/API owner: `.tmp/slate-v2/packages/slate-react`.
- Edited docs owner: `.tmp/slate-v2/docs`.
- Browser surface: N/A; no route/editor runtime behavior changed.
- Non-goals: migration guide rewrite, bundled UMD source docs, pagination/perf work, release readiness, PR body work.

Blocked condition:
- None for this loop. Remaining broader API redesign belongs to `slate-plan` if the next step is more than safe aliases/docs.

Task state:
- task_type: Slate v2 docs and public API DX loop
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until final close

Current verdict:
- verdict: complete for this loop
- confidence: high for alias/docs packet; medium for total API parity because a deeper API plan could still find larger surfaces
- next owner: `slate-plan` only if pursuing bigger public API shape changes
- reason: safe Slate-close aliases and current-state docs were patched and verified; legacy mutation APIs remain intentionally cut

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements copied below: docs and public API DX, closest possible to Slate, keep v2 perfect, do not lower bar. |
| Skill analysis before edits | yes | Read `slate-automation`, `autogoal`, `slate-north-star`, `slate-plan`, and `docs/slate-v2/agent-start.md`. |
| Active goal checked or created | yes | `get_goal` returned none; created this Slate v2 API/docs DX goal. |
| Source of truth read before edits | yes | Read `.tmp/slate-v2` docs/API surfaces and `../slate` reference docs/API surfaces. |
| Docs pack selected | yes | Docs changed under `.tmp/slate-v2/docs`. |
| Package/API pack selected | yes | Public barrel changed in `packages/slate-react/src/index.ts`. |
| Release artifact decision | yes | N/A: Slate v2 private alpha; no release/publish/changeset requested. |
| Browser tool decision | yes | N/A: public exports and docs only; no visible route/runtime behavior changed. |
| Output budget strategy recorded | yes | Used scoped `sed`, `rg`, and doc-path diff; no giant repo dumps. |

Work Checklist:
- [x] First checkpoint captured explicit requirements: use `slate-automation`; improve docs and public API DX; keep it as close as possible to Slate; do not lower v2's architecture bar.
- [x] Compared classic Slate docs tree against `.tmp/slate-v2/docs`.
- [x] Compared `slate-react` public export shape against classic Slate and existing v2 surface contracts.
- [x] Added safe Slate-close hook aliases only for exact existing v2 equivalents.
- [x] Kept non-equivalent legacy APIs cut: `ReactEditor`, `DOMEditor`, `withReact`, `withHistory`, and root editor mutation APIs.
- [x] Added type coverage for new aliases in the existing generic React editor contract.
- [x] Added current-state docs for debug value scrubbing.
- [x] Added current-state docs at old `with-react`, `with-history`, and `history-editor` paths without resurrecting wrapper APIs.
- [x] Updated Slate React hook docs with the alias/equivalent matrix.
- [x] Updated docs nav and proof map.
- [x] Marked the old changelog page as historical so stale old API statements do not read as current v2 truth.
- [x] Intentionally skipped `concepts/xx-migrating.md` and `walkthroughs/08-using-the-bundled-source.md` as migration/distribution docs, not current v2 API reference.
- [x] Recorded no changeset/release artifact because Slate v2 is private alpha and no ship/release/publish prompt was given.
- [x] Verified from the owning `.tmp/slate-v2` package and parent docs audit.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Public API / package boundary proof | yes | Source-audit public exports and existing surface contracts | `packages/slate-react/src/index.ts` exports only safe aliases; surface test still asserts no `ReactEditor`, `DOMEditor`, or `withReact` root export. |
| Package typecheck/build/test | yes | Run owning package proof | `bun --filter slate-react typecheck` passed; `bun --filter slate-react build` passed; focused surface vitest passed. |
| Docs source-backed claim audit | yes | Verify docs claims against source/tests | Docs proof map points new pages to `format-debug-value`, `with-react`, `slate-history`, and type contract sources. |
| Docs audit | yes | Run Slate v2 docs audit | `pnpm docs:slate-v2:audit` passed. |
| Debug scrubber proof | yes | Run focused core test for the new API doc | `bun test ./packages/slate/test/format-debug-value-contract.ts` passed. |
| Browser proof | no | Browser proof applies to route/runtime behavior | N/A: no UI/runtime behavior changed. |
| Release artifact classification | yes | Record changeset decision | N/A: Slate v2 private alpha; no release/publish/ship prompt. |
| Barrel/export generation | no | Run generated barrel command only when repo owns one | N/A: direct package public barrel edited; no parent `pnpm brl` owner for `.tmp/slate-v2`. |
| Autoreview | no | Optional for this small API/docs packet | N/A: focused source contracts and docs audit cover the changed surface. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-slate-v2-docs-public-api-dx-parity.md` | Pending final check. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read skills, north-star, agent-start, Slate Plan, docs/API surfaces in v2 and classic Slate. | implementation |
| Implementation | complete | Added safe aliases and current-state docs. | verification |
| Verification | complete | Package typecheck/build/focused tests/docs audit passed. | closeout |
| Closeout | complete | Plan updated with evidence. | final response |

Packet ledger:
| Packet | Owner | Decision | Evidence | Reason |
|--------|-------|----------|----------|--------|
| Slate-close hook aliases | `slate-react` package API | keep | Typecheck, focused surface vitest, build | Exact v2 equivalents improve Slate-close DX without restoring legacy mutation APIs. |
| Current-state compatibility docs | Slate v2 docs | keep | Docs audit, source `rg`, proof map | Old high-value paths no longer 404 and now teach v2 APIs. |
| Migration/bundled-source docs | Slate v2 docs | defer/skip | Doc-path diff leaves only those two missing paths | They are historical migration/distribution docs, not current v2 public API reference. |

Changed list:
- code/runtime/API: `packages/slate-react/src/index.ts` exports `useSlateStatic`, `useComposing`, `useFocused`, `useReadOnly`, `useSelected`, `useSlateSelection`, `useSlateSelector`, and `useElementIf`.
- tests/oracles: `packages/slate-react/test/generic-react-editor-contract.tsx` proves the aliases are typed and keeps `withReact` cut.
- docs: added `docs/api/scrubber.md`, `docs/libraries/slate-react/with-react.md`, `docs/libraries/slate-history/with-history.md`, and `docs/libraries/slate-history/history-editor.md`.
- docs: updated `docs/Summary.md`, Slate React/History READMEs, hook docs, proof map, and historical changelog banner.
- benchmarks/metrics: none.
- skills/workflow: none.
- reverted/quarantined packets: none.

Needs your attention:
- Inspect closely: the new hook aliases in `.tmp/slate-v2/packages/slate-react/src/index.ts`. Recommendation: accept; they are exact equivalents and type-proved.
- Inspect closely: the old-path docs for `with-react`, `with-history`, and `history-editor`. Recommendation: accept; they keep URL/DX familiarity while teaching the v2 API.
- Defer: `concepts/xx-migrating.md` and `walkthroughs/08-using-the-bundled-source.md`. Recommendation: keep out unless you explicitly want migration/distribution docs.

Stopping checkpoints to unblock:
- None. Larger public API compatibility beyond safe aliases should start a `slate-plan` lane.

Findings:
- Classic Slate had docs pages for `withReact`, `withHistory`, `HistoryEditor`, and `Scrubber`; v2 had no equivalent pages.
- V2 already had a strict surface test that blocks root `ReactEditor`, `DOMEditor`, and `withReact` exports, so those were not safe parity candidates.
- V2 had exact hook equivalents for several classic Slate React names, but did not export the familiar aliases.
- The historical changelog carried old hook rename text that can be mistaken for current v2 API unless clearly labeled.

Decisions and tradeoffs:
- Add safe aliases when behavior is exact.
- Do not alias APIs that imply wrapper/mutation architecture.
- Add docs at old paths when they can teach current state.
- Do not add migration/bundled-source pages in this loop.

Verification evidence:
- `.tmp/slate-v2`: `bun --filter slate-react typecheck` passed after formatting.
- `.tmp/slate-v2`: `cd packages/slate-react && bun vitest run --config ./vitest.config.mjs test/surface-contract.test.tsx test/generic-react-editor-contract.tsx` passed with 29 tests.
- `.tmp/slate-v2`: `bun --filter slate-react build` passed.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/format-debug-value-contract.ts` passed with 4 tests.
- `plate-2`: `pnpm docs:slate-v2:audit` passed.
- `.tmp/slate-v2`: `git diff --check` passed for tracked touched files.
- `.tmp/slate-v2`: trailing-whitespace scan over touched tracked and new docs returned no hits.
- Doc-path diff now leaves only `concepts/xx-migrating.md` and `walkthroughs/08-using-the-bundled-source.md` missing from v2.

Reboot status:
- Current loop is complete. If resumed, next owner is `slate-plan` for broader public API compatibility decisions or another docs/API parity packet for migration/distribution docs.

Open risks:
- This was not a full release-readiness run.
- New docs pages were not rendered in a browser; the repo docs audit passed, and the changed docs are plain Markdown API reference.
- Safe aliases expand the public API surface. That is intentional for Slate-close DX, but should be reviewed before any eventual release.

Final handoff contract:
- Goal plan path: `docs/plans/2026-06-04-slate-v2-docs-public-api-dx-parity.md`.
- Surface: `.tmp/slate-v2` docs and `slate-react` public API.
- Invocation mode: full-loop, one API/docs packet plus doc-path parity packet.
- Behavior/visual proof: N/A for route behavior; package/docs proof used.
- Primary metric: doc-path parity improved from six missing legacy docs paths to two intentional skips.
- Outcome: safe public aliases plus current-state docs added.
- Caveat: no full browser/docs render or release gate.
