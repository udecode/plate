# Pin landed commits to their session and fix today's delivery mistakes

Status: executed: landed on next, waiting on your review by session
Topic: pstack
Playbook: build

The owner kept CI off ("actions minutes are a worry. i dont want to be slowed down by CI for the whole beta. we'll just trust agents to run the proper CI"), then asked: "i need you to pin the commits for each session so i dont oversee your commits... also analyze all issues from today sessions to correct, especially worktrees / next push / cleanup etc." Midway they said "fast", then "after that you can execute the full plan".

## Brief

### What will change?

Each landed commit now names its session, and the review script lists your unreviewed commits by session, while a run that landed work ends with a 👀 title. Tools now block two mistakes that kept repeating today.

### What could go wrong?

Older commits have no session line, so the review script lists them under one heading. Sessions that started before this lands keep the old rules until they read them again.

## Teach

Since the switch to trunk delivery, every session lands its own commit straight on next, with no pull request in between. You review afterwards with the review script.

Until now that script grouped commits by the plan they mention. You could not tell which session wrote what, or mark one session as reviewed. A read of today's sessions found 157 incident rows, and two mistakes kept coming back: sessions called the app's branch sync, which always refuses next, and a sync started from another project wrote your main checkout.

Now the landing script stamps each commit with its session and its plan. The review script groups by session and marks one session done at a time. A guard turns the app's branch sync into the right rebase command, and the sync tool refuses to write your main checkout.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Leftover edits in the shared rules repo | Sessions keep committing other sessions' leftover edits there, as that repo's own rules say (look) | Each session commits only its own changes there | own changes only | small |
| Review title | An eyes title with no count, until you archive the session | An eyes title with a count, such as 10 of 10 | eyes with count | small |
| When the main checkout refuses a sync | Only in a copy that lands straight on next, which is yours | In every copy of a trunk project | refuse everywhere | detail |
| Status words in a run's log | The error now names the words to use instead; the rule stays | Let a run's log say landed | allow landed | detail |
| Mistakes seen once today | No new check yet, such as for a forced worktree removal | A check for each one now | check each | small |

## Main changes

- `land.mjs` ends each commit with `Session: <id>`, from `CLAUDE_CODE_HOST_SESSION_ID`, `CLAUDE_CODE_SESSION_ID` or `CODEX_SESSION_ID`, and with `Plan: <path>` when the task changes exactly one dated plan. A rerun after a rebase conflict keeps one of each.
- `review.mjs` lists the unreviewed commits on `origin/next`, oldest first and grouped by session, each with its plan and its `Beyond the ask:` line. `--done <session>` marks that session's commits reviewed and moves `refs/pstack/reviewed` past the oldest run of reviewed commits; `none` stands for commits without a `Session:` line. `--mark` marks them all. The reviewed list lives in `<git-common-dir>/pstack-reviewed`, so every worktree of the clone shares it.
- `rules/title.md` closes a run that landed or pushed a commit as `👀 <name>`, and `rules/land.md` has the hand-back list each commit the session landed.
- `guard.mjs` also denies the desktop app's `sync_with_base_branch` and names `git fetch origin next && git rebase origin/next`. `.claude/settings.json` runs it on that tool as well as on Bash.
- `sync-pstack apply` and `sync` refuse to write a trunk project's main checkout when its clone sets `pstack.delivery`, and name the worktree route. A dry run still previews.
- The `decisions-check.mjs` error for a chip-only result in a run's log names the words to use instead: applied, decided, fixed or verified.
- The rules table pairs the force-push guard, the base-sync guard, the main-checkout refusal and the per-session review with what enforces each.

## Incident classes

Five Codex readers went through 168 session digests from 10-17 evening and 10-18 and logged 157 incident rows. Readers sometimes logged one incident twice, so the counts are rows, not distinct events.

