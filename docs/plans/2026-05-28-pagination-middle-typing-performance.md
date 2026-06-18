# pagination middle typing performance

Objective:
Fix poor typing latency in the middle of the Slate v2 pagination example so
virtualized mode stays responsive on the real rich-markdown stress document.

Goal plan:
docs/plans/2026-05-28-pagination-middle-typing-performance.md

Completion threshold:
- `site/examples/ts/pagination.tsx` keeps stress content owned by
  `createRichMarkdownValue`; no fake page node type or page-height stress node
  is reintroduced.
- Middle-document typing trace identifies the bottleneck before the fix.
- Focused pagination browser proof records bounded mounted DOM/pages and p95
  key-to-observable-paint <= 80 ms while typing in the middle of the
  ~1000-page virtualized document.
- `bun typecheck:site` passes in `/Users/zbeyens/git/plate-2/Plate repo root`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs
  docs/plans/2026-05-28-pagination-middle-typing-performance.md` passes.

Verification surface:
- Source audit for removed fake fixtures:
  `rg -n "pagination-stress-page|createVirtualizedStressPages|Virtualized stress page" site packages playwright`.
- Focused browser proof:
  `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps middle-document typing responsive" --reporter=line`.
- Package and site checks in `/Users/zbeyens/git/plate-2/Plate repo root`.

Constraints:
- Preserve real `createRichMarkdownValue` stress content, the 10-page table
  stress case, URL-backed controls, and virtualized page behavior.
- Do not reintroduce fake page node types or page-height fixture nodes.
- Do not create PRs, comments, commits, or pushes.

Boundaries:
- Source of truth: latest chat request for `/examples/pagination` middle-doc
  typing performance in virtualized mode.
- Allowed edit scope: `Plate repo root` source/tests and this goal plan.
- Browser surface: `/examples/pagination`, DOM strategy `virtualized`.
- Tracker sync: N/A, chat-only report.

