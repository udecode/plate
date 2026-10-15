# Sweep: a durable scenario file per page, retired by test tags `pnpm kb` already reads

I read every file in the grounding and changed nothing outside my plan file. The core idea: tests that `pnpm kb` already indexes decide which scenarios retire, so nobody has to keep a second list in sync.

## Problem

The owner wants P1 to P6 human testing to run well and to shrink each round. That means:
- prepared scenarios for each page, aimed at what agents and their tests have missed;
- each find captured once, and made public only by the user's word;
- P6 fixing each find with a test at the lowest layer that can see the bug;
- covered scenarios dropping out of later rounds.

Agent-run testing comes later.

Four existing facts constrain the shape:
- **Law directory.** `knowledge.mjs` reads every `docs/editor-behavior/*.md` except `current-evidence.md` as law. Scenarios cannot live there without becoming a second law format.
- **kb already answers "is this covered".** `pnpm kb <tag>` lists each test whose title carries `[EDIT-…]` or `[plate#N]`, with the gate that runs it. The tag pattern is at `tooling/scripts/knowledge/knowledge.mjs:59`, and the gates are `plite CI`, `pnpm check`, `manual` and `none`. I ran `pnpm kb EDIT-CAPTION-NAV-003` and it printed both tests with `manual (chromium, firefox, webkit)`.
- **P1 and P3 are already derivable.** `getPliteExampleStatus` in `apps/www/src/app/(app)/examples/plite/plite-example-registry.ts` returns `'new'` for any example not in `UPSTREAM_PLITE_EXAMPLE_PATHS`. That is the blue dot.
- **www browser specs gate nothing.** kb marks `apps/www/tests/browser` as `manual`, because no CI job runs it.

## Usage (caller's view)

**Round 1**

1. natamox types `/sweep round 1`. This writes `docs/plans/<date>-sweep-r1.md` (`Playbook: sweep`) with every page grouped P1 to P5:
   - P1 and P3 come from `getPliteExampleStatus`.
   - P2 comes from the pair table in `docs/sweep/pages.md`.
   - P4 is every beta docs example with no pair.
   - P5 is the area rows of `pages.md`.

   Pages show "no scenarios" until they are prepared.
2. natamox types `/sweep prep P1`, then `P2` through `P5`, one session each. One page also works: `/sweep prep forced-layout`. Each run:
   - writes or updates `docs/sweep/<page>.md`;
   - adds one box per scenario and engine to the round plan;
   - hands back the page with the round's total human minutes against the cap.
3. natamox runs the boxes in the stated browsers and devices.
   - A pass is a tick.
   - A failure gets a recording, plus the reference page's recording for P1 and P2. natamox then types `/sweep find SW-forced-layout-01 beta.mov slate.mov`. This runs `maintainer`'s issue-draft in draft-only mode, prefilled from the scenario (route, steps, expected result and its authority, reference as baseline). It adds row F1 to the plan's Finds table with the draft path.
4. The owner says "publish F1 F3". Maintainer's existing publish route runs, and the issue number goes into F1's row and into the scenario's `checks`.
5. P6 runs one session per find: `fix plate#5150`, or `diagnose <draft path>` for a find that stays unpublished. The project Bug fix playbook runs with one new delta: the test title ends with the scenario's tags, at its `retire-at` layer or lower. The user commits.

**Round 2**

`/sweep round 2` runs `pnpm kb <tag> --json` on each scenario's `checks` tags.
- A tag on a test whose gate is neither `manual` nor `none` retires the scenario.
- `retire-at: human` scenarios always stay.
- New registry pages arrive with no scenarios.

Its report reads like "retired 14, due 61, new pages 5, convert 9". "Convert" means a scenario passed the last two rounds and is observable below `human`. Those go to agents as chips that ask for a test, which is the existing main workflow, not agent-run testing.

## Shape

### Files

