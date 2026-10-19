## Problem

Build a human sweep workflow whose workload shrinks after each P6 fix. Add one Plate-specific `sweep` entry that prepares rounds and records their results. Keep reproduction and proof in `verify`, capture in Maintainer, and repair in Bug fix.

The crucial distinction is between a **scenario**, which describes one concrete execution, and **behavior law**, which defines intended behavior. The workflow needs durable scenarios, not another law format.

## Usage

These are proposed commands after natamox builds the workflow.

1. **Natamox prepares the round:**

   ```text
   sweep r1
   ```

   Produces `docs/plans/2026-10-15-human-sweep-r1.md`, its decision log, and prepared scenarios grouped under every P1–P5 page. Each scenario states the browser/device, starting state, actions, expected observations and forbidden observations.

   Preparation does not execute scenarios. An unresolved page pair or missing prerequisite prevents the round from being called ready.

2. **Natamox and the owner work through P1, P2, P3, P4, then P5.** They record ordinary results in the sweep session:

   ```text
   sweep r1 results HUMAN-001 pass; HUMAN-002 blocked: Safari unavailable
   ```

   A find goes directly through the existing capture owner:

   ```text
   maintainer issue-draft HUMAN-003:
   Beta forced-layout, Chrome/macOS.
   Enter at the title end, then type x.
   No paragraph appears; x joins the title.
   Slate creates a paragraph.
   Evidence: <recording paths>.
   draft only
   ```

   Maintainer produces its normal local title/body packet. The round stores only its link beside `HUMAN-003`. Nobody rewrites the report into a second intake form.

3. **After the P1–P5 pass, the owner starts P6:**

   ```text
   Fix <local draft path>. Use HUMAN-003 as the acceptance scenario.
   ```

   One fresh session handles each find. Bug fix reproduces it, repairs the owning layer, adds or corrects the regression test, and verifies the original interaction through `verify`.

   The proving test receives `[HUMAN-003]`, plus an existing `EDIT-*` tag when applicable. A public issue tag is added only when an issue actually exists.

   Publication remains independent:

   ```text
   maintainer issue-draft <draft path>: publish this issue
   ```

   That explicit word authorizes Maintainer’s publication route. Publication is not a prerequisite for a local fix.

4. **Natamox closes the round:**

   ```text
   sweep r1
   ```

   Resumes the existing plan. It reports passes, blocked checks, unresolved finds, P6 outcomes and remaining automation gaps. It neither starts another fix nor creates another round.

5. **After the owner commits and makes the repaired build available:**

   ```text
   sweep r2 after r1
   ```

   Produces the next round from the current inventory and live test links. Qualified scenarios disappear from the human queue. Uncovered scenarios retain their IDs; new pages and newly exposed journeys receive new scenarios.

   If beta still serves the old build, the workflow cannot treat its repaired scenarios as retired.

## Shape

### 1. Playbook inheritance

Use `.agents/playbooks/sweep.md` with `extends: investigation`.

P1–P5 prepare checks and collect findings without changing product code. P6 remains a separate Bug fix session. Investigation therefore fits better than Bug fix, Prototype or Eval.

Apply these anchored deltas to [pstack’s Investigation](</Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.84/skills/poteto-mode/playbooks/investigation.md>):

- **Replace** “Route through the **how** skill”: perform the Plate inventory, pairing and scenario preparation described below, using existing source owners and `verify`.
- Keep “Throughput checkpoint stays one line” unchanged.
- **Replace** “Produce the `how`-shaped output”: write or resume the round plan through `plan-page`, with scenarios, results, finding links and proof limits.
- **Replace** “Apply the **unslop** skill to the reply”: apply the repository’s writing and hand-back rules.

The thin `.agents/rules/sweep.mdc` follows [Verdict’s entry pattern](/Users/zbeyens/git/plate-2/.agents/rules/verdict.mdc): load poteto-mode, run `check-playbooks.mjs`, then run the extended playbook in full.

### Files and ownership

| File | Sections or fields | Writer |
|---|---|---|
| `.agents/rules/sweep.mdc` | Description, argument hint, entry instructions | Workflow implementation |
| `.agents/playbooks/sweep.md` | Inheritance, arguments, preparation method, result handling, anchored deltas | Workflow implementation |
| `docs/testing/human-scenarios.md` | Pair exceptions; stable scenario cards | Sweep preparation |
| `docs/plans/<date>-human-sweep-<round>.md` | Standard plan-page sections; Round inputs, Pages, Scenarios, Findings, P6 outcomes, Verification, Open work | Round’s sweep session |
| Matching `.decisions.tsv` | Existing decision-log format | Round’s sweep session |
| Maintainer’s local title/body files | Existing issue-draft packet | Maintainer |
| Existing test files | Assertions and scenario tags | Each P6 fix session |

