# Plate on pstack

Page: https://claude.ai/artifact/XaMiMyTT4RWb4m9QK3zjhp

plate-2's agent workflow before pstack (git `HEAD` before 2026-09-30) and now. Every plan below is one iteration of this subject.

## Public API

What to type today for each job, one line per command it replaced, in the order Hard cuts and app migration lists them, so a line can repeat and `retired` marks a command with no replacement. Plain words go to the matching playbook through poteto-mode's session hook.

The v2 loop: next item, review, plan and build.

```text
next    (the chips board, read only; writes nothing)
review <scope id>, then again or interrogate
the verdict leads with today's and the proposed call site
plan <goal>
plan <question>    (the Plan playbook reads .agents/playbooks/references/architecture.md)
plan <question>    (the Plan playbook reads .agents/playbooks/references/architecture.md)
go
plan <goal>, then go; a long run uses /loop or /goal
describe the goal
```

Bugs, pull requests and cleanup.

```text
the report, screenshot or recording
diagnose <report>
the report, screenshot or recording
clean up PR <number>, or finish the current tree
clean up PR <number>
clean up <surface>
remove <feature>: Build with the architecture reference's Hard cut
```

Features, plugins, UI, docs and proof.

```text
plan <feature>, then go (plate-plugins feature delivery)
$plate-plugins <plugin>
$plate-ui <component>
$plate-docs <page>
$verify <surface>
$verify testing audit <scope>
```

Research and performance.

```text
$research full <area>
$research maintain <area>
$research <question>
$research audit <repo>
$research audit sync
$research harvest <repo>
$research harvest plan <lane> <report>
$benchmark <scope>, or describe the slowness (Perf issue playbook)
ask about Plite Autoresearch (benchmark's Autoresearch reference)
```

Public queue, releases and sync.

```text
$maintainer <scope>
$maintainer issue-draft <video or text>
$issue-harvester slate <update>
$issue-harvester <repo>
$changeset
$changeset (registry changelog reference)
$release-lanes
$plate-next <package>
audit the architecture of <scope>    (the architecture reference's Audit)
$sync-shadcn parity <surface>
$sync-shadcn
$sync-plate-ui
retired
retired
```

Method skills. pstack's were vendored into `.agents/skills/`; they now come from the pinned pstack plugin, and shared workflow skills install globally from dotai.

```text
pstack:poteto-mode, also loaded by its session hook
pstack:how, pstack:why, pstack:teach, pstack:recall
pstack:interrogate, pstack:arena, pstack:architect, pstack:swarm
pstack:figure-it-out, pstack's Orchestrate playbook
pstack's Autonomous run: /loop in Claude Code, /goal in Codex
retired
pstack:tdd, pstack:no-comments, pstack:blast-radius
pstack:technical-writing, pstack:typescript-best-practices
pstack:show-me-your-work, pstack:reflect, pstack:setup-pstack
pstack:create-verification-skill, pstack:maintain-verification-skill
pstack:principle-* (23 skills, two of them new)
$grill-me (global)
retired
/pstack:interrogate    (Codex seats give the other-model review)
retired
the sync-pstack skill in dotai
pstack:thermo-nuclear-code-quality-review, pstack:unslop, pstack:deslop
```

Unchanged: `best-api`, `benchmark`, `changeset`, `issue-harvester`, `maintainer`, `plate-docs`, `plate-next`, `plate-ui`, `release-lanes`, `sync-plate-ui`, `sync-shadcn`, `shadcn`, `tanstack-virtual`, `vercel-react-best-practices`, `video-transcripts` and `walkthrough`.

Later iterations: the regression corpus, the prototype cut, model-invocable skills, plan pages and panel reviews.

```text
$verify corpus <surface or cases>
"prototype <idea>" in plain words (pstack's Prototype playbook)
typed, or loaded by the playbook that routes to them
node .agents/pstack/plan-page.mjs <plan>    (one page per subject: Topic: <slug>, or the first review_scopes entry in plate-2)
(nothing to type: work in the reviews table gets its panel; any other plan asks Build now / Panel first / Hold)
retired
/pstack:interrogate on one commit in a detached worktree    (high-risk diffs)
interrogate reviewers: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
arena runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
decision-trail reviewer: a codex:gpt-6.1-sol @xhigh seat
node .agents/pstack/cross.mjs --to codex --model gpt-6-astra --effort high --timeout 1800 --prompt-file <file>    (one Codex seat)
retired
```

The drift audit and the cuts that keep plate-2, Ellie and dotai close to pstack.

```text
/sync-pstack audit <project>    (node scripts/audit.mjs lists facts and candidates; /pstack:interrogate judges cut, fold or keep)
the goal in plain words    (pstack's Autonomous run; Codex /goal; three goal sentences in Long runs)
/pstack:interrogate    (Codex seats give the other-model review)
pstack:teach, or an Artifact
/ui-audit, or a plain "improve this for an hour"    (Autonomous run)
"prototype <idea>"    (pstack's Prototype playbook; Ellie's bullets in AGENTS.md)
verify's runtime reference    (now holds the Next MCP tool list)
(retired)
the Plan playbook    (its layer gates move to a reference plan.md loads)
/pstack:interrogate
pstack:typescript-best-practices, plate-ui's own rules
review PR <number>    (plate-2: a review-only panel on someone else's PR, briefed with its body, linked issue and plan)
```

Opt-in panels: three words, the table edit and the architect seats.

```text
panel | arena | full    (panel: /pstack:interrogate on the plan or diff; arena: a bakeoff; full: architect, then a panel on the plan and on the diff)
"from now on <work> runs <architect | panel | arena>"    (sync-pstack edits the reviews table, re-renders AGENTS.md and verifies)
architect runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
```

Verdict intake: any input, and a chip for each open question.

```text
verdict <a doc, draft, issue or idea>    (pushback, an outcome per item, an order, and a chip for each open one)
```

## Hard cuts and app migration

Every command typed before pstack, each on the same line as what replaces it today.

The v2 loop: next item, review, plan and build.

```text before
$verdict            pick the next item
$verdict <scope>    judge an API
$wait-what                  before/after snippets
$task plan <goal>
$plate-plan <question>
$plite-plan <question>
$task execute <plan>
$task full <goal>
$task <goal>
```

```text after
next    (the chips board, read only; writes nothing)
review <scope id>, then again or interrogate
the verdict leads with today's and the proposed call site
plan <goal>
$plate-architecture [quick | deep | audit] <question>
$plate-architecture [quick | deep | audit] <question>
go
plan <goal>, then go; a long run uses /loop or /goal
describe the goal
```

Bugs, pull requests and cleanup.

```text before
$patch <report>
$patch diagnose <report>
$diagnosing-bugs <report>
$autoclosure <PR or current tree>
$resolve-pr-feedback <PR>
$architecture-cleanup <surface>
$hard-cut <feature>
```

```text after
the report, screenshot or recording
diagnose <report>
the report, screenshot or recording
clean up PR <number>, or finish the current tree
clean up PR <number>
clean up <surface>
remove <feature>: Build with plate-architecture's Hard cut
```

