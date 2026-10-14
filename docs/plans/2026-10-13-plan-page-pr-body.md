# PR bodies are plan pages

Status: waiting: built and tested in dotai, uncommitted until you say push
Topic: plan-page
Playbook: authoring-a-skill

PRs still used a hand-written body while the owner reads plan pages. The owner asked for the page in the PR. The renderer writes it for GitHub, rerun on the whole PR: one plan that covers the PR is reused, and a PR with several plans gets a PR plan that lists them. The rail is one line with skills in code and skipped stages struck through, and each lead lists the review seats it ran with their round counts. The whole writing pipeline runs, with `pstack:bro` last. Babysit then checks whether a PR's run used the configured models and efforts, and runs `redo` first when it did not. Per the owner, nothing is pushed yet.

## Brief

### What will change?

A PR description now comes from its plan's page, with what other editors do and what breaks. On someone else's PR, one comment covers only your commits. Babysit first redoes any work that missed our models or efforts.

### What could go wrong?

Nothing is pushed, so no project uses it yet. Screenshot upload and the model check are untried on a real PR, and reviews were skipped for speed. About 250 old pages look different at the top.

## Teach

A plan page is the web page the owner reads for a piece of work. A script builds it from the plan's Markdown file.

PRs had their own hand-written description, so the same facts got written twice and drifted. A PR with several plans had no single page at all.

Now the same script also writes the PR description from the plan. A PR with one plan uses it. A PR with several gets a PR plan that names them, so its models and checks add up across all of them. Both use one list of sections, so their order always matches. Plate's plan playbook picks which design sections also go in the PR: what other editors do, the document shape and what breaks. On a PR someone else opened, their description stays theirs, and one comment from you covers only your commits, with a link to exactly that diff.

## Demo

1. Open `docs/plans/artifacts/pr-body-draft/5165.md`, the PR 5165 description rendered from that PR's whole-PR plan. It opens with the lead model and the review seats it ran, then Changes and Risks. After Public API come What other editors do and Document shape.
2. Run `node /Users/zbeyens/git/dotai/skills/sync-pstack/assets/pstack/plan-page.mjs docs/plans/artifacts/pr-body-draft/5165/2026-10-13-pr-5165-redo.md --pr` from this checkout. It prints the path of the description it wrote, and nothing else because that plan has no local frames.
3. Open https://claude.ai/artifact/CMdkFpYSbuGYDVym3hop7b and switch between the four plan kinds. Each shows the old page beside the new one, with a line on what changed.
4. Open `docs/plans/artifacts/pr-body-draft/5165-comment.md`, the comment you approved for PR 5165. It opens with the models and a link to the commits after the author's, then lists what it kept, changed and dropped from his version, and leaves out his clips.
5. Run `node /Users/zbeyens/git/dotai/skills/sync-pstack/assets/pstack/levels.mjs docs/plans/2026-10-13-plan-page-pr-body.decisions.tsv docs/plans/2026-10-02-codex-panel-seats.decisions.tsv` from this checkout in a Claude Code session. It marks this run's `@high` stretch `below`, and in the older log the panel rounds that ran Astra at `@high` and left out an Opus seat.

## Public API

The renderer gains a mode that writes the PR description, one that merges it into a description the PR already has, and one that writes a comment about your commits on someone else's PR.

```sh before
# skills/plan-page/SKILL.md
node .agents/pstack/plan-page.mjs <plan>
node .agents/pstack/plan-page.mjs <plan> --folded
node .agents/pstack/plan-page.mjs <plan> --check
node .agents/pstack/plan-page.mjs --index
```

```sh after
# skills/plan-page/SKILL.md
node .agents/pstack/plan-page.mjs <plan>
node .agents/pstack/plan-page.mjs <plan> --folded
node .agents/pstack/plan-page.mjs <plan> --check
node .agents/pstack/plan-page.mjs <plan> --pr [--into <body.md>]
node .agents/pstack/plan-page.mjs <plan> --comment <author sha> [--into <comment.md>] [--against <description.md>]
node .agents/pstack/plan-page.mjs --index
```

A playbook names which of its design sections the PR shows. Plate's plan playbook adds one line.

```yaml before
# .agents/playbooks/plan.md
page-pairs: Document shape
page-require: What other editors do
```

```yaml after
# .agents/playbooks/plan.md
page-pairs: Document shape
page-require: What other editors do
page-pr: What other editors do, Document shape, Hard cuts and app migration
```

Redo read only the session's level and judged the log by hand. Babysit's levels check and redo now read a plan's decision log through one helper.

```sh before
# skills/redo/SKILL.md
node .agents/pstack/lead.mjs
```

```sh after
# skills/redo/SKILL.md
node .agents/pstack/levels.mjs [--lead '<model> @<effort>'] [--seats '<seat list>'] <decision log>...
```

