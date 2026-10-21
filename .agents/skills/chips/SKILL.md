---
name: chips
description: "Run the project's suggested-task ledger, the chips. /chips alone brings every open task up to date: it applies what the ledger helper says, settles stale and split tasks, cards what can start and reports the board. Use for /chips, /chips offer, start or drop, \"what chips are open\", \"suggest a task for X\", \"update the chips\", \"clean up the chips\", \"which chips are stale\", and whenever pstack would file a tracked issue, a follow-up, a reflect Backlog item or an out-of-band PR."
argument-hint: '[offer <finding> | start <id> | drop <id>]'
---

# Chips

Chips are a project's suggested tasks, the side work outside a run's target, or a measurement that does not fit a run's one-hour budget, that the owner can start in a new session. They live as rows in one ledger per project, and a card in a suggest tool is only a view of one. The law is `.agents/pstack/rules/chips.md`, which sync-pstack renders into every project. Read it in full before this session's first ledger write, except in a session a card started, whose brief holds what its own task's rows need. This skill runs its modes; it adds no rule of its own.

Every command below is `node .agents/pstack/decisions-check.mjs <command>`, run from the project's checkout, which a card session that opened in its own worktree names by the path its brief prints. In a trunk project, where every session works in its own worktree, every command runs as written from that worktree, because the helper switches to the main checkout on its own for `chips` and for an `append` to the ledger. Get this session's id from the runtime's session tool, such as Claude Code desktop's `get_session` with `self`, and pass `--session <id>` to every board read. A runtime with no session tool reads the board without it.

