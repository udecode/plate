# plate-next runtime marker hard cut

Objective:
Hard-cut Plate runtime marker protocol; done when marker-storage hacks are deleted or routed with proof.

Completion threshold:
- Delete plugin-object `runtime*Cleanup`, `runtime*Extension`, and `runtimePliteExtensions` storage when behavior is already preserved by `editor.extend(...)`.
- Delete or replace every removable boolean `runtimeX` marker gate from `PlateRuntimePlugin`.
- Preserve behavior by routing live feature installers from real plugin identity/options, or by deleting duplicate hidden runtime paths when the plugin already owns the behavior.
- Record remaining runtime bridge debt separately so this packet does not pretend the whole command bridge is gone.
- Run exact source audits, focused package tests, touched-package typecheck/lint/build, `pnpm check:core`, and this autogoal completion gate.

Verification surface:
- Exact `rg` audits over `packages/core/src` and `packages/*/src` for marker field reads/writes and marker declarations.
- Focused tests for Core runtime, Plite extension, NodeId, DOM, navigation feedback, input rules, legacy-list-model, caption, footnote, slash-command, emoji, mention, and utils single/normalize/trailing plugins.
- Touched package graph typecheck, lint, and build for Core, Utils, Caption, Footnote, Slash Command, Mention, Emoji, and Legacy list model.
- `pnpm check:core` for Core + Plite type contracts, lint, Core test batches, and Plite tests.
- Browser proof is not part of this packet because the changed surface is package runtime/plugin installation, not a rendered docs/app route.

Constraints:
- No git add, commit, push, or PR.
- No public compat aliases or shims.
- No broad Plate v2 command API redesign inside this marker packet.
- Prefer deleting duplicate runtime paths over preserving hidden plugin-object mutation.
- Use root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` for taste.

Boundaries:
- Lane: Plate Next / Core runtime cleanup.
- Source of truth: current checkout, `plate-next`, `hard-cut`, `autogoal`, root vision docs.
- Allowed edit scope: Core runtime/plugin implementation, owning plugin tests, this plan.
- Out of scope: app/browser docs proof, release work, PR work, broad command bridge deletion.

Blocked condition:
No blocker hit. If a marker had required a public Plate API decision, this packet would have stopped and routed to `plate-plan`; the marker cuts did not require that.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | User asked to hard-cut the hack and recover maximum from diff; captured as marker deletion plus behavior proof. |
| Skills read | yes | `plate-next`, `hard-cut`, and `autogoal` were read before implementation. |
| Vision read | yes | Root `VISION.md`, `docs/vision/common.md`, and `docs/vision/plate.md` read. |
| Active goal | yes | Existing Codex goal is active for this plan. |
| Lane resolved | yes | Plate Next / Core runtime marker protocol. |
| No git mutation | yes | No stage, commit, push, or PR requested or performed. |

Work Checklist:
- [x] First checkpoint copied explicit scope: hard-cut runtime marker hack, recover behavior from diff, no commit/PR.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Lane resolved as Plate Next / Core runtime cleanup.
- [x] Source audits were run for marker reads/writes, marker declarations, and storage hacks.
- [x] Plugin-object extension storage was removed from Core runtime install paths.
- [x] Boolean runtime marker fields were removed from `PlateRuntimePlugin`.
- [x] Marker Object.assign wrappers were removed from owning plugin definitions.
- [x] Live installers now route from real plugin keys/options instead of mutated marker flags.
- [x] Duplicate classic todo runtime command installer was deleted because legacy-list-model owns insert-break behavior as an extension.
- [x] Plite React runtime override was tightened so key-only base plugin identity does not install React-only normalization.
- [x] Marker-only tests were deleted or rewritten into behavior/defaults tests.
- [x] Focused package tests were run after patches.
- [x] Touched package graph typecheck, lint, and build passed.
- [x] `pnpm check:core` passed.
- [x] Remaining command bridge debt is recorded as a next owner, not hidden as complete.
- [x] Changed list, needs-attention list, stopping checkpoints, verification evidence, reboot status, and risks are recorded.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Marker field read/write audit | yes | Exact audit for `.runtime(Affinity...TriggerCombobox)` found only `packages/plite-react/src/projection-store.ts`, a metrics false positive unrelated to Plate plugin markers. |
| Marker declaration audit | yes | Exact audit for `runtime(Affinity...TriggerCombobox) ?/:/=` returned no matches. |
| Storage hack audit | yes | Storage audit only hit `installRuntimePliteExtensions` and Plite editor-extension cleanup internals; no plugin-object marker storage remains. |
| Focused behavior/package tests | yes | Core runtime 128 pass; legacy-list-model 5 pass; footnote 7 pass; slash 1 pass; caption 1 pass; emoji 4 pass; mention 7 pass; utils 23 pass. |
| Touched graph typecheck | yes | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils --filter=./packages/caption --filter=./packages/footnote --filter=./packages/slash-command --filter=./packages/mention --filter=./packages/emoji --filter=./packages/platejs/src/features/list` passed. |
| Touched graph lint | yes | Package lint passed for Core, Utils, Caption, Footnote, Slash Command, Mention, Emoji, and Legacy list model. |
| Touched graph build | yes | Touched package graph build passed, 18 successful tasks. |
| Core/Plite closure gate | yes | `pnpm check:core` passed. |
| Browser proof | not-applicable | No rendered route changed; package runtime proof is the right gate. |
| Autoreview | not-applicable | User requested direct hard-cut continuation; this packet self-reviewed through audits and proof. |
| Goal plan complete | yes | This file records final proof and is ready for `check-complete.mjs`. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | Prompt, scope, skills, vision, lane, and no-git boundary captured. |
| Source audit | complete | Exact marker audits run. |
| Runtime hard cut | complete | Plugin-object storage and boolean marker protocol removed. |
| Risk repair | complete | Duplicate classic todo runtime path deleted; Plite React override tightened. |
| Focused proof | complete | Focused package tests passed. |
| Package closure | complete | Typecheck, lint, build, and `check:core` passed. |
| Handoff | complete | Changed list, risks, and next owner recorded. |