| File | Role |
| --- | --- |
| `.agents/rules/sweep.mdc` | Thin entry in verdict's shape. `argument-hint: '[round <n> \| prep <P1-P5\|page> \| find <scenario> <video...>]'`. Says "Run the Sweep playbook in full", loads `pstack:poteto-mode` and runs `check-playbooks.mjs`. |
| `.agents/playbooks/sweep.md` | `extends: investigation`. Sections: Modes (round, prep, find), Scenario budget, Steps as anchored deltas. |
| `docs/sweep/pages.md` | The only hand-written list: P2 pairs (stable URL to beta URL, such as `slate-to-html` to `html-export`) and P5 areas (operations, navigation, cursor, selection, against Google Docs, Notion, Lexical and Tiptap). |
| `docs/sweep/<page>.md` | One page's lasting scenarios. |
| `docs/plans/<date>-sweep-r<n>.md` and `.decisions.tsv` | One round: boxes per scenario and engine, a Finds table (id, scenario, engine, draft, issue, fix plan, state), Defaults and the minutes cap. |
| `.agents/playbooks/bug-fix.md` | One new **After** bullet. |

### One scenario

A scenario is one page, one gesture sequence and one starting state. Its engine list is a field, so one browser does not make a separate scenario. Each box in the round plan is one scenario on one engine, and holds that result.

```
### SW-forced-layout-01 Enter at end of title adds a line
- priority: P1
- page: https://beta.platejs.org/examples/plite/forced-layout
- reference: https://www.slatejs.org/examples/forced-layout
- engines: Chrome Mac, Safari Mac, Safari iPhone
- given: caret at the end of the title
- do: Enter, type "a"
- expect: "a" in a new paragraph under the title, as on the reference
- must-not: "a" joins the title; any console error
- blind-spot: demo wiring and deploy drift (b1e70bb257)
- checks: plate#5150
- retire-at: unit
- minutes: 2
```

These rules make the format safe:
- **`expect` cites its authority:** the reference page, an `EDIT-*` id or an issue. It never states new law. New law goes into `markdown-editing-spec.md` during P6, through its existing owner.
- **`checks` holds only tags.** Whether a scenario is retired is always computed from kb and never written down, so there is one source.
- **`retire-at`** is `unit`, `browser`, `device` or `human`. `human` covers what no observer here can see, such as the OS drag image (`791a53f92c`, 105 green runs) or the real iPhone keyboard closing. Those never retire, which keeps the "zero manual" target honest.

### Playbook deltas over pstack `investigation`

- **Before** "Route through the **how** skill": pick the mode and the round plan. For `round`, derive the page list and run the kb retirement query.
- **Replace** "Produce the `how`-shaped output":
  - `prep` writes scenarios under the Scenario budget;
  - `find` runs issue-draft in draft-only mode and adds the Finds row;
  - `round` writes the plan and its retired/due/new/convert report.
- **Replace** "Apply the **unslop** skill to the reply": write the reply clean as drafted. The plan gets one `unslop` pass, as the Writing passes rule says.

### Scenario budget (why this is not a full checklist)

For each page:
1. List the behavior both sites share for P1 and P2, or the page's own behavior for P3 and P4. Beta-only behavior on a P1 or P2 page becomes a P3 or P4 scenario.
2. Rank by the census surface counts and miss classes.
3. Drop every row a model test could observe (`retire-at: unit`) where nothing gives a reason to doubt that test. It goes to agents as a test-writing chip, not to a person.
4. Keep the rows where the census shows a lying observer: native keys, focus and first click, paint, scrolling during a gesture, devices, and cross-feature state on the real page.
5. Shape each kept row with verify's Scenario Generator axes and its reverse-leg rule.
6. Cap at five scenarios per P1 or P2 page and three per P3 or P4 page, under a round-wide minutes cap set in Defaults.

### Bug fix delta

**After** "Verify on the same surface": a fix for a sweep find ends its test title with the scenario's `checks` tags. The test sits at the scenario's `retire-at` layer or lower, using verify's "smallest boundary that observes it", and runs under a gate other than `manual`.

### What it deliberately does not do

No YAML, no new law file, no checker, no hook, no book, no agent runner.

## Tradeoffs accepted

- **One hand-written list.** `pages.md` lists the P2 pairs, because stable-to-beta renames are not derivable. In exchange, an unpaired beta page falls into P4 on its own, so a forgotten pair shows up to the tester as a wrong priority instead of a silent gap.
- **Retirement needs a gated test.** A fix covered only by a www browser spec leaves its scenario on the manual list until that suite runs in CI. I accept this because "covered by a test nobody runs" is the census's own failure: 44 fixes changed such specs.
- **No script in round 1.** In round 2 the retirement query is per-tag `kb` calls made by the agent. A `sweep due` script (about 50 lines over `loadIndex`) waits until round 2 shows the manual calls are too slow.
- **Results live only in round plans.** "Passed twice" is read from the last two plans rather than stored anywhere.