| Mode | Use it to |
| --- | --- |
| [Sweep](#sweep), `/chips` with no argument, `/chips all` or `/chips codex` | bring this session's open tasks up to date, card what can start and report the board; `all` also lists every priority and takes the tasks no live session owns, and `codex` forces the Codex handoff on each card it offers, outside trunk delivery |
| [Offer](#offer) | add a finding, the one way new work enters the ledger |
| [Start](#start) | begin a task a card opened, in the card's session |
| [Drop](#drop) | record the owner's word to drop a task |

pstack calls these modes too. Where a pstack step files a tracked issue, a follow-up or a reflect Backlog item, or puts an out-of-band fix in its own PR, the lead runs Offer instead. It runs a sweep only on `/chips`, as chips.md's Sweep says. A question about open chips, such as "what's next" over side work, runs steps 1 and 6 without step 1's cleanup and writes nothing.

## Sweep

1. In a trunk project, first run `node .agents/pstack/setup.mjs` from the main checkout, which fast-forwards it when no local edit is in the way. Run `chips --session <id>` and `chips stale`. The stale report lists each open task with its age, its priority, a ship item that closed, the paths it writes that were deleted since its offer or are missing, the commits on its paths since its offer, its closed PR waits and its card, the likeliest stale first.

   Then clean up the card sessions of landed tasks, as chips.md's Cleanup says. Save the session tool's list of every session, archived ones included, such as Claude Code desktop's `list_sessions` with `include_archived` and a `limit` above the session count, as a JSON array in the run directory, and run `chips cleanup --sessions <file> --session <id>`. For each session it lists under Archive, read that session's last report with the session tool and fix each piece of workflow friction the report leaves unsettled, as chips.md's Landing says. Then archive each session it lists under Archive, save the list again, run `chips cleanup` again and run the `scan.mjs --remove` command it prints. Keep the first run's Report lines for step 6. Under `/chips all`, read the board again with `chips all --session <id> --sessions <file>`, using the list saved last, as chips.md's Owner says, and use that board from here on. A runtime with no session tool skips this.
2. Apply the pass the Do list shows, together with the run's own rows that chips.md's Sweep lists, in one `append --from <file>` batch:
   - Withdrawal pass: call the dismiss tool on each card it names, then log the row the tool's report decides, as each item says.
   - Ledger pass: log each row it names. For a prioritize item, judge the task's priority from its brief as chips.md's Priority says, and check that a bug's repro still fails before you claim P0 or P1 for it. For a ship item, append the offer it prints.
   - Card pass: leave it to step 5.
   - Check items: look each session up with the session tool, read the last report of each archived one, and log the row chips.md's Sweep gives for it. A task the tool cannot settle stays started, and step 6 says why.

   Run `chips --session <id>` again and repeat until the Do list shows only the card pass or nothing you can apply. When `append` refuses a batch, fix or drop the refused row as its message says and append the rest.
3. Judge each task the stale report gives a fact, from its brief, those facts and the code, and append the rows in one batch:
   - When the tree already holds its fix, log `dismissed done`, citing the commit.
   - When its target was deleted since its offer, log `dismissed superseded`. When a path only moved, log `updated` with the new `writes:`.
   - A missing path is one the offer named wrongly or one the task will create. Find the real path with `git ls-files` and log `updated` with it, or leave a path the task creates. A carded task's `updated` only drops paths, so its session names the real one in its `started` row.
   - When a PR it waits on closed without merging, log `updated` with the waits it has now.
   - When two open tasks answer one question, log the topic move and `dismissed dup` that chips.md's Sweep gives. When the keeper holds a card or is started, log `waits: task:<keeper>` on the other instead.
   - For a started task, log `landed` when a commit holds its change. Step 2's check item settles the rest from its session, so never ask the owner whether that session still runs.
   - When the report marks a task possibly thin, find its finding in the plan, log or run its offer names, and log it as a `folded` row. When this session holds the task's card, withdraw it first. When another session holds it, fold the finding once that card leaves the queue. When no source holds the finding, leave the task as it is. Step 6 says which tasks stay thin.
   - Judge the dependencies and effort of each task that holds a card, as chips.md's Cards says.
   - Judge each task's own priority again against chips.md's Priority; the stale report prints it as `own` when a waiting task raises it. Log `updated` with the right `priority:` and its evidence when it differs. When the report says a task's ship item closed, log `dismissed done` when the item's work landed, or `updated` with the priority its work has now.
4. Repeat step 2 for what step 3 changed.
5. Card pass: before each card, judge the task's dependencies and effort as chips.md's Cards says. Then offer each card the Do list names with what `chips brief <id>` prints as its prompt, verbatim, the brief's first line as its title, which starts with the task's priority such as `[P0]`, shortened to fit the tool's title limit with that priority and any `(xhigh)` or `(fast)` kept, the effort its brief shows and its own worktree, such as `start_session`'s `use_worktree: true`, because the tool's default shares this session's folder when this session did not start in a worktree, all in the same turn, then log `carded` with `card:` and `session:`, plus `codex: always` under `/chips codex` outside trunk delivery. A runtime with no suggest tool lists each Ready task in the plan's `## Open work` instead, as chips.md's Limits says. Before each card, check whether the task's `writes:` touch an active plan, one whose `Status:` starts with a word `status.mjs` counts as active, such as building. That plan's files are the plan itself, its decision log and its subject file `<plans>/topics/<topic>.md`. The topic is its `Topic:` line, or the first entry of the frontmatter list that `pageTopic.field` in `.agents/pstack.json` names. Its session is rewriting those files, and `chips` sees only ledger tasks, so log `updated` with the task's waits plus `run:<that plan>` instead of the card.
6. Report first the cleanup's Report lines, each task the sweep cleaned up with its commits, and each worktree `scan.mjs --remove` kept with its reason. Then report in plain words each row this sweep logged, one line each, then what can start and whether it has a card, with `start <id>` beside each Ready task the 10-card limit left uncarded, what is started, why it stays open and that "drop <id>" closes it, what waits and on what, grouped by the thing waited on, and the fast work owed a review. When a task waits on landed work the owner has not committed, the report suggests that commit before it lists what can start, naming each landed task and how many waiting tasks its commit frees, because those tasks can start only after it. Name each task by id and title. The report names each commit by its subject and ends with its links, the cleanup lines' links included, as the block's Links in replies rule says, with the owner and repository read from the checkout's `origin` remote. The report asks the owner nothing. When a session's report or its plan holds a question for the owner, the lead settles it. It answers from the law that governs the question, as a `look` Defaults row in that plan with a decision row and a message to the session. When no law answers it, the lead offers it as a `decide` task. The owner reverses a dismissal by asking, and the lead offers the task again.

## Offer

1. Run `chips --session <id>` first, and read the brief of each open task whose topic or title touches the finding with `chips brief <id>`.
2. Pick the row as chips.md's Offer says:
   - When the finding belongs to an offered task's question and that task holds no card, log a `folded` row on it with what the finding adds.
   - When it belongs to the question of a started task or of one that holds a card, offer a new task in that topic with `waits: task:<id>`. `chips` merges it into a carded task once the card is withdrawn.
   - Otherwise offer a new task with an id from `chips id`, a plain imperative title, `(xhigh)` only where chips.md's Title rule gives it, and its `writes:`, `topic:`, `kind:`, `priority:` with the evidence chips.md's Priority asks, `waits:`, `owns:` and `session:`, this session's id, which makes it this session's task, as chips.md's Owner says. Its `waits:` include `run:<plan>` for each active plan whose files it writes, as Sweep step 5 finds them. Reuse a topic the board lists when the finding answers its question. A new topic names one owner question, never an area.
3. Append it with `append <plans>/suggested-tasks.decisions.tsv chip "<id> <title>" "<finding>" "<tokens>" <result>`. When `append` refuses the row, its message names the route; follow it.
4. Leave the card to the next sweep, and say in the hand-back how many tasks this run offered and that `/chips` cards them.

## Start

A session a card opened, or one the lead started on the owner's "start <id>", runs this before it writes anything, as chips.md's Sweep says.

1. Run `chips brief <id>` and work from what it prints, not from the card's prompt.
2. When the brief's `State:` line says neither Ready nor Started, tell the owner what it says and stop.
3. Log `started` with `writes:` naming any path the brief lacks and `session:` naming this session's id where the runtime's session tool gives one, then run `chips brief <id>` again, because the task could change until that row. When the session tool shows this session above the brief's `Effort:`, say so to the owner in your first reply, because a session cannot lower its own effort.
4. Before writing a path the task does not list, log another `started` row with it. When `append` refuses that row because another started task writes that path outside the checkout, which happens only outside trunk delivery, leave the path alone and tell the owner.
5. When the work is done, land it and log `landed`, then fix the workflow friction you hit as the brief says, then remove the worktree as the last command, as the brief's paragraph on landing and chips.md's Landing say. A review task's session first logs `reviewed` on each task it reviewed.

## Drop

1. When the task is started, log `dismissed stopped`.
2. When the task holds a card this session offered, call the dismiss tool on it. When the tool reports the owner started it, log `started` and tell the owner. Otherwise log `dismissed declined` with its `card:`, in place of `uncarded`, so no merge lands between the two.
3. When another session holds its card, log `dismissed declined` with that `card:`.
4. When it holds no card, log `dismissed declined`.
