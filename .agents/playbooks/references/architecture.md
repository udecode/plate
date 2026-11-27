# Plate architecture reference

Read by Plan (API/architecture), Build (Hard cut), audits (Audit) and P0 to P3 rankings (Priority). `best-api` owns call shape, `research audit` owns editor comparison, `benchmark` owns measurement.

## Pick the layer

Read `VISION.md` + `docs/vision/{plite,plate}.md`; link laws instead of copying them. Start at the first unresolved boundary and give each touched layer its own rows. Before calling a flow registry-only, check if one mounted Editable exposes a neutral runtime/DOM law (put derivable primitives/DOM protocols in Plite React; Plate inherits them; registry UI owns markers/styling; never add view-toggle plugins/kits). Verify owner placement and cross-entrypoint moves against `tooling/entrypoints/entrypoint-dag.mjs` (include in arena grounding).

## Decision ledger

One concept-level table per plan: `| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |` (`keep`, `cut`, `rearchitect`, `rename`, `move`, `bridge`, `defer`, `gate`). Breaking rows name callers, docs/example adoption and proof; `defer` names missing evidence/owner; private bridges name owner, non-public proof, deletion trigger and removal gate. Scale-sensitive rows (cache, index, store, subscription, scheduler, geometry, per-node fan-out) need Benchmark's pre-acceptance probe (`.agents/rules/benchmark/templates/performance-observability.md`) or stay `defer`/`gate`.

## Layer gates

- **Both:** High-risk changes (public API, model, ops, normalization, selection, IME, DOM, React subscription, history, collaboration, browser, generated contracts) record 3 failures, `pstack:blast-radius`, rollback/hard-cut answer and focused proof. Cache/skip rules need a replay probe test. A blast-radius probe disproving a shipped fact triggers Bug fix Pokayoke across all readers. Browser/device claims follow `verify`.
- **Plate:** Mounted-view rows name Plite React input, Plate proxy, copied-UI owner, deleted surfaces, multi-view + native-selection proof.
- **Plite:** Controlled canonical selection proves 2 Editables/1 editor, 2 independent editors, expanded/collapsed paint, root/direction, native-paint dedup, SSR/unmounted, zero DOM/focus/input/history/clipboard/projection mutation. Input-stamp filters trace all producers (model, DOM repair, composition, Android pending diffs, `input` fallback); per-Editable rules carry the Editable.

## Page sections

Delta sections (`plan-page.mjs --pr` renders after Public API via Plan's `page-lead`): `## What other editors do` (always; revisions read + ProseMirror/Lexical/Slate/Tiptap table; cite external files `<owner>/<repo>@<commit>:<path>[:line]`, never bare `packages/...`; pivots add finding column + Google Docs/Word web/CKEditor 5 rows with browser/date or `not run` + reason); `## Document shape` (`json before`/`after` + readers); `## Layer and owner` (`Change | Layer | Package | Why`, DAG-checked); `## Hard cuts and app migration` (deleted surface, `pstack:blast-radius` callers, before/after app/registry); `## Native behavior and proof` (behavior, change, proof surface or `unproven`).

## Ready

Live evidence for current claims, one owner per responsibility, resolved verdicts, adoption/docs/proof on public breaks, concrete next-phase slices + target-pick scale receipts, applicable Page sections, zero decision-changing open questions.

## Hard cut

Runs via Build only on owner ask, requested review's Pursue (`look` Defaults), or `VISION.md`/`docs/vision/` rule. Other cuts stay kept (`look` Defaults), judged on merits in the plan or `## Open questions`; `node tooling/scripts/plan-cuts.mjs land` enforces this. Delete in one wave (`pstack:principle-migrate-callers-then-delete-legacy-apis`), reaching every caller: run `pstack:blast-radius` (serialized docs, registry copies, docs, generated output, downstream apps, non-done `status.mjs` plans); remove exports, flags, routes, types, state, dead tests, docs, examples and comments; zero stubs/throws/aliases/shims/dead branches; re-grep live files. Closeout: `pnpm brl`, `pnpm --filter www build:registry` (if registry changed), `changeset`, `best-api repair` (if reusable API changed), narrowest honest proof.

## Audit

Read-only scoring. Build a bounded manifest first (`expected=<n> reviewed=<n> excluded=<n> missing=<n> duplicates=<n>`; package audits: `git ls-files --cached --others --exclude-standard packages/<package>`; colocation/helper audits list files, declarations, plugin blocks, `tx`/`editor`/`api`/`read`/store helpers, exports, consumers). Score each unit separately (headless + React = one unit); never average across units.

Classify state lifetime (durable doc, shared app, editor-session, view-local, derived cache) and trace writers, readers, invalidation, serialization, collaboration, lifecycle. Grade 7 axes 0 to 4 -> raw `/10` = `sum(grade/4 * weight)` with citations/falsifiers: `owner` 2.0, `lifetime` 2.0, `boundary` 1.0, `api` 1.5, `scale` 1.5, `correctness` 1.0, `proof` 1.0. Lowest cap wins: `correctness-blocker` 1.0, `wrong-owner`/`duplicate-truth` 2.0, `wrong-lifetime` 3.0, `reachability-contradiction` 5.0, `unmeasured-scale` 6.0 (provisional `<=6.0/10`), `incomplete-manifest` n/a. Report evidence confidence `/100` (inventory 35, trace 30, consumers 20, runtime 15). Table: `| Priority | Surface | Current friction | Best direction | Delete / hide | Owner | Proof |`.

## Priority

Shared Plate scale (panels use `panel.md` critical/warning/nit), by user/ecosystem cost: **P0** corruption, security, serialized-data break, hard native/model violation, unusable primary public contract, or wrong foundational public ontology; **P1** wrong canonical owner/lifetime, competing writable truth, material scale law, or high-frequency DX/inference/discoverability/composition debt; **P2** bounded reachability/API/adoption/proof debt with safe path; **P3** local naming/teaching/cleanup debt.
