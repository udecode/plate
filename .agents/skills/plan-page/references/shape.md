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

- Optional frontmatter, then `# Title`, then `Status:`, `Topic:` and, when a project playbook writes the plan, `Playbook:` lines.
- `Status:` starts with a state word from `.agents/pstack/status.mjs`, such as `planning`, `building`, `blocked`, `reopened` or `executed`.
- `## Brief`: five `###` questions in this order, each answered in at most 40 words: What did you find? What will change? What do you need from me? What happens if I say go? What could go wrong? The owner reads only this, so each answer names the decision, the number or the next action, and the go answer says what "go" picks. An open plan that leads its page needs one.
- A plan that continues a subject carries only its delta, under the subject's section titles:
  - `## Public API`: one ```` ```ts before ```` and ```` ```ts after ```` pair per call it changes. A deleted call has an empty after fence, and a new call an empty before fence.
  - `## Main changes`: its own changes.
  - Any other subject section: a table whose first column is `Delta`. Each row is `added`, `changed` or `removed`, and its next cell keys it to the subject's row in a table with the same columns. New prose or tables go beside it.
- A one-off plan carries its own `## Public API` pairs and `## Main changes`.
- `## Defaults`: a table whose columns start with `Decision | Pick | Alternative | Word`, one row per call made for the owner. The word reverses the pick. Leave the section out when no call was made.
- `## Open questions`: one `### <short header>` per decision, unique on the page, written as a decision memo the owner can answer without reading anything else on the page. The renderer refuses an open plan's question that skips a part:
  1. The decision in one line that ends in `?`.
  2. `Why it needs you:` and one or two sentences on why no safe default exists.
  3. The facts the owner needs to decide, as plain bullets.
  4. Two or more options, the recommended one first, each as `- **<label>** (recommended): <what happens> Cost: <what it costs or risks>`. The label is a plain phrase the owner recognizes, never a code word to type back.
  5. `Why I pick it:` and one sentence, when one option is recommended. A question with no clear recommendation marks none and leaves this line out.
  6. `If you say go:` and what the lead does next, or that go leaves the question open. It names only what go authorizes now; an irreversible or outward step after it, such as a later delete, comes back as its own question.

  ```md
  ### Workflow guides

  Where should the two workflow guides live?

  Why it needs you: Another account owns both pages, and the choice changes what teammates read.

  - plate-2 already keeps a repo guide, `docs/development/agent-skills.md`.

  - **Keep them in the repo** (recommended): Both `AGENTS.md` files link to a repo guide. Cost: The old pages stay up until you delete them.
  - **Rebuild them as new pages**: I publish both guides under this account. Cost: Two more pages to keep in sync by hand.

  Why I pick it: A repo file is reviewed, versioned and readable by every teammate.

  If you say go: I write Ellie's repo guide and repoint both links.
  ```
- `## Close`: written at every stop that hands work back after work ran, such as a build, fix or review close. It holds what landed, the proof and its limits, the counts the block's Todo list and close rule requires, reversals and deviations first, open work with owners and, after a decision-trail review, its Attention section. A pstack playbook's Reply line lists what else it holds.
- Scope, Steps, Evidence, Proof, Claims, Asks, Verification and Notes render collapsed under Details. In a subject iteration, so does any other section the subject file lacks; a one-off plan shows its other sections open.

## Lifecycle

- A plan is open until its `Status:` starts with a `done` word from `status.mjs`, such as executed, done, superseded or cancelled.
- While a plan is open, the subject file keeps the state before it. The page leads each section with the plan's delta, strikes through the current version of each changed or removed row, and collapses the current state.
- When execution ends, and before `Status:` says executed, write the plan's `## Close` and fold the delta into the subject file. Replace or join the call sites with each after fence. Add, replace or delete each marked row, dropping its Delta cell. Move the rest into its section, and move the plan's open work into the subject file's `## Open work`, each item with its owner. Then render with `--folded`, and flip `Status:` in the same edit, because a plain render refuses the folded subject while the plan is still open.
- A plan reopened after its fold starts its `Status:` with `reopened`.
- Once no iteration is open, the page shows the current state alone and lists the iterations as history.
- The open iteration whose file name starts with the latest date leads the page, whichever plan renders it. A name without a date counts as the oldest, and iterations from one date order by their decision log's latest row, then by name.
- The leading iteration's Close shows open right after Needs you. Once no iteration is open, the newest iteration leads, so its Close stays on top until a newer iteration opens.

## Page order

