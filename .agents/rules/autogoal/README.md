# Autogoal Developer Flow

Human-facing guide for using and maintaining the `autogoal` workflow.

## What Autogoal Is

`autogoal` is the lifecycle layer for long-running Codex work. It defines the
outcome, evidence, durable plan state, completion rule, and blocked rule.

It is not the place for repo commands, browser policy, PR policy, package
release rules, or lane-specific scorecards. Put those in derived skills or
`docs/plans/templates/<template>.md`.

## When To Use It

Use `autogoal` when work is non-trivial and has an auditable finish line:

- debugging loops
- migrations
- benchmarks
- architecture plans
- pass-gated reviews
- multi-step issue work
- repeated repair of workflow expectations

Do not use it for one-off answers, typo fixes, or tiny edits where the final
response can carry the evidence.

## Size The Work First

- `micro`: narrow outcome, one proof surface. Usually no plan unless repo rules
  require one.
- `normal`: multi-step work. Use a `docs/plans` goal plan.
- `major`: architecture, migration, benchmark, public API, or pass-gated work.
  Use a derived skill/template with stronger gates.

## Pick The Flow

There are three common flows:

- `one-shot execution`: read the issue/spec, plan internally, implement, verify,
  and hand off without a plan-review stop.
- `agent-led plan hardening`: the agent iterates on the plan, reviews and
  improves it, then stops for one major user review when confidence is high.
- `collaborative planning`: agent and human shape the plan together until the
  user accepts it.

The flow controls when human review happens. It does not weaken evidence,
blocked, or completion rules.

## Normal Flow

1. Define the finish line:
   - flow mode
   - outcome
   - completion threshold
   - verification surface
   - constraints
   - boundaries
   - blocked condition
2. Create or continue the active goal with the Codex goal tool.
3. Choose composition:
   - primary template by dominant risk (`task`, `docs`, `major-task`,
     `slate-plan`, etc.)
   - packs by touched surface (`docs`, `agent-native`, `browser`,
     `package-api`)
4. Create a plan:

   ```bash
   node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs \
     --template "<template-name>" \
     --with "<pack-name>" \
     --title "<short title>"
   ```

   Omit `--with` when no surface pack applies. Repeat it for multiple packs.
   The helper copies pack rows into the generated plan; the plan is still the
   single runtime truth.
5. Fill the plan before real work starts.
6. Work in slices. Update findings, decisions, failed attempts, evidence, and
   next owner as you go.
7. Verify the real outcome, not just the plan shape.
8. Run the completion check:

   ```bash
   node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/<plan>.md
   ```

9. Mark the goal complete only when the outcome is true and the plan passes.

## Composition

Use one primary template and optional packs:

- docs-only work: `--template docs`
- normal task that also changes docs: `--template task --with docs`
- agent tooling task: `--template task --with agent-native`
- browser behavior task: `--template task --with browser`
- package API task: `--template task --with package-api`
- major architecture task: `--template major-task`

Do not model this as template inheritance. Packs are static fragments under
`docs/plans/templates/packs/` that materialize into one concrete plan.
Core execution and review gates live in the primary templates; packs cover
optional touched surfaces only.

## Evidence Types

Use concrete proof:

- `command`: command, cwd, result
- `source-audit`: exact file/search proof
- `browser`: route, action, screenshot or caveat
- `artifact`: generated file, report, PR body, issue comment
- `review`: reviewer, accepted findings, fixes
- `external-source`: issue, docs, paper, connected-app result
- `N/A:<reason>`: why a recurring gate does not apply

Bare `N/A` is not enough. The checker expects reasons.

## Repair Flow

Use `autogoal repair <expectation>` when a goal-backed workflow misses a
recurring expectation.

Pick one owner:

- current plan missed evidence/status -> patch the active plan
- future plans need a row/gate -> patch `docs/plans/templates/<owner>.md`
- agent chose the wrong workflow -> patch `.agents/rules/<owner>.mdc`
- repeated checkable miss -> patch `.agents/rules/autogoal/scripts/*`
- universal lifecycle miss -> patch `.agents/rules/autogoal.mdc`

After editing `.agents/rules/*.mdc`, run:

```bash
pnpm install
```

Never hand-edit generated `.agents/skills/*/SKILL.md`.

## Derived Skills

A skill that wraps `autogoal` should state:

- when it creates or continues a goal
- which flow it uses
- which primary template it uses
- which packs it applies by default or by touched surface
- extra gates it owns
- evidence types it requires
- final handoff shape
- review lenses it adds
- what remains delegated to `autogoal`

`autogoal` owns lifecycle. Derived skills own domain policy.

## Files

- `.agents/rules/autogoal.mdc`: source rule for the autogoal skill
- `.agents/skills/autogoal/SKILL.md`: generated agent-facing skill
- `.claude/skills/autogoal/SKILL.md`: generated Claude-facing skill
- `.agents/rules/autogoal/scripts/create-goal-scratchpad.mjs`: instantiate a plan
- `.agents/rules/autogoal/scripts/create-goal-template.mjs`: create a reusable plan
  template
- `.agents/rules/autogoal/scripts/check-complete.mjs`: validate a filled plan
- `docs/plans/templates/*.md`: reusable templates
- `docs/plans/templates/packs/*.md`: reusable surface packs
- `docs/plans/*.md`: active or completed goal plans