Packet ledger:
| Packet | Decision | Files / proof |
|--------|----------|---------------|
| Plugin-object extension storage | keep | Removed `runtime*Cleanup`, `runtime*Extension`, and `runtimePliteExtensions` writes; Core focused tests and audits passed. |
| Boolean runtime marker protocol | keep | Removed marker fields and Object.assign wrappers; routing now uses plugin keys/options. |
| Plite extension pipeline marker | keep | Pipeline installs once from runtime editor and reads the plugin by key. |
| Classic todo hidden command installer | delete | Removed duplicate Core installer; `BaseTodoListPlugin.spec.ts` proves insert-break behavior through the plugin extension. |
| Plite React key-only override | keep | Tightened guard to require the React handler, not only the `pliteExtension` key. |
| Marker-only tests | keep | Deleted marker assertions and retained/defaulted behavior tests. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/core/src/react/editor/createPlateRuntimeEditor.ts`, `packages/core/src/internal/plugin/resolvePlugins.ts`, `packages/core/src/react/editor/internal/runtimeInputRules.ts`, `packages/core/src/react/editor/internal/runtimeParser.ts`, `packages/core/src/react/editor/internal/runtimeNodeId.ts`, Core plugin definitions, utility plugin definitions, and feature plugin definitions no longer mutate/read marker fields. |
| tests/oracles | Marker-only assertions removed; behavior/default tests preserved; `packages/platejs/src/features/list/src/lib/BaseTodoListPlugin.spec.ts` made self-contained and used to prove duplicate runtime path deletion. |
| docs/plans | This autogoal plan updated with final evidence. |
| benchmarks/browser/skills | No changes. |

Needs your attention:
| Rank | Item | Why | Recommendation |
|------|------|-----|----------------|
| 1 | `runtimeCommands` bridge remains | This packet killed marker protocol, not the broader command fallback bridge. It is still the next real Plate Next cleanup lane. | Run the next `plate-next` packet on command bridge deletion when ready. |
| 2 | Many runtime installers still live in `createPlateRuntimeEditor.ts` | They are no longer marker-driven, but the file is still too big and command-heavy. | Split only after command bridge cleanup, not before. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Continued work | Recommendation |
|----|------|---------------------|----------------|----------------|
| none | none | No user decision needed for this marker packet. | Continue with command bridge cleanup later. | Do not block this hard cut. |

Findings:
- The marker storage was real sludge: plugin objects were being mutated to remember cleanup/extension handles that `editor.extend(...)` already owns.
- Several plugin definitions used `Object.assign(..., { runtimeX: true })` only to satisfy Core runtime gates.
- Classic todo had a duplicate hidden runtime command installer while legacy-list-model already owns insert-break as an extension.
- A focused legacy-list-model test had a weak Bun harness dependency on global `mock`; it is now explicit.

Decisions and tradeoffs:
- Runtime installers may still route by stable plugin key/options. That is acceptable as a temporary Core runtime shape; it is not the same as mutating plugin objects with marker flags.
- Marker-only tests were cut because tests should prove behavior/defaults, not dead implementation tags.
- `runtimeCommands` stays recorded as next debt because deleting it is a larger Plate command API packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| legacy-list-model focused test failed because `mock` was not imported | 1 | Make the test self-contained with `bun:test` imports | Fixed; rerun passed. |
| Mention test briefly failed while package build/resolution was racing in a parallel command | 1 | Rerun after build finished | Rerun passed. |

Verification evidence:
- `rg --files-with-matches "\\.runtime(Affinity|Blockquote|Caption|Comment|CodeBlock|ClassicTodoList|DomOperations|Footnote|InputRules|Indent|LayoutColumn|List|Link|MultiSelect|NormalizeTypes|OverrideMergeRules|OverrideNormalizeRules|NavigationFeedback|NodeId|Parser|PliteReactOverride|SingleBlock|SingleLine|TrailingBlock|Toggle|TriggerCombobox)" packages/core/src packages/*/src --glob '!**/dist/**' --glob '!**/*.d.ts'` -> only `packages/plite-react/src/projection-store.ts` metrics false positive.
- `rg --files-with-matches "runtime(Affinity|Blockquote|Caption|Comment|CodeBlock|ClassicTodoList|DomOperations|Footnote|InputRules|Indent|LayoutColumn|List|Link|MultiSelect|NormalizeTypes|OverrideMergeRules|OverrideNormalizeRules|NavigationFeedback|NodeId|Parser|PliteReactOverride|SingleBlock|SingleLine|TrailingBlock|Toggle|TriggerCombobox)\\s*(\\?|:|=)" packages/core/src packages/*/src --glob '!**/dist/**' --glob '!**/*.d.ts'` -> no matches.
- `pnpm --filter @platejs/core exec bun test src/react/editor/createPlateRuntimeEditor.spec.ts src/lib/plugins/plite-extension/PliteExtensionPlugin.spec.tsx src/lib/plugins/node-id/NodeIdPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts src/lib/plugins/input-rules/internal/InputRulesPlugin.spec.ts` -> 128 pass.
- `pnpm --filter platejs exec bun test src/lib/BaseTodoListPlugin.spec.ts` -> 5 pass.
- `pnpm --filter @platejs/footnote exec bun test src/lib/BaseFootnotePlugins.spec.ts src/lib/FootnoteRuntimePlugin.spec.ts` -> 7 pass.
- `pnpm --filter @platejs/slash-command exec bun test src/lib/BaseSlashPlugin.spec.ts` -> 1 pass.
- `pnpm --filter @platejs/caption exec bun test src/lib/BaseCaptionPlugin.spec.ts` -> 1 pass.
- `pnpm --filter @platejs/emoji exec bun test src/lib/BaseEmojiPlugin.spec.ts` -> 4 pass.
- `pnpm --filter @platejs/mention exec bun test src/lib/BaseMentionPlugin.spec.tsx` -> 7 pass.
- `pnpm --filter @platejs/utils exec bun test src/lib/plugins/single-block/SingleBlockPlugin.spec.ts src/lib/plugins/single-block/SingleLinePlugin.spec.ts src/lib/plugins/trailing-block/TrailingBlockPlugin.spec.ts src/lib/plugins/normalize-types/NormalizeTypesPlugin.spec.ts` -> 23 pass.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils --filter=./packages/caption --filter=./packages/footnote --filter=./packages/slash-command --filter=./packages/mention --filter=./packages/emoji --filter=./packages/platejs/src/features/list` -> 20 successful tasks.
- Package lint for Core, Utils, Caption, Footnote, Slash Command, Mention, Emoji, and Legacy list model -> passed.
- `pnpm turbo build --filter=./packages/core --filter=./packages/utils --filter=./packages/caption --filter=./packages/footnote --filter=./packages/slash-command --filter=./packages/mention --filter=./packages/emoji --filter=./packages/platejs/src/features/list` -> 18 successful tasks.
- `pnpm check:core` -> passed.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-26-plate-next-runtime-marker-hard-cut.md`
- Lane: Plate Next / Core runtime marker cleanup
- Surface and route/package: Core runtime plus affected plugin packages
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: one-shot continuation, no timebox
- Behavior gates and visual proof: package behavior tests passed; browser proof not applicable
- Bugs fixed and oracles added: legacy-list-model spec made self-contained; duplicate hidden runtime todo path removed with behavior proof
- Benchmark/skill/docs repairs: no benchmark or skill changes; plan updated
- Workflow slowdowns and repairs: weak focused test setup fixed
- Changed list: recorded above
- Needs your attention: `runtimeCommands` bridge and `createPlateRuntimeEditor.ts` size
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: command bridge cleanup deferred to next Plate Next packet
- Next owner: `plate-next`

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Marker hard-cut packet is complete. |
| Where am I going? | Close this goal after `check-complete.mjs`. |
| What is the goal? | Delete Plate runtime marker protocol without losing behavior. |
| What have I learned? | Marker fields were replaceable by plugin identity/options, except broader `runtimeCommands` debt. |
| What have I done? | Removed marker storage/flags/wrappers, deleted duplicate task-list runtime command path, repaired tests, and proved package/core closure. |
| What changed in the checkpoint plan? | The generic template was collapsed into an evidence-backed packet ledger. |

Open risks:
- `runtimeCommands` is still live command bridge debt and should be the next `plate-next` cleanup target.
- `createPlateRuntimeEditor.ts` remains too large; split it only after command bridge cleanup.
