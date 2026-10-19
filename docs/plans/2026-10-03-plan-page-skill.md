# One skill owns the plan page

Status: executed: dotai 9d41499 and ellie 5ace3442e are pushed; plate-2's sync and skill install are uncommitted in the working tree, for the owner to commit.
Topic: plan-page

The owner asked for one skill that owns the page shape and its repair, "we'll iterate a lot on it that way", with each playbook owning its own page sections, "like in plate we have what other editors do", then said "ok go". This plan adds the dotai skill `plan-page`, moves the checkable shape rules into the renderer, and moves the review sections from `.agents/pstack.json` into each playbook's frontmatter.

## Public API

Each before fence is a call site at dotai `ee6fd0f` and plate-2 `209bbb7ff3`, the commits before this plan.

The renderer gains `--check`, which runs every refusal and writes nothing.

```sh before
# AGENTS.md, Plan pages
node .agents/pstack/plan-page.mjs <plan>
node .agents/pstack/plan-page.mjs <plan> --folded
```

```sh after
# skills/plan-page/SKILL.md
node .agents/pstack/plan-page.mjs <plan>
node .agents/pstack/plan-page.mjs <plan> --folded
node .agents/pstack/plan-page.mjs <plan> --check
```

The project config keeps only how a plan finds its subject and its history hub.

```json before
// .agents/pstack.json
"pageLead": ["What other editors do", "Document shape", "Layer and owner", "Hard cuts and app migration", "Native behavior and proof"],
"pagePairs": ["Document shape"],
"pageTopic": { "field": "review_scopes", "hub": "docs/research/features/{topic}.md", "require": ["What other editors do"] }
```

```json after
// .agents/pstack.json
"pageTopic": { "field": "review_scopes", "hub": "docs/research/features/{topic}.md" }
```

The playbook whose plans write the review sections names them.

```yaml before
# .agents/playbooks/plan.md
extends: multi-phase-plan
when: Use it for "plan" after a Pursue verdict, `plan <goal>`, "design plan" or `plate-architecture`.
```

```yaml after
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

## Hard cuts and app migration

- `.agents/pstack.json` loses `pageLead`, `pagePairs` and `pageTopic.require`. The renderer refuses a config that still sets them, and sync-pstack's `apply` removes them only once a playbook's frontmatter carries every title.
- plate-2 moves its five sections, the Document shape pair and the required editor comparison into `.agents/playbooks/plan.md`. The Page sections in `.agents/playbooks/references/architecture.md`, where another session folded `plate-architecture`, point there. ellie sets none of these keys and needs no migration.
- An open plan whose Defaults is a list refuses to render until it becomes the table. One plate-2 plan does today: `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md`, owner zbeyens.

## Open work

- Merge `assertFolded` and `assertUnfolded` into one fold classifier, and move page validation out of the renderer, which passes 1000 lines. owner: zbeyens, tracked in this plan's decision log, phase `panel`.
- Have sync-pstack's `verify` fail when the block names a skill the project cannot resolve; until then the sync installs `plan-page` by hand. owner: zbeyens, tracked in this plan's decision log, phase `panel`.
- The pair half of the early-fold refusal catches only a subject that shows an after fence verbatim, so it misses a hand fold like the proof page's that opened this run; the Delta-row half is exact. Redesign it around a fold marker the renderer writes, or a `Base:` commit compared with `git show`, before relying on it. owner: zbeyens, tracked in this plan's decision log, phase `trail`.
- `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md` refuses to render until its Defaults becomes the decision table. owner: zbeyens, tracked in this plan's Hard cuts and app migration.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the renderer lives | Stays in `skills/sync-pstack/assets/pstack/`, shipped by sync-pstack, so every managed project renders whether or not the skill is installed | Move it into `skills/plan-page/scripts/` | move renderer |
| Frontmatter form | Comma lists on `page-lead`, `page-pairs` and `page-require`, like `extends` | Nested YAML under one `page:` key | nested page |
| A plan without `Playbook:` | Takes every playbook's sections and requirements, today's behavior | Require every plan to name its playbook | require playbook |
| The Defaults refusal | Open plans only, so executed plans keep rendering | Every plan | all defaults |
| Plan panel | Skipped: the owner said go on the proposal, and the panel reviews the built diff | Panel the plan first | plan panel |

## Steps

- [x] Ground the renderer and every reader of the page config. Closed by the trace rows in `docs/plans/2026-10-03-plan-page-skill.decisions.tsv`.
- [x] Change the renderer and `status.mjs` in a detached dotai worktree at `origin/main`. Closed by `/Users/zbeyens/git/dotai-plan-page`.
- [x] Tests that fail on the old renderer for each named defect. Closed by `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs`, 69 of 69, with six red on the old renderer and five mutations each caught.
- [x] Old and new renderer over every plan in plate-2 and ellie. Closed by the corpus rows in `docs/plans/2026-10-03-plan-page-skill.decisions.tsv`.
- [x] Write `skills/plan-page/SKILL.md` and `references/shape.md`, shrink the block paragraph, update sync-pstack's Lesson, playbook and interview docs, and register the skill in `scripts/build-workflow.mjs`. Closed by `scripts/validate-skills`.
- [x] Writing passes: `deslop` and `no-comments` on the code, `unslop` on the prose. Closed by the pass invocations on the build and on the round-1 fixes, logged in the decision log.
- [x] Panel round 1 on the diff. Closed by the round-1 `panel` rows in `docs/plans/2026-10-03-plan-page-skill.decisions.tsv`: four criticals applied, one dismissed.
- [x] Panel round 2 on the fixes. Closed by the round-2 `panel` rows in `docs/plans/2026-10-03-plan-page-skill.decisions.tsv`: four criticals applied, each case red then green.
- [x] Decision-trail review before the shared push. Closed by the `trail` rows in `docs/plans/2026-10-03-plan-page-skill.decisions.tsv` from codex:gpt-6.1-sol @xhigh: two defects fixed, the rest logged.
- [x] Rebase on the other session's dotai commit, then commit and push dotai. Closed by dotai 9d41499 on a2d7e48.
- [x] Sync plate-2 and ellie, move plate-2's sections into `.agents/playbooks/plan.md`, repoint `plate-architecture`, install `plan-page` in both, then `verify` and a smoke in each runtime. Closed by `sync-pstack apply` on both, ellie 5ace3442e, `npx skills@1.5.25 add udecode/dotai --skill plan-page` in both, `sync-pstack verify` passing on both, and the paired smoke rows.
- [x] Fold this plan into `docs/plans/topics/plan-page.md`, render with `--folded` and publish. Closed by `node .agents/pstack/plan-page.mjs docs/plans/2026-10-03-plan-page-skill.md --folded`.

## Proof

Its tests and the corpus run over every plan in both managed projects prove the renderer's behavior. The routing claim, that an agent loads `plan-page` before writing a plan, holds only after a smoke in each runtime.
