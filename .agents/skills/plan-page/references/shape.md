# Plan page shape

`<plans>` is the project's plans directory, `docs/plans` by default.

## Subject file

`<plans>/topics/<slug>.md` holds a `# Title`, the `Page: <url>` line, a lead paragraph and the subject's current state:

- `## Public API`: the current call sites as plain fences copied from real call sites in docs, examples or tests, one sentence above each. Leave it out when the subject has no public call.
- `## Main changes`: only the non-public changes that alter how the code works, such as an ownership move, a removed layer or a new runtime path. Leave minor ones out.
- The `page-lead` sections of the project's playbooks, as plain fences and tables.

A subject file never holds a `before` or `after` fence.

## Index

`plan-page.mjs --index` renders every subject's page into `<plans>/artifacts/topics/` and writes `index.html` beside them, a local file that is never published. It lists every subject with its title linked to its local page, or with the renderer's refusal when the page does not render, its lead sentence, the leading iteration's status, its iteration count and its newest iteration date. Subjects that wait on the owner come first, then open ones, then the rest by their newest iteration. When `pageTopic.hub` is set, subjects whose hub exists group as feature topics, and every hub with no subject file lists as a topic with no page yet.

## Plan

- Optional frontmatter, then `# Title`, then `Status:`, `Topic:` and `Playbook:` lines. `Playbook:` names the playbook poteto-mode picked. That is the project playbook that writes the plan, or pstack's when no project playbook does, such as `feature`, `bug-fix` or `figure-it-out`. A PR plan, which the skill's PR mode writes for a PR that carries several plans, adds a `Plans:` line that lists them by path relative to it, separated by commas.
- `Status:` starts with a state word from `.agents/pstack/status.mjs`, such as `planning`, `building`, `blocked`, `reopened` or `executed`, then says what the plan waits on. The page header shows this sentence, so an ask that is not a decision, such as a commit the owner makes, goes here: `waiting on your answer, then your commit`.
- `## Brief`: two `###` questions in this order, each answered in at most 40 words: What will change? What could go wrong? The page labels them Changes and Risks. Changes says what the owner gets in at most two sentences, with a short reason when the change needs one. An iteration that a gate opened, not the owner, names in Changes the owner's request it serves and the finding that opened it. Risks says what could hurt the owner. Decisions go in Open questions, and other asks go in `Status:`. An open plan that leads its page needs one.
- `## Demo`: written once the work does something the owner can try. Numbered steps in the order the owner would try them; each says where to go, what to do and what they should see, in plain words with the exact URL, command or fixture to open. When the step's screen changed, the step ends with its verified frames as `![before](path)` and `![after](path)`, paths relative to the plan file; a new screen has only an after frame. A frame may instead be an `https` link to one already uploaded, such as a video in a PR. The page shows Demo where the page orders below place it and inlines each local image. A frame missing on the rendering machine shows its path instead, and a linked frame shows its link. The renderer refuses a Demo with no numbered step.
- `## Teach`: the thing the plan changes, explained for someone new to it, written with `pstack:teach`'s method from what the run's `how` and `why` work found. Write at most three short paragraphs with no headers: what the thing is, how it works today, then what changes and why. When the change moves parts around, add one before and after picture, with `![before](path) ![after](path)` on a line of its own and paths relative to the plan file. The page shows both images in that section, and the renderer refuses a picture inside a sentence. The page shows Teach as How it works, where the page orders below place it. An open plan that leads its page writes one; the renderer does not refuse a plan without it, and refuses an open plan whose Teach runs past three paragraphs or 160 words.
  When the user's ask quotes a stakeholder's script, such as a demo outline, `## Demo` copies its beats in order and marks each one covered, deferred with its owner, or out of scope. A failure on a covered beat never closes as outside the change.
- A plan that continues a subject carries only its delta, under the subject's section titles:
  - `## Public API`: one ```` ```ts before ```` and ```` ```ts after ```` pair per call it changes. A deleted call has an empty after fence, and a new call an empty before fence.
  - `## Main changes`: its own changes.
  - Any other subject section: a table whose first column is `Delta`. Each row is `added`, `changed` or `removed`, and its next cell keys it to the subject's row in a table with the same columns. New prose or tables go beside it.
