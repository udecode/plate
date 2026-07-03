# plate-next move composing to view

Objective:
Move editor view state reads to Plite `editor.read.view.*`, starting with Core hotkeys composition state, without adding Plate wrappers.

Explicit requirements:
- User accepted the `editor.api.dom.isReadOnly -> editor.read.view.isReadOnly` direction.
- Answer "anything else to move to `.view`?" through code, not just chat.
- Move composition state to `editor.read.view.isComposing()`.
- Keep DOM APIs as host DOM services, not runtime state reads.
- Avoid compatibility hacks and Plate wrappers around Plite.
- Run focused Plite/Core proof.

Completion threshold:
- Core hotkeys use `editor.read.view.isComposing()`.
- Plite exposes `read.view.isComposing()`.
- Existing DOM/React composition writes sync the Plite view state.
- Existing DOM/React focus/read-only writes sync the Plite view state where this packet touches the same state class.
- Focused source sweeps show no Core `editor.api.dom.isComposing()` call site.
- Focused typecheck/test/lint proof passes or any package-wide unrelated lint debt is recorded.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-move-composing-to-view.md` passes.

Verification surface:
- `pnpm --filter @platejs/plite typecheck`
- `pnpm --filter @platejs/plite-dom typecheck`
- `pnpm --filter @platejs/plite-react typecheck`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts`
- `pnpm exec biome check <touched files>`
- Source sweeps:
  - `rg -n "api\\.dom\\.isComposing|read\\.view\\.isComposing" packages/core/src packages/plite/src packages/plite-dom/src packages/plite-react/src -g '*.ts' -g '*.tsx'`
  - `rg -n "IS_FOCUSED\\.(set|delete)|IS_COMPOSING\\.(set|delete)|IS_READ_ONLY\\.(set|delete)" packages/core/src packages/plite/src packages/plite-dom/src packages/plite-react/src -g '*.ts' -g '*.tsx'`

Constraints:
- No public compat aliases.
- No new Plate `editor.api.*` wrappers for Plite view state.
- Do not hard-cut all DOM APIs in this packet; public DOM API removal is a separate reviewed hard-cut.
- Keep the packet narrow: view-state ownership, hotkeys call site, sync writes, focused proof.

Boundaries:
- Allowed edit scope: Plite state/view interfaces, Plite DOM/React state writers, Core hotkeys, focused Core DOM plugin test.
- Non-goals: broad Core sweep, DOM API public removal, Plate API redesign, browser proof.
- Broad Core drift ledger: N/A, this is a named API packet.
- `pnpm brl`: N/A, no package export/barrel shape changed.

Blocked condition:
- Blocked only if Plite type inference cannot expose `read.view.isComposing()` without reintroducing a Plate/Core wrapper or public compatibility alias. Not blocked.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Capture requirements | done | Explicit requirements section filled |
| Implement Plite view state | done | `EditorStateViewApi`, public state, runtime view updated |
| Sync DOM/React writers | done | Composition, focus, and read-only writers paired with Plite setters |
| Repair Core read path | done | Core hotkeys use `editor.read.view.isComposing()` |
| Prove | done | Proof table below |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Explicit requirements copied above |
| `plate-next` skill read | yes | Active packet follows review-mode Plite boundary law |
| Active goal checked | yes | Goal active for this plan path |
| Mode classified | yes | Named API packet, not broad Core sweep |
| Review target | yes | Best Plate v2 shape on Plite, no legacy compat |
| Output budget strategy | yes | Focused file reads, focused sweeps, no broad streaming |

Work Checklist:
- [x] Add Plite `read.view.isComposing()`.
- [x] Sync React composition writes into Plite view state.
- [x] Sync DOM/React focus writes into Plite view state.
- [x] Sync React read-only prop writes into Plite view state.
- [x] Change Core hotkeys to `editor.read.view.isComposing()`.
- [x] Add focused Core test coverage for view-state ownership.
- [x] Sweep for stale `editor.api.dom.isComposing()`.
- [x] Run focused typecheck/test/lint proof.
- [x] Record package-wide lint caveat.

