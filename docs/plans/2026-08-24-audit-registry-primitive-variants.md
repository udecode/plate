# Audit registry primitive variants

> Superseded by
> `docs/plans/2026-08-24-complete-base-first-registry-variants.md`. The
> isolated full-consumer compiler fixture disproved this plan's two-owner
> conclusion: DropdownMenu and ContextMenu are provider owners too, for four
> physical variant families total.

Objective:
- Audit every active Plate/docs registry item and published source file, then define the smallest truthful primitive-variant owner. This goal is complete when every bounded row has one decision and the implementation target is executable without another architecture pass.

Completion threshold:
- All 432 active registry items and all 317 production source files have exactly one final decision.
- Direct Radix, Base UI, React Aria, Ariakit, and `components/ui` imports are traced through installed targets.
- All variant sources and duplicate installed targets have a keep, split, merge, or delete decision.
- The public install contract, compatibility cut, implementation order, and verification gates are concrete.
- The completion checker passes.

Verification surface:
- Reproducible inventory and decision scripts under `docs/plans/artifacts/registry-primitive-variants/`.
- Full row ledgers in `items.tsv`, `files.tsv`, `ui-compatibility.tsv`, `decisions.tsv`, and `file-decisions.tsv`.
- Human audit in `docs/plans/artifacts/registry-primitive-variants/audit.md`.
- Current Plate registry/build/config source and local `/Users/zbeyens/git/shadcn` builder, preset, and component source.

Constraints:
- This goal changes only this plan and its audit artifacts. Product implementation, generated registry output, templates, dependencies, commits, pushes, and PRs are excluded.
- Preserve semantic `@plate/*` item ids and `https://platejs.org/r/{style}/{name}.json`.
- Compatibility affects rollout order, not the ideal owner.
- Browser proof belongs to implementation because this goal changes no runtime surface.

Boundaries:
- Plate source of truth: `/Users/zbeyens/git/plate-2`.
- Upstream source of truth: local `/Users/zbeyens/git/shadcn`.
- Generated `apps/www/public/r/**`, `templates/**`, dependency folders, and build caches are excluded from the source manifest.
- Active manifest means the 232 Plate and 200 docs rows registered by current source.

Blocked condition:
- Stop only if current source cannot resolve an item/file owner or the target depends on unavailable external-usage evidence. Neither condition occurred.

Major source:
- Type: user request plus current checkout source.
- Decision: split primitive-dependent registry implementation from common items, including current items where the existing ownership is wrong.
- Output: exhaustive audit and accepted-target-ready implementation plan; product changes follow only after the user accepts this exact cut.

Current verdict:
- Split the internal build owner, not the public item namespace.
- Build docs once and common Plate items once.
- Keep exactly two Radix/Base variant families: existing `toolbar` and a new registry-local `floating-popover` family used by eight items.
- Remove Plate React Aria support. Forty current items have proven incompatible source/API usage, and the installer has no Aria-equivalent transform.
- Do not introduce `@plate-primitives/*`; that exposes build taxonomy and damages semantic item installs.

Start Gates:

| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured | yes | Full audit, proposed primitive/common split, permission to split current items, and final handoff are recorded in the objective, checklist, and target. |
| Duration parsed | no | No duration was requested. |
| Goal lifecycle loaded | yes | `autogoal` was read and a goal was created for this plan. |
| Major-task owner loaded | yes | `major-task` was read before the broad audit. |
| Source of truth read | yes | Current Plate registry/build/config and local shadcn builder/preset/component source were inspected. |
| Existing policy checked | yes | Root Vision, Plate Vision, common Vision, registry rules, and August sync-shadcn plan were inspected. |
| API/UI pressure owners loaded | yes | `best-api`, `plate-ui`, and required `shadcn` skills were read and applied. |
| External research | no | Local upstream source settled the contracts; web research was unnecessary. |
| Workspace authority | yes | Plate owns product decisions; local shadcn owns upstream CLI behavior. |
| Implementation authority | no | This goal is the architecture audit; product edits require acceptance of the exact target below. |
| Release/PR work | no | No product delta, commit, push, PR, or release artifact is in this goal. |