A PR plan lists the plans it carries.

```md before
<!-- docs/plans/2026-10-13-pr-5165-redo.md -->
Status: building: plan panel capped at round 3; build next
Playbook: babysit
```

```md after
<!-- docs/plans/artifacts/pr-body-draft/5165/2026-10-13-pr-5165-redo.md -->
Status: building: plan panel capped at round 3; build next
Playbook: babysit
Plans: 2026-10-13-details-heading.md, 2026-10-13-details-undo-identity.md
```

## Main changes

- `plan-page.mjs --pr` writes the PR body as GitHub Markdown between `plan-page` markers into `<plans>/artifacts/<name>.pr.md`. It opens with one line per lead model with the playbooks and the checks that did not run, and the review seats under it with `×N` rounds, then Changes as a plain paragraph and Risks in a `[!CAUTION]` alert. Then How it works, Demo with its clips or, without a Demo, What changed from the first Main changes items, Open questions, Decisions from the big Defaults calls, Public API and paired sections as `diff` fences, Verification, Out of scope from the first sentence of each Open work item, and a Plans list. It refuses a plan without a brief, a PR number in the title or brief, and a Changes answer that still says will.
- A `Plans:` line on a PR plan pulls in each listed plan's checked steps, stages, skills, leads and panel seats. A missing listed plan is refused, and so is a plan titled with a PR number, which says nothing inside that PR.
- Local frames print as `--attach` lines for `gh`, under a `<!-- frame: path -->` note. `--into <body.md>` replaces only the marked region, keeps the rest of the body and reuses frames already uploaded.
- The page links a frame given as an `https` URL instead of calling it missing. Seat parsing moved into one `seatList` that the page and the PR body share.
- `BRIEF_ORDER` is the one section order that a page with a brief and the PR body both walk; each output renders a part its own way or leaves it out. A page with a brief shows Verification once the plan is done, and Open work moves to the end, before the line that names the plan files.
- The page header lists each lead with the seats it ran and their `×N` rounds, through `leadSeats`, which the PR body's model list also reads. It replaces the latest-round tag, which stays only for a round on a subject iteration that does not lead. A `Plans:` line names its carried plans in the header, and `mergedFlow` adds their stages, rounds and steps to the rail, the PR body's process line and `--rail`'s JSON.
- A seat's name is the first word left once a label before a colon and notes in parentheses go, so free-text seat rows from older logs group under their model.
- A playbook's `page-pr` line names the `page-lead` sections the PR body shows, after Public API in `page-lead` order, paired ones as `diff` fences. It replaces the rule that showed every paired section. The PR shows each section that the playbook of any plan it carries names, so a PR plan written by `babysit` still shows what its plans' `plan` playbook names, and a PR plan without a section shows each carried plan's under that plan's title. A title missing from the same playbook's `page-lead` is refused. The skill's PR step says to drop local run-folder paths from those sections.
- `--comment <sha>` writes the same body as `<name>.comment.md`, a comment about the commits after `<sha>`. It links GitHub's compare view from `<sha>` to the checkout's head under the lead lines, and refuses a sha the checkout lacks or its HEAD does not contain. With `--against <description.md>`, it leaves out each Demo clip the description shows and each step whose clips all are. A new `## On top of the PR` section lists what the commits keep, change and drop from the author's version; the page and both outputs show it after How it works. A section left with only blank lines is no longer printed.
- A plan that the linked commit does not hold, such as an uncommitted one, is named by path in the Plans list instead of linked to a 404.
- `levels.mjs` reads decision logs. It marks each lead stretch `below` when Codex led it or it ran below the current session's model and effort, and each panel, architect or arena round `below` when a seat is missing or ran below the models sheet. A backticked `<seat> @<effort>` in a project rule outside the pstack block raises that seat's target, which is how Plate's Astra `@xhigh` applies. A stretch with no `lead` row and a seat with no effort count as below. sync-pstack installs it with the plans helpers.
- A new block rule, Babysit levels, runs `levels.mjs` before Babysit's first step on a PR, unless the run only reviews it. When a unit is `below`, or an agent made a PR that links no log, the `redo` skill runs first and ends in Babysit. `redo` now reads its levels through `levels.mjs`, goes on to Babysit for a PR even when nothing needs redoing, and runs that Babysit without the check.
- The `plan-page` skill gains a PR mode, `shape.md` gains the PR body order, the `Plans:` line and linked frames, and the block's Commit and PR text rule now points at the PR mode instead of pstack's Opening a PR sections.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A PR with several plans | One PR plan that covers the whole PR and lists the others | Stitch the plans' pages together | stitch pages | big |
| Push | Held: the dotai edits stay uncommitted, with a patch saved | Commit and push dotai, then sync plate-2 and Ellie | push it | big |
| Reviews and smoke trials | Skipped under fast | A panel on the diff and smoke trials before the push | full | big |
| A plan's engineer sections in the PR | Left in the plan, linked from the Plans list | Folded into collapsed blocks | fold them | small |
| The rail in the PR | Only the playbooks and the checks that did not run, on the lead line | The whole rail on one line | full rail | small |
| Where frames sit | Under their Demo step, uploaded on the first sync and reused later | Uploaded again on every sync | upload again | small |
| Model list shape | Each lead, with the seats it ran and their round counts under it | The latest round only, under its own heading | latest round | detail |
| Section names in the PR | Decisions, Out of scope and Open questions, written for a reviewer | Picked for you, Follow-ups and Needs you, as on the page | page names | small |
| Picked for you on the page | Each pick in bold over its alternatives marked (alt) | One sentence per call | one line | detail |
| Brief colors | A purple note for Changes and a red caution for Risks | Plain quotes | plain brief | detail |
| Where the 5165 draft came from | A copy of the whole-PR plan another session wrote, plus a plans line | A new PR plan written here | new plan | detail |
| The page link | A new page at https://claude.ai/artifact/QLPuWXTpAuCKDdhm6jX34Z, because the old one no longer opens for this account | Go back to https://claude.ai/artifact/NRgfJHG3SH8PULHUqGy3fn | old page | detail |
| Verification on the page | Shown once the plan is done | Kept in the plan file only, as before | hide verification | small |
| Where Open work goes | At the end of the page | Mixed in with the plan's other sections, as before | open work inline | small |
| Reviewer names from old logs | Just the model name, without the notes around it | Shown as written, so one model can appear several times | seats as written | small |
| Comparing old and new pages | One page with both versions side by side | A separate page for each version | separate pages | detail |
| Design sections in a Plate PR | What other editors do, the document shape and what breaks | Also who owns each layer and which test covers each behavior | all sections | small |
| Whose playbook picks them | Every playbook among the PR's plans | Only the PR plan's own playbook, which drops them when babysit writes it | own playbook | detail |
| Local run paths in those sections | Rewritten for the reviewer at PR time | Stripped by the renderer | strip paths | detail |
| Updating your comment | Edited in place while it is your last comment, then a new one | A new comment after every push | comment per push | small |
| Clips the description already shows | Left out of your comment | Shown again | repeat clips | detail |
| Where the model check lives | In the shared rules, so plate-2 and Ellie both get it | Only in Plate's babysit steps | plate only | small |
| What counts as good enough for the main agent | Whatever the babysitting session runs, and work Codex led counts as short of Claude Code | One fixed level written in the models sheet | fixed lead | small |
| Where Plate's Astra at xhigh comes from | The Plate rule that already says it | A new setting in the project's pstack config | seats config | detail |
| An agent's PR with no record of its models | Redone, since we can't tell what it ran on | Babysat as is | plain babysit | small |
| Reviews for this change | Skipped, since you asked for fast | A review of the diff and test runs before the push | full | big |

