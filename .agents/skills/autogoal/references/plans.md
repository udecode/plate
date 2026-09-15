# Select a goal plan

Use this reference when creating a plan, composing template packs, choosing a requested planning mode or interpreting a timed goal. It does not run on a routine checkpoint or resume.

## Template and pack selection

Keep one active goal, one root plan, one primary template and only applicable materialized packs. Independently owned outcomes may use linked child plans; see [linked plan trees](method.md#linked-plan-trees). Packs are static additions, not runtime inheritance or extra parents.

Choose the primary template by the actual outcome: `task` for normal execution, `docs` for a document deliverable, `major-task` for substantial architecture/proposal work, or the existing project lane template. Project templates override shared seeds.

| Additional surface | Pack |
| --- | --- |
| Documentation is part of another deliverable | `docs` |
| Agent instructions, hooks, commands or user-action tooling change | `agent-native` |
| Actual route, UI, native interaction, console or network proof is needed | `browser` |
| Public exports, package boundaries, release artifacts or API contracts change | `package-api` |
| Latency, payload, query/fan-out, cache, database, pooling or throughput can change | `performance-observability` |

Apply the owning project's requirements for these surfaces. Distinct failure modes may need multiple packs; duplicate proof is recorded once at its canonical owner. A pack does not mandate tests, independent review or publication beyond current scope.

```sh
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template docs --title '<document task>'
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template task --with agent-native --title '<workflow task>'
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template task --with browser --title '<runtime task>'
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template major-task --with docs --with package-api --title '<architecture task>'
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs --template task --with performance-observability --title '<measured operation>'
```

The helper materializes rows and records the selected template/packs in the generated plan. Fill that exact plan, resolve placeholders and mark inapplicable rows with reasons. Do not replace accepted obligations with a smaller ad hoc plan after work starts. If the template was wrong before substantive work, regenerate once and record the reason.

Generic plan paths are `docs/plans/YYYY-MM-DD-<slug>.md` or `docs/plans/<ticket>-<slug>.md`; use the returned path. Keep templates under `docs/plans/templates/`, not runtime state inside the skill. `init-templates.mjs` seeds missing templates only when initialization is requested or required by the current project. It is not a compulsory side effect of ordinary plan creation.

For a scale-sensitive architecture choice, follow the owning performance requirement before accepting its target. An asymptotic claim or future benchmark plan cannot replace a required executable baseline/target comparison. The existing method's [template requirements](method.md#linked-plan-trees) retain the detailed authoring and validation contract.

## Requested working mode

Use the mode established by the request; do not ask for a new mode choice at every invocation.

- **Execution:** investigate, implement, verify and finish under the existing authority. The plan records work; it is not an unrequested sign-off gate.
- **Agent-led planning:** when the requested deliverable is a plan, gather evidence, compare material alternatives and refine it to the stated readiness threshold. Ask only for missing product decisions. Keep implementation outside a plan-only request.
- **Collaborative planning:** when the user is actively shaping the plan, keep choices, tradeoffs, unresolved decisions and accepted constraints visible. Implementation starts when the user authorizes it; accepting one answer does not silently widen scope.

A derived workflow declares its actual completion threshold, template, applicable packs, evidence and publication boundaries. It delegates goal status, pause/recovery and completion checks to Autogoal instead of reimplementing them.

## Timed work

Record the user's requested duration and whether it is a minimum active-work checkpoint or an explicit maximum/hard stop. Preserve already-established timing semantics. Do not invent a time budget, score or continuation loop for an ordinary goal.

For a requested minimum, continue useful work against the same acceptance and evidence until the checkpoint, then finish the current bounded unit. For a maximum or hard stop, avoid starting a unit that cannot finish safely within it and preserve remaining work at the boundary. An explicit pause takes effect immediately in either case.

Use concrete outcome evidence for progress. Confidence scores are optional only when requested or required by a named lane; repeated checks, cosmetic churn or new scope do not establish progress. A deadline or exhausted budget is never proof that the objective is complete. Preserve unverified acceptance and the next action; do not discard user work to make a checkpoint look clean.