## Alternatives considered

- **No new skill or playbook:** a round plan through the Plan playbook, verify's Scenario Generator and the census by hand. It loses because the budget, the P1/P2 routing and the retirement query would be re-derived by whoever writes each round plan. It is cheap, so it is the trial's simplest arm.
- **Scenarios as `test.fixme` stubs in the file of the test that would retire them.** Retirement would be exact. It loses because devices, P5 and human-only checks have no test file, and testers would be reading test code.
- **Scenarios only in round plans, copied forward each round.** It loses because the plan gets re-copied every round, and a P6 session cannot find a page's scenario.
- **natamox's YAML case store.** It loses because it is a second law format.

## Must-answer questions

1. **Which playbook:** pstack `investigation`, like verdict, because prep is a read-only pass whose output is a page plus scenario files. The three deltas above quote "Route through the **how** skill", "Produce the `how`-shaped output" and "Apply the **unslop** skill to the reply". P6 stays pstack `bug-fix` through the project playbook, with one **After** delta on "Verify on the same surface".
2. **One scenario:** the fields above. The unit is one page, one gesture sequence and one start state, with engines as a list. A round's list lives in its round plan. A scenario that survives several rounds lives in `docs/sweep/<page>.md`.
3. **How scenarios are made:** from the page source and its reference page, the census surfaces and miss classes, verify's Scenario Generator axes, and the `EDIT-*` rules kb finds for the page's features. The budget avoids a full checklist by dropping rows a model test can observe and by capping each page.
4. **How a test retires a scenario:** the scenario's `checks` tags. The retiring test carries them, and `pnpm kb <tag>` reports which gate runs it, so retirement is derived and no list is kept in sync by hand.
5. **Page lists:** P1 and P3 from `getPliteExampleStatus`. P2 from the `pages.md` pairs. P4 is every beta docs example with no pair. Beta-only behavior on a P1 or P2 page gets P3 or P4 priority.
6. **natamox's draft:**
   - *Kept:* given/when/then/not (as given/do/expect/must-not), surface (as `retire-at`), origin (as `blind-spot`), `[EDIT-…] [plate#N]` test titles, the report handed to issue-draft, and pilot before full sweep.
   - *Cut:* YAML, moving the 224 rules, the book and player, the hook, K2, K16, K17, and three of the five modes.
7. **The trial:** a temporal holdout.
   - Every arm runs at a commit before 2026-09-28 and sees only census-a as history.
   - The arms are the skill, the incumbent (the lead preparing checks with `verify`) and the simplest alternative (the Plan playbook).
   - All arms get one organic request: "prepare what I should check by hand on these pages".
   - A separate agent writes the key from census-b fixes (2026-09-28 to 2026-10-15) that reproduce on a P1 to P4 page.
   - A blind grader counts each held-out bug whose trigger some scenario would hit, per estimated human minute.
   - It is fair because the arms share the commit, the pages, the cap and the inputs, and the key lies in their future, so no arm or lead has seen it.
   - Keep rule, frozen before any arm runs: the skill stays only if it hits more held-out bugs than the incumbent at no more minutes.
8. **Smallest version that reaches outcomes 1 to 5:** the entry skill, the playbook with `round`, `prep` and `find`, `pages.md`, the page files and the bug-fix delta. No scripts. Agent-run testing (outcome 6) slots in later as a `run` mode that ticks the same boxes with an agent recorded as the runner.

## Open questions and risks

- Should www browser specs count as gated for retirement before CI runs them?
- What is the human-minutes cap per round?
- Do `[plate#N]` tags list their tests in kb the way `EDIT-*` tags do? I confirmed it for `EDIT-CAPTION-NAV-003`. `pnpm kb plate#5126` showed no tests, which may only mean no test carries that tag yet. Retirement depends on this, so it gets probed first.

## Next implementation step

Run `pnpm kb` against a test whose title carries a `[plate#N]` tag to prove retirement can be derived. Then write `.agents/playbooks/sweep.md` with its three deltas and pilot `prep` on two P1 pages: `forced-layout` and `hovering-toolbar`, where the probe already found candidates.

The same package is saved at `/Users/zbeyens/.claude/plans/you-are-one-runner-shimmying-gray.md`.
seat: claude-opus-5-5 @high
exit=0
