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
- A plan that continues a subject carries only its delta, under the subject's section titles:
  - `## Public API`: one ```` ```ts before ```` and ```` ```ts after ```` pair per call it changes. A deleted call has an empty after fence, and a new call an empty before fence.
  - `## Main changes`: its own changes.
  - Any other subject section: a table whose first column is `Delta`. Each row is `added`, `changed` or `removed`, and its next cell keys it to the subject's row in a table with the same columns. New prose or tables go beside it.
- A one-off plan carries its own `## Public API` pairs and `## Main changes`.
- `## Defaults`: a table whose columns start with `Decision | Pick | Alternative | Word`, one row per call made for the owner. The word reverses the pick. Leave the section out when no call was made.
- `## Open questions`: one `### <short header>` per question, unique on the page. Then the question in one line, then its options as `- **<label>** (recommended): <one-line description>`, with the recommended one first and each other label a word the user can type. A question with no clear recommendation marks none. Context a reader rarely needs goes after the options, and the page folds it under More.
- `## Close`: written at every stop that hands work back after work ran, such as a build, fix or review close. It holds what landed, the proof and its limits, the done, skipped, blocked and open counts, reversals and deviations first, and open work with owners. A pstack playbook's Reply line lists what else it holds.
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

1. Needs you, from the Open questions of every iteration, the leader's first; an older iteration's question names its plan. Each question renders as radio buttons with the recommendation picked. The section says that go takes every recommendation, and shows a Copy answer line only when an answer differs from it or a question has none.
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
- `--folded` names a plan with no `## Close` or no subject file, or the subject file lacks the plan's Delta rows or after lines, still shows its before lines, or does not show an after fence as one block in order, skipping any row or line another iteration also changes.

`--check` runs every refusal and writes nothing.
