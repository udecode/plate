# Plan page

Page: https://claude.ai/artifact/QkmXGRS8ykgdL4YtYCNr1f

How a plan and its subject become one page per subject: the files agents write under `docs/plans`, the renderer that checks and draws them, and where each project names its own review sections. Every plan for the page shape is one iteration of this subject; earlier iterations live under the `pstack` subject.

## Public API

Agents render a page after every change to a plan or its subject file, fold an executed plan's delta with `--folded`, run every refusal without writing with `--check`, and render every subject's page and the topic index with `--index`.

```sh
# skills/plan-page/SKILL.md
node .agents/pstack/plan-page.mjs <plan>
node .agents/pstack/plan-page.mjs <plan> --folded
node .agents/pstack/plan-page.mjs <plan> --check
node .agents/pstack/plan-page.mjs --index
```

The project config keeps only how a plan finds its subject and its ledger scope file.

```json
// .agents/pstack.json
"pageTopic": { "field": "review_scopes", "hub": "docs/research/review-scopes/{topic}.json" }
```

The playbook whose plans write the review sections names them.

```yaml
# .agents/playbooks/plan.md
extends: multi-phase-plan
when: Use it for "plan" after a Pursue verdict, `plan <goal>`, "design plan", or an architecture or API adoption plan.
page-lead: What other editors do, Document shape, Layer and owner, Hard cuts and app migration, Native behavior and proof
page-pairs: Document shape
page-require: What other editors do
```

## Main changes

- The dotai skill `plan-page` owns the page: file shapes, subject choice, delta and fold, render and publish, check, repair, and changes to the renderer. Its `references/shape.md` holds the shapes and the refusals. The block's Plan pages rule keeps only the one-page rule, the pointer, the Defaults and Open questions law, what "go" authorizes and the reply shape, 331 words instead of 1060.
- The renderer reads `page-lead`, `page-pairs` and `page-require` from each project playbook. A plan names its playbook with `Playbook: <name>`. The leading plan's playbook orders the sections and sets the required ones, and when it names none every playbook's apply.
- The renderer refuses a subject that already shows an open plan's delta, unless the plan's Status starts with `reopened` or the render is that plan's `--folded`, and refuses an open plan whose Defaults is not the Decision, Pick, Alternative and Word table.
- The shape checks run on every open iteration whichever plan is passed, and executed iterations stay as written. Fold checks compare code with its case, spacing and line order.
- sync-pstack still ships the renderer to `.agents/pstack/`. Its `apply` drops the old page lists from `.agents/pstack.json` in the write that installs the renderer once the playbooks carry them, and refuses until then. Its Lesson mode runs page-shape changes, with the skill's Change mode adding the renderer's specifics.

- Every stop that hands work back publishes its page before the reply, and the reply is the link alone: a plan written, reviewed, revised or built, a review verdict, a next answer, a playbook's close, a blocked run's ask, reflect's list awaiting approval and a subject file update. A chat answer that discloses something about a topic's work also goes on its page. Codex sessions still skip pages.
- A plan's `## Close` holds the close report. The renderer shows the leading iteration's Needs you and Close on top, executed or not, until a newer iteration opens, and `--folded` refuses a plan with no Close.
- `decisions-check.mjs` refuses a panel row in the plans directory until its plan sits beside the log, and dotai's validate-skills refuses a stray double quote inside a quoted frontmatter value.
- plate-2's api-review playbook writes a next answer and a verdict onto the scope's subject page, as `proposed`, then `planning`, `closed` or `blocked`. Build, Perf issue, Refactoring and Babysit put their close report in `## Close`.
- `--index` renders every subject's page into `<plans>/artifacts/topics/` and writes `index.html` beside them, with each subject's lead, status, iteration count and newest date, open subjects first. With `pageTopic.hub` set, every hub without a subject file shows as a topic with no page yet. The index is never published.
- The rendered file under the plans directory is the lasting copy of a page; a published claude.ai page is where the owner comments on one hand-back, and a link that no longer opens gets a new page on the next publish. Codex renders the page and replies with its file path.
- Needs you collects the Open questions of every iteration, each older one labeled with its plan, so a newer plan no longer hides an older question; the index marks a subject that waits on you.
- plate-2's API review playbook creates a missing subject file with its editor comparison and what has landed and been proven, at its first stop and in a ledger triage audit, so the required "What other editors do" section exists before the page renders.

## Hard cuts and app migration

- `.agents/pstack.json` loses `pageLead`, `pagePairs` and `pageTopic.require`. The renderer refuses a config that still sets them, and sync-pstack's `apply` removes them only once a playbook's frontmatter carries every title.
- plate-2 moves its five sections, the Document shape pair and the required editor comparison into `.agents/playbooks/plan.md`. The Page sections in `.agents/playbooks/references/architecture.md`, where another session folded `plate-architecture`, point there. ellie sets none of these keys and needs no migration.
- An open plan whose Defaults is a list refuses to render until it becomes the table. One plate-2 plan does today: `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md`, owner zbeyens.

## Open work

- The pair half of the early-fold refusal catches only a subject that shows an after fence verbatim, so it misses a hand fold like the proof page's; the Delta-row half is exact. Redesign it around a fold marker the renderer writes, or a `Base:` commit compared with `git show`. owner: zbeyens.
- Merge `assertFolded` and `assertUnfolded` into one fold classifier, and move page validation out of the renderer, which passes 1000 lines. owner: zbeyens.
- Have sync-pstack's `verify` fail when the block names a skill the project cannot resolve, or when `skills-lock.json` records a local source for a dotai skill. owner: zbeyens.
- `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md` refuses to render until its Defaults becomes the decision table. owner: zbeyens.
- No fresh session has yet published a page under the page hand-back rule; the trials that proved its routing were read-only. Check the first real hand-back on its page. owner: zbeyens.
- plate-2's 22 ledger topics with plans and no subject file get their pages when the API review playbook's first stop or a ledger triage audit reaches them. owner: Ziad, tracked here.
- The block calls the rendered file the durable page, but `docs/plans/artifacts/` is gitignored, so the page lasts only on the machine that rendered it; a Claude smoke flagged it on 2026-10-04. owner: Ziad, tracked here.
- A plan the reviews list does not name ends with an `AskUserQuestion`, while Plan pages says the hand-back reply is the page link alone; a Claude smoke flagged it on 2026-10-04. owner: Ziad, tracked here.
