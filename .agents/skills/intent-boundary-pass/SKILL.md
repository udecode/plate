---
description: Conditional planning/review pass to clarify intent, outcome, scope, non-goals, decision boundaries, and the one highest-leverage user question when needed.
argument-hint: '[plan/request]'
disable-model-invocation: true
name: intent-boundary-pass
metadata:
  skiller:
    source: .agents/rules/intent-boundary-pass.mdc
---

# Intent Boundary Pass

Handle $ARGUMENTS.

Use this inside planning and review lanes when the target is still slippery.

## Use When

- Intent, outcome, scope, non-goals, or decision boundaries are vague.
- A plan sounds polished but could still be solving the wrong problem.
- The user says they keep getting incremental suggestions.
- A broad request needs one focused clarification before a pass can close.

## Do Not Use When

- The source of truth already has explicit acceptance criteria and boundaries.
- The user explicitly asks to execute a concrete accepted plan.
- The missing fact can be read from the repo.

## Completion-State Pass Fields

```md
status: pending
current_pass: intent-boundary-pass
current_pass_status: in_progress
current_pass_skill: .agents/skills/intent-boundary-pass/SKILL.md
current_pass_scope: <plan/request>
current_pass_trigger: unclear intent or boundary
```

## Procedure

1. Read the source of truth and repo evidence first.
2. Record:
   - intent
   - desired outcome
   - in scope
   - non-goals
   - decision boundaries
   - unresolved user-decision points
3. Pressure-test the weakest answer with one move:
   - example/counterexample
   - hidden assumption
   - tradeoff or rejected boundary
   - root-cause reframing
4. Ask at most one user question, only when the answer cannot be discovered.
5. Do not close the pass until non-goals and decision boundaries are explicit.

## Output

- intent/boundary record
- evidence used
- one asked question, if any
- remaining ambiguity
- next pass