Every page opens with a header: the title, the flow rail and the latest review round with its seats. The rail shows the stages Plan, Design, Plan review, Build, Writing, Code review, Proof, Log review, Ship and Reflect. A stage that ran is a filled green badge, a skipped one is dashed grey, the next one has an amber ring and the rest are outlined blue. A `Status:` that waits or is held adds its own word, such as Waiting, before the stages left. Review stages count their rounds, Build counts its checked steps, and Design and Writing name the tools that ran. Phases outside this table never move the rail, so log each stage's rows under its phase:

| Stage | Ran when |
| --- | --- |
| Plan | always |
| Design | the log has an `architect`, `prototype`, `arena`, `how`, `why` or `design` row |
| Plan review | the log has a `panel` or `interrogate` row before the first `build` row; each `seats` row is a round |
| Build | the log has a `build` row, or Steps has a checked box |
| Writing | the log has a `writing` row; the stage names the `deslop`, `no-comments` and `unslop` passes those rows mention |
| Code review | the log has a `panel` or `interrogate` row after the first `build` row |
| Proof | the log has a `proof` or `verify` row |
| Log review | the log has a hand-off reviewer's row, whose phase starts with `review`, or a `trail` row whose decision names the trail review |
| Ship | the log has a `ship` or `delivery` row, or `Status:` ends the plan |
| Reflect | the log has a `reflect` or `lesson` row |

When the leading plan has a brief, the page shows:

1. The header.
2. The brief in one card, then Needs you, so all five answers stay on the first screen.
3. Public API, when the leading plan changes it.
4. Everything else, each folded to one line: Close, an unchanged Public API, the plan's lead paragraph, the `page-lead` sections, Main changes, Picked for you, the subject's current state, iterations or history, details and review history.

Without a brief, the page shows:

1. Needs you, from the Open questions of every iteration, the leader's first; an older iteration's question names its plan. Its head lists each decision's pick after a go badge, because go takes the pick on every decision that has one, so the owner can say go without reading further. Otherwise the owner answers in their own words. Each question then renders as a numbered decision: the question, why it needs you, the facts, each option with what happens and what it costs, the pick in the call-to-action color with its reason, and what go does. Only badges, such as the go badge, the decision number, the My pick badge and a finished rail stage, have a background; everything else uses text color and borders. An executed plan's older question renders with the parts it has.
2. Close, from the leading iteration's or the one-off plan's `## Close`.
3. The leading plan's lead paragraph.
4. Public API, then the `page-lead` sections, then Main changes.
5. Picked for you, from Defaults.
6. The subject's lead paragraph and other sections.
7. Iterations newest first, or History once none is open.
8. Details, collapsed.
9. Review history, from the decision log's `panel` and `review` rows, with the latest round tagged in the header.

## Refusals

`plan-page.mjs` exits 1 and names the fix when any of these holds. The rules on pairs, playbook names, Delta cells and keys, early folds and Defaults apply to every open iteration whichever plan is passed, and to a one-off plan. `page-require` follows the leading plan. The `Topic:` and `--folded` rules check the plan passed. The renderer does not recheck an executed iteration, and an executed leader whose playbook was renamed takes every playbook's sections, so renaming a playbook never refuses an old plan's page.

- A paired section has no pair, or a `before` fence not followed directly by its `after` fence.
- A subject file keeps a pair in a paired section.
- A Delta cell is not `added`, `changed` or `removed`; an added row's key is already in the subject with other cells; or a changed row's key is not in the subject. This holds for a Delta table in any section.
- A subject iteration's `Status:` starts with no state word.
- A `Topic:` line names a subject with no file.
- An iteration names a playbook that `.agents/playbooks/` lacks.
- `.agents/pstack.json` still sets `pageLead`, `pagePairs` or `pageTopic.require`. sync-pstack's `apply` drops them in the write that installs the renderer once a playbook carries each title, and refuses until then.
- A subject whose hub exists lacks a required section in both its file and its open plan. The leading plan's playbook sets the required sections, or every playbook does when that plan names none.
- An open iteration's subject already shows one of its added or changed rows, or no longer has a row it removes, in any section with a Delta table. It also refuses when the subject shows a pair's after fence line for line, indentation and punctuation included, and does not show its before fence. The check skips a pair that deletes a call or changes nothing, a pair whose changed lines another iteration's fences all hold, and any row another iteration also marks. It exempts a plan whose `Status:` starts with `reopened`, and the plan a `--folded` render folds.
- An open iteration's Defaults has no Decision, Pick, Alternative and Word table.
- An open plan that leads its page, with a state word in its `Status:`, has no `## Brief`.
- An open iteration's brief skips, adds or reorders a question, leaves an answer empty, or answers in more than 40 words.
- `--folded` names a plan with no `## Close` or no subject file, or the subject file lacks the plan's Delta rows or after lines, still shows its before lines, or does not show an after fence as one block in order, skipping any row or line another iteration also changes.

`--check` runs every refusal and writes nothing.