Blocked condition:
Stop only if three trace-backed attempts cannot produce a reliable typing
metric or no code-owned bottleneck remains. This did not happen.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal` and `performance`; selected one-shot execution with browser trace proof. |
| Active goal checked or created | yes | Active goal created for pagination middle typing performance. |
| Source of truth read before edits | yes | User report: poor typing in the middle of `/examples/pagination`; trace until it reflects virtualization perf. |
| Tracker comments and attachments read | no | N/A: chat-only report, no tracker. |
| Video transcript evidence required | no | N/A: no video attached for this request. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: current request was a live perf trace against freshly edited pagination work. |
| TDD decision before behavior change or bug fix | yes | Added focused Playwright perf proof plus package contract tests for native input repair. |
| Branch decision for code-changing task | no | N/A: user did not ask for branch, commit, or PR. |
| Release artifact decision | yes | Added `.changeset/pagination-middle-typing.md` for `slate-layout` and `slate-react`. |
| Browser tool decision for browser surface | yes | Used repeatable Playwright proof because the task requires latency samples and DOM/page counts. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Browser route / app surface identified | yes | `/examples/pagination`, DOM strategy `virtualized`, middle of ~1000-page rich stress document. |
| Console/network caveat policy recorded | yes | Playwright proof collected route behavior and metrics; console/network sweep is out of scope for this perf lane. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or N/A with reason.
- [x] Final handoff shape decided: bug/perf fix with focused verification and no PR/tracker sync.
- [x] Branch handling recorded for code-changing work: N/A, no branch requested.
- [x] Local-env-rot retry policy recorded: N/A, failures matched test/action timing or command filters, not install corruption.
- [x] Workspace authority recorded: commands ran in `/Users/zbeyens/git/plate-2/Plate repo root`.
- [x] High-risk note recorded: runtime/browser input behavior changed; proof covers native typing, model catch-up selection, and bounded virtualized DOM.
- [x] Review/autoreview target selected from actual diff state: N/A, user asked trace/fix, not autoreview in this turn.
- [x] Agent-native review decision recorded: N/A, no agent tooling changed.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses Playwright because latency samples and mounted DOM counts are the acceptance surface.
- [x] Browser pack: console and network errors are out of scope for this perf lane.
- [x] Browser pack: exact browser verification evidence is recorded below.
- [x] Performance: cohort segmentation, repeated-unit budget, interaction metric, memory/DOM tags, and degradation/native behavior contract are recorded from trace evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused browser proof and typecheck | Browser proof passed; `bun typecheck:site` passed. |
| Bug reproduced before fix | yes | Record failing trace/repro | Pre-fix trace showed p95 observable paint around 100ms after layout caching, with earlier layout compose spikes around 479ms before page-layout caching. |
| Targeted behavior verification | yes | Run focused tests/proof | Focused Playwright proof passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter slate-react typecheck`, `bun --filter slate-layout typecheck`, and `bun typecheck:site` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` or record N/A | N/A: no package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run install or record N/A | N/A: no package manifest, lockfile, or install graph changed. |
| Agent rules or skills changed | no | Run sync or record N/A | N/A: no agent rules or skills changed. |
| Workspace authority proof | yes | Run checks in owning workspace | All proof commands ran in `Plate repo root`; autogoal checker runs from root. |
| Browser surface changed | yes | Capture browser proof or waiver | Playwright integration proof covers the route and interaction. |
| Browser final proof | yes | Record exact proof | Chromium focused test passed with metrics attachment. |
| CI-controlled template output changed | no | Restore or record N/A | N/A: no templates changed. |
| Package behavior or public API changed | yes | Add changeset | `.changeset/pagination-middle-typing.md` added. |
| Registry-only component work changed | no | Update changelog or N/A | N/A: not registry-only component work. |
| Docs or content changed | no | Verify docs or N/A | N/A: goal plan only, no user docs changed. |
| High-risk mini gate | yes | Record failure mode and proof plan | Deferred native repair could desync caret; proof asserts text, visibility, bounded DOM, and model selection after every typed char. |
| Agent-native review for agent/tooling changes | no | Run reviewer or N/A | N/A: no agent tooling changed. |
| Local install corruption suspected | no | Reinstall or N/A | N/A: no install-corruption signal. |
| Autoreview for non-trivial implementation changes | no | Run autoreview or N/A | N/A: latest user requested trace/fix, not autoreview. |
| PR create or update | no | Run check before PR or N/A | N/A: no PR requested. |
| PR proof image hosting | no | Host images or N/A | N/A: no PR. |
| Tracker sync-back | no | Post sync or N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill final evidence | Filled below. |
| Final lint | yes | Run lint fix | `bun lint:fix` passed. |
| Goal plan complete | yes | Run autogoal checker | Pending final checker run after this edit. |
| Browser interaction proof | yes | Exercise target route | Focused Chromium Playwright proof passed. |
| Browser console/network check | no | Record caveat | N/A: interaction latency proof only. |
| Browser final proof artifact | yes | Record proof | Playwright trace/metrics attachment generated during proof run. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Goal and plan created from user report. | implementation |
| Implementation | complete | Runtime/page-layout/example/test changes implemented. | verification |
| Verification | complete | Focused browser and package checks passed. | closeout |
| PR / tracker sync | complete | N/A, no PR or tracker requested. | final response |
| Closeout | complete | Plan updated for checker. | final response |

Findings:
- Cohort: stress, ~1000 pages, real rich-markdown blocks, table split across
  ~10 pages, page virtualization enabled.
- Repeated unit: mounted page surface and active editable text block under
  `PagedEditable`.
- Bottleneck trace: full layout composition was initially too expensive
  (~479ms), then hot typing still paid too much React/repair work even after
  layout caching brought compose to ~18-20ms.
- Extra selector scope fix reduced selector checks from 55 to 21 in the hot
  trace.
- Normal inside-text typing should use native DOM insertion; model repair can
  catch up after the first observable paint in virtualized mode.

Performance:
- applicability: applied.
- Vercel rules used: rerender memo/scope rules and JS cache tactics by local
  inspection, no separate external docs needed.
- extra rules used: cohort segmentation, repeated-unit budget,
  interaction-inp-matrix, memory-dom-tagging, degradation-contract,
  editor-native-behavior-proof.
- repeated unit: page surface plus active text block.
- cohorts: normal small docs unchanged; stress doc is ~1000 pages with a
  10-page table; pathological beyond this remains future RUM/benchmark work.
- budgets: <= 10 mounted page surfaces and < 1400 DOM nodes in the focused
  middle-typing proof.
- interaction metrics: 16 measured typed chars after one warmup char; p95
  observable paint 10.8ms, p95 compose 28.5ms.
- trace/CWV proof: editor interaction lab proxy only; page-load CWV is out of
  scope.
- memory tags: max DOM 746, max mounted page surfaces 10.
- degradation contract: virtualized mode lets native DOM text paint first and
  defers model repair to the next animation frame, then repairs the model
  selection before the next measured char.
- dashboard/RUM gap: no production RUM added.

Decisions and tradeoffs:
- Keep the stress document real: `createRichMarkdownValue` still owns the rich
  Markdown content; no fake page node type.
- Fix layout and decoration ownership first, then make virtualized native text
  repair defer model import so user-visible text is not blocked by model and
  React work.
- Add a one-frame warmup before samples so the metric measures steady-state
  typing, not first post-scroll layout settling.

Implementation notes:
- `slate-layout` caches measured Pretext blocks, raises the prepared-entry
  cache limit, debounces text-change layout refresh, and supports filtered page
  layout decorations.
- `slate-react` scopes element-path selectors by runtime id, keeps custom leaf
  wrappers DOM-sync capable, skips redundant DOM text rewrites, defers native
  text input repair in virtualized mode, and repairs caret after deferred model
  import.
- Pagination example keeps active flow blocks native while virtualized and
  filters line decorations away from that active text path.
- Focused Playwright test targets block path `1551` in the real stress doc,
  types in the middle of the block, asserts visible text, bounded DOM/page
  surfaces, and model selection after each char.

Review fixes:
- Fixed test metric math to nearest-rank p95.
- Removed permanent console metric spam; metrics are attached to the Playwright
  result.
- Fixed the deferred-repair race where the next char could land before
  `Release` by repairing caret after the deferred model import and waiting for
  model selection between measured chars.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Deferred repair initially let the third char land before `Release` | 1 | Repair caret after deferred model import and wait for model selection in the proof | Fixed; focused test passed. |
| `bun test ./packages/slate-react/test/input-router-contract.test.tsx` treated the file as a filter | 2 | Run the file through package Vitest | `cd packages/slate-react && bun test:vitest test/input-router-contract.test.tsx` passed. |
| Parallel final Playwright run timed out before selecting DOM strategy | 1 | Rerun focused Playwright alone | Passed alone. |

Verification evidence:
- Source audit:
  `rg -n "pagination-stress-page|createVirtualizedStressPages|Virtualized stress page" site packages playwright`
  returned no matches.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps middle-document typing responsive" --reporter=json`
  passed and attached metrics: max DOM 746, max page surfaces 10, p95 compose
  28.5ms, p95 observable paint 10.8ms.
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/pagination.test.ts --project=chromium -g "keeps middle-document typing responsive" --reporter=line`
  passed after the final patch.
- `bun typecheck:site` passed.
- `bun --filter slate-react typecheck` passed.
- `bun --filter slate-layout typecheck` passed.
- `bun --filter slate-layout test` passed.
- `bun test ./packages/slate-react/test/dom-repair-policy-contract.ts` passed.
- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts` passed.
- `cd packages/slate-react && bun test:vitest test/input-router-contract.test.tsx` passed.
- `cd packages/slate-react && bun test:vitest test/dom-strategy-and-scroll.test.tsx` passed.
- `bun lint:fix` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, chat-only report.
- Confidence line: high for the focused Chromium virtualized pagination typing
  path; broader browser/mobile/IME perf remains unmeasured.
