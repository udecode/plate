# plate-v2-core-boundary-audit

Objective:
Audit remaining Plate v2 core boundary work; done when source-backed cut list is ranked and the next implementation owner is clear.

Goal plan:
docs/plans/2026-06-24-plate-v2-core-boundary-audit.md

Automation source:
- User invoked `$auto`.
- Prompt: review all remaining items toward the Plate v2 core lane, keep the Plite/Plate boundary clear, avoid hacks, cut bad surfaces, and reuse the long plan docs.
- Lane: Plate core/API/runtime planning audit.
- Mode: planning/status audit only. No implementation was requested in this turn.
- Timebox: N/A.

First checkpoint:
- Captured requirements before implementation: review remaining Plate v2 core items, clear Plite/Plate boundary, no hacks, hard cuts preferred, use long plan docs, produce a reviewable next-step list.
- Implementation was not started because the prompt asks for review.

Completion threshold:
- Complete when current source and prior plan docs identify the remaining Plate v2 core blockers, stale claims are separated from current source truth, public/private API debt is ranked, deferred package owners are named, and the final handoff states what should be approved before code.

Verification surface:
- Read `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md`, `auto`, `autogoal`, and `plate-plan`.
- Read plan sources: `docs/plans/2026-06-20-plate-package-plite-migration.md`, `docs/plans/2026-06-22-plate-v2-api-conflict-plan.md`, `docs/plans/2026-06-22-plate-v2-api-conflict-execution.md`, `docs/plans/2026-06-23-plate-core-api-law-hard-cut.md`, and related command/runtime artifacts.
- Source-audited current `packages/core`, `packages/plate`, feature package source, and docs for banned public legacy APIs, current runtime bridge usage, `T*` naming debt, and package manifest legacy refs.
- Ran final plan check command after recording this audit.

Constraints:
- Planning artifact only; do not patch core runtime until user approves the next packet.
- Plite owns substrate: editor model, read/update, tx groups, extension APIs, React runtime, history, browser proof.
- Plate owns product framework: plugin composition, option stores, UI/registry/product features, docs/examples, Plate package facade.
- No public compat aliases, no public runtime shims, no fake old API names.
- Private bridges are tolerated only as deletion scaffolds with owner and proof.
- Stale plan claims lose to current source.

Boundaries:
- Source of truth: current checkout plus prior long plan docs.
- Allowed edit scope this turn: this plan only.
- Browser surfaces: N/A; no rendered behavior changed.
- Package/API surfaces audited: `@platejs/core`, `platejs`, representative feature package source, content docs.
- Non-goals: implementation, docs rewrite, browser proof, package migration, release, PR, commit.

Output budget strategy:
- Used bounded `rg -l`, counts, and targeted `sed` slices.
- One broad plan/source stream exceeded useful output; recovered with scoped searches and recorded it as workflow debt.

Blocked condition:
- Not blocked. The next step is a user-approved implementation packet, not missing source access.

Current verdict:
- verdict: Plate core is much cleaner, but not done.
- confidence: 0.88 for current audit.
- next owner: `auto` Plate lane, with `plate-plan` if naming/API shape changes again.
- keep / cut / quarantine: keep current Plite runtime route; cut public `T*` names; quarantine `getCurrentRuntimeTransforms` and first-party runtime special cases until each owner is migrated or deleted.
- reason: banned public transform aliases are gone from source, but private runtime transform scaffolding and public type naming debt remain.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Requirements copied in First checkpoint. |
| `auto` and `autogoal` read | yes | Skill instructions read before source audit. |
| Vision read | yes | Root and Plate/Common vision docs read. |
| Active goal created | yes | Active goal created for this plan. |
| Lane resolved | yes | Plate core/API/runtime planning audit. |
| Release boundary recorded | yes | No release, PR, commit, or publish in scope. |
| Output budget strategy recorded | yes | Broad output miss logged and scoped searches used. |

