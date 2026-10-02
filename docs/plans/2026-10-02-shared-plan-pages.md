# Shared plan pages with plate-specific review sections

Status: executed; the panel review in 2026-10-02-codex-panel-seats.md retired its cross-review hand-off, so no review is pending
Topic: pstack

## Public API

How a plan becomes a page. Before is plate-2 today.

```text before
node tooling/scripts/plan-page.mjs <plan>        # plate-2 only; Ellie has no pages
Plan pages rule: plate-2 AGENTS.md
Page order: Needs you, Public API, Main changes, Picked for you, other sections, Details
```

```text after
node .agents/pstack/plan-page.mjs <plan>         # every synced project
Plan pages rule: the pstack block (Ellie and plate-2)
Page order: Needs you, Public API, the project's pageLead sections, Main changes, Picked for you, other sections, Details
"pageLead" in .agents/pstack.json, plate-2:
  What other editors do, Document shape, Layer and owner,
  Hard cuts and app migration, Native behavior and proof
"pagePairs", plate-2: Document shape
```

## Main changes

- **One renderer for every project.** `plan-page.mjs` moves from plate-2's `tooling/scripts` into dotai's sync-pstack helpers, synced to `.agents/pstack/` like `plan-open.mjs`. Improving the page shape is a sync-pstack lesson: one edit, tested, synced everywhere.
- **The Plan pages rule moves into the block**, so Ellie plans get pages too.
- **Projects add review sections by config, not by forking the renderer.** `pageLead` in `.agents/pstack.json` lists section titles that render as panels right after Public API, in that order. Ellie sets none.
- **The renderer refuses a Public API section without a rendered pair.** Each `before` fence must be followed directly by its `after` fence, and at least one pair must exist, in `## Public API` and in any section a project lists in `pagePairs` (plate-2 lists Document shape). A section with nothing to show is removed, not filled with prose. The check cannot see a missing section.
- **plate-architecture requires the plate sections when they apply**: what other editors do, document shape before and after, layer and owner, hard cuts and app migration, native behavior and proof.

## Defaults

- **Shared renderer through sync-pstack.** Picked by the owner. Say "plate-2 only" to reverse.
- **No page skill.** The renderer and the block rule are the one owner; a skill would restate them. Say "add a page skill" to reverse.
- **All four plate sections plus the editors table.** Picked by the owner. Each appears only when it applies.
- **Scale receipt stays conditional, not in `pageLead`.** It renders only from Benchmark plans. Say "lead with scale" to reverse.
- **Page freshness stays a written rule.** You declined a Stop hook that would block a turn while a changed plan's page is stale. Say "add the page guard" to reverse.
- **Review pages stay hand-built for now.** A recorded review has no markdown form the renderer can read; giving it one is a change to `best-api-review`'s record, tracked under Follow-ups. Say "render reviews" to reverse.

## Steps

1. - [x] **Shared renderer.** Move the renderer into `skills/sync-pstack/assets/pstack/plan-page.mjs`, read `pageLead` and `pagePairs` from `.agents/pstack.json`, and fail a pair section without a rendered pair. Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs`, where pageLead order, a prose Public API, a separated pair, pagePairs scoping and the short-dash hang each failed first; relabeling and keeping `asks` collapsed have no test by the Tests rule.
2. - [x] **Sync wiring and rule.** Add the helper to the `plans` helper set, move the Plan pages rule into the block, and teach `pageLead`, `pagePairs` and the page-shape lesson route in `SKILL.md`. Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` 43/43, `scripts/validate-skills`, `node scripts/build-workflow.mjs --check`; dotai `d3d2ab7`.
3. - [x] **plate-2.** Remove `tooling/scripts/plan-page.mjs` and the `AGENTS.md` Plan pages section, set `pageLead` and `pagePairs`, require the sections in `plate-architecture.mdc` and its Ready list, and write them from the Plan playbook. Proof: `bun x skiller@latest apply` and `sync-resources.mjs --check` exact; a headings smoke lists all five sections in Claude Code and Codex.
4. - [x] **Ellie.** Sync and render. Proof: Ellie `c4302872f`; all 1015 Ellie plans render, 951 identical to before and 64 that hung before.
5. - [x] **Writing passes.** `pstack:deslop` and `pstack:no-comments` on the renderer's diff from plate-2's original; one `unslop` pass on the block bullet and this plan. Proof: the writing-passes row in the decision log.
6. - [x] **Close.** Decision-trail review before the dotai push, smoke a plan request in both projects and both runtimes, full render sweep of both projects' plans, republish this page, then `$cross-review`. Proof: the trail row, the smoke and comparison rows, https://claude.ai/artifact/92w8yYGHzVTokEWDC4Ls1N.

## Proof

Each step names its proof. Commits: dotai `d3d2ab7`, Ellie `c4302872f`. plate-2 changes are uncommitted; the owner commits them.

## Follow-ups

- Deferred, owner: zbeyens, tracked in this plan. Give a recorded best-api-review a markdown form, so `plan-page.mjs` renders review pages and the Public API pair check covers them.
- Deferred, owner: zbeyens, tracked in this plan. sync-pstack setup does not check that `docs/plans/artifacts/` is git-ignored in a new project; both current projects ignore it.
