---
name: plan-page
description: "Write, check, repair and publish a plan page: a project's plans and subject files under its plans directory, rendered by .agents/pstack/plan-page.mjs and published as one claude.ai page per subject. Use before writing or changing a plan, a subject file in <plans>/topics or its page; when a page looks wrong or refuses to render; to republish a page; or to change the page shape or a playbook's page sections."
metadata:
  source: udecode/dotai
  source-path: skills/plan-page
---

# Plan page

A subject is one thing the work changes, and it has one page. Its file, `<plans>/topics/<slug>.md`, holds the current state. Each plan that continues it is an iteration carrying only its delta. `node .agents/pstack/plan-page.mjs <plan>` renders the page from both. sync-pstack ships that renderer and `status.mjs` into every project it manages.

Read [references/shape.md](references/shape.md) before writing a plan or a subject file. It holds every file shape, the page order and the renderer's refusals.

| Mode | Use it to |
| --- | --- |
| [Render](#render) | publish a page after its plan is written, back from review, revised or built, or after its subject file changes |
| [Check](#check) | audit a plan and its subject before handing the page back |
| [Repair](#repair) | fix a page whose shape is wrong |
| [Change](#change) | change the page shape, the renderer, or a playbook's page sections |

## Render

1. Pick the subject before writing the plan. Continue the subject whose thing the work changes. Start a new one only for a new thing that will be revisited. A one-off plan, such as a single fix or check, has no subject and keeps its own page.
2. Name the subject with `Topic: <slug>` under `Status:`, or through the first entry of the frontmatter list the project names in `pageTopic.field`, so list the scope that owns the change first. A plan whose list-named subject has no file yet keeps its own page until someone creates that file; the renderer refuses a `Topic:` line whose subject has no file until that file exists.
3. When a project playbook in `.agents/playbooks/` writes the plan, name it with `Playbook: <name>` under `Status:`, so its page sections lead and its required sections apply. Otherwise leave the line out; the renderer refuses a name with no playbook file.
4. Run `node .agents/pstack/plan-page.mjs <plan>`. It refuses every shape it can check and names the fix. Fix the plan or the subject file, never the HTML.
5. Publish the printed file with the Artifact tool to the subject's `Page:` URL, or to the one-off plan's own. The first publish writes `Page: <url>` under the subject file's title, or under a one-off plan's `Status:` line. Codex sessions skip publishing, and the lead republishes when the user returns.

## Check

Run `node .agents/pstack/plan-page.mjs <plan> --check`. It runs every refusal and writes nothing. Then read the plan and its subject for what the renderer cannot judge:

- Each `before` fence is a real call site at the commit before the plan, and its `after` fence the same call in the checkout, or the planned call while the plan is unbuilt. Each fence names its path in a comment, with one sentence above the pair.
- While the plan is open, the subject file shows the state before it. That holds for a subject the plan created too.
- Every subject section the plan changes carries a Delta table keyed to the subject's rows. Otherwise the page marks the section unchanged.
- Main changes lists only non-public changes that alter how the code works.
- `Status:` is one short line: the state word, then what the plan waits on. Open items go in their own section, each with its owner and where it is tracked.
- Open questions holds only calls with no safe default. Every other call is a Defaults row.

## Repair

1. Copy each file to scratch before rewriting it.
2. Run [Check](#check) and fix each finding at its source. For an early fold, restore the subject file to its state before the open plan from the plan's `before` fences and `git show <base>:<path>`, and move the delta into the plan.
3. Log one decision-log row for the repair.
4. A ledger record that binds the plan's bytes goes stale on the edit. Rebind it by the project's record rule.
5. Render and republish to the same URL.

## Change

The renderer source is `skills/sync-pstack/assets/pstack/plan-page.mjs` in the dotai checkout, with `status.mjs` beside it. Its tests are the `plan-page` tests in `skills/sync-pstack/scripts/sync-pstack.test.mjs`. A section that only one project's plans write belongs in that project's playbook frontmatter, never in the renderer.

Run sync-pstack's Lesson mode, which owns the gates, the corpus rules and the delivery. This mode adds the renderer's specifics inside its steps:

1. In Lesson step 2, when another session holds uncommitted edits in the dotai checkout, edit in a detached worktree at `origin/main` instead, and rebase onto their commit before the dotai commit.
2. In Lesson step 3, give each new refusal or behavior a test that fails on the old renderer for its named defect.
3. In Lesson step 4, copy each managed project's plans, subject files, hubs, `.agents/pstack.json` and playbooks to scratch twice: one copy as it is for the old renderer, and one with the change's migration applied for the new one. Give a renderer that predates `--check` an adapter that exits before it writes. Run both over every plan, list each newly refused plan with its owner, then render every plan with both and diff the bodies, ignoring the Updated line.
4. Also in Lesson step 4, render one real plan in each mode the renderer branches on: a one-off plan, a subject with an open iteration and a subject with none. Use a scratch copy with its `Status:` flipped when no live subject is in a mode. Publish both versions for the owner to compare.

## Playbook sections

A project playbook in `.agents/playbooks/<name>.md` names the review sections its plans write, as comma lists in its frontmatter beside `extends` and `when`:

```yaml
page-lead: What other editors do, Layer and owner
page-pairs: Document shape
page-require: What other editors do
```

- `page-lead` sections render right after Public API, the leading plan's playbook first.
- `page-pairs` sections hold `before` and `after` pairs, like Public API.
- `page-require` sections must exist in the subject file or its open plan whenever the project's `pageTopic.hub` file exists for that subject.

When the leading plan names no playbook, every playbook's sections and requirements apply. The playbook, or the skill it names, defines what each section holds.