Screenshots and recordings stay in the normal ignored artifact directory. Durable reproduction text stays in the Maintainer packet.

The round’s `page-lead` sections expose Pages, Scenarios and Findings on the rendered page. Preparation and completion use proof-bearing checkboxes.

### 2. One scenario

A scenario is **one journey on one page in one concrete environment**. A Firefox journey and an iPhone Safari journey have separate IDs when their risks differ.

Each durable Markdown card contains:

- Stable `HUMAN-*` ID and short title.
- Page key.
- Browser, OS/device and relevant viewport/input method.
- Starting document, selection, focus, mode and reset instructions.
- Ordered actions, including necessary follow-up typing or undo.
- Expected and forbidden observations.
- Authority links: existing law, owning contract or explicitly observed reference behavior.
- Provenance: relevant census miss, report or source.
- Why this environment and journey need human attention.

There is no authored `retired` field or maintained test-path list.

The durable catalog holds scenarios that survive rounds. Each round holds scenario IDs, their frozen revision, assignment and result:

```text
pending
pass — observed by <tester>, at <build>
find — <Maintainer packet>
blocked — <reason>, owner, revisit trigger
```

Historical rounds retain their original meaning. A changed acceptance contract receives a new scenario ID.

This makes contradictory completion states harder to express, per type-system-discipline.

### 3. Producing scenarios without a giant checklist

For each page, preparation reads:

1. Its actual source, controls and reference page.
2. Relevant past misses from the census and proof-blindness evidence.
3. `verify`’s [Scenario Generator](/Users/zbeyens/git/plate-2/.claude/skills/verify/references/editor-proof.md:154).
4. Applicable behavior law and existing tests, discovered through `pnpm kb`.

Choose the smallest set of journeys that exercises the page’s meaningful risks. Do not multiply every generator axis.

Examples:

- Forced-layout: Enter at the constrained title boundary, then type.
- Floating toolbar: first activation from a real selection, followed by typing and undo.
- Virtualized content: reverse selection movement through a materialization boundary.
- Native drag: observe the actual drag image.

Each selected journey names its risk rationale. Every page gets an initial load/render check and its relevant interaction journeys. Existing qualified coverage can remove those journeys from human execution.

The census informs priorities; its commit counts do not prove coverage. `verify` already requires the smallest risk matrix and expansion after a missed journey.

### 4. Retirement without a hand-synced list

Extend the existing knowledge index with `[HUMAN-*]` test-title tags and exact scenario lookup:

```text
pnpm kb HUMAN-003 --json
```

The result joins the scenario to current test locations, runner membership, engine scope and skip information. Extend the existing tag validation to reject unknown scenario IDs. Do not build another test scanner or coverage registry.

A test receives a scenario tag only after the fixer reads its setup, actions and assertions against the **whole scenario**. This follows the existing rule-tag discipline in [Coding standards](/Users/zbeyens/git/plate-2/CODING_STANDARDS.md).

Retirement requires:

- The test observes every required result at the appropriate layer.
- Its environment scope covers the scenario.
- It passed for the named defect after failing before the fix.
- An applicable gate runs it.
- The round’s target build contains the repair.

Current [knowledge indexing](/Users/zbeyens/git/plate-2/tooling/scripts/knowledge/knowledge.mjs:693) distinguishes gated Plite Chromium tests from manual-only www browser tests. A www spec therefore cannot retire a scenario merely because it exists. Necessary gate wiring belongs to that P6 repair; this workflow does not front-load a whole-suite CI project.

A deleted, skipped or ungated proving test makes the scenario eligible again. The round’s retirement table is a generated receipt, never an input.

### 5. Priority and page pairing

The round’s Pages table contains:

```text
page key | priority | beta URL | reference URL |
shared behavior | excluded new behavior | classification evidence
```

- **P1:** derive candidates from the [Plite registry](/Users/zbeyens/git/plate-2/apps/www/src/app/%28app%29/examples/plite/plite-example-registry.ts). Upstream paths pair with Slate. Non-upstream additions, including experimental additions, go to P3. Do not silently discard hidden registered examples.
- **P2:** derive beta pages from `verify`’s canonical docs owners, including registry-generated and custom app routes. Verify their stable counterparts. Store only non-mechanical pair exceptions durably, including `slate-to-html` → `html-export`.
- **P3/P4:** receive new pages and new behavior within otherwise paired pages. A shared page may appear in both priorities with different journeys.
- **P5:** use surface-specific standard-editor references. Existing-law violations become bugs; proposed product gaps go to Verdict before implementation.

