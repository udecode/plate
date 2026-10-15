---
extends: investigation
when: Use it for "sweep", "sweep round <n>", "sweep prep <P1-P5 | page>", or to prepare, resume or close a round of the team's hands-on pass over beta.
page-lead: Pages, Cards due, Finds
---

# Sweep

The team's hands-on pass over beta runs in the owner's order. P1 checks each beta Plite example against its Slate original, P2 each beta Plate page with a live demo against the same page on platejs.org, P3 the other Plite examples, P4 Plate demos with no stable twin and P5 gaps against standard editors. P6 then fixes each find, one session per find, through the Bug fix playbook, and the next round repeats P1 to P5. This playbook keeps the rounds: the pages, the cards and which cards are due. `verify` picks new cards. Nothing here runs a card; agent-run cards are later work.

## Modes

| Arguments | Does |
| --- | --- |
| `round <n>` | Creates or resumes the round plan `docs/plans/<date>-sweep-r<n>.md`: the pages grouped P1 to P5, the cards due with the reason each is due, the cards that left the list with the test that covers each, new and unresolved pages, and the round's time budget. |
| `prep <P1-P5 \| page>` | Asks `verify`'s Scenario Generator for a page's new cards within the page's cap, writes them to `docs/sweep/cards/<page>.md`, and adds one box per card and browser to the round plan. |

A person ticks each box pass, find or blocked, with the browser and the beta build. For a find, they run Maintainer's issue-draft with the beta recording, and the reference recording when the page has a reference, name the card id in the draft, and write the draft's path on the box.

## Pages

- P1 is every path in `UPSTREAM_PLITE_EXAMPLE_PATHS` that `HIDDEN_EXAMPLES` leaves out (`apps/www/src/app/(app)/examples/plite/plite-example-registry.ts`), beside `https://www.slatejs.org/examples/<path>`. `android-tests` belongs to the Android device lane.
- P2 is every English docs page with a live demo, as `readSources` in `tooling/scripts/hand-drive.mjs` lists them, plus the registry's example and component pages that `getRegistryStaticParams` in `apps/www/src/app/(app)/docs/[[...slug]]/doc-page.tsx` builds, plus the playground, each beside the same page on platejs.org. `docs/sweep/pages.md` lists the pairs whose names differ, such as `slate-to-html` and `html-export`, and the P5 areas.
- P3 is every other registered Plite example, hidden and experimental ones included. P4 is a beta docs demo with no stable twin. A page whose pairing is unsettled stays unresolved and keeps the round open.

## Cards

A card is one page, one starting state and one sequence of actions, in `docs/sweep/cards/<page>.md`:

```md
### SWEEP-FORCED-LAYOUT-001 Enter at the end of the title adds a line
- page: https://beta.platejs.org/examples/plite/forced-layout
- reference: https://www.slatejs.org/examples/forced-layout
- on: Chrome Mac, Safari Mac, Firefox Mac, Safari iPhone
- given: caret at the end of the title
- do: Enter, then type "a"
- expect: "a" sits in a new paragraph under the title, as on the reference
- must-not: "a" joins the title
- layer: unit
- minutes: 2
- fixed-by: plate#5150
- covered-by: packages/plitejs/test/forced-layout.test.ts "Enter at the end of the title adds a paragraph [plate#5150]" @ 3f9a2c1d
```

- `on` lists every browser and device of the round, unless an issue or an `EDIT-*` rule the card cites names the engines the bug shows in.
- `layer` is the lowest layer that sees the bug: `unit`, `browser`, `device` or `human`.
- `expect` cites the reference page, an `EDIT-*` rule or an issue. A card is a hand script, not law, and nobody keeps a coverage count by hand, as `verify`'s rule against a second registry asks.
- `fixed-by` and `covered-by` are written by the fix. `covered-by` names the one test that checks the whole card and a hash of that test's own body when someone last read it against the card.
- An id never changes meaning. A changed `expect` gets a new card, and the old card says which card replaces it.

## Cards due

`node tooling/scripts/sweep-due.mjs` decides each card's status from the cards, the last round's boxes and the `pnpm kb` index. A card leaves the hand list only when all of these hold:

1. Its `covered-by` test exists, is not skipped and runs in a gate other than `manual`.
2. For a `unit` card, any such gate counts. For a `browser` card, the test runs gated in every engine the card's `on` maps to: Chrome to `chromium`, Firefox to `firefox`; Safari and the iPhone map to no gate today. `device` and `human` cards never leave.
3. The test's body hash still matches the card's. When it changed, the card is due until the changed test fails at the fix's parent with `tooling/scripts/proof-worktree.mjs` and someone writes its new hash on the card, or until a fix restores the test.

Every other card is due, and so is every box marked blocked. The round plan copies the script's reasons.

## Page health

Each round runs `node tooling/scripts/sweep-health.mjs` once against the deployed beta pages in Chromium, Firefox and WebKit. It loads every scoped page, fails on any page error, and lists each failing page as a find. A person opens each P1 page once on the iPhone. This check never leaves the round.

## Done

A round is done when every scoped page is classified, every due card ran in every browser it names, no new P1 to P4 bug was found and every P5 gap has a verdict. A blocked card or an unresolved page keeps it open. On a deadline, the open cards and pages hand off as unfinished, never as done.

## Finds

A box with a draft path is a find. `round` lists each one in the round plan's Finds section with its card, browsers and draft, and P6 runs the Bug fix playbook on it. Publishing a draft waits for the owner's word, through Maintainer.

## Steps

- **Before** "Route through the **how** skill": pick the mode. For `round`, read the registry, `hand-drive.mjs`'s page list, `docs/sweep/pages.md`, every card and the last round plan, then run `sweep-due.mjs`. Write the round plan with the plan-page skill, `Topic: sweep` and `Playbook: sweep`. Its Defaults hold the round's time budget: page health, seed cards for new finds and reporting come first, then the due cards, then new cards, within the caps of five cards per P1 or P2 page and three per P3 or P4 page.
- **Replace** "Produce the `how`-shaped output": `prep` writes the cards and their boxes; `round` writes the round plan, its Finds section from the last round's boxes, and its due, left, new-page and unresolved lists.
- **Replace** "Apply the **unslop** skill to the reply": write the reply clean as drafted, and give the round plan one `unslop` pass, as `AGENTS.md`'s Writing passes rule says. The reply is the page link.