Review matrix:
| Path / API | Verdict | Owner | Evidence | Next |
|------------|---------|-------|----------|------|
| `packages/plite/src/interfaces/editor.ts` / `EditorStateViewApi` | move-to-plite | Plite | Added `isComposing()` beside existing focus/read-only/root view reads | Keep |
| `packages/plite/src/core/public-state.ts` | move-to-plite | Plite | Added Plite-owned composing/focus/read-only state setters and reads | Keep |
| `packages/plite/src/internal/index.ts` | internal bridge | Plite | Exposes internal setters for DOM/React integration writes | Keep as internal |
| `packages/plite/src/editor-runtime-view.ts` | move-to-plite | Plite | Root views inherit composing/focused state from the runtime editor view | Keep |
| `packages/plite-dom/src/plugin/dom-editor.ts` | sync writer | Plite DOM | Existing focus writes now update Plite view state too | Keep |
| `packages/plite-react/src/editable/input-controller.ts` | sync writer | Plite React | Existing composition write now updates Plite view state | Keep |
| `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts` | sync writer | Plite React | Android composition start/end writes now update Plite view state | Keep |
| `packages/plite-react/src/hooks/focus-plite-editable.ts` | sync writer | Plite React | Focus helper writes now update Plite view state | Keep |
| `packages/plite-react/src/editable/runtime-root-lifecycle.ts` | sync writer | Plite React | Outside-focus release clears Plite view focus | Keep |
| `packages/plite-react/src/editable/selection-reconciler.ts` | sync writer | Plite React | Blur/focus reconciliation writes now update Plite view focus | Keep |
| `packages/plite-react/src/editable/selection-controller.ts` | sync writer | Plite React | Selection import focus state writes now update Plite view focus | Keep |
| `packages/plite-react/src/editable/runtime-root-engine.ts` | sync writer | Plite React | Editable `readOnly` prop now updates Plite view read-only state | Keep |
| `packages/core/src/lib/utils/hotkeys.ts` | hard-cut local Plate DOM state read | Core | Uses `editor.read.view.isComposing()` | Keep |
| `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts` | proof | Core | Locks composing/focus/read-only on `read.view`, auto-scroll on `api.dom` | Keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|----------------------|--------|------------------|
| Editor view state | `editor.read.view.isComposing/isFocused/isReadOnly/root` | `editor.api.dom.isComposing()` as app state read; new Plate wrapper | View state belongs to the editor runtime, DOM API should stay host services | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Decision |
|----------|--------------------|----------|
| Public hard-cut | `api.dom.isComposing/isFocused/isReadOnly` still exist as host DOM API methods | Defer to explicit DOM API hard-cut packet; this packet removes Core's composition-state dependency |

Related sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Hotkeys composition read | `api\\.dom\\.isComposing|read\\.view\\.isComposing` | 3 `read.view` matches, 0 `api.dom.isComposing` in scoped source | 1 Core call site | DOM API surface remains public | Low |
| View-state writer sync | `IS_FOCUSED/IS_COMPOSING/IS_READ_ONLY set/delete` | 13 raw weak-map writes in scoped source | 13 paired with Plite setters where state class applies | DOM weak maps still exist for DOM internals | Medium until DOM API hard-cut |

Proof:
| Command | Result |
|---------|--------|
| `pnpm --filter @platejs/plite typecheck` | pass |
| `pnpm --filter @platejs/plite-dom typecheck` | pass |
| `pnpm --filter @platejs/plite-react typecheck` | pass |
| `pnpm --filter @platejs/core typecheck` | pass |
| `pnpm --filter @platejs/core exec bun test src/lib/plugins/dom/DOMPlugin.spec.ts` | 7 pass |
| `pnpm exec biome check <touched files>` | pass |
| `pnpm --filter @platejs/plite lint` | pass |
| `pnpm --filter @platejs/plite-dom lint` | pass |
| `pnpm --filter @platejs/core lint` | pass |
| `pnpm --filter @platejs/plite-react lint` | fail: package-wide existing lint debt across unrelated files; touched-file lint passes |

Verification evidence:
- Final source sweep: 0 scoped `editor.api.dom.isComposing` matches.
- Final writer sweep: all scoped `IS_COMPOSING`, `IS_FOCUSED`, and `IS_READ_ONLY` writes are paired with Plite setters where the state class applies.
- Final touched-file lint: `pnpm exec biome check <touched files>` passed.
- Final React type proof after lint rename cleanup: `pnpm --filter @platejs/plite-react typecheck` passed.

Reboot status:
- Current: no reboot needed. The plan, changed list, proof table, open risk, and next owner are recorded here.

Open risks:
- Public DOM state-read API hard-cut is deferred, not forgotten.
- Full `@platejs/plite-react` package lint still fails on unrelated broad package debt; touched-file lint passes.

Changed files:
- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/core/public-state.ts`
- `packages/plite/src/internal/index.ts`
- `packages/plite/src/editor-runtime-view.ts`
- `packages/plite-dom/src/plugin/dom-editor.ts`
- `packages/plite-react/src/editable/input-controller.ts`
- `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts`
- `packages/plite-react/src/hooks/focus-plite-editable.ts`
- `packages/plite-react/src/editable/runtime-root-lifecycle.ts`
- `packages/plite-react/src/editable/selection-reconciler.ts`
- `packages/plite-react/src/editable/selection-controller.ts`
- `packages/plite-react/src/editable/runtime-root-engine.ts`
- `packages/core/src/lib/utils/hotkeys.ts`
- `packages/core/src/lib/plugins/dom/DOMPlugin.spec.ts`
- `docs/plans/2026-07-01-plate-next-move-composing-to-view.md`

Needs attention:
- Public DOM state-read API hard-cut is still open: decide separately whether to remove or rename `api.dom.isComposing/isFocused/isReadOnly` from Plite DOM public API.
- Full `@platejs/plite-react` lint is not a useful gate today because it reports broad unrelated lint debt; touched-file lint is clean.

Current verdict:
- verdict: keep
- confidence: high
- next owner: `plate-next` only if continuing the DOM API hard-cut
- reason: Core no longer reads composition from DOM host API, and Plite owns the state through `read.view`.
