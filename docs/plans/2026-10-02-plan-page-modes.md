# Plan pages show the delta, then the result

Status: executed; dotai 7923c7f and Ellie a72df9112 are pushed, and the cross-model review of the execution is next.
Topic: pstack

## Outcome

While a plan is open, its subject page leads each section with what that plan adds, changes or removes, and collapses the current state under it. Once the plan is executed or Done, the same URL shows the subject's current state alone, with past plans as history.

## Defaults

- **Row marks live in a leading `Delta` column.** The alternative is a marker word at the start of each row's first cell. Say "marks in the first cell" to reverse.
- **The fold check compares whole rows, and finds each after fence's text inside the subject's fences**, ignoring only whitespace and case, so a fold may join a call into a larger fence. The alternative checks keys only and misses a changed row that never reached the subject file. Say "check keys only" to reverse.
- **An open iteration leads the page even when a finished one renders**, so two sessions on one subject cannot hide each other's delta; the newest open plan wins. Say "page follows the rendered plan" to reverse.
- **A finished page drops the plan's steps, defaults and review edits**, and lists every iteration collapsed under History. Say "keep details on done" to reverse.
- **Each changed section collapses its whole current state under one Current state fold**, while changed and removed rows show their current version inline. The alternative is a count of unchanged rows inside the same table. Say "count unchanged rows" to reverse.
- **The fold check runs when the lead renders with `--folded` at execution end**, not on every render, because older iterations' calls drift as later plans rewrite them. Say "check every finished plan" to reverse.

## Main changes

- **Plans carry the delta; subject files carry the current state.** A plan writes `before` and `after` pairs under `## Public API` and, in any other section, a table whose first column is `Delta` with rows marked `added`, `changed` or `removed`. `docs/plans/topics/<slug>.md` keeps current call sites as plain fences.
- **One renderer, two page modes.** `plan-page.mjs` leads an open plan's page with its delta, shows the current version of each changed or removed row struck through, and collapses the sections the plan leaves alone. Once every iteration's `Status:` says executed or Done, the page shows the subject alone and lists the iterations as history.
- **The renderer checks the fold.** Every render refuses a subject file with a pair in a paired section and a `Delta` row whose key the subject lacks or already has; `--folded` also refuses while the subject file does not show the plan's marked rows and after lines, or still shows its before lines.
- **One status vocabulary, and no silent rollback.** `.agents/pstack/status.mjs` reads the first word of a `Status:` line for the page mode, the pill and plan-open's `--done` sweep, which checks every landed word. A sync from committed shared source refuses to overwrite a project last synced from uncommitted shared edits.
- **The topic files hold the current state.** `dnd.md` and `pstack.md` keep plain call sites; `pstack.md`'s command map moved, pairs intact, under Hard cuts and app migration. The landing plan's four topic subsections moved into the plan as `Delta` rows.

## Scope

- dotai, the shared source: `skills/sync-pstack/assets/pstack/plan-page.mjs`, its tests in `skills/sync-pstack/scripts/sync-pstack.test.mjs`, the Plan pages rule in `skills/sync-pstack/assets/block.md`, and `skills/cross-review/SKILL.md`.
- plate-2: the synced block and helper; `.agents/playbooks/plan.md`, `.agents/playbooks/build.md` and `.agents/rules/plate-architecture.mdc`; `docs/plans/topics/dnd.md`, `proof.md` and `pstack.md`; `docs/plans/2026-10-02-dnd-schema-derived-landing.md`.
- Out of scope: Ellie's sync, which runs from a committed dotai source; dotai and plate-2 commits, which the owner makes.

## Steps

- [x] Render one open and one finished subject page from the new delta sections. Proof: seven new plan-page tests in `skills/sync-pstack/scripts/sync-pstack.test.mjs`, each red on the renderer before it, 56 of 56 green.
- [x] Render every plan in both projects with the old and the new renderer. Proof: the proof rows in `docs/plans/2026-10-02-plan-page-modes.decisions.tsv`; run artifacts in the session scratchpad, not committed.
- [x] Move the dnd and pstack topic files to the current state and the landing delta into its plan. Proof: `docs/plans/topics/dnd.md`, `pstack.md`; `docs/plans/2026-10-02-dnd-schema-derived-landing.md` Layer and owner, Hard cuts and app migration, Native behavior and proof.
- [x] Teach the delta in the shared rule and the plate-2 rules that named the old shape. Proof: `skills/sync-pstack/assets/block.md` Plan pages; `skills/cross-review/SKILL.md`; `.agents/playbooks/plan.md`, `build.md`; `.agents/rules/plate-architecture.mdc`.
- [x] Sync plate-2 from dotai and verify it. Proof: `sync-pstack.mjs apply` and `check` on plate-2 (in sync); `sync-pstack.mjs verify` exit 0; smoke answers in both runtimes routed the delta to the plan and the fold to execution end.
- [x] Publish the old and new DnD pages and republish the pstack page; the proof page belongs to the device-lane session, which rewrote `proof.md` after this change. Proof: https://claude.ai/artifact/CqBTuhkqnnGV22zZTxpFjF (old), https://claude.ai/artifact/WddBEy4mfjBjRLp3FwVqRz (new), https://claude.ai/artifact/P2PqUfp91Yani3Jy8tDPFD.

## Proof

- dotai: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs`, `scripts/validate-skills`, `node scripts/build-workflow.mjs`.
- Corpus: `run-all.sh` over every `docs/plans/*.md` in plate-2 and Ellie with the old and new renderer, then a diff of each page's `<main>` body.
- plate-2: `sync-pstack.mjs apply`, `verify` and `smoke`.

## Open findings

- **plan-open's `--done` sweep now checks every plan whose `Status:` starts with a landed word**, and four plate-2 plans that say complete or fixed still have open boxes: `2026-04-22-plite-editing-navigation-gauntlet-review-plan.md`, `2026-05-02-plite-hidden-subtree-first-class-ralplan.md`, `2026-09-30-performance-evidence-design.md` and `2026-09-30-review-history-workflow.md`. owner: each plan's author; tracked in this plan's decision log.
