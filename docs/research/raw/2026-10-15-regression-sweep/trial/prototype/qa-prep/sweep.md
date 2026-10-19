---
extends: investigation
when: Use it for "sweep", "sweep round <n>", "sweep prep <P1-P5 | page>", or to prepare, resume or close the team's human pass over beta.
page-lead: Pages, Scenarios, Finds
---

# Sweep

The team's human pass over beta runs in the owner's order. P1 checks each beta Plite example against its Slate original, P2 each beta Plate docs example against stable platejs.org, P3 the new Plite examples, P4 the new Plate examples and P5 gaps against standard editors. P6 then fixes each find, one session per find, through the Bug fix playbook, and the next round repeats P1 to P5. This playbook prepares the scenarios people run, records what they find and retires each scenario once a gated test covers it. It never runs a scenario itself; agent-run scenarios are later work.

## Modes

| Arguments | Does |
| --- | --- |
| `round <n>` | Creates or resumes the round plan `docs/plans/<date>-sweep-r<n>.md`: every page grouped P1 to P5, the scenarios due, the human-minutes cap, and for a later round the retired, due, new-page and convert counts. |
| `prep <P1-P5 \| page>` | Writes or updates the page's scenarios in `docs/sweep/<page>.md` and adds one box per scenario and browser to the round plan. |

Results are the round plan's boxes. A person ticks a pass. For a failure, they run Maintainer's issue-draft with the beta recording and the reference recording, name the scenario id in the draft, and write the draft's path on the box.

## Pages

- P1 is every path in `UPSTREAM_PLITE_EXAMPLE_PATHS` (`apps/www/src/app/(app)/examples/plite/plite-example-registry.ts`), paired with `https://www.slatejs.org/examples/<path>`. Every other registered example, hidden and experimental ones included, is P3. Behavior a P1 page has and Slate's lacks gets a P3 scenario.
- P2 pairs each beta docs example with its stable page. `docs/sweep/pages.md` lists the pairs whose names differ, such as `slate-to-html` and `html-export`; a pair with one name needs no row. A beta page with no stable twin is P4, and a beta-only behavior on a P2 page gets a P4 scenario.
- P5 uses the areas in `docs/sweep/pages.md`: operations, navigation, cursor and selection, each against Google Docs, Notion, Lexical and Tiptap. A gap is a proposal for `verdict`, never a bug fix, unless it breaks a rule in `docs/editor-behavior/markdown-editing-spec.md`.

## Scenario

A scenario is one page, one starting state and one sequence of actions. Browsers and devices are a list on it, so one scenario covers each browser it names. It lives in `docs/sweep/<page>.md` as a card:

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

- `expect` cites where it comes from: the reference page, an `EDIT-*` rule or an issue. A scenario never states new law; new law goes into the behavior spec through its owner during P6.
- `miss` names the kind of past miss the scenario aims at, from [where agents missed](references/misses.md), with one example commit.
- `layer` is the lowest test layer that can see the bug: `unit`, `browser`, `device` or `human`. `human` is for what no test here can observe, such as the native drag image; those scenarios never retire.
- An id never changes meaning. A changed `expect` gets a new id, and the old card says which id replaces it.

## Picking scenarios

A round is not a checklist of every gesture on every page. For each page:

1. List what the page does that its reference also does. For P3 and P4, list what the page does.
2. Rank those behaviors by [where agents missed](references/misses.md), first the kinds that passed every test and still shipped broken: focus and first click, caret and selection paint, native keys, layout that moves during a gesture, real browsers and devices, and features used together.
3. Shape each kept behavior with `verify`'s Scenario Generator (`.claude/skills/verify/references/editor-proof.md`), including its reverse leg and one follow-up edit.
4. Keep at most five scenarios for a P1 or P2 page and three for a P3 or P4 page, and fit the round's human-minutes cap from the round plan's Defaults.
5. Name the browsers where the kind of miss shows: Safari and the iPhone for native keys, focus and input methods; Chrome alone for model behavior.

## Retirement

A test retires a scenario by carrying its id in the test title, as `[SWEEP-FORCED-LAYOUT-001]`, next to any `[EDIT-*]` or `[plate#N]` tag. `pnpm kb SWEEP-FORCED-LAYOUT-001` lists the tests that carry it and the gate that runs each. The scenario leaves the human list when one such test runs under a gate other than `manual`, is not skipped, and observes the card's `expect` and `must-not` at its `layer`. Nobody writes a retired flag; `round` derives it each time.

Whoever tags a test reads the card first and tags only a test that observes the whole card. A `browser` scenario stays human while its only test is an `apps/www/tests/browser` spec, because no gate runs those.

## Converting

At `round`, a scenario that passed in the last two rounds and has a `layer` below `human` becomes a suggested task through `chips`: an agent writes the tagged test, which retires it. This is how the human list shrinks without waiting for a bug.

## Finds

A box with a draft path is a find. `round` lists each one in the round plan's Finds section with its scenario id, browsers and draft, and P6 runs the Bug fix playbook on it, one session per find. The fix lands with a test tagged with the scenario id at the card's `layer` or lower, and a find that shows the card's `expect` was wrong gets a new id under Scenario's rule. Publishing a draft waits for the owner's word, through Maintainer.

## Steps

- **Before** "Route through the **how** skill": pick the mode. For `round`, read the registry, `docs/sweep/pages.md` and every `docs/sweep/<page>.md`, run `pnpm kb <id> --json` for each card, and write the round plan with the plan-page skill, `Topic: sweep` and `Playbook: sweep`. Its Defaults hold the human-minutes cap; round 1's is two working days, and each later round's is the last round's minutes, minus the retired scenarios' minutes, plus the minutes of scenarios for named new finds.
- **Replace** "Produce the `how`-shaped output": `prep` writes the cards by Picking scenarios and adds their boxes to the round plan; `round` writes the plan, its Finds section from the last round's boxes and, for a later round, its retired, due, new-page and convert counts.
- **Replace** "Apply the **unslop** skill to the reply": write the reply clean as drafted, and give the round plan one `unslop` pass, as `AGENTS.md`'s Writing passes rule says. The reply is the page link.
