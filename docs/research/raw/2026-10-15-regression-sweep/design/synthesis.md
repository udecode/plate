# Sweep workflow synthesis

## Problem

The team runs a human pass over beta in the owner's order: P1 Slate examples, P2 stable Plate examples, P3 and P4 new examples, P5 gaps against other editors, then P6 fixes. Agents already add tests with every change, and 93 fixes from 2026-08-15 to 2026-10-15 still reached beta with green tests (census in `docs/research/raw/2026-10-15-regression-sweep/census/`). The workflow has to make that human pass cheap to prepare and aimed at those misses, turn each find into a fix plus the test that should have caught it, and shrink the human list as tests take over. Constraints: it must look like `verdict` (a thin rule over a project playbook with anchored deltas on a pstack playbook), call `verify`, Maintainer's issue-draft, the Bug fix playbook and `pnpm kb` instead of restating them, and leave agent-run testing for later.

## Usage (caller's view)

```txt
/sweep round 1        # writes docs/plans/<date>-sweep-r1.md: pages P1 to P5, scenarios due, the minutes cap
/sweep prep P1        # writes docs/sweep/<page>.md cards for the 22 Slate pages and their boxes in the round plan
/maintainer issue-draft beta.mov slate.mov   # a failed box; the draft names the scenario id
/sweep round 2        # derives retired, due, new-page and convert counts from pnpm kb and the boxes
```

A card in `docs/sweep/forced-layout.md`:

```md
### SWEEP-FORCED-LAYOUT-001 Enter at the end of the title adds a line
- priority: P1
- page: https://beta.platejs.org/examples/plite/forced-layout
- reference: https://www.slatejs.org/examples/forced-layout
- on: Chrome Mac, Safari Mac, Safari iPhone
- given: caret at the end of the title
- do: Enter, then type "a"
- expect: "a" sits in a new paragraph under the title, as on the reference
- must-not: "a" joins the title; a console error
- miss: demo wiring (98bc0c03a6)
- layer: unit
- minutes: 2
```

## Shape

- `.agents/rules/sweep.mdc`: the entry, like `verdict`. It runs the playbook, loads poteto-mode and runs `check-playbooks.mjs`.
- `.agents/playbooks/sweep.md`: `extends: investigation`, two modes (`round`, `prep`), Pages, Scenario, Picking scenarios, Retirement, Converting and Finds, and three anchored deltas on investigation's quoted steps. `page-lead: Pages, Scenarios, Finds`.
- `.agents/playbooks/references/misses.md`: the kinds of past misses with counts and example commits, read when ranking.
- `docs/sweep/<page>.md`: durable cards, one file per page; `docs/sweep/pages.md`: only the P2 pairs whose names differ and the P5 areas. Everything else derives from the registry.
- Round plans are ordinary plan pages, `Topic: sweep`, `Playbook: sweep`; results are boxes.
- Retirement is derived, never written: a test title carries `[SWEEP-<PAGE>-<NNN>]`; `pnpm kb <id>` lists it with its gate; a scenario leaves the human list when such a test runs under a gate other than `manual` and observes the whole card at its layer. The tag shape follows `EDIT-*` so the `TAG` regex in `tooling/scripts/knowledge/knowledge.mjs:59` widens by one alternative and K4 validates it.
- P6 is the Bug fix playbook, one session per find; its project delta tags the new test with the scenario id at the card's layer or lower.

Per boundary-discipline the workflow owns only Plate method: picking, card shape and retirement. Proof law stays in `verify`, issue drafting in Maintainer, fixing in Bug fix. Per subtract-before-you-add it adds no executor, no catalog file and no retired flag.

## Synthesis decision

Base: Opus (cand-2 in the blind judge), 15 of 18, tied with Sol and picked for its scenario budget (five cards per P1 and P2 page, three per P3 and P4 page, a round minutes cap), its `blind-spot` aim per card and a trial key held out by date. Grafts:

- From Sol: a scenario id tag that `pnpm kb` indexes and K4 validates, so a scenario with no `EDIT-*` rule or published issue can still retire. It lands before round 2, not before round 1, because round 1 retires nothing.
- From Astra: Maintainer's issue-draft keeps a Slate or other-editor recording as its own baseline instead of forcing `main` and `next` (`.agents/rules/maintainer/references/issue-draft.md:61-72`). With it, Opus's `find` mode is dropped and a person calls issue-draft directly.
- From Sol and Astra: P3 covers hidden and experimental examples, which Opus's routing missed (`plite-example-registry.ts:100`).
- From Astra and Sol: whoever tags a test reads the card and tags only a test that observes all of it.

Rejected: Opus's rule to drop model-observable rows from the human list up front, because the owner wants the human pass first and agent coverage to shrink it later; Astra's plain-text ids found by ranked word search, because nothing checks them and `-007` matches `-0071`.

## Tradeoffs accepted

- We accept one hand list (`docs/sweep/pages.md`) in exchange for P2 pairs whose names differ, which no registry holds.
- We accept a small `knowledge.mjs` change in exchange for retirement that a tool checks instead of a person re-judging every round.
- We accept cards that duplicate a little of the reference page's behavior in exchange for a person who can run the round without reading code.

## Alternatives considered

- A section in `verify` with no new skill (trial arm C). It hides nothing new from callers but leaves rounds, retirement and the minutes cap to each preparer, so the human list never shrinks by rule.
- One catalog file for every scenario. It is one file to scan, but every round edits it and merge noise grows with pages.
- Scenarios only inside round plans. Nothing durable to tag, so retirement has no key.

## Implementation reconciliation

- The first skill trial (`../trial/`) scored the prototype's `prep P1` 0, `verify` alone 0 and `verify` plus a section 1 of 12. By its frozen keep rule, the picking rules (Picking scenarios, `references/misses.md`) drop, and the section gets its own trial in round 1. Source: the keep rule and `.agents/playbooks/plan.md:15`.
- Panel round 4 on the plan (Opus, Astra, Sol) changed the shape. Retirement uses the published issue's `[plate#N]` tag through a script, `tooling/scripts/sweep-due.mjs`, instead of a new `[SWEEP-…]` tag and an agent's judgment. Page errors move to one check per page per round. P2 covers the plugin demos and the playground. Converting cards into agent-written tests waits for the agent-testing plan. The Plate browser gate goes through `tooling/scripts/check.mjs`. Source: the decision log's round 4 rows.

## Open questions and risks

- Does a cap of five cards per P1 page still catch the misses that matter? The paired trial answers this against a key held out from Slate's own fix history.
- Will people record failures through issue-draft, or skip it under time pressure? Round 1's Finds count against the boxes marked failed shows it.

## Next implementation step

Write `.agents/playbooks/sweep.md` and the rule from the frozen prototype, then run `prep P1` for round 1.