Work Checklist:
- [x] No duration was requested; exhaustive row accounting is the completion metric.
- [x] Every prompt requirement, scope boundary, stop condition, deliverable, verification surface, and handoff is recorded.
- [x] Objective, threshold, constraints, boundaries, and blocked condition are concrete.
- [x] Current build ownership and public registry contract are mapped before proposing the split.
- [x] All 432 active items are enumerated exactly once.
- [x] All 317 production source files are classified exactly once.
- [x] Every direct primitive and `components/ui` import is traced to item and installed target.
- [x] Every current variant file and same-target collision has a final decision.
- [x] Whole-item variation is distinguished from one-file variation.
- [x] Expected, reviewed, excluded, changed, kept, and debt counts are recorded.
- [x] Complete row-level survivor and change lists are stored in the TSV ledgers.
- [x] Existing repo decisions and current shadcn contracts are recorded before recommendation.
- [x] Facts, inference, recommendation, tradeoffs, blast radius, and rejections are separated in `audit.md`.
- [x] `best-api` hard-cut and `plate-ui` ownership pressure passes are complete.
- [x] Package/API, compatibility, URL, dependency-resolution, and release-artifact impact are recorded.
- [x] Workspace authority and output-budget discipline are recorded.
- [x] No product implementation occurred, so package checks, browser proof, barrels, changesets, and registry changelog edits are not applicable to this goal.
- [x] All actionable audit findings have a target owner and verification gate.

Measured inventory:
- Active items: 432 = 232 Plate + 200 docs.
- Production source files: 317; 251 published/variant files + 66 unpublished primitive-agnostic files.
- Item classification: 15 base-direct, 41 shadcn-UI-direct, 1 third-party-primitive-direct, 85 primitive-transitive, 3 style-only, 287 primitive-agnostic.
- Direct UI consumers: 54 across 21 UI modules and 254 imported-symbol usages.
- Missing cross-base symbols: 65 usages across 7 modules.
- Current base-specific files: only `toolbar`; both Base and Aria maps vary that one file.
- Current build targets: 27. The matrix evaluates 11,664 item-target combinations; docs alone account for 5,400.
- Duplicate installed targets: three, each assigned below.

Final item decisions:

| Decision | Count |
|---|---:|
| docs catalog built once | 198 |
| docs Radix-pinned | 1 |
| docs form metadata debt | 1 |
| canonical common | 93 |
| canonical transitive | 76 |
| canonical shadcn consumer | 27 |
| canonical style item | 3 |
| existing base variant owner (`toolbar`) | 1 |
| new floating-popover consumers | 8 |
| remove Radix contract leak | 11 |
| Canonical classic maintenance | 11 |
| independent primitive common (`inline-combobox`) | 1 |
| replace empty form dependency | 1 |
| **Total** | **432** |

Final file decisions:

| Decision | Count |
|---|---:|
| canonical source | 214 |
| unpublished/excluded | 66 |
| adopt floating-popover contract | 8 |
| remove Radix contract leak | 11 |
| Canonical classic maintenance | 12 |
| docs Radix-pinned | 2 |
| keep Radix toolbar author source | 1 |
| keep Base toolbar author source | 1 |
| delete Aria toolbar author source | 1 |
| replace empty form dependency | 1 |
| **Total** | **317** |

Exact architecture target:
1. Define Plate's supported primitive set as `['radix', 'base']` and assert it is a subset of upstream presets. Reject Aria and unknown bases instead of emitting dishonest targets.
2. Build the docs catalog once. Fumadocs remains explicitly Radix-pinned.
3. Build the canonical Plate graph once. Primitive-agnostic and transitive items do not acquire duplicated author source.
4. Materialize sparse Radix/Base overlays only for `toolbar` and `floating-popover`.
5. Route `new-york`, `new-york-v4`, and `radix-*` to Radix; route `base-*` to Base. Keep root output as the Radix default.
6. Preserve canonical `@plate/*` dependencies in source. Response materialization rewrites them to same-style absolute URLs, preserving both namespaced and direct URL installs.
7. Build the index once. Upstream visual styles no longer multiply Plate build targets.

Current item surgery:
- Add registry-local Radix/Base `floating-popover` variants and migrate: `ai-menu`, `block-discussion`, `code-drawing`, `column`, `footnote`, `media-toolbar`, `select-editor`, and `table`.
- Stable Plate-facing floating-popover API exposes root, an `element` anchor, and content. It does not expose `asChild`, `render`, or `virtualRef`.
- Delete unused Radix DropdownMenu root-prop pass-through and direct `ItemIndicator` values from 11 modern items: `align-toolbar-button`, `export-toolbar-button`, `font-color-toolbar-button`, `import-toolbar-button`, `insert-toolbar-button`, `line-height-toolbar-button`, `media-toolbar-button`, `mode-toolbar-button`, `more-toolbar-button`, `table-toolbar-button`, and `turn-into-toolbar-button`.
- Keep 11 Plate alternative variants items canonical and maintenance-only. They install
  through Base and Radix without provider-specific assembly copies.
- Keep `inline-combobox` common with its explicit Ariakit dependency.
- Replace the two empty/latest upstream `form` dependency rows with owned dependencies.
- Remove duplicate `@components/editor/ai.tsx` ownership from `ai-demo`; depend on `@plate/ai`. Keep editor block/page collisions because those blocks are mutually exclusive alternatives.