Work Checklist:
- [x] Capture every prompt requirement before implementation.
- [x] Read relevant skill and vision sources.
- [x] Read the long Plate/Plite migration and API conflict plan docs.
- [x] Audit current source for banned public legacy API strings.
- [x] Audit current source for private current-runtime bridge usage.
- [x] Audit source/docs for `T*` public naming debt.
- [x] Audit package manifests for `slate-legacy` leftovers.
- [x] Separate stale plan claims from current source truth.
- [x] Rank remaining core lane work.
- [x] Record changed list, risks, commands, and next owner.
- [x] Mark non-applicable behavior/browser/perf proof as N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source-backed audit | yes | Read source and plans, avoid memory-only conclusion | Done. |
| Implementation proof | no | No runtime code changed | N/A: planning turn. |
| Browser proof | no | No rendered behavior changed | N/A. |
| Package proof | no | No package code changed | N/A. |
| Docs/API proof | yes | Audit docs/source for public naming/API debt | Done by targeted `rg`. |
| Skill/rule sync | no | No `.agents/rules/**` edited | N/A. |
| Autoreview | no | No implementation diff | N/A. |
| Goal plan complete | yes | Run `check-complete` | Recorded below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement extraction | complete | First checkpoint section. | Source audit. |
| Long-plan read | complete | Migration, API conflict, and hard-cut docs read. | Current source audit. |
| Current source audit | complete | Banned API, bridge, `T*`, and manifest scans. | Prioritized backlog. |
| Prioritized backlog | complete | Cut list below. | User review. |
| Final handoff | complete | Changed list, risks, commands, next owner recorded. | Implementation packet after approval. |

Scenario matrix:
| Surface | Status | Evidence | Decision |
|---------|--------|----------|----------|
| Banned public transform aliases | clean in source | 0 source files for `editor.tf`, `extendTransforms`, `getTransforms`, `getPluginApi`, `slate-legacy`, legacy runtime selector patterns. | Keep cut. |
| Private current-runtime transform scaffold | present | `getCurrentRuntimeTransforms` appears in 28 source/test files. | Quarantine, then retire owner-by-owner. |
| Public `T*` naming | present | 36 source/docs files use `TPlateEditor`, `createTPlatePlugin`, `toTPlatePlugin`, or `TBaseEditor`. | Cut/rename in next API cleanup packet. |
| `packages/slate-legacy` | absent | `test -e packages/slate-legacy` reported absent; manifest scan found no legacy refs. | Closed. |
| Runtime monolith | present | `createPlateRuntimeEditor.ts` is 9,886 lines. | Split only by durable runtime owner after bridge cleanup. |
| Deferred runtime owners | present | Command-surface plan names `ai`, `list-classic`, `media`, `selection`, `suggestion`, `table`. | Package-by-package after core API shape is accepted. |

Prioritized cut list:
| Rank | Item | Why it matters | Next packet |
|------|------|----------------|-------------|
| 1 | Public `T*` names | `TPlateEditor`, `TBaseEditor`, `createTPlatePlugin`, and `toTPlatePlugin` are old TS-culture API noise. They conflict with the hard-cut taste. | Make `PlateEditor<V, P>` / `BaseEditor<V, P>` generic with defaults if possible; make `createPlatePlugin<Config>()` and `toPlatePlugin<Config>()` cover explicit generics; delete `T*` exports and docs. |
| 2 | Current-runtime transform scaffold | `getCurrentRuntimeTransforms` is private but still broad. It is the main remaining bridge smell. | Replace package tests and runtime adapters with direct `editor.update` / `editor.api` / first-class runtime helpers, then delete transform accessors once owner count hits zero. |
| 3 | `createPlateRuntimeEditor.ts` monolith | 9.9k lines is too big for agent navigation and hides first-party runtime special cases. | Extract only durable owners: runtime plugin normalization, first-party runtime routes, DOM/selection services, render adapters. Do not split by arbitrary line count. |
| 4 | First-party runtime special cases | The runtime file has keyed branches such as blockquote/list/toggle/code/link/comment/footnote. That is acceptable only as a migration packet, not final architecture. | Convert stable branches into explicit plugin runtime adapters or extension slots; leave only generic dispatch in core. |
| 5 | Docs stale API | Docs still teach `T*` names and old migration framing. | After API names are approved, update latest-state docs and keep migration docs separate. |
| 6 | Deferred runtime package owners | `ai`, `list-classic`, `media`, `selection`, `suggestion`, `table` still need behavior-specific runtime closure. | One package owner at a time with typecheck/test/build and browser proof only when visible behavior changes. |
| 7 | `platejs` aggregate facade | `platejs` exports Plate core and Plite. That may be fine, but it must be intentional and documented as a product facade, not a random barrel. | Review after T-name and bridge cleanup; do not force feature packages to bypass `platejs` by default. |

Changed list:
- Updated this plan only: `docs/plans/2026-06-24-plate-v2-core-boundary-audit.md`.

