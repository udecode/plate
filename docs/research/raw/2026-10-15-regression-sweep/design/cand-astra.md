## Problem

Build **`sweep` as a preparation-only skill**. It produces a human round plan, then hands reporting and repairs to their existing owners.

The missing capability is repeatable preparation and retirement of manual scenarios. `verify` already owns proof selection; Maintainer owns reports; Bug fix owns repairs. The workflow must preserve those boundaries, the owner’s commits on `next`, and explicit authorization for public posts.

## Usage (caller’s view)

These are proposed calls, not commands executed during this design.

1. **Natamox builds the accepted workflow**

   ```text
   execute docs/plans/2026-10-15-regression-sweep.md
   ```

   The implementation includes the prototype trial described below, routing, instructions and documentation.

2. **Natamox prepares round one**

   ```text
   $sweep docs/plans/2026-10-19-human-sweep-r1.md
   ```

   This produces a plan page with every scoped page accounted for, reference pairs, prepared scenarios grouped P1–P5, and a decision log. It performs no scenario interactions.

3. **Natamox and the owner run P1–P5 in order**

   | Phase | Human work |
   |---|---|
   | P1 | Run each prepared shared-behavior scenario on Slate and its beta Plite twin. |
   | P2 | Run each prepared shared-behavior scenario on stable Plate and its beta twin. |
   | P3 | Run scenarios for Plite additions. |
   | P4 | Run scenarios for Plate additions. |
   | P5 | Run selected journeys against the named standard-editor reference. Record differences before deciding they are defects. |

   They mark each assigned scenario `pass`, `find`, or `blocked`, with the actual browser/device and build. A blocked scenario remains unfinished.

   A find is captured through the existing route:

   ```text
   $maintainer issue-draft draft only
   Round: docs/plans/2026-10-19-human-sweep-r1.md
   Scenario: sweep-20261019-r1-007
   Beta recording: /captures/forced-layout-beta.mp4
   Reference recording: /captures/forced-layout-slate.mp4
   Reference: https://www.slatejs.org/examples/forced-layout
   ```

   Maintainer produces one local title/body packet. The round links that packet; nobody retypes its reproduction into another form.

4. **The owner starts P6**

   ```text
   Fix the finds linked from this round, one session per find,
   one at a time. Use the Bug fix playbook.
   ```

   Each session produces an owning-layer fix, a new or corrected regression test, old-code failure and final-code success evidence, and exact reporter replay. It leaves changes for the owner to commit.

   Publication is separate and optional:

   ```text
   $maintainer issue-draft publish <saved-draft-path>
   ```

5. **Natamox starts round two after the target build includes the fixes**

   ```text
   $sweep docs/plans/2026-10-26-human-sweep-r2.md
   ```

   Preparation rediscovers pages and coverage. Proven scenarios disappear from the human queue; uncovered, reopened and newly relevant scenarios remain.

## Shape

**1. Extend pstack’s Investigation playbook.**

Create `.agents/playbooks/sweep.md` with `extends: investigation`, a precise human-round trigger, and `page-lead: Pages, Human scenarios, Findings, Coverage`.

Use these anchored deltas:

- **In** `"Route through the **how** skill"`: map the round through canonical route owners, prior rounds, the census, behavior authority and `verify`. Reuse existing grounding.
- **After** `"Route through the **how** skill"`: prepare the bounded scenarios and resolve their current coverage.
- **Replace** `"Produce the `how`-shaped output"`: produce the round plan and decision log.
- **Replace** `"Apply the **unslop** skill to the reply"`: apply the project’s page-writing and hand-back rules, as Verdict does.

Keep Investigation’s read-only product boundary. Preparation writes planning artifacts, not product changes. P6 leaves this playbook and enters Bug fix.

These anchors come from [Investigation](/Users/zbeyens/.claude/plugins/cache/pstack-claude/pstack/0.9.84/skills/poteto-mode/playbooks/investigation.md); the entry pattern follows [Verdict](/Users/zbeyens/git/plate-2/.agents/rules/verdict.mdc).

**Files and ownership**

| File | Sections or fields; writer |
|---|---|
| `.agents/rules/sweep.mdc` | `description`, `argument-hint: '<round-plan>'`; loads poteto-mode, checks playbook anchors, runs Sweep. No method duplicated here. |
| `.agents/playbooks/sweep.md` | Frontmatter, preparation contract, scenario shape, retirement rule, anchored steps. |
| `docs/plans/topics/human-sweep.md` | Existing subject-page shape; purpose, current usage and boundaries. No scenario registry. |
| `docs/plans/<date>-human-sweep-r<N>.md` | `Status`, `Topic: human-sweep`, `Playbook: sweep`; Brief, Teach, Defaults, Pages, Human scenarios, Findings, Coverage, Steps with proof, Close. |
| Matching `.decisions.tsv` | Existing decision-log columns and append helper; classification, coverage and unresolved decisions. |
| `docs/plans/artifacts/<round>/finds/<find>/` | Maintainer’s existing title/body files and evidence. No second report schema. |
| Existing fix plan and tests | Bug fix’s acceptance, diagnosis, red/green evidence and final proof. |
| `AGENTS.md`, contributor guide | Precise discovery route and usage; generated skill mirrors come from `pnpm run prepare`. |

