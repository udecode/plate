---
name: redo
description: "Redo a prior pstack run at the current session's higher effort or stronger model, treating its plan as a draft: rerun only the plan, design, subagent and seat lanes, code and review judgments that ran below the current level, and reuse the rest. Use for \"redo <plan, page or PR>\", \"run poteto again on it at this effort\", \"treat this plan as a draft\", or a teammate's run made at a lower effort."
argument-hint: '<plan path, page link or PR>'
---

# Redo

A run made at a lower effort or on a weaker model is a draft. Redo follows pstack's Session pickup, except that it redoes the work that ran below the current level and reuses everything else. Load `pstack:poteto-mode` first; its playbooks and the project's gates still own each step.

1. **Find the draft.** A plan path is the draft. For a page link, find the plan whose subject or plan file holds that `Page:` line (`git grep -l 'Page: <link>'` in the plans directory); for a PR, the plan its body links. Read the plan, its subject file, its decision log and its run directory under `<plans>/artifacts/`. Never read the published page, because another account may own it.
2. **Read the levels.** `node .agents/pstack/lead.mjs` prints the current session's `<model> @<effort>`. In the draft's log, each `lead` row names the model and effort of the session that wrote the rows after it, and each `seats` row names every seat's level. A subagent role runs at its models-sheet line. A stretch with no `lead` row, or a seat with no level, counts as below the current level.
3. **Write the ledger.** Open a new iteration of the draft's subject with the `plan-page` skill. Its Brief names the draft and the level change, and its `## Redo` table lists every unit of the draft with its producer, that producer's level and one verdict:
   - `redo`: judgment a producer made below the level the current setup gives its role. That covers the plan and its Defaults, design picks, each subagent or seat lane, each panel finding's disposition, the code each `built:` row names, and the Close and its claims. It also covers any unit the draft marked weak: a `partial`, `gap`, `open` or `inconclusive` row, a `missing` seat, a same-family round or a dismissed critical finding.
   - `reuse`: deterministic evidence on bytes the redo will not change, such as a test run, a proof log or a render, and any lane already at or above the current level. Cite it, and do not run it again.
   - `recheck`: reused evidence whose inputs a redo may change. It reruns after the redo.
   When no unit is `redo`, say so on the page and stop.
4. **Redo the plan and design first.** Work from the owner's asks and the draft's inputs before reading the draft's conclusions, then compare and log each pick kept, changed or dropped. A design step that runs `architect` or an arena takes the draft's design as one more candidate. An unbuilt draft plan becomes `superseded`; a built one stays and the new iteration continues it.
5. **Rerun the lanes.** Each `redo` lane runs again on its configured model and level, from its brief in the run directory. Re-judge every reused seat answer at the current level, and log a new `panel` row for each finding whose disposition changes.
6. **Clean up the code as a PR.** Run the project's Babysit playbook, or pstack's, over the draft's diff at the current level. The fixes then take the project's usual gates.
7. **Recheck and close.** Rerun each `recheck` proof. The Close lists what was redone and what changed, what was reused and why, and any unit whose level stayed unknown.
