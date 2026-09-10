# Improve skill

Implemented the user's requested recurring, autonomous Plate/Plite improvement
entry point. Scope is this project. The user explicitly requested this wrapper
after considering the existing multi-skill invocation; its independent job is
to supply the complete recurring objective and one optional budget.

## Owners and behavior

- `.agents/rules/improve.mdc` owns this project preset: full lane coverage,
  budget interpretation, value ranking, rule compliance and rule challenges,
  defect-triggered expansion, and implementation by default.
- `.agents/rules/task.mdc` exposes the route. Task's existing autonomous loop,
  architecture challenge, specialists, proof, and review budget remain owners.
- `pnpm install` generates `.agents/skills/improve/SKILL.md` and
  `.claude/skills/improve/SKILL.md`, plus the updated Task copies. No generator,
  parser, scheduler, test framework, or separate lifecycle was added.

The full check includes architecture, correctness, runtime performance, DX/CI,
test value, docs, registry, and effective AGENTS/skill rules. A confirmed defect
opens a complete audit of its governed area; scope, evidence, exceptions, and
unfinished work remain in the same plan. Breaking changes are eligible;
correctness, serialized data, native behavior, and actual user authority remain
protected. A bad rule can be challenged and repaired through its source owner.

## Instruction-path walkthrough

These are source-level action traces, not an executed autonomous product audit.

| Request or finding | Resulting route |
| --- | --- |
| `$improve` | One project-wide assessment, ranked implementation batch, affected proof, and reconciliation. |
| `$improve 5` | Up to five complete passes; a pass is not one tool call or cosmetic edit. |
| `$improve 0.5h` / `$improve 3h` | Thirty-minute / three-hour upper bound, including proof and cleanup; remaining time checked before each batch. |
| `$improve forever` | Continue useful work in the active run; stop on cancellation, saturation, or a concrete blocker. No implicit scheduler or native goal. |
| Invalid or conflicting budget | Reject it without silently starting a long run. |
| Explicit read-only instruction | Audit authority overrides the implementation default. |
| Request to create or explain the skill | Create or explain it; do not begin its improvement loop. |
| One documentation defect | Enumerate and audit all current authored documentation against applicable docs rules, then fix confirmed instances. |
| One registry pattern defect | Audit the full authored registry/component set and shared consumers through Plate UI. |
| One duplicate test | Audit that pattern across test suites and helpers; preserve useful regression evidence. |
| One weak architecture boundary | Challenge materially different targets through Task and Best API, then adopt with proof; small-cleanup restrictions do not terminate the run. |
| Conflicting or obsolete rule | Establish the governing instruction and evidence; repair the authorized source before aligning consumers. Outside-project changes remain proposals. |
| Expired budget during a large sweep | Report coverage and concrete remaining work; do not claim a full pass or full audit completed. |
| No worthwhile work remains | Explain saturation instead of manufacturing churn or idling to consume the budget. |

## Verification

- Skill Creator's existing frontmatter validator passes for both generated
  Improve copies.
- The repository's source/mirror validator reports exact generated resources.
- Relative links in both Improve and Task copies resolve.
- Plate Next doctrine validation passes at version 154; no doctrine history or
  package attestations were edited for this preset.
- Agent Native Reviewer traced invocation, source ownership, discovery, scope
  expansion, proof, stopping, and final claims using the cases above.
- Application/browser tests do not apply to this instruction-only change. An
  actual long autonomous invocation has not been run as part of skill creation.

Shared-source maintenance remains unchanged: this preset depends on Plate's
Task and domain owners, and no equivalent shared Improve owner was found in
Dotai. The reusable one-budget and defect-expansion ideas can be proposed to
Dotai, then adapted through a named `improve` sync to the configured
`better-convex`, `plate`, and `informed-fe-v3` destinations. Those destinations
were identified from configuration, not modified or verified as installations.
No global install, publication, or weekly automation was performed.
