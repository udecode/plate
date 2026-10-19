# Bring suggested tasks back under trunk delivery

Status: executed: waits on the owner's ledger commit and the PR 5191 close
Topic: pstack
Playbook: build

The owner objected to the trunk delivery cut of the chips skill, then asked: "keep chips: restore chips slimmed for trunk with decisions-check, restore the Extraction rule so the how explorer runs on Codex again, delete the orphaned scripts, and count my /redo and babysit-levels uses before deciding on those". Mid-run they found the same cut had dropped stage session titles and said "recover it".

## Brief

### What will change?

Suggested tasks are back in plate-2: offers, the board, cards and sweeps, with the decision-log checker. Cards land their own commit, and evidence finding runs on Codex again. Sessions get stage titles again, such as `🚧 restore chips (6/9)`.

### What could go wrong?

New ledger rows sit uncommitted in your main copy until you commit them. Babysit's effort check stays off here. Ellie and plate pick up the shared change on their next sync.

## Teach

Suggested tasks are side jobs an agent finds but should not do itself. Each one is a row in a shared log, the ledger. A board lists them, and you start one as a card in a new session.

Yesterday's move to trunk delivery cut the ledger, its checker and the evidence-finding rule from plate-2. Side jobs went to a plain backlog file, and the evidence finder ran on the lead's own model.

Now they come back, shaped for trunk. Every session works in its own copy, so the ledger lives only in your main copy, and the checker writes there from any copy. A card lands its own commit with the landing script, then removes its copy. Evidence finding runs on Codex again.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Ledger commits | New rows stay uncommitted in your main copy until you commit them (look) | Each task commits the ledger rows it writes | commit the ledger | small |
| Babysit effort check | Stays off under trunk, while redo and its effort report come back (look) | Bring the Babysit check back too | keep babysit levels | small |
| Backlog file | Deleted, and its entries added since the switch become suggested tasks | Keep the file beside the ledger | keep backlog | small |
| Smoke runs | plate-2 in both runtimes, while ellie and plate rely on the replay of their rules | Smoke all three projects | smoke all | detail |
| Who wrote the helper change | The lead, since it is a few dozen lines | A code helper at high effort | delegate | detail |
| Waits on files outside the checkout | Dropped under trunk, since every session has its own worktree (look) | Keep those waits, so two tasks that write the same outside file never run at once | keep outside waits | small |
| Stage session titles | Back under trunk, with `rules/title.md` and its rename hint | One plain title per task, as the trunk cut had it | plain titles | small |
| Obsolete mutation item | Dropped from `docs/plans/topics/correct.md`, because trunk projects no longer install `freeze.mjs` or `mutate.mjs` | Keep the item open | keep mutation item | detail |
| Codex smoke | Skipped, because "fast" drops runs that spawn an agent. Claude Code ran the ledger redirect, the offers and the board live | Smoke the routes in Codex | smoke codex | small |

## Open questions

### Backlog PR

Should I close the open PR that trims the backlog file?

Why it needs you: Closing a PR on the public repo is a message anyone can read.

- That PR only trims the backlog file this change deletes.

- **Close it** (recommended): I close it with a one-line note. Cost: None, and its branch stays.
- **Leave it**: It stays open. Cost: A stale PR in the queue.

Why I pick it: The file it edits no longer exists after this lands.

Attention: safe

## Main changes

- In a trunk project, `decisions-check.mjs` runs `chips` and an `append` to the ledger from the main checkout, the first entry of `git worktree list --porcelain`, so every worktree reads and writes one live ledger. It resolves `--from` and `--sessions` against the caller's directory first.
- A relative evidence or `proof:` path missing in the worktree counts when the main checkout holds it, because the run directory lives there.
- `chips brief` gives a trunk card a landing paragraph that lands through `land.mjs`, logs `landed` with `commit:` and removes the card's worktree last. Patch landing, the owner commit gate and the waits on writes outside the checkout are gone from trunk briefs.
- sync-pstack installs `decisions-check.mjs`, `levels.mjs`, `tasks.mjs` and `rules/chips.md` in every delivery again, and the trunk block renders the Suggested tasks, Extraction, Effort cap and Writing passes rules it had cut. The Side work rule and the session-card wording are gone.
- The `chips` and `redo` skills come back to plate-2. Babysit levels and Codex workers stay out of trunk projects.
- The orphaned `autostage-next`, `stale-claims` and `stale-mutations` scripts and `docs/plans/backlog.md` are deleted. The verify references, the contributor guide, the rules table and the `authored` and `correct` subject files now point at suggested tasks instead.
- Every delivery installs `rules/title.md` again, and the trunk block renders the Session title rule that reads it. `decisions-check.mjs append` prints its "Rename the session now" hint again.

## Steps

- [x] Restore the gates, rules and helpers in dotai with a test for a linked worktree in a trunk project.
- [x] Replay the plate-2, ellie and plate renders against the old helpers.
- [x] Run one panel round on the dotai diff and settle its findings.
- [x] Smoke the changed routes in plate-2 in Claude Code. Codex is skipped, as Defaults says.
- [x] Commit and push dotai, then apply it to plate-2 from the pushed commit.
- [x] Reinstall `chips` and `redo` in plate-2 and take them off `dropped`.
- [x] Move the backlog entries added since the switch into the ledger, then delete the backlog file and the orphaned scripts.
- [x] Restore stage session titles under trunk in dotai and apply them to plate-2.
- [x] Verify the install and land plate-2 through `land.mjs`.

## Close

- Landed: dotai `2909ea0` restores chips, decisions-check and the Extraction rule under trunk. Its `18552bb` restores stage session titles; another session's wip commit took those edits, so that commit's message does not name them. plate-2 syncs from `18552bb` and lands in one commit.
- Proof: the full sync-pstack suite passes, 330 of 330. The decision-log replay shows no difference in plate-2, ellie or plate. Claude Code wrote 33 ledger rows from this worktree into the main checkout. `prepare` and the resource check pass. A write-free apply differs from the dotai checkout only in three renderer files another session has not committed. The Codex smoke and panel round 2 did not run, because the owner said "fast".
- Asks: 5, all done. They were restore chips slimmed for trunk, restore the Extraction rule, delete the orphaned scripts, count `/redo` and Babysit levels uses first, and "recover it" for session titles. The count found `/redo` typed 3 times, all on PR 5165, so `redo` came back. Babysit levels stay out of trunk.
- Deviations: waits on files outside the checkout are gone under trunk, and the `correct` subject drops its mutation item. Defaults gives the word that reverses each.
- Open: the ledger's new rows sit uncommitted in the main checkout. Closing PR 5191 waits as a draft for the owner.

## Open work

- Sync ellie and plate from dotai `18552bb` or later. Owner: the lead. Stop: both projects' `sync-pstack verify` passes.
- Another session holds uncommitted edits to `page-live.mjs`, `page-stop.mjs` and `plan-page.mjs` in the dotai checkout, so `sync-pstack verify` there reports those three files until it commits them and plate-2 syncs again. Owner: that session. Stop: plate-2's next sync.
- The owner's "full" review of the trunk delivery commits shipped fast. Owner: the owner. Stop: the owner says "full".