Verification evidence:
- `rg -l "editor\\.tf|editor\\.transforms|plugin\\.transforms|extendTransforms|getTransforms|getPluginApi|runtime:\\s*['\\\"]legacy|legacyRuntimeUpdateBridge|@platejs/slate-legacy|slate-legacy" packages/core/src packages/plate/src packages/*/src --glob '!**/dist/**' --glob '!**/node_modules/**'` returned no source files.
- `rg -l "getCurrentRuntimeTransforms" packages/core/src packages/*/src --glob '!**/dist/**' --glob '!**/node_modules/**' | wc -l` returned 28.
- `rg -l "TPlateEditor|createTPlatePlugin|toTPlatePlugin|TBaseEditor|createTBasePlugin|toTBasePlugin" packages/core/src packages/*/src content/docs --glob '!**/dist/**' --glob '!**/node_modules/**' | wc -l` returned 36.
- Manifest audit for `packages/slate-legacy` and `@platejs/slate-legacy` returned no package manifest matches.
- `test -e packages/slate-legacy` reported `packages/slate-legacy absent`.
- `wc -l` reported `createPlateRuntimeEditor.ts` at 9,886 lines and `currentRuntimeBridge.ts` at 1,003 lines.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-plate-v2-core-boundary-audit.md` passed.

Commands run:
- `rg` memory quick pass for relevant Plate/Plite history.
- `sed` reads for `auto`, `autogoal`, `plate-plan`, vision docs, prior plan docs, current runtime source, plugin types, and package manifests.
- Targeted `rg` source/doc audits listed in Verification evidence.
- `wc -l` on core runtime files.
- Final autogoal `check-complete`.

Workflow slowdowns:
- A broad `rg --count` / multi-doc stream produced too much output and was truncated. Future audits should write broad ledgers to artifacts first, then inspect bounded owner slices.
- Prior plan docs still contain stale Slate/Plite terminology and older route claims; current source must be treated as authority.

Needs your attention:
| Rank | Item | Decision needed |
|------|------|-----------------|
| 1 | `T*` hard cut | Approve replacing `TPlateEditor` / `TBaseEditor` with generic `PlateEditor` / `BaseEditor`, and replacing `createTPlatePlugin` / `toTPlatePlugin` with generic overloads on the normal functions. |
| 2 | Private transform scaffold | Approve treating `getCurrentRuntimeTransforms` as deletion debt even though it is private and tests currently rely on it. |
| 3 | Runtime monolith split | Approve one more architecture-cleanup packet after the bridge cleanup, but only durable owner extraction, no file-confetti. |
| 4 | `platejs` facade | Decide whether `platejs` intentionally re-exports Plite forever or whether raw Plite imports should be documented as `@platejs/plite` only. My take: keep `platejs` as Plate product facade for package code, but be explicit. |
| 5 | Deferred package order | Start with the highest-runtime-risk package owner, likely `selection` or `table`, not AI. |

Stopping checkpoints:
| Checkpoint | Status | Owner | Exit rule |
|------------|--------|-------|-----------|
| API naming approval | queued | user + `plate-plan` | `T*` replacement shape accepted. |
| T-name hard cut | queued | `auto` Plate lane | Source/docs no longer expose public `T*` names; core/package typecheck passes. |
| Current-runtime transform retirement | queued | `auto` Plate lane | `getCurrentRuntimeTransforms` owner count reaches zero or every remaining owner has a deletion gate. |
| Runtime monolith cleanup | queued | `architecture-cleanup` / `auto` | One durable owner extracted with focused proof. |
| Package runtime owners | queued | `auto` package-by-package | Each package typecheck/test/build passes before next package. |

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Planning audit complete for Plate v2 core boundary. |
| Where am I going? | Next implementation should start with API naming, then private runtime transform retirement, then runtime owner extraction/package sweeps. |
| What is the goal? | Keep Plate on Plite with clean ownership and no compatibility hacks. |
| What have I learned? | The legacy package is gone and public banned transform aliases are clean in source, but private runtime transform scaffolding and `T*` public names are still real debt. |
| What have I done? | Read the long plans, audited current source, ranked remaining work, and updated this goal plan. |

Open risks:
- The plan docs are internally inconsistent because some were written before the latest Plite rename/default-runtime work. Use current source as authority.
- No implementation proof was run because this turn changed no package/runtime code.
- The current-runtime bridge may be acceptable short term, but it is not the final architecture.
