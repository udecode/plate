# Plan page

Page: https://claude.ai/artifact/NotdPrUfspjhiwiTmB9nJN

How a plan and its subject become one page per subject: the files agents write under `docs/plans`, the renderer that checks and draws them, and where each project names its own review sections. Every plan for the page shape is one iteration of this subject; earlier iterations live under the `pstack` subject.

## Public API

Agents render a page after every change to a plan or its subject file, fold an executed plan's delta with `--folded`, and run every refusal without writing with `--check`.

```sh
# skills/plan-page/SKILL.md
node .agents/pstack/plan-page.mjs <plan>
node .agents/pstack/plan-page.mjs <plan> --folded
node .agents/pstack/plan-page.mjs <plan> --check
```

The project config keeps only how a plan finds its subject and its history hub.

```json
// .agents/pstack.json
"pageTopic": { "field": "review_scopes", "hub": "docs/research/features/{topic}.md" }
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

## Hard cuts and app migration

- `.agents/pstack.json` loses `pageLead`, `pagePairs` and `pageTopic.require`. The renderer refuses a config that still sets them, and sync-pstack's `apply` removes them only once a playbook's frontmatter carries every title.
- plate-2 moves its five sections, the Document shape pair and the required editor comparison into `.agents/playbooks/plan.md`. The Page sections in `.agents/playbooks/references/architecture.md`, where another session folded `plate-architecture`, point there. ellie sets none of these keys and needs no migration.
- An open plan whose Defaults is a list refuses to render until it becomes the table. One plate-2 plan does today: `docs/plans/2026-10-01-autocomplete-ordinary-text-adoption.md`, owner zbeyens.