Features, plugins, UI, docs and proof.

```text before
$plate-feature <feature>
$plate-plugin-creator <plugin>
$plate-ui <component>
$plate-docs <page>
$verify-plate <surface>
$testing audit <scope>
```

```text after
plan <feature>, then go (plate-plugins feature delivery)
$plate-plugins <plugin>
$plate-ui <component>
$plate-docs <page>
$verify <surface>
$verify testing audit <scope>
```

Research and performance.

```text before
$research-wiki full <area>
$research-wiki maintain <area>
$plite-research <question>
$editor-audit <repo>
$editor-audit sync
$editor-test-harvester <repo>
$editor-test-harvester plan <lane> <report>
$benchmark <scope>
$slate-ar
```

```text after
$research full <area>
$research maintain <area>
$research <question>
$research audit <repo>
$research audit sync
$research harvest <repo>
$research harvest plan <lane> <report>
$benchmark <scope>, or describe the slowness (Perf issue playbook)
ask about Plite Autoresearch (benchmark's Autoresearch reference)
```

Public queue, releases and sync.

```text before
$maintainer <scope>
$github-issue-reporter <video or text>
$clawsweeper <update>
$issue-harvester <repo>
$changeset
$registry-changelog
$release-lanes
$plate-next <package>
$plate-review <package>
$shadcn-parity <surface>
$sync-shadcn
$sync-plate-ui
$sync-vision
$slate-migration
```

```text after
$maintainer <scope>
$maintainer issue-draft <video or text>
$issue-harvester slate <update>
$issue-harvester <repo>
$changeset
$changeset (registry changelog reference)
$release-lanes
$plate-next <package>
$plate-architecture audit <scope>
$sync-shadcn parity <surface>
$sync-shadcn
$sync-plate-ui
$sync-vision
retired
```

Method skills. pstack's were vendored into `.agents/skills/`; they now come from the pinned pstack plugin, and shared workflow skills install globally from dotai.

```text before
$poteto-mode
$how, $why, $teach, $recall
$interrogate, $arena, $architect, $swarm
$figure-it-out, $orchestrator
$autogoal
$improve
$tdd, $no-comments, $blast-radius
$technical-writing, $typescript-best-practices
$show-me-your-work, $reflect, $setup-pstack
$create-verification-skill, $maintain-verification-skill
$principle-* (21 skills)
$grill-me
$grill-with-docs
$gpt-pro
$agent-native-reviewer
$maintain-workflow
(none)
```

```text after
pstack:poteto-mode, also loaded by its session hook
pstack:how, pstack:why, pstack:teach, pstack:recall
pstack:interrogate, pstack:arena, pstack:architect, pstack:swarm
pstack:figure-it-out, pstack's Orchestrate playbook
pstack's Autonomous run: /loop in Claude Code, /goal in Codex
retired
pstack:tdd, pstack:no-comments, pstack:blast-radius
pstack:technical-writing, pstack:typescript-best-practices
pstack:show-me-your-work, pstack:reflect, pstack:setup-pstack
pstack:create-verification-skill, pstack:maintain-verification-skill
pstack:principle-* (23 skills, two of them new)
$grill-me (global)
retired
$gpt-pro (global)
$agent-native-reviewer (global)
the sync-pstack skill in dotai
pstack:thermo-nuclear-code-quality-review, pstack:unslop, pstack:deslop
```

Unchanged: `best-api`, `benchmark`, `changeset`, `issue-harvester`, `maintainer`, `plate-docs`, `plate-next`, `plate-ui`, `release-lanes`, `sync-plate-ui`, `sync-shadcn`, `sync-vision`, `autoreview`, `optimise-github-actions`, `shadcn`, `tanstack-virtual`, `typescript-advanced-types`, `vercel-composition-patterns`, `vercel-react-best-practices`, `video-transcripts` and `walkthrough`.

Later iterations: the regression corpus, the prototype cut, model-invocable skills, plan pages and panel reviews.

```text before
$patch corpus <surface or cases>
$prototype <idea>
maintainer, sync-vision, issue-harvester: only when typed
(no plan pages)
$cross-review <plan>    (every plan and execution, from either runtime)
(no hand-off for a verdict)
$autoreview    (high-risk diffs)
$interrogate    (vendored)
$arena    (vendored)
$show-me-your-work    (same-family trail review)
(no Codex seat)
$cross-review <plan>
```

```text after
$verify corpus <surface or cases>
"prototype <idea>" in plain words (pstack's Prototype playbook)
typed, or loaded by the playbook that routes to them
node .agents/pstack/plan-page.mjs <plan>    (one page per subject: Topic: <slug>, or the first review_scopes entry in plate-2)
(nothing to type: work in the reviews table gets its panel; any other plan asks Build now / Panel first / Hold)
retired
/pstack:interrogate on one commit in a detached worktree    (high-risk diffs)
interrogate reviewers: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
arena runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
decision-trail reviewer: a codex:gpt-6.1-sol @xhigh seat
node .agents/pstack/cross.mjs --to codex --model gpt-6-astra --effort high --timeout 1800 --prompt-file <file>    (one Codex seat)
retired
```

Opt-in panels: three words, the table edit and the architect seats.

```text before
(no opt-in words: big work always ran a panel)
(edit the block's big-work list by hand)
architect runners: opus, opus, opus
```

```text after
panel | arena | full    (panel: /pstack:interrogate on the plan or diff; arena: a bakeoff; full: architect, then a panel on the plan and on the diff)
"from now on <work> runs <architect | panel | arena>"    (sync-pstack edits the reviews table, re-renders AGENTS.md and verifies)
architect runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
```

Verdict intake: any input, and a chip for each open question.

```text before
(no intake: a review took one ledger scope)
```

```text after
verdict <a doc, draft, issue or idea>    (pushback, an outcome per item, an order, and a chip for each open one)
```

## Main changes

