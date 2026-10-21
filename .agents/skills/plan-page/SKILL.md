---
name: plan-page
description: "Write, check, repair and publish a plan page: a project's plans and subject files under its plans directory, rendered by .agents/pstack/plan-page.mjs and rendered as one local HTML page per subject with a local index of every subject, and published to claude.ai at each hand-back for comments and feedback. The page is how planned work hands back to the user. Use before writing or changing a plan, a subject file in <plans>/topics or its page; at every stop that hands back work with a plan, such as a review verdict other than a review-only panel's, a next answer or a playbook's close; before writing or updating a PR body, which renders from the PR's plan, or a comment about your commits on someone else's PR; when a plan page or its claude.ai artifact looks wrong or refuses to render; to republish a page; or to change the page shape or a playbook's page sections."
argument-hint: '[refresh | check | repair | change | pr] [plan]'
metadata:
  source: udecode/dotai
  source-path: skills/plan-page
---

# Plan page

The user reads pages, not replies; the block's Plan pages rule says when to publish and what the reply holds. A subject is one thing the work changes, and it has one page. Its file, `<plans>/topics/<slug>.md`, holds the current state. Each plan that continues it is an iteration carrying only its delta. `node .agents/pstack/plan-page.mjs <plan>` renders the page from both into `<plans>/artifacts/`, a local copy that regenerates from the committed plan and subject files, which are the record. `node .agents/pstack/plan-page.mjs --index` renders every subject's page there and an index linking them. A published claude.ai page is where the user comments on one hand-back; it is not the record. sync-pstack ships that renderer and `status.mjs` into every project it manages.

Read [references/shape.md](references/shape.md) before writing a plan or a subject file. It holds every file shape, the page order and the renderer's refusals.