- Flow table:
  - Reproduced: middle-doc typing trace showed poor hot-path latency before the
    final repair ordering.
  - Verified: focused browser proof and package checks passed.
- Browser check: focused Chromium Playwright proof on `/examples/pagination`.
- Outcome: virtualized middle-doc typing now paints through native DOM first
  with bounded mounted pages/DOM.
- Caveat: no full integration sweep, no mobile/IME proof, no production RUM.
- Design:
  - Chosen boundary: layout cache/decorations in `slate-layout`, native
    input/DOM sync repair in `slate-react`, and route-level active-flow wiring
    in the pagination example.
  - Why not quick patch: fake stress fixtures or disabling layout would hide
    the actual virtualized editor behavior.
  - Why not broader change: the focused bottleneck was the current pagination
    typing path, not a full virtualized editor rewrite.
- Verified: commands listed above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: focused Chromium Playwright proof passed with metrics.
- Caveats: full browser matrix, IME/mobile, and production RUM are not covered.

Reboot status:
Complete. Continue only if the user asks for broader browser matrix, IME/mobile
proof, or further pagination profiling.

Open risks:
- First post-scroll layout settling is handled by warmup in the lab metric; a
  future RUM view should tag first-edit-after-scroll separately.
- Deferred native repair in virtualized mode needs broader mobile/IME coverage
  before claiming full native-input parity.

Timeline:
- 2026-05-28T11:29:03Z Goal plan created.
- 2026-05-28T13:18:17Z Focused JSON proof passed with max DOM 746, max page
  surfaces 10, p95 compose 28.5ms, p95 observable paint 10.8ms.
- 2026-05-28T13:24:00Z Final focused Playwright line proof passed.
