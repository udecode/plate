---
name: chips
description: "Run the project's suggested-task ledger, the chips. /chips alone brings every open task up to date: it applies what the ledger helper says, settles stale and split tasks, cards what can start and reports the board. Use for /chips, /chips offer, start or drop, \"what chips are open\", \"suggest a task for X\", \"update the chips\", \"clean up the chips\", \"which chips are stale\", and whenever pstack would file a tracked issue, a follow-up, a reflect Backlog item or an out-of-band PR."
argument-hint: '[offer <finding> | start <id> | drop <id>]'
---

# Chips

Chips are a project's suggested tasks, the side work outside a run's target, or a measurement that does not fit a run's one-hour budget, that the owner can start in a new session. They live as rows in one ledger per project, and a card in a suggest tool is only a view of one. The law is `.agents/pstack/rules/chips.md`, which sync-pstack renders into every project. Read it in full before this session's first ledger write. This skill runs its modes; it adds no rule of its own.

Every command below is `node .agents/pstack/decisions-check.mjs <command>`, run from the project's checkout, which a card session that opened in its own worktree names by the path its brief prints. Get this session's id from the runtime's session tool, such as Claude Code desktop's `get_session` with `self`, and pass `--session <id>` to every board read. A runtime with no session tool reads the board without it.

