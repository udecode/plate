# Use the Plate skills

This page is an index. It says what to type and which file owns each process,
and it restates no rule, so open the linked file for the rule itself.
[AGENTS.md](../../AGENTS.md) holds the install steps, the rules every task
needs and the routing table.

## Start with the outcome

Describe the result you want, with the route, package, issue or plan when you
know it. pstack's `poteto-mode` routes the request to a playbook, and Plate's
playbooks in [`.agents/playbooks/`](../../.agents/playbooks/) build on pstack's.

| You say | What runs |
| --- | --- |
| "next" | [chips](../../.agents/skills/chips/SKILL.md), answering about open chips |
| `/chips` | [chips](../../.agents/skills/chips/SKILL.md)'s Sweep, which offers and cards this session's suggested tasks; `/chips all` also cards the ship-list tasks and the ones no live session owns |
| "verdict <doc, draft, issue or idea>" or "what would you do from this?" | [Verdict](../../.agents/playbooks/verdict.md)'s intake |
| "review <scope id>", then "again" or "panel" | [Verdict](../../.agents/playbooks/verdict.md)'s deep path |
| "plan" or `plan <goal>` | [Plan](../../.agents/playbooks/plan.md) |
| "go" | [Build](../../.agents/playbooks/build.md) |
| A bug report, screenshot or recording | [Bug fix](../../.agents/playbooks/bug-fix.md) |
| "babysit <number>", "clean up PR <number>", "finish the current tree" or "review PR <number>" | [Babysit](../../.agents/playbooks/babysit.md) |
| "clean up <surface>" | [Refactoring](../../.agents/playbooks/refactoring.md) |
| A slowness report or `benchmark <scope>` | [Perf issue](../../.agents/playbooks/perf-issue.md) |

For example:

```text
next
review link
plan
go
```

## Choose a narrower entry point when useful

These are shortcuts for one job, not a sequence to run.

| Your job | Direct entry point |
| --- | --- |
| Choose a public API | `$best-api design <surface>` |
| Review a live Plate package against the v2 target, or repair its findings | `$plate-next <package>`, `$plate-next sync <package>` |
| Find important behavior with no test, or prune existing tests | `$test-audit <scope>`, or `$test-audit full` |
| Test one editor feature by hand against its reference editor | `$verify playtest <feature>` |
| Measure, diagnose and improve slow behavior | `$benchmark <operation and workload>` |
| Join a rule or issue to its tagged tests, list locked rules no test proves, or check the knowledge stores | `pnpm kb <rule ID or issue ref>`, `pnpm kb gaps`, `pnpm kb check` |
| Research external editor approaches | `$research <feature or question>` |
| Compare external editor architectures, or harvest their tests | `$research audit <repo>`, `$research harvest <repo>` |
| Write or audit Plate public documentation | `$plate-docs <page or topic>` |
| Draft, edit or audit general prose | `/pstack:technical-writing <text or file>` |
| Explain behavior, rationale or a body of work | `/pstack:how`, `/pstack:why` or `/pstack:teach` |
| Present existing visual proof | `$walkthrough <completed work>` |
| Work a public issue, PR or security queue | `$maintainer <scope>` |
| Draft a review comment on a Slate PR or a Plate `main` PR | `/review-comment <PR>` |
| Draft a Plate Beta issue from video or text | `$maintainer issue-draft <video or text>` |
| Inspect, sync, promote or verify release lanes | `$release-lanes status`, `sync dry-run`, `sync`, `promote`, `promote execute` or `verify` |
| Clean up idle caches and finished worktrees | `/cleanup` |
| Fix a failed PR body check, or update a branch that predates next's agent rules | `/contributor-setup` |

## Find the rule

| Process | Owner |
| --- | --- |
| Every task's rules, stops, delivery and the pstack overrides | [AGENTS.md](../../AGENTS.md) |
| Code rules, read before writing, reviewing or cleaning up code | [CODING_STANDARDS.md](../../CODING_STANDARDS.md) |
| Each rule paired with what enforces it | [enforcement.md](enforcement.md) |
| Product and architecture law | [VISION.md](../../VISION.md) and [`docs/vision/`](../vision/) |
| Landing a task on `next` | [land.md](../../.agents/pstack/rules/land.md) |
| Panels, `architect`, arena and review rounds | [panel.md](../../.agents/pstack/rules/panel.md) |
| Plan pages and the hand-back reply | [pages.md](../../.agents/pstack/rules/pages.md) |
| Suggested tasks and their ledger | [chips.md](../../.agents/pstack/rules/chips.md) |
| Long runs, `/loop`, `/goal` and compaction | [long-runs.md](../../.agents/pstack/rules/long-runs.md) |
| The one-hour budget | [time.md](../../.agents/pstack/rules/time.md) |
| Tests | [tests.md](../../.agents/pstack/rules/tests.md) |
| Driving a browser | [browser.md](../../.agents/pstack/rules/browser.md) |
| Session titles | [title.md](../../.agents/pstack/rules/title.md) |
| Reflect, corrections and agent files | [reflect.md](../../.agents/pstack/rules/reflect.md) |
| The review ledger's files and commands | [schema.md](../research/schema.md) |
| Proof of packages, browsers, native editors, CLIs and artifacts | [verify](../../.agents/skills/verify/SKILL.md) |

## Installed skills

These skills live in this checkout's `.agents/skills` directory. pstack's skills
come from the pinned `pstack@pstack-claude` plugin; invoke them as
`/pstack:<name>`, such as `/pstack:how` or `/pstack:reflect`. To list the local
skills from the repository root:

```sh
rg --files --hidden --no-ignore .agents/skills -g SKILL.md | sort
```

