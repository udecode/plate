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

- Optional frontmatter, then `# Title`, then `Status:`, `Topic:` and `Playbook:` lines. `Playbook:` names the playbook poteto-mode picked. That is the project playbook that writes the plan, or pstack's when no project playbook does, such as `feature`, `bug-fix` or `figure-it-out`.
- `Status:` starts with a state word from `.agents/pstack/status.mjs`, such as `planning`, `building`, `blocked`, `reopened` or `executed`, then says what the plan waits on. The page header shows this sentence, so an ask that is not a decision, such as a commit the owner makes, goes here: `waiting on your answer, then your commit`.
- `## Brief`: two `###` questions in this order, each answered in at most 40 words: What will change? What could go wrong? The page labels them Changes and Risks. Changes says what the owner gets in at most two sentences, with a short reason when the change needs one. An iteration that a gate opened, not the owner, names in Changes the owner's request it serves and the finding that opened it. Risks says what could hurt the owner. Decisions go in Open questions, and other asks go in `Status:`. An open plan that leads its page needs one.
- `## Demo`: written once the work does something the owner can try. Numbered steps in the order the owner would try them; each says where to go, what to do and what they should see, in plain words with the exact URL, command or fixture to open. When the step's screen changed, the step ends with its verified frames as `![before](path)` and `![after](path)`, paths relative to the plan file; a new screen has only an after frame. The page shows Demo right after the brief and inlines each frame. A frame missing on the rendering machine shows its path instead. The renderer refuses a Demo with no numbered step.
  When the user's ask quotes a stakeholder's script, such as a demo outline, `## Demo` copies its beats in order and marks each one covered, deferred with its owner, or out of scope. A failure on a covered beat never closes as outside the change.
- A plan that continues a subject carries only its delta, under the subject's section titles:
  - `## Public API`: one ```` ```ts before ```` and ```` ```ts after ```` pair per call it changes. A deleted call has an empty after fence, and a new call an empty before fence.
  - `## Main changes`: its own changes.
  - Any other subject section: a table whose first column is `Delta`. Each row is `added`, `changed` or `removed`, and its next cell keys it to the subject's row in a table with the same columns. New prose or tables go beside it.
- A one-off plan carries its own `## Public API` pairs and `## Main changes`.
- `## Defaults`: a table whose columns start with `Decision | Pick | Alternative | Word`, one row per call made for the owner, in plain words. The word reverses the pick. A row that covers a set gives a reason true of each member, and when the owner's own words name an option, the pick or the alternative is that option in those words. Leave the section out when no call was made.
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
- `## Close`: written at every stop that hands work back after work ran, such as a build, fix or review close. It holds what landed, the proof and its limits, the counts the block's Todo list and close rule requires, reversals and deviations first, open work with owners and stops and, after a decision-trail review, its Attention section. Build the proof part from each decision-log row's own `scope:`, never from one sentence that covers every fix. A pstack playbook's Reply line lists what else it holds.
- On a page without a brief, Scope, Steps, Evidence, Proof, Claims, Asks, Verification, Notes and Panel gate render under Details, and a one-off plan shows its other sections. A page with a brief leaves them in the plan file.

## Lifecycle

- A plan is open until its `Status:` starts with a `done` word from `status.mjs`, such as executed, done, superseded or cancelled.
- While a plan is open, the subject file keeps the state before it, and the plan file holds the delta.
- When execution ends, and before `Status:` says executed, write the plan's `## Close` and fold the delta into the subject file. Replace or join the call sites with each after fence. Add, replace or delete each marked row, dropping its Delta cell. Move the rest into its section, and move the plan's open work into the subject file's `## Open work`, each item with its owner and its stop. Then render with `--folded`, and flip `Status:` in the same edit, because a plain render refuses the folded subject while the plan is still open.
- A plan reopened after its fold starts its `Status:` with `reopened`.
- Once no iteration is open, the newest iteration leads. Without a brief, its page shows the subject's current state and lists the iterations as history.
- The open iteration whose file name starts with the latest date leads the page, whichever plan renders it. A name without a date counts as the oldest, and iterations from one date order by their decision log's latest row, then by name.

## Page order