- A one-off plan carries its own `## Public API` pairs and `## Main changes`.
- `## Defaults`: a table whose columns start with `Decision | Pick | Alternative | Word`, one row per call made for the owner, in plain words. The word reverses the pick. A pick the lead rates `look` or `answer`, as the Autopilot rule defines them, ends its Pick cell with (look) or (answer) in plain text, so the project's Plan pages rule can publish the page for it mid-run. A row that covers a set gives a reason true of each member, and when the owner's own words name an option, the pick or the alternative is that option in those words. Write each cell in a few plain words. The decision is a short noun phrase, and the pick and the alternative say what the owner gets, never the mechanism behind it. Add a fifth column, `Impact`, holding `big`, `small` or `detail`: big when the pick changes what the owner gets or what it costs, small when it changes a smaller behavior, and detail for something few would notice, which includes a call about how the run proceeds, such as building now or where to push. The page groups the rows under Big calls, Small calls and Details and shows each decision with its pick in bold below it, then each alternative, separated by semicolons in its cell, marked `(alt)`, the first with the word that gets it. The renderer refuses any other impact. Leave the section out when no call was made.
- `## Open questions`: one `### <short header>` per decision, unique on the page, written as a decision memo the owner answers in seconds without reading anything else on the page. Write it for the owner, not for another agent. Use plain everyday words and one thought per sentence, and name what the owner sees happen. Leave out file paths, commands, commit hashes and internal tool names; that evidence goes in the decision log. Every part runs at most 15 words, an option's label at most 3, and a memo holds at most 2 facts. The renderer refuses an open plan's question that skips a part or runs past a budget:
  1. The decision in one line that ends in `?`.
  2. `Why it needs you:` and one sentence on why no safe default exists, naming the Autopilot stop it falls under: a production deploy or release, a push to `main`, a force-push to a shared branch, a message to anyone outside the team, deleting data the run did not create, or a standing stop that the project's own rules name outside the block. Any other call is a `## Defaults` row.
  3. One or two facts the owner needs to decide, as plain bullets.
  4. `Pick any.` on its own line when the owner can choose several options; leave it out for a pick-one question.
  5. Two or more options, each as `- **<label>** (recommended): <what happens> Cost: <what it costs or risks>`. Only a `Pick any.` question marks more than one option recommended. The label is a plain phrase the owner recognizes, never a code word to type back. What happens names only what the option authorizes now; an irreversible or outward step after it, such as a later delete, comes back as its own question.
  6. `Why I pick it:` and one sentence, when an option is recommended. A question with no clear recommendation marks none and leaves this line out.
  7. `Attention:` and one word, when an option is recommended: `safe` when the pick is easy to undo and you are sure, `look` when it is costly, hard to undo or you are unsure, and `answer` when it cannot be taken back, such as a delete or a message to customers. Attention rates the recommended option, not the question, so a delete question whose pick keeps the data is `look` or `safe`.
  8. `If you say go:` only when no option is recommended; it says that go leaves the question open. A question with no pick always counts as `answer`.

  ```md
  ### Workflow guides

  Where should the two workflow guides live?

  Why it needs you: Another account owns both pages, and teammates read them.

  - plate-2 already keeps its guide in the repo.

  - **In the repo** (recommended): Both projects link to a guide file in the repo. Cost: The old pages stay up until you delete them.
  - **New pages**: I publish both guides again under this account. Cost: Two more pages to update by hand.

  Why I pick it: A repo file gets reviewed, and every teammate can read it.

  Attention: safe
  ```
- `## On top of the PR`: written only for a comment on someone else's PR. It has three list items, Kept, Changed and Dropped, each with sub-items naming what your commits keep, change or drop from the author's version.
- `## Close`: written at every stop that hands work back after work ran, such as a build, fix or review close. It holds what landed, the proof and its limits, the counts the block's Todo list and close rule requires, reversals and deviations first, open work with owners and stops and, after a decision-trail review, its Attention section. Build the proof part from each decision-log row's own `scope:`, never from one sentence that covers every fix. A pstack playbook's Reply line lists what else it holds.
- On a page without a brief, Scope, Steps, Evidence, Proof, Claims, Asks, Verification, Notes and Panel gate render under Details, and a one-off plan shows its other sections. A page with a brief leaves them in the plan file.

## Lifecycle