| Mode | Use it to |
| --- | --- |
| [Render](#render) | publish a page at every stop the block's Plan pages rule lists |
| Refresh | render the named plan's page again with Render steps 5, 7 and 8 while the plan is not done; with no plan named, use the open plan of the subject the session works on, and ask when there is none |
| [Check](#check) | audit a plan and its subject before handing the page back |
| [Repair](#repair) | fix a page whose shape is wrong |
| [PR](#pr) | write or update a PR body as the page of the PR's plan, or a comment about your commits on someone else's PR |
| [Change](#change) | change the page shape, the renderer, or a playbook's page sections |

## Render

1. Pick the subject before writing the plan. Continue the subject whose thing the work changes. Start a new one only for a new thing that will be revisited. A one-off plan, such as a review verdict's, has no subject and keeps its own page. A review verdict or a "next" answer with no plan yet writes one now, either the iteration that later stops continue or a one-off plan. Work that keeps no plan under the block's Plans and trails rule, such as a single fix, writes none and hands back in its reply. A read-only request still has its subject. Render its plan from a copy outside the repository, and publish it to that subject's `Page:` URL, never to a second page.
2. Name the subject with `Topic: <slug>` under `Status:`, or through the first entry of the frontmatter list the project names in `pageTopic.field`, so list the scope that owns the change first. A plan whose list-named subject has no file yet keeps its own page until someone creates that file; the renderer refuses a `Topic:` line whose subject has no file until that file exists.
3. Name the playbook poteto-mode picked with `Playbook: <name>` under `Status:`, so the rail shows it. When a project playbook in `.agents/playbooks/` writes the plan, name that one, so its page sections lead and its required sections apply; otherwise name pstack's, such as `feature` or `bug-fix`. The renderer refuses a name that is neither.
4. Write the leading plan's `## Brief` first, then its `## Teach`, per [references/shape.md](references/shape.md). They are the parts the owner reads first. Load `pstack:teach` and follow its method for Teach, reusing what the run's `how` and `why` work found instead of running them again. A page with a brief then shows How it works, Demo, Needs you, Picked for you, the plan's changes, Verification once the plan is done, and Open work, and the plan file keeps the steps and history. The PR body walks the same order.
5. Walk [Check](#check)'s reading list before the first publish and after each revision, then run `node .agents/pstack/plan-page.mjs <plan>`. It refuses every shape it can check and names the fix. Fix the plan or the subject file, never the HTML.
6. When the work does something the owner can try, write the plan's `## Demo` per [references/shape.md](references/shape.md) before the hand-back, reusing the frames verification captured. At a close, write the plan's `## Close` before rendering: what landed, the proof and its limits, the counts the block's Todo list and close rule requires, reversals and deviations first, and open work with owners and stops. The page shows the brief, not the Close, so rewrite Changes and Risks to tell the owner what the Close holds.
7. When the page belongs to a subject, run `node .agents/pstack/plan-page.mjs --index`, then render the plan again. `--index` renders every subject's page and the index locally, and it leads each page with its newest open iteration. The second render restores the page of the plan this stop is for. The index is never published.
8. Publish to the subject's `Page:` URL, or to the one-off plan's own, so the user can comment on it. In Claude Code the publish goes through `page-stop.mjs`, as the Plan pages rule says: read every file it names in full, then send what it prints, and never publish the whole page the renderer prints. A checkout publishes to its own `Page:` line when that line changed since the checkout forked from `origin/<branch>`, and otherwise to `origin/<branch>`'s line, which the render prints. A subject's first publish makes its page, and the helper then tells the lead to write `Page: <url>` under the subject file's title, or under a one-off plan's `Status:` line. When that link no longer opens, because the page was deleted or belongs to another account, publish to the line the render names from another worktree, or else run the helper with `--new` to make a new page and replace the line. The owner may have deleted it on purpose, so the plan the reply links also gets a Defaults row that names the old and new links, keeps the new page and gives the word that drops it. To read a page, open its rendered file under the plans directory or its plan and subject files, never the published page. The block's Plan pages rule says what the reply holds and what a Codex session does instead. On a subject page's first publish, offer once to pin it. When the owner asks in chat where a page is, answer with the link and offer the pin again.

## Check

Run `node .agents/pstack/plan-page.mjs <plan> --check`. It runs every refusal and writes nothing. Then read the plan and its subject for what the renderer cannot judge:

- Every sentence the page shows reads in the `pstack:bro` voice. Run the plan's prose pass, such as `unslop`, first. Then, as the last pass, load `pstack:bro` and restate the brief, Teach, each open question, each Defaults row and each sentence above a before and after pair through it, so no later pass undoes it. Keep the plainer version, and drop a detail the owner does not need when the plan's other sections already hold it. The pass may change a claim's words but never its scope, so keep every count and every qualifier that limits a claim, such as which cases were tried. After the pass, compare each restated claim with the sentence it replaced and with the log row that records it. One bro pass turned "no better on the tasks tried" into "added nothing" and two trials into three.
- Each `before` fence is a real call site at the commit before the plan, and its `after` fence the same call in the checkout, or the planned call while the plan is unbuilt. Each fence names its path in a comment, with one sentence above the pair.
- While the plan is open, the subject file shows the state before it. That holds for a subject the plan created too.
- Every subject section the plan changes carries a Delta table keyed to the subject's rows. Otherwise the page marks the section unchanged.
- Main changes lists only non-public changes that alter how the code works.
- Each box closed since the last render matches its approved `Proof:` clause, on the exact bytes and in the place the proof ran. A change to the shared source counts as live in a project only after that project syncs from its pushed commit.
- Every universal quantifier, such as all, each or every, on a plan line changed since the last commit matches the log row or check that enumerated that set.
- A settled build input that this run found and that lives only in the run directory, such as a request shape, a store path, an environment variable's name or a doc URL, is copied into the plan or its subject file before the step that needs it, never as a secret value or a real payload.
- A project's docs check may read every backticked `.md` name in a plan or subject file as a doc link and refuse one under the ignored run directory. Then move that pointer to a decision-log row's `proof:` label, as the block's Plans and trails rule says, and never replace it with prose.
- `Status:` is one short line: the state word, then what the plan waits on. Open items go in their own section, each with its owner, where it is tracked and its stop.
- When more than one subject waits on the owner, every answer word a brief, a question or a reply offers names its subject, such as "go model", so a bare "go" cannot land on the wrong page.

## Repair

1. Copy each file to the run directory before rewriting it, and keep the copy as the must-refuse fixture for any refusal that should have caught it.
2. Run [Check](#check) and fix each finding at its source. A subject that shows a plan's delta while its steps are all closed and its proof done is a finished fold whose `Status:` was not flipped yet; flip it instead of restoring. For an early fold, restore the subject file to its state before the open plan from the plan's `before` fences and `git show <base>:<path>`, and move the delta into the plan.
3. Log one decision-log row for the repair.
4. A ledger record that binds the plan's bytes goes stale on the edit. Rebind it by the project's record rule.
5. Render and republish to the same URL.

## PR

A PR body is the page of the PR's plan, rendered as GitHub Markdown, so a reviewer reads the same brief, rail, models, How it works, Demo, picks and API pairs the owner reads.

1. Pick the PR's plan. When one plan covers the whole diff, use it. When the PR carries several plans, or changes that no plan covers, write a PR plan: a one-off plan whose `Plans:` line under `Status:` lists each plan it carries, by path relative to it. Title it after the change, as the PR title reads; the renderer refuses a PR number in the title, which says nothing inside that PR. Write it with Render steps 3 to 6 so its brief, Teach, Demo, Public API pairs and Defaults cover the whole diff, and give each change no plan covers its place in those sections. Whichever plan the PR uses, rewrite its Changes and Risks for a reviewer at PR time, since a brief written mid-run speaks to the owner; the renderer refuses a PR number in the brief. Its Demo gives one step per change a reviewer can see, with that change's before and after clips as frames and any limit of the clip in the step. Its `## Verification` names each run and where proof stops in at most three bullets, and its `## Open work` names what the PR leaves out. Drop local run-folder paths from every section the PR shows, because they do not open on GitHub. Run [Check](#check) on it, `pstack:bro` last.
2. After the last push, run `node .agents/pstack/plan-page.mjs <plan> --pr` from the repository root, so its links point at the pushed commit. It runs every refusal a page render runs, refuses a plan without a brief whatever its state, and writes `<plans>/artifacts/<name>.pr.md`. It prints that path, then one `--attach <file>` line for each local Demo or Teach frame the body has not uploaded yet.
3. In a project that lands through `land.mjs`, land.mjs renders this body and opens the new PR itself, and its guard denies an agent's own `gh pr create` into the trunk branch. Elsewhere a new PR opens with `gh pr create --body-file <file>` and the printed `--attach` lines. To update a PR, save its body with `gh pr view <number> --json body --jq .body > <run directory>/body.md`, render with `--into <run directory>/body.md`, and run `gh pr edit <number> --body-file <file>` with the printed `--attach` lines. `gh` uploads each attached frame and rewrites its reference. The render replaces only the text between its `plan-page` markers, keeps the rest of the body, such as a release block or hand-attached videos, and reuses each frame the body already uploaded. Rerender after each push that changes the plan or its diff, so the body stays true to the pushed diff.

On a PR someone else opened, leave their description alone. One comment from you covers only your commits on top of theirs:

1. Write the plan for those commits. Its brief and Teach speak to the owner, as on any page, and the comment leaves them out. Each before fence of Public API and the playbook's design sections is the code at the author's last commit before yours. The Demo has a step only for what your commits change on screen. When they change nothing a user sees, the plan has no Demo. Add a `## On top of the PR` section that lists what you kept, changed and dropped from their version. The comment has no other list of what your commits changed, so the renderer refuses a comment without it. The plan's Verification names where the proof of your commits stops, such as a case only a throwaway probe checked, because the comment shows no Risks.
2. After your push, from a checkout at the PR's pushed head, save the description with `gh pr view <number> --json body --jq .body > <run directory>/description.md`. Then run `node .agents/pstack/plan-page.mjs <plan> --comment <author's last commit> --against <run directory>/description.md`. It writes `<plans>/artifacts/<name>.comment.md` and links DiffsHub's compare view from that commit to your head. The comment holds that link, On top of the PR, the Demo, Public API, the playbook's design sections and Verification. It leaves out what the author already knows or only the owner reads: the brief, How it works, the run's models and stages, open questions, Defaults, open work and the plan link. It also leaves out each Demo clip the description already shows, and each step whose clips all are.
3. Post it with `gh pr comment <number> --body-file <file>` and the printed `--attach` lines. After a later push, save that comment's body to the run directory, render with `--into` it as well, and update it with `gh pr comment <number> --edit-last --body-file <file>` while it is still your last comment. Once someone has replied below it, post a new one.

## Change

The renderer source is `skills/sync-pstack/assets/pstack/plan-page.mjs` in the dotai checkout, with `status.mjs` beside it. Its tests are the `plan-page` tests in `skills/sync-pstack/scripts/sync-pstack.test.mjs`. A section that only one project's plans write belongs in that project's playbook frontmatter, never in the renderer.

Run sync-pstack's Lesson mode, which owns the gates, the corpus rules and the delivery. This mode adds the renderer's specifics inside its steps:

1. In Lesson step 2, edit the dotai checkout on `main`, never a worktree, even when another session holds uncommitted edits there, as dotai's `AGENTS.md` says.
2. In Lesson step 3, give each new refusal or behavior a test that fails on the old renderer for its named defect. A refusal that compares text gets one must-pass and one must-refuse case on each axis before any panel: case, indentation, spacing inside literals, punctuation-only lines, line order, partial overlap with another iteration and a missing section.
3. In Lesson step 4, copy each managed project's plans, subject files, hubs, `.agents/pstack.json` and playbooks to scratch once, for the old renderer, then `cp -R` that copy and apply the change's migration to it for the new one, and diff the two plan lists before any body. When the live trees hold no instance of a state a refusal gates, also replay subject files at past commits where an iteration was open, and the scratch copies Repair kept. Give a renderer that predates `--check` an adapter that exits before it writes. Run both over every plan, list each newly refused plan with its owner, then render every plan with both and diff the bodies, ignoring the Updated line.
4. Also in Lesson step 4, render one real plan in each mode the renderer branches on: a one-off plan, a subject with an open iteration, a subject with none and an executed plan rendered while another iteration is open. Use a scratch copy with its `Status:` flipped when no live subject is in a mode. Publish both versions for the owner to compare. Before the dotai commit, also render the change's own plan in its closed state on its real subject page.
5. Before a plan names a new heading, field or status word that the renderer parses, count its existing uses across every managed project's plans, so a word already in use does not change old pages by surprise.

## Playbook sections

A project playbook in `.agents/playbooks/<name>.md` names the review sections its plans write, as comma lists in its frontmatter beside `extends` and `when`:

```yaml
page-lead: What other editors do, Document shape, Layer and owner
page-pairs: Document shape
page-require: What other editors do
page-pr: What other editors do, Document shape
```

- `page-lead` sections render right after Public API, the leading plan's playbook first.
- `page-pairs` sections hold `before` and `after` pairs, like Public API.
- `page-require` sections must exist in the subject file, or in the plan that leads the page when that plan has a brief, whenever the project's `pageTopic.hub` file exists for that subject.
- `page-pr` sections are the `page-lead` sections a reviewer judges the design by. The PR body shows them after Public API, in `page-lead` order. A PR shows each section that the playbook of any plan it carries names, and a PR plan without one shows each carried plan's under that plan's title. A title missing from the same playbook's `page-lead` is refused.

When the leading plan names no playbook, every playbook's sections and requirements apply. The playbook, or the skill it names, defines what each section holds.