The round preparer owns the round files. Each fixer owns its own fix plan and tests. The preparer reads those results when refreshing coverage.

**2. One scenario is one replayable journey on one page in one named environment.**

Its fields are:

- Stable `id`, such as `sweep-20261019-r1-007`.
- Phase and page-pair reference.
- Browser/version, OS/device, viewport and relevant profile or input method.
- Starting document, modes, focus and selection.
- Ordered human actions, including necessary follow-up input.
- Expected observations and forbidden observations.
- Authority links and whether the expectation is settled or exploratory.
- Past-miss citation and the reason this environment matters.
- Optional `supersedes` when the journey’s contract changes.

A browser or device variation is another scenario only when it exercises a materially different risk.

The first round that introduces a scenario owns its definition permanently. Later rounds link that definition. Changed contracts receive new IDs. Preparation enumerates prior plans with `Topic: human-sweep`, rather than maintaining another catalog.

Round assignment rows contain only `scenario`, `tester`, `result`, actual environment/build and evidence/find links. Coverage rows are dated derivations, never editable `automated: true` flags.

These recipes do not establish behavior law. Settled editing expectations link the existing [behavior spec](/Users/zbeyens/git/plate-2/docs/editor-behavior/markdown-editing-spec.md:22). UI and export scenarios use their actual authority; that spec explicitly excludes several such concerns.

**3. Generate scenarios from page-specific risks, not a Cartesian checklist.**

Preparation reads:

- The reference page’s actual setup and shared behavior.
- The canonical route inventory and page implementation.
- Relevant census misses and their cited evidence.
- Existing tests and `pnpm kb` results.
- The applicable behavior rule.
- `verify`’s [Scenario Generator](/Users/zbeyens/git/plate-2/.claude/skills/verify/references/editor-proof.md:154) and relevant interaction oracles.

For each page, prepare its meaningful primary journey and the smallest additional journeys that expose relevant historical misses. Every additional scenario states what distinct failure it can reveal.

For example, a toolbar page needs selection, activation and the next typed key. A selection page may need reverse movement and duplicate-paint inspection. Neither automatically receives every gesture, engine and device.

The census supplies hypotheses about likely omissions, not measured failure probabilities. Hidden routes, frames, shadow roots and read-only examples remain in the inventory.

**4. Derive retirement from tests; never maintain a scenario-to-test table.**

A proving test includes the stable scenario ID as ordinary title text:

```text
preserves the first key after toolbar dismissal sweep-20261019-r1-007
```

Existing `[EDIT-*]` and `[plate#N]` tags remain when applicable. The scenario ID is execution provenance, not a new law ID or fabricated issue number.

Preparation uses:

```text
pnpm kb sweep-20261019-r1-007 --detail --json
pnpm kb <applicable-EDIT-ID-or-plate#N> --detail --json
pnpm kb gaps
```

The current knowledge tool already searches test titles and exposes runner, engine and skip information. Its rule-gap calculation accepts only non-skipped tests in recognized gates. It does **not** prove assertion adequacy. See [test discovery and gate classification](/Users/zbeyens/git/plate-2/tooling/scripts/knowledge/knowledge.mjs:560) and [gaps](/Users/zbeyens/git/plate-2/tooling/scripts/knowledge/knowledge.mjs:1278).

Retirement requires the preparer to establish all of these:

- The discovered test actually asserts the scenario’s required and forbidden outcomes.
- Its input and observation layer cover the named environment.
- The normal verification route runs it, with current passing evidence.
- The round’s target build contains the fix and covered behavior.
- No unresolved reporter symptom remains.

A unit test cannot retire cursor paint or physical-phone input. An ungated www browser spec cannot retire a recurring check merely because its title matches. P6 either connects the focused regression to normal verification or leaves the scenario manual.

Every preparation reevaluates historical scenarios, including previously omitted ones. Deleted, skipped, weakened or insufficient tests reopen the relevant journey. No test-path list needs synchronization after a move.

**5. List page pairs in the round, derived from canonical inventories.**

Each Pages row contains:

```text
page-id | phase | beta URL | reference URL |
mapping evidence | shared behavior | additions destination | scenario links
```