- **pstack runs the method.** poteto-mode, its playbooks and the pstack block in `AGENTS.md` own lifecycle, tests, review, plans and delivery; Plate skills keep only Plate knowledge. Claude Code runs Opus and Codex runs gpt-6.1-sol, and pstack's own panels bring in the other family.
- **Plate's lifecycle is project playbooks on pstack's.** Plan, Build, Bug fix, Refactoring, Perf issue, Babysit and API review extend pstack playbooks with anchored changes; a pstack upgrade that rewords an anchored step fails loudly, and a step that contradicts the block is replaced, not added to.
- **Fewer skills, each with one owner.** `research` absorbed editor audits and test harvests, `maintainer` issue drafting, `plate-plugins` feature delivery, the Plan playbook's architecture reference the hard cut, the registry law and Plate Review's audit; failed-fix recovery lives only in the Bug fix playbook.
- **Law lives in Vision once.** `VISION.md`, `docs/vision/**` and `docs/editor-behavior/**` hold every durable Plate and Plite rule, and a skill links to its rule instead of restating it. Before a rule left a skill, an obligation inventory quoted its new home, and a coverage check found an inventory row for every removed line. The doctrine fingerprint rows and the P1 autoreview gate are gone; the block's Review rule replaces them.
- **best-api is the Plate API lens, and verdict its entry.** best-api's `design`, `review`, `audit` and `repair` modes keep their jobs in about 100 lines. `review` ranks findings on the architecture reference's one P0 to P3 scale, and `repair` first checks the correction against live source and Vision, then edits the one Vision owner and every example, recipe, check and doc that still teaches the rejected shape. verdict is a 22-line entry into the Verdict playbook, which owns ledger intake, the history reconcile and the record.
- **plate-next has no registry.** `plate-next <package>` is a read-only Refactoring audit with the Plate v2 lens over a manifest of every file `git ls-files` lists. `plate-next sync [package]` repairs each package's findings, records one `verification` execution per plan, and finishes when the plan has no unchecked or deferred row. A doctrine change no longer marks a package stale.
- **One of each.** One whole-scope review (the Refactoring playbook with the architecture reference's Audit), one P0 to P3 scale, one doctrine repair path, one gitcrawl home in issue-harvester and one public evidence packet in maintainer. `test-audit` prunes existing tests, and `verify testing audit` looks for important behavior with no test.
- **Checks enforce what skill text used to say.** `check-package-kit-exports.mjs` fails a package that exports a `*Kit` array, `check-plate-feature.mjs` keeps only the feature surface inventory, the benchmark and regression validators take `plite` and `plate` layer labels, and `check-package-declaration-brands.mjs` rejects `InternalBaseEditorWithInstalledPlugins` in public declarations outside one known `platejs/math` leak. The rule and playbook files went from 19,445 lines to 10,533 on 2026-10-05.
- **Gates block in code.** `plan-open.mjs` fails a Done plan on an unresolved gate row or an open box in a numbered step; `validate-benchmark-plan.mjs --complete` refuses missing or pending verification evidence.
- **pstack's panels get their model diversity back.** `interrogate`, `arena` and `architect` seat Opus, gpt-6-astra at high and gpt-6.1-sol at xhigh instead of three Opus runs, so the adversarial signal comes from different models, as pstack designs it.
- **A Codex seat runs through `cross.mjs`, read-only.** `node .agents/pstack/cross.mjs --to codex --model <model> --effort <effort>` runs `codex exec --sandbox read-only` with hooks off on the filled prompt file, in both runtimes, and exits non-zero when the seat gives no answer, so the seat shows as missing.
- **Panels run where a list says so.** Each project's `reviews` table in `.agents/pstack.json` names the work that gets a panel, `architect` or an arena without asking, and the Panel rule renders it. plate-2 lists an API or architecture plan (`architect`, then one panel on the finished plan), a PR's diff and someone else's PR; Ellie lists high-risk code and a PR's diff. Every pstack step that already calls for one, such as a contested design, runs it too, and the owner's "panel", "arena" or "full" runs one anywhere else. A round with an applied critical finding earns one more, two at most; at the cap the lead records its pick as a default and keeps going. The decision-trail review runs for unattended runs, panel-reviewed work and new or changed shared scripts or checks.
- **cross-review and autoreview are gone.** High-risk code gets the panel on one commit in a detached worktree. Someone else's PR gets a review-only panel; its findings go in the reply, and the run keeps no plan, page or decision log. `sync-pstack verify` flags a project playbook that names a panel tool without citing a reviews row, a citation of a missing row and a retired `bigWork`, `risk` or `reviewPr` field.
- **A row runs only the tool and stage it names.** An Ellie access change listed for a diff panel runs neither `architect` nor a plan panel. Ellie's `high-risk` row covers code that changes who can read PHI or that writes, exports or sends it, plus auth, the database or migrations, customer sends and shared product code. A review-only panel has no rounds, logs no rows and answers in the reply. The Panel rule carries an overrides note for each pstack step it suppresses.
- **sync-pstack carries the opt-in panels lessons.** Reviews mode lists each pstack step that calls a tool by default as a Defaults row, and smokes an uncovered request from the project's most common work. Lesson runs the whole smoke set on the final block before the trail review, follows the gate in force, searches a concept's stem before the first smoke, fixes a synced commit with a new commit, and updates each out-of-repo guide a project's `AGENTS.md` lists. Smokes sort the conflicts they report, and a denied read is inconclusive.
- **A lighter review loop.** A Pursue verdict goes straight into the plan with no panel of its own, and project playbooks rank with plate-2's rules outside the pstack block.
- **pstack 0.9.64 owns project playbooks and PR sections.** poteto-mode's Project playbooks paragraph and `check-playbooks.mjs` apply each project playbook, and the block keeps only each project's playbook list. A PR body links its plan first, then follows Opening a PR, with `## What changed` for symbols and paths and `## Scope` for what the PR covers and leaves out.
- **A bump audits the project skills.** When `CHANGES.md` adds or changes a skill or principle, sync-pstack's Sync mode runs its Audit on each synced project at the new pin, and the Audit runs a panel only when the Panel review rule allows it or the owner says "panel". user-pin refreshes Claude Code with a marketplace add from the pinned entry.
- **A repeated mistake goes to `correct`.** The block sends a code, shell or tool mistake the user corrects a second time to `/pstack:correct`, whose commits follow Delivery; a shell mistake gets a helper first, then a hook, then text. `reflect` keeps workflow lessons, and the lead applies every Accepted lesson without waiting.
- **Agents stop only for irreversible or outside actions.** The lead takes the pick of every call, records it as a default with the word that reverses it, and stops only for a production deploy or release, a push to `main`, a force-push to a shared branch and deleting data the run did not create. Who can read a message decides whether it waits. A message outsiders can read, a comment, review, label or close on a public repository included, waits as a draft the owner sends while the run continues, and a team-only message goes out. plate-2 keeps `delivery: user` and the owner's word on public `udecode/plate` issue and PR actions; Ellie pauses on any Claude in Chrome error. An accepted reflect lesson applies without approval, and a batch that changes a gate gets one panel first. `01b4e5309c:.agents/pstack/freeze.mjs`, which `dc06078008` cut, freezes a review tree as a commit no ref points to, and a user-scope PreToolUse hook denies an `rm` whose target can expand.
- **Performance numbers go through `benchmark-checklist`.** plate-2's `benchmark` skill and Perf issue playbook and Ellie's performance rule hand every number to it. It asks for five alternating runs per side unless the owner asked for a ballpark, and each packet records the limiter, error count and work count.
- **The page shows the review.** Each `seats` row in the decision log opens a panel round; the header tags the round count and the latest seats, and a review history at the bottom lists each round's findings by severity with what was applied and dismissed. `decisions-check.mjs` refuses a panel finding without a severity, before a `seats` row or without an applied or dismissed reason.
- **One page per subject, shared with Ellie.** `plan-page.mjs` is a sync-pstack helper; a plan joins its subject through `Topic:` or, in plate-2, its first review scope, and architecture plans add the editor comparison, document shape, layer and owner, hard cuts and native proof sections.
- **A subject page shows the open plan's delta, then the result.** A plan carries its delta, `Delta`-marked rows and before and after pairs, under the subject's section titles; the subject file keeps the current state. The newest open iteration leads the page, and once every iteration is executed or Done the page shows the current state alone with the iterations as history. The renderer refuses a subject file with a pair in a paired section and a just-finished plan whose rows or calls the subject file does not show.
- **One status vocabulary, and no silent rollback.** `.agents/pstack/status.mjs` reads the first word of a `Status:` line for the page mode, the pill and plan-open's `--done` sweep, which checks every landed word. A sync from committed shared source refuses to overwrite a project last synced from uncommitted shared edits.
- **Drift from pstack is audited, and the copies are cut.** `node skills/sync-pstack/scripts/audit.mjs <project>` in dotai lists each skill's typed uses, routes and stale copies, and the sentences that repeat pstack or the block; sync-pstack's Audit mode hands the report to an interrogate panel. Typed counts include only what a person wrote. Every block rule carries an overrides note or an adds marker, and `verify` flags one with neither.
- **What pstack covers is gone.** dotai cut autogoal and gpt-pro; Ellie cut improve, its prototype rule, next-dev-loop, two process docs and nine vendor skills; plate-2 retired sync-vision, folded plate-architecture into `.agents/playbooks/references/architecture.md`, dropped maintainer's heartbeat and the feature pack's process copies, and uninstalled four vendor skills.
- **Reviews have no round cap.** The block follows pstack, which limits no rounds: a round reruns after an applied critical fix and stops when no critical finding remains or each is dismissed. A design changed for a reason other than a review's findings is reviewed again before its first behavior edit, so nothing waits for an "another round" word.
- **Agents load only what every task needs.** `AGENTS.md` is 32 KB, down from 111 KB. Code rules live in `CODING_STANDARDS.md`, which the Code pointer sends agents to before they plan or make a code change. The shared block keeps the rules every task needs plus one pointer per process, and `sync-pstack` renders eight rule files into `.agents/pstack/rules/` from its `RULE_FILES` table. A `pushBranches` setting replaces Plate's prose push grants, and `pnpm lint:task` lints a task's own files with the flags `pnpm check` uses.
- **Suggested tasks live in a ledger, and a card is only a view.** The ledger is the project's tracker. Where pstack would file a tracked issue, a follow-up, a reflect Backlog item or an out-of-band PR, the lead offers a suggested task. `.agents/pstack/tasks.mjs` reads `suggested-tasks.decisions.tsv` into tasks that keep one id for good, and `decisions-check.mjs chips` prints them as Ready, Started, Waiting, Unmigrated and Lost with a Do list. Each task names a topic and typed waits, `pr:`, `task:` and `run:`, that clear with no new row. Only a ready task gets a card, which names the session that offered it, and a card leaving the queue leaves its task open. A topic holds one open design question that waits on no task of its topic. A finding on the question of an offered task with no card folds into it, and `dismissed dup` moves a duplicate's work into the task it keeps. A task with a card takes no new work. A finding on its question waits on it with `task:`, and `chips` merges it once the card is withdrawn, so dismissing a card closes only what it showed. The Do list shows withdrawals, then ledger rows, then cards. A row that blames the base branch names a check an open task owns. A title is a plain imperative or ends in `(xhigh)`, and a card passes that effort, capped by the project's highest role effort. The `chips` skill runs the ledger. Plain `/chips` applies the Do list, settles stale and split tasks from `chips stale`, cards what can start and reports what changed, and `offer`, `start` and `drop` act on one task. `chips stale` tells a path deleted since the offer from one the offer never had. Only `/chips` sweeps; a wave end or a run's last hand-back prints one count line from `chips --session <id>` instead.
- **On another person's PR, the lead comments instead of rewriting.** After it pushes to another person's PR branch, the lead leaves their description alone and keeps one comment about its own commits current, rendered with `plan-page --comment`. The Messages rule lets that comment through without a separate go, and a runtime that refuses the post, such as Codex, leaves it as a draft under Needs you.
- **A chips sweep settles a started task from its session and asks nothing.** A `started` row names its session in `session:` where the runtime's session tool gives one, and `chips --session` adds a check item for each started task another session runs. Once the session tool reports that session archived, the sweep logs `landed` when a commit holds the change or the session reported delivering it, and `dismissed stopped` only when it left no patch and no uncommitted edit on the task's paths in this checkout or its own worktree. Otherwise, and in a runtime with no session tool, the task stays started and the report names the owner's "drop <id>", which Drop logs as `dismissed stopped`.
- **Suggested tasks run in waves by dependency.** A task waits only on a merged PR, a finished plan or another task's result. A shared project path no longer holds it back, because each card session works in its own worktree. Only a path outside the checkout still queues one task behind another. Before each card, and for each carded task in a full sweep, the lead judges whether the task needs the result of a task that shares its paths. A card session lands its own work with a plain `git apply` onto the checkout and logs `landed` with `patch:`, and a `task:` wait on that patch clears once the checkout commits its paths. The next `/chips` cards the next wave, and no background wait wakes the lead on each landing. A fix marked `fast: yes` skips its own review panels, and the ledger keeps its landed work owed a review until a `kind: review` task logs `reviewed` on it.
- **Suggested tasks run at the effort they need.** A task gets xhigh only as a design question or as a bug or slowness whose cause nobody has located, so a fix whose finding names its cause runs at high. `chips` reads a task's effort from its last `effort:` token, then its title and covered titles, and a design question is always xhigh. An `updated` row with `effort: high` lowers an over-tagged task, even one that holds a card, and the brief and board then drop a stored ` (xhigh)`; a fold or a dup only raises it. The lead checks effort at each card pass and in each full sweep. A task records its effort when its card lands. When an `updated` row changes it, `chips` lists that card in its holder's withdrawal pass, and the card pass offers it again at the new level; a card session the owner already started keeps its effort. A card session above its brief tells the owner, because no session lowers its own effort.
- **One session leads the chips, and a commit clears a landed wait.** Typing `/chips` runs `chips lead --session <id>`, which writes a lead row to the ledger. Only the lead cards tasks other sessions offered. Any other session cards only the tasks whose offer row names it in `session:`, and its sweep lists its other cards for withdrawal; `append` refuses its card on another session's task. Before any session leads, every session cards. A `task:` wait on a landed patch clears once each patched path is clean or a commit after the landed row touched it, so a later task's edit to the same file no longer holds it after the owner commits.
- **Card sessions hand Codex the coding, and Claude judges.** A Claude session that has found a fix's cause or settled a design hands Codex the code and its regression tests at xhigh through `01b4e5309c:.agents/pstack/codex-build.md`, which `dc06078008` cut, then reviews the diff, checks each test fails without the change and rewrites weak tests. UI design and screenshot judgment stay with Claude. `cross.mjs --bypass` takes up to six hours. `/chips codex`, or `"chips": { "codex": "always" }` in `.agents/pstack.json`, forces the handoff on every card, and ellie sets it. A new chip finding must cite evidence the checkout holds, and a card session reports its workflow friction for the chips lead to fix. The plan is `docs/plans/2026-10-16-chips-codex.md`.
- **A panel cannot wave off an old bug in what the ask names.** A critical finding is fixed, or the run pivots to it, whatever its age, unless the seat's own case fails the same way on the run's base without this run making it worse, it breaks no outcome or property the typed ask states, card or brief text included, and it shows no requirement of the run's design unmet. Only such a finding stays `open` with `patch: none`, an owner, a stop and the lines it limits, and each of those lines states the limit. Seat briefs list the ask's outcomes in its own words. A finding raised again rates its Defaults row `answer`, only a finding that meets all three conditions keeps the `open` pick, and decision-trail criticals follow the same rule. dotai `b9c1ed1`, `7ab75fc` and `0d84845` hold it, and the plan is `docs/plans/2026-10-17-panel-scope-dismissal.md`.
- **Codex workers and Time budget leave the block.** Their text moves verbatim into `01b4e5309c:.agents/pstack/rules/codex.md` and `.agents/pstack/rules/time.md`, and the block keeps a short bullet for each that names when to read the file.
- **Suggested tasks carry a priority, and release work is P1.** Each task is P0, broken now, to P3, workflow, and `append` refuses a P0 claim without an owned check, `regressed:` or `repro:`, and a P1 claim without `repro:` or `ship:`. A task that owns a check failing on the base branch is P0 whatever its token says. `chips` lists P0 and P1 in full, counts the rest unless `chips all`, and cards at most 10 minus the cards the session holds, highest first. `chips.ship` in `.agents/pstack.json` names a command that lists the open path-to-ship items; plate-2 points it at `review-ledger.mjs ship`, and `chips` offers each open review item no task serves as a P1 task with the item's waits, and orders P1 tasks like every other priority. The plan is `docs/plans/2026-10-19-chips-priority.md`.
- **Card sessions skip the chips law.** `chips brief` prints the ledger row command with the task's stored decision shell-quoted, plus the started-row rules, so a card session reads neither `.agents/pstack/rules/chips.md` nor the chips skill unless it offers or drops another task.
- **The rules table leaves CODING_STANDARDS.md.** `docs/development/enforcement.md` holds the table that `/pstack:correct` keeps, and CODING_STANDARDS.md keeps its gates and a pointer that names when to read the table. `AGENTS.md`, `VISION.md` and `docs/development/agent-skills.md` cite the new file.
- **The block has a byte budget.** dotai's `scripts/validate-skills` refuses `assets/block.md` over 39,500 bytes and says to move a rule's detail into a rule file.
- **Landed commits name their session.** `land.mjs` ends each commit with `Session:` and, when the task changes one dated plan, `Plan:`. `review.mjs` lists unreviewed commits grouped by session, `--done <session>` marks one session reviewed, and a run that landed a commit closes with a 👀 title.
- **Tools block two trunk mistakes.** `guard.mjs` denies the desktop app's `sync_with_base_branch`, which refuses `next` whenever it changes `.claude` files, and names the rebase. `sync-pstack apply` and `sync` refuse to write a trunk project's main checkout when its clone sets `pstack.delivery`.
- **Verdict takes any input, and chips hold the questions.** `verdict` on a doc, draft, issue or idea writes one intake page that closes at once, with pushback, an outcome per item and an order, and offers a chip for each open item. A Stop, Pursue or Defer review of one scope takes its exact id. A new design question, a hard cut's included, becomes a `decide` chip in topic `review-<scope>`, and the review ledger keeps answers. "next" reads the chips board and writes nothing. `review-ledger.mjs next`, verdict's session handoff and the ledger triage audit are gone. The plan is `docs/plans/2026-10-19-verdict-intake.md`.
- **The review ledger reports facts, and chips orders the work.** `review-ledger.mjs ship` lists open scopes by id, names each open prerequisite in the item's finding, and gives each item a `run:` wait on every active, held or planning plan in the checkout that names its scope. The queue order, the payoff score, the AI-last flag, the two-week scan of every worktree and the `candidate` document state are gone. A card keeps its title when its task's priority changes, and `docs/development/agent-skills.md` indexes entry points and rule owners instead of restating them. The plan is `docs/plans/2026-10-20-chips-only-queue.md`.

## Open work

- The per-session trail change shipped fast and is owed a review. owner: zbeyens. stop: "full" or the owner drops the review.
- A worktree force-removed despite the cleanup scan's ask, and an archived session the owner still needed, each happened once. A second time gets a check through `/pstack:correct`. owner: the lead. stop: the second time either happens.
- ellie and plate pick up dotai `fadcba8` at their next sync. owner: zbeyens. stop: each project's next sync.

- plate-2's agent-context changes wait on your commit: `AGENTS.md`, `CODING_STANDARDS.md`, `VISION.md`, `docs/development/agent-skills.md`, `docs/development/enforcement.md`, `.agents/pstack.json`, `.agents/pstack/` helpers and rules, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, `docs/plans/2026-10-17-agent-context.md` and its log, and this subject's fold. owner: zbeyens. stop: the owner commits them.
- plate syncs the agent-context change at its own next sync, which also opens its PR. owner: zbeyens. stop: plate's next sync.
- The agent-context change shipped fast and is owed a review. owner: zbeyens. stop: "full" or the owner drops the review.

- plate-2's panel scope sync waits on your commit: `.agents/pstack.json`, `.agents/pstack/decisions-check.mjs`, `.agents/pstack/plan-page.mjs`, `01b4e5309c:.agents/pstack/rules/close.md`, `.agents/pstack/rules/pages.md`, `.agents/pstack/rules/panel.md`, `docs/plans/2026-10-17-panel-scope-dismissal.md` and its log, this subject's fold and the ledger rows. owner: zbeyens. stop: the owner commits them.
- plate syncs the panel scope change at its own next sync, which also opens its PR. owner: zbeyens. stop: plate's next sync.
- `t_cba6027b` decides whether a pivot that stops before its build states its limit, `t_7b084db3` whether fixes made after a panel cap get a panel round, `t_0647e245` adds a helper check that refuses a deferred decision-trail critical, and `t_9682d488` splits the Panel review rule into short labeled bullets. owner: zbeyens. stop: the owner starts or drops each. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- plate-2's chips-lead sync waits on your commit: `.agents/pstack.json`, `.agents/pstack/decisions-check.mjs`, `.agents/pstack/tasks.mjs`, `.agents/pstack/rules/chips.md`, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, `docs/plans/2026-10-16-chips-lead.md` and its log, and the ledger rows. owner: zbeyens. stop: the owner commits them.
- plate-2's Codex handoff sync, its package runner fix and three landed plitejs patches wait on your commit, as `docs/plans/2026-10-16-chips-codex.md`'s Open work lists. owner: zbeyens. stop: the owner commits them.
- The Codex handoff shipped fast and is owed a review until the owner says "full". owner: zbeyens. stop: "full" or the owner drops the review.
- The chips-lead change in dotai `0966734` and `72da833` shipped fast and is owed a review. owner: zbeyens. stop: "full" or the owner drops the review.

- plate-2's chip effort sync waits on your commit: `.agents/pstack.json`, `.agents/pstack/decisions-check.mjs`, `.agents/pstack/tasks.mjs`, `.agents/pstack/rules/chips.md`, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, `CODING_STANDARDS.md`, `docs/development/agent-skills.md`, `docs/plans/2026-10-15-chip-effort.md` and its log, and the ledger rows. owner: zbeyens. stop: the owner commits them.
- `t_074200fe` keeps `decisions-check` output whole when piped, in the helper and in `corpus`. owner: zbeyens. stop: the owner starts or drops it. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- plate-2's chips no-questions sync waits on the owner's commit: `.agents/pstack.json`, `.agents/pstack/rules/chips.md`, `.agents/pstack/tasks.mjs`, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, `docs/plans/2026-10-15-chips-no-questions.md` and its log, and the ledger rows. owner: zbeyens. stop: the owner commits them.
- The chips no-questions run offered `t_d6687840` (the sweep's check items and landed evidence), `t_07a09b83` (Lesson-mode gates) and `t_20f7cd58` (the ten managed checkouts that lag the shared source). owner: zbeyens. stop: the owner starts or drops each. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- plate-2's chip-waves sync waits on your commit: `AGENTS.md`, `.agents/pstack.json`, `.agents/pstack/decisions-check.mjs`, `.agents/pstack/status.mjs`, `.agents/pstack/tasks.mjs`, `.agents/pstack/rules/chips.md`, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, `CODING_STANDARDS.md`, `docs/plans/2026-10-15-chip-waves.md` and its log, and the ledger rows. A task that waits on a landed patch gets its card only after that commit. owner: zbeyens. stop: the owner commits them.
- The first real wave: a card session lands its patch through the brief's footer, and the next sweep cards the next wave. owner: the lead of the next chips sweep. stop: the first card session that logs `landed` with `patch:`.
- The block's Git rule pushes a repair to another person's PR with `git push origin HEAD:<head branch>`, which misses a head branch on a fork; suggested task `task_295ff37f` fixes it. owner: zbeyens. stop: the owner starts or drops the task.
- Reflect backlog from the PR comment delivery run, listed in `docs/plans/2026-10-14-pr-comment-delivery.md`'s Reflect section: `plan-page --pr` refusing another author's PR, `status` and `verify` printing stale installed dotai skills, the retired-policy search on a skill change, and a `started` row the ledger refuses while another lead's `Now` task shares a path. owner: zbeyens. stop: the owner takes or drops each.

- plate-2's changes from the opt-in panels iteration wait for the owner's commit: `.agents/pstack.json`, `AGENTS.md`, the Plan, Build, Perf issue, API review and Babysit playbooks, `docs/development/agent-skills.md` and the benchmark and feature templates, plus the panel lessons iteration's out-of-repo guide line in `AGENTS.md`, the plan-page copy and `skills-lock.json`. owner: Ziad, tracked here.
- The close order runs `lint:fix` after a diff panel, but the Review rule cherry-picks the reviewed commit unchanged, so a formatter edit ships bytes no seat saw. owner: Ziad, tracked here.
- Plans and trails keeps a plan only for work that spans sessions or goes into a PR, while Plan pages has every subject-less stop write a one-off plan; neither says whether that plan is committed. owner: Ziad, tracked here.
- The user CLAUDE.md puts the whole checkout in a PR, while each project's `AGENTS.md` stages only the task's paths. owner: Ziad, tracked here.
- `sync-pstack verify` checks `(reviews: <id>)` citations only in playbooks, so a citation in a rule goes unchecked. owner: Ziad, tracked here.
- Codex in plate-2 reports a "Maintain Workflow" requirement that names a retired workflow. owner: Ziad, tracked here.
- Reflect backlog from the opt-in panels run: a dotai pre-commit or CI check that runs `node scripts/build-workflow.mjs --check`, because two block commits shipped with a stale `workflow-manifest.json`; `sync-pstack verify` scanning mentions of `dropped` names in playbooks, docs and both models sheets; `cross.mjs` passing `--add-dir` for the pinned pstack plugin so Claude smokes and Codex's Opus seat can read pstack's playbooks. owner: Ziad, tracked here.
- The shared block's precedence order never ranks project playbooks; plate-2 ranks them in its own `AGENTS.md`, and the block should say it for every project. owner: Ziad, tracked here.
- Audit pstack's benchmark-checklist against Ellie's performance rule; plate-2's `benchmark` skill was checked against it on 2026-10-05. owner: Ziad, tracked here.
- `tooling/scripts/review-ledger.mjs` stays one module of about 2,300 lines after the 2026-10-04 ledger redesign; its diff panel proposed splitting store, derivation, views, writing and `check` into `tooling/scripts/review-ledger/` and moving `searchResearch` into its own module. owner: Ziad, tracked here.
- The Plate v2 workflow guide artifact was not checked after the 2026-10-04 ledger redesign; it may still name `reviews.md`, the feature hubs or `review-index.json`. owner: Ziad, tracked here.
- plate-2's `.agents/pstack.json` records `synced.source: null`, so its last sync ran from uncommitted dotai edits; blast radius on 2026-10-04 reported that the next sync would install dotai's committed `plan-page.mjs`, which lacks `--index`. owner: Ziad, tracked here.
- skiller regenerates a skill's `SKILL.md` from its rule but leaves its `references/` copy stale, so plate-2's benchmark `methodology.md` was copied by hand on 2026-10-04; find skiller's refresh path or add a check. owner: Ziad, tracked here.
- `audit.mjs` misses routes written in backticks, so it listed none for plate-2's `changeset`, `research`, `tanstack-virtual` and `walkthrough`. owner: Ziad, tracked here.
- Ellie's `design` repeats the Delivery rule in `design-lane.md`, and `align-with-v3.md` keeps its own plan file and waits for the user instead of using Defaults. owner: Ziad, tracked here.
- Ellie's `ui-audit` should send "blast radius" to `pstack:blast-radius`, and its "independent review of each diff" names no reviewer or reviews row. owner: Ziad, tracked here.
- Ellie's `test-audit` keeps source-inspection tests that the Tests rule forbids. plate-2 settled its split on 2026-10-05. owner: Ziad, tracked here.
- Whether `next-cache-components-optimizer`'s before and after frames count as the measured owner Ellie's performance rule asks for before a cache. owner: Ziad, tracked here.
- The Perf issue playbook's PR steps carry no override note in the block, though Delivery covers them. owner: Ziad, tracked here.
- Install drift: `video-transcripts` calls a project path Ellie lacks, `threejs-image-generator` is not linked into `~/.claude/skills`, `~/.claude/skills/reui` is a copy rather than a link, `docuseal` exists only for Claude Code, and the Sentry router skills link a missing `SKILL_TREE.md`. owner: Ziad, tracked here.
- Smokes on 2026-10-04 flagged three older conflicts: sync-pstack's Sync step 4 says to switch an off-branch checkout, which Ellie forbids; Codex looks for a missing "Maintain Workflow" skill; and plate-2's benchmark template headings clash with the plan-page shape. owner: Ziad, tracked here.
- `~/.codex/AGENTS.md:52` names a Maintain Workflow skill that is not installed, and it pulled Codex away from `correct` in a plate-2 smoke. owner: Ziad, tracked here.
- Reflect backlog from the 2026-10-04 ledger redesign: a `.agents/pstack/` proof-run helper that writes each command line and exit status to its log, and `cross.mjs` writing the seat's own exit to a file; `decisions-check append` validating a batch and naming each refused row; one shared committer identity for tooling test fixtures; a `PermissionRequest` hook that allows an `rm` inside the session scratchpad, since the documented 2-minute auto-deny did not fire in a Desktop background subagent (a settings change that needs your word); an upstream fix to agent-session-resume's source matching; and whether to delete the `why/findings-linear.txt` and `findings-notion.txt` copies of another organization's items under `docs/plans/artifacts/2026-10-04-review-ledger-redesign/`. owner: Ziad, tracked here.
- `platejs/math`'s input rule declarations expose `InternalBaseEditorWithInstalledPlugins` (`dist/math/index.d.ts`), which the Plate foundation return boundary law forbids. The brand check excuses only that file through its known-leak entry; once the leak is fixed, the check fails until the entry is removed. owner: Ziad, tracked here.
- No standing check stops law copies from growing back in skills; this build removed the rules that told agents to copy law, but added no check. owner: Ziad, tracked here.
- `tooling/scripts/check-plate-doc-code-contracts.mjs:924-1045` still checks a `clipboardHandler` export that no package source exports (`git grep clipboardHandler -- packages` finds only a local `clipboardHandlers` variable). owner: Ziad, tracked here.
- `c70bacbd4a:docs/editor-behavior/editor-protocol-matrix.md:355-362` cite `MediaUploadPlugin.spec.ts`, `BaseMediaUploadPlugin.upload.spec.ts` and `BaseMediaUploadPlugin.spec.ts`, which `git ls-files` does not list. owner: Ziad, tracked here.
- The 11 audits in `docs/editor-audits/index.json` point at 112 ledger paths under the git-ignored `docs/plans/artifacts/`; new audits go to `docs/editor-audits/`, and the old ledgers have not moved. owner: Ziad, tracked here.
- The v259 history types export from `plitejs` but not from the `platejs` root, so `docs/vision/plite.md` names only the `plitejs` entrypoint. owner: Ziad, tracked here.
- `plate-next sync`'s completion check is instruction text that no trial or control has exercised. owner: Ziad, tracked here.
- A typed `best-api review <surface>` routes into the Verdict playbook in both runtimes and both trees, which continues into planning on Pursue; decide whether it should stop at best-api's own review verdict. owner: Ziad, tracked here.
- Another session's open plan, `docs/plans/2026-10-05-history-sync-replay-result.md`, cites `node .agents/rules/plate-next/scripts/version.mjs validate` as a checked proof and `best-api.mdc`'s replay rule as evidence; this build deleted the script and moved the rule to `docs/vision/plate.md` and `docs/vision/plite.md`. owner: Ziad, tracked here.
- No guard stops an `rm` on a variable or relative path, which this run did twice; a Claude Code PreToolUse hook could refuse it (a settings change that needs your word). owner: Ziad, tracked here.
- Two pushed lessons show in one runtime each: Claude's skills-cut walkthrough omits the frozen quotes and independent reader, and Codex loads no sync-pstack when asked for paired trials, so it never sees the cited-rubric rule. owner: Ziad, tracked here.
- Reflect backlog: `sync-pstack verify` should catch broken `#fragment` links, numbering gaps, empty sections and orphaned list intros; `smoke()` should return what each session read; `plan-open.mjs` should refuse a closed box whose step is partial; `cross.mjs` should refuse `--help` and unknown flags instead of sending them as the prompt; the obligation-inventory scripts should be shared; `sync-resources.mjs` should prune empty mirror folders and move to `tooling/scripts/`; `docs/vision/plate.md`'s plugin doctrine section needs subheadings. owner: Ziad, tracked here.
- The round-2 warning fixes for the second batch wait as an unreviewed patch, `docs/plans/artifacts/2026-10-06-pstack-autonomy/panel2/unreviewed-round2.patch`: drafts go to Open work, the PR and commit carve-out, unconfirmed readers count as outsiders, the rebase-onto landing, the batch panel's cap and trail review, the user-scope hook replay and a template-note parser check. owner: Ziad. stop: "another round" lands it after one more panel round, or it is dropped on 2026-11-06.
- Codex declines team messages under its own instructions and, in the M1 smoke, never says it leaves a draft. owner: Ziad. stop: the patch above lands and a Codex smoke shows the draft.
- Ellie's uncommitted `.agents/rules/verify.mdc` line pauses only "when it cannot connect"; another session holds that file. owner: Ziad. stop: that session commits it, then the line widens to any Claude in Chrome error.
- The session building `docs/plans/2026-10-06-react-review.md` loaded the block from before this run and may still stop at the old cap. owner: Ziad. stop: that plan closes.
- `tooling/scripts/check-hook-generics.mjs` exempts names through a hardcoded list with no reason, expiry or approver, so a new entry passes the gate without a code fix; a smoke found it in another session's work. owner: Ziad. stop: the react plan's build closes.
- The smokes named older rule conflicts this run did not touch: "first drafts start in Claude Code" against Codex autonomy, whether a "go" run counts as unattended for the trail review and reflect, Git at intake against recording the base commit, `lint:fix` after a panel, main-line standing authority against reserved work, and the cap rule's "hold" word. owner: Ziad. stop: the next sync-pstack Lesson run settles or drops each.
- The second reflect's 12 Backlog items, in `docs/plans/artifacts/2026-10-06-pstack-autonomy/reflect/synthesizer/answer.md`, such as a `reply.mjs` helper, a `land.mjs` helper, smoke `--prompts` and `--at` flags and a zsh `setopt` for agent shells. owner: Ziad. stop: each lands or is dropped at the next pstack sync.
- sync-pstack's Audit mode still hands its cut table to the owner, because a cut removes commands the owner types. owner: Ziad. stop: the owner says audit picks are the lead's.
- The rm hook covers the 24 forms its proof runs; `find -exec rm`, `eval` and `sudo -u <user> rm` go unchecked. owner: Ziad. stop: a run hits an rm prompt the hook missed.
- Eleven accepted reflect lessons from the 2026-10-06 documents review run, and the `AGENTS.md` half of a twelfth, wait unapplied: two in the Plan playbook, three in verify's `commands.md`, one in its `testing.md`, the lint bullet in `AGENTS.md` and five in the shared source. `docs/plans/2026-10-06-documents-review.md`'s Close, under Reflect, lists each with its target. owner: Ziad. stop: the reflect-lessons Lesson mode run (`docs/plans/2026-10-06-reflect-lessons.md`) or a new one lands them, or the owner drops them.
- Benchmark's methodology calls every timing line on a loaded shared host inconclusive, so such a result never rewrites a tracked receipt or accepts an architecture target. It names no load threshold, though, and no harness records load. The docx benchmarks write their tracked receipt on every passing `BENCH_MEASURE=1` run, and the `pnpm bench:docx` row of `AGENTS.md`'s rules table counts that as enforcement. The 2026-10-06 documents review run saw budgets missed at a load average of 7.5 to 13.2 on 18 cores. A copy-and-restore line for tracked receipts waits unreviewed in that run's `reflect/panel/round-2/unreviewed.patch`. owner: Ziad. stop: the harness records load and core count per run and writes the tracked receipt behind its own flag, and a run picks a load-to-core ratio, or the owner picks an interim ratio.
- Three leftovers from the 2026-10-06 documents review run's reflect lesson panel. `AGENTS.md`'s registry bullet leaves generation to CI on every branch but `next`, yet CI checks a `next`-based PR branch for a stale registry and never regenerates it. Benchmark's probe step writes cohorts to a run-directory log that a committed probe cannot locate, where printing them would do. A slice freeze after an owner's mid-build commit diffs against that commit instead of the intake base. owner: Ziad. stop: a sync-pstack Lesson mode run or an `AGENTS.md` edit settles each, or the owner drops it.
- Plans and subject items that still name "another round" or "ship all" as their stop now wait only for a review round the next run on them takes: `docs/plans/2026-10-06-knowledge-reorg.md`, the round-2 warning patch above, `docs/plans/topics/correct.md` and `docs/plans/topics/documents.md`. owner: Ziad. stop: each plan's next run reviews or drops its patch, or 2026-11-07. Tracked here.
- The cap-cut smokes raised older rule conflicts it did not touch, such as CLAUDE.md's no git state at intake against recording the base, writing passes on fix code and reflect's trigger; `docs/plans/2026-10-07-cut-review-cap.decisions.tsv` lists each. owner: Ziad. stop: the next pstack lesson batch takes or drops each, or 2026-11-07. Tracked here.
- Ellie's shared checkout holds another session's uncommitted `AGENTS.md` edit outside the block, so its next pull of `38da0d918` merges with it. owner: Ziad. stop: that checkout pulls `next`. Tracked here.
- A subject page led by an older open iteration hides a newer executed one, so `docs/plans/2026-10-07-cut-review-cap.md` does not show on this page while `docs/plans/2026-10-05-plate-beside-pstack.md` stays open. owner: Ziad. stop: the renderer lists executed iterations newer than the leader, or that plan closes. Tracked here.
- The first real review loop without a round cap, the pagination build of 2026-10-06, ran 2 plan rounds and 7 diff rounds. 5 diff rounds applied critical findings, and 4 of those were in the previous round's fix (`docs/plans/2026-10-06-pagination-review.decisions.tsv`, panel rows). `docs/plans/2026-10-07-pagination-reflect-lessons.md` takes a mechanism out of the loop once a replacement draws a critical finding. owner: Ziad; stop: the next build with three or more diff rounds shows whether that bound holds, or 2026-11-07; tracked here.
- Ellie still needs dotai `21e5354` and `d29c329`. Another session's uncommitted edit to Ellie's `AGENTS.md` blocks a clean push. owner: Ziad. stop: that edit lands, then sync Ellie and push its `next`.
- Two of two revised how-it-works trials failed the explorer-and-check item the baseline passed. The cause is unknown; the Extraction rule is byte-identical in both, which does not rule out an effect of the restructuring. owner: Ziad. stop: a rerun at three or more runs per side shows parity or names the cause.
- The trials could not reach three of R7's gates: a panel's seat launch, a plan written to `docs/plans` with its page, and a real PR repair. owner: Ziad. stop: a trial with edits allowed in a throwaway checkout runs them, or you drop them.
- Ellie has no smoke of the new pointers. owner: Ziad. stop: `sync-pstack smoke` on Ellie after its next sync.
- Codex's use of the new pointers is unproven. owner: Ziad. stop: a Codex transcript shows it opening `CODING_STANDARDS.md` before a code plan, or you drop the item.
- The Codex `project_doc_max_bytes` sentence. owner: Ziad. stop: every managed project's rendered `AGENTS.md` is at most 32,768 bytes, then drop the sentence from the block.
- Two new rule-file paths have no test, so they are unverified parts of R5: the refusal diff for an edited rule file, and removing a rule file whose section becomes skipped. owner: Ziad. stop: a test for each lands in dotai, or you drop them.
- Deferred refactors from the code-quality review: one shared drift path for the block and files, removing a renamed rule file, splitting the template engine out of `sync-pstack.mjs`, and the audit's placeholder shingling. owner: Ziad. stop: you take or drop each.
- Smoke conflicts that predate this change: a fork PR's push remote, a stacked PR's target against "a PR targets `next`", editing another person's PR body, and the unattended-run triggers. owner: Ziad. stop: you take or drop each.
- The panel rule moved as is, at 15 KB. owner: Ziad. stop: you say "rewrite panel" or drop it.
- The CI workflow test hits EMFILE in its bun preload here. owner: Ziad. stop: it runs on a machine without that limit, or you drop it.
- Ellie's three open suggested tasks show as unmigrated until a run there gives each a topic. owner: zbeyens, through the next ellie run that reads its `chips` Do list. stop: ellie's board shows no Unmigrated task. Tracked in the pstack subject's Open work.
- The chip ledger's last changes, dotai `f07462a..bb27327`, `ace87c9`, `b8a733a` and `9b9f816`, shipped fast with no review. owner: zbeyens. stop: you say "full" to review it, or drop it.
- The `chips` Do list's migrate items name each task but not the finding it was offered for, a round 1 warning deferred. owner: zbeyens, through the next run that migrates a ledger. stop: ellie's ledger is migrated, or you drop it.
- The smoke rounds found conflicts that predate this change: Autopilot picks against a design task or a side task, a PR wait in another repository, which word the topic grammar allows, plate's one-file rule against an unknown-cause title, plate's `codex/` branch rule against Babysit levels, and `close.md` placing neither the Status change nor the chip sweep. owner: zbeyens. stop: you take or drop each.
- The 2026-10-06 knowledge plan's reflect patches (the shared citation rule, the `reply.mjs` fix and sentence splits in the landed lessons) and its reflect Backlog items that name no other owner. The patches sit in that plan's run directory. owner: Ziad. stop: each lands or is dropped at the next pstack plan, or on 2026-11-06. Carried from the [2026-10-06 knowledge plan](../2026-10-06-knowledge-reorg.md).