| Mode | Use it to |
| --- | --- |
| [Sweep](#sweep), `/chips` with no argument | bring every open task up to date, card what can start and report the board |
| [Offer](#offer) | add a finding, the one way new work enters the ledger |
| [Start](#start) | begin a task a card opened, in the card's session |
| [Drop](#drop) | record the owner's word to drop a task |

pstack calls these modes too. Where a pstack step files a tracked issue, a follow-up or a reflect Backlog item, or puts an out-of-band fix in its own PR, the lead runs Offer instead. At each hand-back, after each compaction and at the close, it runs a quick sweep, which skips step 3. A question about open chips, such as "what's next" over side work, runs steps 1 and 6 and writes nothing.

## Sweep

1. When the owner typed `/chips`, run `chips lead --session <id>` first, which makes this session the chips lead, as chips.md's Lead says; a quick sweep skips it. Then run `chips --session <id>` and `chips stale`. The stale report lists each open task with its age, the paths it writes that were deleted since its offer or are missing, the commits on its paths since its offer, its closed PR waits and its card, the likeliest stale first.
2. Apply the pass the Do list shows, together with the run's own rows that chips.md's Sweep lists, in one `append --from <file>` batch:
   - Withdrawal pass: call the dismiss tool on each card it names, then log the row the tool's report decides, as each item says. That includes each card this session withdraws because another session leads the chips.
   - Ledger pass: log each row it names.
   - Card pass: leave it to step 5.
   - Check items: look each session up with the session tool. Log `uncarded` with a card item's `card:` when the tool reports its session archived or gone. For a started task whose rows name no session, find it as the item says and log `started` with its `session:`. When the tool reports a started task's session archived, read its last report with the tool, then log `landed` when a commit holds the change or that report says the session delivered it, with `patch:` when it names one. When that report hands back a patch it never applied, land the patch as chips.md's Landing says and log `landed` with `patch:`. Log `dismissed stopped` only when that report hands back no patch and neither this checkout nor the session's own worktree holds an uncommitted edit on the task's paths. Otherwise, or when the tool cannot find the session, the task stays started, and step 6 says why.

   Run `chips --session <id>` again and repeat until the Do list shows only the card pass or nothing you can apply. When `append` refuses a batch, fix or drop the refused row as its message says and append the rest.
3. Judge each task the stale report gives a fact, from its brief, those facts and the code, and append the rows in one batch:
   - When the tree already holds its fix, log `dismissed done`, citing the commit.
   - When its target was deleted since its offer, log `dismissed superseded`. When a path only moved, log `updated` with the new `writes:`.
   - A missing path is one the offer named wrongly or one the task will create. Find the real path with `git ls-files` and log `updated` with it, or leave a path the task creates. A carded task's `updated` only drops paths, so its session names the real one in its `started` row.
   - When a PR it waits on closed without merging, log `updated` with the waits it has now.
   - When two open tasks answer one question, log the topic move and `dismissed dup` that chips.md's Sweep gives. When the keeper holds a card or is started, log `waits: task:<keeper>` on the other instead.
   - For a started task, log `landed` when a commit holds its change. Step 2's check item settles the rest from its session, so never ask the owner whether that session still runs.
   - When the report marks a task possibly thin, find its finding in the plan, log or run its offer names, and log it as a `folded` row. When this session holds the task's card, withdraw it first. When another session holds it, fold the finding once that card leaves the queue. When no source holds the finding, leave the task as it is. Step 6 says which tasks stay thin.
   - For each task that holds a card and whose Ready line says it shares paths with another open task, judge its dependencies as step 5 does, because it may have been carded before anyone judged them. When it needs another task's result, log `updated` with its waits plus `task:<that id>`, which a carded task takes.
   - For each task that holds a card, check its effort against chips.md's Title rule as step 5 does, and log `updated` with the right `effort:` when they differ, which a carded task takes.
4. Repeat step 2 for what step 3 changed.
5. Card pass: before each card, judge whether the task needs the result of another open task, starting with each one its Ready line says shares its paths, or of an open design question its work builds on. When it does, log `updated` with its waits plus `task:<that id>` instead of the card. Also check the effort its brief shows against chips.md's Title rule, and log `updated` with `effort: high` for an `(xhigh)` fix whose finding names its cause and where it lives, or `effort: xhigh` for a bug or slowness whose cause nobody has located. Then offer each card the Do list names with what `chips brief <id>` prints as its prompt, verbatim, and the effort its brief shows, while the suggest tool's last result lists fewer than 20 pending cards, all in the same turn, then log `carded` with `card:` and `session:`. A runtime with no suggest tool lists each Ready task in the plan's `## Open work` instead, as chips.md's Limits says. Before each card, check whether the task's `writes:` touch an active plan, one whose `Status:` starts with a word `status.mjs` counts as active, such as building. That plan's files are the plan itself, its decision log and its subject file `<plans>/topics/<topic>.md`. The topic is its `Topic:` line, or the first entry of the frontmatter list that `pageTopic.field` in `.agents/pstack.json` names. Its session is rewriting those files, and `chips` sees only ledger tasks, so log `updated` with the task's waits plus `run:<that plan>` instead of the card.
6. Report in plain words each row this sweep logged, one line each, then what can start and whether it has a card, with `start <id>` beside each Ready task the 20-card limit left uncarded, what is started, why it stays open and that "drop <id>" closes it, what waits and on what, grouped by the thing waited on, and the fast work owed a review. When a task waits on landed work the owner has not committed, the report suggests that commit before it lists what can start, naming each landed task and how many waiting tasks its commit frees, because the next wave starts only after it. Name each task by id and title. Write each commit it names as a link to that commit on GitHub, `https://github.com/<owner>/<repo>/commit/<sha>`, with the owner and repository read from the checkout's `origin` remote. The report asks the owner nothing. The owner reverses a dismissal by asking, and the lead offers the task again.
7. While any task is started or carded, and where the runtime re-invokes the lead when a background command exits, run `chips wait --session <id>` in the background, as chips.md's Waves says. When it exits naming a started session, look that session up with the session tool. Lower it to its brief's effort when it still runs at its card's effort, which `chips wait` prints, or at yours when the suggest tool took none, as chips.md says. Then run this sweep again.

## Offer

1. Run `chips --session <id>` first, and read the brief of each open task whose topic or title touches the finding with `chips brief <id>`.
2. Pick the row as chips.md's Offer says:
   - When the finding belongs to an offered task's question and that task holds no card, log a `folded` row on it with what the finding adds.
   - When it belongs to the question of a started task or of one that holds a card, offer a new task in that topic with `waits: task:<id>`. `chips` merges it into a carded task once the card is withdrawn.
   - Otherwise offer a new task with an id from `chips id`, a plain imperative title, `(xhigh)` only where chips.md's Title rule gives it, and its `writes:`, `topic:`, `kind:`, `waits:`, `owns:` and `session:`, this session's id, so this session can card it at its close wherever the chips lead is. Its `waits:` include `run:<plan>` for each active plan whose files it writes, as Sweep step 5 finds them. Reuse a topic the board lists when the finding answers its question. A new topic names one owner question, never an area.
3. Append it with `append <plans>/suggested-tasks.decisions.tsv chip "<id> <title>" "<finding>" "<tokens>" <result>`. When `append` refuses the row, its message names the route; follow it.
4. Leave the card to the next sweep.

## Start

A session a card opened, or one the lead started on the owner's "start <id>", runs this before it writes anything, as chips.md's Sweep says.

1. Run `chips brief <id>` and work from what it prints, not from the card's prompt.
2. Run `chips`. When the task is neither Ready nor Started, tell the owner what it waits on and stop.
3. Log `started` with `writes:` naming any path the brief lacks and `session:` naming this session's id where the runtime's session tool gives one, then run `chips brief <id>` again, because the task could change until that row. When the session tool shows this session above the brief's `Effort:`, say so to the owner in your first reply, because a session cannot lower its own effort.
4. Before writing a path the task does not list, log another `started` row with it. When `append` refuses that row because another started task writes that path outside the checkout, leave the path alone and tell the owner.
5. When the work is done, land it as the brief's paragraph on landing and chips.md's Landing say, and log `landed` with `patch:`. A review task's session first logs `reviewed` on each task it reviewed.

## Drop

1. When the task is started, log `dismissed stopped`.
2. When the task holds a card this session offered, call the dismiss tool on it. When the tool reports the owner started it, log `started` and tell the owner. Otherwise log `dismissed declined` with its `card:`, in place of `uncarded`, so no merge lands between the two.
3. When another session holds its card, log `dismissed declined` with that `card:`.
4. When it holds no card, log `dismissed declined`.