A missing reference does not establish that something is new. Unresolved classification remains visible until preparation settles it.

### P6 and future execution

P6 inherits [Bug fix](/Users/zbeyens/git/plate-2/.agents/playbooks/bug-fix.md), including exact-surface reproduction, owning-layer repair and failed-fix recovery.

Unit or integration tests are the default. Browser tests are required when the missing observation is native focus, caret geometry, paint or input ordering. A model assertion cannot retire cursor drift.

If no repeatable observer can see the defect, preserve the automation gap and human scenario. Do not invent coverage to claim completion.

The scenario card is the future agent executor’s input. Version one supplies no executor or agent-first lane.

### 6. Natamox’s draft

Keep the concrete journeys, positive and negative observations, provenance and test-link intent.

Drop the YAML law migration, animated book, edit hook, five-mode `behavior` skill and three new paperwork checks. Existing editing law stays in the existing `EDIT-*` format. Scenario cards are execution recipes, not another authority.

Report, fix and proof continue through their existing owners. This preserves capabilities while deleting duplicated ownership, as [workflow-change.md](/Users/zbeyens/git/plate-2/.agents/playbooks/references/workflow-change.md) requires.

### 7. Trial before adoption

Trial the first working scratch prototype **before the plan’s panel**, as [Plan requires](/Users/zbeyens/git/plate-2/.agents/playbooks/plan.md:15).

Freeze three variants:

- Incumbent: lead prepares the round using `verify`.
- Simplest alternative: existing owners plus a round-plan template.
- Proposed: `sweep`, durable scenarios and knowledge-index links.

Give fresh contexts the same checkout, page scope, preparation budget and organic request. Then give each the same human returns and ask for the next round.

A separate author creates a sealed `receipts.json` answer key outside candidate workspaces. It contains independently established journeys, routing decisions and retirement controls. The lead sees only its path until grading ends. A separate blinded grader scores all arms together and inspects transcripts for actual owner loading.

The key is fair because every arm receives the same discoverable inputs and returns. It rewards observable coverage and correct retirement, not matching the proposal’s file layout.

Freeze the keep rule beforehand: zero authority or false-retirement failures; materially better hidden-journey coverage than both controls at no greater human workload. A tie keeps the simpler alternative. An unrun trial remains pending.

### 8. Smallest complete version

One thin entry, one extended playbook, one Markdown scenario catalog, existing round plans and Maintainer packets, and the small knowledge-index extension.

That reaches outcomes 1–5 without a dashboard, comparison runner, law migration, agent executor or general CI overhaul.

## Tradeoffs accepted

- We accept durable scenario IDs in exchange for reliable cross-round joins.
- We accept scenario review before tagging in exchange for avoiding a second assertion language.
- We accept some remaining manual checks where automation lacks the required observer.
- We accept a small knowledge-tool extension because it removes a maintained coverage list.

The public surface hides inventory, pairing, scenario selection and retirement policy. Capture and repair remain visibly separate because they carry different authority. This keeps the call chain short, per minimize-reader-load.

Repeated preparation resumes by round ID and preserves recorded results, per make-operations-idempotent.

## Alternatives considered

**Existing owners and a round plan only:** strongest control. It adds no skill or playbook and wins if the trial finds no material difference. It loses my design comparison because callers must repeatedly coordinate pairing, scenario persistence and retirement.

**Put sweep method inside `verify`:** hides preparation behind an existing entry, but expands the proof owner into team scheduling and priority policy.

**Natamox’s behavior platform:** exposes several modes, formats and generated artifacts before improving the human round.

## Open questions and risks

- Can native drag-image paint gain a repeatable observer? Until then, that scenario stays human.
- Can beta’s served build be identified reliably? Unknown identity prevents deployment-based retirement.
- Will the blinded trial justify the added entry? If not, retain the simpler control.

## Next implementation step

Build the scratch prototype of round preparation and scenario-to-test lookup, then run the frozen three-arm trial before adoption; implementation must update `AGENTS.md`, the contributor guide and generated skill mirrors while leaving commits on `next` to the owner.
seat: gpt-6.1-sol @xhigh
exit=0