- A plan is open until its `Status:` starts with a `done` word from `status.mjs`, such as executed, done, superseded or cancelled.
- While a plan is open, the subject file keeps the state before it, and the plan file holds the delta.
- When execution ends, and before `Status:` says executed, write the plan's `## Close` and fold the delta into the subject file. Replace or join the call sites with each after fence. Add, replace or delete each marked row, dropping its Delta cell. Move the rest into its section, and move the plan's open work into the subject file's `## Open work`, each item with its owner and its stop. Then render with `--folded`, and flip `Status:` in the same edit, because a plain render refuses the folded subject while the plan is still open.
- A plan reopened after its fold starts its `Status:` with `reopened`.
- The plan passed to `plan-page.mjs` leads its subject's page, because a hand-back is for that plan, and the header names it. Needs you still lists the open questions of every other iteration, each under its own plan's name, and on a page with a brief also each other open iteration's `Status:` sentence, which may hold an ask that is not a decision. Without a brief, a page led by an executed iteration shows the subject's current state and lists the iterations as history.
- `--index` renders each subject led by its newest open iteration, or by its newest iteration when none is open. A name without a date counts as the oldest, and iterations from one date order by their decision log's latest row, then by name. History lists the iterations in that order.

## Page order

Every page opens with a header: the title, the flow rail, the `Status:` sentence, and the model and effort of each lead session from the log's `lead` rows, each followed by the panel seats that session ran, with their efforts and `×N` for the rounds each sat. A plan whose `Plans:` line lists the plans it carries names them in the header, and its rail and seats add theirs. A stage ran when any of the plans ran it, review rounds add up and Build counts every plan's steps. On a subject page, a review round on an iteration that does not lead keeps its own tag. The rail shows the stages Plan, Design, Plan review, Build, Writing, Code review, Verify, Audit, Ship and Reflect. Hovering a stage shows the pstack step behind it, and once Plan, Design, a review stage, Writing or Audit ran, small badges name the pstack skills behind it. A stage that ran is a filled green badge, a skipped one is dashed grey and the rest are outlined blue. The current stage is the stage of the log's newest Design, Plan review, Build, Writing, Code review, Verify or Ship row; Audit and Reflect rows, stageless rows and a `writing` row before the first `build` row, which cleans the plan's prose, never move it. With no such row it is Build once a step is checked, and Plan otherwise. A stage that has not run is skipped before the current stage and outlined after it. The current stage is an amber ring while work goes on, a filled orange badge when the `Status:` waits on the owner, and a filled red badge when it is held. A plan that ended without landing, such as a superseded one, adds its word in grey after its last stage and shows every stage it never ran as skipped. Plan names the playbook from the `Playbook:` line and, for a project playbook, the pstack playbooks it extends. Design and Writing name the tools that ran, the review stages name `interrogate` and count their rounds, Audit names `show-me-your-work`, and Build counts its checked steps. Build, Verify, Ship and Reflect carry no badge. Phases outside this table never move the rail, so log each stage's rows under its phase:

| Stage | Ran when |
| --- | --- |
| Plan | always |
| Design | the log has an `architect`, `prototype`, `arena`, `how`, `why` or `design` row |
| Plan review | the log has a `panel` or `interrogate` row before the first `build` row; each `seats` row is a round |
| Build | the log has a `build` row, or Steps has a checked box |
| Writing | the log has a `writing` row; the stage names the `deslop`, `no-comments` and `unslop` passes those rows mention |
| Code review | the log has a `panel` or `interrogate` row after the first `build` row |
| Verify | the log has a `verify` or `proof` row |
| Audit | the log has a `trail` row, or a hand-off reviewer's row whose phase starts with `review`; each distinct `review` phase is a round. This is the decision-trail review: another model family checks each logged claim against the conversation |
| Ship | the log has a `ship` or `delivery` row, or `Status:` starts with a word for landed work, such as executed or done |
| Reflect | the log has a `reflect` or `lesson` row |

When the leading plan has a brief, the page shows what a reviewer needs to judge the plan, with nothing folded, and leaves the internals in the files:

1. The header.
2. The runs strip.
3. The brief in one card.
4. How it works, from Teach.
5. On top of the PR.
6. Demo.
7. Needs you.
8. Picked for you, from Defaults, each decision with its pick and alternatives under Big calls, Small calls and Details.
9. Public API, from the leading plan.
10. The `page-lead` sections in their playbook order, each from the leading plan, or from the subject and marked current when the plan has none.
11. Main changes.
12. The leading plan's other sections, apart from Open work.
13. Verification, once the plan is done.
14. Open work.
15. One line that names the plan, its subject and each plan on its `Plans:` line, whose files keep the internals: Close, Scope, Steps, Evidence, Proof, Claims, Asks, Notes, Panel gate, Verification while work runs, iterations and the review rounds.

Write every sentence the page shows in the `pstack:bro` voice. Say it the way one person talks to another, plainly, briefly and with no jargon. Use short sentences, the active voice and common words. The brief, Teach, Needs you and Defaults also leave out code, file paths and commit hashes, apart from a Teach picture's path, and the renderer refuses an open plan whose brief, Teach, Open questions or Defaults holds code, inline or in a fenced block. Sections for engineers, such as Public API and Main changes, keep their code and tables, and the sentences around them use the same voice. After a build, the Changes and Risks answers also tell the owner what the Close holds: what landed, where the proof stops, any reversal and the warnings of a decision-trail review.

Needs you collects the Open questions of every iteration, and another iteration's question names its plan. Each question's number takes its attention color: red for answer, amber for look and green for safe. Questions run red first, then amber, then green, with the leading plan's first within each color; the head counts each color, and the frame takes the most urgent one. Under the questions, each other iteration's lines without a `###` heading, and on a page with a brief each other open iteration's `Status:` sentence, follow under its plan's name, with no color and no count. Each option is a row with its label, what happens and its cost, under one Then and Cost header. Your pick starts checked, as a radio or, for a `Pick any.` question, a checkbox, and its reason sits under it. A bar at the bottom says go while every pick stands; when the owner changes a pick or answers a question with no pick, it shows a reply to copy, such as go, except Last fixes: Review first. In Needs you and the header, only badges, such as the question numbers and a finished rail stage, have a background; everything else uses text color and borders. An executed plan's older question renders with the parts it has.

Without a brief, the page shows the whole record, with every section open:

1. The runs strip, under the header.
2. Demo, from the leading plan.
3. Needs you.
4. Close, from the leading iteration's or the one-off plan's `## Close`.
5. How it works, from the leading plan's Teach.
6. The leading plan's lead paragraph.
7. Public API, then the `page-lead` sections, then Main changes.
8. Picked for you, from Defaults, each decision with its pick and alternatives under Big calls, Small calls and Details.
9. The subject's lead paragraph and other sections.
10. History, newest first.
11. Details.
12. Review history, from the decision log's `panel` and `review` rows.

## Runs

A published subject page is a set of files. The page file lists the runs that published to it; each run keeps a header with its stage and a body with its render in its own files, and each picture a body shows is a file of its own. A publish sends only the page file and its own run's files, and the platform keeps the rest. The page file also lists every run with its anchor, so a view without scripts still names them. A local copy, a Codex copy and `--pr` and `--comment` output show only this checkout's plan.

- The runs strip under the header shows one line per run from its header: the stage, the checked steps, whether it waits on the owner or is blocked, since when and when it last published. Waiting and blocked runs come first, and each line links its run.
- The page leads with the plan of the newest hand-back, by the number each hand-back takes on the list, and shows that plan's bodies newest first. Two runs of one plan both show their bodies. Other plans' bodies load when their section opens or the link names them. A done run whose last publish is more than three days old shows folded.
- `#run-<plan slug>` lands on the plan's section, and `#run~<plan slug>~<session id>` on one run. Each body's Needs you holds only its own plan's questions, and a half-typed answer stays in the viewer's browser until the owner sends it.

## PR body

`plan-page.mjs <plan> --pr` writes the page of the plan it is given as GitHub Markdown between `<!-- plan-page:start -->` and `<!-- plan-page:end -->`, in the page order for a plan with a brief, which the renderer walks for both outputs:

1. One list item per lead session, its model and effort in one code span. The first lead's line also names the plans' playbooks in code spans and which of design, plan review, code review, verify and audit did not run, because the rest of the rail is the same for every PR. Under each lead, each panel seat it ran, with its model and effort in code spans, `missing` when the seat did not answer and `×N` for the rounds it sat.
2. Changes as the opening paragraph, with no label, and Risks in a `[!CAUTION]` alert, whose title already says what it holds.
3. How it works, then On top of the PR, then Demo, with each step's frames after it. A plan with no Demo shows its first three Main changes items as What changed instead.
4. The open questions as Open questions, and the big Defaults calls as Decisions, each pick in bold over its alternatives marked `(alt)`.
5. Public API, with each before and after pair as one `diff` fence.
6. Each section on the `page-pr` line of a playbook that one of its plans names, in `page-lead` order, a paired one as one `diff` fence per pair. A PR plan without that section shows each carried plan's under a `###` heading with its title. Then the plan's `## Verification`, then its `## Open work` as Out of scope, each item cut to its first sentence, without its owner, stop or run-directory paths. Other `page-lead` sections, Main changes and the plan's other sections stay in the plan, because they are engineer detail.
7. A Plans list that links the plan at the current commit and each plan on its `Plans:` line, one item each. The body shows no `Status:` line, because the PR shows its own state.

A local frame becomes a `![label](./path)` reference from the repository root, under a `<!-- frame: ./path -->` note, and goes up through `gh --attach`. A later render with `--into` reuses the uploaded link found under that note. The sections the page leaves in the plan file, such as Close, Steps and Evidence, stay there.

`plan-page.mjs <plan> --comment <sha>` writes the same body as a comment about the commits after `<sha>`, into `<name>.comment.md`. Under the lead lines it links DiffsHub's compare view from `<sha>` to the checkout's head. With `--against <description.md>`, it leaves out each Demo clip the description already shows, and each step whose clips all are.

## Refusals

`plan-page.mjs` exits 1 and names the fix when any of these holds. The rules on pairs, playbook names, Delta cells and keys, early folds and Defaults apply to every open iteration whichever plan is passed, and to a one-off plan. `page-require` follows the leading plan. The `Topic:` and `--folded` rules check the plan passed. The renderer does not recheck an executed iteration, and an executed leader whose playbook was renamed takes every playbook's sections, so renaming a playbook never refuses an old plan's page.

- A paired section has no pair, or a `before` fence not followed directly by its `after` fence.
- A subject file keeps a pair in a paired section.
- A Delta cell is not `added`, `changed` or `removed`; an added row's key is already in the subject with other cells; or a changed row's key is not in the subject. This holds for a Delta table in any section.
- An open plan's `## Brief`, `## Open questions` or `## Defaults` holds code in backticks, because the page shows those sections.
- A subject iteration's `Status:` starts with no state word.
- A `Topic:` line names a subject with no file.
- An iteration names a playbook that neither `.agents/playbooks/` nor pstack has.
- A playbook's `page-pr` line names a section its `page-lead` line does not.
- `--comment` names a commit the checkout lacks, or one its HEAD does not contain, because the compare link would not open.
- `.agents/pstack.json` still sets `pageLead`, `pagePairs` or `pageTopic.require`. sync-pstack's `apply` drops them in the write that installs the renderer once a playbook carries each title, and refuses until then.
- A subject whose hub exists lacks a required section in its file, and in the plan that leads its page when that plan has a brief. The leading plan's playbook sets the required sections, or every playbook does when that plan names none.
- An open iteration's subject already shows one of its added or changed rows, or no longer has a row it removes, in any section with a Delta table. It also refuses when the subject shows a pair's after fence line for line, indentation and punctuation included, and does not show its before fence. The check skips a pair that deletes a call or changes nothing, a pair whose changed lines another iteration's fences all hold, and any row another iteration also marks. It exempts a plan whose `Status:` starts with `reopened`, and the plan a `--folded` render folds.
- An open iteration's Defaults has no Decision, Pick, Alternative and Word table.
- An open plan that leads its page, with a state word in its `Status:`, has no `## Brief`.
- An open iteration's brief skips, adds or reorders a question, leaves an answer empty, or answers in more than 40 words. When a brief asks a question that older briefs asked, the refusal names each one to drop.
- `--folded` names a plan with no `## Close` or no subject file, or the subject file lacks the plan's Delta rows or after lines, still shows its before lines, or does not show an after fence as one block in order, skipping any row or line another iteration also changes.

- `--pr` or `--comment` names a plan with no `## Brief`, whatever its state, a title or brief that names a PR number, a Changes answer that still says "will", or a `Plans:` line that lists a plan that does not exist. It also runs the brief, Teach and plain-section checks that otherwise apply only to an open plan.

`--check` runs every refusal and writes nothing.