P1 derives membership from `UPSTREAM_PLITE_EXAMPLE_PATHS`; the [registry](/Users/zbeyens/git/plate-2/apps/www/src/app/(app)/examples/plite/plite-example-registry.ts) already distinguishes new and experimental examples. New and experimental examples go to P3. New behavior within an upstream example also gets P3 scenarios.

P2 derives beta pages through docs routes and registry ownership, then pairs them with stable pages. Renames require evidence. The owner’s `slate-to-html` → `html-export` pair is an explicit mapping, not a slug convention. Missing counterparts remain mapping gaps until classified; unmatched does not automatically mean new. Plate additions go to P4.

P5 names a concrete reference journey and its authority. A difference alone does not authorize changing product policy.

**Capture and P6**

Reuse [Maintainer’s packet](/Users/zbeyens/git/plate-2/.agents/rules/maintainer/references/issue-draft.md:100): setup, actions, expected authority, actual behavior, reproducibility, known environment/build, timestamps and caveats.

One narrow Maintainer correction is necessary: its current two-video branch defaults to `main`/`next`. Explicit Slate or other-editor labels must survive instead of being relabeled `main`. Keep that correction inside Maintainer.

[Bug fix](/Users/zbeyens/git/plate-2/.agents/playbooks/bug-fix.md) retains reproduction, owning-layer diagnosis, failed-fix recovery and Hand drive. Each confirmed find adds or corrects the missing assertion at the lowest adequate layer. Existing adequate tests are strengthened rather than duplicated. Unresolved proof stays open.

First-version preparation never drives scenarios with agents. Running committed regression tests during normal P6 verification remains existing work. A later agent executor can consume the same recipes and produce observations without acquiring retirement authority.

**6. Keep natamox’s diagnosis; discard the extra system.**

Keep readable journeys, explicit forbidden outcomes, reference evidence, find-to-test traceability and a bounded pilot.

Drop YAML law files, the animated book, edit hook, five-mode `behavior` skill, spec migration, K2 change diary and proposed K16/K17 machinery. Preserve the original draft as historical evidence. No accepted behavior rule moves.

**8. Smallest sufficient version**

One thin entry, one project playbook, ordinary round plans/logs, stable scenario IDs in existing test titles, and the narrow Maintainer labeling correction. No new executable helper, coverage database, renderer, hook or blanket browser CI job.

The interface hides inventory reconciliation, scenario selection and coverage review. Callers learn one preparation command and retain the reporting/fixing commands they already use.

## Tradeoffs accepted

- We accept agent judgment during coverage review in exchange for avoiding a new coverage language and compiler.
- We accept scanning prior round plans in exchange for one authored definition per scenario.
- We accept continued human work where native proof remains inadequate. Zero manual testing is a direction, not a claimed guarantee.

## Alternatives considered

**No new skill or playbook:** the lead prepares a round plan with `verify`, then uses Maintainer and Bug fix. This reaches the outcomes and is the strongest control. It loses as the proposed durable route because every lead must reconstruct inventory reconciliation, carry-forward and retirement policy. The trial must demonstrate that this cost is real.

**Durable YAML scenario catalog:** easier mechanical querying, but introduces another authored repository of expectations and more synchronization. It loses before the first sweep proves that machinery necessary.

**7. Trial before adoption**

Follow [workflow-change](/Users/zbeyens/git/plate-2/.agents/playbooks/references/workflow-change.md) and [Plan’s prototype gate](/Users/zbeyens/git/plate-2/.agents/playbooks/plan.md:15).

Freeze three arms: incumbent lead plus `verify`; existing owners plus one round-plan instruction; proposed Sweep. Give fresh contexts identical repository snapshots, evidence, budgets and organic requests covering preparation, capture, P6 and the next round.

A separate author creates a private answer key from held-out historical defects and controlled coverage changes. It records exact triggers, indispensable observations, correct phase placement and legitimate retirement decisions. The lead receives only its path. One blinded grader scores all arms; transcripts establish which owners actually loaded.

Freeze the keep rule before running: no unauthorized publication, false retirement or missing page; no worse defect/observation coverage than either control; at least 20% less measured preparation and carry-forward work than the better control.

The key is fair because it grades recoverable behavior and operator effort, not conformity to Sweep’s files. Run on the first working scratch prototype, before the plan panel. A failed trial drops the new entry/playbook and retains the winning simpler route.

## Open questions and risks

- Can title-based provenance survive real test refactors without excessive review work? The prototype must exercise renaming, deletion and weakened assertions.
- Which beta builds expose sufficient identity to retire scenarios confidently? Unknown identity keeps affected scenarios in the human queue.

## Next implementation step

Natamox should prototype the instruction files and a complete two-round example in scratch, then run the blinded comparison before adopting them.
seat: gpt-6-astra @xhigh
exit=0