| Class | Rows | Call | Why no higher fix, or why this one |
| --- | --- | --- | --- |
| The app's base-branch sync refused next, which changes `.claude` files | 6 | guard denies it and names the rebase | The app is not ours, and its own instructions send agents to that tool first |
| A sync from another project wrote plate-2's main checkout | 1 after the switch | sync-pstack refuses it | Lesson mode syncs every managed project, so every future lesson would repeat it |
| A chip-only status word in a run's log | 7 | the error names the words to use | The checker already refuses, and one session needed two tries |
| Other decision-row refusals, such as a missing `scope:` | about 30 | none | The checker refuses each and names the fix in one call |
| A session swept other sessions' dotai edits into a `wip:` commit | 11 rows, 5 commits | none | dotai's `AGENTS.md` asks for it, so this is a Defaults row |
| A call to a helper the trunk cut removed, a backlog conflict or a PR wait | 10 | none | The restore brought the helpers back, and the backlog is gone |
| A rebase conflict while landing | about 10 | none | land.mjs stops, lists the paths, and reruns once they are resolved |
| A patch that no longer applied to the main checkout | 4 | none | Trunk delivery has no patches |
| PR 5188 opened because the clone lacked its delivery setting | 2 | none | The clone sets it now; a card re-lands that fix |
| An `rm` with a variable target | 3 | none | The hook already denies it |
| A worktree force-removed despite the cleanup scan's ask, and an archived session the owner still needed | 2 | none yet | Each happened once |
| The isolation hook refused a wrapped `git` call | 3 | none | That hook is the app's, not this repository's |
| A new worktree without dependencies or env files | 2 | none | The SessionStart hook now runs `setup.mjs` |
| The owner asked where the commits to review were | 1 | the per-session trail and the 👀 title | That request opened this plan |

## Steps

- [x] Read 157 incident rows from five Codex readers over 168 session digests and group them into classes.
- [x] Stamp each landed commit with its session and plan, group `review.mjs` by session, and close a landed run with 👀.
- [x] Guard the app's base sync, refuse a sync into a trunk main checkout, and name the run-log words in the checker error.
- [x] Commit and push dotai, then sync plate-2 from the pushed commit.
- [x] Hook the guard on the app's sync tool and add the rules-table rows.
- [x] Land plate-2 through `land.mjs`.

## Close

- Landed: dotai `c6d9dfa` holds the trail, the guard, the refusal and the checker message. Its `fadcba8` commits another session's leftover plan-page, page-live, page-stop and pages.md edits, as dotai's `AGENTS.md` asks. plate-2 syncs from `fadcba8`, so those edits ride along, and lands in one commit through `land.mjs`, which stamps it with this session.
- Proof: the land and review tests fail 3 on the old helpers and pass after. The base-sync guard test and the main-checkout refusal test each fail on today's code and pass after. Apply on the real plate-2 main checkout refuses and writes nothing. The full sync-pstack and trunk suites pass, 342 of 342, on dotai's working tree with every session's edits, and skills validate. In this worktree the guard denies the app's sync with the rebase command, `review.mjs` lists the last 20 commits under no session, and `prepare`, the resource check and the drift check pass. Not proven: a real `sync_with_base_branch` call against the hook, and a land that stamps `Session:`, until this commit lands.
- Asks: 3, all done. They were "pin the commits for each session", "analyze all issues from today sessions to correct", and "execute the full plan". CI stays off, as the owner said.
- Deviations: "fast" dropped the panel, `no-comments` and reflect. Nothing reversed.

## Open work

- This change shipped fast and is owed a review. owner: zbeyens. stop: "full" or the owner drops the review.
- A worktree force-removed despite the cleanup scan's ask, and an archived session the owner still needed, each happened once. A second time gets a check through `/pstack:correct`. owner: the lead. stop: the second time either happens.
- ellie and plate pick up dotai `fadcba8` at their next sync. owner: zbeyens. stop: each project's next sync.
