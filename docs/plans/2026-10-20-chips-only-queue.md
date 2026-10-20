# Chips own the queue: one sweep and no ledger order

Status: executed
Topic: pstack
Playbook: build

The owner asked for "harsh honest feedback what would you cut/merge to DRY this" about verdict, the review ledger and chips, got eight ranked cuts, and answered "go all. fast". This plan builds all eight in one session on the main lane, with no panel.

## Brief

### What will change?

Only /chips sweeps now, and other runs print one count line. The ledger reports open scopes and the plans they wait on, and chips orders everything. Three cuts came out narrower, and the Close says why.

### What could go wrong?

Eight review items wait on plans still marked active, held or planning until someone settles them. A plan that only another worktree holds no longer blocks its item. A card keeps its old priority in its title.

## Teach

Chips is the project's to-do ledger. Each suggested task waits on what it needs, and a sweep cards the ones that can start. The review ledger feeds it one release item for each open review scope.

Today both sides order the work. The ledger ranks scopes by a payoff score, keeps AI last, and marks a scope busy when any worktree touched a plan for it in the last two weeks. Chips then ranks the same tasks again by priority. Sweeps also run at every wave end and every close, so one rule lives in four places.

After this change the ledger reports only facts: which scopes are open, which open plan names each one and which prerequisites are still open. Chips does all the ordering and waiting, and only /chips sweeps. A wave end or a close prints how many tasks can start.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When sweeps run | Only when you type /chips; a wave end or a close prints a count instead (look) | A sweep at every wave end and close, as you set on 2026-10-19 | sweep at close | big |
| Who orders release work | Chips, by priority like every other task | The ledger's payoff score with AI last | ledger order | big |
| When a review item waits | While a plan in this checkout names its scope and is active, held or planning (look) | While any worktree touched such a plan in the last two weeks | busy window | small |
| Prerequisite scopes | Named in the item while they are open; they no longer set the order | Order the queue by them and refuse loops | order by prerequisites | small |
| A card whose priority changes | Keeps its card and title, because its session prints the current brief first | Withdrawn and offered again with the new title | re-card on priority | small |
| A card whose effort changes | Still withdrawn and offered again, because the card sets the session's effort | Keep the card at its old effort | keep effort cards | detail |
| Hard-cut questions | A design-question chip like any other; an intake writes no scope file | A scope file the ledger offers as release work | hard cuts in ledger | small |
| Unread document matches | Only the scope's history list keeps them | Also a candidate state in the documents list, which nothing used | candidate state | detail |
| The workflow guide | An index of entry points and rule owners | A second copy of the workflow | full guide | small |
| Open work in subject files | Kept, because it holds proof limits with owners and stops, not tasks | Moved into chips | open work to chips | detail |
| The check list in the schema | One summary line, because the playbooks hold the page shape | The full list of every refusal | full check list | detail |
| Review depth | No panel and no trail review, because you said fast | A panel on the helper diff, then one on the docs | full | detail |

## Main changes

- **The review ledger reports facts, and chips orders the work.** `review-ledger.mjs` drops its queue order, the payoff score, the AI-last flag, the dependency loop check, the two-week scan of every worktree's plans and the unused `candidate` document state. `ship` lists open scopes by id. Each item writes the scope's subject file and owners, names each open `dependsOn` scope in its finding, and waits `run:<plan>` on each active, held or planning plan in the checkout that names the scope. `status` and `show` list scopes instead of a queue, and the 71 scope files lose `opportunity` and `last`.
- **Only `/chips` sweeps.** chips.md's Sweep, Waves and Close say so, and a wave end or a close runs `chips --session <id>` and prints one count line. The chips skill's Sweep points at chips.md's Sweep and Cards instead of restating them, and Verdict's deep-path close and Build's close check the record and print that line.
- **Chips orders P1 work like every priority.** dotai `tasks.mjs` reads `waits` from the ship list in place of `busy`, sorts P1 tasks like the rest and stops stamping, storing and comparing a card's priority; `decisions-check.mjs` stops writing `shown:`, and old `shown:` rows still parse. chips.md's two cards paragraphs merge the effort and dependency checks into one.
- **Rules stop repeating.** Verdict's Topics rules shrink to three, and the Chips priority bullet leaves `AGENTS.md`, because chips.md's Priority holds it. A hard cut's question becomes a `decide` chip. schema.md keeps one line for `check`. `docs/development/agent-skills.md` becomes an index of entry points and rule owners.

