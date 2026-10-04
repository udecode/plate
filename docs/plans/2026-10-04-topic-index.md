# One index for every topic

Status: executed
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
- **plate-2's 22 topics without a subject file wait for the audit.** The approved step seeded a subject file for each of the 22 ledger topics whose plans name one, so their 67 plans became iterations. 21 of those pages refuse without a "What other editors do" section, and while the files existed their plans refused to render at all, so the seeds are removed. The owner answered "audit", so plate-2's API review playbook now has its first stop and the ledger triage audit create a missing subject file with its editor comparison and what has landed and been proven, so each page renders when one of them reaches its topic.
- **Ellie gets the same index**, with one subject today.
- **Needs you keeps every unanswered question.** A subject page shows Needs you from its leading iteration only, so a newer plan hides an older iteration's open question, as this plan would hide the plan-page subject's pending "Reflect lessons" question. Needs you collects the Open questions of every iteration, each labeled with its plan, and the index marks a subject that waits on you.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the index code lives | `--index` mode in `plan-page.mjs`, reusing its parser, status words and page styles | A separate `topics.mjs` helper | "separate helper" |
| Ledger topics with no subject file | Listed as "no page yet" from their hubs | Left off the index | "subjects only" |
| Ellie | The same index, one subject today | plate-2 only | "plate only" |

## Steps

1. - [x] **Index mode and Needs you.** Make Needs you collect every iteration's Open questions, and add `--index` to the renderer in a dotai worktree at `origin/main`, because another session holds uncommitted edits in the shared checkout. Proof: tests that fail on the current renderer for a subject listed with its iteration count and status, a hub with no subject listed as no page yet, an open subject sorted first, and an older iteration's open question still shown under a newer plan; the old and new renderer over every plan in both projects give identical pages. Done: dotai 8729e19 and 191efc6, `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` 86 pass, and the corpus compare with styles stripped shows 0 status changes and 3 intended body changes.
2. - [x] **Skill.** Render mode renders the local index after each subject render and publishes each hand-back page for comments, Codex renders and replies with the file path, and `references/shape.md` gains the index's shape. Proof: a read-only smoke in both runtimes, where a plain request that changes a topic page lists the local render, the publish for comments and the local index without being asked. That proves routing only; a real republish and a dead link's new page stay unproven until a session does one. Done: dotai 191efc6 and bd6c8cd; `/private/tmp/claude-501/-Users-zbeyens-git-ellie/2ecf48d6-1643-4543-817a-7b733f98cceb/scratchpad/smoke11/plate2.txt` and `ellie.txt` hold both runtimes' answers.
3. - [x] **Sync.** Commit in the worktree, `apply` and `verify` both projects, reinstall plan-page in both, run the decision-trail review on the new renderer mode, then push dotai. Proof: `check` and `verify` exit 0, and the trail review's answer. Done: two trail-review rounds in scratch trail-review2 and trail-review3, and dotai 8729e19 through 53e9c94 on main.
4. - [x] **plate-2 topics.** Render plate-2's local index and pages. Proof: the index lists every subject with a local page and every ledger topic with no subject as no page yet. The 22 seeded subjects wait on Open questions. Done: plate-2/docs/plans/artifacts/topics/index.html, 6 pages and 63 topics with no page yet.
5. - [x] **Ellie index.** Render Ellie's local index. Proof: it lists Ellie's subject with its local page. Done: ellie/docs/plans/artifacts/topics/index.html, 1 page.
6. - [x] **Claude smoke, then push.** The Claude CLI hit its weekly limit, which resets on 2026-10-06, so the Claude Code half of the smoke has not run and the dotai push of 8729e19, 191efc6 and bd6c8cd waits on it. Proof: the Claude smoke on the same request, then the push. Done: the owner switched the CLI's account; docs/plans/2026-10-04-pstack-0964.decisions.tsv holds the smoke and delivery rows.

## Close

Reversals: the approved step 4 seeded a subject file for each of plate-2's 22 ledger topics and published their pages; the seeds broke their renders and are removed, and the owner answered "audit", so the API review playbook's first stop and the ledger triage audit create each subject file with its editor comparison. The approved index republished to claude.ai after every subject publish; the owner reversed it, so the index and every page stay local and only a hand-back page is published, for comments.

What landed: `plan-page.mjs --index` renders every subject's page and `<plans>/artifacts/topics/index.html`, listing hub topics with no page yet, and Needs you keeps every iteration's open question. dotai 8729e19, 191efc6 and bd6c8cd carry it, and both projects run it. plate-2's index shows 6 pages, 63 topics with no page yet and 2 that wait on you; Ellie's shows 1 page. plate-2's `.agents/playbooks/api-review.md` change for the audit stays uncommitted for the owner.

Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` passes 86, and the old and new renderer over every plan in both projects differ only in the 3 intended bodies. Read-only smokes in both runtimes route a topic hand-back through the local render, the publish for comments and the local index, with Codex leaving the publish to the lead. They prove routing only. This session's republish of the plan-page and pstack pages from the new account, with fresh Page lines for the dead links, is the one real hand-back so far.

Counts: 6 steps, 6 done, 0 skipped, 0 blocked, 0 open.

Open work, moved to the plan-page subject's Open work with owner Ziad:

- plate-2's 22 ledger topics with plans and no subject file get their pages when the API review playbook's first stop or a ledger triage audit reaches them.
- The Claude smoke flagged that the block calls the rendered file the durable page while `docs/plans/artifacts/` is gitignored, so the page lasts only on the machine that rendered it.
- The Claude smoke flagged that a plan the reviews list does not name ends with an `AskUserQuestion`, while Plan pages says the hand-back reply is the page link alone.