| Skill | Purpose |
| --- | --- |
| [authored-decision-order](../../.agents/skills/authored-decision-order/SKILL.md) | Check that deciding the authored review tree's pending changes one at a time, in any order, gives the document that deciding them at once gives, and that no change adds a set of verdicts a reviewer can only decide together, for every document up to a bound. |
| [autoformat-input-rules](../../.agents/skills/autoformat-input-rules/SKILL.md) | Check that every shorthand the www autoformat and basic marks kits declare applies whole when typed key by key, that no typed sequence of up to three keys changes a paragraph it was not typed in, and that one undo takes back each keystroke that fires a rule. |
| [benchmark](../../.agents/skills/benchmark/SKILL.md) | Measure and repair Plate/Plite performance, or review a performance design before running its applicable benchmark lanes. |
| [best-api](../../.agents/skills/best-api/SKILL.md) | Design, review or repair a Plate or Plite public call shape with the Plate API lens. |
| [verdict](../../.agents/skills/verdict/SKILL.md) | Say what to do from any input, or judge one Plate or Plite review scope by its exact id. |
| [contributor-setup](../../.agents/skills/contributor-setup/SKILL.md) | Bring a branch that predates next's agent rules up to date once, then fix the bodies of your open PRs into next. Its doctor runs at every Claude Code and Codex session start and prints a fix for each plugin or Codex setting behind the checkout's pins. |
| [changeset](../../.agents/skills/changeset/SKILL.md) | Write and verify package release changesets, registry changelog entries, and the PR’s managed auto-release choice. |
| [issue-harvester](../../.agents/skills/issue-harvester/SKILL.md) | Maintain exhaustive Slate/Plate issue-closure ledgers from current issue, PR, test and local proof evidence. |
| [maintainer](../../.agents/skills/maintainer/SKILL.md) | Triage public Plate/Slate issues, PRs and security queues, then route authorized work and exact public proof. |
| [review-comment](../../.agents/skills/review-comment/SKILL.md) | Review a Slate PR or a Plate PR based on `main` with Plate v2's research, code and tests, and draft the GitHub review comment. |
| [plate-docs](../../.agents/skills/plate-docs/SKILL.md) | Write or audit Plate public documentation, page design, examples, installation, MDX and navigation. |
| [plate-next](../../.agents/skills/plate-next/SKILL.md) | Review a live Plate package, file or API path against the Plate v2 target, or sync live packages by repairing their review findings. |
| [plate-plugins](../../.agents/skills/plate-plugins/SKILL.md) | Build Plate plugins and entrypoints, and deliver a feature across its package, UI, docs and release. |
| [plate-ui](../../.agents/skills/plate-ui/SKILL.md) | Implement Plate React component families, copied registry UI and kit wiring with exact browser proof. |
| [release-lanes](../../.agents/skills/release-lanes/SKILL.md) | Promote Plate beta releases, sync main back to next and verify published npm/GitHub state with release authority. |
| [research](../../.agents/skills/research/SKILL.md) | Research prior art and external editor evidence, compare external editor architectures, harvest portable tests, and maintain the compiled research layer. |
| [shadcn](../../.agents/skills/shadcn/SKILL.md) | Manage shadcn components and projects. |
| [sync-plate-ui](../../.agents/skills/sync-plate-ui/SKILL.md) | Sync Plate registry UI into downstream apps with fork-aware comparison, scoped apply and changelog tracking. |
| [sync-shadcn](../../.agents/skills/sync-shadcn/SKILL.md) | Sync upstream shadcn docs into Plate, or match shadcn's registry and install protocol source by source. |
| [tanstack-virtual](../../.agents/skills/tanstack-virtual/SKILL.md) | Headless UI for virtualizing large element lists. |
| [vercel-react-best-practices](../../.agents/skills/vercel-react-best-practices/SKILL.md) | React and Next.js performance guidelines from Vercel Engineering. |
| [verify](../../.agents/skills/verify/SKILL.md) | Review implementation ownership and verify Plate/Plite packages, editor states, CLI outputs and registry artifacts through their actual proof owners. |
| [video-transcripts](../../.agents/skills/video-transcripts/SKILL.md) | Transcribe a supplied local or linked video with Gemini Files API when its contents are needed as evidence. |
| [walkthrough](../../.agents/skills/walkthrough/SKILL.md) | Present final screenshots or rendered artifacts as an annotated walkthrough when visual evidence is requested. |

## Edit the rules

Edit repository rules in `.agents/rules` and run `pnpm run prepare`, then
`node .agents/rules/plate-next/scripts/sync-resources.mjs --check`. The pstack
block in `AGENTS.md`, `.agents/pstack.json`, `.agents/pstack/` and its rule
files come from the `sync-pstack` skill in `udecode/dotai`, so shared rules
change there. The [September 5 skill audit](agent-skill-audit.md) records
historical decisions.

## Retired commands

The owner retired Plate's typed aliases on 2026-10-01 and the vendor `prototype` skill on 2026-10-02. Older plans, ledger records and decision pages still name them. Read `$task design plan <goal>`, `$plate-plan` and `$plite-plan` as "plan" through the Plan playbook, `$task execute` as "go", `$patch` as the Bug fix playbook, `$autoclosure` as the Babysit playbook, `$editor-audit` and `$editor-test-harvester` as `research audit` and `research harvest`, `$clawsweeper` and `issue-harvester slate` as the retired Slate claims mode, which `git log -- .agents/rules/issue-harvester/references/slate-claims.md` keeps, and `$prototype` as pstack's Prototype playbook. `best-api-review` became `verdict` on 2026-10-10, and its playbook `api-review.md` became `verdict.md`. `docs/plans/backlog.md` existed only on 2026-10-18, and its lines became suggested tasks.
