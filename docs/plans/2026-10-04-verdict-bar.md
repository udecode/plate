# A lighter review loop

Status: executed
Topic: pstack

The panel on a Pursue verdict goes, because the plan's `architect` arena and panel already attack whether the change should exist, and `next` recommends the move for the item's state so "go" takes it.

## Public API

A Pursue verdict no longer gets its own panel.

```text before
(nothing to type: a Pursue verdict's record gets the same panel)
```

```text after
retired
```

## Main changes

- **No panel on a Pursue verdict.** The `pursue-record` row leaves plate-2's reviews list, and a Pursue verdict goes straight into the Plan playbook, where an API plan still gets `architect` and one panel.
- **`next` recommends one move.** The page recommends review for an unreviewed scope or a stale verdict and plan for a Pursue verdict with no bound adoption, with another scope and hold as the other options, and "go" takes the recommendation.
- **Playbooks rank with project rules.** plate-2's `AGENTS.md` says its project playbooks rank with its rules outside the pstack block, so the owner's pick of a ledger item stays an Open question although Plan pages would make a recommended call a Defaults row.

## Steps

1. - [x] **Cut and bar.** Remove `pursue-record` from `.agents/pstack.json`, drop the record-panel bullet and add the recommendation to `.agents/playbooks/api-review.md`, regenerate skills and render `AGENTS.md`. Proof: `sync-resources --check`, `sync-pstack check` and `verify`. Done: `sync-resources --check` 'Required skill resources: exact.', `sync-pstack check` 'in sync', `sync-pstack verify` exit 0.
2. - [x] **Docs and guide.** Fix `docs/development/agent-skills.md` and the Plate v2 workflow guide. Proof: a search for the old promise finds nothing. Done: `git grep -i 'pursue-record|Pursue verdict's record|panel on its review record'` over `AGENTS.md`, `.agents` and `docs/development` finds nothing, while the pre-change copies hold it; https://claude.ai/code/artifact/2aff4561-601c-4cef-83c8-37c0c3a4a2d0 (rev 56).
3. - [x] **Smoke.** In both runtimes, `next` recommends a move and "go" takes it,  Proof: the smoke output. Done: `sync-pstack smoke` in Claude Code and Codex, the last run after the final edit.

## Close

Reversal first: three versions of a P0, P1 and P2 bar went into best-api-review and the API review playbook, the last one a rule to stop iterating an item once only P2 findings remained. The owner removed it, so best-api-review is back to its original text and the loop keeps its verdict rules as they were.

What landed: a Pursue verdict goes straight into the plan with no panel of its own, and `next` recommends one move that "go" takes. plate-2's config, playbook, best-api-review rule, `AGENTS.md` and developer guide stay uncommitted for the owner. The Plate v2 workflow guide (rev 56) and the flowchart at https://claude.ai/artifact/Eswdtun2UhQyS45fXeTKVk show the new loop.

Proof: in both runtimes, `next` recommends a move and stops, and "go" reviews or plans it. The smokes also found two rule clashes this change touched: the owner's pick against Plan pages' Defaults rule, and playbooks missing from the precedence order. Both are fixed, and the last smoke ran after the fix. `AGENTS.md` was rendered from the shared dotai checkout, because another session had already synced plate-2 from its uncommitted dotai edits. The dry run showed only the `pursue-record` line leaving.

Counts: 6 items. 6 done, 0 skipped, 0 blocked, 0 open.

Open work, moved to the subject file's Open work with owner Ziad:

- The shared block's precedence order never ranks project playbooks. plate-2 now ranks them in its own `AGENTS.md`; the block should say it for every project.
- A panel's Codex seats spend paid quota, while the shared-resources rule asks for the owner's go-ahead per target. The reviews list may count as that go-ahead, but no rule says so.
- Codex sessions skip pages, while the API review playbook stops on a published page.
- The block's Review rule reruns `/pstack:interrogate` after any design change, while the Panel rule earns another round only from an applied critical finding, and Codex reads the two as clashing.

