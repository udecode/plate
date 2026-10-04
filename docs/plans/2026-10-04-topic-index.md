# One index for every topic

Status: blocked: waiting on the owner's answer to Editor comparisons
Topic: plan-page

Each project gets a local index that links every topic's local page, with its status, its iteration count and its newest iteration date, and the plan-page skill renders it whenever a topic page changes. Local pages under the plans directory are the durable copy; each hand-back still publishes its page to claude.ai so the owner can comment. In plate-2 the index also lists every review-ledger topic that has no page yet.

## Public API

The renderer gains an index mode.

```sh before
# skills/plan-page/SKILL.md
node .agents/pstack/plan-page.mjs <plan>
node .agents/pstack/plan-page.mjs <plan> --folded
node .agents/pstack/plan-page.mjs <plan> --check
```

```sh after
# skills/plan-page/SKILL.md
node .agents/pstack/plan-page.mjs <plan>
node .agents/pstack/plan-page.mjs <plan> --folded
node .agents/pstack/plan-page.mjs <plan> --check
node .agents/pstack/plan-page.mjs --index
```

## Main changes

- **The renderer draws the index.** `--index` reads every subject file in `<plans>/topics/`, finds its iterations the way a subject page does, and writes `<plans>/artifacts/topics/index.html`. Each row shows the subject's title linked to its page, its lead sentence, the leading iteration's status, its iteration count and its newest iteration date. Subjects with an open iteration come first, then the rest by their newest iteration.
- **Ledger topics with no page show too.** When `pageTopic.hub` is set, every hub file without a subject file appears as a topic with no page yet, so plate-2's index covers all 67 review-ledger topics.
- **The skill keeps it current, locally.** `--index` renders every subject's page into `<plans>/artifacts/topics/` beside `index.html`, and plan-page's Render mode runs it after every subject render. The index is never published. Approved wording, reversed by the owner: "republishes the index after every subject publish, to the `Page:` line in `<plans>/topics/README.md`".
- **Local pages are the durable copy.** A published claude.ai page is where the owner comments on one hand-back; when its link no longer opens, the next publish makes a new page. Codex sessions render the page and reply with its file path instead of skipping it.
- **plate-2's 22 topics without a subject file wait.** The approved step seeded a subject file for each of the 22 ledger topics whose plans name one, so their 67 plans became iterations. 21 of those pages refuse without a "What other editors do" section, and while the files existed their plans refused to render at all, so the seeds are removed until Open questions decides how they come back.
- **Ellie gets the same index**, with one subject today.
- **Needs you keeps every unanswered question.** A subject page shows Needs you from its leading iteration only, so a newer plan hides an older iteration's open question, as this plan would hide the plan-page subject's pending "Reflect lessons" question. Needs you collects the Open questions of every iteration, each labeled with its plan, and the index marks a subject that waits on you.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the index code lives | `--index` mode in `plan-page.mjs`, reusing its parser, status words and page styles | A separate `topics.mjs` helper | "separate helper" |
| Ledger topics with no subject file | Listed as "no page yet" from their hubs | Left off the index | "subjects only" |
| Ellie | The same index, one subject today | plate-2 only | "plate only" |

## Steps

1. - [ ] **Index mode and Needs you.** Make Needs you collect every iteration's Open questions, and add `--index` to the renderer in a dotai worktree at `origin/main`, because another session holds uncommitted edits in the shared checkout. Proof: tests that fail on the current renderer for a subject listed with its iteration count and status, a hub with no subject listed as no page yet, an open subject sorted first, and an older iteration's open question still shown under a newer plan; the old and new renderer over every plan in both projects give identical pages.
2. - [ ] **Skill.** Render mode renders the local index after each subject render and publishes each hand-back page for comments, Codex renders and replies with the file path, and `references/shape.md` gains the index's shape. Proof: a read-only smoke in both runtimes, where a plain request that changes a topic page lists the local render, the publish for comments and the local index without being asked. That proves routing only; a real republish and a dead link's new page stay unproven until a session does one.
3. - [x] **Sync.** Commit in the worktree, `apply` and `verify` both projects, reinstall plan-page in both, run the decision-trail review on the new renderer mode, then push dotai. Proof: `check` and `verify` exit 0, and the trail review's answer. Done: two trail-review rounds in scratch trail-review2 and trail-review3, and dotai 8729e19 through 53e9c94 on main.
4. - [x] **plate-2 topics.** Render plate-2's local index and pages. Proof: the index lists every subject with a local page and every ledger topic with no subject as no page yet. The 22 seeded subjects wait on Open questions. Done: plate-2/docs/plans/artifacts/topics/index.html, 6 pages and 63 topics with no page yet.
5. - [x] **Ellie index.** Render Ellie's local index. Proof: it lists Ellie's subject with its local page. Done: ellie/docs/plans/artifacts/topics/index.html, 1 page.
6. - [x] **Claude smoke, then push.** The Claude CLI hit its weekly limit, which resets on 2026-10-06, so the Claude Code half of the smoke has not run and the dotai push of 8729e19, 191efc6 and bd6c8cd waits on it. Proof: the Claude smoke on the same request, then the push. Done: the owner switched the CLI's account; docs/plans/2026-10-04-pstack-0964.decisions.tsv holds the smoke and delivery rows.

## Open questions

### Editor comparisons

The 22 seeded subject files are removed: 21 of their pages need a "What other editors do" section, none of plate-2's 70 decision records has one, and while the files existed those topics' plans refused to render at all. How should those topics get their pages?

- **audit** (recommended): the phase-1 audit writes each topic's subject file with its editor comparison and its current execution and proof state, and its page renders then; until then the index lists them as no page yet.
- **relax**: restore the files; the renderer asks for the comparison only while a topic has an open plan, so all 21 render now with their history and no comparison.
- **research**: research the 21 comparisons now, before the audit, then restore the files.

The plate-2 Plan playbook requires the section on every subject whose ledger hub exists. The dry run before the plan copied no hubs, so the rule never fired there, and the trail review flagged the broken renders as critical.