## Scope

dotai `skills/sync-pstack/assets/pstack/` (`tasks.mjs`, `decisions-check.mjs`, `rules/chips.md`), `skills/chips/SKILL.md` and `skills/sync-pstack/scripts/sync-pstack.test.mjs`. Plate `tooling/scripts/review-ledger.mjs` and its test, `docs/research/review-scopes/*.json`, `docs/research/schema.md`, `.agents/playbooks/verdict.md`, `.agents/playbooks/build.md`, `.agents/playbooks/references/architecture.md`, `AGENTS.md`, `docs/development/enforcement.md`, `docs/development/agent-skills.md`, `docs/plans/topics/correct.md` and this plan's subject file.

## Steps

### Slice 1. The shared chips law in dotai

- [x] `tasks.mjs`, `decisions-check.mjs` and their tests: ship waits, P1 sorted by priority, no priority re-card. Proof: the dotai suite passes.
- [x] chips.md and the chips skill: one sweep trigger, count lines, merged card checks. Proof: corpus diff read line by line.

### Slice 2. The Plate ledger and docs

- [x] `review-ledger.mjs`, its test and the 71 scope files. Proof: the ledger tests pass and `check` adds no error.
- [x] Verdict, Build, the architecture reference, the schema, `AGENTS.md`, enforcement.md and the workflow guide. Proof: a teaching sweep finds no stale claim.

### Slice 3. Delivery

- [x] Push dotai, sync Plate from it, reinstall the chips skill and run `verify`. Proof: sync-pstack `verify` exits 0.
- [x] Land through land.mjs. Proof: the pushed commit on `origin/next`.

## Close

What landed. The shared chips law is dotai [ba47c0f](https://github.com/udecode/dotai/commit/ba47c0f9213d19b9bb4a9b398e68da5c90f728b3). plate-2's sync of it, the review ledger cut, the 71 scope files, the playbooks, the schema, `AGENTS.md`, the enforcement table and the workflow guide land in the commit that carries this Close.

Reversals. Only `/chips` sweeps, which reverses your word of 2026-10-19 that a deep verdict's close and a wave end sweep. A card keeps its title when its priority changes, which reverts the priority half of dotai 4100a08. You took both with "go all".

Deviations. Three cuts came out narrower than the list. The effort re-card stays, because a card sets its session's effort and a session cannot lower its own. Open work in subject files stays, because those sections hold proof limits with owners and stops, not tasks. The schema's check list became one line, but the page shape stays in `verdict.md`, which the page's writer reads. Two fixes came from proof: dotai's runtime identity test failed inside Claude Code because it left `CLAUDECODE` and `CLAUDE_PID` set, and `verdict.md` edited a scope's `members` after its last `check`.

Proof and its limits. dotai `validate-skills` passed on the committed bytes, the review ledger's suite passed, and `check` added no error; the 71 errors it dropped are the deleted opportunity checks. The paired smoke matched the intended text in both runtimes, and every conflict it listed is fixed, offered or dismissed with a reason in the decision log. `sync-pstack verify` passed on this worktree. The corpus ran against the main checkout's old `review-ledger.mjs`, which prints no `waits`, so it showed six hidden items as Ready offers. A replay with this worktree's ledger gives each of them a `run:` wait instead, and the two scripts land together here.

Counts. 7 steps, 7 done. 2 owner asks, the harsh feedback and "go all. fast", both done: no panel, trail review or reflect ran, and no-comments was skipped under fast.

## Open work

- Twelve plans still say active, held or planning, so eight review items wait on them. No chip holds this, because a chip that rewrote their `Status:` lines would write active plans and wait on them. owner: zbeyens. stop: each plan's `Status:` is settled.
- Log the ledger rows once this commit lands, because they cite its hash: landed for t_5acb4bd7, t_80b5a22a and t_92d3762d, superseded for t_ade3c20a. owner: this run. stop: `chips` shows them closed.
- t_32bd6bba asks whether a verdict deep review runs reflect, because Codex says it does and Claude Code says it does not. owner: zbeyens. stop: the owner starts or drops it.
- dotai ba47c0f and this commit shipped fast and are owed a review. owner: zbeyens. stop: "full" or the owner drops the review.
