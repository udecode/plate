# Autogoal

Autogoal asks Codex to write a goal-backed plan ending with verified evidence.

## Install

```sh
npx skills add udecode/dotai --skill autogoal
```

## Use

Use autogoal for non-trivial work with an auditable finish line:

- debugging loops
- migrations
- benchmarks
- architecture plans
- pass-gated reviews
- multi-step issue work

Skip it for one-off answers, typo fixes, or tiny edits where the final response
can carry the evidence.

## Flow

1. Define the outcome, completion threshold, verification surface, constraints,
   boundaries, and blocked condition.
2. Create or continue the active Codex goal with a short objective handle.
3. Create a plan from a built-in or project template and put the full contract
   there.
4. First checkpoint: copy every explicit prompt requirement into the plan as
   checkable rows before implementation.
5. Work in slices and record evidence as you go.
6. Run a scoped self-check and close accepted findings.
7. Run the completion check.
8. Mark the goal complete only when the outcome is true and the plan passes.

After a complete end-to-end feature is already verified, Codex may recommend
`autoreview` as an optional second pass. It never gates goal completion and runs
only when the user explicitly requests or accepts it.

## Helpers

```sh
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template task \
  --with browser \
  --title "short title"
```

```sh
node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<plan>.md
```

```sh
node .agents/skills/autogoal/scripts/init-templates.mjs
```

## Templates

Autogoal ships generic templates in `skills/autogoal/assets/templates`.
Installed skills expose them under `.agents/skills/autogoal/assets/templates`.

Project repos can keep their own templates in `docs/plans/templates`; the helper
prefers project templates before built-in templates.