## Steps

- [x] Add the PR mode to the renderer, with tests that fail on the old renderer. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/old-renderer-fails-a1.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/new-renderer-pr-tests-a1.log`.
- [x] Render every plate-2 and Ellie plan with the old and new renderer and diff the pages. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/corpus-a2.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/corpus-a2.tsv`.
- [x] Update the skill, its shape reference and the block rule. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/apply-dry-plate-2-a2.log`.
- [x] Render the PR 5165 draft from the renderer. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/pr-body-unchanged-a1.log`.
- [x] Share one section order between the page and the PR body, and show each lead's seats with their rounds, carried plans and Verification on the page, with tests that fail on the old renderer. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/old-renderer-page-fails-a3.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/new-renderer-page-tests-a3.log`.
- [x] Render every plate-2 and Ellie plan with the pre-run and new renderer, and classify each changed page. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/corpus-a4.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/classify-a1.log`.
- [x] Publish old and new renders of each plan kind side by side. Done: https://claude.ai/artifact/CMdkFpYSbuGYDVym3hop7b.
- [x] Let a playbook name the design sections the PR shows, with a test that fails on the renderer before it. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/sync-renderer-page-pr-fails-a2.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/new-renderer-page-pr-a2.log`.
- [x] Render every plan's page and every Plate architecture plan's PR body with the renderer before and after that change. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/corpus-a5.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/pr-corpus-a1.log`.
- [x] Save the dotai diff while the push is held. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/dotai.patch`.
- [x] Add the comment mode for someone else's PR and link only committed plans, with tests that fail on the renderer before them. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/sync-renderer-comment-fails-a1.log`, `docs/plans/artifacts/2026-10-13-plan-page-pr-body/sync-renderer-plan-links-fail-a1.log`, `docs/plans/artifacts/2026-10-13-plan-page-pr-body/comment-5165-head-a1.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/comment-wrong-checkout-a1.log`.
- [x] Once the owner approved the shape, update the five `--pr` tests and four page tests to it, then run the dotai suite, skill validation and the page corpus. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/sync-pstack-tests-a1.log`, `docs/plans/artifacts/2026-10-13-plan-page-pr-body/dotai-tests-a9.log`, `docs/plans/artifacts/2026-10-13-plan-page-pr-body/validate-skills-a8.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/corpus-a6.log`.
- [x] Make Babysit check a PR's levels first and run `redo` when any unit ran below target, with a `levels.mjs` helper, its tests and a run on real logs. Done: `docs/plans/artifacts/2026-10-13-plan-page-pr-body/dotai-tests-a11-a1.log`, `docs/plans/artifacts/2026-10-13-plan-page-pr-body/validate-skills-a10-a1.log` and `docs/plans/artifacts/2026-10-13-plan-page-pr-body/levels-real-logs-a1-a1.log`.

## Close

Deviation first: the dotai suite and skill validation first ran before the owner's rounds on the PR body shape, so they ran again once the owner approved it. Five `--pr` tests and four page tests had expected the earlier header, picks and body, and now assert the approved shape.

What landed: the PR body and PR comment modes in dotai's `plan-page` skill and renderer, one section order that the page and both outputs share, and Babysit's levels check with its `levels.mjs` helper and the `redo` changes, uncommitted, with the diff saved as `docs/plans/artifacts/2026-10-13-plan-page-pr-body/dotai.patch`. Nothing is committed, pushed or synced, so plate-2 and Ellie still run the old renderer and rule.

Proof: the dotai suite passes 227 of 227, the sync-pstack tests 179 of 179, and skill validation passes, all on the approved shape. `levels.mjs` run on three real logs marks this run's `@high` stretch, a log with no lead row and two rounds with Astra at `@high` as `below`, and finds the 5165 redo log at target. Each new behavior's test fails on the renderer before it and passes after it. The 5165 comment renders from a checkout at the PR's head with none of the author's six clips, and from a checkout that lacks that head it refuses. Rendering all 2,251 plans with the renderer from before the design sections and the comment mode changes no page. The 5165 PR body rendered byte-identical after the shared-order refactor, and now adds What other editors do and Document shape, at 9,457 bytes. Adding the design sections changes no page among the 2,247 plans. Of the Plate architecture plans with a design section, 23 render a PR body; each grows by at most 8,449 characters, and the largest is 21,711, under GitHub's 65,536-character limit. The other 23 are refused by their brief by both renderers alike. Rendering all 2,247 plate-2 and Ellie plans with the pre-run and new renderer changes no plan's exit: 2,154 render and 93 are refused by both. 252 pages change, and each change falls in an intended region: 242 in Picked for you, 153 in the header's lead and seat tags, 30 in where Open work sits, 3 gain Verification and 6 only in whitespace, with review-history seat names on one subject page. Pages whose header shows a seat that is not a model drop from 20 to 1.

Limits: no real PR was edited, so the frame upload through `gh --attach` and its reference rewrite are read from `gh` 2.102.0's help, not run. No plan in either project has a linked frame or a `Plans:` line, so the corpus never exercised those paths; the tests and the 5165 copy do. One page still shows `session`, `B` and `C` as seats, because its log wrote them as plain words. Under fast, no panel, smoke trial or decision-trail review ran, and `no-comments` was skipped. Plate's plan playbook gains a `page-pr` line, which every teammate and runtime gets on the next pull; it changes only PR bodies rendered with `--pr` or `--comment`. No comment was posted, and the 5165 comment waits for the redo's push. The levels check is a broad change to how Babysit picks its method, and its paired baseline-versus-revised trial has not run, so it is pending, not passed. It has not run inside a real Babysit either. Counts: 13 steps, 13 done, 0 open.

## Open work

- Commit and push the dotai patch, sync plate-2 and Ellie from it, and refresh the installed `plan-page` skill. owner: zbeyens. stop: the owner says push, or drops the change.
- Before the push, run the paired trial for the levels check, a fresh Babysit of PR 5165 with and without the rule, and `sync-pstack smoke` with a plain babysit request. owner: zbeyens. stop: the owner says push or full, or drops the check.
- The first real PR body sync checks that `gh --attach` rewrites the `./path` frame references this renderer writes. owner: zbeyens. stop: the first PR body rendered with `--pr` that has a local frame.
- Post the PR 5165 comment once the Details editing session pushes the redo's commits, rendered with `--comment 9f0717429c` from a checkout at the pushed head. owner: zbeyens. stop: the redo's push to that PR's branch, or the owner drops the comment.
- `decisions-check.mjs append` refuses a seats row whose seat is not one model word with its effort, so new logs cannot put labels or notes in the header. owner: zbeyens. stop: the owner says push, or drops it.