Every page opens with a header: the title, the flow rail, the `Status:` sentence and the latest review round with its seats. The rail shows the stages Plan, Design, Plan review, Build, Writing, Code review, Verify, Audit, Ship and Reflect. Hovering a stage shows the pstack step behind it, and once Plan, Design, a review stage, Writing or Audit ran, small badges name the pstack skills behind it. A stage that ran is a filled green badge, a skipped one is dashed grey and the rest are outlined blue. The next stage is an amber ring while work goes on, a filled orange badge when the `Status:` waits on the owner, and a filled red badge when it is held. A plan that ended without landing, such as a superseded one, adds its word in grey after its last stage and shows every stage it never ran as skipped. Plan names the playbook from the `Playbook:` line and, for a project playbook, the pstack playbooks it extends. Design and Writing name the tools that ran, the review stages name `interrogate` and count their rounds, Audit names `show-me-your-work`, and Build counts its checked steps. Build, Verify, Ship and Reflect carry no badge. Phases outside this table never move the rail, so log each stage's rows under its phase:

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
2. The brief in one card.
3. Needs you.
4. Picked for you, from Defaults.
5. Public API, from the leading plan.
6. The `page-lead` sections in their playbook order, each from the leading plan, or from the subject and marked current when the plan has none.
7. Main changes.
8. The leading plan's other sections.
9. One line that names the plan and subject files, which keep the internals: Close, Scope, Steps, Evidence, Proof, Claims, Asks, Verification, Notes, Panel gate, iterations and the review rounds.

Write the brief, Needs you and Defaults in Simplified Technical English. Use short sentences, the active voice and common words, and leave out code, file paths and commit hashes. The renderer refuses an open plan whose brief, Open questions or Defaults holds code in backticks. After a build, the Changes and Risks answers also tell the owner what the Close holds: what landed, where the proof stops, any reversal and the warnings of a decision-trail review.

Needs you collects the Open questions of every iteration, the leader's first, and an older iteration's question names its plan. Each question's number takes its attention color: red for answer, amber for look and green for safe. Red questions come first, the head counts each color, and the frame takes the most urgent one. Each option is a row with its label, what happens and its cost, under one Then and Cost header. Your pick starts checked, as a radio or, for a `Pick any.` question, a checkbox, and its reason sits under it. A bar at the bottom says go while every pick stands; when the owner changes a pick or answers a question with no pick, it shows a reply to copy, such as go, except Last fixes: Review first. In Needs you and the header, only badges, such as the question numbers and a finished rail stage, have a background; everything else uses text color and borders. An executed plan's older question renders with the parts it has.

Without a brief, the page shows the whole record, with every section open:

1. Needs you.
2. Close, from the leading iteration's or the one-off plan's `## Close`.
3. The leading plan's lead paragraph.
4. Public API, then the `page-lead` sections, then Main changes.
5. Picked for you, from Defaults.
6. The subject's lead paragraph and other sections.
7. History, newest first.
8. Details.
9. Review history, from the decision log's `panel` and `review` rows, with the latest round tagged in the header.

## Refusals

`plan-page.mjs` exits 1 and names the fix when any of these holds. The rules on pairs, playbook names, Delta cells and keys, early folds and Defaults apply to every open iteration whichever plan is passed, and to a one-off plan. `page-require` follows the leading plan. The `Topic:` and `--folded` rules check the plan passed. The renderer does not recheck an executed iteration, and an executed leader whose playbook was renamed takes every playbook's sections, so renaming a playbook never refuses an old plan's page.

- A paired section has no pair, or a `before` fence not followed directly by its `after` fence.
- A subject file keeps a pair in a paired section.
- A Delta cell is not `added`, `changed` or `removed`; an added row's key is already in the subject with other cells; or a changed row's key is not in the subject. This holds for a Delta table in any section.
- An open plan's `## Brief`, `## Open questions` or `## Defaults` holds code in backticks, because the page shows those sections.
- A subject iteration's `Status:` starts with no state word.
- A `Topic:` line names a subject with no file.
- An iteration names a playbook that `.agents/playbooks/` lacks.
- `.agents/pstack.json` still sets `pageLead`, `pagePairs` or `pageTopic.require`. sync-pstack's `apply` drops them in the write that installs the renderer once a playbook carries each title, and refuses until then.
- A subject whose hub exists lacks a required section in both its file and its open plan. The leading plan's playbook sets the required sections, or every playbook does when that plan names none.
- An open iteration's subject already shows one of its added or changed rows, or no longer has a row it removes, in any section with a Delta table. It also refuses when the subject shows a pair's after fence line for line, indentation and punctuation included, and does not show its before fence. The check skips a pair that deletes a call or changes nothing, a pair whose changed lines another iteration's fences all hold, and any row another iteration also marks. It exempts a plan whose `Status:` starts with `reopened`, and the plan a `--folded` render folds.
- An open iteration's Defaults has no Decision, Pick, Alternative and Word table.
- An open plan that leads its page, with a state word in its `Status:`, has no `## Brief`.
- An open iteration's brief skips, adds or reorders a question, leaves an answer empty, or answers in more than 40 words. When a brief asks a question that older briefs asked, the refusal names each one to drop.
- `--folded` names a plan with no `## Close` or no subject file, or the subject file lacks the plan's Delta rows or after lines, still shows its before lines, or does not show an after fence as one block in order, skipping any row or line another iteration also changes.

`--check` runs every refusal and writes nothing.
