# One page per subject

Status: executed; the panel review in 2026-10-02-codex-panel-seats.md retired its cross-review hand-off, so no review is pending
Topic: pstack

## Public API

How a plan reaches its page.

```text before
node .agents/pstack/plan-page.mjs <plan>    (one page per plan)
```

```text after
node .agents/pstack/plan-page.mjs <plan>    (one page per subject: Topic: <slug>, or the first review_scopes entry in plate-2)
```

## Main changes

- **A page belongs to a subject, not to a plan.** A plan joins its subject through a `Topic:` line or, in plate-2, its first review scope; the renderer then draws the subject page: the subject file's cumulative before and after first, then every iteration newest first. An iteration never gets its own page.
- **plate-2's ledger scope is the subject for product work.** `pageTopic` reads `review_scopes`, so dnd plans land on one dnd page that links the scope's history hub; no second identity sits beside the ledger. A scoped plan whose subject has no file yet keeps its own page, so plans in flight are not blocked.
- **A ledger scope's page must show what other editors do.** `pageTopic.require` makes the render fail without it, which is the check the first dnd page lacked.
- **Cross-review reads the subject file**, so the part the owner reviews on the page is reviewed too.
- **pstack gets one full page** from `docs/plans/topics/pstack.md`, before being plate-2 before pstack, and the three per-plan pstack pages are retired; deleting them needs your confirmation, which this session cannot get.

## Defaults

- **Ledger scope as subject in plate-2; topic files elsewhere.** Picked by the owner. Say "topic files everywhere" to reverse.
- **pstack and dnd move now.** Picked by the owner.
- **Delete the three old pstack pages and start one new page.** Picked by the owner. The two dnd plan pages belong to other sessions' plans and stay until you say "delete the dnd pages".
- **The ledger docs keep their layout.** Pages read them; reorganizing the files buys nothing a reader sees. Say "reorganize the ledger docs" to reverse.

## Steps

1. - [x] **Subject pages in the renderer.** `Topic:` and `pageTopic.field` resolve a subject; the page reads `topics/<slug>.md`, lists every iteration with each unfinished one's questions, defaults and hand-off, falls back to a scoped plan's own page until its subject file exists, and requires `pageTopic.require` sections when the hub exists. Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` 49/49, seven subject tests each failed first.
2. - [x] **Block rule.** The Plan pages bullet keys pages to subjects. Proof: `node --test`, `scripts/validate-skills`, `node scripts/build-workflow.mjs --check`; cross-review reads the subject file.
3. - [x] **pstack.** `topics/pstack.md` with the cumulative before and after, `Topic: pstack` on its five earlier plans and this one, one new page, the three old pages retired. Proof: https://claude.ai/artifact/P2PqUfp91Yani3Jy8tDPFD lists six iterations with three hand-offs; deleting the three old pages is yours (`/artifacts`, then `d`).
4. - [x] **dnd.** `pageTopic` in `.agents/pstack.json`, `topics/dnd.md`, `Topic: dnd` on the benchmark plan, one dnd page. Proof: https://claude.ai/artifact/WddBEy4mfjBjRLp3FwVqRz shows What other editors do, Layer and owner, Hard cuts and app migration, Native behavior and proof, the three dnd iterations and the hub link; it refuses to render without the editor comparison.
5. - [x] **Close.** Writing passes, decision-trail review, Ellie sync, smoke, verify, then `$cross-review`. Proof: dotai `ba15f71`, Ellie `99137460b`, `sync-pstack verify` on both, smokes in both projects and runtimes, 2111 of 2111 plate-2 plans render; plate-2 changes are uncommitted for the owner.