Compatibility proof:
- React Aria hard cut: at least 40 active items use APIs absent or structurally incompatible in the Aria implementations. The complete lower-bound list is in `audit.md` and `ui-compatibility.tsv`.
- Base debt: 23 active items are currently known unsafe. Eight require the floating-popover family, 13 import Radix dropdown types/values, and two reference the empty Base form row.
- Four Base outputs contain direct Radix `DropdownMenuItemIndicator` values; these are concrete cross-provider runtime defects, not theoretical risk.
- The prior sync-shadcn plan proved isolated Toolbar generation. It did not prove installed-graph compatibility, so its 27-target truthfulness claim is rejected.

Rejected alternatives:
- Full `base x style x item` matrix: 96% of work is duplicated and most outputs are not truthful.
- Public `@plate-primitives/*`: exposes an implementation concern and makes semantic installs worse.
- One variant file per current consumer: duplicates behavior instead of owning the actual primitive boundary.
- React Aria repair: requires a parallel component API and installer transform system for no proven current user job.
- Variant support for classic components: expands a maintenance-only surface.

Implementation sequence after acceptance:
1. Enforce the Radix/Base support set; delete Aria author source, routes, dependencies, and tests; correct sync-shadcn doctrine.
2. Split docs, canonical graph, and sparse overlay build stages while preserving URLs and self-dependency resolution.
3. Add `floating-popover` variants; migrate eight consumers; remove 11 Radix leaks; freeze classic; repair form dependencies.
4. Normalize the `ai-demo` collision.
5. Run required `best-api repair`, update the sync-shadcn source rule, run `pnpm install` for generated skill mirrors, and add a registry changelog. Add package changesets only if npm package behavior changes.

Implementation verification:
- Static invariant: every common item is byte-identical across supported styles; only the two named overlay families may differ.
- Resolver tests: namespaced installs and direct same-style URLs resolve all transitive dependencies.
- Isolated install/typecheck fixtures for representative Radix and Base graphs, including all eight floating-popover consumers and the four former indicator defects.
- Route hash check across every supported style URL.
- Browser proof on representative toolbar, AI menu, table, media toolbar, and select-editor demos for Radix and Base.
- `pnpm --filter www typecheck`.
- On `next`, `pnpm --filter www build:registry` and include generated registry output.
- Root `pnpm check` before any PR.

Completion Gates:

| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named threshold | yes | Account for every bounded row | 432/432 items and 317/317 files have unique final decisions; ledger integrity checks pass. |
| Current-state audit | yes | Map owners and constraints | `manifest.json`, `summary.md`, and `audit.md` record registry, build, URL, dependency, and upstream behavior. |
| Decision criteria | yes | Resolve every criterion | Counts balance, collisions are owned, complete change lists exist, and target/proof sequence is concrete. |
| Options and tradeoffs | yes | Record alternatives | Five alternatives are rejected above with ownership and compatibility reasons. |
| Review pressure | yes | Apply API and UI owners | `best-api` hard-cut removes Aria/public taxonomy; `plate-ui` limits variants to the two actual primitive boundaries. |
| Review closure | yes | Own every actionable finding | Every finding maps to a numbered implementation step and proof gate. |
| External source | yes | Verify upstream contract | Local shadcn builder, preset registry, Base/Aria components, and transforms were inspected. |
| Implementation gates | no | Explain exclusion | Only plan and audit artifacts changed; runtime/package/browser gates are specified for execution. |
| Public API boundary | yes | Define install/API shape | Semantic ids and URLs survive; build taxonomy stays private; floating-popover omits provider composition props. |
| Release artifact | no | Classify this diff | This analytical docs/artifact diff has no published user-visible product delta. |
| Changeset | no | Explain exclusion | No npm package behavior, API, types, or runtime changed. |
| Registry changelog | no | Explain exclusion | No registry source changed in this goal; execution requires one. |
| Package checks | no | Explain exclusion | No package source changed; implementation commands are listed above. |
| Barrel generation | no | Explain exclusion | No export or exported file layout changed. |
| Browser proof | no | Explain exclusion | No runtime surface changed; exact execution routes are listed above. |
| Final formatting | no | Explain exclusion | Repo formatting config excludes `docs/**`; scoped Biome, Ultracite, and Oxfmt attempts confirmed no configured target. The three executable scripts reran successfully. |
| Output discipline | yes | Keep exhaustive output artifacted | Broad rows live in JSON/TSV files; terminal inspection used bounded summaries and slices. |
| Duration | no | Explain exclusion | No duration was requested. |
| Final handoff | yes | Give one executable recommendation | Exact target, item surgery, compatibility cut, sequence, proof, and next owner are recorded. |
| Goal plan complete | yes | Run completion checker | Final checker result is recorded in Verification evidence. |

Phase / pass table:

| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and source read | completed | Requirements, owners, Vision, skills, and local upstream source read | done |
| Current-state map | completed | 432 items, 317 files, 27 targets, imports, targets, and collisions inventoried | done |
| Options and recommendation | completed | Sparse two-family model selected; alternatives rejected | done |
| Review / pressure pass | completed | Best API and Plate UI hard-cut pressure applied | done |
| Plan artifact | completed | `audit.md` plus row ledgers contain the executable target | done |
| Verification | completed | Reproducibility, integrity, formatting, and completion checks recorded | done |
| Closeout | completed | Recommendation and remaining execution risk recorded | user acceptance |

Findings:
- The registry currently models an upstream preset catalog as Plate product capability. That is false: only Toolbar varies by base, and React Aria breaks at least 40 current items.
- Primitive coupling occurs at two real reusable boundaries: toolbar composition and anchored floating content.
- The modern toolbar-button Radix coupling is unused prop/type leakage, not a valid variant need.
- Docs are rebuilt inside every target even though 198 of 200 docs items are catalog-only common rows.

Decisions and tradeoffs:
- Prefer one canonical graph plus two sparse variant families. This preserves install ergonomics and deletes most matrix work.
- Cut Aria instead of funding a third provider abstraction. Base remains worth supporting because the required boundary is small and already partly present.
- Freeze classic items on Radix. Their maintenance status outweighs variant completeness.

Review fixes:
- Tightened the initial broad “primitives” split into two named owners.
- Rejected the public primitives namespace after ideal-call-site review.
- Added same-style absolute dependency materialization so direct URL installs remain correct.
- Split proven Base defects from unproven compatibility; the 40-item Aria list is explicitly a lower bound.

Error attempts:

| Error / failed attempt | Count | Different move | Resolution |
|---|---:|---|---|
| TypeScript parser could not parse registry TSX/import attributes | 2 | Use the repo Babel parser stack | Inventory became reproducible. |
| Assumed jq shapes did not match emitted objects | 4 | Inspect keys, then run bounded queries | Queries were corrected without changing source evidence. |
| Combined jq report exceeded useful output | 1 | Split aggregates and persist complete TSV ledgers | Chat context stayed bounded; full rows remain auditable. |
| `pnpm exec biome` was unavailable | 1 | Use the repo `ultracite` owner | Confirmed Biome is not installed directly. |
| Ultracite/Oxfmt matched no artifact files | 2 | Inspect `oxfmt.config.ts` | `docs/**` is deliberately excluded, so formatting is not a configured gate for these artifacts. |

Verification evidence:
- `bun docs/plans/artifacts/registry-primitive-variants/audit.mts`: emitted 432 unique item rows and 317 unique file rows.
- `bun docs/plans/artifacts/registry-primitive-variants/compatibility.mts`: emitted 54 direct UI consumers, 254 symbol usages, and 65 missing-symbol usages.
- `bun docs/plans/artifacts/registry-primitive-variants/decisions.mts`: emitted 432 item decisions and 317 file decisions with zero blank or duplicate decisions.
- TSV key/count checks confirmed the expected totals and unique owners.
- `pnpm exec ultracite check <three audit scripts>` and direct Oxfmt check both reported that `docs/**` is excluded by `oxfmt.config.ts`; no configured formatter owns these artifacts.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-audit-registry-primitive-variants.md`: recorded after the final plan pass.

Final handoff contract:
- Recommendation: accept the sparse internal owner split and Aria hard cut exactly as described.
- Confidence: high for current source and local shadcn behavior.
- Evidence: reproducible manifest, compatibility matrix, unique decision ledgers, and source-linked audit.
- Product tests: none run because product code did not change; execution proof is specified above.
- Browser proof: not applicable to this analytical diff; representative routes are named for implementation.
- PR/tracker: none.
- Caveat: source proves incompatibility and ownership, not external usage. Any rollout telemetry can affect staging, not the target architecture.
- Next owner: user acceptance, then `plate-plan`/`plate-ui` execution with `best-api repair` at closeout.

Reboot status:

| Question | Answer |
|---|---|
| Where am I? | Analytical closeout |
| Where am I going? | User decision on the exact implementation target |
| What is the goal? | Replace the false whole-registry variant matrix with one canonical graph and two sparse Radix/Base families |
| What have I learned? | Only toolbar varies today; floating popover is the other real boundary; Aria is incompatible and most rows are common |
| What have I done? | Classified all 432 items and 317 files, resolved collisions, designed the target, and specified proof |

Open risks:
- External install traffic is not available. It may affect rollout timing but cannot justify the current false Aria contract.
- Same-style dependency rewriting needs fixture proof before shipping because both namespaced and direct URL installs must remain valid.
- Classic items remain maintenance-only but must stay install-compatible with
  every supported provider.

Timeline:
- 2026-08-24: goal created, current source and local shadcn audited, exhaustive ledgers generated, API/UI pressure applied, and implementation target closed.
